import { useLocation } from 'react-router-dom';

/**
 * Subtle enter transition on every route change (keyed by pathname).
 * When a cover is flying in from a card, the page only fades — no movement —
 * so the cover's destination rectangle stays exactly where we measured it.
 */
export default function PageTransition({ children }) {
  const location = useLocation();
  const fadeOnly = Boolean(location.state?.coverRect);
  return (
    <div key={location.pathname} className={`page ${fadeOnly ? 'page--fade' : ''}`}>
      {children}
    </div>
  );
}
