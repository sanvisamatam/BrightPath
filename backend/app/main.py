"""
BrightPath Flask Backend & AI Agent Server
Uses Flask + Flask-CORS + scikit-learn.
Zero external AI inference APIs. Zero cloud telemetry.
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.app.core.config import settings
from backend.app.services.storage_service import storage_service
from backend.app.services.progress_service import progress_service
from backend.app.agent.brightpath_agent import brightpath_agent

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
# AI Agent Endpoints
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
    recommendation = brightpath_agent.recommend_game(emotion=emotion, age=age, mode=mode)
    return jsonify(recommendation)

# ========================================================
# Session Management & Agent Processing
# ========================================================
@app.route("/api/sessions", methods=["POST"])
def save_session_route():
    session_data = request.get_json() or {}
    
    # 1. Fetch child's actual historical sessions for real longitudinal trend calculation
    child_id = session_data.get("childId")
    historical = storage_service.list_sessions(child_id=child_id) if child_id else []

    # 2. Process with the modular BrightPath AI Agent (scikit-learn analytics + recommendations)
    agent_output = brightpath_agent.process_session(session_data, historical)

    # 3. Attach agent results to session payload
    session_data["agentAnalysis"] = agent_output
    session_data["diagnosticResults"] = agent_output.get("diagnostic_evaluation")

    # 4. Save session locally
    saved_session = storage_service.save_session(session_data)

    # 5. Update child's cumulative progress
    if child_id and child_id != "default_child":
        progress_service.update_child_progress(child_id)

    return jsonify(saved_session), 200

@app.route("/api/sessions", methods=["GET"])
def list_sessions_route():
    child_id = request.args.get("childId")
    user_id = request.args.get("userId")
    sessions = storage_service.list_sessions(child_id=child_id, user_id=user_id)
    return jsonify(sessions)

@app.route("/api/sessions/<session_id>", methods=["GET"])
def get_session_route(session_id):
    session = storage_service.get_session(session_id)
    if not session:
        return jsonify({"error": f"Session '{session_id}' not found"}), 404
    return jsonify(session)

# ========================================================
# Progress Tracking
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
    return jsonify(prog)

# ========================================================
# Child Profiles
# ========================================================
@app.route("/api/children", methods=["POST"])
def create_child_route():
    data = request.get_json() or {}
    saved = storage_service.save_child(data)
    return jsonify(saved), 200

@app.route("/api/children", methods=["GET"])
def list_children_route():
    user_id = request.args.get("userId")
    children = storage_service.list_children(user_id=user_id)
    return jsonify(children)

@app.route("/api/children/<child_id>", methods=["GET"])
def get_child_route(child_id):
    child = storage_service.get_child(child_id)
    if not child:
        return jsonify({"error": f"Child '{child_id}' not found"}), 404
    return jsonify(child)

@app.route("/api/children/<child_id>", methods=["PUT"])
def update_child_route(child_id):
    updates = request.get_json() or {}
    updated = storage_service.update_child(child_id, updates)
    if not updated:
        return jsonify({"error": f"Child '{child_id}' not found"}), 404
    return jsonify(updated)

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
    return jsonify(user)

# ========================================================
# Historical Diagnostic Categories Transparency Info
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
    })

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

@app.route("/api/sessions/<session_id>/analyze", methods=["POST"])
def analyze_session_route(session_id):
    session = storage_service.get_session(session_id)
    if not session:
        return jsonify({"error": f"Session '{session_id}' not found"}), 404
    child_id = session.get("childId")
    historical = storage_service.list_sessions(child_id=child_id) if child_id else []
    agent_output = brightpath_agent.process_session(session, historical)
    session["agentAnalysis"] = agent_output
    session["diagnosticResults"] = agent_output.get("diagnostic_evaluation")
    saved = storage_service.save_session(session)
    return jsonify(saved), 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)

