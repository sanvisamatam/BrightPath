"""
Autism Screening & Developmental Longitudinal Analytics Service
Migrated from client-side JSX (ReportsPage.jsx) to Python.
Provides deterministic scoring and telemetry pattern aggregation across
recorded game sessions, respecting clinical disclaimers and medical integrity.
"""

from typing import List, Dict, Any, Optional

NEGATIVE_EMOTIONS = {"Sad", "Angry", "Frustrated", "Fear"}
POSITIVE_EMOTIONS = {"Happy", "Neutral"}

def clamp(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    try:
        val = float(value)
        return max(min_val, min(max_val, val))
    except (ValueError, TypeError):
        return min_val

def average(values: List[Any], fallback: float = 0.0) -> float:
    valid_vals = []
    for v in values:
        try:
            if v is not None:
                valid_vals.append(float(v))
        except (ValueError, TypeError):
            continue
    if not valid_vals:
        return fallback
    return sum(valid_vals) / len(valid_vals)

def normalize_distribution(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    total = sum(max(0.0, float(item.get("value", 0.0))) for item in items) or 1.0
    normalized = []
    for item in items:
        val = max(0.0, float(item.get("value", 0.0)))
        pct = round((val / total) * 100)
        normalized.append({
            "label": item.get("label", ""),
            "color": item.get("color", "#6366f1"),
            "value": val,
            "percentage": pct
        })
    normalized.sort(key=lambda x: x["percentage"], reverse=True)
    return normalized

class AutismScreeningService:
    def derive_autism_screening_insights(
        self,
        sessions: List[Dict[str, Any]],
        active_child: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Computes autism screening indicators, historical profile estimates,
        support pattern categorization, and next steps from actual session history.
        Preserves exact schema consumed by ReportsPage.jsx.
        """
        child_label = "Selected child"
        if active_child:
            name = active_child.get("name")
            age = active_child.get("age")
            if name:
                child_label = f"{name} ({age}y)" if age else name

        if not sessions:
            return {
                "childLabel": child_label,
                "level": "Waiting for session data",
                "supportEstimate": "Complete sessions to estimate support pattern",
                "profileType": "No profile estimated yet",
                "riskPercentage": 0,
                "confidenceLabel": "Not enough data",
                "confidence": 0,
                "agentSummary": "BrightPath Agent will summarize autism screening patterns after at least one recorded session.",
                "nextSteps": [
                    "Complete a learning session first.",
                    "Use the report only as an educational screening aid.",
                    "Consult a qualified clinician for medical concerns."
                ],
                "redFlags": [],
                "typeDistribution": [
                    {"label": "Autistic Disorder-like", "percentage": 0, "color": "#6366f1"},
                    {"label": "Asperger-like", "percentage": 0, "color": "#0d9488"},
                    {"label": "CDD regression-alert", "percentage": 0, "color": "#f59e0b"},
                    {"label": "PDD-NOS-like / mixed", "percentage": 0, "color": "#db2777"}
                ],
                "metrics": [
                    {"label": "Avg Score", "value": "--"},
                    {"label": "Avg Accuracy", "value": "--"},
                    {"label": "Response Time", "value": "--"},
                    {"label": "Repetition Rate", "value": "--"}
                ]
            }

        # 1. Aggregate core metrics
        scores = [s.get("score") for s in sessions if s.get("score") is not None]
        accuracies = [s.get("accuracy") for s in sessions if s.get("accuracy") is not None]
        avg_score = average(scores, 0.0)
        avg_accuracy = average(accuracies, 0.0)

        motor_accuracies = []
        for s in sessions:
            m = s.get("motorMetrics") or {}
            val = m.get("tapAccuracy") if m.get("tapAccuracy") is not None else s.get("accuracy")
            if val is not None:
                motor_accuracies.append(val)
        avg_motor_accuracy = average(motor_accuracies, avg_accuracy)

        response_times = []
        for s in sessions:
            m = s.get("motorMetrics") or {}
            c = s.get("communicationMetrics") or {}
            val = m.get("avgResponseTime") or c.get("responseLatency") or s.get("responseTime") or 2.0
            response_times.append(val)
        avg_response_time = average(response_times, 2.0)

        rep_frequencies = []
        for s in sessions:
            r = s.get("repetitiveMetrics") or {}
            val = r.get("repetitionFrequency", 0.0)
            rep_frequencies.append(val)
        avg_rep_frequency = average(rep_frequencies, 0.0)

        neg_count = sum(1 for s in sessions if s.get("finalEmotion") in NEGATIVE_EMOTIONS)
        pos_count = sum(1 for s in sessions if s.get("finalEmotion") in POSITIVE_EMOTIONS)
        negative_final_rate = neg_count / len(sessions)
        positive_outcome_rate = pos_count / len(sessions)

        # 2. Derive signals
        performance_signal = clamp(100.0 - ((avg_score + avg_accuracy) / 2.0))
        motor_signal = clamp(100.0 - avg_motor_accuracy)
        response_signal = clamp(((avg_response_time - 1.2) / 4.8) * 100.0)
        repetition_signal = clamp(avg_rep_frequency * 18.0)
        emotion_signal = clamp((negative_final_rate * 68.0) + ((1.0 - positive_outcome_rate) * 32.0))

        risk_percentage = round(
            (performance_signal * 0.24)
            + (motor_signal * 0.20)
            + (response_signal * 0.20)
            + (repetition_signal * 0.20)
            + (emotion_signal * 0.16)
        )

        # 3. Categorize level & support estimate
        if risk_percentage >= 68:
            level = "Very high autism screening signal"
            support_estimate = "ASD Support Level 3 pattern: very substantial support likely needed"
        elif risk_percentage >= 46:
            level = "High autism screening signal"
            support_estimate = "ASD Support Level 2 pattern: substantial support likely needed"
        elif risk_percentage >= 25:
            level = "Moderate autism screening signal"
            support_estimate = "ASD Support Level 1 pattern: support likely helpful"
        else:
            level = "Low autism screening signal"
            support_estimate = "No ASD support level estimated from current sessions"

        # 4. Check for regression flags
        regression_flag = any(
            s.get("developmentalRegression") is True
            or s.get("regressionHistory") is True
            or "regression" in str((s.get("diagnosticResults") or {}).get("profile_type", "")).lower()
            for s in sessions
        )

        # 5. Profile type pattern
        if risk_percentage < 25:
            profile_type = "No strong ASD profile indicated by current sessions"
        elif regression_flag:
            profile_type = "Childhood Disintegrative Disorder regression-alert profile"
        elif avg_rep_frequency >= 2.5 and avg_response_time > 3.2:
            profile_type = "Autistic Disorder-like historical profile"
        elif avg_rep_frequency >= 1.4 and avg_score >= 65:
            profile_type = "Asperger-like historical profile"
        else:
            profile_type = "PDD-NOS-like / mixed ASD screening pattern"

        # 6. Type distribution
        type_distribution = normalize_distribution([
            {
                "label": "Autistic Disorder-like",
                "color": "#6366f1",
                "value": 26.0 + (repetition_signal * 0.32) + (response_signal * 0.24) + (motor_signal * 0.20)
            },
            {
                "label": "Asperger-like",
                "color": "#0d9488",
                "value": 24.0 + (repetition_signal * 0.28) + ((100.0 - performance_signal) * 0.12) + ((100.0 - response_signal) * 0.08)
            },
            {
                "label": "CDD regression-alert",
                "color": "#f59e0b",
                "value": 58.0 if regression_flag else 8.0 + (response_signal * 0.08)
            },
            {
                "label": "PDD-NOS-like / mixed",
                "color": "#db2777",
                "value": 20.0 + (emotion_signal * 0.24) + (performance_signal * 0.18)
            }
        ])

        # 7. Confidence & Red Flags
        confidence = min(92, round(62 + min(len(sessions), 7) * 4))
        confidence_label = "High screening confidence" if confidence >= 82 else "Moderate screening confidence"

        red_flags = []
        if regression_flag:
            red_flags.append("Regression history should be discussed with a developmental clinician.")
        if avg_response_time >= 4.0:
            red_flags.append("Slow response pattern may need gentler pacing and clinical review if seen outside the app.")
        if avg_rep_frequency >= 3.0:
            red_flags.append("High repetition frequency was observed across sessions.")

        # 8. Agent summary text matching ReportsPage
        agent_summary = (
            f"{level}. Strongest current profile: {profile_type}. {support_estimate}. "
            f"This is a non-diagnostic screening estimate based on BrightPath sessions."
        )

        next_steps = (
            [
                "Share this report with a pediatrician, child psychologist, or developmental specialist.",
                "Track communication, sensory, routine-change, and peer-interaction patterns outside the game.",
                "Use visual schedules, predictable transitions, and low-sensory activity pacing."
            ]
            if risk_percentage >= 46
            else [
                "Continue observing patterns across home and school.",
                "Repeat screening after more sessions for a steadier trend.",
                "Consult a professional if caregiver concern remains high."
            ]
        )

        metrics = [
            {"label": "Avg Score", "value": f"{round(avg_score)}%"},
            {"label": "Avg Accuracy", "value": f"{round(avg_accuracy)}%"},
            {"label": "Response Time", "value": f"{avg_response_time:.1f}s"},
            {"label": "Repetition Rate", "value": f"{avg_rep_frequency:.1f}/min"}
        ]

        return {
            "childLabel": child_label,
            "level": level,
            "supportEstimate": support_estimate,
            "profileType": profile_type,
            "riskPercentage": risk_percentage,
            "confidenceLabel": confidence_label,
            "confidence": confidence,
            "agentSummary": agent_summary,
            "nextSteps": next_steps,
            "redFlags": red_flags,
            "typeDistribution": type_distribution,
            "metrics": metrics
        }

screening_service = AutismScreeningService()

