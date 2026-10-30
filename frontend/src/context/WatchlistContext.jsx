// src/context/WatchlistContext.jsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const WatchlistContext = createContext(null);

const STORAGE_KEY_WATCHLIST = 'frame_watchlist';
const STORAGE_KEY_META = 'frame_library_meta';
const STORAGE_KEY_COLLECTIONS = 'frame_collections';

/**
 * Defensive sanitizer for saved watchlist array
 */
function sanitizeWatchlist(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const list = [];
  for (const item of raw) {
    if (item && typeof item === 'object' && item.id != null) {
      const id = String(item.id).trim();
      if (!seen.has(id)) {
        seen.add(id);
        list.push(item);
      }
    }
  }
  return list;
}

/**
 * Defensive sanitizer for personal library metadata
 * Supports object dictionaries, boolean maps, and arrays of IDs or items
 */
function sanitizeLibraryMeta(raw) {
  if (!raw) return {};
  const clean = {};

  function parseEntry(idStr, val) {
    const id = String(idStr).trim();
    if (!id) return;

    if (typeof val === 'boolean') {
      clean[id] = {
        watched: val,
        watchedAt: val ? new Date().toISOString() : null,
        personalRating: null,
        personalNote: '',
        noteUpdatedAt: null,
        movieSummary: null,
      };
      return;
    }

    if (val === 'watched' || val === 'true' || val === 1) {
      clean[id] = {
        watched: true,
        watchedAt: new Date().toISOString(),
        personalRating: null,
        personalNote: '',
        noteUpdatedAt: null,
        movieSummary: null,
      };
      return;
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const personalRating =
        typeof val.personalRating === 'number' &&
        !isNaN(val.personalRating) &&
        val.personalRating >= 0.5 &&
        val.personalRating <= 10
          ? Math.round(val.personalRating * 2) / 2
          : null;

      const isWatched = Boolean(
        val.watched === true ||
        val.watched === 'true' ||
        val.watched === 1 ||
        val.isWatched === true ||
        val.isWatched === 'true' ||
        val.status === 'watched'
      );

      clean[id] = {
        watched: isWatched,
        watchedAt:
          typeof val.watchedAt === 'string'
            ? val.watchedAt
            : isWatched
              ? new Date().toISOString()
              : null,
        personalRating,
        personalNote: typeof val.personalNote === 'string' ? val.personalNote : '',
        noteUpdatedAt: typeof val.noteUpdatedAt === 'string' ? val.noteUpdatedAt : null,
        movieSummary:
          val.movieSummary && typeof val.movieSummary === 'object' && val.movieSummary.id != null
            ? {
                id: val.movieSummary.id,
                title: val.movieSummary.title || 'Untitled Film',
                poster_path: val.movieSummary.poster_path || null,
                backdrop_path: val.movieSummary.backdrop_path || null,
                release_date: val.movieSummary.release_date || '',
                vote_average: val.movieSummary.vote_average ?? null,
                overview: val.movieSummary.overview || '',
              }
            : null,
      };
    }
  }

  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (item == null) continue;
      if (typeof item === 'string' || typeof item === 'number') {
        parseEntry(item, true);
      } else if (typeof item === 'object') {
        const id = item.id ?? item.movieId;
        if (id != null) {
          parseEntry(id, item);
        }
      }
    }
  } else if (typeof raw === 'object') {
    for (const [key, val] of Object.entries(raw)) {
      parseEntry(key, val);
    }
  }

  return clean;
}

/**
 * Defensive sanitizer for custom collections
 */
function sanitizeCollections(raw) {
  if (!Array.isArray(raw)) return [];
  const seenIds = new Set();
  const list = [];
  for (const col of raw) {
    if (col && typeof col === 'object' && col.id && typeof col.name === 'string') {
      const id = String(col.id);
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const movieIds = Array.isArray(col.movieIds)
          ? Array.from(new Set(col.movieIds.filter((mid) => mid != null).map((mid) => String(mid))))
          : [];
        list.push({
          id,
          name: col.name.trim(),
          createdAt: typeof col.createdAt === 'string' ? col.createdAt : new Date().toISOString(),
          movieIds,
        });
      }
    }
  }
  return list;
}

export function WatchlistProvider({ children }) {
  // ── 1. Watchlist (movies saved by user) ─────────────────────────
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      return stored ? sanitizeWatchlist(JSON.parse(stored)) : [];
    } catch {
      return [];
    }
  });

  // ── 2. Library Metadata (watched status, ratings, notes) ────────
  const [libraryMeta, setLibraryMeta] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_META);
      const meta = stored ? sanitizeLibraryMeta(JSON.parse(stored)) : {};

      // Seed any watched items from stored watchlist if not already in libraryMeta
      const storedWl = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      if (storedWl) {
        const wl = sanitizeWatchlist(JSON.parse(storedWl));
        for (const m of wl) {
          if (m && m.id != null) {
            const id = String(m.id).trim();
            const hasWatchedFlag = Boolean(m.watched === true || m.watched === 'true' || m.isWatched === true);
            if (hasWatchedFlag && !meta[id]?.watched) {
              meta[id] = {
                ...(meta[id] || {}),
                watched: true,
                watchedAt: meta[id]?.watchedAt || new Date().toISOString(),
                movieSummary: meta[id]?.movieSummary || {
                  id: m.id,
                  title: m.title || 'Untitled Film',
                  poster_path: m.poster_path || null,
                  backdrop_path: m.backdrop_path || null,
                  release_date: m.release_date || '',
                  vote_average: m.vote_average ?? null,
                  overview: m.overview || '',
                },
              };
            }
          }
        }
      }
      return meta;
    } catch {
      return {};
    }
  });

  // ── 3. Custom Collections ───────────────────────────────────────
  const [collections, setCollections] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COLLECTIONS);
      return stored ? sanitizeCollections(JSON.parse(stored)) : [];
    } catch {
      return [];
    }
  });

  // ── Sync to localStorage ───────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(watchlist));
    } catch {
      // Storage quota or private mode fallback
    }
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(libraryMeta));
    } catch {
      // Storage quota or private mode fallback
    }
  }, [libraryMeta]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COLLECTIONS, JSON.stringify(collections));
    } catch {
      // Storage quota or private mode fallback
    }
  }, [collections]);

  // Helper: Cache movie summary into libraryMeta so collections & logs can display it
  const cacheMovieSummary = useCallback((movie) => {
    if (!movie || movie.id == null) return;
    const id = String(movie.id).trim();
    setLibraryMeta((prev) => {
      const existing = prev[id] || {};
      if (existing.movieSummary && existing.movieSummary.title === movie.title) {
        return prev;
      }
      return {
        ...prev,
        [id]: {
          ...existing,
          movieSummary: {
            id: movie.id,
            title: movie.title || 'Untitled Film',
            poster_path: movie.poster_path || null,
            backdrop_path: movie.backdrop_path || null,
            release_date: movie.release_date || '',
            vote_average: movie.vote_average ?? null,
            overview: movie.overview || '',
          },
        },
      };
    });
  }, []);

  // ── Watchlist actions ──────────────────────────────────────────
  const addToWatchlist = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return;
      const movieId = String(movie.id).trim();
      setWatchlist((prev) => {
        if (prev.some((m) => String(m.id).trim() === movieId)) return prev;
        return [movie, ...prev];
      });
      cacheMovieSummary(movie);
    },
    [cacheMovieSummary]
  );

  const removeFromWatchlist = useCallback((movieId) => {
    if (movieId == null) return;
    const id = String(movieId).trim();
    setWatchlist((prev) => prev.filter((m) => String(m.id).trim() !== id));
  }, []);

  const isInWatchlist = useCallback(
    (movieId) => {
      if (movieId == null) return false;
      const id = String(movieId).trim();
      return watchlist.some((m) => String(m.id).trim() === id);
    },
    [watchlist]
  );

  const toggleWatchlist = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return;
      if (isInWatchlist(movie.id)) {
        removeFromWatchlist(movie.id);
      } else {
        addToWatchlist(movie);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  // ── Watched Status actions ─────────────────────────────────────
  const isWatched = useCallback(
    (movieId) => {
      if (movieId == null) return false;
      const id = String(movieId).trim();
      if (!id) return false;
      const meta = libraryMeta[id];
      if (meta && (meta.watched === true || meta.watched === 'true' || meta.watched === 1)) {
        return true;
      }
      const foundInWatchlist = watchlist.find((m) => m && String(m.id).trim() === id);
      if (
        foundInWatchlist &&
        (foundInWatchlist.watched === true ||
          foundInWatchlist.watched === 'true' ||
          foundInWatchlist.isWatched === true)
      ) {
        return true;
      }
      return false;
    },
    [libraryMeta, watchlist]
  );

  const setWatched = useCallback((movieId, watched, movieSummary = null) => {
    if (movieId == null) return;
    const id = String(movieId).trim();
    if (!id) return;
    const isW = Boolean(watched);
    setLibraryMeta((prev) => {
      const existing = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...existing,
          watched: isW,
          watchedAt: isW ? existing.watchedAt || new Date().toISOString() : null,
          movieSummary:
            movieSummary || existing.movieSummary || (movieSummary?.id != null ? movieSummary : null),
        },
      };
    });
    setWatchlist((prev) =>
      prev.map((m) => (String(m.id).trim() === id ? { ...m, watched: isW } : m))
    );
  }, []);

  const toggleWatched = useCallback(
    (movieId, movieSummary = null) => {
      if (movieId == null) return;
      const id = String(movieId).trim();
      if (!id) return;
      setLibraryMeta((prev) => {
        const existing = prev[id] || {};
        const currentWatched = Boolean(
          existing.watched ||
          watchlist.find((m) => String(m.id).trim() === id)?.watched
        );
        const nextWatched = !currentWatched;
        return {
          ...prev,
          [id]: {
            ...existing,
            watched: nextWatched,
            watchedAt: nextWatched ? new Date().toISOString() : null,
            movieSummary:
              movieSummary || existing.movieSummary || (movieSummary?.id != null ? movieSummary : null),
          },
        };
      });
      setWatchlist((prev) =>
        prev.map((m) => {
          if (String(m.id).trim() === id) {
            return { ...m, watched: !m.watched };
          }
          return m;
        })
      );
    },
    [watchlist]
  );

  // ── Personal Ratings actions ───────────────────────────────────
  const getPersonalRating = useCallback(
    (movieId) => {
      if (movieId == null) return null;
      const id = String(movieId);
      return libraryMeta[id]?.personalRating ?? null;
    },
    [libraryMeta]
  );

  const setPersonalRating = useCallback((movieId, rating, movieSummary = null) => {
    if (movieId == null) return;
    const id = String(movieId);
    let val = null;
    if (rating != null && rating !== '') {
      const num = Number(rating);
      if (!isNaN(num) && num > 0) {
        val = Math.min(10, Math.max(0.5, Math.round(num * 2) / 2));
      }
    }
    setLibraryMeta((prev) => {
      const existing = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...existing,
          personalRating: val,
          movieSummary: movieSummary || existing.movieSummary || null,
        },
      };
    });
  }, []);

  // ── Personal Notes actions ─────────────────────────────────────
  const getPersonalNote = useCallback(
    (movieId) => {
      if (movieId == null) return '';
      const id = String(movieId);
      return libraryMeta[id]?.personalNote || '';
    },
    [libraryMeta]
  );

  const setPersonalNote = useCallback((movieId, note, movieSummary = null) => {
    if (movieId == null) return;
    const id = String(movieId);
    setLibraryMeta((prev) => {
      const existing = prev[id] || {};
      return {
        ...prev,
        [id]: {
          ...existing,
          personalNote: typeof note === 'string' ? note : '',
          noteUpdatedAt: new Date().toISOString(),
          movieSummary: movieSummary || existing.movieSummary || null,
        },
      };
    });
  }, []);

  const getMovieMeta = useCallback(
    (movieId) => {
      if (movieId == null) return { watched: false, personalRating: null, personalNote: '' };
      const id = String(movieId);
      return libraryMeta[id] || { watched: false, personalRating: null, personalNote: '' };
    },
    [libraryMeta]
  );

  // ── Custom Collections actions ─────────────────────────────────
  const createCollection = useCallback(
    (name) => {
      const trimmed = (name || '').trim();
      if (!trimmed) {
        return { success: false, error: 'Collection name cannot be empty.' };
      }
      if (collections.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
        return { success: false, error: `A collection named "${trimmed}" already exists.` };
      }
      const newCol = {
        id: `col_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: trimmed,
        createdAt: new Date().toISOString(),
        movieIds: [],
      };
      setCollections((prev) => [...prev, newCol]);
      return { success: true, collection: newCol };
    },
    [collections]
  );

  const renameCollection = useCallback(
    (collectionId, newName) => {
      const trimmed = (newName || '').trim();
      if (!trimmed) {
        return { success: false, error: 'Collection name cannot be empty.' };
      }
      if (
        collections.some(
          (c) => c.id !== collectionId && c.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        return { success: false, error: `A collection named "${trimmed}" already exists.` };
      }
      setCollections((prev) =>
        prev.map((c) => (c.id === collectionId ? { ...c, name: trimmed } : c))
      );
      return { success: true };
    },
    [collections]
  );

  const deleteCollection = useCallback((collectionId) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
    return { success: true };
  }, []);

  const addMovieToCollection = useCallback(
    (collectionId, movie) => {
      if (!movie || movie.id == null) return false;
      const movieId = String(movie.id);
      cacheMovieSummary(movie);
      setCollections((prev) =>
        prev.map((c) => {
          if (c.id !== collectionId) return c;
          if (c.movieIds.includes(movieId)) return c;
          return { ...c, movieIds: [...c.movieIds, movieId] };
        })
      );
      return true;
    },
    [cacheMovieSummary]
  );

  const removeMovieFromCollection = useCallback((collectionId, movieId) => {
    if (movieId == null) return;
    const id = String(movieId);
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        return { ...c, movieIds: c.movieIds.filter((mid) => mid !== id) };
      })
    );
  }, []);

  const toggleMovieInCollection = useCallback(
    (collectionId, movie) => {
      if (!movie || movie.id == null) return;
      const id = String(movie.id);
      const col = collections.find((c) => c.id === collectionId);
      if (col && col.movieIds.includes(id)) {
        removeMovieFromCollection(collectionId, id);
      } else {
        addMovieToCollection(collectionId, movie);
      }
    },
    [collections, removeMovieFromCollection, addMovieToCollection]
  );

  const isMovieInCollection = useCallback(
    (collectionId, movieId) => {
      if (movieId == null) return false;
      const id = String(movieId);
      const col = collections.find((c) => c.id === collectionId);
      return Boolean(col && col.movieIds.includes(id));
    },
    [collections]
  );

  const getMovieCollectionIds = useCallback(
    (movieId) => {
      if (movieId == null) return [];
      const id = String(movieId);
      return collections.filter((c) => c.movieIds.includes(id)).map((c) => c.id);
    },
    [collections]
  );

  const getMovieCollections = useCallback(
    (movieId) => {
      if (movieId == null) return [];
      const id = String(movieId);
      return collections.filter((c) => c.movieIds.includes(id));
    },
    [collections]
  );

  const getMovieById = useCallback(
    (movieId) => {
      if (movieId == null) return null;
      const id = String(movieId);
      const foundInWatchlist = watchlist.find((m) => String(m.id) === id);
      if (foundInWatchlist) return foundInWatchlist;
      if (libraryMeta[id]?.movieSummary) return libraryMeta[id].movieSummary;
      return null;
    },
    [watchlist, libraryMeta]
  );

  const getCollectionMovies = useCallback(
    (collectionId) => {
      const col = collections.find((c) => c.id === collectionId);
      if (!col) return [];
      return col.movieIds
        .map((id) => getMovieById(id))
        .filter(Boolean);
    },
    [collections, getMovieById]
  );

  // ── Aggregate Library Stats ────────────────────────────────────
  const libraryStats = useMemo(() => {
    // 1. Gather all unique watched IDs from libraryMeta and watchlist
    const watchedIds = new Set();
    for (const [key, val] of Object.entries(libraryMeta)) {
      if (val && (val.watched === true || val.watched === 'true' || val.watched === 1)) {
        watchedIds.add(String(key).trim());
      }
    }
    for (const movie of watchlist) {
      if (movie && movie.id != null) {
        const mid = String(movie.id).trim();
        if (movie.watched === true || movie.watched === 'true' || movie.isWatched === true) {
          watchedIds.add(mid);
        }
      }
    }

    const totalSaved = watchlist.length;

    // How many saved movies currently in watchlist are watched?
    let savedWatchedCount = 0;
    for (const movie of watchlist) {
      if (movie && movie.id != null && watchedIds.has(String(movie.id).trim())) {
        savedWatchedCount += 1;
      }
    }
    const savedUnwatchedCount = Math.max(0, totalSaved - savedWatchedCount);

    // Global Watched statistic: total number of unique movies marked watched in personal viewing history
    const totalWatchedCount = watchedIds.size;
    const watchedCount = totalWatchedCount;
    const unwatchedCount = savedUnwatchedCount;
    const collectionsCount = collections.length;
    const ratedCount = Object.values(libraryMeta).filter((m) => m && m.personalRating != null).length;

    return {
      totalSaved,
      watchedCount,
      totalWatchedCount,
      savedWatchedCount,
      savedUnwatchedCount,
      unwatchedCount,
      collectionsCount,
      ratedCount,
    };
  }, [watchlist, libraryMeta, collections]);

  const value = useMemo(
    () => ({
      // Watchlist
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      toggleWatchlist,
      // Watched
      isWatched,
      setWatched,
      toggleWatched,
      // Ratings & Notes
      getPersonalRating,
      setPersonalRating,
      getPersonalNote,
      setPersonalNote,
      getMovieMeta,
      // Collections
      collections,
      createCollection,
      renameCollection,
      deleteCollection,
      addMovieToCollection,
      removeMovieFromCollection,
      toggleMovieInCollection,
      isMovieInCollection,
      getMovieCollectionIds,
      getMovieCollections,
      getMovieById,
      getCollectionMovies,
      // Stats
      libraryStats,
    }),
    [
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      isInWatchlist,
      toggleWatchlist,
      isWatched,
      setWatched,
      toggleWatched,
      getPersonalRating,
      setPersonalRating,
      getPersonalNote,
      setPersonalNote,
      getMovieMeta,
      collections,
      createCollection,
      renameCollection,
      deleteCollection,
      addMovieToCollection,
      removeMovieFromCollection,
      toggleMovieInCollection,
      isMovieInCollection,
      getMovieCollectionIds,
      getMovieCollections,
      getMovieById,
      getCollectionMovies,
      libraryStats,
    ]
  );

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
  return ctx;
}

// Convenient alias for components thinking in library terms
export const useLibrary = useWatchlist;

