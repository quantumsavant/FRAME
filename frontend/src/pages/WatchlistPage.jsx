import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bookmark,
  Film,
  Folder,
  FolderPlus,
  CheckCircle2,
  Circle,
  Search,
  X,
  SlidersHorizontal,
  ArrowLeft,
  AlertCircle,
  Star,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/MovieCard';
import CollectionCard from '../components/CollectionCard';
import MovieDetailModal from '../components/MovieDetailModal';
import TrailerModal from '../components/TrailerModal';
import '../components/MovieGrid.css';
import './WatchlistPage.css';

const STARTER_COLLECTIONS = [
  'Weekend Watchlist',
  'Best Sci-Fi',
  'Movies to Rewatch',
  'Christopher Nolan Films',
];

export default function WatchlistPage() {
  const navigate = useNavigate();
  const {
    watchlist,
    removeFromWatchlist,
    isWatched,
    getPersonalRating,
    collections,
    createCollection,
    renameCollection,
    deleteCollection,
    removeMovieFromCollection,
    getCollectionMovies,
    libraryStats,
  } = useWatchlist();

  // ── Navigation & Tabs ──────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'collections'
  const [activeCollectionId, setActiveCollectionId] = useState(null);

  // ── Filters & Search within Saved Films ────────────────────────
  const [watchedFilter, setWatchedFilter] = useState('all'); // 'all' | 'unwatched' | 'watched'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'title' | 'tmdb' | 'personal' | 'year'

  // ── Modals & Dialogs ───────────────────────────────────────────
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [createError, setCreateError] = useState('');

  const [renameTargetCol, setRenameTargetCol] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');

  const [deleteTargetCol, setDeleteTargetCol] = useState(null);

  function handleMovieClick(movie) {
    navigate(`/movie/${movie.id}`);
  }

  // ── Filtered and Sorted Saved Movies ───────────────────────────
  const displayedSavedMovies = useMemo(() => {
    let result = [...watchlist];

    // 1. Watched status filter
    if (watchedFilter === 'watched') {
      result = result.filter((m) => isWatched(m.id));
    } else if (watchedFilter === 'unwatched') {
      result = result.filter((m) => !isWatched(m.id));
    }

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.overview?.toLowerCase().includes(q)
      );
    }

    // 3. Sorting
    switch (sortBy) {
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'tmdb':
        result.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'personal':
        result.sort((a, b) => {
          const rA = getPersonalRating(a.id) ?? -1;
          const rB = getPersonalRating(b.id) ?? -1;
          return rB - rA;
        });
        break;
      case 'year':
        result.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
        break;
      case 'recent':
      default:
        // Already in order of addition (recent first)
        break;
    }

    return result;
  }, [watchlist, watchedFilter, searchQuery, sortBy, isWatched, getPersonalRating]);

  // ── Collection Handlers ────────────────────────────────────────
  const activeCollection = useMemo(() => {
    if (!activeCollectionId) return null;
    return collections.find((c) => c.id === activeCollectionId) || null;
  }, [activeCollectionId, collections]);

  const activeCollectionMovies = useMemo(() => {
    if (!activeCollectionId) return [];
    return getCollectionMovies(activeCollectionId);
  }, [activeCollectionId, getCollectionMovies]);

  function handleCreateCollectionSubmit(e) {
    e.preventDefault();
    setCreateError('');
    const res = createCollection(newColName);
    if (!res.success) {
      setCreateError(res.error);
      return;
    }
    setNewColName('');
    setCreateModalOpen(false);
  }

  function handleQuickCreateStarter(name) {
    createCollection(name);
  }

  function handleOpenRenameModal(col) {
    setRenameTargetCol(col);
    setRenameValue(col.name);
    setRenameError('');
  }

  function handleRenameSubmit(e) {
    e.preventDefault();
    if (!renameTargetCol) return;
    setRenameError('');
    const res = renameCollection(renameTargetCol.id, renameValue);
    if (!res.success) {
      setRenameError(res.error);
      return;
    }
    setRenameTargetCol(null);
    setRenameValue('');
  }

  function handleDeletePrompt(col) {
    setDeleteTargetCol(col);
  }

  function handleConfirmDelete() {
    if (!deleteTargetCol) return;
    deleteCollection(deleteTargetCol.id);
    if (activeCollectionId === deleteTargetCol.id) {
      setActiveCollectionId(null);
    }
    setDeleteTargetCol(null);
  }

  const watchedPercentage = watchlist.length > 0
    ? Math.round((libraryStats.savedWatchedCount / watchlist.length) * 100)
    : 0;

  return (
    <div className="page">
      <div className="page-content">
        {/* Header */}
        <header className="library-page-header">
          <div className="library-header-main">
            <div>
              <h1 className="library-title font-heading">
                Personal Cinema Library
              </h1>
              <p className="library-subtitle">
                Organize your saved films, track viewing history, and curate custom cinema collections.
              </p>
            </div>

            {/* Concise Summary Strip */}
            <div className="library-stats-strip" role="region" aria-label="Library summary">
              <div className="library-stat-pill accent" title="Total saved in watchlist">
                <Bookmark size={14} />
                <span>Saved:</span>
                <span className="stat-num">{libraryStats.totalSaved}</span>
              </div>
              <div className="library-stat-pill" title="Total unique films marked as watched in your personal viewing history">
                <CheckCircle2 size={14} color="var(--accent)" />
                <span>Watched:</span>
                <span className="stat-num">{libraryStats.watchedCount}</span>
                {watchlist.length > 0 && (
                  <span className="stat-percentage">({watchedPercentage}%)</span>
                )}
              </div>
              <div className="library-stat-pill" title="Unwatched films in queue">
                <Circle size={14} />
                <span>In Queue:</span>
                <span className="stat-num">{libraryStats.savedUnwatchedCount ?? libraryStats.unwatchedCount}</span>
              </div>
              <div className="library-stat-pill" title="Custom collections">
                <Folder size={14} />
                <span>Collections:</span>
                <span className="stat-num">{libraryStats.collectionsCount}</span>
              </div>
              {libraryStats.ratedCount > 0 && (
                <div className="library-stat-pill amber" title="Films with personal rating">
                  <Star size={14} fill="currentColor" />
                  <span>Rated:</span>
                  <span className="stat-num">{libraryStats.ratedCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Nav Tabs: Saved Films vs Custom Collections */}
          <nav className="library-nav-tabs" role="tablist" aria-label="Library sections">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'saved'}
              aria-controls="saved-films-tab"
              className={`library-tab-btn${activeTab === 'saved' ? ' active' : ''}`}
              onClick={() => {
                setActiveTab('saved');
                setActiveCollectionId(null);
              }}
            >
              <Bookmark size={15} />
              <span>Saved Films</span>
              <span className="library-tab-badge">{watchlist.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'collections'}
              aria-controls="custom-collections-tab"
              className={`library-tab-btn${activeTab === 'collections' ? ' active' : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              <Folder size={15} />
              <span>Custom Collections</span>
              <span className="library-tab-badge">{collections.length}</span>
            </button>
          </nav>
        </header>

        {/* ── TAB 1: SAVED FILMS ─────────────────────────────────── */}
        {activeTab === 'saved' && (
          <section id="saved-films-tab" role="tabpanel" aria-label="Saved Films">
            {/* Toolbar: Watched filter pills + Search + Sort */}
            <div className="library-toolbar">
              {/* Filter pills */}
              <div className="library-filter-pills" role="radiogroup" aria-label="Filter by watched status">
                <button
                  type="button"
                  role="radio"
                  aria-checked={watchedFilter === 'all'}
                  className={`library-filter-pill${watchedFilter === 'all' ? ' active' : ''}`}
                  onClick={() => setWatchedFilter('all')}
                >
                  All
                  <span className="library-filter-count">({watchlist.length})</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={watchedFilter === 'unwatched'}
                  className={`library-filter-pill${watchedFilter === 'unwatched' ? ' active' : ''}`}
                  onClick={() => setWatchedFilter('unwatched')}
                >
                  <Circle size={12} />
                  Unwatched
                  <span className="library-filter-count">({libraryStats.savedUnwatchedCount ?? 0})</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={watchedFilter === 'watched'}
                  className={`library-filter-pill${watchedFilter === 'watched' ? ' active' : ''}`}
                  onClick={() => setWatchedFilter('watched')}
                >
                  <CheckCircle2 size={12} />
                  Watched
                  <span className="library-filter-count">({libraryStats.savedWatchedCount ?? 0})</span>
                </button>
              </div>

              {/* Search + Sort */}
              <div className="library-tools-right">
                {/* Search in saved */}
                <div className="library-search-box">
                  <Search size={14} aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Filter saved films…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Filter saved films by title or keyword"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="library-search-clear"
                      onClick={() => setSearchQuery('')}
                      aria-label="Clear search filter"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="library-sort-select">
                  <SlidersHorizontal size={13} aria-hidden="true" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort saved films"
                  >
                    <option value="recent">Recently Saved</option>
                    <option value="title">Title (A–Z)</option>
                    <option value="tmdb">TMDB Rating (High)</option>
                    <option value="personal">Personal Rating (High)</option>
                    <option value="year">Release Year (Newest)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty states */}
            {watchlist.length === 0 && (
              <div className="empty-state library-empty-state">
                <Film size={48} strokeWidth={1} />
                <h3 className="font-heading">Your personal library is empty</h3>
                <p>
                  Explore cinema on FRAME and click Save to build your library.
                  You can track watched history, create collections, and record personal ratings.
                </p>
                <Link to="/discover" className="btn btn-primary" style={{ marginTop: 8 }}>
                  Discover Films
                </Link>
              </div>
            )}

            {watchlist.length > 0 && displayedSavedMovies.length === 0 && (
              <div className="empty-state library-empty-state">
                <AlertCircle size={40} strokeWidth={1.2} />
                <h3 className="font-heading">
                  {searchQuery
                    ? `No films match "${searchQuery}"`
                    : watchedFilter === 'watched'
                      ? 'No watched films yet'
                      : 'You have watched all saved films!'}
                </h3>
                <p>
                  {searchQuery
                    ? 'Try adjusting your search query or clear the filter to view all saved films.'
                    : watchedFilter === 'watched'
                      ? 'Mark films as watched from the More menu or movie detail page.'
                      : 'Add new discoveries from the cinema catalog to build up your unwatched queue.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

            {/* Movie Grid: Notice context="watchlist" gives every saved movie the prominent Remove action */}
            {displayedSavedMovies.length > 0 && (
              <div className="movie-grid" role="list" aria-label="Saved films">
                {displayedSavedMovies.map((movie) => (
                  <div key={movie.id} role="listitem">
                    <MovieCard
                      movie={movie}
                      onClick={handleMovieClick}
                      context="watchlist"
                      onRemove={() => removeFromWatchlist(movie.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB 2: CUSTOM COLLECTIONS ──────────────────────────── */}
        {activeTab === 'collections' && (
          <section id="custom-collections-tab" role="tabpanel" aria-label="Custom Collections">
            {/* If browsing a single collection */}
            {activeCollection ? (
              <div className="collection-view">
                <div className="collection-view-header">
                  <button
                    type="button"
                    className="collection-back-btn"
                    onClick={() => setActiveCollectionId(null)}
                    aria-label="Back to all collections"
                  >
                    <ArrowLeft size={16} />
                    Back to All Collections
                  </button>

                  <div className="collection-view-top">
                    <div>
                      <div className="collection-view-title-wrap">
                        <h2 className="collection-view-title font-heading">
                          {activeCollection.name}
                        </h2>
                        <button
                          type="button"
                          className="collection-rename-btn"
                          onClick={() => handleOpenRenameModal(activeCollection)}
                          aria-label={`Rename ${activeCollection.name} collection`}
                          title="Rename collection"
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>

                      <div className="collection-view-meta">
                        <span>
                          {activeCollectionMovies.length}{' '}
                          {activeCollectionMovies.length === 1 ? 'film' : 'films'}
                        </span>
                        <span>·</span>
                        <span>
                          Created{' '}
                          {new Date(activeCollection.createdAt).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="collection-view-actions">
                      <button
                        type="button"
                        className="collection-delete-btn"
                        onClick={() => handleDeletePrompt(activeCollection)}
                        aria-label={`Delete ${activeCollection.name} collection`}
                      >
                        <Trash2 size={14} />
                        Delete Collection
                      </button>
                    </div>
                  </div>
                </div>

                {/* Movies inside this collection */}
                {activeCollectionMovies.length === 0 ? (
                  <div className="empty-state library-empty-state">
                    <Folder size={48} strokeWidth={1} />
                    <h3 className="font-heading">This collection is empty</h3>
                    <p>
                      Add films to <strong>"{activeCollection.name}"</strong> by selecting "Add to Collection" from the More menu on any movie card or detail view.
                    </p>
                    <Link to="/discover" className="btn btn-primary" style={{ marginTop: 8 }}>
                      Discover Movies to Add
                    </Link>
                  </div>
                ) : (
                  <div className="movie-grid" role="list" aria-label={`Films in ${activeCollection.name}`}>
                    {activeCollectionMovies.map((movie) => (
                      <div key={movie.id} role="listitem">
                        <MovieCard
                          movie={movie}
                          onClick={handleMovieClick}
                          context="collection"
                          onRemove={() => removeMovieFromCollection(activeCollection.id, movie.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* If viewing all collections */
              <div>
                <div className="collections-header-bar">
                  <div>
                    <h2 className="collections-header-title font-heading">
                      Your Curated Collections
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Group films by directors, mood, themes, or viewing queues.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setCreateError('');
                      setNewColName('');
                      setCreateModalOpen(true);
                    }}
                  >
                    <FolderPlus size={16} />
                    New Collection
                  </button>
                </div>

                {/* Empty State for Collections */}
                {collections.length === 0 ? (
                  <div className="empty-state library-empty-state">
                    <FolderPlus size={48} strokeWidth={1} />
                    <h3 className="font-heading">No custom collections yet</h3>
                    <p>
                      Organize your cinema into themes, director marathons, or weekend watchlists.
                      Create your first collection below:
                    </p>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setCreateError('');
                        setNewColName('');
                        setCreateModalOpen(true);
                      }}
                      style={{ marginTop: 10 }}
                    >
                      <FolderPlus size={16} />
                      Create Collection
                    </button>

                    {/* Quick suggestion chips */}
                    <div className="collection-suggestions">
                      {STARTER_COLLECTIONS.map((name) => (
                        <button
                          key={name}
                          type="button"
                          className="collection-suggestion-chip"
                          onClick={() => handleQuickCreateStarter(name)}
                          aria-label={`Create collection named ${name}`}
                        >
                          + "{name}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="collections-grid">
                    {collections.map((col) => (
                      <CollectionCard
                        key={col.id}
                        collection={col}
                        onOpen={(target) => setActiveCollectionId(target.id)}
                        onRename={handleOpenRenameModal}
                        onDelete={handleDeletePrompt}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ── CREATE COLLECTION DIALOG ─────────────────────────────── */}
      {createModalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setCreateModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-col-title"
        >
          <div className="library-dialog-modal">
            <h3 id="create-col-title" className="library-dialog-title font-heading">
              Create New Collection
            </h3>
            <p className="library-dialog-desc">
              Enter a name for your custom collection (e.g., "Christopher Nolan Films", "Weekend Watchlist").
            </p>

            <form onSubmit={handleCreateCollectionSubmit}>
              <input
                type="text"
                className="library-dialog-input"
                placeholder="Collection name..."
                value={newColName}
                onChange={(e) => {
                  setNewColName(e.target.value);
                  if (createError) setCreateError('');
                }}
                autoFocus
                maxLength={60}
                aria-label="Collection name"
              />

              {createError && (
                <div style={{ color: '#ff8080', fontSize: '0.8125rem', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} />
                  <span>{createError}</span>
                </div>
              )}

              <div className="library-dialog-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newColName.trim()}
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RENAME COLLECTION DIALOG ─────────────────────────────── */}
      {renameTargetCol && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setRenameTargetCol(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-col-title"
        >
          <div className="library-dialog-modal">
            <h3 id="rename-col-title" className="library-dialog-title font-heading">
              Rename Collection
            </h3>
            <p className="library-dialog-desc">
              Update the name for <strong>"{renameTargetCol.name}"</strong>.
            </p>

            <form onSubmit={handleRenameSubmit}>
              <input
                type="text"
                className="library-dialog-input"
                placeholder="New collection name..."
                value={renameValue}
                onChange={(e) => {
                  setRenameValue(e.target.value);
                  if (renameError) setRenameError('');
                }}
                autoFocus
                maxLength={60}
                aria-label="New collection name"
              />

              {renameError && (
                <div style={{ color: '#ff8080', fontSize: '0.8125rem', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} />
                  <span>{renameError}</span>
                </div>
              )}

              <div className="library-dialog-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setRenameTargetCol(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!renameValue.trim() || renameValue.trim() === renameTargetCol.name}
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE COLLECTION CONFIRMATION DIALOG ────────────────── */}
      {deleteTargetCol && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setDeleteTargetCol(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-col-title"
        >
          <div className="library-dialog-modal">
            <h3 id="delete-col-title" className="library-dialog-title font-heading" style={{ color: '#ff8080' }}>
              Delete Collection?
            </h3>
            <p className="library-dialog-desc">
              Are you sure you want to delete <strong>"{deleteTargetCol.name}"</strong>?
              {deleteTargetCol.movieIds.length > 0 && (
                <span> It currently contains {deleteTargetCol.movieIds.length} {deleteTargetCol.movieIds.length === 1 ? 'film' : 'films'}.</span>
              )}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Note: Deleting this collection will <strong>not</strong> delete its movies from your saved watchlist or remove any personal ratings or notes.
            </p>

            <div className="library-dialog-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDeleteTargetCol(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={14} />
                Delete Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fallback modals for movie detail & trailer */}
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
    </div>
  );
}
