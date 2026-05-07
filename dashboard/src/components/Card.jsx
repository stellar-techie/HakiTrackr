// src/components/Card.jsx — generic section card
export function Card({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      ...style,
    }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 20 }}>
          {title && (
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.2px',
              color: 'var(--text-primary)',
            }}>{title}</h2>
          )}
          {subtitle && (
            <p style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 3,
              fontFamily: 'var(--font-mono)',
            }}>{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
