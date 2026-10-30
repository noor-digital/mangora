const DAY = 86400000;

/** Popularity from the demo data, boosted by how recently a series was updated. */
export function trendingScore(manga, now = Date.now()) {
  const days = Math.max(0, (now - new Date(manga.updated + 'T00:00:00').getTime()) / DAY);
  const freshness = Math.max(0, 1 - days / 120);
  return manga.popularity * 0.7 + freshness * 30;
}

export function getTrending(list, now = Date.now()) {
  return [...list].sort((a, b) => trendingScore(b, now) - trendingScore(a, now));
}

/**
 * Demo read counts plus what *this* browser has read (localReads = chapters per manga).
 * Local activity weighs enough to move a series up, so the list reacts to the user.
 */
export function readScore(manga, localReads = {}) {
  return manga.reads + (localReads[manga.id] ?? 0) * 2500;
}

export function getMostRead(list, localReads = {}) {
  return [...list].sort((a, b) => readScore(b, localReads) - readScore(a, localReads));
}

/** Rating first, vote count as the tie-breaker. */
export function getTopRated(list) {
  return [...list].sort((a, b) => b.rating - a.rating || b.votes - a.votes);
}
