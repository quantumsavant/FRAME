import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import './FilterBar.css';

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Top Rated' },
  { value: 'release_date.desc', label: 'Latest Release' },
  { value: 'vote_count.desc', label: 'Most Voted' },
];

export function FilterBar({ search, onSearch, sortBy, onSortChange }) {
  return (
    <div className="filter-bar" role="search" aria-label="Filter and sort movies">
      {/* Search */}
      <div className="filter-bar__search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search movies…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search movies by title"
        />
        {search && (
          <button
            className="filter-bar__search-clear"
            onClick={() => onSearch('')}
            aria-label="Clear search"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="filter-bar__select-wrap">
        <SlidersHorizontal size={14} aria-hidden="true" />
        <select
          className="filter-bar__select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          aria-label="Sort movies by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="filter-bar__chevron" aria-hidden="true" />
      </div>
    </div>
  );
}

export function GenreFilter({ genres, activeGenre, onGenreChange }) {
  return (
    <div className="genre-filter" role="group" aria-label="Filter by genre">
      <button
        className={`genre-filter__chip${activeGenre === null ? ' active' : ''}`}
        onClick={() => onGenreChange(null)}
        aria-pressed={activeGenre === null}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          className={`genre-filter__chip${activeGenre === genre.id ? ' active' : ''}`}
          onClick={() => onGenreChange(genre.id)}
          aria-pressed={activeGenre === genre.id}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
}
