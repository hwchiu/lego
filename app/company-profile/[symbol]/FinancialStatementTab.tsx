'use client';

import { useState, useMemo } from 'react';
import { resolveSymbolAlias } from '@/app/data/sp500';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';
import tcFinStmtMd from '@/content/tc-financial-statement.md';
import aaplFinStmtMd from '@/content/apple-financial-statement.md';
import { getStatement, getCompanies } from '@/app/data/financialData';
import type { StatementKey, StatementData } from '@/app/data/financialData';

// ── Types ─────────────────────────────────────────────────────────────────────
type StatementType = 'income' | 'balance' | 'cashflow' | 'segment';
type ViewMode = 'quarterly' | 'annual';
type Currency = 'original' | 'usd';

// ── Income Statement types ─────────────────────────────────────────────────────
interface QuarterData {
  label: string;
  year: number;
  quarter: number;
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

// ── Simple table type (Balance Sheet / Cash Flow / Segment) ───────────────────
interface SimpleStatementPeriodData {
  columns: string[];
  rows: string[][];
}

interface SimpleStatementData {
  source: string;
  annualData: SimpleStatementPeriodData;
  quarterlyData: SimpleStatementPeriodData;
}

// ── Row definitions ────────────────────────────────────────────────────────────
interface RowDef {
  key: keyof QuarterData | keyof AnnualData;
  label: string;
  format: 'money' | 'percent' | 'eps' | 'marketcap' | 'growth';
}

const ROW_DEFS: RowDef[] = [
  { key: 'revenue',      label: 'Revenue ($M)',           format: 'money' },
  { key: 'seqGrowth',   label: 'Sequential Growth (%)',   format: 'growth' },
  { key: 'yoyGrowth',   label: 'YoY Growth (%)',          format: 'growth' },
  { key: 'cogs',        label: 'COGS ($M)',               format: 'money' },
  { key: 'grossProfit', label: 'Gross Profit ($M)',        format: 'money' },
  { key: 'grossMargin', label: 'Gross Margin (%)',         format: 'percent' },
  { key: 'opEx',        label: 'Operating Expense ($M)',  format: 'money' },
  { key: 'rdExpense',   label: 'R&D Expense ($M)',         format: 'money' },
  { key: 'sgaExpense',  label: 'SG&A Expense ($M)',        format: 'money' },
  { key: 'opIncome',    label: 'Operating Income ($M)',   format: 'money' },
  { key: 'opMargin',    label: 'Operating Margin (%)',    format: 'percent' },
  { key: 'ebt',         label: 'EBT ($M)',                format: 'money' },
  { key: 'ebtMargin',   label: 'EBT Margin (%)',          format: 'percent' },
  { key: 'taxExpense',  label: 'Tax Expense ($M)',        format: 'money' },
  { key: 'netIncome',   label: 'Net Income ($M)',         format: 'money' },
  { key: 'netMargin',   label: 'Net Margin (%)',          format: 'percent' },
  { key: 'eps',         label: 'Earnings per Share ($)',  format: 'eps' },
  { key: 'marketCap',   label: 'Market Cap ($B)',         format: 'marketcap' },
];

const STATEMENT_ITEMS: { key: StatementType; label: string }[] = [
  { key: 'income',   label: 'Income Statement' },
  { key: 'balance',  label: 'Balance Sheet' },
  { key: 'cashflow', label: 'Cash Flow Statement' },
  { key: 'segment',  label: 'Segment Report' },
];

// ── Unified statement data types ───────────────────────────────────────────────
type IncomeStructuredData = { quarterlyData: QuarterData[]; annualData: AnnualData[] };

type TabDataEntry =
  | { kind: 'income_structured'; data: IncomeStructuredData }
  | { kind: 'simple'; data: SimpleStatementData }
  | { kind: 'findata'; data: StatementData };

type CompanyStatements = Partial<Record<StatementType, TabDataEntry>>;

// ── FinDataTable — renders StatementData from financial-data.md ────────────────

/** Returns true for a quarterly period label like "Q1 FY25" */
function isQuarterlyPeriod(p: string): boolean {
  return /^Q\d/.test(p);
}

function FinDataTable({ data }: { data: StatementData }) {
  const periods = data.periods;

  // Classify each period and build two-row header groups
  type Row1Cell =
    | { type: 'annual'; label: string }
    | { type: 'qgroup'; yearLabel: string; count: number };

  const row1Cells: Row1Cell[] = [];
  const row2Quarters: string[] = [];

  for (const p of periods) {
    if (isQuarterlyPeriod(p)) {
      const yr = parseColYear(p);
      const yearLabel = `FY${yr}`;
      const qLabel = parseColQuarter(p);
      row2Quarters.push(qLabel);
      const last = row1Cells[row1Cells.length - 1];
      if (last && last.type === 'qgroup' && last.yearLabel === yearLabel) {
        last.count++;
      } else {
        row1Cells.push({ type: 'qgroup', yearLabel, count: 1 });
      }
    } else {
      row1Cells.push({ type: 'annual', label: p });
    }
  }

  const hasQuarterly = row2Quarters.length > 0;

  return (
    <div className="fin-stmt-table-wrap">
      <table className="data-table fin-stmt-table fin-stmt-simple-table">
        <thead>
          <tr>
            <th rowSpan={hasQuarterly ? 2 : 1} className="fin-stmt-th-item">
              <div className="fin-stmt-th-item-inner">
                <span className="fin-stmt-th-year">Year</span>
                <span className="fin-stmt-th-divider" />
                <span className="fin-stmt-th-item-label">Item</span>
              </div>
            </th>
            {row1Cells.map((cell, i) =>
              cell.type === 'annual' ? (
                <th key={i} rowSpan={hasQuarterly ? 2 : 1} className="fin-stmt-simple-col-hdr">
                  {cell.label}
                </th>
              ) : (
                <th key={i} colSpan={cell.count} className="th-group">
                  {cell.yearLabel}
                </th>
              )
            )}
          </tr>
          {hasQuarterly && (
            <tr className="sub-head">
              {row2Quarters.map((q, i) => (
                <th key={i} className="sub-group-inner">
                  {q}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {Object.entries(data.items).map(([label, values], ri) => {
            const isSection = values.every((v) => v === '' || v === '—');
            return isSection ? (
              <tr key={ri} className="fin-stmt-section-row">
                <td colSpan={data.periods.length + 1} className="fin-stmt-td-section">
                  {label}
                </td>
              </tr>
            ) : (
              <tr key={ri}>
                <td className="fin-stmt-td-item">{label}</td>
                {values.map((val, ci) => {
                  const isNeg = val.startsWith('-') && val !== '-';
                  const isPos =
                    val.startsWith('+') ||
                    (val.endsWith('%') && !val.startsWith('-') && parseFloat(val) > 0);
                  return (
                    <td
                      key={ci}
                      className={`td-num${isNeg ? ' fin-stmt-neg' : isPos ? ' fin-stmt-pos' : ''}`}
                    >
                      {val || '—'}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(val: number | null, format: RowDef['format']): string {
  if (val === null || val === undefined) return '—';
  switch (format) {
    case 'money':    return val.toLocaleString('en-US');
    case 'percent':  return val.toFixed(2) + '%';
    case 'growth': { const sign = val >= 0 ? '+' : ''; return sign + val.toFixed(2) + '%'; }
    case 'eps':      return '$' + val.toFixed(2);
    case 'marketcap':return '$' + val.toLocaleString('en-US') + 'B';
    default:         return String(val);
  }
}

function getCellClass(val: number | null, format: RowDef['format']): string {
  if (format === 'growth' && val !== null) return val < 0 ? 'fin-stmt-neg' : '';
  return '';
}

/** Returns true for section-header rows (all data cells are empty). */
function isSectionRow(row: string[]): boolean {
  return row.slice(1).every((c) => c === '' || c === '—');
}

// ── Data loaders ───────────────────────────────────────────────────────────────
let _tsmParsed: { quarterlyData: QuarterData[]; annualData: AnnualData[] } | null = null;
function getTcData() {
  if (!_tsmParsed) {
    _tsmParsed = extractJson<{ quarterlyData: QuarterData[]; annualData: AnnualData[] }>(
      tcFinStmtMd as string,
    );
  }
  return _tsmParsed;
}

let _aaplIncomeParsed: { quarterlyData: QuarterData[]; annualData: AnnualData[] } | null = null;
function getAaplIncomeData() {
  if (!_aaplIncomeParsed) {
    _aaplIncomeParsed = extractJsonBySection<{ quarterlyData: QuarterData[]; annualData: AnnualData[] }>(
      aaplFinStmtMd as string,
      'Income Statement',
    );
  }
  return _aaplIncomeParsed;
}

const _aaplSimpleCache: Partial<Record<'balance' | 'cashflow' | 'segment', SimpleStatementData>> = {};
function getAaplSimpleData(key: 'balance' | 'cashflow' | 'segment'): SimpleStatementData {
  if (!_aaplSimpleCache[key]) {
    const sectionMap: Record<typeof key, string> = {
      balance:  'Balance Sheet',
      cashflow: 'Cash Flow Statement',
      segment:  'Segment Report',
    };
    _aaplSimpleCache[key] = extractJsonBySection<SimpleStatementData>(
      aaplFinStmtMd as string,
      sectionMap[key],
    );
  }
  return _aaplSimpleCache[key]!;
}

/**
 * Returns the available financial statement sections for a given company symbol.
 * All company-specific data-source logic is encapsulated here so the rendering
 * component remains fully generic.  When a backend API is available, replace
 * the body of this function with a single API call.
 */
function getCompanyStatements(symbol: string): CompanyStatements {
  const result: CompanyStatements = {};

  // AAPL: structured income + simple balance / cashflow / segment
  // Checked before financial-data.md because AAPL also appears in that Company List
  // but has richer dedicated data (including Segment Report) in its own markdown file.
  if (symbol === 'AAPL') {
    const incomeData = getAaplIncomeData();
    if (incomeData?.quarterlyData?.length) {
      result.income = { kind: 'income_structured', data: incomeData };
    }
    result.balance  = { kind: 'simple', data: getAaplSimpleData('balance') };
    result.cashflow = { kind: 'simple', data: getAaplSimpleData('cashflow') };
    result.segment  = { kind: 'simple', data: getAaplSimpleData('segment') };
    return result;
  }

  // TC: structured income only
  if (symbol === 'TC') {
    const incomeData = getTcData();
    if (incomeData?.quarterlyData?.length) {
      result.income = { kind: 'income_structured', data: incomeData };
    }
    return result;
  }

  // Financial-data.md companies (income / balance / cashflow; no segment)
  if (getCompanies().some((c) => c.symbol === symbol)) {
    for (const key of ['income', 'balance', 'cashflow'] as const) {
      const data = getStatement(key as StatementKey)[symbol] ?? null;
      if (data) result[key] = { kind: 'findata', data };
    }
    return result;
  }

  return result; // empty → "coming soon" placeholder
}

// ── Simple statement table sub-component ──────────────────────────────────────
interface SimpleStatementTableProps {
  data: SimpleStatementData;
  viewMode: ViewMode;
  yearWindowStart: number;
  allYears: number[];
}

/** Convert a 2-digit year suffix to a full 4-digit year */
function twoDigitToFullYear(yr: number): number {
  return yr >= 90 ? 1900 + yr : 2000 + yr;
}

/** Parse a column label like "FY24 Q1" → 2024, or "FY2024" → 2024 */
function parseColYear(col: string): number {
  const m2 = col.match(/FY(\d{4})/);
  if (m2) return parseInt(m2[1], 10);
  const m1 = col.match(/FY(\d{2})\s/);
  if (m1) return twoDigitToFullYear(parseInt(m1[1], 10));
  const m0 = col.match(/FY(\d{2})$/);
  if (m0) return twoDigitToFullYear(parseInt(m0[1], 10));
  return 0;
}

/** Parse quarter label out of "FY24 Q1" → "Q1" */
function parseColQuarter(col: string): string {
  const m = col.match(/(Q\d)/);
  return m ? m[1] : col;
}

function SimpleStatementTable({ data, viewMode, yearWindowStart, allYears }: SimpleStatementTableProps) {
  const periodData = viewMode === 'annual' ? data.annualData : data.quarterlyData;

  const visibleCols = viewMode === 'quarterly'
    ? periodData.columns.filter((col) => {
        const y = parseColYear(col);
        return y === yearWindowStart || y === yearWindowStart + 1;
      })
    : periodData.columns;
  const visibleColSet = new Set(visibleCols);

  const colIndexes = periodData.columns
    .map((col, i) => ({ col, i }))
    .filter(({ col }) => visibleColSet.has(col));

  // Group visible cols by year for quarterly thead
  const yearGroups: { year: number; cols: string[] }[] = [];
  if (viewMode === 'quarterly') {
    for (const col of visibleCols) {
      const y = parseColYear(col);
      const last = yearGroups[yearGroups.length - 1];
      if (last && last.year === y) last.cols.push(col);
      else yearGroups.push({ year: y, cols: [col] });
    }
  }

  return (
    <div>
      <div className="fin-stmt-table-wrap">
        <table className="data-table fin-stmt-table fin-stmt-simple-table">
          <thead>
            {viewMode === 'quarterly' && yearGroups.length > 0 ? (
              <>
                <tr>
                  <th rowSpan={2} className="fin-stmt-th-item">
                    <div className="fin-stmt-th-item-inner">
                      <span className="fin-stmt-th-year">Year</span>
                      <span className="fin-stmt-th-divider" />
                      <span className="fin-stmt-th-item-label">Item</span>
                    </div>
                  </th>
                  {yearGroups.map(({ year, cols }) => (
                    <th key={year} colSpan={cols.length} className="th-group">
                      FY{year}
                    </th>
                  ))}
                </tr>
                <tr className="sub-head">
                  {visibleCols.map((col) => (
                    <th key={col} className="sub-group-inner">
                      {parseColQuarter(col)}
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
                {visibleCols.map((col) => (
                  <th key={col} className="fin-stmt-simple-col-hdr">{col}</th>
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {periodData.rows.map((row, ri) => {
              const isHeader = isSectionRow(row);
              return (
                <tr key={ri} className={isHeader ? 'fin-stmt-section-row' : ''}>
                  <td className={isHeader ? 'fin-stmt-td-section' : 'fin-stmt-td-item'}>
                    {row[0]}
                  </td>
                  {colIndexes.map(({ col, i }) => {
                    const cell = row[i + 1] ?? '';
                    if (isHeader) return <td key={col} className="fin-stmt-td-section-blank" />;
                    const isNeg = cell.startsWith('-') && cell !== '-';
                    const isPos = cell.startsWith('+');
                    return (
                      <td
                        key={col}
                        className={`td-num${isNeg ? ' fin-stmt-neg' : isPos ? ' fin-stmt-pos' : ''}`}
                      >
                        {cell || '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
interface FinancialStatementTabProps {
  symbol: string;
}

export default function FinancialStatementTab({ symbol }: FinancialStatementTabProps) {
  const [statementType, setStatementType] = useState<StatementType>('income');
  const [viewMode, setViewMode] = useState<ViewMode>('quarterly');
  const [currency, setCurrency] = useState<Currency>('original');

  const resolvedSymbol = resolveSymbolAlias(symbol);

  // Load all available statement sections for this company.
  // Company-specific logic is fully encapsulated in getCompanyStatements().
  const availableStatements = useMemo(
    () => getCompanyStatements(resolvedSymbol),
    [resolvedSymbol],
  );

  // Tabs are shown only for sections that actually have data
  const visibleTabs = STATEMENT_ITEMS.filter((item) => availableStatements[item.key] != null);

  // If the active tab has no data for the current company, fall back to the first available tab
  const effectiveType: StatementType =
    availableStatements[statementType] != null
      ? statementType
      : (visibleTabs[0]?.key ?? 'income');

  const currentTabData = availableStatements[effectiveType];

  // ── Income structured data (QuarterData[]) — drives income year navigation ───
  const incomeEntry = availableStatements.income;
  const allQuarterlyData: QuarterData[] =
    incomeEntry?.kind === 'income_structured' ? incomeEntry.data.quarterlyData : [];
  const allAnnualData: AnnualData[] =
    incomeEntry?.kind === 'income_structured' ? incomeEntry.data.annualData : [];

  const availableYears = [...new Set(allQuarterlyData.map((q) => q.year))].sort((a, b) => a - b);
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

  const visibleQuarters = allQuarterlyData.filter(
    (q) => q.year === yearWindowStart || q.year === yearWindowStart + 1,
  );
  const visibleAnnual = allAnnualData;

  const minYear = safeAvailableYears[0];
  const maxYear = safeAvailableYears[safeAvailableYears.length - 1];

  const yearLabel =
    viewMode === 'quarterly'
      ? `FY${yearWindowStart}–FY${yearWindowStart + 1}`
      : `FY${minYear}–FY${maxYear}`;

  const canGoPrev = viewMode === 'quarterly' && yearWindowStart > safeAvailableYears[0];
  const canGoNext = viewMode === 'quarterly' && yearWindowStart < maxYearWindowStart;

  // ── Simple statement data — drives balance / cashflow / segment year nav ──────
  const simpleData: SimpleStatementData | null = useMemo(
    () => (currentTabData?.kind === 'simple' ? currentTabData.data : null),
    [currentTabData],
  );

  const simpleAllYears = useMemo(() => {
    if (!simpleData) return [] as number[];
    return [...new Set(simpleData.quarterlyData.columns.map(parseColYear))].filter(Boolean).sort((a, b) => a - b);
  }, [simpleData]);

  const simpleMaxYearWindowStart = simpleAllYears.length > 1
    ? simpleAllYears[simpleAllYears.length - 1] - 1
    : (simpleAllYears[0] ?? 0);

  // Per-tab year overrides; falls back to computed default so no useEffect needed.
  const [simpleYearOverrides, setSimpleYearOverrides] = useState<Partial<Record<StatementType, number>>>({});
  const simpleDefaultYearStart = simpleAllYears.length > 0
    ? Math.max(simpleAllYears[0], simpleMaxYearWindowStart)
    : 0;
  const simpleYearWindowStart = simpleYearOverrides[effectiveType] ?? simpleDefaultYearStart;

  function setYearOverrideForStatement(updater: (y: number) => number) {
    setSimpleYearOverrides((prev) => ({
      ...prev,
      [effectiveType]: updater(prev[effectiveType] ?? simpleDefaultYearStart),
    }));
  }

  const simpleCanGoPrev = viewMode === 'quarterly' && simpleAllYears.length > 0 && simpleYearWindowStart > simpleAllYears[0];
  const simpleCanGoNext = viewMode === 'quarterly' && simpleYearWindowStart < simpleMaxYearWindowStart;

  // No data at all — show placeholder
  if (visibleTabs.length === 0) {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">
          Financial Statement for {symbol} — Content coming soon
        </span>
      </div>
    );
  }

  const isStructuredIncome = currentTabData?.kind === 'income_structured';
  const isSimpleStatement  = currentTabData?.kind === 'simple';

  return (
    <div className="fin-stmt-layout">
      {/* ── Left sidebar ── */}
      <aside className="fin-stmt-sidebar">
        <nav className="fin-stmt-nav">
          {visibleTabs.map((item) => (
            <button
              key={item.key}
              className={`fin-stmt-nav-item${effectiveType === item.key ? ' active' : ''}`}
              onClick={() => setStatementType(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Right content area ── */}
      <div className="fin-stmt-content">
        {/* Toolbar — shown only for structured income or simple data; hidden for findata */}
        {(isStructuredIncome || isSimpleStatement) && (
          <div className="fin-stmt-toolbar">
            <div className="fin-stmt-year-nav">
              {/* Income Statement year nav */}
              {isStructuredIncome && (
                <>
                  <button
                    className="wl-quarter-btn"
                    aria-label="Previous year"
                    onClick={prevYear}
                    disabled={!canGoPrev}
                  >
                    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                      <path d="M9 2.5L4.5 7L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="wl-quarter-label fin-stmt-year-label">{yearLabel}</span>
                  <button
                    className="wl-quarter-btn"
                    aria-label="Next year"
                    onClick={nextYear}
                    disabled={!canGoNext}
                  >
                    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                      <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
              {/* Balance Sheet / Cash Flow / Segment year nav */}
              {isSimpleStatement && viewMode === 'quarterly' && simpleAllYears.length > 0 && (
                <>
                  <button
                    className="wl-quarter-btn"
                    aria-label="Previous year"
                    onClick={() => setYearOverrideForStatement((y) => Math.max(simpleAllYears[0], y - 1))}
                    disabled={!simpleCanGoPrev}
                  >
                    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                      <path d="M9 2.5L4.5 7L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="wl-quarter-label fin-stmt-year-label">
                    FY{simpleYearWindowStart}–FY{simpleYearWindowStart + 1}
                  </span>
                  <button
                    className="wl-quarter-btn"
                    aria-label="Next year"
                    onClick={() => setYearOverrideForStatement((y) => Math.min(simpleMaxYearWindowStart, y + 1))}
                    disabled={!simpleCanGoNext}
                  >
                    <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                      <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <div className="fin-stmt-toolbar-right">
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
        )}

        {/* ── Table ── */}
        {currentTabData?.kind === 'findata' && (
          <FinDataTable data={currentTabData.data} />
        )}
        {isSimpleStatement && (
          simpleData ? (
            <SimpleStatementTable
              data={simpleData}
              viewMode={viewMode}
              yearWindowStart={simpleYearWindowStart}
              allYears={simpleAllYears}
            />
          ) : (
            <div className="cp-tab-placeholder">
              <span className="cp-tab-placeholder-text">
                {STATEMENT_ITEMS.find((s) => s.key === effectiveType)?.label} — data unavailable
              </span>
            </div>
          )
        )}
        {isStructuredIncome && (
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
                        <th key={q.label} className="sub-group-inner">Q{q.quarter}</th>
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
                            <td key={q.label} className={`td-num ${getCellClass(raw, row.format)}`}>
                              {fmt(raw, row.format)}
                            </td>
                          );
                        })
                      : visibleAnnual.map((a) => {
                          const raw = a[row.key as keyof AnnualData] as number | null;
                          return (
                            <td key={a.label} className={`td-num ${getCellClass(raw, row.format)}`}>
                              {fmt(raw, row.format)}
                            </td>
                          );
                        })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
