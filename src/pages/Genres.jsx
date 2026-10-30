import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MangaCard from '../components/manga/MangaCard.jsx';
import { MANGAS } from '../data/mangas.js';
import { GENRES, genreById } from '../data/genres.js';
import { sortMangas } from '../utils/search.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function Genres() {
  const [params, setParams] = useSearchParams();
  const selected = genreById[params.get('g')] ? params.get('g') : 'action';
  const genre = genreById[selected];
  useDocumentTitle(genre.label);

  const counts = useMemo(
    () => Object.fromEntries(GENRES.map((g) => [g.id, MANGAS.filter((m) => m.genres.includes(g.id)).length])),
    [],
  );
  const items = useMemo(
    () => sortMangas(MANGAS.filter((m) => m.genres.includes(selected)), 'popular'),
    [selected],
  );

  return (
    <div className="page-top container">
      <header className="page-head">
        <h1 className="page-head__title">Genres</h1>
        <p className="page-head__sub">Pick a world to step into.</p>
      </header>

      <div className="genres-layout">
        <ul className="genre-index" aria-label="Genres">
          {GENRES.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                className={`genre-index__item ${g.id === selected ? 'is-on' : ''}`}
                aria-pressed={g.id === selected}
                onClick={() => setParams({ g: g.id }, { replace: true })}
              >
                <span className="genre-index__name">{g.label}</span>
                <span className="genre-index__count">{counts[g.id]}</span>
                <span className="genre-index__rule" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>

        <section className="genres-results" aria-live="polite" aria-labelledby="genre-heading">
          <div className="genres-results__head" key={selected}>
            <h2 id="genre-heading" className="genres-results__title">{genre.label}</h2>
            <p>{genre.tagline}</p>
          </div>
          <div className="manga-grid manga-grid--tight">
            {items.map((m, i) => <MangaCard key={`${selected}-${m.id}`} manga={m} index={i} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
