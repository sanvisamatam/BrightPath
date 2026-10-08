import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Eye, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, getChildSessions } from '../services/sessionStorage';
import EmotionBadge from '../components/common/EmotionBadge';
import SessionDetailPage from './SessionDetailPage';
import { EMOTIONS } from '../services/emotionDetector';
import MultiSessionProgressChart from '../components/charts/MultiSessionProgressChart';
import GamePerformanceBarChart from '../components/charts/GamePerformanceBarChart';
import EmotionTrendDistributionChart from '../components/charts/EmotionTrendDistributionChart';
import { SunnyStar } from '../components/common/CuteIllustrations';

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
    </div>
  );
};

export default ReportsPage;
