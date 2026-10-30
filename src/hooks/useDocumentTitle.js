import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — MANGORA` : 'MANGORA — Discover stories. Enter worlds.';
  }, [title]);
}
