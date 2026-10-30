import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export default function SectionHead({ title, subtitle, to, linkLabel = 'See all', id }) {
  return (
    <header className="section-head">
      <div>
        <h2 className="section-head__title" id={id}>{title}</h2>
        {subtitle && <p className="section-head__sub">{subtitle}</p>}
      </div>
      {to && (
        <Link className="section-head__link" to={to}>
          {linkLabel}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      )}
    </header>
  );
}
