'use client';

import { useState, useEffect } from 'react';
import type { StatementData } from '@/app/data/financialData';
import {
  getFinancialStatementByCoCd,
  type StatementType,
  type CompanyStatements,
  type TabDataEntry,
  type SimpleStatementData,
  type SimpleStatementPeriodData,
} from '@/app/lib/getFinancialStatementByCoCd';

// ── Types ─────────────────────────────────────────────────────────────────────
type ViewMode = 'quarterly' | 'annual';
type Currency = 'original' | 'usd';

const STATEMENT_ITEMS: { key: StatementType; label: string }[] = [
  { key: 'income',   label: 'Income Statement' },
  { key: 'balance',  label: 'Balance Sheet' },
  { key: 'cashflow', label: 'Cash Flow Statement' },
  { key: 'segment',  label: 'Segment Report' },
];

// ── FinDataTable — renders StatementData from financial-data.md ────────────────

/** Returns true for a quarterly period label like "Q1 2025" */
function isQuarterlyPeriod(p: string): boolean {
  return /^Q\d/.test(p);
}

function FinDataTable({
  data,
  viewMode,
  yearWindowStart,
}: {
  data: StatementData;
  viewMode: ViewMode;
  yearWindowStart: number;
}) {
  // Filter periods to only those relevant for the current viewMode / year window
  const periodIdxs = data.periods
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      if (viewMode === 'annual') return !isQuarterlyPeriod(p);
      const y = parseColYear(p);
      return isQuarterlyPeriod(p) && (y === yearWindowStart || y === yearWindowStart + 1);
    });

  const periods = periodIdxs.map(({ p }) => p);

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
          {Object.entries(data.items).map(([label, allValues], ri) => {
            const isSection = allValues.every((v) => v === '' || v === '—');
            return isSection ? (
              <tr key={ri} className="fin-stmt-section-row">
                <td colSpan={periods.length + 1} className="fin-stmt-td-section">
                  {label}
                </td>
              </tr>
            ) : (
              <tr key={ri}>
                <td className="fin-stmt-td-item">{label}</td>
                {periodIdxs.map(({ p, i }) => {
                  const val = allValues[i] ?? '';
                  const isNeg = val.startsWith('-') && val !== '-';
                  const isPos =
                    val.startsWith('+') ||
                    (val.endsWith('%') && !val.startsWith('-') && parseFloat(val) > 0);
                  return (
                    <td
                      key={p}
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

/** Returns true for section-header rows (all data cells are empty). */
function isSectionRow(row: string[]): boolean {
  return row.slice(1).every((c) => c === '' || c === '—');
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

/** Parse a column label → full 4-digit year.
 *  Handles formats: "FY2024", "FY24 Q1", "FY24", "Q1 2025"
 */
function parseColYear(col: string): number {
  // New flat-format quarterly: "Q1 2025"
  const mq = col.match(/^Q\d\s+(\d{4})$/);
  if (mq) return parseInt(mq[1], 10);
  // Legacy formats: "FY2024", "FY24 Q1", "FY24"
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
  const [availableStatements, setAvailableStatements] = useState<CompanyStatements>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load all available statement sections for this company (模式 A pattern).
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getFinancialStatementByCoCd(symbol).then((result) => {
      if (!cancelled) {
        setAvailableStatements(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol]);

  // Tabs are shown only for sections that actually have data
  const visibleTabs = STATEMENT_ITEMS.filter((item) => availableStatements[item.key] != null);

  // If the active tab has no data for the current company, fall back to the first available tab
  const effectiveType: StatementType =
    availableStatements[statementType] != null
      ? statementType
      : (visibleTabs[0]?.key ?? 'income');

  const currentTabData = availableStatements[effectiveType];

  // ── Simple statement data — drives balance / cashflow / segment year nav ──────
  const simpleData: SimpleStatementData | null =
    currentTabData?.kind === 'simple' ? currentTabData.data : null;

  const simpleAllYears = simpleData
    ? [...new Set(simpleData.quarterlyData.columns.map(parseColYear))].filter(Boolean).sort((a, b) => a - b)
    : [];

  // ── FinData (Income Statement) year nav ───────────────────────────────────────
  const finDataAllYears = currentTabData?.kind === 'findata'
    ? [...new Set(
        currentTabData.data.periods.filter(isQuarterlyPeriod).map(parseColYear),
      )].filter(Boolean).sort((a, b) => a - b)
    : [];

  // Unified year list: works for both 'simple' and 'findata' tabs
  const activeAllYears = simpleData ? simpleAllYears : finDataAllYears;

  const activeMaxYearWindowStart = activeAllYears.length > 1
    ? activeAllYears[activeAllYears.length - 1] - 1
    : (activeAllYears[0] ?? 0);

  // Per-tab year overrides; falls back to computed default so no useEffect needed.
  const [simpleYearOverrides, setSimpleYearOverrides] = useState<Partial<Record<StatementType, number>>>({});
  const simpleDefaultYearStart = activeAllYears.length > 0
    ? Math.max(activeAllYears[0], activeMaxYearWindowStart)
    : 0;
  const simpleYearWindowStart = simpleYearOverrides[effectiveType] ?? simpleDefaultYearStart;

  function setYearOverrideForStatement(updater: (y: number) => number) {
    setSimpleYearOverrides((prev) => ({
      ...prev,
      [effectiveType]: updater(prev[effectiveType] ?? simpleDefaultYearStart),
    }));
  }

  const simpleCanGoPrev = viewMode === 'quarterly' && activeAllYears.length > 0 && simpleYearWindowStart > activeAllYears[0];
  const simpleCanGoNext = viewMode === 'quarterly' && simpleYearWindowStart < activeMaxYearWindowStart;

  // Loading state
  if (loading) {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">Loading…</span>
      </div>
    );
  }

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

  const isSimpleStatement = currentTabData?.kind === 'simple';

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
        {/* Toolbar — shown for all tabs that have data */}
        {currentTabData != null && (
          <div className="fin-stmt-toolbar">
            <div className="fin-stmt-year-nav">
              {viewMode === 'quarterly' && activeAllYears.length > 0 && (
                <>
                  <button
                    className="wl-quarter-btn"
                    aria-label="Previous year"
                    onClick={() => setYearOverrideForStatement((y) => Math.max(activeAllYears[0], y - 1))}
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
                    onClick={() => setYearOverrideForStatement((y) => Math.min(activeMaxYearWindowStart, y + 1))}
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
          <FinDataTable
            data={currentTabData.data}
            viewMode={viewMode}
            yearWindowStart={simpleYearWindowStart}
          />
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
      </div>
    </div>
  );
}
