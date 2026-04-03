'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SP500_COMPANIES } from '@/app/data/sp500';

const POPULAR_SEARCHES = ['TSM', 'AAPL', 'NVDA'];

const DATA_CATEGORIES = ['Company', 'News', 'Transcript', 'Stock', 'Data'];

const RECENT_HISTORY = [
  {
    id: 'h-1',
    title: 'NVIDIA and Intel Announce $5 Billion Partnership to Co-Develop AI Data Center Chips',
    description: 'Bloomberg · Apr 2 — NVIDIA and Intel join forces in a landmark $5B deal aimed at co-developing next-generation AI data center chips.',
  },
  {
    id: 'h-2',
    title: 'Apple Unveils M5 Chip with 4× AI GPU Performance, Powers New MacBook Pro and iPad Pro',
    description: 'Reuters · Apr 2 — Apple\'s latest M5 chip delivers a 4× leap in AI GPU performance, powering the new MacBook Pro and iPad Pro lineup.',
  },
  {
    id: 'h-3',
    title: 'Global Semiconductor Revenue Surpasses $790 Billion in 2025, NVIDIA First to Hit $100B in Annual Sales',
    description: 'CNBC · Apr 2 — Global chip revenue crossed the $790B mark in 2025, with NVIDIA becoming the first semiconductor firm to reach $100B in annual sales.',
  },
];

// Notification count — sourced from content/notifications.md
const NOTIFICATION_COUNT = 6;

export default function TopNav() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const showDropdown = focused;
  const showCategories = focused && query.trim().length > 0;

  // Filter companies when "Company" category is active and query is typed
  const filteredCompanies =
    activeCategory === 'Company' && query.trim().length > 0
      ? SP500_COMPANIES.filter(
          (c) =>
            c.symbol.toLowerCase().includes(query.trim().toLowerCase()) ||
            c.name.toLowerCase().includes(query.trim().toLowerCase()),
        ).slice(0, 8)
      : [];

  // Navigate to company profile page
  function navigateToCompany(symbol: string) {
    setFocused(false);
    setQuery('');
    router.push(`/company-profile/${symbol}/`);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="topnav">
      <div className="topnav-logo">
        tM<span className="logo-i">I</span>C
      </div>

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
          placeholder="Company, Symbols, Analysts, Keywords"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          autoComplete="off"
        />

        {showDropdown && (
          <div className="search-dropdown">
            {/* Section 1: Data Categories — only visible when user has typed */}
            {showCategories && (
              <div className="search-dropdown-section search-dropdown-section--cats">
                <div className="search-dropdown-section-label">Data Category</div>
                <div className="search-category-tabs">
                  {DATA_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      className={`search-category-tab${activeCategory === cat ? ' active' : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setActiveCategory(activeCategory === cat ? null : cat);
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Company search results — shown when "Company" category active */}
            {filteredCompanies.length > 0 && (
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

            {/* Section 3: Popular searches */}
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

            {/* Divider */}
            <div className="search-dropdown-divider" />

            {/* Section 3: Recent history */}
            <div className="search-dropdown-section">
              <div className="search-dropdown-section-label">Recent Searches</div>
              <ul className="search-history-list">
                {RECENT_HISTORY.map((item) => (
                  <li key={item.id}>
                    <button
                      className="search-history-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setQuery(item.title);
                        setFocused(false);
                      }}
                    >
                      <svg className="search-history-icon" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M6.5 3.5V6.5L8.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      <div className="search-history-text">
                        <div className="search-history-title">{item.title}</div>
                        <div className="search-history-desc">{item.description}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ── Header action buttons ────────────────────────────────── */}
      <div className="topnav-actions">
        {/* User Manual */}
        <button className="topnav-action-btn" title="User Manual" aria-label="User Manual">
          {/* Book / manual icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 4h4M5 6.5h4M5 9h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M11 3v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M11 3c0-1 2-1 2 0v10c0 1-2 1-2 0" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="topnav-action-label">User Manual</span>
        </button>

        {/* Language / English */}
        <button className="topnav-action-btn" title="Language" aria-label="Switch Language">
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
          <span className="topnav-action-label">English</span>
        </button>

        {/* Notification bell */}
        <button className="topnav-action-btn topnav-action-btn--icon-only" title="Notifications" aria-label="Notifications">
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
            {NOTIFICATION_COUNT > 0 && (
              <span className="topnav-notif-badge">{NOTIFICATION_COUNT}</span>
            )}
          </span>
        </button>
      </div>

      <div className="topnav-user">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="topnav-avatar"
          src="https://avatars.githubusercontent.com/hwchiu"
          alt="User Avatar"
        />
        <span className="topnav-name">HungWei Chiu</span>
      </div>
    </header>
  );
}
