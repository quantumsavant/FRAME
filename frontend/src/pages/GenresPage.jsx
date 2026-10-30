import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieGrid from '../components/MovieGrid';
import { GenreFilter } from '../components/FilterBar';
import MovieDetailModal from '../components/MovieDetailModal';
import TrailerModal from '../components/TrailerModal';
import { AlertCircle, Film } from 'lucide-react';
import { fetchByGenre, hasApiKey } from '../lib/tmdb';
import { SAMPLE_MOVIES, SAMPLE_GENRES } from '../lib/sampleData';

export default function GenresPage({ genreMap }) {
  const navigate = useNavigate();
  const genres = hasApiKey
    ? Object.entries(genreMap).map(([id, name]) => ({ id: Number(id), name }))
    : SAMPLE_GENRES;

  const [activeGenre, setActiveGenre] = useState(genres[0]?.id || null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);

  useEffect(() => {
    if (!activeGenre) return;
    if (!hasApiKey) {
      const id = setTimeout(() => {
        const results = SAMPLE_MOVIES.filter((m) =>
          (m.genre_ids || []).includes(activeGenre)
        );
        setMovies(results);
        setTotalPages(1);
        setLoading(false);
      }, 0);
      return () => clearTimeout(id);
    }

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    fetchByGenre(activeGenre, page, 'popularity.desc')
      .then(({ results, totalPages: tp }) => {
        if (!cancelled) {
          setMovies(results);
          setTotalPages(tp);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [activeGenre, page]);

  function handleGenreChange(id) {
    setActiveGenre(id);
    setPage(1);
  }

  function handleMovieClick(movie) {
    navigate(`/movie/${movie.id}`);
  }

  const activeGenreName = genres.find((g) => g.id === activeGenre)?.name || '';

  return (
    <div className="page">
      <div className="page-content">
        <div style={{ marginBottom: 36 }}>
          <h1 className="font-heading" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 8 }}>
            Browse by Genre
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Explore films across every genre.
          </p>
        </div>

        <GenreFilter
          genres={genres}
          activeGenre={activeGenre}
          onGenreChange={handleGenreChange}
        />

        {activeGenreName && (
          <div className="section-heading" style={{ marginTop: 32 }}>
            <h2 className="section-title">{activeGenreName}</h2>
          </div>
        )}

        {error && (
          <div className="error-state" role="alert">
            <AlertCircle size={32} strokeWidth={1.5} />
            <p>Failed to load: {error}</p>
          </div>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="empty-state">
            <Film size={40} strokeWidth={1} />
            <h3>No films found</h3>
            <p>There are no movies in this genre yet. Try another.</p>
          </div>
        )}

        {!error && (
          <MovieGrid
            movies={movies}
            loading={loading}
            onMovieClick={handleMovieClick}
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </div>

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
