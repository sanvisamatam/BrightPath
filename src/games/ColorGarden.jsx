import React, { useState, useEffect } from 'react';
import { Flower2, Sun, Sparkles, CheckCircle2, RotateCcw, Award, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

const PATTERN_CHALLENGES = [
  {
    id: 1,
    sequence: ['🔴', '🔵', '🟡', '🔴', '🔵'],
    question: 'What color comes next in this pattern?',
    options: ['🟡', '🔴', '🔵', '🟢'],
    correct: '🟡',
    hint: 'Notice how Red, Blue, Yellow repeat!'
  },
  {
    id: 2,
    sequence: ['🌸', '🌻', '🌸', '🌻', '🌸'],
    question: 'Complete the flower pattern:',
    options: ['🌻', '🌺', '🌸', '🌷'],
    correct: '🌻',
    hint: 'Pink flower, Yellow flower, Pink flower...'
  },
  {
    id: 3,
    sequence: ['🟢', '🟢', '🔴', '🟢', '🟢'],
    question: 'What completes this garden row?',
    options: ['🔴', '🟢', '🔵', '🟡'],
    correct: '🔴',
    hint: 'Two Greens, One Red...'
  },
  {
    id: 4,
    sequence: ['🦋', '🌷', '🦋', '🌷', '🦋'],
    question: 'Help the butterfly land on the right spot:',
    options: ['🌷', '🦋', '🌸', '🐝'],
    correct: '🌷',
    hint: 'Butterfly, Tulip, Butterfly, Tulip...'
  },
  {
    id: 5,
    sequence: ['🔴', '🟡', '🟢', '🔴', '🟡'],
    question: 'What comes next in the rainbow sequence?',
    options: ['🟢', '🔴', '🟡', '🔵'],
    correct: '🟢',
    hint: 'Red, Yellow, Green, Red, Yellow...'
  }
];

const GARDEN_STAGES = ['🌱 Seedling', '🌿 Sprout', '🌷 Blooming Flower', '🌺 Garden Bed', '🦋 Vibrant Paradise'];

export const ColorGarden = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gardenLevel, setGardenLevel] = useState(0);
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
    setCurrentStep(0);
    setScore(0);
    setMistakes(0);
    setGardenLevel(0);
    setElapsedSeconds(0);
    setIsGameOver(false);
    setFeedback(null);
  };

  const handleSelectOption = (option) => {
    if (!isPlaying || feedback) return;

    setSelectedAnswer(option);
    const currentChallenge = PATTERN_CHALLENGES[currentStep];

    if (option === currentChallenge.correct) {
      // Correct!
      setFeedback({ type: 'success', text: 'Beautiful! Your garden blooms brighter!' });
      setScore((prev) => prev + 20);
      setGardenLevel((prev) => Math.min(GARDEN_STAGES.length - 1, prev + 1));

      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
        if (currentStep + 1 < PATTERN_CHALLENGES.length) {
          setCurrentStep((prev) => prev + 1);
        } else {
          finishGame(score + 20, mistakes);
        }
      }, 1200);
    } else {
      // Incorrect
      setMistakes((prev) => prev + 1);
      setFeedback({ type: 'error', text: `Keep trying! Hint: ${currentChallenge.hint}` });

      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
      }, 1800);
    }
  };

  const finishGame = (finalScore, totalMistakes) => {
    setIsGameOver(true);
    setIsPlaying(false);

    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}

    const totalTime = elapsedSeconds || 1;
    const accuracy = Math.max(40, Math.round(((PATTERN_CHALLENGES.length) / (PATTERN_CHALLENGES.length + totalMistakes)) * 100));
    const avgResponse = Number((totalTime / PATTERN_CHALLENGES.length).toFixed(1));

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

  const currentChallenge = PATTERN_CHALLENGES[currentStep];

  return (
    <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-sad" style={{ marginBottom: '0.4rem' }}>
            <Flower2 size={14} /> Recommended for Soothing Comfort
          </span>
          <h2 style={{ fontSize: '1.6rem' }}>Color Garden</h2>
        </div>

        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#eff6ff', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', color: '#1e40af', border: '1px solid #bfdbfe' }}>
            <Sun size={18} />
            <span style={{ fontWeight: 600 }}>Garden: {GARDEN_STAGES[gardenLevel]}</span>
          </div>
        )}
      </div>

      {/* Intro */}
      {!isPlaying && !isGameOver && (
        <div style={{ padding: '2rem 1.5rem', background: '#f0f9ff', borderRadius: 'var(--radius-md)', margin: '1rem 0', border: '1px solid #bae6fd' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🌱 → 🌸 → 🦋</div>
          <h3 style={{ fontSize: '1.25rem', color: '#0369a1', marginBottom: '0.5rem' }}>Grow Your Peaceful Garden</h3>
          <p style={{ fontSize: '0.95rem', color: '#0c4a6e', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            Solve pattern challenges to help your virtual garden bloom with vibrant colors and flowers. Takes your time and enjoy each step!
          </p>

          <button onClick={startGame} className="btn btn-secondary btn-lg" style={{ background: '#0284c7' }}>
            <Flower2 size={20} />
            <span>Start Color Garden</span>
          </button>
        </div>
      )}

      {/* Gameplay */}
      {isPlaying && (
        <div>
          {/* Garden Visual Canvas */}
          <div style={{
            background: 'linear-gradient(180deg, #e0f2fe 0%, #dcfce7 100%)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            margin: '1rem 0',
            border: '2px solid #93c5fd',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#0369a1', marginBottom: '0.5rem', fontWeight: 600 }}>
              YOUR BLOOMING GARDEN STATUS
            </div>
            <div style={{ fontSize: '3.2rem', minHeight: '60px', transition: 'all 0.5s ease' }}>
              {gardenLevel === 0 && '🌱 🟤 🟤 🟤'}
              {gardenLevel === 1 && '🌱 🌿 🟤 🟤'}
              {gardenLevel === 2 && '🌱 🌿 🌷 🟤'}
              {gardenLevel === 3 && '🌱 🌿 🌷 🌺'}
              {gardenLevel >= 4 && '🌻 🌷 🌺 🦋 🌸 🐝'}
            </div>
          </div>

          {/* Sequence Challenge */}
          <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>CHALLENGE {currentStep + 1} OF {PATTERN_CHALLENGES.length}</span>
            <h3 style={{ fontSize: '1.2rem', margin: '0.5rem 0 1rem 0' }}>{currentChallenge.question}</h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', fontSize: '2.5rem', margin: '1.25rem 0', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px dashed #cbd5e1' }}>
              {currentChallenge.sequence.map((item, idx) => (
                <span key={idx}>{item}</span>
              ))}
              <span style={{ color: '#0284c7', fontWeight: 700 }}>❓</span>
            </div>

            {/* Options */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
              {currentChallenge.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  className="btn btn-outline"
                  style={{
                    fontSize: '2.2rem',
                    padding: '0.75rem',
                    borderColor: selectedAnswer === opt ? '#0284c7' : undefined,
                    background: selectedAnswer === opt ? '#e0f2fe' : undefined
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Feedback alert */}
            {feedback && (
              <div style={{
                marginTop: '1.25rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: feedback.type === 'success' ? '#ecfdf5' : '#fee2e2',
                color: feedback.type === 'success' ? '#065f46' : '#9f1239',
                fontWeight: 600,
                fontSize: '0.95rem'
              }}>
                {feedback.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completion */}
      {isGameOver && (
        <div style={{ padding: '2.5rem 1.5rem', background: '#eff6ff', borderRadius: 'var(--radius-md)', border: '2px solid #bfdbfe', margin: '1.5rem 0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '0.5rem' }}>🌺 🦋 🌻</div>
          <h3 style={{ fontSize: '1.8rem', color: '#1e40af', marginBottom: '0.5rem' }}>Garden Fully Bloomed!</h3>
          <p style={{ color: '#1d4ed8', fontSize: '1rem', marginBottom: '1.5rem' }}>
            Look at how beautiful your garden is! You solved all pattern challenges with calm determination.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>Challenges Solved</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e40af' }}>{PATTERN_CHALLENGES.length}</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>Score</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e40af' }}>{score}</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.8rem', color: '#1d4ed8' }}>Completion Time</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e40af' }}>{elapsedSeconds}s</div>
            </div>
          </div>

          <button onClick={startGame} className="btn btn-secondary btn-lg" style={{ background: '#0284c7' }}>
            <RotateCcw size={20} />
            <span>Grow Another Garden</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorGarden;
