import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, RotateCcw, Award, CheckCircle2, Clock, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const CARD_SYMBOLS = [
  { id: 'star', symbol: '⭐', name: 'Star' },
  { id: 'planet', symbol: '🪐', name: 'Planet' },
  { id: 'gem', symbol: '💎', name: 'Gem' },
  { id: 'rocket', symbol: '🚀', name: 'Rocket' },
  { id: 'sun', symbol: '☀️', name: 'Sun' },
  { id: 'lightning', symbol: '⚡', name: 'Lightning' },
  { id: 'moon', symbol: '🌙', name: 'Moon' },
  { id: 'compass', symbol: '🧭', name: 'Compass' }
];

export const MemoryQuest = ({ onComplete }) => {
  const [difficulty, setDifficulty] = useState('medium'); // 'easy' (4 pairs), 'medium' (6 pairs), 'hard' (8 pairs)
  const [cards, setCards] = useState([]);
  const [flippedIndex, setFlippedIndex] = useState([]);
  const [matchedIds, setMatchedIds] = useState([]);
  const [flipsCount, setFlipsCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize deck
  const initGame = (diff = difficulty) => {
    let pairCount = 6;
    if (diff === 'easy') pairCount = 4;
    if (diff === 'hard') pairCount = 8;

    const selectedSymbols = CARD_SYMBOLS.slice(0, pairCount);
    const deck = [...selectedSymbols, ...selectedSymbols]
      .map((item, index) => ({
        uniqueId: index,
        pairId: item.id,
        symbol: item.symbol,
        name: item.name
      }))
      .sort(() => Math.random() - 0.5);

    setCards(deck);
    setFlippedIndex([]);
    setMatchedIds([]);
    setFlipsCount(0);
    setMistakes(0);
    setElapsedSeconds(0);
    setStartTime(null);
    setIsPlaying(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    initGame();
  }, [difficulty]);

  // Timer loop
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
    setStartTime(Date.now());
  };

  const handleCardClick = (index) => {
    if (!isPlaying || isGameOver || flippedIndex.includes(index) || matchedIds.includes(cards[index].uniqueId)) {
      return;
    }

    const newFlipped = [...flippedIndex, index];
    setFlippedIndex(newFlipped);
    setFlipsCount((prev) => prev + 1);

    if (newFlipped.length === 2) {
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];

      if (cards[idx1].pairId === cards[idx2].pairId) {
        // Match found!
        const newMatched = [...matchedIds, cards[idx1].uniqueId, cards[idx2].uniqueId];
        setMatchedIds(newMatched);
        setFlippedIndex([]);

        // Check victory
        if (newMatched.length === cards.length) {
          endGame(newMatched.length / 2, flipsCount + 1, mistakes);
        }
      } else {
        // Mismatch
        setMistakes((prev) => prev + 1);
        setTimeout(() => {
          setFlippedIndex([]);
        }, 900);
      }
    }
  };

  const endGame = (pairsCount, totalFlips, totalMistakes) => {
    setIsGameOver(true);
    setIsPlaying(false);
    
    // Confetti effect
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    const totalSeconds = elapsedSeconds || 1;
    const minFlipsPossible = pairsCount * 2;
    const accuracy = Math.max(30, Math.round((minFlipsPossible / totalFlips) * 100));
    const score = Math.min(100, Math.max(40, Math.round(100 - (totalMistakes * 5) - (totalSeconds * 0.5))));
    const avgResponseTime = Number((totalSeconds / totalFlips).toFixed(1));

    if (onComplete) {
      onComplete({
        score: score,
        accuracy: accuracy,
        responseTime: avgResponseTime,
        completionTime: totalSeconds,
        mistakes: totalMistakes,
        hintsUsed: 0
      });
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-happy" style={{ marginBottom: '0.4rem' }}>
            <Sparkles size={14} /> Recommended for Happy Mood
          </span>
          <h2 style={{ fontSize: '1.6rem' }}>Memory Quest</h2>
        </div>

        {/* Difficulty Controls */}
        {!isPlaying && !isGameOver && (
          <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`btn ${difficulty === level ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem', textTransform: 'capitalize' }}
              >
                {level}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions before start */}
      {!isPlaying && !isGameOver && (
        <div style={{ padding: '2rem 1.5rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', margin: '1rem 0' }}>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Flip cards to find all matching pairs! Focus on remembering card locations to solve it in the fewest moves.
          </p>
          <button onClick={startGame} className="btn btn-primary btn-lg">
            <Trophy size={20} />
            <span>Start Memory Quest</span>
          </button>
        </div>
      )}

      {/* Active Game Stats & Board */}
      {isPlaying && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f0fdf4', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #bbf7d0' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TIME</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={16} /> {elapsedSeconds}s
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MATCHES</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>
                {matchedIds.length / 2} / {cards.length / 2}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FLIPS</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#166534' }}>
                {flipsCount}
              </div>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cards.length === 8 ? 4 : (cards.length === 12 ? 4 : 4)}, 1fr)`,
            gap: '1rem',
            margin: '1.5rem 0'
          }}>
            {cards.map((card, idx) => {
              const isFlipped = flippedIndex.includes(idx) || matchedIds.includes(card.uniqueId);
              return (
                <button
                  key={card.uniqueId}
                  onClick={() => handleCardClick(idx)}
                  style={{
                    height: '110px',
                    borderRadius: 'var(--radius-md)',
                    border: isFlipped ? '2px solid #10b981' : '2px solid #cbd5e1',
                    background: isFlipped ? '#ffffff' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    fontSize: '2.5rem',
                    cursor: isFlipped ? 'default' : 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isFlipped ? 'rotateY(180deg)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                >
                  <span style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none' }}>
                    {isFlipped ? card.symbol : '❓'}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Completion Overlay */}
      {isGameOver && (
        <div style={{ padding: '2.5rem 1.5rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', border: '2px solid #a7f3d0', margin: '1.5rem 0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Award size={36} />
          </div>
          
          <h3 style={{ fontSize: '1.8rem', color: '#065f46', marginBottom: '0.5rem' }}>Quest Completed! Great Job!</h3>
          <p style={{ color: '#047857', fontSize: '1rem', marginBottom: '1.5rem' }}>
            You matched all cards with wonderful focus and speed!
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#047857' }}>Completion Time</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#065f46' }}>{elapsedSeconds}s</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#047857' }}>Total Moves</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#065f46' }}>{flipsCount}</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#047857' }}>Mistakes</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#065f46' }}>{mistakes}</div>
            </div>
          </div>

          <button onClick={() => initGame()} className="btn btn-primary btn-lg">
            <RotateCcw size={20} />
            <span>Play Again</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryQuest;
