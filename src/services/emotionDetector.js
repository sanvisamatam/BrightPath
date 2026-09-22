// Facial Emotion Recognition Engine Bridge & Recommendation Handler
import { 
  BRIGHTPATH_EMOTIONS, 
  analyzeCurrentExpression, 
  loadEmotionModel, 
  checkFacePresence,
  waitForVideoReady
} from './emotionRecognition.js';

export const EMOTIONS = {
  ...BRIGHTPATH_EMOTIONS,
  FEAR: 'Fear',
  SURPRISE: 'Surprise'
};

// =======================================================
// Ages 7–17: Existing BrightPath Games (STRICTLY PRESERVED)
// =======================================================
export const BRIGHTPATH_GAME_RECOMMENDATIONS = {
  [EMOTIONS.HAPPY]: {
    name: 'Memory Quest',
    id: 'memory-quest',
    description: 'A fun memory matching game with increasing challenge to maintain high positive focus.',
    color: '#10b981',
    bg: '#ecfdf5',
    icon: 'Brain',
    mode: 'brightpath'
  },
  [EMOTIONS.SAD]: {
    name: 'Color Garden',
    id: 'color-garden',
    description: 'A calming pattern completion game where every correct match blooms a beautiful virtual garden.',
    color: '#3b82f6',
    bg: '#eff6ff',
    icon: 'Flower2',
    mode: 'brightpath'
  },
  [EMOTIONS.NEUTRAL]: {
    name: 'Brain Rush',
    id: 'brain-rush',
    description: 'A dynamic series of cognitive mini-challenges suitable for all age ranges.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: 'Zap',
    mode: 'brightpath'
  },
  [EMOTIONS.ANGRY]: {
    name: 'Calm Maze',
    id: 'calm-maze',
    description: 'A soothing maze navigation game with peaceful puzzle checkpoints and gentle pacing.',
    color: '#f97316',
    bg: '#fff7ed',
    icon: 'Compass',
    mode: 'brightpath'
  },
  [EMOTIONS.FRUSTRATED]: {
    name: 'Step-by-Step Puzzle',
    id: 'step-puzzle',
    description: 'A multi-stage progressive challenge breaking big puzzles into achievable stages with optional hints.',
    color: '#ec4899',
    bg: '#fdf2f8',
    icon: 'Puzzle',
    mode: 'brightpath'
  }
};

// =======================================================
// Ages 3–6: Early/Foundational Activity Mode (5 NEW GAMES)
// =======================================================
export const EARLY_GAME_RECOMMENDATIONS = {
  // 1. HAPPY → Bubble Pop
  [EMOTIONS.HAPPY]: {
    name: 'Bubble Pop',
    id: 'bubble-pop',
    description: 'Tap cheerful floating bubbles to pop them with sparkles, stars, and gentle sounds!',
    color: '#10b981',
    bg: '#ecfdf5',
    icon: 'Sparkles',
    mode: 'early'
  },
  // 2. SAD → Grow the Garden
  [EMOTIONS.SAD]: {
    name: 'Grow the Garden',
    id: 'grow-garden',
    description: 'Help sleepy little plants bloom into colorful flowers with sunshine and water drops!',
    color: '#3b82f6',
    bg: '#eff6ff',
    icon: 'Sun',
    mode: 'early'
  },
  // 3. ANGRY / FRUSTRATED → Balloon Smash
  [EMOTIONS.ANGRY]: {
    name: 'Balloon Smash',
    id: 'balloon-smash',
    description: 'Tap colorful floating balloons to smash and pop them in a fun, satisfying way!',
    color: '#f97316',
    bg: '#fff7ed',
    icon: 'Flame',
    mode: 'early'
  },
  [EMOTIONS.FRUSTRATED]: {
    name: 'Balloon Smash',
    id: 'balloon-smash',
    description: 'Tap colorful floating balloons to smash and pop them in a fun, satisfying way!',
    color: '#f97316',
    bg: '#fff7ed',
    icon: 'Flame',
    mode: 'early'
  },
  // 4. FEAR / SURPRISE → Find the Hidden Friend
  [EMOTIONS.FEAR]: {
    name: 'Find the Hidden Friend',
    id: 'hidden-friend',
    description: 'Play friendly peekaboo! Tap behind trees and clouds to find cute animal friends waving at you.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: 'Eye',
    mode: 'early'
  },
  [EMOTIONS.SURPRISE]: {
    name: 'Find the Hidden Friend',
    id: 'hidden-friend',
    description: 'Play friendly peekaboo! Tap behind trees and clouds to find cute animal friends waving at you.',
    color: '#8b5cf6',
    bg: '#f5f3ff',
    icon: 'Eye',
    mode: 'early'
  },
  // 5. NEUTRAL / CALM → Rainbow Builder
  [EMOTIONS.NEUTRAL]: {
    name: 'Rainbow Builder',
    id: 'rainbow-builder',
    description: 'Drag vibrant rainbow arcs into the sky to complete a beautiful shining rainbow.',
    color: '#06b6d4',
    bg: '#ecfeff',
    icon: 'CloudRain',
    mode: 'early'
  }
};

// Default export for backward compatibility
export const GAME_RECOMMENDATIONS = BRIGHTPATH_GAME_RECOMMENDATIONS;

/**
 * Get recommended activity details based on detected emotion AND child's age or mode.
 * - Ages 3–6 (or mode 'early'): 5 new early childhood games
 * - Ages 7–17 (or mode 'brightpath'): 5 existing BrightPath games
 */
export const getRecommendedGame = (emotion, ageOrMode = 'brightpath') => {
  let isEarly = false;

  if (typeof ageOrMode === 'number') {
    isEarly = ageOrMode >= 3 && ageOrMode <= 6;
  } else if (typeof ageOrMode === 'string') {
    isEarly = ageOrMode.toLowerCase() === 'early';
  }

  const catalog = isEarly ? EARLY_GAME_RECOMMENDATIONS : BRIGHTPATH_GAME_RECOMMENDATIONS;
  const fallback = isEarly ? EARLY_GAME_RECOMMENDATIONS[EMOTIONS.NEUTRAL] : BRIGHTPATH_GAME_RECOMMENDATIONS[EMOTIONS.NEUTRAL];

  return catalog[emotion] || fallback;
};

/**
 * Main facial emotion detection engine call.
 * Uses real client-side ML model when videoElement is active and demoEmotion is null.
 * Wording strictly references "Observed facial expression".
 */
export const detectFacialEmotion = async (videoElement, demoEmotion = null, options = {}) => {
  // 1. If Demo Mode is active
  if (demoEmotion) {
    return {
      status: 'SUCCESS',
      faceDetected: true,
      emotion: demoEmotion,
      confidence: 0.95,
      isDemo: true,
      timestamp: new Date().toISOString(),
      checkpoint: options.checkpoint || 'demo',
      label: 'Demo Mode — Simulated Expression'
    };
  }

  // 2. Real Web Camera facial expression analysis via local ML model
  if (videoElement) {
    try {
      const realResult = await analyzeCurrentExpression(videoElement, options);
      return realResult;
    } catch (e) {
      console.error("Real emotion detection error:", e);
      return {
        status: 'MODEL_ERROR',
        faceDetected: false,
        emotion: EMOTIONS.NEUTRAL,
        confidence: 0.0,
        timestamp: new Date().toISOString(),
        checkpoint: options.checkpoint || 'initial',
        label: 'Analysis Error',
        message: 'Could not perform facial expression analysis. Please try again.'
      };
    }
  }

  // Fallback if video element isn't provided
  return {
    status: 'CAMERA_ERROR',
    faceDetected: false,
    emotion: EMOTIONS.NEUTRAL,
    confidence: 0.0,
    timestamp: new Date().toISOString(),
    checkpoint: options.checkpoint || 'initial',
    label: 'Awaiting Active Camera',
    message: 'Please activate the webcam to run real expression analysis.'
  };
};

export { checkFacePresence, loadEmotionModel, waitForVideoReady };
