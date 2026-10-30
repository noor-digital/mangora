import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <section className="notfound" aria-labelledby="nf-title">
      <div className="notfound__tone" aria-hidden="true" />
      <p className="notfound__num" aria-hidden="true">404</p>
      <div className="notfound__copy">
        <h1 id="nf-title">This page slipped out of the panel.</h1>
        <p>The chapter or page you asked for does not exist, or the link is out of date.</p>
        <Link className="btn btn--primary btn--lg" to="/">
          <Home size={18} aria-hidden="true" /> Return home
        </Link>
      </div>
    </section>
  );
}
