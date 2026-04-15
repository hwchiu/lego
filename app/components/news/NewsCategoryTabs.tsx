'use client';

import { useRef, useCallback } from 'react';
import { newsCategories, NewsCategory } from '@/app/data/news';

interface NewsCategoryTabsProps {
  active: NewsCategory;
  onChange: (cat: NewsCategory) => void;
}

export default function NewsCategoryTabs({ active, onChange }: NewsCategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    const amount = 150;
    tabsRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  return (
    <div className="market-tabs-card">
      <button
        className="market-tabs-arrow market-tabs-arrow--left"
        onClick={() => scroll('left')}
        aria-label="Scroll tabs left"
      >
        ‹
      </button>
      <div className="market-tabs" ref={tabsRef}>
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
      <button
        className="market-tabs-arrow"
        onClick={() => scroll('right')}
        aria-label="Scroll tabs right"
      >
        ›
      </button>
    </div>
  );
}
