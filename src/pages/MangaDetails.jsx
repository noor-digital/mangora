import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowDownUp, BookOpen, Check, Play } from 'lucide-react';
import Art from '../components/manga/Art.jsx';
import Rating from '../components/manga/Rating.jsx';
import FavoriteButton from '../components/manga/FavoriteButton.jsx';
import CoverGhost from '../components/manga/CoverGhost.jsx';
import MangaRow from '../components/manga/MangaRow.jsx';
import NotFound from './NotFound.jsx';
import { getMangaById, MANGAS } from '../data/mangas.js';
import { getChapters } from '../data/chapters.js';
import { genreById } from '../data/genres.js';
import { useHistory } from '../hooks/useHistory.js';
import { useReadingProgress } from '../hooks/useReadingProgress.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getResumeTarget } from '../utils/library.js';
import { formatCount, formatDate } from '../utils/format.js';

const INITIAL_CHAPTERS = 12;

export default function MangaDetails() {
  const { id } = useParams();
  const manga = getMangaById(id);
  if (!manga) return <NotFound />;
  return <Details key={manga.id} manga={manga} />;
}

function Details({ manga }) {
  useDocumentTitle(manga.title);
  const location = useLocation();
  const reduced = useReducedMotion();
  const wide = useMediaQuery('(min-width: 721px)');
  const { recordView } = useHistory();
  const { progress, readMap } = useReadingProgress();
  const coverRef = useRef(null);
  const [ghost, setGhost] = useState(null);
  const [newestFirst, setNewestFirst] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const chapters = useMemo(() => getChapters(manga), [manga]);
  const readList = readMap[manga.id] ?? [];
  const entry = progress[manga.id];
  const resume = getResumeTarget(manga, progress);

  useEffect(() => {
    recordView(manga.id);
  }, [manga.id, recordView]);

  // Card → hero: measure where the cover lands, then fly the clicked cover there.
  useLayoutEffect(() => {
    const from = location.state?.coverRect;
    const el = coverRef.current;
    if (!from || !el || reduced) return;
    const r = el.getBoundingClientRect();
    setGhost({ from, to: { top: r.top, left: r.left, width: r.width, height: r.height } });
    // Clear the one-shot state so back/forward or a refresh never replays the flight.
    window.history.replaceState({ ...window.history.state, usr: null }, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const similar = useMemo(() => {
    const own = new Set(manga.genres);
    return MANGAS.filter((m) => m.id !== manga.id)
      .map((m) => ({ m, shared: m.genres.filter((g) => own.has(g)).length }))
      .filter((x) => x.shared > 0)
      .sort((a, b) => b.shared - a.shared || b.m.popularity - a.m.popularity)
      .slice(0, 10)
      .map((x) => x.m);
  }, [manga]);

  const ordered = useMemo(() => (newestFirst ? [...chapters].reverse() : chapters), [chapters, newestFirst]);
  const visible = showAll ? ordered : ordered.slice(0, INITIAL_CHAPTERS);

  return (
    <article className="detail" style={{ '--hero-accent': manga.palette[2] }}>
      <header className="detail__hero page-top">
        <div className="detail__backdrop" aria-hidden="true">
          <Art manga={manga} orient={wide ? 'landscape' : 'portrait'} figure={false} />
        </div>
        <div className="detail__veil" aria-hidden="true" />
        <div className="container detail__grid">
          <div className="detail__cover" ref={coverRef} style={{ visibility: ghost ? 'hidden' : 'visible' }}>
            <Art manga={manga} />
          </div>

          <div className="detail__info">
            <ul className="meta">
              {manga.genres.map((g) => (
                <li key={g}><Link to={`/genres?g=${g}`}>{genreById[g]?.label ?? g}</Link></li>
              ))}
            </ul>
            <h1 className="detail__title">{manga.title}</h1>
            <p className="detail__tagline">{manga.tagline}</p>
            <p className="detail__desc">{manga.description}</p>

            <dl className="facts">
              <div><dt>Author</dt><dd>{manga.author}</dd></div>
              <div><dt>Status</dt><dd>{manga.status}</dd></div>
              <div><dt>Year</dt><dd>{manga.year}</dd></div>
              <div><dt>Rating</dt><dd><Rating value={manga.rating} votes={manga.votes} /> <span className="facts__small">({formatCount(manga.votes)})</span></dd></div>
              <div><dt>Chapters</dt><dd>{manga.chapters}</dd></div>
            </dl>

            <ul className="tags" aria-label="Tags">
              {manga.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>

            <div className="detail__actions">
              <Link className="btn btn--primary btn--lg" to={`/manga/${manga.id}/read/${resume.chapter}`}>
                <Play size={18} fill="currentColor" aria-hidden="true" />
                {resume.hasProgress ? `Continue, chapter ${resume.chapter}` : 'Read now'}
              </Link>
              <FavoriteButton manga={manga} variant="full" className="btn--lg" />
              {resume.hasProgress && (
                <Link className="link-btn" to={`/manga/${manga.id}/read/1?page=1`}>Start from chapter 1</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="container chapters" aria-labelledby="chapters-title">
        <div className="section-head">
          <div>
            <h2 className="section-head__title" id="chapters-title">Chapters</h2>
            <p className="section-head__sub">
              {readList.length} of {chapters.length} read
            </p>
          </div>
          <button type="button" className="link-btn" onClick={() => setNewestFirst((v) => !v)}>
            <ArrowDownUp size={15} aria-hidden="true" /> {newestFirst ? 'Newest first' : 'Oldest first'}
          </button>
        </div>

        <ol className="chapter-list">
          {visible.map((c) => {
            const isRead = readList.includes(c.number);
            const inProgress = entry && entry.chapter === c.number && entry.page < entry.total;
            return (
              <li key={c.number} className={`chapter ${isRead ? 'is-read' : ''}`}>
                <span className="chapter__num">{c.number}</span>
                <div className="chapter__main">
                  <h3 className="chapter__title">Chapter {c.number}: {c.title}</h3>
                  <p className="chapter__meta">
                    {formatDate(c.date)}
                    <span className="chapter__sep" aria-hidden="true" />
                    {c.pages} pages
                  </p>
                </div>
                <span className={`chapter__state ${isRead ? 'is-read' : inProgress ? 'is-progress' : ''}`}>
                  {isRead ? <><Check size={14} aria-hidden="true" /> Read</> : inProgress ? `Page ${entry.page} of ${entry.total}` : 'Unread'}
                </span>
                <Link className="btn btn--ghost btn--sm" to={`/manga/${manga.id}/read/${c.number}`} aria-label={`${inProgress ? 'Continue' : 'Read'} chapter ${c.number}`}>
                  <BookOpen size={15} aria-hidden="true" /> {inProgress ? 'Continue' : 'Read'}
                </Link>
              </li>
            );
          })}
        </ol>
        {!showAll && ordered.length > INITIAL_CHAPTERS && (
          <div className="center-row">
            <button type="button" className="btn btn--ghost" onClick={() => setShowAll(true)}>
              Show all {ordered.length} chapters
            </button>
          </div>
        )}
      </section>

      {similar.length > 0 && <MangaRow title="You might also like" items={similar} />}

      {ghost && (
        <CoverGhost
          manga={manga}
          from={ghost.from}
          to={ghost.to}
          onDone={() => setGhost(null)}
        />
      )}
    </article>
  );
}
