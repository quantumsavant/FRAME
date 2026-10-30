import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Menu, Bookmark, Compass, Film, ChevronRight, GitCompare } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useCompare } from '../context/CompareContext';
import './Navbar.css';

const NAV_ITEMS = [
  { path: '/discover', label: 'Discover', icon: Compass },
  { path: '/genres', label: 'Genres', icon: Film },
  { path: '/watchlist', label: 'Watchlist', icon: Bookmark, badgeKey: 'watchlist' },
  { path: '/compare', label: 'Compare', icon: GitCompare, badgeKey: 'compare' },
];

export default function Navbar({ onSearch }) {
  const { watchlist } = useWatchlist();
  const { compareList } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Sync searchQuery with URL query parameter when on /discover
  useEffect(() => {
    if (location.pathname === '/discover') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchQuery(q);
      if (q) setSearchOpen(true);
    }
  }, [location.pathname, location.search]);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [location.pathname]);

  // Close search when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        if (!searchQuery) {
          closeSearch();
        }
      }
    }
    if (searchOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen, searchQuery]);

  function handleSearchChange(e) {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);

    if (val.trim()) {
      navigate(`/discover?q=${encodeURIComponent(val)}`);
    } else if (location.pathname === '/discover') {
      navigate('/discover');
    }
  }

  function handleSearchKeyDown(e) {
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        navigate(`/discover?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
    if (onSearch) onSearch('');
    if (location.pathname === '/discover' && location.search) {
      navigate('/discover');
    }
  }

  return (
    <>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar__inner">
          {/* Wordmark */}
          <Link
            to="/discover"
            className="navbar__wordmark"
            onClick={() => setMobileOpen(false)}
            aria-label="FRAME — go to home"
          >
            FRAME
            <span className="navbar__wordmark-dot" aria-hidden="true" />
          </Link>

          {/* Desktop nav links */}
          <div className="navbar__links" role="menubar">
            {NAV_ITEMS.map(({ path, label, icon: Icon, badgeKey }) => (
              <NavLink
                key={path}
                to={path}
                role="menuitem"
                className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
                aria-current={location.pathname === path ? 'page' : undefined}
              >
                <Icon size={15} aria-hidden="true" />
                {label}
                {badgeKey === 'watchlist' && watchlist.length > 0 && (
                  <span className="navbar__link-badge" aria-label={`${watchlist.length} saved`}>
                    {watchlist.length}
                  </span>
                )}
                {badgeKey === 'compare' && compareList.length > 0 && (
                  <span className="navbar__link-badge navbar__link-badge--compare" aria-label={`${compareList.length} in compare`}>
                    {compareList.length}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="navbar__spacer" />

          {/* Desktop search */}
          <div className="navbar__search-wrap" ref={searchRef}>
            {!searchOpen ? (
              <button
                className="navbar__search-toggle"
                onClick={() => setSearchOpen(true)}
                aria-label="Open search"
              >
                <Search size={18} />
              </button>
            ) : (
              <div className="navbar__search-input-wrap" role="search">
                <Search size={15} aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  className="navbar__search-input"
                  placeholder="Search movies…"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search movies"
                />
                <button
                  className="navbar__search-close"
                  onClick={closeSearch}
                  aria-label="Close search"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`navbar__mobile-drawer${mobileOpen ? ' open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        {/* Mobile search */}
        <div className="navbar__mobile-search" role="search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search movies…"
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search movies"
          />
        </div>

        {/* Mobile nav links */}
        {NAV_ITEMS.map(({ path, label, icon: Icon, badgeKey }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `navbar__mobile-link${isActive ? ' active' : ''}`}
            onClick={() => setMobileOpen(false)}
            aria-current={location.pathname === path ? 'page' : undefined}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
            {badgeKey === 'watchlist' && watchlist.length > 0 && (
              <span className="navbar__link-badge" aria-label={`${watchlist.length} saved`}>
                {watchlist.length}
              </span>
            )}
            {badgeKey === 'compare' && compareList.length > 0 && (
              <span className="navbar__link-badge navbar__link-badge--compare" aria-label={`${compareList.length} in compare`}>
                {compareList.length}
              </span>
            )}
            <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />
          </NavLink>
        ))}
      </div>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 98,
            background: 'rgba(0,0,0,0.5)',
            top: 'var(--nav-height)',
          }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}