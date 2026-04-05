'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { SP500_COMPANIES } from '@/app/data/sp500';

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11.5 11.5L16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MarketDataPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputWrapRef = useRef<HTMLDivElement>(null);

  const filteredCompanies =
    query.trim().length > 0
      ? SP500_COMPANIES.filter(
          (c) =>
            c.symbol.toLowerCase().includes(query.toLowerCase()) ||
            c.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 8)
      : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelectCompany(symbol: string) {
    setShowDropdown(false);
    router.push(`/company-profile/${symbol}`);
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="md-landing-page">

            {/* ── Hero ── */}
            <div className="md-landing-hero">
              <div className="md-landing-hero-inner">
                <div className="section-eyebrow">Market Data</div>
                <h1 className="md-landing-title">Market Intelligence Hub</h1>
                <p className="md-landing-sub">
                  Access comprehensive M&A transaction data, financial market intelligence,
                  and deal analytics across global markets and industries.
                </p>

                {/* Search bar (same design as Company Profile) */}
                <div className="md-search-outer" ref={inputWrapRef}>
                  <div className="md-search-wrap">
                    <span className="md-search-icon"><SearchIcon /></span>
                    <input
                      className="md-search-input"
                      type="search"
                      placeholder="Search a company, ticker, or deal…"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(e.target.value.trim().length > 0);
                      }}
                      onFocus={() => {
                        if (query.trim().length > 0) setShowDropdown(true);
                      }}
                    />
                  </div>
                  {showDropdown && filteredCompanies.length > 0 && (
                    <div className="cp-search-dropdown">
                      {filteredCompanies.map((company) => (
                        <button
                          key={company.symbol}
                          className="cp-search-result-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectCompany(company.symbol);
                          }}
                        >
                          <span className="cp-result-symbol">{company.symbol}</span>
                          <span className="cp-result-name">{company.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Data Product Cards ── */}
            <div className="md-cards-section">
              <div className="md-cards-eyebrow">Market Intelligence Modules</div>
              <div className="md-cards-grid">

                {/* M&A Card */}
                <Link href="/market-data/ma" className="md-product-card md-product-card--ma">
                  <div className="md-product-card-accent" />
                  <div className="md-product-card-body">
                    <div className="md-product-card-icon-wrap md-product-card-icon-wrap--ma">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                        <path d="M4 20L10 13L16 18L24 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="22" cy="22" r="4" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M22 20V24M20 22H24" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="md-product-card-eyebrow">Deal Analytics</div>
                    <h2 className="md-product-card-title">M&amp;A</h2>
                    <p className="md-product-card-desc">
                      Global mergers and acquisitions statistics, deal volume trends, regional heat maps,
                      and the largest transactions across all sectors and geographies.
                    </p>
                    <div className="md-product-card-stats">
                      <div className="md-product-stat">
                        <span className="md-product-stat-value">$2.1T</span>
                        <span className="md-product-stat-label">2024 Deal Value</span>
                      </div>
                      <div className="md-product-stat">
                        <span className="md-product-stat-value">3,200+</span>
                        <span className="md-product-stat-label">Transactions</span>
                      </div>
                      <div className="md-product-stat">
                        <span className="md-product-stat-value">7</span>
                        <span className="md-product-stat-label">Regions</span>
                      </div>
                    </div>
                    <div className="md-product-card-cta">
                      <span>Explore M&amp;A Data</span>
                      <ArrowRightIcon />
                    </div>
                  </div>
                </Link>

                {/* Financial Data Card */}
                <div className="md-product-card md-product-card--fin">
                  <div className="md-product-card-accent" />
                  <div className="md-product-card-body">
                    <div className="md-product-card-icon-wrap md-product-card-icon-wrap--fin">
                      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                        <rect x="3" y="6" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M8 13h12M8 17h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                        <path d="M8 9v2M14 9v2M20 9v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="md-product-card-eyebrow">Market Intelligence</div>
                    <h2 className="md-product-card-title">Financial Data</h2>
                    <p className="md-product-card-desc">
                      Comprehensive financial market data covering equities, bonds, commodities,
                      and macroeconomic indicators for professional analysts and portfolio managers.
                    </p>
                    <div className="md-product-card-stats">
                      <div className="md-product-stat">
                        <span className="md-product-stat-value">500+</span>
                        <span className="md-product-stat-label">Companies</span>
                      </div>
                      <div className="md-product-stat">
                        <span className="md-product-stat-value">20+</span>
                        <span className="md-product-stat-label">Data Types</span>
                      </div>
                      <div className="md-product-stat">
                        <span className="md-product-stat-value">Real-time</span>
                        <span className="md-product-stat-label">Updates</span>
                      </div>
                    </div>
                    <div className="md-product-card-cta">
                      <Link href="/market-data/financial-data/">
                        <span>Explore Financial Data</span>
                        <ArrowRightIcon />
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
