import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Star,
  Clock,
  Calendar,
  Play,
  Bookmark,
  BookmarkCheck,
  Film,
  User,
  CheckCircle2,
  FolderPlus,
  ArrowRight,
} from 'lucide-react';
import { fetchMovieDetails, posterUrl, backdropUrl, IMAGE_BASE, hasApiKey } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import AddToCollectionModal from './AddToCollectionModal';
import './MovieDetailModal.css';

function CastAvatar({ person }) {
  const [err, setErr] = useState(false);
  const src = person.profile_path ? `${IMAGE_BASE}/w185${person.profile_path}` : null;
  return (
    <div className="modal__cast-person" title={`${person.name} as ${person.character || ''}`}>
      {src && !err ? (
        <img
          src={src}
          alt={person.name}
          className="modal__cast-avatar"
          onError={() => setErr(true)}
          loading="lazy"
        />
      ) : (
        <div className="modal__cast-avatar-fallback" aria-hidden="true">
          <User size={22} strokeWidth={1.5} />
        </div>
      )}
      <div className="modal__cast-name">{person.name}</div>
      {person.character && (
        <div className="modal__cast-role">{person.character}</div>
      )}
    </div>
  );
}

export default function MovieDetailModal({ movie: initialMovie, onClose, onTrailer }) {
  const {
    isInWatchlist,
    toggleWatchlist,
    isWatched,
    toggleWatched,
    getPersonalRating,
    getMovieCollectionIds,
  } = useWatchlist();
  const [movie, setMovie] = useState(initialMovie);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backdropErr, setBackdropErr] = useState(false);
  const [posterErr, setPosterErr] = useState(false);
  const [showColModal, setShowColModal] = useState(false);

  // Fetch full details if we have an API key
  useEffect(() => {
    if (!hasApiKey || !initialMovie?.id) return;
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetchMovieDetails(initialMovie.id)
      .then((data) => {
        if (!cancelled) {
          setMovie(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [initialMovie?.id]);

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  if (!movie) return null;

  const inWatchlist = isInWatchlist(movie.id);
  const poster = !posterErr ? posterUrl(movie.poster_path) : null;
  const backdrop = !backdropErr ? backdropUrl(movie.backdrop_path) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const genres = movie.genres || [];

  const trailer =
    movie.videos?.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || null;

  const cast = movie.credits?.cast?.slice(0, 12) || [];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal">
        {/* Close */}
        <button className="modal__close" onClick={onClose} aria-label="Close movie details">
          <X size={16} aria-hidden="true" />
        </button>

        {loading ? (
          <div className="modal__loading">
            <div className="spinner" aria-label="Loading movie details" />
          </div>
        ) : (
          <>
            {/* Backdrop */}
            <div className="modal__backdrop" style={{ marginTop: 0 }}>
              {backdrop ? (
                <img
                  src={backdrop}
                  alt=""
                  className="modal__backdrop-img"
                  onError={() => setBackdropErr(true)}
                />
              ) : (
                <div className="modal__backdrop-gradient">
                  <Film size={48} strokeWidth={1} />
                </div>
              )}
              <div className="modal__backdrop-scrim" aria-hidden="true" />
            </div>

            {/* Body */}
            <div className="modal__body">
              <div className="modal__header">
                {/* Poster */}
                <div className="modal__poster">
                  {poster ? (
                    <img
                      src={poster}
                      alt={`${movie.title} poster`}
                      className="modal__poster-img"
                      onError={() => setPosterErr(true)}
                    />
                  ) : (
                    <div className="modal__poster-fallback" aria-hidden="true">
                      <Film size={28} strokeWidth={1} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="modal__info">
                  <h2 className="modal__title" id="modal-title">{movie.title}</h2>
                  {movie.tagline && (
                    <p className="modal__tagline">"{movie.tagline}"</p>
                  )}

                  <div className="modal__meta">
                    {rating && (
                      <span className="modal__meta-rating" aria-label={`Rating: ${rating}`}>
                        <Star size={14} fill="currentColor" aria-hidden="true" />
                        TMDB {rating}
                      </span>
                    )}
                    {getPersonalRating(movie.id) != null && (
                      <span
                        className="modal__meta-rating"
                        style={{ color: 'rgba(229, 169, 60, 1)', borderColor: 'rgba(229, 169, 60, 0.4)' }}
                        aria-label={`Personal Rating: ${getPersonalRating(movie.id)}`}
                      >
                        <Star size={14} fill="currentColor" />
                        Personal {Number(getPersonalRating(movie.id)).toFixed(1)}
                      </span>
                    )}
                    {isWatched(movie.id) && (
                      <span className="badge badge-accent">
                        <CheckCircle2 size={12} />
                        Watched
                      </span>
                    )}
                    {year && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={13} aria-hidden="true" />
                        {year}
                      </span>
                    )}
                    {movie.runtime && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} aria-hidden="true" />
                        {movie.runtime} min
                      </span>
                    )}
                  </div>

                  {genres.length > 0 && (
                    <div className="modal__genres" aria-label="Genres">
                      {genres.map((g) => (
                        <span key={g.id} className="badge badge-surface">{g.name}</span>
                      ))}
                    </div>
                  )}

                  <div className="modal__actions">
                    {trailer && (
                      <button
                        className="btn btn-primary"
                        onClick={() => onTrailer && onTrailer(trailer.key)}
                        aria-label={`Watch trailer for ${movie.title}`}
                      >
                        <Play size={15} fill="currentColor" aria-hidden="true" />
                        Watch Trailer
                      </button>
                    )}
                    <button
                      className="btn btn-ghost"
                      onClick={() => toggleWatchlist(movie)}
                      aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                      aria-pressed={inWatchlist}
                    >
                      {inWatchlist
                        ? <><BookmarkCheck size={15} color="var(--accent)" aria-hidden="true" /> Saved</>
                        : <><Bookmark size={15} aria-hidden="true" /> Save</>}
                    </button>
                    <button
                      type="button"
                      className={`btn ${isWatched(movie.id) ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => toggleWatched(movie.id, movie)}
                      aria-label={isWatched(movie.id) ? 'Mark as unwatched' : 'Mark as watched'}
                      aria-pressed={isWatched(movie.id)}
                    >
                      <CheckCircle2 size={15} aria-hidden="true" />
                      {isWatched(movie.id) ? 'Watched' : 'Mark Watched'}
                    </button>
                    <button
                      type="button"
                      className={`btn ${getMovieCollectionIds(movie.id).length > 0 ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setShowColModal(true)}
                      aria-label="Manage collections"
                    >
                      <FolderPlus size={15} aria-hidden="true" />
                      Collections
                    </button>
                    <Link
                      to={`/movie/${movie.id}`}
                      className="btn btn-ghost"
                      onClick={onClose}
                      style={{ marginLeft: 'auto', fontSize: '0.8125rem' }}
                    >
                      Full Details <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Error notice */}
              {error && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: 16 }}>
                  Could not load full details. Showing available data.
                </p>
              )}

              {/* Overview */}
              {movie.overview && (
                <div className="modal__section">
                  <div className="modal__section-title">Synopsis</div>
                  <p className="modal__overview">{movie.overview}</p>
                </div>
              )}

              {/* Cast */}
              {cast.length > 0 && (
                <div className="modal__section">
                  <div className="modal__section-title">Cast</div>
                  <div className="modal__cast" role="list" aria-label="Cast members">
                    {cast.map((person) => (
                      <div key={person.id} role="listitem">
                        <CastAvatar person={person} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showColModal && (
        <AddToCollectionModal
          movie={movie}
          onClose={() => setShowColModal(false)}
        />
      )}
    </div>
  );
}
