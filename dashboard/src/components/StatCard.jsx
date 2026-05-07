// src/components/StatCard.jsx
import { formatDuration } from '../utils';

export function StatCard({ label, value, sub, accent, mono }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {accent && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }} />
      )}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-display)',
        fontSize: 28,
        fontWeight: 700,
        color: accent || 'var(--text-primary)',
        lineHeight: 1,
      }}>{value}</span>
      {sub && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</span>
      )}
    </div>
  );
}
