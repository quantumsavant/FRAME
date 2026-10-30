# FRAME — Discover Cinema

<div align="center">
  <h3>A distinctive, premium movie discovery platform built with React & Vite.</h3>
  <p>Designed with editorial cinema aesthetics, fluid interactions, responsive layouts, and zero-config local demo fallback.</p>
</div>

---

## ✨ Features

- **Cinematic Editorial Design**: Dark theme with tailored HSL hues, glassmorphism overlays, custom typography, subtle micro-animations, and responsive layouts.
- **Dynamic Spotlight Hero**: Featured spotlight section with backdrop art, movie tags, overview, one-click trailer modal, and instant watchlist toggle.
- **Discover & Real-Time Search**: Instant search with debounce, genre filters, and multi-parameter sorting (Popularity, Top Rated, Release Date).
- **Genre Directory**: Interactive genre pills allowing seamless exploration across Action, Sci-Fi, Drama, Thriller, and more.
- **Personal Watchlist**: Full CRUD watchlist with persistent state via `localStorage`, toast notifications, and fast removal.
- **Rich Movie Detail Modal**: In-depth modal view with high-res backdrops, release metadata, synopsis, cast/crew info, and direct trailer launch.
- **Interactive Trailer Player**: Responsive YouTube trailer modal with accessible keyboard navigation (press `Esc` to close).
- **Dual-Mode Data Layer**:
  - **Zero-Config Standalone Mode**: Works immediately offline or without an API key using curated cinema sample data.
  - **Live TMDB Integration**: Seamlessly connect to The Movie Database (TMDB) API for live movies, search, and trailers by supplying an API key.
- **Clean Architecture & Code Quality**:
  - React 19 + Vite 8
  - Context API for state management (`useWatchlist`)
  - Modular CSS styling with responsive breakpoints
  - Strict ESLint compliance with 0 errors and 0 warnings

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```
Open [http://localhost:5173](http://localhost:5173) to see the app running live.
