import { Link } from 'react-router-dom';
import {
  ArrowDownUp, ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Maximize, Minimize,
  SkipBack, SkipForward, SlidersHorizontal,
} from 'lucide-react';

export function ReaderTopBar({ manga, chapter, mode, fullscreen, canFullscreen, onToggleMode, onToggleFullscreen, onOpenSettings }) {
  return (
    <header className="reader__bar reader__bar--top">
      <Link className="icon-btn" to={`/manga/${manga.id}`} aria-label={`Back to ${manga.title}`}>
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <div className="reader__title">
        <strong>{manga.title}</strong>
        <span>Chapter {chapter.number}: {chapter.title}</span>
      </div>
      <div className="reader__tools">
        <button type="button" className="icon-btn" onClick={onToggleMode} aria-label={mode === 'vertical' ? 'Switch to page-by-page' : 'Switch to vertical scroll'} title="Reading mode (M)">
          {mode === 'vertical' ? <BookOpen size={19} aria-hidden="true" /> : <ArrowDownUp size={19} aria-hidden="true" />}
        </button>
        {canFullscreen && (
          <button type="button" className="icon-btn" onClick={onToggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title="Fullscreen (F)">
            {fullscreen ? <Minimize size={19} aria-hidden="true" /> : <Maximize size={19} aria-hidden="true" />}
          </button>
        )}
        <button type="button" className="icon-btn" onClick={onOpenSettings} aria-label="Reader settings" title="Settings">
          <SlidersHorizontal size={19} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export function ReaderBottomBar({ page, total, hasPrevChapter, hasNextChapter, onPrevChapter, onNextChapter, onPrev, onNext, onSeek }) {
  const shown = Math.min(Math.max(page, 1), total);
  const fill = total > 1 ? ((shown - 1) / (total - 1)) * 100 : 100;
  return (
    <footer className="reader__bar reader__bar--bottom">
      <button type="button" className="icon-btn" onClick={onPrevChapter} disabled={!hasPrevChapter} aria-label="Previous chapter" title="Previous chapter ([)">
        <SkipBack size={19} aria-hidden="true" />
      </button>
      <button type="button" className="icon-btn" onClick={onPrev} aria-label="Previous page" title="Previous page (←)">
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <div className="reader__seek">
        <input
          type="range"
          min={1}
          max={total}
          value={shown}
          style={{ '--fill': `${fill}%` }}
          onChange={(e) => onSeek(Number(e.target.value))}
          aria-label="Page"
          aria-valuetext={`Page ${shown} of ${total}`}
        />
        <span className="reader__count" aria-hidden="true">{shown} / {total}</span>
      </div>
      <button type="button" className="icon-btn" onClick={onNext} aria-label="Next page" title="Next page (→)">
        <ChevronRight size={22} aria-hidden="true" />
      </button>
      <button type="button" className="icon-btn" onClick={onNextChapter} disabled={!hasNextChapter} aria-label="Next chapter" title="Next chapter (])">
        <SkipForward size={19} aria-hidden="true" />
      </button>
    </footer>
  );
}
