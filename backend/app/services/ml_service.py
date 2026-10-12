import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
import joblib
from backend.app.core.config import settings

FEATURE_NAMES = [
    "score",
    "accuracy",
    "response_time",
    "completion_time",
    "mistakes",
    "hints_used",
    "tap_accuracy",
    "repetition_frequency",
    "rhythm_consistency",
    "emotion_shift"
]

class MLModelService:
    """
    Local Machine Learning Inference Service using scikit-learn.
    Loads models once at startup from local storage (backend/models/).
    No external AI API calls or cloud dependencies.
    """

    def __init__(self):
        self.models_dir = Path(__file__).resolve().parent.parent.parent / "models"
        self.model_path = self.models_dir / "telemetry_engagement_model.joblib"
        self.metadata_path = self.models_dir / "model_metadata.json"
        
        self.bundle: Optional[Dict[str, Any]] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.is_loaded = False
        
        self.load_model()

    def load_model(self):
        """Loads model weights once into memory."""
        try:
            if self.model_path.exists():
                self.bundle = joblib.load(self.model_path)
                self.is_loaded = True
                print(f"[ML Service] Successfully loaded local scikit-learn model from {self.model_path}")
            else:
                print(f"[ML Service] Model file not found at {self.model_path}. Will use fallback heuristic.")
                self.is_loaded = False

            if self.metadata_path.exists():
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
        except Exception as e:
            print(f"[ML Service] Error loading model: {e}")
            self.is_loaded = False

    def _extract_emotion_shift(self, initial: str, final: str) -> int:
        """Converts observed emotion transition into a numerical shift index."""
        positives = {"Happy", "Joy", "Excited", "Proud"}
        negatives = {"Sad", "Angry", "Frustrated", "Fear"}
        
        init_pos = initial in positives
        init_neg = initial in negatives
        fin_pos = final in positives
        fin_neg = final in negatives

        if not init_pos and fin_pos:
            return 2 if init_neg else 1
        elif init_pos and fin_neg:
            return -2
        elif init_pos and not fin_pos:
            return -1
        elif init_neg and not fin_neg:
            return 1
        return 0

    def predict_session_telemetry(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs local scikit-learn model inference on session telemetry.
        Returns mastery level, confidence, adaptive pacing, and recommendations.
        """
        motor = session_data.get("motorMetrics") or {}
        repetitive = session_data.get("repetitiveMetrics") or {}
        
        score = float(session_data.get("score", 100))
        accuracy = float(session_data.get("accuracy", 100))
        response_time = float(session_data.get("responseTime", 2.0))
        completion_time = float(session_data.get("completionTime") or session_data.get("duration") or 120)
        mistakes = int(session_data.get("mistakes", 0))
        hints_used = int(session_data.get("hintsUsed", 0))
        tap_accuracy = float(motor.get("tapAccuracy", accuracy))
        repetition_freq = float(repetitive.get("repetitionFrequency", 0.0))
        rhythm_consistency = float(repetitive.get("rhythmConsistency", 85.0))
        
        initial_emo = session_data.get("initialEmotion", "Neutral")
        final_emo = session_data.get("finalEmotion", "Neutral")
        emotion_shift = self._extract_emotion_shift(initial_emo, final_emo)

        feature_dict = {
            "score": score,
            "accuracy": accuracy,
            "response_time": response_time,
            "completion_time": completion_time,
            "mistakes": mistakes,
            "hints_used": hints_used,
            "tap_accuracy": tap_accuracy,
            "repetition_frequency": repetition_freq,
            "rhythm_consistency": rhythm_consistency,
            "emotion_shift": emotion_shift
        }

        if self.is_loaded and self.bundle:
            try:
                df = pd.DataFrame([feature_dict])[FEATURE_NAMES]
                mastery_model = self.bundle["mastery_model"]
                pacing_model = self.bundle["pacing_model"]

                # Inference
                mastery_pred = mastery_model.predict(df)[0]
                mastery_probs = mastery_model.predict_proba(df)[0]
                mastery_conf = round(float(np.max(mastery_probs)), 3)

                pacing_pred = pacing_model.predict(df)[0]
                pacing_probs = pacing_model.predict_proba(df)[0]
                pacing_conf = round(float(np.max(pacing_probs)), 3)

                mastery_classes = list(mastery_model.classes_)
                pacing_classes = list(pacing_model.classes_)

                return {
                    "model_framework": "scikit-learn (Local Random Forest Pipeline)",
                    "model_version": self.bundle.get("version", "1.0.0"),
                    "local_inference": True,
                    "external_api_used": False,
                    "mastery_prediction": {
                        "level": str(mastery_pred),
                        "confidence": mastery_conf,
                        "distribution": {cls: round(float(prob), 3) for cls, prob in zip(mastery_classes, mastery_probs)}
                    },
                    "adaptive_pacing": {
                        "recommendation": str(pacing_pred),
                        "confidence": pacing_conf,
                        "distribution": {cls: round(float(prob), 3) for cls, prob in zip(pacing_classes, pacing_probs)}
                    },
                    "features_analyzed": feature_dict,
                    "pedagogical_guidance": self._generate_guidance(pacing_pred, mastery_pred)
                }
            except Exception as e:
                print(f"[ML Service] Inference error: {e}")

        # Fallback if model bundle fails to load
        fallback_mastery = "Mastered" if score >= 85 else ("Moderate" if score >= 60 else "Developing")
        fallback_pacing = "Challenge_Mode" if score >= 85 else ("Standard_Progression" if score >= 60 else "Support_Pacing")
        return {
            "model_framework": "Heuristic Rule-Based Fallback",
            "model_version": "1.0.0",
            "local_inference": True,
            "external_api_used": False,
            "mastery_prediction": {
                "level": fallback_mastery,
                "confidence": 0.85,
                "distribution": {fallback_mastery: 0.85}
            },
            "adaptive_pacing": {
                "recommendation": fallback_pacing,
                "confidence": 0.85,
                "distribution": {fallback_pacing: 0.85}
            },
            "features_analyzed": feature_dict,
            "pedagogical_guidance": self._generate_guidance(fallback_pacing, fallback_mastery)
        }

    def _generate_guidance(self, pacing: str, mastery: str) -> Dict[str, str]:
        if pacing == "Support_Pacing":
            return {
                "summary": "Encouraging Calming Progression",
                "recommendation": "Suggest engaging with calming visual activities (e.g. Color Garden, Calm Maze, Grow the Garden) with gentle pacing and reduced sensory stimulation.",
                "support_level": "High Scaffolding & Gentle Feedback"
            }
        elif pacing == "Challenge_Mode":
            return {
                "summary": "Cognitive Challenge Acceleration",
                "recommendation": "High focus observed! Suggest advancing to multi-stage cognitive mini-games (e.g. Brain Rush, Memory Quest, Step Puzzle) to sustain engagement.",
                "support_level": "Independent Exploration"
            }
        else:
            return {
                "summary": "Balanced Steady Progression",
                "recommendation": "Child is progressing steadily. Continue with balanced educational mini-challenges (e.g. Bubble Pop, Step-by-Step Puzzle).",
                "support_level": "Standard Reinforcement"
            }

ml_service = MLModelService()
