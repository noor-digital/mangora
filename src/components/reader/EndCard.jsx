import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

export default function EndCard({ manga, chapter, nextChapter, onReplay }) {
  return (
    <div className="endcard">
      <p className="endcard__label">Chapter {chapter} complete</p>
      <h2 className="endcard__title">{nextChapter ? `Next: ${nextChapter.title}` : 'You are all caught up'}</h2>
      <p className="endcard__text">
        {nextChapter
          ? `Chapter ${nextChapter.number} is ready whenever you are.`
          : `That is every chapter of ${manga.title} in this demo.`}
      </p>
      <div className="endcard__actions">
        {nextChapter && (
          <Link className="btn btn--primary btn--lg" to={`/manga/${manga.id}/read/${nextChapter.number}?page=1`}>
            Next chapter <ArrowRight size={18} aria-hidden="true" />
          </Link>
        )}
        <Link className="btn btn--ghost btn--lg" to={`/manga/${manga.id}`}>
          <ArrowLeft size={18} aria-hidden="true" /> Back to series
        </Link>
        <button type="button" className="btn btn--ghost btn--lg" onClick={onReplay}>
          <RotateCcw size={18} aria-hidden="true" /> Read again
        </button>
      </div>
    </div>
  );
}
