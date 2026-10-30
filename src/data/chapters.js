import { createRng, shuffle } from '../utils/random.js';

const TITLES = [
  'The Bell Before Dawn', 'Salt on the Wind', 'A Door Left Open', 'What the River Kept',
  'Ash and Honey', 'The Long Way Round', 'Paper Promises', 'Eleven Steps Down',
  'Borrowed Light', 'The Quiet Between', 'Thread and Needle', 'After the Storm Lantern',
  'A Map With No Edges', 'Red Sky, Open Hands', 'Small Hours', 'The Weight of Names',
  'Hollow Victory', 'Where the Path Bends', 'Night Market', 'The Last Honest Lie',
  'Tides of Static', 'Under the Same Moon', 'A Debt Remembered', 'Glass Hours',
  'Wolves at the Window', 'Understudy', 'The Third Knock', 'Lanterns in the Rain',
  'Cold Iron, Warm Tea', 'The Day After Tomorrow', 'Smoke Signals', 'Unsent',
  'The Honest Machine', 'Crossing the Meridian', 'A Thousand Small Fires', 'Echo Season',
  'No Such Place', 'The Stranger’s Share', 'Rooftop Vows', 'Everything Returns',
];

const DAY = 86400000;
const cache = new Map();

/** Deterministic chapter list: same manga → same titles, dates and page counts. */
export function getChapters(manga) {
  if (cache.has(manga.id)) return cache.get(manga.id);
  const rng = createRng(`chapters:${manga.id}`);
  const titles = shuffle(rng, TITLES);
  const latest = new Date(manga.updated + 'T00:00:00').getTime();
  const list = Array.from({ length: manga.chapters }, (_, i) => {
    const number = i + 1;
    const date = new Date(latest - (manga.chapters - number) * 7 * DAY).toISOString().slice(0, 10);
    return {
      number,
      title: titles[i % titles.length],
      date,
      pages: 10 + Math.floor(rng() * 5),
    };
  });
  cache.set(manga.id, list);
  return list;
}

export const getChapter = (manga, number) => getChapters(manga).find((c) => c.number === number);
