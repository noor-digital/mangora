import { useMemo } from 'react';
import { BookMarked, Clock3, Heart, Trash2 } from 'lucide-react';
import MangaCard from '../components/manga/MangaCard.jsx';
import ContinueCard from '../components/manga/ContinueCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionHead from '../components/manga/SectionHead.jsx';
import { MANGAS, MANGA_BY_ID } from '../data/mangas.js';
import { useLibrary } from '../hooks/useLibrary.js';
import { useHistory } from '../hooks/useHistory.js';
import { useReadingProgress } from '../hooks/useReadingProgress.js';
import { useSettings } from '../hooks/useSettings.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { computeStats, getContinueEntries } from '../utils/library.js';

export default function Library() {
  useDocumentTitle('My Library');
  const { library } = useLibrary();
  const { history, clearHistory } = useHistory();
  const { progress, readMap } = useReadingProgress();
  const { settings } = useSettings();
  const toast = useToast();

  const stats = useMemo(() => computeStats({ library, progress, readMap, mangas: MANGAS }), [library, progress, readMap]);
  const continueList = useMemo(() => getContinueEntries({ progress, mangas: MANGAS }), [progress]);
  const favorites = useMemo(() => library.map((id) => MANGA_BY_ID[id]).filter(Boolean), [library]);
  const recent = useMemo(() => history.map((h) => MANGA_BY_ID[h.id]).filter(Boolean), [history]);

  return (
    <div className="page-top container">
      <header className="profile">
        <div className="profile__avatar" aria-hidden="true">{(settings.readerName || 'R').trim().charAt(0).toUpperCase()}</div>
        <div className="profile__who">
          <h1 className="profile__name">{settings.readerName || 'Reader'}</h1>
          <p>Your library lives on this device only.</p>
        </div>
        <dl className="profile__stats">
          <div><dt>Saved</dt><dd>{stats.saved}</dd></div>
          <div><dt>Reading</dt><dd>{stats.reading}</dd></div>
          <div><dt>Chapters read</dt><dd>{stats.chaptersRead}</dd></div>
        </dl>
      </header>

      <section className="lib-section" aria-labelledby="lib-continue">
        <SectionHead id="lib-continue" title="Continue reading" />
        {continueList.length ? (
          <div className="continue-grid">
            {continueList.map(({ manga, entry }) => <ContinueCard key={manga.id} manga={manga} entry={entry} />)}
          </div>
        ) : (
          <EmptyState
            icon={BookMarked}
            title="Nothing in progress"
            text="Open any chapter and your place is saved automatically, page by page."
            actionLabel="Find something to read"
            actionTo="/explore"
          />
        )}
      </section>

      <section className="lib-section" aria-labelledby="lib-fav">
        <SectionHead id="lib-fav" title="Favorites" subtitle={favorites.length ? `${favorites.length} saved` : undefined} />
        {favorites.length ? (
          <div className="manga-grid">
            {favorites.map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            text="Use the heart on any cover, or “Add to Library” on a series page, to keep it here."
            actionLabel="Browse the catalogue"
            actionTo="/explore"
          />
        )}
      </section>

      <section className="lib-section" aria-labelledby="lib-recent">
        <div className="section-head">
          <h2 className="section-head__title" id="lib-recent">Recently viewed</h2>
          {recent.length > 0 && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                clearHistory();
                toast('History cleared');
              }}
            >
              <Trash2 size={15} aria-hidden="true" /> Clear history
            </button>
          )}
        </div>
        {recent.length ? (
          <div className="manga-grid">
            {recent.slice(0, 12).map((m, i) => <MangaCard key={m.id} manga={m} index={i} />)}
          </div>
        ) : (
          <EmptyState
            icon={Clock3}
            title="No history"
            text="Series you open will appear here, newest first."
            actionLabel="Explore"
            actionTo="/explore"
          />
        )}
      </section>
    </div>
  );
}
