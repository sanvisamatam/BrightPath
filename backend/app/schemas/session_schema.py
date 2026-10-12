from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class EmotionSample(BaseModel):
    timestamp: str = "00:00"
    timeSeconds: Optional[int] = 0
    emotion: str = "Neutral"
    confidence: Optional[float] = 0.85
    checkpoint: Optional[str] = "checkpoint"
    isDemo: Optional[bool] = False
    associatedEvent: Optional[str] = None

class MotorMetrics(BaseModel):
    tapAccuracy: Optional[float] = 100.0
    dragAccuracy: Optional[float] = 100.0
    avgResponseTime: Optional[float] = 2.0
    missedInteractions: Optional[int] = 0
    repeatedAttempts: Optional[int] = 0
    completionTime: Optional[int] = 120
    score: Optional[float] = 100.0

class RepetitiveMetrics(BaseModel):
    repeatedActionsCount: Optional[int] = 0
    repetitionFrequency: Optional[float] = 0.0
    repeatedSequences: Optional[int] = 0
    rhythmConsistency: Optional[float] = 85.0
    notes: Optional[str] = "Repeated interaction patterns observed during this session."

class CommunicationMetrics(BaseModel):
    promptResponsesCount: Optional[int] = 0
    voiceInteractionAttempts: Optional[int] = None
    responseLatency: Optional[float] = None
    repeatedPromptsCount: Optional[int] = 0
    completionRate: Optional[float] = None
    hasData: Optional[bool] = False

class StimulationMetrics(BaseModel):
    colorChangeResponses: Optional[int] = 0
    animationEvents: Optional[int] = 0
    soundEvents: Optional[int] = 0
    transitionReactions: Optional[int] = 0
    timeline: Optional[List[Dict[str, Any]]] = []

class SocialMetrics(BaseModel):
    characterInteractions: Optional[int] = 0
    socialPromptResponses: Optional[int] = 0
    responseTime: Optional[float] = None
    sharedAttentionEvents: Optional[int] = 0
    notes: Optional[str] = "Observed social interaction indicators within BrightPath activities."

class SessionCreate(BaseModel):
    id: Optional[str] = None
    sessionId: Optional[str] = None
    userId: Optional[str] = "guest_user"
    childId: Optional[str] = "default_child"
    childName: Optional[str] = "Child"
    childAge: Optional[int] = 5
    activityMode: Optional[str] = "early"
    activityId: Optional[str] = "activity"
    activityName: Optional[str] = "Activity"
    recommendedGame: Optional[str] = "Activity"
    gameId: Optional[str] = None
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    duration: Optional[int] = 120
    completionStatus: Optional[str] = "completed"
    
    # Core performance metrics
    score: Optional[float] = 100.0
    accuracy: Optional[float] = 100.0
    responseTime: Optional[float] = 2.0
    completionTime: Optional[int] = 120
    mistakes: Optional[int] = 0
    hintsUsed: Optional[int] = 0
    engagement: Optional[str] = "High"
    isDemoMode: Optional[bool] = False

    # Emotion timeline
    initialEmotion: Optional[str] = "Neutral"
    initialConfidence: Optional[float] = 0.85
    finalEmotion: Optional[str] = "Neutral"
    finalConfidence: Optional[float] = 0.85
    emotionTimeline: Optional[List[EmotionSample]] = []
    sessionEvents: Optional[List[Dict[str, Any]]] = []
    
    # 5 Observational Telemetry Sets
    motorMetrics: Optional[MotorMetrics] = None
    repetitiveMetrics: Optional[RepetitiveMetrics] = None
    communicationMetrics: Optional[CommunicationMetrics] = None
    stimulationMetrics: Optional[StimulationMetrics] = None
    socialMetrics: Optional[SocialMetrics] = None
    spokenVoiceMessage: Optional[str] = None

class SessionResponse(SessionCreate):
    id: str
    sessionId: str
    createdAt: str
    diagnosticResults: Optional[Dict[str, Any]] = None
    mlPredictions: Optional[Dict[str, Any]] = None

