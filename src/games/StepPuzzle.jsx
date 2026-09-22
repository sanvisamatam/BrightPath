import React, { useState, useEffect, useMemo } from 'react';
import { Puzzle, Lightbulb, CheckCircle, RotateCcw, Award, HelpCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'brightminds_step_puzzle_completed_sessions';

const getCompletedSessionCount = () => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    return 0;
  }
};

const incrementCompletedSessionCount = () => {
  try {
    const current = getCompletedSessionCount();
    localStorage.setItem(STORAGE_KEY, String(current + 1));
  } catch (e) {}
};

// FULL 15 QUESTION POOL FOR STEP-BY-STEP PUZZLE (5 SETS OF 3 QUESTIONS EACH)
export const ALL_STEP_PUZZLES = [
  // --- SET 1 (Questions 1–3) ---
  {
    id: 1,
    stage: 1,
    title: 'Stage 1: Shape Match (Easy)',
    instruction: 'Select the missing puzzle piece that fits into the star cutout:',
    target: '⭐ Star Shape Cutout',
    options: ['🔴 Circle', '⭐ Star', '🟦 Square'],
    answer: '⭐ Star',
    hint: 'Look for the shape with 5 pointed tips!'
  },
  {
    id: 2,
    stage: 2,
    title: 'Stage 2: Pattern Bridge (Medium)',
    instruction: 'Complete the puzzle bridge sequence: Triangle → Square → Triangle → ?',
    target: '🔺 → 🟦 → 🔺 → ❓',
    options: ['🟦 Square', '🔴 Circle', '🔺 Triangle'],
    answer: '🟦 Square',
    hint: 'Triangles and Squares alternate back and forth!'
  },
  {
    id: 3,
    stage: 3,
    title: 'Stage 3: Multi-Piece Assembly (Mastery)',
    instruction: 'Which arrangement of 3 colored blocks equals Blue + Red + Green?',
    target: '🟦 + 🔴 + 🟢 = ?',
    options: ['🔴 + 🟢 + 🟦', '🟡 + 🔴 + 🟢', '🟦 + 🟦 + 🔴'],
    answer: '🔴 + 🟢 + 🟦',
    hint: 'The order can change, but the 3 colors must match Blue, Red, and Green!'
  },

  // --- SET 2 (Questions 4–6) ---
  {
    id: 4,
    stage: 1,
    title: 'Stage 1: Diamond Fit (Easy)',
    instruction: 'Select the piece that completes the diamond puzzle slot:',
    target: '🔷 Diamond Cutout',
    options: ['🔷 Diamond', '🟡 Hexagon', '🟢 Oval'],
    answer: '🔷 Diamond',
    hint: 'Find the tilted square with four sharp corners!'
  },
  {
    id: 5,
    stage: 2,
    title: 'Stage 2: Color Sequence (Medium)',
    instruction: 'Complete the color sequence: Red → Blue → Yellow → Red → Blue → ?',
    target: '🔴 → 🟦 → 🟡 → 🔴 → 🟦 → ❓',
    options: ['🟡 Yellow', '🟢 Green', '🔴 Red'],
    answer: '🟡 Yellow',
    hint: 'The pattern repeats Red, Blue, Yellow in order!'
  },
  {
    id: 6,
    stage: 3,
    title: 'Stage 3: Geometry Combine (Mastery)',
    instruction: 'Match the combined shape formed by joining two right triangles at their hypotenuse:',
    target: '📐 + 📐 = ?',
    options: ['🟦 Rectangle', '🔴 Circle', '🌙 Crescent'],
    answer: '🟦 Rectangle',
    hint: 'Two right triangles put together form a four-sided rectangle!'
  },

  // --- SET 3 (Questions 7–9) ---
  {
    id: 7,
    stage: 1,
    title: 'Stage 1: Lunar Slot (Easy)',
    instruction: 'Select the piece that fits into the crescent cutout:',
    target: '🌙 Crescent Moon Cutout',
    options: ['☀️ Sun', '🌙 Crescent', '⭐ Star'],
    answer: '🌙 Crescent',
    hint: 'Look for the curved moon shape!'
  },
  {
    id: 8,
    stage: 2,
    title: 'Stage 2: Size Progression (Medium)',
    instruction: 'Complete the size sequence: Small → Medium → Large → Small → ?',
    target: '🔸 → 🔶 → 🔶🔶 → 🔸 → ❓',
    options: ['🔶 Medium', '🔹 Small', '🔶🔶 Large'],
    answer: '🔶 Medium',
    hint: 'Sizes grow step-by-step from small to large!'
  },
  {
    id: 9,
    stage: 3,
    title: 'Stage 3: Cube Counter (Mastery)',
    instruction: 'Which combination equals 2 Red Cubes + 2 Blue Cubes?',
    target: '🔴🔴 + 🟦🟦 = ?',
    options: ['🔴 + 🔴 + 🟦 + 🟦', '🔴 + 🟦 + 🟢 + 🟡', '🟦 + 🟦 + 🟦 + 🔴'],
    answer: '🔴 + 🔴 + 🟦 + 🟦',
    hint: 'Count to make sure there are exactly 2 Reds and 2 Blues!'
  },

  // --- SET 4 (Questions 10–12) ---
  {
    id: 10,
    stage: 1,
    title: 'Stage 1: Hexagon Frame (Easy)',
    instruction: 'Select the missing piece for the hexagon puzzle frame:',
    target: '⬡ Hexagon Frame',
    options: ['⬡ Hexagon', '🔺 Triangle', '🔴 Circle'],
    answer: '⬡ Hexagon',
    hint: 'Count the 6 straight sides of the shape!'
  },
  {
    id: 11,
    stage: 2,
    title: 'Stage 2: Rotation Wheel (Medium)',
    instruction: 'Complete the direction sequence: Up → Right → Down → Left → Up → ?',
    target: '⬆️ → ➡️ → ⬇️ → ⬅️ → ⬆️ → ❓',
    options: ['➡️ Right', '⬅️ Left', '⬇️ Down'],
    answer: '➡️ Right',
    hint: 'The arrow turns clockwise: Up, Right, Down, Left!'
  },
  {
    id: 12,
    stage: 3,
    title: 'Stage 3: Fraction Arc (Mastery)',
    instruction: 'Which 3-piece puzzle completes a full circle from three 120-degree arcs?',
    target: '⅓ + ⅓ + ⅓ = ?',
    options: ['1 Full Circle 🟢', '2 Circles 🟢🟢', 'Half Circle 🌓'],
    answer: '1 Full Circle 🟢',
    hint: 'Three equal third-parts put together make one whole circle!'
  },

  // --- SET 5 (Questions 13–15) ---
  {
    id: 13,
    stage: 1,
    title: 'Stage 1: Pentagon Fit (Easy)',
    instruction: 'Select the piece that fits the pentagon cutout:',
    target: '⬠ Pentagon Cutout',
    options: ['⬠ Pentagon', '💎 Gem', '🟦 Square'],
    answer: '⬠ Pentagon',
    hint: 'Look for the house-like shape with 5 sides!'
  },
  {
    id: 14,
    stage: 2,
    title: 'Stage 2: Star Counter (Medium)',
    instruction: 'Complete the number-shape pattern: 1 Star → 2 Stars → 3 Stars → ?',
    target: '⭐ → ⭐⭐ → ⭐⭐⭐ → ❓',
    options: ['⭐⭐⭐⭐ 4 Stars', '⭐ 1 Star', '⭐⭐ 2 Stars'],
    answer: '⭐⭐⭐⭐ 4 Stars',
    hint: 'Add one more star at each step!'
  },
  {
    id: 15,
    stage: 3,
    title: 'Stage 3: Grid Builder (Mastery)',
    instruction: 'Combine 4 equal square tiles to build a larger square:',
    target: '▫️▫️▫️▫️ = ?',
    options: ['Large 2x2 Square ⬛', 'Long 1x4 Strip ➖', 'Triangle 🔺'],
    answer: 'Large 2x2 Square ⬛',
    hint: 'Arranging 4 small squares in 2 rows of 2 creates a bigger square!'
  }
];

export const StepPuzzle = ({ onComplete }) => {
  // Determine active 3-question set index based on completed sessions counter
  const [completedSessionsCount, setCompletedSessionsCount] = useState(getCompletedSessionCount);
  
  const currentSetIndex = useMemo(() => {
    return completedSessionsCount % 5;
  }, [completedSessionsCount]);

  const activePuzzles = useMemo(() => {
    const startIndex = currentSetIndex * 3;
    return ALL_STEP_PUZZLES.slice(startIndex, startIndex + 3);
  }, [currentSetIndex]);

  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsCount, setHintsCount] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && !isGameOver) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver]);

  const startGame = () => {
    setIsPlaying(true);
    setCurrentStageIndex(0);
    setAttempts(0);
    setHintsCount(0);
    setElapsedSeconds(0);
    setIsGameOver(false);
    setFeedback(null);
    setShowHintModal(false);
  };

  const handleSelectOption = (opt) => {
    if (!isPlaying || feedback) return;

    setAttempts((prev) => prev + 1);
    setSelectedOpt(opt);
    const puzzle = activePuzzles[currentStageIndex];

    if (opt === puzzle.answer) {
      setFeedback({ type: 'success', text: 'Great job! Stage completed!' });

      setTimeout(() => {
        setFeedback(null);
        setSelectedOpt(null);
        if (currentStageIndex + 1 < activePuzzles.length) {
          setCurrentStageIndex((prev) => prev + 1);
        } else {
          finishGame(attempts + 1, hintsCount);
        }
      }, 1200);
    } else {
      setFeedback({ type: 'error', text: 'Almost there! Take a deep breath and try another option.' });
      setTimeout(() => {
        setFeedback(null);
        setSelectedOpt(null);
      }, 1800);
    }
  };

  const handleUseHint = () => {
    setHintsCount((prev) => prev + 1);
    setShowHintModal(true);
  };

  const finishGame = (totalAttempts, hintsUsed) => {
    setIsGameOver(true);
    setIsPlaying(false);

    // Increment persistent session counter upon successful completion
    incrementCompletedSessionCount();
    setCompletedSessionsCount(prev => prev + 1);

    try {
      confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
    } catch (e) {}

    const totalTime = elapsedSeconds || 1;
    const accuracy = Math.max(50, Math.round((activePuzzles.length / Math.max(activePuzzles.length, totalAttempts)) * 100));
    const score = Math.min(100, Math.max(50, Math.round(100 - (totalAttempts - activePuzzles.length) * 8 - (hintsUsed * 5))));

    if (onComplete) {
      onComplete({
        score: score,
        accuracy: accuracy,
        responseTime: Number((totalTime / activePuzzles.length).toFixed(1)),
        completionTime: totalTime,
        mistakes: Math.max(0, totalAttempts - activePuzzles.length),
        hintsUsed: hintsUsed
      });
    }
  };

  const puzzle = activePuzzles[currentStageIndex];

  return (
    <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-frustrated" style={{ marginBottom: '0.4rem' }}>
            <Puzzle size={14} /> Recommended for Encouraging Mastery (Set {currentSetIndex + 1} of 5)
          </span>
          <h2 style={{ fontSize: '1.6rem' }}>Step-by-Step Puzzle</h2>
        </div>

        {isPlaying && (
          <button onClick={handleUseHint} className="btn btn-outline" style={{ borderColor: '#f43f5e', color: '#be185d', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Lightbulb size={16} />
            <span>Need a Hint?</span>
          </button>
        )}
      </div>

      {!isPlaying && !isGameOver && (
        <div style={{ padding: '2rem 1.5rem', background: '#fdf2f8', borderRadius: 'var(--radius-md)', margin: '1rem 0', border: '1px solid #fbcfe8' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#ec4899', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Puzzle size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', color: '#9d174d', marginBottom: '0.5rem' }}>One Step at a Time — Set {currentSetIndex + 1}</h3>
          <p style={{ fontSize: '0.95rem', color: '#be185d', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            Break big challenges into small, easy stages. Take your time, hints are always available whenever you want them!
          </p>

          <button onClick={startGame} className="btn btn-primary btn-lg" style={{ background: '#ec4899' }}>
            <ArrowRight size={20} />
            <span>Start Step-by-Step Puzzle</span>
          </button>
        </div>
      )}

      {isPlaying && puzzle && (
        <div>
          {/* Progress Bar */}
          <div style={{ background: '#fce7f3', borderRadius: '9999px', height: '10px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ background: '#ec4899', height: '100%', width: `${((currentStageIndex + 1) / activePuzzles.length) * 100}%`, transition: 'width 0.4s ease' }}></div>
          </div>

          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#be185d', textTransform: 'uppercase' }}>
              {puzzle.title}
            </span>

            <h3 style={{ fontSize: '1.25rem', margin: '0.75rem 0 1rem 0', color: '#1e293b' }}>
              {puzzle.instruction}
            </h3>

            <div style={{ background: '#fdf2f8', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontSize: '1.6rem', fontWeight: 700, margin: '1rem 0', border: '1px dashed #fbcfe8', color: '#9d174d' }}>
              {puzzle.target}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginTop: '1.25rem' }}>
              {puzzle.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="btn btn-outline"
                  style={{
                    padding: '1rem',
                    fontSize: '1.1rem',
                    borderColor: selectedOpt === opt ? '#ec4899' : undefined,
                    background: selectedOpt === opt ? '#fdf2f8' : undefined
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {feedback && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fff1f2',
                color: feedback.type === 'success' ? '#15803d' : '#9f1239',
                fontWeight: 600
              }}>
                {feedback.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && puzzle && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ textAlign: 'center' }}>
            <Lightbulb size={36} color="#eab308" style={{ margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Friendly Hint</h4>
            <p style={{ fontSize: '1rem', color: 'var(--text-main)', margin: '1rem 0' }}>
              {puzzle.hint}
            </p>
            <button onClick={() => setShowHintModal(false)} className="btn btn-primary">
              Got It, Thanks!
            </button>
          </div>
        </div>
      )}

      {isGameOver && (
        <div style={{ padding: '2.5rem 1.5rem', background: '#fdf2f8', borderRadius: 'var(--radius-md)', border: '2px solid #fbcfe8', margin: '1.5rem 0' }}>
          <Award size={48} color="#ec4899" style={{ margin: '0 auto 0.5rem auto' }} />
          <h3 style={{ fontSize: '1.8rem', color: '#9d174d', marginBottom: '0.5rem' }}>All Stages Accomplished!</h3>
          <p style={{ color: '#be185d', fontSize: '1rem', marginBottom: '1.5rem' }}>
            You broke down every step and succeeded! Set {currentSetIndex + 1} completed!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8' }}>
              <span style={{ fontSize: '0.8rem', color: '#9d174d' }}>Score</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#9d174d' }}>{100}</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8' }}>
              <span style={{ fontSize: '0.8rem', color: '#9d174d' }}>Attempts</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#9d174d' }}>{attempts}</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8' }}>
              <span style={{ fontSize: '0.8rem', color: '#9d174d' }}>Hints Used</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#9d174d' }}>{hintsCount}</div>
            </div>
          </div>

          <button onClick={startGame} className="btn btn-primary btn-lg" style={{ background: '#ec4899' }}>
            <RotateCcw size={20} />
            <span>Play Next Set (Set {(currentSetIndex % 5) + 1})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default StepPuzzle;
