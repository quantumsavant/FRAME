// src/lib/sampleData.js
// ─────────────────────────────────────────────────────────────────────────────
// Static fallback data shown when no TMDB API key is configured.
// These are real movies with authentic TMDB posters & backdrops.
// ─────────────────────────────────────────────────────────────────────────────

export const SAMPLE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

export const SAMPLE_MOVIES = [
  {
    id: 1,
    title: 'Dune: Part Two',
    overview:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    poster_path: 'https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/uhUO7vQQKvCTfQWubOt5MAKokbL.jpg',
    release_date: '2024-03-01',
    vote_average: 8.2,
    vote_count: 4800,
    genre_ids: [878, 12, 28],
    runtime: 166,
    tagline: 'Long live the fighters.',
  },
  {
    id: 2,
    title: 'Oppenheimer',
    overview:
      'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    poster_path: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg',
    release_date: '2023-07-21',
    vote_average: 8.3,
    vote_count: 9200,
    genre_ids: [18, 9648, 53],
    runtime: 180,
    tagline: 'The world forever changes.',
  },
  {
    id: 3,
    title: 'The Batman',
    overview:
      'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate.',
    poster_path: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/rvtdN5XkWAfGX6xDuPL6yYS2seK.jpg',
    release_date: '2022-03-04',
    vote_average: 7.8,
    vote_count: 11000,
    genre_ids: [28, 80, 9648],
    runtime: 176,
    tagline: 'Unmask the truth.',
  },
  {
    id: 4,
    title: 'Parasite',
    overview:
      'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    poster_path: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 17000,
    genre_ids: [18, 80, 53],
    runtime: 132,
    tagline: 'Act like you own the place.',
  },
  {
    id: 5,
    title: 'Everything Everywhere All at Once',
    overview:
      'A middle-aged Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes.',
    poster_path: 'https://image.tmdb.org/t/p/w500/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/fIwiFha3WPu5nHkBeMQ4GzEk0Hv.jpg',
    release_date: '2022-03-25',
    vote_average: 7.8,
    vote_count: 8100,
    genre_ids: [28, 35, 878],
    runtime: 139,
    tagline: 'The universe is so much bigger than you realize.',
  },
  {
    id: 6,
    title: 'Poor Things',
    overview:
      'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by an unorthodox scientist.',
    poster_path: 'https://image.tmdb.org/t/p/w500/kCGlIMHnOm8JPXq3rXM6c5wMxcT.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/bQS43HSLZzMjZkcHJz4fGc7fudo.jpg',
    release_date: '2023-12-08',
    vote_average: 8.0,
    vote_count: 5300,
    genre_ids: [35, 18, 10749],
    runtime: 141,
    tagline: 'She was always destined for great things.',
  },
  {
    id: 7,
    title: 'Killers of the Flower Moon',
    overview:
      'Members of the Osage Nation are murdered under mysterious circumstances in the 1920s, sparking a massive FBI investigation.',
    poster_path: 'https://image.tmdb.org/t/p/w500/dB6Krk806zeqd0YNp2ngQ9zXteH.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/acvE3RWjDLgvbL2RtcyzkrsAyNV.jpg',
    release_date: '2023-10-20',
    vote_average: 7.6,
    vote_count: 6200,
    genre_ids: [80, 18, 9648],
    runtime: 206,
    tagline: 'When oil was discovered in their land, the Osage Nation became the wealthiest people in the world.',
  },
  {
    id: 8,
    title: 'Interstellar',
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster_path: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/r2J02Z2OpNTctfOSN1Ydgii51I3.jpg',
    release_date: '2014-11-07',
    vote_average: 8.6,
    vote_count: 34000,
    genre_ids: [878, 12, 18],
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
  },
  {
    id: 9,
    title: 'The Grand Budapest Hotel',
    overview:
      "A writer encounters the owner of an aging European hotel and they recall the adventures of Gustave H., the hotel's legendary concierge.",
    poster_path: 'https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/7s1h0uFk8OcxL6R03U4F0s2v2p4.jpg',
    release_date: '2014-03-07',
    vote_average: 8.1,
    vote_count: 15000,
    genre_ids: [35, 80, 18],
    runtime: 100,
    tagline: 'A lobby boy is one of the most consequential roles in the entire operation.',
  },
  {
    id: 10,
    title: 'Arrival',
    overview:
      'A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.',
    poster_path: 'https://image.tmdb.org/t/p/w500/pEzNVQfdzYDzVK0XqxERIw2x2se.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/8MUZz7oPXQftFTslZpRP3CVMOoq.jpg',
    release_date: '2016-11-11',
    vote_average: 7.9,
    vote_count: 13000,
    genre_ids: [878, 18, 9648],
    runtime: 116,
    tagline: 'Why are they here?',
  },
  {
    id: 11,
    title: 'Mad Max: Fury Road',
    overview:
      'In a post-apocalyptic wasteland, Max teams with a mysterious woman to flee from a tyrant who commands an army of gear-head marauders.',
    poster_path: 'https://image.tmdb.org/t/p/w500/ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg',
    release_date: '2015-05-15',
    vote_average: 8.1,
    vote_count: 22000,
    genre_ids: [28, 12, 878],
    runtime: 120,
    tagline: 'What a lovely day.',
  },
  {
    id: 12,
    title: 'Hereditary',
    overview:
      'A grieving family is haunted by mysterious occurrences and a terrifying ancestral legacy after their elderly grandmother passes away.',
    poster_path: 'https://image.tmdb.org/t/p/w500/4GFPuL14eXi66V96xBWY73Y9PfR.jpg',
    backdrop_path: 'https://image.tmdb.org/t/p/w1280/5w9r210QW8eLzE2vY6WlE8y2d9F.jpg',
    release_date: '2018-06-08',
    vote_average: 7.3,
    vote_count: 9800,
    genre_ids: [27, 9648, 18],
    runtime: 127,
    tagline: 'Every family tree hides a secret.',
  },
];

// Derive hero movie from sample
export const SAMPLE_HERO = SAMPLE_MOVIES[0];

const SAMPLE_TRAILERS = {
  1: 'Way9Dexny3w',
  2: 'uYPbbksJxIg',
  3: 'mqqft2x_Aa4',
  4: 'zSWdZVtXT7E',
  5: 'cqGjhVJWtEg',
  6: 'gCcx85zbxz4',
  7: 'wxN1T1uxQ2g',
  8: '5xH0R_uie1U',
  9: 'giXco2JA17U',
  10: 'tFMo3UJ4B4g',
  11: 'hEJnMQGkowski',
  12: 'V6wWKNij_1M',
};

const SAMPLE_CAST_LISTS = {
  1: [
    { id: 201, name: 'Timothée Chalamet', character: 'Paul Atreides' },
    { id: 202, name: 'Zendaya', character: 'Chani' },
    { id: 203, name: 'Rebecca Ferguson', character: 'Lady Jessica' },
    { id: 204, name: 'Javier Bardem', character: 'Stilgar' },
    { id: 205, name: 'Austin Butler', character: 'Feyd-Rautha' },
    { id: 206, name: 'Florence Pugh', character: 'Princess Irulan' },
  ],
  2: [
    { id: 211, name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
    { id: 212, name: 'Emily Blunt', character: 'Katherine Oppenheimer' },
    { id: 213, name: 'Matt Damon', character: 'Leslie Groves' },
    { id: 214, name: 'Robert Downey Jr.', character: 'Lewis Strauss' },
    { id: 215, name: 'Florence Pugh', character: 'Jean Tatlock' },
  ],
  3: [
    { id: 221, name: 'Robert Pattinson', character: 'Bruce Wayne / Batman' },
    { id: 222, name: 'Zoë Kravitz', character: 'Selina Kyle / Catwoman' },
    { id: 223, name: 'Paul Dano', character: 'Edward Nashton / Riddler' },
    { id: 224, name: 'Jeffrey Wright', character: 'James Gordon' },
    { id: 225, name: 'Colin Farrell', character: 'Oswald Cobblepot / Penguin' },
  ],
};

const DEFAULT_SAMPLE_CAST = [
  { id: 301, name: 'Lead Performer', character: 'Protagonist' },
  { id: 302, name: 'Supporting Actor', character: 'Co-Star' },
  { id: 303, name: 'Featured Actor', character: 'Key Figure' },
];

export function enrichSampleMovie(sample) {
  const genres = (sample.genre_ids || []).map((gid) => {
    const found = SAMPLE_GENRES.find((g) => g.id === gid);
    return found || { id: gid, name: 'Cinema' };
  });

  const cast = SAMPLE_CAST_LISTS[sample.id] || DEFAULT_SAMPLE_CAST;
  const trailerKey = SAMPLE_TRAILERS[sample.id] || 'Way9Dexny3w';

  const popularity =
    sample.popularity != null
      ? sample.popularity
      : sample.vote_count
        ? Number((sample.vote_count / 120).toFixed(1))
        : 45.0;

  return {
    ...sample,
    popularity,
    genres,
    credits: {
      cast,
    },
    videos: {
      results: [
        {
          id: `sample-trailer-${sample.id}`,
          key: trailerKey,
          site: 'YouTube',
          type: 'Trailer',
        },
      ],
    },
  };
}

