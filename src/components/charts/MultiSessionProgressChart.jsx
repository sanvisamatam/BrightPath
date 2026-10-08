import React, { useState } from 'react';
import { TrendingUp, Award, Target, Zap, Clock, Calendar, Sparkles } from 'lucide-react';
import { SunnyStar } from '../common/CuteIllustrations';
import EmotionBadge from '../common/EmotionBadge';

export const MultiSessionProgressChart = ({ sessions = [] }) => {
  const [activeMetric, setActiveMetric] = useState('score'); // 'score' | 'accuracy' | 'responseTime' | 'completionTime'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Filter and sort sessions chronologically (oldest to newest)
  const validSessions = [...sessions]
    .filter(s => s && (s.createdAt || s.startTime))
    .sort((a, b) => new Date(a.createdAt || a.startTime) - new Date(b.createdAt || b.startTime));

  if (validSessions.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <SunnyStar size={64} animate={true} />
        <h4 style={{ fontSize: '1.25rem', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
          No sessions yet! Let's play a game! 🌟
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
          Complete your first educational game session to see your colorful progress graph and skill development trends here!
        </p>
      </div>
    );
  }

  // Configuration for the selected metric
  const metricConfigs = {
    score: {
      label: 'Game Score',
      unit: '/ 100',
      color: '#4f46e5',
      gradientStart: 'rgba(79, 70, 229, 0.35)',
      gradientEnd: 'rgba(79, 70, 229, 0.02)',
      min: 0,
      max: 100,
      icon: Award,
      getValue: (s) => (typeof s.score === 'number' ? s.score : 0)
    },
    accuracy: {
      label: 'Accuracy',
      unit: '%',
      color: '#10b981',
      gradientStart: 'rgba(16, 185, 129, 0.35)',
      gradientEnd: 'rgba(16, 185, 129, 0.02)',
      min: 0,
      max: 100,
      icon: Target,
      getValue: (s) => (typeof s.accuracy === 'number' ? s.accuracy : 100)
    },
    responseTime: {
      label: 'Response Time',
      unit: 's',
      color: '#0284c7',
      gradientStart: 'rgba(2, 132, 199, 0.35)',
      gradientEnd: 'rgba(2, 132, 199, 0.02)',
      min: 0,
      max: Math.max(5, ...validSessions.map(s => s.responseTime || 2.5)),
      icon: Zap,
      getValue: (s) => (typeof s.responseTime === 'number' ? s.responseTime : 2.0)
    },
    completionTime: {
      label: 'Completion Duration',
      unit: 's',
      color: '#8b5cf6',
      gradientStart: 'rgba(139, 92, 246, 0.35)',
      gradientEnd: 'rgba(139, 92, 246, 0.02)',
      min: 0,
      max: Math.max(60, ...validSessions.map(s => s.completionTime || 60)),
      icon: Clock,
      getValue: (s) => (typeof s.completionTime === 'number' ? s.completionTime : 60)
    }
  };

  const currentConfig = metricConfigs[activeMetric];

  // SVG Chart Dimensions
  const svgWidth = 650;
  const svgHeight = 250;
  const padding = { top: 25, right: 30, bottom: 40, left: 50 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  const yMin = currentConfig.min;
  const yMax = currentConfig.max;

  // Calculate points
  const points = validSessions.map((session, index) => {
    const val = currentConfig.getValue(session);
    const x = validSessions.length === 1 
      ? padding.left + graphWidth / 2 
      : padding.left + (index / (validSessions.length - 1)) * graphWidth;
    
    const normalizedY = (val - yMin) / (yMax - yMin || 1);
    const y = padding.top + (1 - normalizedY) * graphHeight;
    return { x, y, value: val, session, index };
  });

  // Generate SVG path string
  let pathD = '';
  if (points.length === 1) {
    pathD = `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
  } else {
    pathD = points.reduce((acc, curr, idx) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      // Smooth cubic bezier curve
      const prev = points[idx - 1];
      const cx1 = prev.x + (curr.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (curr.x - prev.x) / 2;
      const cy2 = curr.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
    }, '');
  }

  // Area fill under line
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const baseY = padding.top + graphHeight;
  const areaD = points.length === 1
    ? ''
    : `${pathD} L ${lastPoint.x} ${baseY} L ${firstPoint.x} ${baseY} Z`;

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map(ratio => {
    const val = Math.round(yMin + ratio * (yMax - yMin));
    const y = padding.top + (1 - ratio) * graphHeight;
    return { val, y };
  });

  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Chart Header & Metric Switcher Pills */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📈</span>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
              Session Progress & Skill Trends
            </h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            Real timeline progress tracked across {validSessions.length} completed session{validSessions.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: '#f1f5f9', padding: '0.3rem', borderRadius: '16px' }}>
          {[
            { id: 'score', label: 'Score', icon: Award },
            { id: 'accuracy', label: 'Accuracy', icon: Target },
            { id: 'responseTime', label: 'Reaction Speed', icon: Zap },
            { id: 'completionTime', label: 'Time Taken', icon: Clock }
          ].map(m => {
            const Icon = m.icon;
            const isSelected = activeMetric === m.id;
            return (
              <button
                key={m.id}
                onClick={() => { setActiveMetric(m.id); setHoveredPoint(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? currentConfig.color : 'var(--text-muted)',
                  boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                <Icon size={14} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', minWidth: '480px', display: 'block' }}
        >
          <defs>
            <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={currentConfig.color} stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow-point" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={currentConfig.color} floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Horizontal Gridlines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={svgWidth - padding.right}
                y2={tick.y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                fontSize="10"
                fontWeight="600"
                fill="#94a3b8"
              >
                {tick.val}{currentConfig.unit}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {areaD && (
            <path
              d={areaD}
              fill={`url(#gradient-${activeMetric})`}
            />
          )}

          {/* Line Path */}
          <path
            d={pathD}
            fill="none"
            stroke={currentConfig.color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt) => {
            const isHovered = hoveredPoint?.index === pt.index;
            return (
              <g
                key={pt.index}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(pt)}
                onClick={() => setHoveredPoint(pt)}
              >
                {/* Outer touch target */}
                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />
                
                {/* Halo if hovered */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill={currentConfig.color}
                    opacity="0.25"
                    className="pulse-animation"
                  />
                )}

                {/* Point dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 5.5}
                  fill="#ffffff"
                  stroke={currentConfig.color}
                  strokeWidth="3.5"
                  filter="url(#glow-point)"
                  style={{ transition: 'all 0.2s' }}
                />

                {/* Bottom X-Axis Date Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="#64748b"
                >
                  #{pt.index + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Child-Friendly Interactive Tooltip Overlay */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: `${Math.min(75, Math.max(10, (hoveredPoint.x / svgWidth) * 100))}%`,
              transform: 'translateX(-50%)',
              background: '#ffffff',
              border: `2px solid ${currentConfig.color}`,
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.15)',
              zIndex: 10,
              minWidth: '190px',
              pointerEvents: 'none',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Session #{hoveredPoint.index + 1}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {new Date(hoveredPoint.session.createdAt || hoveredPoint.session.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <h5 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              🎮 {hoveredPoint.session.activityName || hoveredPoint.session.recommendedGame}
            </h5>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.3rem', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentConfig.label}:</span>
              <strong style={{ fontSize: '1rem', color: currentConfig.color }}>
                {hoveredPoint.value}{currentConfig.unit}
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mood:</span>
              <EmotionBadge emotion={hoveredPoint.session.initialEmotion} showIcon={false} />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>→</span>
              <EmotionBadge emotion={hoveredPoint.session.finalEmotion} showIcon={false} />
            </div>
          </div>
        )}
      </div>

      {/* Helpful Legend / Tip */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sparkles size={14} color={currentConfig.color} />
          <span>Tip: Hover or tap any point to inspect individual session stats & observed emotions!</span>
        </span>
        <span style={{ fontWeight: 600 }}>
          Latest {currentConfig.label}: <strong style={{ color: currentConfig.color }}>{points[points.length - 1].value}{currentConfig.unit}</strong>
        </span>
      </div>
    </div>
  );
};

export default MultiSessionProgressChart;

