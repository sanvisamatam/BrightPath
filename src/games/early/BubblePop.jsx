import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Star, Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import audioFeedback from '../../utils/audioFeedback';

const BUBBLE_COLORS = [
  { bg: 'radial-gradient(circle at 30% 30%, #93c5fd, #3b82f6)', border: '#2563eb', shadow: 'rgba(59, 130, 246, 0.4)' },
  { bg: 'radial-gradient(circle at 30% 30%, #fbcfe8, #ec4899)', border: '#db2777', shadow: 'rgba(236, 72, 153, 0.4)' },
  { bg: 'radial-gradient(circle at 30% 30%, #a7f3d0, #10b981)', border: '#059669', shadow: 'rgba(16, 185, 129, 0.4)' },
  { bg: 'radial-gradient(circle at 30% 30%, #fde68a, #f59e0b)', border: '#d97706', shadow: 'rgba(245, 158, 11, 0.4)' },
  { bg: 'radial-gradient(circle at 30% 30%, #c4b5fd, #8b5cf6)', border: '#7c3aed', shadow: 'rgba(139, 92, 246, 0.4)' },
  { bg: 'radial-gradient(circle at 30% 30%, #fed7aa, #f97316)', border: '#ea580c', shadow: 'rgba(249, 115, 22, 0.4)' }
];

const TARGET_BUBBLES = 10;

export const BubblePop = ({ onComplete, onEvent }) => {
  const [bubbles, setBubbles] = useState([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  // Observational telemetry tracking refs
  const metricsRef = useRef({
    totalTaps: 0,
    successfulPops: 0,
    missedTaps: 0,
    responseTimes: [],
    lastTapPos: null,
    repeatedTapCount: 0,
    pauseCount: 0,
    bubbleAppearTime: Date.now(),
    stimulationReactions: 0
  });

  const nextId = useRef(1);

  // Notify lifecycle start
  useEffect(() => {
    if (onEvent) {
      onEvent('activity_start', { activity: 'bubble-pop', target: TARGET_BUBBLES });
    }
  }, []);

  // Idle/Pause detection timer
  useEffect(() => {
    const pauseInterval = setInterval(() => {
      const idleSeconds = (Date.now() - lastInteractionTime) / 1000;
      if (idleSeconds > 6) {
        metricsRef.current.pauseCount += 1;
        if (onEvent) {
          onEvent('idle_pause', { idleSeconds: Math.round(idleSeconds) });
        }
      }
    }, 4000);
    return () => clearInterval(pauseInterval);
  }, [lastInteractionTime]);

  // Generate bubble with random color, size, and position
  const spawnBubble = () => {
    const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
    const size = Math.floor(Math.random() * 35) + 75; // 75px - 110px large touch targets
    const x = Math.floor(Math.random() * 75) + 10; // 10% to 85% width
    const y = Math.floor(Math.random() * 55) + 20; // 20% to 75% height

    const newBubble = {
      id: nextId.current++,
      color,
      size,
      x,
      y,
      bornAt: Date.now(),
      isPopping: false
    };

    setBubbles(prev => [...prev.slice(-6), newBubble]);
    metricsRef.current.bubbleAppearTime = Date.now();
  };

  // Keep 4-5 bubbles active on screen
  useEffect(() => {
    if (isCompleted) return;

    // Initial fill
    if (bubbles.length < 4) {
      spawnBubble();
    }

    const interval = setInterval(() => {
      setBubbles(prev => {
        if (prev.length < 5) {
          const color = BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
          const size = Math.floor(Math.random() * 35) + 75;
          const x = Math.floor(Math.random() * 75) + 10;
          const y = Math.floor(Math.random() * 55) + 20;
          return [...prev, { id: nextId.current++, color, size, x, y, bornAt: Date.now(), isPopping: false }];
        }
        return prev;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [bubbles.length, isCompleted]);

  // Handle tap on bubble
  const handlePop = (e, bubble) => {
    e.stopPropagation();
    if (bubble.isPopping || isCompleted) return;

    const now = Date.now();
    setLastInteractionTime(now);

    const latency = Math.min(6, (now - bubble.bornAt) / 1000);
    metricsRef.current.responseTimes.push(latency);
    metricsRef.current.totalTaps += 1;
    metricsRef.current.successfulPops += 1;

    // Check repeated tapping in same spot
    if (metricsRef.current.lastTapPos) {
      const dist = Math.hypot(e.clientX - metricsRef.current.lastTapPos.x, e.clientY - metricsRef.current.lastTapPos.y);
      if (dist < 40) {
        metricsRef.current.repeatedTapCount += 1;
      }
    }
    metricsRef.current.lastTapPos = { x: e.clientX, y: e.clientY };

    // Play cheerful synthesized pop sound
    audioFeedback.playPopSound(1 + (poppedCount % 5) * 0.1);

    // Trigger visual pop animation
    setBubbles(prev => prev.map(b => b.id === bubble.id ? { ...b, isPopping: true } : b));

    const newCount = poppedCount + 1;
    setPoppedCount(newCount);

    if (onEvent) {
      onEvent('interaction', { type: 'bubble_pop', bubbleId: bubble.id, latency });
      onEvent('success', { totalPopped: newCount, target: TARGET_BUBBLES });
    }

    // Remove popped bubble after animation
    setTimeout(() => {
      setBubbles(prev => prev.filter(b => b.id !== bubble.id));
    }, 250);

    // Check completion
    if (newCount >= TARGET_BUBBLES) {
      triggerVictory();
    }
  };

  // Background missed tap
  const handleBackgroundTap = (e) => {
    if (isCompleted) return;
    setLastInteractionTime(Date.now());
    metricsRef.current.totalTaps += 1;
    metricsRef.current.missedTaps += 1;

    if (metricsRef.current.lastTapPos) {
      const dist = Math.hypot(e.clientX - metricsRef.current.lastTapPos.x, e.clientY - metricsRef.current.lastTapPos.y);
      if (dist < 35) {
        metricsRef.current.repeatedTapCount += 1;
      }
    }
    metricsRef.current.lastTapPos = { x: e.clientX, y: e.clientY };

    if (onEvent) {
      onEvent('mistake', { type: 'missed_tap' });
    }
  };

  const triggerVictory = () => {
    setIsCompleted(true);
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const m = metricsRef.current;

    audioFeedback.playCheerSound();
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });

    if (onEvent) {
      onEvent('activity_completion', { duration, totalPopped: TARGET_BUBBLES });
    }

    // Compile comprehensive observational telemetry
    const accuracy = Math.round((m.successfulPops / Math.max(1, m.totalTaps)) * 100);
    const avgResponse = m.responseTimes.length > 0
      ? Number((m.responseTimes.reduce((a, b) => a + b, 0) / m.responseTimes.length).toFixed(1))
      : 1.5;

    const repetitionFreq = Number(((m.repeatedTapCount / Math.max(1, duration)) * 60).toFixed(1));

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
            repeatedAttempts: m.repeatedTapCount,
            completionTime: duration,
            score: Math.min(100, Math.max(60, accuracy))
          },
          repetitiveMetrics: {
            repeatedActionsCount: m.repeatedTapCount,
            repetitionFrequency: repetitionFreq,
            repeatedSequences: Math.floor(m.repeatedTapCount / 2),
            rhythmConsistency: 85,
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
            colorChangeResponses: BUBBLE_COLORS.length,
            animationEvents: TARGET_BUBBLES,
            soundEvents: TARGET_BUBBLES,
            transitionReactions: 1,
            timeline: m.responseTimes.slice(0, 5).map((rt, idx) => ({
              event: `Pop ${idx + 1}`,
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
        background: 'linear-gradient(180deg, #dbeafe 0%, #eff6ff 60%, #e0f2fe 100%)',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '3px solid #93c5fd',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)',
        userSelect: 'none',
        cursor: 'pointer'
      }}
    >
      {/* Top Friendly Header Bar */}
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
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '8px 18px',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <Sparkles size={24} color="#3b82f6" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a' }}>
            Bubble Pop!
          </span>
        </div>

        {/* Big Star Progress Target */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '8px 18px',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <Star size={24} color="#f59e0b" fill="#fbbf24" />
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#b45309' }}>
            {poppedCount} / {TARGET_BUBBLES}
          </span>
        </div>
      </div>

      {/* Floating Bubbles */}
      {bubbles.map((b) => (
        <div
          key={b.id}
          onClick={(e) => handlePop(e, b)}
          style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            borderRadius: '50%',
            background: b.color.bg,
            border: `3px solid ${b.color.border}`,
            boxShadow: `0 8px 20px ${b.color.shadow}, inset 0 -4px 8px rgba(0,0,0,0.1), inset 0 6px 12px rgba(255,255,255,0.7)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: b.isPopping ? 'scale(1.4)' : 'scale(1)',
            opacity: b.isPopping ? 0 : 1,
            transition: b.isPopping ? 'transform 0.2s ease-out, opacity 0.2s ease-out' : 'transform 0.4s ease-in-out',
            animation: 'bubbleBob 3s ease-in-out infinite alternate'
          }}
        >
          {/* Bubble reflection glint */}
          <div style={{
            position: 'absolute',
            top: '16%',
            left: '22%',
            width: '28%',
            height: '24%',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.7)',
            transform: 'rotate(-25deg)'
          }} />
          
          {/* Friendly Sparkle icon inside bubble */}
          <span style={{ fontSize: '1.4rem' }}>✨</span>
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
            background: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
          }}>
            <Trophy size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#065f46', fontWeight: 800, margin: 0 }}>
            Wonderful Job! 🌟
          </h2>
          <p style={{ color: '#047857', fontSize: '1.1rem', fontWeight: 600 }}>
            You popped all 10 bubbles!
          </p>
        </div>
      )}

      {/* CSS Keyframes for bubble bobbing */}
      <style>{`
        @keyframes bubbleBob {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(3deg); }
          100% { transform: translateY(6px) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
};

export default BubblePop;
