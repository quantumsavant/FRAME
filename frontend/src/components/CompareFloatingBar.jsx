import { useLocation, Link } from 'react-router-dom';
import { X, GitCompare, ArrowRight, AlertTriangle, CheckCircle, Info, Trash2 } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { posterUrl } from '../lib/tmdb';
import './CompareFloatingBar.css';

export default function CompareFloatingBar() {
  const { compareList, maxCompare, removeFromCompare, clearCompare, toast } = useCompare();
  const location = useLocation();

  const isComparePage = location.pathname === '/compare';
  const showDock = !isComparePage && compareList.length > 0;

  // Empty slots calculation
  const emptySlotsCount = Math.max(0, maxCompare - compareList.length);

  return (
    <>
      {/* Toast Notification (displayed anywhere) */}
      {toast && (
        <aside
          className={`compare-toast compare-toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.type === 'warning' && <AlertTriangle size={16} aria-hidden="true" />}
          {toast.type === 'success' && <CheckCircle size={16} aria-hidden="true" />}
          {toast.type === 'info' && <Info size={16} aria-hidden="true" />}
          <span>{toast.message}</span>
        </aside>
      )}

      {/* Floating Bottom Dock (hidden on /compare) */}
      {showDock && (
        <nav
          className="compare-dock"
          role="region"
          aria-label="Movie Comparison tray"
        >
          {/* Thumbnails of selected movies */}
          <div className="compare-dock__slots" aria-label="Selected movies for comparison">
            {compareList.map((movie) => {
              const poster = posterUrl(movie.poster_path, 'w185');
              return (
                <div key={movie.id} className="compare-dock__slot" title={movie.title}>
                  {poster ? (
                    <img src={poster} alt={movie.title} loading="lazy" />
                  ) : (
                    <div className="compare-dock__slot-fallback">
                      {movie.title.slice(0, 8)}
                    </div>
                  )}
                  <button
                    type="button"
                    className="compare-dock__remove-btn"
                    onClick={() => removeFromCompare(movie.id)}
                    aria-label={`Remove ${movie.title} from comparison`}
                    title="Remove"
                  >
                    <X size={10} aria-hidden="true" />
                  </button>
                </div>
              );
            })}

            {/* Empty placeholder slots */}
            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="compare-dock__slot-empty"
                title={`Empty comparison slot (${compareList.length + idx + 1}/${maxCompare})`}
              >
                +
              </div>
            ))}
          </div>

          {/* Tray info */}
          <div className="compare-dock__info">
            <span className="compare-dock__title">
              <GitCompare size={15} color="var(--accent)" aria-hidden="true" />
              <span className="compare-dock__text">Compare</span>
              <span className="compare-dock__badge">
                {compareList.length}/{maxCompare}
              </span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="compare-dock__actions">
            <Link
              to="/compare"
              className="compare-dock__cta"
              aria-label={`Open Comparison Studio with ${compareList.length} movies`}
            >
              <span>Studio</span>
              <ArrowRight size={13} aria-hidden="true" />
            </Link>

            <button
              type="button"
              className="compare-dock__clear-btn"
              onClick={clearCompare}
              aria-label="Clear all films from comparison"
              title="Clear all"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </>
  );
}
