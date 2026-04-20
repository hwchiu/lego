'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import DatePickerInput from '@/app/components/shared/DatePickerInput';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { COMPANY_MASTER_LIST, getCompanyByCode } from '@/app/data/companyMaster';
import { newsItems, newsCategories as newsCategoryOptions } from '@/app/data/news';
import { extractJson } from '@/app/lib/parseContent';
import { getFavoritesByUserAcct } from '@/app/lib/getFavoritesByUserAcct';
import { getPaginationRange } from '@/app/lib/paginationUtils';
import companyProfileMd from '@/content/company-profile.md';
import myTagsMd from '@/content/my-tags.md';
import FinancialStatementTab from './FinancialStatementTab';
import CompanyMATab from './CompanyMATab';
import InvestmentTab from './InvestmentTab';
import AcquisitionTab from './AcquisitionTab';
import FundingTab from './FundingTab';
import IRMaterialTab from './IRMaterialTab';
import PreEarningCallTab from './PreEarningCallTab';
import IRTranscriptTab from './IRTranscriptTab';
import AITranscriptTab from './AITranscriptTab';
import { getFinancialStatementByCoCd, type CompanyStatements } from '@/app/lib/getFinancialStatementByCoCd';
import type { StatementData } from '@/app/data/financialData';
import tvConfigMd from '@/content/tradingview.md';

const FinancialIndicesNivoChart = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.FinancialIndicesNivoChart),
  { ssr: false, loading: () => <div style={{ height: 200, background: '#f9fafb', borderRadius: 6 }} /> },
);

const DoiRevenueNivoChart = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.DoiRevenueNivoChart),
  { ssr: false, loading: () => <div style={{ height: 200, background: '#f9fafb', borderRadius: 6 }} /> },
);

// ── Types ────────────────────────────────────────────────────────────────────

interface CompanyInfo {
  symbol: string;
  name: string;
  localCurrency: string;
  bbgId: string;
  stockExchange: string;
  publicTags: string[];
  myTags: string[];
}

interface FinancialDataPoint {
  quarter: string;
  netIncome: number;
  totalRevenue: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingMarginPct: number;
  netMarginPct: number;
  cashEquivalents: number;
  guidance: number | null;
}

interface RevenueBreakdownItem {
  name: string;
  pct: number;
}

interface DoiRevenuePoint {
  quarter: string;
  doi: number;
  revenue: number;
  guidance: number | null;
}

interface CompanyFinancialData {
  currentCalendarQuarter: string;
  currentQtr: {
    label: string;
    revenue: number;
    revenueUnit: string;
    revenueQoQ: number;
    grossMargin: number;
    grossMarginNote: string;
    lastQuarterRevenue: number;
    doi: number;
  };
  nextQtr: {
    label: string;
    revenueMidpointGuidance: number;
    revenueQoQ: number;
  };
  financialIndices: FinancialDataPoint[];
  revenueBreakdown: { quarter: string; items: RevenueBreakdownItem[] };
  doiRevenue: DoiRevenuePoint[];
}

interface ProfileData {
  companies: CompanyInfo[];
  financialData: Record<string, CompanyFinancialData>;
}

// ── Parse markdown data ──────────────────────────────────────────────────────

let _parsed: ProfileData | null = null;
function getProfileData(): ProfileData {
  if (!_parsed) {
    _parsed = extractJson<ProfileData>(companyProfileMd);
  }
  return _parsed;
}

// Seed tag suggestions from markdown (loaded once at module level)
let _seedTags: string[] | null = null;
function getSeedTags(): string[] {
  if (!_seedTags) {
    _seedTags = extractJson<string[]>(myTagsMd as string);
  }
  return _seedTags;
}

// Collect all tags the user has previously added across all company profiles
function getLocalStorageTags(): string[] {
  try {
    const all: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cp-tags-')) {
        const val = localStorage.getItem(key);
        if (val) {
          const tags = JSON.parse(val) as string[];
          all.push(...tags);
        }
      }
    }
    return [...new Set(all)];
  } catch {
    return [];
  }
}

// ── TradingView config parsed from JSON ──────────────────────────────────────

interface TvWidgetConfig {
  stockChartSrc: string;
  marketOverviewSrc: string;
  marketOverviewConfig: Record<string, unknown>;
}
const TV_CONFIG: TvWidgetConfig = extractJson<TvWidgetConfig>(tvConfigMd as string);

// ── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  'FIN. Summary',
  'FIN. Statement',
  'News',
  'Stock',
  'IR Transcript',
  'AI Transcript',
  'Pre-Earning Call',
  'IR Material',
  'Investment',
  'Acquisition',
  'Funding',
] as const;

const NEWS_CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  newsCategoryOptions.map((category) => [category.key, category.label]),
);
type Tab = (typeof TABS)[number];

const FIN_INDICES = [
  'Revenue',
  'Gross Profit',
  'Gross Margin',
  'Operating Margin',
  'Net Income',
  'Net Margin',
  'Cash & Cash Equivalents',
] as const;

const FAVORITES_KEY = 'cp-favorites';

// Items per page in the News tab
const NEWS_PAGE_SIZE = 8;

// ── Chart data derivation helpers ─────────────────────────────────────────────

/** Convert a StatementData period label like "Q1 2025" → "25Q1" (YYQQ).
 *  Returns null for annual periods ("FY2025"). */
function periodToQuarterLabel(period: string): string | null {
  const m = period.match(/^(Q\d)\s+(\d{4})$/);
  if (!m) return null;
  const q = m[1];          // "Q1"
  const yy = m[2].slice(2); // "25"
  return `${yy}${q}`;      // "25Q1"
}

/** Parse a formatted string value like "124,300" or "47.93%" to a number. */
function parseItemVal(s: string): number {
  if (!s || s === '—' || s === '-') return 0;
  const clean = s.replace(/[$,\s]/g, '').replace(/%$/, '');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

/** Find the first key in `items` that equals `name` or starts with `name ` or `name(`. */
function findItemKeyFlex(items: Record<string, string[]>, name: string): string | undefined {
  if (name in items) return name;
  return Object.keys(items).find(
    (k) => k.startsWith(`${name} `) || k.startsWith(`${name}(`),
  );
}

/** Derive FinancialDataPoint[] and DoiRevenuePoint[] from CompanyStatements.
 *  Uses quarterly periods only; X-axis is "YYQQ" format.
 *  Guidance is always null as it is not available in statement data. */
function deriveFinChartData(statements: CompanyStatements | null): {
  financialIndices: FinancialDataPoint[];
  doiRevenue: DoiRevenuePoint[];
} {
  if (!statements) return { financialIndices: [], doiRevenue: [] };

  const incomeEntry = statements.income;
  const balanceEntry = statements.balance;
  if (incomeEntry?.kind !== 'findata') return { financialIndices: [], doiRevenue: [] };

  const incomeStmt: StatementData = incomeEntry.data;
  const balanceStmt: StatementData | null =
    balanceEntry?.kind === 'findata' ? balanceEntry.data : null;

  // Collect quarterly periods from income statement
  const quarterlyPeriods: { period: string; label: string }[] = [];
  for (const period of incomeStmt.periods) {
    const label = periodToQuarterLabel(period);
    if (label) quarterlyPeriods.push({ period, label });
  }
  if (quarterlyPeriods.length === 0) return { financialIndices: [], doiRevenue: [] };

  const incomeItems = incomeStmt.items;
  const balanceItems = balanceStmt?.items ?? {};

  // Find item keys — flexible lookup handles ($M) vs ($B) unit variants
  const revKey      = findItemKeyFlex(incomeItems, 'Revenue') ??
                      findItemKeyFlex(incomeItems, 'Net Revenue') ??
                      findItemKeyFlex(incomeItems, 'Net Revenues') ??
                      findItemKeyFlex(incomeItems, 'Total Sales');
  const gpKey       = findItemKeyFlex(incomeItems, 'Gross Profit');
  const gmKey       = findItemKeyFlex(incomeItems, 'Gross Margin');
  const omKey       = findItemKeyFlex(incomeItems, 'Operating Margin');
  const niKey       = findItemKeyFlex(incomeItems, 'Net Income');
  const nmKey       = findItemKeyFlex(incomeItems, 'Net Margin');
  const cashKey     = findItemKeyFlex(balanceItems, 'Cash & Cash Equivalents') ??
                      findItemKeyFlex(balanceItems, 'Cash & Equivalents');
  const doiKey      = findItemKeyFlex(balanceItems, 'DOI');

  /** Extract a numeric value for a given item key at a given period label. */
  function getStatementValue(stmtItems: Record<string, string[]>, stmtPeriods: string[], itemKey: string | undefined, period: string): number {
    if (!itemKey) return 0;
    const idx = stmtPeriods.indexOf(period);
    if (idx < 0) return 0;
    return parseItemVal(stmtItems[itemKey]?.[idx] ?? '');
  }

  const balancePeriods = balanceStmt?.periods ?? [];

  const financialIndices: FinancialDataPoint[] = quarterlyPeriods.map(({ period, label }) => ({
    quarter:            label,
    totalRevenue:       getStatementValue(incomeItems, incomeStmt.periods, revKey, period),
    grossProfit:        getStatementValue(incomeItems, incomeStmt.periods, gpKey, period),
    grossMarginPct:     getStatementValue(incomeItems, incomeStmt.periods, gmKey, period),
    operatingMarginPct: getStatementValue(incomeItems, incomeStmt.periods, omKey, period),
    netIncome:          getStatementValue(incomeItems, incomeStmt.periods, niKey, period),
    netMarginPct:       getStatementValue(incomeItems, incomeStmt.periods, nmKey, period),
    cashEquivalents:    balanceStmt ? getStatementValue(balanceItems, balancePeriods, cashKey, period) : 0,
    guidance:           null, // guidance is not present in statement data
  }));

  const doiRevenue: DoiRevenuePoint[] = quarterlyPeriods.map(({ period, label }) => ({
    quarter:  label,
    doi:      balanceStmt ? getStatementValue(balanceItems, balancePeriods, doiKey, period) : 0,
    revenue:  getStatementValue(incomeItems, incomeStmt.periods, revKey, period),
    guidance: null, // guidance is not present in statement data
  }));

  return { financialIndices, doiRevenue };
}

// ── Icons ────────────────────────────────────────────────────────────────────

function ShareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7.2L11.5 3.8M4.5 8.8L11.5 12.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <path d="M13 8A5 5 0 1 1 8 3H11M11 1V5H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <path
        d="M8 2L9.8 5.9L14 6.5L11 9.4L11.6 13.5L8 11.5L4.4 13.5L5 9.4L2 6.5L6.2 5.9L8 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface CompanyProfileContentProps {
  symbol: string;
}

export default function CompanyProfileContent({ symbol }: CompanyProfileContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('FIN. Summary');
  const [activeFinIndex, setActiveFinIndex] = useState<string>('Revenue');
  const [isFavorite, setIsFavorite] = useState(false);
  const [myTags, setMyTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const addTagInputRef = useRef<HTMLInputElement>(null);
  const tagRowRef = useRef<HTMLDivElement>(null);
  const [newsPage, setNewsPage] = useState(1);
  const stockContainerRef = useRef<HTMLDivElement>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = useCallback((dir: 'left' | 'right') => {
    tabsScrollRef.current?.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
  }, []);

  // News filter state
  const [newsKeyword, setNewsKeyword] = useState('');
  const [newsKeywordApplied, setNewsKeywordApplied] = useState('');
  const [newsCategories, setNewsCategories] = useState<Set<string>>(new Set());
  const [newsSources, setNewsSources] = useState<Set<string>>(new Set());
  const [newsPeriodStart, setNewsPeriodStart] = useState('');
  const [newsPeriodEnd, setNewsPeriodEnd] = useState('');

  // Shared financial statement data — loaded once and shared with both
  // FIN. Statement tab and the Financial Indices / DOI & Revenue charts.
  const [companyStatements, setCompanyStatements] = useState<CompanyStatements | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCompanyStatements(null);
    getFinancialStatementByCoCd(symbol).then((result) => {
      if (!cancelled) setCompanyStatements(result);
    });
    return () => { cancelled = true; };
  }, [symbol]);

  // Derive chart data from shared statement data
  const derivedChartData = useMemo(() => deriveFinChartData(companyStatements), [companyStatements]);

  // Parse markdown data
  const profileData = getProfileData();

  // Find company info — fall back to companyMaster data if no profile data
  const companyInfo = profileData.companies.find((c) => c.symbol === symbol);
  const masterCompany = COMPANY_MASTER_LIST.find((c) => c.symbol === symbol);

  const companyName = companyInfo?.name ?? masterCompany?.name ?? symbol;
  const stockExchange = companyInfo?.stockExchange ?? '—';
  const publicTags = companyInfo?.publicTags ?? [];

  // Financial data — only use if explicitly available for this symbol
  const finData = profileData.financialData[symbol] ?? null;

  // Compute visible tabs based on IS_*_ALIVE flags in company master data
  const visibleTabs = useMemo(() => {
    const master = getCompanyByCode(symbol);
    return TABS.filter((tab) => {
      if (!master) return false;
      switch (tab) {
        case 'FIN. Summary':
        case 'FIN. Statement':   return master.IS_FIN_ALIVE === 'Y';
        case 'IR Material':      return master.IS_IR_ALIVE === 'Y';
        case 'News':             return master.IS_NEWS_ALIVE === 'Y';
        case 'IR Transcript':    return master.IS_TRANSCRIPT_ALIVE === 'Y';
        case 'AI Transcript':    return master.IS_AI_TRANSCRIPT_ALIVE === 'Y';
        case 'Pre-Earning Call': return master.IS_PRE_EARNING_CALL === 'Y';
        case 'Investment':       return master.IS_INVEST_ALIVE === 'Y';
        case 'Acquisition':      return master.IS_ACQ_ALIVE === 'Y';
        case 'Funding':          return master.IS_FUND_ALIVE === 'Y';
        case 'Stock':            return master.IS_STOCK_CHART_ALIVE === 'Y';
        default:                 return true;
      }
    });
  }, [symbol]);

  // Load favorites & tags from localStorage
  useEffect(() => {
    try {
      const favs = localStorage.getItem('cp-favorites');
      if (favs) {
        const arr = JSON.parse(favs) as string[];
        setIsFavorite(arr.includes(symbol));
      }
      const tags = localStorage.getItem(`cp-tags-${symbol}`);
      if (tags) {
        setMyTags(JSON.parse(tags) as string[]);
      } else {
        setMyTags(companyInfo?.myTags ?? []);
      }
    } catch {
      setMyTags(companyInfo?.myTags ?? []);
    }
  }, [symbol, companyInfo]);

  // Close suggestion dropdown on outside click
  useEffect(() => {
    if (!showTagInput) return;
    function handleClickOutside(e: MouseEvent) {
      if (tagRowRef.current && !tagRowRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTagInput]);

  // Build suggestion list: seed tags + previously added tags, filtered by current input
  const allSuggestions = useMemo(() => {
    const seed = getSeedTags();
    const local = typeof window !== 'undefined' ? getLocalStorageTags() : [];
    return [...new Set([...seed, ...local])];
  }, []);

  const filteredSuggestions = useMemo(() => {
    const lower = tagInput.toLowerCase();
    return allSuggestions.filter(
      (s) => s.toLowerCase().includes(lower) && !myTags.includes(s),
    );
  }, [tagInput, allSuggestions, myTags]);

  function toggleFavorite() {
    setIsFavorite((prev) => {
      const next = !prev;
      try {
        const stored = localStorage.getItem('cp-favorites');
        const arr: string[] = stored ? JSON.parse(stored) : getFavoritesByUserAcct('demoUser');
        const updated = next ? [...arr.filter((s) => s !== symbol), symbol] : arr.filter((s) => s !== symbol);
        localStorage.setItem('cp-favorites', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function removeTag(tag: string) {
    setMyTags((prev) => {
      const next = prev.filter((t) => t !== tag);
      try {
        localStorage.setItem(`cp-tags-${symbol}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function addTagValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMyTags((prev) => {
      const next = prev.includes(trimmed) ? prev : [...prev, trimmed];
      try {
        localStorage.setItem(`cp-tags-${symbol}`, JSON.stringify(next));
      } catch {}
      return next;
    });
    setTagInput('');
    setShowTagInput(false);
    setShowSuggestions(false);
  }

  function cancelTagInput() {
    setTagInput('');
    setShowTagInput(false);
    setShowSuggestions(false);
  }

  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      addTagValue(tagInput);
    }
    if (e.key === 'Escape') {
      cancelTagInput();
    }
  }

  function handleShowTagInput() {
    setShowTagInput(true);
    setShowSuggestions(true);
    setTimeout(() => addTagInputRef.current?.focus(), 0);
  }

  function handleTagInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTagInput(e.target.value);
    setShowSuggestions(true);
  }

  function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    navigator.clipboard.writeText(url).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {
      // Fallback: select and copy via execCommand for browsers without clipboard API
      try {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch {
        // silent fail if all methods unavailable
      }
    });
  }

  function handleRefresh() {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  function handleKeywordsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setNewsKeywordApplied(newsKeyword);
      setNewsPage(1);
    }
  }

  // News filtered by this company's symbol tag, then by user filters
  const companyNews = useMemo(() =>
    newsItems.filter((n) => n.tags.some((t) => t.symbol === symbol)),
  [symbol, newsItems]);

  // Distinct filter options from all company news
  const distinctCategories = useMemo(() => [...new Set(companyNews.map((n) => n.category))].sort(), [companyNews]);
  const distinctSources = useMemo(() => [...new Set(companyNews.map((n) => n.source))].sort(), [companyNews]);

  const filteredNews = useMemo(() => {
    const keywordLower = newsKeywordApplied.trim().toLowerCase();

    return companyNews.filter((item) => {
      if (keywordLower) {
        const searchable = `${item.title} ${item.content}`.toLowerCase();
        if (!searchable.includes(keywordLower)) return false;
      }
      if (newsCategories.size > 0 && (!item.category || !newsCategories.has(item.category))) return false;
      if (newsSources.size > 0 && !newsSources.has(item.source)) return false;
      if (newsPeriodStart) {
        const d = item.publishedAt;
        if (d < new Date(newsPeriodStart)) return false;
      }
      if (newsPeriodEnd) {
        const d = item.publishedAt;
        const end = new Date(newsPeriodEnd);
        end.setDate(end.getDate() + 1);
        if (d >= end) return false;
      }
      return true;
    });
  }, [companyNews, newsKeywordApplied, newsCategories, newsSources, newsPeriodStart, newsPeriodEnd]);

  const newsTotalPages = Math.ceil(filteredNews.length / NEWS_PAGE_SIZE);
  const pagedNews = filteredNews.slice((newsPage - 1) * NEWS_PAGE_SIZE, newsPage * NEWS_PAGE_SIZE);

  function toggleNewsCategory(cat: string) {
    setNewsCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
    setNewsPage(1);
  }

  function toggleNewsSource(src: string) {
    setNewsSources((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src); else next.add(src);
      return next;
    });
    setNewsPage(1);
  }

  // TradingView widget — inject when Stock tab becomes active
  useEffect(() => {
    if (activeTab !== 'Stock' || !stockContainerRef.current) return;
    const container = stockContainerRef.current;
    container.innerHTML = '';
    const exchangeMap: Record<string, string> = {
      NASDAQ: 'NASDAQ',
      NYSE: 'NYSE',
      TWSE: 'TWSE',
    };
    const exchange = exchangeMap[stockExchange] ?? 'NASDAQ';
    const tvSymbol = `${exchange}:${symbol}`;
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = TV_CONFIG.stockChartSrc;
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'light',
      style: '1',
      locale: 'en',
      withdateranges: true,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      details: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });
    container.appendChild(script);
    return () => {
      container.innerHTML = '';
    };
  }, [activeTab, symbol, stockExchange]);

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad cp-detail-page">

            {/* ── 1.1 Top bar ── */}
            <div className="cp-detail-topbar">
              <div className="cp-detail-topbar-left">
                <Link href="/company-profile" className="cp-back-btn">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back
                </Link>
                <div className="cp-breadcrumb">
                  <span className="cp-breadcrumb-text">Company Overview /</span>
                  <h1 className="cp-company-name">{symbol}</h1>
                  <span className="cp-breadcrumb-subname">{companyName}</span>
                </div>
              </div>

              <div className="cp-detail-topbar-right">
                {/* Top row: Favorite + Action icons */}
                <div className="cp-detail-topbar-right-actions">
                  <button
                    className={`cp-favorite-btn${isFavorite ? ' active' : ''}`}
                    onClick={toggleFavorite}
                    title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <StarIcon filled={isFavorite} />
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </button>

                  {/* Action icons */}
                  <div className="cp-action-icons" aria-live="polite" aria-atomic="true">
                    <div className="cp-share-wrap">
                      <button
                        className="cp-action-icon-btn"
                        title={shareCopied ? 'Copied!' : 'Share — Copy URL'}
                        aria-label={shareCopied ? 'URL copied to clipboard' : 'Share — Copy URL'}
                        onClick={handleShare}
                      >
                        <ShareIcon />
                      </button>
                      {shareCopied && (
                        <span className="cp-share-copied" aria-live="polite">Copied!</span>
                      )}
                    </div>
                    <button
                      className="cp-action-icon-btn"
                      title="Refresh page"
                      onClick={handleRefresh}
                    >
                      <RefreshIcon />
                    </button>
                  </div>
                </div>

                {/* Bottom row: Tags — right-aligned with icons above */}
                <div className="cp-inline-tags">
                  {publicTags.length > 0 && (
                    <div className="cp-tags-group">
                      <span className="cp-tags-group-label">Public Tag</span>
                      <div className="cp-tags-list">
                        {publicTags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/company-profile?tag=${encodeURIComponent(tag)}`}
                            className="cp-tag cp-tag--public cp-tag--link"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="cp-tags-group">
                    <span className="cp-tags-group-label">My Tag</span>
                    <div className="cp-tags-list">
                      {myTags.map((tag) => (
                        <span key={tag} className="cp-tag cp-tag--my">
                          <Link
                            href={`/company-profile?tag=${encodeURIComponent(tag)}`}
                            className="cp-tag-text-link"
                          >
                            {tag}
                          </Link>
                          <button className="cp-tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>×</button>
                        </span>
                      ))}
                      {!showTagInput && (
                        <button className="cp-add-tag-btn" onClick={handleShowTagInput}>
                          + Add Tag
                        </button>
                      )}
                      {showTagInput && (
                        <div className="cp-add-tag-row" ref={tagRowRef}>
                          <div className="cp-add-tag-input-wrap">
                            <input
                              ref={addTagInputRef}
                              className="cp-add-tag-input"
                              placeholder="Enter tag name"
                              value={tagInput}
                              onChange={handleTagInputChange}
                              onFocus={() => setShowSuggestions(true)}
                              onKeyDown={addTag}
                              autoComplete="off"
                            />
                            {showSuggestions && filteredSuggestions.length > 0 && (
                              <div className="cp-tag-suggestions">
                                {filteredSuggestions.slice(0, 8).map((s) => (
                                  <button
                                    key={s}
                                    className="cp-tag-suggestion-item"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      addTagValue(s);
                                    }}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button className="cp-add-tag-submit" onClick={() => addTagValue(tagInput)}>Add</button>
                          <button className="cp-add-tag-cancel" onClick={cancelTagInput}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Current Calendar Quarter card ── */}
            {finData && (
              <div className="cp-quarter-card-row">
                <div className="cp-quarter-card">
                  <div className="cp-quarter-card-title">Current Calendar Quarter</div>
                  <div className="cp-quarter-card-value">{finData.currentCalendarQuarter}</div>
                </div>
              </div>
            )}

            {/* ── Navigation tabs ── */}
            <div className="cp-nav-tabs-wrap">
              <button
                className="cp-nav-tabs-arrow cp-nav-tabs-arrow--left"
                onClick={() => scrollTabs('left')}
                aria-label="Scroll tabs left"
              >
                <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 2L4 7l5 5" />
                </svg>
              </button>
              <div className="cp-nav-tabs" ref={tabsScrollRef}>
                {visibleTabs.map((tab) => (
                  <button
                    key={tab}
                    className={`cp-nav-tab${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                className="cp-nav-tabs-arrow cp-nav-tabs-arrow--right"
                onClick={() => scrollTabs('right')}
                aria-label="Scroll tabs right"
              >
                <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 2l5 5-5 5" />
                </svg>
              </button>
            </div>

            {/* ── Data cards (FIN. Summary tab) ── */}
            {activeTab === 'FIN. Summary' && (
              finData ? (
              <div className="cp-cards-area">
                <div className="cp-cards-main-grid">

                  {/* Column 1: Current Qtr Financial */}
                  <div className="cp-data-card">
                    <div className="cp-card-title">Current Qtr Financial</div>
                    <div className="cp-card-divider" />
                    <div className="cp-fin-metrics">
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">Revenue ({finData.currentQtr.revenueUnit})</div>
                        <div className="cp-fin-metric-value">{finData.currentQtr.revenue.toLocaleString()}</div>
                        <div className="cp-fin-metric-note">Last Quarter: {finData.currentQtr.lastQuarterRevenue.toLocaleString()}</div>
                      </div>
                      <div className="cp-fin-metric-sep" />
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">Revenue QoQ</div>
                        <div className={`cp-fin-metric-value ${finData.currentQtr.revenueQoQ >= 0 ? 'pos' : 'neg'}`}>
                          {finData.currentQtr.revenueQoQ >= 0 ? '+' : ''}{finData.currentQtr.revenueQoQ}%
                        </div>
                      </div>
                      <div className="cp-fin-metric-sep" />
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">Gross Margin</div>
                        <div className="cp-fin-metric-value">
                          {finData.currentQtr.grossMargin}%
                        </div>
                        <div className="cp-fin-metric-note">{finData.currentQtr.grossMarginNote}: {finData.currentQtr.lastQuarterRevenue.toLocaleString()}</div>
                      </div>
                      <div className="cp-fin-metric-sep" />
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">DOI (Days)</div>
                        <div className="cp-fin-metric-value">{finData.currentQtr.doi}</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Next Qtr Key Indices + Revenue Breakdown stacked */}
                  <div className="cp-col-stack">
                    <div className="cp-data-card">
                      <div className="cp-card-title">Next Qtr Key Indices</div>
                      <div className="cp-card-divider" />
                      <div className="cp-fin-metrics">
                        <div className="cp-fin-metric">
                          <div className="cp-fin-metric-label">Revenue Midpoint Guidance</div>
                          <div className="cp-fin-metric-value">{finData.nextQtr.revenueMidpointGuidance.toLocaleString()}</div>
                        </div>
                        <div className="cp-fin-metric-sep" />
                        <div className="cp-fin-metric">
                          <div className="cp-fin-metric-label">Revenue QoQ</div>
                          <div className={`cp-fin-metric-value ${finData.nextQtr.revenueQoQ >= 0 ? 'pos' : 'neg'}`}>
                            {finData.nextQtr.revenueQoQ >= 0 ? '+' : ''}{finData.nextQtr.revenueQoQ}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cp-data-card">
                      <div className="cp-card-title">
                        Revenue Breakdown
                        <span className="cp-card-subtitle">{finData.revenueBreakdown.quarter}</span>
                      </div>
                      <div className="cp-card-divider" />
                      <div className="cp-breakdown-list">
                        {finData.revenueBreakdown.items.map((item) => (
                          <div key={item.name} className="cp-breakdown-item">
                            <div className="cp-breakdown-row">
                              <span className="cp-breakdown-name">{item.name}</span>
                              <span className="cp-breakdown-pct">{item.pct}%</span>
                            </div>
                            <div className="cp-breakdown-bar-wrap">
                              <div className="cp-breakdown-bar" style={{ width: `${Math.min(100, item.pct)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Financial Indices + DOI & Revenue stacked */}
                  <div className="cp-col-stack">
                    <div className="cp-data-card cp-data-card--wide">
                      <div className="cp-card-title">Financial Indices</div>
                      <div className="cp-card-divider" />
                      <div className="cp-fin-index-tabs">
                        {FIN_INDICES.map((idx) => (
                          <button
                            key={idx}
                            className={`cp-fin-index-tab${activeFinIndex === idx ? ' active' : ''}`}
                            onClick={() => setActiveFinIndex(idx)}
                          >
                            {idx}
                          </button>
                        ))}
                      </div>
                      <FinancialIndicesNivoChart
                        data={derivedChartData.financialIndices.length > 0 ? derivedChartData.financialIndices : finData.financialIndices}
                        activeMetric={activeFinIndex}
                      />
                    </div>

                    <div className="cp-data-card cp-data-card--wide2">
                      <div className="cp-card-title">DOI &amp; Revenue</div>
                      <div className="cp-card-divider" />
                      <DoiRevenueNivoChart data={derivedChartData.doiRevenue.length > 0 ? derivedChartData.doiRevenue : finData.doiRevenue} />
                    </div>
                  </div>

                </div>
              </div>
              ) : (
              <div className="cp-tab-placeholder">
                <span className="cp-tab-placeholder-text">
                  Financial data for {symbol} is not yet available.
                </span>
              </div>
              )
            )}

            {/* ── News tab ── */}
            {activeTab === 'News' && (
              <div className="cp-tab-content-box">
                {companyNews.length === 0 ? (
                  <div className="cp-tab-placeholder">
                    <span className="cp-tab-placeholder-text">No news tagged with {symbol}.</span>
                  </div>
                ) : (
                  <>
                    {/* ── News Filter Bar ── */}
                    <div className="cp-news-filter-bar">
                      {/* Keywords */}
                      <div className="cp-news-filter-field">
                        <label className="cp-news-filter-label">Keywords</label>
                        <div className="cp-irt-search-box">
                          <span className="cp-irt-search-icon">
                            <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
                              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                            </svg>
                          </span>
                          <input
                            type="text"
                            className="cp-irt-search-input"
                            placeholder="Search keywords… (Enter)"
                            value={newsKeyword}
                            onChange={(e) => setNewsKeyword(e.target.value)}
                            onKeyDown={handleKeywordsKeyDown}
                          />
                          {newsKeywordApplied && (
                            <button
                              className="cp-irt-search-clear"
                              onClick={() => { setNewsKeyword(''); setNewsKeywordApplied(''); setNewsPage(1); }}
                              title="Clear search"
                              aria-label="Clear keyword"
                            >
                              <svg viewBox="0 0 12 12" fill="none" width="10" height="10">
                                <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* News Category */}
                      <div className="cp-news-filter-field">
                        <label className="cp-news-filter-label">News Category</label>
                        <div className="cp-news-multi-select">
                          <div className="cp-news-multi-select-display">
                            {newsCategories.size === 0 ? (
                              <span className="cp-news-multi-placeholder">All Categories</span>
                            ) : (
                              [...newsCategories].map((c) => (
                                <span key={c} className="cp-news-multi-chip">
                                  {c}
                                  <button onClick={() => toggleNewsCategory(c)} aria-label={`Remove ${c}`}>
                                    <svg viewBox="0 0 10 10" fill="none" width="8" height="8"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                          <div className="cp-news-multi-options">
                            {distinctCategories.map((ft) => (
                              <button
                                key={ft}
                                className={`cp-news-multi-option${newsCategories.has(ft) ? ' active' : ''}`}
                                onClick={() => toggleNewsCategory(ft)}
                              >
                                {newsCategories.has(ft) && (
                                  <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ marginRight: 4 }}>
                                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                                {ft}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* News Source */}
                      <div className="cp-news-filter-field">
                        <label className="cp-news-filter-label">News Source</label>
                        <div className="cp-news-multi-select">
                          <div className="cp-news-multi-select-display">
                            {newsSources.size === 0 ? (
                              <span className="cp-news-multi-placeholder">All Sources</span>
                            ) : (
                              [...newsSources].map((s) => (
                                <span key={s} className="cp-news-multi-chip">
                                  {s}
                                  <button onClick={() => toggleNewsSource(s)} aria-label={`Remove ${s}`}>
                                    <svg viewBox="0 0 10 10" fill="none" width="8" height="8"><path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                                  </button>
                                </span>
                              ))
                            )}
                          </div>
                          <div className="cp-news-multi-options">
                            {distinctSources.map((src) => (
                              <button
                                key={src}
                                className={`cp-news-multi-option${newsSources.has(src) ? ' active' : ''}`}
                                onClick={() => toggleNewsSource(src)}
                              >
                                {newsSources.has(src) && (
                                  <svg viewBox="0 0 12 12" fill="none" width="10" height="10" style={{ marginRight: 4 }}>
                                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                                {src}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Period */}
                      <div className="cp-news-filter-field">
                        <label className="cp-news-filter-label">Period</label>
                        <div className="cp-news-period-wrap">
                          <DatePickerInput
                            value={newsPeriodStart}
                            onChange={setNewsPeriodStart}
                            placeholder="Start date"
                            onPageReset={() => setNewsPage(1)}
                          />
                          <span className="cp-news-period-sep">–</span>
                          <DatePickerInput
                            value={newsPeriodEnd}
                            onChange={setNewsPeriodEnd}
                            placeholder="End date"
                            onPageReset={() => setNewsPage(1)}
                          />
                        </div>
                      </div>
                    </div>

                    {filteredNews.length === 0 ? (
                      <div className="cp-tab-placeholder">
                        <span className="cp-tab-placeholder-text">No news matches the current filters.</span>
                      </div>
                    ) : (
                      <>
                        <div className="cp-news-tab-grid">
                          {pagedNews.map((item) => {
                            const ago = Math.round((Date.now() - item.publishedAt.getTime()) / 3_600_000);
                            const timeLabel = ago < 24 ? `${ago}h ago` : `${Math.floor(ago / 24)}d ago`;
                            const categoryLabel = NEWS_CATEGORY_LABEL_MAP[item.category] ?? item.category;
                            return (
                              <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cp-news-tab-card"
                              >
                                <div className="cp-news-tab-card-header">
                                  <div className="cp-news-tab-source-wrap">
                                    <span className="cp-news-tab-source">{item.source}</span>
                                  </div>
                                  <span className="cp-news-tab-time">{timeLabel}</span>
                                </div>
                                <p className="cp-news-tab-title">{item.title}</p>
                                <p className="cp-news-tab-content">{item.content}</p>
                                <span className={`cp-news-tab-inline-cat cp-news-tab-inline-cat--${item.category}`}>{categoryLabel}</span>
                              </a>
                            );
                          })}
                        </div>
                        {newsTotalPages > 1 && (
                          <div className="cp-news-tab-pagination">
                            <button
                              className="cp-news-tab-page-btn"
                              disabled={newsPage === 1}
                              onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                            >
                              ‹ Prev
                            </button>
                            {getPaginationRange(newsPage - 1, newsTotalPages).map((item) =>
                              typeof item === 'string' ? (
                                <span key={item} className="cp-news-tab-page-ellipsis">…</span>
                              ) : (
                                <button
                                  key={item}
                                  className={`cp-news-tab-page-btn${newsPage === item + 1 ? ' active' : ''}`}
                                  onClick={() => setNewsPage(item + 1)}
                                >
                                  {item + 1}
                                </button>
                              )
                            )}
                            <button
                              className="cp-news-tab-page-btn"
                              disabled={newsPage === newsTotalPages}
                              onClick={() => setNewsPage((p) => Math.min(newsTotalPages, p + 1))}
                            >
                              Next ›
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Stock tab ── */}
            {activeTab === 'Stock' && (
              <div className="cp-tab-content-box cp-stock-tab">
                <div
                  ref={stockContainerRef}
                  className="tradingview-widget-container cp-stock-widget"
                />
              </div>
            )}

            {/* ── FIN. Statement tab ── */}
            {activeTab === 'FIN. Statement' && <FinancialStatementTab symbol={symbol} companyStatements={companyStatements} />}

            {/* ── IR Material tab ── */}
            {activeTab === 'IR Material' && <IRMaterialTab symbol={symbol} />}

            {/* ── Investment tab (renamed from M&A) ── */}
            {activeTab === 'Investment' && <InvestmentTab symbol={symbol} />}

            {/* ── Acquisition tab ── */}
            {activeTab === 'Acquisition' && <AcquisitionTab symbol={symbol} />}

            {/* ── Funding tab ── */}
            {activeTab === 'Funding' && <FundingTab symbol={symbol} />}

            {/* ── IR Transcript tab ── */}
            {activeTab === 'IR Transcript' && <IRTranscriptTab symbol={symbol} />}

            {/* ── AI Transcript tab ── */}
            {activeTab === 'AI Transcript' && <AITranscriptTab symbol={symbol} companyName={companyName} />}

            {/* ── Pre-Earning Call tab ── */}
            {activeTab === 'Pre-Earning Call' && <PreEarningCallTab symbol={symbol} companyName={companyName} />}

          </div>
        </main>
      </div>
    </>
  );
}
