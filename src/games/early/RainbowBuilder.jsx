import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Sun, Star, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import audioFeedback from '../../utils/audioFeedback';

const RAINBOW_ARCS = [
  { id: 'red', name: 'Red', color: '#ef4444', label: '1. Red' },
  { id: 'orange', name: 'Orange', color: '#f97316', label: '2. Orange' },
  { id: 'yellow', name: 'Yellow', color: '#eab308', label: '3. Yellow' },
  { id: 'green', name: 'Green', color: '#10b981', label: '4. Green' },
  { id: 'blue', name: 'Blue', color: '#3b82f6', label: '5. Blue' },
  { id: 'purple', name: 'Purple', color: '#8b5cf6', label: '6. Purple' }
];

export const RainbowBuilder = ({ onComplete, onEvent }) => {
  // Arcs placed in order: array of placed color ids
  const [placedArcs, setPlacedArcs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const metricsRef = useRef({
    totalAttempts: 0,
    successfulPlacements: 0,
    missedPlacements: 0,
    responseTimes: [],
    lastAttemptTimestamp: Date.now(),
    repeatedActionCount: 0,
    lastTriedColor: null,
    pauseCount: 0
  });

  // Next expected arc index
  const nextExpectedIndex = placedArcs.length;

  useEffect(() => {
    if (onEvent) {
      onEvent('activity_start', { activity: 'rainbow-builder', totalArcs: RAINBOW_ARCS.length });
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

  const handleArcSelect = (arc, arcIndex) => {
    if (isCompleted || placedArcs.includes(arc.id)) return;

    const now = Date.now();
    setLastInteractionTime(now);

    const latency = Math.min(6, (now - metricsRef.current.lastAttemptTimestamp) / 1000);
    metricsRef.current.responseTimes.push(latency);
    metricsRef.current.lastAttemptTimestamp = now;
    metricsRef.current.totalAttempts += 1;

    if (metricsRef.current.lastTriedColor === arc.id) {
      metricsRef.current.repeatedActionCount += 1;
    }
    metricsRef.current.lastTriedColor = arc.id;

    // Check if this arc is the next in sequence
    if (arcIndex === nextExpectedIndex) {
      metricsRef.current.successfulPlacements += 1;

      // Play chime note for musical scale
      audioFeedback.playChimeSound(nextExpectedIndex);

      const updated = [...placedArcs, arc.id];
      setPlacedArcs(updated);

      if (onEvent) {
        onEvent('interaction', { type: 'placed_arc', color: arc.name, latency });
        onEvent('success', { placedCount: updated.length, total: RAINBOW_ARCS.length });
      }

      if (updated.length === RAINBOW_ARCS.length) {
        triggerVictory();
      }
    } else {
      // Missed placement (tapped out of sequence)
      metricsRef.current.missedPlacements += 1;
      audioFeedback.playPopSound(0.65);

      if (onEvent) {
        onEvent('mistake', { type: 'incorrect_arc_sequence', attempted: arc.name, expected: RAINBOW_ARCS[nextExpectedIndex].name });
      }
    }
  };

  const triggerVictory = () => {
    setIsCompleted(true);
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const m = metricsRef.current;

    audioFeedback.playCheerSound();
    confetti({ particleCount: 80, spread: 100, origin: { y: 0.5 } });

    if (onEvent) {
      onEvent('animation_change', { rainbowComplete: true, sunshine: true });
      onEvent('activity_completion', { duration, completed: true });
    }

    const accuracy = Math.round((m.successfulPlacements / Math.max(1, m.totalAttempts)) * 100);
    const avgResponse = m.responseTimes.length > 0
      ? Number((m.responseTimes.reduce((a, b) => a + b, 0) / m.responseTimes.length).toFixed(1))
      : 1.8;

    const repetitionFreq = Number(((m.repeatedActionCount / Math.max(1, duration)) * 60).toFixed(1));

    setTimeout(() => {
      if (onComplete) {
        onComplete({
          score: 100,
          accuracy: accuracy,
          responseTime: avgResponse,
          completionTime: duration,
          mistakes: m.missedPlacements,
          hintsUsed: 0,
          motorMetrics: {
            tapAccuracy: accuracy,
            dragAccuracy: 100,
            avgResponseTime: avgResponse,
            missedInteractions: m.missedPlacements,
            repeatedAttempts: m.repeatedActionCount,
            completionTime: duration,
            score: Math.min(100, Math.max(65, accuracy))
          },
          repetitiveMetrics: {
            repeatedActionsCount: m.repeatedActionCount,
            repetitionFrequency: repetitionFreq,
            repeatedSequences: Math.floor(m.repeatedActionCount / 2),
            rhythmConsistency: 90,
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
            colorChangeResponses: 6,
            animationEvents: 8,
            soundEvents: m.totalAttempts,
            transitionReactions: 1,
            timeline: m.responseTimes.map((rt, idx) => ({
              event: `Arc ${idx + 1}`,
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
    }, 2000);
  };

  const nextColor = RAINBOW_ARCS[nextExpectedIndex];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '520px',
      background: 'linear-gradient(180deg, #cffafe 0%, #e0f2fe 50%, #f0f9ff 100%)',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '3px solid #7dd3fc',
      boxShadow: '0 10px 25px -5px rgba(14, 165, 233, 0.2)',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      {/* Top Bar with Title and Arc Counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.94)',
          padding: '8px 18px',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <Sparkles size={22} color="#0284c7" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0369a1' }}>
            Rainbow Builder
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
            {placedArcs.length} / {RAINBOW_ARCS.length}
          </span>
        </div>
      </div>

      {/* Center Sky Canvas with Building Rainbow */}
      <div style={{
        position: 'relative',
        height: '240px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: 5
      }}>
        {/* Smiling Clouds on Left & Right */}
        <div style={{ position: 'absolute', left: '20px', bottom: '10px', fontSize: '4.5rem', animation: 'cloudBob 4s ease-in-out infinite alternate' }}>
          ☁️
        </div>
        <div style={{ position: 'absolute', right: '20px', bottom: '10px', fontSize: '4.5rem', animation: 'cloudBob 4s ease-in-out infinite alternate-reverse' }}>
          ☁️
        </div>

        {/* Sun in background upon completion */}
        {isCompleted && (
          <div style={{
            position: 'absolute',
            top: '10px',
            fontSize: '4.5rem',
            animation: 'sunSpin 12s linear infinite'
          }}>
            ☀️
          </div>
        )}

        {/* Rainbow Arcs Stack */}
        <div style={{
          position: 'relative',
          width: '320px',
          height: '160px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center'
        }}>
          {RAINBOW_ARCS.map((arc, idx) => {
            const isPlaced = placedArcs.includes(arc.id);
            const radius = 160 - idx * 22;

            return (
              <div
                key={arc.id}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: `${radius * 2}px`,
                  height: `${radius}px`,
                  borderRadius: `${radius}px ${radius}px 0 0`,
                  border: isPlaced ? `16px solid ${arc.color}` : '14px dashed #bae6fd',
                  borderBottom: 'none',
                  opacity: isPlaced ? 1 : 0.45,
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: isPlaced ? `0 -4px 12px ${arc.color}40` : 'none'
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom Color Palette: Large Tap/Placement Targets */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.94)',
        padding: '14px',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0369a1' }}>
            {nextColor ? `Next color: ${nextColor.label}` : 'Rainbow Completed! 🌈'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Tap the matching color arc
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px'
        }}>
          {RAINBOW_ARCS.map((arc, idx) => {
            const isAlreadyPlaced = placedArcs.includes(arc.id);
            const isNext = idx === nextExpectedIndex;

            return (
              <button
                key={arc.id}
                type="button"
                disabled={isAlreadyPlaced || isCompleted}
                onClick={() => handleArcSelect(arc, idx)}
                style={{
                  height: '56px',
                  borderRadius: '16px',
                  background: isAlreadyPlaced ? '#e2e8f0' : arc.color,
                  border: isNext ? '3px solid #0f172a' : '2px solid rgba(0,0,0,0.1)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: isAlreadyPlaced ? 'default' : 'pointer',
                  opacity: isAlreadyPlaced ? 0.35 : 1,
                  transform: isNext ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  boxShadow: isNext ? '0 6px 14px rgba(0,0,0,0.2)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isAlreadyPlaced ? '✓' : arc.name}
              </button>
            );
          })}
        </div>
      </div>

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
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.3)'
          }}>
            <Trophy size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#0369a1', fontWeight: 800, margin: 0 }}>
            Shining Rainbow! 🌈
          </h2>
          <p style={{ color: '#0284c7', fontSize: '1.1rem', fontWeight: 600 }}>
            You built all 6 beautiful rainbow colors!
          </p>
        </div>
      )}

      <style>{`
        @keyframes cloudBob {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-8px); }
        }
        @keyframes sunSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RainbowBuilder;
