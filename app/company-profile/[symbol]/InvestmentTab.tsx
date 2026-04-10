'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import investmentData from '@/content/apple-investment.json';

const InvestmentBarLineChartNivo = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.InvestmentBarLineChartNivo),
  { ssr: false, loading: () => <div style={{ height: 260, background: '#f3f4f6', borderRadius: 8 }} /> },
);

const MABarChartSmallNivo = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.MABarChartSmallNivo),
  { ssr: false, loading: () => <div style={{ height: 180, background: '#f3f4f6', borderRadius: 8 }} /> },
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

interface InvestmentDeal {
  date: string;
  investedCompany: string;
  categories: string;
  round: string;
  valueM: number | null;
  investorsNum: number | null;
  url: string;
}

// ── Parse Apple investment data from JSON ────────────────────────────────────

let _aaplInvestments: InvestmentDeal[] | null = null;
function getAAPLInvestments(): InvestmentDeal[] {
  if (!_aaplInvestments) {
    _aaplInvestments = (investmentData as { investments: InvestmentDeal[] }).investments;
  }
  return _aaplInvestments;
}

// ── AAPL Investment Panel ──────────────────────────────────────────────────────

const CHART_START_YEAR = 2012;
const CHART_END_YEAR = 2026;

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 1h4v4M7 6l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AAPLInvestmentPanel() {
  const deals = getAAPLInvestments();
  const allCategories = [...new Set(deals.map((d) => d.categories))].sort();

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function scrollCategories(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -150 : 150, behavior: 'smooth' });
  }

  const filteredDeals =
    selectedCategories.size === 0 ? deals : deals.filter((d) => selectedCategories.has(d.categories));

  const sortedDeals = [...filteredDeals]
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
      {/* ── Category filter bar ── */}
      <div className="aapl-ma-filter-bar">
        <span className="aapl-ma-filter-label">CATEGORY</span>
        <button className="aapl-ma-scroll-btn" onClick={() => scrollCategories('left')} aria-label="Scroll left">‹</button>
        <div className="aapl-ma-tags-scroll" ref={scrollRef}>
          <button
            className={`aapl-ma-industry-tag${selectedCategories.size === 0 ? ' aapl-ma-industry-tag--active' : ''}`}
            onClick={() => setSelectedCategories(new Set())}
          >
            All
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat}
              className={`aapl-ma-industry-tag${selectedCategories.has(cat) ? ' aapl-ma-industry-tag--active' : ''}`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <button className="aapl-ma-scroll-btn" onClick={() => scrollCategories('right')} aria-label="Scroll right">›</button>
        {selectedCategories.size > 0 && (
          <button className="aapl-ma-clear-btn" onClick={() => setSelectedCategories(new Set())}>
            Clear
          </button>
        )}
      </div>

      {/* ── Bar + Line chart ── */}
      <div className="aapl-ma-chart-section">
        <div className="aapl-ma-section-title">
          Apple Inc. — Annual Investment Activity ({CHART_START_YEAR}–{CHART_END_YEAR})
          {selectedCategories.size > 0 && (
            <span className="aapl-ma-filter-note"> · Filtered: {[...selectedCategories].join(', ')}</span>
          )}
        </div>
        <InvestmentBarLineChartNivo deals={filteredDeals} selectedYear={selectedYear} onYearClick={handleYearClick} />
      </div>

      {/* ── Table ── */}
      <div className="aapl-ma-table-section" ref={tableRef}>
        <div className="aapl-ma-section-title">
          Table View ({sortedDeals.length} deal{sortedDeals.length !== 1 ? 's' : ''}
          {selectedCategories.size > 0 ? ', filtered' : ''}
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
                <th>Invested Company</th>
                <th>Company Categories</th>
                <th>Round</th>
                <th className="text-right">Value (USD $M)</th>
                <th className="text-right">Investors#</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.map((deal, i) => (
                <tr key={i} className="aapl-ma-table-row">
                  <td className="aapl-ma-td-date">{deal.date}</td>
                  <td className="aapl-ma-td-company">{deal.investedCompany}</td>
                  <td><span className="aapl-ma-industry-pill">{deal.categories}</span></td>
                  <td><span className="aapl-ma-type-badge aapl-ma-type-acq">{deal.round}</span></td>
                  <td className="text-right aapl-ma-td-value">
                    {deal.valueM != null ? (
                      deal.valueM >= 1000
                        ? `$${(deal.valueM / 1000).toFixed(2)}B`
                        : `$${deal.valueM.toLocaleString()}M`
                    ) : (
                      <span className="aapl-ma-undisclosed">Undisclosed</span>
                    )}
                  </td>
                  <td className="text-right">
                    {deal.investorsNum != null ? deal.investorsNum : <span className="aapl-ma-undisclosed">—</span>}
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
        <MABarChartSmallNivo data={data} />
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
  { key: 'heat-maps', label: 'Investment Heat Maps' },
];

interface InvestmentTabProps {
  symbol: string;
}

export default function InvestmentTab({ symbol }: InvestmentTabProps) {
  const [activeSection, setActiveSection] = useState<MASection>('number-value');
  const [activeRegion, setActiveRegion] = useState<Region>('Worldwide');

  // AAPL gets a dedicated panel with industry filter, bar chart, and table
  if (symbol === 'AAPL') {
    return <AAPLInvestmentPanel />;
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
