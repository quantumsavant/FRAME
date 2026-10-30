import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Bookmark,
  BookmarkCheck,
  Film,
  GitCompare,
  CheckCircle2,
  Circle,
  FolderPlus,
  FolderMinus,
  MessageSquare,
  MoreHorizontal,
  Info,
  Trash2,
} from 'lucide-react';
import { posterUrl } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import { useCompare } from '../context/CompareContext';
import AddToCollectionModal from './AddToCollectionModal';
import PersonalRatingModal from './PersonalRatingModal';
import './MovieCard.css';

function formatYear(dateStr) {
  if (!dateStr) return '—';
  return dateStr.slice(0, 4);
}

function formatRating(avg) {
  if (!avg && avg !== 0) return null;
  return Number(avg).toFixed(1);
}

export default function MovieCard({
  movie,
  onClick,
  context = 'standard', // 'standard' | 'watchlist' | 'collection'
  onRemove,
}) {
  const navigate = useNavigate();
  const {
    isInWatchlist,
    toggleWatchlist,
    removeFromWatchlist,
    isWatched,
    toggleWatched,
    getPersonalRating,
    getPersonalNote,
    getMovieCollectionIds,
  } = useWatchlist();
  const { isInCompare, toggleCompare, isCompareFull } = useCompare();

  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const menuRef = useRef(null);

  const inWatchlist = isInWatchlist(movie.id);
  const inCompare = isInCompare(movie.id);
  const inWatched = isWatched(movie.id);
  const personalRating = getPersonalRating(movie.id);
  const personalNote = getPersonalNote(movie.id);
  const collectionIds = getMovieCollectionIds(movie.id);

  const poster = !imgError ? posterUrl(movie.poster_path, 'w500') : null;
  const rating = formatRating(movie.vote_average);
  const year = formatYear(movie.release_date);

  // Close menu on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  function handleNavigateDetails() {
    if (onClick) {
      onClick(movie);
    } else {
      navigate(`/movie/${movie.id}`);
    }
  }

  function handleWatchlistToggle(e) {
    e.stopPropagation();
    toggleWatchlist(movie);
  }

  function handleRemove(e) {
    e.stopPropagation();
    if (onRemove) {
      onRemove(movie);
    } else if (context === 'watchlist') {
      removeFromWatchlist(movie.id);
    }
  }

  function handleCompareToggle(e) {
    e.stopPropagation();
    toggleCompare(movie);
  }

  function handleWatchedToggle(e) {
    e.stopPropagation();
    toggleWatched(movie.id, movie);
    setMenuOpen(false);
  }

  function handleOpenCollectionModal(e) {
    e.stopPropagation();
    setMenuOpen(false);
    setShowCollectionModal(true);
  }

  function handleOpenRatingModal(e) {
    e.stopPropagation();
    setMenuOpen(false);
    setShowRatingModal(true);
  }

  return (
    <>
      <article
        className={`movie-card${inCompare ? ' in-compare' : ''}${inWatched ? ' is-watched' : ''}`}
        aria-label={`${movie.title} (${year}) — TMDB: ${rating || 'N/A'}${personalRating ? `, Personal: ${personalRating}/10` : ''}${inWatched ? ' (Watched)' : ''}`}
      >
        {/* 1. Clean Poster (No action icon clutter on top!) */}
        <div
          className="movie-card__poster"
          onClick={handleNavigateDetails}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNavigateDetails()}
          role="button"
          tabIndex={0}
          aria-label={`View details for ${movie.title}`}
        >
          {poster ? (
            <img
              src={poster}
              alt={`${movie.title} poster`}
              className="movie-card__img"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="movie-card__fallback" aria-hidden="true">
              <Film size={32} strokeWidth={1} />
              <span className="movie-card__fallback-title">{movie.title}</span>
            </div>
          )}

          {/* Only essential badges on poster */}
          <div className="movie-card__poster-badges">
            {rating && (
              <div className="movie-card__rating-badge" aria-label={`TMDB Rating ${rating}`}>
                <Star size={10} fill="currentColor" aria-hidden="true" />
                <span>{rating}</span>
              </div>
            )}

            {inWatched && (
              <div className="movie-card__watched-badge" aria-label="Watched film">
                <CheckCircle2 size={10} aria-hidden="true" />
                <span>Watched</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Movie Info Area */}
        <div className="movie-card__info">
          {/* Title */}
          <h3
            className="movie-card__title"
            onClick={handleNavigateDetails}
            title={movie.title}
          >
            {movie.title}
          </h3>

          {/* Metadata Row */}
          <div className="movie-card__meta">
            <span className="movie-card__year">{year}</span>
            {rating && (
              <>
                <span className="movie-card__meta-dot" aria-hidden="true" />
                <span className="movie-card__meta-score" title={`TMDB Rating: ${rating}`}>
                  <Star size={10} fill="var(--amber)" color="var(--amber)" aria-hidden="true" />
                  <span>{rating}</span>
                </span>
              </>
            )}

            {/* Separately labeled Personal Rating */}
            {personalRating != null && (
              <button
                type="button"
                className="movie-card__personal-tag"
                onClick={handleOpenRatingModal}
                title={`Your rating: ${personalRating}/10 (Click to edit)`}
                aria-label={`Personal rating: ${personalRating} out of 10`}
              >
                <Star size={9} fill="currentColor" />
                <span>★ {Number(personalRating).toFixed(1)}</span>
              </button>
            )}

            {/* Personal Note Indicator */}
            {personalNote && (
              <button
                type="button"
                className="movie-card__note-indicator"
                onClick={handleOpenRatingModal}
                title="Personal note logged (Click to read or edit)"
                aria-label="Personal note recorded"
              >
                <MessageSquare size={11} />
              </button>
            )}
          </div>

          {/* 3. Dedicated Actions Area: Clean 2-Row Layout to prevent any label truncation */}
          <div className="movie-card__actions" onClick={(e) => e.stopPropagation()}>
            {/* Row 1: Primary actions (Details + Save/Remove) */}
            <div className="movie-card__actions-row">
              <button
                type="button"
                className="movie-card__btn movie-card__btn--details"
                onClick={handleNavigateDetails}
                title="View movie details"
                aria-label={`View details for ${movie.title}`}
              >
                <Info size={13} aria-hidden="true" />
                <span>Details</span>
              </button>

              {context === 'watchlist' ? (
                <button
                  type="button"
                  className="movie-card__btn movie-card__btn--remove"
                  onClick={handleRemove}
                  title="Remove from watchlist"
                  aria-label={`Remove ${movie.title} from watchlist`}
                >
                  <Trash2 size={13} aria-hidden="true" />
                  <span>Remove</span>
                </button>
              ) : context === 'collection' ? (
                <button
                  type="button"
                  className="movie-card__btn movie-card__btn--remove"
                  onClick={handleRemove}
                  title="Remove from this collection"
                  aria-label={`Remove ${movie.title} from collection`}
                >
                  <FolderMinus size={13} aria-hidden="true" />
                  <span>Remove</span>
                </button>
              ) : (
                <button
                  type="button"
                  className={`movie-card__btn movie-card__btn--save${inWatchlist ? ' active' : ''}`}
                  onClick={handleWatchlistToggle}
                  title={inWatchlist ? 'Saved in Watchlist (click to remove)' : 'Save to Watchlist'}
                  aria-pressed={inWatchlist}
                  aria-label={inWatchlist ? `Remove ${movie.title} from watchlist` : `Save ${movie.title} to watchlist`}
                >
                  {inWatchlist ? (
                    <BookmarkCheck size={13} aria-hidden="true" />
                  ) : (
                    <Bookmark size={13} aria-hidden="true" />
                  )}
                  <span>{inWatchlist ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>

            {/* Row 2: Secondary actions (Compare/Comparing + Compact More Menu) */}
            <div className="movie-card__actions-row">
              <button
                type="button"
                className={`movie-card__btn movie-card__btn--compare${inCompare ? ' active' : ''}`}
                onClick={handleCompareToggle}
                title={
                  inCompare
                    ? 'In Comparison Studio (click to remove)'
                    : isCompareFull
                      ? 'Studio is full (max 3 films)'
                      : 'Add to Comparison Studio'
                }
                aria-pressed={inCompare}
                aria-label={inCompare ? `Remove ${movie.title} from comparison` : `Add ${movie.title} to comparison`}
              >
                <GitCompare size={13} aria-hidden="true" />
                <span>{inCompare ? 'Comparing' : 'Compare'}</span>
              </button>

              <div className="movie-card__more-wrap" ref={menuRef}>
                <button
                  type="button"
                  className={`movie-card__btn movie-card__btn--more${menuOpen ? ' active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen((prev) => !prev);
                  }}
                  title="More actions (Watched, Collections, Notes)"
                  aria-label={`More options for ${movie.title}`}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  <MoreHorizontal size={15} aria-hidden="true" />
                </button>

                {/* Accessible Dropdown Menu for secondary actions */}
                {menuOpen && (
                  <div
                    className="movie-card__dropdown-menu"
                    role="menu"
                    aria-label={`More options for ${movie.title}`}
                  >
                    {/* Watched toggle */}
                    <button
                      type="button"
                      role="menuitem"
                      className="movie-card__dropdown-item"
                      onClick={handleWatchedToggle}
                    >
                      {inWatched ? (
                        <>
                          <Circle size={14} aria-hidden="true" />
                          <span>Mark as Unwatched</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={14} color="var(--accent)" aria-hidden="true" />
                          <span>Mark as Watched</span>
                        </>
                      )}
                    </button>

                    {/* Add to Collection */}
                    <button
                      type="button"
                      role="menuitem"
                      className="movie-card__dropdown-item"
                      onClick={handleOpenCollectionModal}
                    >
                      <FolderPlus size={14} aria-hidden="true" />
                      <span>Add to Collection…</span>
                      {collectionIds.length > 0 && (
                        <span className="movie-card__dropdown-badge">
                          In {collectionIds.length}
                        </span>
                      )}
                    </button>

                    {/* Personal Rating & Notes */}
                    <button
                      type="button"
                      role="menuitem"
                      className="movie-card__dropdown-item"
                      onClick={handleOpenRatingModal}
                    >
                      <Star size={14} color="var(--amber)" fill={personalRating ? 'currentColor' : 'none'} aria-hidden="true" />
                      <span>Personal Rating & Notes…</span>
                      {personalRating != null && (
                        <span className="movie-card__dropdown-badge amber">
                          ★ {personalRating}
                        </span>
                      )}
                    </button>

                    <div className="movie-card__dropdown-divider" role="separator" />

                    {/* Watchlist toggle in dropdown (if not already the prominent action) */}
                    {context !== 'watchlist' && inWatchlist && (
                      <button
                        type="button"
                        role="menuitem"
                        className="movie-card__dropdown-item text-danger"
                        onClick={(e) => {
                          handleWatchlistToggle(e);
                          setMenuOpen(false);
                        }}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                        <span>Remove from Watchlist</span>
                      </button>
                    )}

                    {/* Full details */}
                    <button
                      type="button"
                      role="menuitem"
                      className="movie-card__dropdown-item"
                      onClick={() => {
                        setMenuOpen(false);
                        handleNavigateDetails();
                      }}
                    >
                      <Info size={14} aria-hidden="true" />
                      <span>View Movie Details</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Modals triggered from More menu or tags */}
      {showCollectionModal && (
        <AddToCollectionModal
          movie={movie}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
      {showRatingModal && (
        <PersonalRatingModal
          movie={movie}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </>
  );
}
