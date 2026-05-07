// src/components/TopSites.jsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { formatDuration, formatDurationShort, CATEGORY_COLORS, getFaviconUrl } from '../utils';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-mid)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{d._id}</div>
      <div style={{ color: 'var(--text-secondary)' }}>{formatDuration(d.totalDuration)}</div>
      <div style={{ color: CATEGORY_COLORS[d.category] || '#888', fontSize: 11, marginTop: 2 }}>
        {d.category} · {d.sessionCount} sessions
      </div>
    </div>
  );
};

export function TopSites({ data }) {
  if (!data?.length) return (
    <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>
      No site data yet
    </div>
  );

  const top = data.slice(0, 10);
  const maxMs = top[0]?.totalDuration || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {top.map((site, i) => {
        const pct = (site.totalDuration / maxMs) * 100;
        const color = CATEGORY_COLORS[site.category] || '#6c5ce7';
        return (
          <div key={site._id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < top.length - 1 ? '1px solid var(--border)' : 'none',
          }}>
            {/* Rank */}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-muted)',
              width: 18,
              textAlign: 'right',
              flexShrink: 0,
            }}>{i + 1}</span>

            {/* Favicon */}
            <img
              src={getFaviconUrl(site._id)}
              alt=""
              width={16} height={16}
              style={{ borderRadius: 3, flexShrink: 0, opacity: 0.85 }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />

            {/* Domain + bar */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, gap: 8 }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                }}>{site._id}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  flexShrink: 0,
                }}>{formatDurationShort(site.totalDuration)}</span>
              </div>
              <div style={{
                height: 3,
                background: 'var(--border)',
                borderRadius: 99,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: color,
                  borderRadius: 99,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Category pill */}
            <span style={{
              fontSize: 10,
              fontWeight: 500,
              color: color,
              background: `${color}18`,
              border: `1px solid ${color}30`,
              borderRadius: 99,
              padding: '2px 8px',
              flexShrink: 0,
              display: 'none',
            }}
            className="cat-pill"
            >{site.category}</span>
          </div>
        );
      })}
    </div>
  );
}
