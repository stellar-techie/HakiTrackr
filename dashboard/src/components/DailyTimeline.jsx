// src/components/DailyTimeline.jsx
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { formatDurationShort } from '../utils';

const CustomTooltip = ({ active, payload, label }) => {
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
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 4 }}>
        {new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      <div style={{ fontWeight: 600 }}>{formatDurationShort(d.totalDuration)}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{d.siteCount} sites · {d.sessionCount} sessions</div>
    </div>
  );
};

export function DailyTimeline({ data }) {
  if (!data?.length) return (
    <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>
      Not enough data yet — come back tomorrow!
    </div>
  );

  const chartData = data.map((d) => ({
    ...d,
    date: d.date,
    minutes: Math.round(d.totalDuration / 60000),
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData} margin={{ top: 8, right: 0, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'rgba(240,238,255,0.3)', fontSize: 11, fontFamily: 'Space Mono' }}
          tickFormatter={(d) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: 'rgba(240,238,255,0.3)', fontSize: 11, fontFamily: 'Space Mono' }}
          tickFormatter={(v) => `${v}m`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(108,92,231,0.3)', strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="minutes"
          stroke="#6c5ce7"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={{ fill: '#6c5ce7', r: 3, strokeWidth: 0 }}
          activeDot={{ fill: '#a29bfe', r: 5, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
