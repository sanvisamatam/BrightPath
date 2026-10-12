from fastapi import APIRouter, HTTPException
from backend.app.schemas.progress_schema import ChildProgressSummary
from backend.app.services.progress_service import progress_service

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("/{child_id}", response_model=ChildProgressSummary)
def get_child_progress_data(child_id: str):
    """
    Returns cumulative progress metrics for a child across all completed sessions.
    """
    progress = progress_service.get_child_progress(child_id)
    if not progress:
        # Return initial empty summary
        return ChildProgressSummary(
            childId=child_id,
            totalSessions=0,
            completedSessions=0,
            completionRate=0,
            totalDurationSeconds=0,
            avgScore=0,
            avgAccuracy=0,
            avgMotorAccuracy=100,
            avgRepetitionFreq=0.0,
            recentSessionId=None,
            updatedAt="2026-01-01T00:00:00Z"
        )
    return progress

