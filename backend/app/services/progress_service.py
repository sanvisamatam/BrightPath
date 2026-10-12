from datetime import datetime, timezone
from typing import Dict, Any, Optional
from backend.app.services.storage_service import storage_service

class ProgressService:
    def update_child_progress(self, child_id: str) -> Optional[Dict[str, Any]]:
        if not child_id:
            return None

        sessions = storage_service.list_sessions(child_id=child_id)
        total = len(sessions)
        if total == 0:
            return None

        completed = len([s for s in sessions if s.get("completionStatus") == "completed"])
        total_duration = sum(s.get("duration", 0) or s.get("completionTime", 0) for s in sessions)
        avg_score = round(sum(s.get("score", 0) for s in sessions) / total)
        avg_accuracy = round(sum(s.get("accuracy", 0) for s in sessions) / total)

        # Motor trend
        motor_vals = []
        for s in sessions:
            mm = s.get("motorMetrics") or {}
            val = mm.get("tapAccuracy") or s.get("accuracy") or 100
            motor_vals.append(val)
        avg_motor = round(sum(motor_vals) / len(motor_vals)) if motor_vals else 100

        # Repetition trend
        rep_vals = []
        for s in sessions:
            rm = s.get("repetitiveMetrics") or {}
            rep_vals.append(float(rm.get("repetitionFrequency", 0.0)))
        avg_rep = round(sum(rep_vals) / len(rep_vals), 1) if rep_vals else 0.0

        progress_summary = {
            "childId": child_id,
            "totalSessions": total,
            "completedSessions": completed,
            "completionRate": round((completed / total) * 100) if total > 0 else 0,
            "totalDurationSeconds": total_duration,
            "avgScore": avg_score,
            "avgAccuracy": avg_accuracy,
            "avgMotorAccuracy": avg_motor,
            "avgRepetitionFreq": avg_rep,
            "recentSessionId": sessions[0].get("id") if sessions else None,
            "updatedAt": datetime.now(timezone.utc).isoformat()
        }

        storage_service.save_progress(child_id, progress_summary)
        return progress_summary

    def get_child_progress(self, child_id: str) -> Optional[Dict[str, Any]]:
        existing = storage_service.get_progress(child_id)
        if existing:
            return existing
        return self.update_child_progress(child_id)

progress_service = ProgressService()
