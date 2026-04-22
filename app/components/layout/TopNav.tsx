'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useMobileSidebar, MOBILE_BREAKPOINT } from '@/app/contexts/MobileSidebarContext';
import { BASE_PATH } from '@/app/lib/basePath';
import ThemeToggleButton from '@/app/components/ThemeToggleButton';

const POPULAR_SEARCHES = ['TC', 'AAPL', 'NVDA'];

// Pre-computed lowercase SP500 companies for faster filtering
const COMPANY_MASTER_LC = COMPANY_MASTER_LIST.map((c) => ({
  ...c,
  symbolLc: c.symbol.toLowerCase(),
  nameLc: c.name.toLowerCase(),
}));

interface UserInfo {
  name: string;
  avatar: string;
}

export default function TopNav() {
  const router = useRouter();
  const { lang, toggleLang } = useLanguage();
  const { toggleSidebar, toggleDesktopCollapsed } = useMobileSidebar();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const base = process.env.NODE_ENV === 'production' ? '/lego' : '';
    fetch(`${base}/user-info.json`)
      .then((res) => res.json())
      .then((data: UserInfo) => setUserInfo(data))
      .catch(() => {/* keep null on error */});
  }, []);

  const handleMenuToggle = () => {
    // window.innerWidth reflects the current viewport at click time
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      toggleSidebar();
    } else {
      toggleDesktopCollapsed();
    }
  };
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Notification panel state
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleNotifToggle = useCallback(() => {
    setNotifOpen((prev) => !prev);
  }, []);

  const showDropdown = focused;
  const q = query.trim().toLowerCase();

  // Filter companies by query (company search only)
  const filteredCompanies =
    q.length > 0
      ? COMPANY_MASTER_LC.filter((c) => c.symbolLc.includes(q) || c.nameLc.includes(q)).slice(0, 8)
      : [];

  // Navigate to company profile page
  function navigateToCompany(symbol: string) {
    setFocused(false);
    setQuery('');
    router.push(`/company-profile/${symbol}/`);
  }

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  return (
    <header className="topnav">
      {/* Menu toggle button — collapses sidebar on desktop, opens drawer on mobile */}
      <button
        className="topnav-hamburger"
        onClick={handleMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <Link href="/about" className="topnav-logo" aria-label="Go to About tMIC">
        tM<span className="logo-i">I</span>C
      </Link>

      <div className="topnav-search-wrap" ref={wrapRef}>
        <svg
          className="topnav-search-icon"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className={`topnav-search${focused ? ' focused' : ''}`}
          type="text"
          placeholder="Search a company or ticker…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          autoComplete="off"
        />

        {showDropdown && (
          <div className="search-dropdown">
            {/* Company search results — shown when user has typed */}
            {q.length > 0 && filteredCompanies.length > 0 && (
              <div className="search-dropdown-section">
                <div className="search-dropdown-section-label">Companies</div>
                <ul className="search-popular-list">
                  {filteredCompanies.map((company) => (
                    <li key={company.symbol}>
                      <button
                        className="search-popular-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigateToCompany(company.symbol);
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <rect x="1.5" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
                          <path d="M4 5h5M4 7.5h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        </svg>
                        <strong>{company.symbol}</strong>&nbsp;{company.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* No results */}
            {q.length > 0 && filteredCompanies.length === 0 && (
              <div className="search-dropdown-section">
                <div
                  className="search-dropdown-section-label"
                  style={{ color: 'var(--c-text-3)', fontStyle: 'italic', padding: '8px 0' }}
                >
                  No results found
                </div>
              </div>
            )}

            {/* Popular searches — shown when focused with no query */}
            {q.length === 0 && (
              <div className="search-dropdown-section">
                <div className="search-dropdown-section-label">Popular Searches</div>
                <ul className="search-popular-list">
                  {POPULAR_SEARCHES.map((term) => (
                    <li key={term}>
                      <button
                        className="search-popular-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          navigateToCompany(term);
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                          <path d="M6 1.5L7.4 4.5L10.5 5L8.3 7.2L8.8 10.5L6 9L3.2 10.5L3.7 7.2L1.5 5L4.6 4.5L6 1.5Z"
                            stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                        </svg>
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Header action buttons ────────────────────────────────── */}
      <div className="topnav-actions">
        {/* User Manual */}
        <button
          className="topnav-action-btn"
          title="User Manual"
          aria-label="User Manual"
          onClick={() => window.open('https://tkms.digwork.tw.ent.tsmc.com/pages/Uw5xaVFEXr', '_blank', 'noopener,noreferrer')}
        >
          {/* Book / manual icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 4h4M5 6.5h4M5 9h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M11 3v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M11 3c0-1 2-1 2 0v10c0 1-2 1-2 0" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="topnav-action-label">User Manual</span>
        </button>

        {/* Language / Toggle */}
        <button className="topnav-action-btn" title="Language" aria-label="Switch Language" onClick={toggleLang}>
          {/* Globe / multilingual icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M8 1.5C8 1.5 5.5 4.5 5.5 8C5.5 11.5 8 14.5 8 14.5M8 1.5C8 1.5 10.5 4.5 10.5 8C10.5 11.5 8 14.5 8 14.5M1.5 8H14.5M2 5h12M2 11h12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="topnav-action-label">{lang === 'zh' ? '繁體中文' : 'English'}</span>
        </button>

        {/* Dark/Light mode toggle */}
        <ThemeToggleButton />

        {/* Notification bell */}
        <div className="topnav-notif-panel-wrap" ref={notifRef}>
          <button
            className={`topnav-action-btn topnav-action-btn--icon-only${notifOpen ? ' active' : ''}`}
            title="Notifications"
            aria-label="Notifications"
            onClick={handleNotifToggle}
          >
            <span className="topnav-notif-wrap">
              {/* Bell icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 2a4.5 4.5 0 0 1 4.5 4.5v2.8l1.1 1.7H2.4L3.5 9.3V6.5A4.5 4.5 0 0 1 8 2Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.2 13a1.8 1.8 0 0 0 3.6 0"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          {notifOpen && (
            <div className="topnav-notif-panel">
              {/* Panel header */}
              <div className="topnav-notif-panel-header">
                <span className="topnav-notif-panel-title">{lang === 'zh' ? '通知' : 'Notifications'}</span>
              </div>

              {/* Coming soon placeholder */}
              <div className="topnav-notif-list">
                <div className="topnav-notif-empty" style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ margin: '0 auto 10px', display: 'block', opacity: 0.35 }}>
                    <path d="M16 4a9 9 0 0 1 9 9v5.6l2.2 3.4H4.8L7 18.6V13A9 9 0 0 1 16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    <path d="M12.4 26a3.6 3.6 0 0 0 7.2 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 4 }}>
                    {lang === 'zh' ? '即將上線' : 'Coming Soon'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--c-text-3)' }}>
                    {lang === 'zh'
                      ? '通知功能尚未上線，敬請期待。'
                      : 'The notifications feature is not yet available. Stay tuned!'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="topnav-user">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="topnav-avatar"
          src={`${BASE_PATH}${userInfo?.avatar ?? '/images/hwchiu_github_avatar.jpg'}`}
          alt="User Avatar"
        />
        <span className="topnav-name">{userInfo?.name ?? ''}</span>
      </div>
    </header>
  );
}
