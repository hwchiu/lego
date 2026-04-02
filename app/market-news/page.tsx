'use client';

import { useState } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import NewsCategoryTabs from '@/app/components/news/NewsCategoryTabs';
import NewsCard from '@/app/components/news/NewsCard';
import { newsItems, NewsCategory } from '@/app/data/news';

export default function MarketNewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');

  const filtered =
    activeCategory === 'all'
      ? newsItems
      : newsItems.filter((n) => n.category === activeCategory);

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
            <div className="news-grid">
              {filtered.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
