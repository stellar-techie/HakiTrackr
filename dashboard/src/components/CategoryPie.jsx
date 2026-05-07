// src/components/CategoryPie.jsx
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { CATEGORY_COLORS, formatDuration } from '../utils';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: d } = payload[0];
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-mid)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, color: CATEGORY_COLORS[name] }}>{name}</div>
      <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{formatDuration(value)}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>{d.percentage}% of total</div>
    </div>
  );
};

const CustomLegend = ({ data }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'center',
  }}>
    {data.map((item) => (
      <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: 3,
          background: CATEGORY_COLORS[item._id] || '#888',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{item._id}</span>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>{item.percentage}%</span>
      </div>
    ))}
  </div>
);

export function CategoryPie({ data }) {
  if (!data?.length) return (
    <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>
      No category data yet
    </div>
  );

  const chartData = data.map((d) => ({
    name: d._id,
    value: d.totalDuration,
    percentage: d.percentage,
  }));

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <div style={{ width: 180, height: 180, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={CATEGORY_COLORS[entry.name] || '#636e72'}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ flex: 1 }}>
        <CustomLegend data={data} />
      </div>
    </div>
  );
}
