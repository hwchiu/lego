'use client';

import { useRef, useState, useEffect } from 'react';

const RANKING_URL = '/lego/data/company-heat-ranking.json';

interface HeatRankingRecord {
  seq: number;
  co_cd: string;
  comp_tag_short_name: string;
  mentions: number;
  daily_count: number[];
  weekly_count: number[];
}

type TrendMode = 'daily' | 'weekly';

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
  selectedSymbol?: string;
  onCompanyClick?: (symbol: string | null) => void;
}

export default function CompanyRankingTable({ selectedSymbol, onCompanyClick }: CompanyRankingTableProps) {
  const [companies, setCompanies] = useState<HeatRankingRecord[]>([]);
  const [trendMode, setTrendMode] = useState<TrendMode>('daily');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(RANKING_URL)
      .then((res) => res.json())
      .then((data: HeatRankingRecord[]) => setCompanies([...data].sort((a, b) => a.seq - b.seq)))
      .catch(() => setCompanies([]));
  }, []);

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
        <div className="toggle-group">
          <button
            className={`toggle-btn${trendMode === 'daily' ? ' active' : ''}`}
            onClick={() => setTrendMode('daily')}
          >
            Daily trend
          </button>
          <button
            className={`toggle-btn${trendMode === 'weekly' ? ' active' : ''}`}
            onClick={() => setTrendMode('weekly')}
          >
            Weekly trend
          </button>
        </div>
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
              key={co.co_cd}
              className={`chr-card${selectedSymbol === co.co_cd ? ' chr-card--active' : ''}`}
              onClick={() => handleCardClick(co.co_cd)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClick(co.co_cd); } }}
            >
              <div className="chr-card-top">
                <span className="chr-card-rank">#{co.seq}</span>
                <span className="chr-card-symbol">{co.co_cd}</span>
              </div>
              <div className="chr-card-name">{co.comp_tag_short_name}</div>
              <div className="chr-card-count">
                <span className="chr-count-num">{co.mentions}</span>
                <span className="chr-count-label">mentions</span>
              </div>
              <div className="chr-card-sparkline">
                <Sparkline data={trendMode === 'daily' ? co.daily_count : co.weekly_count} />
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
