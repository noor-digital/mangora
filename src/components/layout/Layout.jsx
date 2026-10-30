import { Suspense, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import PageTransition from './PageTransition.jsx';
import SearchOverlay from '../search/SearchOverlay.jsx';
import { PageSkeleton } from '../ui/Skeletons.jsx';

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const mainRef = useRef(null);

  // "/" or Ctrl/Cmd+K opens search from anywhere (unless the user is typing).
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setSearchOpen(true);
      } else if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <button type="button" className="skip-link" onClick={() => mainRef.current?.focus()}>
        Skip to content
      </button>
      <Header onSearch={() => setSearchOpen(true)} />
      <main id="main" ref={mainRef} tabIndex={-1}>
        <PageTransition>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </PageTransition>
      </main>
      <Footer />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
