from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from backend.app.schemas.diagnostic_schema import DiagnosticEvaluationResponse
from backend.app.services.diagnostic_service import diagnostic_service
from backend.app.services.storage_service import storage_service
from backend.app.core.config import settings

router = APIRouter(prefix="/diagnostics", tags=["Diagnostics"])

@router.get("/model-info")
def get_model_info():
    """
    Returns transparency metadata regarding the diagnostic category pipeline,
    model availability, DSM-IV historical context, and medical disclaimers.
    """
    return {
        "model_available": settings.DIAGNOSTIC_MODEL_AVAILABLE,
        "model_status": "EXPERIMENTAL_UNAVAILABLE",
        "honest_message": "Diagnostic prediction model not available",
        "categories": [
            {
                "name": cat["name"],
                "historical_manual": "DSM-IV (Diagnostic and Statistical Manual of Mental Disorders, Fourth Edition)",
                "modern_status": cat["current_status"],
                "description": cat["description"]
            }
            for cat in diagnostic_service.HISTORICAL_METADATA
        ],
        "ethical_principles": [
            "No fabricated or pseudo-random diagnostic percentages are produced.",
            "Facial expressions, game reaction speeds, and keyboard patterns do not diagnose autism.",
            "Historical DSM-IV categories are unified under Autism Spectrum Disorder in DSM-5 and ICD-11.",
            "Formal clinical diagnosis requires licensed clinical psychologist or developmental pediatrician assessment."
        ],
        "disclaimer": (
            "BrightPath provides educational games and observational developmental telemetry. "
            "It is not a medical device and cannot replace licensed clinical evaluations."
        )
    }

@router.post("/evaluate", response_model=DiagnosticEvaluationResponse)
def evaluate_session_payload(session_payload: Dict[str, Any]):
    """
    Evaluates an arbitrary completed session payload through the Python diagnostic pipeline.
    """
    return diagnostic_service.evaluate_session(session_payload)

@router.get("/session/{session_id}", response_model=DiagnosticEvaluationResponse)
def get_session_diagnostics(session_id: str):
    """
    Retrieves the Four Diagnostic-Category evaluation for a saved session.
    """
    session = storage_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail=f"Session with ID '{session_id}' not found")
    
    # Return cached diagnostic result or compute fresh
    if "diagnosticResults" in session and session["diagnosticResults"]:
        return session["diagnosticResults"]

    return diagnostic_service.evaluate_session(session)

