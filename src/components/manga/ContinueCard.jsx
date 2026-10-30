import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import Art from './Art.jsx';
import { getChapter } from '../../data/chapters.js';
import { timeAgo } from '../../utils/format.js';

export default function ContinueCard({ manga, entry }) {
  const chapter = getChapter(manga, entry.chapter);
  const pct = Math.round((entry.page / entry.total) * 100);
  return (
    <article className="continue">
      <Link className="continue__cover" to={`/manga/${manga.id}`} aria-label={`Open ${manga.title}`}>
        <Art manga={manga} />
      </Link>
      <div className="continue__body">
        <h3 className="continue__title"><Link to={`/manga/${manga.id}`}>{manga.title}</Link></h3>
        <p className="continue__where">
          Chapter {entry.chapter}{chapter ? `: ${chapter.title}` : ''}
        </p>
        <p className="continue__page">Page {entry.page} of {entry.total}, read {timeAgo(entry.updatedAt)}</p>
        <div className="progressbar" role="img" aria-label={`${pct}% of the chapter`}><span style={{ width: `${pct}%` }} /></div>
        <Link className="btn btn--primary btn--sm" to={`/manga/${manga.id}/read/${entry.chapter}`}>
          <Play size={14} fill="currentColor" aria-hidden="true" /> Continue reading
        </Link>
      </div>
    </article>
  );
}
