'use client';

import { Fragment, useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { COMPANY_MASTER_LIST, getCompanyByCode } from '@/app/data/companyMaster';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useMobileSidebar, MOBILE_BREAKPOINT } from '@/app/contexts/MobileSidebarContext';
import { BASE_PATH } from '@/app/lib/basePath';
import ThemeToggleButton from '@/app/components/ThemeToggleButton';
import { getStatement } from '@/app/data/financialData';
import finSummaryConfig from '@/app/data/fin-summary-config.json';
import { getFinIdxCardData } from '@/app/lib/watchlistApi';
import type { WatchlistDataItem } from '@/app/lib/watchlistApi';
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/app/lib/notificationApi';
import type { NotificationSettings } from '@/app/lib/notificationApi';
import { getElshResult, type SearchResultItem } from '@/app/data/searchMockData';

const SearchFinancialIndicesChart = dynamic(
  () => import('@/app/company-profile/[symbol]/InvestmentNivoCharts').then((m) => m.FinancialIndicesNivoChart),
  { ssr: false, loading: () => <div style={{ height: 200, background: 'var(--c-bg)', borderRadius: 6 }} /> },
);

const POPULAR_SEARCHES = ['TC', 'AAPL', 'NVDA'];

// Pre-computed lowercase SP500 companies for faster filtering
const COMPANY_MASTER_LC = COMPANY_MASTER_LIST.map((c) => ({
  ...c,
  symbolLc: c.symbol.toLowerCase(),
  nameLc: c.name.toLowerCase(),
  isFinAlive: getCompanyByCode(c.symbol)?.IS_FIN_ALIVE === 'Y',
}));

interface SearchCompanyOption {
  symbol: string;
  name: string;
  isFinAlive: boolean;
}

// ── Financial Indices chart helpers ─────────────────────────────────────────

const FIN_INDICES = [
  'Revenue',
  'Gross Profit',
  'Gross Margin',
  'Operating Margin',
  'Net Income',
  'Net Margin',
  'Cash & Cash Equivalents',
] as const;

type FinIndexName = typeof FIN_INDICES[number];

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

/** Parse a formatted value string (e.g. "124,300" or "47.93%") to a number. */
function parseItemValSearch(s: string): number {
  if (!s || s === '—' || s === '-') return 0;
  const clean = s.replace(/[$,\s]/g, '').replace(/%$/, '');
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

/** Parse a year range like "2023~2026" or "2023-2026" from the query. */
function parseYearRange(q: string): { startYear: number; endYear: number } | null {
  const m = q.match(/\b(20\d{2})\s*[~-]\s*(20\d{2})\b/);
  if (!m) return null;
  const startYear = parseInt(m[1]);
  const endYear = parseInt(m[2]);
  if (startYear > endYear) return null;
  return { startYear, endYear };
}

type FinSummaryConfigEntry = { index: string; rpt_fin_type: string; rpt_fin_item: string };

/** Derive FinancialDataPoint[] for a company from static statement data, filtered by year range.
 *  Synthesises missing quarters from annual totals (÷4) so the chart always has data.
 *  Ensures at least 20 quarters (5 years) by extending the effective start year if needed.
 */
function deriveSearchFinIndicesData(
  symbol: string,
  startYear: number,
  endYear: number,
): FinancialDataPoint[] {
  const incomeStmt = getStatement('income')[symbol];
  const balanceStmt = getStatement('balance')[symbol];
  if (!incomeStmt) return [];

  const fiCfg = finSummaryConfig.financialIndices as FinSummaryConfigEntry[];

  function findKey(
    items: Record<string, string[]>,
    indexName: string,
    type: 'income' | 'balance',
  ): string | undefined {
    const entry = fiCfg.find((e) => e.index === indexName && e.rpt_fin_type === type);
    if (!entry) return undefined;
    return entry.rpt_fin_item in items ? entry.rpt_fin_item : undefined;
  }

  const incomeItems = incomeStmt.items;
  const balanceItems = balanceStmt?.items ?? {};
  const balancePeriods = balanceStmt?.periods ?? [];

  const revKey  = findKey(incomeItems, 'Revenue',                  'income');
  const gpKey   = findKey(incomeItems, 'Gross Profit',             'income');
  const gmKey   = findKey(incomeItems, 'Gross Margin',             'income');
  const omKey   = findKey(incomeItems, 'Operating Margin',         'income');
  const niKey   = findKey(incomeItems, 'Net Income',               'income');
  const nmKey   = findKey(incomeItems, 'Net Margin',               'income');
  const cashKey = findKey(balanceItems, 'Cash & Cash Equivalents', 'balance');

  function getVal(
    items: Record<string, string[]>,
    periods: string[],
    key: string | undefined,
    period: string,
  ): number {
    if (!key) return 0;
    const idx = periods.indexOf(period);
    if (idx < 0) return 0;
    return parseItemValSearch(items[key]?.[idx] ?? '');
  }

  // --- Build a map of actual quarterly data: "YYYY-Qn" → FinancialDataPoint
  const quarterlyMap = new Map<string, FinancialDataPoint>();
  for (const period of incomeStmt.periods) {
    const mq = period.match(/^(Q[1-4])\s+(\d{4})$/);
    if (!mq) continue;
    const year = parseInt(mq[2]);
    const q = mq[1];
    const yy = mq[2].slice(2);
    quarterlyMap.set(`${year}-${q}`, {
      quarter:            `${yy}${q}`,
      totalRevenue:       getVal(incomeItems, incomeStmt.periods, revKey,  period),
      grossProfit:        getVal(incomeItems, incomeStmt.periods, gpKey,   period),
      grossMarginPct:     getVal(incomeItems, incomeStmt.periods, gmKey,   period),
      operatingMarginPct: getVal(incomeItems, incomeStmt.periods, omKey,   period),
      netIncome:          getVal(incomeItems, incomeStmt.periods, niKey,   period),
      netMarginPct:       getVal(incomeItems, incomeStmt.periods, nmKey,   period),
      cashEquivalents:    balanceStmt ? getVal(balanceItems, balancePeriods, cashKey, period) : 0,
      guidance:           null,
    });
  }

  // --- Build a map of annual data: year → values (income items ÷ 4; margin/% kept as-is)
  type AnnualVals = { rev: number; gp: number; gm: number; om: number; ni: number; nm: number; cash: number };
  const annualMap = new Map<number, AnnualVals>();
  for (const period of incomeStmt.periods) {
    const ma = period.match(/^CY(\d{4})$/);
    if (!ma) continue;
    const year = parseInt(ma[1]);
    const bPeriod = `CY${year}`; // balance sheet uses the same label
    annualMap.set(year, {
      rev:  getVal(incomeItems, incomeStmt.periods, revKey, period),
      gp:   getVal(incomeItems, incomeStmt.periods, gpKey,  period),
      gm:   getVal(incomeItems, incomeStmt.periods, gmKey,  period),
      om:   getVal(incomeItems, incomeStmt.periods, omKey,  period),
      ni:   getVal(incomeItems, incomeStmt.periods, niKey,  period),
      nm:   getVal(incomeItems, incomeStmt.periods, nmKey,  period),
      cash: balanceStmt ? getVal(balanceItems, balancePeriods, cashKey, bPeriod) : 0,
    });
  }

  // Generate one FinancialDataPoint per quarter in the requested range
  const result: FinancialDataPoint[] = [];
  for (let y = startYear; y <= endYear; y++) {
    for (let qi = 1; qi <= 4; qi++) {
      const q = `Q${qi}` as const;
      const key = `${y}-${q}`;
      const yy = String(y).slice(2);

      if (quarterlyMap.has(key)) {
        result.push(quarterlyMap.get(key)!);
      } else {
        // Synthesise from annual data: flow items ÷4, margin % kept as-is
        const ann = annualMap.get(y);
        result.push({
          quarter:            `${yy}${q}`,
          totalRevenue:       ann ? ann.rev / 4 : 0,
          grossProfit:        ann ? ann.gp  / 4 : 0,
          grossMarginPct:     ann ? ann.gm       : 0,
          operatingMarginPct: ann ? ann.om       : 0,
          netIncome:          ann ? ann.ni  / 4 : 0,
          netMarginPct:       ann ? ann.nm       : 0,
          cashEquivalents:    ann ? ann.cash     : 0,
          guidance:           null,
        });
      }
    }
  }
  return result;
}

// ── FinCard type (for pinned cards) ─────────────────────────────────────────

export interface FinCard {
  id: string;
  symbol: string;
  companyName: string;
  item: string;
  period: string;
  value: string;
}

// ── PinIcon ──────────────────────────────────────────────────────────────────

function PinIcon({ pinned }: { pinned: boolean }) {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      {/* Thumbtack (圖釘): flat disc head + pin shaft */}
      <circle cx="7" cy="4.5" r="3" stroke="currentColor" strokeWidth="1.3" fill={pinned ? 'currentColor' : 'none'} fillOpacity={pinned ? 0.25 : 0} />
      <line x1="7" y1="7.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

// ── FinIdxIcon — financial index button icon ─────────────────────────────────

function FinIdxIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      {/* Bar chart bars */}
      <rect x="1" y="8" width="2.5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="5.75" y="5" width="2.5" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <rect x="10.5" y="2" width="2.5" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      {/* Trend line */}
      <path d="M2.25 7.5 L7 4 L12.75 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── FinCardItem ──────────────────────────────────────────────────────────────

/** Determine CSS class for a financial value string. */
function getFinValueClass(value: string): string {
  const rawNum = value.replace(/[,\s]/g, '');
  const isNeg = rawNum.startsWith('-');
  const isPos = !isNeg && /^[+]?\d/.test(rawNum) && rawNum !== '0' && rawNum !== '—';
  return isNeg
    ? 'search-fin-card-value search-fin-card-value--neg'
    : isPos
    ? 'search-fin-card-value search-fin-card-value--pos'
    : 'search-fin-card-value';
}

interface FinCardItemProps {
  card: FinCard;
  pinned: boolean;
  onPin: (card: FinCard) => void;
  onUnpin: (id: string) => void;
  onNavigate: (symbol: string) => void;
}

function FinCardItem({ card, pinned, onPin, onUnpin, onNavigate }: FinCardItemProps) {
  const valueClass = getFinValueClass(card.value);

  return (
    <div className={`search-fin-card${pinned ? ' search-fin-card--pinned' : ''}`}>
      {/* Clickable card body — navigates to company profile */}
      <button
        className="search-fin-card-body"
        onMouseDown={(e) => { e.preventDefault(); onNavigate(card.symbol); }}
        title={`Go to ${card.companyName} profile`}
      >
        {/* Top: period badge aligned right */}
        <div className="search-fin-card-top">
          <span className="search-fin-card-period">{card.period}</span>
        </div>

        {/* FIN item name */}
        <div className="search-fin-card-item">{card.item}</div>

        {/* Center: value — most prominent element */}
        <div className={valueClass}>{card.value}</div>

        {/* Bottom: company tag — styled like news-tag, links to company profile */}
        <div className="search-fin-card-company">
          <span className="news-tag search-fin-card-symbol">{card.symbol}</span>
        </div>
      </button>

      {/* Pin button — absolute bottom-right overlay */}
      <button
        className={`search-fin-card-pin${pinned ? ' search-fin-card-pin--active' : ''}`}
        onMouseDown={(e) => {
          e.preventDefault();
          if (pinned) onUnpin(card.id);
          else onPin(card);
        }}
        title={pinned ? 'Unpin' : 'Pin to search bar'}
        aria-label={pinned ? 'Unpin card' : 'Pin card'}
      >
        <PinIcon pinned={pinned} />
      </button>
    </div>
  );
}

// ── EventNewsCard ────────────────────────────────────────────────────────────

type SearchTabType = 'all' | 'company' | 'event' | 'news';

interface EventNewsCardProps {
  item: SearchResultItem;
  lang: 'zh' | 'en';
  query: string;
}

// Matches protocol-less domain strings that start with dot-separated host labels
// (e.g. "example.com", "investor.apple.com/path", "a.b.co?x=1", "foo.bar#section").
const DOMAIN_LIKE_URL_PATTERN = /^[^/\s?#]+\.[^/\s?#]+(?:[/?#]|$)/;

function normalizeSearchResultUrl(url: string): string {
  const value = url.trim();
  if (!value) return '#';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (DOMAIN_LIKE_URL_PATTERN.test(value)) return `https://${value}`;
  return value;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function renderHighlightedText(text: string, query: string): ReactNode {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.toLowerCase());

  if (terms.length === 0) return text;

  const uniqueTerms = Array.from(new Set(terms)).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`(${uniqueTerms.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    const isMatch = uniqueTerms.includes(part.toLowerCase());
    return isMatch
      ? <mark key={index} className="search-result-highlight">{part}</mark>
      : <Fragment key={index}>{part}</Fragment>;
  });
}

function EventNewsCard({ item, lang, query }: EventNewsCardProps) {
  const dateStr = item.datetime
    ? new Date(item.datetime).toLocaleDateString(
        lang === 'en' ? 'en-US' : 'zh-TW',
        { year: 'numeric', month: 'short', day: 'numeric' },
      )
    : '';

  return (
    <a
      className="search-result-card"
      href={normalizeSearchResultUrl(item.url)}
      target="_blank"
      rel="noopener noreferrer"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="search-result-card-title">{renderHighlightedText(item.title, query)}</div>
      <div className="search-result-card-meta">
        {item.company_short_name && (
          <span className="news-tag search-result-card-tag">
            {renderHighlightedText(item.company_short_name, query)}
          </span>
        )}
        {item.category && (
          <span className="search-result-card-category">
            {renderHighlightedText(item.category, query)}
          </span>
        )}
        {dateStr && (
          <span className="search-result-card-date">{dateStr}</span>
        )}
      </div>
    </a>
  );
}

interface UserInfo {
  name: string;
  avatar: string;
}

const PINNED_CARDS_KEY = 'topnav-pinned-fin-cards';

export default function TopNav() {
  const router = useRouter();
  const { lang, toggleLang } = useLanguage();
  const { toggleSidebar, toggleDesktopCollapsed } = useMobileSidebar();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const base = process.env.NODE_ENV === 'production' ? '/lego' : '';
    fetch(`${base}/user-info.json`)
      .then((res) => res.json())
      .then((data: UserInfo) => setUserInfo(data))
      .catch(() => {/* keep null on error */});
  }, []);

  const handleMenuToggle = () => {
    // window.innerWidth reflects the current viewport at click time
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      toggleSidebar();
    } else {
      toggleDesktopCollapsed();
    }
  };
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [searchTab, setSearchTab] = useState<SearchTabType>('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const wrapRef = useRef<HTMLDivElement>(null);

  // Pinned financial cards — persisted in localStorage
  const [pinnedCards, setPinnedCards] = useState<FinCard[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PINNED_CARDS_KEY);
      if (stored) setPinnedCards(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const handlePin = useCallback((card: FinCard) => {
    setPinnedCards((prev) => {
      if (prev.some((c) => c.id === card.id)) return prev;
      const next = [...prev, card];
      try { localStorage.setItem(PINNED_CARDS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const handleUnpin = useCallback((id: string) => {
    setPinnedCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      try { localStorage.setItem(PINNED_CARDS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Notification panel state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifSettingsView, setNotifSettingsView] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>({
    notification: false,
    email: true,
    eventBooking: true,
  });
  const [notifSettingsLoading, setNotifSettingsLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleNotifToggle = useCallback(() => {
    setNotifOpen((prev) => {
      if (prev) {
        setNotifSettingsView(false);
        return false;
      }
      // Fetch current settings from API when opening the panel
      setNotifSettingsLoading(true);
      getNotificationSettings()
        .then((settings) => setNotifSettings(settings))
        .catch((err) => { console.error('Failed to fetch notification settings:', err); })
        .finally(() => setNotifSettingsLoading(false));
      return true;
    });
  }, []);

  const handleNotifSettingToggle = useCallback((key: keyof NotificationSettings) => {
    setNotifSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      updateNotificationSettings(next).catch((err) => { console.error('Failed to update notification settings:', err); });
      return next;
    });
  }, []);

  const [mockResults, setMockResults] = useState<SearchResultItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setMockResults([]);
      return () => {
        cancelled = true;
      };
    }

    getElshResult(trimmedQuery)
      .then((results) => {
        if (!cancelled) setMockResults(results);
      })
      .catch(() => {
        if (!cancelled) setMockResults([]);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const q = query.trim().toLowerCase();
  const showDropdown = focused && (q.length > 0 || pinnedCards.length > 0);

  // Filter company master by query (fallback when API has no company docs)
  const filteredMasterCompanies: SearchCompanyOption[] =
    q.length > 0
      ? COMPANY_MASTER_LC.filter((c) => c.symbolLc.includes(q) || c.nameLc.includes(q))
          .slice(0, 8)
          .map((c) => ({
            symbol: c.symbol,
            name: c.name,
            isFinAlive: c.isFinAlive,
          }))
      : [];

  const apiCompanies = useMemo<SearchCompanyOption[]>(() => {
    if (q.length === 0) return [];
    const unique = new Map<string, SearchCompanyOption>();

    mockResults
      .filter((r) => r.doc_type === 'company')
      .forEach((r) => {
        const symbol = (r.co_cd ?? '').trim().toUpperCase();
        if (!symbol) return;
        if (unique.has(symbol)) return;
        const name = (r.company_name || r.company_short_name || symbol).trim();
        const isFinAlive = getCompanyByCode(symbol)?.IS_FIN_ALIVE === 'Y';
        unique.set(symbol, { symbol, name, isFinAlive });
      });

    return Array.from(unique.values()).slice(0, 8);
  }, [mockResults, q]);

  // Prefer API "company" docs; fallback to company master only when API has no company results.
  const filteredCompanies = apiCompanies.length > 0 ? apiCompanies : filteredMasterCompanies;

  // Financial Indices chart result — shown when query contains company name/symbol + year range
  const finIndicesResult = useMemo(() => {
    if (q.length < 6) return null;
    const yearRange = parseYearRange(q);
    if (!yearRange) return null;

    // Find matched company
    const matchedCompany = COMPANY_MASTER_LC.find((c) =>
      q.includes(c.symbolLc) ||
      c.nameLc.split(' ').some((w) => w.length >= 3 && q.includes(w)),
    );
    if (!matchedCompany) return null;

    const data = deriveSearchFinIndicesData(matchedCompany.symbol, yearRange.startYear, yearRange.endYear);
    if (data.length === 0) return null;

    return {
      symbol: matchedCompany.symbol,
      companyName: matchedCompany.name,
      data,
      yearRange,
    };
  }, [q]);

  // Active tab for the Financial Indices chart in search dropdown
  const [searchFinIndexTab, setSearchFinIndexTab] = useState<FinIndexName>('Revenue');

  // Reset the active tab to 'Revenue' whenever a new chart result appears
  useEffect(() => {
    if (finIndicesResult) {
      setSearchFinIndexTab('Revenue');
    }
  }, [finIndicesResult?.symbol, finIndicesResult?.yearRange]);

  const pinnedIds = useMemo(() => new Set(pinnedCards.map((c) => c.id)), [pinnedCards]);

  // Expanded fin-idx panel state: tracks which company symbol has the panel open
  const [expandedFinIdxSymbol, setExpandedFinIdxSymbol] = useState<string | null>(null);
  // Cached fin-idx card data keyed by symbol
  const [finIdxDataMap, setFinIdxDataMap] = useState<Record<string, WatchlistDataItem[]>>({});

  const handleFinIdxToggle = useCallback((symbol: string) => {
    // Fetch data outside the setState callback to avoid stale closure issues
    setFinIdxDataMap((m) => {
      if (m[symbol]) return m;
      const data = getFinIdxCardData({ co_cd: symbol });
      return { ...m, [symbol]: data };
    });
    setExpandedFinIdxSymbol((prev) => (prev === symbol ? null : symbol));
  }, []);

  const mockEvents = useMemo(
    () =>
      mockResults
        .filter((r) => r.doc_type === 'event')
        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()),
    [mockResults],
  );
  const mockNews = useMemo(
    () =>
      mockResults
        .filter((r) => r.doc_type === 'news')
        .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime()),
    [mockResults],
  );

  // Debounce query for "See all results" button
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset search tab when query is cleared
  useEffect(() => {
    if (!query.trim()) setSearchTab('all');
  }, [query]);

  // Navigate to company profile page
  function navigateToCompany(symbol: string) {
    setFocused(false);
    setQuery('');
    router.push(`/company-profile/${symbol}/`);
  }

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close notification panel when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  // Tab labels
  const tabLabels: Record<SearchTabType, { zh: string; en: string }> = {
    all:     { zh: '全部',  en: 'All'     },
    company: { zh: '公司',  en: 'Company' },
    event:   { zh: '活動',  en: 'Event'   },
    news:    { zh: '新聞',  en: 'News'    },
  };

  // Reusable company list JSX — used in both "Company" tab and "All" tab
  function renderCompanyList(companies: SearchCompanyOption[], searchQuery: string) {
    if (companies.length === 0) return null;
    return (
      <ul className="search-popular-list">
        {companies.map((company) => (
          <li key={company.symbol}>
            <div className="search-popular-item-wrap">
              <button
                className="search-popular-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  navigateToCompany(company.symbol);
                }}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                  <rect x="1.5" y="2" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M4 5h5M4 7.5h3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                </svg>
                <strong>{renderHighlightedText(company.symbol, searchQuery)}</strong>
                &nbsp;{renderHighlightedText(company.name, searchQuery)}
              </button>
              {company.isFinAlive && (
                <button
                  className={`search-fin-idx-btn${expandedFinIdxSymbol === company.symbol ? ' active' : ''}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleFinIdxToggle(company.symbol);
                  }}
                  title={lang === 'zh' ? '財務指標' : 'Financial Index'}
                  aria-label={lang === 'zh' ? '展開財務指標' : 'Expand financial index'}
                >
                  <FinIdxIcon />
                </button>
              )}
            </div>
            {/* Expandable fin-idx card panel */}
            {company.isFinAlive && expandedFinIdxSymbol === company.symbol && (
              <div className="search-fin-idx-panel">
                <div className="search-fin-idx-cards">
                  {(finIdxDataMap[company.symbol] ?? []).map((item) => {
                    const rawVal = String(item.fld_val ?? '—');
                    const yrQtr = item.calendar_year && item.fiscal_quarter
                      ? `${item.calendar_year} ${item.fiscal_quarter}`
                      : null;
                    return (
                      <div key={item.rpt_fin_item} className="search-fin-card">
                        <div className="search-fin-card-body search-fin-card-body--no-pin" style={{ cursor: 'default' }}>
                          <div className="search-fin-card-item">{item.rpt_fin_item}</div>
                          <div className={getFinValueClass(rawVal)}>{rawVal}</div>
                          {yrQtr && (
                            <div className="search-fin-idx-yr-tag">{yrQtr}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="search-fin-idx-panel-footer">
                  <a
                    className="search-fin-idx-more-btn"
                    href={`/lego/company-profile/${company.symbol}/?tab=FIN.+Statement`}
                    onMouseDown={(e) => { e.stopPropagation(); }}
                    onClick={(e) => {
                      e.preventDefault();
                      setFocused(false);
                      setQuery('');
                      router.push(`/company-profile/${company.symbol}/?tab=FIN.+Statement`);
                    }}
                  >
                    {lang === 'zh' ? '更多資訊' : 'More Information'}
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                      <path d="M2.5 5.5h6M6 3l2.5 2.5L6 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <header className="topnav">
      {/* Menu toggle button — collapses sidebar on desktop, opens drawer on mobile */}
      <button
        className="topnav-hamburger"
        onClick={handleMenuToggle}
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      <Link href="/about" className="topnav-logo" aria-label="Go to About tMIC">
        tM<span className="logo-i">I</span>C
      </Link>

      <div className="topnav-search-wrap" ref={wrapRef}>
        <svg
          className="topnav-search-icon"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className={`topnav-search${focused ? ' focused' : ''}`}
          type="text"
          placeholder="Search company or ticker… (e.g. Apple 2023-2026)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          autoComplete="off"
        />

        {showDropdown && (
          <div className="search-dropdown">
            {/* Pinned financial cards — shown only when no query */}
            {pinnedCards.length > 0 && q.length === 0 && (
              <div className="search-dropdown-section search-dropdown-section--pinned">
                <div className="search-dropdown-section-label">
                  <PinIcon pinned={true} />
                  <span>{lang === 'zh' ? '已釘選' : 'Pinned'}</span>
                </div>
                <div className="search-fin-cards">
                  {pinnedCards.map((card) => (
                    <FinCardItem
                      key={card.id}
                      card={card}
                      pinned={true}
                      onPin={handlePin}
                      onUnpin={handleUnpin}
                      onNavigate={navigateToCompany}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Tabbed search results — shown when user has typed a query */}
            {q.length > 0 && (
              <>
                {/* Tab navigation */}
                <div className="search-tabs">
                  {(['all', 'company', 'event', 'news'] as SearchTabType[]).map((tab) => (
                    <button
                      key={tab}
                      className={`search-tab${searchTab === tab ? ' active' : ''}`}
                      onMouseDown={(e) => { e.preventDefault(); setSearchTab(tab); }}
                    >
                      {tabLabels[tab][lang]}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="search-tab-content">

                  {/* ── ALL TAB ── */}
                  {searchTab === 'all' && (
                    <>
                      {/* Company section */}
                      {filteredCompanies.length > 0 && (
                        <div className="search-dropdown-section">
                          <div className="search-dropdown-section-label">
                            {tabLabels.company[lang]}
                          </div>
                          {renderCompanyList(filteredCompanies.slice(0, 3), query)}
                        </div>
                      )}

                      {/* Event section */}
                      {mockEvents.length > 0 && (
                        <div className="search-dropdown-section">
                          <div className="search-dropdown-section-label">
                            {tabLabels.event[lang]}
                          </div>
                          <div className="search-result-cards">
                            {mockEvents.slice(0, 3).map((item) => (
                              <EventNewsCard key={item.id} item={item} lang={lang} query={query} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* News section */}
                      {mockNews.length > 0 && (
                        <div className="search-dropdown-section">
                          <div className="search-dropdown-section-label">
                            {tabLabels.news[lang]}
                          </div>
                          <div className="search-result-cards">
                            {mockNews.slice(0, 3).map((item) => (
                              <EventNewsCard key={item.id} item={item} lang={lang} query={query} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Financial Indices chart */}
                      {finIndicesResult && (
                        <div className="search-dropdown-section">
                          <div className="search-dropdown-section-label">Financial Indices</div>
                          <div className="search-indices-card">
                            <div className="search-indices-card-header">
                              <span className="news-tag search-fin-card-symbol">{finIndicesResult.symbol}</span>
                              <span className="search-indices-card-range">
                                {finIndicesResult.yearRange.startYear}–{finIndicesResult.yearRange.endYear}
                              </span>
                            </div>
                            <div className="cp-fin-index-tabs">
                              {FIN_INDICES.map((idx) => (
                                <button
                                  key={idx}
                                  className={`cp-fin-index-tab${searchFinIndexTab === idx ? ' active' : ''}`}
                                  onMouseDown={(e) => { e.preventDefault(); setSearchFinIndexTab(idx); }}
                                >
                                  {idx}
                                </button>
                              ))}
                            </div>
                            <SearchFinancialIndicesChart
                              data={finIndicesResult.data}
                              activeMetric={searchFinIndexTab}
                            />
                          </div>
                        </div>
                      )}

                      {/* No results */}
                      {filteredCompanies.length === 0 && mockEvents.length === 0 && mockNews.length === 0 && !finIndicesResult && (
                        <div className="search-dropdown-section">
                          <div className="search-result-empty">
                            {lang === 'zh' ? '找不到相關結果' : 'No results found'}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── COMPANY TAB ── */}
                  {searchTab === 'company' && (
                    <div className="search-dropdown-section">
                      {filteredCompanies.length > 0
                        ? renderCompanyList(filteredCompanies, query)
                        : (
                          <div className="search-result-empty">
                            {lang === 'zh' ? '找不到相關公司' : 'No companies found'}
                          </div>
                        )}
                      {/* Financial Indices chart in Company tab */}
                      {finIndicesResult && (
                        <div style={{ marginTop: 10 }}>
                          <div className="search-dropdown-section-label" style={{ marginBottom: 8 }}>
                            Financial Indices
                          </div>
                          <div className="search-indices-card">
                            <div className="search-indices-card-header">
                              <span className="news-tag search-fin-card-symbol">{finIndicesResult.symbol}</span>
                              <span className="search-indices-card-range">
                                {finIndicesResult.yearRange.startYear}–{finIndicesResult.yearRange.endYear}
                              </span>
                            </div>
                            <div className="cp-fin-index-tabs">
                              {FIN_INDICES.map((idx) => (
                                <button
                                  key={idx}
                                  className={`cp-fin-index-tab${searchFinIndexTab === idx ? ' active' : ''}`}
                                  onMouseDown={(e) => { e.preventDefault(); setSearchFinIndexTab(idx); }}
                                >
                                  {idx}
                                </button>
                              ))}
                            </div>
                            <SearchFinancialIndicesChart
                              data={finIndicesResult.data}
                              activeMetric={searchFinIndexTab}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── EVENT TAB ── */}
                  {searchTab === 'event' && (
                    <div className="search-dropdown-section">
                      {mockEvents.length > 0
                        ? (
                          <div className="search-result-cards">
                            {mockEvents.map((item) => (
                              <EventNewsCard key={item.id} item={item} lang={lang} query={query} />
                            ))}
                          </div>
                        )
                        : (
                          <div className="search-result-empty">
                            {lang === 'zh' ? '找不到相關活動' : 'No events found'}
                          </div>
                        )}
                    </div>
                  )}

                  {/* ── NEWS TAB ── */}
                  {searchTab === 'news' && (
                    <div className="search-dropdown-section">
                      {mockNews.length > 0
                        ? (
                          <div className="search-result-cards">
                            {mockNews.map((item) => (
                              <EventNewsCard key={item.id} item={item} lang={lang} query={query} />
                            ))}
                          </div>
                        )
                        : (
                          <div className="search-result-empty">
                            {lang === 'zh' ? '找不到相關新聞' : 'No news found'}
                          </div>
                        )}
                    </div>
                  )}

                </div>

                {/* See all results button — Coming Soon */}
                <div className="search-see-all-wrap">
                  <button className="search-see-all-btn" disabled aria-disabled="true">
                    <span>
                      {lang === 'zh' ? '查看所有結果：' : 'See all results for '}
                      {/* fallback keeps current input visible during debounce delay */}
                      <span className="search-see-all-query">&ldquo;{debouncedQuery || query.trim()}&rdquo;</span>
                    </span>
                    <span className="search-see-all-coming-soon">
                      {lang === 'zh' ? '即將上線' : 'Coming Soon'}
                    </span>
                  </button>
                </div>
              </>
            )}

          </div>
        )}
      </div>

      {/* ── Header action buttons ────────────────────────────────── */}
      <div className="topnav-actions">
        {/* User Manual */}
        <button
          className="topnav-action-btn"
          title="User Manual"
          aria-label="User Manual"
          onClick={() => window.open('https://tkms.digwork.tw.ent.tsmc.com/pages/Uw5xaVFEXr', '_blank', 'noopener,noreferrer')}
        >
          {/* Book / manual icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M5 4h4M5 6.5h4M5 9h2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M11 3v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M11 3c0-1 2-1 2 0v10c0 1-2 1-2 0" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          <span className="topnav-action-label">User Manual</span>
        </button>

        {/* Language / Toggle */}
        <button className="topnav-action-btn" title="Language" aria-label="Switch Language" onClick={toggleLang}>
          {/* Globe / multilingual icon */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M8 1.5C8 1.5 5.5 4.5 5.5 8C5.5 11.5 8 14.5 8 14.5M8 1.5C8 1.5 10.5 4.5 10.5 8C10.5 11.5 8 14.5 8 14.5M1.5 8H14.5M2 5h12M2 11h12"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="topnav-action-label">{lang === 'zh' ? '繁體中文' : 'English'}</span>
        </button>

        {/* Dark/Light mode toggle */}
        <ThemeToggleButton />

        {/* Notification bell */}
        <div className="topnav-notif-panel-wrap" ref={notifRef}>
          <button
            className={`topnav-action-btn topnav-action-btn--icon-only${notifOpen ? ' active' : ''}`}
            title="Notifications"
            aria-label="Notifications"
            onClick={handleNotifToggle}
          >
            <span className="topnav-notif-wrap">
              {/* Bell icon */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M8 2a4.5 4.5 0 0 1 4.5 4.5v2.8l1.1 1.7H2.4L3.5 9.3V6.5A4.5 4.5 0 0 1 8 2Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.2 13a1.8 1.8 0 0 0 3.6 0"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>

          {notifOpen && (
            <div className="topnav-notif-panel">
              {/* Panel header */}
              <div className="topnav-notif-panel-header">
                {notifSettingsView ? (
                  <button
                    className="topnav-notif-settings-back"
                    onClick={() => setNotifSettingsView(false)}
                    aria-label={lang === 'zh' ? '返回通知' : 'Back to notifications'}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : null}
                <span className="topnav-notif-panel-title">
                  {notifSettingsView
                    ? (lang === 'zh' ? '通知設定' : 'Notification Settings')
                    : (lang === 'zh' ? '通知' : 'Notifications')}
                </span>
                {!notifSettingsView && (
                  <button
                    className="topnav-notif-settings-btn"
                    onClick={() => setNotifSettingsView(true)}
                    aria-label={lang === 'zh' ? '通知設定' : 'Notification Settings'}
                    title={lang === 'zh' ? '通知設定' : 'Settings'}
                  >
                    {/* Settings icon (cog with gear teeth) */}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {notifSettingsView ? (
                /* Settings view */
                <div className="topnav-notif-settings-list">
                  {notifSettingsLoading && (
                    <div className="topnav-notif-settings-loading">
                      {lang === 'zh' ? '載入中…' : 'Loading…'}
                    </div>
                  )}

                  {/* Notification toggle — Coming Soon (disabled) */}
                  <div className="topnav-notif-settings-item topnav-notif-settings-item--disabled">
                    <div className="topnav-notif-settings-item-left topnav-notif-settings-item-left--inline">
                      <span className="topnav-notif-settings-label">
                        {lang === 'zh' ? '通知' : 'Notification'}
                      </span>
                      <span className="topnav-notif-settings-coming-soon">
                        {lang === 'zh' ? '即將上線' : 'Coming Soon'}
                      </span>
                    </div>
                    <button
                      className="topnav-notif-toggle topnav-notif-toggle--disabled"
                      disabled
                      aria-disabled="true"
                      role="switch"
                      aria-checked={false}
                      aria-label={lang === 'zh' ? '通知（即將上線）' : 'Notification (Coming Soon)'}
                    >
                      <div className="topnav-notif-toggle-thumb" />
                    </button>
                  </div>

                  {/* Email toggle */}
                  <div className="topnav-notif-settings-item">
                    <div className="topnav-notif-settings-item-left">
                      <span className="topnav-notif-settings-label">
                        {lang === 'zh' ? 'Email' : 'Email'}
                      </span>
                    </div>
                    <button
                      className={`topnav-notif-toggle${notifSettings.email ? ' topnav-notif-toggle--on' : ''}`}
                      onClick={() => handleNotifSettingToggle('email')}
                      role="switch"
                      aria-checked={notifSettings.email}
                      aria-label={lang === 'zh' ? '電子郵件通知' : 'Email notifications'}
                      disabled={notifSettingsLoading}
                    >
                      <div className="topnav-notif-toggle-thumb" />
                    </button>
                  </div>

                  {/* Event Booking in Outlook toggle */}
                  <div className="topnav-notif-settings-item">
                    <div className="topnav-notif-settings-item-left">
                      <span className="topnav-notif-settings-label">
                        {lang === 'zh' ? '在 Outlook 中建立活動' : 'Event Booking in Outlook'}
                      </span>
                    </div>
                    <button
                      className={`topnav-notif-toggle${notifSettings.eventBooking ? ' topnav-notif-toggle--on' : ''}`}
                      onClick={() => handleNotifSettingToggle('eventBooking')}
                      role="switch"
                      aria-checked={notifSettings.eventBooking}
                      aria-label={lang === 'zh' ? '在 Outlook 中建立活動' : 'Event Booking in Outlook'}
                      disabled={notifSettingsLoading}
                    >
                      <div className="topnav-notif-toggle-thumb" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Coming soon placeholder */
                <div className="topnav-notif-list">
                  <div className="topnav-notif-empty">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="topnav-notif-empty-icon">
                      <path d="M16 4a9 9 0 0 1 9 9v5.6l2.2 3.4H4.8L7 18.6V13A9 9 0 0 1 16 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                      <path d="M12.4 26a3.6 3.6 0 0 0 7.2 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    <div className="topnav-notif-empty-title">
                      {lang === 'zh' ? '即將上線' : 'Coming Soon'}
                    </div>
                    <div className="topnav-notif-empty-desc">
                      {lang === 'zh'
                        ? '通知功能尚未上線，敬請期待。'
                        : 'The notifications feature is not yet available. Stay tuned!'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="topnav-user">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="topnav-avatar"
          src={`${BASE_PATH}${userInfo?.avatar ?? '/images/hwchiu_github_avatar.jpg'}`}
          alt="User Avatar"
        />
        <span className="topnav-name">{userInfo?.name ?? ''}</span>
      </div>
    </header>
  );
}
