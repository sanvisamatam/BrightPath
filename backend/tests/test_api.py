"""
Comprehensive Unit Tests for BrightPath Flask Backend & Python Services
Tests:
  - Flask endpoints (health, children, sessions, progress, diagnostics, agent, screening, ML)
  - Child age validation & mode resolution service
  - Scikit-learn performance & trajectory trend analysis
  - Agent coordination & personalized game recommendations
  - Longitudinal autism screening analytics service (migrated from ReportsPage.jsx)
  - Medical honesty regarding historical diagnostic categories
Zero external APIs. Zero FastAPI dependencies.
"""

import unittest
from backend.app.main import app

class TestBrightPathFlaskBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        app.testing = True
        cls.client = app.test_client()

    def test_01_root_and_health_check(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("backend"), "Flask (Python)")
        self.assertFalse(data.get("external_ai_apis"))

        res_health = self.client.get("/api/health")
        self.assertEqual(res_health.status_code, 200)
        health_data = res_health.get_json()
        self.assertEqual(health_data.get("status"), "healthy")
        self.assertEqual(health_data.get("framework"), "Flask")
        self.assertEqual(health_data.get("ml_framework"), "scikit-learn")

    def test_02_agent_status_and_recommendation(self):
        res = self.client.get("/api/agent/status")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data.get("status"), "active")
        meta = data.get("agent_metadata", {})
        self.assertIn("BrightPath", meta.get("name"))

        # Test Early Mode recommendation (Age 5, Happy -> Bubble Pop)
        rec_res = self.client.post("/api/agent/recommend", json={
            "emotion": "Happy",
            "age": 5,
            "mode": "early"
        })
        self.assertEqual(rec_res.status_code, 200)
        rec_data = rec_res.get_json()
        self.assertEqual(rec_data.get("id"), "bubble-pop")
        self.assertEqual(rec_data.get("color"), "#10b981")
        self.assertIn("agent_rationale", rec_data)

        # Test BrightPath Mode recommendation (Age 10, Frustrated -> Step-by-Step Puzzle)
        rec_res2 = self.client.post("/api/agent/recommend", json={
            "emotion": "Frustrated",
            "age": 10,
            "mode": "brightpath"
        })
        self.assertEqual(rec_res2.status_code, 200)
        rec_data2 = rec_res2.get_json()
        self.assertEqual(rec_data2.get("id"), "step-puzzle")
        self.assertEqual(rec_data2.get("color"), "#ec4899")

    def test_03_child_validation_and_crud(self):
        # Age validation endpoint
        val_res = self.client.post("/api/children/validate-age", json={"age": 5})
        self.assertEqual(val_res.status_code, 200)
        val_data = val_res.get_json()
        self.assertTrue(val_data.get("valid"))
        self.assertEqual(val_data.get("mode"), "early")

        # Invalid age test (< 3)
        val_invalid = self.client.post("/api/children/validate-age", json={"age": 2})
        self.assertEqual(val_invalid.status_code, 200)
        self.assertFalse(val_invalid.get_json().get("valid"))

        # Create child
        child_payload = {
            "childId": "child_test_py_01",
            "name": "Leo Adventurer",
            "age": 6,
            "notes": "Loves puzzle exploration"
        }
        create_res = self.client.post("/api/children", json=child_payload)
        self.assertEqual(create_res.status_code, 200)
        created = create_res.get_json()
        self.assertEqual(created.get("name"), "Leo Adventurer")
        self.assertEqual(created.get("mode"), "early")

        # Get child
        get_res = self.client.get("/api/children/child_test_py_01")
        self.assertEqual(get_res.status_code, 200)
        self.assertEqual(get_res.get_json().get("childId"), "child_test_py_01")

        # Update child (update age to 8 -> auto resolve mode to brightpath)
        update_res = self.client.put("/api/children/child_test_py_01", json={"age": 8})
        self.assertEqual(update_res.status_code, 200)
        self.assertEqual(update_res.get_json().get("mode"), "brightpath")

    def test_04_session_processing_and_progress(self):
        session_payload = {
            "id": "session_test_py_001",
            "childId": "child_test_py_01",
            "childName": "Leo Adventurer",
            "childAge": 8,
            "activityMode": "brightpath",
            "activityId": "memory-quest",
            "activityName": "Memory Quest",
            "score": 95,
            "accuracy": 92,
            "responseTime": 1.6,
            "duration": 90,
            "initialEmotion": "Neutral",
            "finalEmotion": "Happy",
            "motorMetrics": {
                "tapAccuracy": 94,
                "avgResponseTime": 1.6,
                "completionTime": 90
            },
            "repetitiveMetrics": {
                "repetitionFrequency": 0.4,
                "rhythmConsistency": 92
            }
        }
        res = self.client.post("/api/sessions", json=session_payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        # Check ML telemetry attachment
        self.assertIn("mlPredictions", data)
        self.assertIn("mastery_prediction", data["mlPredictions"])

        # Check AI agent analysis attachment
        self.assertIn("agentAnalysis", data)
        self.assertIn("performance_analysis", data["agentAnalysis"])
        self.assertIn("next_recommendation", data["agentAnalysis"])

        # Check cumulative progress was automatically updated
        prog_res = self.client.get("/api/progress/child_test_py_01")
        self.assertEqual(prog_res.status_code, 200)
        prog = prog_res.get_json()
        self.assertEqual(prog.get("childId"), "child_test_py_01")
        self.assertTrue(prog.get("totalSessions") >= 1)
        self.assertEqual(prog.get("avgScore"), 95)

    def test_05_historical_diagnostic_transparency(self):
        info_res = self.client.get("/api/diagnostics/model-info")
        self.assertEqual(info_res.status_code, 200)
        info_data = info_res.get_json()
        self.assertFalse(info_data.get("model_available"))
        self.assertEqual(info_data.get("honest_message"), "Diagnostic prediction model not available")
        self.assertEqual(len(info_data.get("categories", [])), 4)

        # Verify evaluation endpoint does NOT fabricate percentages
        eval_res = self.client.post("/api/diagnostics/evaluate", json={"score": 88, "accuracy": 90})
        self.assertEqual(eval_res.status_code, 200)
        eval_data = eval_res.get_json()
        for cat in eval_data.get("categories", []):
            self.assertIsNone(cat.get("prediction_percentage"))
            self.assertEqual(cat.get("display_value"), "Diagnostic prediction model not available")

    def test_06_autism_screening_analytics_service(self):
        sample_sessions = [
            {
                "id": "s1",
                "score": 90,
                "accuracy": 88,
                "responseTime": 1.8,
                "initialEmotion": "Neutral",
                "finalEmotion": "Happy",
                "motorMetrics": {"tapAccuracy": 90, "avgResponseTime": 1.8},
                "repetitiveMetrics": {"repetitionFrequency": 0.5}
            },
            {
                "id": "s2",
                "score": 85,
                "accuracy": 82,
                "responseTime": 2.2,
                "initialEmotion": "Neutral",
                "finalEmotion": "Neutral",
                "motorMetrics": {"tapAccuracy": 85, "avgResponseTime": 2.2},
                "repetitiveMetrics": {"repetitionFrequency": 0.8}
            }
        ]
        res = self.client.post("/api/analytics/autism-insights", json={
            "sessions": sample_sessions,
            "activeChild": {"name": "Leo", "age": 8}
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("riskPercentage", data)
        self.assertIn("level", data)
        self.assertIn("supportEstimate", data)
        self.assertIn("profileType", data)
        self.assertIn("typeDistribution", data)
        self.assertEqual(len(data.get("typeDistribution", [])), 4)
        self.assertIn("metrics", data)
        self.assertIn("agentSummary", data)

    def test_07_ml_telemetry_prediction_endpoint(self):
        res = self.client.post("/api/predict/telemetry", json={
            "score": 92,
            "accuracy": 90,
            "responseTime": 1.5,
            "initialEmotion": "Neutral",
            "finalEmotion": "Happy"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("mastery_prediction", data)
        self.assertIn("adaptive_pacing", data)

if __name__ == "__main__":
    unittest.main()
