import { useEffect } from 'react';

/**
 * Writes --ps (-1 … 1) on the element: how far its centre is from the viewport
 * centre. CSS turns that into a gentle layer offset. One rAF-throttled listener.
 */
export function useScrollParallax(ref, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return undefined;
    let raf = 0;
    const write = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      el.style.setProperty('--ps', Math.max(-1, Math.min(1, p)).toFixed(3));
    };
    const req = () => {
      if (!raf) raf = requestAnimationFrame(write);
    };
    write();
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    return () => {
      window.removeEventListener('scroll', req);
      window.removeEventListener('resize', req);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref, enabled]);
}
