'use client';

import { useState, useRef } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { extractJson } from '@/app/lib/parseContent';
import semiconductorMaMd from '@/content/semiconductor-ma.md';

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab = 'ma-list' | 'number-value' | 'largest' | 'heat-maps';

interface SemiconductorDeal {
  year: number;
  date: string;
  company: string;
  acquirer: string;
  type: string;
  industry: string;
  valueM: number | null;
  newsUrl: string;
}

// ── Parse semiconductor M&A data from markdown ───────────────────────────────

let _semiDeals: SemiconductorDeal[] | null = null;
function getSemiDeals(): SemiconductorDeal[] {
  if (!_semiDeals) {
    const data = extractJson<{ deals: SemiconductorDeal[] }>(semiconductorMaMd as string);
    _semiDeals = data.deals;
  }
  return _semiDeals;
}
type Region =
  | 'Worldwide'
  | 'North America'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Middle East & Africa'
  | 'South America';

// ── Data ──────────────────────────────────────────────────────────────────────

const REGIONS: Region[] = [
  'Worldwide',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Middle East & Africa',
  'South America',
];

// Number of deals and value ($B) by year per region
const MA_DATA: Record<Region, { year: number; deals: number; value: number }[]> = {
  Worldwide: [
    { year: 2015, deals: 4281, value: 4664 },
    { year: 2016, deals: 3779, value: 3609 },
    { year: 2017, deals: 3826, value: 3453 },
    { year: 2018, deals: 4187, value: 3946 },
    { year: 2019, deals: 3830, value: 3572 },
    { year: 2020, deals: 2896, value: 2901 },
    { year: 2021, deals: 5844, value: 5118 },
    { year: 2022, deals: 3803, value: 3359 },
    { year: 2023, deals: 3034, value: 2519 },
    { year: 2024, deals: 3210, value: 2130 },
  ],
  'North America': [
    { year: 2015, deals: 2001, value: 2380 },
    { year: 2016, deals: 1820, value: 1790 },
    { year: 2017, deals: 1855, value: 1740 },
    { year: 2018, deals: 1980, value: 1920 },
    { year: 2019, deals: 1820, value: 1760 },
    { year: 2020, deals: 1360, value: 1450 },
    { year: 2021, deals: 2700, value: 2540 },
    { year: 2022, deals: 1780, value: 1680 },
    { year: 2023, deals: 1420, value: 1230 },
    { year: 2024, deals: 1510, value: 1040 },
  ],
  Europe: [
    { year: 2015, deals: 1240, value: 1180 },
    { year: 2016, deals: 1100, value: 1050 },
    { year: 2017, deals: 1120, value: 980 },
    { year: 2018, deals: 1180, value: 1100 },
    { year: 2019, deals: 1060, value: 990 },
    { year: 2020, deals: 800, value: 760 },
    { year: 2021, deals: 1560, value: 1320 },
    { year: 2022, deals: 1050, value: 910 },
    { year: 2023, deals: 860, value: 680 },
    { year: 2024, deals: 910, value: 580 },
  ],
  'Asia-Pacific': [
    { year: 2015, deals: 850, value: 890 },
    { year: 2016, deals: 740, value: 660 },
    { year: 2017, deals: 760, value: 620 },
    { year: 2018, deals: 820, value: 730 },
    { year: 2019, deals: 760, value: 690 },
    { year: 2020, deals: 590, value: 530 },
    { year: 2021, deals: 1240, value: 980 },
    { year: 2022, deals: 810, value: 620 },
    { year: 2023, deals: 640, value: 490 },
    { year: 2024, deals: 680, value: 420 },
  ],
  'Middle East & Africa': [
    { year: 2015, deals: 120, value: 135 },
    { year: 2016, deals: 80, value: 74 },
    { year: 2017, deals: 55, value: 68 },
    { year: 2018, deals: 110, value: 128 },
    { year: 2019, deals: 95, value: 82 },
    { year: 2020, deals: 72, value: 64 },
    { year: 2021, deals: 195, value: 182 },
    { year: 2022, deals: 120, value: 112 },
    { year: 2023, deals: 82, value: 75 },
    { year: 2024, deals: 72, value: 64 },
  ],
  'South America': [
    { year: 2015, deals: 70, value: 79 },
    { year: 2016, deals: 39, value: 35 },
    { year: 2017, deals: 36, value: 45 },
    { year: 2018, deals: 97, value: 68 },
    { year: 2019, deals: 95, value: 50 },
    { year: 2020, deals: 74, value: 97 },
    { year: 2021, deals: 149, value: 96 },
    { year: 2022, deals: 43, value: 37 },
    { year: 2023, deals: 32, value: 44 },
    { year: 2024, deals: 38, value: 26 },
  ],
};

// Largest M&A transactions (from public records)
const LARGEST_DEALS = [
  { rank: 1, acquirer: 'Vodafone', target: 'Mannesmann', value: 202.8, year: 1999, sector: 'Telecom', acquirerCountry: 'UK', targetCountry: 'Germany' },
  { rank: 2, acquirer: 'AOL', target: 'Time Warner', value: 164.7, year: 2000, sector: 'Media / Technology', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 3, acquirer: 'Verizon', target: 'Verizon Wireless (Vodafone)', value: 130.2, year: 2013, sector: 'Telecom', acquirerCountry: 'USA', targetCountry: 'USA/UK' },
  { rank: 4, acquirer: 'Anheuser-Busch InBev', target: 'SABMiller', value: 101.5, year: 2016, sector: 'Consumer Goods', acquirerCountry: 'Belgium', targetCountry: 'UK' },
  { rank: 5, acquirer: 'AT&T', target: 'Time Warner', value: 85.4, year: 2018, sector: 'Media / Telecom', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 6, acquirer: 'ExxonMobil', target: 'Mobil', value: 78.9, year: 1999, sector: 'Energy', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 7, acquirer: 'GlaxoSmithKline', target: 'SmithKline Beecham', value: 75.7, year: 2000, sector: 'Pharma', acquirerCountry: 'UK', targetCountry: 'UK' },
  { rank: 8, acquirer: 'Microsoft', target: 'Activision Blizzard', value: 68.7, year: 2023, sector: 'Technology / Gaming', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 9, acquirer: 'Dell Technologies', target: 'EMC', value: 67.0, year: 2016, sector: 'Technology', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 10, acquirer: 'Pfizer', target: 'Warner-Lambert', value: 90.7, year: 2000, sector: 'Pharma', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 11, acquirer: 'Royal Dutch Shell', target: 'BG Group', value: 70.0, year: 2016, sector: 'Energy', acquirerCountry: 'Netherlands', targetCountry: 'UK' },
  { rank: 12, acquirer: 'Actavis', target: 'Allergan', value: 70.5, year: 2015, sector: 'Pharma', acquirerCountry: 'Ireland', targetCountry: 'USA' },
  { rank: 13, acquirer: 'Charter Communications', target: 'Time Warner Cable', value: 78.7, year: 2016, sector: 'Telecom / Media', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 14, acquirer: 'Manulife', target: 'John Hancock', value: 10.4, year: 2004, sector: 'Insurance', acquirerCountry: 'Canada', targetCountry: 'USA' },
  { rank: 15, acquirer: 'Eaton', target: 'Cooper Industries', value: 13.1, year: 2012, sector: 'Industrials', acquirerCountry: 'Ireland', targetCountry: 'USA' },
  { rank: 16, acquirer: 'Amazon', target: 'MGM', value: 8.5, year: 2022, sector: 'Media / Technology', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 17, acquirer: 'Broadcom', target: 'VMware', value: 61.0, year: 2023, sector: 'Technology', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 18, acquirer: 'Pfizer', target: 'Wyeth', value: 68.0, year: 2009, sector: 'Pharma', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 19, acquirer: 'Comcast', target: 'NBCUniversal', value: 30.0, year: 2011, sector: 'Media / Telecom', acquirerCountry: 'USA', targetCountry: 'USA' },
  { rank: 20, acquirer: 'United Technologies', target: 'Raytheon', value: 86.5, year: 2020, sector: 'Aerospace & Defense', acquirerCountry: 'USA', targetCountry: 'USA' },
];

// Heat map region data (deal count by sector)
const HEAT_MAP_DATA: Record<Region, { sector: string; deals: number; value: number; yoy: number }[]> = {
  Worldwide: [
    { sector: 'Technology', deals: 820, value: 580, yoy: 12 },
    { sector: 'Healthcare', deals: 540, value: 420, yoy: 8 },
    { sector: 'Financial Services', deals: 480, value: 390, yoy: -5 },
    { sector: 'Energy', deals: 320, value: 280, yoy: 15 },
    { sector: 'Consumer Goods', deals: 290, value: 210, yoy: -3 },
    { sector: 'Industrials', deals: 260, value: 180, yoy: 6 },
    { sector: 'Real Estate', deals: 240, value: 170, yoy: -8 },
    { sector: 'Media & Telecom', deals: 190, value: 160, yoy: -12 },
    { sector: 'Materials', deals: 140, value: 100, yoy: 4 },
    { sector: 'Utilities', deals: 120, value: 90, yoy: 2 },
  ],
  'North America': [
    { sector: 'Technology', deals: 420, value: 310, yoy: 15 },
    { sector: 'Healthcare', deals: 280, value: 220, yoy: 10 },
    { sector: 'Financial Services', deals: 230, value: 195, yoy: -4 },
    { sector: 'Energy', deals: 150, value: 140, yoy: 18 },
    { sector: 'Consumer Goods', deals: 140, value: 110, yoy: -2 },
    { sector: 'Industrials', deals: 120, value: 90, yoy: 5 },
    { sector: 'Real Estate', deals: 110, value: 85, yoy: -7 },
    { sector: 'Media & Telecom', deals: 80, value: 75, yoy: -10 },
    { sector: 'Materials', deals: 60, value: 45, yoy: 3 },
    { sector: 'Utilities', deals: 55, value: 40, yoy: 1 },
  ],
  Europe: [
    { sector: 'Technology', deals: 210, value: 140, yoy: 8 },
    { sector: 'Financial Services', deals: 140, value: 110, yoy: -6 },
    { sector: 'Healthcare', deals: 130, value: 98, yoy: 6 },
    { sector: 'Industrials', deals: 100, value: 72, yoy: 7 },
    { sector: 'Consumer Goods', deals: 90, value: 60, yoy: -4 },
    { sector: 'Energy', deals: 80, value: 68, yoy: 12 },
    { sector: 'Real Estate', deals: 75, value: 55, yoy: -9 },
    { sector: 'Media & Telecom', deals: 60, value: 52, yoy: -14 },
    { sector: 'Materials', deals: 40, value: 30, yoy: 5 },
    { sector: 'Utilities', deals: 35, value: 28, yoy: 3 },
  ],
  'Asia-Pacific': [
    { sector: 'Technology', deals: 150, value: 100, yoy: 10 },
    { sector: 'Financial Services', deals: 90, value: 72, yoy: -3 },
    { sector: 'Healthcare', deals: 80, value: 58, yoy: 9 },
    { sector: 'Energy', deals: 70, value: 62, yoy: 14 },
    { sector: 'Industrials', deals: 65, value: 45, yoy: 4 },
    { sector: 'Consumer Goods', deals: 55, value: 38, yoy: -2 },
    { sector: 'Real Estate', deals: 50, value: 36, yoy: -6 },
    { sector: 'Media & Telecom', deals: 40, value: 30, yoy: -8 },
    { sector: 'Materials', deals: 30, value: 22, yoy: 6 },
    { sector: 'Utilities', deals: 25, value: 18, yoy: 2 },
  ],
  'Middle East & Africa': [
    { sector: 'Energy', deals: 22, value: 28, yoy: 20 },
    { sector: 'Financial Services', deals: 18, value: 14, yoy: -2 },
    { sector: 'Technology', deals: 14, value: 10, yoy: 12 },
    { sector: 'Healthcare', deals: 10, value: 7, yoy: 5 },
    { sector: 'Industrials', deals: 8, value: 5, yoy: 3 },
    { sector: 'Consumer Goods', deals: 6, value: 4, yoy: -1 },
    { sector: 'Real Estate', deals: 5, value: 3, yoy: -4 },
    { sector: 'Materials', deals: 4, value: 3, yoy: 8 },
    { sector: 'Utilities', deals: 3, value: 2, yoy: 1 },
    { sector: 'Media & Telecom', deals: 2, value: 2, yoy: -5 },
  ],
  'South America': [
    { sector: 'Energy', deals: 10, value: 9, yoy: 8 },
    { sector: 'Consumer Goods', deals: 8, value: 5, yoy: -3 },
    { sector: 'Financial Services', deals: 7, value: 5, yoy: -2 },
    { sector: 'Technology', deals: 6, value: 4, yoy: 15 },
    { sector: 'Industrials', deals: 5, value: 3, yoy: 4 },
    { sector: 'Materials', deals: 4, value: 3, yoy: 10 },
    { sector: 'Healthcare', deals: 3, value: 2, yoy: 6 },
    { sector: 'Real Estate', deals: 3, value: 2, yoy: -5 },
    { sector: 'Utilities', deals: 2, value: 1, yoy: 1 },
    { sector: 'Media & Telecom', deals: 1, value: 1, yoy: -8 },
  ],
};

// ── Chart Components ──────────────────────────────────────────────────────────

function MABarChart({ data }: { data: { year: number; deals: number; value: number }[] }) {
  const W = 680;
  const H = 220;
  const PAD = { top: 18, right: 60, bottom: 36, left: 56 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxDeals = Math.max(...data.map((d) => d.deals));
  const maxValue = Math.max(...data.map((d) => d.value));
  const dealsMax = Math.ceil(maxDeals / 1000) * 1000;
  const valueMax = Math.ceil(maxValue / 1000) * 1000;

  const barGroupW = chartW / data.length;
  const barW = Math.max(8, barGroupW * 0.35);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid + axes */}
      {yTicks.map((t) => {
        const y = PAD.top + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {Math.round(dealsMax * t).toLocaleString()}
            </text>
            <text x={W - PAD.right + 8} y={y + 4} textAnchor="start" fontSize="10" fill="#6b7280">
              ${Math.round(valueMax * t)}B
            </text>
          </g>
        );
      })}

      {/* Deal count bars */}
      {data.map((d, i) => {
        const cx = PAD.left + i * barGroupW + barGroupW / 2;
        const dealH = (d.deals / dealsMax) * chartH;
        const valH = (d.value / valueMax) * chartH;
        return (
          <g key={d.year}>
            <rect x={cx - barW - 2} y={PAD.top + chartH - dealH} width={barW} height={dealH} fill="#3b82f6" opacity="0.85" rx="2" />
            <rect x={cx + 2} y={PAD.top + chartH - valH} width={barW} height={valH} fill="#f59e0b" opacity="0.85" rx="2" />
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">{d.year}</text>
          </g>
        );
      })}

      {/* Axis line */}
      <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth="1" />

      {/* Legend */}
      <rect x={PAD.left} y={6} width="10" height="10" fill="#3b82f6" rx="2" />
      <text x={PAD.left + 14} y={15} fontSize="10" fill="#374151">Number of Deals</text>
      <rect x={PAD.left + 110} y={6} width="10" height="10" fill="#f59e0b" rx="2" />
      <text x={PAD.left + 124} y={15} fontSize="10" fill="#374151">Deal Value ($B)</text>
    </svg>
  );
}

function HeatMapGrid({ data }: { data: { sector: string; deals: number; value: number; yoy: number }[] }) {
  const maxDeals = Math.max(...data.map((d) => d.deals));
  return (
    <div className="ma-heat-grid">
      {data.map((row) => {
        const intensity = row.deals / maxDeals;
        const bg = `rgba(59, 130, 246, ${0.1 + intensity * 0.65})`;
        const isPos = row.yoy >= 0;
        return (
          <div key={row.sector} className="ma-heat-cell" style={{ background: bg }}>
            <div className="ma-heat-sector">{row.sector}</div>
            <div className="ma-heat-deals">{row.deals.toLocaleString()} deals</div>
            <div className="ma-heat-value">${row.value}B</div>
            <div className={`ma-heat-yoy ${isPos ? 'pos' : 'neg'}`}>
              {isPos ? '+' : ''}{row.yoy}% YoY
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Region Selector ───────────────────────────────────────────────────────────

function RegionSelector({
  activeRegion,
  onSelect,
}: {
  activeRegion: Region;
  onSelect: (r: Region) => void;
}) {
  return (
    <nav className="ma-region-nav">
      {REGIONS.map((r) => (
        <button
          key={r}
          className={`ma-region-btn${activeRegion === r ? ' active' : ''}`}
          onClick={() => onSelect(r)}
        >
          {r}
        </button>
      ))}
    </nav>
  );
}

// ── Tab Content ───────────────────────────────────────────────────────────────

function NumberValueTab({ region }: { region: Region }) {
  const data = MA_DATA[region];
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const dealsDelta = ((latest.deals - prev.deals) / prev.deals * 100).toFixed(1);
  const valueDelta = ((latest.value - prev.value) / prev.value * 100).toFixed(1);

  return (
    <div className="ma-tab-content">
      <div className="ma-content-header">
        <h3 className="ma-content-title">Number and Value of M&A — {region}</h3>
        <p className="ma-content-sub">Annual M&A transaction count and total deal value in USD billions</p>
      </div>

      {/* KPI strip */}
      <div className="ma-kpi-strip">
        <div className="ma-kpi-card">
          <div className="ma-kpi-label">2024 Deals</div>
          <div className="ma-kpi-value">{latest.deals.toLocaleString()}</div>
          <div className={`ma-kpi-delta ${parseFloat(dealsDelta) >= 0 ? 'pos' : 'neg'}`}>
            {parseFloat(dealsDelta) >= 0 ? '+' : ''}{dealsDelta}% vs 2023
          </div>
        </div>
        <div className="ma-kpi-card">
          <div className="ma-kpi-label">2024 Deal Value</div>
          <div className="ma-kpi-value">${latest.value}B</div>
          <div className={`ma-kpi-delta ${parseFloat(valueDelta) >= 0 ? 'pos' : 'neg'}`}>
            {parseFloat(valueDelta) >= 0 ? '+' : ''}{valueDelta}% vs 2023
          </div>
        </div>
        <div className="ma-kpi-card">
          <div className="ma-kpi-label">Avg Deal Size</div>
          <div className="ma-kpi-value">
            {latest.deals > 0 ? `$${(latest.value / latest.deals * 1000).toFixed(0)}M` : '—'}
          </div>
          <div className="ma-kpi-delta" style={{ color: '#6b7280' }}>per transaction</div>
        </div>
        <div className="ma-kpi-card">
          <div className="ma-kpi-label">Peak Year</div>
          <div className="ma-kpi-value">2021</div>
          <div className="ma-kpi-delta" style={{ color: '#6b7280' }}>
            {data.find(d => d.year === 2021)?.deals.toLocaleString()} deals
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="ma-chart-card">
        <div className="ma-chart-card-title">Number of Deals &amp; Deal Value (2015–2024)</div>
        <MABarChart data={data} />
      </div>

      {/* Data table */}
      <div className="ma-table-wrap">
        <table className="ma-table">
          <thead>
            <tr>
              <th>Year</th>
              <th className="text-right">Number of Deals</th>
              <th className="text-right">Deal Value ($B)</th>
              <th className="text-right">Avg Deal Size ($M)</th>
              <th className="text-right">YoY Deals</th>
              <th className="text-right">YoY Value</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().map((row, idx, arr) => {
              const prevRow = arr[idx + 1];
              const dDelta = prevRow ? ((row.deals - prevRow.deals) / prevRow.deals * 100).toFixed(1) : null;
              const vDelta = prevRow ? ((row.value - prevRow.value) / prevRow.value * 100).toFixed(1) : null;
              return (
                <tr key={row.year} className="ma-table-row">
                  <td className="ma-table-year">{row.year}</td>
                  <td className="text-right">{row.deals.toLocaleString()}</td>
                  <td className="text-right">${row.value.toLocaleString()}B</td>
                  <td className="text-right">{row.deals > 0 ? `$${(row.value / row.deals * 1000).toFixed(0)}M` : '—'}</td>
                  <td className={`text-right ${dDelta !== null ? (parseFloat(dDelta) >= 0 ? 'pos' : 'neg') : ''}`}>
                    {dDelta !== null ? `${parseFloat(dDelta) >= 0 ? '+' : ''}${dDelta}%` : '—'}
                  </td>
                  <td className={`text-right ${vDelta !== null ? (parseFloat(vDelta) >= 0 ? 'pos' : 'neg') : ''}`}>
                    {vDelta !== null ? `${parseFloat(vDelta) >= 0 ? '+' : ''}${vDelta}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LargestTab() {
  return (
    <div className="ma-tab-content">
      <div className="ma-content-header">
        <h3 className="ma-content-title">Largest M&A Transactions of All Time</h3>
        <p className="ma-content-sub">Ranked by announced deal value in USD billions</p>
      </div>

      <div className="ma-table-wrap">
        <table className="ma-table">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th>Acquirer</th>
              <th>Target</th>
              <th className="text-right">Value ($B)</th>
              <th className="text-center">Year</th>
              <th>Sector</th>
              <th>Acquirer Country</th>
              <th>Target Country</th>
            </tr>
          </thead>
          <tbody>
            {LARGEST_DEALS.map((deal) => (
              <tr key={deal.rank} className="ma-table-row">
                <td className="text-center ma-rank-badge">{deal.rank}</td>
                <td className="ma-acquirer">{deal.acquirer}</td>
                <td className="ma-target">{deal.target}</td>
                <td className="text-right ma-deal-value">${deal.value}B</td>
                <td className="text-center">{deal.year}</td>
                <td className="ma-sector-tag">{deal.sector}</td>
                <td>{deal.acquirerCountry}</td>
                <td>{deal.targetCountry}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HeatMapsTab({ region }: { region: Region }) {
  const data = HEAT_MAP_DATA[region];
  return (
    <div className="ma-tab-content">
      <div className="ma-content-header">
        <h3 className="ma-content-title">M&A Heat Maps — {region}</h3>
        <p className="ma-content-sub">Deal activity intensity by sector. Color depth represents relative deal volume.</p>
      </div>

      <div className="ma-chart-card">
        <div className="ma-chart-card-title">Sector Activity Heat Map — 2024</div>
        <HeatMapGrid data={data} />
      </div>

      {/* Sector breakdown table */}
      <div className="ma-table-wrap" style={{ marginTop: 20 }}>
        <table className="ma-table">
          <thead>
            <tr>
              <th>Sector</th>
              <th className="text-right">Deals (2024)</th>
              <th className="text-right">Deal Value ($B)</th>
              <th className="text-right">YoY Change</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.sector} className="ma-table-row">
                <td>{row.sector}</td>
                <td className="text-right">{row.deals.toLocaleString()}</td>
                <td className="text-right">${row.value}B</td>
                <td className={`text-right ${row.yoy >= 0 ? 'pos' : 'neg'}`}>
                  {row.yoy >= 0 ? '+' : ''}{row.yoy}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── M&A List — Semiconductor & AI Companies ──────────────────────────────────

const CHART_START_YEAR = 1988;
const CHART_END_YEAR = 2026;

function MAListBarChart({ deals }: { deals: SemiconductorDeal[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; year: number; val: number } | null>(
    null,
  );

  const years = Array.from(
    { length: CHART_END_YEAR - CHART_START_YEAR + 1 },
    (_, i) => CHART_START_YEAR + i,
  );

  const valueByYear = new Map<number, number>();
  for (const y of years) valueByYear.set(y, 0);
  for (const d of deals) {
    if (d.valueM != null) {
      valueByYear.set(d.year, (valueByYear.get(d.year) ?? 0) + d.valueM);
    }
  }

  const maxVal = Math.max(...years.map((y) => valueByYear.get(y) ?? 0), 1);

  const W = 800;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 40, left: 72 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;
  const barW = Math.max(2, chartW / years.length - 1.5);

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    t,
    val: maxVal * t,
    y: PAD.top + chartH * (1 - t),
  }));

  return (
    <div className="aapl-ma-chart-wrap" style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {yTicks.map(({ t, val, y }) => (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {val >= 1000 ? `$${(val / 1000).toFixed(0)}B` : val > 0 ? `$${Math.round(val)}M` : '$0'}
            </text>
          </g>
        ))}

        {years.map((year, i) => {
          const val = valueByYear.get(year) ?? 0;
          const barH = (val / maxVal) * chartH;
          const cx = PAD.left + i * (chartW / years.length) + (chartW / years.length) / 2;
          const x = cx - barW / 2;
          const y = PAD.top + chartH - barH;
          const showLabel = year % 5 === 0 || year === CHART_END_YEAR;

          return (
            <g key={year}>
              {barH > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill={tooltip?.year === year ? '#1d4ed8' : '#3b82f6'}
                  rx="1"
                  onMouseEnter={(e) => {
                    const svgEl = (e.target as SVGElement).closest('svg');
                    if (!svgEl) return;
                    const rect2 = svgEl.getBoundingClientRect();
                    const scaleX = rect2.width / W;
                    const scaleY = rect2.height / H;
                    setTooltip({ x: cx * scaleX, y: (y - 4) * scaleY, year, val });
                  }}
                  style={{ cursor: 'pointer' }}
                />
              )}
              {showLabel && (
                <text x={cx} y={H - 6} textAnchor="middle" fontSize="8" fill="#9ca3af">
                  {year}
                </text>
              )}
            </g>
          );
        })}

        <line
          x1={PAD.left}
          y1={PAD.top + chartH}
          x2={W - PAD.right}
          y2={PAD.top + chartH}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        <rect x={PAD.left} y={3} width="8" height="8" fill="#3b82f6" rx="1" />
        <text x={PAD.left + 11} y={11} fontSize="9" fill="#374151">
          Total Deal Value (USD, disclosed only)
        </text>
      </svg>

      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            background: '#1f2937',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: 6,
            fontSize: 12,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <strong>{tooltip.year}</strong>:{' '}
          {tooltip.val >= 1000
            ? `$${(tooltip.val / 1000).toFixed(2)}B`
            : `$${tooltip.val.toLocaleString()}M`}
        </div>
      )}
    </div>
  );
}

function getSemiBadgeClass(type: string): string {
  if (type === 'Acquisition') return 'aapl-ma-type-badge aapl-ma-type-acq';
  return 'aapl-ma-type-badge aapl-ma-type-merger';
}

function MAListPanel() {
  const deals = getSemiDeals();
  const allAcquirers = [...new Set(deals.map((d) => d.acquirer))].sort();

  const [selectedAcquirers, setSelectedAcquirers] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  function toggleAcquirer(a: string) {
    setSelectedAcquirers((prev) => {
      const next = new Set(prev);
      if (next.has(a)) next.delete(a);
      else next.add(a);
      return next;
    });
  }

  function scrollTags(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
  }

  const filteredDeals =
    selectedAcquirers.size === 0 ? deals : deals.filter((d) => selectedAcquirers.has(d.acquirer));

  const sortedDeals = [...filteredDeals].sort(
    (a, b) => b.year - a.year || b.date.localeCompare(a.date),
  );

  return (
    <div className="aapl-ma-panel">
      {/* Company filter bar */}
      <div className="aapl-ma-filter-bar">
        <span className="aapl-ma-filter-label">COMPANY</span>
        <button
          className="aapl-ma-scroll-btn"
          onClick={() => scrollTags('left')}
          aria-label="Scroll left"
        >
          ‹
        </button>
        <div className="aapl-ma-tags-scroll" ref={scrollRef}>
          <button
            className={`aapl-ma-industry-tag${selectedAcquirers.size === 0 ? ' aapl-ma-industry-tag--active' : ''}`}
            onClick={() => setSelectedAcquirers(new Set())}
          >
            All
          </button>
          {allAcquirers.map((a) => (
            <button
              key={a}
              className={`aapl-ma-industry-tag${selectedAcquirers.has(a) ? ' aapl-ma-industry-tag--active' : ''}`}
              onClick={() => toggleAcquirer(a)}
            >
              {a}
            </button>
          ))}
        </div>
        <button
          className="aapl-ma-scroll-btn"
          onClick={() => scrollTags('right')}
          aria-label="Scroll right"
        >
          ›
        </button>
        {selectedAcquirers.size > 0 && (
          <button
            className="aapl-ma-clear-btn"
            onClick={() => setSelectedAcquirers(new Set())}
          >
            Clear
          </button>
        )}
      </div>

      {/* Bar chart */}
      <div className="aapl-ma-chart-section">
        <div className="aapl-ma-section-title">
          Semiconductor &amp; AI Companies — Annual M&amp;A Deal Value (1988–2026)
          {selectedAcquirers.size > 0 && (
            <span className="aapl-ma-filter-note">
              {' '}· Filtered: {[...selectedAcquirers].join(', ')}
            </span>
          )}
        </div>
        <MAListBarChart deals={filteredDeals} />
        <div className="aapl-ma-chart-note">
          Bars show disclosed deal values only. Undisclosed transactions are excluded from totals.
        </div>
      </div>

      {/* Table */}
      <div className="aapl-ma-table-section">
        <div className="aapl-ma-section-title">
          M&amp;A Transactions ({filteredDeals.length} deal
          {filteredDeals.length !== 1 ? 's' : ''}
          {selectedAcquirers.size > 0 ? ', filtered' : ''})
        </div>
        <div className="aapl-ma-table-wrap">
          <table className="aapl-ma-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Company</th>
                <th>Source</th>
                <th>Acquirer</th>
                <th className="text-right">Deal Value</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.map((deal, i) => (
                <tr key={i} className="aapl-ma-table-row">
                  <td className="aapl-ma-td-date">{deal.date}</td>
                  <td>
                    <span className={getSemiBadgeClass(deal.type)}>{deal.type}</span>
                  </td>
                  <td className="aapl-ma-td-company">{deal.company}</td>
                  <td>
                    <a
                      href={deal.newsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aapl-ma-news-link"
                      title="View source"
                    >
                      <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                        <path
                          d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8 1h4v4M7 6l5-5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Link
                    </a>
                  </td>
                  <td>
                    <span className="aapl-ma-industry-pill">{deal.acquirer}</span>
                  </td>
                  <td className="text-right aapl-ma-td-value">
                    {deal.valueM != null ? (
                      deal.valueM >= 1000 ? (
                        `$${(deal.valueM / 1000).toFixed(2)}B`
                      ) : (
                        `$${deal.valueM.toLocaleString()}M`
                      )
                    ) : (
                      <span className="aapl-ma-undisclosed">Undisclosed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="aapl-ma-source-note">
          Sources: Company press releases, Reuters, Bloomberg, TechCrunch, Wikipedia. Data covers
          TSMC key suppliers &amp; customers and semiconductor / AI industry leaders.
        </div>
      </div>
    </div>
  );
}

function MAListTab() {
  return (
    <div className="ma-tab-content">
      <div className="ma-content-header">
        <h3 className="ma-content-title">M&amp;A List — Semiconductor &amp; AI Companies</h3>
        <p className="ma-content-sub">
          Key M&amp;A transactions from TSMC suppliers, customers, and leading semiconductor / AI
          companies (1988–2026)
        </p>
      </div>
      <MAListPanel />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'ma-list', label: 'M&A List' },
  { key: 'number-value', label: 'Number and Value M&A' },
  { key: 'largest', label: 'Largest M&A Transactions' },
  { key: 'heat-maps', label: 'M&A Heat Maps' },
];

export default function MarketDataMAPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('ma-list');
  const [activeRegion, setActiveRegion] = useState<Region>('Worldwide');

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad ma-page">

            {/* ── Page header ── */}
            <div className="ma-page-header">
              <div className="section-eyebrow">Market Data</div>
              <h1 className="ma-page-title">Mergers &amp; Acquisitions</h1>
              <p className="ma-page-sub">
                Global M&A statistics, deal analytics, and heat maps powered by IMAA data
              </p>
            </div>

            {/* ── Main tab bar ── */}
            <div className="ma-main-tabs">
              {MAIN_TABS.map((t) => (
                <button
                  key={t.key}
                  className={`ma-main-tab${activeTab === t.key ? ' active' : ''}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Content layout: region nav + content ── */}
            <div className="ma-layout">
              {/* Region nav — only for tabs that use region filtering */}
              {activeTab !== 'largest' && activeTab !== 'ma-list' && (
                <RegionSelector activeRegion={activeRegion} onSelect={setActiveRegion} />
              )}

              {/* Main content */}
              <div
                className={`ma-content${activeTab === 'largest' || activeTab === 'ma-list' ? ' ma-content--full' : ''}`}
              >
                {activeTab === 'ma-list' && <MAListTab />}
                {activeTab === 'number-value' && <NumberValueTab region={activeRegion} />}
                {activeTab === 'largest' && <LargestTab />}
                {activeTab === 'heat-maps' && <HeatMapsTab region={activeRegion} />}
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
