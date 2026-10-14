import React, { useState, useEffect } from 'react';
import { AlertTriangle, BarChart3, Brain, Calendar, Eye, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, getChildSessions } from '../services/sessionStorage';
import EmotionBadge from '../components/common/EmotionBadge';
import SessionDetailPage from './SessionDetailPage';
import { EMOTIONS } from '../services/emotionDetector';
import MultiSessionProgressChart from '../components/charts/MultiSessionProgressChart';
import GamePerformanceBarChart from '../components/charts/GamePerformanceBarChart';
import EmotionTrendDistributionChart from '../components/charts/EmotionTrendDistributionChart';
import { SunnyStar } from '../components/common/CuteIllustrations';
import api from '../services/apiClient';

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Number(value) || 0));

const average = (values, fallback = 0) => {
  const valid = values.filter((value) => Number.isFinite(Number(value)));
  if (valid.length === 0) return fallback;
  return valid.reduce((sum, value) => sum + Number(value), 0) / valid.length;
};

const negativeEmotions = new Set(['Sad', 'Angry', 'Frustrated', 'Fear']);
const positiveEmotions = new Set(['Happy', 'Neutral']);

const normalizeDistribution = (items) => {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0) || 1;
  return items
    .map((item) => ({
      ...item,
      percentage: Math.round((Math.max(0, item.value) / total) * 100)
    }))
    .sort((a, b) => b.percentage - a.percentage);
};

const deriveAutismScreeningInsights = (sessions, activeChild) => {
  if (!sessions.length) {
    return {
      childLabel: activeChild?.name ? `${activeChild.name} (${activeChild.age}y)` : 'Selected child',
      level: 'Waiting for session data',
      supportEstimate: 'Complete sessions to estimate support pattern',
      profileType: 'No profile estimated yet',
      riskPercentage: 0,
      confidenceLabel: 'Not enough data',
      confidence: 0,
      agentSummary: 'BrightPath Agent will summarize autism screening patterns after at least one recorded session.',
      nextSteps: [
        'Complete a learning session first.',
        'Use the report only as an educational screening aid.',
        'Consult a qualified clinician for medical concerns.'
      ],
      redFlags: [],
      typeDistribution: [
        { label: 'Autistic Disorder-like', percentage: 0, color: '#6366f1' },
        { label: 'Asperger-like', percentage: 0, color: '#0d9488' },
        { label: 'CDD regression-alert', percentage: 0, color: '#f59e0b' },
        { label: 'PDD-NOS-like / mixed', percentage: 0, color: '#db2777' }
      ],
      metrics: [
        { label: 'Avg Score', value: '--' },
        { label: 'Avg Accuracy', value: '--' },
        { label: 'Response Time', value: '--' },
        { label: 'Repetition Rate', value: '--' }
      ]
    };
  }

  const avgScore = average(sessions.map((session) => session.score), 0);
  const avgAccuracy = average(sessions.map((session) => session.accuracy), 0);
  const avgMotorAccuracy = average(
    sessions.map((session) => session.motorMetrics?.tapAccuracy ?? session.accuracy),
    avgAccuracy
  );
  const avgResponseTime = average(
    sessions.map((session) => (
      session.motorMetrics?.avgResponseTime
      ?? session.communicationMetrics?.responseLatency
      ?? session.responseTime
      ?? 2
    )),
    2
  );
  const avgRepetitionFrequency = average(
    sessions.map((session) => session.repetitiveMetrics?.repetitionFrequency ?? 0),
    0
  );
  const negativeFinalRate = sessions.filter((session) => negativeEmotions.has(session.finalEmotion)).length / sessions.length;
  const positiveOutcomeRate = sessions.filter((session) => positiveEmotions.has(session.finalEmotion)).length / sessions.length;

  const performanceSignal = clamp(100 - ((avgScore + avgAccuracy) / 2));
  const motorSignal = clamp(100 - avgMotorAccuracy);
  const responseSignal = clamp(((avgResponseTime - 1.2) / 4.8) * 100);
  const repetitionSignal = clamp(avgRepetitionFrequency * 18);
  const emotionSignal = clamp((negativeFinalRate * 68) + ((1 - positiveOutcomeRate) * 32));

  const riskPercentage = Math.round(
    (performanceSignal * 0.24)
    + (motorSignal * 0.20)
    + (responseSignal * 0.20)
    + (repetitionSignal * 0.20)
    + (emotionSignal * 0.16)
  );

  let level = 'Low autism screening signal';
  if (riskPercentage >= 68) level = 'Very high autism screening signal';
  else if (riskPercentage >= 46) level = 'High autism screening signal';
  else if (riskPercentage >= 25) level = 'Moderate autism screening signal';

  let supportEstimate = 'No ASD support level estimated from current sessions';
  if (riskPercentage >= 68) supportEstimate = 'ASD Support Level 3 pattern: very substantial support likely needed';
  else if (riskPercentage >= 46) supportEstimate = 'ASD Support Level 2 pattern: substantial support likely needed';
  else if (riskPercentage >= 25) supportEstimate = 'ASD Support Level 1 pattern: support likely helpful';

  const regressionFlag = sessions.some((session) => (
    session.developmentalRegression === true
    || session.regressionHistory === true
    || session.diagnosticResults?.profile_type?.toLowerCase?.().includes('regression')
  ));

  let profileType = 'PDD-NOS-like / mixed ASD screening pattern';
  if (riskPercentage < 25) profileType = 'No strong ASD profile indicated by current sessions';
  else if (regressionFlag) profileType = 'Childhood Disintegrative Disorder regression-alert profile';
  else if (avgRepetitionFrequency >= 2.5 && avgResponseTime > 3.2) profileType = 'Autistic Disorder-like historical profile';
  else if (avgRepetitionFrequency >= 1.4 && avgScore >= 65) profileType = 'Asperger-like historical profile';

  const typeDistribution = normalizeDistribution([
    {
      label: 'Autistic Disorder-like',
      color: '#6366f1',
      value: 26 + (repetitionSignal * 0.32) + (responseSignal * 0.24) + (motorSignal * 0.20)
    },
    {
      label: 'Asperger-like',
      color: '#0d9488',
      value: 24 + (repetitionSignal * 0.28) + ((100 - performanceSignal) * 0.12) + ((100 - responseSignal) * 0.08)
    },
    {
      label: 'CDD regression-alert',
      color: '#f59e0b',
      value: regressionFlag ? 58 : 8 + (responseSignal * 0.08)
    },
    {
      label: 'PDD-NOS-like / mixed',
      color: '#db2777',
      value: 20 + (emotionSignal * 0.24) + (performanceSignal * 0.18)
    }
  ]);

  const confidence = Math.min(92, Math.round(62 + Math.min(sessions.length, 7) * 4));
  const confidenceLabel = confidence >= 82 ? 'High screening confidence' : 'Moderate screening confidence';
  const redFlags = [];
  if (regressionFlag) redFlags.push('Regression history should be discussed with a developmental clinician.');
  if (avgResponseTime >= 4) redFlags.push('Slow response pattern may need gentler pacing and clinical review if seen outside the app.');
  if (avgRepetitionFrequency >= 3) redFlags.push('High repetition frequency was observed across sessions.');

  return {
    childLabel: activeChild?.name ? `${activeChild.name} (${activeChild.age}y)` : 'All selected sessions',
    level,
    supportEstimate,
    profileType,
    riskPercentage,
    confidenceLabel,
    confidence,
    agentSummary: `${level}. Strongest current profile: ${profileType}. ${supportEstimate}. This is a non-diagnostic screening estimate based on BrightPath sessions.`,
    nextSteps: riskPercentage >= 46
      ? [
          'Share this report with a pediatrician, child psychologist, or developmental specialist.',
          'Track communication, sensory, routine-change, and peer-interaction patterns outside the game.',
          'Use visual schedules, predictable transitions, and low-sensory activity pacing.'
        ]
      : [
          'Continue observing patterns across home and school.',
          'Repeat screening after more sessions for a steadier trend.',
          'Consult a professional if caregiver concern remains high.'
        ],
    redFlags,
    typeDistribution,
    metrics: [
      { label: 'Avg Score', value: `${Math.round(avgScore)}%` },
      { label: 'Avg Accuracy', value: `${Math.round(avgAccuracy)}%` },
      { label: 'Response Time', value: `${avgResponseTime.toFixed(1)}s` },
      { label: 'Repetition Rate', value: `${avgRepetitionFrequency.toFixed(1)}/min` }
    ]
  };
};

export const ReportsPage = ({ onSelectSession, selectedSession, onClearSelectedSession }) => {
  const { userProfile, activeChild, childrenList, setActiveChild } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmotion, setFilterEmotion] = useState('ALL');
  const [filterChildId, setFilterChildId] = useState(activeChild?.childId || 'ALL');
  const [activeViewMode, setActiveViewMode] = useState('charts'); // 'charts' | 'records'

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      if (filterChildId && filterChildId !== 'ALL') {
        const list = await getChildSessions(filterChildId);
        setSessions(list);
      } else if (userProfile?.userId) {
        const list = await getUserSessions(userProfile.userId);
        setSessions(list);
      }
      setLoading(false);
    };

    fetchReports();
  }, [userProfile, filterChildId]);

  if (selectedSession) {
    return <SessionDetailPage session={selectedSession} onBack={onClearSelectedSession} />;
  }

  // Filter sessions by emotion
  const filteredSessions = sessions.filter((s) => {
    if (filterEmotion === 'ALL') return true;
    return s.initialEmotion === filterEmotion || s.finalEmotion === filterEmotion;
  });

  const [autismInsights, setAutismInsights] = useState(() => deriveAutismScreeningInsights(filteredSessions, activeChild));

  useEffect(() => {
    let active = true;
    const loadInsights = async () => {
      try {
        const res = await api.getAutismScreeningInsights(filteredSessions, activeChild);
        if (active && res && res.success && res.data) {
          setAutismInsights(res.data);
          return;
        }
      } catch (e) {
        console.info("Python screening insights deferred:", e.message);
      }
      if (active) {
        setAutismInsights(deriveAutismScreeningInsights(filteredSessions, activeChild));
      }
    };
    loadInsights();
    return () => { active = false; };
  }, [filteredSessions, activeChild]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Header Banner */}
      <div className="glass-card flex-between" style={{ flexWrap: 'wrap', gap: '1.5rem', padding: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '1.6rem' }}>📊</span>
            <h1 style={{ fontSize: '1.9rem', color: '#0f172a', margin: 0 }}>
              Caregiver Progress & Analytics Reports
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Visual graphs, skill growth tracking, and developmental observations across {sessions.length} recorded session{sessions.length > 1 ? 's' : ''}.
          </p>
        </div>

        {/* Filter Controls: Child Selector & Emotion Pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
          {/* Child Selector Dropdown if multiple children exist */}
          {childrenList.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Child:</span>
              <select
                value={filterChildId}
                onChange={(e) => setFilterChildId(e.target.value)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff', cursor: 'pointer' }}
              >
                <option value="ALL">All Children ({childrenList.length})</option>
                {childrenList.map(c => (
                  <option key={c.childId} value={c.childId}>
                    {c.name} (Age {c.age})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Emotion Filter Pills */}
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterEmotion('ALL')}
              className={`btn ${filterEmotion === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              All Emotions
            </button>
            {Object.values(EMOTIONS).slice(0, 5).map((emo) => (
              <button
                key={emo}
                onClick={() => setFilterEmotion(emo)}
                className={`btn ${filterEmotion === emo ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
              >
                {emo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. View Mode Switcher: Visual Graphs vs Individual Records */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: '#e2e8f0', padding: '0.35rem', borderRadius: '18px', display: 'flex', gap: '0.4rem' }}>
          <button
            onClick={() => setActiveViewMode('charts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '14px',
              border: 'none',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeViewMode === 'charts' ? '#ffffff' : 'transparent',
              color: activeViewMode === 'charts' ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow: activeViewMode === 'charts' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <TrendingUp size={16} />
            <span>Visual Analytics & Graphs</span>
          </button>
          <button
            onClick={() => setActiveViewMode('records')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '14px',
              border: 'none',
              fontFamily: 'Fredoka, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeViewMode === 'records' ? '#ffffff' : 'transparent',
              color: activeViewMode === 'records' ? 'var(--color-primary)' : 'var(--text-muted)',
              boxShadow: activeViewMode === 'records' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            <BarChart3 size={16} />
            <span>Session History Cards ({filteredSessions.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Visual Charts View (Requirement 4) */}
      {activeViewMode === 'charts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Timeline trend line graph */}
          <MultiSessionProgressChart sessions={filteredSessions} />

          {/* Comparative game bar chart & Emotion shift distribution */}
          <div className="grid-2">
            <GamePerformanceBarChart sessions={filteredSessions} />
            <EmotionTrendDistributionChart sessions={filteredSessions} />
          </div>
        </div>
      )}

      {/* 4. Session History Cards View */}
      {activeViewMode === 'records' && (
        <>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading reports history...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
              <SunnyStar size={64} animate={true} />
              <h3 style={{ fontSize: '1.25rem', margin: '1rem 0 0.5rem 0' }}>
                {sessions.length === 0 ? "No sessions yet! Let's play a game! 🌟" : "No Reports Match Filter"}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {sessions.length === 0 ? "Complete your first emotion-guided session to view detailed caregiver reports!" : "Try selecting 'All Emotions' to view recorded reports."}
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {filteredSessions.map((s) => (
                <div
                  key={s.id}
                  className="glass-card"
                  style={{
                    padding: '1.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div>
                    <div className="flex-between mb-2">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} /> {new Date(s.createdAt || s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="badge" style={{
                        background: s.activityMode === 'early' ? '#dbeafe' : '#f3e8ff',
                        color: s.activityMode === 'early' ? '#1d4ed8' : '#7c3aed'
                      }}>
                        {s.childName ? `${s.childName} (${s.childAge}y)` : (s.activityMode === 'early' ? 'Early Mode' : 'BrightPath Mode')}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                      🎮 {s.recommendedGame || s.activityName}
                    </h3>

                    <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '16px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Initial</span>
                        <EmotionBadge emotion={s.initialEmotion} showIcon={false} />
                      </div>
                      <span style={{ color: '#94a3b8', fontWeight: 700 }}>→</span>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Final</span>
                        <EmotionBadge emotion={s.finalEmotion} showIcon={false} />
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Score</span>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>{s.score}%</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSession(s)}
                    className="btn btn-outline"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    <Eye size={16} />
                    <span>View Full Session Report & Indicators</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 5. Autism Screening Prediction & Agent Insights - Bottom section requested */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          borderRadius: 'var(--radius-xl)',
          border: '2px solid #c7d2fe',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(238,242,255,0.94) 55%, rgba(236,253,245,0.92) 100%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.4rem'
        }}
      >
        <div className="flex-between" style={{ gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#e0e7ff',
                  color: 'var(--color-primary)'
                }}
              >
                <Brain size={22} />
              </span>
              <div>
                <h2 style={{ fontSize: '1.55rem', color: '#0f172a', margin: 0 }}>
                  Autism Screening Prediction & Agent Insights
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.15rem 0 0 0' }}>
                  Added at the bottom of the existing reports page for {autismInsights.childLabel}.
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #c7d2fe',
              borderRadius: '18px',
              padding: '0.75rem 1rem',
              minWidth: '170px',
              textAlign: 'center'
            }}
          >
            <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Screening Signal
            </span>
            <strong style={{ display: 'block', color: 'var(--color-primary)', fontSize: '1.7rem', lineHeight: 1.1 }}>
              {autismInsights.riskPercentage}%
            </strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
              {autismInsights.confidenceLabel}
            </span>
          </div>
        </div>

        <div className="grid-3" style={{ gap: '1rem' }}>
          <div style={{ background: '#ffffff', border: '1.5px solid #e0e7ff', borderRadius: '20px', padding: '1.1rem' }}>
            <ShieldCheck size={22} color="#4f46e5" />
            <h3 style={{ fontSize: '1rem', margin: '0.55rem 0 0.35rem 0' }}>Predicted Level</h3>
            <p style={{ color: '#1e293b', fontWeight: 700, margin: 0 }}>{autismInsights.level}</p>
          </div>
          <div style={{ background: '#ffffff', border: '1.5px solid #ccfbf1', borderRadius: '20px', padding: '1.1rem' }}>
            <Sparkles size={22} color="#0d9488" />
            <h3 style={{ fontSize: '1rem', margin: '0.55rem 0 0.35rem 0' }}>Support Estimate</h3>
            <p style={{ color: '#1e293b', fontWeight: 700, margin: 0 }}>{autismInsights.supportEstimate}</p>
          </div>
          <div style={{ background: '#ffffff', border: '1.5px solid #fce7f3', borderRadius: '20px', padding: '1.1rem' }}>
            <BarChart3 size={22} color="#db2777" />
            <h3 style={{ fontSize: '1rem', margin: '0.55rem 0 0.35rem 0' }}>Type Pattern</h3>
            <p style={{ color: '#1e293b', fontWeight: 700, margin: 0 }}>{autismInsights.profileType}</p>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '1rem', alignItems: 'stretch' }}>
          <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.08rem', marginBottom: '0.85rem' }}>Historical Type Fit</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {autismInsights.typeDistribution.map((item) => (
                <div key={item.label}>
                  <div className="flex-between" style={{ gap: '1rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: '#334155', fontWeight: 700, fontSize: '0.86rem' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.82rem' }}>{item.percentage}%</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{ width: `${item.percentage}%`, height: '100%', borderRadius: 999, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.08rem', marginBottom: '0.85rem' }}>BrightPath Agent Summary</h3>
            <p style={{ color: '#334155', fontSize: '0.93rem', margin: 0 }}>
              {autismInsights.agentSummary}
            </p>
            <div className="grid-4" style={{ gap: '0.6rem', marginTop: '1rem' }}>
              {autismInsights.metrics.map((metric) => (
                <div key={metric.label} style={{ background: '#f8fafc', borderRadius: '14px', padding: '0.75rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    {metric.label}
                  </span>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{metric.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gap: '1rem' }}>
          <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '20px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.7rem' }}>Recommended Next Steps</h3>
            <ul style={{ margin: 0, paddingLeft: '1.15rem', color: '#334155', fontSize: '0.9rem' }}>
              {autismInsights.nextSteps.map((step) => (
                <li key={step} style={{ marginBottom: '0.35rem' }}>{step}</li>
              ))}
            </ul>
          </div>

          <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: '20px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
              <AlertTriangle size={18} color="#ea580c" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Important Note</h3>
            </div>
            <p style={{ margin: 0, color: '#7c2d12', fontSize: '0.9rem' }}>
              This is a screening estimate from BrightPath activity data, not a clinical diagnosis. Formal autism assessment must be done by qualified medical or developmental professionals.
            </p>
            {autismInsights.redFlags.length > 0 && (
              <ul style={{ margin: '0.65rem 0 0 0', paddingLeft: '1.15rem', color: '#7c2d12', fontSize: '0.88rem' }}>
                {autismInsights.redFlags.map((flag) => (
                  <li key={flag}>{flag}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
