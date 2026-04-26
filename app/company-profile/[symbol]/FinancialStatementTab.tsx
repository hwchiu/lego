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

const SALE_TYPE_LABELS: Record<string, string> = {
  PG_REVENUE: 'Segment Revenue ($M)',
  PG_REVENUE_END_USER: 'Segment Revenue (End User) ($M)',
  PG_NUMBER_OF_UNITS_SOLD: 'Segment Number of Unit Sold',
  PG_GROSS_MARGIN: 'Segment Gross Margin (%)',
  PG_OPERATING_INCOME: 'Segment Operating Income ($M)',
  PG_OPERATING_MARGIN: 'Segment Operating Margin (%)'
};

function formatSaleTypeLabel(saleType: string): string {
  return SALE_TYPE_LABELS[saleType] ?? saleType;
}

/** Returns true for any sale type whose values should not be aggregated (e.g. margin percentages). */
function isMarginType(saleType: string): boolean {
  return saleType.includes('MARGIN');
}

/** Canonical category rendering order: platform before geometric, others after. */
const CATEGORY_RENDER_ORDER = ['platform', 'geometric'];

/** Sort an array of category strings in-place: platform first, geometric second, others last. */
export function sortCategories(cats: string[]): void {
  cats.sort((a, b) => {
    const ia = CATEGORY_RENDER_ORDER.indexOf(a.toLowerCase());
    const ib = CATEGORY_RENDER_ORDER.indexOf(b.toLowerCase());
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  });
}

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

// ── Hierarchical segment data structures ──────────────────────────────────────
// rawValues stores numeric values per period label (before formatting).
// Parent nodes hold bottom-up aggregated values (sum of children) when children exist.

export interface SegLevel3Node {
  level3: string;
  rawValues: Record<string, number>;
}

export interface SegLevel2Node {
  level2: string;
  /** Effective value: sum of level3 children (if any), else own direct value. */
  rawValues: Record<string, number>;
  level3Groups: SegLevel3Node[];
}

export interface SegLevel1Node {
  level1: string;
  /** Effective value: sum of level2 children (if any), else own direct value. */
  rawValues: Record<string, number>;
  level2Groups: SegLevel2Node[];
}

export interface SegSaleTypeGroup {
  saleType: string;
  /** Effective value: sum of all level1 children. */
  rawValues: Record<string, number>;
  level1Groups: SegLevel1Node[];
}

function normalizeSegmentLevels(record: SegmentRecord) {
  let level1 = record.anal_seg_level1.trim();
  let level2 = record.anal_seg_level2?.trim() ?? '';
  let level3 = record.anal_seg_level3?.trim() ?? '';

  if (!level1) {
    if (level2) {
      level1 = level2;
      level2 = '';
    } else if (level3) {
      level1 = level3;
      level3 = '';
    }
  }

  if (!level2 && level3) {
    level2 = level3;
    level3 = '';
  }

  return { level1, level2, level3 };
}

/** Produces a collision-safe React key by serializing path parts. */
function buildSegmentKey(parts: string[]): string {
  return JSON.stringify(parts);
}

/**
 * Build a nested hierarchy from flat SegmentRecord[].
 *
 * Currency:
 *   - 'original' → uses `curr_num` (original currency), falls back to `fld_val`
 *   - 'usd'      → uses `fld_val` (USD)
 *
 * Aggregation (bottom-up, no double-counting):
 *   - Level3 nodes hold raw leaf values.
 *   - Level2 rawValues = sum of its level3 children (if any), otherwise own direct value.
 *   - Level1 rawValues = sum of its level2 children (if any), otherwise own direct value.
 *   - SaleType rawValues = sum of all level1 children.
 */
export function buildSegmentHierarchy(
  records: SegmentRecord[],
  currency: 'original' | 'usd' = 'usd',
): SegSaleTypeGroup[] {
  const saleTypeOrder: string[] = [];
  const saleTypeMap = new Map<string, {
    level1Order: string[];
    level1Map: Map<string, {
      directValues: Record<string, number>;
      level2Order: string[];
      level2Map: Map<string, {
        directValues: Record<string, number>;
        level3Order: string[];
        level3Map: Map<string, Record<string, number>>;
      }>;
    }>;
  }>();

  for (const record of records) {
    const saleType = record.sale_type.trim();
    if (!saleType) continue;
    const { level1, level2, level3 } = normalizeSegmentLevels(record);
    if (!level1) continue;
    const periodLabel = segPLabel(record.calendar_year, record.calendar_quarter);
    const rawVal = currency === 'original'
      ? (record.curr_num ?? record.fld_val)
      : record.fld_val;
    if (rawVal === null || rawVal === undefined) continue;

    if (!saleTypeMap.has(saleType)) {
      saleTypeMap.set(saleType, { level1Order: [], level1Map: new Map() });
      saleTypeOrder.push(saleType);
    }
    const stg = saleTypeMap.get(saleType)!;

    if (!stg.level1Map.has(level1)) {
      stg.level1Map.set(level1, { directValues: {}, level2Order: [], level2Map: new Map() });
      stg.level1Order.push(level1);
    }
    const l1g = stg.level1Map.get(level1)!;

    if (!level2) {
      l1g.directValues[periodLabel] = rawVal;
      continue;
    }

    if (!l1g.level2Map.has(level2)) {
      l1g.level2Map.set(level2, { directValues: {}, level3Order: [], level3Map: new Map() });
      l1g.level2Order.push(level2);
    }
    const l2g = l1g.level2Map.get(level2)!;

    if (!level3) {
      l2g.directValues[periodLabel] = rawVal;
      continue;
    }

    if (!l2g.level3Map.has(level3)) {
      l2g.level3Map.set(level3, {});
      l2g.level3Order.push(level3);
    }
    l2g.level3Map.get(level3)![periodLabel] = rawVal;
  }

  // ── Sort sale types by SALE_TYPE_LABELS key order ──
  const saleTypeLabelKeys = Object.keys(SALE_TYPE_LABELS);
  saleTypeOrder.sort((a, b) => {
    const ia = saleTypeLabelKeys.indexOf(a);
    const ib = saleTypeLabelKeys.indexOf(b);
    return (ia === -1 ? Infinity : ia) - (ib === -1 ? Infinity : ib);
  });

  // ── Build output with bottom-up aggregation ──
  return saleTypeOrder.map((saleType) => {
    const stg = saleTypeMap.get(saleType)!;
    const stRaw: Record<string, number> = {};

    const level1Groups: SegLevel1Node[] = stg.level1Order.map((level1) => {
      const l1g = stg.level1Map.get(level1)!;
      const l1Raw: Record<string, number> = {};

      const level2Groups: SegLevel2Node[] = l1g.level2Order.map((level2) => {
        const l2g = l1g.level2Map.get(level2)!;
        const l2Raw: Record<string, number> = {};

        const level3Groups: SegLevel3Node[] = l2g.level3Order.map((level3) => ({
          level3,
          rawValues: l2g.level3Map.get(level3)!,
        }));

        if (level3Groups.length > 0) {
          // l2 effective = sum of l3 leaf values
          for (const l3g of level3Groups) {
            for (const [p, v] of Object.entries(l3g.rawValues)) {
              l2Raw[p] = (l2Raw[p] ?? 0) + v;
            }
          }
        } else {
          Object.assign(l2Raw, l2g.directValues);
        }

        return { level2, rawValues: l2Raw, level3Groups };
      });

      if (level2Groups.length > 0) {
        // l1 effective = sum of l2 effective values
        for (const l2g of level2Groups) {
          for (const [p, v] of Object.entries(l2g.rawValues)) {
            l1Raw[p] = (l1Raw[p] ?? 0) + v;
          }
        }
      } else {
        Object.assign(l1Raw, l1g.directValues);
      }

      return { level1, rawValues: l1Raw, level2Groups };
    });

    // saleType effective = sum of all l1 effective values
    for (const l1g of level1Groups) {
      for (const [p, v] of Object.entries(l1g.rawValues)) {
        stRaw[p] = (stRaw[p] ?? 0) + v;
      }
    }

    return { saleType, rawValues: stRaw, level1Groups };
  });
}

// ── Category-grouped hierarchy ────────────────────────────────────────────────

export interface SegCategoryGroup {
  category: string;
  hierarchy: SegSaleTypeGroup[];
}

/**
 * Build a nested hierarchy grouped first by the `category` field of each
 * SegmentRecord, then by sale_type within each category.
 *
 * Records with no `category` value are grouped under an empty-string category.
 */
export function buildSegmentHierarchyByCategory(
  records: SegmentRecord[],
  currency: 'original' | 'usd' = 'usd',
): SegCategoryGroup[] {
  const categoryOrder: string[] = [];
  const categorySeen = new Set<string>();

  for (const record of records) {
    const cat = record.category ?? '';
    if (!categorySeen.has(cat)) {
      categoryOrder.push(cat);
      categorySeen.add(cat);
    }
  }

  return categoryOrder.map((category) => ({
    category,
    hierarchy: buildSegmentHierarchy(
      records.filter((r) => (r.category ?? '') === category),
      currency,
    ),
  }));
}

/** Render a single data row for the segment table. */
function SegDataRow({
  label,
  rawValues,
  periods,
  depth,
  saleType,
  hideValues,
}: {
  label: string;
  rawValues: Record<string, number>;
  periods: string[];
  depth: 'sale-type' | 'l1' | 'l2' | 'l3';
  saleType: string;
  hideValues?: boolean;
}) {
  const isSaleType = depth === 'sale-type';
  return (
    <tr className={isSaleType ? 'fin-stmt-section-row seg-sale-type-row' : 'seg-item-row'}>
      <td className={isSaleType ? 'fin-stmt-td-item seg-sale-type-header' : `fin-stmt-td-item seg-item-${depth}`}>
        {label}
      </td>
      {periods.map((p) => {
        if (hideValues) {
          return <td key={p} className="td-num" />;
        }
        const rawVal = rawValues[p];
        const val = rawVal != null ? formatSegmentValue(rawVal, saleType) : '—';
        const isNeg = val.startsWith('-') && val !== '-';
        const isPos = val.startsWith('+');
        return (
          <td key={p} className={`td-num${isNeg ? ' fin-stmt-neg' : isPos ? ' fin-stmt-pos' : ''}`}>
            {val}
          </td>
        );
      })}
    </tr>
  );
}

interface SegmentReportTableProps {
  records: SegmentRecord[];
  viewMode: ViewMode;
  yearWindowStart: number;
  currency: Currency;
}

/** Build two-row header cell descriptors for a sorted list of period labels. */
function buildPeriodHeaderCells(periods: string[]): {
  row1Cells: Array<{ type: 'annual'; label: string } | { type: 'qgroup'; yearLabel: string; count: number }>;
  row2Quarters: string[];
  hasQuarterly: boolean;
} {
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
  return { row1Cells, row2Quarters, hasQuarterly: row2Quarters.length > 0 };
}

/** Renders the table for a single category's hierarchy with its own period set. */
function SegmentCategoryTable({
  categoryRecords,
  currency,
}: {
  categoryRecords: SegmentRecord[];
  currency: Currency;
}) {
  // Build ordered, deduplicated period labels for this category
  const periodSet = new Set<string>();
  const sortKeyMap = new Map<string, number>();
  for (const r of categoryRecords) {
    const lbl = segPLabel(r.calendar_year, r.calendar_quarter);
    periodSet.add(lbl);
    if (!sortKeyMap.has(lbl)) sortKeyMap.set(lbl, segPSortKey(r.calendar_year, r.calendar_quarter));
  }
  const periods = [...periodSet].sort((a, b) => (sortKeyMap.get(a) ?? 0) - (sortKeyMap.get(b) ?? 0));

  const hierarchy = buildSegmentHierarchy(categoryRecords, currency);
  const { row1Cells, row2Quarters, hasQuarterly } = buildPeriodHeaderCells(periods);

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
          {hierarchy.map((saleTypeGroup) => {
            const isMargin = isMarginType(saleTypeGroup.saleType);
            return (
              <React.Fragment key={saleTypeGroup.saleType}>
                {/* sale_type header row — shows aggregated total for all l1 children */}
                <SegDataRow
                  label={formatSaleTypeLabel(saleTypeGroup.saleType)}
                  rawValues={saleTypeGroup.rawValues}
                  periods={periods}
                  depth="sale-type"
                  saleType={saleTypeGroup.saleType}
                  hideValues={isMargin}
                />

                {saleTypeGroup.level1Groups.map((level1Group) => (
                  <React.Fragment key={buildSegmentKey([saleTypeGroup.saleType, level1Group.level1])}>
                    {/* l1: aggregated from l2 children (if any), else own direct value */}
                    <SegDataRow
                      label={level1Group.level1}
                      rawValues={level1Group.rawValues}
                      periods={periods}
                      depth="l1"
                      saleType={saleTypeGroup.saleType}
                      hideValues={isMargin && level1Group.level2Groups.length > 0}
                    />

                    {level1Group.level2Groups.map((level2Group) => (
                      <React.Fragment key={buildSegmentKey([saleTypeGroup.saleType, level1Group.level1, level2Group.level2])}>
                        {/* l2: aggregated from l3 children (if any), else own direct value */}
                        <SegDataRow
                          label={level2Group.level2}
                          rawValues={level2Group.rawValues}
                          periods={periods}
                          depth="l2"
                          saleType={saleTypeGroup.saleType}
                          hideValues={isMargin && level2Group.level3Groups.length > 0}
                        />

                        {level2Group.level3Groups.map((level3Group) => (
                          <SegDataRow
                            key={buildSegmentKey([saleTypeGroup.saleType, level1Group.level1, level2Group.level2, level3Group.level3])}
                            label={level3Group.level3}
                            rawValues={level3Group.rawValues}
                            periods={periods}
                            depth="l3"
                            saleType={saleTypeGroup.saleType}
                          />
                        ))}
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SegmentReportTable({ records, viewMode, yearWindowStart, currency }: SegmentReportTableProps) {
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

  // Split by category (sorted: platform before geometric, others follow)
  const categoryOrder: string[] = [];
  const categorySeen = new Set<string>();
  for (const r of filteredRecords) {
    const cat = r.category ?? '';
    if (!categorySeen.has(cat)) {
      categoryOrder.push(cat);
      categorySeen.add(cat);
    }
  }
  sortCategories(categoryOrder);

  // Render one table block per category (skip categories with no renderable data)
  const categoryBlocks = categoryOrder
    .map((category) => {
      const catRecords = filteredRecords.filter((r) => (r.category ?? '') === category);
      const hierarchy = buildSegmentHierarchy(catRecords, currency);
      if (hierarchy.length === 0) return null;
      const hasTitle = !!category;
      return (
        <div key={category} className={`seg-category-block${hasTitle ? ' seg-category-block--titled' : ''}`}>
          {hasTitle && (
            <div className="seg-category-title">{category.toUpperCase()}</div>
          )}
          <SegmentCategoryTable categoryRecords={catRecords} currency={currency} />
        </div>
      );
    })
    .filter(Boolean);

  if (categoryBlocks.length === 0) {
    return (
      <div className="cp-tab-placeholder">
        <span className="cp-tab-placeholder-text">No segment data for selected period.</span>
      </div>
    );
  }

  return (
    <div className="seg-category-blocks">
      {categoryBlocks}
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
            currency={currency}
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
