'use client';

import { useRef } from 'react';
import { newsItems, type NewsCategory } from '@/app/data/news';

const SPARKLINE_DAYS = 7;
const TOP_N = 10;
// Use end-of-day April 2 so all same-day articles are included
const NOW_REF = new Date('2026-04-03T00:00:00+08:00').getTime();
const DAY_MS = 86_400_000;

interface CompanyData {
  rank: number;
  symbol: string;
  name: string;
  totalMentions: number;
  dailyCounts: number[]; // length SPARKLINE_DAYS, index 0 = oldest, last = most recent
}

function computeTopCompanies(category: NewsCategory = 'all'): CompanyData[] {
  const filtered =
    category === 'all' ? newsItems : newsItems.filter((n) => n.category === category);

  const map: Record<string, { name: string; total: number; daily: number[] }> = {};

  for (const item of filtered) {
    const daysAgo = Math.floor((NOW_REF - item.publishedAt.getTime()) / DAY_MS);
    const dayIndex = SPARKLINE_DAYS - 1 - Math.min(Math.max(0, daysAgo), SPARKLINE_DAYS - 1);

    for (const tag of item.tags) {
      if (!map[tag.symbol]) {
        map[tag.symbol] = { name: tag.name, total: 0, daily: new Array(SPARKLINE_DAYS).fill(0) };
      }
      map[tag.symbol].total += 1;
      if (daysAgo >= 0 && daysAgo < SPARKLINE_DAYS) {
        map[tag.symbol].daily[dayIndex] += 1;
      }
    }
  }

  return Object.entries(map)
    .map(([symbol, { name, total, daily }]) => ({
      symbol,
      name,
      totalMentions: total,
      dailyCounts: daily,
    }))
    .sort((a, b) => b.totalMentions - a.totalMentions)
    .slice(0, TOP_N)
    .map((co, i) => ({ ...co, rank: i + 1 }));
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

function Sparkline({ data, width = 84, height = 38 }: SparklineProps) {
  const safeData = data.map((d) => (typeof d === 'number' && isFinite(d) ? d : 0));
  const allZero = safeData.every((d) => d === 0);
  if (allZero) {
    return (
      <svg width={width} height={height} className="chr-sparkline">
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} className="chr-sparkline-flat" />
      </svg>
    );
  }

  const max = Math.max(...safeData, 1);
  const n = safeData.length;
  const pts = safeData.map((v, i) => {
    const x = n > 1 ? (i / (n - 1)) * width : width / 2;
    const y = height - (v / max) * (height - 8) - 4;
    return { x, y };
  });

  const polyPoints = pts.map(({ x, y }) => `${x},${y}`).join(' ');
  const last = pts[pts.length - 1];

  return (
    <svg width={width} height={height} className="chr-sparkline">
      <polyline points={polyPoints} className="chr-sparkline-line" />
      <circle cx={last.x} cy={last.y} r={2.5} className="chr-sparkline-dot" />
    </svg>
  );
}

interface CompanyRankingTableProps {
  activeCategory?: NewsCategory;
  selectedSymbol?: string;
  onCompanyClick?: (symbol: string | null) => void;
}

export default function CompanyRankingTable({ activeCategory = 'all', selectedSymbol, onCompanyClick }: CompanyRankingTableProps) {
  const companies = computeTopCompanies(activeCategory);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -156 : 156, behavior: 'smooth' });
  }

  function handleCardClick(symbol: string) {
    if (onCompanyClick) {
      onCompanyClick(selectedSymbol === symbol ? null : symbol);
    }
  }

  return (
    <div className="chr-root">
      <div className="chr-header">
        <span className="insight-block-title">Company Heat Ranking</span>
      </div>
      <div className="chr-carousel-wrap">
        <button
          className="chr-nav-btn"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M9 2L4 7L9 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="chr-track" ref={scrollRef}>
          {companies.map((co) => (
            <div
              key={co.symbol}
              className={`chr-card${selectedSymbol === co.symbol ? ' chr-card--active' : ''}`}
              onClick={() => handleCardClick(co.symbol)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(co.symbol); } }}
            >
              <div className="chr-card-top">
                <span className="chr-card-rank">#{co.rank}</span>
                <span className="chr-card-symbol">{co.symbol}</span>
              </div>
              <div className="chr-card-name">{co.name}</div>
              <div className="chr-card-count">
                <span className="chr-count-num">{co.totalMentions}</span>
                <span className="chr-count-label">mentions</span>
              </div>
              <div className="chr-card-sparkline">
                <Sparkline data={co.dailyCounts} />
              </div>
            </div>
          ))}
        </div>
        <button
          className="chr-nav-btn"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M5 2L10 7L5 12"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
