import { useMemo, useState } from 'react';
import { Flame, Star, BookOpen } from 'lucide-react';
import RankList from '../components/manga/RankList.jsx';
import Rating from '../components/manga/Rating.jsx';
import { MANGAS } from '../data/mangas.js';
import { getMostRead, getTopRated, getTrending, readScore, trendingScore } from '../utils/rankings.js';
import { formatCount } from '../utils/format.js';
import { useReadingProgress } from '../hooks/useReadingProgress.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const TABS = [
  { id: 'trending', label: 'Trending', icon: Flame, note: 'Demo popularity, boosted by how recently a series was updated.' },
  { id: 'read', label: 'Most read', icon: BookOpen, note: 'Demo read counts plus the chapters you have read on this device.' },
  { id: 'rated', label: 'Top rated', icon: Star, note: 'Average rating from the demo data; vote count breaks ties.' },
];

export default function Rankings() {
  useDocumentTitle('Rankings');
  const [tab, setTab] = useState('trending');
  const { readMap } = useReadingProgress();

  const localReads = useMemo(
    () => Object.fromEntries(Object.entries(readMap).map(([id, list]) => [id, list.length])),
    [readMap],
  );

  const rows = useMemo(() => {
    if (tab === 'trending') {
      return getTrending(MANGAS).slice(0, 10).map((manga) => ({ manga, metric: `${Math.round(trendingScore(manga))} pts` }));
    }
    if (tab === 'read') {
      return getMostRead(MANGAS, localReads).slice(0, 10).map((manga) => ({ manga, metric: `${formatCount(readScore(manga, localReads))} reads` }));
    }
    return getTopRated(MANGAS).slice(0, 10).map((manga) => ({
      manga,
      metric: <Rating value={manga.rating} votes={manga.votes} />,
    }));
  }, [tab, localReads]);

  const active = TABS.find((t) => t.id === tab);

  return (
    <div className="page-top container">
      <header className="page-head">
        <h1 className="page-head__title">Rankings</h1>
        <p className="page-head__sub">Computed live from the demo catalogue and your own reading.</p>
      </header>

      <div className="tabs" role="tablist" aria-label="Ranking categories">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="rank-panel"
            tabIndex={tab === t.id ? 0 : -1}
            className={`tabs__tab ${tab === t.id ? 'is-on' : ''}`}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              const i = TABS.findIndex((x) => x.id === tab);
              if (e.key === 'ArrowRight') setTab(TABS[(i + 1) % TABS.length].id);
              if (e.key === 'ArrowLeft') setTab(TABS[(i - 1 + TABS.length) % TABS.length].id);
            }}
          >
            <t.icon size={17} aria-hidden="true" /> {t.label}
          </button>
        ))}
      </div>

      <section id="rank-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab} className="rank-panel">
        <p className="rank-panel__note">{active.note}</p>
        <RankList rows={rows} />
      </section>
    </div>
  );
}
