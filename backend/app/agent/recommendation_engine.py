"""
Educational Game Recommendation Engine
Selects child-appropriate learning activities based on age group,
observed facial expression, and real gameplay telemetry.
Provides full visual styling metadata (colors, icons, backgrounds)
so frontend components remain visually identical.
"""

from typing import Dict, Any, Optional

EARLY_GAMES: Dict[str, Dict[str, Any]] = {
    "Happy": {
        "id": "bubble-pop",
        "name": "Bubble Pop",
        "description": "Tap cheerful floating bubbles to pop them with sparkles, stars, and gentle sounds!",
        "goal": "Celebrate positive mood with visual-motor coordination.",
        "sensory_intensity": "Medium",
        "color": "#10b981",
        "bg": "#ecfdf5",
        "icon": "Sparkles",
        "mode": "early"
    },
    "Sad": {
        "id": "grow-garden",
        "name": "Grow the Garden",
        "description": "Help sleepy little plants bloom into colorful flowers with sunshine and water drops!",
        "goal": "Uplifting, calming visual progress and positive reinforcement.",
        "sensory_intensity": "Low",
        "color": "#3b82f6",
        "bg": "#eff6ff",
        "icon": "Sun",
        "mode": "early"
    },
    "Angry": {
        "id": "balloon-smash",
        "name": "Balloon Smash",
        "description": "Tap colorful floating balloons to smash and pop them in a fun, satisfying way!",
        "goal": "Safe, playful release of intense energy through energetic popping.",
        "sensory_intensity": "Medium",
        "color": "#f97316",
        "bg": "#ffedd5",
        "icon": "Flame",
        "mode": "early"
    },
    "Frustrated": {
        "id": "balloon-smash",
        "name": "Balloon Smash",
        "description": "Tap colorful floating balloons to smash and pop them in a fun, satisfying way!",
        "goal": "De-escalate frustration with quick, satisfying tactile feedback.",
        "sensory_intensity": "Medium",
        "color": "#f97316",
        "bg": "#ffedd5",
        "icon": "Flame",
        "mode": "early"
    },
    "Fear": {
        "id": "hidden-friend",
        "name": "Find the Hidden Friend",
        "description": "Play friendly peekaboo! Tap behind trees and clouds to find cute animal friends waving at you.",
        "goal": "Reassuring, predictable gentle characters.",
        "sensory_intensity": "Low",
        "color": "#8b5cf6",
        "bg": "#f5f3ff",
        "icon": "Eye",
        "mode": "early"
    },
    "Surprise": {
        "id": "hidden-friend",
        "name": "Find the Hidden Friend",
        "description": "Play friendly peekaboo! Tap behind trees and clouds to find cute animal friends waving at you.",
        "goal": "Engaging curiosity with predictable peekaboo rewards.",
        "sensory_intensity": "Low",
        "color": "#8b5cf6",
        "bg": "#f5f3ff",
        "icon": "Eye",
        "mode": "early"
    },
    "Neutral": {
        "id": "rainbow-builder",
        "name": "Rainbow Builder",
        "description": "Drag vibrant rainbow arcs into the sky to complete a beautiful shining rainbow.",
        "goal": "Pattern construction and calm focus.",
        "sensory_intensity": "Low",
        "color": "#06b6d4",
        "bg": "#ecfeff",
        "icon": "CloudRain",
        "mode": "early"
    }
}

BRIGHTPATH_GAMES: Dict[str, Dict[str, Any]] = {
    "Happy": {
        "id": "memory-quest",
        "name": "Memory Quest",
        "description": "A fun memory matching game with increasing challenge to maintain positive focus.",
        "goal": "Working memory expansion and focus retention.",
        "sensory_intensity": "Medium",
        "color": "#10b981",
        "bg": "#ecfdf5",
        "icon": "Brain",
        "mode": "brightpath"
    },
    "Sad": {
        "id": "color-garden",
        "name": "Color Garden",
        "description": "A calming pattern completion game where every correct match blooms a beautiful virtual garden.",
        "goal": "Soothing visual beauty, gentle pacing, and stress relief.",
        "sensory_intensity": "Low",
        "color": "#3b82f6",
        "bg": "#eff6ff",
        "icon": "Flower2",
        "mode": "brightpath"
    },
    "Angry": {
        "id": "calm-maze",
        "name": "Calm Maze",
        "description": "A soothing maze navigation game with peaceful puzzle checkpoints and gentle pacing.",
        "goal": "Emotional de-escalation, self-regulation, and smooth navigation.",
        "sensory_intensity": "Low",
        "color": "#f97316",
        "bg": "#ffedd5",
        "icon": "Compass",
        "mode": "brightpath"
    },
    "Frustrated": {
        "id": "step-puzzle",
        "name": "Step-by-Step Puzzle",
        "description": "A multi-stage progressive challenge breaking big puzzles into achievable stages with hints.",
        "goal": "Chunked problem-solving with reduced cognitive load.",
        "sensory_intensity": "Low",
        "color": "#ec4899",
        "bg": "#fdf2f8",
        "icon": "Puzzle",
        "mode": "brightpath"
    },
    "Neutral": {
        "id": "brain-rush",
        "name": "Brain Rush",
        "description": "A dynamic series of cognitive mini-challenges suitable for all age ranges.",
        "goal": "Active cognitive engagement and reaction speed exploration.",
        "sensory_intensity": "Medium",
        "color": "#8b5cf6",
        "bg": "#f5f3ff",
        "icon": "Zap",
        "mode": "brightpath"
    }
}

class GameRecommendationEngine:
    def recommend(
        self,
        emotion: str,
        age: int = 5,
        mode: Optional[str] = None,
        recent_performance: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Determines the most appropriate educational game recommendation.
        Adapts dynamically to performance indicators (e.g. low score triggers gentler pacing).
        """
        is_early = (mode == "early") or (age <= 6)
        catalog = EARLY_GAMES if is_early else BRIGHTPATH_GAMES
        fallback_key = "Neutral"

        clean_emo = emotion.strip().capitalize() if emotion else "Neutral"
        base_game = dict(catalog.get(clean_emo, catalog.get(fallback_key, list(catalog.values())[0])))

        # Performance adaptation override if recent session showed frustration/difficulty
        if recent_performance:
            score = recent_performance.get("score", 100)
            mistakes = recent_performance.get("mistakes_count", 0)
            if score < 55 or mistakes >= 4:
                # Override to calming, low-frustration activity
                override_key = "Sad"
                adapted_game = dict(catalog.get(override_key, base_game))
                return {
                    **adapted_game,
                    "agent_rationale": (
                        f"Adaptive Pacing Adjustment: Recent session had lower accuracy ({score}%). "
                        f"Agent selected '{adapted_game['name']}' to provide calming visual rewards and reduce cognitive strain."
                    ),
                    "pedagogical_target": "Emotional self-regulation and anxiety reduction",
                    "mode_matched": "early" if is_early else "brightpath"
                }

        return {
            **base_game,
            "agent_rationale": (
                f"Emotion-Guided Track: Detected observed expression '{clean_emo}' in {('Early Mode (Ages 3-6)' if is_early else 'BrightPath Mode (Ages 7-17)')}. "
                f"Agent selected '{base_game['name']}' to {base_game['goal'].lower()}"
            ),
            "pedagogical_target": base_game["goal"],
            "mode_matched": "early" if is_early else "brightpath"
        }

recommendation_engine = GameRecommendationEngine()
