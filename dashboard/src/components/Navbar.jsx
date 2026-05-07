// src/components/Navbar.jsx
import { today } from "../utils";

export function Navbar({
  selectedDate,
  onDateChange,
  lastUpdated,
  onRefresh,
  theme,
  onToggleTheme,
}) {
  const todayStr = today();

  return (
    <header
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-surface)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            HT
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "-0.3px",
              color: "var(--text-primary)",
            }}
          >
            HakiTracker
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              marginLeft: 2,
            }}
          >
            v1.0
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Date filter */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() =>
                onDateChange(selectedDate === todayStr ? null : todayStr)
              }
              style={{
                padding: "5px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-mid)",
                background:
                  selectedDate === todayStr ? "var(--accent)" : "transparent",
                color:
                  selectedDate === todayStr ? "#fff" : "var(--text-secondary)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s",
              }}
            >
              Today
            </button>

            <input
              type="date"
              value={selectedDate || ""}
              max={todayStr}
              onChange={(e) => onDateChange(e.target.value || null)}
              style={{
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-mid)",
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />

            {selectedDate && (
              <button
                onClick={() => onDateChange(null)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text-muted)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                All time
              </button>
            )}
          </div>

          {/* Refresh */}
          <button
            onClick={onToggleTheme}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            onClick={onRefresh}
            title="Refresh data"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: 14,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            ↻
          </button>

          {/* Last updated */}
          {lastUpdated && (
            <span
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
