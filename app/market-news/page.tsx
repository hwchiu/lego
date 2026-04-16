'use client';

import { useState, useEffect, useMemo } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import NewsCategoryTabs from '@/app/components/news/NewsCategoryTabs';
import NewsCard from '@/app/components/news/NewsCard';
import CompanyRankingTable from '@/app/components/news/CompanyRankingTable';
import { newsItems, NewsCategory } from '@/app/data/news';

const PAGE_SIZE = 8;

export default function MarketNewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [page, setPage] = useState(0);

  // Filter bar state
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filterKeywordApplied, setFilterKeywordApplied] = useState('');
  const [filterPeriodStart, setFilterPeriodStart] = useState('');
  const [filterPeriodEnd, setFilterPeriodEnd] = useState('');

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
  }, [categoryFiltered, filterKeywordApplied, filterPeriodStart, filterPeriodEnd]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [activeCategory, filterKeywordApplied, filterPeriodStart, filterPeriodEnd]);

  const goTo = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));

  function handleKeywordsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      setFilterKeywordApplied(filterKeyword);
    }
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">Market News</div>
            <h1 className="news-page-title">Top Market News</h1>

            {/* Filter bar — between title and tabs, right-aligned */}
            <div className="mn-filter-bar">
              <div className="mn-filter-field mn-filter-field--keyword">
                <label className="cp-news-filter-label">Keywords</label>
                <div className="cp-news-filter-input-wrap">
                  <input
                    type="text"
                    className="cp-news-filter-input"
                    placeholder="Search keywords… (Enter)"
                    value={filterKeyword}
                    onChange={(e) => setFilterKeyword(e.target.value)}
                    onKeyDown={handleKeywordsKeyDown}
                  />
                  {filterKeywordApplied && (
                    <button
                      className="cp-news-filter-clear-btn"
                      onClick={() => { setFilterKeyword(''); setFilterKeywordApplied(''); }}
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
                  <input
                    type="date"
                    className="cp-news-date-input"
                    value={filterPeriodStart}
                    onChange={(e) => setFilterPeriodStart(e.target.value)}
                    aria-label="Start date"
                  />
                  <span className="cp-news-period-sep">–</span>
                  <input
                    type="date"
                    className="cp-news-date-input"
                    value={filterPeriodEnd}
                    onChange={(e) => setFilterPeriodEnd(e.target.value)}
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>

            <NewsCategoryTabs active={activeCategory} onChange={setActiveCategory} />
            <div className="company-ranking-below-tabs">
              <CompanyRankingTable activeCategory={activeCategory} />
            </div>
            <div className="news-pager-layout">
              <button
                className="news-pager-arrow"
                onClick={() => goTo(page - 1)}
                disabled={page === 0}
                aria-label="Previous page"
              >
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                  <path
                    d="M15 5L8 12L15 19"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="news-pager-content">
                <div className="news-grid">
                  {paged.map((item) => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="news-pagination-bar">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        className={`news-pagination-btn${page === i ? ' active' : ''}`}
                        onClick={() => goTo(i)}
                        aria-label={`Page ${i + 1}`}
                        aria-current={page === i ? 'page' : undefined}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="news-pager-arrow"
                onClick={() => goTo(page + 1)}
                disabled={page >= totalPages - 1}
                aria-label="Next page"
              >
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                  <path
                    d="M9 5L16 12L9 19"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
