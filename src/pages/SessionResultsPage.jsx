import React from 'react';
import { CheckCircle2, PlayCircle, BarChart3, User, Volume2 } from 'lucide-react';
import EmotionTimelineChart from '../components/charts/EmotionTimelineChart';
import PerformanceChart from '../components/charts/PerformanceChart';
import DevelopmentalIndicatorsDashboard from '../components/charts/DevelopmentalIndicatorsDashboard';
import EmotionBadge from '../components/common/EmotionBadge';
import { TrophyMascot, PipOwl, RainbowClouds, ConfettiCelebration, MayaExplorer, MiloMouse } from '../components/common/CuteIllustrations';
import voiceFeedbackService from '../utils/voiceFeedback';

export const SessionResultsPage = ({ session, onViewReports, onStartNew }) => {
  if (!session) return null;

  const initialItem = session.emotionTimeline?.find(item => item.checkpoint === 'initial') || { emotion: session.initialEmotion };
  const duringItem = session.emotionTimeline?.find(item => item.checkpoint === 'during');
  const finalItem = session.emotionTimeline?.find(item => item.checkpoint === 'final') || { emotion: session.finalEmotion };
  const voiceMessage = session.spokenVoiceMessage || "Awesome! You did a great job!";

  const handleReplayVoice = () => {
    voiceFeedbackService.speakGameCompletion(voiceMessage);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Cheerful Victory Celebration Banner */}
      <div className="glass-card" style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(236,253,245,0.96) 0%, rgba(238,242,255,0.96) 60%, rgba(254,243,199,0.96) 100%)',
        border: '2px solid #a7f3d0',
        borderRadius: 'var(--radius-xl)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decorative rainbow */}
        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.2, pointerEvents: 'none' }}>
          <RainbowClouds width={180} height={100} />
        </div>

        {/* Mascot Celebration Illustration with Confetti */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ position: 'absolute', top: '-15px', pointerEvents: 'none' }} className="star-twinkle">
            <ConfettiCelebration size={140} />
          </div>
          <MayaExplorer size={60} animate={true} />
          <TrophyMascot size={84} />
          <MiloMouse size={58} animate={true} />
        </div>

        <h1 style={{ fontSize: '2.4rem', color: '#065f46', marginBottom: '0.5rem' }}>
          Session Complete & Saved! 🎉
        </h1>
        <p style={{ color: '#047857', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
          Fantastic work! Your gameplay adventure, facial expression checkpoints, and developmental achievements have been recorded.
        </p>

        {session.childName && (
          <div style={{ marginTop: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '0.4rem 1.1rem', borderRadius: '9999px', fontSize: '0.9rem', color: '#0f172a', fontWeight: 600, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
            <User size={16} color="var(--color-primary)" />
            <span>Child: {session.childName} (Age {session.childAge})</span>
            <span style={{ color: 'var(--text-muted)' }}>• {session.activityMode === 'early' ? 'Early Mode (Ages 3–6)' : 'BrightPath Mode'}</span>
          </div>
        )}

        {/* 2. Positive Voice Encouragement Banner (Requirement 3) */}
        <div style={{
          marginTop: '1.5rem',
          maxWidth: '540px',
          margin: '1.5rem auto 0 auto',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid #c7d2fe',
          borderRadius: '20px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: '#e0e7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <PipOwl size={36} animate={false} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase' }}>
                Encouraging Voice Praise
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1e1b4b', marginTop: '0.15rem' }}>
                "{voiceMessage}"
              </div>
            </div>
          </div>

          <button
            onClick={handleReplayVoice}
            className="btn btn-outline"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: '12px', flexShrink: 0 }}
            title="Hear the encouraging voice praise again"
          >
            <Volume2 size={16} color="var(--color-primary)" />
            <span>Replay Voice 🔊</span>
          </button>
        </div>
      </div>

      {/* 3. Activity & 3-Step Observed Facial Expression Progression */}
      <div className="glass-card flex-between" style={{ flexWrap: 'wrap', gap: '1.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
            Activity Played
          </span>
          <h3 style={{ fontSize: '1.5rem', color: '#0f172a' }}>
            🎮 {session.recommendedGame || session.activityName}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Score: <strong style={{ color: '#059669', fontSize: '1.1rem' }}>{session.score}%</strong> • Accuracy: <strong style={{ color: '#0284c7' }}>{session.accuracy}%</strong>
          </div>
        </div>

        {/* 3-Step Checkpoint Progression */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              1. Initial Entry
            </span>
            <EmotionBadge emotion={initialItem.emotion} size="md" />
          </div>

          {duringItem && (
            <>
              <span style={{ fontSize: '1.4rem', color: '#94a3b8', fontWeight: 700 }}>→</span>
              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '0.6rem 0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  2. During (10s)
                </span>
                <EmotionBadge emotion={duringItem.emotion} size="md" />
              </div>
            </>
          )}

          <span style={{ fontSize: '1.4rem', color: '#94a3b8', fontWeight: 700 }}>→</span>

          <div style={{ textAlign: 'center', background: '#ecfdf5', padding: '0.6rem 0.85rem', borderRadius: '14px', border: '1.5px solid #a7f3d0' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              3. Final Victory
            </span>
            <EmotionBadge emotion={finalItem.emotion} size="md" />
          </div>
        </div>
      </div>

      {/* 4. Observed Expression Timeline Flow Chart */}
      <EmotionTimelineChart timeline={session.emotionTimeline} />

      {/* 5. Performance Metrics Visual Chart */}
      <PerformanceChart session={session} />

      {/* 6. Developmental Observational Indicators Dashboard */}
      <DevelopmentalIndicatorsDashboard session={session} />

      {/* 7. Action Navigation Buttons */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button onClick={onViewReports} className="btn btn-primary btn-lg">
          <BarChart3 size={20} />
          <span>View Progress Reports</span>
        </button>
        <button onClick={onStartNew} className="btn btn-outline btn-lg">
          <PlayCircle size={20} />
          <span>Start Another Adventure</span>
        </button>
      </div>
    </div>
  );
};

export default SessionResultsPage;
