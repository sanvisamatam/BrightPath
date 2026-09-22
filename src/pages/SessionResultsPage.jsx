import React from 'react';
import { Award, CheckCircle2, PlayCircle, BarChart3, Clock, Sparkles, User } from 'lucide-react';
import EmotionTimelineChart from '../components/charts/EmotionTimelineChart';
import PerformanceChart from '../components/charts/PerformanceChart';
import DevelopmentalIndicatorsDashboard from '../components/charts/DevelopmentalIndicatorsDashboard';
import EmotionBadge from '../components/common/EmotionBadge';

export const SessionResultsPage = ({ session, onViewReports, onStartNew }) => {
  if (!session) return null;

  const initialItem = session.emotionTimeline?.find(item => item.checkpoint === 'initial') || { emotion: session.initialEmotion };
  const duringItem = session.emotionTimeline?.find(item => item.checkpoint === 'during');
  const finalItem = session.emotionTimeline?.find(item => item.checkpoint === 'final') || { emotion: session.finalEmotion };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '2.5rem 2rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(236,253,245,0.9) 0%, rgba(238,242,255,0.9) 100%)',
        border: '1px solid #a7f3d0'
      }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
          <CheckCircle2 size={38} />
        </div>

        <h1 style={{ fontSize: '2.2rem', color: '#065f46', marginBottom: '0.5rem' }}>
          Session Complete & Saved!
        </h1>
        <p style={{ color: '#047857', fontSize: '1rem', maxWidth: '580px', margin: '0 auto' }}>
          Great effort! The session telemetry, 3-stage observed expression timeline, and developmental interaction indicators have been recorded.
        </p>

        {session.childName && (
          <div style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ffffff', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
            <User size={14} color="var(--color-primary)" />
            <span>Child: {session.childName} (Age {session.childAge})</span>
            <span style={{ color: 'var(--text-muted)' }}>• {session.activityMode === 'early' ? 'Early Mode' : 'BrightPath Mode'}</span>
          </div>
        )}
      </div>

      {/* Emotion Shift Summary Card */}
      <div className="glass-card flex-between" style={{ flexWrap: 'wrap', gap: '1.5rem', background: '#ffffff' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
            ACTIVITY PLAYED
          </span>
          <h3 style={{ fontSize: '1.4rem', color: '#0f172a' }}>{session.recommendedGame || session.activityName}</h3>
        </div>

        {/* 3-Step Observed Facial Expression Progression */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Initial</span>
            <EmotionBadge emotion={initialItem.emotion} size="md" />
          </div>

          {duringItem && (
            <>
              <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 700 }}>→</span>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>During (10s)</span>
                <EmotionBadge emotion={duringItem.emotion} size="md" />
              </div>
            </>
          )}

          <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 700 }}>→</span>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Final</span>
            <EmotionBadge emotion={finalItem.emotion} size="md" />
          </div>
        </div>
      </div>

      {/* Observed Expression Timeline Chart */}
      <EmotionTimelineChart timeline={session.emotionTimeline} />

      {/* Performance Metrics Chart */}
      <PerformanceChart session={session} />

      {/* 5 NEW Developmental Observational Indicators Dashboard */}
      <DevelopmentalIndicatorsDashboard session={session} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
        <button onClick={onViewReports} className="btn btn-primary btn-lg">
          <BarChart3 size={20} />
          <span>View Progress Reports</span>
        </button>
        <button onClick={onStartNew} className="btn btn-outline btn-lg">
          <PlayCircle size={20} />
          <span>Start Another Session</span>
        </button>
      </div>
    </div>
  );
};

export default SessionResultsPage;
