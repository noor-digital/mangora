import { useDeferredValue, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, X } from 'lucide-react';
import MangaCard from '../components/manga/MangaCard.jsx';
import Segmented from '../components/ui/Segmented.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { MANGAS } from '../data/mangas.js';
import { GENRES } from '../data/genres.js';
import { queryMangas, SORTS } from '../utils/search.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

const STATUSES = [
  { id: 'all', label: 'Any status' },
  { id: 'Ongoing', label: 'Ongoing' },
  { id: 'Completed', label: 'Completed' },
  { id: 'Hiatus', label: 'Hiatus' },
];

export default function Explore() {
  useDocumentTitle('Explore');
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const genre = params.get('genre') ?? 'all';
  const sort = params.get('sort') ?? 'popular';
  const status = params.get('status') ?? 'all';
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => queryMangas(MANGAS, { query: deferredQuery, genre, sort, status }),
    [deferredQuery, genre, sort, status],
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      const isDefault = !value || value === 'all' || (key === 'sort' && value === 'popular');
      if (isDefault) next.delete(key);
      else next.set(key, value);
    });
    setParams(next, { replace: true });
  };
  const clearAll = () => setParams({}, { replace: true });
  const filtered = query || genre !== 'all' || status !== 'all';

  return (
    <div className="page-top container">
      <header className="page-head">
        <h1 className="page-head__title">Explore manga</h1>
        <p className="page-head__sub">{MANGAS.length} original series to search, filter and sort.</p>
      </header>

      <div className="toolbar">
        <div className="searchbox">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search your next story…"
            aria-label="Search by title, author, genre or tag"
            autoComplete="off"
          />
          {query && (
            <button type="button" className="icon-btn icon-btn--sm" onClick={() => update({ q: '' })} aria-label="Clear search">
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="toolbar__row">
          <Segmented label="Sort by" size="sm" value={sort} options={SORTS} onChange={(v) => update({ sort: v })} />
          <label className="select">
            <span className="sr-only">Status</span>
            <select value={status} onChange={(e) => update({ status: e.target.value })}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Filter by genre">
        {[{ id: 'all', label: 'All' }, ...GENRES].map((g) => (
          <button
            type="button"
            key={g.id}
            className={`chip ${genre === g.id ? 'is-on' : ''}`}
            aria-pressed={genre === g.id}
            onClick={() => update({ genre: g.id })}
          >
            {g.label}
          </button>
        ))}
      </div>

      <p className="results-count" role="status">
        {results.length} {results.length === 1 ? 'series' : 'series'}
        {filtered && (
          <button type="button" className="link-btn" onClick={clearAll}>Clear filters</button>
        )}
      </p>

      {results.length > 0 ? (
        <div className="manga-grid">
          {results.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
        </div>
      ) : (
        <EmptyState
          icon={SearchX}
          title="No series match these filters"
          text="Try a broader search, another genre, or reset the status filter."
          actionLabel="Clear filters"
          onAction={clearAll}
        />
      )}
    </div>
  );
}
