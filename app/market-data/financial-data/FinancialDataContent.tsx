'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { getCompanies } from '@/app/data/financialData';

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 48 48" width="24" height="24" fill="none" aria-hidden="true">
      <path d="M6 36L16 24L24 30L34 16L42 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const COMPANIES = getCompanies();

export default function FinancialDataContent() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter companies by query
  const filtered = query.trim()
    ? COMPANIES.filter(
        (c) =>
          c.symbol.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : COMPANIES;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    router.push(`/market-data/financial-data/${symbol}/`);
  };

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
  };

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="fd-layout">
            {/* ── Page header ── */}
            <div className="fd-page-header">
              <div className="section-eyebrow">Market Data</div>
              <h1 className="fd-page-title">Financial Data</h1>
              <p className="fd-page-sub">
                Browse financial statements, balance sheets, and cash flow reports for TSMC&apos;s
                key customers and partners.
              </p>
            </div>

            {/* ── Search bar ── */}
            <div className="fd-search-bar fd-search-bar--list">
              <div className="fd-search-wrap" ref={searchRef}>
                <span className="fd-search-icon">
                  <SearchIcon />
                </span>
                <input
                  className="fd-search-input"
                  type="text"
                  placeholder="Search symbol or company name (e.g. AAPL, NVDA)"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  aria-label="Search company"
                  autoComplete="off"
                />
                {isOpen && filtered.length > 0 && (
                  <div className="fd-search-dropdown" role="listbox">
                    {filtered.slice(0, 10).map((c) => (
                      <button
                        key={c.symbol}
                        className="fd-search-item"
                        role="option"
                        aria-selected={false}
                        onClick={() => handleSelect(c.symbol)}
                      >
                        <span className="fd-search-item-symbol">{c.symbol}</span>
                        <span className="fd-search-item-name">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Company grid ── */}
            <div className="fd-content">
              <div className="fd-empty-state">
                <div className="fd-empty-icon">
                  <ChartIcon />
                </div>
                <p className="fd-empty-title">Select a Company</p>
                <p className="fd-empty-sub">
                  Search for a company symbol above, or choose from TSMC&apos;s key customers
                  below.
                </p>
                <div className="fd-hint-grid">
                  {COMPANIES.map((c) => (
                    <Link
                      key={c.symbol}
                      href={`/market-data/financial-data/${c.symbol}/`}
                      className="fd-hint-btn"
                    >
                      <span className="fd-hint-symbol">{c.symbol}</span>
                      <span className="fd-hint-name">{c.name.split(' ').slice(0, 2).join(' ')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
