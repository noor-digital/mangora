import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Compass, Play } from 'lucide-react';
import Art from './Art.jsx';
import Rating from './Rating.jsx';
import { genreById } from '../../data/genres.js';
import { useSettings } from '../../hooks/useSettings.js';
import { useReadingProgress } from '../../hooks/useReadingProgress.js';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';
import { useMediaQuery } from '../../hooks/useMediaQuery.js';
import { getResumeTarget } from '../../utils/library.js';
import { pad2 } from '../../utils/format.js';

const INTERVAL = 8000;

export default function HeroCarousel({ items }) {
  const rootRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { settings } = useSettings();
  const { progress } = useReadingProgress();
  const reduced = useReducedMotion();
  const portrait = useMediaQuery('(max-width: 720px)');
  const total = items.length;
  const autoplay = settings.heroAutoplay && !reduced && !hover && !hidden;

  const go = useCallback((i) => setIndex(((i % total) + total) % total), [total]);

  // Automatic rotation: pauses on hover/focus, when the tab is hidden, or with reduced motion.
  useEffect(() => {
    if (!autoplay) return undefined;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % total), INTERVAL);
    return () => window.clearTimeout(t);
  }, [autoplay, index, total]);

  useEffect(() => {
    const on = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);

  // Mouse + scroll parallax: both only write CSS variables, once per frame, with no React re-render.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return undefined;
    const state = { mx: 0, my: 0 };
    let raf = 0;
    const write = () => {
      raf = 0;
      const h = el.offsetHeight || 1;
      const y = Math.min(Math.max(window.scrollY, 0), h);
      el.style.setProperty('--sy', y.toFixed(1));
      el.style.setProperty('--p', (y / h).toFixed(3));
      el.style.setProperty('--mx', state.mx.toFixed(3));
      el.style.setProperty('--my', state.my.toFixed(3));
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      state.mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      state.my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      req();
    };
    const onLeave = () => {
      state.mx = 0;
      state.my = 0;
      req();
    };
    write();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('scroll', req);
      window.removeEventListener('resize', req);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  const active = items[index];
  const resume = getResumeTarget(active, progress);
  const orient = portrait ? 'portrait' : 'landscape';

  return (
    <section
      ref={rootRef}
      className="hero"
      style={{ '--hero-accent': active.palette[2] }}
      aria-roledescription="carousel"
      aria-label="Featured manga"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <div className="hero__stage" aria-hidden={false}>
        {items.map((m, i) => (
          <div key={m.id} className={`hero__slide ${i === index ? 'is-active' : ''}`} aria-hidden={i !== index}>
            <Art manga={m} orient={orient} className="hero__art" />
          </div>
        ))}
      </div>
      <div className="hero__grain" aria-hidden="true" />
      <div className="hero__veil" aria-hidden="true" />
      <div className="hero__fade" aria-hidden="true" />

      <div className="hero__inner container">
        <div className="hero__content" key={active.id} aria-live="polite">
          <ul className="meta hero__meta">
            {active.genres.map((g) => (
              <li key={g}>{genreById[g]?.label ?? g}</li>
            ))}
            <li>{active.status}</li>
            <li><Rating value={active.rating} /></li>
          </ul>
          <h1 className="hero__title">{active.title}</h1>
          <p className="hero__tagline">{active.tagline}</p>
          <p className="hero__desc">{active.description}</p>
          <div className="hero__actions">
            <Link className="btn btn--primary btn--lg" to={`/manga/${active.id}/read/${resume.chapter}`}>
              <Play size={18} fill="currentColor" aria-hidden="true" />
              {resume.hasProgress ? 'Continue reading' : 'Read now'}
            </Link>
            <Link className="btn btn--ghost btn--lg" to={`/manga/${active.id}`}>
              <Compass size={18} aria-hidden="true" />
              Discover
            </Link>
          </div>
        </div>

        <nav className="hero__rail" aria-label="Choose a featured story">
          <p className="hero__count" aria-hidden="true">{pad2(index + 1)} / {pad2(total)}</p>
          <ol>
            {items.map((m, i) => (
              <li key={m.id}>
                <button
                  type="button"
                  className={`hero__tab ${i === index ? 'is-active' : ''}`}
                  aria-current={i === index ? 'true' : undefined}
                  aria-label={`Show ${m.title}`}
                  onClick={() => go(i)}
                >
                  <span className="hero__tab-title">{m.title}</span>
                  <span className="hero__tab-bar" aria-hidden="true">
                    <i
                      key={`${index}-${autoplay}`}
                      className={i === index ? (autoplay ? 'is-running' : 'is-still') : ''}
                      style={{ animationDuration: `${INTERVAL}ms` }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hero__arrows">
            <button type="button" className="icon-btn" onClick={() => go(index - 1)} aria-label="Previous story">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" className="icon-btn" onClick={() => go(index + 1)} aria-label="Next story">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>
        </nav>
      </div>
    </section>
  );
}
