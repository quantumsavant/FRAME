const assert = require('assert');

// Simulate the exact logic in WatchlistContext.jsx
function calculateLibraryStats(watchlist, libraryMeta, collections = []) {
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
}

// Test Suite
console.log('--- RUNNING LIBRARY STATS & FILTER TESTS ---');

// Test 1: Empty watchlist with 5 watched movies in personal history
{
  const watchlist = [];
  const libraryMeta = {
    '101': { watched: true, personalRating: 9 },
    '102': { watched: true, personalRating: 8 },
    '103': { watched: true },
    '104': { watched: true },
    '105': { watched: true },
  };

  const stats = calculateLibraryStats(watchlist, libraryMeta);
  console.log('Test 1 - Empty watchlist with 5 watched movies:', stats);

  // 1. Preserve global Watched statistic
  assert.strictEqual(stats.watchedCount, 5, 'Global watched count should be 5');
  assert.strictEqual(stats.totalWatchedCount, 5, 'totalWatchedCount should be 5');

  // 2. Saved films tab filter counts must all be zero
  const filterCounts = {
    all: watchlist.length,
    unwatched: stats.savedUnwatchedCount,
    watched: stats.savedWatchedCount,
  };
  assert.strictEqual(filterCounts.all, 0, 'Saved films All count should be 0');
  assert.strictEqual(filterCounts.unwatched, 0, 'Saved films Unwatched count should be 0');
  assert.strictEqual(filterCounts.watched, 0, 'Saved films Watched count should be 0');
  console.log('✓ Test 1 Passed: Global Watched = 5, Saved All = 0, Watched = 0, Unwatched = 0');
}

// Test 2: Watchlist with 4 movies (2 watched, 2 unwatched) + 3 watched movies outside watchlist (Total global watched: 5)
{
  let watchlist = [
    { id: 201, title: 'Movie A' }, // unwatched
    { id: 202, title: 'Movie B' }, // unwatched
    { id: 101, title: 'Movie 101' }, // watched (in libraryMeta)
    { id: 102, title: 'Movie 102' }, // watched (in libraryMeta)
  ];
  let libraryMeta = {
    '101': { watched: true },
    '102': { watched: true },
    '103': { watched: true },
    '104': { watched: true },
    '105': { watched: true },
  };

  let stats = calculateLibraryStats(watchlist, libraryMeta);
  console.log('Test 2 - 4 saved (2 watched), 5 total watched:', stats);

  assert.strictEqual(stats.totalSaved, 4, 'Total saved should be 4');
  assert.strictEqual(stats.watchedCount, 5, 'Global watched should be 5');
  assert.strictEqual(stats.savedWatchedCount, 2, 'Saved watched should be 2');
  assert.strictEqual(stats.savedUnwatchedCount, 2, 'Saved unwatched should be 2');

  // Test 3: Remove movie 101 from watchlist (Requirement 4: Watched history and watchlist membership independent)
  watchlist = watchlist.filter(m => m.id !== 101);
  stats = calculateLibraryStats(watchlist, libraryMeta);
  console.log('Test 3 - After removing movie 101 from watchlist:', stats);

  assert.strictEqual(stats.totalSaved, 3, 'Total saved should be 3');
  assert.strictEqual(stats.watchedCount, 5, 'Global watched should still be 5');
  assert.strictEqual(stats.savedWatchedCount, 1, 'Saved watched should now be 1 (only 102)');
  assert.strictEqual(stats.savedUnwatchedCount, 2, 'Saved unwatched should still be 2');
  console.log('✓ Test 2 & 3 Passed: Removing movie from watchlist does NOT erase watched history');
}

console.log('ALL STATS & FILTER LOGIC TESTS PASSED SUCCESSFULLY!');
