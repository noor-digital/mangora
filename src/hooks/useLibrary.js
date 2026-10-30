import { useCallback } from 'react';
import { useStore } from '../context/StoreContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/** Favourites ("My Library"). `toggle` also gives the user feedback. */
export function useLibrary() {
  const { library, toggleLibrary } = useStore();
  const toast = useToast();

  const has = useCallback((id) => library.includes(id), [library]);
  const toggle = useCallback(
    (manga) => {
      const adding = !library.includes(manga.id);
      toggleLibrary(manga.id);
      toast(adding ? `${manga.title} added to your library` : `${manga.title} removed from your library`);
    },
    [library, toggleLibrary, toast],
  );
  return { library, has, toggle };
}
