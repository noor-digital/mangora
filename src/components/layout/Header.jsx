import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, Settings as SettingsIcon, X } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings.js';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/explore', label: 'Explore' },
  { to: '/genres', label: 'Genres' },
  { to: '/rankings', label: 'Rankings' },
  { to: '/library', label: 'Library' },
];

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="MANGORA, home">
      <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
        <path d="M6 25V7l10 12L26 7v18" stroke="currentColor" strokeWidth="3.4" fill="none" />
      </svg>
      <span>MANGORA</span>
    </Link>
  );
}

export default function Header({ onSearch }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const isHome = pathname === '/';

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const initial = (settings.readerName || 'R').trim().charAt(0).toUpperCase() || 'R';

  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''} ${isHome && !scrolled ? 'is-over-hero' : ''}`}>
      <div className="header__inner">
        <Logo />
        <nav className="header__nav" aria-label="Main">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="header__link">{n.label}</NavLink>
          ))}
        </nav>
        <div className="header__tools">
          <button type="button" className="header__search" onClick={onSearch} aria-label="Search manga (press /)">
            <Search size={18} aria-hidden="true" />
            <span className="header__search-text">Search manga</span>
            <kbd aria-hidden="true">/</kbd>
          </button>
          <Link to="/settings" className="icon-btn header__settings" aria-label="Settings">
            <SettingsIcon size={18} aria-hidden="true" />
          </Link>
          <Link to="/library" className="avatar" aria-label={`${settings.readerName}, open your library`}>{initial}</Link>
          <button
            type="button"
            className="icon-btn header__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? 'is-open' : ''}`} hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className="mobile-menu__link">{n.label}</NavLink>
          ))}
          <NavLink to="/settings" className="mobile-menu__link mobile-menu__link--quiet">Settings</NavLink>
        </nav>
        <button type="button" className="btn btn--ghost" onClick={() => { setOpen(false); onSearch(); }}>
          <Search size={18} aria-hidden="true" /> Search manga
        </button>
      </div>
    </header>
  );
}
