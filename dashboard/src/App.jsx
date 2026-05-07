// src/App.jsx — HakiTracker Dashboard

import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StatCard } from './components/StatCard';
import { TopSites } from './components/TopSites';
import { CategoryPie } from './components/CategoryPie';
import { DailyTimeline } from './components/DailyTimeline';
import { FocusScore } from './components/FocusScore';
import { Card } from './components/Card';
import { LoadingState, ErrorState, EmptyState } from './components/States';
import { useDashboardData } from './hooks/useUsageData';
import { formatDuration, today } from './utils';

export default function App() {
  const [selectedDate, setSelectedDate] = useState(today());

  const [theme, setTheme] = useState("dark");
  const toggleTheme = () => {
  setTheme(theme === "light" ? "dark" : "light");
  };
  document.body.setAttribute("data-theme", theme)
  const { summary, categories, daily, loading, error, lastUpdated, refresh } = useDashboardData(selectedDate);

  const totalDuration = summary?.totalDuration || 0;
  const totalSites = summary?.totalSites || 0;
  const topDomain = summary?.data?.[0];

  const dateLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : 'All Time';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Background grid pattern */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(108,92,231,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(108,92,231,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* Glow */}
      <div style={{
        position: 'fixed', top: -200, left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 400,
        background: 'radial-gradient(ellipse, rgba(108,92,231,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Navbar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 64px' }}>

          {/* Page header */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
            }}>
              {dateLabel}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6, fontFamily: 'var(--font-mono)' }}>
              Browser activity analytics
            </p>
          </div>

          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} onRetry={refresh} />}
          {!loading && !error && totalDuration === 0 && <EmptyState />}

          {!loading && !error && totalDuration > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Stat cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 16,
              }}>
                <StatCard
                  label="Total time"
                  value={formatDuration(totalDuration)}
                  sub={dateLabel}
                  accent="var(--accent-soft)"
                />
                <StatCard
                  label="Sites visited"
                  value={totalSites}
                  sub="unique domains"
                  accent="var(--teal)"
                  mono
                />
                <StatCard
                  label="Top site"
                  value={topDomain?._id || '—'}
                  sub={formatDuration(topDomain?.totalDuration)}
                  accent="var(--amber)"
                />
                <StatCard
                  label="Sessions"
                  value={summary?.data?.reduce((s, d) => s + d.sessionCount, 0) || 0}
                  sub="tab visits recorded"
                  accent="var(--coral)"
                  mono
                />
              </div>

              {/* Timeline */}
              <Card title="Daily activity" subtitle="Last 7 days — minutes browsed per day">
                <DailyTimeline data={daily} />
              </Card>

              {/* Top sites + Category + Focus */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 340px',
                gap: 24,
              }}>
                <Card
                  title="Top sites"
                  subtitle={`Most visited ${selectedDate ? 'today' : 'overall'}`}
                >
                  <TopSites data={summary?.data} />
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <Card title="By category" subtitle="Time breakdown per category">
                    <CategoryPie data={categories?.data} />
                  </Card>

                  <Card title="Focus score" subtitle="Productive vs distracting time">
                    <FocusScore
                      summaryData={summary?.data}
                      categoryData={categories?.data}
                    />
                  </Card>
                </div>
              </div>

              {/* Full table if many sites */}
              {summary?.data?.length > 10 && (
                <Card title="All sites" subtitle={`${summary.data.length} domains tracked`}>
                  <AllSitesTable data={summary.data} />
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function AllSitesTable({ data }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? data : data.slice(0, 20);

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['#', 'Domain', 'Category', 'Time', 'Sessions', '%'].map((h) => (
              <th key={h} style={{
                textAlign: h === '#' ? 'center' : 'left',
                padding: '8px 12px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((site, i) => (
            <tr
              key={site._id}
              style={{ borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '10px 12px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{i + 1}</td>
              <td style={{ padding: '10px 12px', fontWeight: 500 }}>{site._id}</td>
              <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{site.category}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{formatDuration(site.totalDuration)}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{site.sessionCount}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{site.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!showAll && data.length > 20 && (
        <button
          onClick={() => setShowAll(true)}
          style={{
            marginTop: 16,
            padding: '8px 20px',
            background: 'transparent',
            border: '1px solid var(--border-mid)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            width: '100%',
          }}
        >Show all {data.length} sites</button>
      )}
    </div>
  );
}
