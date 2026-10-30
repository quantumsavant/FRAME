import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitCompare,
  Star,
  Clock,
  Calendar,
  Layers,
  TrendingUp,
  X,
  Trash2,
  Film,
  Bookmark,
  BookmarkCheck,
  Plus,
  ArrowRight,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useWatchlist } from '../context/WatchlistContext';
import { fetchMovieDetails, posterUrl } from '../lib/tmdb';
import './ComparePage.css';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatRuntime(mins) {
  if (mins == null || mins <= 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${mins} min (${h}h ${m}m)`;
}

function SynopsisPreview({ text, movieId, isExpanded, onToggle }) {
  if (!text) {
    return <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>No synopsis available.</span>;
  }

  const PREVIEW_LIMIT = 110;
  const isLong = text.length > PREVIEW_LIMIT;
  const displayText = !isLong || isExpanded ? text : `${text.slice(0, PREVIEW_LIMIT).trim()}…`;

  return (
    <div className="compare-col__synopsis-wrap">
      <p className={`compare-col__overview${isExpanded ? ' expanded' : ''}`}>
        {displayText}
      </p>
      {isLong && (
        <button
          type="button"
          className="compare-synopsis-toggle"
          onClick={() => onToggle(movieId)}
          aria-expanded={Boolean(isExpanded)}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
}

export default function ComparePage({ genreMap = {} }) {
  const { compareList, maxCompare, removeFromCompare, clearCompare } = useCompare();
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  const [enrichedMovies, setEnrichedMovies] = useState(compareList);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [expandedSynopses, setExpandedSynopses] = useState({});

  function handleToggleSynopsis(movieId) {
    setExpandedSynopses((prev) => ({
      ...prev,
      [movieId]: !prev[movieId],
    }));
  }

  // Fetch full details if any movie in compareList lacks runtime or full genres
  useEffect(() => {
    const needsEnrichment = compareList.some(
      (m) => m.runtime == null || !m.genres || m.genres.length === 0 || m.popularity == null
    );

    if (compareList.length === 0 || !needsEnrichment) {
      return;
    }

    let isMounted = true;

    async function synchronizeSpecs() {
      setLoading(true);
      setSyncError(null);
      let hadFetchError = false;

      try {
        const results = await Promise.all(
          compareList.map(async (m) => {
            if (m.runtime != null && m.genres && m.genres.length > 0 && m.popularity != null) {
              return m;
            }

            try {
              const details = await fetchMovieDetails(m.id);
              const resolvedGenres =
                details.genres ||
                (details.genre_ids || []).map((id) => ({
                  id,
                  name: genreMap[id] || 'Film',
                }));

              return {
                ...m,
                ...details,
                genres: resolvedGenres,
              };
            } catch {
              hadFetchError = true;
              const resolvedGenres =
                m.genres ||
                (m.genre_ids || []).map((id) => ({
                  id,
                  name: genreMap[id] || 'Film',
                }));

              return {
                ...m,
                genres: resolvedGenres,
              };
            }
          })
        );

        if (isMounted) {
          setEnrichedMovies(results);
          if (hadFetchError) {
            setSyncError('Some live details could not be loaded. Displaying available offline specifications.');
          }
        }
      } catch (err) {
        if (isMounted) {
          setEnrichedMovies(compareList);
          setSyncError(err?.message || 'Error synchronizing movie specifications.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    synchronizeSpecs();

    return () => {
      isMounted = false;
      setLoading(false);
    };
  }, [compareList, genreMap]);

  // Sync displayed movies directly with compareList
  const displayedMovies = compareList.map((item) => {
    const enriched = enrichedMovies.find((em) => String(em.id) === String(item.id));
    return enriched || item;
  });

  // ── Requirement 8: Highest-rated & shortest runtime calculations ───────────
  // Comparable only if at least 2 movies have a valid rating (vote_average > 0)
  const validRatingMovies = displayedMovies.filter(
    (m) => typeof m.vote_average === 'number' && m.vote_average > 0
  );
  const maxRating =
    validRatingMovies.length >= 2
      ? Math.max(...validRatingMovies.map((m) => m.vote_average))
      : null;

  function isHighestRated(movie) {
    if (maxRating === null || !movie.vote_average) return false;
    return movie.vote_average === maxRating;
  }

  // Comparable only if at least 2 movies have a valid runtime (runtime > 0)
  const validRuntimeMovies = displayedMovies.filter(
    (m) => typeof m.runtime === 'number' && m.runtime > 0
  );
  const minRuntime =
    validRuntimeMovies.length >= 2
      ? Math.min(...validRuntimeMovies.map((m) => m.runtime))
      : null;

  function isShortestRuntime(movie) {
    if (minRuntime === null || !movie.runtime || movie.runtime <= 0) return false;
    return movie.runtime === minRuntime;
  }

  // ── Requirement 10: Empty State ───────────────────────────────────────────
  if (compareList.length === 0) {
    return (
      <div className="page compare-page">
        <div className="page-content">
          <header className="compare-header">
            <div className="compare-title-wrap">
              <h1 className="compare-title">
                <GitCompare size={28} color="var(--accent)" aria-hidden="true" />
                Comparison Studio
              </h1>
              <p className="compare-subtitle">
                Side-by-side technical specs, critical ratings, runtimes, and narrative analysis.
              </p>
            </div>
          </header>

          <div
            className="empty-state"
            style={{
              minHeight: '48vh',
              background: 'var(--surface)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-xl)',
              padding: '56px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(229, 169, 60, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                border: '1px solid rgba(229, 169, 60, 0.25)',
              }}
            >
              <GitCompare size={30} color="var(--accent)" aria-hidden="true" />
            </div>

            <h2 className="font-heading" style={{ fontSize: '1.375rem', marginBottom: 10 }}>
              Comparison Studio is Empty
            </h2>
            <p style={{ maxWidth: 460, margin: '0 auto 28px', color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>
              Select up to 3 films from Discover, Genre browsing, or any movie detail page to inspect and compare their specs side-by-side.
            </p>

            <Link to="/discover" className="btn btn-primary">
              <Film size={15} aria-hidden="true" />
              Browse Films to Compare
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const gridClass = `compare-grid compare-grid--${displayedMovies.length}`;

  return (
    <div className="page compare-page">
      <div className="page-content">
        {/* Studio Header */}
        <header className="compare-header">
          <div className="compare-title-wrap">
            <h1 className="compare-title">
              <GitCompare size={28} color="var(--accent)" aria-hidden="true" />
              Comparison Studio
              <span className="badge badge-accent">
                {displayedMovies.length} of {maxCompare} Films
              </span>
            </h1>
            <p className="compare-subtitle">
              Comparing technical details, ratings, duration, release dates, and story synopses.
            </p>
          </div>

          <div className="compare-header-actions">
            {displayedMovies.length < maxCompare && (
              <Link to="/discover" className="btn btn-ghost" style={{ fontSize: '0.8125rem' }}>
                <Plus size={14} aria-hidden="true" />
                Add Another Film
              </Link>
            )}

            <button
              type="button"
              className="compare-clear-btn"
              onClick={clearCompare}
              aria-label="Clear all films from comparison"
            >
              <Trash2 size={13} aria-hidden="true" />
              Clear All
            </button>
          </div>
        </header>

        {/* Loading Indicator */}
        {loading && (
          <div
            className="compare-sync-indicator"
            role="status"
            aria-live="polite"
          >
            <div className="spinner" style={{ width: 14, height: 14 }} aria-hidden="true" />
            <span>Synchronizing movie specifications...</span>
          </div>
        )}

        {/* Sync Error Notice */}
        {syncError && !loading && (
          <div
            className="compare-sync-error"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle size={15} color="#fca5a5" aria-hidden="true" />
            <span>{syncError}</span>
          </div>
        )}

        {/* Mobile Swipe Hint */}
        {displayedMovies.length > 1 && (
          <div className="compare-mobile-hint" aria-hidden="true">
            <span>← Swipe horizontally to compare films →</span>
          </div>
        )}

        {/* Comparison Studio Grid */}
        <div className="compare-grid-wrap">
          <div className={gridClass}>
            {displayedMovies.map((movie) => {
              const poster = posterUrl(movie.poster_path, 'w500');
              const inWatchlist = isInWatchlist(movie.id);
              const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
              const genres = movie.genres || [];
              const isBestScore = isHighestRated(movie);
              const isShortest = isShortestRuntime(movie);

              return (
                <section
                  key={movie.id}
                  className="compare-col"
                  aria-labelledby={`compare-title-${movie.id}`}
                >
                  {/* Column Header */}
                  <div className="compare-col__header">
                    <button
                      type="button"
                      className="compare-col__remove-btn"
                      onClick={() => removeFromCompare(movie.id)}
                      aria-label={`Remove ${movie.title} from comparison`}
                      title="Remove film"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>

                    <div className="compare-col__poster-wrap">
                      {poster ? (
                        <img
                          src={poster}
                          alt={`${movie.title} poster`}
                          className="compare-col__poster-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="compare-col__poster-fallback" aria-hidden="true">
                          <Film size={32} strokeWidth={1} />
                        </div>
                      )}
                    </div>

                    <h2 className="compare-col__title" id={`compare-title-${movie.id}`}>
                      <Link to={`/movie/${movie.id}`} title="View full details">
                        {movie.title}
                      </Link>
                    </h2>

                    <div className="compare-col__tagline">
                      {movie.tagline ? `"${movie.tagline}"` : ''}
                    </div>

                    <div className="compare-col__header-actions">
                      <Link
                        to={`/movie/${movie.id}`}
                        className="btn btn-primary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        <Eye size={13} aria-hidden="true" />
                        Details
                      </Link>

                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                        onClick={() => toggleWatchlist(movie)}
                        aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                        aria-pressed={inWatchlist}
                      >
                        {inWatchlist ? (
                          <>
                            <BookmarkCheck size={13} color="var(--accent)" aria-hidden="true" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark size={13} aria-hidden="true" />
                            Save
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Attributes & Metrics */}
                  <div className="compare-col__body">
                    {/* TMDB Rating */}
                    <div className="compare-col__metric">
                      <span className="compare-col__metric-label">
                        <Star size={12} color="var(--accent)" aria-hidden="true" />
                        TMDB Score
                      </span>
                      <div className="compare-col__metric-val">
                        {rating ? (
                          <>
                            <strong style={{ fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
                              {rating}
                            </strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              / 10
                            </span>
                            {movie.vote_count ? (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                ({movie.vote_count.toLocaleString()} votes)
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Unrated</span>
                        )}

                        {isBestScore && (
                          <span className="compare-badge compare-badge--highlight" title="Highest rated among compared films">
                            ★ Highest Rated
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Runtime */}
                    <div className="compare-col__metric">
                      <span className="compare-col__metric-label">
                        <Clock size={12} aria-hidden="true" />
                        Runtime
                      </span>
                      <div className="compare-col__metric-val">
                        <span>{formatRuntime(movie.runtime)}</span>
                        {isShortest && (
                          <span className="compare-badge compare-badge--quick" title="Shortest runtime among compared films">
                            ⚡ Quickest Watch
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Release Date */}
                    <div className="compare-col__metric">
                      <span className="compare-col__metric-label">
                        <Calendar size={12} aria-hidden="true" />
                        Release Date
                      </span>
                      <div className="compare-col__metric-val">
                        {formatDate(movie.release_date)}
                      </div>
                    </div>

                    {/* Genres */}
                    <div className="compare-col__metric">
                      <span className="compare-col__metric-label">
                        <Layers size={12} aria-hidden="true" />
                        Genres
                      </span>
                      <div className="compare-col__genres" aria-label="Genres">
                        {genres.length > 0 ? (
                          genres.map((g) => (
                            <span key={g.id || g.name} className="badge badge-surface" style={{ fontSize: '0.6875rem' }}>
                              {g.name}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>—</span>
                        )}
                      </div>
                    </div>

                    {/* Popularity */}
                    <div className="compare-col__metric">
                      <span className="compare-col__metric-label">
                        <TrendingUp size={12} aria-hidden="true" />
                        Popularity Index
                      </span>
                      <div className="compare-col__metric-val">
                        {movie.popularity != null && movie.popularity > 0
                          ? Number(movie.popularity).toFixed(1)
                          : '—'}
                      </div>
                    </div>

                    {/* Overview */}
                    <div className="compare-col__metric compare-col__metric--overview">
                      <span className="compare-col__metric-label">
                        Synopsis
                      </span>
                      <SynopsisPreview
                        text={movie.overview}
                        movieId={movie.id}
                        isExpanded={Boolean(expandedSynopses[movie.id])}
                        onToggle={handleToggleSynopsis}
                      />
                    </div>
                  </div>
                </section>
              );
            })}

            {/* "+ Add Another Film" Slot when under maximum */}
            {displayedMovies.length < maxCompare && (
              <Link
                to="/discover"
                className="compare-add-slot"
                aria-label="Add another film to comparison from Discover"
              >
                <div className="compare-add-slot__icon">
                  <Plus size={24} aria-hidden="true" />
                </div>
                <div className="compare-add-slot__title">
                  Add Film ({displayedMovies.length + 1}/{maxCompare})
                </div>
                <p className="compare-add-slot__desc">
                  Select another title from Discover, Genres, or your Watchlist.
                </p>
                <div className="btn btn-ghost" style={{ marginTop: 14, fontSize: '0.8125rem' }}>
                  Browse Discover
                  <ArrowRight size={13} aria-hidden="true" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
