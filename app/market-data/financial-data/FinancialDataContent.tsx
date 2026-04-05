'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { getCompanies, getStatement, STATEMENT_TABS } from '@/app/data/financialData';
import type { CompanyInfo, StatementKey } from '@/app/data/financialData';

// ─── Icons ───────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
      <path
        d="M8 2v8M5 7l3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12h12"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
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

// ─── Section-row detection ───────────────────────────────────────────────────

/** Rows where all non-first cells are empty are used as section headers. */
function isSectionRow(row: string[]): boolean {
  return row.slice(1).every((cell) => cell === '' || cell === '—');
}

/** Format a cell: colour negative numbers red, positive green for ratio/growth rows. */
function CellValue({ value, colIdx }: { value: string; colIdx: number }) {
  if (colIdx === 0) return <>{value}</>;
  const isNeg =
    (value.startsWith('-') && value !== '-') || value === 'N/A';
  const isPos = value.startsWith('+') || (value.endsWith('%') && !value.startsWith('-') && parseFloat(value) > 0);
  if (isNeg) return <span className="fd-neg">{value}</span>;
  if (isPos) return <span className="fd-pos">{value}</span>;
  return <>{value}</>;
}

// ─── CSV download helper ─────────────────────────────────────────────────────

function downloadCsv(company: CompanyInfo, tabKey: StatementKey) {
  const stmt = getStatement(tabKey);
  const data = stmt[company.symbol];
  if (!data) return;

  const lines = [
    [`${company.name} (${company.symbol}) — ${STATEMENT_TABS.find((t) => t.key === tabKey)?.label ?? tabKey}`],
    data.columns,
    ...data.rows,
  ];
  const csv = lines.map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${company.symbol}_${tabKey}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main component ───────────────────────────────────────────────────────────

const COMPANIES = getCompanies();

export default function FinancialDataContent() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<CompanyInfo | null>(null);
  const [activeTab, setActiveTab] = useState<StatementKey>('income');
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

  const handleSelect = useCallback((company: CompanyInfo) => {
    setSelected(company);
    setQuery(company.symbol);
    setIsOpen(false);
    setActiveTab('income');
  }, []);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
  };

  // Statement data for selected company + active tab
  const stmtData = selected ? getStatement(activeTab)[selected.symbol] : null;

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="fd-layout">
            {/* ── Search bar ── */}
            <div className="fd-search-bar">
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
                        className={`fd-search-item${selected?.symbol === c.symbol ? ' active' : ''}`}
                        role="option"
                        aria-selected={selected?.symbol === c.symbol}
                        onClick={() => handleSelect(c)}
                      >
                        <span className="fd-search-item-symbol">{c.symbol}</span>
                        <span className="fd-search-item-name">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="fd-download-btn"
                onClick={() => selected && downloadCsv(selected, activeTab)}
                disabled={!selected || !stmtData}
                aria-label="Download CSV"
              >
                <DownloadIcon />
                Download CSV
              </button>
            </div>

            {selected ? (
              <>
                {/* ── Company header ── */}
                <div className="fd-company-header">
                  <div className="fd-company-badge">{selected.symbol.slice(0, 4)}</div>
                  <div className="fd-company-info">
                    <h1 className="fd-company-name">{selected.name}</h1>
                    <div className="fd-company-meta">
                      <span className="fd-company-symbol">{selected.symbol}</span>
                      <span className="fd-company-sector">{selected.sector}</span>
                      <span className="fd-company-cap">Market Cap: ~{selected.marketCap}</span>
                    </div>
                    <p style={{ margin: '6px 0 0', fontSize: 12.5, color: 'var(--c-text-3)', lineHeight: 1.55 }}>
                      {selected.description}
                    </p>
                  </div>
                </div>

                {/* ── Statement tabs ── */}
                <div className="fd-tabs" role="tablist">
                  {STATEMENT_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      className={`fd-tab${activeTab === tab.key ? ' active' : ''}`}
                      role="tab"
                      aria-selected={activeTab === tab.key}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ── Statement table ── */}
                <div className="fd-content">
                  {stmtData ? (
                    <div className="fd-table-wrap">
                      <table className="fd-table">
                        <thead>
                          <tr>
                            {stmtData.columns.map((col, i) => (
                              <th key={i}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {stmtData.rows.map((row, ri) =>
                            isSectionRow(row) ? (
                              <tr key={ri} className="fd-row-section">
                                <td colSpan={stmtData.columns.length}>{row[0]}</td>
                              </tr>
                            ) : (
                              <tr key={ri}>
                                {row.map((cell, ci) => (
                                  <td key={ci}>
                                    <CellValue value={cell} colIdx={ci} />
                                  </td>
                                ))}
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="fd-empty-state">
                      <div className="fd-empty-icon">
                        <ChartIcon />
                      </div>
                      <p className="fd-empty-title">No data available</p>
                      <p className="fd-empty-sub">
                        Financial data for {selected.symbol} is not available in this view.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ── Empty / landing state ── */
              <div className="fd-content">
                <div className="fd-empty-state">
                  <div className="fd-empty-icon">
                    <ChartIcon />
                  </div>
                  <p className="fd-empty-title">Select a Company</p>
                  <p className="fd-empty-sub">
                    Search for a company symbol above to view its financial statements.
                    <br />
                    Showing data for TSMC&apos;s key customers.
                  </p>
                  <div className="fd-hint-grid">
                    {COMPANIES.map((c) => (
                      <button
                        key={c.symbol}
                        className="fd-hint-btn"
                        onClick={() => handleSelect(c)}
                      >
                        <span className="fd-hint-symbol">{c.symbol}</span>
                        <span className="fd-hint-name">{c.name.split(' ').slice(0, 2).join(' ')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
