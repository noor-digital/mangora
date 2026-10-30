import { useLayoutEffect, useRef } from 'react';
import Art from './Art.jsx';

/**
 * Flies the clicked card's cover to the detail page's cover slot (Web Animations API).
 * It is a fixed overlay, removed as soon as the animation finishes.
 */
export default function CoverGhost({ manga, from, to, onDone }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.animate) {
      onDone();
      return undefined;
    }
    const px = (r) => ({ top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
    const anim = el.animate([px(from), px(to)], { duration: 680, easing: 'cubic-bezier(.22,.8,.24,1)', fill: 'forwards' });
    anim.onfinish = onDone;
    anim.oncancel = onDone;
    return () => anim.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className="cover-ghost" style={{ top: from.top, left: from.left, width: from.width, height: from.height }} aria-hidden="true">
      <Art manga={manga} />
    </div>
  );
}
