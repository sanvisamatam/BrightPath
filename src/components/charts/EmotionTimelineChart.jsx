import React from 'react';
import EmotionBadge from '../common/EmotionBadge';

export const EmotionTimelineChart = ({ timeline = [] }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No emotional timeline samples recorded.
      </div>
    );
  }

  const formatCheckpointName = (checkpointKey, idx) => {
    if (!checkpointKey) return `Checkpoint ${idx + 1}`;
    const key = checkpointKey.toLowerCase();
    if (key === 'initial') return 'Initial';
    if (key === 'during') return 'During Game (10s)';
    if (key === 'final') return 'Final';
    return checkpointKey;
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#1e293b' }}>
        Observed Emotional Progression Timeline
      </h3>
      <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Three independent client-side AI webcam observations recorded at session checkpoints (Initial → During Game → Final).
      </p>

      {/* Visual Timeline Flow */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        gap: '0.75rem',
        overflowX: 'auto',
        padding: '1.25rem 0.75rem',
        background: '#f8fafc',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #e2e8f0'
      }}>
        {timeline.map((sample, idx) => (
          <React.Fragment key={idx}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '140px',
              padding: '0.85rem',
              background: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              border: sample.checkpoint === 'final' ? '1.5px solid #10b981' : (sample.checkpoint === 'during' ? '1.5px solid #6366f1' : '1.5px solid #cbd5e1'),
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                {formatCheckpointName(sample.checkpoint, idx)}
              </span>

              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                ⏱️ {sample.timestamp || '00:00'}
              </span>

              <EmotionBadge emotion={sample.emotion} size="md" />

              {sample.confidence && (
                <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginTop: '0.4rem' }}>
                  {Math.round(sample.confidence * 100)}% Conf.
                </span>
              )}

              {sample.isDemo && (
                <span style={{ fontSize: '0.65rem', color: '#be185d', marginTop: '0.25rem', fontWeight: 600 }}>
                  Simulated (Demo)
                </span>
              )}
            </div>

            {idx < timeline.length - 1 && (
              <div style={{ color: '#94a3b8', fontSize: '1.4rem', fontWeight: 700, flexShrink: 0 }}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default EmotionTimelineChart;
