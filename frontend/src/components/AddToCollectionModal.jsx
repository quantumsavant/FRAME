import { useState, useEffect, useRef } from 'react';
import { X, Folder, FolderPlus, Check, AlertCircle, Film } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { posterUrl } from '../lib/tmdb';
import './AddToCollectionModal.css';

export default function AddToCollectionModal({ movie, onClose }) {
  const {
    collections,
    createCollection,
    toggleMovieInCollection,
    isMovieInCollection,
  } = useWatchlist();

  const [newColName, setNewColName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const inputRef = useRef(null);

  // Focus trap / keyboard escape
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

  function handleCreateAndAdd(e) {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = createCollection(newColName);
    if (!res.success) {
      setError(res.error);
      return;
    }

    // Automatically add this movie to the newly created collection
    toggleMovieInCollection(res.collection.id, movie);
    setNewColName('');
    setSuccessMsg(`Created "${res.collection.name}" and added movie!`);
    setTimeout(() => setSuccessMsg(''), 2500);
  }

  function handleToggle(colId, colName) {
    setError('');
    const currentlyIn = isMovieInCollection(colId, movie.id);
    toggleMovieInCollection(colId, movie);
    if (!currentlyIn) {
      setSuccessMsg(`Added to "${colName}"`);
    } else {
      setSuccessMsg(`Removed from "${colName}"`);
    }
    setTimeout(() => setSuccessMsg(''), 2000);
  }

  return (
    <div
      className="modal-overlay add-collection-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collection-modal-title"
    >
      <div className="add-collection-modal">
        {/* Header */}
        <div className="add-collection-modal__header">
          <div className="add-collection-modal__header-info">
            <h2 id="collection-modal-title" className="font-heading">
              Add to Collection
            </h2>
            <p className="add-collection-modal__subtitle">
              Organize <em>{movie.title}</em> into custom cinema collections.
            </p>
            <p className="add-collection-modal__caption">
              Collection membership is independent from your main saved Watchlist.
            </p>
          </div>
          <button
            className="btn-icon add-collection-modal__close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="add-collection-modal__body">
          {/* Movie preview snippet */}
          <div className="add-collection-modal__movie-preview">
            <div className="add-collection-modal__poster">
              {poster ? (
                <img src={poster} alt="" />
              ) : (
                <div className="add-collection-modal__poster-fallback">
                  <Film size={20} />
                </div>
              )}
            </div>
            <div className="add-collection-modal__movie-text">
              <div className="add-collection-modal__title">{movie.title}</div>
              <div className="add-collection-modal__meta">
                {year && <span>{year}</span>}
                {movie.vote_average != null && (
                  <span>· ★ {Number(movie.vote_average).toFixed(1)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Alerts / Feedback */}
          {error && (
            <div className="add-collection-modal__alert error" role="alert">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="add-collection-modal__alert success" role="status">
              <Check size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Collections Checklist */}
          <div className="add-collection-modal__list-section">
            <div className="add-collection-modal__section-label">
              Your Collections ({collections.length})
            </div>

            {collections.length === 0 ? (
              <div className="add-collection-modal__empty">
                <Folder size={32} strokeWidth={1.2} />
                <p>You haven't created any collections yet.</p>
                <span>Create one below to start curating your library.</span>
              </div>
            ) : (
              <div className="add-collection-modal__list" role="list">
                {collections.map((col) => {
                  const inCol = isMovieInCollection(col.id, movie.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      role="listitem"
                      className={`add-collection-item${inCol ? ' selected' : ''}`}
                      onClick={() => handleToggle(col.id, col.name)}
                      aria-pressed={inCol}
                      aria-label={`${inCol ? 'Remove from' : 'Add to'} ${col.name} collection (${col.movieIds.length} films)`}
                    >
                      <div className="add-collection-item__check">
                        {inCol ? <Check size={14} strokeWidth={3} /> : null}
                      </div>
                      <div className="add-collection-item__info">
                        <div className="add-collection-item__name">{col.name}</div>
                        <div className="add-collection-item__count">
                          {col.movieIds.length} {col.movieIds.length === 1 ? 'film' : 'films'}
                        </div>
                      </div>
                      <span className="add-collection-item__status">
                        {inCol ? 'Added' : '+ Add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Create new collection form */}
          <form className="add-collection-modal__create-form" onSubmit={handleCreateAndAdd}>
            <div className="add-collection-modal__section-label">
              Create New Collection
            </div>
            <div className="add-collection-modal__input-row">
              <input
                ref={inputRef}
                type="text"
                className="add-collection-modal__input"
                placeholder="e.g. Weekend Sci-Fi Marathon..."
                value={newColName}
                onChange={(e) => {
                  setNewColName(e.target.value);
                  if (error) setError('');
                }}
                maxLength={60}
                aria-label="New collection name"
              />
              <button
                type="submit"
                className="btn btn-primary add-collection-modal__create-btn"
                disabled={!newColName.trim()}
              >
                <FolderPlus size={15} />
                <span>Create & Add</span>
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="add-collection-modal__footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
