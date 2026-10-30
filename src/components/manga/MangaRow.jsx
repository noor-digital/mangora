import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MangaCard from './MangaCard.jsx';
import SectionHead from './SectionHead.jsx';
import { useReducedMotion } from '../../hooks/useReducedMotion.js';

/** Horizontal, snap-scrolling shelf of cards. */
export default function MangaRow({ title, subtitle, items, to, linkLabel, ranked = false }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const scrollBy = (dir) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section className="section container" aria-label={title}>
      <SectionHead title={title} subtitle={subtitle} to={to} linkLabel={linkLabel} />
      <div className="row">
        <button type="button" className="row__arrow row__arrow--prev" onClick={() => scrollBy(-1)} aria-label={`Scroll ${title} backwards`}>
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <ul className="row__track" ref={ref}>
          {items.map((m, i) => (
            <li className="row__item" key={m.id}>
              <MangaCard manga={m} index={i} rank={ranked ? i + 1 : undefined} />
            </li>
          ))}
        </ul>
        <button type="button" className="row__arrow row__arrow--next" onClick={() => scrollBy(1)} aria-label={`Scroll ${title} forwards`}>
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
