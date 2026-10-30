// src/lib/tmdb.js
// ─────────────────────────────────────────────────────────────────────────────
// All TMDB API interactions live here. Components never fetch directly.
// Falls back to sample data when VITE_TMDB_API_KEY is absent.
// ─────────────────────────────────────────────────────────────────────────────

import { SAMPLE_MOVIES, enrichSampleMovie } from './sampleData';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const hasApiKey = Boolean(API_KEY && API_KEY !== 'your_tmdb_api_key_here');

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildUrl(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  });
  return url.toString();
}

async function get(path, params = {}) {
  const res = await fetch(buildUrl(path, params));
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function fetchTrending(timeWindow = 'week') {
  const data = await get(`/trending/movie/${timeWindow}`);
  return data.results;
}

export async function fetchPopular(page = 1) {
  const data = await get('/movie/popular', { page });
  return { results: data.results, totalPages: Math.min(data.total_pages, 500) };
}

export async function fetchTopRated(page = 1) {
  const data = await get('/movie/top_rated', { page });
  return { results: data.results, totalPages: Math.min(data.total_pages, 500) };
}

export async function fetchNowPlaying(page = 1) {
  const data = await get('/movie/now_playing', { page });
  return { results: data.results, totalPages: Math.min(data.total_pages, 500) };
}

export async function searchMovies(query, page = 1) {
  const data = await get('/search/movie', { query, page });
  return { results: data.results, totalPages: Math.min(data.total_pages, 500) };
}

export async function fetchMovieDetails(id) {
  const numId = Number(id);
  if (!hasApiKey) {
    const sample = SAMPLE_MOVIES.find((m) => m.id === numId || String(m.id) === String(id));
    if (sample) return enrichSampleMovie(sample);
    throw new Error('Movie not found in offline catalog');
  }

  try {
    return await get(`/movie/${id}`, { append_to_response: 'credits,videos,similar' });
  } catch (err) {
    const sample = SAMPLE_MOVIES.find((m) => m.id === numId || String(m.id) === String(id));
    if (sample) return enrichSampleMovie(sample);
    throw err;
  }
}

export async function fetchGenres() {
  const data = await get('/genre/movie/list');
  return data.genres;
}

export async function fetchByGenre(genreId, page = 1, sortBy = 'popularity.desc') {
  const data = await get('/discover/movie', { with_genres: genreId, page, sort_by: sortBy });
  return { results: data.results, totalPages: Math.min(data.total_pages, 500) };
}

// ── Image helpers ─────────────────────────────────────────────────────────────
export function posterUrl(path, size = 'w500') {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${IMAGE_BASE}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

export function backdropUrl(path, size = 'original') {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${IMAGE_BASE}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

