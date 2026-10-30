# MANGORA

**Discover stories. Enter worlds.**

MANGORA is a cinematic manga discovery and reading platform that runs entirely in the browser:
a parallax hero, a searchable catalogue, series pages with chapters, a real reader, and a personal
library that remembers where you stopped.

> **Frontend demonstration project.** There is no backend, no database and no real account.
> Every series, author and drawing is fictional and generated in the browser — no copyrighted
> scans are used or distributed.

## Features

- **Cinematic homepage** — full-screen hero with five-layer mouse parallax, scroll-driven transformation,
  four rotating featured stories (autoplay, pause on hover, manual navigation, per-story accent colour).
- **Instant search** — overlay opened with `/` or `Ctrl/Cmd + K`; matches title, author, genre and tags,
  accent- and case-insensitive, keyboard navigable.
- **Explore** — catalogue with live search, genre chips, status filter and sorting
  (Popular, Latest, Rating, A–Z). Filters are kept in the URL, so views can be shared.
- **Genres** — typographic genre index; selecting one lists its series.
- **Rankings** — Trending, Most read and Top rated, computed from the demo data
  (Most read also reacts to the chapters you actually read).
- **Series page** — card-to-hero cover transition, facts, tags, chapter list with read / in-progress /
  unread state, “Continue” button and similar series.
- **Reader** — vertical scroll or page-by-page, tap zones on mobile, progress slider, previous / next
  chapter, fullscreen, adjustable width and fit, controls that hide while you read.
- **Progress** — manga, chapter and page are saved; “Continue reading” resumes on the exact page.
- **Library** — favourites, continue reading, recently viewed (with “Clear history”), local profile stats.
- **Settings** — theme (Ink / Graphite), accent (Carmine / Amber), reduced motion, hero autoplay,
  default reading mode, reader width, local data reset.
- **Polish** — skeleton loaders, empty states, toasts, a themed 404, route transitions, responsive layout
  from phone to desktop.
- **Accessibility** — keyboard navigation, visible focus, labelled controls, alt text for artwork,
  `prefers-reduced-motion` (plus an in-app override).

### Reader shortcuts

| Key | Action |
| --- | --- |
| `←` / `→` | Previous / next page |
| `Space` | Show or hide the controls |
| `F` | Toggle fullscreen (`Esc` leaves it) |
| `M` | Switch vertical ↔ page-by-page |
| `[` / `]` | Previous / next chapter |
| `/` | Open search (anywhere on the site) |

## Tech stack

React 18 · Vite 5 · JavaScript · plain CSS (design tokens in `src/styles/base.css`) ·
React Router 6 (`HashRouter`) · Lucide icons · Vitest.

No animation library: the parallax uses CSS variables written once per frame, and the cover transition
uses the Web Animations API.

## Installation

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm test          # unit tests (search, filters, rankings, library, progress, art generator)
```

## Deployment (GitHub Pages)

1. Push the project to a repository (for example `mangora`) on the `main` branch.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`: install → test → build → publish `dist`.

`vite.config.js` uses `base: './'` and the app uses `HashRouter`, so it works under
`https://<user>.github.io/<repo>/` and deep links never return a 404. Optionally set
`VITE_REPO_URL` at build time to point the footer's GitHub link at your repository.

## Architecture

```text
src/
├── components/
│   ├── layout/    Header, Footer, Layout, page transition, scroll reset
│   ├── manga/     Art, MangaCard, MangaRow, HeroCarousel, RankList, CoverGhost…
│   ├── reader/    MangaPage, ReaderControls, ReaderSettings, EndCard
│   ├── search/    SearchOverlay
│   └── ui/        Segmented, Switch, EmptyState, skeletons
├── context/       StoreContext (library, progress, history, settings → localStorage), ToastContext
├── data/          genres, 24 original series, deterministic chapters, shortcuts
├── hooks/         useLibrary, useReadingProgress, useHistory, useSettings, useReducedMotion…
├── pages/         Home, Explore, Genres, Rankings, MangaDetails, Reader, Library, Settings, NotFound
├── styles/        base (tokens) · layout · manga · pages · reader
└── utils/         search, rankings, library (pure state helpers), art + pageArt (generators)
```

- **State** is one small context persisted to `localStorage` (keys prefixed `mangora:`). The logic
  lives in pure helpers (`utils/library.js`) so it is trivially testable.
- **Artwork** is procedural: `utils/art.js` draws covers and hero scenes as five SVG layers
  (sky, far, mid, near, particles); `utils/pageArt.js` draws reader pages (panel layouts, speech
  bubbles, screentone). The same seed always gives the same image, and the repo ships zero image files.
- **Performance**: route-level code splitting, reader pages render only when near the viewport,
  hero parallax never triggers a React re-render.

## Project goal

A portfolio-grade, interactive frontend demonstration: show how a manga platform can feel — discovery,
search, series pages, a real reader, persistence — with nothing but a browser.
