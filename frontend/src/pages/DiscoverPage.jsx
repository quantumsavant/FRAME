import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import MovieGrid from '../components/MovieGrid';
import { FilterBar, GenreFilter } from '../components/FilterBar';
import MovieDetailModal from '../components/MovieDetailModal';
import TrailerModal from '../components/TrailerModal';
import { AlertCircle } from 'lucide-react';
import {
  fetchTrending,
  fetchPopular,
  searchMovies,
  fetchByGenre,
  hasApiKey,
} from '../lib/tmdb';
import { SAMPLE_MOVIES, SAMPLE_GENRES } from '../lib/sampleData';

const DEBOUNCE_MS = 400;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function DiscoverPage({ externalSearch, genreMap }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  // ── Trending / Hero ────────────────────────────────────────────
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  // ── Main grid ──────────────────────────────────────────────────
  const [movies, setMovies] = useState([]);
  const [gridLoading, setGridLoading] = useState(true);
  const [gridError, setGridError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Filters ────────────────────────────────────────────────────
  const [search, setSearch] = useState(urlQuery || externalSearch || '');
  const [activeGenre, setActiveGenre] = useState(null);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  // ── Modals ─────────────────────────────────────────────────────
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  const genres = hasApiKey
    ? Object.entries(genreMap).map(([id, name]) => ({ id: Number(id), name }))
    : SAMPLE_GENRES;

  // Sync external search or urlQuery
  useEffect(() => {
    if (urlQuery !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearch(urlQuery);
    } else if (externalSearch !== undefined) {
      setSearch(externalSearch);
    }
  }, [urlQuery, externalSearch]);

  // ── Load trending ──────────────────────────────────────────────
  useEffect(() => {
    if (!hasApiKey) {
      const id = setTimeout(() => {
        setTrendingMovies(SAMPLE_MOVIES.slice(0, 6));
        setTrendingLoading(false);
      }, 0);
      return () => clearTimeout(id);
    }
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrendingLoading(true);
    fetchTrending('week')
      .then((results) => {
        if (!cancelled) {
          setTrendingMovies(results.slice(0, 6));
          setTrendingLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setTrendingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Load main grid ─────────────────────────────────────────────
  useEffect(() => {
    if (!hasApiKey) {
      const id = setTimeout(() => {
        let results = [...SAMPLE_MOVIES];
        if (debouncedSearch) {
          const q = debouncedSearch.toLowerCase();
          results = results.filter((m) => m.title.toLowerCase().includes(q));
        }
        if (activeGenre) {
          results = results.filter((m) => (m.genre_ids || []).includes(activeGenre));
        }
        setMovies(results);
        setTotalPages(1);
        setGridLoading(false);
      }, 0);
      return () => clearTimeout(id);
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGridLoading(true);
    setGridError(null);

    const load = async () => {
      try {
        let result;
        if (debouncedSearch) {
          result = await searchMovies(debouncedSearch, page);
        } else if (activeGenre) {
          result = await fetchByGenre(activeGenre, page, sortBy);
        } else {
          result = await fetchPopular(page);
        }
        if (!cancelled) {
          setMovies(result.results);
          setTotalPages(result.totalPages);
          setGridLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setGridError(err.message);
          setGridLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, activeGenre, sortBy, page]);

  // Reset page when filters change
  const handleFilterChange = useCallback((setter) => {
    setPage(1);
    setter();
  }, []);

  function handleSearchInput(val) {
    handleFilterChange(() => setSearch(val));
    if (val.trim()) {
      setSearchParams({ q: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }

  function handleMovieClick(movie) {
    navigate(`/movie/${movie.id}`);
  }

  const heroMovie = trendingMovies[0] || null;

  return (
    <>
      {/* Hero */}
      <HeroSection
        movie={heroMovie}
        genreMap={genreMap}
        loading={trendingLoading}
        onExplore={handleMovieClick}
        onTrailer={setTrailerKey}
      />

      {/* Main content */}
      <div style={{ padding: '48px var(--page-pad)', maxWidth: 'var(--max-width)', margin: '0 auto' }}>
        {/* Trending strip (only when not searching/filtering) */}
        {!debouncedSearch && !activeGenre && trendingMovies.length > 1 && (
          <section aria-labelledby="trending-heading" style={{ marginBottom: 56 }}>
            <div className="section-heading">
              <h2 className="section-title" id="trending-heading">
                Trending This Week
              </h2>
            </div>
            <MovieGrid
              movies={trendingMovies}
              loading={trendingLoading}
              onMovieClick={handleMovieClick}
              skeletonCount={6}
            />
          </section>
        )}

        {/* Discover section */}
        <section aria-labelledby="popular-heading">
          <div className="section-heading">
            <h2 className="section-title" id="popular-heading">
              {debouncedSearch
                ? `Results for "${debouncedSearch}"`
                : activeGenre
                  ? `${genres.find((g) => g.id === activeGenre)?.name || 'Genre'} Movies`
                  : 'Popular Movies'}
            </h2>
          </div>

          {/* Filters */}
          <FilterBar
            search={search}
            onSearch={handleSearchInput}
            sortBy={sortBy}
            onSortChange={(v) => handleFilterChange(() => setSortBy(v))}
          />

          <GenreFilter
            genres={genres}
            activeGenre={activeGenre}
            onGenreChange={(id) => handleFilterChange(() => setActiveGenre(id))}
          />

          {gridError && (
            <div className="error-state" role="alert">
              <AlertCircle size={32} strokeWidth={1.5} />
              <p>Could not load movies: {gridError}</p>
            </div>
          )}

          {!gridLoading && !gridError && movies.length === 0 && (
            <div className="empty-state">
              <AlertCircle size={40} strokeWidth={1} />
              <h3>No movies found</h3>
              <p>
                {debouncedSearch
                  ? `No results for "${debouncedSearch}". Try a different title.`
                  : 'No movies match your current filters.'}
              </p>
            </div>
          )}

          {!gridError && (
            <MovieGrid
              movies={movies}
              loading={gridLoading}
              onMovieClick={handleMovieClick}
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}
        </section>
      </div>

      {/* Modals */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onTrailer={setTrailerKey}
        />
      )}
      {trailerKey && (
        <TrailerModal trailerKey={trailerKey} onClose={() => setTrailerKey(null)} />
      )}
    </>
  );
}
