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

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS Design System with CSS variables and glassmorphism
- **State**: React Context API + LocalStorage
- **Data Source**: [TMDB API v3](https://developer.themoviedb.org/) with curated local fallback

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/react-movie-app.git
cd react-movie-app/frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. (Optional) Configure TMDB API Key
If you want to pull live data directly from TMDB:
1. Obtain a free API key at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).
2. Copy the sample environment file:
   ```bash
   cp .env.example .env
   ```
3. Set your API key in `.env`:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
> *Note: If no API key is provided, FRAME automatically falls back to curated sample data, ensuring complete offline functionality.*

### 4. Run the development server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for production
```bash
npm run build
```

### 6. Lint the code
```bash
npm run lint
```

---

## 📁 Project Structure

```text
frontend/
├── public/
│   ├── favicon.svg             # Custom SVG brand favicon
│   └── icons.svg
├── src/
│   ├── components/
│   │   ├── FilterBar.jsx       # Filter and sorting controls
│   │   ├── FilterBar.css
│   │   ├── HeroSection.jsx     # Featured spotlight showcase
│   │   ├── HeroSection.css
│   │   ├── MovieCard.jsx       # Interactive movie card with bookmarking
│   │   ├── MovieCard.css
│   │   ├── MovieDetailModal.jsx# Full details modal
│   │   ├── MovieDetailModal.css
│   │   ├── MovieGrid.jsx       # Responsive grid layout
│   │   ├── MovieGrid.css
│   │   ├── Navbar.jsx          # Header navigation and quick search
│   │   ├── Navbar.css
│   │   └── TrailerModal.jsx    # Accessible YouTube trailer player
│   ├── context/
│   │   └── WatchlistContext.jsx# Watchlist state + localStorage sync
│   ├── lib/
│   │   ├── sampleData.js       # Curated fallback cinema dataset
│   │   └── tmdb.js             # TMDB API client with fallback mapping
│   ├── pages/
│   │   ├── DiscoverPage.jsx    # Main discovery feed with search & filters
│   │   ├── GenresPage.jsx      # Genre-specific movie browser
│   │   └── WatchlistPage.jsx   # User's saved movie collection
│   ├── App.jsx                 # Root layout & page coordinator
│   ├── index.css               # Design tokens, variables & typography
│   └── main.jsx                # Application entrypoint
├── .env.example                # Sample environment configuration
├── package.json
└── vite.config.js
```

---

## 🎨 Design Philosophy

FRAME avoids generic streaming service templates in favor of a bespoke editorial look:
- **Palette**: Deep slate-black canvas (`#0B0C0F`) accented by subtle glass surfaces and vibrant lime neon highlights (`#C6F277`).
- **Typography**: Refined sans-serif typography with generous letter-spacing on headers and clear visual hierarchy.
- **Interactions**: Subtlest scale transforms on card hover, glowing border effects, and responsive modal transitions.

---

## 📄 License

MIT License. Free to use for personal and portfolio projects.
