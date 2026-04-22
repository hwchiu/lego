'use client';

import { useState, useEffect, useMemo } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import NewsCategoryTabs from '@/app/components/news/NewsCategoryTabs';
import NewsCard from '@/app/components/news/NewsCard';
import CompanyRankingTable from '@/app/components/news/CompanyRankingTable';
import DatePickerInput from '@/app/components/shared/DatePickerInput';
import { newsItems, NewsCategory } from '@/app/data/news';
import { getPaginationRange } from '@/app/lib/paginationUtils';

const PAGE_SIZE = 8;

export default function MarketNewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [page, setPage] = useState(0);

  // Filter bar state
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterKeywordApplied, setFilterKeywordApplied] = useState('');
  const [filterPeriodStart, setFilterPeriodStart] = useState('');
  const [filterPeriodEnd, setFilterPeriodEnd] = useState('');
  const [filterCompanySymbol, setFilterCompanySymbol] = useState<string | null>(null);

  const categoryFiltered =
    activeCategory === 'all'
      ? newsItems
      : newsItems.filter((n) => n.category === activeCategory);

  const filtered = useMemo(() => {
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [activeCategory, filterKeywordApplied, filterCompanySymbol, filterPeriodStart, filterPeriodEnd]);

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
                    onChange={setFilterPeriodStart}
                    placeholder="Start date"
                  />
                  <span className="cp-news-period-sep">–</span>
                  <DatePickerInput
                    value={filterPeriodEnd}
                    onChange={setFilterPeriodEnd}
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>

            <NewsCategoryTabs active={activeCategory} onChange={(cat) => { setActiveCategory(cat); setFilterCompanySymbol(null); }} />
          </div>
          <div className="mn-content-area">
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
