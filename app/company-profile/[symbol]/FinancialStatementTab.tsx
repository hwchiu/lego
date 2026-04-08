'use client';

import { useState, useMemo } from 'react';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';
import tcFinStmtMd from '@/content/tc-financial-statement.md';
import aaplFinStmtMd from '@/content/apple-financial-statement.md';

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
interface SimpleStatementData {
  source: string;
  columns: string[];
  rows: string[][];
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

// ── Simple statement table sub-component ──────────────────────────────────────
interface SimpleStatementTableProps {
  data: SimpleStatementData;
}

function SimpleStatementTable({ data }: SimpleStatementTableProps) {
  return (
    <div className="fin-stmt-table-wrap">
      <p className="fin-stmt-source-note">{data.source}</p>
      <table className="data-table fin-stmt-table fin-stmt-simple-table">
        <thead>
          <tr>
            <th className="fin-stmt-th-item">
              <div className="fin-stmt-th-item-inner">
                <span className="fin-stmt-th-item-label">Item</span>
              </div>
            </th>
            {data.columns.map((col) => (
              <th key={col} className="fin-stmt-simple-col-hdr">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => {
            const isHeader = isSectionRow(row);
            return (
              <tr key={ri} className={isHeader ? 'fin-stmt-section-row' : ''}>
                <td className={isHeader ? 'fin-stmt-td-section' : 'fin-stmt-td-item'}>
                  {row[0]}
                </td>
                {row.slice(1).map((cell, ci) => {
                  if (isHeader) return <td key={ci} className="fin-stmt-td-section-blank" />;
                  const isNeg = cell.startsWith('-') && cell !== '-';
                  const isPos = cell.startsWith('+');
                  return (
                    <td
                      key={ci}
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

  const isAapl = symbol === 'AAPL';
  const isTc  = symbol === 'TC' || symbol === 'TSM';

  const aaplIncomeData = useMemo(() => (isAapl ? getAaplIncomeData() : null), [isAapl]);
  const tcData        = useMemo(() => (isTc  ? getTcData()        : null), [isTc]);

  const allQuarterlyData: QuarterData[] = isAapl
    ? (aaplIncomeData?.quarterlyData ?? [])
    : isTc
      ? (tcData?.quarterlyData ?? [])
      : [];

  const allAnnualData: AnnualData[] = isAapl
    ? (aaplIncomeData?.annualData ?? [])
    : isTc
      ? (tcData?.annualData ?? [])
      : [];

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

  const isSimpleStatement = statementType === 'balance' || statementType === 'cashflow' || statementType === 'segment';

  // Simple statement data (only for AAPL)
  const simpleData: SimpleStatementData | null = useMemo(() => {
    if (!isAapl || !isSimpleStatement) return null;
    return getAaplSimpleData(statementType as 'balance' | 'cashflow' | 'segment');
  }, [isAapl, isSimpleStatement, statementType]);

  if (!isAapl && !isTc) {
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
        {/* Toolbar — hide year nav & quarterly toggle for simple statements */}
        <div className="fin-stmt-toolbar">
          <div className="fin-stmt-year-nav">
            {!isSimpleStatement && (
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
          </div>

          <div className="fin-stmt-toolbar-right">
            {!isSimpleStatement && (
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
            )}

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

        {/* ── Table ── */}
        {isSimpleStatement ? (
          simpleData ? (
            <SimpleStatementTable data={simpleData} />
          ) : (
            <div className="cp-tab-placeholder">
              <span className="cp-tab-placeholder-text">
                {STATEMENT_ITEMS.find((s) => s.key === statementType)?.label} — Available for AAPL
              </span>
            </div>
          )
        ) : (
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
