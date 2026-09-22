// Game & Emotion Session Context with Event-Associated Telemetry
import React, { createContext, useContext, useState, useCallback } from 'react';
import { EMOTIONS, getRecommendedGame } from '../services/emotionDetector';
import { saveSessionData, resolveActivityMode } from '../services/sessionStorage';
import { useAuth } from './AuthContext';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  const { userProfile, activeChild } = useAuth();

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [initialEmotion, setInitialEmotion] = useState(EMOTIONS.NEUTRAL);
  const [initialConfidence, setInitialConfidence] = useState(0.85);
  const [currentEmotion, setCurrentEmotion] = useState(EMOTIONS.NEUTRAL);
  const [currentConfidence, setCurrentConfidence] = useState(0.85);
  const [emotionTimeline, setEmotionTimeline] = useState([]);
  const [sessionEvents, setSessionEvents] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [simulatedEmotion, setSimulatedEmotion] = useState(null);
  const [lastSavedSession, setLastSavedSession] = useState(null);

  // Turn off camera safely and stop all media stream tracks
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      try {
        cameraStream.getTracks().forEach(track => {
          track.stop();
        });
      } catch (e) {
        console.warn("Track stop error:", e);
      }
      setCameraStream(null);
    }
    setCameraActive(false);
  }, [cameraStream]);

  // Associate activity events with observed facial expressions
  const recordActivityEvent = useCallback((eventType, eventData = {}) => {
    const now = new Date();
    let secondsElapsed = 0;
    if (sessionStartTime) {
      secondsElapsed = Math.round((now - sessionStartTime) / 1000);
    }
    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    const eventEntry = {
      timestamp: timeFormatted,
      timeSeconds: secondsElapsed,
      eventType: eventType,
      eventData: eventData,
      observedEmotion: currentEmotion,
      confidence: currentConfidence
    };

    setSessionEvents(prev => [...prev, eventEntry]);
  }, [sessionStartTime, currentEmotion, currentConfidence]);

  // Initialize new session with Initial checkpoint observation
  const initSession = (detectedResult, gameObj = null, isDemo = false) => {
    let emo = EMOTIONS.NEUTRAL;
    let conf = 0.85;

    if (typeof detectedResult === 'object' && detectedResult !== null) {
      emo = detectedResult.emotion || EMOTIONS.NEUTRAL;
      conf = detectedResult.confidence || 0.85;
    } else if (typeof detectedResult === 'string') {
      emo = detectedResult;
    }

    const childAge = activeChild?.age || 10;
    const game = gameObj || getRecommendedGame(emo, childAge);
    const now = new Date();

    setInitialEmotion(emo);
    setInitialConfidence(conf);
    setCurrentEmotion(emo);
    setCurrentConfidence(conf);
    setSelectedGame(game);
    setSessionStartTime(now);
    setIsDemoMode(isDemo);
    setSessionEvents([]);

    const initialSample = {
      timestamp: '00:00',
      timeSeconds: 0,
      emotion: emo,
      confidence: conf,
      isDemo: isDemo,
      checkpoint: 'initial',
      associatedEvent: 'activity_start'
    };

    setEmotionTimeline([initialSample]);
  };

  // Record an independent emotion observation sample to the timeline
  const recordEmotionSample = (sampleResult, secondsElapsed, isDemo = false, checkpointKey = 'during', associatedEvent = null) => {
    let emo = currentEmotion;
    let conf = currentConfidence;

    if (typeof sampleResult === 'object' && sampleResult !== null) {
      emo = sampleResult.emotion || emo;
      conf = sampleResult.confidence || conf;
    } else if (typeof sampleResult === 'string') {
      emo = sampleResult;
    }

    const minutes = Math.floor(secondsElapsed / 60);
    const seconds = secondsElapsed % 60;
    const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    setCurrentEmotion(emo);
    setCurrentConfidence(conf);

    setEmotionTimeline((prev) => {
      const filtered = prev.filter(item => item.checkpoint !== checkpointKey);
      const newSample = {
        timestamp: timeFormatted,
        timeSeconds: secondsElapsed,
        emotion: emo,
        confidence: conf,
        isDemo: isDemo,
        checkpoint: checkpointKey,
        associatedEvent: associatedEvent
      };
      
      const updated = [...filtered, newSample];
      updated.sort((a, b) => a.timeSeconds - b.timeSeconds);
      return updated;
    });
  };

  // Complete and save active session
  const completeSession = async (gameResults = {}, customFinalSample = null) => {
    const userId = userProfile?.userId || 'guest_user';
    const childId = activeChild?.childId || 'default_child';
    const childName = activeChild?.name || 'Child';
    const childAge = activeChild?.age || 5;
    const activityMode = activeChild?.mode || resolveActivityMode(childAge);

    let completionTimeSeconds = gameResults.completionTime || 120;
    if (sessionStartTime) {
      completionTimeSeconds = Math.round((new Date() - sessionStartTime) / 1000);
    }

    let finalEmo = currentEmotion;
    let finalConf = currentConfidence;

    if (customFinalSample) {
      finalEmo = customFinalSample.emotion || finalEmo;
      finalConf = customFinalSample.confidence || finalConf;
    }

    // Stop camera tracks safely
    stopCamera();

    const payload = {
      userId: userId,
      childId: childId,
      childName: childName,
      childAge: childAge,
      activityMode: activityMode,
      startTime: sessionStartTime ? sessionStartTime.toISOString() : new Date().toISOString(),
      endTime: new Date().toISOString(),
      initialEmotion: initialEmotion,
      initialConfidence: initialConfidence,
      finalEmotion: finalEmo,
      finalConfidence: finalConf,
      recommendedGame: selectedGame ? selectedGame.name : 'Activity',
      gameId: selectedGame ? selectedGame.id : 'activity',
      score: typeof gameResults.score === 'number' ? gameResults.score : 100,
      accuracy: typeof gameResults.accuracy === 'number' ? gameResults.accuracy : 100,
      responseTime: typeof gameResults.responseTime === 'number' ? gameResults.responseTime : 2.0,
      completionTime: completionTimeSeconds,
      mistakes: gameResults.mistakes || 0,
      hintsUsed: gameResults.hintsUsed || 0,
      engagement: gameResults.score > 70 ? 'High' : (gameResults.score > 40 ? 'Moderate' : 'Developing'),
      isDemoMode: isDemoMode,
      
      // Preserved emotion timeline + associated activity events
      emotionTimeline: emotionTimeline.length > 0 ? emotionTimeline : [
        { timestamp: '00:00', emotion: initialEmotion, confidence: initialConfidence, checkpoint: 'initial' }
      ],
      sessionEvents: sessionEvents,

      // 5 Observational Indicators Telemetry
      motorMetrics: gameResults.motorMetrics || {
        tapAccuracy: gameResults.accuracy || 100,
        dragAccuracy: 100,
        avgResponseTime: gameResults.responseTime || 2.0,
        missedInteractions: gameResults.mistakes || 0,
        repeatedAttempts: 0,
        completionTime: completionTimeSeconds,
        score: gameResults.score || 100
      },
      repetitiveMetrics: gameResults.repetitiveMetrics || {
        repeatedActionsCount: 0,
        repetitionFrequency: 0,
        repeatedSequences: 0,
        rhythmConsistency: 85,
        notes: 'Repeated interaction patterns observed during this session.'
      },
      communicationMetrics: gameResults.communicationMetrics || {
        promptResponsesCount: 0,
        voiceInteractionAttempts: null,
        responseLatency: null,
        repeatedPromptsCount: 0,
        completionRate: null,
        hasData: false
      },
      stimulationMetrics: gameResults.stimulationMetrics || {
        colorChangeResponses: 2,
        animationEvents: 4,
        soundEvents: 4,
        transitionReactions: 1,
        timeline: []
      },
      socialMetrics: gameResults.socialMetrics || {
        characterInteractions: 0,
        socialPromptResponses: 0,
        responseTime: null,
        sharedAttentionEvents: 0,
        notes: 'Observed social interaction indicators within BrightPath activities.'
      }
    };

    const saved = await saveSessionData(payload);
    setLastSavedSession(saved);
    return saved;
  };

  const value = {
    cameraActive,
    setCameraActive,
    cameraStream,
    setCameraStream,
    initialEmotion,
    initialConfidence,
    currentEmotion,
    currentConfidence,
    setCurrentEmotion,
    emotionTimeline,
    sessionEvents,
    selectedGame,
    setSelectedGame,
    sessionStartTime,
    isDemoMode,
    setIsDemoMode,
    simulatedEmotion,
    setSimulatedEmotion,
    lastSavedSession,
    initSession,
    recordEmotionSample,
    recordActivityEvent,
    completeSession,
    stopCamera
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionContext;
