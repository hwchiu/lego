'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { marketTabs } from '@/app/data/navigation';

const SCROLL_THRESHOLD = 2;
const SCROLL_AMOUNT_PX = 200;

interface MarketTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MarketTabs({ activeTab, onTabChange }: MarketTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_THRESHOLD);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  const handleScrollRight = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: SCROLL_AMOUNT_PX, behavior: 'smooth' });
  }, []);

  return (
    <div className="market-tabs-card market-tabs-card--with-arrow">
      <div className="market-tabs" ref={scrollRef}>
        {marketTabs.map((tab) => (
          <button
            key={tab}
            className={`market-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {canScrollRight && (
        <button
          className="market-tabs-arrow"
          onClick={handleScrollRight}
          aria-label="Scroll tabs right"
        >
          ›
        </button>
      )}
    </div>
  );
}

