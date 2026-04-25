'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import NewsCategoryTabs from '@/app/components/news/NewsCategoryTabs';
import NewsCard from '@/app/components/news/NewsCard';
import CompanyRankingTable from '@/app/components/news/CompanyRankingTable';
import DatePickerInput from '@/app/components/shared/DatePickerInput';
import { newsItems, NewsCategory, NewsItem } from '@/app/data/news';
import { getPaginationRange } from '@/app/lib/paginationUtils';

const PAGE_SIZE = 8;

interface NewsSummaryRecord {
  news_date: string;
  co_cd: string;
  news_source: string;
  comp_tag_short_name: string;
  news_catg: string;
  news_content: string;
  news_url: string;
  news_title: string;
  update_date: string;
}

async function getNewsSummary(params: {
  news_dt_from: string;
  news_dt_to: string;
  co_cd: string[];
}): Promise<NewsSummaryRecord[]> {
  const res = await fetch('/getNewsSummary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`getNewsSummary failed: ${res.status}`);
  return res.json();
}

function mapSummaryToNewsItem(record: NewsSummaryRecord, index: number): NewsItem {
  return {
    id: `api-${record.co_cd}-${record.news_date}-${index}`,
    source: record.news_source,
    title: record.news_title,
    content: record.news_content,
    category: record.news_catg,
    fileType: record.news_catg,
    tags: record.co_cd
      ? [{ symbol: record.co_cd, name: record.comp_tag_short_name || record.co_cd, change: 0 }]
      : [],
    publishedAt: new Date(record.news_date),
    url: record.news_url,
  };
}

/** Returns today's date as 'YYYY-MM-DD' */
function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Adds (or subtracts) `months` to a 'YYYY-MM-DD' string, returns 'YYYY-MM-DD'.
 *  Clamps day to the last day of the target month to avoid overflow (e.g. Jan 31 + 1mo → Feb 28). */
function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  const origDay = d.getDate();
  const targetMonth = d.getMonth() + months;
  const targetYear = d.getFullYear() + Math.floor(targetMonth / 12);
  const normMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normMonth + 1, 0).getDate();
  const clampedDay = Math.min(origDay, lastDay);
  const result = new Date(targetYear, normMonth, clampedDay);
  const mm = String(result.getMonth() + 1).padStart(2, '0');
  const dd = String(result.getDate()).padStart(2, '0');
  return `${result.getFullYear()}-${mm}-${dd}`;
}

/** Formats 'YYYY-MM-DD' to 'YYYY-MM-DD HH:mm:ss' */
function toApiDateTime(dateStr: string, endOfDay = false): string {
  const time = endOfDay ? '23:59:59' : '00:00:00';
  return `${dateStr} ${time}`;
}

export default function MarketNewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [page, setPage] = useState(0);

  // Filter bar state
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterKeywordApplied, setFilterKeywordApplied] = useState('');
  const [filterPeriodStart, setFilterPeriodStart] = useState(() => addMonths(todayStr(), -3));
  const [filterPeriodEnd, setFilterPeriodEnd] = useState(() => todayStr());
  const [filterCompanySymbol, setFilterCompanySymbol] = useState<string | null>(null);

  // Validation error state for period inputs
  const [periodStartError, setPeriodStartError] = useState(false);
  const [periodEndError, setPeriodEndError] = useState(false);

  // API search results (null = not yet searched, use local data)
  const [searchResults, setSearchResults] = useState<NewsItem[] | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);

  // Auto-calculate companion date (±3 months) when one date changes
  const handlePeriodStartChange = useCallback((val: string) => {
    setFilterPeriodStart(val);
    setPeriodStartError(false);
    if (val) {
      setFilterPeriodEnd(addMonths(val, 3));
      setPeriodEndError(false);
    }
    setSearchResults(null);
  }, []);

  const handlePeriodEndChange = useCallback((val: string) => {
    setFilterPeriodEnd(val);
    setPeriodEndError(false);
    if (val) {
      setFilterPeriodStart(addMonths(val, -3));
      setPeriodStartError(false);
    }
    setSearchResults(null);
  }, []);

  const categoryFiltered =
    activeCategory === 'all'
      ? newsItems
      : newsItems.filter((n) => n.category === activeCategory);

  const localFiltered = useMemo(() => {
    const kw = filterKeywordApplied.trim().toLowerCase();
    return categoryFiltered.filter((item) => {
      if (kw) {
        const searchable = `${item.title} ${item.content}`.toLowerCase();
        if (!searchable.includes(kw)) return false;
      }
      if (filterCompanySymbol) {
        if (!item.tags.some((t) => t.symbol === filterCompanySymbol)) return false;
      }
      if (filterPeriodStart) {
        if (item.publishedAt < new Date(filterPeriodStart)) return false;
      }
      if (filterPeriodEnd) {
        const end = new Date(filterPeriodEnd);
        end.setDate(end.getDate() + 1);
        if (item.publishedAt >= end) return false;
      }
      return true;
    });
  }, [categoryFiltered, filterKeywordApplied, filterCompanySymbol, filterPeriodStart, filterPeriodEnd]);

  const displayItems = searchResults ?? localFiltered;

  const totalPages = Math.max(1, Math.ceil(displayItems.length / PAGE_SIZE));
  const paged = displayItems.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [activeCategory, filterKeywordApplied, filterCompanySymbol, filterPeriodStart, filterPeriodEnd, searchResults]);

  const goTo = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));

  function handleKeywordsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setFilterKeywordApplied(filterKeyword);
    }
  }

  function handleClearKeyword() {
    setFilterKeyword('');
    setFilterKeywordApplied('');
  }

  function handleCompanyClick(symbol: string | null) {
    setFilterCompanySymbol(symbol);
  }

  async function handleSearch() {
    let hasError = false;
    if (!filterPeriodStart) { setPeriodStartError(true); hasError = true; }
    if (!filterPeriodEnd) { setPeriodEndError(true); hasError = true; }
    if (hasError) return;

    setIsSearchLoading(true);
    setSearchError(false);
    try {
      const records = await getNewsSummary({
        news_dt_from: toApiDateTime(filterPeriodStart, false),
        news_dt_to: toApiDateTime(filterPeriodEnd, true),
        co_cd: [],
      });
      setSearchResults(records.map(mapSummaryToNewsItem));
    } catch {
      setSearchError(true);
      setSearchResults(null);
    } finally {
      setIsSearchLoading(false);
    }
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="mn-sticky-header">
            <div className="section-eyebrow">Market News</div>

            {/* Filter bar — right-aligned */}
            <div className="mn-filter-bar">
              <div className="mn-filter-field mn-filter-field--keyword">
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
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    onKeyDown={handleKeywordsKeyDown}
                  />
                  {filterKeywordApplied && (
                    <button
                      className="cp-irt-search-clear"
                      onClick={handleClearKeyword}
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
              <div className="mn-filter-field mn-filter-field--period">
                <label className="cp-news-filter-label">Period</label>
                <div className="cp-news-period-wrap">
                  <DatePickerInput
                    value={filterPeriodStart}
                    onChange={handlePeriodStartChange}
                    placeholder="Start date"
                    error={periodStartError}
                  />
                  <span className="cp-news-period-sep">–</span>
                  <DatePickerInput
                    value={filterPeriodEnd}
                    onChange={handlePeriodEndChange}
                    placeholder="End date"
                    error={periodEndError}
                  />
                </div>
              </div>
              <button
                className="mn-search-btn"
                onClick={handleSearch}
                disabled={isSearchLoading}
              >
                {isSearchLoading ? 'Loading…' : 'Search'}
              </button>
            </div>

            <NewsCategoryTabs active={activeCategory} onChange={(cat) => { setActiveCategory(cat); setFilterCompanySymbol(null); }} />
          </div>
          <div className="mn-content-area">
            {searchError && (
              <div className="mn-search-error">
                Unable to fetch news. Please check your connection and try again.
              </div>
            )}
            <div className="company-ranking-below-tabs">
              <CompanyRankingTable selectedSymbol={filterCompanySymbol ?? undefined} onCompanyClick={handleCompanyClick} />
            </div>
            <div className="news-grid">
              {paged.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="cp-news-tab-pagination">
                <button
                  className="cp-news-tab-page-btn"
                  disabled={page === 0}
                  onClick={() => goTo(page - 1)}
                >
                  ‹ Prev
                </button>
                {getPaginationRange(page, totalPages).map((item) =>
                  typeof item === 'string' ? (
                    <span key={item} className="cp-news-tab-page-ellipsis">…</span>
                  ) : (
                    <button
                      key={item}
                      className={`cp-news-tab-page-btn${page === item ? ' active' : ''}`}
                      onClick={() => goTo(item)}
                      aria-label={`Page ${item + 1}`}
                      aria-current={page === item ? 'page' : undefined}
                    >
                      {item + 1}
                    </button>
                  )
                )}
                <button
                  className="cp-news-tab-page-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => goTo(page + 1)}
                >
                  Next ›
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
