import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import MangaPage from '../components/reader/MangaPage.jsx';
import EndCard from '../components/reader/EndCard.jsx';
import ReaderSettings from '../components/reader/ReaderSettings.jsx';
import { ReaderBottomBar, ReaderTopBar } from '../components/reader/ReaderControls.jsx';
import NotFound from './NotFound.jsx';
import { getMangaById } from '../data/mangas.js';
import { getChapters } from '../data/chapters.js';
import { useSettings } from '../hooks/useSettings.js';
import { useReadingProgress } from '../hooks/useReadingProgress.js';
import { useHistory } from '../hooks/useHistory.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Reader() {
  const { id, chapter } = useParams();
  const manga = getMangaById(id);
  const number = Number(chapter);
  const chapters = useMemo(() => (manga ? getChapters(manga) : []), [manga]);
  const current = chapters.find((c) => c.number === number);
  useDocumentTitle(manga && current ? `${manga.title}, chapter ${number}` : 'Reader');
  if (!manga || !current) return <NotFound />;
  // `key` resets all reader state whenever the chapter changes.
  return <ReaderView key={`${manga.id}-${number}`} manga={manga} chapters={chapters} current={current} />;
}

/** Renders the page markup only once it is near the viewport (keeps long chapters light). */
function LazyPage({ onRef, ...props }) {
  const holder = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = holder.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '1400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      className="reader__sheet"
      ref={(el) => {
        holder.current = el;
        onRef(el);
      }}
    >
      {near ? <MangaPage {...props} /> : <div className="skeleton reader__placeholder" aria-hidden="true" />}
    </div>
  );
}

function ReaderView({ manga, chapters, current }) {
  const navigate = useNavigate();
  const toast = useToast();
  const reduced = useReducedMotion();
  const [params] = useSearchParams();
  const { settings, updateSettings } = useSettings();
  const { progress, saveProgress, markRead } = useReadingProgress();
  const { recordView } = useHistory();

  const total = current.pages;
  const n = current.number;
  const prevChapter = chapters.find((c) => c.number === n - 1);
  const nextChapter = chapters.find((c) => c.number === n + 1);
  const mode = settings.readingMode;

  // Page to open on: explicit ?page=, else resume this chapter, else the first page.
  const initialPage = useMemo(() => {
    const q = Number(params.get('page'));
    if (q >= 1) return Math.min(q, total);
    const entry = progress[manga.id];
    if (entry && entry.chapter === n && entry.page < total) return Math.max(1, entry.page);
    return 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [page, setPage] = useState(initialPage);
  const [direction, setDirection] = useState(1);
  const [controls, setControls] = useState(true);
  const [panel, setPanel] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  const rootRef = useRef(null);
  const endRef = useRef(null);
  const pageRefs = useRef([]);
  const pageValue = useRef(page);
  pageValue.current = page;
  const canFullscreen = typeof document !== 'undefined' && Boolean(document.fullscreenEnabled);
  const behavior = reduced ? 'auto' : 'smooth';

  /* ---------- progress ---------- */
  useEffect(() => {
    recordView(manga.id);
    if (initialPage > 1 && !params.get('page')) toast(`Resumed at page ${initialPage}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const shown = Math.min(page, total);
    const t = window.setTimeout(() => {
      saveProgress(manga.id, n, shown, total);
      if (shown >= total) markRead(manga.id, n);
    }, 350);
    return () => window.clearTimeout(t);
  }, [page, total, n, manga.id, saveProgress, markRead]);

  // Flush on exit so the very last page turn is never lost.
  useEffect(
    () => () => {
      const shown = Math.min(pageValue.current, total);
      saveProgress(manga.id, n, shown, total);
      if (shown >= total) markRead(manga.id, n);
    },
    [manga.id, n, total, saveProgress, markRead],
  );

  /* ---------- vertical mode: sync scroll position ↔ page ---------- */
  useLayoutEffect(() => {
    if (mode !== 'vertical') return;
    const target = Math.min(pageValue.current, total);
    const el = pageRefs.current[target - 1];
    if (el && target > 1) el.scrollIntoView({ block: 'start' });
    else window.scrollTo(0, 0);
  }, [mode, total]);

  useEffect(() => {
    if (mode !== 'vertical') return undefined;
    let raf = 0;
    let lastY = window.scrollY;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const probe = window.innerHeight * 0.4;
        let cur = 1;
        for (let i = 0; i < pageRefs.current.length; i++) {
          const el = pageRefs.current[i];
          if (el && el.getBoundingClientRect().top <= probe) cur = i + 1;
        }
        setPage((p) => (p === cur ? p : cur));
        const y = window.scrollY;
        if (y > lastY + 10) setControls(false);
        else if (y < lastY - 10) setControls(true);
        lastY = y;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mode]);

  /* ---------- navigation ---------- */
  const goToPage = useCallback(
    (target) => {
      if (mode === 'vertical') {
        const p = Math.max(1, Math.min(target, total));
        pageRefs.current[p - 1]?.scrollIntoView({ block: 'start', behavior });
        setPage(p);
      } else {
        const p = Math.max(1, Math.min(target, total + 1));
        setDirection(p >= pageValue.current ? 1 : -1);
        setPage(p);
      }
    },
    [mode, total, behavior],
  );

  const openChapter = useCallback(
    (c, atPage = 1) => navigate(`/manga/${manga.id}/read/${c.number}?page=${atPage}`),
    [navigate, manga.id],
  );

  const next = useCallback(() => {
    if (mode === 'vertical') {
      if (page < total) goToPage(page + 1);
      else endRef.current?.scrollIntoView({ block: 'center', behavior });
    } else if (page <= total) goToPage(page + 1);
    else if (nextChapter) openChapter(nextChapter);
  }, [mode, page, total, goToPage, behavior, nextChapter, openChapter]);

  const prev = useCallback(() => {
    if (page > 1) goToPage(page - 1);
    else if (prevChapter) openChapter(prevChapter, prevChapter.pages);
  }, [page, goToPage, prevChapter, openChapter]);

  const toggleMode = useCallback(
    () => updateSettings({ readingMode: mode === 'vertical' ? 'paged' : 'vertical' }),
    [mode, updateSettings],
  );

  const toggleFullscreen = useCallback(() => {
    if (!canFullscreen) return;
    if (document.fullscreenElement) document.exitFullscreen?.();
    else rootRef.current?.requestFullscreen?.().catch(() => {});
  }, [canFullscreen]);

  useEffect(() => {
    const on = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);

  /* ---------- keyboard ---------- */
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target.tagName;
      if (tag === 'SELECT' || tag === 'TEXTAREA' || (tag === 'INPUT' && e.target.type !== 'range')) return;
      if (tag === 'INPUT' && e.target.type === 'range' && e.key.startsWith('Arrow')) return;
      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case ' ':
          if (tag === 'BUTTON' || tag === 'A') return;
          e.preventDefault();
          setControls((c) => !c);
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          toggleMode();
          break;
        case '[':
          if (prevChapter) openChapter(prevChapter);
          break;
        case ']':
          if (nextChapter) openChapter(nextChapter);
          break;
        case 'Escape':
          if (panel) setPanel(false);
          break;
        default:
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [next, prev, toggleFullscreen, toggleMode, prevChapter, nextChapter, openChapter, panel]);

  /* ---------- pointer ---------- */
  const onStageClick = (e) => {
    if (e.target.closest('a,button,input,select')) return;
    if (mode === 'paged') {
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      if (x < 0.28) prev();
      else if (x > 0.72) next();
      else setControls((c) => !c);
    } else {
      setControls((c) => !c);
    }
  };

  const pageProps = { manga, chapter: n, title: current.title, total };

  return (
    <div
      ref={rootRef}
      className={`reader reader--${mode} width-${settings.readerWidth} fit-${settings.readerFit} ${controls ? 'show-controls' : ''}`}
    >
      <ReaderTopBar
        manga={manga}
        chapter={current}
        mode={mode}
        fullscreen={fullscreen}
        canFullscreen={canFullscreen}
        onToggleMode={toggleMode}
        onToggleFullscreen={toggleFullscreen}
        onOpenSettings={() => setPanel((p) => !p)}
      />

      {panel && <ReaderSettings settings={settings} onChange={updateSettings} onClose={() => setPanel(false)} />}

      {mode === 'vertical' ? (
        <div className="reader__scroll" onClick={onStageClick}>
          {Array.from({ length: total }, (_, i) => (
            <LazyPage key={i} page={i + 1} {...pageProps} onRef={(el) => { pageRefs.current[i] = el; }} />
          ))}
          <div ref={endRef}>
            <EndCard manga={manga} chapter={n} nextChapter={nextChapter} onReplay={() => goToPage(1)} />
          </div>
        </div>
      ) : (
        <div className="reader__paged" onClick={onStageClick}>
          {page <= total ? (
            <div key={page} className={`reader__frame ${direction > 0 ? 'from-right' : 'from-left'}`}>
              <MangaPage {...pageProps} page={page} />
            </div>
          ) : (
            <EndCard manga={manga} chapter={n} nextChapter={nextChapter} onReplay={() => goToPage(1)} />
          )}
        </div>
      )}

      <ReaderBottomBar
        page={page}
        total={total}
        hasPrevChapter={Boolean(prevChapter)}
        hasNextChapter={Boolean(nextChapter)}
        onPrevChapter={() => prevChapter && openChapter(prevChapter)}
        onNextChapter={() => nextChapter && openChapter(nextChapter)}
        onPrev={prev}
        onNext={next}
        onSeek={goToPage}
      />
    </div>
  );
}
