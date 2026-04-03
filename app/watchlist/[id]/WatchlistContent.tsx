'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { SP500_COMPANIES } from '@/app/data/sp500';
import { stockIndexes } from '@/app/data/generated/indexData';
import { holdingsMarketData } from '@/app/data/generated/holdingsMarketData';
import type { HoldingMarketData } from '@/app/data/generated/holdingsMarketData';
import { mainNav } from '@/app/data/navigation';
import { useWatchlist } from '@/app/contexts/WatchlistContext';

// Stock index data is now imported from app/data/generated/indexData.ts

// ── Holdings data ─────────────────────────────────────────────────────────────
// Portfolio config (shares and cost are user-specific, not fetched)
interface PortfolioEntry {
  symbol: string;
  shares: number;
  cost: number;
}

interface Holding extends HoldingMarketData {
  symbol: string;
  shares: number;
  cost: number;
  todayGain: number;
  todayGainPct: number;
}

const portfolioConfig: PortfolioEntry[] = [
  { symbol: 'TSM', shares: 120, cost: 105.3 },
  { symbol: 'TSLA', shares: 50, cost: 196.4 },
  { symbol: 'QCOM', shares: 80, cost: 128.9 },
  { symbol: 'GOOGL', shares: 60, cost: 138.5 },
  { symbol: 'SONY', shares: 200, cost: 18.7 },
  { symbol: 'AAPL', shares: 45, cost: 167.8 },
  { symbol: 'NVDA', shares: 30, cost: 512.6 },
  { symbol: 'ASML', shares: 20, cost: 598.0 },
];

// Merge portfolio config with fetched market data
const holdingsData: Holding[] = portfolioConfig.map((p) => {
  const mkt = holdingsMarketData[p.symbol] || {
    price: 0, change: 0, changePct: 0,
    revenue: 'N/A', revenueQoQ: 'N/A', revenueYoY: 'N/A',
    grossMargin: 'N/A', doi: 'N/A', nextEarning: 'N/A',
    lastQtrRevenue: 'N/A', lastQtrGrossMargin: 'N/A', lastQtrDOI: 'N/A',
  };
  const todayGain = +(mkt.change * p.shares).toFixed(1);
  return {
    symbol: p.symbol,
    shares: p.shares,
    cost: p.cost,
    ...mkt,
    todayGain,
    todayGainPct: mkt.changePct,
  };
});

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
  // ── Crawled articles – TSM, TSLA, NVDA, QCOM (IDs 7–16) ──
  {
    id: 7,
    avatar: 'alpha',
    title: 'TSMC Q3 2025 Outperformance: 39% Profit Growth Driven by AI Chip Demand',
    tickers: ['TSM'],
    source: 'Seeking Alpha',
    time: 'Yesterday, 8:00 AM',
    tags: ['Analysis'],
  },
  {
    id: 8,
    avatar: 'alpha',
    title: 'TSMC Raises 2025 Capex to $40B to Accelerate 3nm and 5nm Expansion',
    tickers: ['TSM'],
    source: 'Investors.com',
    time: 'Yesterday, 7:30 AM',
    tags: ['News', 'Press Release'],
  },
  {
    id: 9,
    avatar: 'alpha',
    title: 'NVDA vs. TSM: Which Semiconductor Stock Is the Better AI Investment?',
    tickers: ['NVDA', 'TSM'],
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

// ── Main page ─────────────────────────────────────────────────────────────────
type FeedTab = 'Latest' | 'Analysis' | 'News' | 'Warnings' | 'Transcripts' | 'Press Releases';

export default function WatchlistPage({ params }: { params: { id: string } }) {
  const watchlistId = params.id;
  const { watchlistNames, setWatchlistName, symbolOrders, setSymbolOrder } = useWatchlist();

  const watchlistName = watchlistNames[watchlistId] ?? 'Watchlist';
  const currentSymbolOrder = symbolOrders[watchlistId] ?? holdingsData.map((h) => h.symbol);

  const [activeTab, setActiveTab] = useState<'Summary' | 'Health Score' | 'Ratings' | 'Holdings'>(
    'Summary',
  );
  const [feedTab, setFeedTab] = useState<FeedTab>('Latest');
  const [quarter, setQuarter] = useState({ year: 2026, q: 1 });
  const [splitLayout, setSplitLayout] = useState(false);

  // Modal states
  const [showManageAlerts, setShowManageAlerts] = useState(false);
  const [showEditWatchlist, setShowEditWatchlist] = useState(false);
  const [showAddSymbol, setShowAddSymbol] = useState(false);

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

  const prevQ = quarterOffset(quarter, -1);
  const nextQ = quarterOffset(quarter, 1);

  // Watchlist sub-items from navigation data (shared with sidebar)
  const watchlistSubItems = mainNav.find((item) => item.icon === 'watchlist')?.subItems ?? [];

  // Sorted holdings based on symbolOrder (includes user-added extra holdings)
  const holdingsLookup = new Map(holdingsData.map((h) => [h.symbol, h]));
  const sortedHoldings = [...currentSymbolOrder]
    .map((sym) => holdingsLookup.get(sym) ?? extraHoldings[sym])
    .filter(Boolean) as Holding[];

  const totalValue = sortedHoldings.reduce((sum, h) => sum + h.price * h.shares, 0);
  const totalGain = sortedHoldings.reduce((sum, h) => sum + h.todayGain, 0);
  const totalGainPct = (totalGain / (totalValue - totalGain)) * 100;

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
                      {watchlistSubItems.map((item) => {
                        const displayLabel = item.watchlistId
                          ? (watchlistNames[item.watchlistId] ?? item.label)
                          : item.label;
                        return (
                          <div key={item.label}>
                            {item.dividerBefore && <div className="wl-title-dropdown-divider" />}
                            <Link
                              href={item.href}
                              className={`wl-title-dropdown-item${item.watchlistId === watchlistId ? ' active' : ''}`}
                              onClick={() => setShowTitleDropdown(false)}
                            >
                              <span className="wl-title-dropdown-label">{displayLabel}</span>
                              {item.iconRight === 'add' && (
                                <svg
                                  viewBox="0 0 14 14"
                                  fill="none"
                                  width="13"
                                  height="13"
                                  aria-hidden="true"
                                >
                                  <rect
                                    x="1"
                                    y="1"
                                    width="12"
                                    height="12"
                                    rx="2"
                                    fill="currentColor"
                                    fillOpacity="0.18"
                                  />
                                  <path
                                    d="M7 4V10M4 7H10"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                  />
                                </svg>
                              )}
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
                  Add Symbol
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
                  Edit Watchlist
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
                  Manage Alerts
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
                  Download
                </button>
                <button className="wl-action-btn" onClick={() => setSplitLayout((v) => !v)}>
                  {/* Layout icon — two-column grid */}
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <rect x="1.5" y="1.5" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="8" y="1.5" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  Layout
                </button>
              </div>
            </section>

            {/* ── Sub-tabs ───────────────────────────────────────────── */}
            <div className="wl-subtabs">
              {(['Summary', 'Health Score', 'Ratings', 'Holdings'] as const).map((t) => (
                <button
                  key={t}
                  className={`wl-subtab${activeTab === t ? ' active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
              <button className="wl-subtab wl-subtab--add">
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                  <path d="M7 2V12M2 7H12" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add View
              </button>

              {/* Quarter nav — right-aligned inside tab bar */}
              <div className="wl-quarter-nav">
                <button
                  className="wl-quarter-btn"
                  aria-label="Previous quarter"
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
            ) : (
              /* ── Placeholder for other tabs ───────────────────────── */
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
            )}

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
              <button className="wl-modal-delete-wl-btn">
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
    </>
  );
}
