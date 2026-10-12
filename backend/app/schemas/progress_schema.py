from typing import Optional
from pydantic import BaseModel

class ChildProgressSummary(BaseModel):
    childId: str
    totalSessions: int = 0
    completedSessions: int = 0
    completionRate: int = 0
    totalDurationSeconds: int = 0
    avgScore: int = 0
    avgAccuracy: int = 0
    avgMotorAccuracy: int = 100
    avgRepetitionFreq: float = 0.0
    recentSessionId: Optional[str] = None
    updatedAt: str

