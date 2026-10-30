import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readJSON, writeJSON } from '../utils/storage.js';
import {
  markChapterRead,
  pushHistory,
  toggleInList,
  updateProgress,
} from '../utils/library.js';

const DEFAULT_SETTINGS = {
  readerName: 'Reader',
  theme: 'ink', // ink | graphite
  accent: 'carmine', // carmine | amber
  reduceMotion: 'system', // system | on | off
  heroAutoplay: true,
  readingMode: 'vertical', // vertical | paged
  readerWidth: 'medium', // narrow | medium | wide
  readerFit: 'height', // height | width  (paged mode)
};

const StoreContext = createContext(null);

/** useState that mirrors itself into localStorage. */
function usePersisted(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = readJSON(key, initial);
    return key === 'settings' ? { ...initial, ...stored } : stored;
  });
  useEffect(() => {
    writeJSON(key, value);
  }, [key, value]);
  return [value, setValue];
}

export function StoreProvider({ children }) {
  const [library, setLibrary] = usePersisted('library', []);
  const [progress, setProgress] = usePersisted('progress', {});
  const [readMap, setReadMap] = usePersisted('read', {});
  const [history, setHistory] = usePersisted('history', []);
  const [settings, setSettings] = usePersisted('settings', DEFAULT_SETTINGS);

  // Theme + accent are plain data attributes: CSS variables do the rest.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.accent = settings.accent;
  }, [settings.theme, settings.accent]);

  const toggleLibrary = useCallback((id) => setLibrary((l) => toggleInList(l, id)), []);
  const recordView = useCallback((id) => setHistory((h) => pushHistory(h, id)), []);
  const clearHistory = useCallback(() => setHistory([]), []);
  const saveProgress = useCallback(
    (mangaId, chapter, page, total) =>
      setProgress((p) => {
        const cur = p[mangaId];
        if (cur && cur.chapter === chapter && cur.page === page && cur.total === total) return p;
        return updateProgress(p, { mangaId, chapter, page, total });
      }),
    [],
  );
  const markRead = useCallback((mangaId, chapter) => setReadMap((r) => markChapterRead(r, mangaId, chapter)), []);
  const updateSettings = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);
  const resetProgress = useCallback(() => {
    setProgress({});
    setReadMap({});
  }, []);
  const resetAll = useCallback(() => {
    setLibrary([]);
    setProgress({});
    setReadMap({});
    setHistory([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({
      library, progress, readMap, history, settings,
      toggleLibrary, recordView, clearHistory, saveProgress, markRead,
      updateSettings, resetProgress, resetAll,
    }),
    [library, progress, readMap, history, settings, toggleLibrary, recordView, clearHistory, saveProgress, markRead, updateSettings, resetProgress, resetAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}
