import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import { PageSkeleton } from './components/ui/Skeletons.jsx';
import { useReducedMotion } from './hooks/useReducedMotion.js';

// Route-level code splitting: each page ships as its own chunk.
const Home = lazy(() => import('./pages/Home.jsx'));
const Explore = lazy(() => import('./pages/Explore.jsx'));
const Genres = lazy(() => import('./pages/Genres.jsx'));
const Rankings = lazy(() => import('./pages/Rankings.jsx'));
const Library = lazy(() => import('./pages/Library.jsx'));
const MangaDetails = lazy(() => import('./pages/MangaDetails.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const Reader = lazy(() => import('./pages/Reader.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

/** Mirrors the reduced-motion decision onto <html> so plain CSS can react to it. */
function MotionSync() {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduce' : 'full';
  }, [reduced]);
  return null;
}

export default function App() {
  return (
    <>
      <MotionSync />
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="genres" element={<Genres />} />
          <Route path="rankings" element={<Rankings />} />
          <Route path="library" element={<Library />} />
          <Route path="manga/:id" element={<MangaDetails />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* The reader is immersive: no site header or footer. */}
        <Route
          path="manga/:id/read/:chapter"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <Reader />
            </Suspense>
          }
        />
      </Routes>
    </>
  );
}
