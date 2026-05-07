// popup.js — HakiTracker popup logic

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

async function loadData() {
  try {
    const result = await chrome.storage.local.get(['sessions', 'pendingSync']);
    const sessions = result.sessions || [];
    const pendingCount = (result.pendingSync || []).length;

    // Filter to today only
    const today = new Date().toLocaleDateString('en-CA');
    const todaySessions = sessions.filter((s) => s.date === today);

    // Total time today
    const totalMs = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('todayTime').textContent = formatDuration(totalMs);

    // Unique sites
    const uniqueSites = new Set(todaySessions.map((s) => s.domain));
    document.getElementById('siteCount').textContent = uniqueSites.size;

    // Aggregate per domain
    const domainTotals = {};
    todaySessions.forEach((s) => {
      domainTotals[s.domain] = (domainTotals[s.domain] || 0) + s.duration;
    });

    // Sort by time
    const sorted = Object.entries(domainTotals).sort((a, b) => b[1] - a[1]);
    const maxTime = sorted[0]?.[1] || 1;

    const listEl = document.getElementById('topSitesList');
    if (sorted.length === 0) {
      listEl.innerHTML = '<div class="empty-state">No data yet — start browsing!</div>';
    } else {
      listEl.innerHTML = sorted
        .slice(0, 5)
        .map(
          ([domain, ms]) => `
        <div class="site-row">
          <span class="site-row-name">${domain}</span>
          <div class="site-row-bar-wrap">
            <div class="site-row-bar" style="width: ${Math.round((ms / maxTime) * 100)}%"></div>
          </div>
          <span class="site-row-time">${formatDuration(ms)}</span>
        </div>
      `
        )
        .join('');
    }

    // Sync status
    const syncEl = document.getElementById('syncStatus');
    if (pendingCount > 0) {
      syncEl.textContent = `${pendingCount} pending`;
      syncEl.style.color = 'rgba(253, 203, 110, 0.6)';
    } else {
      syncEl.textContent = 'Synced ✓';
      syncEl.style.color = 'rgba(85, 239, 196, 0.5)';
    }
  } catch (err) {
    console.error('Popup error:', err);
  }
}

// Show current active tab
async function showCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return;

    const url = new URL(tab.url);
    const domain = url.hostname.replace(/^www\./, '');

    if (domain && !tab.url.startsWith('chrome://')) {
      document.getElementById('currentSite').textContent = domain;
    } else {
      document.getElementById('currentSite').textContent = 'Internal page';
    }
  } catch {}
}

// Update session timer every second
let sessionSeconds = 0;
function updateSessionTime() {
  sessionSeconds++;
  const h = Math.floor(sessionSeconds / 3600);
  const m = Math.floor((sessionSeconds % 3600) / 60);
  const s = sessionSeconds % 60;
  const display = h > 0 ? `${h}h ${m}m this session` : m > 0 ? `${m}m ${s}s this session` : `${s}s this session`;
  document.getElementById('sessionTime').textContent = display;
}

loadData();
showCurrentTab();
setInterval(updateSessionTime, 1000);
