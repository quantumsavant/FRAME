import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Clock,
  Calendar,
  Play,
  Bookmark,
  BookmarkCheck,
  Film,
  User,
  AlertCircle,
  Home,
  GitCompare,
  CheckCircle2,
  Circle,
  FolderPlus,
  MessageSquare,
  Trash2,
  Check,
} from 'lucide-react';
import { fetchMovieDetails, posterUrl, backdropUrl, IMAGE_BASE } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useCompare } from '../context/CompareContext';
import TrailerModal from '../components/TrailerModal';
import AddToCollectionModal from '../components/AddToCollectionModal';
import './MovieDetailPage.css';

const RATING_STEPS = [
  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10
];

function CastAvatar({ person }) {
  const [err, setErr] = useState(false);
  const src = person.profile_path ? `${IMAGE_BASE}/w185${person.profile_path}` : null;

  return (
    <div className="movie-detail-cast-card" title={`${person.name} as ${person.character || ''}`}>
      {src && !err ? (
        <img
          src={src}
          alt={person.name}
          className="movie-detail-avatar"
          onError={() => setErr(true)}
          loading="lazy"
        />
      ) : (
        <div className="movie-detail-avatar-fallback" aria-hidden="true">
          <User size={22} strokeWidth={1.5} />
        </div>
      )}
      <div className="movie-detail-actor-name">{person.name}</div>
      {person.character && (
        <div className="movie-detail-character-name">{person.character}</div>
      )}
    </div>
  );
}

export default function MovieDetailPage({ genreMap = {} }) {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const {
    isInWatchlist,
    toggleWatchlist,
    isWatched,
    toggleWatched,
    getPersonalRating,
    setPersonalRating,
    getPersonalNote,
    setPersonalNote,
    getMovieCollections,
  } = useWatchlist();
  const { isInCompare, toggleCompare, isCompareFull, compareList } = useCompare();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backdropErr, setBackdropErr] = useState(false);
  const [posterErr, setPosterErr] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Local log state for immediate feedback
  const inWatched = isWatched(movieId);
  const personalRating = getPersonalRating(movieId);
  const personalNote = getPersonalNote(movieId);
  const [noteDraft, setNoteDraft] = useState('');
  const [hoverRating, setHoverRating] = useState(null);
  const [logFeedback, setLogFeedback] = useState('');

  // Fetch movie by ID (works both TMDB and sample fallback)
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    setBackdropErr(false);
    setPosterErr(false);

    fetchMovieDetails(movieId)
      .then((data) => {
        if (!cancelled) {
          let resolvedGenres = data.genres;
          if (!resolvedGenres || resolvedGenres.length === 0) {
            resolvedGenres = (data.genre_ids || [])
              .map((id) => ({ id, name: genreMap[id] || 'Film' }))
              .filter(Boolean);
          }
          setMovie({ ...data, genres: resolvedGenres });
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Movie not found');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [movieId, genreMap]);

  // Sync draft note when movie or stored note loads
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoteDraft(personalNote || '');
  }, [personalNote, movieId]);

  // Back button handler
  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/discover');
    }
  }, [navigate]);

  // Keyboard shortcut: Esc to go back (unless trailer or collection modal is active)
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape' && !trailerKey && !showCollectionModal) {
        handleBack();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleBack, trailerKey, showCollectionModal]);

  function flashFeedback(msg) {
    setLogFeedback(msg);
    setTimeout(() => setLogFeedback(''), 2500);
  }

  function handleWatchedToggle() {
    toggleWatched(movie.id, movie);
    flashFeedback(!inWatched ? 'Marked as watched' : 'Marked as unwatched');
  }

  function handleRatingClick(val) {
    const nextRating = personalRating === val ? null : val;
    setPersonalRating(movie.id, nextRating, movie);
    flashFeedback(nextRating ? `Rated ${nextRating} / 10` : 'Rating cleared');
  }

  function handleClearRating() {
    setPersonalRating(movie.id, null, movie);
    flashFeedback('Rating cleared');
  }

  function handleSaveNote() {
    setPersonalNote(movie.id, noteDraft.trim(), movie);
    flashFeedback('Personal note saved');
  }

  function handleClearNote() {
    setNoteDraft('');
    setPersonalNote(movie.id, '', movie);
    flashFeedback('Personal note cleared');
  }

  if (loading) {
    return (
      <div className="page">
        <div className="movie-detail-loading-wrap">
          <div className="spinner" aria-label="Loading movie details" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Fetching cinema archive...
          </p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="empty-state" style={{ maxWidth: 460 }}>
          <AlertCircle size={48} strokeWidth={1.5} color="var(--accent)" />
          <h2 className="font-heading" style={{ fontSize: '1.5rem', marginTop: 16, marginBottom: 8 }}>
            Movie Not Found
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9375rem' }}>
            We could not locate this film in the archives ({error || 'Unknown ID'}).
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={handleBack}>
              <ArrowLeft size={15} aria-hidden="true" />
              Go Back
            </button>
            <Link to="/discover" className="btn btn-ghost">
              <Home size={15} aria-hidden="true" />
              Discover Movies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const inCompare = isInCompare(movie.id);
  const movieCollections = getMovieCollections(movie.id);
  const poster = !posterErr ? posterUrl(movie.poster_path) : null;
  const backdrop = !backdropErr ? backdropUrl(movie.backdrop_path) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const tmdbRating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const genres = movie.genres || [];
  const trailer =
    movie.videos?.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || null;
  const cast = movie.credits?.cast?.slice(0, 12) || [];
  const displayRating = hoverRating ?? personalRating;

  return (
    <article className="movie-detail-view" aria-labelledby="movie-title">
      {/* Hero Backdrop */}
      <div className="movie-detail-hero" aria-hidden="true">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="movie-detail-hero__img"
            onError={() => setBackdropErr(true)}
          />
        ) : (
          <div className="movie-detail-hero__fallback">
            <Film size={64} strokeWidth={1} />
          </div>
        )}
        <div className="movie-detail-hero__scrim" />

        {/* Top Back Nav Button */}
        <div className="movie-detail-topbar">
          <button
            className="movie-detail-back-btn"
            onClick={handleBack}
            aria-label="Return to previous page"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="movie-detail-content">
        <header className="movie-detail-header">
          {/* Poster */}
          <div className="movie-detail-poster-wrap">
            {poster ? (
              <img
                src={poster}
                alt={`${movie.title} poster`}
                className="movie-detail-poster-img"
                onError={() => setPosterErr(true)}
              />
            ) : (
              <div className="movie-detail-poster-fallback" aria-hidden="true">
                <Film size={36} strokeWidth={1} />
                <span style={{ fontSize: '0.75rem', textAlign: 'center', padding: '0 8px' }}>
                  {movie.title}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="movie-detail-info">
            <h1 className="movie-detail-title" id="movie-title">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="movie-detail-tagline">"{movie.tagline}"</p>
            )}

            <div className="movie-detail-meta-row">
              {tmdbRating && (
                <span className="movie-detail-rating" aria-label={`TMDB Rating: ${tmdbRating} out of 10`}>
                  <Star size={13} fill="currentColor" aria-hidden="true" />
                  TMDB {tmdbRating}
                </span>
              )}

              {personalRating != null && (
                <span
                  className="movie-detail-personal-score"
                  aria-label={`Personal rating: ${personalRating} out of 10`}
                  title="Your personal rating"
                >
                  <Star size={13} fill="currentColor" aria-hidden="true" />
                  Personal {personalRating.toFixed(1)}
                </span>
              )}

              {inWatched && (
                <span className="badge badge-accent" aria-label="Watched movie">
                  <CheckCircle2 size={12} aria-hidden="true" />
                  Watched
                </span>
              )}

              {year && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Calendar size={14} aria-hidden="true" />
                  {year}
                </span>
              )}

              {movie.runtime && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={14} aria-hidden="true" />
                  {movie.runtime} min
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="movie-detail-genres" aria-label="Genres">
                {genres.map((g) => (
                  <span key={g.id || g.name} className="badge badge-surface">
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {/* Actions cluster */}
            <div className="movie-detail-actions">
              {trailer && (
                <button
                  className="btn btn-primary"
                  onClick={() => setTrailerKey(trailer.key)}
                  aria-label={`Watch trailer for ${movie.title}`}
                >
                  <Play size={16} fill="currentColor" aria-hidden="true" />
                  Watch Trailer
                </button>
              )}

              {/* Watchlist toggle */}
              <button
                className={`btn ${inWatchlist ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => toggleWatchlist(movie)}
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                aria-pressed={inWatchlist}
              >
                {inWatchlist ? (
                  <>
                    <BookmarkCheck size={16} aria-hidden="true" />
                    Saved to Watchlist
                  </>
                ) : (
                  <>
                    <Bookmark size={16} aria-hidden="true" />
                    Add to Watchlist
                  </>
                )}
              </button>

              {/* Watched toggle */}
              <button
                type="button"
                className={`btn ${inWatched ? 'movie-detail-watched-active' : 'btn-ghost'}`}
                onClick={handleWatchedToggle}
                aria-label={inWatched ? 'Mark as unwatched' : 'Mark as watched'}
                aria-pressed={inWatched}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                {inWatched ? 'Watched' : 'Mark Watched'}
              </button>

              {/* Collections modal button */}
              <button
                type="button"
                className={`btn ${movieCollections.length > 0 ? 'movie-detail-col-active' : 'btn-ghost'}`}
                onClick={() => setShowCollectionModal(true)}
                aria-label="Manage collections for this movie"
              >
                <FolderPlus size={16} aria-hidden="true" />
                {movieCollections.length > 0
                  ? `In ${movieCollections.length} Collection${movieCollections.length !== 1 ? 's' : ''}`
                  : 'Add to Collection'}
              </button>

              {/* Compare toggle */}
              <button
                type="button"
                className={`btn ${inCompare ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => toggleCompare(movie)}
                aria-label={
                  inCompare
                    ? `Remove ${movie.title} from comparison`
                    : isCompareFull
                      ? 'Comparison full (max 3 films)'
                      : `Add ${movie.title} to comparison`
                }
                aria-pressed={inCompare}
                title={
                  inCompare
                    ? 'In Comparison Studio (click to remove)'
                    : isCompareFull
                      ? 'Comparison full (maximum 3 films)'
                      : 'Add to Comparison Studio'
                }
              >
                <GitCompare size={16} aria-hidden="true" />
                {inCompare ? 'In Comparison' : 'Compare Film'}
              </button>

              {inCompare && (
                <Link to="/compare" className="movie-detail-compare-link">
                  Open in Studio ({compareList.length}/3) →
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* ── Personal Cinema Log Section ──────────────────────────── */}
        <section className="movie-detail-log-card" aria-labelledby="cinema-log-heading">
          <div className="movie-detail-log-header">
            <div>
              <h2 className="movie-detail-log-title font-heading" id="cinema-log-heading">
                Personal Cinema Log
              </h2>
              <p className="movie-detail-log-subtitle">
                Your private score, journal notes, and custom collections for this film.
              </p>
            </div>
            {logFeedback && (
              <div className="movie-detail-log-feedback" role="status">
                <Check size={14} />
                {logFeedback}
              </div>
            )}
          </div>

          <div className="movie-detail-log-grid">
            {/* Left Column: Watched status & Personal Rating */}
            <div className="movie-detail-log-col">
              {/* Watched toggle card */}
              <div className="movie-detail-log-subitem">
                <span className="movie-detail-log-label">Viewing History</span>
                <button
                  type="button"
                  className={`detail-watched-btn${inWatched ? ' active' : ''}`}
                  onClick={handleWatchedToggle}
                  aria-pressed={inWatched}
                >
                  {inWatched ? (
                    <>
                      <CheckCircle2 size={18} className="icon-watched" />
                      <div>
                        <div className="detail-watched-title">Watched</div>
                        <div className="detail-watched-sub">Logged in your watched history</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Circle size={18} className="icon-unwatched" />
                      <div>
                        <div className="detail-watched-title">Unwatched</div>
                        <div className="detail-watched-sub">Click to mark as watched</div>
                      </div>
                    </>
                  )}
                </button>
              </div>

              {/* Personal Rating scale */}
              <div className="movie-detail-log-subitem">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="movie-detail-log-label">
                    Personal Rating <span className="label-sub">(Separate from TMDB)</span>
                  </span>
                  {personalRating != null && (
                    <button
                      type="button"
                      className="detail-clear-rating-btn"
                      onClick={handleClearRating}
                      aria-label="Clear personal rating"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="detail-rating-banner">
                  <div className="detail-rating-score">
                    <Star size={22} className="score-star" fill="currentColor" />
                    <span className="score-num">
                      {displayRating != null ? displayRating.toFixed(1) : '—'}
                    </span>
                    <span className="score-out">/ 10</span>
                  </div>
                  <div className="detail-rating-verdict">
                    {displayRating != null
                      ? displayRating >= 9
                        ? 'Masterpiece'
                        : displayRating >= 8
                          ? 'Exceptional'
                          : displayRating >= 7
                            ? 'Great'
                            : displayRating >= 6
                              ? 'Good'
                              : displayRating >= 5
                                ? 'Average'
                                : 'Disappointing'
                      : 'Not rated yet'}
                  </div>
                </div>

                {/* 1-10 selector */}
                <div
                  className="detail-rating-step-row"
                  role="radiogroup"
                  aria-label="Personal rating 1 to 10"
                >
                  {RATING_STEPS.map((step) => {
                    const isSelected = personalRating === step;
                    const isHovered = hoverRating === step;
                    return (
                      <button
                        key={step}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Rate ${step} out of 10`}
                        className={`detail-rating-btn${isSelected ? ' selected' : ''}${isHovered ? ' hovered' : ''}`}
                        onClick={() => handleRatingClick(step)}
                        onMouseEnter={() => setHoverRating(step)}
                        onMouseLeave={() => setHoverRating(null)}
                      >
                        {step % 1 === 0 ? step : '·'}
                      </button>
                    );
                  })}
                </div>
                <div className="detail-rating-legend">
                  <span>1.0</span>
                  <span>5.0</span>
                  <span>10.0</span>
                </div>
              </div>

              {/* Collections tags */}
              <div className="movie-detail-log-subitem">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="movie-detail-log-label">Collections</span>
                  <button
                    type="button"
                    className="detail-manage-col-link"
                    onClick={() => setShowCollectionModal(true)}
                  >
                    + Manage
                  </button>
                </div>

                {movieCollections.length === 0 ? (
                  <p className="detail-no-collections">
                    Not part of any collection yet.{' '}
                    <button
                      type="button"
                      className="link-inline"
                      onClick={() => setShowCollectionModal(true)}
                    >
                      Add to a collection
                    </button>
                  </p>
                ) : (
                  <div className="detail-collections-pills">
                    {movieCollections.map((col) => (
                      <span key={col.id} className="detail-col-pill">
                        #{col.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Personal Notes */}
            <div className="movie-detail-log-col">
              <div className="movie-detail-log-subitem" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="movie-detail-log-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MessageSquare size={14} color="var(--accent)" />
                    Personal Notes & Impressions
                  </span>
                  {noteDraft && (
                    <button
                      type="button"
                      className="detail-clear-rating-btn"
                      onClick={handleClearNote}
                      aria-label="Clear note"
                    >
                      <Trash2 size={12} />
                      Clear
                    </button>
                  )}
                </div>

                <textarea
                  className="detail-note-textarea"
                  placeholder="Record your thoughts, why this film was saved, favorite quotes, or rewatch recommendations..."
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={6}
                  maxLength={1000}
                  aria-label="Personal notes for this film"
                />

                <div className="detail-note-footer">
                  <span className="detail-note-counter">{noteDraft.length} / 1000</span>
                  <button
                    type="button"
                    className="btn btn-primary detail-note-save-btn"
                    onClick={handleSaveNote}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Synopsis Section */}
        {movie.overview && (
          <section className="movie-detail-section" aria-labelledby="synopsis-heading">
            <h2 className="movie-detail-section-title" id="synopsis-heading">
              Synopsis
            </h2>
            <p className="movie-detail-synopsis">{movie.overview}</p>
          </section>
        )}

        {/* Cast Section */}
        {cast.length > 0 && (
          <section className="movie-detail-section" aria-labelledby="cast-heading">
            <h2 className="movie-detail-section-title" id="cast-heading">
              Cast & Crew
            </h2>
            <div className="movie-detail-cast-grid" role="list">
              {cast.map((person) => (
                <div key={person.id} role="listitem">
                  <CastAvatar person={person} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Modals */}
      {showCollectionModal && (
        <AddToCollectionModal
          movie={movie}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
      {trailerKey && (
        <TrailerModal
          trailerKey={trailerKey}
          onClose={() => setTrailerKey(null)}
        />
      )}
    </article>
  );
}
