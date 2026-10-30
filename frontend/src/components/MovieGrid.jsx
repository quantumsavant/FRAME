import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import './MovieGrid.css';

// Skeleton loader for individual card
function CardSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton movie-grid__skeleton-poster" />
      <div className="skeleton movie-grid__skeleton-title" />
      <div className="skeleton movie-grid__skeleton-meta" />
    </div>
  );
}

export default function MovieGrid({
  movies,
  loading,
  onMovieClick,
  page,
  totalPages,
  onPageChange,
  skeletonCount = 12,
}) {
  if (loading) {
    return (
      <div className="movie-grid" aria-busy="true" aria-label="Loading movies">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="movie-grid" role="list" aria-label="Movies">
        {movies.map((movie) => (
          <div key={movie.id} role="listitem">
            <MovieCard movie={movie} onClick={onMovieClick} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <nav className="pagination" aria-label="Page navigation">
          <button
            className="pagination__btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={15} aria-hidden="true" />
            Prev
          </button>

          <span className="pagination__info" aria-live="polite" aria-atomic="true">
            {page} / {totalPages}
          </span>

          <button
            className="pagination__btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
          >
            Next
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        </nav>
      )}
    </>
  );
}
