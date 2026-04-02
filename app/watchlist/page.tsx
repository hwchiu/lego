'use client';

import { useState } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

// ── Stock Index data ─────────────────────────────────────────────────────────
interface StockIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
  trend: number[]; // sparkline points (y values, 0–100 scale)
}

const stockIndexes: StockIndex[] = [
  { name: 'Dow', value: 42284.48, change: 120.42, changePct: 0.31, trend: [45, 50, 42, 55, 60, 58, 65] },
  {
    name: 'S&P 500',
    value: 5804.45,
    change: 21.58,
    changePct: 0.39,
    trend: [40, 48, 44, 52, 58, 55, 62],
  },
  { name: 'Nasdaq', value: 18933.14, change: 74.46, changePct: 0.42, trend: [38, 46, 43, 54, 60, 57, 64] },
  { name: 'Gold', value: 3325.39, change: -2.22, changePct: -0.1, trend: [70, 68, 72, 65, 60, 62, 58] },
  {
    name: 'Russell 2000',
    value: 1987.32,
    change: 8.14,
    changePct: 0.41,
    trend: [42, 46, 44, 50, 55, 52, 58],
  },
];

// ── Holdings data ─────────────────────────────────────────────────────────────
interface Holding {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  shares: number;
  cost: number;
  todayGain: number;
  todayGainPct: number;
  revenue: string; // e.g. "$25.53B"
  revenueQoQ: string; // e.g. "+3.2%"
  revenueYoY: string; // e.g. "+38.9%"
  grossMargin: string; // e.g. "59.2%"
  doi: string; // Days of Inventory
  nextEarning: string; // e.g. "Jul 17, 2025"
  lastQtrRevenue: string;
  lastQtrGrossMargin: string;
  lastQtrDOI: string;
}

const holdingsData: Holding[] = [
  {
    symbol: 'TSM',
    price: 168.42,
    change: 2.14,
    changePct: 1.29,
    shares: 120,
    cost: 105.3,
    todayGain: 256.8,
    todayGainPct: 1.29,
    revenue: '$25.53B',
    revenueQoQ: '+3.8%',
    revenueYoY: '+35.3%',
    grossMargin: '58.8%',
    doi: '72',
    nextEarning: 'Jul 17, 2025',
    lastQtrRevenue: '$26.88B',
    lastQtrGrossMargin: '59.0%',
    lastQtrDOI: '68',
  },
  {
    symbol: 'TSLA',
    price: 248.73,
    change: -3.82,
    changePct: -1.51,
    shares: 50,
    cost: 196.4,
    todayGain: -191.0,
    todayGainPct: -1.51,
    revenue: '$19.34B',
    revenueQoQ: '-4.2%',
    revenueYoY: '-9.3%',
    grossMargin: '17.1%',
    doi: '55',
    nextEarning: 'Jul 22, 2025',
    lastQtrRevenue: '$25.71B',
    lastQtrGrossMargin: '19.8%',
    lastQtrDOI: '51',
  },
  {
    symbol: 'QCOM',
    price: 152.61,
    change: 1.28,
    changePct: 0.85,
    shares: 80,
    cost: 128.9,
    todayGain: 102.4,
    todayGainPct: 0.85,
    revenue: '$10.84B',
    revenueQoQ: '+1.2%',
    revenueYoY: '+17.3%',
    grossMargin: '55.9%',
    doi: '84',
    nextEarning: 'Jul 30, 2025',
    lastQtrRevenue: '$11.67B',
    lastQtrGrossMargin: '56.3%',
    lastQtrDOI: '79',
  },
  {
    symbol: 'GOOGL',
    price: 168.94,
    change: 0.72,
    changePct: 0.43,
    shares: 60,
    cost: 138.5,
    todayGain: 43.2,
    todayGainPct: 0.43,
    revenue: '$90.23B',
    revenueQoQ: '+2.7%',
    revenueYoY: '+12.8%',
    grossMargin: '57.3%',
    doi: 'N/A',
    nextEarning: 'Apr 29, 2025',
    lastQtrRevenue: '$96.47B',
    lastQtrGrossMargin: '58.1%',
    lastQtrDOI: 'N/A',
  },
  {
    symbol: 'SONY',
    price: 21.34,
    change: -0.18,
    changePct: -0.84,
    shares: 200,
    cost: 18.7,
    todayGain: -36.0,
    todayGainPct: -0.84,
    revenue: '$22.18B',
    revenueQoQ: '-8.3%',
    revenueYoY: '+4.6%',
    grossMargin: '28.4%',
    doi: '42',
    nextEarning: 'May 14, 2025',
    lastQtrRevenue: '$28.74B',
    lastQtrGrossMargin: '27.9%',
    lastQtrDOI: '38',
  },
  {
    symbol: 'AAPL',
    price: 212.49,
    change: 1.54,
    changePct: 0.73,
    shares: 45,
    cost: 167.8,
    todayGain: 69.3,
    todayGainPct: 0.73,
    revenue: '$95.36B',
    revenueQoQ: '-23.4%',
    revenueYoY: '+5.1%',
    grossMargin: '47.2%',
    doi: '8',
    nextEarning: 'May 1, 2025',
    lastQtrRevenue: '$124.30B',
    lastQtrGrossMargin: '46.9%',
    lastQtrDOI: '7',
  },
  {
    symbol: 'NVDA',
    price: 884.27,
    change: 12.43,
    changePct: 1.43,
    shares: 30,
    cost: 512.6,
    todayGain: 372.9,
    todayGainPct: 1.43,
    revenue: '$44.07B',
    revenueQoQ: '+12.4%',
    revenueYoY: '+69.2%',
    grossMargin: '74.6%',
    doi: '28',
    nextEarning: 'May 28, 2025',
    lastQtrRevenue: '$39.33B',
    lastQtrGrossMargin: '73.5%',
    lastQtrDOI: '31',
  },
  {
    symbol: 'ASML',
    price: 682.14,
    change: -4.32,
    changePct: -0.63,
    shares: 20,
    cost: 598.0,
    todayGain: -86.4,
    todayGainPct: -0.63,
    revenue: '$7.74B',
    revenueQoQ: '-12.8%',
    revenueYoY: '+46.1%',
    grossMargin: '52.7%',
    doi: '185',
    nextEarning: 'Jul 16, 2025',
    lastQtrRevenue: '$9.26B',
    lastQtrGrossMargin: '51.9%',
    lastQtrDOI: '179',
  },
];

// ── News feed items ───────────────────────────────────────────────────────────
interface FeedItem {
  id: number;
  avatar: 'alpha' | 'user';
  title: string;
  tickers: string[];
  source: string;
  time: string;
  comments?: number;
}

const feedItems: FeedItem[] = [
  {
    id: 1,
    avatar: 'alpha',
    title: 'Anthropic says no sensitive data exposed in leak of code behind Claude AI agent',
    tickers: ['GOOGL'],
    source: 'SA News',
    time: 'Today, 10:18 AM',
    comments: 11,
  },
  {
    id: 2,
    avatar: 'user',
    title: "A Major Market Rotation Is Likely Coming: Here's Where I'm Loading Up",
    tickers: ['AMZN', 'META'],
    source: 'Samuel Smith',
    time: 'Today, 10:17 AM',
  },
  {
    id: 3,
    avatar: 'alpha',
    title: 'Most and least shorted large-cap tech stocks as of March',
    tickers: ['AAPL', 'NVDA'],
    source: 'SA News',
    time: 'Today, 10:05 AM',
  },
  {
    id: 4,
    avatar: 'alpha',
    title: 'AI, chip stocks tumble as Trump plans to strike Iran hard',
    tickers: ['AMD', 'INTC'],
    source: 'SA News',
    time: 'Today, 10:05 AM',
    comments: 16,
  },
  {
    id: 5,
    avatar: 'alpha',
    title: 'Biggest stock movers Thursday: Oil and gas stocks, TSLA, and more',
    tickers: ['AMD', 'NVDA'],
    source: 'SA News',
    time: 'Today, 9:52 AM',
  },
  {
    id: 6,
    avatar: 'alpha',
    title: "ETFs tied to Tesla slide as the EV maker's delivery miss pressures stock",
    tickers: ['TSLA'],
    source: 'SA News',
    time: 'Today, 9:29 AM',
    comments: 2,
  },
];

// ── Quarter navigation helpers ────────────────────────────────────────────────
const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
function quarterOffset(base: { year: number; q: number }, offset: number): { year: number; q: number } {
  const totalQ = base.year * 4 + (base.q - 1) + offset;
  return { year: Math.floor(totalQ / 4), q: (totalQ % 4) + 1 };
}

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 60;
  const h = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points
    .map((v, i) => `${i * step},${h - ((v - min) / range) * (h - 4) - 2}`)
    .join(' ');
  const color = positive ? '#16a34a' : '#dc2626';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={coords} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Alpha Avatar ──────────────────────────────────────────────────────────────
function AlphaAvatar() {
  return (
    <div className="wl-feed-avatar wl-feed-avatar--alpha">
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
        <circle cx="14" cy="14" r="14" fill="#e5e7eb" />
        <text x="14" y="19" textAnchor="middle" fontSize="14" fill="#9ca3af" fontFamily="serif">
          α
        </text>
      </svg>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="wl-feed-avatar">
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28">
        <circle cx="14" cy="14" r="14" fill="#d1d5db" />
        <circle cx="14" cy="11" r="4" fill="#9ca3af" />
        <ellipse cx="14" cy="22" rx="7" ry="4" fill="#9ca3af" />
      </svg>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState<'Summary' | 'Health Score' | 'Ratings' | 'Holdings'>(
    'Summary',
  );
  const [feedTab, setFeedTab] = useState<'Latest' | 'Analysis' | 'News' | 'Warnings'>('Latest');
  const [quarter, setQuarter] = useState({ year: 2026, q: 1 });

  const prevQ = quarterOffset(quarter, -1);
  const nextQ = quarterOffset(quarter, 1);

  const totalValue = holdingsData.reduce((sum, h) => sum + h.price * h.shares, 0);
  const totalGain = holdingsData.reduce((sum, h) => sum + h.todayGain, 0);
  const totalGainPct = (totalGain / (totalValue - totalGain)) * 100;

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad wl-page">
            {/* ── Stock Indexes Bar ─────────────────────────────────── */}
            <section className="wl-indexes-section">
              <div className="wl-indexes-label">Stock Indexes</div>
              <div className="wl-indexes-scroll">
                <div className="wl-indexes-track">
                  {stockIndexes.map((idx) => {
                    const pos = idx.change >= 0;
                    return (
                      <div className="wl-index-card" key={idx.name}>
                        <div className="wl-index-name">{idx.name}</div>
                        <div className="wl-index-value">{idx.value.toLocaleString()}</div>
                        <div className={`wl-index-change ${pos ? 'pos' : 'neg'}`}>
                          {pos ? '+' : ''}
                          {idx.change.toFixed(2)}&nbsp;
                          <span>
                            ({pos ? '+' : ''}
                            {idx.changePct.toFixed(2)}%)
                          </span>
                        </div>
                        <div className="wl-index-spark">
                          <Sparkline points={idx.trend} positive={pos} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="wl-indexes-arrows">
                  <button className="wl-arrow-btn" aria-label="Scroll left">
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <path
                        d="M9 2.5L4.5 7L9 11.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button className="wl-arrow-btn" aria-label="Scroll right">
                    <svg viewBox="0 0 14 14" fill="none" width="14" height="14">
                      <path
                        d="M5 2.5L9.5 7L5 11.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            {/* ── Portfolio Header ──────────────────────────────────── */}
            <section className="wl-portfolio-section">
              <div className="wl-portfolio-left">
                {/* Title row */}
                <div className="wl-portfolio-title-row">
                  <span className="wl-portfolio-title">Watchlist 1</span>
                  <svg viewBox="0 0 14 14" fill="none" width="14" height="14" className="wl-portfolio-chevron">
                    <path
                      d="M3 5L7 9L11 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Summary row */}
                <div className="wl-portfolio-summary">
                  {/* Eye icon */}
                  <svg viewBox="0 0 14 14" fill="none" width="16" height="16" className="wl-eye-icon">
                    <path
                      d="M1.5 7C1.5 7 3.5 3 7 3C10.5 3 12.5 7 12.5 7C12.5 7 10.5 11 7 11C3.5 11 1.5 7 1.5 7Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                    <circle cx="7" cy="7" r="1.8" fill="currentColor" />
                  </svg>

                  <span className="wl-total-value">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>

                  <span className={`wl-daily-change ${totalGain >= 0 ? 'pos' : 'neg'}`}>
                    <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                      {totalGain >= 0 ? (
                        <path d="M7 2.5L11 7H3L7 2.5Z" fill="currentColor" />
                      ) : (
                        <path d="M7 11.5L3 7H11L7 11.5Z" fill="currentColor" />
                      )}
                    </svg>
                    {totalGain >= 0 ? '+' : ''}
                    {totalGain.toFixed(2)} ({totalGainPct >= 0 ? '+' : ''}
                    {totalGainPct.toFixed(2)}%)
                  </span>

                  {/* Quarter nav */}
                  <div className="wl-quarter-nav">
                    <button
                      className="wl-quarter-btn"
                      aria-label="Previous quarter"
                      onClick={() => setQuarter(prevQ)}
                    >
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                        <path
                          d="M9 2.5L4.5 7L9 11.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <span className="wl-quarter-label">
                      {quarter.year} {QUARTERS[quarter.q - 1]}
                    </span>
                    <button
                      className="wl-quarter-btn"
                      aria-label="Next quarter"
                      onClick={() => setQuarter(nextQ)}
                    >
                      <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                        <path
                          d="M5 2.5L9.5 7L5 11.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="wl-action-btns">
                <button className="wl-action-btn">
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M7 2V12M2 7H12"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  Add Symbol
                </button>
                <button className="wl-action-btn">
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M9 2.5L11.5 5L5 11.5H2.5V9L9 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Edit Watchlist
                </button>
                <button className="wl-action-btn">
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M7 1v8M4.5 6.5L7 9l2.5-2.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 10.5c0 .5.5 1 1 1h8c.5 0 1-.5 1-1"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Manage Alerts
                </button>
                <button className="wl-action-btn">
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <path
                      d="M7 1.5v8M4 6.5L7 10l3-3.5"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 11h10"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  Download
                </button>
                <button className="wl-action-btn">
                  <svg viewBox="0 0 14 14" fill="none" width="13" height="13">
                    <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                    <rect x="3" y="3" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                  Layout
                </button>
              </div>
            </section>

            {/* ── Sub-tabs ───────────────────────────────────────────── */}
            <div className="wl-subtabs">
              {(['Summary', 'Health Score', 'Ratings', 'Holdings'] as const).map((t) => (
                <button
                  key={t}
                  className={`wl-subtab${activeTab === t ? ' active' : ''}`}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </button>
              ))}
              <button className="wl-subtab wl-subtab--add">
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                  <path d="M7 2V12M2 7H12" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Add View
              </button>
            </div>

            {/* ── Holdings Table ─────────────────────────────────────── */}
            <div className="wl-table-wrap">
              <table className="wl-table">
                <thead>
                  <tr>
                    <th className="wl-th wl-th--sticky">
                      Symbol
                      <svg viewBox="0 0 14 14" fill="none" width="10" height="10" style={{ marginLeft: 4 }}>
                        <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </th>
                    <th className="wl-th">Price</th>
                    <th className="wl-th">Change</th>
                    <th className="wl-th">Change %</th>
                    <th className="wl-th">Shares</th>
                    <th className="wl-th">Cost</th>
                    <th className="wl-th">Today&apos;s Gain</th>
                    <th className="wl-th">Today&apos;s % Gain</th>
                    <th className="wl-th">Revenue</th>
                    <th className="wl-th">Revenue QoQ</th>
                    <th className="wl-th">Revenue YoY</th>
                    <th className="wl-th">Gross Margin</th>
                    <th className="wl-th">DOI</th>
                    <th className="wl-th">Next Earning Release</th>
                    <th className="wl-th">Last Qtr Revenue</th>
                    <th className="wl-th">Last Qtr Gross Margin</th>
                    <th className="wl-th">Last Qtr DOI</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsData.map((h) => (
                    <tr key={h.symbol} className="wl-tr">
                      <td className="wl-td wl-td--sticky wl-symbol">{h.symbol}</td>
                      <td className="wl-td">{h.price.toFixed(2)}</td>
                      <td className={`wl-td ${h.change >= 0 ? 'pos' : 'neg'}`}>
                        {h.change >= 0 ? '+' : ''}
                        {h.change.toFixed(2)}
                      </td>
                      <td className={`wl-td ${h.changePct >= 0 ? 'pos' : 'neg'}`}>
                        {h.changePct >= 0 ? '+' : ''}
                        {h.changePct.toFixed(2)}%
                      </td>
                      <td className="wl-td">{h.shares}</td>
                      <td className="wl-td">{h.cost.toFixed(2)}</td>
                      <td className={`wl-td ${h.todayGain >= 0 ? 'pos' : 'neg'}`}>
                        {h.todayGain >= 0 ? '+' : ''}
                        {h.todayGain.toFixed(2)}
                      </td>
                      <td className={`wl-td ${h.todayGainPct >= 0 ? 'pos' : 'neg'}`}>
                        {h.todayGainPct >= 0 ? '+' : ''}
                        {h.todayGainPct.toFixed(2)}%
                      </td>
                      <td className="wl-td">{h.revenue}</td>
                      <td className={`wl-td ${h.revenueQoQ.startsWith('+') ? 'pos' : 'neg'}`}>
                        {h.revenueQoQ}
                      </td>
                      <td className={`wl-td ${h.revenueYoY.startsWith('+') ? 'pos' : 'neg'}`}>
                        {h.revenueYoY}
                      </td>
                      <td className="wl-td">{h.grossMargin}</td>
                      <td className="wl-td">{h.doi}</td>
                      <td className="wl-td">{h.nextEarning}</td>
                      <td className="wl-td">{h.lastQtrRevenue}</td>
                      <td className="wl-td">{h.lastQtrGrossMargin}</td>
                      <td className="wl-td">{h.lastQtrDOI}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Content feed section ───────────────────────────────── */}
            <section className="wl-feed-section">
              {/* Feed tabs */}
              <div className="wl-feed-tabs">
                {(['Latest', 'Analysis', 'News', 'Warnings'] as const).map((t) => (
                  <button
                    key={t}
                    className={`wl-feed-tab${feedTab === t ? ' active' : ''}`}
                    onClick={() => setFeedTab(t)}
                  >
                    {t}
                    {t === 'News' && <span className="wl-free-badge">FREE</span>}
                  </button>
                ))}
              </div>

              {/* Feed list */}
              <div className="wl-feed-list">
                {feedItems.map((item, idx) => (
                  <div key={item.id} className={`wl-feed-item${idx < feedItems.length - 1 ? ' wl-feed-item--bordered' : ''}`}>
                    {item.avatar === 'alpha' ? <AlphaAvatar /> : <UserAvatar />}
                    <div className="wl-feed-body">
                      <div className="wl-feed-title">{item.title}</div>
                      <div className="wl-feed-meta">
                        <span className="wl-feed-tickers">
                          {item.tickers.map((t, i) => (
                            <span key={t}>
                              {i > 0 && ', '}
                              <a href="#" className="wl-feed-ticker">
                                {t}
                              </a>
                            </span>
                          ))}
                        </span>
                        <span className="wl-feed-dot">•</span>
                        <span className="wl-feed-source">{item.source}</span>
                        <span className="wl-feed-dot">•</span>
                        <span className="wl-feed-time">{item.time}</span>
                        {item.comments !== undefined && (
                          <>
                            <span className="wl-feed-dot">•</span>
                            <span className="wl-feed-comments">
                              <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                                <path
                                  d="M1.5 2h11A.5.5 0 0 1 13 2.5v7a.5.5 0 0 1-.5.5H4L1.5 12.5V2.5A.5.5 0 0 1 2 2h-.5z"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              {item.comments} Comments
                            </span>
                          </>
                        )}
                        <span className="wl-feed-dot">•</span>
                        <span className="wl-feed-save">
                          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                            <path
                              d="M3 1.5h8v11L7 10 3 12.5V1.5Z"
                              stroke="currentColor"
                              strokeWidth="1.2"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Save
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
