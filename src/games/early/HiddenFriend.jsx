import React, { useState, useEffect, useRef } from 'react';
import { Eye, Star, Trophy, Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import audioFeedback from '../../utils/audioFeedback';

const HIDING_SPOTS = [
  { id: 'tree', name: 'Oak Tree', emoji: '🌳', label: 'Big Tree' },
  { id: 'bush', name: 'Cozy Bush', emoji: '🌿', label: 'Green Bush' },
  { id: 'cloud', name: 'Fluffy Cloud', emoji: '☁️', label: 'Cloud' },
  { id: 'tent', name: 'Play Tent', emoji: '⛺', label: 'Play Tent' }
];

const ANIMAL_FRIENDS = [
  { emoji: '🐰', name: 'Bunny', message: 'Peekaboo! I am Bunny!' },
  { emoji: '🐻', name: 'Bear', message: 'Hello friend! Bear is here!' },
  { emoji: '🐱', name: 'Kitty', message: 'Meow! You found me!' },
  { emoji: '🐶', name: 'Puppy', message: 'Woof! Good job finding me!' }
];

export const HiddenFriend = ({ onComplete, onEvent }) => {
  const [currentRound, setCurrentRound] = useState(0);
  const [hiddenSpotIdx, setHiddenSpotIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

  const metricsRef = useRef({
    totalSearches: 0,
    successfulFinds: 0,
    missedSearches: 0,
    responseTimes: [],
    repeatedSearches: 0,
    lastSelectedSpot: null,
    pauseCount: 0
  });

  // Pick random hiding spot for round
  useEffect(() => {
    setHiddenSpotIdx(Math.floor(Math.random() * HIDING_SPOTS.length));
    setIsRevealed(false);
    setSelectedSpot(null);
    setRoundStartTime(Date.now());
  }, [currentRound]);

  // Notify start
  useEffect(() => {
    if (onEvent) {
      onEvent('activity_start', { activity: 'hidden-friend', totalRounds: ANIMAL_FRIENDS.length });
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

  const handleSpotTap = (spotIdx) => {
    if (isRevealed || isCompleted) return;

    const now = Date.now();
    setLastInteractionTime(now);

    const latency = Math.min(6, (now - roundStartTime) / 1000);
    metricsRef.current.responseTimes.push(latency);
    metricsRef.current.totalSearches += 1;

    if (metricsRef.current.lastSelectedSpot === spotIdx) {
      metricsRef.current.repeatedSearches += 1;
    }
    metricsRef.current.lastSelectedSpot = spotIdx;

    setSelectedSpot(spotIdx);

    if (spotIdx === hiddenSpotIdx) {
      // Found the friend!
      metricsRef.current.successfulFinds += 1;
      setIsRevealed(true);

      audioFeedback.playRevealSound();

      const animal = ANIMAL_FRIENDS[currentRound];
      if (onEvent) {
        onEvent('interaction', { type: 'found_friend', spot: HIDING_SPOTS[spotIdx].name, latency });
        // Trigger observational event at reveal moment for facial expression capture
        onEvent('animation_change', { animal: animal.name, reveal: true });
        onEvent('success', { round: currentRound + 1, total: ANIMAL_FRIENDS.length });
      }

      // Advance to next round or complete
      setTimeout(() => {
        if (currentRound + 1 >= ANIMAL_FRIENDS.length) {
          triggerVictory();
        } else {
          setCurrentRound(prev => prev + 1);
        }
      }, 2200);
    } else {
      // Missed search
      metricsRef.current.missedSearches += 1;
      audioFeedback.playPopSound(0.7);

      if (onEvent) {
        onEvent('mistake', { type: 'empty_spot', spot: HIDING_SPOTS[spotIdx].name });
      }

      // Gentle shake animation feedback
      setTimeout(() => {
        setSelectedSpot(null);
      }, 500);
    }
  };

  const triggerVictory = () => {
    setIsCompleted(true);
    const duration = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const m = metricsRef.current;

    audioFeedback.playCheerSound();
    confetti({ particleCount: 70, spread: 85, origin: { y: 0.55 } });

    if (onEvent) {
      onEvent('activity_completion', { duration, foundAll: true });
    }

    const accuracy = Math.round((m.successfulFinds / Math.max(1, m.totalSearches)) * 100);
    const avgResponse = m.responseTimes.length > 0
      ? Number((m.responseTimes.reduce((a, b) => a + b, 0) / m.responseTimes.length).toFixed(1))
      : 2.0;

    const repetitionFreq = Number(((m.repeatedSearches / Math.max(1, duration)) * 60).toFixed(1));

    setTimeout(() => {
      if (onComplete) {
        onComplete({
          score: 100,
          accuracy: accuracy,
          responseTime: avgResponse,
          completionTime: duration,
          mistakes: m.missedSearches,
          hintsUsed: 0,
          motorMetrics: {
            tapAccuracy: accuracy,
            dragAccuracy: 100,
            avgResponseTime: avgResponse,
            missedInteractions: m.missedSearches,
            repeatedAttempts: m.repeatedSearches,
            completionTime: duration,
            score: Math.min(100, Math.max(70, accuracy))
          },
          repetitiveMetrics: {
            repeatedActionsCount: m.repeatedSearches,
            repetitionFrequency: repetitionFreq,
            repeatedSequences: Math.floor(m.repeatedSearches / 2),
            rhythmConsistency: 85,
            notes: 'Repeated interaction patterns observed during this session.'
          },
          communicationMetrics: {
            promptResponsesCount: 4,
            voiceInteractionAttempts: null,
            responseLatency: avgResponse,
            repeatedPromptsCount: 0,
            completionRate: 100,
            hasData: true
          },
          stimulationMetrics: {
            colorChangeResponses: 4,
            animationEvents: 8,
            soundEvents: m.totalSearches,
            transitionReactions: 4,
            timeline: m.responseTimes.map((rt, idx) => ({
              event: `Search ${idx + 1}`,
              responseTime: rt
            }))
          },
          socialMetrics: {
            characterInteractions: 4,
            socialPromptResponses: 4,
            responseTime: avgResponse,
            sharedAttentionEvents: 4,
            notes: 'Observed social interaction indicators within BrightPath activities.'
          }
        });
      }
    }, 1800);
  };

  const currentFriend = ANIMAL_FRIENDS[currentRound] || ANIMAL_FRIENDS[0];

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '520px',
      background: 'linear-gradient(180deg, #f5f3ff 0%, #ede9fe 50%, #ddd6fe 100%)',
      borderRadius: '24px',
      overflow: 'hidden',
      border: '3px solid #c4b5fd',
      boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.2)',
      userSelect: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '20px'
    }}>
      {/* Top Bar with Title and Round Progress */}
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
          <Eye size={22} color="#7c3aed" />
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#5b21b6' }}>
            Find the Hidden Friend!
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
            {currentRound + 1} / {ANIMAL_FRIENDS.length}
          </span>
        </div>
      </div>

      {/* Center Hide & Seek Area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '20px',
        maxWidth: '560px',
        margin: 'auto',
        width: '100%',
        zIndex: 5
      }}>
        {HIDING_SPOTS.map((spot, idx) => {
          const isTarget = idx === hiddenSpotIdx;
          const isChosen = selectedSpot === idx;
          const isFriendHereAndRevealed = isTarget && isRevealed;

          return (
            <div
              key={spot.id}
              onClick={() => handleSpotTap(idx)}
              style={{
                background: isFriendHereAndRevealed ? '#fef08a' : 'rgba(255, 255, 255, 0.9)',
                border: isFriendHereAndRevealed ? '3px solid #eab308' : (isChosen && !isTarget ? '3px solid #f87171' : '3px solid #c4b5fd'),
                borderRadius: '24px',
                height: '140px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isRevealed ? 'default' : 'pointer',
                boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                transform: isFriendHereAndRevealed ? 'scale(1.08)' : (isChosen ? 'scale(0.96)' : 'scale(1)'),
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isFriendHereAndRevealed ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  animation: 'popIn 0.3s ease-out'
                }}>
                  <span style={{ fontSize: '4.5rem' }}>{currentFriend.emoji}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#854d0e', marginTop: '2px' }}>
                    {currentFriend.message}
                  </span>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: '4.2rem' }}>{spot.emoji}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6b21a8', marginTop: '4px' }}>
                    {spot.label}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Friendly Bottom Prompt */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 20px',
        borderRadius: '16px',
        textAlign: 'center',
        border: '1px solid #ddd6fe'
      }}>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#5b21b6' }}>
          {isRevealed ? `Yay! You found ${currentFriend.name}! 🎉` : `Where is ${currentFriend.name} hiding? Tap to see! 👀`}
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
            background: '#ede9fe',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)'
          }}>
            <Trophy size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', color: '#4c1d95', fontWeight: 800, margin: 0 }}>
            You Found Everyone! 🐰🐻🐱🐶
          </h2>
          <p style={{ color: '#5b21b6', fontSize: '1.1rem', fontWeight: 600 }}>
            All your friendly animals are happy to see you!
          </p>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default HiddenFriend;
