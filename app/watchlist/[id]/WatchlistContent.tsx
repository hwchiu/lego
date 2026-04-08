'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { SP500_COMPANIES } from '@/app/data/sp500';
import { stockIndexes } from '@/app/data/marketIndices';
import { holdingsData as holdingsDataMap, holdingsDataQ4_2025 } from '@/app/data/watchlistData';
import type { HoldingEntity } from '@/app/data/watchlistData';
import { mainNav } from '@/app/data/navigation';
import { useWatchlist } from '@/app/contexts/WatchlistContext';

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

const ALL_COLUMNS: Record<string, ColDef> = {
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

const VIEW_CATEGORIES: Record<string, string[]> = {
  Trading:      ['price', 'change', 'changePct', 'volume', 'avgVolume', '52wHigh', '52wLow', 'beta', 'marketCap'],
  Earnings:     ['nextEarning', 'revenueQoQ', 'revenueYoY', 'lastQtrRevenue', 'epsGrowthYoY'],
  Valuation:    ['peRatio', 'forwardPE', 'psRatio', 'pbRatio', 'evEbitda', 'dividendYield', 'marketCap'],
  Growth:       ['revenueYoY', 'revenueQoQ', 'epsGrowthYoY', 'revCagr3y'],
  Performance:  ['todayGain', 'todayGainPct', 'return1m', 'return3m', 'return1y', 'returnYtd'],
  Benchmarks:   ['vsSP500', 'vsNasdaq', 'vsSector', 'beta'],
  Profitability:['grossMargin', 'operatingMargin', 'netMargin', 'roe', 'roic', 'lastQtrGrossMargin'],
  Ownership:    ['shares', 'cost', 'revenue', 'marketValue', 'unrealizedPL', 'unrealizedPct'],
  Debt:         ['debtEquity', 'currentRatio', 'netDebt', 'doi', 'lastQtrDOI'],
};

const BUILTIN_VIEWS = ['Summary', 'Holdings', 'Health Score', 'Ratings'] as const;

// All data (indices, holdings, portfolio config) comes from content/*.md files.
// The fetch script writes to MD; app/data/*.ts readers parse via extractJson().

type Holding = HoldingEntity;

const holdingsDataQ1: Holding[] = Object.values(holdingsDataMap);
const holdingsDataQ4: Holding[] = Object.values(holdingsDataQ4_2025);

// ── News feed items ───────────────────────────────────────────────────────────
// Category tags sourced from content/watchlist-articles.md
type FeedTag = 'Analysis' | 'News' | 'Warnings' | 'Transcripts' | 'Press Release';

interface FeedItem {
  id: number;
  avatar: 'alpha' | 'user';
  title: string;
  tickers: string[];
  source: string;
  time: string;
  comments?: number;
  tags: FeedTag[];
}

const allFeedItems: FeedItem[] = [
  // ── Existing articles (IDs 1–6) ──
  {
    id: 1,
    avatar: 'alpha',
    title: 'Anthropic says no sensitive data exposed in leak of code behind Claude AI agent',
    tickers: ['GOOGL'],
    source: 'SA News',
    time: 'Today, 10:18 AM',
    comments: 11,
    tags: ['News'],
  },
  {
    id: 2,
    avatar: 'user',
    title: "A Major Market Rotation Is Likely Coming: Here's Where I'm Loading Up",
    tickers: ['AMZN', 'META'],
    source: 'Samuel Smith',
    time: 'Today, 10:17 AM',
    tags: ['Analysis'],
  },
  {
    id: 3,
    avatar: 'alpha',
    title: 'Most and least shorted large-cap tech stocks as of March',
    tickers: ['AAPL', 'NVDA'],
    source: 'SA News',
    time: 'Today, 10:05 AM',
    tags: ['Analysis'],
  },
  {
    id: 4,
    avatar: 'alpha',
    title: 'AI, chip stocks tumble as Trump plans to strike Iran hard',
    tickers: ['AMD', 'INTC'],
    source: 'SA News',
    time: 'Today, 10:05 AM',
    comments: 16,
    tags: ['News', 'Warnings'],
  },
  {
    id: 5,
    avatar: 'alpha',
    title: 'Biggest stock movers Thursday: Oil and gas stocks, TSLA, and more',
    tickers: ['AMD', 'NVDA'],
    source: 'SA News',
    time: 'Today, 9:52 AM',
    tags: ['News'],
  },
  {
    id: 6,
    avatar: 'alpha',
    title: "ETFs tied to Tesla slide as the EV maker's delivery miss pressures stock",
    tickers: ['TSLA'],
    source: 'SA News',
    time: 'Today, 9:29 AM',
    comments: 2,
    tags: ['News', 'Analysis'],
  },
  // ── Crawled articles – TC, TSLA, NVDA, QCOM (IDs 7–16) ──
  {
    id: 7,
    avatar: 'alpha',
    title: 'T Company Q3 2025 Outperformance: 39% Profit Growth Driven by AI Chip Demand',
    tickers: ['TC'],
    source: 'Seeking Alpha',
    time: 'Yesterday, 8:00 AM',
    tags: ['Analysis'],
  },
  {
    id: 8,
    avatar: 'alpha',
    title: 'T Company Raises 2025 Capex to $40B to Accelerate 3nm and 5nm Expansion',
    tickers: ['TC'],
    source: 'Investors.com',
    time: 'Yesterday, 7:30 AM',
    tags: ['News', 'Press Release'],
  },
  {
    id: 9,
    avatar: 'alpha',
    title: 'NVDA vs. TC: Which Semiconductor Stock Is the Better AI Investment?',
    tickers: ['NVDA', 'TC'],
    source: 'Zacks',
    time: 'Yesterday, 6:15 AM',
    tags: ['Analysis'],
  },
  {
    id: 10,
    avatar: 'alpha',
    title: 'Nvidia Reports Potential $8B Revenue Hit from US-China Export Restrictions',
    tickers: ['NVDA'],
    source: 'Reuters',
    time: 'Apr 2, 5:00 PM',
    comments: 24,
    tags: ['News', 'Warnings'],
  },
  {
    id: 11,
    avatar: 'alpha',
    title: 'SA Analyst Upgrades: TSLA, AAPL, NVDA — Bullish Momentum Resumes',
    tickers: ['TSLA', 'NVDA'],
    source: 'Seeking Alpha',
    time: 'Apr 2, 3:45 PM',
    tags: ['Analysis'],
  },
  {
    id: 12,
    avatar: 'alpha',
    title: 'Tesla Q3 2025 Analyst Targets Range from $175 to $500 Amid EV Uncertainty',
    tickers: ['TSLA'],
    source: 'Bloomberg',
    time: 'Apr 2, 2:20 PM',
    comments: 18,
    tags: ['Analysis', 'Warnings'],
  },
  {
    id: 13,
    avatar: 'alpha',
    title: 'Tesla Model Q to Launch in H2 2025, Targeting Mass-Market EV Recovery',
    tickers: ['TSLA'],
    source: 'Bloomberg',
    time: 'Apr 2, 1:00 PM',
    tags: ['News'],
  },
  {
    id: 14,
    avatar: 'alpha',
    title: 'Qualcomm Q4 2025 Earnings Beat: $11.27B Revenue Up 10% YoY',
    tickers: ['QCOM'],
    source: 'CNBC',
    time: 'Apr 1, 5:30 PM',
    comments: 7,
    tags: ['News', 'Transcripts'],
  },
  {
    id: 15,
    avatar: 'alpha',
    title: 'Qualcomm AI Accelerator Chips to Enter Data Center Market in 2026',
    tickers: ['QCOM'],
    source: 'Zacks',
    time: 'Apr 1, 4:00 PM',
    tags: ['Analysis', 'Press Release'],
  },
  {
    id: 16,
    avatar: 'alpha',
    title: 'QCOM Expands Automotive AI Partnerships with Meta and Key OEMs',
    tickers: ['QCOM'],
    source: 'Financial Charts',
    time: 'Apr 1, 2:45 PM',
    tags: ['News', 'Analysis'],
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(VIEW_CATEGORIES)[0]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  // Edit Views drag state
  const editDragItem = useRef<number | null>(null);
  const editDragOver = useRef<number | null>(null);

  const availableColumns = VIEW_CATEGORIES[selectedCategory] ?? [];

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
                    {Object.keys(VIEW_CATEGORIES).map((cat) => (
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
                      const def = ALL_COLUMNS[colId];
                      if (!def) return null;
                      const checked = selectedColumns.includes(colId);
                      return (
                        <label key={colId} className="wl-mv-col-item">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleColumn(colId)}
                          />
                          <span>{def.label}</span>
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
                        const def = ALL_COLUMNS[colId];
                        if (!def) return null;
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
                            <span className="wl-mv-sel-label">{def.label}</span>
                            <button
                              className="wl-drag-delete"
                              aria-label={`Remove ${def.label}`}
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
type FeedTab = 'Latest' | 'Analysis' | 'News' | 'Warnings' | 'Transcripts' | 'Press Releases';

export default function WatchlistPage({ params }: { params: { id: string } }) {
  const watchlistId = params.id;
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
      if (storedViews) setCustomViews(JSON.parse(storedViews));
      const storedOrder = localStorage.getItem('wl-view-order');
      if (storedOrder) setViewOrder(JSON.parse(storedOrder));
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
  const companyNameMap = new Map(SP500_COMPANIES.map((c) => [c.symbol, c.name]));

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
  const addSuggestions =
    addSymbolQuery.trim().length > 0
      ? SP500_COMPANIES.filter(
          (c) =>
            c.symbol.toLowerCase().includes(addSymbolQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(addSymbolQuery.toLowerCase()),
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

  // Feed filtering logic
  const filteredFeedItems =
    feedTab === 'Latest'
      ? allFeedItems
      : allFeedItems.filter((item) => {
          const tabTag: FeedTag =
            feedTab === 'Press Releases' ? 'Press Release' : (feedTab as FeedTag);
          return item.tags.includes(tabTag);
        });

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
                <div className="wl-indexes-track">
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
                <div className="wl-indexes-arrows">
                  <button className="wl-arrow-btn" aria-label="Scroll left">
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
                  <button className="wl-arrow-btn" aria-label="Scroll right">
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

                {/* Summary row */}
                <div className="wl-portfolio-summary">
                  {/* Eye icon */}
                  <svg viewBox="0 0 14 14" fill="none" width="16" height="16" className="wl-eye-icon">
                    <path
                      d="M1.5 7C1.5 7 3.5 3 7 3C10.5 3 12.5 7 12.5 7C12.5 7 10.5 11 7 11C3.5 11 1.5 7 1.5 7Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <circle cx="7" cy="7" r="1.8" fill="currentColor" />
                  </svg>

                  <span className="wl-total-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>

                  <span className={`wl-daily-change ${totalGain >= 0 ? 'pos' : 'neg'}`}>
                    <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                      {totalGain >= 0 ? (
                        <path d="M7 2.5L11 7H3L7 2.5Z" fill="currentColor" />
                      ) : (
                        <path d="M7 11.5L3 7H11L7 11.5Z" fill="currentColor" />
                      )}
                    </svg>
                    {totalGain >= 0 ? '+' : ''}
                    {totalGain.toFixed(2)} ({totalGainPct >= 0 ? '+' : ''}
                    {totalGainPct.toFixed(2)}%)
                  </span>
                </div>
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
                  <span className="wl-action-btn-label">Add Symbol</span>
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
                <button className="wl-action-btn" onClick={() => setShowManageAlerts(true)}>
                  {/* Alarm / bell icon */}
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M7 1.5a4 4 0 0 1 4 4v2.5l1 1.5H2L3 8V5.5a4 4 0 0 1 4-4Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.5 11.5a1.5 1.5 0 0 0 3 0"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="wl-action-btn-label">Manage Alerts</span>
                </button>
                <button
                  className="wl-action-btn"
                  onClick={() => downloadHoldingsExcel(watchlistName, sortedHoldings)}
                >
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M7 1v8M4.5 6.5L7 9l2.5-2.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 10.5c0 .5.5 1 1 1h8c.5 0 1-.5 1-1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="wl-action-btn-label">Download</span>
                </button>
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
                        Symbol
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
                        <td className="wl-td wl-td--sticky wl-symbol">{h.symbol}</td>
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
                  {(['Latest', 'Analysis', 'News', 'Warnings', 'Transcripts', 'Press Releases'] as const).map((t) => (
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
                  {filteredFeedItems.length === 0 ? (
                    <div className="wl-feed-empty">No articles in this category.</div>
                  ) : (
                    filteredFeedItems.map((item, idx) => (
                      <div key={item.id} className={`wl-feed-item${idx < filteredFeedItems.length - 1 ? ' wl-feed-item--bordered' : ''}`}>
                        {item.avatar === 'alpha' ? <AlphaAvatar /> : <UserAvatar />}
                        <div className="wl-feed-body">
                          <div className="wl-feed-title">{item.title}</div>
                          <div className="wl-feed-meta">
                            <span className="wl-feed-tickers">
                              {item.tickers.map((t, i) => (
                                <span key={t}>
                                  {i > 0 && ', '}
                                  <a href="#" className="wl-feed-ticker">
                                    {t}
                                  </a>
                                </span>
                              ))}
                            </span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-source">{item.source}</span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-time">{item.time}</span>
                            {item.comments !== undefined && (
                              <>
                                <span className="wl-feed-dot">•</span>
                                <span className="wl-feed-comments">
                                  <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                                    <path
                                      d="M1.5 2h11A.5.5 0 0 1 13 2.5v7a.5.5 0 0 1-.5.5H4L1.5 12.5V2.5A.5.5 0 0 1 2 2h-.5z"
                                      stroke="currentColor"
                                      strokeWidth="1.2"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                  {item.comments} Comments
                                </span>
                              </>
                            )}
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-save">
                              <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                                <path
                                  d="M3 1.5h8v11L7 10 3 12.5V1.5Z"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              Save
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
              </div>
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
                        <th className="wl-th wl-th--sticky">Symbol</th>
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
                            <td className="wl-td wl-td--sticky wl-symbol">{h.symbol}</td>
                            <td className="wl-td wl-company-name">{companyName}</td>
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
                            Symbol
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
                            <td className="wl-td wl-td--sticky wl-symbol">{h.symbol}</td>
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
              <span className="wl-modal-title">Add Symbols to Follow</span>
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
                  placeholder="Add Symbols (e.g AAPL, TSLA, etc...)"
                  value={addSymbolQuery}
                  onChange={(e) => setAddSymbolQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymbolSubmit()}
                  autoFocus
                />
              </div>
              <div className="wl-add-hint">
                Enter symbols separated by commas to add to your portfolio.
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
