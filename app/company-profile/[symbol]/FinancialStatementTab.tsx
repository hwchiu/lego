'use client';

import { useState, useMemo } from 'react';
import { extractJson } from '@/app/lib/parseContent';
import tsmFinStmtMd from '@/content/tsm-financial-statement.md';

// ── Types ─────────────────────────────────────────────────────────────────────
type StatementType = 'income' | 'balance' | 'cashflow' | 'segment';
type ViewMode = 'quarterly' | 'annual';
type Currency = 'original' | 'usd';

// ── Financial data ─────────────────────────────────────────────────────────────
// Source: Apple Inc. SEC 10-Q / 10-K filings. All dollar values in $M.
// Apple fiscal year ends in late September. Q1=Oct-Dec, Q2=Jan-Mar, Q3=Apr-Jun, Q4=Jul-Sep.

interface QuarterData {
  label: string; // e.g. "FY2025 Q1"
  year: number;
  quarter: number; // 1–4
  revenue: number;
  seqGrowth: number | null; // percent
  yoyGrowth: number | null; // percent
  cogs: number;
  grossProfit: number;
  grossMargin: number; // percent
  opEx: number;
  rdExpense: number;
  sgaExpense: number;
  opIncome: number;
  opMargin: number; // percent
  ebt: number;
  ebtMargin: number; // percent
  taxExpense: number;
  netIncome: number;
  netMargin: number; // percent
  eps: number;
  marketCap: number; // in $B
}

const QUARTERLY_DATA: QuarterData[] = [
  // FY2023
  {
    label: 'FY23 Q1', year: 2023, quarter: 1,
    revenue: 117154, seqGrowth: 30.17, yoyGrowth: -5.48,
    cogs: 66822, grossProfit: 50332, grossMargin: 42.97,
    opEx: 14316, rdExpense: 7709, sgaExpense: 6607,
    opIncome: 36016, opMargin: 30.74,
    ebt: 36416, ebtMargin: 31.08,
    taxExpense: 6457, netIncome: 29959, netMargin: 25.57,
    eps: 1.88, marketCap: 2070,
  },
  {
    label: 'FY23 Q2', year: 2023, quarter: 2,
    revenue: 94836, seqGrowth: -19.05, yoyGrowth: -2.51,
    cogs: 52860, grossProfit: 41976, grossMargin: 44.26,
    opEx: 13658, rdExpense: 7457, sgaExpense: 6201,
    opIncome: 28318, opMargin: 29.86,
    ebt: 29118, ebtMargin: 30.70,
    taxExpense: 4958, netIncome: 24160, netMargin: 25.47,
    eps: 1.52, marketCap: 2650,
  },
  {
    label: 'FY23 Q3', year: 2023, quarter: 3,
    revenue: 81797, seqGrowth: -13.75, yoyGrowth: -1.40,
    cogs: 45384, grossProfit: 36413, grossMargin: 44.51,
    opEx: 13415, rdExpense: 7442, sgaExpense: 5973,
    opIncome: 22998, opMargin: 28.12,
    ebt: 23748, ebtMargin: 29.03,
    taxExpense: 3867, netIncome: 19881, netMargin: 24.30,
    eps: 1.26, marketCap: 3010,
  },
  {
    label: 'FY23 Q4', year: 2023, quarter: 4,
    revenue: 89498, seqGrowth: 9.41, yoyGrowth: -0.72,
    cogs: 49071, grossProfit: 40427, grossMargin: 45.17,
    opEx: 13458, rdExpense: 7307, sgaExpense: 6151,
    opIncome: 26969, opMargin: 30.13,
    ebt: 27719, ebtMargin: 30.97,
    taxExpense: 4763, netIncome: 22956, netMargin: 25.65,
    eps: 1.46, marketCap: 2730,
  },
  // FY2024
  {
    label: 'FY24 Q1', year: 2024, quarter: 1,
    revenue: 119575, seqGrowth: 33.60, yoyGrowth: 2.07,
    cogs: 64720, grossProfit: 54855, grossMargin: 45.88,
    opEx: 14482, rdExpense: 7696, sgaExpense: 6786,
    opIncome: 40373, opMargin: 33.77,
    ebt: 41582, ebtMargin: 34.77,
    taxExpense: 7666, netIncome: 33916, netMargin: 28.37,
    eps: 2.18, marketCap: 2990,
  },
  {
    label: 'FY24 Q2', year: 2024, quarter: 2,
    revenue: 95359, seqGrowth: -20.25, yoyGrowth: 0.55,
    cogs: 50492, grossProfit: 44867, grossMargin: 47.04,
    opEx: 14371, rdExpense: 7903, sgaExpense: 6468,
    opIncome: 30496, opMargin: 31.98,
    ebt: 31411, ebtMargin: 32.94,
    taxExpense: 6631, netIncome: 24780, netMargin: 25.99,
    eps: 1.65, marketCap: 2640,
  },
  {
    label: 'FY24 Q3', year: 2024, quarter: 3,
    revenue: 94036, seqGrowth: -1.39, yoyGrowth: 14.96,
    cogs: 50318, grossProfit: 43718, grossMargin: 46.49,
    opEx: 14326, rdExpense: 8006, sgaExpense: 6320,
    opIncome: 29392, opMargin: 31.26,
    ebt: 30274, ebtMargin: 32.20,
    taxExpense: 6840, netIncome: 23434, netMargin: 24.92,
    eps: 1.57, marketCap: 3270,
  },
  {
    label: 'FY24 Q4', year: 2024, quarter: 4,
    revenue: 102466, seqGrowth: 8.97, yoyGrowth: 14.49,
    cogs: 54125, grossProfit: 48341, grossMargin: 47.17,
    opEx: 14038, rdExpense: 7764, sgaExpense: 6274,
    opIncome: 34303, opMargin: 33.48,
    ebt: 35332, ebtMargin: 34.48,
    taxExpense: 7866, netIncome: 27466, netMargin: 26.80,
    eps: 1.85, marketCap: 3490,
  },
  // FY2025
  {
    label: 'FY25 Q1', year: 2025, quarter: 1,
    revenue: 143756, seqGrowth: 40.30, yoyGrowth: 20.22,
    cogs: 74525, grossProfit: 69231, grossMargin: 48.15,
    opEx: 18379, rdExpense: 10830, sgaExpense: 7549,
    opIncome: 50852, opMargin: 35.37,
    ebt: 59413, ebtMargin: 41.33,
    taxExpense: 17316, netIncome: 42097, netMargin: 29.28,
    eps: 2.84, marketCap: 3820,
  },
];

// Annual aggregates (sum of 4 quarters or available quarters)
interface AnnualData {
  label: string;
  year: number;
  revenue: number;
  seqGrowth: number | null;
  yoyGrowth: number | null;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  opEx: number;
  rdExpense: number;
  sgaExpense: number;
  opIncome: number;
  opMargin: number;
  ebt: number;
  ebtMargin: number;
  taxExpense: number;
  netIncome: number;
  netMargin: number;
  eps: number;
  marketCap: number;
}

const ANNUAL_DATA: AnnualData[] = [
  {
    label: 'FY2021', year: 2021,
    revenue: 365817, seqGrowth: null, yoyGrowth: 33.26,
    cogs: 212981, grossProfit: 152836, grossMargin: 41.78,
    opEx: 43887, rdExpense: 21914, sgaExpense: 21973,
    opIncome: 108949, opMargin: 29.78,
    ebt: 109736, ebtMargin: 29.99,
    taxExpense: 14527, netIncome: 94680, netMargin: 25.88,
    eps: 5.67, marketCap: 2913,
  },
  {
    label: 'FY2022', year: 2022,
    revenue: 394328, seqGrowth: null, yoyGrowth: 7.79,
    cogs: 223546, grossProfit: 170782, grossMargin: 43.31,
    opEx: 51345, rdExpense: 26251, sgaExpense: 25094,
    opIncome: 119437, opMargin: 30.29,
    ebt: 120233, ebtMargin: 30.49,
    taxExpense: 19300, netIncome: 99803, netMargin: 25.31,
    eps: 6.11, marketCap: 2066,
  },
  {
    label: 'FY2023', year: 2023,
    revenue: 383285, seqGrowth: null, yoyGrowth: -2.80,
    cogs: 214137, grossProfit: 169148, grossMargin: 44.13,
    opEx: 54847, rdExpense: 29915, sgaExpense: 24932,
    opIncome: 114301, opMargin: 29.82,
    ebt: 117001, ebtMargin: 30.53,
    taxExpense: 20145, netIncome: 96956, netMargin: 25.30,
    eps: 6.12, marketCap: 2730,
  },
  {
    label: 'FY2024', year: 2024,
    revenue: 411436, seqGrowth: null, yoyGrowth: 7.35,
    cogs: 219552, grossProfit: 191884, grossMargin: 46.64,
    opEx: 57217, rdExpense: 31369, sgaExpense: 25848,
    opIncome: 134564, opMargin: 32.70,
    ebt: 138599, ebtMargin: 33.69,
    taxExpense: 29749, netIncome: 93736, netMargin: 22.78,
    eps: 6.11, marketCap: 3490,
  },
];

// ── Row definitions ────────────────────────────────────────────────────────────
interface RowDef {
  key: keyof QuarterData | keyof AnnualData;
  label: string;
  format: 'money' | 'percent' | 'eps' | 'marketcap' | 'growth';
}

const ROW_DEFS: RowDef[] = [
  { key: 'revenue',     label: 'Revenue ($M)',           format: 'money' },
  { key: 'seqGrowth',  label: 'Sequential Growth (%)',   format: 'growth' },
  { key: 'yoyGrowth',  label: 'YoY Growth (%)',          format: 'growth' },
  { key: 'cogs',       label: 'COGS ($M)',               format: 'money' },
  { key: 'grossProfit',label: 'Gross Profit ($M)',        format: 'money' },
  { key: 'grossMargin',label: 'Gross Margin (%)',         format: 'percent' },
  { key: 'opEx',       label: 'Operating Expense ($M)',  format: 'money' },
  { key: 'rdExpense',  label: 'R&D Expense ($M)',         format: 'money' },
  { key: 'sgaExpense', label: 'SG&A Expense ($M)',        format: 'money' },
  { key: 'opIncome',   label: 'Operating Income ($M)',   format: 'money' },
  { key: 'opMargin',   label: 'Operating Margin (%)',    format: 'percent' },
  { key: 'ebt',        label: 'EBT ($M)',                format: 'money' },
  { key: 'ebtMargin',  label: 'EBT Margin (%)',          format: 'percent' },
  { key: 'taxExpense', label: 'Tax Expense ($M)',        format: 'money' },
  { key: 'netIncome',  label: 'Net Income ($M)',         format: 'money' },
  { key: 'netMargin',  label: 'Net Margin (%)',          format: 'percent' },
  { key: 'eps',        label: 'Earnings per Share ($)',  format: 'eps' },
  { key: 'marketCap',  label: 'Market Cap ($B)',         format: 'marketcap' },
];

const STATEMENT_ITEMS: { key: StatementType; label: string }[] = [
  { key: 'income',    label: 'Income Statement' },
  { key: 'balance',   label: 'Balance Sheet' },
  { key: 'cashflow',  label: 'Cash Flow Statement' },
  { key: 'segment',   label: 'Segment Report' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(val: number | null, format: RowDef['format']): string {
  if (val === null || val === undefined) return '—';
  switch (format) {
    case 'money':
      return val.toLocaleString('en-US');
    case 'percent':
      return val.toFixed(2) + '%';
    case 'growth': {
      const sign = val >= 0 ? '+' : '';
      return sign + val.toFixed(2) + '%';
    }
    case 'eps':
      return '$' + val.toFixed(2);
    case 'marketcap':
      return '$' + val.toLocaleString('en-US') + 'B';
    default:
      return String(val);
  }
}

function getCellClass(val: number | null, format: RowDef['format']): string {
  if (format === 'growth' && val !== null) {
    return val < 0 ? 'fin-stmt-neg' : '';
  }
  return '';
}

// ── Component ──────────────────────────────────────────────────────────────────
interface FinancialStatementTabProps {
  symbol: string;
}

// Lazily parsed TSM data from markdown
let _tsmParsed: { quarterlyData: QuarterData[]; annualData: AnnualData[] } | null = null;
function getTsmData() {
  if (!_tsmParsed) {
    _tsmParsed = extractJson<{ quarterlyData: QuarterData[]; annualData: AnnualData[] }>(
      tsmFinStmtMd as string,
    );
  }
  return _tsmParsed;
}

export default function FinancialStatementTab({ symbol }: FinancialStatementTabProps) {
  const [statementType, setStatementType] = useState<StatementType>('income');
  const [viewMode, setViewMode] = useState<ViewMode>('quarterly');
  const [currency, setCurrency] = useState<Currency>('original');

  // Select data source based on symbol
  const isTsm = symbol === 'TSM';
  const tsmData = useMemo(() => (isTsm ? getTsmData() : null), [isTsm]);

  const allQuarterlyData: QuarterData[] = isTsm ? (tsmData?.quarterlyData ?? []) : QUARTERLY_DATA;
  const allAnnualData: AnnualData[] = isTsm ? (tsmData?.annualData ?? []) : ANNUAL_DATA;

  // Year window for quarterly view: show 2 fiscal years at a time
  const availableYears = [...new Set(allQuarterlyData.map((q) => q.year))].sort((a, b) => a - b);
  // If no quarterly data available (shouldn't happen for AAPL/TSM), fall back gracefully
  const safeAvailableYears =
    availableYears.length > 0
      ? availableYears
      : [new Date().getFullYear() - 1, new Date().getFullYear()];
  const maxYearWindowStart = safeAvailableYears[safeAvailableYears.length - 1] - 1;
  const defaultStart = Math.max(
    safeAvailableYears[0],
    safeAvailableYears[safeAvailableYears.length - 1] - 1,
  );
  const [yearWindowStart, setYearWindowStart] = useState(defaultStart);

  const prevYear = () => setYearWindowStart((y) => Math.max(safeAvailableYears[0], y - 1));
  const nextYear = () => setYearWindowStart((y) => Math.min(maxYearWindowStart, y + 1));

  // Columns in quarterly view: show 2 fiscal years
  const visibleQuarters = allQuarterlyData.filter(
    (q) => q.year === yearWindowStart || q.year === yearWindowStart + 1,
  );

  // Columns in annual view
  const visibleAnnual = allAnnualData;

  const minYear = safeAvailableYears[0];
  const maxYear = safeAvailableYears[safeAvailableYears.length - 1];

  const yearLabel = viewMode === 'quarterly'
    ? `FY${yearWindowStart}–FY${yearWindowStart + 1}`
    : `FY${minYear}–FY${maxYear}`;

  const canGoPrev = viewMode === 'quarterly' && yearWindowStart > safeAvailableYears[0];
  const canGoNext = viewMode === 'quarterly' && yearWindowStart < maxYearWindowStart;

  // Show placeholder for symbols with no data
  if (!isTsm && symbol !== 'AAPL') {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">
          Financial Statement for {symbol} — Content coming soon
        </span>
      </div>
    );
  }

  return (
    <div className="fin-stmt-layout">
      {/* ── Left sidebar ── */}
      <aside className="fin-stmt-sidebar">
        <nav className="fin-stmt-nav">
          {STATEMENT_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`fin-stmt-nav-item${statementType === item.key ? ' active' : ''}`}
              onClick={() => setStatementType(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Right content area ── */}
      <div className="fin-stmt-content">
        {/* Toolbar */}
        <div className="fin-stmt-toolbar">
          {/* Year navigation */}
          <div className="fin-stmt-year-nav">
            <button
              className="wl-quarter-btn"
              aria-label="Previous year"
              onClick={prevYear}
              disabled={!canGoPrev}
            >
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                <path
                  d="M9 2.5L4.5 7L9 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="wl-quarter-label fin-stmt-year-label">
              {yearLabel}
            </span>
            <button
              className="wl-quarter-btn"
              aria-label="Next year"
              onClick={nextYear}
              disabled={!canGoNext}
            >
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                <path
                  d="M5 2.5L9.5 7L5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="fin-stmt-toolbar-right">
            {/* Annual / Quarterly toggle */}
            <div className="toggle-group">
              <button
                className={`toggle-btn${viewMode === 'annual' ? ' active' : ''}`}
                onClick={() => setViewMode('annual')}
              >
                Annual Report
              </button>
              <button
                className={`toggle-btn${viewMode === 'quarterly' ? ' active' : ''}`}
                onClick={() => setViewMode('quarterly')}
              >
                Quarterly Report
              </button>
            </div>

            {/* Currency toggle */}
            <div className="toggle-group">
              <button
                className={`toggle-btn${currency === 'original' ? ' active' : ''}`}
                onClick={() => setCurrency('original')}
              >
                Original Currency
              </button>
              <button
                className={`toggle-btn${currency === 'usd' ? ' active' : ''}`}
                onClick={() => setCurrency('usd')}
              >
                USD
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        {statementType === 'income' ? (
          <>
            <div className="fin-stmt-table-wrap">
            <table className="data-table fin-stmt-table">
              <thead>
                {viewMode === 'quarterly' ? (
                  <>
                    <tr>
                      <th rowSpan={2} className="fin-stmt-th-item">
                        <div className="fin-stmt-th-item-inner">
                          <span className="fin-stmt-th-year">Year</span>
                          <span className="fin-stmt-th-divider" />
                          <span className="fin-stmt-th-item-label">Item</span>
                        </div>
                      </th>
                      {/* Group headers by fiscal year */}
                      {Array.from(new Set(visibleQuarters.map((q) => q.year))).map((yr) => (
                        <th
                          key={yr}
                          colSpan={visibleQuarters.filter((q) => q.year === yr).length}
                          className="th-group"
                        >
                          FY{yr}
                        </th>
                      ))}
                    </tr>
                    <tr className="sub-head">
                      {visibleQuarters.map((q) => (
                        <th key={q.label} className="sub-group-inner">
                          Q{q.quarter}
                        </th>
                      ))}
                    </tr>
                  </>
                ) : (
                  <tr>
                    <th className="fin-stmt-th-item">
                      <div className="fin-stmt-th-item-inner">
                        <span className="fin-stmt-th-year">Year</span>
                        <span className="fin-stmt-th-divider" />
                        <span className="fin-stmt-th-item-label">Item</span>
                      </div>
                    </th>
                    {visibleAnnual.map((a) => (
                      <th key={a.label}>{a.label}</th>
                    ))}
                  </tr>
                )}
              </thead>
              <tbody>
                {ROW_DEFS.map((row) => (
                  <tr key={row.key}>
                    <td className="fin-stmt-td-item">{row.label}</td>
                    {viewMode === 'quarterly'
                      ? visibleQuarters.map((q) => {
                          const raw = q[row.key as keyof QuarterData] as number | null;
                          return (
                            <td
                              key={q.label}
                              className={`td-num ${getCellClass(raw, row.format)}`}
                            >
                              {fmt(raw, row.format)}
                            </td>
                          );
                        })
                      : visibleAnnual.map((a) => {
                          const raw = a[row.key as keyof AnnualData] as number | null;
                          return (
                            <td
                              key={a.label}
                              className={`td-num ${getCellClass(raw, row.format)}`}
                            >
                              {fmt(raw, row.format)}
                            </td>
                          );
                        })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <div className="cp-tab-placeholder">
            <span className="cp-tab-placeholder-text">
              {STATEMENT_ITEMS.find((s) => s.key === statementType)?.label} — Content coming soon
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
