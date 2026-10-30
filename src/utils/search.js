import { GENRES } from '../data/genres.js';

const genreLabel = Object.fromEntries(GENRES.map((g) => [g.id, g.label]));

/** Lower-case + strip accents so "Mystère" matches "mystere". */
export const normalize = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function haystack(manga) {
  return {
    title: normalize(manga.title),
    author: normalize(manga.author),
    genres: manga.genres.map((g) => normalize(genreLabel[g] ?? g)).join(' ') + ' ' + manga.genres.join(' '),
    tags: normalize(manga.tags.join(' ')),
  };
}

/** Higher = better match. 0 = no match. Every token must match somewhere. */
export function scoreManga(manga, query) {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return 1;
  const h = haystack(manga);
  let total = 0;
  for (const token of tokens) {
    let s = 0;
    if (h.title.startsWith(token)) s = 12;
    else if (h.title.split(' ').some((w) => w.startsWith(token))) s = 9;
    else if (h.title.includes(token)) s = 6;
    else if (h.author.includes(token)) s = 5;
    else if (h.genres.includes(token)) s = 4;
    else if (h.tags.includes(token)) s = 3;
    if (!s) return 0;
    total += s;
  }
  return total;
}

export function searchMangas(list, query, limit = Infinity) {
  if (!normalize(query).trim()) return list.slice(0, limit);
  return list
    .map((m) => ({ m, s: scoreManga(m, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || b.m.popularity - a.m.popularity)
    .slice(0, limit)
    .map((x) => x.m);
}

export const SORTS = [
  { id: 'popular', label: 'Popular' },
  { id: 'latest', label: 'Latest' },
  { id: 'rating', label: 'Rating' },
  { id: 'az', label: 'A–Z' },
];

export function sortMangas(list, sort) {
  const copy = [...list];
  switch (sort) {
    case 'latest':
      return copy.sort((a, b) => b.updated.localeCompare(a.updated) || b.popularity - a.popularity);
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating || b.votes - a.votes);
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'popular':
    default:
      return copy.sort((a, b) => b.popularity - a.popularity || b.reads - a.reads);
  }
}

/** The single entry point used by the Explore page. */
export function queryMangas(list, { query = '', genre = 'all', status = 'all', sort = 'popular' } = {}) {
  let result = list;
  if (genre && genre !== 'all') result = result.filter((m) => m.genres.includes(genre));
  if (status && status !== 'all') result = result.filter((m) => m.status === status);
  if (normalize(query).trim()) {
    const ranked = searchMangas(result, query);
    // When the user types, relevance wins unless they explicitly picked another sort.
    return sort === 'popular' ? ranked : sortMangas(ranked, sort);
  }
  return sortMangas(result, sort);
}
