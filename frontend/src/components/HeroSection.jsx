import { useState } from 'react';
import { Star, Play, Info, Bookmark, BookmarkCheck } from 'lucide-react';
import { backdropUrl, hasApiKey } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import './HeroSection.css';

function getGenreNames(movie, genreMap) {
  const ids = movie.genre_ids || (movie.genres || []).map((g) => g.id);
  return ids
    .slice(0, 3)
    .map((id) => genreMap[id])
    .filter(Boolean);
}

export default function HeroSection({ movie, genreMap = {}, onExplore, onTrailer, loading }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const [imgError, setImgError] = useState(false);

  if (loading || !movie) {
    return (
      <div className="hero" style={{ minHeight: 'min(85vh, 620px)' }}>
        <div className="hero__backdrop">
          <div className="hero__backdrop-gradient" />
        </div>
        <div className="hero__scrim" />
        <div className="hero__content">
          <div className="hero__inner">
            <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 16, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 64, width: '90%', marginBottom: 16, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 64, width: '70%', marginBottom: 20, borderRadius: 8 }} />
            <div className="skeleton" style={{ height: 14, width: '100%', marginBottom: 8, borderRadius: 4 }} />
            <div className="skeleton" style={{ height: 14, width: '85%', marginBottom: 32, borderRadius: 4 }} />
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="skeleton" style={{ height: 44, width: 150, borderRadius: 10 }} />
              <div className="skeleton" style={{ height: 44, width: 120, borderRadius: 10 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const backdrop = !imgError ? backdropUrl(movie.backdrop_path) : null;
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;
  const genres = getGenreNames(movie, genreMap);
  const inWatchlist = isInWatchlist(movie.id);

  // Trailer: use videos.results from movie details if available
  const trailer =
    movie.videos?.results?.find(
      (v) => v.type === 'Trailer' && v.site === 'YouTube'
    ) || null;

  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* Backdrop */}
      <div className="hero__backdrop" aria-hidden="true">
        {backdrop ? (
          <img
            src={backdrop}
            alt=""
            className="hero__backdrop-img"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="hero__backdrop-gradient" />
        )}
      </div>

      <div className="hero__scrim" aria-hidden="true" />

      {/* Content */}
      <div className="hero__content">
        <div className="hero__inner fade-up">
          {/* Label */}
          <div className="hero__label">
            <span className="hero__label-dot" aria-hidden="true" />
            {hasApiKey ? 'Featured' : 'Sample · Demo Mode'}
          </div>

          {/* Title */}
          <h1 className="hero__title" id="hero-title">
            {movie.title}
          </h1>

          {/* Meta row */}
          <div className="hero__meta" role="list" aria-label="Movie details">
            {year && <span role="listitem">{year}</span>}
            {rating && (
              <>
                <span className="hero__meta-sep" aria-hidden="true" />
                <span className="hero__meta-rating" role="listitem" aria-label={`Rating: ${rating}`}>
                  <Star size={13} fill="currentColor" aria-hidden="true" />
                  {rating}
                </span>
              </>
            )}
            {movie.runtime && (
              <>
                <span className="hero__meta-sep" aria-hidden="true" />
                <span role="listitem">{movie.runtime} min</span>
              </>
            )}
          </div>

          {/* Genre badges */}
          {genres.length > 0 && (
            <div className="hero__genres" aria-label="Genres">
              {genres.map((g) => (
                <span key={g} className="badge badge-surface">{g}</span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {movie.overview && (
            <p className="hero__synopsis">{movie.overview}</p>
          )}

          {/* Actions */}
          <div className="hero__actions">
            <button
              className="btn btn-primary"
              onClick={() => onExplore && onExplore(movie)}
              aria-label={`Explore ${movie.title}`}
            >
              <Info size={16} aria-hidden="true" />
              Explore
            </button>

            {trailer && (
              <button
                className="btn btn-ghost"
                onClick={() => onTrailer && onTrailer(trailer.key)}
                aria-label={`Watch ${movie.title} trailer on YouTube`}
              >
                <Play size={16} aria-hidden="true" />
                Trailer
              </button>
            )}

            <button
              className="btn btn-ghost btn-icon"
              onClick={() => toggleWatchlist(movie)}
              aria-label={inWatchlist ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
              aria-pressed={inWatchlist}
            >
              {inWatchlist
                ? <BookmarkCheck size={18} color="var(--accent)" aria-hidden="true" />
                : <Bookmark size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
