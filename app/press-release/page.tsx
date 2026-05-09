'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';
import type { PressRelease } from '@/app/data/pressReleases';
import { getPressReleaseArchiveGroups, type PRArchiveGroup } from '@/app/data/pressReleases';
import { getPressReleases } from '@/app/lib/pressReleaseApi';

// ─── Company color palette ────────────────────────────────────────────────────

const TICKER_COLORS: Record<string, string> = {
  NVDA: '#76b900',
  AAPL: '#555555',
  ASML: '#0066cc',
  AMD: '#ed1c24',
  QCOM: '#3253dc',
  AVGO: '#cf0a2c',
  AMAT: '#003087',
  '2454.TW': '#ee1c2e',
  LRCX: '#003f7e',
  KLAC: '#0055a4',
  '8035.T': '#c8000b',
  TSM: '#1a2332',
  TC: '#1a2332',
};

function getTickerColor(ticker: string): string {
  return TICKER_COLORS[ticker] ?? '#374151';
}

function getTileInitials(ticker: string): string {
  return ticker.replace('.TW', '').replace('.T', '').slice(0, 4);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M2 9L7 4L12 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandAllIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 5.5L7 7.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollapseAllIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 8.5L7 6.5L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.5 8.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" width="10" height="10" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} fill="none" aria-hidden="true" className="pr-spin">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="12 22" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M7 1.5L12.5 11.5H1.5L7 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 5.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.6" fill="currentColor" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 7a5 5 0 1 0 1.3-3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 3.5V7H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Archive Tile ─────────────────────────────────────────────────────────────

interface ArchiveTileProps {
  pr: PressRelease;
  lang: 'zh' | 'en';
}

function ArchiveTile({ pr, lang }: ArchiveTileProps) {
  const [y, m, d] = pr.publishedAt.split('-').map(Number);
  const dateUTC = new Date(Date.UTC(y, m - 1, d));
  const dateStr = dateUTC.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const color = getTickerColor(pr.ticker);
  const initials = getTileInitials(pr.ticker);

  return (
    <div
      className="pr-archive-tile"
      aria-label={`${pr.title} — ${pr.company}`}
    >
      <div className="pr-archive-tile-media" style={{ background: color }}>
        <span className="pr-archive-tile-ticker">{initials}</span>
      </div>
      <div className="pr-archive-tile-info">
        <h3 className="pr-archive-tile-title">
          <a
            className="pr-archive-tile-title-link"
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pr.title}
          </a>
        </h3>
        <p className="pr-archive-tile-desc">{pr.summary}</p>
        <div className="pr-archive-tile-footer">
          <a
            className="news-tag"
            href={`/lego/company-profile/${pr.ticker}/`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {pr.company}
          </a>
          <time className="pr-archive-tile-date" dateTime={pr.publishedAt}>{dateStr}</time>
        </div>
      </div>
    </div>
  );
}

// ─── Archive Group ────────────────────────────────────────────────────────────

interface ArchiveGroupProps {
  group: PRArchiveGroup;
  isExpanded: boolean;
  onToggle: () => void;
  lang: 'zh' | 'en';
}

function ArchiveGroup({ group, isExpanded, onToggle, lang }: ArchiveGroupProps) {
  const articleWord = group.items.length === 1
    ? (lang === 'en' ? 'article' : '篇')
    : (lang === 'en' ? 'articles' : '篇');

  return (
    <section className="pr-archive-group" aria-label={group.label}>
      <div
        className="pr-archive-group-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        aria-expanded={isExpanded}
      >
        <span className="pr-archive-group-label">{group.label}</span>
        <span className="pr-archive-group-count">
          {group.items.length} {articleWord}
        </span>
        <span className="pr-archive-group-toggle" aria-hidden="true">
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </div>

      <div className={`pr-archive-group-body${isExpanded ? ' expanded' : ''}`}>
        {isExpanded && (
          <div className="pr-archive-tiles">
            {group.items.map((pr) => (
              <ArchiveTile key={pr.id} pr={pr} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Company Multi-Select ─────────────────────────────────────────────────────

const MAX_COMPANY_FILTER = 10;

interface CompanyFilterProps {
  selectedCodes: string[];
  onSelectionChange: (codes: string[]) => void;
  onSearch: (codes: string[]) => void;
  isLoading: boolean;
  lang: 'zh' | 'en';
}

function CompanyFilter({ selectedCodes, onSelectionChange, onSearch, isLoading, lang }: CompanyFilterProps) {
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return COMPANY_MASTER_LIST.slice(0, 50);
    const q = query.toLowerCase();
    return COMPANY_MASTER_LIST.filter(
      (c) => c.symbol.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    ).slice(0, 50);
  }, [query]);

  function handleToggle(symbol: string) {
    if (!selectedCodes.includes(symbol) && selectedCodes.length >= MAX_COMPANY_FILTER) {
      setShowMaxWarning(true);
      return;
    }
    setShowMaxWarning(false);
    const next = selectedCodes.includes(symbol)
      ? selectedCodes.filter((s) => s !== symbol)
      : [...selectedCodes, symbol];
    onSelectionChange(next);
  }

  function handleRemove(symbol: string) {
    setShowMaxWarning(false);
    onSelectionChange(selectedCodes.filter((s) => s !== symbol));
  }

  function handleClearAll() {
    setShowMaxWarning(false);
    onSelectionChange([]);
    setQuery('');
  }

  function handleSearchClick() {
    onSearch(selectedCodes);
  }

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const labels = {
    placeholder:   { zh: '搜尋公司名稱或代碼...', en: 'Search company name or ticker…' },
    selected:      { zh: '已選', en: 'Selected' },
    clearAll:      { zh: '清除全部', en: 'Clear all' },
    search:        { zh: '搜尋', en: 'Search' },
    noResults:     { zh: '查無結果', en: 'No results' },
    companies:     { zh: '公司', en: 'companies' },
    filterByComp:  { zh: '依公司篩選', en: 'Filter by Company' },
  };

  return (
    <div className="pr-co-filter" ref={wrapRef}>
      <div className="pr-co-filter-label">{labels.filterByComp[lang]}</div>

      <div className="pr-co-filter-input-row">
        <div className={`pr-co-filter-input-wrap${dropdownOpen ? ' open' : ''}`}>
          <SearchIcon />
          <input
            className="pr-co-filter-input"
            type="text"
            placeholder={labels.placeholder[lang]}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setDropdownOpen(true); }}
            onFocus={() => setDropdownOpen(true)}
            autoComplete="off"
          />
          {query && (
            <button className="pr-co-filter-input-clear" onClick={() => setQuery('')} aria-label="Clear input">
              <CloseIcon />
            </button>
          )}
        </div>
        <button
          className={`pr-co-filter-search-btn${selectedCodes.length === 0 ? ' disabled' : ''}`}
          onClick={handleSearchClick}
          disabled={selectedCodes.length === 0 || isLoading}
          title={labels.search[lang]}
        >
          {isLoading ? <SpinnerIcon size={13} /> : <SearchIcon />}
          <span>{labels.search[lang]}</span>
        </button>
      </div>

      {showMaxWarning && (
        <div className="pr-co-filter-max-warning" role="alert">
          {lang === 'zh'
            ? `最多可選擇 ${MAX_COMPANY_FILTER} 家公司。`
            : `You can select a maximum of ${MAX_COMPANY_FILTER} companies.`}
        </div>
      )}

      {dropdownOpen && (
        <div className="pr-co-filter-dropdown">
          {filtered.length === 0 ? (
            <div className="pr-co-filter-no-results">{labels.noResults[lang]}</div>
          ) : (
            filtered.map((c) => {
              const active = selectedCodes.includes(c.symbol);
              return (
                <button
                  key={c.symbol}
                  className={`pr-co-filter-option${active ? ' selected' : ''}`}
                  onMouseDown={(e) => { e.preventDefault(); handleToggle(c.symbol); }}
                >
                  <span className="pr-co-filter-option-check" aria-hidden="true">
                    {active ? '✓' : ''}
                  </span>
                  <span className="pr-co-filter-option-symbol">{c.symbol}</span>
                  <span className="pr-co-filter-option-name">{c.name}</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {selectedCodes.length > 0 && (
        <div className="pr-co-filter-chips">
          <span className="pr-co-filter-chips-label">
            {labels.selected[lang]} {selectedCodes.length} {labels.companies[lang]}:
          </span>
          <div className="pr-co-filter-chips-list">
            {selectedCodes.map((code) => (
              <span key={code} className="pr-co-filter-chip">
                {code}
                <button
                  className="pr-co-filter-chip-remove"
                  onClick={() => handleRemove(code)}
                  aria-label={`Remove ${code}`}
                >
                  <CloseIcon />
                </button>
              </span>
            ))}
            <button className="pr-co-filter-clear-all" onClick={handleClearAll}>
              {labels.clearAll[lang]}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="pr-loading-wrap" role="status" aria-label="Loading press releases">
      <div className="pr-loading-inner">
        <SpinnerIcon size={24} />
        <span className="pr-loading-text">Loading press releases…</span>
      </div>
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
  lang: 'zh' | 'en';
}

function ErrorBanner({ message, onRetry, lang }: ErrorBannerProps) {
  const retryLabel = lang === 'zh' ? '重試' : 'Retry';
  return (
    <div className="pr-error-banner" role="alert">
      <span className="pr-error-icon"><AlertIcon /></span>
      <span className="pr-error-message">{message}</span>
      <button className="pr-error-retry" onClick={onRetry}>
        <RefreshIcon />
        {retryLabel}
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PressReleasePage() {
  const { lang } = useLanguage();

  // ── Data state ──
  const [allItems, setAllItems] = useState<PressRelease[]>([]);

  // ── UI state ──
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Company filter state ──
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string[]>([]);

  // ── Archive group state ──
  const groups = useMemo(
    () => getPressReleaseArchiveGroups(allItems, lang),
    [allItems, lang],
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Expand all new groups when groups change
  useEffect(() => {
    setExpandedKeys(new Set(groups.map((g) => g.key)));
  }, [groups]);

  const allExpanded = groups.length > 0 && expandedKeys.size >= groups.length;

  // ── Fetch logic ──
  const abortRef = useRef<AbortController | null>(null);

  const fetchAll = useCallback(async (tickers: string[]) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setIsInitialLoading(true);
    setError(null);

    try {
      const { items } = await getPressReleases(0, Number.MAX_SAFE_INTEGER, tickers, ctrl.signal);

      if (ctrl.signal.aborted) return;
      setAllItems(items);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(lang === 'zh' ? `載入失敗：${msg}` : `Failed to load: ${msg}`);
    } finally {
      if (!ctrl.signal.aborted) {
        setIsInitialLoading(false);
      }
    }
  }, [lang]);

  // ── Initial load and filter change ──
  useEffect(() => {
    fetchAll(activeFilter);
    return () => { abortRef.current?.abort(); };
  }, [activeFilter, fetchAll]);

  // ── Handlers ──
  function handleToggleGroup(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleToggleAll() {
    if (allExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(groups.map((g) => g.key)));
    }
  }

  function handleSearch(codes: string[]) {
    setActiveFilter(codes);
    setAllItems([]);
  }

  function handleSelectionChange(codes: string[]) {
    setSelectedCodes(codes);
    if (codes.length === 0) {
      handleSearch([]);
    }
  }

  function handleRetry() {
    fetchAll(activeFilter);
  }

  // ── Labels ──
  const labels = {
    eyebrow:      { zh: 'Press Release', en: 'Press Release' },
    expandAll:    { zh: '展開全部', en: 'Expand All' },
    collapseAll:  { zh: '收合全部', en: 'Collapse All' },
    filterResult: { zh: '篩選結果', en: 'Filtered results' },
    desc: {
      zh: `瀏覽已部署的 Press Release 靜態資料檔，並可依公司篩選（上限 ${MAX_COMPANY_FILTER} 家）快速查看對應公告。`,
      en: `Browse the deployed Press Release archive and filter by company (up to ${MAX_COMPANY_FILTER} selections) to quickly review matching announcements.`,
    },
  };

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="pr-archive-page">
              {/* Company filter */}
              <CompanyFilter
                selectedCodes={selectedCodes}
                onSelectionChange={handleSelectionChange}
                onSearch={handleSearch}
                isLoading={isInitialLoading}
                lang={lang}
              />

              {/* Active filter badge */}
              {activeFilter.length > 0 && (
                <div className="pr-archive-api-badge">
                  <SearchIcon />
                  {labels.filterResult[lang]} · {activeFilter.join(', ')} · {allItems.length} {lang === 'en' ? 'results' : '筆'}
                  <button
                    className="pr-archive-api-badge-clear"
                    onClick={() => { setSelectedCodes([]); handleSearch([]); }}
                    aria-label="Clear filter"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              {/* Initial loading */}
              {isInitialLoading && <LoadingSkeleton />}

              {/* Error state */}
              {!isInitialLoading && error && (
                <ErrorBanner message={error} onRetry={handleRetry} lang={lang} />
              )}

              {/* Content */}
              {!isInitialLoading && !error && (
                <>
                  {/* Page header */}
                  <div className="pr-archive-header">
                    <div className="pr-archive-header-left">
                      <span className="section-eyebrow">{labels.eyebrow[lang]}</span>
                    </div>
                    <div className="pr-archive-header-right">
                      <button
                        className="pr-archive-expand-btn"
                        onClick={handleToggleAll}
                        title={allExpanded ? labels.collapseAll[lang] : labels.expandAll[lang]}
                      >
                        {allExpanded ? <CollapseAllIcon /> : <ExpandAllIcon />}
                        <span>{allExpanded ? labels.collapseAll[lang] : labels.expandAll[lang]}</span>
                      </button>
                    </div>
                  </div>
                  <p className="pr-archive-desc">{labels.desc[lang]}</p>

                  {/* Archive groups */}
                  <div className="pr-archive-groups">
                    {groups.map((group) => (
                      <ArchiveGroup
                        key={group.key}
                        group={group}
                        isExpanded={expandedKeys.has(group.key)}
                        onToggle={() => handleToggleGroup(group.key)}
                        lang={lang}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
