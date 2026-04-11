'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { getCompanies, getStatement, STATEMENT_TABS } from '@/app/data/financialData';
import type { StatementKey } from '@/app/data/financialData';
import { BASE_PATH } from '@/app/lib/basePath';

// ─── Icons ───────────────────────────────────────────────────────────────────

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 48 48" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d="M6 36L16 24L24 30L34 16L42 22"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Section-row detection ───────────────────────────────────────────────────

/**
 * Items whose value array is all empty strings are treated as section header
 * rows in the table. The label itself may contain decorative dashes (e.g.
 * "— ASSETS —") which are displayed as a full-width section divider.
 */
function isSectionLabel(values: string[]): boolean {
  return values.every((v) => v === '' || v === '—');
}

/** Format a cell: colour negative numbers red, positive green for ratio/growth rows. */
function CellValue({ value, isLabel }: { value: string; isLabel?: boolean }) {
  if (isLabel) return <>{value}</>;
  if (value === 'N/A' || value === '—' || value === '') return <>{value}</>;
  const isNeg = value.startsWith('-') && value !== '-';
  const isPos =
    value.startsWith('+') ||
    (value.endsWith('%') && !value.startsWith('-') && parseFloat(value) > 0);
  if (isNeg) return <span className="fd-neg">{value}</span>;
  if (isPos) return <span className="fd-pos">{value}</span>;
  return <>{value}</>;
}

// ─── CSV download helper ─────────────────────────────────────────────────────

function downloadCsv(symbol: string, companyName: string, tabKey: StatementKey) {
  const stmt = getStatement(tabKey);
  const data = stmt[symbol];
  if (!data) return;

  const headerRow = ['Metric', ...data.periods];
  const bodyRows = Object.entries(data.items).map(([label, values]) => [label, ...values]);
  const lines = [
    [`${companyName} (${symbol}) — ${STATEMENT_TABS.find((t) => t.key === tabKey)?.label ?? tabKey}`],
    headerRow,
    ...bodyRows,
  ];
  const csv = lines
    .map((row) => row.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${symbol}_${tabKey}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Company logo map ────────────────────────────────────────────────────────

const COMPANY_LOGOS: Record<string, string> = {
  AAPL: `${BASE_PATH}/images/logos/AAPL.svg`,
  NVDA: `${BASE_PATH}/images/logos/NVDA.svg`,
  AMD: `${BASE_PATH}/images/logos/AMD.svg`,
  QCOM: `${BASE_PATH}/images/logos/QCOM.svg`,
  AVGO: `${BASE_PATH}/images/logos/AVGO.svg`,
  MRVL: `${BASE_PATH}/images/logos/MRVL.svg`,
  NXPI: `${BASE_PATH}/images/logos/NXPI.svg`,
  STM: `${BASE_PATH}/images/logos/STM.svg`,
  SONY: `${BASE_PATH}/images/logos/SONY.svg`,
  TXN: `${BASE_PATH}/images/logos/TXN.svg`,
};

function CompanyBadge({ symbol, name }: { symbol: string; name: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logoUrl = COMPANY_LOGOS[symbol];

  if (logoUrl && !imgFailed) {
    return (
      <div className="fd-company-badge fd-company-badge--logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
          alt={`${name} logo`}
          width={28}
          height={28}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return <div className="fd-company-badge">{symbol.slice(0, 4)}</div>;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FinancialDataCompanyContentProps {
  symbol: string;
}

export default function FinancialDataCompanyContent({ symbol }: FinancialDataCompanyContentProps) {
  const [activeTab, setActiveTab] = useState<StatementKey>('income');

  const company = getCompanies().find((c) => c.symbol === symbol) ?? null;
  const stmtData = company ? getStatement(activeTab)[company.symbol] : null;

  const handleDownload = useCallback(() => {
    if (company) downloadCsv(company.symbol, company.name, activeTab);
  }, [company, activeTab]);

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="fd-layout">
            {/* ── Top bar: Back button + breadcrumb ── */}
            <div className="fd-detail-topbar">
              <div className="fd-detail-topbar-left">
                <Link href="/market-data/financial-data/" className="cp-back-btn">
                  <BackArrowIcon />
                  Back
                </Link>
                <div className="cp-breadcrumb">
                  <span className="cp-breadcrumb-text">Financial Data /</span>
                  <h1 className="cp-company-name">{company ? company.symbol : symbol}</h1>
                  {company && <span className="cp-breadcrumb-subname">{company.name}</span>}
                </div>
              </div>
            </div>

            {company ? (
              <>
                {/* ── Company header ── */}
                <div className="fd-company-header">
                  <CompanyBadge symbol={company.symbol} name={company.name} />
                  <div className="fd-company-info">
                    <div className="fd-company-symbol fd-company-symbol--header">{company.symbol}</div>
                    <div className="fd-company-meta">
                      <span className="fd-company-name fd-company-name--attr">{company.name}</span>
                      <span className="fd-company-sector">{company.sector}</span>
                      <span className="fd-company-cap">Market Cap: ~{company.marketCap}</span>
                    </div>
                    <p className="fd-company-desc">{company.description}</p>
                  </div>
                  <button
                    className="fd-download-btn"
                    onClick={handleDownload}
                    disabled={!stmtData}
                    aria-label="Download CSV"
                  >
                    <DownloadIcon />
                    Download CSV
                  </button>
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
                            <th>Metric</th>
                            {stmtData.periods.map((period, i) => (
                              <th key={i}>{period}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(stmtData.items).map(([label, values], ri) =>
                            isSectionLabel(values) ? (
                              <tr key={ri} className="fd-row-section">
                                <td colSpan={stmtData.periods.length + 1}>{label}</td>
                              </tr>
                            ) : (
                              <tr key={ri}>
                                <td>
                                  <CellValue value={label} isLabel />
                                </td>
                                {values.map((cell, ci) => (
                                  <td key={ci}>
                                    <CellValue value={cell} />
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
                        Financial data for {symbol} is not available in this view.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ── Company not found ── */
              <div className="fd-content">
                <div className="fd-empty-state">
                  <div className="fd-empty-icon">
                    <ChartIcon />
                  </div>
                  <p className="fd-empty-title">Company not found</p>
                  <p className="fd-empty-sub">
                    No data found for symbol &ldquo;{symbol}&rdquo;.{' '}
                    <Link href="/market-data/financial-data/" className="fd-back-link">
                      Return to Financial Data
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
