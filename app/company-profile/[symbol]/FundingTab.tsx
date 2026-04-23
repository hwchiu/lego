'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getFundingByCoCd, FundingRecord } from '@/app/lib/getFundingByCoCd';

const FundingLineChartNivo = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.FundingLineChartNivo),
  { ssr: false, loading: () => <div style={{ height: 220, background: '#f3f4f6', borderRadius: 8 }} /> },
);

// ── Types ─────────────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extract YYYY-MM-DD from publ_dt string like "2022-02-16 00:00:00.0" */
function formatDate(publDt: string): string {
  return publDt.slice(0, 10);
}

// ── Funding Panel (used for any company with funding data) ───────────────────

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 1h4v4M7 6l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Format USD value for display: ≥1B → "$X.XB", else "$X,XXXM" */
function formatUsdValueM(valueM: number): string {
  return valueM >= 1000
    ? `$${(valueM / 1000).toFixed(1)}B`
    : `$${valueM.toLocaleString()}M`;
}

function FundingPanel({ symbol, records }: { symbol: string; records: FundingRecord[] }) {

  // Summary card uses fund_amount_usd (converted to millions for display)
  const totalFundingUsd = records.reduce((sum, r) => sum + (r.fund_amount_usd ?? 0), 0);
  const totalFundingM = totalFundingUsd / 1_000_000;

  // Derive company name from first record
  const companyName = records.length > 0 ? records[0].org_name : symbol;

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter + sort by publ_dt (newest first)
  const sortedRecords = [...records]
    .filter((r) => selectedYear === null || r.publ_dt.startsWith(selectedYear))
    .sort((a, b) => b.publ_dt.localeCompare(a.publ_dt));

  // Build chart data: convert money_raised_usd to millions for chart compatibility
  const chartDataPoints = records.map((r) => ({
    date: r.publ_dt.slice(0, 7), // "YYYY-MM"
    valueM: r.money_raised_usd != null ? r.money_raised_usd / 1_000_000 : null,
  }));

  function handleYearClick(year: string | null) {
    setSelectedYear(year);
    if (year !== null) {
      setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }

  return (
    <div className="aapl-ma-panel">
      {/* ── Total Funding Card ── */}
      <div className="aapl-funding-summary-row">
        <div className="aapl-funding-total-card">
          <div className="aapl-funding-total-title">Total Funding Amount (USD $M)</div>
          <div className="aapl-funding-total-value">
            {formatUsdValueM(totalFundingM)}
          </div>
          <div className="aapl-funding-total-sub">{records.length} funding events recorded</div>
        </div>
      </div>

      {/* ── Line chart ── */}
      <div className="aapl-ma-chart-section">
        <div className="aapl-ma-section-title">{companyName} — Annual Funding Amount (USD $M)</div>
        <FundingLineChartNivo deals={chartDataPoints} selectedYear={selectedYear} onYearClick={handleYearClick} />
      </div>

      {/* ── Table ── */}
      <div className="aapl-ma-table-section" ref={tableRef}>
        <div className="aapl-ma-section-title">
          Table View ({sortedRecords.length} event{sortedRecords.length !== 1 ? 's' : ''}
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
                <th>Investors</th>
                <th>Round</th>
                <th className="text-right">Number of Investors</th>
                <th className="text-right">Value (USD $M)</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {sortedRecords.map((record, i) => {
                const valueM = record.money_raised_usd != null ? record.money_raised_usd / 1_000_000 : null;
                return (
                  <tr key={i} className="aapl-ma-table-row">
                    <td className="aapl-ma-td-date">{formatDate(record.publ_dt)}</td>
                    <td className="aapl-ma-td-company">{record.invest_name}</td>
                    <td><span className="aapl-ma-type-badge aapl-ma-type-acq">{record.fund_type}</span></td>
                    <td className="text-right">
                      {record.invest_num != null ? record.invest_num : <span className="aapl-ma-undisclosed">—</span>}
                    </td>
                    <td className="text-right aapl-ma-td-value">
                      {valueM != null ? (
                        valueM >= 1000
                          ? `$${(valueM / 1000).toFixed(2)}B`
                          : `$${valueM.toLocaleString()}M`
                      ) : (
                        <span className="aapl-ma-undisclosed">Undisclosed</span>
                      )}
                    </td>
                    <td>
                      <a href={record.trans_name_url} target="_blank" rel="noopener noreferrer" className="aapl-ma-news-link" title="View source">
                        <ExternalLinkIcon />
                        Link
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface FundingTabProps {
  symbol: string;
  preloadedData?: FundingRecord[] | null;
}

export default function FundingTab({ symbol, preloadedData }: FundingTabProps) {
  // Use preloaded data from parent if available, otherwise fetch internally
  const [fundingRecords, setFundingRecords] = useState<FundingRecord[]>(
    preloadedData !== undefined && preloadedData !== null ? preloadedData : [],
  );
  const [loading, setLoading] = useState(preloadedData === undefined || preloadedData === null);

  useEffect(() => {
    if (preloadedData !== undefined) {
      setFundingRecords(preloadedData ?? []);
      setLoading(preloadedData === null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getFundingByCoCd(symbol).then((records) => {
      if (!cancelled) {
        setFundingRecords(records);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol, preloadedData]);

  if (loading) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <p className="cp-pec-empty-text">Loading Funding data…</p>
        </div>
      </div>
    );
  }

  // Show dedicated funding panel for companies with funding data (filtered by co_cd)
  if (fundingRecords.length > 0) {
    return <FundingPanel symbol={symbol} records={fundingRecords} />;
  }

  return (
    <div className="cp-pec-wrap">
      <div className="cp-pec-empty">
        <p className="cp-pec-empty-text">No Funding data available.</p>
      </div>
    </div>
  );
}
