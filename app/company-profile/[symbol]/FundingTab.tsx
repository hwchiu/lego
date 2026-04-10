'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import fundingData from '@/content/apple-funding.json';

const FundingLineChartNivo = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.FundingLineChartNivo),
  { ssr: false, loading: () => <div style={{ height: 220, background: '#f3f4f6', borderRadius: 8 }} /> },
);

// ── Types ─────────────────────────────────────────────────────────────────────

type MASection = 'number-value' | 'largest' | 'heat-maps';
type Region =
  | 'Worldwide'
  | 'North America'
  | 'Europe'
  | 'Asia-Pacific'
  | 'Middle East & Africa'
  | 'South America';

interface FundingDeal {
  date: string;
  investors: string;
  round: string;
  numInvestors: number | null;
  valueM: number | null;
  url: string;
}

// ── Parse Apple funding data from JSON ───────────────────────────────────────

let _aaplFundings: FundingDeal[] | null = null;
function getAAPLFundings(): FundingDeal[] {
  if (!_aaplFundings) {
    _aaplFundings = (fundingData as { fundings: FundingDeal[] }).fundings;
  }
  return _aaplFundings;
}

// ── Funding Line Chart ────────────────────────────────────────────────────────

interface YearFundingData {
  year: number;
  totalValueM: number;
}

function buildFundingYearData(deals: FundingDeal[]): YearFundingData[] {
  const yearMap = new Map<number, number>();
  for (const d of deals) {
    const yr = parseInt(d.date.slice(0, 4), 10);
    if (d.valueM != null) {
      yearMap.set(yr, (yearMap.get(yr) ?? 0) + d.valueM);
    }
  }
  const years = [...yearMap.keys()].sort((a, b) => a - b);
  return years.map((y) => ({ year: y, totalValueM: yearMap.get(y)! }));
}

function FundingLineChart({ deals }: { deals: FundingDeal[] }) {
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; year: number; valueM: number;
  } | null>(null);

  const yearData = buildFundingYearData(deals);
  if (yearData.length === 0) return null;

  const W = 820;
  const H = 200;
  const PAD = { top: 24, right: 30, bottom: 40, left: 80 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxValue = Math.max(...yearData.map((d) => d.totalValueM), 1);
  const valueMax = Math.ceil(maxValue / 5000) * 5000 || 5000;

  const minYear = yearData[0].year;
  const maxYear = yearData[yearData.length - 1].year;
  const yearRange = maxYear - minYear || 1;

  const points = yearData.map((d) => {
    const x = PAD.left + ((d.year - minYear) / yearRange) * chartW;
    const y = PAD.top + chartH - (d.totalValueM / valueMax) * chartH;
    return { x, y, year: d.year, value: d.totalValueM };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseLeave={() => setTooltip(null)}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + chartH * (1 - t);
          return (
            <g key={t}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
              <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                {valueMax * t >= 1000 ? `$${((valueMax * t) / 1000).toFixed(0)}B` : `$${Math.round(valueMax * t)}M`}
              </text>
            </g>
          );
        })}

        <text
          x={PAD.left - 60}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          fontSize="9"
          fill="#6b7280"
          transform={`rotate(-90, ${PAD.left - 60}, ${PAD.top + chartH / 2})`}
        >
          USD $M
        </text>

        {/* X-axis year labels */}
        {yearData.map((d) => {
          const x = PAD.left + ((d.year - minYear) / yearRange) * chartW;
          return (
            <text key={d.year} x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {d.year}
            </text>
          );
        })}

        <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth="1" />

        <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p) => (
          <circle
            key={p.year}
            cx={p.x} cy={p.y} r="4"
            fill="#3b82f6" stroke="#fff" strokeWidth="1.5"
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => {
              const svgEl = (e.currentTarget as SVGElement).closest('svg');
              if (!svgEl) return;
              const rect = svgEl.getBoundingClientRect();
              const scaleX = rect.width / W;
              const scaleY = rect.height / H;
              setTooltip({ x: p.x * scaleX, y: (p.y - 8) * scaleY, year: p.year, valueM: p.value });
            }}
          />
        ))}
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
            padding: '6px 10px',
            borderRadius: 6,
            fontSize: 11,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 10,
          }}
        >
          <strong>{tooltip.year}</strong>
          <div>
            {tooltip.valueM >= 1000
              ? `$${(tooltip.valueM / 1000).toFixed(1)}B`
              : `$${tooltip.valueM.toLocaleString()}M`}
          </div>
        </div>
      )}
    </div>
  );
}

// ── AAPL Funding Panel ────────────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 1h4v4M7 6l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AAPLFundingPanel() {
  const deals = getAAPLFundings();

  const totalFunding = deals.reduce((sum, d) => sum + (d.valueM ?? 0), 0);

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const sortedDeals = [...deals]
    .filter((d) => selectedYear === null || d.date.startsWith(selectedYear))
    .sort((a, b) => b.date.localeCompare(a.date));

  function handleYearClick(year: string | null) {
    setSelectedYear(year);
    if (year !== null) {
      setTimeout(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }

  return (
    <div className="aapl-ma-panel">
      {/* ── Total Funding Card ── */}
      <div className="aapl-funding-summary-row">
        <div className="aapl-funding-total-card">
          <div className="aapl-funding-total-title">Total Funding Amount (USD $M)</div>
          <div className="aapl-funding-total-value">
            {totalFunding >= 1000
              ? `$${(totalFunding / 1000).toFixed(1)}B`
              : `$${totalFunding.toLocaleString()}M`}
          </div>
          <div className="aapl-funding-total-sub">{deals.length} funding events recorded</div>
        </div>
      </div>

      {/* ── Line chart ── */}
      <div className="aapl-ma-chart-section">
        <div className="aapl-ma-section-title">Apple Inc. — Annual Funding Amount (USD $M)</div>
        <FundingLineChartNivo deals={deals} selectedYear={selectedYear} onYearClick={handleYearClick} />
      </div>

      {/* ── Table ── */}
      <div className="aapl-ma-table-section" ref={tableRef}>
        <div className="aapl-ma-section-title">
          Table View ({sortedDeals.length} event{sortedDeals.length !== 1 ? 's' : ''}
          {selectedYear ? `, ${selectedYear}` : ''})
          {selectedYear && (
            <button
              className="aapl-ma-year-clear-btn"
              onClick={() => setSelectedYear(null)}
              title="Clear year filter"
            >
              × Clear {selectedYear}
            </button>
          )}
        </div>
        <div className="aapl-ma-table-wrap">
          <table className="aapl-ma-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Investors</th>
                <th>Round</th>
                <th className="text-right">Number of Investors</th>
                <th className="text-right">Value (USD $M)</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.map((deal, i) => (
                <tr key={i} className="aapl-ma-table-row">
                  <td className="aapl-ma-td-date">{deal.date}</td>
                  <td className="aapl-ma-td-company">{deal.investors}</td>
                  <td><span className="aapl-ma-type-badge aapl-ma-type-acq">{deal.round}</span></td>
                  <td className="text-right">
                    {deal.numInvestors != null ? deal.numInvestors : <span className="aapl-ma-undisclosed">—</span>}
                  </td>
                  <td className="text-right aapl-ma-td-value">
                    {deal.valueM != null ? (
                      deal.valueM >= 1000
                        ? `$${(deal.valueM / 1000).toFixed(2)}B`
                        : `$${deal.valueM.toLocaleString()}M`
                    ) : (
                      <span className="aapl-ma-undisclosed">Undisclosed</span>
                    )}
                  </td>
                  <td>
                    <a href={deal.url} target="_blank" rel="noopener noreferrer" className="aapl-ma-news-link" title="View source">
                      <ExternalLinkIcon />
                      Link
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Global M&A data (same as market-data/ma page)
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

const LARGEST_DEALS = [
  { rank: 1, acquirer: 'Vodafone', target: 'Mannesmann', value: 202.8, year: 1999, sector: 'Telecom' },
  { rank: 2, acquirer: 'AOL', target: 'Time Warner', value: 164.7, year: 2000, sector: 'Media / Technology' },
  { rank: 3, acquirer: 'Verizon', target: 'Verizon Wireless (Vodafone)', value: 130.2, year: 2013, sector: 'Telecom' },
  { rank: 4, acquirer: 'Anheuser-Busch InBev', target: 'SABMiller', value: 101.5, year: 2016, sector: 'Consumer Goods' },
  { rank: 5, acquirer: 'AT&T', target: 'Time Warner', value: 85.4, year: 2018, sector: 'Media / Telecom' },
  { rank: 6, acquirer: 'ExxonMobil', target: 'Mobil', value: 78.9, year: 1999, sector: 'Energy' },
  { rank: 7, acquirer: 'GlaxoSmithKline', target: 'SmithKline Beecham', value: 75.7, year: 2000, sector: 'Pharma' },
  { rank: 8, acquirer: 'Microsoft', target: 'Activision Blizzard', value: 68.7, year: 2023, sector: 'Technology / Gaming' },
  { rank: 9, acquirer: 'Dell Technologies', target: 'EMC', value: 67.0, year: 2016, sector: 'Technology' },
  { rank: 10, acquirer: 'Pfizer', target: 'Warner-Lambert', value: 90.7, year: 2000, sector: 'Pharma' },
];

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

const REGIONS: Region[] = [
  'Worldwide',
  'North America',
  'Europe',
  'Asia-Pacific',
  'Middle East & Africa',
  'South America',
];

// ── Chart ─────────────────────────────────────────────────────────────────────

function MABarChartSmall({ data }: { data: { year: number; deals: number; value: number }[] }) {
  const W = 520;
  const H = 180;
  const PAD = { top: 16, right: 52, bottom: 30, left: 52 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxDeals = Math.max(...data.map((d) => d.deals));
  const maxValue = Math.max(...data.map((d) => d.value));
  const dealsMax = Math.ceil(maxDeals / 1000) * 1000;
  const valueMax = Math.ceil(maxValue / 1000) * 1000;

  const barGroupW = chartW / data.length;
  const barW = Math.max(6, barGroupW * 0.35);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {[0, 0.5, 1].map((t) => {
        const y = PAD.top + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {Math.round(dealsMax * t).toLocaleString()}
            </text>
            <text x={W - PAD.right + 5} y={y + 4} textAnchor="start" fontSize="9" fill="#6b7280">
              ${Math.round(valueMax * t)}B
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const cx = PAD.left + i * barGroupW + barGroupW / 2;
        const dealH = (d.deals / dealsMax) * chartH;
        const valH = (d.value / valueMax) * chartH;
        return (
          <g key={d.year}>
            <rect x={cx - barW - 1} y={PAD.top + chartH - dealH} width={barW} height={dealH} fill="#3b82f6" opacity="0.85" rx="1" />
            <rect x={cx + 1} y={PAD.top + chartH - valH} width={barW} height={valH} fill="#f59e0b" opacity="0.85" rx="1" />
            <text x={cx} y={H - 6} textAnchor="middle" fontSize="9" fill="#9ca3af">{d.year}</text>
          </g>
        );
      })}
      <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth="1" />
      <rect x={PAD.left} y={5} width="8" height="8" fill="#3b82f6" rx="1" />
      <text x={PAD.left + 11} y={13} fontSize="9" fill="#374151">Deals</text>
      <rect x={PAD.left + 60} y={5} width="8" height="8" fill="#f59e0b" rx="1" />
      <text x={PAD.left + 71} y={13} fontSize="9" fill="#374151">Value ($B)</text>
    </svg>
  );
}

function HeatMapGridSmall({ data }: { data: { sector: string; deals: number; value: number; yoy: number }[] }) {
  const maxDeals = Math.max(...data.map((d) => d.deals));
  return (
    <div className="ma-heat-grid ma-heat-grid--sm">
      {data.map((row) => {
        const intensity = row.deals / maxDeals;
        const bg = `rgba(59, 130, 246, ${0.1 + intensity * 0.65})`;
        const isPos = row.yoy >= 0;
        return (
          <div key={row.sector} className="ma-heat-cell ma-heat-cell--sm" style={{ background: bg }}>
            <div className="ma-heat-sector">{row.sector}</div>
            <div className="ma-heat-deals">{row.deals.toLocaleString()} deals</div>
            <div className={`ma-heat-yoy ${isPos ? 'pos' : 'neg'}`}>
              {isPos ? '+' : ''}{row.yoy}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sub panels ────────────────────────────────────────────────────────────────

function NumberValuePanel({ region }: { region: Region }) {
  const data = MA_DATA[region];

  return (
    <div className="cpma-panel">
      <div className="cpma-section-title">Market Data — {region}</div>

      <div className="ma-chart-card" style={{ marginTop: 12 }}>
        <div className="ma-chart-card-title">Number of Deals &amp; Deal Value (2015–2024)</div>
        <MABarChartSmall data={data} />
      </div>

      <div className="ma-table-wrap" style={{ marginTop: 12 }}>
        <table className="ma-table">
          <thead>
            <tr>
              <th>Year</th>
              <th className="text-right">Deals</th>
              <th className="text-right">Value ($B)</th>
              <th className="text-right">YoY Deals</th>
            </tr>
          </thead>
          <tbody>
            {[...data].reverse().slice(0, 5).map((row, idx, arr) => {
              const prevRow = arr[idx + 1];
              const dDelta = prevRow ? ((row.deals - prevRow.deals) / prevRow.deals * 100).toFixed(1) : null;
              return (
                <tr key={row.year} className="ma-table-row">
                  <td>{row.year}</td>
                  <td className="text-right">{row.deals.toLocaleString()}</td>
                  <td className="text-right">${row.value}B</td>
                  <td className={`text-right ${dDelta !== null ? (parseFloat(dDelta) >= 0 ? 'pos' : 'neg') : ''}`}>
                    {dDelta !== null ? `${parseFloat(dDelta) >= 0 ? '+' : ''}${dDelta}%` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="ma-source-note">Source: IMAA, 2024</div>
    </div>
  );
}

function LargestPanel() {
  return (
    <div className="cpma-panel">
      <div className="cpma-section-title">Largest M&amp;A Transactions of All Time</div>
      <div className="ma-table-wrap" style={{ marginTop: 12 }}>
        <table className="ma-table">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th>Acquirer</th>
              <th>Target</th>
              <th className="text-right">Value ($B)</th>
              <th className="text-center">Year</th>
              <th>Sector</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ma-source-note">Source: IMAA, 2024</div>
    </div>
  );
}

function HeatMapsPanel({ region }: { region: Region }) {
  const data = HEAT_MAP_DATA[region];
  return (
    <div className="cpma-panel">
      <div className="cpma-section-title">M&A Heat Map — {region}</div>
      <div className="ma-chart-card" style={{ marginTop: 12 }}>
        <div className="ma-chart-card-title">Sector Activity Heat Map — 2024</div>
        <HeatMapGridSmall data={data} />
      </div>
      <div className="ma-table-wrap" style={{ marginTop: 12 }}>
        <table className="ma-table">
          <thead>
            <tr>
              <th>Sector</th>
              <th className="text-right">Deals</th>
              <th className="text-right">Value ($B)</th>
              <th className="text-right">YoY</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.sector} className="ma-table-row">
                <td>{row.sector}</td>
                <td className="text-right">{row.deals}</td>
                <td className="text-right">${row.value}B</td>
                <td className={`text-right ${row.yoy >= 0 ? 'pos' : 'neg'}`}>
                  {row.yoy >= 0 ? '+' : ''}{row.yoy}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ma-source-note">Source: IMAA, 2024</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const SECTIONS: { key: MASection; label: string }[] = [
  { key: 'number-value', label: 'Number & Value' },
  { key: 'largest', label: 'Largest Transactions' },
  { key: 'heat-maps', label: 'Activity Heat Maps' },
];

interface FundingTabProps {
  symbol: string;
}

export default function FundingTab({ symbol }: FundingTabProps) {
  const [activeSection, setActiveSection] = useState<MASection>('number-value');
  const [activeRegion, setActiveRegion] = useState<Region>('Worldwide');

  // AAPL gets a dedicated panel with industry filter, bar chart, and table
  if (symbol === 'AAPL') {
    return <AAPLFundingPanel />;
  }

  return (
    <div className="fin-stmt-layout cpma-layout">
      {/* ── Left sidebar (same pattern as FIN. Statement) ── */}
      <aside className="fin-stmt-sidebar">
        <nav className="fin-stmt-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`fin-stmt-nav-item${activeSection === s.key ? ' active' : ''}`}
              onClick={() => setActiveSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Right content area ── */}
      <div className="fin-stmt-content cpma-content">

        {/* Region tags (only for number-value and heat-maps) */}
        {activeSection !== 'largest' && (
          <div className="cpma-region-tags">
            {REGIONS.map((r) => (
              <button
                key={r}
                className={`cpma-region-tag${activeRegion === r ? ' active' : ''}`}
                onClick={() => setActiveRegion(r)}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Panel content */}
        {activeSection === 'number-value' && (
          <NumberValuePanel region={activeRegion} />
        )}
        {activeSection === 'largest' && <LargestPanel />}
        {activeSection === 'heat-maps' && <HeatMapsPanel region={activeRegion} />}
      </div>
    </div>
  );
}
