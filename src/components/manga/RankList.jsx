import { Link } from 'react-router-dom';
import Art from './Art.jsx';
import { genreById } from '../../data/genres.js';

/** Numbered ranking. `rows` = [{ manga, metric }] already sorted. */
export default function RankList({ rows, compact = false }) {
  return (
    <ol className={`ranklist ${compact ? 'ranklist--compact' : ''}`}>
      {rows.map(({ manga, metric }, i) => (
        <li key={manga.id} className={`ranklist__row ${i < 3 && !compact ? 'is-top' : ''}`}>
          <span className="ranklist__rank" aria-label={`Rank ${i + 1}`}>{i + 1}</span>
          <Link className="ranklist__cover" to={`/manga/${manga.id}`} tabIndex={-1} aria-hidden="true">
            <Art manga={manga} />
          </Link>
          <div className="ranklist__info">
            <Link className="ranklist__title" to={`/manga/${manga.id}`}>{manga.title}</Link>
            <span className="ranklist__genres">
              {manga.genres.slice(0, 2).map((g) => genreById[g]?.label ?? g).join(', ')}
            </span>
          </div>
          <span className="ranklist__metric">{metric}</span>
        </li>
      ))}
    </ol>
  );
}
