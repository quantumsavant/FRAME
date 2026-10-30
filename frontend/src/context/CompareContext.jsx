/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const CompareContext = createContext(null);

const STORAGE_KEY = 'frame_compare_studio';
const MAX_COMPARE = 3;

/**
 * Safely parse and validate stored comparison movies
 */
function sanitizeCompareList(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item && typeof item === 'object' && item.id != null && item.title)
    .slice(0, MAX_COMPARE);
}

export function CompareProvider({ children }) {
  const [compareList, setCompareList] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return sanitizeCompareList(parsed);
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ id: Date.now(), message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList));
    } catch {
      // localStorage may fail in restricted/quota-exceeded environments
    }
  }, [compareList]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const isInCompare = useCallback(
    (movieId) => compareList.some((m) => String(m.id) === String(movieId)),
    [compareList]
  );

  const isCompareFull = compareList.length >= MAX_COMPARE;

  const addToCompare = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return false;

      if (compareList.some((m) => String(m.id) === String(movie.id))) {
        showToast(`"${movie.title}" is already in comparison`, 'info');
        return false;
      }

      if (compareList.length >= MAX_COMPARE) {
        showToast(`Comparison is full (max ${MAX_COMPARE} films). Remove one first.`, 'warning');
        return false;
      }

      setCompareList((prev) => [...prev, movie]);
      showToast(`Added "${movie.title}" to comparison (${compareList.length + 1}/${MAX_COMPARE})`, 'success');
      return true;
    },
    [compareList, showToast]
  );

  const removeFromCompare = useCallback(
    (movieId) => {
      setCompareList((prev) => {
        const found = prev.find((m) => String(m.id) === String(movieId));
        if (found) {
          showToast(`Removed "${found.title}" from comparison`, 'info');
        }
        return prev.filter((m) => String(m.id) !== String(movieId));
      });
    },
    [showToast]
  );

  const toggleCompare = useCallback(
    (movie) => {
      if (!movie || movie.id == null) return false;
      if (isInCompare(movie.id)) {
        removeFromCompare(movie.id);
        return false;
      } else {
        return addToCompare(movie);
      }
    },
    [isInCompare, addToCompare, removeFromCompare]
  );

  const clearCompare = useCallback(() => {
    setCompareList([]);
    showToast('Comparison studio cleared', 'info');
  }, [showToast]);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        maxCompare: MAX_COMPARE,
        isCompareFull,
        isInCompare,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        clearCompare,
        toast,
        dismissToast: () => setToast(null),
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
