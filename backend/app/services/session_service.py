"""
Session Processing & Telemetry Service
Orchestrates:
1. Complete session schema formatting & observational telemetry defaults
2. Local scikit-learn ML inference
3. BrightPath AI Agent longitudinal trajectory & recommendation processing
4. Diagnostic categories ethical evaluation
5. Storage persistence & cumulative progress updating
"""

import time
import random
from typing import Dict, Any, List, Optional
from backend.app.services.storage_service import storage_service
from backend.app.services.progress_service import progress_service
from backend.app.services.ml_service import ml_service
from backend.app.agent.brightpath_agent import brightpath_agent

class SessionService:
    def format_session(self, raw_session: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures all session attributes and observational indicators have defaults."""
        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        session_id = raw_session.get("id") or raw_session.get("sessionId")
        if not session_id:
            rand_suffix = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=6))
            session_id = f"session_{int(time.time() * 1000)}_{rand_suffix}"

        child_age = int(raw_session.get("childAge") or 5)
        activity_mode = raw_session.get("activityMode") or ("early" if child_age <= 6 else "brightpath")

        score = float(raw_session.get("score", 100))
        accuracy = float(raw_session.get("accuracy", 100))
        response_time = float(raw_session.get("responseTime", 2.0))
        completion_time = float(raw_session.get("completionTime") or raw_session.get("duration") or 120)

        # 5 Observational Telemetry sets
        motor = raw_session.get("motorMetrics") or {
            "tapAccuracy": accuracy,
            "dragAccuracy": 100.0,
            "avgResponseTime": response_time,
            "missedInteractions": int(raw_session.get("mistakes", 0)),
            "repeatedAttempts": 0,
            "completionTime": completion_time,
            "score": score
        }

        repetitive = raw_session.get("repetitiveMetrics") or {
            "repeatedActionsCount": 0,
            "repetitionFrequency": 0.0,
            "repeatedSequences": 0,
            "rhythmConsistency": 85.0,
            "notes": "Repeated interaction patterns observed during this session."
        }

        communication = raw_session.get("communicationMetrics") or {
            "promptResponsesCount": 0,
            "voiceInteractionAttempts": None,
            "responseLatency": None,
            "repeatedPromptsCount": 0,
            "completionRate": None,
            "hasData": False
        }

        stimulation = raw_session.get("stimulationMetrics") or {
            "colorChangeResponses": 2,
            "animationEvents": 4,
            "soundEvents": 4,
            "transitionReactions": 1,
            "timeline": []
        }

        social = raw_session.get("socialMetrics") or {
            "characterInteractions": 0,
            "socialPromptResponses": 0,
            "responseTime": None,
            "sharedAttentionEvents": 0,
            "notes": "Observed social interaction indicators within BrightPath activities."
        }

        return {
            "id": session_id,
            "sessionId": session_id,
            "userId": raw_session.get("userId") or "guest_user",
            "childId": raw_session.get("childId") or "default_child",
            "childName": raw_session.get("childName") or "Child",
            "childAge": child_age,
            "activityMode": activity_mode,
            "activityId": raw_session.get("activityId") or raw_session.get("gameId") or "activity",
            "activityName": raw_session.get("activityName") or raw_session.get("recommendedGame") or "Activity",
            "recommendedGame": raw_session.get("recommendedGame") or raw_session.get("activityName") or "Activity",
            "gameId": raw_session.get("gameId") or raw_session.get("activityId") or "activity",
            "startTime": raw_session.get("startTime") or now_iso,
            "endTime": raw_session.get("endTime") or now_iso,
            "duration": completion_time,
            "completionStatus": raw_session.get("completionStatus") or "completed",
            "score": score,
            "accuracy": accuracy,
            "responseTime": response_time,
            "completionTime": completion_time,
            "mistakes": int(raw_session.get("mistakes", 0)),
            "hintsUsed": int(raw_session.get("hintsUsed", 0)),
            "engagement": raw_session.get("engagement") or ("High" if score >= 75 else "Moderate"),
            "isDemoMode": bool(raw_session.get("isDemoMode", False)),
            "initialEmotion": raw_session.get("initialEmotion", "Neutral"),
            "initialConfidence": float(raw_session.get("initialConfidence", 0.85)),
            "finalEmotion": raw_session.get("finalEmotion") or raw_session.get("initialEmotion") or "Neutral",
            "finalConfidence": float(raw_session.get("finalConfidence", 0.85)),
            "emotionTimeline": raw_session.get("emotionTimeline") or [
                {"timestamp": "00:00", "emotion": raw_session.get("initialEmotion", "Neutral"), "confidence": 0.85, "checkpoint": "initial"}
            ],
            "sessionEvents": raw_session.get("sessionEvents", []),
            "motorMetrics": motor,
            "repetitiveMetrics": repetitive,
            "communicationMetrics": communication,
            "stimulationMetrics": stimulation,
            "socialMetrics": social,
            "spokenVoiceMessage": raw_session.get("spokenVoiceMessage"),
            "createdAt": raw_session.get("createdAt") or now_iso
        }

    def process_and_save_session(self, raw_session: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes full backend pipeline on session:
        1. Validates and fills defaults
        2. Queries child's actual past sessions from local storage
        3. Executes scikit-learn ML inference and longitudinal trajectory
        4. Evaluates ethical historical categories
        5. Persists session and updates progress summary
        """
        session = self.format_session(raw_session)
        child_id = session.get("childId")

        # 1. Past sessions
        historical = storage_service.list_sessions(child_id=child_id) if child_id else []

        # 2. Local scikit-learn ML telemetry inference
        ml_prediction = ml_service.predict_session_telemetry(session)
        session["mlPredictions"] = ml_prediction

        # 3. BrightPath AI Agent coordination
        agent_output = brightpath_agent.process_session(session, historical)
        session["agentAnalysis"] = agent_output
        session["diagnosticResults"] = agent_output.get("diagnostic_evaluation")

        # 4. Save to persistent storage
        saved_session = storage_service.save_session(session)

        # 5. Cumulative progress tracking
        if child_id and child_id != "default_child":
            progress_service.update_child_progress(child_id)

        return saved_session

    def analyze_existing_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        session = storage_service.get_session(session_id)
        if not session:
            return None

        child_id = session.get("childId")
        historical = storage_service.list_sessions(child_id=child_id) if child_id else []

        ml_pred = ml_service.predict_session_telemetry(session)
        session["mlPredictions"] = ml_pred

        agent_output = brightpath_agent.process_session(session, historical)
        session["agentAnalysis"] = agent_output
        session["diagnosticResults"] = agent_output.get("diagnostic_evaluation")

        return storage_service.save_session(session)

session_service = SessionService()

