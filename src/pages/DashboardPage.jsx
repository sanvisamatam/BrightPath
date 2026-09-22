import React, { useState, useEffect } from 'react';
import { PlayCircle, BarChart3, Clock, Trophy, Sparkles, TrendingUp, Calendar, ArrowRight, User, UserPlus, Activity, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, getChildSessions, getChildProgress } from '../services/sessionStorage';
import EmotionBadge from '../components/common/EmotionBadge';

export const DashboardPage = ({ onNavigate, onSelectSession }) => {
  const { userProfile, activeChild, childrenList, setActiveChild } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [childProgress, setChildProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionData = async () => {
      setLoading(true);
      if (activeChild?.childId) {
        const childList = await getChildSessions(activeChild.childId);
        setSessions(childList);
        const prog = await getChildProgress(activeChild.childId);
        setChildProgress(prog);
      } else if (userProfile?.userId) {
        const userList = await getUserSessions(userProfile.userId);
        setSessions(userList);
      }
      setLoading(false);
    };

    fetchSessionData();
  }, [userProfile, activeChild]);

  // Compute metrics
  const totalSessions = sessions.length;
  const recentSession = sessions.length > 0 ? sessions[0] : null;
  const avgScore = totalSessions > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome & Active Child Banner */}
      <div className="glass-card" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(13, 148, 136, 0.08) 100%)',
        border: '1px solid rgba(79, 70, 229, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2rem', color: '#0f172a', margin: 0 }}>
              Welcome, {userProfile?.name || 'Caregiver'}!
            </h1>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', background: '#e0e7ff', color: '#3730a3' }}>
              {userProfile?.role || 'Parent'}
            </span>
          </div>

          {/* Active Child Selector Pill */}
          {activeChild ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
                Active Child: <strong>{activeChild.name}</strong> (Age {activeChild.age})
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.15rem 0.6rem',
                borderRadius: '9999px',
                background: activeChild.mode === 'early' ? '#dbeafe' : '#f3e8ff',
                color: activeChild.mode === 'early' ? '#1d4ed8' : '#6b21a8'
              }}>
                {activeChild.mode === 'early' ? 'Early Mode (Ages 3–6)' : 'BrightPath Mode (Ages 7–17)'}
              </span>

              {childrenList.length > 1 && (
                <select
                  value={activeChild.childId}
                  onChange={(e) => {
                    const sel = childrenList.find(c => c.childId === e.target.value);
                    if (sel) setActiveChild(sel);
                  }}
                  style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                >
                  {childrenList.map(c => (
                    <option key={c.childId} value={c.childId}>
                      Switch to {c.name} ({c.age}y)
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div style={{ marginTop: '0.4rem', color: '#b45309', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} />
              <span>No child profile selected. Please add a child profile to track progress.</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => onNavigate('start-session')} className="btn btn-primary btn-lg">
            <PlayCircle size={20} />
            <span>Start New Session</span>
          </button>
          <button onClick={() => onNavigate('reports')} className="btn btn-outline btn-lg">
            <BarChart3 size={20} />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid-4">
        {/* Metric 1 */}
        <div className="glass-card">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>TOTAL SESSIONS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PlayCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0f172a' }}>
            {totalSessions}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {activeChild ? `For ${activeChild.name}` : 'Completed sessions'}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="glass-card">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVERAGE SCORE</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#0f172a' }}>
            {avgScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across completed activities</span>
        </div>

        {/* Metric 3 */}
        <div className="glass-card">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>RECENT EXPRESSION TREND</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
            {recentSession ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flexWrap: 'wrap' }}>
                <EmotionBadge emotion={recentSession.initialEmotion} showIcon={false} />
                <span>→</span>
                <EmotionBadge emotion={recentSession.finalEmotion} showIcon={false} />
              </div>
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>No data yet</span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>Initial to final observed expression</span>
        </div>

        {/* Metric 4: Observational Motor/Repetition Summary */}
        <div className="glass-card">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>OBSERVATIONAL PATTERNS</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '0.25rem' }}>
            {childProgress ? `${childProgress.avgMotorAccuracy || 95}% Accuracy` : (recentSession ? `${recentSession.accuracy}% Accuracy` : 'No telemetry')}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'block' }}>
            Avg repetition: {childProgress?.avgRepetitionFreq || 0} / min
          </span>
        </div>
      </div>

      {/* Recent Sessions List */}
      <div className="glass-card">
        <div className="flex-between mb-3">
          <h2 style={{ fontSize: '1.25rem' }}>
            {activeChild ? `Recent Sessions for ${activeChild.name}` : 'Recent Game Sessions'}
          </h2>
          {sessions.length > 0 && (
            <button onClick={() => onNavigate('reports')} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              View All Reports
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading session records...</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1.5px dashed #cbd5e1' }}>
            <Sparkles size={36} color="var(--color-primary)" style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Sessions Recorded Yet</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.25rem auto' }}>
              Start your first emotion-guided session to detect expressions, play tailored activities, and record developmental interaction indicators.
            </p>
            <button onClick={() => onNavigate('start-session')} className="btn btn-primary">
              <PlayCircle size={18} />
              <span>Start First Session</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--color-primary-light)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {s.activityMode === 'early' ? '🎈' : '🎮'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', color: '#0f172a' }}>{s.recommendedGame || s.activityName}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={12} /> {new Date(s.createdAt || s.startTime).toLocaleDateString()} at {new Date(s.createdAt || s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {s.childName && ` • ${s.childName} (${s.childAge}y)`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Observed Shift</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <EmotionBadge emotion={s.initialEmotion} showIcon={false} />
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>→</span>
                      <EmotionBadge emotion={s.finalEmotion} showIcon={false} />
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Score</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{s.score}%</strong>
                  </div>

                  <button
                    onClick={() => onSelectSession(s)}
                    className="btn btn-outline"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
