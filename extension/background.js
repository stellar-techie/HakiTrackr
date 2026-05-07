// HakiTracker - background.js (Service Worker)
// Tracks active tab time and syncs to backend

const BACKEND_URL = 'http://localhost:3001/api';
const IDLE_THRESHOLD = 60;  // seconds before marking user as idle
const MIN_SESSION_MS = 2000; // ignore sessions shorter than 2 seconds
const MAX_LOCAL_SESSIONS = 500;

// State
let activeSession = {
  domain: null,
  startTime: null,
  tabId: null,
};

// Utilities

function getDomain(url) {
  try {
    if (!url) return null;
    if (
      url.startsWith('chrome://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('about:') ||
      url.startsWith('edge://') ||
      url.startsWith('moz-extension://')
    ) {
      return null;
    }
    const parsed = new URL(url);
    // Remove www. prefix for cleaner domain names
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function getCategory(domain) {
  const categories = {
    // Social
    'facebook.com': 'Social',
    'twitter.com': 'Social',
    'x.com': 'Social',
    'instagram.com': 'Social',
    'linkedin.com': 'Social',
    'reddit.com': 'Social',
    'tiktok.com': 'Social',
    'snapchat.com': 'Social',
    'pinterest.com': 'Social',
    'whatsapp.com': 'Social',
    'discord.com': 'Social',
    // Entertainment
    'youtube.com': 'Entertainment',
    'netflix.com': 'Entertainment',
    'primevideo.com':'Entertainment',
    'twitch.tv': 'Entertainment',
    'spotify.com': 'Entertainment',
    'primevideo.com': 'Entertainment',
    'hulu.com': 'Entertainment',
    'disneyplus.com': 'Entertainment',
    'cineby.cc':'Entertainment',
    'vimeo.com': 'Entertainment',
    // Productivity
    'github.com': 'Productivity',
    'gitlab.com': 'Productivity',
    'notion.so': 'Productivity',
    'trello.com': 'Productivity',
    'asana.com': 'Productivity',
    'jira.atlassian.com': 'Productivity',
    'docs.google.com': 'Productivity',
    'sheets.google.com': 'Productivity',
    'figma.com': 'Productivity',
    'linear.app': 'Productivity',
    'slack.com': 'Productivity',
    'zoom.us': 'Productivity',
    'classroom.google.com':'productivity',
    'codolio.com':'productivity',
    'canva.com':'productivity',
    // Learning
    'stackoverflow.com': 'Learning',
    'mdn.dev': 'Learning',
    'developer.mozilla.org': 'Learning',
    'medium.com': 'Learning',
    'udemy.com': 'Learning',
    'coursera.org': 'Learning',
    'khan academy.org': 'Learning',
    'freecodecamp.org': 'Learning',
    'docs.anthropic.com': 'Learning',
    'openai.com': 'Learning',
    'leetcode.com':'Learning',
    'neetcode.io':'Learning',
    // News
    'cnn.com': 'News',
    'bbc.com': 'News',
    'nytimes.com': 'News',
    'theguardian.com': 'News',
    'reuters.com': 'News',
    'bloomberg.com': 'News',
    'techcrunch.com': 'News',
    'hackernews.com': 'News',
    'news.ycombinator.com': 'News',
    //gaming
    'crazygames.com':'Gaming',
    'addictinggames.com':'Gaming',
    'chess.com':'Gaming',
    'ludoking.com':'Gaming',
    'poki.com':'Gaming',
    'playhop.com':'Gaming',
    'epicgames.com':'Gaming',
    'playground-games.com':'Gaming',
    'sudoku.com':'Gaming'

  };

  for (const key in categories) {
  if (domain.includes(key)) {
    return categories[key];
  }
}

  // Heuristic fallbacks
  if (domain.includes('mail') || domain.includes('gmail')) return 'Communication';
  if (domain.includes('bank') || domain.includes('finance') || domain.includes('pay')) return 'Finance';
  if (domain.includes('shop') || domain.includes('amazon') || domain.includes('ebay')) return 'Shopping';
  if (domain.includes('news') || domain.includes('article')) return 'News';
  if (domain.includes('Gaming') || domain.includes('games') || domain.includes('gaming')) return 'Gaming';

  return 'Other';
}

// Session Management

function startSession(domain, tabId) {
  if (!domain) return;
  activeSession = {
    domain,
    startTime: Date.now(),
    tabId,
  };
}

async function endSession() {
  if (!activeSession.domain || !activeSession.startTime) return;

  const duration = Date.now() - activeSession.startTime;

  // Skip very short sessions
  if (duration < MIN_SESSION_MS) {
    activeSession = { domain: null, startTime: null, tabId: null };
    return;
  }
//prints a message in service worker console
  console.log(
  `You spent ${Math.round(duration / 1000)} sec on ${activeSession.domain}`
);

  const entry = {
    domain: activeSession.domain,
    category: getCategory(activeSession.domain),
    duration, // milliseconds
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
  };

  // Reset state first to avoid double-counting
  activeSession = { domain: null, startTime: null, tabId: null };

  // Save locally
  await saveLocally(entry);

  // Send to backend
  await syncToBackend(entry);
}

async function saveLocally(entry) {
  try {
    const result = await chrome.storage.local.get(['sessions', 'pendingSync']);
    const sessions = result.sessions || [];
    const pendingSync = result.pendingSync || [];

    sessions.push(entry);
    const trimmedSessions = sessions.slice(-MAX_LOCAL_SESSIONS);

    await chrome.storage.local.set({
      sessions: trimmedSessions,
      pendingSync: [...pendingSync, entry], // Keep for retry
    });
  } catch (err) {
    console.error('[HakiTracker] Failed to save locally:', err);
  }
}

async function syncToBackend(entry) {
  try {
    const response = await fetch(`${BACKEND_URL}/usage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (response.ok) {
      // Remove from pending sync queue on success
      const result = await chrome.storage.local.get(['pendingSync']);
      const pendingSync = (result.pendingSync || []).filter(
        (e) => e.timestamp !== entry.timestamp
      );
      await chrome.storage.local.set({ pendingSync });
    }
  } catch {
    // Backend offline — data is already saved locally, will retry later
    console.log('[HakiTracker] Backend offline, stored locally for retry');
  }
}

// Retry failed syncs (called by alarm)
async function retryPendingSync() {
  const result = await chrome.storage.local.get(['pendingSync']);
  const pending = result.pendingSync || [];
  if (pending.length === 0) return;

  const stillPending = [];
  for (const entry of pending) {
    try {
      const response = await fetch(`${BACKEND_URL}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!response.ok) stillPending.push(entry);
    } catch {
      stillPending.push(entry);
    }
  }

  await chrome.storage.local.set({ pendingSync: stillPending });
}

// Tab Event Listeners

// User switches to a different tab
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await endSession();

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const domain = getDomain(tab.url);
    startSession(domain, activeInfo.tabId);
  } catch {
    // Tab might be closed already
  }
});

// Tab URL changes (navigation, refresh)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || activeTab.id !== tabId) return;

    // URL changed on the active tab
    if (activeSession.tabId === tabId) {
      const newDomain = getDomain(tab.url);
      if (newDomain !== activeSession.domain) {
        await endSession();
        startSession(newDomain, tabId);
      }
    }
  } catch {}
});

// Browser window focus changed
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User left Chrome
    await endSession();
  } else {
    // User returned to Chrome
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab) {
        const domain = getDomain(activeTab.url);
        startSession(domain, activeTab.id);
      }
    } catch {}
  }
});

// Tab closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (activeSession.tabId === tabId) {
    await endSession();
  }
});

// Idle Detection 

chrome.idle.setDetectionInterval(IDLE_THRESHOLD);

chrome.idle.onStateChanged.addListener(async (state) => {
  if (state === 'idle' || state === 'locked') {
    await endSession();
  } else if (state === 'active') {
    try {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (activeTab) {
        const domain = getDomain(activeTab.url);
        startSession(domain, activeTab.id);
      }
    } catch {}
  }
});

// Periodic Sync via Alarms 

chrome.alarms.create('periodicSync', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'periodicSync') {
    await retryPendingSync();
  }
});

// Extension Installed / Started 

chrome.runtime.onInstalled.addListener(async () => {
  console.log('HakiTracker -- Extension installed');
  // Set default settings
  await chrome.storage.local.set({
    sessions: [],
    pendingSync: [],
    settings: {
      distractionLimit: 30, // minutes per day for distracting sites
      focusGoal: 60, // minutes per day for productive sites
      notificationsEnabled: true,
    },
  });
});

// Start tracking the current tab when service worker restarts
(async () => {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab) {
      const domain = getDomain(activeTab.url);
      startSession(domain, activeTab.id);
    }
  } catch {}
})();

console.log('HakiTracker -- Service worker started!');
