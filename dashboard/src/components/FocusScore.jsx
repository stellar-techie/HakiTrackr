// src/components/FocusScore.jsx
import { CATEGORY_COLORS } from '../utils';

const PRODUCTIVE = ['Productivity', 'Learning'];
const DISTRACTING = ['Entertainment', 'Social','Gaming'];

export function FocusScore({ summaryData, categoryData }) {
  if (!categoryData?.length) return null;

  const total = categoryData.reduce((s, c) => s + c.totalDuration, 0);
  const productive = categoryData
    .filter((c) => PRODUCTIVE.includes(c._id))
    .reduce((s, c) => s + c.totalDuration, 0);
  const distracting = categoryData
    .filter((c) => DISTRACTING.includes(c._id))
    .reduce((s, c) => s + c.totalDuration, 0);

  const score = total > 0 ? Math.round((productive / total) * 100) : 0;

  const getScoreColor = (s) => {
    if (s >= 70) return '#55efc4';
    if (s >= 40) return '#fdcb6e';
    return '#e17055';
  };

  const getScoreLabel = (s) => {
    if (s >= 70) return 'Focused';
    if (s >= 40) return 'Balanced';
    return 'Distracted';
  };

  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 38;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      {/* Circular gauge */}
      <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r="38" fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="38"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 22,
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}>{score}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>/ 100</span>
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18,
            fontWeight: 700,
            color,
          }}>{getScoreLabel(score)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Focus score — higher is better
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <ScoreRow label="Productive" ms={productive} total={total} color="#55efc4" />
          <ScoreRow label="Distracting" ms={distracting} total={total} color="#e17055" />
        </div>
      </div>
    </div>
  );
}

function ScoreRow({ label, ms, total, color }) {
  const pct = total > 0 ? Math.round((ms / total) * 100) : 0;
  const minutes = Math.round(ms / 60000);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
        {minutes}m
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color,
        minWidth: 30,
        textAlign: 'right',
      }}>{pct}%</span>
    </div>
  );
}
