from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.session_schema import SessionCreate, SessionResponse
from backend.app.services.storage_service import storage_service
from backend.app.services.diagnostic_service import diagnostic_service
from backend.app.services.progress_service import progress_service
from backend.app.services.ml_service import ml_service

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("", response_model=SessionResponse)
def create_session(session_data: SessionCreate):
    """
    Saves a completed game session, triggers local scikit-learn ML inference
    and Python diagnostic evaluation for the four historical categories,
    updates cumulative child progress, and returns the session with attached predictions.
    """
    session_dict = session_data.model_dump()
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Ensure ID
    session_id = session_dict.get("id") or session_dict.get("sessionId")
    if not session_id:
        session_id = f"session_{int(datetime.now(timezone.utc).timestamp())}_{uuid.uuid4().hex[:6]}"
    
    session_dict["id"] = session_id
    session_dict["sessionId"] = session_id
    if not session_dict.get("createdAt"):
        session_dict["createdAt"] = now_iso

    # Run Local scikit-learn Machine Learning Inference
    ml_result = ml_service.predict_session_telemetry(session_dict)
    session_dict["mlPredictions"] = ml_result

    # Run Python diagnostic and observational analysis pipeline
    diag_result = diagnostic_service.evaluate_session(session_dict)
    session_dict["diagnosticResults"] = diag_result.model_dump()

    # Persist session to backend storage
    saved_session = storage_service.save_session(session_dict)

    # Automatically update child's cumulative progress in the Python backend
    child_id = session_dict.get("childId")
    if child_id and child_id != "default_child":
        progress_service.update_child_progress(child_id)

    return saved_session

@router.get("", response_model=List[SessionResponse])
def get_sessions(
    childId: Optional[str] = Query(None, description="Filter sessions by child ID"),
    userId: Optional[str] = Query(None, description="Filter sessions by user ID")
):
    """
    Retrieves sessions filtered by child ID or user ID.
    """
    sessions = storage_service.list_sessions(child_id=childId, user_id=userId)
    return sessions

@router.get("/{session_id}", response_model=SessionResponse)
def get_session_by_id(session_id: str):
    """
    Retrieves a single session by its unique session ID.
    """
    session = storage_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session with ID '{session_id}' not found")
    return session

@router.post("/{session_id}/analyze")
def analyze_session(session_id: str):
    """
    Re-runs the diagnostic and observational telemetry analysis for a recorded session.
    """
    session = storage_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session with ID '{session_id}' not found")
    
    diag_result = diagnostic_service.evaluate_session(session)
    session["diagnosticResults"] = diag_result.model_dump()
    storage_service.save_session(session)
    return diag_result
