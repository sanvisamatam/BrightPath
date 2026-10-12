import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  BarChart3, 
  Calendar, 
  UserPlus, 
  RotateCw,
  Bell,
  Volume2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserSessions, getChildSessions, getChildProgress } from '../services/sessionStorage';
import EmotionBadge from '../components/common/EmotionBadge';
import { 
  PipOwl, 
  SunnyStar, 
  TrophyMascot, 
  CuteCalendarBuddy, 
  CuteMagnifierBuddy, 
  CuteEmotionBuddy,
  RainbowClouds,
  MayaExplorer,
  MiloMouse
} from '../components/common/CuteIllustrations';
import MultiSessionProgressChart from '../components/charts/MultiSessionProgressChart';
import GamePerformanceBarChart from '../components/charts/GamePerformanceBarChart';
import EmotionTrendDistributionChart from '../components/charts/EmotionTrendDistributionChart';
import keyboardAlertService from '../utils/keyboardAlert';
import rapidKeyAlarmService from '../utils/rapidKeyAlarm';


export const DashboardPage = ({ onNavigate, onSelectSession }) => {
  const { userProfile, activeChild, childrenList, setActiveChild } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [childProgress, setChildProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState('trends'); // 'trends' | 'comparison' | 'emotions'

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

  // Compute real metrics from existing sessions data
  const totalSessions = sessions.length;
  const recentSession = sessions.length > 0 ? sessions[0] : null;
  const avgScore = totalSessions > 0 
    ? Math.round(sessions.reduce((acc, s) => acc + (s.score || 0), 0) / totalSessions) 
    : 0;

  // Friendly feedback text generator
  const getScoreFeedback = () => {
    if (totalSessions === 0) return "No sessions yet! Let's play a game! 🌟";
    if (avgScore >= 90) return '🌟 Outstanding mastery!';
    if (avgScore >= 75) return '⭐ Great focus & effort!';
    return '🌱 Learning & growing every day!';
  };

  const getSessionsFeedback = () => {
    if (totalSessions === 0) return "No sessions yet! Let's play a game! 🌟";
    if (totalSessions >= 5) return '🎉 Fantastic learning momentum!';
    return '🌟 Wonderful progress underway!';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. Welcoming Hero Banner with Cute Mascots */}
      <div 
        className="glass-card" 
        style={{
          padding: '2.25rem 2rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(238, 242, 255, 0.95) 60%, rgba(236, 253, 245, 0.95) 100%)',
          border: '2px solid rgba(199, 210, 254, 0.8)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorative rainbow */}
        <div style={{ position: 'absolute', top: '-15px', right: '10px', opacity: 0.25, pointerEvents: 'none' }}>
          <RainbowClouds width={180} height={100} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Friendly Mascot Avatar */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #e0e7ff 0%, #ccfbf1 100%)',
              border: '3px solid #c7d2fe',
              boxShadow: '0 8px 16px rgba(79, 70, 229, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <PipOwl size={62} animate={true} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '2.1rem', color: '#0f172a', margin: 0 }}>
                  Welcome back, {userProfile?.name || 'Explorer'}! 🎈
                </h1>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '9999px', background: '#e0e7ff', color: '#3730a3' }}>
                  {userProfile?.role || 'Parent'}
                </span>
              </div>

              {/* Active Child Selector Pill */}
              {activeChild ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 600 }}>
                    Active Child: <strong>{activeChild.name}</strong> (Age {activeChild.age})
                  </span>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.65rem',
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
                      style={{ fontSize: '0.825rem', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}
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
                  <span>No child profile selected. Add a child to unlock tailored learning tracks!</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('start-session')} className="btn btn-primary btn-lg">
              <PlayCircle size={22} />
              <span>Start New Session</span>
            </button>
            <button onClick={() => onNavigate('reports')} className="btn btn-outline btn-lg">
              <BarChart3 size={20} />
              <span>Caregiver Reports</span>
            </button>
          </div>
        </div>

        {/* Child-friendly Keyboard Alert & Rapid Press Pill */}
        <div style={{
          marginTop: '1.25rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.8rem',
          fontSize: '0.85rem',
          color: '#475569'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Bell size={16} color="var(--color-primary)" />
            <span>
              <strong>Keyboard Safety Alerts:</strong> Press <strong>B + P</strong> together for alert chime, or rapid pressing (&gt;8 keys in 2s) triggers friendly slow-down alarm!
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => keyboardAlertService.playNoticeableBeep()}
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', borderRadius: '9999px' }}
              title="Test the child-friendly alert beep"
            >
              <Volume2 size={14} />
              <span>Test Beep 🔊</span>
            </button>
            <button
              onClick={() => {
                rapidKeyAlarmService.playAlarmSound();
                rapidKeyAlarmService.notifyListeners({
                  type: 'RAPID_KEYBOARD_ALARM',
                  message: 'Whoa! Slow down! 😊',
                  subMessage: "Let's take a little break! 🌟",
                  timestamp: Date.now()
                });
              }}
              className="btn btn-outline"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', borderRadius: '9999px' }}
              title="Test the rapid pressing slow-down alarm"
            >
              <span>Test Slow-Down 🌟</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REQUIREMENT 5: CUTE DASHBOARD CARDS WITH REAL DATA */}
      <div className="grid-4">
        
        {/* Card 1: Total Sessions */}
        <div className="cute-metric-card">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Sessions
            </span>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CuteCalendarBuddy size={46} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
              {totalSessions}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', fontWeight: 600 }}>
              {getSessionsFeedback()}
            </div>
          </div>
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {activeChild ? `Profile: ${activeChild.name}` : 'Completed activities'}
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="cute-metric-card gold">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Average Score
            </span>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrophyMascot size={46} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
              {totalSessions > 0 ? avgScore : '—'} <span style={{ fontSize: '1.1rem', color: '#94a3b8' }}>{totalSessions > 0 ? '/ 100' : ''}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#b45309', marginTop: '0.4rem', fontWeight: 600 }}>
              {getScoreFeedback()}
            </div>
          </div>
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across all mini-game challenges
          </div>
        </div>

        {/* Card 3: Recent Expression Trend */}
        <div className="cute-metric-card purple">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Recent Expression Trend
            </span>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CuteEmotionBuddy size={46} />
            </div>
          </div>
          <div>
            <div style={{ marginTop: '0.2rem' }}>
              {recentSession ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <EmotionBadge emotion={recentSession.initialEmotion} showIcon={false} />
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 700 }}>→</span>
                  <EmotionBadge emotion={recentSession.finalEmotion} showIcon={false} />
                </div>
              ) : (
                <div style={{ fontSize: '0.95rem', color: '#7c3aed', fontWeight: 700 }}>
                  No sessions yet! Let's play a game! 🌟
                </div>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginTop: '0.5rem', fontWeight: 600 }}>
              {recentSession ? 'Observed facial transition' : 'Start a game to detect expressions!'}
            </div>
          </div>
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Checkpoints: Initial to Victory
          </div>
        </div>

        {/* Card 4: Observational Patterns */}
        <div className="cute-metric-card orange">
          <div className="flex-between mb-2">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Observational Patterns
            </span>
            <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CuteMagnifierBuddy size={46} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: totalSessions > 0 ? '1.6rem' : '0.95rem', fontWeight: 700, color: totalSessions > 0 ? '#0f172a' : '#c2410c', lineHeight: 1.2 }}>
              {totalSessions === 0
                ? "No sessions yet! Let's play a game! 🌟"
                : (childProgress?.avgMotorAccuracy 
                  ? `${childProgress.avgMotorAccuracy}% Accuracy` 
                  : (recentSession ? `${recentSession.accuracy}% Accuracy` : 'No telemetry yet'))}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#ea580c', marginTop: '0.4rem', fontWeight: 600 }}>
              {totalSessions === 0 ? "Play a game to discover patterns!" : `Repetition: ${childProgress?.avgRepetitionFreq || 0} / min`}
            </div>
          </div>
          <div style={{ marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Non-medical sensory indicators
          </div>
        </div>
      </div>

      {/* 3. REQUIREMENT 4: VISUAL GRAPHS & PROGRESS CHARTS */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.8rem' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', color: '#0f172a', margin: 0 }}>
              🌟 Learning Progress & Visual Trends
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Interactive visual charts dynamically generated from your child's recorded gameplay sessions
            </p>
          </div>

          {/* Graph Tabs */}
          <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '16px' }}>
            <button
              onClick={() => setActiveChartTab('trends')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeChartTab === 'trends' ? '#ffffff' : 'transparent',
                color: activeChartTab === 'trends' ? 'var(--color-primary)' : 'var(--text-muted)',
                boxShadow: activeChartTab === 'trends' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              📈 Timeline Trends
            </button>
            <button
              onClick={() => setActiveChartTab('comparison')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeChartTab === 'comparison' ? '#ffffff' : 'transparent',
                color: activeChartTab === 'comparison' ? 'var(--color-primary)' : 'var(--text-muted)',
                boxShadow: activeChartTab === 'comparison' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              📊 Game Comparison
            </button>
            <button
              onClick={() => setActiveChartTab('emotions')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '12px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: activeChartTab === 'emotions' ? '#ffffff' : 'transparent',
                color: activeChartTab === 'emotions' ? 'var(--color-primary)' : 'var(--text-muted)',
                boxShadow: activeChartTab === 'emotions' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              🌈 Emotion Shifts
            </button>
          </div>
        </div>

        {/* Selected Chart Component */}
        {activeChartTab === 'trends' && (
          <MultiSessionProgressChart sessions={sessions} />
        )}
        {activeChartTab === 'comparison' && (
          <GamePerformanceBarChart sessions={sessions} />
        )}
        {activeChartTab === 'emotions' && (
          <EmotionTrendDistributionChart sessions={sessions} />
        )}
      </div>

      {/* 4. Recent Sessions List */}
      <div className="glass-card">

        <div className="flex-between mb-3">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎮</span>
            <h2 style={{ fontSize: '1.25rem', margin: 0 }}>
              {activeChild ? `Recent Sessions for ${activeChild.name}` : 'Recent Game Sessions'}
            </h2>
          </div>
          {sessions.length > 0 && (
            <button onClick={() => onNavigate('reports')} className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
              View All Caregiver Reports
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RotateCw className="pulse-animation" size={28} style={{ margin: '0 auto 0.5rem auto' }} />
            <div>Loading session records...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '2px dashed #cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <MayaExplorer size={64} animate={true} />
              <MiloMouse size={60} animate={true} />
            </div>
            <h3 style={{ fontSize: '1.35rem', margin: '0.75rem 0 0.5rem 0', color: '#0f172a' }}>No sessions yet! Let's play a game! 🌟</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto 1.25rem auto' }}>
              Start your first emotion-guided adventure! Camera checks will detect smiles, choose the perfect educational game, and build your growth timeline.
            </p>
            <button onClick={() => onNavigate('start-session')} className="btn btn-primary btn-lg" style={{ borderRadius: '9999px' }}>
              <PlayCircle size={22} />
              <span>Launch First Adventure 🚀</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                style={{
                  background: '#ffffff',
                  border: '2px solid #f1f5f9',
                  borderRadius: '18px',
                  padding: '1.1rem 1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '14px',
                    background: s.activityMode === 'early' ? '#dbeafe' : '#e0e7ff',
                    color: s.activityMode === 'early' ? '#1d4ed8' : '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                  }}>
                    {s.activityMode === 'early' ? '🎈' : '🎮'}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', color: '#0f172a', margin: 0 }}>
                      {s.recommendedGame || s.activityName}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <Calendar size={13} /> {new Date(s.createdAt || s.startTime).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(s.createdAt || s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {s.childName && ` • ${s.childName} (${s.childAge}y)`}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Mood Shift</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <EmotionBadge emotion={s.initialEmotion} showIcon={false} />
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>→</span>
                      <EmotionBadge emotion={s.finalEmotion} showIcon={false} />
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Score</span>
                    <strong style={{ fontSize: '1.15rem', color: '#0f172a' }}>{s.score}%</strong>
                  </div>

                  <button
                    onClick={() => onSelectSession(s)}
                    className="btn btn-outline"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
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
