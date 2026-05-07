// src/utils.js — shared helpers

export function formatDuration(ms) {
  if (!ms || ms < 0) return '0m';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${totalSeconds}s`;
}

export function formatDurationShort(ms) {
  if (!ms) return '0m';
  const minutes = Math.floor(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

export const CATEGORY_COLORS = {
  Social:        '#fd79a8',
  Entertainment: '#e17055',
  Productivity:  '#00cec9',
  Learning:      '#6c5ce7',
  News:          '#fdcb6e',
  Communication: '#74b9ff',
  Finance:       '#55efc4',
  Shopping:      '#a29bfe',
  Gaming:        '#ff6bb6',
  Other:         '#636e72',
};

export function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

export function today() {
  return new Date().toLocaleDateString('en-CA');
}
