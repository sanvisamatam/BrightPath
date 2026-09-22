import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Filter, Calendar, PlayCircle, Eye, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, getChildSessions } from '../services/sessionStorage';
import EmotionBadge from '../components/common/EmotionBadge';
import SessionDetailPage from './SessionDetailPage';
import { EMOTIONS } from '../services/emotionDetector';

export const ReportsPage = ({ onSelectSession, selectedSession, onClearSelectedSession }) => {
  const { userProfile, activeChild, childrenList, setActiveChild } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEmotion, setFilterEmotion] = useState('ALL');
  const [filterChildId, setFilterChildId] = useState(activeChild?.childId || 'ALL');

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
      {/* Header */}
      <div className="glass-card flex-between" style={{ flexWrap: 'wrap', gap: '1.5rem', padding: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '0.4rem' }}>
            Caregiver Progress & Observational Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Review past activity sessions, observed expression transitions, and developmental interaction indicators.
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
                style={{ padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', cursor: 'pointer' }}
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
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
            >
              All Expressions
            </button>
            {Object.values(EMOTIONS).slice(0, 5).map((emo) => (
              <button
                key={emo}
                onClick={() => setFilterEmotion(emo)}
                className={`btn ${filterEmotion === emo ? 'btn-primary' : 'btn-outline'}`}
                style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
              >
                {emo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports List Grid */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading reports history...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <BarChart3 size={40} color="var(--color-primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Reports Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try selecting another filter or complete an activity session to generate reports.
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {filteredSessions.map((s) => (
            <div
              key={s.id}
              className="glass-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div>
                <div className="flex-between mb-2">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} /> {new Date(s.createdAt || s.startTime).toLocaleDateString()}
                  </span>
                  <span className="badge" style={{
                    background: s.activityMode === 'early' ? '#dbeafe' : '#f3e8ff',
                    color: s.activityMode === 'early' ? '#1d4ed8' : '#7c3aed'
                  }}>
                    {s.childName ? `${s.childName} (${s.childAge}y)` : (s.activityMode === 'early' ? 'Early Mode' : 'BrightPath Mode')}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.75rem' }}>
                  {s.recommendedGame || s.activityName}
                </h3>

                <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Initial</span>
                    <EmotionBadge emotion={s.initialEmotion} showIcon={false} />
                  </div>
                  <span style={{ color: '#cbd5e1', fontWeight: 700 }}>→</span>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Final</span>
                    <EmotionBadge emotion={s.finalEmotion} showIcon={false} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Score</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{s.score}%</strong>
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
    </div>
  );
};

export default ReportsPage;
