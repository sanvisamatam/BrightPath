from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from backend.app.schemas.diagnostic_schema import (
    DiagnosticEvaluationResponse,
    CategoryResult,
    ObservationalIndicator
)
from backend.app.core.config import settings

class DiagnosticService:
    """
    Diagnostic & Observational Analysis Service.
    
    Adheres strictly to evidence-based medical and scientific ethics:
    1. Historical Context: Clarifies that Autistic Disorder, Asperger Syndrome, CDD,
       and PDD-NOS are historical DSM-IV diagnostic categories, now consolidated into
       Autism Spectrum Disorder (ASD) in DSM-5 and ICD-11.
    2. Medical Honesty: When no validated clinical ML model with labeled clinical training data
       is integrated, explicitly returns 'Diagnostic prediction model not available' and sets
       prediction_percentage to None (0 fabricated probabilities).
    3. Non-Diagnostic Telemetry: Extracts objective game interaction indicators (motor response,
       interaction rhythm, reaction latency) as observational telemetry only, with zero claims
       of clinical diagnosis.
    4. Clinical Disclaimer: Requires comprehensive multidisciplinary clinical assessment.
    """

    HISTORICAL_METADATA = [
        {
            "id": "autistic_disorder",
            "name": "Autistic Disorder",
            "description": "Historically defined in DSM-IV (299.00) by qualitative differences in social interaction, communication impairments, and restricted/repetitive behaviors prior to age 3.",
            "current_status": "Reclassified under Autism Spectrum Disorder (ASD) in DSM-5 / ICD-11.",
            "clinical_note": "Single-session educational gameplay or facial expressions cannot diagnose Autistic Disorder. Clinical diagnosis requires standardized evaluation (e.g., ADOS-2, ADI-R) by licensed practitioners."
        },
        {
            "id": "asperger_syndrome",
            "name": "Asperger Syndrome",
            "description": "Historically categorized under DSM-IV (299.80) characterized by social interaction and repetitive pattern differences without clinically significant delays in early language or cognitive milestones.",
            "current_status": "Consolidated into Autism Spectrum Disorder (ASD) in DSM-5 / ICD-11, often described dimensional as ASD without intellectual or language impairment.",
            "clinical_note": "A game interface or webcam emotion detection cannot establish Asperger traits. Formal diagnostic differentiation requires developmental history and clinician observation."
        },
        {
            "id": "childhood_disintegrative_disorder",
            "name": "Childhood Disintegrative Disorder",
            "description": "Historically described in DSM-IV (299.10 / Heller's syndrome) as marked by at least 2 years of typical development followed by severe loss of previously acquired skills across multiple domains.",
            "current_status": "Subsumed into Autism Spectrum Disorder (ASD) in DSM-5; rare neurodevelopmental condition requiring extensive pediatric neurology and developmental workup.",
            "clinical_note": "This rare historical condition involves profound neurodevelopmental regression that cannot be detected or assessed by web application interactions."
        },
        {
            "id": "pdd_nos",
            "name": "Pervasive Developmental Disorder - Not Otherwise Specified (PDD-NOS)",
            "description": "Historically used in DSM-IV (299.80) for presentations with severe and pervasive impairment in social reciprocal interaction alongside communication or repetitive behaviors that did not meet full criteria for specific categories.",
            "current_status": "Reclassified within the unified Autism Spectrum Disorder (ASD) or Social (Pragmatic) Communication Disorder in modern diagnostic manuals.",
            "clinical_note": "Subthreshold diagnostic categories are not computable from client-side mini-game metrics. Only a qualified clinician can interpret developmental patterns."
        }
    ]

    def evaluate_session(self, session_data: Dict[str, Any]) -> DiagnosticEvaluationResponse:
        """
        Process completed game session telemetry through the diagnostic evaluation pipeline.
        Returns the structured 4-category evaluation and observational indicators.
        """
        session_id = str(session_data.get("id") or session_data.get("sessionId") or "unknown_session")
        child_id = session_data.get("childId")
        child_name = session_data.get("childName")
        child_age = session_data.get("childAge")

        # Extract objective observational telemetry
        motor_metrics = session_data.get("motorMetrics") or {}
        repetitive_metrics = session_data.get("repetitiveMetrics") or {}
        score = session_data.get("score", 100)
        accuracy = session_data.get("accuracy", 100)
        response_time = session_data.get("responseTime", 2.0)
        initial_emotion = session_data.get("initialEmotion", "Neutral")
        final_emotion = session_data.get("finalEmotion", "Neutral")
        
        # Build observational indicators without medical claims
        observational_indicators: List[ObservationalIndicator] = [
            ObservationalIndicator(
                name="Motor Tap & Interaction Accuracy",
                value=round(float(motor_metrics.get("tapAccuracy", accuracy)), 1),
                unit="%",
                category="Motor & Coordination",
                non_diagnostic_note="Reflects physical touch accuracy and interface targeting during the game challenge."
            ),
            ObservationalIndicator(
                name="Interaction Response Latency",
                value=round(float(motor_metrics.get("avgResponseTime", response_time)), 2),
                unit="seconds",
                category="Processing Speed",
                non_diagnostic_note="Average response delay following in-game auditory or visual prompts."
            ),
            ObservationalIndicator(
                name="Repeated Action Frequency",
                value=round(float(repetitive_metrics.get("repetitionFrequency", 0.0)), 2),
                unit="events / min",
                category="Interaction Rhythm",
                non_diagnostic_note="Rate of rapid sequential taps or keystrokes observed during session gameplay."
            ),
            ObservationalIndicator(
                name="Observed Facial Expression Progression",
                value=f"{initial_emotion} → {final_emotion}",
                unit="transition",
                category="Affective Engagement",
                non_diagnostic_note="Machine-vision observed facial expression checkpoints at start and completion of activity."
            )
        ]

        # Categories list adhering to strict medical honesty:
        categories: List[CategoryResult] = []
        for cat in self.HISTORICAL_METADATA:
            categories.append(
                CategoryResult(
                    category_id=cat["id"],
                    category_name=cat["name"],
                    historical_manual="DSM-IV / ICD-10",
                    current_status=cat["current_status"],
                    model_available=settings.DIAGNOSTIC_MODEL_AVAILABLE,
                    prediction_percentage=None,  # No fabricated percentages!
                    display_value="Diagnostic prediction model not available",
                    status_label="Model Not Available",
                    clinical_note=cat["clinical_note"]
                )
            )

        now_iso = datetime.now(timezone.utc).isoformat()

        return DiagnosticEvaluationResponse(
            session_id=session_id,
            child_id=child_id,
            child_name=child_name,
            child_age=child_age,
            evaluated_at=now_iso,
            model_available=False,
            model_status="EXPERIMENTAL_UNAVAILABLE",
            honest_message="Diagnostic prediction model not available",
            clinical_disclaimer=(
                "Important Medical Disclaimer: BrightPath is an educational play and developmental "
                "engagement application. Facial expressions, game scores, and keyboard rhythm CANNOT "
                "diagnose autism spectrum disorders or differentiate historical diagnostic subtypes. "
                "Formal clinical diagnosis requires comprehensive assessment by qualified medical and developmental specialists."
            ),
            historical_context_summary=(
                "Autistic Disorder, Asperger Syndrome, Childhood Disintegrative Disorder, and PDD-NOS "
                "are historical diagnostic categories from DSM-IV. In DSM-5 and ICD-11, these subtypes "
                "were consolidated into a single Autism Spectrum Disorder (ASD) diagnosis."
            ),
            categories=categories,
            observational_indicators=observational_indicators,
            research_summary={
                "session_score": score,
                "session_accuracy": accuracy,
                "response_time_seconds": response_time,
                "interaction_repetition_rate": repetitive_metrics.get("repetitionFrequency", 0.0),
                "rhythm_consistency": repetitive_metrics.get("rhythmConsistency", 85.0),
                "model_status_reason": "No validated clinical dataset or regulatory-approved model is integrated. Fabricating predictions would violate clinical medical guidelines."
            }
        )

diagnostic_service = DiagnosticService()
