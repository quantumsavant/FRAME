import { useState } from 'react';
import { Film, Edit3, Trash2, Folder } from 'lucide-react';
import { posterUrl } from '../lib/tmdb';
import { useWatchlist } from '../context/WatchlistContext';
import './CollectionCard.css';

export default function CollectionCard({ collection, onOpen, onRename, onDelete }) {
  const { getCollectionMovies } = useWatchlist();
  const movies = getCollectionMovies(collection.id);
  const [imgErrors, setImgErrors] = useState({});

  function handleImgError(idx) {
    setImgErrors((prev) => ({ ...prev, [idx]: true }));
  }

  // Pick up to 4 posters for preview grid
  const previewMovies = movies.slice(0, 4);

  return (
    <article
      className="collection-card"
      onClick={() => onOpen(collection)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpen(collection)}
      tabIndex={0}
      role="button"
      aria-label={`Collection ${collection.name}, ${movies.length} films`}
    >
      {/* Clean Poster collage preview — no buttons overlapping the posters! */}
      <div className="collection-card__preview">
        {previewMovies.length === 0 ? (
          <div className="collection-card__empty-preview" aria-hidden="true">
            <Folder size={38} strokeWidth={1.2} />
            <span>Empty Collection</span>
          </div>
        ) : (
          <div className={`collection-card__grid grid-${Math.min(previewMovies.length, 4)}`}>
            {previewMovies.map((m, idx) => {
              const src = !imgErrors[idx] ? posterUrl(m.poster_path, 'w342') : null;
              return (
                <div key={m.id || idx} className="collection-card__thumbnail">
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      onError={() => handleImgError(idx)}
                    />
                  ) : (
                    <div className="collection-card__thumb-fallback">
                      <Film size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info bar beneath preview */}
      <div className="collection-card__info">
        <h3 className="collection-card__title font-heading" title={collection.name}>
          {collection.name}
        </h3>

        <div className="collection-card__meta">
          <span className="collection-card__count">
            {movies.length} {movies.length === 1 ? 'film' : 'films'}
          </span>
          {collection.createdAt && (
            <span className="collection-card__date">
              {new Date(collection.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
        </div>

        {/* Dedicated Collection Actions Row below the info */}
        <div className="collection-card__actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="collection-card__action-btn"
            onClick={() => onRename(collection)}
            aria-label={`Rename ${collection.name} collection`}
            title="Rename collection"
          >
            <Edit3 size={13} aria-hidden="true" />
            <span>Rename</span>
          </button>

          <button
            type="button"
            className="collection-card__action-btn collection-card__action-btn--delete"
            onClick={() => onDelete(collection)}
            aria-label={`Delete ${collection.name} collection`}
            title="Delete collection"
          >
            <Trash2 size={13} aria-hidden="true" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </article>
  );
}
