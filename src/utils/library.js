/**
 * Pure state helpers for the reader's local data. Keeping them free of React
 * makes them trivial to unit-test.
 *
 *   library  : string[]                       manga ids saved by the user
 *   progress : { [mangaId]: { chapter, page, total, updatedAt } }
 *   readMap  : { [mangaId]: number[] }        chapters fully read
 *   history  : { id, at }[]                   most recent first
 */
export function toggleInList(list, id) {
  return list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];
}

export function pushHistory(history, id, at = Date.now(), max = 30) {
  return [{ id, at }, ...history.filter((h) => h.id !== id)].slice(0, max);
}

export function updateProgress(progress, { mangaId, chapter, page, total }, at = Date.now()) {
  return { ...progress, [mangaId]: { chapter, page, total, updatedAt: at } };
}

export function markChapterRead(readMap, mangaId, chapter) {
  const current = readMap[mangaId] ?? [];
  if (current.includes(chapter)) return readMap;
  return { ...readMap, [mangaId]: [...current, chapter].sort((a, b) => a - b) };
}

/** Where should "Read now" / "Continue" take the user? */
export function getResumeTarget(manga, progress) {
  const entry = progress[manga.id];
  if (!entry) return { chapter: 1, page: 1, hasProgress: false };
  const finishedChapter = entry.page >= entry.total;
  if (finishedChapter && entry.chapter < manga.chapters) {
    return { chapter: entry.chapter + 1, page: 1, hasProgress: true };
  }
  return { chapter: entry.chapter, page: finishedChapter ? 1 : entry.page, hasProgress: true };
}

/** A series counts as "currently reading" until its very last page has been reached. */
export function isFinished(manga, entry) {
  return Boolean(entry) && entry.chapter >= manga.chapters && entry.page >= entry.total;
}

export function computeStats({ library, progress, readMap, mangas }) {
  const byId = Object.fromEntries(mangas.map((m) => [m.id, m]));
  const reading = Object.entries(progress).filter(
    ([id, entry]) => byId[id] && !isFinished(byId[id], entry),
  ).length;
  const chaptersRead = Object.values(readMap).reduce((sum, arr) => sum + arr.length, 0);
  return { saved: library.length, reading, chaptersRead };
}

export function getContinueEntries({ progress, mangas }) {
  const byId = Object.fromEntries(mangas.map((m) => [m.id, m]));
  return Object.entries(progress)
    .filter(([id, entry]) => byId[id] && !isFinished(byId[id], entry))
    .sort((a, b) => b[1].updatedAt - a[1].updatedAt)
    .map(([id, entry]) => ({ manga: byId[id], entry }));
}
