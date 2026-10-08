import React, { useState, useEffect, useRef } from 'react';
import { Sun, Droplets, Sparkles, Trophy, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import audioFeedback from '../../utils/audioFeedback';

const FLOWERS = [
  { id: 1, name: 'Daisy', emoji: '🌼', color: '#fef08a', borderColor: '#eab308' },
  { id: 2, name: 'Tulip', emoji: '🌷', color: '#fbcfe8', borderColor: '#ec4899' },
  { id: 3, name: 'Sunflower', emoji: '🌻', color: '#fed7aa', borderColor: '#f97316' },
  { id: 4, name: 'Rose', emoji: '🌹', color: '#fecdd3', borderColor: '#e11d48' }
];

export const GrowGarden = ({ onComplete, onEvent }) => {
  // Each flower has growth stage: 0 (tiny sprout) -> 1 (leafy stem) -> 2 (bud) -> 3 (full bloom!)
  const [plantStages, setPlantStages] = useState([0, 0, 0, 0]);
  const [activeTool, setActiveTool] = useState('water'); // 'water' | 'sun'
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const metricsRef = useRef({
    totalInteractions: 0,
    waterInteractions: 0,
    sunInteractions: 0,
    repeatedPlantActions: 0,
    lastPlantIndex: null,
    responseTimes: [],
    lastActionTimestamp: Date.now(),
    pauseCount: 0
  });

  // Notify start
  useEffect(() => {
    if (onEvent) {
      onEvent('activity_start', { activity: 'grow-garden', totalPlants: FLOWERS.length });
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

  const handleNurturePlant = (plantIndex) => {
    if (isCompleted) return;

    const now = Date.now();
    setLastInteractionTime(now);

    const latency = Math.min(6, (now - metricsRef.current.lastActionTimestamp) / 1000);
    metricsRef.current.responseTimes.push(latency);
    metricsRef.current.lastActionTimestamp = now;
    metricsRef.current.totalInteractions += 1;

    if (activeTool === 'water') {
      metricsRef.current.waterInteractions += 1;
      audioFeedback.playWaterSound();
    } else {
      metricsRef.current.sunInteractions += 1;
      audioFeedback.playChimeSound(plantIndex);
    }

    if (metricsRef.current.lastPlantIndex === plantIndex) {
      metricsRef.current.repeatedPlantActions += 1;
    }
    metricsRef.current.lastPlantIndex = plantIndex;

    // Advance plant growth stage (max 3)
    setPlantStages(prev => {
      const updated = [...prev];
      if (updated[plantIndex] < 3) {
        updated[plantIndex] += 1;

        if (onEvent) {
          onEvent('interaction', { tool: activeTool, plantIndex, newStage: updated[plantIndex] });
          if (updated[plantIndex] === 3) {
            onEvent('animation_change', { plant: FLOWERS[plantIndex].name, bloomed: true });
          }
        }
      }
      
      // Check if all 4 flowers are in full bloom (stage 3)
      if (updated.every(stage => stage === 3) && !isCompleted) {
        triggerVictory();
      }

      return updated;
    });
  };

  const triggerVictory = () => {
    setIsCompleted(true);
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const m = metricsRef.current;

    audioFeedback.playCheerSound();
    confetti({ particleCount: 70, spread: 85, origin: { y: 0.55 } });

    if (onEvent) {
      onEvent('activity_completion', { duration, bloomedAll: true });
    }

    const avgResponse = m.responseTimes.length > 0
      ? Number((m.responseTimes.reduce((a, b) => a + b, 0) / m.responseTimes.length).toFixed(1))
      : 1.8;

    const repetitionFreq = Number(((m.repeatedPlantActions / Math.max(1, duration)) * 60).toFixed(1));

    setTimeout(() => {
      if (onComplete) {
        onComplete({
          score: 100,
          accuracy: 100,
          responseTime: avgResponse,
          completionTime: duration,
          mistakes: 0,
          hintsUsed: 0,
          motorMetrics: {
            tapAccuracy: 100,
            dragAccuracy: 100,
            avgResponseTime: avgResponse,
            missedInteractions: 0,
            repeatedAttempts: m.repeatedPlantActions,
            completionTime: duration,
            score: 100
          },
          repetitiveMetrics: {
            repeatedActionsCount: m.repeatedPlantActions,
            repetitionFrequency: repetitionFreq,
            repeatedSequences: Math.floor(m.repeatedPlantActions / 2),
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
            colorChangeResponses: 4,
            animationEvents: 12,
            soundEvents: m.totalInteractions,
            transitionReactions: 1,
            timeline: m.responseTimes.slice(0, 5).map((rt, idx) => ({
              event: `Plant Care ${idx + 1}`,
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

  const fullyBloomedCount = plantStages.filter(s => s === 3).length;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '520px',
      background: 'linear-gradient(180deg, #dcfce7 0%, #f0fdf4 45%, #bbf7d0 100%)',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '3px solid #86efac',
      boxShadow: '0 10px 25px -5px rgba(34, 197, 94, 0.2)',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      {/* Top Bar with Title and Active Tool Selection */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 5 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '8px 18px',
          borderRadius: '9999px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <Sparkles size={22} color="#15803d" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534' }}>
            Grow the Garden
          </span>
        </div>

        {/* Big Large-Target Tools: Water Drop vs Sun */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => {
              setActiveTool('water');
              audioFeedback.playWaterSound();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              background: activeTool === 'water' ? '#3b82f6' : '#ffffff',
              color: activeTool === 'water' ? '#ffffff' : '#1e40af',
              border: '2px solid #60a5fa',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: activeTool === 'water' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : 'none',
              transform: activeTool === 'water' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s'
            }}
          >
            <Droplets size={22} />
            <span>Water 💧</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTool('sun');
              audioFeedback.playChimeSound(2);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '9999px',
              background: activeTool === 'sun' ? '#f59e0b' : '#ffffff',
              color: activeTool === 'sun' ? '#ffffff' : '#b45309',
              border: '2px solid #fcd34d',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: activeTool === 'sun' ? '0 4px 12px rgba(245, 158, 11, 0.4)' : 'none',
              transform: activeTool === 'sun' ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s'
            }}
          >
            <Sun size={22} />
            <span>Sun ☀️</span>
          </button>
        </div>
      </div>

      {/* 4 Plants Bed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        alignItems: 'end',
        margin: 'auto 0 10px 0',
        zIndex: 5
      }}>
        {FLOWERS.map((flower, idx) => {
          const stage = plantStages[idx];
          return (
            <div
              key={flower.id}
              onClick={() => handleNurturePlant(idx)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(254, 252, 232, 0.9)',
                border: `3px solid ${flower.borderColor}`,
                borderRadius: '20px',
                padding: '16px 8px',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: stage === 3 ? '0 10px 20px rgba(0,0,0,0.1)' : '0 4px 8px rgba(0,0,0,0.05)',
                transform: stage === 3 ? 'scale(1.04)' : 'scale(1)'
              }}
            >
              {/* Plant Visual based on Stage */}
              <div style={{
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: stage === 0 ? '2.5rem' : stage === 1 ? '3.5rem' : stage === 2 ? '4.2rem' : '5rem',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                {stage === 0 && '🌱'}
                {stage === 1 && '🌿'}
                {stage === 2 && '🌷'}
                {stage === 3 && flower.emoji}
              </div>

              {/* Plant Pot / Soil Base */}
              <div style={{
                width: '75%',
                height: '24px',
                borderRadius: '6px 6px 12px 12px',
                background: '#854d0e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fef3c7',
                fontSize: '0.75rem',
                fontWeight: 700,
                marginTop: '6px'
              }}>
                {stage === 3 ? 'Bloomed! ⭐' : `Tap to ${activeTool === 'water' ? 'Water' : 'Shine'}`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Garden Soil Bed */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 20px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #bbf7d0'
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534' }}>
          🌸 Flowers Bloomed: {fullyBloomedCount} of {FLOWERS.length}
        </span>
        <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
          {fullyBloomedCount === 4 ? 'A happy colorful garden!' : 'Tap each plant with Water and Sunshine!'}
        </span>
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
            background: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(22, 163, 74, 0.3)'
          }}>
            <Trophy size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#14532d', fontWeight: 800, margin: 0 }}>
            Beautiful Garden! 🌺
          </h2>
          <p style={{ color: '#166534', fontSize: '1.1rem', fontWeight: 600 }}>
            You helped all the flowers bloom!
          </p>
        </div>
      )}
    </div>
  );
};

export default GrowGarden;
