import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import Art from '../manga/Art.jsx';
import { MANGAS } from '../../data/mangas.js';
import { GENRES, genreById } from '../../data/genres.js';
import { searchMangas } from '../../utils/search.js';
import { getTrending } from '../../utils/rankings.js';

const SUGGESTIONS = getTrending(MANGAS).slice(0, 4);

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const results = useMemo(() => (query.trim() ? searchMangas(MANGAS, query, 8) : []), [query]);

  useEffect(() => {
    if (!open) return undefined;
    setQuery('');
    setCursor(0);
    const t = window.setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  if (!open) return null;

  const go = (path) => {
    onClose();
    navigate(path);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[cursor]) go(`/manga/${results[cursor].id}`);
      else if (query.trim()) go(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Search manga" onKeyDown={onKeyDown}>
      <div className="search__backdrop" onClick={onClose} />
      <div className="search__panel">
        <div className="search__field">
          <Search size={20} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, genre or tag"
            aria-label="Search manga"
            aria-controls="search-results"
            autoComplete="off"
            spellCheck="false"
          />
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close search">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="search__body" id="search-results">
          {query.trim() && results.length === 0 && (
            <p className="search__empty">
              Nothing matches “{query}”. Try a genre like <em>mystery</em> or an author’s name.
            </p>
          )}

          {results.length > 0 && (
            <ul className="search__list" role="listbox" aria-label="Results">
              {results.map((m, i) => (
                <li key={m.id} role="option" aria-selected={i === cursor}>
                  <Link
                    to={`/manga/${m.id}`}
                    className={`search__item ${i === cursor ? 'is-active' : ''}`}
                    onClick={onClose}
                    onMouseEnter={() => setCursor(i)}
                  >
                    <span className="search__thumb"><Art manga={m} /></span>
                    <span className="search__text">
                      <span className="search__title">{m.title}</span>
                      <span className="search__meta">
                        {m.author}, {m.genres.slice(0, 2).map((g) => genreById[g]?.label ?? g).join(' / ')}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!query.trim() && (
            <div className="search__suggest">
              <h2>Genres</h2>
              <div className="search__chips">
                {GENRES.map((g) => (
                  <button type="button" key={g.id} className="chip" onClick={() => go(`/genres?g=${g.id}`)}>{g.label}</button>
                ))}
              </div>
              <h2>Trending now</h2>
              <ul className="search__list">
                {SUGGESTIONS.map((m) => (
                  <li key={m.id}>
                    <Link to={`/manga/${m.id}`} className="search__item" onClick={onClose}>
                      <span className="search__thumb"><Art manga={m} /></span>
                      <span className="search__text">
                        <span className="search__title">{m.title}</span>
                        <span className="search__meta">{m.tagline}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <p className="search__hint" aria-hidden="true">Up and down to choose, Enter to open, Esc to close</p>
      </div>
    </div>
  );
}
