'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';
import { stockIndexes } from '@/app/data/marketIndices';
import { holdingsData as holdingsDataMap, holdingsDataQ4_2025 } from '@/app/data/watchlistData';
import type { HoldingEntity } from '@/app/data/watchlistData';
import { mainNav } from '@/app/data/navigation';
import { useWatchlist } from '@/app/contexts/WatchlistContext';
import { CATALOG_VIEW_CATEGORIES, CATALOG_COLUMN_LABELS } from '@/app/data/watchlistColumns';
import { newsItems } from '@/app/data/news';
import { pressReleases } from '@/app/data/pressReleases';
import {
  bondEvents,
  dividendEvents,
  dividendAristocratEvents,
  dividendChampionEvents,
  countryEvents,
  currencyEvents,
} from '@/app/data/eventCategories';
import type {
  BondEvent,
  DividendEvent,
  DividendGrowthEvent,
  CountryEvent,
  CurrencyEvent,
} from '@/app/data/eventCategories';

// ── Custom View types ─────────────────────────────────────────────────────────
interface CustomView {
  id: string;
  name: string;
  columns: string[]; // ordered column IDs
  hidden: boolean;
}

// Column definition: label + value getter + optional CSS class getter
interface ColDef {
  label: string;
  getValue: (h: HoldingEntity) => string | number;
  getClass?: (h: HoldingEntity) => string;
}

// Catalog column stubs — columns from watchlist-column-catalog.json that do not have
// a real data getter yet return '-'. Explicit entries below take precedence because
// they are spread last.
const CATALOG_COL_STUBS: Record<string, ColDef> = Object.fromEntries(
  Object.entries(CATALOG_COLUMN_LABELS).map(([id, label]) => [id, { label, getValue: () => '-' as string | number }]),
);

const ALL_COLUMNS: Record<string, ColDef> = {
  ...CATALOG_COL_STUBS,
  price:             { label: 'Price',              getValue: h => h.price.toFixed(2) },
  change:            { label: 'Change',             getValue: h => `${h.change >= 0 ? '+' : ''}${h.change.toFixed(2)}`, getClass: h => h.change >= 0 ? 'pos' : 'neg' },
  changePct:         { label: 'Change %',           getValue: h => `${h.changePct >= 0 ? '+' : ''}${h.changePct.toFixed(2)}%`, getClass: h => h.changePct >= 0 ? 'pos' : 'neg' },
  volume:            { label: 'Volume',             getValue: () => '-' },
  avgVolume:         { label: 'Avg Volume (30D)',   getValue: () => '-' },
  '52wHigh':         { label: '52W High',           getValue: () => '-' },
  '52wLow':          { label: '52W Low',            getValue: () => '-' },
  beta:              { label: 'Beta',               getValue: () => '-' },
  marketCap:         { label: 'Market Cap',         getValue: () => '-' },
  nextEarning:       { label: 'Next Earning Release', getValue: h => h.nextEarning },
  revenueQoQ:        { label: 'Revenue QoQ',        getValue: h => h.revenueQoQ, getClass: h => (h.revenueQoQ !== 'N/A' && h.revenueQoQ.startsWith('+')) ? 'pos' : (h.revenueQoQ !== 'N/A' ? 'neg' : '') },
  revenueYoY:        { label: 'Revenue YoY',        getValue: h => h.revenueYoY, getClass: h => (h.revenueYoY !== 'N/A' && h.revenueYoY.startsWith('+')) ? 'pos' : (h.revenueYoY !== 'N/A' ? 'neg' : '') },
  lastQtrRevenue:    { label: 'Last Qtr Revenue',   getValue: h => h.lastQtrRevenue },
  epsGrowthYoY:      { label: 'EPS Growth YoY',     getValue: () => '-' },
  peRatio:           { label: 'P/E Ratio',          getValue: () => '-' },
  forwardPE:         { label: 'Forward P/E',        getValue: () => '-' },
  psRatio:           { label: 'P/S Ratio',          getValue: () => '-' },
  pbRatio:           { label: 'P/B Ratio',          getValue: () => '-' },
  evEbitda:          { label: 'EV/EBITDA',          getValue: () => '-' },
  dividendYield:     { label: 'Dividend Yield',     getValue: () => '-' },
  revCagr3y:         { label: 'Revenue CAGR (3Y)',  getValue: () => '-' },
  todayGain:         { label: "Today's Gain",       getValue: h => `${h.todayGain >= 0 ? '+' : ''}${h.todayGain.toFixed(2)}`, getClass: h => h.todayGain >= 0 ? 'pos' : 'neg' },
  todayGainPct:      { label: "Today's % Gain",     getValue: h => `${h.todayGainPct >= 0 ? '+' : ''}${h.todayGainPct.toFixed(2)}%`, getClass: h => h.todayGainPct >= 0 ? 'pos' : 'neg' },
  return1m:          { label: '1M Return',          getValue: () => '-' },
  return3m:          { label: '3M Return',          getValue: () => '-' },
  return1y:          { label: '1Y Return',          getValue: () => '-' },
  returnYtd:         { label: 'YTD Return',         getValue: () => '-' },
  vsSP500:           { label: 'vs S&P 500 (1Y)',    getValue: () => '-' },
  vsNasdaq:          { label: 'vs Nasdaq (1Y)',     getValue: () => '-' },
  vsSector:          { label: 'vs Sector (1Y)',     getValue: () => '-' },
  grossMargin:       { label: 'Gross Margin',       getValue: h => h.grossMargin },
  operatingMargin:   { label: 'Operating Margin',   getValue: () => '-' },
  netMargin:         { label: 'Net Margin',         getValue: () => '-' },
  roe:               { label: 'ROE',                getValue: () => '-' },
  roic:              { label: 'ROIC',               getValue: () => '-' },
  lastQtrGrossMargin:{ label: 'Last Qtr Gross Margin', getValue: h => h.lastQtrGrossMargin },
  shares:            { label: 'Shares',             getValue: h => h.shares },
  cost:              { label: 'Cost',               getValue: h => h.cost.toFixed(2) },
  revenue:           { label: 'Revenue',            getValue: h => h.revenue },
  marketValue:       { label: 'Market Value',       getValue: h => (h.price * h.shares).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
  unrealizedPL:      { label: 'Unrealized P&L',     getValue: h => { const v = (h.price - h.cost) * h.shares; return `${v >= 0 ? '+' : ''}${v.toFixed(2)}`; }, getClass: h => (h.price - h.cost) >= 0 ? 'pos' : 'neg' },
  unrealizedPct:     { label: 'Unrealized %',       getValue: h => { const pct = ((h.price - h.cost) / h.cost) * 100; return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`; }, getClass: h => h.price >= h.cost ? 'pos' : 'neg' },
  debtEquity:        { label: 'Debt/Equity',        getValue: () => '-' },
  currentRatio:      { label: 'Current Ratio',      getValue: () => '-' },
  netDebt:           { label: 'Net Debt',           getValue: () => '-' },
  doi:               { label: 'DOI',                getValue: h => h.doi },
  lastQtrDOI:        { label: 'Last Qtr DOI',       getValue: h => h.lastQtrDOI },
};

const BUILTIN_VIEWS = ['Summary', 'Holdings', 'Health Score', 'Ratings'] as const;

// All data (indices, holdings, portfolio config) comes from content/*.md files.
// The fetch script writes to MD; app/data/*.ts readers parse via extractJson().

type Holding = HoldingEntity;

const holdingsDataQ1: Holding[] = Object.values(holdingsDataMap);
const holdingsDataQ4: Holding[] = Object.values(holdingsDataQ4_2025);

// ── Quarter navigation helpers ────────────────────────────────────────────────
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
function quarterOffset(base: { year: number; q: number }, offset: number): { year: number; q: number } {
  const totalQ = base.year * 4 + (base.q - 1) + offset;
  return { year: Math.floor(totalQ / 4), q: (totalQ % 4) + 1 };
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 60;
  const h = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');
  const color = positive ? '#16a34a' : '#dc2626';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={coords} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Sparkline 1Y — deterministic weekly price simulation for a symbol ──────────
function generateSparkline1Y(symbol: string): number[] {
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const weeks = 52;
  const startPrice = 50 + (seed % 450);
  const trendBias = (((seed * 13) % 21) - 10) / 1000; // -0.01 to +0.01 per week
  const volatility = 0.015 + (seed % 20) / 1000; // 1.5% – 3.5%
  const points: number[] = [startPrice];
  let price = startPrice;
  // simple pseudo-random walk using LCG
  let s = seed;
  for (let i = 1; i < weeks; i++) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const rnd = (s % 10000) / 10000 - 0.5; // -0.5 to 0.5
    price = price * (1 + trendBias + rnd * volatility * 2);
    if (price < 1) price = 1;
    points.push(parseFloat(price.toFixed(2)));
  }
  return points;
}

function Sparkline1Y({ symbol }: { symbol: string }) {
  const points = generateSparkline1Y(symbol);
  const positive = points[points.length - 1] >= points[0];
  const w = 100;
  const h = 36;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 6) - 3}`)
    .join(' ');
  const color = positive ? '#16a34a' : '#dc2626';
  const fillColor = positive ? '#16a34a18' : '#dc262618';
  // build fill path: down to baseline and back
  const firstX = 0;
  const lastX = (points.length - 1) * step;
  const firstY = h - ((points[0] - min) / range) * (h - 6) - 3;
  const lastY = h - ((points[points.length - 1] - min) / range) * (h - 6) - 3;
  const fillPath = `M${firstX},${firstY} ${coords.replace(/^\S+/, '')} L${lastX},${h} L${firstX},${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" className="wl-sparkline-1y">
      <path d={fillPath} fill={fillColor} />
      <polyline points={coords} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Alpha Avatar ──────────────────────────────────────────────────────────────
function AlphaAvatar() {
  return (
    <div className="wl-feed-avatar wl-feed-avatar--alpha">
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
        <circle cx="14" cy="14" r="14" fill="#e5e7eb" />
        <text x="14" y="19" textAnchor="middle" fontSize="14" fill="#9ca3af" fontFamily="serif">
          α
        </text>
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="wl-feed-avatar">
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
        <circle cx="14" cy="14" r="14" fill="#d1d5db" />
        <circle cx="14" cy="11" r="4" fill="#9ca3af" />
        <ellipse cx="14" cy="22" rx="7" ry="4" fill="#9ca3af" />
      </svg>
    </div>
  );
}

// ── Placeholder holding generator (deterministic based on symbol chars) ───────
function createPlaceholderHolding(symbol: string): Holding {
  const seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const price = 20 + (seed % 780); // $20 - $799
  const changeAbs = parseFloat(((((seed * 7) % 200) - 100) / 100).toFixed(2));
  const changePct = parseFloat(((changeAbs / price) * 100).toFixed(2));
  const shares = 10 + (seed % 91);
  const cost = parseFloat((price * 0.9).toFixed(2));
  const todayGain = parseFloat((changeAbs * shares).toFixed(2));
  const todayGainPct = changePct;
  const revenueB = parseFloat((1 + (seed % 99)).toFixed(2));
  const qoqSign = seed % 2 === 0 ? '+' : '-';
  const yoySign = (seed * 3) % 5 > 1 ? '+' : '-';
  const grossMarginPct = 20 + (seed % 55);
  const doiDays = 15 + (seed % 200);
  return {
    symbol,
    price,
    change: changeAbs,
    changePct,
    shares,
    cost,
    todayGain,
    todayGainPct,
    revenue: `$${revenueB.toFixed(2)}B`,
    revenueQoQ: `${qoqSign}${((seed % 15) + 1).toFixed(1)}%`,
    revenueYoY: `${yoySign}${((seed % 30) + 1).toFixed(1)}%`,
    grossMargin: `${grossMarginPct}%`,
    doi: `${doiDays}`,
    nextEarning: 'TBD',
    lastQtrRevenue: `$${(revenueB * 1.05).toFixed(2)}B`,
    lastQtrGrossMargin: `${grossMarginPct + 1}%`,
    lastQtrDOI: `${doiDays - 5}`,
  };
}

// ── Excel download ────────────────────────────────────────────────────────────

const HEADERS = [
  'Symbol', 'Price', 'Change', 'Change %', 'Shares', 'Cost',
  "Today's Gain", "Today's % Gain", 'Revenue', 'Revenue QoQ', 'Revenue YoY',
  'Gross Margin', 'DOI', 'Next Earning Release',
  'Last Qtr Revenue', 'Last Qtr Gross Margin', 'Last Qtr DOI',
];

// Determine the text color ARGB for a cell value based on how the table renders it.
function getCellColor(h: Holding, col: string): string | null {
  if (col === 'Change' || col === 'Change %') return h.change >= 0 ? 'FF16A34A' : 'FFDC2626';
  if (col === "Today's Gain" || col === "Today's % Gain") return h.todayGain >= 0 ? 'FF16A34A' : 'FFDC2626';
  if (col === 'Revenue QoQ') return h.revenueQoQ.startsWith('+') ? 'FF16A34A' : 'FFDC2626';
  if (col === 'Revenue YoY') return h.revenueYoY.startsWith('+') ? 'FF16A34A' : 'FFDC2626';
  return null;
}

function getCellValue(h: Holding, col: string): string | number {
  switch (col) {
    case 'Symbol': return h.symbol;
    case 'Price': return h.price.toFixed(2);
    case 'Change': return `${h.change >= 0 ? '+' : ''}${h.change.toFixed(2)}`;
    case 'Change %': return `${h.changePct >= 0 ? '+' : ''}${h.changePct.toFixed(2)}%`;
    case 'Shares': return h.shares;
    case 'Cost': return h.cost.toFixed(2);
    case "Today's Gain": return `${h.todayGain >= 0 ? '+' : ''}${h.todayGain.toFixed(2)}`;
    case "Today's % Gain": return `${h.todayGainPct >= 0 ? '+' : ''}${h.todayGainPct.toFixed(2)}%`;
    case 'Revenue': return h.revenue;
    case 'Revenue QoQ': return h.revenueQoQ;
    case 'Revenue YoY': return h.revenueYoY;
    case 'Gross Margin': return h.grossMargin;
    case 'DOI': return h.doi;
    case 'Next Earning Release': return h.nextEarning;
    case 'Last Qtr Revenue': return h.lastQtrRevenue;
    case 'Last Qtr Gross Margin': return h.lastQtrGrossMargin;
    case 'Last Qtr DOI': return h.lastQtrDOI;
    default: return '';
  }
}

async function downloadHoldingsExcel(watchlistName: string, holdings: Holding[]) {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Holdings');

  // Row 1: Watchlist title (merged across all header columns)
  const titleCell = ws.getCell('A1');
  titleCell.value = watchlistName;
  titleCell.font = { bold: true, size: 14, color: { argb: 'FF111827' } };
  ws.mergeCells(1, 1, 1, HEADERS.length);

  // Row 2: empty spacer

  // Row 3: Column headers
  const headerRow = ws.getRow(3);
  HEADERS.forEach((h, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: 'FF374151' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    cell.border = { bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } } };
    cell.alignment = { horizontal: 'right' };
  });
  // Left-align Symbol column
  headerRow.getCell(1).alignment = { horizontal: 'left' };

  // Rows 4+: Holdings data
  holdings.forEach((h, rowIdx) => {
    const row = ws.getRow(4 + rowIdx);
    HEADERS.forEach((col, colIdx) => {
      const cell = row.getCell(colIdx + 1);
      cell.value = getCellValue(h, col);
      const colorArgb = getCellColor(h, col);
      cell.font = { color: { argb: colorArgb ?? 'FF111827' } };
      cell.alignment = { horizontal: colIdx === 0 ? 'left' : 'right' };
    });
  });

  // Auto column widths (approx)
  ws.columns.forEach((col, i) => {
    col.width = Math.max(HEADERS[i].length + 2, 12);
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${watchlistName}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Manage View Modal ─────────────────────────────────────────────────────────
interface ManageViewModalProps {
  customViews: CustomView[];
  viewOrder: string[];
  hiddenViews: Set<string>;
  onSave: (name: string, columns: string[]) => void;
  onDelete: (id: string) => void;
  onToggleHide: (id: string) => void;
  onReorderViews: (order: string[]) => void;
  onClose: () => void;
}

function ManageViewModal({
  customViews,
  viewOrder,
  hiddenViews,
  onSave,
  onDelete,
  onToggleHide,
  onReorderViews,
  onClose,
}: ManageViewModalProps) {
  const [modalTab, setModalTab] = useState<'create' | 'edit'>('create');

  // Create New View state
  const [viewName, setViewName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(CATALOG_VIEW_CATEGORIES)[0]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Edit Views drag state
  const editDragItem = useRef<number | null>(null);
  const editDragOver = useRef<number | null>(null);

  const availableColumns = CATALOG_VIEW_CATEGORIES[selectedCategory] ?? [];

  const handleToggleColumn = useCallback((colId: string) => {
    setSelectedColumns((prev) =>
      prev.includes(colId) ? prev.filter((c) => c !== colId) : [...prev, colId],
    );
  }, []);

  const handleRemoveSelectedColumn = useCallback((colId: string) => {
    setSelectedColumns((prev) => prev.filter((c) => c !== colId));
  }, []);

  // Drag handlers for selected columns reorder
  const selDragItem = useRef<number | null>(null);
  const selDragOver = useRef<number | null>(null);

  function handleSelDragStart(i: number) { selDragItem.current = i; }
  function handleSelDragEnter(i: number) { selDragOver.current = i; }
  function handleSelDragEnd() {
    if (selDragItem.current === null || selDragOver.current === null) return;
    const copy = [...selectedColumns];
    const item = copy.splice(selDragItem.current, 1)[0];
    copy.splice(selDragOver.current, 0, item);
    setSelectedColumns(copy);
    selDragItem.current = null;
    selDragOver.current = null;
  }

  // Drag handlers for Edit Views tab order
  function handleEditDragStart(i: number) { editDragItem.current = i; }
  function handleEditDragEnter(i: number) { editDragOver.current = i; }
  function handleEditDragEnd() {
    if (editDragItem.current === null || editDragOver.current === null) return;
    const copy = [...viewOrder];
    const item = copy.splice(editDragItem.current, 1)[0];
    copy.splice(editDragOver.current, 0, item);
    onReorderViews(copy);
    editDragItem.current = null;
    editDragOver.current = null;
  }

  function handleCreateSave() {
    const name = viewName.trim();
    if (!name || selectedColumns.length === 0) return;
    onSave(name, selectedColumns);
  }

  return (
    <div className="wl-modal-overlay" onClick={onClose}>
      <div className="wl-modal wl-modal--wide" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wl-modal-header">
          <span className="wl-modal-title">Manage View</span>
          <div className="wl-modal-header-actions">
            <button className="wl-modal-cancel-btn" onClick={onClose}>Close</button>
          </div>
        </div>

        {/* Inner tabs */}
        <div className="wl-mv-tabs">
          <button
            className={`wl-mv-tab${modalTab === 'create' ? ' active' : ''}`}
            onClick={() => setModalTab('create')}
          >
            Create New View
          </button>
          <button
            className={`wl-mv-tab${modalTab === 'edit' ? ' active' : ''}`}
            onClick={() => setModalTab('edit')}
          >
            Edit Views
          </button>
        </div>

        {/* Body */}
        <div className="wl-modal-body wl-modal-body--scroll">
          {modalTab === 'create' ? (
            <>
              {/* View Name */}
              <div className="wl-modal-field">
                <label className="wl-modal-field-label">View Name</label>
                <input
                  className="wl-modal-input"
                  type="text"
                  placeholder="e.g. My Earnings View"
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  autoFocus
                />
              </div>

              {/* 3-column picker */}
              <div className="wl-mv-picker">
                {/* Category */}
                <div className="wl-mv-panel">
                  <div className="wl-mv-panel-title">Category</div>
                  <div className="wl-mv-panel-body">
                    {Object.keys(CATALOG_VIEW_CATEGORIES).map((cat) => (
                      <button
                        key={cat}
                        className={`wl-mv-cat-item${selectedCategory === cat ? ' active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Available Columns */}
                <div className="wl-mv-panel">
                  <div className="wl-mv-panel-title">Available Columns</div>
                  <div className="wl-mv-panel-body">
                    {availableColumns.map((colId) => {
                      const label = ALL_COLUMNS[colId]?.label ?? CATALOG_COLUMN_LABELS[colId];
                      if (!label) return null;
                      const checked = selectedColumns.includes(colId);
                      return (
                        <label key={colId} className="wl-mv-col-item">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleColumn(colId)}
                          />
                          <span>{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Columns */}
                <div className="wl-mv-panel">
                  <div className="wl-mv-panel-title">
                    Selected Columns
                    {selectedColumns.length > 0 && (
                      <span className="wl-mv-badge">{selectedColumns.length}</span>
                    )}
                  </div>
                  <div className="wl-mv-panel-body">
                    {selectedColumns.length === 0 ? (
                      <div className="wl-mv-empty">No columns selected yet.<br />Check columns on the left.</div>
                    ) : (
                      selectedColumns.map((colId, i) => {
                        const label = ALL_COLUMNS[colId]?.label ?? CATALOG_COLUMN_LABELS[colId];
                        if (!label) return null;
                        return (
                          <div
                            key={colId}
                            className="wl-mv-sel-item"
                            draggable
                            onDragStart={() => handleSelDragStart(i)}
                            onDragEnter={() => handleSelDragEnter(i)}
                            onDragEnd={handleSelDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            <svg className="wl-drag-handle" viewBox="0 0 14 14" fill="none" width="12" height="12">
                              <path d="M3 4h8M3 7h8M3 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                            <span className="wl-mv-sel-label">{label}</span>
                            <button
                              className="wl-drag-delete"
                              aria-label={`Remove ${label}`}
                              onClick={() => handleRemoveSelectedColumn(colId)}
                            >
                              <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
                                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Save button */}
              <button
                className="wl-modal-done-btn"
                style={{ alignSelf: 'flex-end', marginTop: 4 }}
                onClick={handleCreateSave}
                disabled={!viewName.trim() || selectedColumns.length === 0}
              >
                Save View
              </button>
            </>
          ) : (
            /* Edit Views tab */
            <div className="wl-mv-edit-list">
              {viewOrder.map((id, i) => {
                const isBuiltin = BUILTIN_VIEWS.includes(id as typeof BUILTIN_VIEWS[number]);
                const label = isBuiltin
                  ? id
                  : (customViews.find((v) => v.id === id)?.name ?? id);
                const isHidden = hiddenViews.has(id);
                return (
                  <div
                    key={id}
                    className="wl-mv-edit-item"
                    draggable
                    onDragStart={() => handleEditDragStart(i)}
                    onDragEnter={() => handleEditDragEnter(i)}
                    onDragEnd={handleEditDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <svg className="wl-drag-handle" viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <path d="M3 4h8M3 7h8M3 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <span className={`wl-mv-edit-label${isHidden ? ' wl-mv-edit-label--hidden' : ''}`}>{label}</span>
                    <div className="wl-mv-edit-actions">
                      <button
                        className={`wl-mv-hide-btn${isHidden ? ' active' : ''}`}
                        title={isHidden ? 'Show View' : 'Hide View'}
                        onClick={() => onToggleHide(id)}
                      >
                        {isHidden ? (
                          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                            <path d="M1.5 7C1.5 7 3.5 3 7 3C10.5 3 12.5 7 12.5 7C12.5 7 10.5 11 7 11C3.5 11 1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.3" />
                            <circle cx="7" cy="7" r="1.8" fill="currentColor" />
                            <path d="M2 2L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                            <path d="M1.5 7C1.5 7 3.5 3 7 3C10.5 3 12.5 7 12.5 7C12.5 7 10.5 11 7 11C3.5 11 1.5 7 1.5 7Z" stroke="currentColor" strokeWidth="1.3" />
                            <circle cx="7" cy="7" r="1.8" fill="currentColor" />
                          </svg>
                        )}
                        <span>{isHidden ? 'Show' : 'Hide'}</span>
                      </button>
                      <button
                        className="wl-mv-delete-btn"
                        title="Delete View"
                        onClick={() => onDelete(id)}
                      >
                        <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                          <path d="M2.5 4h9M5.5 4V2.5h3V4M5.5 6.5v4M8.5 6.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Coming Soon panels (Health Score & Ratings) ───────────────────────────────
function HealthScoreComingSoon() {
  return (
    <div className="wl-cs-wrap">
      <span className="wl-cs-badge">Coming Soon</span>
      <div className="wl-cs-layout">
        {/* Gauge visualization */}
        <div className="wl-cs-visual">
          <svg className="wl-cs-gauge-svg" viewBox="0 0 260 165" fill="none" role="img" aria-label="Health Score gauge, score 72 out of 100">
            <title>Health Score Gauge</title>
            {/* Background track */}
            <path d="M 30 140 A 100 100 0 0 1 230 140" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Red zone 0–33%: (30,140) → (80,53) */}
            <path d="M 30 140 A 100 100 0 0 1 80 53" stroke="#ef4444" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Yellow zone 33–67%: (80,53) → (180,53) */}
            <path d="M 80 53 A 100 100 0 0 1 180 53" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Green zone 67–100%: (180,53) → (230,140) */}
            <path d="M 180 53 A 100 100 0 0 1 230 140" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" fill="none" />
            {/* Needle pointing to score 72 */}
            <line x1="130" y1="140" x2="182" y2="77" stroke="#1a2332" strokeWidth="3.5" strokeLinecap="round" />
            {/* Pivot */}
            <circle cx="130" cy="140" r="9" fill="#1a2332" />
            <circle cx="130" cy="140" r="4" fill="white" />
            {/* Score value */}
            <text x="130" y="118" textAnchor="middle" fontSize="30" fontWeight="700" fill="#1a2332" fontFamily="system-ui,sans-serif">72</text>
            <text x="130" y="158" textAnchor="middle" fontSize="10" fill="#6b7280" fontFamily="system-ui,sans-serif">Health Score</text>
            {/* Zone labels */}
            <text x="14" y="158" fontSize="9" fill="#ef4444" fontFamily="system-ui,sans-serif">Low</text>
            <text x="120" y="26" fontSize="9" fill="#f59e0b" fontFamily="system-ui,sans-serif">Mid</text>
            <text x="232" y="158" fontSize="9" fill="#22c55e" fontFamily="system-ui,sans-serif">High</text>
          </svg>
          <div className="wl-cs-score-bands">
            <span className="wl-cs-band wl-cs-band--low">0–40 Low</span>
            <span className="wl-cs-band wl-cs-band--mid">41–70 Mid</span>
            <span className="wl-cs-band wl-cs-band--high">71–100 Healthy</span>
          </div>
        </div>
        {/* Description and factor grid */}
        <div className="wl-cs-info">
          <h2 className="wl-cs-title">
            Health Score
          </h2>
          <p className="wl-cs-desc">
            A comprehensive fundamental health analysis of target companies, synthesizing key financial metrics. The system integrates financial data, growth momentum, and market positioning into an intuitive dashboard score, helping investors quickly assess a company&apos;s overall condition.
          </p>
          <div className="wl-cs-factors">
            {[
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <polyline points="2,16 7,9 12,12 18,4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="14,4 18,4 18,8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                label: 'Revenue Growth',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 6v4l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                ),
                label: 'Profitability',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <rect x="2" y="11" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="8" y="7" width="4" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="14" y="3" width="4" height="15" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
                label: 'Balance Sheet',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <path d="M4 15c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M10 9V5M7 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                label: 'Cash Flow',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <path d="M10 2L12.4 7.5H18L13.5 11l1.9 5.5L10 13.5 4.6 16.5l1.9-5.5L2 7.5h5.6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                label: 'Market Position',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
                label: 'Management',
              },
            ].map((f) => (
              <div key={f.label} className="wl-cs-factor">
                <span className="wl-cs-factor-icon">{f.icon}</span>
                <span className="wl-cs-factor-label">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RatingsComingSoon() {
  return (
    <div className="wl-cs-wrap">
      <span className="wl-cs-badge">Coming Soon</span>
      <div className="wl-cs-layout">
        {/* Star rating + analyst distribution */}
        <div className="wl-cs-visual">
          <div className="wl-cs-stars" role="img" aria-label="Analyst consensus rating 4.2 out of 5; shown as 4 filled stars and 1 empty star">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} viewBox="0 0 20 20" width="28" height="28" aria-hidden="true">
                <path
                  d="M10 1.5l2.4 4.86 5.36.78-3.88 3.78.92 5.33L10 13.5l-4.8 2.75.92-5.33L2.24 7.14l5.36-.78L10 1.5z"
                  fill={i <= 4 ? '#f59e0b' : 'none'}
                  stroke={i <= 4 ? '#f59e0b' : '#d1d5db'}
                  strokeWidth="1.2"
                />
              </svg>
            ))}
            <span className="wl-cs-star-score">4.2 / 5</span>
          </div>
          <div className="wl-cs-rating-dist">
            {[
              { label: 'Buy', pct: 62, cls: 'buy' },
              { label: 'Hold', pct: 25, cls: 'hold' },
              { label: 'Sell', pct: 13, cls: 'sell' },
            ].map((r) => (
              <div key={r.cls} className="wl-cs-rating-row">
                <span className={`wl-cs-rating-label wl-cs-rating-label--${r.cls}`}>{r.label}</span>
                <div className="wl-cs-rating-bar-wrap">
                  <div className={`wl-cs-rating-bar wl-cs-rating-bar--${r.cls}`} style={{ width: `${r.pct}%` }} />
                </div>
                <span className="wl-cs-rating-pct">{r.pct}%</span>
              </div>
            ))}
          </div>
          <p className="wl-cs-analyst-count">Based on 32 analyst ratings</p>
        </div>
        {/* Description and feature grid */}
        <div className="wl-cs-info">
          <h2 className="wl-cs-title">
            Ratings
          </h2>
          <p className="wl-cs-desc">
            Aggregates analyst ratings and price target data from major institutions, providing buy/hold/sell distribution, consensus scores, and rating change trends — delivering a comprehensive market perspective to inform investment decisions.
          </p>
          <div className="wl-cs-factors">
            {[
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <path d="M10 1.5l2.4 4.86 5.36.78-3.88 3.78.92 5.33L10 13.5l-4.8 2.75.92-5.33L2.24 7.14l5.36-.78L10 1.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                ),
                label: 'Analyst Ratings',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 7v3l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                ),
                label: 'Price Targets',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <rect x="3" y="13" width="3" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="8.5" y="8" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="14" y="3" width="3" height="15" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ),
                label: 'Rating Distribution',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <path d="M3 10h14M13 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                label: 'Rating Changes',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6 7h8M6 10h8M6 13h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                ),
                label: 'Institutional Coverage',
              },
              {
                icon: (
                  <svg viewBox="0 0 20 20" fill="none" width="22" height="22" aria-hidden="true">
                    <path d="M3 15l4-5 4 3 3-4 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="3" cy="15" r="1.2" fill="currentColor" />
                    <circle cx="18" cy="12" r="1.2" fill="currentColor" />
                  </svg>
                ),
                label: 'Sentiment Indicator',
              },
            ].map((f) => (
              <div key={f.label} className="wl-cs-factor">
                <span className="wl-cs-factor-icon">{f.icon}</span>
                <span className="wl-cs-factor-label">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type FeedTab = 'Latest' | 'News' | 'Press Release' | 'Event';

// ── Unified Updates feed item ─────────────────────────────────────────────────
interface UpdateFeedItem {
  id: string;
  kind: 'news' | 'press-release' | 'event';
  title: string;
  source: string;
  displaySymbols: string[];
  dateLabel: string;
  dateMs: number;
  description?: string;
}

function parseDateKey(dateKey: string): number {
  try { return new Date(`${dateKey} 2026`).getTime(); } catch { return 0; }
}

export default function WatchlistArchiveContent() {
  const watchlistId = '627836';
  const { watchlistNames, setWatchlistName, symbolOrders, setSymbolOrder, favorites, toggleFavorite, dynamicWatchlists, deletedWatchlists, deleteWatchlist } = useWatchlist();
  const router = useRouter();

  const watchlistName = watchlistNames[watchlistId] ?? 'Watchlist';
  const currentSymbolOrder = symbolOrders[watchlistId] ?? holdingsDataQ1.map((h) => h.symbol);

  const [activeTab, setActiveTab] = useState<string>('Summary');
  const [feedTab, setFeedTab] = useState<FeedTab>('Latest');
  const [quarter, setQuarter] = useState({ year: 2026, q: 1 });
  const [splitLayout, setSplitLayout] = useState(false);

  // Custom views state
  const [customViews, setCustomViews] = useState<CustomView[]>([]);
  const [viewOrder, setViewOrder] = useState<string[]>([...BUILTIN_VIEWS]);
  const [hiddenViews, setHiddenViews] = useState<Set<string>>(new Set());
  const [customViewsHydrated, setCustomViewsHydrated] = useState(false);

  // Modal states
  const [showManageAlerts, setShowManageAlerts] = useState(false);
  const [showEditWatchlist, setShowEditWatchlist] = useState(false);
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [showManageView, setShowManageView] = useState(false);

  // Manage Alerts toggles
  const [newsAlert, setNewsAlert] = useState(true);
  const [transcriptAlert, setTranscriptAlert] = useState(false);

  // Edit Watchlist state
  const [editWatchlistName, setEditWatchlistName] = useState(watchlistName);
  const [editSymbolOrder, setEditSymbolOrder] = useState<string[]>([...currentSymbolOrder]);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Add Symbol state
  const [addSymbolQuery, setAddSymbolQuery] = useState('');

  // Extra holdings added by the user (persisted in localStorage)
  const [extraHoldings, setExtraHoldings] = useState<Record<string, Holding>>({});
  const [extraHoldingsHydrated, setExtraHoldingsHydrated] = useState(false);

  // Watchlist title dropdown state
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const titleDropdownRef = useRef<HTMLDivElement>(null);

  // Close title dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(e.target as Node)) {
        setShowTitleDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync editWatchlistName when watchlistName changes from context
  useEffect(() => {
    setEditWatchlistName(watchlistName);
  }, [watchlistName]);

  // Sync editSymbolOrder when symbolOrder changes from context (e.g., after page reload).
  // We intentionally use a JSON-serialized snapshot as the dependency to avoid
  // re-running on every render when the array reference changes but values are the same.
  const currentSymbolOrderKey = currentSymbolOrder.join(',');
  useEffect(() => {
    setEditSymbolOrder(currentSymbolOrder.slice());
  }, [currentSymbolOrderKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load extraHoldings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wl-extra-holdings');
      if (stored) setExtraHoldings(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
    setExtraHoldingsHydrated(true);
  }, []);

  // Persist extraHoldings to localStorage when they change (after hydration)
  useEffect(() => {
    if (!extraHoldingsHydrated) return;
    try {
      localStorage.setItem('wl-extra-holdings', JSON.stringify(extraHoldings));
    } catch {
      // ignore storage errors
    }
  }, [extraHoldings, extraHoldingsHydrated]);

  // Load custom views from localStorage on mount
  useEffect(() => {
    try {
      const storedViews = localStorage.getItem('wl-custom-views');
      const parsedViews: CustomView[] = storedViews ? JSON.parse(storedViews) : [];
      if (storedViews) setCustomViews(parsedViews);
      const storedOrder = localStorage.getItem('wl-view-order');
      if (storedOrder) {
        // Filter out legacy built-in view IDs that no longer exist
        const validIds = new Set<string>([...BUILTIN_VIEWS, ...parsedViews.map((v) => v.id)]);
        const filteredOrder = (JSON.parse(storedOrder) as string[]).filter((id) => validIds.has(id));
        setViewOrder(filteredOrder.length ? filteredOrder : [...BUILTIN_VIEWS]);
      }
      const storedHidden = localStorage.getItem('wl-hidden-views');
      if (storedHidden) setHiddenViews(new Set(JSON.parse(storedHidden)));
    } catch {
      // ignore parse errors
    }
    setCustomViewsHydrated(true);
  }, []);

  // Persist custom views
  useEffect(() => {
    if (!customViewsHydrated) return;
    try {
      localStorage.setItem('wl-custom-views', JSON.stringify(customViews));
    } catch { /* ignore */ }
  }, [customViews, customViewsHydrated]);

  useEffect(() => {
    if (!customViewsHydrated) return;
    try {
      localStorage.setItem('wl-view-order', JSON.stringify(viewOrder));
    } catch { /* ignore */ }
  }, [viewOrder, customViewsHydrated]);

  useEffect(() => {
    if (!customViewsHydrated) return;
    try {
      localStorage.setItem('wl-hidden-views', JSON.stringify([...hiddenViews]));
    } catch { /* ignore */ }
  }, [hiddenViews, customViewsHydrated]);

  const prevQ = quarterOffset(quarter, -1);
  const nextQ = quarterOffset(quarter, 1);

  // Watchlist sub-items from navigation data (shared with sidebar) — exclude "Create Watchlist" divider item, filter deleted
  const watchlistSubItems = (mainNav.find((item) => item.icon === 'watchlist')?.subItems ?? []).filter(
    (item) => !item.dividerBefore && (!item.watchlistId || !deletedWatchlists.has(item.watchlistId)),
  );

  // Build merged list: static items + dynamic watchlists (excluding deleted)
  const allWatchlistItems = [
    ...watchlistSubItems,
    ...dynamicWatchlists
      .filter((wl) => !deletedWatchlists.has(wl.id))
      .map((wl) => ({ label: wl.name, href: `/watchlist/${wl.id}`, watchlistId: wl.id })),
  ];

  // Sorted holdings based on symbolOrder (includes user-added extra holdings)
  // Select dataset based on active quarter (Q4 2025 or Q1 2026)
  const isQ4_2025 = quarter.year === 2025 && quarter.q === 4;
  const activeHoldingsData = isQ4_2025 ? holdingsDataQ4 : holdingsDataQ1;
  const holdingsLookup = new Map(activeHoldingsData.map((h) => [h.symbol, h]));
  const sortedHoldings = [...currentSymbolOrder]
    .map((sym) => holdingsLookup.get(sym) ?? extraHoldings[sym])
    .filter(Boolean) as Holding[];

  const totalValue = sortedHoldings.reduce((sum, h) => sum + h.price * h.shares, 0);
  const totalGain = sortedHoldings.reduce((sum, h) => sum + h.todayGain, 0);
  const totalGainPct = (totalGain / (totalValue - totalGain)) * 100;

  // Holdings tab derived totals
  const totalCostBasis = sortedHoldings.reduce((sum, h) => sum + h.cost * h.shares, 0);
  const totalUnrealizedGain = totalValue - totalCostBasis;
  const totalUnrealizedPct = totalCostBasis > 0 ? (totalUnrealizedGain / totalCostBasis) * 100 : 0;

  // Company name lookup map (symbol → full name)
  const companyNameMap = new Map(COMPANY_MASTER_LIST.map((c) => [c.symbol, c.name]));

  // Drag handlers for Edit Watchlist symbol reorder
  function handleDragStart(index: number) {
    dragItem.current = index;
  }
  function handleDragEnter(index: number) {
    dragOverItem.current = index;
  }
  function handleDragEnd() {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copy = [...editSymbolOrder];
    const dragged = copy.splice(dragItem.current, 1)[0];
    copy.splice(dragOverItem.current, 0, dragged);
    setEditSymbolOrder(copy);
    dragItem.current = null;
    dragOverItem.current = null;
  }

  // Delete symbol from edit list
  function handleDeleteSymbol(sym: string) {
    setEditSymbolOrder((prev) => prev.filter((s) => s !== sym));
  }

  // Add Symbol search suggestions
  const addSymbolParts = addSymbolQuery.split(',');
  const addSuggestionQuery = (addSymbolParts.pop() ?? '').trim();
  const alreadyEnteredSymbols = addSymbolParts
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
  const addSuggestions =
    addSuggestionQuery.length > 0
      ? COMPANY_MASTER_LIST.filter(
          (c) =>
            !alreadyEnteredSymbols.includes(c.symbol.toUpperCase()) &&
            (c.symbol.toLowerCase().includes(addSuggestionQuery.toLowerCase()) ||
              c.name.toLowerCase().includes(addSuggestionQuery.toLowerCase())),
        ).slice(0, 12)
      : [];

  function handleEditWatchlistClick() {
    setEditWatchlistName(watchlistName);
    setEditSymbolOrder([...currentSymbolOrder]);
    setShowEditWatchlist(true);
  }

  function handleEditWatchlistDone() {
    const trimmed = editWatchlistName.trim() || watchlistName;
    setWatchlistName(watchlistId, trimmed);
    setSymbolOrder(watchlistId, [...editSymbolOrder]);
    setShowEditWatchlist(false);
  }

  function handleDeleteWatchlist() {
    deleteWatchlist(watchlistId);
    setShowEditWatchlist(false);
    // Navigate to another available watchlist, excluding the one just deleted
    const newDeleted = new Set([...deletedWatchlists, watchlistId]);
    const remaining = [
      ...(mainNav.find((item) => item.icon === 'watchlist')?.subItems ?? []).filter(
        (item) => item.watchlistId && !newDeleted.has(item.watchlistId),
      ),
      ...dynamicWatchlists.filter((wl) => !newDeleted.has(wl.id)).map((wl) => ({ href: `/watchlist/${wl.id}` })),
    ];
    if (remaining.length > 0) {
      router.push(remaining[0].href);
    } else {
      router.push('/watchlist/create');
    }
  }

  function handleAddSymbolClose() {
    setShowAddSymbol(false);
    setAddSymbolQuery('');
  }

  function handleAddSymbolSubmit() {
    const symbols = addSymbolQuery
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (symbols.length > 0) {
      const newExtraHoldings = { ...extraHoldings };
      const newOrder = [...currentSymbolOrder];
      for (const sym of symbols) {
        if (newOrder.includes(sym)) continue;
        newOrder.push(sym);
        // Create placeholder data only if not already covered by holdingsData
        if (!holdingsLookup.has(sym) && !newExtraHoldings[sym]) {
          newExtraHoldings[sym] = createPlaceholderHolding(sym);
        }
      }
      setExtraHoldings(newExtraHoldings);
      setSymbolOrder(watchlistId, newOrder);
    }

    handleAddSymbolClose();
  }

  // ── Custom View handlers ───────────────────────────────────────────────────
  function handleSaveCustomView(name: string, columns: string[]) {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `view-${crypto.randomUUID()}`
        : `view-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    const newView: CustomView = { id, name, columns, hidden: false };
    setCustomViews((prev) => [...prev, newView]);
    setViewOrder((prev) => [...prev, id]);
    setShowManageView(false);
    setActiveTab(id);
  }

  function handleDeleteCustomView(id: string) {
    setCustomViews((prev) => prev.filter((v) => v.id !== id));
    setViewOrder((prev) => prev.filter((v) => v !== id));
    if (activeTab === id) setActiveTab('Summary');
  }

  function handleToggleHideView(id: string) {
    setHiddenViews((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (activeTab === id) setActiveTab('Summary');
  }

  // ── Updates feed: build filtered items from real data sources ────────────
  const watchlistSymbolSet = useMemo(() => new Set(currentSymbolOrder), [currentSymbolOrder]);

  const newsUpdateItems = useMemo((): UpdateFeedItem[] =>
    newsItems
      .filter((item) => item.tags.some((tag) => watchlistSymbolSet.has(tag.symbol)))
      .map((item) => ({
        id: item.id,
        kind: 'news' as const,
        title: item.title,
        source: item.source,
        displaySymbols: item.tags.filter((t) => watchlistSymbolSet.has(t.symbol)).map((t) => t.symbol),
        dateLabel: item.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dateMs: item.publishedAt.getTime(),
      })),
    [watchlistSymbolSet],
  );

  const prUpdateItems = useMemo((): UpdateFeedItem[] =>
    pressReleases
      .filter((pr) => watchlistSymbolSet.has(pr.ticker))
      .map((pr) => ({
        id: pr.id,
        kind: 'press-release' as const,
        title: pr.title,
        source: pr.company,
        displaySymbols: [pr.ticker],
        dateLabel: pr.publishedAt,
        dateMs: new Date(pr.publishedAt).getTime(),
        description: pr.summary,
      })),
    [watchlistSymbolSet],
  );

  const eventUpdateItems = useMemo((): UpdateFeedItem[] => {
    const items: UpdateFeedItem[] = [];

    Object.entries(bondEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as BondEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `bond-${date}-${i}`,
          kind: 'event',
          title: `${e.eventType}: ${e.company}`,
          source: 'Bond Event',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: e.description,
        });
      });
    });

    Object.entries(dividendEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as DividendEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `div-${date}-${i}`,
          kind: 'event',
          title: `Dividend: ${e.company} — ${e.dividend}`,
          source: 'Dividend',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: `Ex-Date: ${e.exDate} · Pay Date: ${e.payDate} · Yield: ${e.yield}`,
        });
      });
    });

    Object.entries(dividendAristocratEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as DividendGrowthEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `diva-${date}-${i}`,
          kind: 'event',
          title: `Dividend Aristocrat: ${e.company} — ${e.dividend}`,
          source: 'Dividend Aristocrat',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: `Ex-Date: ${e.exDate} · Consecutive Years: ${e.consecutiveYears} · Annual Growth: ${e.annualGrowth}`,
        });
      });
    });

    Object.entries(dividendChampionEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as DividendGrowthEvent;
        if (!watchlistSymbolSet.has(e.symbol)) return;
        items.push({
          id: `divc-${date}-${i}`,
          kind: 'event',
          title: `Dividend Champion: ${e.company} — ${e.dividend}`,
          source: 'Dividend Champion',
          displaySymbols: [e.symbol],
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: `Ex-Date: ${e.exDate} · Annual Growth: ${e.annualGrowth}`,
        });
      });
    });

    Object.entries(countryEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as CountryEvent;
        const matching = e.affectedCompanies.filter((s) => watchlistSymbolSet.has(s));
        if (matching.length === 0) return;
        items.push({
          id: `country-${date}-${i}`,
          kind: 'event',
          title: e.title,
          source: `Country Event · ${e.country}`,
          displaySymbols: matching,
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: e.description,
        });
      });
    });

    Object.entries(currencyEvents).forEach(([date, evts]) => {
      evts.forEach((evt, i) => {
        const e = evt as CurrencyEvent;
        const matching = e.affectedCompanies.filter((s) => watchlistSymbolSet.has(s));
        if (matching.length === 0) return;
        items.push({
          id: `fx-${date}-${i}`,
          kind: 'event',
          title: `FX: ${e.pair} — ${e.rate}`,
          source: 'Currency Event',
          displaySymbols: matching,
          dateLabel: date,
          dateMs: parseDateKey(date),
          description: e.description,
        });
      });
    });

    return items.sort((a, b) => b.dateMs - a.dateMs);
  }, [watchlistSymbolSet]);

  const latestUpdateItems = useMemo(
    (): UpdateFeedItem[] =>
      [...newsUpdateItems, ...prUpdateItems, ...eventUpdateItems].sort((a, b) => b.dateMs - a.dateMs),
    [newsUpdateItems, prUpdateItems, eventUpdateItems],
  );

  const currentUpdateItems: UpdateFeedItem[] =
    feedTab === 'Latest' ? latestUpdateItems
    : feedTab === 'News' ? newsUpdateItems
    : feedTab === 'Press Release' ? prUpdateItems
    : eventUpdateItems;

  // Ref for indexes track scroll
  const indexesTrackRef = useRef<HTMLDivElement>(null);
  function handleIndexScrollLeft() {
    indexesTrackRef.current?.scrollBy({ left: -220, behavior: 'smooth' });
  }
  function handleIndexScrollRight() {
    indexesTrackRef.current?.scrollBy({ left: 220, behavior: 'smooth' });
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad wl-page">
            {/* ── Stock Indexes Bar ─────────────────────────────────── */}
            <section className="wl-indexes-section">
              <div className="wl-indexes-label">Stock Indexes</div>
              <div className="wl-indexes-scroll">
                <button className="wl-arrow-btn" aria-label="Scroll left" onClick={handleIndexScrollLeft}>
                  <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                    <path
                      d="M9 2.5L4.5 7L9 11.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="wl-indexes-track" ref={indexesTrackRef}>
                  {stockIndexes.map((idx) => {
                    const pos = idx.change >= 0;
                    return (
                      <div className="wl-index-card" key={idx.name}>
                        <div className="wl-index-name">{idx.name}</div>
                        <div className="wl-index-value">{idx.value.toLocaleString()}</div>
                        <div className={`wl-index-change ${pos ? 'pos' : 'neg'}`}>
                          {pos ? '+' : ''}
                          {idx.change.toFixed(2)}&nbsp;
                          <span>
                            ({pos ? '+' : ''}
                            {idx.changePct.toFixed(2)}%)
                          </span>
                        </div>
                        <div className="wl-index-spark">
                          <Sparkline points={idx.trend} positive={pos} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button className="wl-arrow-btn" aria-label="Scroll right" onClick={handleIndexScrollRight}>
                  <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
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
            </section>

            {/* ── Portfolio Header ──────────────────────────────────── */}
            <section className="wl-portfolio-section">
              <div className="wl-portfolio-left">
                {/* Title row with dropdown */}
                <div className="wl-portfolio-title-row" ref={titleDropdownRef}>
                  {/* Star / favorite button */}
                  <button
                    className={`wl-star-btn${favorites.has(watchlistId) ? ' starred' : ''}`}
                    onClick={() => toggleFavorite(watchlistId)}
                    aria-label={favorites.has(watchlistId) ? 'Remove from favorites' : 'Add to favorites'}
                    title={favorites.has(watchlistId) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg viewBox="0 0 14 14" width="15" height="15" fill="none" aria-hidden="true">
                      {favorites.has(watchlistId) ? (
                        <path
                          d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
                          fill="#f59e0b"
                          stroke="#f59e0b"
                          strokeWidth="1.1"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path
                          d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </button>
                  <span className="wl-portfolio-title">{watchlistName}</span>
                  <button
                    className={`wl-portfolio-chevron-btn${showTitleDropdown ? ' open' : ''}`}
                    aria-label="切換觀察清單"
                    onClick={() => setShowTitleDropdown((v) => !v)}
                  >
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14" className="wl-portfolio-chevron">
                      <path
                        d="M3 5L7 9L11 5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Watchlist switcher dropdown */}
                  {showTitleDropdown && (
                    <div className="wl-title-dropdown">
                      {allWatchlistItems.map((item) => {
                        const displayLabel = item.watchlistId
                          ? (watchlistNames[item.watchlistId] ?? item.label)
                          : item.label;
                        return (
                          <div key={item.watchlistId ?? item.label}>
                            <Link
                              href={item.href}
                              className={`wl-title-dropdown-item${item.watchlistId === watchlistId ? ' active' : ''}`}
                              onClick={() => setShowTitleDropdown(false)}
                            >
                              <span className="wl-title-dropdown-label">{displayLabel}</span>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Summary row — disabled (not in current development stage) */}
                {/* <div className="wl-portfolio-summary">
                  ...
                </div> */}
              </div>

              {/* Action buttons */}
              <div className="wl-action-btns">
                <button className="wl-action-btn" onClick={() => setShowAddSymbol(true)}>
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M7 2V12M2 7H12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="wl-action-btn-label">Add Company</span>
                </button>
                <button className="wl-action-btn" onClick={handleEditWatchlistClick}>
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M9 2.5L11.5 5L5 11.5H2.5V9L9 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="wl-action-btn-label">Edit Watchlist</span>
                </button>
                {/* Manage Alerts button — disabled (not in current development stage) */}
                {/* <button className="wl-action-btn" onClick={() => setShowManageAlerts(true)}>
                  ...
                </button> */}

                <button className="wl-action-btn" onClick={() => setSplitLayout((v) => !v)}>
                  {/* Layout icon — two-column grid */}
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <rect x="1.5" y="1.5" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="8" y="1.5" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  <span className="wl-action-btn-label">Layout</span>
                </button>
              </div>
            </section>

            {/* ── Sub-tabs ───────────────────────────────────────────── */}
            <div className="wl-subtabs">
              {viewOrder
                .filter((id) => !hiddenViews.has(id))
                .map((id) => {
                  const label = BUILTIN_VIEWS.includes(id as typeof BUILTIN_VIEWS[number])
                    ? id
                    : (customViews.find((v) => v.id === id)?.name ?? id);
                  return (
                    <button
                      key={id}
                      className={`wl-subtab${activeTab === id ? ' active' : ''}`}
                      onClick={() => setActiveTab(id)}
                    >
                      {label}
                    </button>
                  );
                })}
              <button className="wl-subtab wl-subtab--add" onClick={() => setShowManageView(true)}>
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                  <path d="M7 2V12M2 7H12" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add/Edit View
              </button>

              {/* Quarter nav — right-aligned inside tab bar */}
              <div className="wl-quarter-nav">
                <button
                  className="wl-quarter-btn"
                  aria-label="Previous quarter"
                  disabled={quarter.year === 2025 && quarter.q === 4}
                  onClick={() => setQuarter(prevQ)}
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
                <span className="wl-quarter-label">
                  {quarter.year} {QUARTERS[quarter.q - 1]}
                </span>
                <button
                  className="wl-quarter-btn"
                  aria-label="Next quarter"
                  disabled={quarter.year === 2026 && quarter.q === 1}
                  onClick={() => setQuarter(nextQ)}
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
            </div>

            {/* ── Holdings Table + Feed (layout-aware wrapper) ──────── */}
            {activeTab === 'Summary' ? (
              <div className={`wl-content-area${splitLayout ? ' wl-content-area--split' : ''}`}>
                {/* ── Holdings Table ─────────────────────────────────────── */}
                <div className="wl-table-wrap">
                <table className="wl-table">
                  <thead className="wl-thead--white">
                    <tr>
                      <th className="wl-th wl-th--sticky">
                        Company
                        <svg viewBox="0 0 14 14" fill="none" width="10" height="10" style={{ marginLeft: 4 }}>
                          <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </th>
                      <th className="wl-th">Price</th>
                      <th className="wl-th">Change</th>
                      <th className="wl-th">Change %</th>
                      <th className="wl-th">Shares</th>
                      <th className="wl-th">Cost</th>
                      <th className="wl-th">Today&apos;s Gain</th>
                      <th className="wl-th">Today&apos;s % Gain</th>
                      <th className="wl-th wl-th--sparkline">Sparkline Graphs (1Y)</th>
                      <th className="wl-th">Revenue</th>
                      <th className="wl-th">Revenue QoQ</th>
                      <th className="wl-th">Revenue YoY</th>
                      <th className="wl-th">Gross Margin</th>
                      <th className="wl-th">DOI</th>
                      <th className="wl-th">Next Earning Release</th>
                      <th className="wl-th">Last Qtr Revenue</th>
                      <th className="wl-th">Last Qtr Gross Margin</th>
                      <th className="wl-th">Last Qtr DOI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHoldings.map((h) => (
                      <tr key={h.symbol} className="wl-tr">
                        <td className="wl-td wl-td--sticky wl-symbol">
                          <Link href={`/company-profile/${h.symbol}/`} className="wl-symbol-link" target="_blank" rel="noopener noreferrer">{h.symbol}</Link>
                        </td>
                        <td className="wl-td">{h.price.toFixed(2)}</td>
                        <td className={`wl-td ${h.change >= 0 ? 'pos' : 'neg'}`}>
                          {h.change >= 0 ? '+' : ''}
                          {h.change.toFixed(2)}
                        </td>
                        <td className={`wl-td ${h.changePct >= 0 ? 'pos' : 'neg'}`}>
                          {h.changePct >= 0 ? '+' : ''}
                          {h.changePct.toFixed(2)}%
                        </td>
                        <td className="wl-td">{h.shares}</td>
                        <td className="wl-td">{h.cost.toFixed(2)}</td>
                        <td className={`wl-td ${h.todayGain >= 0 ? 'pos' : 'neg'}`}>
                          {h.todayGain >= 0 ? '+' : ''}
                          {h.todayGain.toFixed(2)}
                        </td>
                        <td className={`wl-td ${h.todayGainPct >= 0 ? 'pos' : 'neg'}`}>
                          {h.todayGainPct >= 0 ? '+' : ''}
                          {h.todayGainPct.toFixed(2)}%
                        </td>
                        <td className="wl-td wl-td--sparkline">
                          <Sparkline1Y symbol={h.symbol} />
                        </td>
                        <td className="wl-td">{h.revenue}</td>
                        <td className={`wl-td ${h.revenueQoQ.startsWith('+') ? 'pos' : 'neg'}`}>
                          {h.revenueQoQ}
                        </td>
                        <td className={`wl-td ${h.revenueYoY.startsWith('+') ? 'pos' : 'neg'}`}>
                          {h.revenueYoY}
                        </td>
                        <td className="wl-td">{h.grossMargin}</td>
                        <td className="wl-td">{h.doi}</td>
                        <td className="wl-td">{h.nextEarning}</td>
                        <td className="wl-td">{h.lastQtrRevenue}</td>
                        <td className="wl-td">{h.lastQtrGrossMargin}</td>
                        <td className="wl-td">{h.lastQtrDOI}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Content feed section ───────────────────────────────── */}
              <section className="wl-feed-section">
                {/* Updates title */}
                <div className="wl-feed-header">
                  <span className="wl-feed-header-title">Updates</span>
                </div>

                {/* Feed tabs */}
                <div className="wl-feed-tabs">
                  {(['Latest', 'News', 'Press Release', 'Event'] as const).map((t) => (
                    <button
                      key={t}
                      className={`wl-feed-tab${feedTab === t ? ' active' : ''}`}
                      onClick={() => setFeedTab(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {/* Feed list */}
                <div className="wl-feed-list">
                  {currentUpdateItems.length === 0 ? (
                    <div className="wl-feed-empty">No updates found for your watchlist companies.</div>
                  ) : (
                    currentUpdateItems.map((item, idx) => (
                      <div key={item.id} className={`wl-feed-item${idx < currentUpdateItems.length - 1 ? ' wl-feed-item--bordered' : ''}`}>
                        {item.kind === 'news' ? <AlphaAvatar /> : item.kind === 'press-release' ? (
                          <div className="wl-feed-avatar wl-feed-avatar--pr">
                            <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
                              <circle cx="14" cy="14" r="14" fill="#dbeafe" />
                              <rect x="8" y="8" width="12" height="12" rx="2" stroke="#2563eb" strokeWidth="1.4" fill="none" />
                              <path d="M10 12h8M10 15h6" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                          </div>
                        ) : (
                          <div className="wl-feed-avatar wl-feed-avatar--event">
                            <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
                              <circle cx="14" cy="14" r="14" fill="#fef3c7" />
                              <rect x="8" y="9" width="12" height="11" rx="1.5" stroke="#d97706" strokeWidth="1.4" fill="none" />
                              <path d="M11 9V7M17 9V7" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round" />
                              <path d="M8 12h12" stroke="#d97706" strokeWidth="1.2" />
                            </svg>
                          </div>
                        )}
                        <div className="wl-feed-body">
                          <div className="wl-feed-title">{item.title}</div>
                          {item.description && (
                            <div className="wl-feed-description">{item.description}</div>
                          )}
                          <div className="wl-feed-meta">
                            <span className="wl-feed-tickers">
                              {item.displaySymbols.map((sym, i) => (
                                <span key={sym}>
                                  {i > 0 && ', '}
                                  <a
                                    href={`/lego/company-profile/${sym}/`}
                                    className="wl-feed-ticker"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {sym}
                                  </a>
                                </span>
                              ))}
                            </span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-source">{item.source}</span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-time">{item.dateLabel}</span>
                            {item.kind !== 'event' && (
                              <>
                                <span className="wl-feed-dot">•</span>
                                <span className={`wl-feed-kind-badge wl-feed-kind-badge--${item.kind}`}>
                                  {item.kind === 'news' ? 'News' : 'Press Release'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
              </div>
            ) : customViews.some((v) => v.id === activeTab) ? (
              /* ── Custom View Table ─────────────────────────────────── */
              (() => {
                const cv = customViews.find((v) => v.id === activeTab);
                if (!cv) return null;
                const cols = cv.columns.filter((c) => ALL_COLUMNS[c]);
                return (
                  <div className="wl-table-wrap">
                    <table className="wl-table">
                      <thead className="wl-thead--white">
                        <tr>
                          <th className="wl-th wl-th--sticky">
                            Company
                            <svg viewBox="0 0 14 14" fill="none" width="10" height="10" style={{ marginLeft: 4 }}>
                              <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </th>
                          {cols.map((c) => (
                            <th key={c} className="wl-th">{ALL_COLUMNS[c].label}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedHoldings.map((h) => (
                          <tr key={h.symbol} className="wl-tr">
                            <td className="wl-td wl-td--sticky wl-symbol">
                              <Link href={`/company-profile/${h.symbol}/`} className="wl-symbol-link" target="_blank" rel="noopener noreferrer">{h.symbol}</Link>
                            </td>
                            {cols.map((c) => {
                              const def = ALL_COLUMNS[c];
                              const cls = def.getClass ? def.getClass(h) : '';
                              return (
                                <td key={c} className={`wl-td${cls ? ` ${cls}` : ''}`}>
                                  {def.getValue(h)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            ) : activeTab === 'Holdings' ? (
              /* ── Holdings tab: portfolio performance view ─────────── */
              <>
                {/* KPI summary bar */}
                <div className="wl-holdings-kpis">
                  <div className="wl-holdings-kpi">
                    <span className="wl-holdings-kpi-label">Market Value</span>
                    <span className="wl-holdings-kpi-value">
                      ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="wl-holdings-kpi">
                    <span className="wl-holdings-kpi-label">Cost Basis</span>
                    <span className="wl-holdings-kpi-value">
                      ${totalCostBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="wl-holdings-kpi">
                    <span className="wl-holdings-kpi-label">Unrealized P&amp;L</span>
                    <span className={`wl-holdings-kpi-value ${totalUnrealizedGain >= 0 ? 'pos' : 'neg'}`}>
                      {totalUnrealizedGain >= 0 ? '+' : ''}
                      {totalUnrealizedGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="wl-holdings-kpi-pct">
                        &nbsp;({totalUnrealizedPct >= 0 ? '+' : ''}
                        {totalUnrealizedPct.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                  <div className="wl-holdings-kpi">
                    <span className="wl-holdings-kpi-label">Today&apos;s P&amp;L</span>
                    <span className={`wl-holdings-kpi-value ${totalGain >= 0 ? 'pos' : 'neg'}`}>
                      {totalGain >= 0 ? '+' : ''}
                      {totalGain.toFixed(2)}
                      <span className="wl-holdings-kpi-pct">
                        &nbsp;({totalGainPct >= 0 ? '+' : ''}
                        {totalGainPct.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                  <div className="wl-holdings-kpi">
                    <span className="wl-holdings-kpi-label">Positions</span>
                    <span className="wl-holdings-kpi-value">{sortedHoldings.length}</span>
                  </div>
                </div>

                {/* Holdings performance table */}
                <div className="wl-table-wrap">
                  <table className="wl-table wl-holdings-table">
                    <thead className="wl-thead--white">
                      <tr>
                        <th className="wl-th wl-th--sticky">Company</th>
                        <th className="wl-th wl-th--name">Company</th>
                        <th className="wl-th">Shares</th>
                        <th className="wl-th">Avg Cost</th>
                        <th className="wl-th">Price</th>
                        <th className="wl-th">Change</th>
                        <th className="wl-th">Change %</th>
                        <th className="wl-th">Market Value</th>
                        <th className="wl-th">Cost Basis</th>
                        <th className="wl-th">Unrealized P&amp;L</th>
                        <th className="wl-th">Unrealized %</th>
                        <th className="wl-th">Today&apos;s P&amp;L</th>
                        <th className="wl-th">Today&apos;s %</th>
                        <th className="wl-th">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedHoldings.map((h) => {
                        const marketValue = h.price * h.shares;
                        const costBasis = h.cost * h.shares;
                        const unrealizedGain = marketValue - costBasis;
                        const unrealizedPct = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;
                        const weight = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
                        const companyName = companyNameMap.get(h.symbol) ?? h.symbol;
                        return (
                          <tr key={h.symbol} className="wl-tr">
                            <td className="wl-td wl-td--sticky wl-symbol">
                              <Link href={`/company-profile/${h.symbol}/`} className="wl-symbol-link" target="_blank" rel="noopener noreferrer">{h.symbol}</Link>
                            </td>
                            <td className="wl-td wl-company-name">
                              <Link href={`/company-profile/${h.symbol}/`} className="wl-company-link" target="_blank" rel="noopener noreferrer">{companyName}</Link>
                            </td>
                            <td className="wl-td">{h.shares.toLocaleString()}</td>
                            <td className="wl-td">{h.cost.toFixed(2)}</td>
                            <td className="wl-td">{h.price.toFixed(2)}</td>
                            <td className={`wl-td ${h.change >= 0 ? 'pos' : 'neg'}`}>
                              {h.change >= 0 ? '+' : ''}
                              {h.change.toFixed(2)}
                            </td>
                            <td className={`wl-td ${h.changePct >= 0 ? 'pos' : 'neg'}`}>
                              {h.changePct >= 0 ? '+' : ''}
                              {h.changePct.toFixed(2)}%
                            </td>
                            <td className="wl-td">
                              {marketValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="wl-td">
                              {costBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={`wl-td ${unrealizedGain >= 0 ? 'pos' : 'neg'}`}>
                              {unrealizedGain >= 0 ? '+' : ''}
                              {unrealizedGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className={`wl-td ${unrealizedPct >= 0 ? 'pos' : 'neg'}`}>
                              {unrealizedPct >= 0 ? '+' : ''}
                              {unrealizedPct.toFixed(2)}%
                            </td>
                            <td className={`wl-td ${h.todayGain >= 0 ? 'pos' : 'neg'}`}>
                              {h.todayGain >= 0 ? '+' : ''}
                              {h.todayGain.toFixed(2)}
                            </td>
                            <td className={`wl-td ${h.todayGainPct >= 0 ? 'pos' : 'neg'}`}>
                              {h.todayGainPct >= 0 ? '+' : ''}
                              {h.todayGainPct.toFixed(2)}%
                            </td>
                            <td className="wl-td">{weight.toFixed(2)}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : activeTab === 'Health Score' ? (
              <HealthScoreComingSoon />
            ) : activeTab === 'Ratings' ? (
              <RatingsComingSoon />
            ) : null}

          </div>
        </main>
      </div>

      {/* ── Manage Alerts Modal ───────────────────────────────────────────── */}
      {showManageAlerts && (
        <div className="wl-modal-overlay" onClick={() => setShowManageAlerts(false)}>
          <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal-header">
              <span className="wl-modal-title">Manage Alerts</span>
              <div className="wl-modal-header-actions">
                <button className="wl-modal-cancel-btn" onClick={() => setShowManageAlerts(false)}>
                  Close
                </button>
              </div>
            </div>
            <div className="wl-modal-body">
              <div className="wl-toggle-row">
                <div className="wl-toggle-info">
                  <span className="wl-toggle-name">News Alert</span>
                  <span className="wl-toggle-desc">Breaking News in real time</span>
                </div>
                <label className="wl-toggle-switch">
                  <input
                    type="checkbox"
                    checked={newsAlert}
                    onChange={(e) => setNewsAlert(e.target.checked)}
                  />
                  <span className="wl-toggle-track" />
                </label>
              </div>
              <div className="wl-toggle-row">
                <div className="wl-toggle-info">
                  <span className="wl-toggle-name">Transcript Alert</span>
                </div>
                <label className="wl-toggle-switch">
                  <input
                    type="checkbox"
                    checked={transcriptAlert}
                    onChange={(e) => setTranscriptAlert(e.target.checked)}
                  />
                  <span className="wl-toggle-track" />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Watchlist Modal ──────────────────────────────────────────── */}
      {showEditWatchlist && (
        <div className="wl-modal-overlay" onClick={() => setShowEditWatchlist(false)}>
          <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal-header">
              <span className="wl-modal-title">Edit Watchlist</span>
              <div className="wl-modal-header-actions">
                <button
                  className="wl-modal-done-btn"
                  onClick={handleEditWatchlistDone}
                >
                  Done
                </button>
              </div>
            </div>
            <div className="wl-modal-body wl-modal-body--scroll">
              <div className="wl-modal-field">
                <label className="wl-modal-field-label">Watchlist Name:</label>
                <input
                  className="wl-modal-input"
                  type="text"
                  value={editWatchlistName}
                  onChange={(e) => setEditWatchlistName(e.target.value)}
                />
              </div>
              <div>
                <div className="wl-modal-section-title">Symbol Order</div>
                <div className="wl-drag-list">
                  {editSymbolOrder.map((sym, idx) => (
                    <div
                      key={sym}
                      className="wl-drag-item"
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <svg className="wl-drag-handle" viewBox="0 0 14 14" fill="none" width="14" height="14">
                        <path d="M3 4h8M3 7h8M3 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                      <span className="wl-drag-symbol">{sym}</span>
                      <span className="wl-drag-rank">#{idx + 1}</span>
                      <button
                        className="wl-drag-delete"
                        aria-label={`Delete ${sym}`}
                        onClick={() => handleDeleteSymbol(sym)}
                        title={`Remove ${sym}`}
                      >
                        {/* Trash / delete icon */}
                        <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
                          <path d="M2.5 4h9M5.5 4V2.5h3V4M5.5 6.5v4M8.5 6.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delete Watchlist button */}
              <button className="wl-modal-delete-wl-btn" onClick={handleDeleteWatchlist}>
                Delete Watchlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Symbol Modal ──────────────────────────────────────────────── */}
      {showAddSymbol && (
        <div className="wl-modal-overlay" onClick={() => setShowAddSymbol(false)}>
          <div className="wl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal-header">
              <span className="wl-modal-title">Add Companies to Follow</span>
              <div className="wl-modal-header-actions">
                <button className="wl-modal-cancel-btn" onClick={handleAddSymbolClose}>
                  Cancel
                </button>
              </div>
            </div>
            <div className="wl-modal-body">
              <div className="wl-add-search-wrap">
                <svg className="wl-add-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  className="wl-add-search-input"
                  type="text"
                  placeholder="Add Companies (e.g AAPL, TSLA, etc...)"
                  value={addSymbolQuery}
                  onChange={(e) => setAddSymbolQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymbolSubmit()}
                  autoFocus
                />
              </div>
              <div className="wl-add-hint">
                Enter Companies separated by commas to add to your Watchlist.
              </div>
              {addSuggestions.length > 0 && (
                <div className="wl-add-suggestions">
                  {addSuggestions.map((c) => (
                    <button
                      key={c.symbol}
                      className="wl-add-suggestion-item"
                      onClick={() => setAddSymbolQuery((q) => {
                        const parts = q.split(',').map((s) => s.trim()).filter(Boolean);
                        parts[parts.length - 1] = c.symbol;
                        return parts.join(', ') + ', ';
                      })}
                    >
                      <span className="wl-add-suggestion-symbol">{c.symbol}</span>
                      <span className="wl-add-suggestion-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <button
                className="wl-modal-submit-btn"
                onClick={handleAddSymbolSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Manage View Modal ────────────────────────────────────────────── */}
      {showManageView && (
        <ManageViewModal
          customViews={customViews}
          viewOrder={viewOrder}
          hiddenViews={hiddenViews}
          onSave={handleSaveCustomView}
          onDelete={handleDeleteCustomView}
          onToggleHide={handleToggleHideView}
          onReorderViews={setViewOrder}
          onClose={() => setShowManageView(false)}
        />
      )}
    </>
  );
}
