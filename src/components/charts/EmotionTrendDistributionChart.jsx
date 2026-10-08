import React from 'react';
import { Sparkles, TrendingUp, Smile, Meh, Frown, Flame, AlertCircle } from 'lucide-react';
import EmotionBadge from '../common/EmotionBadge';
import { CuteEmotionBuddy } from '../common/CuteIllustrations';

export const EmotionTrendDistributionChart = ({ sessions = [] }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <CuteEmotionBuddy size={56} />
        <h4 style={{ fontSize: '1.25rem', color: '#0f172a', marginTop: '0.75rem', marginBottom: '0.4rem' }}>
          No sessions yet! Let's play a game! 🌟
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          As sessions are completed, this section maps observed emotional shifts from initial check-in to post-game victory.
        </p>
      </div>
    );
  }

  // Count initial vs final emotions
  const initialCounts = { Happy: 0, Sad: 0, Neutral: 0, Angry: 0, Frustrated: 0 };
  const finalCounts = { Happy: 0, Sad: 0, Neutral: 0, Angry: 0, Frustrated: 0 };

  sessions.forEach(s => {
    if (s.initialEmotion && initialCounts[s.initialEmotion] !== undefined) {
      initialCounts[s.initialEmotion] += 1;
    }
    if (s.finalEmotion && finalCounts[s.finalEmotion] !== undefined) {
      finalCounts[s.finalEmotion] += 1;
    }
  });

  const total = sessions.length;
  // Calculate positive final rate (Happy or Neutral)
  const positiveFinalCount = (finalCounts.Happy || 0) + (finalCounts.Neutral || 0);
  const positiveRate = Math.round((positiveFinalCount / total) * 100);

  const emotionsList = [
    { name: 'Happy', color: '#10b981', bg: '#ecfdf5', icon: '😊' },
    { name: 'Neutral', color: '#8b5cf6', bg: '#f5f3ff', icon: '😐' },
    { name: 'Sad', color: '#3b82f6', bg: '#eff6ff', icon: '😢' },
    { name: 'Frustrated', color: '#ec4899', bg: '#fdf2f8', icon: '😤' },
    { name: 'Angry', color: '#f97316', bg: '#ffedd5', icon: '😠' }
  ];

  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🌈</span>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
              Observed Expression Shifts & Mood Uplift
            </h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            Comparison of observed emotions recorded at initial entry vs game completion
          </p>
        </div>

        {/* Uplift Badge */}
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #e0e7ff 100%)',
          border: '1.5px solid #a7f3d0',
          padding: '0.5rem 1rem',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Sparkles size={20} color="#059669" />
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
              Positive/Calm Outcome Rate
            </div>
            <strong style={{ fontSize: '1.15rem', color: '#065f46' }}>{positiveRate}% of sessions</strong>
          </div>
        </div>
      </div>

      {/* Comparative Horizontal Emotion Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {emotionsList.map(emo => {
          const initCount = initialCounts[emo.name] || 0;
          const finCount = finalCounts[emo.name] || 0;
          const initPct = total > 0 ? Math.round((initCount / total) * 100) : 0;
          const finPct = total > 0 ? Math.round((finCount / total) * 100) : 0;

          return (
            <div
              key={emo.name}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#1e293b' }}>
                  <span>{emo.icon}</span>
                  <span>{emo.name}</span>
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Start: <strong>{initCount} ({initPct}%)</strong> → End: <strong style={{ color: emo.color }}>{finCount} ({finPct}%)</strong>
                </span>
              </div>

              {/* Stacked comparison bar */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#e2e8f0', height: '10px', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  {/* Initial Bar */}
                  <div
                    style={{
                      width: `${initPct}%`,
                      background: '#94a3b8',
                      height: '100%',
                      borderRadius: '9999px',
                      transition: 'width 0.4s'
                    }}
                    title={`Initial: ${initPct}%`}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', width: '38px', textAlign: 'center' }}>Initial</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ flex: 1, background: '#e2e8f0', height: '10px', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
                  {/* Final Bar */}
                  <div
                    style={{
                      width: `${finPct}%`,
                      background: emo.color,
                      height: '100%',
                      borderRadius: '9999px',
                      transition: 'width 0.4s'
                    }}
                    title={`Final: ${finPct}%`}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: emo.color, width: '38px', textAlign: 'center' }}>Final</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmotionTrendDistributionChart;

