/**
 * Game Analysis Configuration
 * Defines game-specific facial emotion analysis schedules during gameplay.
 * Avoids hardcoding analysis timing inside individual game components.
 */

export const GAME_ANALYSIS_CONFIG = {
  'memory-quest': {
    gameId: 'memory-quest',
    name: 'Memory Quest',
    description: 'Analyzes facial expression at session start and victory completion.',
    checkpoints: [
      { id: 'start', label: 'Session Start', timeSeconds: 0 },
      { id: 'complete', label: 'Quest Completion', triggerOnComplete: true }
    ]
  },
  'color-garden': {
    gameId: 'color-garden',
    name: 'Color Garden',
    description: 'Analyzes facial expression at start, mid-way garden blooming, and completion.',
    checkpoints: [
      { id: 'start', label: 'Session Start', timeSeconds: 0 },
      { id: 'midgame', label: 'Garden Progress Checkpoint', timeSeconds: 30 },
      { id: 'complete', label: 'Garden Complete', triggerOnComplete: true }
    ]
  },
  'brain-rush': {
    gameId: 'brain-rush',
    name: 'Brain Rush',
    description: 'Analyzes facial expression at start, stage transitions, and completion.',
    checkpoints: [
      { id: 'start', label: 'Session Start', timeSeconds: 0 },
      { id: 'checkpoint-1', label: 'Cognitive Speed Checkpoint 1', timeSeconds: 20 },
      { id: 'checkpoint-2', label: 'Cognitive Speed Checkpoint 2', timeSeconds: 40 },
      { id: 'complete', label: 'Challenge Finish', triggerOnComplete: true }
    ]
  },
  'calm-maze': {
    gameId: 'calm-maze',
    name: 'Calm Maze',
    description: 'Analyzes facial expression at start, maze navigation milestones, and completion.',
    checkpoints: [
      { id: 'start', label: 'Session Start', timeSeconds: 0 },
      { id: 'maze-halfway', label: 'Maze Midpoint Checkpoint', timeSeconds: 25 },
      { id: 'complete', label: 'Maze Navigation Complete', triggerOnComplete: true }
    ]
  },
  'step-puzzle': {
    gameId: 'step-puzzle',
    name: 'Step-by-Step Puzzle',
    description: 'Analyzes facial expression at start, major puzzle stage transitions, and completion.',
    checkpoints: [
      { id: 'start', label: 'Session Start', timeSeconds: 0 },
      { id: 'stage-1', label: 'Step 1 Clear', timeSeconds: 25 },
      { id: 'stage-2', label: 'Step 2 Clear', timeSeconds: 50 },
      { id: 'complete', label: 'Full Puzzle Assembly', triggerOnComplete: true }
    ]
  }
};

/**
 * Gets the analysis schedule configuration for a given game ID
 */
export const getGameAnalysisConfig = (gameId) => {
  return GAME_ANALYSIS_CONFIG[gameId] || GAME_ANALYSIS_CONFIG['brain-rush'];
};
