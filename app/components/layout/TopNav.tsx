'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SP500_COMPANIES } from '@/app/data/sp500';
import { newsItems } from '@/app/data/news';
import {
  newsNotifications,
  collaborationNotifications,
  allNotifications,
  type NotificationItem,
  type NotificationType,
} from '@/app/data/notifications';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useMobileSidebar, MOBILE_BREAKPOINT } from '@/app/contexts/MobileSidebarContext';
import { useTheme } from '@/app/contexts/ThemeContext';
import { BASE_PATH } from '@/app/lib/basePath';

const POPULAR_SEARCHES = ['TC', 'AAPL', 'NVDA'];

// ─────────────────────────────────────────────
// Notification type icon
// ─────────────────────────────────────────────
function NotifTypeIcon({ type }: { type: NotificationType }) {
  const cls = `topnav-notif-item-icon topnav-notif-item-icon--${type}`;
  switch (type) {
    case 'alert':
    case 'warning':
      return (
        <span className={cls}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7 1.5L13 12.5H1L7 1.5Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path d="M7 5.5v3M7 10h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </span>
      );
    case 'analysis':
      return (
        <span className={cls}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4 9.5l2-3 2 2 2-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case 'transcript':
      return (
        <span className={cls}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="2" y="1.5" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4 4.5h4M4 6.5h4M4 8.5h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M10 8l2.5 1.5L10 11V8Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
        </span>
      );
    case 'tag-match':
      return (
        <span className={cls}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M7.5 1.5H12.5V6.5L7.5 11.5L2.5 6.5L7.5 1.5Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <circle cx="10" cy="4" r="1" fill="currentColor" />
          </svg>
        </span>
      );
    default: // 'news'
      return (
        <span className={cls}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M3.5 5.5h7M3.5 7.5h7M3.5 9.5h4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
      );
  }
}

// ─────────────────────────────────────────────
// Single notification row
// ─────────────────────────────────────────────
interface NotifItemRowProps {
  notif: NotificationItem;
  isRead: boolean;
  lang: 'zh' | 'en';
  onClick: () => void;
}

function NotifItemRow({ notif, isRead, lang, onClick }: NotifItemRowProps) {
  const classes = [
    'topnav-notif-item',
    !isRead ? 'topnav-notif-item--unread' : 'topnav-notif-item--read',
  ].join(' ');

  const displayTitle = lang === 'en' && notif.titleEn ? notif.titleEn : notif.title;
  const displayTime = lang === 'en' && notif.timeEn ? notif.timeEn : notif.time;
  const ariaLabel =
    lang === 'zh'
      ? `${isRead ? '已讀' : '未讀'}通知：${displayTitle}`
      : `${isRead ? 'Read' : 'Unread'} notification: ${displayTitle}`;

  return (
    <div
      className={classes}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <NotifTypeIcon type={notif.type} />
      <div className="topnav-notif-item-body">
        <div className="topnav-notif-item-title">{displayTitle}</div>
        <div className="topnav-notif-item-meta">
          <span>{notif.source}</span>
          <span>·</span>
          <span>{displayTime}</span>
        </div>
        {notif.tags && notif.tags.length > 0 && (
          <div className="topnav-notif-item-tags">
            {notif.tags.map((tag) => (
              <span key={tag} className="topnav-notif-tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const DATA_CATEGORIES = ['All', 'Company', 'News & Event', 'People', 'Data'];

// Inline SVG icons for each category tab
function CategoryIcon({ category }: { category: string }) {
  switch (category) {
    case 'All':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="7" y="1" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="1" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
          <rect x="7" y="7" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 'Company':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1.5" y="3" width="9" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 3V2a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M4 6h1M7 6h1M4 8.5h1M7 8.5h1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case 'News & Event':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1" y="2" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3.5 5h5M3.5 7h3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M3.5 3.5h2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
      );
    case 'People':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="4" r="2.3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.5 11c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'Data':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <rect x="1.5" y="6.5" width="2" height="4" rx="0.4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="5" y="4" width="2" height="6.5" rx="0.4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="8.5" y="1.5" width="2" height="9" rx="0.4" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return null;
  }
}

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

// Pre-computed lowercase news fields for faster filtering
const NEWS_ITEMS_LC = newsItems.map((n) => ({
  ...n,
  titleLc: n.title.toLowerCase(),
  sourceLc: n.source.toLowerCase(),
}));

// Pre-computed lowercase SP500 companies for faster filtering
const SP500_LC = SP500_COMPANIES.map((c) => ({
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
  const { theme, toggleTheme } = useTheme();
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
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const wrapRef = useRef<HTMLDivElement>(null);

  // Notification panel state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<'news' | 'collaboration'>('news');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);

  const badgeCount = allNotifications.filter((n) => !readIds.has(n.id)).length;

  const handleNotifToggle = useCallback(() => {
    setNotifOpen((prev) => !prev);
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setReadIds(new Set(allNotifications.map((n) => n.id)));
  }, []);

  const handleMarkRead = useCallback((id: string) => {
    setReadIds((prev) => new Set([...prev, id]));
  }, []);

  const showDropdown = focused;
  const showCategories = focused && query.trim().length > 0;
  const q = query.trim().toLowerCase();

  // Filter companies (used for 'All' and 'Company' categories)
  const filteredCompanies =
    (activeCategory === 'Company' || activeCategory === 'All') && q.length > 0
      ? SP500_LC.filter((c) => c.symbolLc.includes(q) || c.nameLc.includes(q)).slice(
          0,
          activeCategory === 'All' ? 4 : 8,
        )
      : [];

  // Filter news items (used for 'All' and 'News & Event' categories)
  const filteredNews =
    (activeCategory === 'News & Event' || activeCategory === 'All') && q.length > 0
      ? NEWS_ITEMS_LC.filter((n) => n.titleLc.includes(q) || n.sourceLc.includes(q)).slice(0, 5)
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
          placeholder="Company, Symbols, Analysts, Keywords"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            setFocused(true);
            setActiveCategory('All');
          }}
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
                        setActiveCategory(cat);
                      }}
                    >
                      <CategoryIcon category={cat} />
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Search results — vary by active category */}
            {showCategories && (
              <>
                {/* Companies — shown for 'All' and 'Company' */}
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

                {/* News — shown for 'All' and 'News & Event' */}
                {filteredNews.length > 0 && (
                  <div className="search-dropdown-section">
                    <div className="search-dropdown-section-label">News &amp; Events</div>
                    <ul className="search-history-list">
                      {filteredNews.map((item) => (
                        <li key={item.id}>
                          <button
                            className="search-history-item"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFocused(false);
                              setQuery('');
                              router.push('/market-news/');
                            }}
                          >
                            <svg className="search-history-icon" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                              <rect x="1" y="2" width="11" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
                              <path d="M3.5 5.5h6M3.5 7.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                            </svg>
                            <div className="search-history-text">
                              <div className="search-history-title">{item.title}</div>
                              <div className="search-history-desc">{item.source}</div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Placeholder for 'People' */}
                {activeCategory === 'People' && (
                  <div className="search-dropdown-section">
                    <div
                      className="search-dropdown-section-label"
                      style={{ color: 'var(--c-text-3)', fontStyle: 'italic', padding: '8px 0' }}
                    >
                      No people data available
                    </div>
                  </div>
                )}

                {/* Placeholder for 'Data' */}
                {activeCategory === 'Data' && (
                  <div className="search-dropdown-section">
                    <div
                      className="search-dropdown-section-label"
                      style={{ color: 'var(--c-text-3)', fontStyle: 'italic', padding: '8px 0' }}
                    >
                      No data available
                    </div>
                  </div>
                )}

                {/* No results message for All / Company / News & Event */}
                {['All', 'Company', 'News & Event'].includes(activeCategory) &&
                  filteredCompanies.length === 0 &&
                  filteredNews.length === 0 && (
                    <div className="search-dropdown-section">
                      <div
                        className="search-dropdown-section-label"
                        style={{ color: 'var(--c-text-3)', fontStyle: 'italic', padding: '8px 0' }}
                      >
                        No results found
                      </div>
                    </div>
                  )}
              </>
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
        <button
          className="topnav-action-btn"
          title="User Manual"
          aria-label="User Manual"
          onClick={() => router.push('/user-manual/')}
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
        <button
          className="topnav-action-btn topnav-action-btn--icon-only"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.5 9A5.5 5.5 0 0 1 7 2.5a5.5 5.5 0 1 0 6.5 6.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          )}
        </button>

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
              {badgeCount > 0 && (
                <span className="topnav-notif-badge">{badgeCount}</span>
              )}
            </span>
          </button>

          {notifOpen && (
            <div className="topnav-notif-panel">
              {/* Panel header */}
              <div className="topnav-notif-panel-header">
                <span className="topnav-notif-panel-title">{lang === 'zh' ? '通知' : 'Notifications'}</span>
                <button className="topnav-notif-mark-read" onClick={handleMarkAllRead}>
                  {lang === 'zh' ? '全部標為已讀' : 'Mark All as Read'}
                </button>
              </div>

              {/* Category tabs */}
              <div className="topnav-notif-tabs" role="tablist">
                <button
                  role="tab"
                  aria-selected={notifTab === 'news'}
                  aria-controls="notif-panel-news"
                  className={`topnav-notif-tab${notifTab === 'news' ? ' active' : ''}`}
                  onClick={() => setNotifTab('news')}
                >
                  {lang === 'zh' ? '新聞' : 'News'}
                  <span className="topnav-notif-tab-count">{newsNotifications.length}</span>
                </button>
                <button
                  role="tab"
                  aria-selected={notifTab === 'collaboration'}
                  aria-controls="notif-panel-collaboration"
                  className={`topnav-notif-tab${notifTab === 'collaboration' ? ' active' : ''}`}
                  onClick={() => setNotifTab('collaboration')}
                >
                  {lang === 'zh' ? '協作動態' : 'Collaboration'}
                  <span className="topnav-notif-tab-count">{collaborationNotifications.length}</span>
                </button>
              </div>

              {/* Notification list */}
              <div
                id={notifTab === 'news' ? 'notif-panel-news' : 'notif-panel-collaboration'}
                role="tabpanel"
                className="topnav-notif-list"
              >
                {(notifTab === 'news' ? newsNotifications : collaborationNotifications).length === 0 ? (
                  <div className="topnav-notif-empty">{lang === 'zh' ? '暫無通知' : 'No notifications'}</div>
                ) : (
                  (notifTab === 'news' ? newsNotifications : collaborationNotifications).map((notif) => (
                    <NotifItemRow
                      key={notif.id}
                      notif={notif}
                      isRead={readIds.has(notif.id)}
                      lang={lang}
                      onClick={() => handleMarkRead(notif.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="topnav-user">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="topnav-avatar"
          src={BASE_PATH + (userInfo?.avatar ?? '/images/hwchiu_github_avatar.jpg')}
          alt="User Avatar"
        />
        <span className="topnav-name">{userInfo?.name ?? ''}</span>
      </div>
    </header>
  );
}
