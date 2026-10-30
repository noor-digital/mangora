import { describe, expect, it } from 'vitest';
import { MANGAS } from '../data/mangas.js';
import { getChapters } from '../data/chapters.js';
import { GENRES } from '../data/genres.js';
import { queryMangas, searchMangas, sortMangas } from './search.js';
import { getMostRead, getTopRated, getTrending } from './rankings.js';
import {
  computeStats, getContinueEntries, getResumeTarget, markChapterRead,
  pushHistory, toggleInList, updateProgress,
} from './library.js';
import { createRng } from './random.js';
import { buildArtSvg } from './art.js';
import { buildPageSvg, wrapText } from './pageArt.js';

const byId = (id) => MANGAS.find((m) => m.id === id);

describe('catalogue data', () => {
  it('has 20-30 unique series', () => {
    expect(MANGAS.length).toBeGreaterThanOrEqual(20);
    expect(MANGAS.length).toBeLessThanOrEqual(30);
    expect(new Set(MANGAS.map((m) => m.id)).size).toBe(MANGAS.length);
  });

  it('only uses declared genres', () => {
    const ids = new Set(GENRES.map((g) => g.id));
    MANGAS.forEach((m) => m.genres.forEach((g) => expect(ids.has(g)).toBe(true)));
  });

  it('generates stable chapters', () => {
    const m = byId('ashen-crown');
    const a = getChapters(m);
    expect(a).toHaveLength(m.chapters);
    expect(a[0].number).toBe(1);
    expect(a.every((c) => c.pages >= 10 && c.pages <= 14)).toBe(true);
    expect(getChapters(m)).toBe(a); // cached
  });
});

describe('search', () => {
  it('finds by title, author, genre and tag', () => {
    expect(searchMangas(MANGAS, 'ashen')[0].id).toBe('ashen-crown');
    expect(searchMangas(MANGAS, 'Mira Takeda').map((m) => m.id)).toContain('ashen-crown');
    expect(searchMangas(MANGAS, 'horror').every((m) => m.genres.includes('horror'))).toBe(true);
    expect(searchMangas(MANGAS, 'pirates').map((m) => m.id)).toContain('salt-and-thunder');
  });

  it('ignores case and accents, and requires every word to match', () => {
    expect(searchMangas(MANGAS, 'ASHEN CROWN')[0].id).toBe('ashen-crown');
    expect(searchMangas(MANGAS, 'ashen sparrow')).toHaveLength(0);
    expect(searchMangas(MANGAS, 'zzzzzz')).toHaveLength(0);
  });

  it('returns everything for an empty query', () => {
    expect(searchMangas(MANGAS, '   ')).toHaveLength(MANGAS.length);
  });
});

describe('filtering and sorting', () => {
  it('filters by genre', () => {
    const r = queryMangas(MANGAS, { genre: 'sports' });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((m) => m.genres.includes('sports'))).toBe(true);
  });

  it('filters by status and combines filters', () => {
    const r = queryMangas(MANGAS, { genre: 'romance', status: 'Completed' });
    expect(r.every((m) => m.genres.includes('romance') && m.status === 'Completed')).toBe(true);
  });

  it('sorts by rating, A-Z and latest', () => {
    const rating = sortMangas(MANGAS, 'rating');
    expect(rating[0].rating).toBeGreaterThanOrEqual(rating[1].rating);
    const az = sortMangas(MANGAS, 'az').map((m) => m.title);
    expect(az).toEqual([...az].sort((a, b) => a.localeCompare(b)));
    const latest = sortMangas(MANGAS, 'latest');
    expect(latest[0].updated >= latest[1].updated).toBe(true);
  });

  it('does not mutate its input', () => {
    const copy = [...MANGAS];
    sortMangas(MANGAS, 'az');
    expect(MANGAS).toEqual(copy);
  });
});

describe('rankings', () => {
  it('top rated is ordered by rating', () => {
    const r = getTopRated(MANGAS);
    for (let i = 1; i < r.length; i++) expect(r[i - 1].rating).toBeGreaterThanOrEqual(r[i].rating);
  });

  it('trending favours popular, recently updated series', () => {
    const now = new Date('2026-10-27').getTime();
    expect(getTrending(MANGAS, now)).toHaveLength(MANGAS.length);
    expect(getTrending(MANGAS, now)[0].popularity).toBeGreaterThan(85);
  });

  it('local reading moves a series up the most-read list', () => {
    const base = getMostRead(MANGAS).findIndex((m) => m.id === 'static-heartbeat');
    const boosted = getMostRead(MANGAS, { 'static-heartbeat': 60 }).findIndex((m) => m.id === 'static-heartbeat');
    expect(boosted).toBeLessThan(base);
  });
});

describe('library helpers', () => {
  it('toggles favourites', () => {
    const added = toggleInList([], 'a');
    expect(added).toEqual(['a']);
    expect(toggleInList(added, 'a')).toEqual([]);
  });

  it('keeps history unique, newest first and capped', () => {
    let h = [];
    h = pushHistory(h, 'a', 1);
    h = pushHistory(h, 'b', 2);
    h = pushHistory(h, 'a', 3);
    expect(h.map((x) => x.id)).toEqual(['a', 'b']);
    expect(pushHistory(h, 'c', 4, 2)).toHaveLength(2);
  });

  it('saves progress and marks chapters read once', () => {
    const p = updateProgress({}, { mangaId: 'a', chapter: 3, page: 5, total: 12 }, 99);
    expect(p.a).toEqual({ chapter: 3, page: 5, total: 12, updatedAt: 99 });
    const r1 = markChapterRead({}, 'a', 2);
    const r2 = markChapterRead(r1, 'a', 2);
    expect(r2).toBe(r1);
    expect(markChapterRead(r1, 'a', 1).a).toEqual([1, 2]);
  });

  it('resumes where the reader stopped', () => {
    const m = byId('ashen-crown');
    expect(getResumeTarget(m, {})).toEqual({ chapter: 1, page: 1, hasProgress: false });
    expect(getResumeTarget(m, { [m.id]: { chapter: 4, page: 6, total: 12 } })).toEqual({ chapter: 4, page: 6, hasProgress: true });
    // finished chapter → start the next one
    expect(getResumeTarget(m, { [m.id]: { chapter: 4, page: 12, total: 12 } }).chapter).toBe(5);
  });

  it('computes profile stats from local data', () => {
    const progress = {
      'ashen-crown': { chapter: 2, page: 3, total: 12, updatedAt: 1 },
      'glass-meridian': { chapter: 18, page: 12, total: 12, updatedAt: 2 }, // series finished
    };
    const stats = computeStats({
      library: ['a', 'b', 'c'], progress, readMap: { 'ashen-crown': [1], x: [1, 2] }, mangas: MANGAS,
    });
    expect(stats).toEqual({ saved: 3, reading: 1, chaptersRead: 3 });
    expect(getContinueEntries({ progress, mangas: MANGAS }).map((e) => e.manga.id)).toEqual(['ashen-crown']);
  });
});

describe('procedural art', () => {
  it('is deterministic for a seed', () => {
    const a = createRng('x');
    const b = createRng('x');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('draws every series without throwing', () => {
    MANGAS.forEach((m) => {
      const svg = buildArtSvg({ scene: m.scene, palette: m.palette, orient: 'portrait', uid: m.id, seed: m.id });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).not.toContain('NaN');
    });
  });

  it('builds reader pages and wraps text', () => {
    const m = byId('hollow-bell-street');
    const svg = buildPageSvg({ manga: m, chapter: 2, title: 'A Door Left Open', page: 3, total: 12 });
    expect(svg).toContain('viewBox="0 0 800 1200"');
    expect(svg).not.toContain('NaN');
    expect(wrapText('one two three four five', 9)).toEqual(['one two', 'three', 'four five']);
  });
});
