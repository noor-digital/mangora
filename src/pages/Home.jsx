import { useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Shuffle } from 'lucide-react';
import HeroCarousel from '../components/manga/HeroCarousel.jsx';
import MangaRow from '../components/manga/MangaRow.jsx';
import MangaCard from '../components/manga/MangaCard.jsx';
import ContinueCard from '../components/manga/ContinueCard.jsx';
import SectionHead from '../components/manga/SectionHead.jsx';
import RankList from '../components/manga/RankList.jsx';
import Rating from '../components/manga/Rating.jsx';
import Reveal from '../components/manga/Reveal.jsx';
import Art from '../components/manga/Art.jsx';
import { MANGAS, FEATURED } from '../data/mangas.js';
import { GENRES, genreById } from '../data/genres.js';
import { useReadingProgress } from '../hooks/useReadingProgress.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useScrollParallax } from '../hooks/useScrollParallax.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getContinueEntries, getResumeTarget } from '../utils/library.js';
import { getMostRead, getTopRated, getTrending, readScore } from '../utils/rankings.js';
import { sortMangas } from '../utils/search.js';
import { createRng, shuffle } from '../utils/random.js';
import { formatCount } from '../utils/format.js';

function FeaturedStory({ manga }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const { progress } = useReadingProgress();
  useScrollParallax(ref, !reduced);
  const resume = getResumeTarget(manga, progress);

  return (
    <section className="story" ref={ref} style={{ '--hero-accent': manga.palette[2] }} aria-label="Featured story">
      <Art manga={manga} orient="landscape" className="story__art" />
      <div className="story__veil" aria-hidden="true" />
      <div className="container story__inner">
        <Reveal className="story__content">
          <p className="story__label">Featured story</p>
          <h2 className="story__title">{manga.title}</h2>
          <p className="story__tagline">{manga.tagline}</p>
          <p className="story__desc">{manga.description}</p>
          <ul className="meta">
            {manga.genres.map((g) => <li key={g}>{genreById[g]?.label ?? g}</li>)}
            <li>{manga.chapters} chapters</li>
            <li><Rating value={manga.rating} votes={manga.votes} /></li>
          </ul>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to={`/manga/${manga.id}/read/${resume.chapter}`}>
              <Play size={18} fill="currentColor" aria-hidden="true" />
              {resume.hasProgress ? 'Continue reading' : 'Start chapter 1'}
            </Link>
            <Link className="btn btn--ghost btn--lg" to={`/manga/${manga.id}`}>Open the series</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  useDocumentTitle('');
  const navigate = useNavigate();
  const { progress, readMap } = useReadingProgress();

  const trending = useMemo(() => getTrending(MANGAS).slice(0, 10), []);
  const latest = useMemo(() => sortMangas(MANGAS, 'latest').slice(0, 10), []);
  const story = useMemo(() => getTopRated(MANGAS.filter((m) => !m.featured))[0], []);
  const topRated = useMemo(
    () => getTopRated(MANGAS).slice(0, 5).map((manga) => ({ manga, metric: <Rating value={manga.rating} /> })),
    [],
  );
  const localReads = useMemo(
    () => Object.fromEntries(Object.entries(readMap).map(([id, list]) => [id, list.length])),
    [readMap],
  );
  const mostRead = useMemo(
    () => getMostRead(MANGAS, localReads).slice(0, 5).map((manga) => ({
      manga,
      metric: `${formatCount(readScore(manga, localReads))} reads`,
    })),
    [localReads],
  );
  const picks = useMemo(() => shuffle(createRng(new Date().toDateString()), MANGAS).slice(0, 8), []);
  const continueList = getContinueEntries({ progress, mangas: MANGAS }).slice(0, 3);

  const surprise = () => {
    const m = MANGAS[Math.floor(Math.random() * MANGAS.length)];
    navigate(`/manga/${m.id}`);
  };

  return (
    <>
      <HeroCarousel items={FEATURED} />

      {continueList.length > 0 && (
        <section className="section container" aria-labelledby="continue-title">
          <SectionHead id="continue-title" title="Continue reading" to="/library" linkLabel="Open library" />
          <div className="continue-grid">
            {continueList.map(({ manga, entry }) => <ContinueCard key={manga.id} manga={manga} entry={entry} />)}
          </div>
        </section>
      )}

      <MangaRow title="Trending" subtitle="What readers are opening most right now in the demo catalogue." items={trending} to="/rankings" linkLabel="All rankings" ranked />
      <MangaRow title="New releases" subtitle="Freshly updated series." items={latest} to="/explore?sort=latest" />

      <FeaturedStory manga={story} />

      <section className="section container" aria-labelledby="genres-title">
        <SectionHead id="genres-title" title="Explore by genre" to="/genres" linkLabel="All genres" />
        <Reveal as="ul" className="genre-cloud">
          {GENRES.map((g) => {
            const count = MANGAS.filter((m) => m.genres.includes(g.id)).length;
            return (
              <li key={g.id}>
                <Link to={`/genres?g=${g.id}`} className="genre-cloud__item">
                  <span className="genre-cloud__name">{g.label}</span>
                  <span className="genre-cloud__count">{count} series</span>
                </Link>
              </li>
            );
          })}
        </Reveal>
      </section>

      <section className="section container" aria-labelledby="rank-title">
        <SectionHead id="rank-title" title="Top rankings" to="/rankings" linkLabel="Full rankings" />
        <div className="rank-duo">
          <Reveal>
            <h3 className="rank-duo__title">Top rated</h3>
            <RankList rows={topRated} compact />
          </Reveal>
          <Reveal delay={120}>
            <h3 className="rank-duo__title">Most read</h3>
            <RankList rows={mostRead} compact />
          </Reveal>
        </div>
      </section>

      <section className="section container" aria-labelledby="discover-title">
        <SectionHead id="discover-title" title="Discover more" subtitle="Today’s picks, shuffled daily." />
        <div className="manga-grid">
          {picks.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
        </div>
        <div className="center-row">
          <button type="button" className="btn btn--ghost btn--lg" onClick={surprise}>
            <Shuffle size={18} aria-hidden="true" /> Surprise me
          </button>
        </div>
      </section>
    </>
  );
}
