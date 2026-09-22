import React, { useState, useEffect, useRef } from 'react';
import { Clock, Eye, CheckCircle2, AlertCircle, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import EmotionBadge from '../components/common/EmotionBadge';
import { EMOTIONS, detectFacialEmotion } from '../services/emotionDetector';

// Import Existing BrightPath Games (STRICTLY PRESERVED)
import MemoryQuest from '../games/MemoryQuest';
import ColorGarden from '../games/ColorGarden';
import BrainRush from '../games/BrainRush';
import CalmMaze from '../games/CalmMaze';
import StepPuzzle from '../games/StepPuzzle';

// Import 5 New Early Childhood Activities (Ages 3–6)
import BubblePop from '../games/early/BubblePop';
import GrowGarden from '../games/early/GrowGarden';
import BalloonSmash from '../games/early/BalloonSmash';
import HiddenFriend from '../games/early/HiddenFriend';
import RainbowBuilder from '../games/early/RainbowBuilder';

export const GamePlayPage = ({ onGameFinished, onCancelSession }) => {
  const { 
    selectedGame, 
    currentEmotion, 
    currentConfidence,
    recordEmotionSample, 
    recordActivityEvent,
    completeSession,
    isDemoMode,
    simulatedEmotion,
    setSimulatedEmotion,
    cameraActive,
    cameraStream,
    stopCamera
  } = useSession();

  const videoRef = useRef(null);
  const duringTriggered = useRef(false);

  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Checkpoint 2 (10s During Game) Status State
  const [duringBanner, setDuringBanner] = useState({ show: false, status: 'idle', message: '' });

  // Checkpoint 3 (Final Completion) Overlay State
  const [finalOverlay, setFinalOverlay] = useState({ show: false, status: 'idle', message: '', countdown: 2, gameResults: null });

  // Bind video element to live cameraStream for background frame analysis
  useEffect(() => {
    if (cameraActive && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.warn("Background video play warning:", e));
      }
    }
  }, [cameraActive, cameraStream]);

  // Gameplay timer starting exactly when game begins
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => {
        const nextSec = prev + 1;
        
        // Trigger Checkpoint 2 at exactly 10 seconds into gameplay
        if (nextSec === 10 && !duringTriggered.current) {
          duringTriggered.current = true;
          trigger10SecondAnalysis(nextSec);
        }

        return nextSec;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDemoMode, simulatedEmotion, cameraActive]);

  // Handle activity events from game components
  const handleActivityEvent = (eventType, eventData) => {
    if (recordActivityEvent) {
      recordActivityEvent(eventType, eventData);
    }

    // If key event is animation_change (e.g. reveal in Hidden Friend), sample expression snapshot
    if (eventType === 'animation_change' && cameraActive && videoRef.current && !isDemoMode) {
      detectFacialEmotion(videoRef.current, null, { checkpoint: 'event_reveal', frameCount: 2, timeoutMs: 3000 })
        .then(res => {
          if (res.status === 'SUCCESS' || res.faceDetected) {
            recordEmotionSample(
              { emotion: res.emotion, confidence: res.confidence },
              secondsElapsed,
              false,
              'event_reveal',
              'animation_change'
            );
          }
        })
        .catch(() => {});
    }
  };

  // CHECKPOINT 2 — 10 SECONDS INTO GAME
  const trigger10SecondAnalysis = async (secTime) => {
    setDuringBanner({
      show: true,
      status: 'sampling',
      message: 'Observing facial expression... Please look at the camera for a moment.'
    });

    let sampled = currentEmotion;
    let conf = currentConfidence || 0.85;

    if (isDemoMode && simulatedEmotion) {
      sampled = simulatedEmotion;
      conf = 0.95;
    } else if (cameraActive && videoRef.current) {
      try {
        const res = await detectFacialEmotion(videoRef.current, null, { checkpoint: 'during', frameCount: 3, timeoutMs: 8000 });
        if (res.status === 'SUCCESS' || res.faceDetected) {
          sampled = res.emotion;
          conf = res.confidence;
        }
      } catch (e) {
        console.warn("10-second checkpoint emotion analysis warning:", e);
      }
    }

    recordEmotionSample(
      { emotion: sampled, confidence: conf },
      secTime,
      isDemoMode,
      'during'
    );

    setDuringBanner({
      show: true,
      status: 'success',
      message: 'Observed facial expression recorded ✓'
    });

    setTimeout(() => {
      setDuringBanner(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // CHECKPOINT 3 — FINAL EMOTION ANALYSIS UPON GAME VICTORY
  const handleGameComplete = async (gameResults) => {
    setFinalOverlay({
      show: true,
      status: 'preparing',
      message: 'Great job! Hold still and look at the camera for a moment...',
      countdown: 2,
      gameResults: gameResults
    });

    await new Promise(res => setTimeout(res, 1800));
    runFinalAnalysis(gameResults);
  };

  const runFinalAnalysis = async (gameResults) => {
    setFinalOverlay(prev => ({
      ...prev,
      status: 'analyzing',
      message: 'Analyzing final observed expression...'
    }));

    let finalSample = currentEmotion;
    let finalConf = currentConfidence || 0.85;
    let success = true;

    if (isDemoMode && simulatedEmotion) {
      finalSample = simulatedEmotion;
      finalConf = 0.95;
    } else if (cameraActive && videoRef.current) {
      try {
        const res = await detectFacialEmotion(videoRef.current, null, { checkpoint: 'final', frameCount: 4, timeoutMs: 10000 });
        if (res.status === 'SUCCESS' || res.faceDetected) {
          finalSample = res.emotion;
          finalConf = res.confidence;
        } else {
          success = false;
        }
      } catch (e) {
        console.warn("Final emotion analysis exception:", e);
        success = false;
      }
    }

    if (!success && !isDemoMode) {
      setFinalOverlay(prev => ({
        ...prev,
        status: 'error',
        message: 'Could not detect facial expression. Please position face inside camera frame and click Retry.'
      }));
      return;
    }

    recordEmotionSample(
      { emotion: finalSample, confidence: finalConf },
      secondsElapsed,
      isDemoMode,
      'final'
    );

    setFinalOverlay(prev => ({
      ...prev,
      status: 'success',
      message: 'Final observed expression recorded ✓'
    }));

    setTimeout(async () => {
      const saved = await completeSession(
        { ...gameResults, completionTime: secondsElapsed },
        { emotion: finalSample, confidence: finalConf }
      );

      if (onGameFinished) {
        onGameFinished(saved);
      }
    }, 1000);
  };

  const handleDemoEmotionSwitch = (emo) => {
    setSimulatedEmotion(emo);
    recordEmotionSample({ emotion: emo, confidence: 0.95 }, secondsElapsed, true, 'during');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleExitSession = () => {
    stopCamera();
    if (onCancelSession) onCancelSession();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      {/* Off-screen video element bound to cameraStream */}
      {cameraActive && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
        />
      )}

      {/* Session Monitor Header */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: '#e0e7ff', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', fontWeight: 700, color: '#3730a3', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={18} /> {formatTime(secondsElapsed)}
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>OBSERVED FACIAL EXPRESSION</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <EmotionBadge emotion={currentEmotion} size="md" />
              {currentConfidence && (
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                  ({Math.round(currentConfidence * 100)}%)
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isDemoMode && cameraActive && (
            <span className="badge badge-happy" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Eye size={14} /> AI Camera Active
            </span>
          )}

          {isDemoMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fdf2f8', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#be185d' }}>SIMULATE EXPRESSION:</span>
              {Object.values(EMOTIONS).slice(0, 5).map((emo) => (
                <button
                  key={emo}
                  onClick={() => handleDemoEmotionSwitch(emo)}
                  style={{
                    background: currentEmotion === emo ? '#be185d' : '#fff',
                    color: currentEmotion === emo ? '#fff' : '#be185d',
                    border: '1px solid #fbcfe8',
                    borderRadius: '4px',
                    padding: '0.15rem 0.4rem',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {emo}
                </button>
              ))}
            </div>
          )}

          <button onClick={handleExitSession} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <XCircle size={16} /> Exit Activity
          </button>
        </div>
      </div>

      {/* Checkpoint 2 10-Second Banner */}
      {duringBanner.show && (
        <div style={{
          background: duringBanner.status === 'success' ? '#ecfdf5' : '#eff6ff',
          border: `1px solid ${duringBanner.status === 'success' ? '#a7f3d0' : '#bfdbfe'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: duringBanner.status === 'success' ? '#065f46' : '#1e40af',
          fontSize: '0.9rem',
          fontWeight: 600,
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.3s ease'
        }}>
          {duringBanner.status === 'sampling' ? (
            <RefreshCw className="pulse-animation" size={18} color="#2563eb" />
          ) : (
            <CheckCircle2 size={18} color="#10b981" />
          )}
          <span>{duringBanner.message}</span>
        </div>
      )}

      {/* Checkpoint 3 Final Analysis Overlay */}
      {finalOverlay.show && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem 2rem', background: '#ffffff' }}>
            {finalOverlay.status === 'success' ? (
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <CheckCircle2 size={36} />
              </div>
            ) : finalOverlay.status === 'error' ? (
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', border: '1px solid #fecdd3' }}>
                <AlertCircle size={36} />
              </div>
            ) : (
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <RefreshCw className="pulse-animation" size={32} />
              </div>
            )}

            <h3 style={{ fontSize: '1.5rem', color: '#0f172a', marginBottom: '0.5rem' }}>
              {finalOverlay.status === 'success' ? 'Great Job!' : (finalOverlay.status === 'error' ? 'Analysis Error' : 'Analyzing Final Expression')}
            </h3>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {finalOverlay.message}
            </p>

            {finalOverlay.status === 'error' && (
              <button
                onClick={() => runFinalAnalysis(finalOverlay.gameResults)}
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
              >
                <RefreshCw size={18} />
                <span>Retry Final Analysis</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Render 5 New Early Childhood Activities (Ages 3–6) */}
      {selectedGame?.id === 'bubble-pop' && <BubblePop onComplete={handleGameComplete} onEvent={handleActivityEvent} />}
      {selectedGame?.id === 'grow-garden' && <GrowGarden onComplete={handleGameComplete} onEvent={handleActivityEvent} />}
      {selectedGame?.id === 'balloon-smash' && <BalloonSmash onComplete={handleGameComplete} onEvent={handleActivityEvent} />}
      {selectedGame?.id === 'hidden-friend' && <HiddenFriend onComplete={handleGameComplete} onEvent={handleActivityEvent} />}
      {selectedGame?.id === 'rainbow-builder' && <RainbowBuilder onComplete={handleGameComplete} onEvent={handleActivityEvent} />}

      {/* Render 5 Existing BrightPath Games (Ages 7–17 - STRICTLY PRESERVED) */}
      {selectedGame?.id === 'memory-quest' && <MemoryQuest onComplete={handleGameComplete} />}
      {selectedGame?.id === 'color-garden' && <ColorGarden onComplete={handleGameComplete} />}
      {selectedGame?.id === 'brain-rush' && <BrainRush onComplete={handleGameComplete} />}
      {selectedGame?.id === 'calm-maze' && <CalmMaze onComplete={handleGameComplete} />}
      {selectedGame?.id === 'step-puzzle' && <StepPuzzle onComplete={handleGameComplete} />}

      {/* Fallback if no game ID matches */}
      {!selectedGame && <BubblePop onComplete={handleGameComplete} onEvent={handleActivityEvent} />}
    </div>
  );
};

export default GamePlayPage;
