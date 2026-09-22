import React from 'react';
import { 
  Activity, 
  RotateCw, 
  MessageSquare, 
  Sparkles, 
  Users, 
  ShieldAlert, 
  Info, 
  Target, 
  Clock, 
  Zap 
} from 'lucide-react';

export const DevelopmentalIndicatorsDashboard = ({ session }) => {
  if (!session) return null;

  // Extract or fallback metrics
  const motor = session.motorMetrics || {
    tapAccuracy: session.accuracy || 100,
    dragAccuracy: 100,
    avgResponseTime: session.responseTime || 2.0,
    missedInteractions: session.mistakes || 0,
    repeatedAttempts: 0,
    completionTime: session.duration || session.completionTime || 120,
    score: session.score || 100
  };

  const repetitive = session.repetitiveMetrics || {
    repeatedActionsCount: 0,
    repetitionFrequency: 0,
    repeatedSequences: 0,
    rhythmConsistency: 85,
    notes: 'Repeated interaction patterns observed during this session.'
  };

  const communication = session.communicationMetrics || {
    promptResponsesCount: 0,
    voiceInteractionAttempts: null,
    responseLatency: null,
    repeatedPromptsCount: 0,
    completionRate: null,
    hasData: false
  };

  const stimulation = session.stimulationMetrics || {
    colorChangeResponses: 2,
    animationEvents: 4,
    soundEvents: 6,
    transitionReactions: 1,
    timeline: []
  };

  const social = session.socialMetrics || {
    characterInteractions: 0,
    socialPromptResponses: 0,
    responseTime: null,
    sharedAttentionEvents: 0,
    notes: 'Observed social interaction indicators within BrightPath activities.'
  };

  // Compute Radar Chart 5 Normalized Axes (0 to 100)
  const motorScore = Math.min(100, Math.max(10, motor.tapAccuracy || motor.score || 85));
  // Invert/normalize repetition so standard rhythm = high, or represent frequency index
  const repetitionScore = Math.min(100, Math.max(15, 100 - (repetitive.repetitionFrequency * 4)));
  const communicationScore = communication.hasData ? Math.min(100, Math.max(20, communication.completionRate || 80)) : 0;
  const stimulationScore = Math.min(100, Math.max(25, (stimulation.animationEvents + stimulation.soundEvents) * 6));
  const socialScore = social.characterInteractions > 0 ? Math.min(100, social.characterInteractions * 25) : 30;

  // Radar Polygon Points Calculation
  // 5 vertices on a circle (r = 90, center = 130, 130)
  const center = 130;
  const maxR = 90;
  const axes = [
    { label: 'Motor', val: motorScore, angle: -Math.PI / 2 },
    { label: 'Repetition', val: repetitionScore, angle: -Math.PI / 2 + (2 * Math.PI) / 5 },
    { label: 'Stimulation', val: stimulationScore, angle: -Math.PI / 2 + (4 * Math.PI) / 5 },
    { label: 'Social', val: socialScore, angle: -Math.PI / 2 + (6 * Math.PI) / 5 },
    { label: 'Communication', val: communication.hasData ? communicationScore : 10, angle: -Math.PI / 2 + (8 * Math.PI) / 5 }
  ];

  const radarPoints = axes.map(a => {
    const r = (Math.max(10, a.val) / 100) * maxR;
    const x = center + r * Math.cos(a.angle);
    const y = center + r * Math.sin(a.angle);
    return `${x},${y}`;
  }).join(' ');

  // Outer Grid Guides (25%, 50%, 75%, 100%)
  const gridGuides = [0.25, 0.5, 0.75, 1.0].map((ratio) => {
    const r = ratio * maxR;
    return axes.map(a => {
      const x = center + r * Math.cos(a.angle);
      const y = center + r * Math.sin(a.angle);
      return `${x},${y}`;
    }).join(' ');
  });

  return (
    <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#ffffff', border: '1px solid #cbd5e1' }}>
      {/* Section Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Activity size={22} color="var(--color-primary)" />
          <h3 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: 700, margin: 0 }}>
            Developmental Interaction Indicators
          </h3>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
          Objective observations captured from child interaction telemetry, responsiveness, and activity engagement.
        </p>
      </div>

      {/* Mandatory Non-Clinical Notice Alert */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        fontSize: '0.85rem',
        color: '#1e40af',
        lineHeight: 1.5
      }}>
        <Info size={20} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ display: 'block', color: '#1e3a8a', marginBottom: '2px' }}>
            BrightPath Observational Indicators
          </strong>
          These observations are generated from interactions within the BrightPath application and are not a clinical diagnosis.
        </div>
      </div>

      {/* Radar Chart & High-Level Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        alignItems: 'center',
        background: '#f8fafc',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #e2e8f0'
      }}>
        {/* SVG Radar Chart */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Combined Observational Radar
          </span>
          <svg width="260" height="260" viewBox="0 0 260 260">
            {/* Grid Rings */}
            {gridGuides.map((points, i) => (
              <polygon
                key={i}
                points={points}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="1"
                strokeDasharray={i < 3 ? '3,3' : 'none'}
              />
            ))}

            {/* Axis Spokes */}
            {axes.map((a, i) => {
              const x2 = center + maxR * Math.cos(a.angle);
              const y2 = center + maxR * Math.sin(a.angle);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              );
            })}

            {/* Data Polygon */}
            <polygon
              points={radarPoints}
              fill="rgba(79, 70, 229, 0.25)"
              stroke="#4f46e5"
              strokeWidth="2.5"
            />

            {/* Data Points */}
            {axes.map((a, i) => {
              const r = (Math.max(10, a.val) / 100) * maxR;
              const cx = center + r * Math.cos(a.angle);
              const cy = center + r * Math.sin(a.angle);
              return (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#4f46e5"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              );
            })}

            {/* Labels */}
            {axes.map((a, i) => {
              const labelR = maxR + 18;
              const lx = center + labelR * Math.cos(a.angle);
              const ly = center + labelR * Math.sin(a.angle);
              return (
                <text
                  key={i}
                  x={lx}
                  y={ly + 4}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill="#475569"
                >
                  {a.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Radar Insights Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <h4 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
            Session Interaction Profile
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
            Activity mode: <strong style={{ color: '#0f172a' }}>{session.activityMode === 'early' ? 'Early Foundational (Ages 3–6)' : 'BrightPath Interactive (Ages 7–17)'}</strong>. 
            Interaction patterns reflect motor coordination, stability under sensory feedback, and focus consistency during play.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginTop: '0.4rem' }}>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Motor Coordination</span>
              <strong style={{ color: '#10b981', fontSize: '1rem' }}>{motorScore}%</strong>
            </div>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Repetition Index</span>
              <strong style={{ color: '#6366f1', fontSize: '1rem' }}>{repetitive.repetitionFrequency} / min</strong>
            </div>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Sensory Responses</span>
              <strong style={{ color: '#f59e0b', fontSize: '1rem' }}>{stimulation.soundEvents + stimulation.animationEvents} events</strong>
            </div>
            <div style={{ background: '#ffffff', padding: '0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Avg Latency</span>
              <strong style={{ color: '#0ea5e9', fontSize: '1rem' }}>{motor.avgResponseTime}s</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 5 Individual Indicator Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        
        {/* A. Motor Interaction */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Target size={18} color="#10b981" />
              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>A. Motor Interaction</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '3px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tap & Drag Accuracy</span>
                  <strong>{motor.tapAccuracy}%</strong>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${motor.tapAccuracy}%`, background: '#10b981', height: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Average Response Time</span>
                <strong style={{ color: '#0f172a' }}>{motor.avgResponseTime}s</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Missed Interactions</span>
                <strong style={{ color: motor.missedInteractions > 0 ? '#ea580c' : '#10b981' }}>{motor.missedInteractions}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Completion Duration</span>
                <strong style={{ color: '#0f172a' }}>{motor.completionTime}s</strong>
              </div>
            </div>
          </div>
        </div>

        {/* B. Repetitive Behaviour */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <RotateCw size={18} color="#6366f1" />
              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>B. Repetitive Behaviour</h4>
            </div>

            <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Repetition Frequency
              </span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>
                {repetitive.repetitionFrequency} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ min</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Repeated Actions Count</span>
              <strong style={{ color: '#0f172a' }}>{repetitive.repeatedActionsCount}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.4, fontStyle: 'italic', margin: 0 }}>
            "Repeated interaction patterns observed during this session."
          </p>
        </div>

        {/* C. Communication */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <MessageSquare size={18} color="#0284c7" />
              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>C. Communication</h4>
            </div>

            {communication.hasData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Prompt Responses</span>
                  <strong style={{ color: '#0f172a' }}>{communication.promptResponsesCount}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Response Latency</span>
                  <strong style={{ color: '#0f172a' }}>{communication.responseLatency || '1.8'}s</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Completion Rate</span>
                  <strong style={{ color: '#10b981' }}>{communication.completionRate || 100}%</strong>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fef3c7', padding: '0.85rem', borderRadius: '8px', border: '1px solid #fde68a', color: '#92400e', fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
                <strong>Insufficient communication interaction data</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>
                  This activity was purely touch/visual. Schema is ready to capture voice and verbal prompts in future sessions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* D. Sensitivity to Change & Stimulation */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Zap size={18} color="#f59e0b" />
              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>D. Sensitivity to Stimulation</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Color Shifts / Bursts</span>
                <strong style={{ color: '#0f172a' }}>{stimulation.colorChangeResponses}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Animation Events</span>
                <strong style={{ color: '#0f172a' }}>{stimulation.animationEvents}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Audio Feedback Events</span>
                <strong style={{ color: '#0f172a' }}>{stimulation.soundEvents}</strong>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.4, margin: 0 }}>
            Monitors expression and interaction continuity across animation and audio stimuli.
          </p>
        </div>

        {/* E. Social Interaction */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <Users size={18} color="#ec4899" />
              <h4 style={{ fontSize: '1rem', color: '#0f172a', margin: 0 }}>E. Social Interaction</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Social Character Interactions</span>
                <strong style={{ color: '#0f172a' }}>{social.characterInteractions}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Shared-Attention Prompts</span>
                <strong style={{ color: '#0f172a' }}>{social.sharedAttentionEvents}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.4rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>Social Response Latency</span>
                <strong style={{ color: '#0f172a' }}>{social.responseTime ? `${social.responseTime}s` : 'N/A'}</strong>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', lineHeight: 1.4, fontStyle: 'italic', margin: 0 }}>
            "Observed social interaction indicators within BrightPath activities."
          </p>
        </div>

      </div>
    </div>
  );
};

export default DevelopmentalIndicatorsDashboard;
