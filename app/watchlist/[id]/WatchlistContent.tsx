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
import { useLanguage } from '@/app/contexts/LanguageContext';
import { CATALOG_VIEW_CATEGORIES, CATALOG_COLUMN_LABELS, CATALOG_COLUMN_ID_TO_STRING_ID } from '@/app/data/watchlistColumns';
import { newsItems } from '@/app/data/news';
import NewsCard from '@/app/components/news/NewsCard';
import { pressReleases } from '@/app/data/pressReleases';
import { CORP_EVENT_CATEGORY_MAP } from '@/app/data/corpEvents';
import type { CorpEvent } from '@/app/data/corpEvents';
import {
  buildRecentQuarters,
  getViewCatgNColInfo,
  getViewAllColumns,
  addCompanyToWatchlist,
  saveView as apiSaveView,
  createViewWithColumn,
  deleteView as apiDeleteView,
  updateWatchlistInfo,
  getFavoritesListByUserAcct,
  getAllCoFavoriteList,
  addCompanyToMyFavorite,
  editWatchlist,
  deleteWatchlistById,
  getWatchlistDetail,
  getWatchlistData,
  getUserAllWatchlists,
  updateSubscribeInfo,
  querySubInfoByWatchlistId,
  getSubItem,
  WATCHLIST_MAX_COMPANIES,
} from '@/app/lib/watchlistApi';
import type { GetWatchlistDataParams, WatchlistDataItem, UpdateSubscribeInfoPayload, SubEventItem } from '@/app/lib/watchlistApi';
import { setFavoritesInPersonality } from '@/app/lib/getFavoritesByUserAcct';
import { getPaginationRange } from '@/app/lib/paginationUtils';
import { formatPrice, formatSigned, formatSignedPct, formatNumber, inferColorClass, inferColorArgb } from '@/app/lib/formatters';

// ── Custom View types ─────────────────────────────────────────────────────────
interface CustomView {
  id: string;
  apiViewId?: number; // numeric viewId returned by createViewWithColumn()
  name: string;
  columns: number[]; // column_id values from getViewAllColumns()
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

// Module-level reverse map: string column id → numeric column_id
// Used when reordering columns in a custom view to convert back to number[].
const CATALOG_STRING_ID_TO_NUM: Record<string, number> = Object.fromEntries(
  Object.entries(CATALOG_COLUMN_ID_TO_STRING_ID).map(([k, v]) => [v, Number(k)]),
);

const ALL_COLUMNS: Record<string, ColDef> = {
  ...CATALOG_COL_STUBS,
  price:             { label: 'Price',              getValue: h => formatPrice(h.price) },
  change:            { label: 'Change',             getValue: h => formatSigned(h.change), getClass: h => h.change < 0 ? 'neg' : '' },
  changePct:         { label: 'Change %',           getValue: h => formatSignedPct(h.changePct), getClass: h => h.changePct < 0 ? 'neg' : '' },
  volume:            { label: 'Volume',             getValue: () => '-' },
  avgVolume:         { label: 'Avg Volume (30D)',   getValue: () => '-' },
  '52wHigh':         { label: '52W High',           getValue: () => '-' },
  '52wLow':          { label: '52W Low',            getValue: () => '-' },
  beta:              { label: 'Beta',               getValue: () => '-' },
  marketCap:         { label: 'Market Cap',         getValue: () => '-' },
  nextEarning:       { label: 'Next Earning Release', getValue: h => h.nextEarning },
  revenueQoQ:        { label: 'Revenue QoQ',        getValue: h => h.revenueQoQ, getClass: h => inferColorClass(h.revenueQoQ) },
  revenueYoY:        { label: 'Revenue YoY',        getValue: h => h.revenueYoY, getClass: h => inferColorClass(h.revenueYoY) },
  lastQtrRevenue:    { label: 'Last Qtr Revenue',   getValue: h => h.lastQtrRevenue },
  epsGrowthYoY:      { label: 'EPS Growth YoY',     getValue: () => '-' },
  peRatio:           { label: 'P/E Ratio',          getValue: () => '-' },
  forwardPE:         { label: 'Forward P/E',        getValue: () => '-' },
  psRatio:           { label: 'P/S Ratio',          getValue: () => '-' },
  pbRatio:           { label: 'P/B Ratio',          getValue: () => '-' },
  evEbitda:          { label: 'EV/EBITDA',          getValue: () => '-' },
  dividendYield:     { label: 'Dividend Yield',     getValue: () => '-' },
  revCagr3y:         { label: 'Revenue CAGR (3Y)',  getValue: () => '-' },
  todayGain:         { label: "Today's Gain",       getValue: h => formatSigned(h.todayGain), getClass: h => h.todayGain < 0 ? 'neg' : '' },
  todayGainPct:      { label: "Today's % Gain",     getValue: h => formatSignedPct(h.todayGainPct), getClass: h => h.todayGainPct < 0 ? 'neg' : '' },
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
  cost:              { label: 'Cost',               getValue: h => formatPrice(h.cost) },
  revenue:           { label: 'Revenue',            getValue: h => h.revenue },
  marketValue:       { label: 'Market Value',       getValue: h => formatNumber(h.price * h.shares, 2) },
  unrealizedPL:      { label: 'Unrealized P&L',     getValue: h => { const v = (h.price - h.cost) * h.shares; return formatSigned(v); }, getClass: h => (h.price - h.cost) < 0 ? 'neg' : '' },
  unrealizedPct:     { label: 'Unrealized %',       getValue: h => { const pct = ((h.price - h.cost) / h.cost) * 100; return formatSignedPct(pct); }, getClass: h => h.price < h.cost ? 'neg' : '' },
  debtEquity:        { label: 'Debt/Equity',        getValue: () => '-' },
  currentRatio:      { label: 'Current Ratio',      getValue: () => '-' },
  netDebt:           { label: 'Net Debt',           getValue: () => '-' },
  doi:               { label: 'DOI',                getValue: h => h.doi },
  lastQtrDOI:        { label: 'Last Qtr DOI',       getValue: h => h.lastQtrDOI },
};

const BUILTIN_VIEWS = ['Summary'] as const;

// Fixed selectedCategories IDs for the Summary view (API standard)
const SUMMARY_FIXED_CATEGORIES = [58, 59, 60, 63, 29, 90, 87, 88, 89] as const;

// Maps Summary string column ID → numeric category ID for columns whose value comes from fld_val
const SUMMARY_COL_CATEGORY_ID: Record<string, number> = {
  revenue: 58,
  lastQtrRevenue: 87,
};

// localStorage key prefix for cached getWatchlistDetail responses
const WL_DETAIL_LS_KEY = (id: number) => `wl-detail-${id}`;

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

// ── News Avatar ───────────────────────────────────────────────────────────────
function NewsAvatar() {
  return (
    <div className="wl-feed-avatar wl-feed-avatar--news">
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
        <circle cx="14" cy="14" r="14" fill="#dcfce7" />
        <rect x="8" y="8" width="12" height="12" rx="1.5" stroke="#16a34a" strokeWidth="1.4" fill="none" />
        <path d="M10 11h8" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 14h8M10 16.5h5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" />
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
    revenue: revenueB.toFixed(2),
    revenueQoQ: `${qoqSign}${((seed % 15) + 1).toFixed(1)}%`,
    revenueYoY: `${yoySign}${((seed % 30) + 1).toFixed(1)}%`,
    grossMargin: `${grossMarginPct}%`,
    doi: `${doiDays}`,
    nextEarning: 'TBD',
    lastQtrRevenue: (revenueB * 1.05).toFixed(2),
    lastQtrGrossMargin: `${grossMarginPct + 1}%`,
    lastQtrDOI: `${doiDays - 5}`,
  };
}

// ── Excel download ────────────────────────────────────────────────────────────

const HEADERS = [
  'Symbol',
  'Revenue', 'Revenue QoQ', 'Revenue YoY',
  'Gross Margin', 'DOI', 'Next Earning Release',
  'Last Qtr Revenue', 'Last Qtr Gross Margin', 'Last Qtr DOI',
];

// Determine the text color ARGB for a cell value based on its content/type.
// No column-name hard-coding: color is inferred from the actual value.
function getCellColor(h: Holding, col: string): string | null {
  return inferColorArgb(getCellValue(h, col));
}

function getCellValue(h: Holding, col: string): string | number {
  switch (col) {
    case 'Symbol': return h.symbol;
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
  const ws = wb.addWorksheet('Watchlist Summary');

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

// ── Subscribe Modal ───────────────────────────────────────────────────────────

interface SubscribeModalProps {
  companies: string[];
  watchlistId: number;
  initialSubscriptions: UpdateSubscribeInfoPayload;
  availableEvents: SubEventItem[];
  onClose: () => void;
}

function SubscribeModal({ companies, watchlistId, initialSubscriptions, availableEvents, onClose }: SubscribeModalProps) {
  const { lang } = useLanguage();

  const labels = {
    title:           { zh: '訂閱通知',              en: 'Subscribe'                   },
    eventTab:        { zh: '事件',                   en: 'Event'                       },
    viewTab:         { zh: '檢視',                   en: 'View'                        },
    allCompanies:    { zh: '所有公司',               en: 'All Companies'               },
    companiesTitle:  { zh: '公司',                   en: 'Companies'                   },
    eventTypes:      { zh: '事件類型',               en: 'Event Types'                 },
    selectAll:       { zh: '全選',                   en: 'Select All'                  },
    applyToAll:      { zh: '套用至所有公司',         en: 'Apply to All Companies'      },
    save:            { zh: '儲存',                   en: 'Save'                        },
    saving:          { zh: '儲存中...',              en: 'Saving...'                   },
    close:           { zh: '關閉',                   en: 'Close'                       },
    noCompanies:     { zh: '目前沒有 Favorite 公司', en: 'No favorite companies yet.'  },
    comingSoon:      { zh: '即將推出',               en: 'Coming Soon'                 },
    comingSoonDesc:  { zh: 'View 訂閱功能正在開發中，即將推出。',
                       en: 'View subscription is under development and will be available soon.' },
    allHint:         { zh: '在此選擇的事件將套用至所有公司',
                       en: 'Events selected here apply to all companies'              },
  };

  // Sort available events by event_id ascending
  const sortedAvailableEvents = useMemo(
    () => [...availableEvents].sort((a, b) => a.event_id - b.event_id),
    [availableEvents],
  );

  const [subTab, setSubTab] = useState<'event' | 'view'>('event');
  // Working copy: maps coCd → set of subscribed event IDs
  const [companyEventMap, setCompanyEventMap] = useState<Record<string, Set<number>>>({});
  // Which entry is focused in left panel: a specific co_cd or 'all'
  const [selectedCo, setSelectedCo] = useState<string | 'all'>('all');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up the save-success timer on unmount to avoid state updates on unmounted component
  useEffect(() => {
    return () => {
      if (saveSuccessTimerRef.current !== null) clearTimeout(saveSuccessTimerRef.current);
    };
  }, []);

  // Initialize company event map from the pre-fetched initialSubscriptions prop.
  // All companies are pre-initialized with empty Sets so they always appear
  // in the left panel regardless of whether they have stored subscriptions.
  useEffect(() => {
    const init: Record<string, Set<number>> = {};
    companies.forEach((co) => { init[co] = new Set(); });
    for (const entry of initialSubscriptions.subscribe) {
      if (companies.includes(entry.co_cd)) {
        init[entry.co_cd] = new Set(entry.event);
      }
    }
    setCompanyEventMap(init);
  }, [companies, initialSubscriptions]);

  // Events visible in the right panel for the current selection
  const rightPanelEvents = useMemo<Set<number>>(() => {
    if (selectedCo === 'all') {
      if (companies.length === 0) return new Set<number>();
      let intersection: Set<number> | null = null;
      for (const co of companies) {
        const evts = companyEventMap[co] ?? new Set<number>();
        if (intersection === null) {
          intersection = new Set(evts);
        } else {
          for (const evt of intersection) {
            if (!evts.has(evt)) intersection.delete(evt);
          }
        }
      }
      return intersection ?? new Set<number>();
    }
    return companyEventMap[selectedCo] ?? new Set<number>();
  }, [selectedCo, companyEventMap, companies]);

  const allEventsSelected = sortedAvailableEvents.every((e) => rightPanelEvents.has(e.event_id));
  const someEventsSelected = sortedAvailableEvents.some((e) => rightPanelEvents.has(e.event_id));

  // Drive the indeterminate state of the Select All checkbox via a ref + effect
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = !allEventsSelected && someEventsSelected;
    }
  }, [allEventsSelected, someEventsSelected]);

  const handleToggleEvent = useCallback((eventId: number) => {
    setCompanyEventMap((prev) => {
      const targets = selectedCo === 'all' ? companies : [selectedCo as string];
      const checked = rightPanelEvents.has(eventId);
      // Shallow-copy the map and only clone Sets that are being modified
      const next: Record<string, Set<number>> = { ...prev };
      for (const co of targets) {
        const updated = new Set(prev[co] ?? []);
        if (checked) updated.delete(eventId); else updated.add(eventId);
        next[co] = updated;
      }
      return next;
    });
  }, [selectedCo, companies, rightPanelEvents]);

  const handleSelectAllEvents = useCallback((checked: boolean) => {
    setCompanyEventMap((prev) => {
      const targets = selectedCo === 'all' ? companies : [selectedCo as string];
      // Shallow-copy the map and only replace Sets for target companies
      const next: Record<string, Set<number>> = { ...prev };
      for (const co of targets) {
        next[co] = checked ? new Set(sortedAvailableEvents.map((e) => e.event_id)) : new Set<number>();
      }
      return next;
    });
  }, [selectedCo, companies, sortedAvailableEvents]);

  // Copy the current right-panel event selection to every company
  const handleApplyToAll = useCallback(() => {
    setCompanyEventMap((prev) => {
      const next: Record<string, Set<number>> = { ...prev };
      for (const co of companies) next[co] = new Set(rightPanelEvents);
      return next;
    });
  }, [companies, rightPanelEvents]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const subscribeList = companies
        .filter((co) => (companyEventMap[co]?.size ?? 0) > 0)
        .map((co) => ({
          co_cd: co,
          event: Array.from(companyEventMap[co] ?? []).sort((a, b) => a - b),
        }));
      const payload: UpdateSubscribeInfoPayload = { subscribe: subscribeList };
      await updateSubscribeInfo(watchlistId, payload);
      setSaveSuccess(true);
      if (saveSuccessTimerRef.current !== null) clearTimeout(saveSuccessTimerRef.current);
      saveSuccessTimerRef.current = setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 900);
    } finally {
      setSaving(false);
    }
  }, [watchlistId, companies, companyEventMap, onClose]);

  const getCompanyCount = (co: string) => companyEventMap[co]?.size ?? 0;
  const subscribedCoCount = companies.filter((co) => getCompanyCount(co) > 0).length;

  return (
    <div className="wl-modal-overlay" onClick={onClose}>
      <div className="wl-modal wl-modal--subscribe" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="wl-modal-header">
          <div className="wl-sub-header-left">
            {/* Bell icon */}
            <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
              <path d="M7 1.5a4 4 0 0 0-4 4v2.5L2 9.5h10l-1-1.5V5.5a4 4 0 0 0-4-4Z"
                stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 9.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <span className="wl-modal-title">{labels.title[lang]}</span>
            {subscribedCoCount > 0 && (
              <span className="wl-sub-header-badge">{subscribedCoCount}</span>
            )}
          </div>
          <div className="wl-modal-header-actions">
            <button className="wl-modal-cancel-btn" onClick={onClose}>{labels.close[lang]}</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="wl-mv-tabs">
          <button
            className={`wl-mv-tab${subTab === 'event' ? ' active' : ''}`}
            onClick={() => setSubTab('event')}
          >
            {labels.eventTab[lang]}
          </button>
          {/* View tab — Coming Soon / lock overlay */}
          <button
            className="wl-mv-tab wl-mv-tab--coming-soon"
            aria-disabled="true"
            tabIndex={-1}
          >
            {labels.viewTab[lang]}
            <span className="wl-feed-tab-cs-overlay" aria-hidden="true">
              <span className="wl-feed-tab-cs-inner" aria-hidden="true" />
              <svg className="wl-feed-tab-cs-lock" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="16" r="1.2" fill="currentColor" />
              </svg>
            </span>
          </button>
        </div>

        {/* Body */}
        <div className="wl-modal-body wl-modal-body--scroll">
          {subTab === 'event' ? (
            companies.length === 0 ? (
              <div className="wl-feed-coming-soon">
                <span className="wl-feed-coming-soon-title">{labels.noCompanies[lang]}</span>
              </div>
            ) : (
              <div className="wl-sub-layout">
                {/* Left panel — Companies */}
                <div className="wl-sub-panel">
                  <div className="wl-sub-panel-header">
                    <span className="wl-sub-panel-title">{labels.companiesTitle[lang]}</span>
                  </div>
                  <div className="wl-sub-panel-body">
                    {/* All Companies row */}
                    <button
                      className={`wl-sub-company-item wl-sub-company-item--all${selectedCo === 'all' ? ' active' : ''}`}
                      onClick={() => setSelectedCo('all')}
                    >
                      <span className="wl-sub-company-name">
                        <svg viewBox="0 0 14 14" fill="none" width="11" height="11" aria-hidden="true">
                          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                          <path d="M4 7h6M7 4v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                        {labels.allCompanies[lang]}
                      </span>
                      <span className="wl-sub-badge wl-sub-badge--muted">
                        {subscribedCoCount}/{companies.length}
                      </span>
                    </button>
                    {/* Individual company rows */}
                    {companies.map((co) => {
                      const count = getCompanyCount(co);
                      return (
                        <button
                          key={co}
                          className={`wl-sub-company-item${selectedCo === co ? ' active' : ''}`}
                          onClick={() => setSelectedCo(co)}
                        >
                          <span className="wl-sub-company-name">{co}</span>
                          {count > 0 && <span className="wl-sub-badge">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right panel — Event types */}
                <div className="wl-sub-panel wl-sub-panel--events">
                  <div className="wl-sub-panel-header">
                    <span className="wl-sub-panel-title">{labels.eventTypes[lang]}</span>
                    <div className="wl-sub-panel-header-actions">
                      {selectedCo !== 'all' && (
                        <button className="wl-sub-apply-all-btn" onClick={handleApplyToAll}>
                          {labels.applyToAll[lang]}
                        </button>
                      )}
                      <label className="wl-sub-select-all-label">
                        <input
                          type="checkbox"
                          ref={selectAllCheckboxRef}
                          checked={allEventsSelected}
                          onChange={(e) => handleSelectAllEvents(e.target.checked)}
                        />
                        {labels.selectAll[lang]}
                      </label>
                    </div>
                  </div>
                  <div className="wl-sub-panel-body">
                    {selectedCo === 'all' && (
                      <div className="wl-sub-all-hint">{labels.allHint[lang]}</div>
                    )}
                    {sortedAvailableEvents.map((ec) => (
                      <label key={ec.event_id} className="wl-sub-event-item">
                        <input
                          type="checkbox"
                          checked={rightPanelEvents.has(ec.event_id)}
                          onChange={() => handleToggleEvent(ec.event_id)}
                        />
                        <span className="wl-sub-event-name">{ec.event_type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )
          ) : (
            /* View tab — Coming Soon */
            <div className="wl-feed-coming-soon">
              <svg viewBox="0 0 24 24" fill="none" width="36" height="36" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="16" r="1.2" fill="#9ca3af" />
              </svg>
              <span className="wl-feed-coming-soon-title">{labels.comingSoon[lang]}</span>
              <span className="wl-feed-coming-soon-desc">{labels.comingSoonDesc[lang]}</span>
            </div>
          )}
        </div>

        {/* Footer — only on Event tab with companies */}
        {subTab === 'event' && companies.length > 0 && (
          <div className="wl-sub-footer">
            <button
              className={`wl-sub-save-btn${saveSuccess ? ' wl-sub-save-btn--success' : ''}`}
              onClick={handleSave}
              disabled={saving || saveSuccess}
            >
              {saveSuccess ? (
                <>
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
                    <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {lang === 'zh' ? '已儲存' : 'Saved'}
                </>
              ) : saving ? (
                labels.saving[lang]
              ) : (
                labels.save[lang]
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Manage View Modal ─────────────────────────────────────────────────────────
interface ManageViewModalProps {
  customViews: CustomView[];
  viewOrder: string[];
  hiddenViews: Set<string>;
  onSave: (name: string, columns: number[]) => void;
  onEditSave: (oldId: string, name: string, columns: number[]) => void;
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
  onEditSave,
  onDelete,
  onToggleHide,
  onReorderViews,
  onClose,
}: ManageViewModalProps) {
  const [modalTab, setModalTab] = useState<'create' | 'edit'>('create');

  // Track which custom view is currently being edited in the Edit Views tab (null = list mode)
  const [editingViewId, setEditingViewId] = useState<string | null>(null);

  // Create New View state — category/column data from getViewAllColumns()
  // Sort categories by categoryId ascending (as required by API response contract)
  const viewAllColumns = useMemo(() => {
    const cols = getViewAllColumns();
    return [...cols].sort((a, b) => (a.categoryId < b.categoryId ? -1 : a.categoryId > b.categoryId ? 1 : 0));
  }, []);
  const categoryLabels = useMemo(() => viewAllColumns.map((c) => c.categoryName), [viewAllColumns]);
  const categoryColumnMap = useMemo(() => {
    const map: Record<string, { column_id: number; column_name: string }[]> = {};
    for (const cat of viewAllColumns) {
      map[cat.categoryName] = cat.columns;
    }
    return map;
  }, [viewAllColumns]);
  const columnIdToName = useMemo(() => {
    const map: Record<number, string> = {};
    for (const cat of viewAllColumns) {
      for (const col of cat.columns) {
        map[col.column_id] = col.column_name;
      }
    }
    return map;
  }, [viewAllColumns]);

  const MAX_SELECTED_COLUMNS = 15;

  const [viewName, setViewName] = useState('');
  const [viewNameError, setViewNameError] = useState(false);
  const [columnsError, setColumnsError] = useState(false);
  const [columnLimitWarning, setColumnLimitWarning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryLabels[0] ?? '');
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);

  // Delete confirmation state for Edit Views tab
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Edit Views drag state
  const editDragItem = useRef<number | null>(null);
  const editDragOver = useRef<number | null>(null);

  const availableColumns = categoryColumnMap[selectedCategory] ?? [];

  const handleToggleColumn = useCallback((colId: number) => {
    setSelectedColumns((prev) => {
      if (prev.includes(colId)) {
        setColumnLimitWarning(false);
        return prev.filter((c) => c !== colId);
      }
      if (prev.length >= MAX_SELECTED_COLUMNS) {
        setColumnLimitWarning(true);
        return prev;
      }
      setColumnLimitWarning(false);
      return [...prev, colId];
    });
    setColumnsError(false);
  }, []);

  const handleRemoveSelectedColumn = useCallback((colId: number) => {
    setSelectedColumns((prev) => prev.filter((c) => c !== colId));
    setColumnLimitWarning(false);
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
    let hasError = false;
    if (!name) {
      setViewNameError(true);
      hasError = true;
    }
    if (selectedColumns.length === 0) {
      setColumnsError(true);
      hasError = true;
    }
    if (hasError) return;
    if (editingViewId !== null) {
      onEditSave(editingViewId, name, selectedColumns);
    } else {
      onSave(name, selectedColumns);
    }
  }

  function handleStartEditView(id: string) {
    const view = customViews.find((v) => v.id === id);
    if (!view) return;
    setEditingViewId(id);
    setViewName(view.name);
    setSelectedColumns([...view.columns]);
    setViewNameError(false);
    setColumnsError(false);
    setColumnLimitWarning(false);
  }

  function handleCancelEditView() {
    setEditingViewId(null);
    setViewName('');
    setSelectedColumns([]);
    setViewNameError(false);
    setColumnsError(false);
    setColumnLimitWarning(false);
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
              <div className={`wl-modal-field${viewNameError ? ' wl-modal-field--error' : ''}`}>
                <label className="wl-modal-field-label">View Name</label>
                <input
                  className={`wl-modal-input${viewNameError ? ' wl-modal-input--error' : ''}`}
                  type="text"
                  placeholder="e.g. My Earnings View"
                  value={viewName}
                  onChange={(e) => { setViewName(e.target.value); setViewNameError(false); }}
                  autoFocus
                />
                {viewNameError && (
                  <span className="wl-modal-field-error-msg">View Name is required.</span>
                )}
              </div>

              {/* 3-column picker */}
              <div className="wl-mv-picker">
                {/* Category */}
                <div className="wl-mv-panel">
                  <div className="wl-mv-panel-title">Category</div>
                  <div className="wl-mv-panel-body">
                    {categoryLabels.map((cat) => (
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
                    {availableColumns.map((col) => {
                      const checked = selectedColumns.includes(col.column_id);
                      return (
                        <label key={col.column_id} className="wl-mv-col-item">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleColumn(col.column_id)}
                          />
                          <span>{col.column_name}</span>
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
                      <div className={`wl-mv-empty${columnsError ? ' wl-mv-empty--error' : ''}`}>
                        No columns selected yet.<br />Check columns on the left.
                      </div>
                    ) : (
                      selectedColumns.map((colId, i) => {
                        const label = columnIdToName[colId];
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

              {/* Columns error message */}
              {columnsError && selectedColumns.length === 0 && (
                <span className="wl-modal-field-error-msg" style={{ alignSelf: 'flex-end' }}>
                  Please select at least one column to create a view.
                </span>
              )}

              {/* Column limit warning */}
              {columnLimitWarning && (
                <span className="wl-modal-field-error-msg" style={{ alignSelf: 'flex-end' }}>
                  You can select a maximum of {MAX_SELECTED_COLUMNS} columns per view.
                </span>
              )}

              {/* Save button */}
              <button
                className="wl-modal-done-btn"
                style={{ alignSelf: 'flex-end', marginTop: 4 }}
                onClick={handleCreateSave}
              >
                Save View
              </button>
            </>
          ) : (
            /* Edit Views tab */
            editingViewId !== null ? (
              /* ── Inline edit form (same layout as Create New View) ── */
              <>
                {/* Back button */}
                <button className="wl-mv-back-btn" onClick={handleCancelEditView}>
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
                    <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to List
                </button>

                {/* View Name */}
                <div className={`wl-modal-field${viewNameError ? ' wl-modal-field--error' : ''}`}>
                  <label className="wl-modal-field-label">View Name</label>
                  <input
                    className={`wl-modal-input${viewNameError ? ' wl-modal-input--error' : ''}`}
                    type="text"
                    placeholder="e.g. My Earnings View"
                    value={viewName}
                    onChange={(e) => { setViewName(e.target.value); setViewNameError(false); }}
                    autoFocus
                  />
                  {viewNameError && (
                    <span className="wl-modal-field-error-msg">View Name is required.</span>
                  )}
                </div>

                {/* 3-column picker */}
                <div className="wl-mv-picker">
                  {/* Category */}
                  <div className="wl-mv-panel">
                    <div className="wl-mv-panel-title">Category</div>
                    <div className="wl-mv-panel-body">
                      {categoryLabels.map((cat) => (
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
                      {availableColumns.map((col) => {
                        const checked = selectedColumns.includes(col.column_id);
                        return (
                          <label key={col.column_id} className="wl-mv-col-item">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleColumn(col.column_id)}
                            />
                            <span>{col.column_name}</span>
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
                        <div className={`wl-mv-empty${columnsError ? ' wl-mv-empty--error' : ''}`}>
                          No columns selected yet.<br />Check columns on the left.
                        </div>
                      ) : (
                        selectedColumns.map((colId, i) => {
                          const label = columnIdToName[colId];
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

                {/* Columns error message */}
                {columnsError && selectedColumns.length === 0 && (
                  <span className="wl-modal-field-error-msg" style={{ alignSelf: 'flex-end' }}>
                    Please select at least one column to save this view.
                  </span>
                )}

                {/* Column limit warning */}
                {columnLimitWarning && (
                  <span className="wl-modal-field-error-msg" style={{ alignSelf: 'flex-end' }}>
                    You can select a maximum of {MAX_SELECTED_COLUMNS} columns per view.
                  </span>
                )}

                {/* Save button */}
                <button
                  className="wl-modal-done-btn"
                  style={{ alignSelf: 'flex-end', marginTop: 4 }}
                  onClick={handleCreateSave}
                >
                  Update View
                </button>
              </>
            ) : (
              <div className="wl-mv-edit-list">
                {viewOrder.map((id, i) => {
                  const isSummary = id === 'Summary';
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
                        {/* Summary View cannot be hidden or deleted */}
                        {!isSummary && (
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
                        )}
                        {!isBuiltin && (
                          <button
                            className="wl-mv-edit-btn"
                            title="Edit View"
                            onClick={() => handleStartEditView(id)}
                          >
                            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                              <path d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                            </svg>
                            <span>Edit</span>
                          </button>
                        )}
                        {!isSummary && (
                          <button
                            className="wl-mv-delete-btn"
                            title="Delete View"
                            onClick={() => setConfirmDeleteId(id)}
                          >
                            <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                              <path d="M2.5 4h9M5.5 4V2.5h3V4M5.5 6.5v4M8.5 6.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Delete View Confirmation Dialog ────────────────────────────── */}
      {confirmDeleteId !== null && (() => {
        const viewLabel = BUILTIN_VIEWS.includes(confirmDeleteId as typeof BUILTIN_VIEWS[number])
          ? confirmDeleteId
          : (customViews.find((v) => v.id === confirmDeleteId)?.name ?? confirmDeleteId);
        return (
          <div className="wl-modal-overlay wl-modal-overlay--inner" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal wl-modal--confirm" onClick={(e) => e.stopPropagation()}>
              <div className="wl-modal-header">
                <div className="wl-confirm-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true">
                    <path d="M9 3h6M3 6h18M8 6v13a1 1 0 001 1h6a1 1 0 001-1V6M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="wl-modal-title">Delete View</span>
                <button className="wl-modal-cancel-btn" onClick={() => setConfirmDeleteId(null)} aria-label="Close">
                  <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
                    <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
              <div className="wl-modal-body wl-confirm-body">
                <p className="wl-confirm-message">
                  Are you sure you want to delete <strong>&ldquo;{viewLabel}&rdquo;</strong>?
                  <br />
                  This action cannot be undone.
                </p>
                <div className="wl-confirm-actions">
                  <button
                    className="wl-confirm-delete-btn"
                    onClick={() => {
                      const id = confirmDeleteId;
                      setConfirmDeleteId(null);
                      onDelete(id);
                    }}
                  >
                    Delete
                  </button>
                  <button className="wl-modal-cancel-btn" onClick={() => setConfirmDeleteId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
type FeedTab = 'Latest' | 'News' | 'Press Release' | 'Event';

/** Number of days used as the look-back window for news/press-release and look-ahead window for events in the Latest tab. */
const LATEST_TAB_DAYS_WINDOW = 7;
const OFFICIAL_PRESS_RELEASE_CATEGORY = 'official press release';

// ── Unified Updates feed item ─────────────────────────────────────────────────
interface UpdateFeedItem {
  id: string;
  kind: 'news' | 'press-release' | 'event';
  title: string;
  source: string;
  category?: string;
  displaySymbols: string[];
  dateLabel: string;
  dateMs: number;
  description?: string;
  contactName?: string;
  url?: string;
}

/** Format an event date string to local-timezone YYYY-MM-DD HH:MM */
function formatEventDateLabel(dateStr: string): string {
  if (!dateStr) return dateStr;
  // Try to parse as ISO-like datetime first (e.g. "2026-04-07 00:00:00.0" or "2025-04-07")
  const isoLike = dateStr.replace(' ', 'T').replace(/\.0+$/, '');
  const asUtc = new Date(isoLike.includes('T') ? isoLike + 'Z' : isoLike);
  // If parsing as datetime succeeded with a time component, use local time
  if (!isNaN(asUtc.getTime()) && isoLike.includes('T')) {
    const y = asUtc.getFullYear();
    const mo = String(asUtc.getMonth() + 1).padStart(2, '0');
    const d = String(asUtc.getDate()).padStart(2, '0');
    const h = String(asUtc.getHours()).padStart(2, '0');
    const mi = String(asUtc.getMinutes()).padStart(2, '0');
    return `${y}-${mo}-${d} ${h}:${mi}`;
  }
  // Fall back: parse as a plain date string (e.g. "Apr 7, 2025")
  const plain = new Date(dateStr);
  if (!isNaN(plain.getTime())) {
    const y = plain.getFullYear();
    const mo = String(plain.getMonth() + 1).padStart(2, '0');
    const d = String(plain.getDate()).padStart(2, '0');
    return `${y}-${mo}-${d} 00:00`;
  }
  return dateStr;
}

function parseDateKey(dateKey: string): number {
  try { return new Date(`${dateKey} 2026`).getTime(); } catch { return 0; }
}

export default function WatchlistPage({ params }: { params: { id: string } }) {
  return <WatchlistContent params={params} />;
}

interface WatchlistContentProps {
  params: { id: string };
  initialSymbols?: string[];
  watchlistNameOverride?: string;
  useOverrideName?: boolean;
  forceFavoriteStar?: boolean;
  disableDeleteWatchlist?: boolean;
  disableNameEdit?: boolean;
  /** When true, the trash icon in Edit Watchlist is hidden (used for Favorites) */
  disableCompanyDelete?: boolean;
  /** Called when the favorites symbol list is updated (used by FavoritesContent to refresh). */
  onFavoritesSymbolsUpdate?: (symbols: string[]) => void;
  /** When true, shows the Subscribe button in the action bar (Favorites page only). */
  showSubscribeButton?: boolean;
}

export function WatchlistContent({
  params,
  initialSymbols,
  watchlistNameOverride,
  useOverrideName = false,
  forceFavoriteStar = false,
  disableDeleteWatchlist = false,
  disableNameEdit = false,
  disableCompanyDelete = false,
  onFavoritesSymbolsUpdate,
  showSubscribeButton = false,
}: WatchlistContentProps) {
  const watchlistId = params.id;
  // Numeric watchlist ID used for API calls (e.g. querySubInfoByWatchlistId, updateSubscribeInfo).
  // For string IDs like 'favorites', defaults to 0 to match the mock watchlistId in stubs.
  const numericWatchlistId: number = Number.isInteger(Number(watchlistId)) ? Number(watchlistId) : 0;
  const { watchlistNames, setWatchlistName, symbolOrders, setSymbolOrder, favorites, toggleFavorite, dynamicWatchlists, deletedWatchlists, deleteWatchlist: contextDeleteWatchlist, refreshApiWatchlists } = useWatchlist();
  const router = useRouter();
  const { lang } = useLanguage();

  const watchlistName =
    useOverrideName && watchlistNameOverride
      ? watchlistNameOverride
      : (watchlistNames[watchlistId] ?? 'Watchlist');
  const currentSymbolOrder = symbolOrders[watchlistId] ?? initialSymbols ?? holdingsDataQ1.map((h) => h.symbol);

  const [activeTab, setActiveTab] = useState<string>('Summary');
  const [feedTab, setFeedTab] = useState<FeedTab>('Latest');
  const [newsPage, setNewsPage] = useState(0);

  // API response data from getWatchlistData — used to render fld_val directly
  const [watchlistApiData, setWatchlistApiData] = useState<WatchlistDataItem[]>([]);

  // Build dynamic quarter options (current quarter back 8 quarters)
  const recentQuarters = useMemo(() => buildRecentQuarters(), []);
  const [quarter, setQuarter] = useState(recentQuarters[0] ?? { year: 2026, q: 1 });
  const [splitLayout, setSplitLayout] = useState(false);

  // Summary view column order (drag-to-reorder, persisted in localStorage)
  const SUMMARY_DEFAULT_COLS = ['revenue', 'revenueQoQ', 'revenueYoY', 'grossMargin', 'doi', 'nextEarning', 'lastQtrRevenue', 'lastQtrGrossMargin', 'lastQtrDOI'];
  const [summaryColOrder, setSummaryColOrder] = useState<string[]>(SUMMARY_DEFAULT_COLS);
  const [summaryColsHydrated, setSummaryColsHydrated] = useState(false);
  const colDragSrc = useRef<number | null>(null);
  const colDragOver = useRef<number | null>(null);

  // Reusable drag-drop handler for column reordering
  const makeColDragHandlers = useCallback((
    cols: string[],
    onReorder: (next: string[]) => void,
  ) => ({
    onDragStart: (idx: number) => { colDragSrc.current = idx; },
    onDragOver: (e: React.DragEvent, idx: number) => { e.preventDefault(); colDragOver.current = idx; },
    onDrop: () => {
      if (colDragSrc.current === null || colDragOver.current === null) return;
      if (colDragSrc.current === colDragOver.current) return;
      const next = [...cols];
      const [moved] = next.splice(colDragSrc.current, 1);
      next.splice(colDragOver.current, 0, moved);
      onReorder(next);
      colDragSrc.current = null;
      colDragOver.current = null;
    },
    onDragEnd: () => { colDragSrc.current = null; colDragOver.current = null; },
  }), []);

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  // Subscribe modal data — loaded by calling APIs when the button is clicked
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState(false);
  const [subscribeInitialData, setSubscribeInitialData] = useState<UpdateSubscribeInfoPayload>({ subscribe: [] });
  const [subscribeAvailableEvents, setSubscribeAvailableEvents] = useState<SubEventItem[]>([]);

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
  const [addSymbolError, setAddSymbolError] = useState('');

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

  // Reset news pagination when tab changes or watched symbol list changes
  useEffect(() => {
    setNewsPage(0);
  }, [feedTab, currentSymbolOrderKey]); // currentSymbolOrderKey is a derived string; stable deps are intentional

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

  // Load summary column order from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wl-summary-col-order');
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) setSummaryColOrder(parsed);
      }
    } catch { /* ignore */ }
    setSummaryColsHydrated(true);
  }, []);

  // Persist summary column order
  useEffect(() => {
    if (!summaryColsHydrated) return;
    try {
      localStorage.setItem('wl-summary-col-order', JSON.stringify(summaryColOrder));
    } catch { /* ignore */ }
  }, [summaryColOrder, summaryColsHydrated]);

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

  // Re-fetch watchlist data when quarter changes or when switching to a custom view tab
  useEffect(() => {
    const numericId = parseInt(watchlistId);
    if (isNaN(numericId)) return;

    // Load cached detail from localStorage to avoid an extra API call
    let coList: string[] = [...currentSymbolOrder];
    let selectedCategories: number[];

    const cached = typeof window !== 'undefined' ? localStorage.getItem(WL_DETAIL_LS_KEY(numericId)) : null;
    if (cached) {
      try {
        const detail = JSON.parse(cached);
        coList = (detail.companylist ?? [])
          .slice()
          .sort((a: { orderIndex: number }, b: { orderIndex: number }) => a.orderIndex - b.orderIndex)
          .map((c: { coCd: string }) => c.coCd);
      } catch { /* use fallback */ }
    }

    const isSummary = activeTab === 'Summary';
    if (isSummary) {
      selectedCategories = [...SUMMARY_FIXED_CATEGORIES];
    } else {
      // Custom view — look up apiViewId
      const customView = customViews.find((v) => v.id === activeTab);
      const apiViewId = customView?.apiViewId ?? 0;
      if (cached) {
        try {
          const detail = JSON.parse(cached);
          const viewEntry = (detail.viewlist ?? []).find((v: { viewId: number }) => v.viewId === apiViewId);
          selectedCategories = viewEntry?.selectedCategories ?? customView?.columns ?? [...SUMMARY_FIXED_CATEGORIES];
        } catch {
          selectedCategories = customView?.columns ?? [...SUMMARY_FIXED_CATEGORIES];
        }
      } else {
        selectedCategories = customView?.columns ?? [...SUMMARY_FIXED_CATEGORIES];
      }
    }

    if (coList.length > 0) {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const curr_dt = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
      const result = getWatchlistData({
        watchlistId: numericId,
        viewId: activeTab === 'Summary' ? 0 : (customViews.find((v) => v.id === activeTab)?.apiViewId ?? 0),
        year: [String(quarter.year)],
        quarter: [`Q${quarter.q}`],
        selectedCategories,
        co_cd: coList,
        curr_dt,
      });
      setWatchlistApiData(result);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quarter, activeTab, watchlistId]);

  // Quarter navigation: find current index in the dynamic list (memoized)
  const quarterNav = useMemo(() => {
    const idx = recentQuarters.findIndex(
      (rq) => rq.year === quarter.year && rq.q === quarter.q,
    );
    return {
      currentQIdx: idx,
      hasPrevQ: idx < recentQuarters.length - 1,
      hasNextQ: idx > 0,
      prevQ: idx < recentQuarters.length - 1 ? recentQuarters[idx + 1] : quarter,
      nextQ: idx > 0 ? recentQuarters[idx - 1] : quarter,
    };
  }, [quarter, recentQuarters]);

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

  // Lookup map: co_cd → (categoryId → fld_val) — used to render API response values directly
  const apiDataLookup = useMemo(() => {
    const map = new Map<string, Map<number, string | number | null>>();
    for (const item of watchlistApiData) {
      if (!map.has(item.co_cd)) map.set(item.co_cd, new Map());
      map.get(item.co_cd)!.set(item.selectedCategories, item.fld_val);
    }
    return map;
  }, [watchlistApiData]);

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

  // Helper: build GetWatchlistDataParams from getWatchlistDetail result + current view
  function buildWatchlistDataParams(numericId: number, coList: string[], selectedCategories: number[], viewId: number): GetWatchlistDataParams {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const curr_dt = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
    return {
      watchlistId: numericId,
      viewId,
      year: [String(quarter.year)],
      quarter: [`Q${quarter.q}`],
      selectedCategories,
      co_cd: coList,
      curr_dt,
    };
  }

  // Helper: after an API mutation, call getWatchlistDetail + getWatchlistData and update local state.
  // Pass viewId to fetch data for a specific view; omit (or pass 0) for Summary.
  function refreshFromDetail(numericId: number, viewId: number = 0) {
    const detailRes = getWatchlistDetail(numericId);
    const detail = detailRes.result;

    // Persist detail to localStorage for future use when building getWatchlistData params
    if (typeof window !== 'undefined') {
      localStorage.setItem(WL_DETAIL_LS_KEY(numericId), JSON.stringify(detail));
    }

    const coList = detail.companylist
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((c) => c.coCd);

    let selectedCategories: number[];
    const isSummary = viewId === 0;
    if (isSummary) {
      // Summary view always uses the fixed 9 category IDs
      selectedCategories = [...SUMMARY_FIXED_CATEGORIES];
    } else {
      // Custom view: pull selectedCategories from the viewlist entry
      const viewEntry = detail.viewlist.find((v) => v.viewId === viewId);
      selectedCategories = viewEntry?.selectedCategories ?? [...SUMMARY_FIXED_CATEGORIES];
    }

    const params = buildWatchlistDataParams(numericId, coList, selectedCategories, viewId);
    const data = getWatchlistData(params);
    setWatchlistApiData(data);
    // Update local symbol order and extra holdings
    setSymbolOrder(watchlistId, coList);
    const newExtras = { ...extraHoldings };
    for (const sym of coList) {
      if (!holdingsLookup.has(sym) && !newExtras[sym]) {
        newExtras[sym] = createPlaceholderHolding(sym);
      }
    }
    setExtraHoldings(newExtras);
  }

  function handleEditWatchlistClick() {
    setEditWatchlistName(watchlistName);
    setEditSymbolOrder([...currentSymbolOrder]);
    setShowEditWatchlist(true);
  }

  async function handleEditWatchlistDone() {
    const trimmed = editWatchlistName.trim() || watchlistName;

    // Detect if anything changed
    const nameChanged = trimmed !== watchlistName;
    const orderChanged = JSON.stringify(editSymbolOrder) !== JSON.stringify(currentSymbolOrder);
    const hasChanges = nameChanged || orderChanged;

    setWatchlistName(watchlistId, trimmed);
    setSymbolOrder(watchlistId, [...editSymbolOrder]);
    setShowEditWatchlist(false);

    const numericId = parseInt(watchlistId);

    if (hasChanges && !isNaN(numericId)) {
      // POST: editWatchlist with new format
      const coCdList = editSymbolOrder.map((coCd, idx) => ({ coCd, orderIndex: idx, isPinned: 'N' as const }));
      await editWatchlist({ watchlistId: numericId, newWatchlistName: trimmed, coCdList });
      // Refresh from detail
      refreshFromDetail(numericId);
    } else {
      // No structural changes — still call legacy stub for audit logging
      updateWatchlistInfo('demoUser', watchlistId, trimmed, [...editSymbolOrder]);
    }

    // When editing the Favorites watchlist, persist changes to user-personality
    if (watchlistId === 'favorites') {
      setFavoritesInPersonality([...editSymbolOrder]);
      const refreshed = getFavoritesListByUserAcct('demoUser');
      onFavoritesSymbolsUpdate?.(refreshed);
    }
  }

  function handleEditWatchlistCancel() {
    setShowEditWatchlist(false);
  }

  function handleDeleteWatchlist() {
    if (disableDeleteWatchlist) {
      setShowEditWatchlist(false);
      return;
    }
    // Close edit modal and show confirmation dialog
    setShowEditWatchlist(false);
    setShowDeleteConfirm(true);
  }

  async function handleDeleteWatchlistConfirm() {
    setShowDeleteConfirm(false);

    const numericId = parseInt(watchlistId);
    if (!isNaN(numericId)) {
      // POST: deleteWatchlist
      await deleteWatchlistById(numericId);
    }

    // Update local context state
    contextDeleteWatchlist(watchlistId);

    // Remove cached detail from localStorage
    if (typeof window !== 'undefined' && !isNaN(numericId)) {
      localStorage.removeItem(WL_DETAIL_LS_KEY(numericId));
    }

    // Refresh the API watchlist list from the single source of truth
    refreshApiWatchlists();

    // Always navigate to Create Watchlist after deletion
    router.push('/watchlist/create');
  }

  function handleAddSymbolClose() {
    setShowAddSymbol(false);
    setAddSymbolQuery('');
    setAddSymbolError('');
  }

  async function handleAddSymbolSubmit() {
    const parsed = addSymbolQuery
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (parsed.length > 0) {
      // Enforce 10-company limit per watchlist
      const existingSet = new Set(currentSymbolOrder);
      const newEntries = parsed.filter((s) => !existingSet.has(s));
      const available = Math.max(0, WATCHLIST_MAX_COMPANIES - currentSymbolOrder.length);
      if (newEntries.length > available) {
        setAddSymbolError(
          available === 0
            ? `Watchlist is full (${WATCHLIST_MAX_COMPANIES} companies max). Remove a company to add more.`
            : `Watchlist is limited to ${WATCHLIST_MAX_COMPANIES} companies. Only the first ${available} new ${available === 1 ? 'entry' : 'entries'} will be added.`
        );
      }
      // Only add truly new symbols, up to the available slots
      const symbols = newEntries.slice(0, available);

      if (symbols.length > 0) {
        const numericId = parseInt(watchlistId);

        if (!isNaN(numericId)) {
          // POST: addCompanyToWatchlist with new format { watchlistId, coCdList }
          await addCompanyToWatchlist({ watchlistId: numericId, coCdList: symbols });
          // Refresh from getWatchlistDetail + getWatchlistData
          refreshFromDetail(numericId);
        } else {
          // Non-numeric IDs (e.g. 'favorites') — use local-only path
          const newExtraHoldings = { ...extraHoldings };
          const newOrder = [...currentSymbolOrder];
          for (const sym of symbols) {
            if (newOrder.includes(sym)) continue;
            newOrder.push(sym);
            if (!holdingsLookup.has(sym) && !newExtraHoldings[sym]) {
              newExtraHoldings[sym] = createPlaceholderHolding(sym);
            }
          }
          setExtraHoldings(newExtraHoldings);
          setSymbolOrder(watchlistId, newOrder);
        }

        // When adding symbols to the Favorites watchlist, call addCompanyToMyFavorite
        // for each new symbol then refresh via getAllCoFavoriteList
        if (watchlistId === 'favorites') {
          const newSymbols = symbols.filter((s) => !currentSymbolOrder.includes(s));
          for (const sym of newSymbols) {
            await addCompanyToMyFavorite(sym);
          }
          const refreshed = await getAllCoFavoriteList('demoUser');
          onFavoritesSymbolsUpdate?.(refreshed.co_cd);
        }
      }
    }

    handleAddSymbolClose();
  }

  // ── Custom View handlers ───────────────────────────────────────────────────
  async function handleSaveCustomView(name: string, columnIds: number[]) {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `view-${crypto.randomUUID()}`
        : `view-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

    const numericId = parseInt(watchlistId);
    let apiViewId: number | undefined;

    if (!isNaN(numericId)) {
      // POST: createViewWithColumn — returns the new viewId
      const result = await createViewWithColumn({
        watchlistId: numericId,
        viewName: name,
        selectedCategories: columnIds,
      });
      apiViewId = result.viewId;

      // Refresh via getWatchlistDetail (persists to localStorage) + getWatchlistData for the new view
      refreshFromDetail(numericId, apiViewId ?? 0);
    }

    const newView: CustomView = { id, apiViewId, name, columns: columnIds, hidden: false };
    setCustomViews((prev) => [...prev, newView]);
    setViewOrder((prev) => [...prev, id]);
    setShowManageView(false);
    setActiveTab(id);
  }

  async function handleDeleteCustomView(id: string) {
    const view = customViews.find((v) => v.id === id);
    setCustomViews((prev) => prev.filter((v) => v.id !== id));
    setViewOrder((prev) => prev.filter((v) => v !== id));
    setActiveTab('Summary');
    setShowManageView(false);

    const numericId = parseInt(watchlistId);
    if (!isNaN(numericId) && view?.apiViewId !== undefined) {
      await apiDeleteView({ watchlistId: numericId, viewId: view.apiViewId });
    }
  }

  async function handleEditCustomView(oldId: string, name: string, columnIds: number[]) {
    const oldView = customViews.find((v) => v.id === oldId);
    const numericId = parseInt(watchlistId);
    let apiViewId: number | undefined;

    if (!isNaN(numericId)) {
      // Delete the old view entry on the server first
      if (oldView?.apiViewId !== undefined) {
        await apiDeleteView({ watchlistId: numericId, viewId: oldView.apiViewId });
      }
      // Create updated view via createViewWithColumn
      const result = await createViewWithColumn({
        watchlistId: numericId,
        viewName: name,
        selectedCategories: columnIds,
      });
      apiViewId = result.viewId;

      // Refresh via getWatchlistDetail + getWatchlistData for the updated view
      refreshFromDetail(numericId, apiViewId ?? 0);
    }

    // Update local state: replace old view with updated data
    setCustomViews((prev) =>
      prev.map((v) =>
        v.id === oldId ? { ...v, name, columns: columnIds, apiViewId } : v,
      ),
    );
    setShowManageView(false);
    setActiveTab(oldId);
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

  // Full NewsItem[] filtered by watchlist — used by the dedicated News tab (NewsCard rendering)
  const filteredNewsItems = useMemo(
    () => newsItems.filter((item) => item.tags.some((tag) => watchlistSymbolSet.has(tag.symbol))),
    [watchlistSymbolSet],
  );

  const WL_NEWS_PAGE_SIZE = 8;
  const newsTotalPages = Math.max(1, Math.ceil(filteredNewsItems.length / WL_NEWS_PAGE_SIZE));
  const pagedNewsItems = filteredNewsItems.slice(newsPage * WL_NEWS_PAGE_SIZE, (newsPage + 1) * WL_NEWS_PAGE_SIZE);

  const newsUpdateItems = useMemo((): UpdateFeedItem[] =>
    filteredNewsItems.map((item) => ({
      id: item.id,
      kind: 'news' as const,
      title: item.title,
      source: item.source,
      category: item.category?.trim().toLowerCase() ?? '',
      displaySymbols: item.tags.filter((t) => watchlistSymbolSet.has(t.symbol)).map((t) => t.symbol),
      dateLabel: item.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateMs: item.publishedAt.getTime(),
      url: item.url,
    })),
    [filteredNewsItems],
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
        url: pr.url,
      })),
    [watchlistSymbolSet],
  );

  const eventUpdateItems = useMemo((): UpdateFeedItem[] => {
    const items: UpdateFeedItem[] = [];

    Object.entries(CORP_EVENT_CATEGORY_MAP).forEach(([category, dateMap]) => {
      Object.entries(dateMap).forEach(([date, evts]) => {
        evts.forEach((evt: CorpEvent, i: number) => {
          if (!watchlistSymbolSet.has(evt.cellLabel)) return;
          items.push({
            id: `corp-${category}-${date}-${i}`,
            kind: 'event',
            title: evt.description,
            source: evt.eventType,
            displaySymbols: [evt.cellLabel],
            contactName: evt.company,
            dateLabel: formatEventDateLabel(evt.eventDate),
            dateMs: (() => { const t = new Date(evt.eventDate).getTime(); return isNaN(t) ? parseDateKey(date) : t; })(),
            url: evt.webcastLink || undefined,
          });
        });
      });
    });

    return items.sort((a, b) => b.dateMs - a.dateMs);
  }, [watchlistSymbolSet]);

  const latestUpdateItems = useMemo((): UpdateFeedItem[] => {
    const nowMs = Date.now();
    const windowMs = LATEST_TAB_DAYS_WINDOW * 24 * 60 * 60 * 1000;

    // News: only items published within the last LATEST_TAB_DAYS_WINDOW days
    // and exclude Official Press Release to avoid duplication with Press Release feed.
    const recentNews = newsUpdateItems.filter(
      (item) =>
        item.dateMs >= nowMs - windowMs &&
        item.dateMs <= nowMs &&
        item.category !== OFFICIAL_PRESS_RELEASE_CATEGORY,
    );

    // Press Release: only items published within the last LATEST_TAB_DAYS_WINDOW days.
    const recentPressReleases = prUpdateItems.filter(
      (item) => item.dateMs >= nowMs - windowMs && item.dateMs <= nowMs,
    );

    // Events: only items occurring from now through the next LATEST_TAB_DAYS_WINDOW days.
    const upcomingEvents = eventUpdateItems.filter(
      (item) => item.dateMs >= nowMs && item.dateMs <= nowMs + windowMs,
    );

    return [...recentNews, ...recentPressReleases, ...upcomingEvents].sort((a, b) => b.dateMs - a.dateMs);
  }, [newsUpdateItems, prUpdateItems, eventUpdateItems]);

  const currentUpdateItems: UpdateFeedItem[] =
    feedTab === 'Latest' ? latestUpdateItems
    : feedTab === 'News' ? newsUpdateItems
    : feedTab === 'Event' ? eventUpdateItems
    : prUpdateItems;

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
            {/* ── Portfolio Header ──────────────────────────────────── */}
            <section className="wl-portfolio-section">
              <div className="wl-portfolio-left">
                {/* Title row with dropdown */}
                <div className="wl-portfolio-title-row" ref={titleDropdownRef}>
                  {/* Star / favorite button */}
                  <button
                    className={`wl-star-btn${(forceFavoriteStar || favorites.has(watchlistId)) ? ' starred' : ''}`}
                    onClick={() => {
                      if (!forceFavoriteStar) toggleFavorite(watchlistId);
                    }}
                    disabled={forceFavoriteStar}
                    aria-label={(forceFavoriteStar || favorites.has(watchlistId)) ? 'Remove from favorites' : 'Add to favorites'}
                    title={(forceFavoriteStar || favorites.has(watchlistId)) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg viewBox="0 0 14 14" width="15" height="15" fill="none" aria-hidden="true">
                      {(forceFavoriteStar || favorites.has(watchlistId)) ? (
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
                {/* Subscribe button — Favorites page only */}
                {showSubscribeButton && (
                  <button
                    className="wl-action-btn"
                    disabled={subscribeLoading}
                    onClick={async () => {
                      setSubscribeLoading(true);
                      setSubscribeError(false);
                      try {
                        const [subInfo, subItems] = await Promise.all([
                          querySubInfoByWatchlistId({ watchlistId: numericWatchlistId }),
                          getSubItem(),
                        ]);
                        setSubscribeInitialData(subInfo);
                        setSubscribeAvailableEvents(subItems.event);
                        setShowSubscribe(true);
                      } catch {
                        setSubscribeError(true);
                      } finally {
                        setSubscribeLoading(false);
                      }
                    }}
                  >
                    {subscribeLoading ? (
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" className="wl-action-btn-spinner">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="20 12" strokeLinecap="round" />
                      </svg>
                    ) : subscribeError ? (
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
                        <path d="M7 2v5M7 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
                        <path d="M7 1.5a4 4 0 0 0-4 4v2.5L2 9.5h10l-1-1.5V5.5a4 4 0 0 0-4-4Z"
                          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.5 9.5a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className="wl-action-btn-label">
                      {subscribeError
                        ? (lang === 'zh' ? '載入失敗' : 'Load failed')
                        : (lang === 'zh' ? '訂閱' : 'Subscribe')}
                    </span>
                  </button>
                )}
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
              {/* Only show Add/Edit View when at least one company exists */}
              {sortedHoldings.length > 0 && (
                <button className="wl-subtab wl-subtab--add" onClick={() => setShowManageView(true)}>
                  <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                    <path d="M7 2V12M2 7H12" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Add/Edit View
                </button>
              )}

              {/* Quarter nav — right-aligned inside tab bar */}
              <div className="wl-quarter-nav">
                <button
                  className="wl-quarter-btn"
                  aria-label="Previous quarter"
                  disabled={!quarterNav.hasPrevQ}
                  onClick={() => setQuarter(quarterNav.prevQ)}
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
                  disabled={!quarterNav.hasNextQ}
                  onClick={() => setQuarter(quarterNav.nextQ)}
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

            {/* ── Holdings Table + Updates feed (wrapped for split-layout) ──────── */}
            <div className={`wl-content-area${splitLayout ? ' wl-content-area--split' : ''}`}>
            {/* ── Holdings Table (view-dependent) ──────── */}
            {activeTab === 'Summary' ? (
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
                      {(() => {
                        const dnd = makeColDragHandlers(summaryColOrder, setSummaryColOrder);
                        return summaryColOrder.map((c, idx) => (
                          <th
                            key={c}
                            className="wl-th wl-th--draggable"
                            draggable
                            onDragStart={() => dnd.onDragStart(idx)}
                            onDragOver={(e) => dnd.onDragOver(e, idx)}
                            onDrop={dnd.onDrop}
                            onDragEnd={dnd.onDragEnd}
                          >
                            {ALL_COLUMNS[c]?.label ?? c}
                          </th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHoldings.map((h) => (
                      <tr key={h.symbol} className="wl-tr">
                        <td className="wl-td wl-td--sticky wl-symbol">
                          <Link href={`/company-profile/${h.symbol}/`} className="wl-symbol-link" target="_blank" rel="noopener noreferrer">{h.symbol}</Link>
                        </td>
                        {summaryColOrder.map((c) => {
                          const def = ALL_COLUMNS[c];
                          if (!def) return <td key={c} className="wl-td">-</td>;
                          const cls = def.getClass ? def.getClass(h) : '';
                          const catId = SUMMARY_COL_CATEGORY_ID[c];
                          const fldVal = catId !== undefined ? apiDataLookup.get(h.symbol)?.get(catId) : undefined;
                          const displayVal = (fldVal !== undefined && fldVal !== null) ? fldVal : def.getValue(h);
                          return (
                            <td key={c} className={`wl-td${cls ? ` ${cls}` : ''}`}>
                              {displayVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : customViews.some((v) => v.id === activeTab) ? (
              /* ── Custom View Table ─────────────────────────────────── */
              (() => {
                const cv = customViews.find((v) => v.id === activeTab);
                if (!cv) return null;
                // Convert numeric column_ids → string IDs for ALL_COLUMNS lookup
                const cols = cv.columns
                  .map((numId) => CATALOG_COLUMN_ID_TO_STRING_ID[numId])
                  .filter((strId): strId is string => Boolean(strId) && Boolean(ALL_COLUMNS[strId]));
                const reorderCvCols = (nextStrIds: string[]) => {
                  // Convert back to numeric IDs before storing
                  const nextNumIds = nextStrIds.map((s) => CATALOG_STRING_ID_TO_NUM[s]).filter(Boolean) as number[];
                  setCustomViews((prev) => prev.map((v) => v.id === cv.id ? { ...v, columns: nextNumIds } : v));
                };
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
                          {(() => {
                            const dnd = makeColDragHandlers(cols, reorderCvCols);
                            return cols.map((c, idx) => (
                              <th
                                key={c}
                                className="wl-th wl-th--draggable"
                                draggable
                                onDragStart={() => dnd.onDragStart(idx)}
                                onDragOver={(e) => dnd.onDragOver(e, idx)}
                                onDrop={dnd.onDrop}
                                onDragEnd={dnd.onDragEnd}
                              >
                                {ALL_COLUMNS[c].label}
                              </th>
                            ));
                          })()}
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
            ) : null}

            {/* ── Updates feed section (always visible regardless of active view) ── */}
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
                {feedTab === 'News' ? (
                  filteredNewsItems.length === 0 ? (
                    <div className="wl-feed-empty">No news found for your watchlist companies.</div>
                  ) : (
                    <>
                      <div className={`wl-feed-news-grid${splitLayout ? ' wl-feed-news-grid--single' : ''}`}>
                        {pagedNewsItems.map((item) => (
                          <NewsCard key={item.id} item={item} />
                        ))}
                      </div>
                      {newsTotalPages > 1 && (
                        <div className="cp-news-tab-pagination">
                          <button
                            className="cp-news-tab-page-btn"
                            disabled={newsPage === 0}
                            onClick={() => setNewsPage((p) => Math.max(0, p - 1))}
                          >
                            ‹ Prev
                          </button>
                          {getPaginationRange(newsPage, newsTotalPages).map((pageIndicator) =>
                            typeof pageIndicator === 'string' ? (
                              <span key={pageIndicator} className="cp-news-tab-page-ellipsis">…</span>
                            ) : (
                              <button
                                key={pageIndicator}
                                className={`cp-news-tab-page-btn${newsPage === pageIndicator ? ' active' : ''}`}
                                onClick={() => setNewsPage(pageIndicator)}
                                aria-label={`Page ${pageIndicator + 1}`}
                                aria-current={newsPage === pageIndicator ? 'page' : undefined}
                              >
                                {pageIndicator + 1}
                              </button>
                            )
                          )}
                          <button
                            className="cp-news-tab-page-btn"
                            disabled={newsPage >= newsTotalPages - 1}
                            onClick={() => setNewsPage((p) => Math.min(p + 1, newsTotalPages - 1))}
                          >
                            Next ›
                          </button>
                        </div>
                      )}
                    </>
                  )
                ) : currentUpdateItems.length === 0 ? (
                  <div className="wl-feed-empty">No updates found for your watchlist companies.</div>
                ) : (
                  currentUpdateItems.map((item, idx) => (
                    <div key={item.id} className={`wl-feed-item${idx < currentUpdateItems.length - 1 ? ' wl-feed-item--bordered' : ''}`}>
                      {item.kind === 'news' ? <NewsAvatar /> : item.kind === 'press-release' ? (
                        <div className="wl-feed-avatar wl-feed-avatar--pr">
                          <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
                            <circle cx="14" cy="14" r="14" fill="#f3e8ff" />
                            <path d="M8 14.2V10.1c0-.7.57-1.2 1.2-1.2h1.4l5.4-2.4c.8-.35 1.7.23 1.7 1.1v9.2c0 .87-.9 1.45-1.7 1.1l-5.4-2.4H9.2c-.63 0-1.2-.5-1.2-1.2Z" stroke="#7c3aed" strokeWidth="1.3" strokeLinejoin="round" />
                            <path d="M10.6 15.5L11.9 19c.18.48.72.72 1.2.54l1.05-.39" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" />
                            <path d="M19 10.2a2.8 2.8 0 0 1 0 5.6" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" />
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
                      {item.kind === 'event' ? (
                        <div className="wl-feed-body">
                          <div className="wl-event-description">
                            {item.url ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                            ) : item.title}
                          </div>
                          <div className="wl-feed-meta">
                            <span className="wl-feed-company-tags">
                              {item.displaySymbols.map((sym) => (
                                <a
                                  key={`${item.id}-company-${sym}`}
                                  href={`/lego/company-profile/${sym}/`}
                                  className="wl-feed-company-tag"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {companyNameMap.get(sym) ?? sym}
                                </a>
                              ))}
                            </span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-event-event-type">{item.source}</span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-event-event-datetime">{item.dateLabel}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="wl-feed-body">
                          <div className="wl-feed-title">
                            {item.url ? (
                              <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a>
                            ) : item.title}
                          </div>
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
                            {item.displaySymbols.length > 0 && (
                              <>
                                <span className="wl-feed-dot">•</span>
                                <span className="wl-feed-company-tags">
                                  {item.displaySymbols.map((sym) => (
                                    <a
                                      key={`${item.id}-company-${sym}`}
                                      href={`/lego/company-profile/${sym}/`}
                                      className="wl-feed-company-tag"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {companyNameMap.get(sym) ?? sym}
                                    </a>
                                  ))}
                                </span>
                              </>
                            )}
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-source">{item.source}</span>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-time">{item.dateLabel}</span>
                            <>
                              <span className="wl-feed-dot">•</span>
                              <span className={`wl-feed-kind-badge wl-feed-kind-badge--${item.kind}`}>
                                {item.kind === 'news' ? 'News' : 'Press Release'}
                              </span>
                            </>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            </div>{/* end wl-content-area */}

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
                  Save
                </button>
                <button
                  className="wl-modal-cancel-btn"
                  onClick={handleEditWatchlistCancel}
                >
                  Cancel
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
                  readOnly={disableNameEdit}
                  style={disableNameEdit ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                />
              </div>
              {/* Company Order section — only shown when at least one company exists */}
              {editSymbolOrder.length > 0 && (
                <div>
                  <div className="wl-modal-section-title">Company Order</div>
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
                        {/* Trash icon hidden when disableCompanyDelete (Favorites) */}
                        {!disableCompanyDelete && (
                          <button
                            className="wl-drag-delete"
                            aria-label={`Delete ${sym}`}
                            onClick={() => handleDeleteSymbol(sym)}
                            title={`Remove ${sym}`}
                          >
                            <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
                              <path d="M2.5 4h9M5.5 4V2.5h3V4M5.5 6.5v4M8.5 6.5v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                              <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!disableDeleteWatchlist && (
                <button className="wl-modal-delete-wl-btn" onClick={handleDeleteWatchlist}>
                  Delete Watchlist
                </button>
              )}
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
                  className={`wl-add-search-input${addSymbolError ? ' wl-add-search-input--error' : ''}`}
                  type="text"
                  placeholder="Add Companies (e.g AAPL, TSLA, etc...)"
                  value={addSymbolQuery}
                  onChange={(e) => { setAddSymbolQuery(e.target.value); setAddSymbolError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSymbolSubmit()}
                  autoFocus
                />
              </div>
              {addSymbolError ? (
                <div className="wl-add-error-msg">{addSymbolError}</div>
              ) : (
                <div className="wl-add-hint">
                  Enter Companies separated by commas to add to your Watchlist. Max {WATCHLIST_MAX_COMPANIES} companies per watchlist.
                </div>
              )}
              {addSuggestions.length > 0 && (
                <div className="wl-add-suggestions">
                  {addSuggestions.map((c) => (
                    <button
                      key={c.symbol}
                      className="wl-add-suggestion-item"
                      onClick={() => setAddSymbolQuery((q) => {
                        const parts = q.split(',').map((s) => s.trim()).filter(Boolean);
                        if (parts.includes(c.symbol)) return q;
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

      {/* ── Subscribe Modal ───────────────────────────────────────────────── */}
      {showSubscribeButton && showSubscribe && (
        <SubscribeModal
          companies={sortedHoldings.map((h) => h.symbol)}
          watchlistId={numericWatchlistId}
          initialSubscriptions={subscribeInitialData}
          availableEvents={subscribeAvailableEvents}
          onClose={() => setShowSubscribe(false)}
        />
      )}

      {/* ── Manage View Modal ────────────────────────────────────────────── */}
      {showManageView && (
        <ManageViewModal
          customViews={customViews}
          viewOrder={viewOrder}
          hiddenViews={hiddenViews}
          onSave={handleSaveCustomView}
          onEditSave={handleEditCustomView}
          onDelete={handleDeleteCustomView}
          onToggleHide={handleToggleHideView}
          onReorderViews={setViewOrder}
          onClose={() => setShowManageView(false)}
        />
      )}

      {/* ── Delete Watchlist Confirmation Dialog ──────────────────────────── */}
      {showDeleteConfirm && (
        <div className="wl-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="wl-modal wl-modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="wl-modal-header">
              <div className="wl-confirm-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true">
                  <path d="M9 3h6M3 6h18M8 6v13a1 1 0 001 1h6a1 1 0 001-1V6M10 11v5M14 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="wl-modal-title">Delete Watchlist</span>
              <button className="wl-modal-cancel-btn" onClick={() => setShowDeleteConfirm(false)} aria-label="Close">
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="wl-modal-body wl-confirm-body">
              <p className="wl-confirm-message">
                Are you sure you want to delete <strong>&ldquo;{watchlistName}&rdquo;</strong>?
                <br />
                This action cannot be undone.
              </p>
              <div className="wl-confirm-actions">
                <button className="wl-confirm-delete-btn" onClick={handleDeleteWatchlistConfirm}>
                  Delete
                </button>
                <button className="wl-modal-cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
