import { Heart } from 'lucide-react';
import { useLibrary } from '../../hooks/useLibrary.js';

/** variant="icon" → round overlay button; variant="full" → labelled button. */
export default function FavoriteButton({ manga, variant = 'icon', className = '' }) {
  const { has, toggle } = useLibrary();
  const saved = has(manga.id);

  if (variant === 'full') {
    return (
      <button
        type="button"
        className={`btn btn--ghost fav fav--full ${saved ? 'is-saved' : ''} ${className}`}
        aria-pressed={saved}
        onClick={() => toggle(manga)}
      >
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
        {saved ? 'In Library' : 'Add to Library'}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`fav fav--icon ${saved ? 'is-saved' : ''} ${className}`}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${manga.title} from library` : `Add ${manga.title} to library`}
      onClick={() => toggle(manga)}
    >
      <Heart size={17} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}
