import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, PlayCircle, RefreshCw, Sliders, AlertCircle, Bot, Video, CheckCircle2, User, UserPlus } from 'lucide-react';
import CameraPreview from '../components/webcam/CameraPreview';
import EmotionBadge from '../components/common/EmotionBadge';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { EMOTIONS, detectFacialEmotion, getRecommendedGame } from '../services/emotionDetector';
import { validateChildAge } from '../services/sessionStorage';

export const StartSessionPage = ({ onStartGame }) => {
  const { initSession, cameraActive, isDemoMode, setIsDemoMode, setSimulatedEmotion } = useSession();
  const { activeChild, childrenList, setActiveChild, addChildProfile } = useAuth();

  const videoElementRef = useRef(null);
  const autoAnalysisAttempted = useRef(false);

  const [detectedEmotion, setDetectedEmotion] = useState(EMOTIONS.NEUTRAL);
  const [detectedConfidence, setDetectedConfidence] = useState(null);
  const [selectedDemoEmotion, setSelectedDemoEmotion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState('IDLE');
  const [statusMessage, setStatusMessage] = useState('Camera Ready — Awaiting Expression Analysis');
  const [recommendedGame, setRecommendedGame] = useState(null);
  const [analysisDone, setAnalysisDone] = useState(false);

  // Quick Child Creation Modal/Card state (if no child profile exists)
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('');
  const [childError, setChildError] = useState('');
  const [isCreatingChild, setIsCreatingChild] = useState(false);

  const childAge = activeChild?.age || 5;
  const childMode = activeChild?.mode || (childAge <= 6 ? 'early' : 'brightpath');

  // Recalculate recommendation whenever detectedEmotion or activeChild changes
  useEffect(() => {
    const game = getRecommendedGame(detectedEmotion, childAge);
    setRecommendedGame(game);
  }, [detectedEmotion, childAge]);

  // Perform emotion detection (Real Webcam AI or Demo Mode)
  const runEmotionAnalysis = useCallback(async (forcedDemoEmotion = null) => {
    setIsAnalyzing(true);
    setAnalysisStatus('SAMPLING');
    setStatusMessage('Sampling facial expression frames... (12s max timeout)');

    const demoVal = forcedDemoEmotion || selectedDemoEmotion;

    if (isDemoMode && demoVal) {
      try {
        const res = await detectFacialEmotion(null, demoVal);
        setDetectedEmotion(res.emotion);
        setDetectedConfidence(res.confidence);
        setAnalysisStatus('SUCCESS');
        setStatusMessage(res.label || 'Demo Mode — Simulated Expression');
        const game = getRecommendedGame(res.emotion, childAge);
        setRecommendedGame(game);
        setAnalysisDone(true);
      } catch (err) {
        setAnalysisStatus('MODEL_ERROR');
        setStatusMessage('Demo expression simulation error.');
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // Real Camera AI Analysis
    try {
      const res = await detectFacialEmotion(videoElementRef.current, null, { checkpoint: 'initial', timeoutMs: 12000 });

      if (res.status === 'SUCCESS') {
        setDetectedEmotion(res.emotion);
        setDetectedConfidence(res.confidence);
        setAnalysisStatus('SUCCESS');
        setStatusMessage(res.label || 'Analysis Complete');
        const game = getRecommendedGame(res.emotion, childAge);
        setRecommendedGame(game);
        setAnalysisDone(true);
      } else {
        setAnalysisStatus(res.status || 'NO_FACE');
        setStatusMessage(res.message || 'No face detected — please position your face inside the camera frame.');
        setAnalysisDone(false);
      }
    } catch (err) {
      console.error("Emotion analysis exception:", err);
      setAnalysisStatus('MODEL_ERROR');
      setStatusMessage('Unexpected analysis error. Please click Retry.');
      setAnalysisDone(false);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isDemoMode, selectedDemoEmotion, childAge]);

  const handleCameraReady = useCallback((videoElement) => {
    videoElementRef.current = videoElement;

    if (!isDemoMode && !autoAnalysisAttempted.current) {
      autoAnalysisAttempted.current = true;
      setTimeout(() => {
        runEmotionAnalysis();
      }, 1000);
    }
  }, [isDemoMode, runEmotionAnalysis]);

  const handleSelectDemoEmotion = (emo) => {
    setSelectedDemoEmotion(emo);
    setIsDemoMode(true);
    setSimulatedEmotion(emo);
    runEmotionAnalysis(emo);
  };

  const handleToggleMode = (demoState) => {
    setIsDemoMode(demoState);
    setAnalysisDone(false);
    setDetectedConfidence(null);
    setAnalysisStatus('IDLE');
    if (!demoState) {
      setSelectedDemoEmotion(null);
      setSimulatedEmotion(null);
      setStatusMessage('Real Camera AI Active — Ready for detection');
      autoAnalysisAttempted.current = false;
      if (cameraActive && videoElementRef.current) {
        setTimeout(() => runEmotionAnalysis(), 800);
      }
    } else {
      setStatusMessage('Demo Mode Active — Select simulated expression');
    }
  };

  const handleLaunchSession = () => {
    const analysisPayload = {
      emotion: detectedEmotion,
      confidence: detectedConfidence || 0.88
    };
    initSession(analysisPayload, recommendedGame, isDemoMode);
    if (onStartGame && recommendedGame) {
      onStartGame(recommendedGame.id);
    }
  };

  const handleCreateQuickChild = async (e) => {
    e.preventDefault();
    setChildError('');

    const validation = validateChildAge(newChildAge);
    if (!validation.valid) {
      setChildError(validation.error);
      return;
    }

    try {
      setIsCreatingChild(true);
      await addChildProfile(newChildName || 'Child', validation.age);
      setNewChildName('');
      setNewChildAge('');
    } catch (err) {
      setChildError(err.message || 'Failed to create child profile.');
    } finally {
      setIsCreatingChild(false);
    }
  };

  // Demo emotions options list according to child age mode
  const demoEmotionsList = childMode === 'early' 
    ? [EMOTIONS.HAPPY, EMOTIONS.SAD, EMOTIONS.ANGRY, EMOTIONS.FEAR, EMOTIONS.NEUTRAL]
    : [EMOTIONS.HAPPY, EMOTIONS.SAD, EMOTIONS.NEUTRAL, EMOTIONS.ANGRY, EMOTIONS.FRUSTRATED];

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* If No Child Exists, Show Required Child Setup Card */}
      {!activeChild && (
        <div className="glass-card" style={{ padding: '2rem', background: '#fffbeb', border: '2px solid #fef3c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', color: '#92400e', margin: 0 }}>
                Set Up Child Profile
              </h3>
              <p style={{ color: '#b45309', fontSize: '0.875rem', margin: '2px 0 0 0' }}>
                Please specify the child's name and age so BrightPath can automatically select the appropriate activity mode.
              </p>
            </div>
          </div>

          {childError && (
            <div style={{ padding: '0.65rem 1rem', background: '#fff1f2', border: '1px solid #fecdd3', color: '#9f1239', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {childError}
            </div>
          )}

          <form onSubmit={handleCreateQuickChild} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>CHILD NAME</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Leo"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>AGE (3–17)</label>
              <input
                type="number"
                min="3"
                max="17"
                className="form-input"
                placeholder="Age"
                value={newChildAge}
                onChange={(e) => setNewChildAge(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={isCreatingChild} className="btn btn-primary" style={{ background: '#d97706', borderColor: '#b45309', height: '44px' }}>
              <UserPlus size={18} />
              <span>{isCreatingChild ? 'Saving...' : 'Save Child Profile'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.85rem', background: isDemoMode ? '#fdf2f8' : '#eff6ff', border: `1px solid ${isDemoMode ? '#fbcfe8' : '#bfdbfe'}`, borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, color: isDemoMode ? '#be185d' : '#1d4ed8', marginBottom: '0.75rem' }}>
          {isDemoMode ? <Sliders size={14} /> : <Bot size={14} />}
          <span>{isDemoMode ? 'DEMO MODE ACTIVE — Manual Selection' : 'REAL CAMERA AI MODE — Live Facial Detection'}</span>
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
          Start Emotion-Guided Session
        </h1>

        {/* Active Child & Mode Display */}
        {activeChild && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: '#f1f5f9', padding: '0.4rem 1rem', borderRadius: '9999px', margin: '0 auto 0.75rem auto' }}>
            <User size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
              {activeChild.name} (Age {activeChild.age})
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.15rem 0.55rem',
              borderRadius: '9999px',
              background: childMode === 'early' ? '#dbeafe' : '#f3e8ff',
              color: childMode === 'early' ? '#1d4ed8' : '#6b21a8'
            }}>
              {childMode === 'early' ? 'Ages 3–6: Early Mode' : 'Ages 7–17: BrightPath Mode'}
            </span>

            {/* Child switcher dropdown if multiple children */}
            {childrenList.length > 1 && (
              <select
                value={activeChild.childId}
                onChange={(e) => {
                  const selected = childrenList.find(c => c.childId === e.target.value);
                  if (selected) setActiveChild(selected);
                }}
                style={{ fontSize: '0.8rem', padding: '0.2rem 0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
              >
                {childrenList.map(c => (
                  <option key={c.childId} value={c.childId}>
                    {c.name} (Age {c.age})
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '620px', margin: '0 auto' }}>
          {isDemoMode 
            ? 'Demo Mode: Manually select a simulated facial expression to test activity matching and caregiver reports.' 
            : 'Allow camera access to analyze facial expression, determine observed mood, and automatically launch the tailored activity.'
          }
        </p>
      </div>

      {/* Grid: Web Camera Feed + Emotion Analysis Panel */}
      <div className="grid-2">
        {/* Camera Preview */}
        <div>
          <CameraPreview onCameraReady={handleCameraReady} isAnalyzing={isAnalyzing} />
        </div>

        {/* Emotion & Recommendation Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="flex-between mb-3">
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={18} color="var(--color-primary)" />
                <span>Observed Expression Result</span>
              </h3>

              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button
                  onClick={() => handleToggleMode(!isDemoMode)}
                  className="btn btn-outline"
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '9999px' }}
                >
                  <Sliders size={12} />
                  <span>{isDemoMode ? 'Switch to Real AI Camera' : 'Switch to Demo Mode'}</span>
                </button>
              </div>
            </div>

            {/* Demo Mode Selector Pills */}
            {isDemoMode && (
              <div style={{ padding: '0.85rem', background: '#fdf2f8', borderRadius: 'var(--radius-md)', border: '1px solid #fbcfe8', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#be185d', display: 'block', marginBottom: '0.5rem' }}>
                  🎯 DEMO MODE — SELECT SIMULATED EXPRESSION:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {demoEmotionsList.map((emo) => (
                    <button
                      key={emo}
                      onClick={() => handleSelectDemoEmotion(emo)}
                      className={`btn ${selectedDemoEmotion === emo ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Result Box */}
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                INITIAL OBSERVED EXPRESSION
              </span>

              {isAnalyzing ? (
                <div style={{ padding: '1rem', color: 'var(--color-primary)' }}>
                  <RefreshCw className="pulse-animation" size={24} style={{ margin: '0 auto 0.4rem auto' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Sampling Facial Expression Frames...</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Running Client-Side AI Analysis (Max 12s timeout)
                  </p>
                </div>
              ) : analysisStatus === 'SUCCESS' ? (
                <>
                  <div style={{ margin: '0.5rem 0' }}>
                    <EmotionBadge emotion={detectedEmotion} size="lg" />
                  </div>
                  {detectedConfidence && (
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '0.3rem' }}>
                      Confidence: {Math.round(detectedConfidence * 100)}%
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>
                    Analysis Complete
                  </span>
                </>
              ) : analysisStatus !== 'IDLE' && analysisStatus !== 'SUCCESS' ? (
                <div style={{ padding: '0.85rem', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', color: '#9f1239' }}>
                  <AlertCircle size={22} color="#e11d48" style={{ margin: '0 auto 0.4rem auto' }} />
                  <strong style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {analysisStatus === 'NO_FACE' ? 'No Face Detected' : (analysisStatus === 'TIMEOUT' ? 'Analysis Timed Out' : 'Analysis Error')}
                  </strong>
                  <p style={{ fontSize: '0.8rem', margin: '0 0 0.85rem 0' }}>{statusMessage}</p>
                  <button onClick={() => runEmotionAnalysis()} className="btn btn-outline" style={{ borderColor: '#f43f5e', color: '#be185d', width: '100%' }}>
                    <RefreshCw size={14} />
                    <span>Retry Analysis</span>
                  </button>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ fontSize: '0.85rem' }}>{statusMessage}</span>
                </div>
              )}
            </div>

            {/* Trigger / Retry Button for Real AI Analysis */}
            {!isDemoMode && cameraActive && !isAnalyzing && (
              <button onClick={() => runEmotionAnalysis()} className="btn btn-primary" style={{ width: '100%', marginBottom: '1.25rem' }}>
                <RefreshCw size={16} />
                <span>{analysisDone ? 'Re-Analyze Facial Expression' : 'Run Facial Expression Analysis'}</span>
              </button>
            )}

            {/* Recommended Activity Preview Card */}
            {recommendedGame && (
              <div style={{ background: recommendedGame.bg, padding: '1.25rem', borderRadius: 'var(--radius-md)', border: `1px solid ${recommendedGame.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: recommendedGame.color, textTransform: 'uppercase' }}>
                    MATCHED ACTIVITY
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: '#ffffff', color: recommendedGame.color }}>
                    {recommendedGame.mode === 'early' ? 'Ages 3–6' : 'Ages 7–17'}
                  </span>
                </div>
                <h4 style={{ fontSize: '1.25rem', color: '#0f172a', margin: '0.25rem 0' }}>
                  {recommendedGame.name}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  {recommendedGame.description}
                </p>
              </div>
            )}
          </div>

          {/* Launch Session Button */}
          <div style={{ marginTop: '1.5rem' }}>
            <button
              onClick={handleLaunchSession}
              className={`btn btn-primary btn-lg ${(!analysisDone && !selectedDemoEmotion) || !activeChild ? 'btn-disabled' : ''}`}
              style={{ width: '100%' }}
              disabled={(!analysisDone && !selectedDemoEmotion) || !activeChild}
            >
              <PlayCircle size={22} />
              <span>Launch {recommendedGame?.name || 'Activity'}</span>
            </button>
            {!activeChild && (
              <span style={{ fontSize: '0.75rem', color: '#b45309', display: 'block', textAlign: 'center', marginTop: '0.4rem' }}>
                * Please set up a child profile above to launch activities
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSessionPage;
