'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { StatementData } from '@/app/data/financialData';
import {
  getFinancialStatementByCoCd,
  type StatementType,
  type CompanyStatements,
  type SimpleStatementData,
  type SegmentRecord,
  formatSegmentValue,
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

// ── Segment Report Table ───────────────────────────────────────────────────────

const SEGMENT_ANNUAL_Q = 'NA';

/** Build a period label for a SegmentRecord. */
function segPLabel(calYear: number, calQ: string): string {
  return calQ === SEGMENT_ANNUAL_Q ? `FY${calYear}` : `${calQ} ${calYear}`;
}

/** Build a sort key for a segment period. */
function segPSortKey(calYear: number, calQ: string): number {
  if (calQ === SEGMENT_ANNUAL_Q) return calYear * 10;
  const m = calQ.match(/^Q([1-4])$/);
  return calYear * 10 + (m ? parseInt(m[1], 10) : 5);
}

/** Build the display label for a segment item from the non-empty level fields. */
function segItemLabel(r: SegmentRecord): string {
  const parts = [r.anal_seg_level1, r.anal_seg_level2, r.anal_seg_level3]
    .filter((v) => v && v.trim() !== '');
  return parts.join(' / ') || '—';
}

/** Unique key for a segment item within a sale_type group. */
function segItemKey(r: SegmentRecord): string {
  return `${r.anal_seg_level1 ?? ''}|${r.anal_seg_level2 ?? ''}|${r.anal_seg_level3 ?? ''}`;
}

interface SegmentReportTableProps {
  records: SegmentRecord[];
  viewMode: ViewMode;
  yearWindowStart: number;
}

function SegmentReportTable({ records, viewMode, yearWindowStart }: SegmentReportTableProps) {
  // Filter records to the current view mode / year window
  const filteredRecords = records.filter((r) => {
    if (viewMode === 'annual') return r.calendar_quarter === SEGMENT_ANNUAL_Q;
    return (
      r.calendar_quarter !== SEGMENT_ANNUAL_Q &&
      (r.calendar_year === yearWindowStart || r.calendar_year === yearWindowStart + 1)
    );
  });

  if (filteredRecords.length === 0) {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">No segment data for selected period.</span>
      </div>
    );
  }

  // Build ordered, deduplicated period labels
  const periodSet = new Set<string>();
  const sortKeyMap = new Map<string, number>();
  for (const r of filteredRecords) {
    const lbl = segPLabel(r.calendar_year, r.calendar_quarter);
    periodSet.add(lbl);
    if (!sortKeyMap.has(lbl)) sortKeyMap.set(lbl, segPSortKey(r.calendar_year, r.calendar_quarter));
  }
  const periods = [...periodSet].sort((a, b) => (sortKeyMap.get(a) ?? 0) - (sortKeyMap.get(b) ?? 0));

  // Build sale_type order and item order per sale_type
  const saleTypeOrder: string[] = [];
  const saleTypeSeen = new Set<string>();
  const itemOrders: Record<string, { key: string; label: string }[]> = {};
  const itemSeen: Record<string, Set<string>> = {};
  // dataMap: `${saleType}###${itemKey}` → { [period]: formatted value }
  const dataMap: Record<string, Record<string, string>> = {};

  for (const r of filteredRecords) {
    const { sale_type, fld_val } = r;
    const iKey = segItemKey(r);
    const iLabel = segItemLabel(r);
    const pLabel = segPLabel(r.calendar_year, r.calendar_quarter);

    if (!saleTypeSeen.has(sale_type)) {
      saleTypeOrder.push(sale_type);
      saleTypeSeen.add(sale_type);
      itemOrders[sale_type] = [];
      itemSeen[sale_type] = new Set();
    }
    if (!itemSeen[sale_type].has(iKey)) {
      itemOrders[sale_type].push({ key: iKey, label: iLabel });
      itemSeen[sale_type].add(iKey);
    }

    const mapKey = `${sale_type}###${iKey}`;
    if (!dataMap[mapKey]) dataMap[mapKey] = {};
    dataMap[mapKey][pLabel] = formatSegmentValue(fld_val, sale_type);
  }

  // Build two-row quarterly header groups
  type Row1Cell =
    | { type: 'annual'; label: string }
    | { type: 'qgroup'; yearLabel: string; count: number };
  const row1Cells: Row1Cell[] = [];
  const row2Quarters: string[] = [];

  for (const p of periods) {
    if (/^Q\d/.test(p)) {
      const yr = p.match(/\d{4}$/)?.[0] ?? '';
      const yearLabel = `FY${yr}`;
      const qLabel = p.match(/^Q\d/)?.[0] ?? p;
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
                <th key={i} className="sub-group-inner">{q}</th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {saleTypeOrder.map((saleType) => (
            <React.Fragment key={saleType}>
              {/* Section header row — shows sale_type */}
              <tr className="fin-stmt-section-row">
                <td colSpan={periods.length + 1} className="fin-stmt-td-section">
                  {saleType}
                </td>
              </tr>
              {/* Item rows — shows anal_seg_level1/2/3 (non-empty parts) */}
              {itemOrders[saleType].map(({ key, label }) => {
                const mapKey = `${saleType}###${key}`;
                const rowVals = dataMap[mapKey] ?? {};
                return (
                  <tr key={`item-${saleType}-${key}`}>
                    <td className="fin-stmt-td-item">{label}</td>
                    {periods.map((p) => {
                      const val = rowVals[p] ?? '—';
                      const isNeg = val.startsWith('-') && val !== '-';
                      const isPos = val.startsWith('+');
                      return (
                        <td
                          key={p}
                          className={`td-num${isNeg ? ' fin-stmt-neg' : isPos ? ' fin-stmt-pos' : ''}`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
interface FinancialStatementTabProps {
  symbol: string;
  /** When provided by a parent component, skip internal fetch and use this data directly.
   *  null = parent is still loading; object = data ready (may be empty {}). */
  companyStatements?: CompanyStatements | null;
  /** Raw segment records from getBBGSegment, used for the Segment Report tab. */
  segmentRecords?: SegmentRecord[];
}

export default function FinancialStatementTab({ symbol, companyStatements: propStatements, segmentRecords: propSegmentRecords }: FinancialStatementTabProps) {
  const [statementType, setStatementType] = useState<StatementType>('income');
  const [viewMode, setViewMode] = useState<ViewMode>('quarterly');
  const [currency, setCurrency] = useState<Currency>('original');
  const [availableStatements, setAvailableStatements] = useState<CompanyStatements>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Load all available statement sections for this company (模式 A pattern).
  // If `propStatements` is provided by a parent, use it directly to avoid a duplicate fetch.
  useEffect(() => {
    if (propStatements !== undefined) {
      // Parent manages the data — use it when ready
      setAvailableStatements(propStatements ?? {});
      setLoading(propStatements === null);
      return;
    }
    // Self-managed fetch (used when this component is rendered standalone)
    let cancelled = false;
    setLoading(true);
    getFinancialStatementByCoCd(symbol).then((result) => {
      if (!cancelled) {
        setAvailableStatements(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol, propStatements]);

  // Tabs are shown only for sections that actually have data.
  // The 'segment' tab is also shown when segment records are provided via props.
  const visibleTabs = STATEMENT_ITEMS.filter((item) => {
    if (item.key === 'segment') {
      return availableStatements[item.key] != null || (propSegmentRecords && propSegmentRecords.length > 0);
    }
    return availableStatements[item.key] != null;
  });

  // If the active tab has no data for the current company, fall back to the first available tab
  const effectiveType: StatementType =
    visibleTabs.some((t) => t.key === statementType)
      ? statementType
      : (visibleTabs[0]?.key ?? 'income');

  const currentTabData = availableStatements[effectiveType];

  // ── Segment records for the new SegmentReportTable ───────────────────────────
  // Use prop segment records when rendering the segment tab
  const useSegmentRecordsForTable =
    effectiveType === 'segment' && propSegmentRecords && propSegmentRecords.length > 0;

  // ── Simple statement data — drives balance / cashflow / segment year nav ──────
  const simpleData: SimpleStatementData | null = useMemo(
    () => (currentTabData?.kind === 'simple' ? currentTabData.data : null),
    [currentTabData],
  );

  const simpleAllYears = useMemo(() => {
    if (!simpleData) return [];
    return [...new Set(simpleData.quarterlyData.columns.map(parseColYear))].filter(Boolean).sort((a, b) => a - b);
  }, [simpleData]);

  // ── FinData (Income Statement) year nav ───────────────────────────────────────
  const finDataAllYears = useMemo(() => {
    if (currentTabData?.kind !== 'findata') return [];
    return [...new Set(
      currentTabData.data.periods.filter(isQuarterlyPeriod).map(parseColYear),
    )].filter(Boolean).sort((a, b) => a - b);
  }, [currentTabData]);

  // ── Segment records year nav ──────────────────────────────────────────────────
  const segmentAllYears = useMemo(() => {
    if (!propSegmentRecords?.length) return [];
    return [...new Set(
      propSegmentRecords
        .filter((r) => r.calendar_quarter !== SEGMENT_ANNUAL_Q)
        .map((r) => r.calendar_year),
    )].filter(Boolean).sort((a, b) => a - b);
  }, [propSegmentRecords]);

  // Unified year list: works for 'simple', 'findata', and segment tabs
  const activeAllYears = useSegmentRecordsForTable
    ? segmentAllYears
    : simpleData
    ? simpleAllYears
    : finDataAllYears;

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
        {/* Toolbar — shown when there is data (either statements or segment records) */}
        {(currentTabData != null || useSegmentRecordsForTable) && (
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
        {/* Segment Report: use SegmentReportTable from getBBGSegment records when available */}
        {useSegmentRecordsForTable ? (
          <SegmentReportTable
            records={propSegmentRecords!}
            viewMode={viewMode}
            yearWindowStart={simpleYearWindowStart}
          />
        ) : currentTabData?.kind === 'findata' ? (
          <FinDataTable
            data={(currency === 'original' && currentTabData.docAmtData) ? currentTabData.docAmtData : currentTabData.data}
            viewMode={viewMode}
            yearWindowStart={simpleYearWindowStart}
          />
        ) : isSimpleStatement ? (
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
        ) : null}
      </div>
    </div>
  );
}
