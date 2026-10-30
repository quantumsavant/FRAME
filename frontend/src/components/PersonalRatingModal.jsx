import { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, Circle, MessageSquare, Trash2, Film, Check } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { posterUrl } from '../lib/tmdb';
import './PersonalRatingModal.css';

const RATING_STEPS = [
  1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10
];

export default function PersonalRatingModal({ movie, onClose }) {
  const {
    isWatched,
    setWatched,
    getPersonalRating,
    setPersonalRating,
    getPersonalNote,
    setPersonalNote,
  } = useWatchlist();

  const [watched, setWatchedState] = useState(() => isWatched(movie?.id));
  const [rating, setRatingState] = useState(() => getPersonalRating(movie?.id));
  const [note, setNoteState] = useState(() => getPersonalNote(movie?.id));
  const [hoverRating, setHoverRating] = useState(null);
  const [savedMsg, setSavedMsg] = useState('');

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const poster = posterUrl(movie.poster_path, 'w185');
  const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
  const tmdbScore = movie.vote_average ? Number(movie.vote_average).toFixed(1) : null;

  function handleWatchedToggle() {
    const nextWatched = !watched;
    setWatchedState(nextWatched);
    setWatched(movie.id, nextWatched, movie);
    flashSaved(nextWatched ? 'Marked as watched' : 'Marked as unwatched');
  }

  function handleRatingSelect(val) {
    const nextRating = rating === val ? null : val;
    setRatingState(nextRating);
    setPersonalRating(movie.id, nextRating, movie);
    flashSaved(nextRating ? `Rated ${nextRating} / 10` : 'Rating cleared');
  }

  function handleClearRating() {
    setRatingState(null);
    setPersonalRating(movie.id, null, movie);
    flashSaved('Rating cleared');
  }

  function handleSaveNote() {
    setPersonalNote(movie.id, note.trim(), movie);
    flashSaved('Note saved');
  }

  function handleClearNote() {
    setNoteState('');
    setPersonalNote(movie.id, '', movie);
    flashSaved('Note cleared');
  }

  function flashSaved(msg) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 2200);
  }

  const activeRating = hoverRating ?? rating;

  return (
    <div
      className="modal-overlay personal-rating-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rating-modal-title"
    >
      <div className="personal-rating-modal">
        {/* Header */}
        <div className="personal-rating-modal__header">
          <div>
            <h2 id="rating-modal-title" className="font-heading">
              Personal Cinema Log
            </h2>
            <p className="personal-rating-modal__subtitle">
              Your private review, score, and notes
            </p>
          </div>
          <button
            className="btn-icon personal-rating-modal__close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Movie preview snippet with TMDB vs Personal badges */}
        <div className="personal-rating-modal__movie-preview">
          <div className="personal-rating-modal__poster">
            {poster ? (
              <img src={poster} alt="" />
            ) : (
              <div className="personal-rating-modal__poster-fallback">
                <Film size={22} />
              </div>
            )}
          </div>
          <div className="personal-rating-modal__movie-details">
            <h3 className="personal-rating-modal__movie-title">{movie.title}</h3>
            <div className="personal-rating-modal__meta-row">
              {year && <span>{year}</span>}
              {tmdbScore && (
                <span className="personal-rating-modal__tmdb-pill" title="Community TMDB score">
                  <Star size={11} fill="currentColor" />
                  TMDB {tmdbScore}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Feedback pill */}
        {savedMsg && (
          <div className="personal-rating-modal__status-banner" role="status">
            <Check size={14} />
            {savedMsg}
          </div>
        )}

        {/* Scrollable body */}
        <div className="personal-rating-modal__body">
          {/* Section 1: Watched toggle */}
          <div className="personal-rating-section">
            <div className="personal-rating-section__header">
              <span className="personal-rating-section__title">Watched Status</span>
            </div>
            <button
              type="button"
              className={`personal-watched-toggle${watched ? ' active' : ''}`}
              onClick={handleWatchedToggle}
              aria-pressed={watched}
              aria-label={watched ? 'Movie is watched (click to mark unwatched)' : 'Movie is unwatched (click to mark watched)'}
            >
              {watched ? (
                <>
                  <CheckCircle2 size={18} className="icon-watched" />
                  <div className="personal-watched-text">
                    <div className="personal-watched-status">Watched</div>
                    <div className="personal-watched-sub">Logged in your watched history</div>
                  </div>
                </>
              ) : (
                <>
                  <Circle size={18} className="icon-unwatched" />
                  <div className="personal-watched-text">
                    <div className="personal-watched-status">Unwatched</div>
                    <div className="personal-watched-sub">Click to mark as watched</div>
                  </div>
                </>
              )}
            </button>
          </div>

          {/* Section 2: Personal Rating */}
          <div className="personal-rating-section">
            <div className="personal-rating-section__header">
              <div>
                <span className="personal-rating-section__title">Personal Rating</span>
                <span className="personal-rating-section__note">
                  (Separately tracked from TMDB)
                </span>
              </div>
              {rating != null && (
                <button
                  type="button"
                  className="personal-rating-clear-btn"
                  onClick={handleClearRating}
                  aria-label="Clear personal rating"
                >
                  Clear Rating
                </button>
              )}
            </div>

            <div className="personal-rating-display">
              <div className="personal-rating-score-box">
                <Star size={24} className="score-star" fill="currentColor" />
                <span className="score-value">
                  {activeRating != null ? activeRating.toFixed(1) : '—'}
                </span>
                <span className="score-max">/ 10</span>
              </div>
              <div className="personal-rating-verdict">
                {activeRating != null ? (
                  activeRating >= 9
                    ? 'Masterpiece'
                    : activeRating >= 8
                      ? 'Exceptional'
                      : activeRating >= 7
                        ? 'Great'
                        : activeRating >= 6
                          ? 'Good'
                          : activeRating >= 5
                            ? 'Average'
                            : 'Disappointing'
                ) : (
                  'Not rated yet'
                )}
              </div>
            </div>

            {/* Interactive Stars & 1-10 selector */}
            <div
              className="personal-rating-step-grid"
              role="radiogroup"
              aria-label="Personal rating 1 to 10"
            >
              {RATING_STEPS.map((step) => {
                const isSelected = rating === step;
                const isHovered = hoverRating === step;
                return (
                  <button
                    key={step}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Rate ${step} out of 10`}
                    className={`rating-step-btn${isSelected ? ' selected' : ''}${isHovered ? ' hovered' : ''}`}
                    onClick={() => handleRatingSelect(step)}
                    onMouseEnter={() => setHoverRating(step)}
                    onMouseLeave={() => setHoverRating(null)}
                  >
                    {step % 1 === 0 ? step : '·'}
                  </button>
                );
              })}
            </div>
            <div className="personal-rating-scale-legend">
              <span>1.0</span>
              <span>5.0</span>
              <span>10.0</span>
            </div>
          </div>

          {/* Section 3: Personal Notes */}
          <div className="personal-rating-section">
            <div className="personal-rating-section__header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} color="var(--accent)" />
                <span className="personal-rating-section__title">Personal Notes</span>
              </div>
              {note && (
                <button
                  type="button"
                  className="personal-note-clear-btn"
                  onClick={handleClearNote}
                  aria-label="Clear personal note"
                >
                  <Trash2 size={12} />
                  Clear Note
                </button>
              )}
            </div>

            <textarea
              className="personal-note-textarea"
              placeholder="Why did you save this film? Rewatch thoughts, favorite scenes, recommendations..."
              value={note}
              onChange={(e) => setNoteState(e.target.value)}
              rows={4}
              maxLength={1000}
              aria-label="Personal notes for this movie"
            />
            <div className="personal-note-footer">
              <span className="personal-note-counter">{note.length} / 1000</span>
              <button
                type="button"
                className="btn btn-primary personal-note-save-btn"
                onClick={handleSaveNote}
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="personal-rating-modal__footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
