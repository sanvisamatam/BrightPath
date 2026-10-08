import React, { useState } from 'react';
import { BarChart2, Award, PlayCircle, Star, Sparkles } from 'lucide-react';
import { BarnabyBear } from '../common/CuteIllustrations';

export const GamePerformanceBarChart = ({ sessions = [] }) => {
  const [metricMode, setMetricMode] = useState('score'); // 'score' | 'count' | 'accuracy'
  const [hoveredBar, setHoveredBar] = useState(null);

  if (!sessions || sessions.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
        <BarnabyBear size={64} animate={true} />
        <h4 style={{ fontSize: '1.25rem', color: '#0f172a', marginTop: '1rem', marginBottom: '0.4rem' }}>
          No sessions yet! Let's play a game! 🌟
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
          Play a few different educational activities to see which games your child excels in and enjoys the most!
        </p>
      </div>
    );
  }

  // Aggregate stats by game/activity name
  const gameStatsMap = {};
  sessions.forEach(s => {
    const gameName = s.activityName || s.recommendedGame || 'Activity';
    if (!gameStatsMap[gameName]) {
      gameStatsMap[gameName] = {
        name: gameName,
        totalScore: 0,
        totalAccuracy: 0,
        count: 0,
        scores: []
      };
    }
    const score = typeof s.score === 'number' ? s.score : 0;
    const acc = typeof s.accuracy === 'number' ? s.accuracy : 100;
    gameStatsMap[gameName].totalScore += score;
    gameStatsMap[gameName].totalAccuracy += acc;
    gameStatsMap[gameName].count += 1;
    gameStatsMap[gameName].scores.push(score);
  });

  const gameList = Object.values(gameStatsMap).map(g => ({
    name: g.name,
    avgScore: Math.round(g.totalScore / g.count),
    avgAccuracy: Math.round(g.totalAccuracy / g.count),
    count: g.count,
    bestScore: Math.max(...g.scores)
  }));

  // Distinct child-friendly colors for each bar
  const barColors = [
    { fill: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' }, // Indigo
    { fill: '#0d9488', glow: 'rgba(13, 148, 136, 0.4)' }, // Teal
    { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' }, // Amber
    { fill: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' }, // Pink
    { fill: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' }, // Purple
    { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' }  // Emerald
  ];

  // SVG Chart Dimensions
  const svgWidth = 650;
  const svgHeight = 260;
  const padding = { top: 35, right: 25, bottom: 50, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Max value based on metric
  const maxVal = metricMode === 'count'
    ? Math.max(3, ...gameList.map(g => g.count))
    : 100;

  const barWidth = Math.min(65, (graphWidth / gameList.length) * 0.55);
  const colSpacing = graphWidth / gameList.length;

  return (
    <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header and Toggle */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📊</span>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0 }}>
              Game Performance & Activity Comparison
            </h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            Compare performance scores and frequency across {gameList.length} different activit{gameList.length > 1 ? 'ies' : 'y'}
          </p>
        </div>

        {/* Mode Selector */}
        <div style={{ display: 'flex', gap: '0.4rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '16px' }}>
          <button
            onClick={() => { setMetricMode('score'); setHoveredBar(null); }}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: metricMode === 'score' ? '#ffffff' : 'transparent',
              color: metricMode === 'score' ? '#4f46e5' : 'var(--text-muted)',
              boxShadow: metricMode === 'score' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            Average Score
          </button>
          <button
            onClick={() => { setMetricMode('accuracy'); setHoveredBar(null); }}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: metricMode === 'accuracy' ? '#ffffff' : 'transparent',
              color: metricMode === 'accuracy' ? '#10b981' : 'var(--text-muted)',
              boxShadow: metricMode === 'accuracy' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            Accuracy Rate
          </button>
          <button
            onClick={() => { setMetricMode('count'); setHoveredBar(null); }}
            style={{
              padding: '0.45rem 0.85rem',
              borderRadius: '12px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: metricMode === 'count' ? '#ffffff' : 'transparent',
              color: metricMode === 'count' ? '#f59e0b' : 'var(--text-muted)',
              boxShadow: metricMode === 'count' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            Times Played
          </button>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', minWidth: '480px', display: 'block' }}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = Math.round(ratio * maxVal);
            const y = padding.top + (1 - ratio) * graphHeight;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1.5"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill="#94a3b8"
                >
                  {val}{metricMode !== 'count' ? '%' : ''}
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {gameList.map((game, i) => {
            const color = barColors[i % barColors.length];
            const currentVal = metricMode === 'score'
              ? game.avgScore
              : (metricMode === 'accuracy' ? game.avgAccuracy : game.count);

            const barHeight = Math.max(12, (currentVal / maxVal) * graphHeight);
            const x = padding.left + i * colSpacing + (colSpacing - barWidth) / 2;
            const y = padding.top + graphHeight - barHeight;
            const isHovered = hoveredBar?.name === game.name;

            return (
              <g
                key={game.name}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredBar({ ...game, currentVal, color: color.fill, x, y })}
                onClick={() => setHoveredBar({ ...game, currentVal, color: color.fill, x, y })}
              >
                {/* Background column subtle pill */}
                <rect
                  x={x}
                  y={padding.top}
                  width={barWidth}
                  height={graphHeight}
                  rx="10"
                  fill="#f8fafc"
                />

                {/* Animated / Colored Value Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="10"
                  fill={color.fill}
                  opacity={isHovered ? 1 : 0.9}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    filter: isHovered ? `drop-shadow(0 6px 12px ${color.glow})` : 'none'
                  }}
                />

                {/* Value Text Above Bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="700"
                  fill={color.fill}
                >
                  {currentVal}{metricMode !== 'count' ? '%' : ''}
                </text>

                {/* Game Label Below Bar */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 20}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill="#475569"
                >
                  {game.name.length > 12 ? `${game.name.slice(0, 11)}…` : game.name}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#94a3b8"
                >
                  {game.count} session{game.count > 1 ? 's' : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredBar && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: `${Math.min(78, Math.max(12, (hoveredBar.x / svgWidth) * 100))}%`,
              transform: 'translateX(-50%)',
              background: '#ffffff',
              border: `2px solid ${hoveredBar.color}`,
              borderRadius: '16px',
              padding: '0.75rem 1rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
              zIndex: 10,
              minWidth: '200px',
              pointerEvents: 'none',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <h5 style={{ fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.4rem 0' }}>
              🎮 {hoveredBar.name}
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>Avg Score: <strong style={{ color: '#0f172a' }}>{hoveredBar.avgScore}%</strong></div>
              <div>Avg Accuracy: <strong style={{ color: '#0f172a' }}>{hoveredBar.avgAccuracy}%</strong></div>
              <div>Best Score: <strong style={{ color: '#10b981' }}>{hoveredBar.bestScore}% ⭐</strong></div>
              <div>Sessions Completed: <strong style={{ color: '#0f172a' }}>{hoveredBar.count}</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePerformanceBarChart;

