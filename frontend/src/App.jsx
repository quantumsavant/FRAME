import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { CompareProvider, useCompare } from './context/CompareContext';
import Navbar from './components/Navbar';
import DiscoverPage from './pages/DiscoverPage';
import GenresPage from './pages/GenresPage';
import WatchlistPage from './pages/WatchlistPage';
import ComparePage from './pages/ComparePage';
import MovieDetailPage from './pages/MovieDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import CompareFloatingBar from './components/CompareFloatingBar';
import { fetchGenres, hasApiKey } from './lib/tmdb';
import { SAMPLE_GENRES } from './lib/sampleData';

// Build a fast id→name map for genre lookups
function buildGenreMap(genres) {
  return genres.reduce((acc, g) => {
    acc[g.id] = g.name;
    return acc;
  }, {});
}

function AppContent() {
  const [genreMap, setGenreMap] = useState(() =>
    buildGenreMap(SAMPLE_GENRES)
  );
  const location = useLocation();
  const { compareList } = useCompare();
  const hasCompareDock = compareList.length > 0 && location.pathname !== '/compare';

  // Load genre list from TMDB if key is available
  useEffect(() => {
    if (!hasApiKey) return;
    fetchGenres()
      .then((genres) => setGenreMap(buildGenreMap(genres)))
      .catch(() => {
        // Silently fall back to sample genres
      });
  }, []);

  return (
    <>
      <Navbar />

      <main id="main-content" className={hasCompareDock ? 'has-compare-dock' : ''}>
        <Routes>
          <Route path="/" element={<Navigate to="/discover" replace />} />
          <Route path="/discover" element={<DiscoverPage genreMap={genreMap} />} />
          <Route path="/genres" element={<GenresPage genreMap={genreMap} />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="/compare" element={<ComparePage genreMap={genreMap} />} />
          <Route path="/movie/:movieId" element={<MovieDetailPage genreMap={genreMap} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <CompareFloatingBar />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <WatchlistProvider>
        <CompareProvider>
          <AppContent />
        </CompareProvider>
      </WatchlistProvider>
    </BrowserRouter>
  );
}