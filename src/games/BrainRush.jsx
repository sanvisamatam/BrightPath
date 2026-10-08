import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Brain, Trophy, RotateCcw, CheckCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'brightminds_brain_rush_completed_sessions';

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

// FULL 25 QUESTION POOL FOR BRAIN RUSH (5 SETS OF 5 QUESTIONS EACH)
export const ALL_BRAIN_RUSH_CHALLENGES = [
  // --- SET 1 (Questions 1–5) ---
  {
    id: 1,
    type: 'Number Sequence',
    question: 'What is the next number in this sequence? 2, 4, 8, 16, ?',
    options: ['20', '24', '32', '64'],
    answer: '32',
    explanation: 'Each number doubles!'
  },
  {
    id: 2,
    type: 'Shape Pattern',
    question: 'Find the missing shape: 🟢 🔺 🟦 🟢 🔺 ?',
    options: ['🟦', '🟢', '🔺', '⭐'],
    answer: '🟦',
    explanation: 'Circle, Triangle, Square sequence repeats!'
  },
  {
    id: 3,
    type: 'Odd One Out',
    question: 'Which item does NOT belong in this group?',
    options: ['🍎 Apple', '🍌 Banana', '🥕 Carrot', '🍇 Grape'],
    answer: '🥕 Carrot',
    explanation: 'Carrot is a vegetable; the others are fruits!'
  },
  {
    id: 4,
    type: 'Logic Puzzle',
    question: 'If ALL Cats have tails, and Whiskers is a cat, does Whiskers have a tail?',
    options: ['Yes, definitely', 'No', 'Only sometimes', 'Cannot tell'],
    answer: 'Yes, definitely',
    explanation: 'Whiskers is a cat, so Whiskers has a tail!'
  },
  {
    id: 5,
    type: 'Number Sequence',
    question: 'What comes next? 5, 10, 15, 20, ?',
    options: ['22', '25', '30', '35'],
    answer: '25',
    explanation: 'Counting up by 5s!'
  },

  // --- SET 2 (Questions 6–10) ---
  {
    id: 6,
    type: 'Number Sequence',
    question: 'What is the next number? 3, 6, 12, 24, ?',
    options: ['28', '36', '48', '50'],
    answer: '48',
    explanation: 'Multiply each number by 2!'
  },
  {
    id: 7,
    type: 'Shape Pattern',
    question: 'Complete the pattern: 🌟 🌙 🌟 🌙 🌟 ?',
    options: ['🌙', '🌟', '☀️', '💎'],
    answer: '🌙',
    explanation: 'Star and Moon alternate!'
  },
  {
    id: 8,
    type: 'Odd One Out',
    question: 'Which word does NOT belong?',
    options: ['🐶 Dog', '🐱 Cat', '🦅 Eagle', '🐹 Hamster'],
    answer: '🦅 Eagle',
    explanation: 'Eagle is a bird; the others are furry mammals!'
  },
  {
    id: 9,
    type: 'Logic Puzzle',
    question: 'All squares have 4 equal sides. Shape A is a square. How many equal sides does Shape A have?',
    options: ['3', '4', '5', '6'],
    answer: '4',
    explanation: 'Since Shape A is a square, it has 4 equal sides!'
  },
  {
    id: 10,
    type: 'Number Sequence',
    question: 'What is the next number? 100, 90, 80, 70, ?',
    options: ['65', '60', '50', '55'],
    answer: '60',
    explanation: 'Subtracting 10 at each step!'
  },

  // --- SET 3 (Questions 11–15) ---
  {
    id: 11,
    type: 'Number Sequence',
    question: 'What is the next number? 1, 3, 9, 27, ?',
    options: ['30', '54', '81', '90'],
    answer: '81',
    explanation: 'Multiply each number by 3!'
  },
  {
    id: 12,
    type: 'Shape Pattern',
    question: 'Find the missing symbol: 🟥 🟧 🟨 🟥 🟧 ?',
    options: ['🟨', '🟥', '🟧', '🟩'],
    answer: '🟨',
    explanation: 'Red, Orange, Yellow color sequence repeats!'
  },
  {
    id: 13,
    type: 'Odd One Out',
    question: 'Which object does NOT belong?',
    options: ['🚗 Car', '🚌 Bus', '✈️ Airplane', '🚚 Truck'],
    answer: '✈️ Airplane',
    explanation: 'Airplane flies in the air; the others drive on roads!'
  },
  {
    id: 14,
    type: 'Logic Puzzle',
    question: 'If all mammals breathe air, and dolphins are mammals, do dolphins breathe air?',
    options: ['Yes, definitely', 'No, they breathe water', 'Only when sleeping', 'Uncertain'],
    answer: 'Yes, definitely',
    explanation: 'Dolphins are mammals, so they breathe air!'
  },
  {
    id: 15,
    type: 'Number Sequence',
    question: 'What comes next? 2, 5, 8, 11, ?',
    options: ['13', '14', '15', '16'],
    answer: '14',
    explanation: 'Adding 3 to each number!'
  },

  // --- SET 4 (Questions 16–20) ---
  {
    id: 16,
    type: 'Number Sequence',
    question: 'What is the next number? 50, 45, 40, 35, ?',
    options: ['30', '25', '20', '32'],
    answer: '30',
    explanation: 'Subtracting 5 at each step!'
  },
  {
    id: 17,
    type: 'Shape Pattern',
    question: 'Complete the pattern: 🔺 🔻 🔺 🔻 🔺 ?',
    options: ['🔻', '🔺', '🟦', '🔴'],
    answer: '🔻',
    explanation: 'Upward and downward triangles alternate!'
  },
  {
    id: 18,
    type: 'Odd One Out',
    question: 'Which item does NOT belong?',
    options: ['🗼 Paris', '🗽 New York', '🏛️ Rome', '🍕 Pizza'],
    answer: '🍕 Pizza',
    explanation: 'Pizza is a food; the others are famous landmark cities!'
  },
  {
    id: 19,
    type: 'Logic Puzzle',
    question: 'Box X is bigger than Box Y. Box Y is bigger than Box Z. Which box is the largest?',
    options: ['Box X', 'Box Y', 'Box Z', 'They are equal'],
    answer: 'Box X',
    explanation: 'X > Y and Y > Z, so Box X is the largest!'
  },
  {
    id: 20,
    type: 'Number Sequence',
    question: 'What comes next? 4, 8, 12, 16, ?',
    options: ['18', '20', '22', '24'],
    answer: '20',
    explanation: 'Adding 4 (multiples of 4)!'
  },

  // --- SET 5 (Questions 21–25) ---
  {
    id: 21,
    type: 'Number Sequence',
    question: 'What is the next number? 1, 4, 9, 16, ?',
    options: ['20', '25', '30', '36'],
    answer: '25',
    explanation: 'Square numbers: 1x1, 2x2, 3x3, 4x4, 5x5 = 25!'
  },
  {
    id: 22,
    type: 'Shape Pattern',
    question: 'Find the missing shape: ⚽ 🏀 🏐 ⚽ 🏀 ?',
    options: ['🏐', '⚽', '🏀', '🎾'],
    answer: '🏐',
    explanation: 'Soccer ball, Basketball, Volleyball pattern repeats!'
  },
  {
    id: 23,
    type: 'Odd One Out',
    question: 'Which item does NOT belong?',
    options: ['🎻 Violin', '🎸 Guitar', '🎹 Piano', '🎺 Trumpet'],
    answer: '🎺 Trumpet',
    explanation: 'Trumpet is a brass instrument; the others are string/keyboard instruments!'
  },
  {
    id: 24,
    type: 'Logic Puzzle',
    question: 'If all squares are rectangles, and Shape B is a square, is Shape B a rectangle?',
    options: ['Yes, always', 'No, never', 'Only on weekends', 'Cannot determine'],
    answer: 'Yes, always',
    explanation: 'All squares are rectangles, so Shape B is a rectangle!'
  },
  {
    id: 25,
    type: 'Number Sequence',
    question: 'What comes next? 1, 2, 4, 7, 11, ?',
    options: ['15', '16', '18', '22'],
    answer: '16',
    explanation: 'Adding +1, +2, +3, +4, +5 (11 + 5 = 16)!'
  }
];

export const BrainRush = ({ onComplete }) => {
  // Determine active 5-question set index based on completed sessions counter
  const [completedSessionsCount, setCompletedSessionsCount] = useState(getCompletedSessionCount);
  
  const currentSetIndex = useMemo(() => {
    return completedSessionsCount % 5;
  }, [completedSessionsCount]);

  const activeChallenges = useMemo(() => {
    const startIndex = currentSetIndex * 5;
    return ALL_BRAIN_RUSH_CHALLENGES.slice(startIndex, startIndex + 5);
  }, [currentSetIndex]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
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
    setCurrentIndex(0);
    setScore(0);
    setMistakes(0);
    setElapsedSeconds(0);
    setIsGameOver(false);
    setFeedback(null);
  };

  const handleSelectOption = (opt) => {
    if (!isPlaying || feedback) return;

    setSelectedOpt(opt);
    const challenge = activeChallenges[currentIndex];

    if (opt === challenge.answer) {
      setFeedback({ type: 'success', text: `Correct! ${challenge.explanation}` });
      setScore((prev) => prev + 20);

      setTimeout(() => {
        setFeedback(null);
        setSelectedOpt(null);
        if (currentIndex + 1 < activeChallenges.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          finishGame(score + 20, mistakes);
        }
      }, 1200);
    } else {
      setMistakes((prev) => prev + 1);
      setFeedback({ type: 'error', text: `Not quite! ${challenge.explanation}` });

      setTimeout(() => {
        setFeedback(null);
        setSelectedOpt(null);
      }, 1800);
    }
  };

  const finishGame = (finalScore, totalMistakes) => {
    setIsGameOver(true);
    setIsPlaying(false);

    // Increment persistent session counter upon successful completion
    incrementCompletedSessionCount();
    setCompletedSessionsCount(prev => prev + 1);

    try {
      confetti({ particleCount: 85, spread: 75, origin: { y: 0.6 } });
    } catch (e) {}

    const totalTime = elapsedSeconds || 1;
    const accuracy = Math.max(35, Math.round(((activeChallenges.length) / (activeChallenges.length + totalMistakes)) * 100));
    const avgResponse = Number((totalTime / activeChallenges.length).toFixed(1));

    if (onComplete) {
      onComplete({
        score: finalScore,
        accuracy: accuracy,
        responseTime: avgResponse,
        completionTime: totalTime,
        mistakes: totalMistakes,
        hintsUsed: 0
      });
    }
  };

  const currentChallenge = activeChallenges[currentIndex];

  return (
    <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-neutral" style={{ marginBottom: '0.4rem' }}>
            <Zap size={14} /> Recommended for Neutral / Focused State (Set {currentSetIndex + 1} of 5)
          </span>
          <h2 style={{ fontSize: '1.6rem' }}>Brain Rush</h2>
        </div>

        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f5f3ff', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
            <Clock size={16} />
            <span style={{ fontWeight: 600 }}>{elapsedSeconds}s</span>
          </div>
        )}
      </div>

      {!isPlaying && !isGameOver && (
        <div style={{ padding: '2rem 1.5rem', background: '#faf5ff', borderRadius: 'var(--radius-md)', margin: '1rem 0', border: '1px solid #e9d5ff' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#c084fc', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Brain size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', color: '#6b21a8', marginBottom: '0.5rem' }}>Challenge Your Cognitive Skills — Set {currentSetIndex + 1}</h3>
          <p style={{ fontSize: '0.95rem', color: '#7e22ce', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
            Solve number series, shape logic, and pattern puzzles designed to boost mental agility and active engagement.
          </p>

          <button onClick={startGame} className="btn btn-primary btn-lg" style={{ background: '#8b5cf6' }}>
            <Zap size={20} />
            <span>Start Brain Rush</span>
          </button>
        </div>
      )}

      {isPlaying && currentChallenge && (
        <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1' }}>
          <div className="flex-between mb-2">
            <span className="badge" style={{ background: '#f3e8ff', color: '#6b21a8' }}>{currentChallenge.type}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Question {currentIndex + 1} of {activeChallenges.length}</span>
          </div>

          <h3 style={{ fontSize: '1.25rem', margin: '1rem 0 1.5rem 0', color: '#1e293b' }}>
            {currentChallenge.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {currentChallenge.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className="btn btn-outline"
                style={{
                  padding: '1rem',
                  fontSize: '1.1rem',
                  borderColor: selectedOpt === opt ? '#8b5cf6' : undefined,
                  background: selectedOpt === opt ? '#f5f3ff' : undefined,
                  justifyContent: 'flex-start'
                }}
              >
                <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#e9d5ff', color: '#6b21a8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>

          {feedback && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: feedback.type === 'success' ? '#f0fdf4' : '#fee2e2',
              color: feedback.type === 'success' ? '#15803d' : '#be123c',
              fontWeight: 600
            }}>
              {feedback.text}
            </div>
          )}
        </div>
      )}

      {isGameOver && (
        <div style={{ padding: '2.5rem 1.5rem', background: '#f5f3ff', borderRadius: 'var(--radius-md)', border: '2px solid #ddd6fe', margin: '1.5rem 0' }}>
          <Trophy size={48} color="#7c3aed" style={{ margin: '0 auto 0.5rem auto' }} />
          <h3 style={{ fontSize: '1.8rem', color: '#5b21b6', marginBottom: '0.5rem' }}>Brain Rush Complete!</h3>
          <p style={{ color: '#6d28d9', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Excellent cognitive processing speed and accuracy! Set {currentSetIndex + 1} completed!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd6fe' }}>
              <span style={{ fontSize: '0.8rem', color: '#6d28d9' }}>Score</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#5b21b6' }}>{score}</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd6fe' }}>
              <span style={{ fontSize: '0.8rem', color: '#6d28d9' }}>Time Taken</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#5b21b6' }}>{elapsedSeconds}s</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #ddd6fe' }}>
              <span style={{ fontSize: '0.8rem', color: '#6d28d9' }}>Mistakes</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#5b21b6' }}>{mistakes}</div>
            </div>
          </div>

          <button onClick={startGame} className="btn btn-primary btn-lg" style={{ background: '#8b5cf6' }}>
            <RotateCcw size={20} />
            <span>Play Next Set (Set {(currentSetIndex % 5) + 1})</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default BrainRush;
