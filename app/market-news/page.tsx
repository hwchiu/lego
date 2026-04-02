'use client';

import { useState, useEffect } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import NewsCategoryTabs from '@/app/components/news/NewsCategoryTabs';
import NewsCard from '@/app/components/news/NewsCard';
import { newsItems, NewsCategory } from '@/app/data/news';

const PAGE_SIZE = 8;

export default function MarketNewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [page, setPage] = useState(0);

  const filtered =
    activeCategory === 'all'
      ? newsItems
      : newsItems.filter((n) => n.category === activeCategory);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // page state is always reset to 0 on category change via useEffect below
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [activeCategory]);

  const goTo = (p: number) => setPage(Math.max(0, Math.min(p, totalPages - 1)));

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
            <NewsCategoryTabs active={activeCategory} onChange={setActiveCategory} />
            <div className="news-pager-layout">
              <button
                className="news-pager-arrow"
                onClick={() => goTo(page - 1)}
                disabled={page === 0}
                aria-label="上一頁"
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
                        aria-label={`第 ${i + 1} 頁`}
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
                aria-label="下一頁"
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
