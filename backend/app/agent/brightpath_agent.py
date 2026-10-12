"""
Modular BrightPath AI Agent
Coordinates local scikit-learn performance models, computes progress trends from
actual session data, issues educational game recommendations, and strictly preserves
ethical medical limitations for historical ASD diagnostic categories.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from .scikit_analyzer import scikit_analyzer
from .recommendation_engine import recommendation_engine

class BrightPathAgent:
    """
    Local AI Agent coordinating on-device educational models.
    Operates 100% locally with zero external API calls.
    """

    AGENT_METADATA = {
        "name": "BrightPath Modular Learning Agent",
        "version": "2.1.0",
        "description": "On-device AI agent coordinating scikit-learn performance analysis, progress trajectory tracking, and educational game recommendations.",
        "frameworks": ["scikit-learn", "Python (Flask)"],
        "external_apis_used": False,
        "privacy_level": "Local Only (Zero data transmission to cloud AI services)"
    }

    HISTORICAL_CATEGORIES_METADATA = [
        {
            "id": "autistic_disorder",
            "name": "Autistic Disorder",
            "manual": "DSM-IV (299.00)",
            "modern_status": "Consolidated into Autism Spectrum Disorder (ASD) in DSM-5 / ICD-11.",
            "clinical_limitation": "Webcam expressions and game scores cannot diagnose Autistic Disorder. Clinical diagnosis requires standardized evaluation by licensed professionals."
        },
        {
            "id": "asperger_syndrome",
            "name": "Asperger Syndrome",
            "manual": "DSM-IV (299.80)",
            "modern_status": "Subsumed under Autism Spectrum Disorder (ASD) in DSM-5 / ICD-11.",
            "clinical_limitation": "Gameplay interaction metrics cannot establish Asperger traits. Formal diagnostic evaluation requires clinical history and observation."
        },
        {
            "id": "childhood_disintegrative_disorder",
            "name": "Childhood Disintegrative Disorder",
            "manual": "DSM-IV (299.10)",
            "modern_status": "Unified under Autism Spectrum Disorder (ASD) in DSM-5; rare neurodevelopmental condition.",
            "clinical_limitation": "This rare condition involves profound developmental regression and cannot be detected or assessed by web application interactions."
        },
        {
            "id": "pdd_nos",
            "name": "Pervasive Developmental Disorder - Not Otherwise Specified (PDD-NOS)",
            "manual": "DSM-IV (299.80)",
            "modern_status": "Reclassified under Autism Spectrum Disorder (ASD) or Social Communication Disorder in DSM-5.",
            "clinical_limitation": "Subthreshold diagnostic categories are not computable from mini-game metrics. Only a qualified clinician can interpret developmental patterns."
        }
    ]

    def process_session(self, current_session: Dict[str, Any], historical_sessions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Coordinates full session processing:
        1. Analyzes single session with scikit-learn metrics.
        2. Computes longitudinal trajectory slopes across actual historical sessions.
        3. Generates educational game recommendations.
        4. Provides honest reporting for historical ASD diagnostic categories.
        """
        # 1. Scikit-learn session metrics
        perf_analysis = scikit_analyzer.analyze_single_session(current_session)

        # 2. Longitudinal trajectory analysis using actual session data
        # Exclude the current session from history to avoid double-counting if already saved
        session_id = current_session.get("id") or current_session.get("sessionId")
        prior_sessions = [s for s in historical_sessions if (s.get("id") or s.get("sessionId")) != session_id]
        prior_sessions.append(current_session)
        trend_analysis = scikit_analyzer.analyze_trajectory_trends(prior_sessions)

        # 3. Next educational game recommendation
        final_emotion = current_session.get("finalEmotion") or current_session.get("initialEmotion") or "Neutral"
        child_age = int(current_session.get("childAge") or 5)
        child_mode = current_session.get("activityMode")
        next_recommendation = recommendation_engine.recommend(
            emotion=final_emotion,
            age=child_age,
            mode=child_mode,
            recent_performance=perf_analysis
        )

        # 4. Historical Diagnostic Categories Evaluation (strictly adhering to Requirements 10 & 11)
        diagnostic_evaluation = self.evaluate_diagnostic_categories(current_session, perf_analysis)

        return {
            "agent_metadata": self.AGENT_METADATA,
            "processed_at": datetime.now(timezone.utc).isoformat(),
            "performance_analysis": perf_analysis,
            "trajectory_trends": trend_analysis,
            "next_recommendation": next_recommendation,
            "diagnostic_evaluation": diagnostic_evaluation
        }

    def evaluate_diagnostic_categories(self, session: Dict[str, Any], perf_analysis: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Requirements 10 & 11:
        Reports honest limitation status. Does NOT fabricate diagnostic percentages.
        """
        categories = []
        for cat in self.HISTORICAL_CATEGORIES_METADATA:
            categories.append({
                "category_id": cat["id"],
                "category_name": cat["name"],
                "historical_manual": cat["manual"],
                "current_status": cat["modern_status"],
                "model_available": False,
                "prediction_percentage": None,  # Zero fake percentages
                "display_value": "Diagnostic prediction model not available",
                "status_label": "Model Not Available",
                "clinical_note": cat["clinical_limitation"]
            })

        motor = session.get("motorMetrics") or {}
        repetitive = session.get("repetitiveMetrics") or {}

        observational_indicators = [
            {
                "name": "Motor Tap Accuracy",
                "value": round(float(motor.get("tapAccuracy", session.get("accuracy", 100))), 1),
                "unit": "%",
                "category": "Motor Coordination",
                "non_diagnostic_note": "Observed touch targeting during educational game."
            },
            {
                "name": "Interaction Response Latency",
                "value": round(float(motor.get("avgResponseTime", session.get("responseTime", 2.0))), 2),
                "unit": "seconds",
                "category": "Processing Speed",
                "non_diagnostic_note": "Response time to on-screen interactive prompts."
            },
            {
                "name": "Rhythm Consistency",
                "value": round(float(repetitive.get("rhythmConsistency", 85.0)), 1),
                "unit": "%",
                "category": "Interaction Rhythm",
                "non_diagnostic_note": "Consistency of timing intervals during repeated taps."
            },
            {
                "name": "Repetition Frequency",
                "value": round(float(repetitive.get("repetitionFrequency", 0.0)), 2),
                "unit": "events / min",
                "category": "Repetitive Telemetry",
                "non_diagnostic_note": "Rate of sequential rapid interactions observed in-session."
            }
        ]

        return {
            "session_id": str(session.get("id") or session.get("sessionId") or ""),
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "model_available": False,
            "model_status": "EXPERIMENTAL_UNAVAILABLE",
            "honest_message": "Diagnostic prediction model not available",
            "clinical_disclaimer": (
                "Important Medical Disclaimer: BrightPath is an educational learning and developmental "
                "engagement tool. Facial expressions, gameplay scores, and interaction latency CANNOT diagnose "
                "autism spectrum disorders or historical subtypes. Formal diagnosis requires comprehensive assessment "
                "by qualified medical and developmental specialists."
            ),
            "historical_context_summary": (
                "Autistic Disorder, Asperger Syndrome, Childhood Disintegrative Disorder, and PDD-NOS "
                "are historical diagnostic categories from DSM-IV. In DSM-5 and ICD-11, these subtypes were unified "
                "under a single Autism Spectrum Disorder (ASD) diagnosis."
            ),
            "categories": categories,
            "observational_indicators": observational_indicators
        }

    def recommend_game(self, emotion: str, age: int = 5, mode: Optional[str] = None) -> Dict[str, Any]:
        """Provides on-demand game recommendation."""
        return recommendation_engine.recommend(emotion=emotion, age=age, mode=mode)

brightpath_agent = BrightPathAgent()

