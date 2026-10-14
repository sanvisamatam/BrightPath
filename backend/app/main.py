"""
BrightPath Flask Backend & AI Agent Server
Uses Flask + Flask-CORS + scikit-learn.
Modularized architecture:
- Session processing & telemetry: session_service
- Persistent local database operations: storage_service
- Child profiles & age validation: child_service
- Longitudinal progress tracking: progress_service
- Diagnostic categories transparency: diagnostic_service & brightpath_agent
- Machine learning performance analysis: scikit_analyzer & ml_service
- Personalized game recommendations: recommendation_engine
- Longitudinal autism screening analytics: screening_service
Zero external AI inference APIs. Zero cloud telemetry.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.app.core.config import settings
from backend.app.services.storage_service import storage_service
from backend.app.services.progress_service import progress_service
from backend.app.services.diagnostic_service import diagnostic_service
from backend.app.services.child_service import child_service
from backend.app.services.session_service import session_service
from backend.app.services.screening_service import screening_service
from backend.app.services.ml_service import ml_service
from backend.app.agent.brightpath_agent import brightpath_agent
from backend.app.agent.recommendation_engine import recommendation_engine

app = Flask(__name__)
# Enable CORS for local Vite dev & preview origins
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ========================================================
# Root & Health Check
# ========================================================
@app.route("/", methods=["GET"])
def root_route():
    return jsonify({
        "app": "BrightPath Educational Platform",
        "backend": "Flask (Python)",
        "agent": brightpath_agent.AGENT_METADATA["name"],
        "ml_framework": "scikit-learn (100% Local)",
        "external_ai_apis": False,
        "status": "online"
    })

@app.route("/api/health", methods=["GET"])
def health_route():
    return jsonify({
        "status": "healthy",
        "service": "BrightPath Flask Backend",
        "framework": "Flask",
        "ml_framework": "scikit-learn",
        "external_api_used": False,
        "model_available": settings.DIAGNOSTIC_MODEL_AVAILABLE,
        "historical_categories": settings.HISTORICAL_CATEGORIES
    })

# ========================================================
# AI Agent & Personalized Game Recommendations
# ========================================================
@app.route("/api/agent/status", methods=["GET"])
def agent_status_route():
    return jsonify({
        "agent_metadata": brightpath_agent.AGENT_METADATA,
        "historical_categories": brightpath_agent.HISTORICAL_CATEGORIES_METADATA,
        "status": "active"
    })

@app.route("/api/agent/recommend", methods=["POST"])
def agent_recommend_route():
    data = request.get_json() or {}
    emotion = data.get("emotion", "Neutral")
    age = int(data.get("age", 5))
    mode = data.get("mode")
    recent_perf = data.get("recentPerformance")
    recommendation = recommendation_engine.recommend(
        emotion=emotion,
        age=age,
        mode=mode,
        recent_performance=recent_perf
    )
    return jsonify(recommendation), 200

# ========================================================
# Session Management & Processing
# ========================================================
@app.route("/api/sessions", methods=["POST"])
def save_session_route():
    session_data = request.get_json() or {}
    saved_session = session_service.process_and_save_session(session_data)
    return jsonify(saved_session), 200

@app.route("/api/sessions", methods=["GET"])
def list_sessions_route():
    child_id = request.args.get("childId")
    user_id = request.args.get("userId")
    sessions = storage_service.list_sessions(child_id=child_id, user_id=user_id)
    return jsonify(sessions), 200

@app.route("/api/sessions/<session_id>", methods=["GET"])
def get_session_route(session_id):
    session = storage_service.get_session(session_id)
    if not session:
        return jsonify({"error": f"Session '{session_id}' not found"}), 404
    return jsonify(session), 200

@app.route("/api/sessions/<session_id>/analyze", methods=["POST"])
def analyze_session_route(session_id):
    updated = session_service.analyze_existing_session(session_id)
    if not updated:
        return jsonify({"error": f"Session '{session_id}' not found"}), 404
    return jsonify(updated), 200

# ========================================================
# Child Cumulative Progress Tracking
# ========================================================
@app.route("/api/progress/<child_id>", methods=["GET"])
def get_progress_route(child_id):
    prog = progress_service.get_child_progress(child_id)
    if not prog:
        prog = {
            "childId": child_id,
            "totalSessions": 0,
            "completedSessions": 0,
            "completionRate": 0,
            "totalDurationSeconds": 0,
            "avgScore": 0,
            "avgAccuracy": 0,
            "avgMotorAccuracy": 100,
            "avgRepetitionFreq": 0.0,
            "recentSessionId": None,
            "updatedAt": "2026-01-01T00:00:00Z"
        }
    return jsonify(prog), 200

@app.route("/api/progress/<child_id>/recalculate", methods=["POST"])
def recalculate_progress_route(child_id):
    prog = progress_service.update_child_progress(child_id)
    return jsonify(prog or {}), 200

# ========================================================
# Child Profiles & Age Validation
# ========================================================
@app.route("/api/children", methods=["POST"])
def create_child_route():
    data = request.get_json() or {}
    try:
        saved = child_service.create_child(data)
        return jsonify(saved), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/children", methods=["GET"])
def list_children_route():
    user_id = request.args.get("userId")
    children = storage_service.list_children(user_id=user_id)
    return jsonify(children), 200

@app.route("/api/children/<child_id>", methods=["GET"])
def get_child_route(child_id):
    child = storage_service.get_child(child_id)
    if not child:
        return jsonify({"error": f"Child '{child_id}' not found"}), 404
    return jsonify(child), 200

@app.route("/api/children/<child_id>", methods=["PUT"])
def update_child_route(child_id):
    updates = request.get_json() or {}
    try:
        updated = child_service.update_child(child_id, updates)
        if not updated:
            return jsonify({"error": f"Child '{child_id}' not found"}), 404
        return jsonify(updated), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route("/api/children/validate-age", methods=["POST"])
def validate_child_age_route():
    data = request.get_json() or {}
    raw_age = data.get("age")
    valid, err, numeric_age = child_service.validate_child_age(raw_age)
    mode = child_service.resolve_activity_mode(numeric_age) if valid else None
    return jsonify({
        "valid": valid,
        "error": err,
        "age": numeric_age,
        "mode": mode
    }), 200

# ========================================================
# User Profiles
# ========================================================
@app.route("/api/users/profile", methods=["POST"])
def save_user_profile_route():
    data = request.get_json() or {}
    saved = storage_service.save_user(data)
    return jsonify(saved), 200

@app.route("/api/users/<user_id>", methods=["GET"])
def get_user_profile_route(user_id):
    user = storage_service.get_user(user_id)
    if not user:
        return jsonify({"error": f"User '{user_id}' not found"}), 404
    return jsonify(user), 200

# ========================================================
# Historical Diagnostic Categories Transparency
# ========================================================
@app.route("/api/diagnostics/model-info", methods=["GET"])
def diagnostic_model_info_route():
    return jsonify({
        "model_available": False,
        "model_status": "EXPERIMENTAL_UNAVAILABLE",
        "honest_message": "Diagnostic prediction model not available",
        "categories": brightpath_agent.HISTORICAL_CATEGORIES_METADATA,
        "disclaimer": (
            "Educational and research notice: Mini-game scores, keyboard interactions, and webcam expressions "
            "cannot diagnose autism spectrum disorders or differentiate historical DSM-IV categories. "
            "Formal clinical diagnosis requires evaluation by qualified healthcare specialists."
        )
    }), 200

@app.route("/api/diagnostics/evaluate", methods=["POST"])
def evaluate_diagnostics_route():
    session_data = request.get_json() or {}
    results = brightpath_agent.evaluate_diagnostic_categories(session_data)
    return jsonify(results), 200

@app.route("/api/diagnostics/session/<session_id>", methods=["GET"])
def get_session_diagnostics_route(session_id):
    session = storage_service.get_session(session_id)
    if session and session.get("diagnosticResults"):
        return jsonify(session["diagnosticResults"]), 200
    elif session:
        results = brightpath_agent.evaluate_diagnostic_categories(session)
        return jsonify(results), 200
    results = brightpath_agent.evaluate_diagnostic_categories({"id": session_id})
    return jsonify(results), 200

# ========================================================
# Autism Screening Analytics & Longitudinal Insights
# (Migrated from ReportsPage.jsx)
# ========================================================
@app.route("/api/analytics/autism-insights", methods=["POST"])
def autism_insights_route():
    payload = request.get_json() or {}
    sessions = payload.get("sessions", [])
    active_child = payload.get("activeChild")
    insights = screening_service.derive_autism_screening_insights(sessions, active_child)
    return jsonify(insights), 200

@app.route("/api/analytics/autism-insights/<child_id>", methods=["GET"])
def child_autism_insights_route(child_id):
    sessions = storage_service.list_sessions(child_id=child_id)
    child = storage_service.get_child(child_id)
    insights = screening_service.derive_autism_screening_insights(sessions, child)
    return jsonify(insights), 200

# ========================================================
# Machine Learning Telemetry Inference
# ========================================================
@app.route("/api/predict/model-info", methods=["GET"])
def ml_model_info_route():
    return jsonify({
        "framework": "scikit-learn",
        "model_file": "backend/models/telemetry_engagement_model.joblib",
        "is_loaded": ml_service.is_loaded,
        "external_api_used": False,
        "privacy_guarantee": "100% on-device local execution; zero telemetry sent to external services.",
        "metadata": ml_service.metadata
    }), 200

@app.route("/api/predict/telemetry", methods=["POST"])
def predict_telemetry_route():
    payload = request.get_json() or {}
    prediction = ml_service.predict_session_telemetry(payload)
    return jsonify(prediction), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)
