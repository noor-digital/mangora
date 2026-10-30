const PREFIX = 'mangora:';

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked (private mode): the app keeps working in memory */
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}
