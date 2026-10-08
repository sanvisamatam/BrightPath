import React, { useState, useEffect } from 'react';
import { Compass, Wind, Heart, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

// 7x7 Grid Maze Matrix (0 = path, 1 = soft wall, 2 = checkpoint, 3 = goal)
const MAZE_GRID = [
  [0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 0],
  [0, 1, 1, 2, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 3]
];

export const CalmMaze = ({ onComplete }) => {
  const [playerPos, setPlayerPos] = useState({ r: 0, c: 0 });
  const [wrongTurns, setWrongTurns] = useState(0);
  const [activeCheckpoint, setActiveCheckpoint] = useState(null);
  const [breathCount, setBreathCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    let timer;
    if (isPlaying && !isGameOver && !activeCheckpoint) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, activeCheckpoint]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlaying || isGameOver || activeCheckpoint) return;
      if (e.key === 'ArrowUp') movePlayer(-1, 0);
      if (e.key === 'ArrowDown') movePlayer(1, 0);
      if (e.key === 'ArrowLeft') movePlayer(0, -1);
      if (e.key === 'ArrowRight') movePlayer(0, 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, isPlaying, isGameOver, activeCheckpoint]);

  const startGame = () => {
    setIsPlaying(true);
    setPlayerPos({ r: 0, c: 0 });
    setWrongTurns(0);
    setActiveCheckpoint(null);
    setBreathCount(0);
    setElapsedSeconds(0);
    setIsGameOver(false);
  };

  const movePlayer = (dr, dc) => {
    const newR = playerPos.r + dr;
    const newC = playerPos.c + dc;

    // Check bounds
    if (newR < 0 || newR >= 7 || newC < 0 || newC >= 7) {
      setWrongTurns((prev) => prev + 1);
      return;
    }

    const tile = MAZE_GRID[newR][newC];
    if (tile === 1) {
      // Wall collision
      setWrongTurns((prev) => prev + 1);
      return;
    }

    setPlayerPos({ r: newR, c: newC });

    // Checkpoint tile
    if (tile === 2) {
      setActiveCheckpoint('breathing');
    }

    // Goal reached
    if (tile === 3) {
      finishGame(wrongTurns);
    }
  };

  const completeCheckpoint = () => {
    setActiveCheckpoint(null);
  };

  const finishGame = (totalWrongTurns) => {
    setIsGameOver(true);
    setIsPlaying(false);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const totalTime = elapsedSeconds || 1;
    const accuracy = Math.max(50, Math.round((10 / (10 + totalWrongTurns)) * 100));
    const score = Math.min(100, Math.max(50, Math.round(100 - (totalWrongTurns * 4))));

    if (onComplete) {
      onComplete({
        score: score,
        accuracy: accuracy,
        responseTime: Number((totalTime / 15).toFixed(1)),
        completionTime: totalTime,
        mistakes: totalWrongTurns,
        hintsUsed: 0
      });
    }
  };

  return (
    <div className="glass-card" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
      <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-angry" style={{ marginBottom: '0.4rem' }}>
            <Compass size={14} /> Recommended for Soothing Calming
          </span>
          <h2 style={{ fontSize: '1.6rem' }}>Calm Maze</h2>
        </div>

        {isPlaying && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffedd5', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', color: '#c2410c', border: '1px solid #fed7aa' }}>
            <Wind size={16} />
            <span style={{ fontWeight: 600 }}>Pacing: Peaceful & Steady</span>
          </div>
        )}
      </div>

      {!isPlaying && !isGameOver && (
        <div style={{ padding: '2rem 1.5rem', background: '#ecfdf5', borderRadius: 'var(--radius-md)', margin: '1rem 0', border: '1px solid #a7f3d0' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Compass size={32} />
          </div>

          <h3 style={{ fontSize: '1.25rem', color: '#0f766e', marginBottom: '0.5rem' }}>Navigate the Peaceful Path</h3>
          <p style={{ fontSize: '0.95rem', color: '#115e59', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
            Guide your tranquil avatar through the maze using arrow keys or screen controls. Reach the calming checkpoints along the way!
          </p>

          <button onClick={startGame} className="btn btn-secondary btn-lg" style={{ background: '#0d9488' }}>
            <Wind size={20} />
            <span>Enter Calm Maze</span>
          </button>
        </div>
      )}

      {isPlaying && (
        <div>
          {/* Maze Grid Container */}
          <div style={{
            display: 'inline-grid',
            gridTemplateColumns: 'repeat(7, 44px)',
            gridTemplateRows: 'repeat(7, 44px)',
            gap: '6px',
            background: '#ccfbf1',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid #5eead4',
            margin: '1rem auto'
          }}>
            {MAZE_GRID.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isPlayer = playerPos.r === rIdx && playerPos.c === cIdx;
                const isWall = cell === 1;
                const isCheckpoint = cell === 2;
                const isGoal = cell === 3;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{
                      borderRadius: '8px',
                      background: isPlayer ? '#0d9488' : (isWall ? '#334155' : (isCheckpoint ? '#fef08a' : (isGoal ? '#86efac' : '#ffffff'))),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      transition: 'all 0.2s ease',
                      boxShadow: isPlayer ? '0 0 10px rgba(13,148,136,0.6)' : undefined
                    }}
                  >
                    {isPlayer && '🧘'}
                    {!isPlayer && isCheckpoint && '🌸'}
                    {!isPlayer && isGoal && '🕊️'}
                  </div>
                );
              })
            )}
          </div>

          {/* D-Pad Touch Controls */}
          <div style={{ margin: '1rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 48px)', gap: '6px', justifyContent: 'center' }}>
              <div></div>
              <button onClick={() => movePlayer(-1, 0)} className="btn btn-outline" style={{ padding: 0, height: '48px' }}><ArrowUp size={20} /></button>
              <div></div>
              <button onClick={() => movePlayer(0, -1)} className="btn btn-outline" style={{ padding: 0, height: '48px' }}><ArrowLeft size={20} /></button>
              <button onClick={() => movePlayer(1, 0)} className="btn btn-outline" style={{ padding: 0, height: '48px' }}><ArrowDown size={20} /></button>
              <button onClick={() => movePlayer(0, 1)} className="btn btn-outline" style={{ padding: 0, height: '48px' }}><ArrowRight size={20} /></button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Use Screen Buttons or Keyboard Arrow Keys
            </p>
          </div>
        </div>
      )}

      {/* Checkpoint Modal */}
      {activeCheckpoint === 'breathing' && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ textAlign: 'center' }}>
            <Wind size={40} color="#0d9488" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ color: '#0f766e', marginBottom: '0.5rem' }}>Mindful Pause Checkpoint</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Take a slow, deep breath in... and exhale gently. Notice how calm your focus becomes.
            </p>

            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0d9488', marginBottom: '1.25rem' }}>
              Breaths Taken: {breathCount} / 3
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              {breathCount < 3 ? (
                <button onClick={() => setBreathCount((prev) => prev + 1)} className="btn btn-secondary" style={{ background: '#0d9488' }}>
                  <Heart size={18} />
                  <span>Take Slow Breath</span>
                </button>
              ) : (
                <button onClick={completeCheckpoint} className="btn btn-primary">
                  <span>Continue Maze Path</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div style={{ padding: '2.5rem 1.5rem', background: '#f0fdf4', borderRadius: 'var(--radius-md)', border: '2px solid #bbf7d0', margin: '1.5rem 0' }}>
          <Award size={48} color="#059669" style={{ margin: '0 auto 0.5rem auto' }} />
          <h3 style={{ fontSize: '1.8rem', color: '#065f46', marginBottom: '0.5rem' }}>Maze Completed Peacefully!</h3>
          <p style={{ color: '#047857', fontSize: '1rem', marginBottom: '1.5rem' }}>
            You completed the maze with calm focus and gentle navigation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#047857' }}>Completion Time</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#065f46' }}>{elapsedSeconds}s</div>
            </div>
            <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
              <span style={{ fontSize: '0.8rem', color: '#047857' }}>Wall Contact / Corrections</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#065f46' }}>{wrongTurns}</div>
            </div>
          </div>

          <button onClick={startGame} className="btn btn-secondary btn-lg" style={{ background: '#0d9488' }}>
            <RotateCcw size={20} />
            <span>Play Calm Maze Again</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CalmMaze;
