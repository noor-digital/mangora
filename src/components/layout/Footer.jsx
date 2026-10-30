import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Logo } from './Header.jsx';
import { GENRES } from '../../data/genres.js';

const REPO_URL = import.meta.env.VITE_REPO_URL ?? 'https://github.com';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p>Discover stories. Enter worlds. A reading room for manga, built entirely in your browser.</p>
        </div>
        <nav aria-label="Footer navigation">
          <h2 className="footer__head">Navigate</h2>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore">Explore</Link></li>
            <li><Link to="/rankings">Rankings</Link></li>
            <li><Link to="/library">Library</Link></li>
          </ul>
        </nav>
        <nav aria-label="Genres">
          <h2 className="footer__head">Genres</h2>
          <ul>
            {GENRES.slice(0, 5).map((g) => (
              <li key={g.id}><Link to={`/genres?g=${g.id}`}>{g.label}</Link></li>
            ))}
            <li><Link to="/genres">All genres</Link></li>
          </ul>
        </nav>
        <div>
          <h2 className="footer__head">Project</h2>
          <ul>
            <li>
              <a href={REPO_URL} target="_blank" rel="noreferrer">
                GitHub <ExternalLink size={13} aria-hidden="true" />
              </a>
            </li>
            <li><Link to="/settings">Settings</Link></li>
          </ul>
          <details className="footer__about">
            <summary>About</summary>
            <p>
              MANGORA is a frontend demonstration project. Every series, author and drawing is
              fictional and generated in the browser. Your library and progress stay on this device.
            </p>
          </details>
        </div>
      </div>
      <div className="container footer__base">
        <span>MANGORA, 2026</span>
        <span>Frontend demonstration project</span>
      </div>
    </footer>
  );
}
