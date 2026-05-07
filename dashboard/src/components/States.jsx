// src/components/States.jsx — Loading, Error, Empty states

export function LoadingState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 16,
    }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent)',
            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        Loading analytics...
      </span>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 16,
      padding: 32,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 32 }}>⚠</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
        Connection failed
      </div>
      <div style={{
        color: 'var(--text-secondary)',
        fontSize: 14,
        maxWidth: 400,
        lineHeight: 1.6,
      }}>{message}</div>

      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        fontSize: 13,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)',
        textAlign: 'left',
        maxWidth: 420,
        lineHeight: 1.8,
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}># Quick fix:</div>
        <div>cd HakiTracker/backend</div>
        <div>cp .env.example .env</div>
        <div style={{ color: 'var(--text-muted)'}}># Add MONGO_URI to .env</div>
        <div>npm install && npm run dev</div>
      </div>

      <button
        onClick={onRetry}
        style={{
          marginTop: 8,
          padding: '10px 24px',
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
        }}
      >
        Try again
      </button>
    </div>
  );
}

export function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 16,
      textAlign: 'center',
      padding: 32,
    }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>◎</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
        No data yet
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 340, lineHeight: 1.6 }}>
        Install the Chrome extension and browse the web — your analytics will appear here automatically.
      </div>
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 20px',
        fontSize: 13,
        fontFamily: 'var(--font-mono)',
        color: 'var(--text-secondary)',
        maxWidth: 380,
        lineHeight: 1.8,
      }}>
        <div style={{ color: 'var(--text-muted)', marginBottom: 6 }}># Load extension in Chrome:</div>
        <div>chrome://extensions</div>
        <div>→ Enable Developer mode</div>
        <div>→ Load unpacked → select /extension</div>
      </div>
    </div>
  );
}
