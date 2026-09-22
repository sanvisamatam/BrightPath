import React from 'react';
import { Award, Target, Zap, Clock, AlertCircle, HelpCircle } from 'lucide-react';

export const PerformanceChart = ({ session }) => {
  if (!session) return null;

  const score = session.score || 0;
  const accuracy = session.accuracy || 100;
  const responseTime = session.responseTime || 2.5;
  const completionTime = session.completionTime || 120;
  const mistakes = session.mistakes || 0;
  const hintsUsed = session.hintsUsed || 0;
  const engagement = session.engagement || 'High';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#1e293b' }}>
        Gameplay Performance Analysis
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {/* Metric 1: Overall Score */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Award size={16} /> Score
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
            {score} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <div style={{ background: '#e2e8f0', borderRadius: '9999px', height: '6px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ background: 'var(--color-primary)', height: '100%', width: `${score}%` }}></div>
          </div>
        </div>

        {/* Metric 2: Accuracy */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Target size={16} /> Accuracy
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
            {accuracy}%
          </div>
          <div style={{ background: '#e2e8f0', borderRadius: '9999px', height: '6px', marginTop: '0.5rem', overflow: 'hidden' }}>
            <div style={{ background: '#10b981', height: '100%', width: `${accuracy}%` }}></div>
          </div>
        </div>

        {/* Metric 3: Response Time */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Zap size={16} /> Avg Response
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
            {responseTime}s
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Per challenge item</span>
        </div>

        {/* Metric 4: Completion Time */}
        <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            <Clock size={16} /> Total Time
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
            {formatTime(completionTime)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Session duration</span>
        </div>
      </div>

      {/* Secondary Stats */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Mistakes: </span>
          <strong style={{ color: '#0f172a' }}>{mistakes}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Hints Used: </span>
          <strong style={{ color: '#0f172a' }}>{hintsUsed}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Engagement: </span>
          <span className="badge" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
            {engagement}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
