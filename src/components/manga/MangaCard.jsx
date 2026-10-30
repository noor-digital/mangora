import { memo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import Art from './Art.jsx';
import Rating from './Rating.jsx';
import FavoriteButton from './FavoriteButton.jsx';
import { genreById } from '../../data/genres.js';
import { useReadingProgress } from '../../hooks/useReadingProgress.js';
import { getResumeTarget } from '../../utils/library.js';

function MangaCard({ manga, index = 0, rank }) {
  const navigate = useNavigate();
  const mediaRef = useRef(null);
  const { progress } = useReadingProgress();
  const entry = progress[manga.id];
  const resume = getResumeTarget(manga, progress);
  const detailPath = `/manga/${manga.id}`;
  const readPath = `/manga/${manga.id}/read/${resume.chapter}`;
  const pct = entry ? Math.round(((entry.chapter - 1 + entry.page / entry.total) / manga.chapters) * 100) : 0;

  // The cover rectangle travels with the navigation so the detail page can grow it into its hero.
  const open = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    const r = mediaRef.current?.getBoundingClientRect();
    navigate(detailPath, {
      state: r ? { coverRect: { top: r.top, left: r.left, width: r.width, height: r.height } } : undefined,
    });
  };

  return (
    <article className="card" style={{ '--i': Math.min(index, 12) }}>
      <div className="card__media" ref={mediaRef}>
        <Art manga={manga} />
        <Link className="card__link" to={detailPath} onClick={open} aria-label={`Open ${manga.title}`} />
        <div className="card__veil" aria-hidden="true">
          <p className="card__blurb">{manga.tagline}</p>
        </div>
        {rank != null && <span className="card__rank" aria-label={`Rank ${rank}`}>{rank}</span>}
        <FavoriteButton manga={manga} className="card__fav" />
        <Link className="card__read" to={readPath}>
          <Play size={14} fill="currentColor" aria-hidden="true" />
          {resume.hasProgress ? 'Continue' : 'Read'}
        </Link>
        {entry && (
          <div className="card__progress" role="img" aria-label={`${pct}% read`}>
            <span style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
      <div className="card__body">
        <h3 className="card__title">
          <Link to={detailPath} onClick={open}>{manga.title}</Link>
        </h3>
        <p className="card__genres">{manga.genres.slice(0, 2).map((g) => genreById[g]?.label ?? g).join(', ')}</p>
        <p className="card__meta">
          <Rating value={manga.rating} />
          <span className="card__meta-sep" aria-hidden="true" />
          <span>{manga.chapters} chapters</span>
        </p>
      </div>
    </article>
  );
}

export default memo(MangaCard);
