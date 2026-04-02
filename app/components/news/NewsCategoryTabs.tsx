'use client';

import { newsCategories, NewsCategory } from '@/app/data/news';

interface NewsCategoryTabsProps {
  active: NewsCategory;
  onChange: (cat: NewsCategory) => void;
}

export default function NewsCategoryTabs({ active, onChange }: NewsCategoryTabsProps) {
  return (
    <div className="market-tabs-card">
      <div className="market-tabs">
        {newsCategories.map((cat) => (
          <button
            key={cat.key}
            className={`market-tab ${active === cat.key ? 'active' : ''}`}
            onClick={() => onChange(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
