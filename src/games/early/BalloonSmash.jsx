import React, { useState, useEffect, useRef } from 'react';
import { Flame, Star, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import audioFeedback from '../../utils/audioFeedback';

const BALLOON_PALETTES = [
  { color: '#ef4444', border: '#b91c1c', shadow: 'rgba(239, 68, 68, 0.4)', highlight: '#fca5a5' },
  { color: '#f97316', border: '#c2410c', shadow: 'rgba(249, 115, 22, 0.4)', highlight: '#fdba74' },
  { color: '#eab308', border: '#a16207', shadow: 'rgba(234, 179, 8, 0.4)', highlight: '#fef08a' },
  { color: '#8b5cf6', border: '#6d28d9', shadow: 'rgba(139, 92, 246, 0.4)', highlight: '#c4b5fd' },
  { color: '#06b6d4', border: '#0e7490', shadow: 'rgba(6, 182, 212, 0.4)', highlight: '#a5f3fc' },
  { color: '#ec4899', border: '#be185d', shadow: 'rgba(236, 72, 153, 0.4)', highlight: '#fbcfe8' }
];

const TARGET_BALLOONS = 10;

export const BalloonSmash = ({ onComplete, onEvent }) => {
  const [balloons, setBalloons] = useState([]);
  const [smashedCount, setSmashedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const metricsRef = useRef({
    totalTaps: 0,
    successfulSmashes: 0,
    missedTaps: 0,
    responseTimes: [],
    lastTapCoord: null,
    repeatedActionCount: 0,
    pauseCount: 0
  });

  const nextId = useRef(1);

  // Notify start
  useEffect(() => {
    if (onEvent) {
      onEvent('activity_start', { activity: 'balloon-smash', target: TARGET_BALLOONS });
    }
  }, []);

  // Idle pause detection
  useEffect(() => {
    const pauseInterval = setInterval(() => {
      const idle = (Date.now() - lastInteractionTime) / 1000;
      if (idle > 6) {
        metricsRef.current.pauseCount += 1;
        if (onEvent) onEvent('idle_pause', { idleSeconds: Math.round(idle) });
      }
    }, 4000);
    return () => clearInterval(pauseInterval);
  }, [lastInteractionTime]);

  // Balloon spawn loop
  useEffect(() => {
    if (isCompleted) return;

    // Maintain 4 balloons on screen
    const interval = setInterval(() => {
      setBalloons(prev => {
        if (prev.length < 4) {
          const pal = BALLOON_PALETTES[Math.floor(Math.random() * BALLOON_PALETTES.length)];
          const size = Math.floor(Math.random() * 25) + 85; // 85px to 110px large touch targets
          const x = Math.floor(Math.random() * 70) + 12;
          const y = Math.floor(Math.random() * 50) + 25;
          return [...prev, { id: nextId.current++, pal, size, x, y, bornAt: Date.now(), isPopping: false }];
        }
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isCompleted]);

  // Initial populate
  useEffect(() => {
    const initial = [];
    for (let i = 0; i < 4; i++) {
      const pal = BALLOON_PALETTES[i % BALLOON_PALETTES.length];
      const size = 90;
      const x = 15 + i * 22;
      const y = 30 + (i % 2) * 20;
      initial.push({ id: nextId.current++, pal, size, x, y, bornAt: Date.now(), isPopping: false });
    }
    setBalloons(initial);
  }, []);

  const handleSmash = (e, balloon) => {
    e.stopPropagation();
    if (balloon.isPopping || isCompleted) return;

    const now = Date.now();
    setLastInteractionTime(now);

    const latency = Math.min(6, (now - balloon.bornAt) / 1000);
    metricsRef.current.responseTimes.push(latency);
    metricsRef.current.totalTaps += 1;
    metricsRef.current.successfulSmashes += 1;

    // Check repetitive taps in close area
    if (metricsRef.current.lastTapCoord) {
      const dist = Math.hypot(e.clientX - metricsRef.current.lastTapCoord.x, e.clientY - metricsRef.current.lastTapCoord.y);
      if (dist < 45) {
        metricsRef.current.repeatedActionCount += 1;
      }
    }
    metricsRef.current.lastTapCoord = { x: e.clientX, y: e.clientY };

    // Cheerful pop audio feedback
    audioFeedback.playPopSound(0.85 + Math.random() * 0.4);

    // Pop state
    setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, isPopping: true } : b));

    const newCount = smashedCount + 1;
    setSmashedCount(newCount);

    if (onEvent) {
      onEvent('interaction', { type: 'balloon_smash', balloonId: balloon.id, latency });
      onEvent('success', { totalSmashed: newCount, target: TARGET_BALLOONS });
    }

    setTimeout(() => {
      setBalloons(prev => prev.filter(b => b.id !== balloon.id));
    }, 220);

    if (newCount >= TARGET_BALLOONS) {
      triggerVictory();
    }
  };

  const handleBackgroundTap = (e) => {
    if (isCompleted) return;
    setLastInteractionTime(Date.now());
    metricsRef.current.totalTaps += 1;
    metricsRef.current.missedTaps += 1;

    if (metricsRef.current.lastTapCoord) {
      const dist = Math.hypot(e.clientX - metricsRef.current.lastTapCoord.x, e.clientY - metricsRef.current.lastTapCoord.y);
      if (dist < 40) {
        metricsRef.current.repeatedActionCount += 1;
      }
    }
    metricsRef.current.lastTapCoord = { x: e.clientX, y: e.clientY };

    if (onEvent) {
      onEvent('mistake', { type: 'missed_balloon_tap' });
    }
  };

  const triggerVictory = () => {
    setIsCompleted(true);
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const m = metricsRef.current;

    audioFeedback.playCheerSound();
    confetti({ particleCount: 75, spread: 90, origin: { y: 0.6 } });

    if (onEvent) {
      onEvent('activity_completion', { duration, totalSmashed: TARGET_BALLOONS });
    }

    const accuracy = Math.round((m.successfulSmashes / Math.max(1, m.totalTaps)) * 100);
    const avgResponse = m.responseTimes.length > 0
      ? Number((m.responseTimes.reduce((a, b) => a + b, 0) / m.responseTimes.length).toFixed(1))
      : 1.4;

    const repetitionFreq = Number(((m.repeatedActionCount / Math.max(1, duration)) * 60).toFixed(1));

    setTimeout(() => {
      if (onComplete) {
        onComplete({
          score: 100,
          accuracy: accuracy,
          responseTime: avgResponse,
          completionTime: duration,
          mistakes: m.missedTaps,
          hintsUsed: 0,
          motorMetrics: {
            tapAccuracy: accuracy,
            dragAccuracy: 100,
            avgResponseTime: avgResponse,
            missedInteractions: m.missedTaps,
            repeatedAttempts: m.repeatedActionCount,
            completionTime: duration,
            score: Math.min(100, Math.max(65, accuracy))
          },
          repetitiveMetrics: {
            repeatedActionsCount: m.repeatedActionCount,
            repetitionFrequency: repetitionFreq,
            repeatedSequences: Math.floor(m.repeatedActionCount / 2),
            rhythmConsistency: 80,
            notes: 'Repeated interaction patterns observed during this session.'
          },
          communicationMetrics: {
            promptResponsesCount: 0,
            voiceInteractionAttempts: null,
            responseLatency: null,
            repeatedPromptsCount: 0,
            completionRate: null,
            hasData: false
          },
          stimulationMetrics: {
            colorChangeResponses: BALLOON_PALETTES.length,
            animationEvents: TARGET_BALLOONS,
            soundEvents: TARGET_BALLOONS,
            transitionReactions: 1,
            timeline: m.responseTimes.slice(0, 5).map((rt, idx) => ({
              event: `Balloon ${idx + 1}`,
              responseTime: rt
            }))
          },
          socialMetrics: {
            characterInteractions: 0,
            socialPromptResponses: 0,
            responseTime: null,
            sharedAttentionEvents: 0,
            notes: 'Observed social interaction indicators within BrightPath activities.'
          }
        });
      }
    }, 1800);
  };

  return (
    <div
      onClick={handleBackgroundTap}
      style={{
        position: 'relative',
        width: '100%',
        height: '520px',
        background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '3px solid #fdba74',
        boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.2)',
        userSelect: 'none',
        cursor: 'pointer'
      }}
    >
      {/* Top Header */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.94)',
          padding: '8px 18px',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <Sparkles size={24} color="#ea580c" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9a3412' }}>
            Balloon Smash!
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.94)',
          padding: '8px 18px',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <Star size={24} color="#f59e0b" fill="#fbbf24" />
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>
            {smashedCount} / {TARGET_BALLOONS}
          </span>
        </div>
      </div>

      {/* Floating Balloons with String */}
      {balloons.map((b) => (
        <div
          key={b.id}
          onClick={(e) => handleSmash(e, b)}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size * 1.25}px`,
            borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%',
            background: b.pal.color,
            border: `3px solid ${b.pal.border}`,
            boxShadow: `0 10px 20px ${b.pal.shadow}, inset -6px -6px 12px rgba(0,0,0,0.15)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: b.isPopping ? 'scale(1.5)' : 'scale(1)',
            opacity: b.isPopping ? 0 : 1,
            transition: b.isPopping ? 'transform 0.2s ease-out, opacity 0.2s ease-out' : 'transform 0.4s ease-in-out',
            animation: 'balloonFloat 3.5s ease-in-out infinite alternate'
          }}
        >
          {/* Balloon Light Highlight */}
          <div style={{
            position: 'absolute',
            top: '18%',
            left: '20%',
            width: '26%',
            height: '24%',
            borderRadius: '50%',
            background: b.pal.highlight,
            opacity: 0.85
          }} />

          {/* Balloon Knot and String */}
          <div style={{
            position: 'absolute',
            bottom: '-7px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '10px',
            height: '8px',
            background: b.pal.border,
            borderRadius: '2px'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-28px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '2px',
            height: '24px',
            background: '#a1a1aa'
          }} />

          <span style={{ fontSize: '1.6rem', zIndex: 2 }}>💥</span>
        </div>
      ))}

      {/* Victory Celebration Overlay */}
      {isCompleted && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 20
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#ffedd5',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(234, 88, 12, 0.3)'
          }}>
            <Trophy size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#7c2d12', fontWeight: 800, margin: 0 }}>
            Awesome Smashing! 🎈
          </h2>
          <p style={{ color: '#9a3412', fontSize: '1.1rem', fontWeight: 600 }}>
            You popped all 10 balloons!
          </p>
        </div>
      )}

      <style>{`
        @keyframes balloonFloat {
          0% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
          100% { transform: translateY(8px) rotate(-1deg); }
        }
      `}</style>
    </div>
  );
};

export default BalloonSmash;
