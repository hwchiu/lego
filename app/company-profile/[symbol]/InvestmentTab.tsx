'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getInvestmentByCoCd, InvestmentDeal, InvestmentResult } from '@/app/lib/getInvestmentByCoCd';

const InvestmentBarLineChartNivo = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.InvestmentBarLineChartNivo),
  { ssr: false, loading: () => <div style={{ height: 260, background: '#f3f4f6', borderRadius: 8 }} /> },
);
// ── Company Investment Panel ───────────────────────────────────────────────────

const CHART_START_YEAR = 2012;
const CHART_END_YEAR = 2026;

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 1h4v4M7 6l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CompanyInvestmentPanel({ deals, companyName }: { deals: InvestmentDeal[]; companyName: string }) {
  const allCategories = [...new Set(deals.flatMap((d) => d.categories))].sort();
  const hasCategories = allCategories.length > 0;

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [filterExpanded, setFilterExpanded] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const filteredDeals =
    selectedCategories.size === 0
      ? deals
      : deals.filter((d) => d.categories.some((c) => selectedCategories.has(c)));

  const sortedDeals = [...filteredDeals]
    .filter((d) => selectedYear === null || d.date.startsWith(selectedYear))
    .sort((a, b) => b.date.localeCompare(a.date));

  function handleYearClick(year: string | null) {
    setSelectedYear(year);
    if (year !== null) {
      setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }

  return (
    <div className="aapl-ma-panel">
      {/* ── Category filter bar ── */}
      {hasCategories && (
      <div className={`aapl-ma-filter-bar${filterExpanded ? ' aapl-ma-filter-bar--expanded' : ''}`}>
        <span className="aapl-ma-filter-label">CATEGORY</span>
        <div className={filterExpanded ? 'aapl-ma-tags-wrap' : 'aapl-ma-tags-scroll'}>
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
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {selectedCategories.size > 0 && (
          <button className="aapl-ma-clear-btn" onClick={() => setSelectedCategories(new Set())}>
            Clear
          </button>
        )}
        <button
          className="aapl-ma-expand-btn"
          onClick={() => setFilterExpanded((v) => !v)}
          aria-label={filterExpanded ? 'Collapse filter' : 'Expand filter'}
          title={filterExpanded ? 'Collapse' : 'Expand'}
        >
          {filterExpanded ? (
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M2 9l5-5 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
              <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      )}

      {/* ── Bar + Line chart ── */}
      <div className="aapl-ma-chart-section">
        <div className="aapl-ma-section-title">
          {companyName} — Annual Investment Activity ({CHART_START_YEAR}–{CHART_END_YEAR})
          {selectedCategories.size > 0 && (
            <span className="aapl-ma-filter-note"> · Filtered: {[...selectedCategories].join(', ')}</span>
          )}
        </div>
        <InvestmentBarLineChartNivo deals={filteredDeals} selectedYear={selectedYear} onYearClick={handleYearClick} />
      </div>

      {/* ── Table ── */}
      <div className="aapl-ma-table-section" ref={tableRef}>
        <div className="aapl-ma-section-title">
          Table View ({sortedDeals.length} deal{sortedDeals.length !== 1 ? 's' : ''}
          {selectedCategories.size > 0 ? ', filtered' : ''}
          {selectedYear ? `, ${selectedYear}` : ''})
          {selectedYear && (
            <button
              className="aapl-ma-year-clear-btn"
              onClick={() => setSelectedYear(null)}
              title="Clear year filter"
            >
              × Clear {selectedYear}
            </button>
          )}
        </div>
        <div className="aapl-ma-table-wrap">
          <table className="aapl-ma-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invested Company</th>
                {hasCategories && <th>Company Categories</th>}
                <th>Round</th>
                <th className="text-right">Value (USD $M)</th>
                <th className="text-right">Investors#</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.map((deal, i) => (
                <tr key={i} className="aapl-ma-table-row">
                  <td className="aapl-ma-td-date">{deal.date}</td>
                  <td className="aapl-ma-td-company">{deal.investedCompany}</td>
                  {hasCategories && (
                    <td>
                      {deal.categories.length > 0
                        ? deal.categories.map((cat, j) => (
                            <span key={j} className="aapl-ma-industry-pill">{cat}</span>
                          ))
                        : null}
                    </td>
                  )}
                  <td><span className="aapl-ma-type-badge aapl-ma-type-acq">{deal.round}</span></td>
                  <td className="text-right aapl-ma-td-value">
                    {deal.valueM != null ? (
                      deal.valueM >= 1000
                        ? `$${(deal.valueM / 1000).toFixed(2)}B`
                        : `$${deal.valueM.toLocaleString()}M`
                    ) : (
                      <span className="aapl-ma-undisclosed">Undisclosed</span>
                    )}
                  </td>
                  <td className="text-right">
                    {deal.investorsNum != null ? deal.investorsNum : <span className="aapl-ma-undisclosed">—</span>}
                  </td>
                  <td>
                    <a href={deal.url} target="_blank" rel="noopener noreferrer" className="aapl-ma-news-link" title="View source">
                      <ExternalLinkIcon />
                      Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface InvestmentTabProps {
  symbol: string;
  preloadedData?: InvestmentResult | null;
}

export default function InvestmentTab({ symbol, preloadedData }: InvestmentTabProps) {
  // Use preloaded data from parent if available, otherwise fetch internally
  const [investmentResult, setInvestmentResult] = useState<InvestmentResult | null>(
    preloadedData !== undefined ? preloadedData : null,
  );
  const [loading, setLoading] = useState(preloadedData === undefined || preloadedData === null);

  useEffect(() => {
    if (preloadedData !== undefined) {
      setInvestmentResult(preloadedData);
      setLoading(preloadedData === null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getInvestmentByCoCd(symbol).then((result) => {
      if (!cancelled) {
        setInvestmentResult(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol, preloadedData]);

  if (loading) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <p className="cp-pec-empty-text">Loading Investment data…</p>
        </div>
      </div>
    );
  }

  if (investmentResult && investmentResult.deals.length > 0) {
    return <CompanyInvestmentPanel deals={investmentResult.deals} companyName={investmentResult.investName} />;
  }

  return (
    <div className="cp-pec-wrap">
      <div className="cp-pec-empty">
        <p className="cp-pec-empty-text">No Investment data available.</p>
      </div>
    </div>
  );
}
