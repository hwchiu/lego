'use client';

import { useState, useRef, useEffect } from 'react';
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

// ── Types ─────────────────────────────────────────────────────────────────────
type Holding = HoldingEntity;

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

  // Title dropdown
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const titleDropdownRef = useRef<HTMLDivElement>(null);

  // Add Company modal
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [addQuery, setAddQuery] = useState('');

  // Company master lookup
  const companyNameMap = new Map(COMPANY_MASTER_LIST.map((c) => [c.symbol, c.name]));

  // Holdings lookup from watchlist data
  const holdingsLookup = new Map(Object.values(holdingsDataMap).map((h) => [h.symbol, h]));

  // Get company symbols from FavoritesCompanyList.json via getFavoritesByUserAcct
  const favoriteSymbols = getFavoritesByUserAcct(userAcct);

  // Build holdings list, falling back to a placeholder for unknown symbols
  const holdings: Holding[] = favoriteSymbols.map(
    (sym) => holdingsLookup.get(sym) ?? createPlaceholderHolding(sym),
  );

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

            <div className="wl-content-area">
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
                          No favourite companies yet. Add companies from their Company Profile page.
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
                            {companyNameMap.has(h.symbol) && (
                              <span className="wl-symbol-name">{companyNameMap.get(h.symbol)}</span>
                            )}
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
