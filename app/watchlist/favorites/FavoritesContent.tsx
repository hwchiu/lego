'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';
import { holdingsData as holdingsDataMap } from '@/app/data/watchlistData';
import type { HoldingEntity } from '@/app/data/watchlistData';
import { mainNav } from '@/app/data/navigation';
import { useWatchlist } from '@/app/contexts/WatchlistContext';
import { getFavoritesByUserAcct } from '@/app/lib/getFavoritesByUserAcct';
import { newsItems } from '@/app/data/news';
import { pressReleases } from '@/app/data/pressReleases';
import {
  bondEvents,
  dividendEvents,
  dividendAristocratEvents,
  dividendChampionEvents,
  countryEvents,
  currencyEvents,
} from '@/app/data/eventCategories';
import type {
  BondEvent,
  DividendEvent,
  DividendGrowthEvent,
  CountryEvent,
  CurrencyEvent,
} from '@/app/data/eventCategories';

// ── Types ─────────────────────────────────────────────────────────────────────
type Holding = HoldingEntity;
type FeedTab = 'Latest' | 'News' | 'Press Release' | 'Event';

interface UpdateFeedItem {
  id: string;
  kind: 'news' | 'press-release' | 'event';
  title: string;
  source: string;
  displaySymbols: string[];
  dateLabel: string;
  dateMs: number;
  description?: string;
}

function parseDateKey(dateKey: string): number {
  try { return new Date(`${dateKey} 2026`).getTime(); } catch { return 0; }
}

function AlphaAvatar() {
  return (
    <div className="wl-feed-avatar wl-feed-avatar--alpha">
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
        <circle cx="14" cy="14" r="14" fill="#e5e7eb" />
        <text x="14" y="19" textAnchor="middle" fontSize="14" fill="#9ca3af" fontFamily="serif">
          α
        </text>
      </svg>
    </div>
  );
}

function FeedItemAvatar({ kind }: { kind: UpdateFeedItem['kind'] }) {
  if (kind === 'news') return <AlphaAvatar />;
  if (kind === 'press-release') {
    return (
      <div className="wl-feed-avatar wl-feed-avatar--pr">
        <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
          <circle cx="14" cy="14" r="14" fill="#dbeafe" />
          <rect x="8" y="8" width="12" height="12" rx="2" stroke="#2563eb" strokeWidth="1.4" fill="none" />
          <path d="M10 12h8M10 15h6" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="wl-feed-avatar wl-feed-avatar--event">
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
        <circle cx="14" cy="14" r="14" fill="#fef3c7" />
        <rect x="8" y="9" width="12" height="11" rx="1.5" stroke="#d97706" strokeWidth="1.4" fill="none" />
        <path d="M11 9V7M17 9V7" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M8 12h12" stroke="#d97706" strokeWidth="1.2" />
      </svg>
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────────
const userAcct = 'demoUser';

// ── Placeholder holding generator (deterministic based on symbol chars) ───────
function createPlaceholderHolding(symbol: string): Holding {
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const price = 20 + (seed % 780);
  const changeAbs = parseFloat(((((seed * 7) % 200) - 100) / 100).toFixed(2));
  const changePct = parseFloat(((changeAbs / price) * 100).toFixed(2));
  const shares = 10 + (seed % 91);
  const cost = parseFloat((price * 0.9).toFixed(2));
  const todayGain = parseFloat((changeAbs * shares).toFixed(2));
  const todayGainPct = changePct;
  const revenueB = parseFloat((1 + (seed % 99)).toFixed(2));
  const qoqSign = seed % 2 === 0 ? '+' : '-';
  const yoySign = (seed * 3) % 5 > 1 ? '+' : '-';
  const grossMarginPct = 20 + (seed % 55);
  const doiDays = 15 + (seed % 200);
  return {
    symbol,
    price,
    change: changeAbs,
    changePct,
    shares,
    cost,
    todayGain,
    todayGainPct,
    revenue: `$${revenueB.toFixed(2)}B`,
    revenueQoQ: `${qoqSign}${((seed % 15) + 1).toFixed(1)}%`,
    revenueYoY: `${yoySign}${((seed % 30) + 1).toFixed(1)}%`,
    grossMargin: `${grossMarginPct}%`,
    doi: `${doiDays}`,
    nextEarning: 'TBD',
    lastQtrRevenue: `$${(revenueB * 1.05).toFixed(2)}B`,
    lastQtrGrossMargin: `${grossMarginPct + 1}%`,
    lastQtrDOI: `${doiDays - 5}`,
  };
}

// ── FavoritesContent ──────────────────────────────────────────────────────────
export default function FavoritesContent() {
  const router = useRouter();
  const { watchlistNames, dynamicWatchlists, deletedWatchlists } = useWatchlist();
  const [feedTab, setFeedTab] = useState<FeedTab>('Latest');

  // Title dropdown
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const titleDropdownRef = useRef<HTMLDivElement>(null);

  // Add Company modal
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [addQuery, setAddQuery] = useState('');

  // Holdings lookup from watchlist data
  const holdingsLookup = new Map(Object.values(holdingsDataMap).map((h) => [h.symbol, h]));

  // Get company symbols from FavoritesCompanyList.json via getFavoritesByUserAcct
  const favoriteSymbols = getFavoritesByUserAcct(userAcct);

  // Build holdings list, falling back to a placeholder for unknown symbols
  const holdings: Holding[] = favoriteSymbols.map(
    (sym) => holdingsLookup.get(sym) ?? createPlaceholderHolding(sym),
  );

  const watchlistSymbolSet = useMemo(() => new Set(favoriteSymbols), [favoriteSymbols]);

  const newsUpdateItems = useMemo((): UpdateFeedItem[] =>
    newsItems
      .filter((item) => item.tags.some((tag) => watchlistSymbolSet.has(tag.symbol)))
      .map((item) => ({
        id: item.id,
        kind: 'news' as const,
        title: item.title,
        source: item.source,
        displaySymbols: item.tags.filter((t) => watchlistSymbolSet.has(t.symbol)).map((t) => t.symbol),
        dateLabel: item.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dateMs: item.publishedAt.getTime(),
      })),
    [watchlistSymbolSet],
  );

  const prUpdateItems = useMemo((): UpdateFeedItem[] =>
    pressReleases
      .filter((pr) => watchlistSymbolSet.has(pr.ticker))
      .map((pr) => ({
        id: pr.id,
        kind: 'press-release' as const,
        title: pr.title,
        source: pr.company,
        displaySymbols: [pr.ticker],
        dateLabel: pr.publishedAt,
        dateMs: new Date(pr.publishedAt).getTime(),
        description: pr.summary,
      })),
    [watchlistSymbolSet],
  );

  const eventUpdateItems = useMemo((): UpdateFeedItem[] => {
    const items: UpdateFeedItem[] = [];

    Object.entries(bondEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as BondEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `bond-${date}-${i}`,
          kind: 'event',
          title: `${e.eventType}: ${e.company}`,
          source: 'Bond Event',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: e.description,
        });
      });
    });

    Object.entries(dividendEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as DividendEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `div-${date}-${i}`,
          kind: 'event',
          title: `Dividend: ${e.company} — ${e.dividend}`,
          source: 'Dividend',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: `Ex-Date: ${e.exDate} · Pay Date: ${e.payDate} · Yield: ${e.yield}`,
        });
      });
    });

    Object.entries(dividendAristocratEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as DividendGrowthEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `diva-${date}-${i}`,
          kind: 'event',
          title: `Dividend Aristocrat: ${e.company} — ${e.dividend}`,
          source: 'Dividend Aristocrat',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: `Ex-Date: ${e.exDate} · Consecutive Years: ${e.consecutiveYears} · Annual Growth: ${e.annualGrowth}`,
        });
      });
    });

    Object.entries(dividendChampionEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as DividendGrowthEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `divc-${date}-${i}`,
          kind: 'event',
          title: `Dividend Champion: ${e.company} — ${e.dividend}`,
          source: 'Dividend Champion',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: `Ex-Date: ${e.exDate} · Annual Growth: ${e.annualGrowth}`,
        });
      });
    });

    Object.entries(countryEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as CountryEvent;
        const matching = e.affectedCompanies.filter((s) => watchlistSymbolSet.has(s));
        if (matching.length === 0) return;
        items.push({
          id: `country-${date}-${i}`,
          kind: 'event',
          title: e.title,
          source: `Country Event · ${e.country}`,
          displaySymbols: matching,
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: e.description,
        });
      });
    });

    Object.entries(currencyEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as CurrencyEvent;
        const matching = e.affectedCompanies.filter((s) => watchlistSymbolSet.has(s));
        if (matching.length === 0) return;
        items.push({
          id: `fx-${date}-${i}`,
          kind: 'event',
          title: `FX: ${e.pair} — ${e.rate}`,
          source: 'Currency Event',
          displaySymbols: matching,
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: e.description,
        });
      });
    });

    return items.sort((a, b) => b.dateMs - a.dateMs);
  }, [watchlistSymbolSet]);

  const latestUpdateItems = useMemo(
    (): UpdateFeedItem[] =>
      [...newsUpdateItems, ...prUpdateItems, ...eventUpdateItems].sort((a, b) => b.dateMs - a.dateMs),
    [newsUpdateItems, prUpdateItems, eventUpdateItems],
  );

  const currentUpdateItems: UpdateFeedItem[] =
    feedTab === 'Latest' ? latestUpdateItems
    : feedTab === 'News' ? newsUpdateItems
    : feedTab === 'Press Release' ? prUpdateItems
    : eventUpdateItems;

  // Watchlist sub-items for the title dropdown
  const watchlistSubItems = (mainNav.find((item) => item.icon === 'watchlist')?.subItems ?? []).filter(
    (item) => !item.dividerBefore && (!item.watchlistId || !deletedWatchlists.has(item.watchlistId)),
  );
  const allWatchlistItems = [
    ...watchlistSubItems,
    ...dynamicWatchlists
      .filter((wl) => !deletedWatchlists.has(wl.id))
      .map((wl) => ({ label: wl.name, href: `/watchlist/${wl.id}`, watchlistId: wl.id })),
  ];

  // Close title dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(e.target as Node)) {
        setShowTitleDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Add Company search suggestions
  const addSuggestions =
    addQuery.trim().length > 0
      ? COMPANY_MASTER_LIST.filter(
          (c) =>
            c.symbol.toLowerCase().includes(addQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(addQuery.toLowerCase()),
        ).slice(0, 12)
      : [];

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad wl-page">
            {/* ── Portfolio Header ──────────────────────────────────── */}
            <section className="wl-portfolio-section">
              <div className="wl-portfolio-left">
                <div className="wl-portfolio-title-row" ref={titleDropdownRef}>
                  {/* Star icon — always filled for the Favorites page */}
                  <span className="wl-star-btn starred" aria-hidden="true">
                    <svg viewBox="0 0 14 14" width="15" height="15" fill="none" aria-hidden="true">
                      <path
                        d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
                        fill="#f59e0b"
                        stroke="#f59e0b"
                        strokeWidth="1.1"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="wl-portfolio-title">Favorites</span>
                  <button
                    className={`wl-portfolio-chevron-btn${showTitleDropdown ? ' open' : ''}`}
                    aria-label="切換觀察清單"
                    onClick={() => setShowTitleDropdown((v) => !v)}
                  >
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14" className="wl-portfolio-chevron">
                      <path
                        d="M3 5L7 9L11 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Watchlist switcher dropdown */}
                  {showTitleDropdown && (
                    <div className="wl-title-dropdown">
                      {/* Favorites is always active on this page */}
                      <div>
                        <Link
                          href="/watchlist/favorites"
                          className="wl-title-dropdown-item active"
                          onClick={() => setShowTitleDropdown(false)}
                        >
                          <span className="wl-title-dropdown-label">Favorites</span>
                        </Link>
                      </div>
                      {allWatchlistItems.map((item) => {
                        const displayLabel = item.watchlistId
                          ? (watchlistNames[item.watchlistId] ?? item.label)
                          : item.label;
                        return (
                          <div key={item.watchlistId ?? item.label}>
                            <Link
                              href={item.href}
                              className="wl-title-dropdown-item"
                              onClick={() => setShowTitleDropdown(false)}
                            >
                              <span className="wl-title-dropdown-label">{displayLabel}</span>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="wl-action-btns">
                <button className="wl-action-btn" onClick={() => setShowAddCompany(true)}>
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M7 2V12M2 7H12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="wl-action-btn-label">Add Company</span>
                </button>
              </div>
            </section>

            {/* ── Company Table ─────────────────────────────────────── */}
            <div className="wl-subtabs">
              <button className="wl-subtab active">Summary</button>
            </div>

            <div className="wl-content-area wl-content-area--split">
              <div className="wl-table-wrap">
                <table className="wl-table">
                  <thead className="wl-thead--white">
                    <tr>
                      <th className="wl-th wl-th--sticky">
                        Company
                        <svg viewBox="0 0 14 14" fill="none" width="10" height="10" style={{ marginLeft: 4 }}>
                          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </th>
                      <th className="wl-th">Revenue</th>
                      <th className="wl-th">Revenue QoQ</th>
                      <th className="wl-th">Revenue YoY</th>
                      <th className="wl-th">Gross Margin</th>
                      <th className="wl-th">DOI</th>
                      <th className="wl-th">Next Earning Release</th>
                      <th className="wl-th">Last Qtr Revenue</th>
                      <th className="wl-th">Last Qtr Gross Margin</th>
                      <th className="wl-th">Last Qtr DOI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.length === 0 ? (
                      <tr>
                        <td className="wl-td" colSpan={10} style={{ textAlign: 'center', color: 'var(--c-muted, #6b7280)', padding: '24px 0' }}>
                          No favorite companies yet. Add companies from their Company Profile page.
                        </td>
                      </tr>
                    ) : (
                      holdings.map((h) => (
                        <tr key={h.symbol} className="wl-tr">
                          <td className="wl-td wl-td--sticky wl-symbol">
                            <Link
                              href={`/company-profile/${h.symbol}/`}
                              className="wl-symbol-link"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {h.symbol}
                            </Link>
                          </td>
                          <td className="wl-td">{h.revenue}</td>
                          <td className={`wl-td ${h.revenueQoQ.startsWith('+') ? 'pos' : 'neg'}`}>
                            {h.revenueQoQ}
                          </td>
                          <td className={`wl-td ${h.revenueYoY.startsWith('+') ? 'pos' : 'neg'}`}>
                            {h.revenueYoY}
                          </td>
                          <td className="wl-td">{h.grossMargin}</td>
                          <td className="wl-td">{h.doi}</td>
                          <td className="wl-td">{h.nextEarning}</td>
                          <td className="wl-td">{h.lastQtrRevenue}</td>
                          <td className="wl-td">{h.lastQtrGrossMargin}</td>
                          <td className="wl-td">{h.lastQtrDOI}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <section className="wl-feed-section">
                <div className="wl-feed-header">
                  <span className="wl-feed-header-title">Updates</span>
                </div>

                <div className="wl-feed-tabs">
                  {(['Latest', 'News', 'Press Release', 'Event'] as const).map((t) => (
                    <button
                      key={t}
                      className={`wl-feed-tab${feedTab === t ? ' active' : ''}`}
                      onClick={() => setFeedTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="wl-feed-list">
                  {currentUpdateItems.length === 0 ? (
                    <div className="wl-feed-empty">No updates found for your watchlist companies.</div>
                  ) : (
                    currentUpdateItems.map((item, idx) => {
                      const isBordered = idx < currentUpdateItems.length - 1;
                      return (
                      <div key={item.id} className={`wl-feed-item${isBordered ? ' wl-feed-item--bordered' : ''}`}>
                        <FeedItemAvatar kind={item.kind} />
                        <div className="wl-feed-body">
                          <div className="wl-feed-title">{item.title}</div>
                          {item.description && (
                            <div className="wl-feed-description">{item.description}</div>
                          )}
                          <div className="wl-feed-meta">
                            <span className="wl-feed-tickers">
                              {item.displaySymbols.map((sym, i) => (
                                <span key={sym}>
                                  {i > 0 && ', '}
                                  <a
                                    href={`/lego/company-profile/${sym}/`}
                                    className="wl-feed-ticker"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {sym}
                                  </a>
                                </span>
                              ))}
                            </span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-source">{item.source}</span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-time">{item.dateLabel}</span>
                            {item.kind !== 'event' && (
                              <>
                                <span className="wl-feed-dot">•</span>
                                <span className={`wl-feed-kind-badge wl-feed-kind-badge--${item.kind}`}>
                                  {item.kind === 'news' ? 'News' : 'Press Release'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* ── Add Company Modal ─────────────────────────────────────────────── */}
      {showAddCompany && (
        <div className="wl-modal-overlay" onClick={() => setShowAddCompany(false)}>
          <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal-header">
              <span className="wl-modal-title">Add Company to Favorites</span>
              <div className="wl-modal-header-actions">
                <button className="wl-modal-cancel-btn" onClick={() => { setShowAddCompany(false); setAddQuery(''); }}>
                  Cancel
                </button>
              </div>
            </div>
            <div className="wl-modal-body">
              <div className="wl-add-search-wrap">
                <svg className="wl-add-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  className="wl-add-search-input"
                  type="text"
                  placeholder="Search company (e.g. AAPL, Apple...)"
                  value={addQuery}
                  onChange={(e) => setAddQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="wl-add-hint">
                To add companies to Favorites, use the bookmark icon on a Company Profile page.
              </div>
              {addSuggestions.length > 0 && (
                <div className="wl-add-suggestions">
                  {addSuggestions.map((c) => (
                    <button
                      key={c.symbol}
                      className="wl-add-suggestion-item"
                      onClick={() => {
                        router.push(`/company-profile/${c.symbol}/`);
                        setShowAddCompany(false);
                        setAddQuery('');
                      }}
                    >
                      <span className="wl-add-suggestion-symbol">{c.symbol}</span>
                      <span className="wl-add-suggestion-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
