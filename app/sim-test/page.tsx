'use client';

import { useState } from 'react';

// ── Minimal inline types (mirrors InvestmentDeal / AcquisitionDeal) ────────────

interface SimInvestmentDeal {
  date: string;
  investedCompany: string;
  categories: string;
  round: string;
  valueM: number | null;
  investorsNum: number | null;
  url: string;
}

interface SimAcquisitionDeal {
  date: string;
  acquiredCompany: string;
  categories: string;
  valueM: number | null;
  url: string;
}

// ── Mock data with mix of valid, empty, and null-like (empty string) tags ──────

const MOCK_INVESTMENT_DEALS: SimInvestmentDeal[] = [
  { date: '2024-03-15', investedCompany: 'AlphaAI Corp', categories: 'Artificial Intelligence', round: 'Series B', valueM: 120, investorsNum: 5, url: '#' },
  { date: '2024-01-10', investedCompany: 'BetaHealth Inc', categories: '', round: 'Series A', valueM: 50, investorsNum: 3, url: '#' },
  { date: '2023-11-20', investedCompany: 'GammaCloud Ltd', categories: '', round: 'Seed', valueM: null, investorsNum: null, url: '#' },
  { date: '2023-09-05', investedCompany: 'DeltaRobotics', categories: 'Robotics', round: 'Series C', valueM: 300, investorsNum: 8, url: '#' },
  { date: '2023-06-18', investedCompany: 'EpsilonFintech', categories: '', round: 'Series B', valueM: 80, investorsNum: 4, url: '#' },
];

const MOCK_ACQ_DEALS_ALL_EMPTY: SimAcquisitionDeal[] = [
  { date: '2024-05-01', acquiredCompany: 'FooSoft', categories: '', valueM: 500, url: '#' },
  { date: '2023-12-10', acquiredCompany: 'BarTech', categories: '', valueM: null, url: '#' },
  { date: '2023-07-22', acquiredCompany: 'BazMedia', categories: '', valueM: 1200, url: '#' },
];

// ── ExternalLinkIcon ──────────────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 1h4v4M7 6l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Simulated Investment Panel (identical logic to InvestmentTab fix) ──────────

function SimInvestmentPanel({ deals, title }: { deals: SimInvestmentDeal[]; title: string }) {
  const allCategories = [...new Set(deals.map((d) => d.categories).filter((c): c is string => !!c))].sort();
  const hasCategories = allCategories.length > 0;

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  const filteredDeals =
    selectedCategories.size === 0 ? deals : deals.filter((d) => selectedCategories.has(d.categories));

  return (
    <div className="aapl-ma-panel" style={{ marginBottom: 32 }}>
      <div className="aapl-ma-section-title" style={{ marginBottom: 12, fontSize: 15 }}>{title}</div>

      {/* Category filter bar — only shown when there are valid categories */}
      {hasCategories && (
        <div className="aapl-ma-filter-bar">
          <span className="aapl-ma-filter-label">CATEGORY</span>
          <div className="aapl-ma-tags-scroll">
            <button
              className={`aapl-ma-industry-tag${selectedCategories.size === 0 ? ' aapl-ma-industry-tag--active' : ''}`}
              onClick={() => setSelectedCategories(new Set())}
            >
              All
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                className={`aapl-ma-industry-tag${selectedCategories.has(cat) ? ' aapl-ma-industry-tag--active' : ''}`}
                onClick={() => setSelectedCategories((prev) => {
                  const next = new Set(prev);
                  if (next.has(cat)) next.delete(cat); else next.add(cat);
                  return next;
                })}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="aapl-ma-table-wrap">
        <table className="aapl-ma-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Invested Company</th>
              {hasCategories && <th>Company Categories</th>}
              <th>Round</th>
              <th className="text-right">Value (USD $M)</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeals.map((deal, i) => (
              <tr key={i} className="aapl-ma-table-row">
                <td className="aapl-ma-td-date">{deal.date}</td>
                <td className="aapl-ma-td-company">{deal.investedCompany}</td>
                {hasCategories && <td>{deal.categories ? <span className="aapl-ma-industry-pill">{deal.categories}</span> : null}</td>}
                <td><span className="aapl-ma-type-badge aapl-ma-type-acq">{deal.round}</span></td>
                <td className="text-right aapl-ma-td-value">
                  {deal.valueM != null ? `$${deal.valueM.toLocaleString()}M` : <span className="aapl-ma-undisclosed">Undisclosed</span>}
                </td>
                <td>
                  <a href={deal.url} className="aapl-ma-news-link"><ExternalLinkIcon /> Link</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Simulated Acquisition Panel (all empty categories) ────────────────────────

function SimAcquisitionPanel({ deals, title }: { deals: SimAcquisitionDeal[]; title: string }) {
  const allCategories = [...new Set(deals.map((d) => d.categories).filter((c): c is string => !!c))].sort();
  const hasCategories = allCategories.length > 0;

  return (
    <div className="aapl-ma-panel" style={{ marginBottom: 32 }}>
      <div className="aapl-ma-section-title" style={{ marginBottom: 12, fontSize: 15 }}>{title}</div>

      {/* Category filter bar — NOT shown because all categories are empty */}
      {hasCategories && (
        <div className="aapl-ma-filter-bar">
          <span className="aapl-ma-filter-label">CATEGORY</span>
          <div className="aapl-ma-tags-scroll">
            <button className="aapl-ma-industry-tag aapl-ma-industry-tag--active">All</button>
            {allCategories.map((cat) => (
              <button key={cat} className="aapl-ma-industry-tag">{cat}</button>
            ))}
          </div>
        </div>
      )}

      {/* Table — "Company Categories" column NOT shown */}
      <div className="aapl-ma-table-wrap">
        <table className="aapl-ma-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Acquired Company</th>
              {hasCategories && <th>Company Categories</th>}
              <th className="text-right">Value (USD $M)</th>
              <th>URL</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal, i) => (
              <tr key={i} className="aapl-ma-table-row">
                <td className="aapl-ma-td-date">{deal.date}</td>
                <td className="aapl-ma-td-company">{deal.acquiredCompany}</td>
                {hasCategories && <td>{deal.categories ? <span className="aapl-ma-industry-pill">{deal.categories}</span> : null}</td>}
                <td className="text-right aapl-ma-td-value">
                  {deal.valueM != null ? `$${deal.valueM.toLocaleString()}M` : <span className="aapl-ma-undisclosed">Undisclosed</span>}
                </td>
                <td>
                  <a href={deal.url} className="aapl-ma-news-link"><ExternalLinkIcon /> Link</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SimTestPage() {
  return (
    <div style={{ padding: '24px 32px', background: '#f3f4f6', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#1a2332' }}>
        🧪 Simulation: Null / Empty Tag Fix
      </h1>
      <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 14 }}>
        This page demonstrates the bug fix for null/empty tag values. Mock data is used — original data files are untouched.
      </p>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#374151' }}>
        Case 1 — Investment: Mixed (some valid tags, some empty)
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
        Data has 2 valid categories ("Artificial Intelligence", "Robotics") and 3 rows with empty categories.
        The filter bar shows only valid categories. Empty-category rows still appear in the table with a blank pill hidden.
      </p>
      <SimInvestmentPanel deals={MOCK_INVESTMENT_DEALS} title="Investment — Mixed Tags (fix applied)" />

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#374151', marginTop: 24 }}>
        Case 2 — Acquisition: All tags are empty/null
      </h2>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
        All acquisition records have empty categories. The CATEGORY filter bar is hidden entirely, and the "Company Categories" column is not shown in the table.
      </p>
      <SimAcquisitionPanel deals={MOCK_ACQ_DEALS_ALL_EMPTY} title="Acquisition — All Empty Tags (fix applied)" />
    </div>
  );
}
