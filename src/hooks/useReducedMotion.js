import { useMediaQuery } from './useMediaQuery.js';
import { useStore } from '../context/StoreContext.jsx';

/** Honors the OS setting unless the user overrides it in Settings. */
export function useReducedMotion() {
  const { settings } = useStore();
  const system = useMediaQuery('(prefers-reduced-motion: reduce)');
  if (settings.reduceMotion === 'on') return true;
  if (settings.reduceMotion === 'off') return false;
  return system;
}
