import React from 'react';
import { ArrowLeft, Printer, Calendar, Clock, Award, Target, Zap, ShieldCheck, Heart, User } from 'lucide-react';
import EmotionTimelineChart from '../components/charts/EmotionTimelineChart';
import PerformanceChart from '../components/charts/PerformanceChart';
import DevelopmentalIndicatorsDashboard from '../components/charts/DevelopmentalIndicatorsDashboard';
import EmotionBadge from '../components/common/EmotionBadge';

export const SessionDetailPage = ({ session, onBack }) => {
  if (!session) return null;

  const handlePrint = () => {
    window.print();
  };

  const initialItem = session.emotionTimeline?.find(item => item.checkpoint === 'initial') || { emotion: session.initialEmotion, confidence: session.initialConfidence };
  const duringItem = session.emotionTimeline?.find(item => item.checkpoint === 'during');
  const finalItem = session.emotionTimeline?.find(item => item.checkpoint === 'final') || { emotion: session.finalEmotion, confidence: session.finalConfidence };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Controls */}
      <div className="flex-between">
        <button onClick={onBack} className="btn btn-outline">
          <ArrowLeft size={18} />
          <span>Back to All Reports</span>
        </button>

        <button onClick={handlePrint} className="btn btn-secondary">
          <Printer size={18} />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-card" style={{ padding: '2.5rem 2rem', background: '#ffffff', border: '1px solid #cbd5e1' }}>
        {/* Report Document Header */}
        <div style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <div className="flex-between mb-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1.4rem' }}>
              <Heart size={24} /> BrightMinds Caregiver Report
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Session ID: #{session.id?.slice(-8)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <span>
              <strong>Child:</strong> {session.childName || 'Child'} (Age {session.childAge || 'N/A'})
            </span>
            <span>
              <strong>Mode:</strong> {session.activityMode === 'early' ? 'Early Mode (Ages 3–6)' : 'BrightPath Mode (Ages 7–17)'}
            </span>
            <span>
              <strong>Date:</strong> {new Date(session.createdAt || session.startTime).toLocaleDateString()}
            </span>
            <span>
              <strong>Activity:</strong> {session.recommendedGame || session.activityName}
            </span>
          </div>
        </div>

        {/* Executive Expression Overview */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
            Session Observed Expression Progression (3 Checkpoints)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>1. INITIAL OBSERVED EXPRESSION</span>
              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <EmotionBadge emotion={initialItem.emotion} size="lg" />
                {initialItem.confidence && (
                  <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                    ({Math.round(initialItem.confidence * 100)}%)
                  </span>
                )}
              </div>
            </div>

            {duringItem && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>2. DURING GAMEPLAY (10s)</span>
                <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <EmotionBadge emotion={duringItem.emotion} size="lg" />
                  {duringItem.confidence && (
                    <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                      ({Math.round(duringItem.confidence * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            )}

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>3. FINAL OBSERVED EXPRESSION</span>
              <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <EmotionBadge emotion={finalItem.emotion} size="lg" />
                {finalItem.confidence && (
                  <span style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 600 }}>
                    ({Math.round(finalItem.confidence * 100)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Observed Expression Progression Timeline */}
        <div style={{ marginBottom: '2rem' }}>
          <EmotionTimelineChart timeline={session.emotionTimeline} />
        </div>

        {/* Gameplay Performance Chart */}
        <div style={{ marginBottom: '2rem' }}>
          <PerformanceChart session={session} />
        </div>

        {/* 5 NEW Developmental Observational Indicators Dashboard */}
        <div style={{ marginBottom: '2rem' }}>
          <DevelopmentalIndicatorsDashboard session={session} />
        </div>

        {/* Non-Medical Disclaimer Footer */}
        <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          <strong>Notice for Caregivers:</strong> BrightMinds is an educational play and engagement support platform. Observed facial expression indicators and interaction metrics are generated from in-app activity telemetry. This report is not a psychological or medical diagnosis.
        </div>
      </div>
    </div>
  );
};

export default SessionDetailPage;
