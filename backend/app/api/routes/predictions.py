from typing import Dict, Any
from fastapi import APIRouter
from backend.app.services.ml_service import ml_service

router = APIRouter(prefix="/predict", tags=["Local ML Predictions"])

@router.get("/model-info")
def get_ml_model_info():
    """
    Returns transparency metadata regarding the local machine learning model,
    confirming it runs locally on-device with scikit-learn without external AI APIs.
    """
    return {
        "framework": "scikit-learn",
        "model_file": "backend/models/telemetry_engagement_model.joblib",
        "is_loaded": ml_service.is_loaded,
        "external_api_used": False,
        "privacy_guarantee": "100% on-device local execution; zero telemetry sent to external services.",
        "metadata": ml_service.metadata
    }

@router.post("/telemetry")
def predict_telemetry(payload: Dict[str, Any]):
    """
    Performs local machine learning inference on gameplay telemetry.
    Predicts mastery level, confidence, and adaptive developmental pacing.
    """
    return ml_service.predict_session_telemetry(payload)
