export function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatCount(n) {
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function formatRating(r) {
  return r.toFixed(1);
}

export function pad2(n) {
  return String(n).padStart(2, '0');
}

export function timeAgo(timestamp, now = Date.now()) {
  const diff = Math.max(0, now - timestamp);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}
