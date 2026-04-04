'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { SP500_COMPANIES } from '@/app/data/sp500';

// ── Constants ────────────────────────────────────────────────────────────────

const RECENTLY_VIEWED_KEY = 'earnings-recently-viewed';
const MAX_RECENTLY_VIEWED = 5;

const SUB_TABS = [
  'Earnings Date',
  'Earnings Quality Ranking',
  'Latest Press Release',
  'Earnings Per Share',
  'Quarterly Earnings Surprise Amount',
  'Yearly Earnings Forecast',
  'Quarterly Earnings Forecast',
  'Change in Consensus',
  'Number of Estimates Changed',
] as const;

type SubTab = (typeof SUB_TABS)[number];

// ── Mock data per company ────────────────────────────────────────────────────

interface EarningsCompanyData {
  symbol: string;
  name: string;
  exchange: string;
  price: number;
  change: number;
  changePct: number;
  marketCap: string;
  volume: string;
  eps: number;
  peRatio: number;
  sector: string;
  nextEarningsDate: string;
  earningsDates: Array<{
    quarter: string;
    reportDate: string;
    epsEstimate: number | null;
    epsActual: number | null;
    surprise: number | null;
    surprisePct: number | null;
  }>;
  qualityRanking: {
    score: number;
    percentile: number;
    grade: string;
    consistencyScore: number;
    growthScore: number;
    qualityScore: number;
  };
  pressReleases: Array<{
    date: string;
    title: string;
    quarter: string;
    url: string;
  }>;
  epsHistory: Array<{
    quarter: string;
    estimate: number;
    actual: number | null;
  }>;
  earningsSurprise: Array<{
    quarter: string;
    surprise: number;
    surprisePct: number;
  }>;
  yearlyForecast: Array<{
    year: string;
    low: number;
    consensus: number;
    high: number;
    numAnalysts: number;
  }>;
  quarterlyForecast: Array<{
    quarter: string;
    low: number;
    consensus: number;
    high: number;
    numAnalysts: number;
  }>;
  consensusChange: Array<{
    period: string;
    oneWeekAgo: number;
    oneMonthAgo: number;
    threeMonthsAgo: number;
    current: number;
  }>;
  estimatesChanged: Array<{
    period: string;
    up: number;
    down: number;
    unchanged: number;
    total: number;
  }>;
}

function buildCompanyData(symbol: string, name: string): EarningsCompanyData {
  // Use symbol hash to vary numbers slightly across companies
  // 65 = ASCII 'A', used as fallback for single-character symbols so seed is always non-zero
  const seed = symbol.charCodeAt(0) + (symbol.charCodeAt(1) || 65);
  const v = (base: number, variance: number) => +(base + ((seed % 7) - 3) * variance).toFixed(2);

  return {
    symbol,
    name,
    exchange: seed % 3 === 0 ? 'NYSE' : 'NASDAQ',
    price: v(178.5, 5),
    change: v(1.23, 0.5),
    changePct: v(0.69, 0.3),
    marketCap: `${(2.7 + (seed % 5) * 0.3).toFixed(1)}T`,
    volume: `${(48 + seed % 20).toFixed(0)}M`,
    eps: v(6.43, 0.5),
    peRatio: v(28.4, 2),
    sector: 'Technology',
    nextEarningsDate: 'Jul 31, 2025',
    earningsDates: [
      { quarter: 'Q2 FY2025', reportDate: 'Jul 31, 2025', epsEstimate: v(1.42, 0.1), epsActual: null, surprise: null, surprisePct: null },
      { quarter: 'Q1 FY2025', reportDate: 'May 1, 2025', epsEstimate: v(1.61, 0.1), epsActual: v(1.65, 0.1), surprise: v(0.04, 0.01), surprisePct: v(2.48, 0.5) },
      { quarter: 'Q4 FY2024', reportDate: 'Jan 30, 2025', epsEstimate: v(2.35, 0.1), epsActual: v(2.40, 0.1), surprise: v(0.05, 0.01), surprisePct: v(2.13, 0.5) },
      { quarter: 'Q3 FY2024', reportDate: 'Oct 31, 2024', epsEstimate: v(1.59, 0.1), epsActual: v(1.64, 0.1), surprise: v(0.05, 0.01), surprisePct: v(3.14, 0.5) },
      { quarter: 'Q2 FY2024', reportDate: 'Aug 1, 2024', epsEstimate: v(1.35, 0.1), epsActual: v(1.40, 0.1), surprise: v(0.05, 0.01), surprisePct: v(3.70, 0.5) },
      { quarter: 'Q1 FY2024', reportDate: 'Feb 1, 2024', epsEstimate: v(2.11, 0.1), epsActual: v(2.18, 0.1), surprise: v(0.07, 0.01), surprisePct: v(3.32, 0.5) },
      { quarter: 'Q4 FY2023', reportDate: 'Nov 2, 2023', epsEstimate: v(1.39, 0.1), epsActual: v(1.46, 0.1), surprise: v(0.07, 0.01), surprisePct: v(5.04, 0.5) },
      { quarter: 'Q3 FY2023', reportDate: 'Aug 3, 2023', epsEstimate: v(1.19, 0.1), epsActual: v(1.26, 0.1), surprise: v(0.07, 0.01), surprisePct: v(5.88, 0.5) },
    ],
    qualityRanking: {
      score: 78 + (seed % 20),
      percentile: 82 + (seed % 15),
      grade: seed % 4 === 0 ? 'A+' : seed % 4 === 1 ? 'A' : seed % 4 === 2 ? 'A-' : 'B+',
      consistencyScore: 85 + (seed % 12),
      growthScore: 75 + (seed % 18),
      qualityScore: 80 + (seed % 15),
    },
    pressReleases: [
      { date: 'May 1, 2025', title: `${name} Reports Second Quarter Results`, quarter: 'Q2 FY2025', url: '#' },
      { date: 'Jan 30, 2025', title: `${name} Reports First Quarter Results`, quarter: 'Q1 FY2025', url: '#' },
      { date: 'Oct 31, 2024', title: `${name} Reports Fourth Quarter and Full Year Results`, quarter: 'Q4 FY2024', url: '#' },
      { date: 'Aug 1, 2024', title: `${name} Reports Third Quarter Results`, quarter: 'Q3 FY2024', url: '#' },
    ],
    epsHistory: [
      { quarter: 'Q2 FY2025', estimate: v(1.42, 0.1), actual: null },
      { quarter: 'Q1 FY2025', estimate: v(1.61, 0.1), actual: v(1.65, 0.1) },
      { quarter: 'Q4 FY2024', estimate: v(2.35, 0.1), actual: v(2.40, 0.1) },
      { quarter: 'Q3 FY2024', estimate: v(1.59, 0.1), actual: v(1.64, 0.1) },
      { quarter: 'Q2 FY2024', estimate: v(1.35, 0.1), actual: v(1.40, 0.1) },
      { quarter: 'Q1 FY2024', estimate: v(2.11, 0.1), actual: v(2.18, 0.1) },
      { quarter: 'Q4 FY2023', estimate: v(1.39, 0.1), actual: v(1.46, 0.1) },
      { quarter: 'Q3 FY2023', estimate: v(1.19, 0.1), actual: v(1.26, 0.1) },
    ],
    earningsSurprise: [
      { quarter: 'Q1 FY2025', surprise: v(0.04, 0.01), surprisePct: v(2.48, 0.5) },
      { quarter: 'Q4 FY2024', surprise: v(0.05, 0.01), surprisePct: v(2.13, 0.5) },
      { quarter: 'Q3 FY2024', surprise: v(0.05, 0.01), surprisePct: v(3.14, 0.5) },
      { quarter: 'Q2 FY2024', surprise: v(0.05, 0.01), surprisePct: v(3.70, 0.5) },
      { quarter: 'Q1 FY2024', surprise: v(0.07, 0.01), surprisePct: v(3.32, 0.5) },
      { quarter: 'Q4 FY2023', surprise: v(0.07, 0.01), surprisePct: v(5.04, 0.5) },
      { quarter: 'Q3 FY2023', surprise: v(0.07, 0.01), surprisePct: v(5.88, 0.5) },
      { quarter: 'Q2 FY2023', surprise: v(-0.01, 0.02), surprisePct: v(-0.82, 0.5) },
    ],
    yearlyForecast: [
      { year: 'FY2025', low: v(6.10, 0.2), consensus: v(6.85, 0.2), high: v(7.50, 0.2), numAnalysts: 28 + (seed % 10) },
      { year: 'FY2026', low: v(6.80, 0.2), consensus: v(7.62, 0.2), high: v(8.30, 0.2), numAnalysts: 24 + (seed % 10) },
      { year: 'FY2027', low: v(7.50, 0.3), consensus: v(8.45, 0.3), high: v(9.20, 0.3), numAnalysts: 18 + (seed % 8) },
    ],
    quarterlyForecast: [
      { quarter: 'Q2 FY2025', low: v(1.35, 0.05), consensus: v(1.42, 0.05), high: v(1.52, 0.05), numAnalysts: 25 + (seed % 8) },
      { quarter: 'Q3 FY2025', low: v(1.52, 0.05), consensus: v(1.62, 0.05), high: v(1.72, 0.05), numAnalysts: 22 + (seed % 8) },
      { quarter: 'Q4 FY2025', low: v(2.20, 0.05), consensus: v(2.38, 0.05), high: v(2.55, 0.05), numAnalysts: 20 + (seed % 8) },
      { quarter: 'Q1 FY2026', low: v(1.68, 0.05), consensus: v(1.78, 0.05), high: v(1.90, 0.05), numAnalysts: 18 + (seed % 8) },
    ],
    consensusChange: [
      { period: 'Q2 FY2025', oneWeekAgo: v(1.40, 0.03), oneMonthAgo: v(1.38, 0.05), threeMonthsAgo: v(1.35, 0.06), current: v(1.42, 0.03) },
      { period: 'Q3 FY2025', oneWeekAgo: v(1.60, 0.03), oneMonthAgo: v(1.57, 0.05), threeMonthsAgo: v(1.52, 0.06), current: v(1.62, 0.03) },
      { period: 'FY2025', oneWeekAgo: v(6.82, 0.1), oneMonthAgo: v(6.75, 0.15), threeMonthsAgo: v(6.60, 0.2), current: v(6.85, 0.1) },
      { period: 'FY2026', oneWeekAgo: v(7.58, 0.1), oneMonthAgo: v(7.50, 0.15), threeMonthsAgo: v(7.35, 0.2), current: v(7.62, 0.1) },
    ],
    estimatesChanged: [
      { period: 'Q2 FY2025', up: 8 + (seed % 5), down: 2 + (seed % 3), unchanged: 15 + (seed % 5), total: 25 + (seed % 8) },
      { period: 'Q3 FY2025', up: 6 + (seed % 4), down: 3 + (seed % 3), unchanged: 13 + (seed % 5), total: 22 + (seed % 8) },
      { period: 'FY2025', up: 12 + (seed % 5), down: 4 + (seed % 3), unchanged: 12 + (seed % 5), total: 28 + (seed % 8) },
      { period: 'FY2026', up: 10 + (seed % 5), down: 5 + (seed % 3), unchanged: 9 + (seed % 5), total: 24 + (seed % 8) },
    ],
  };
}

// Pre-build data for AAPL as default
const DEFAULT_SYMBOL = 'AAPL';
const DEFAULT_COMPANY = SP500_COMPANIES.find((c) => c.symbol === DEFAULT_SYMBOL) ?? {
  symbol: DEFAULT_SYMBOL,
  name: 'Apple Inc.',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function BarChart({
  data,
  maxVal,
  colorFn,
  labelKey,
  valueKey,
  estimateKey,
}: {
  data: Record<string, number | string | null>[];
  maxVal: number;
  colorFn: (val: number) => string;
  labelKey: string;
  valueKey: string;
  estimateKey?: string;
}) {
  return (
    <div className="earn-bar-chart">
      {data.map((row, i) => {
        const val = row[valueKey] as number | null;
        const est = estimateKey ? (row[estimateKey] as number | null) : null;
        const isNull = val === null;
        const pct = isNull ? 0 : Math.abs(val / maxVal) * 100;
        const color = isNull ? '#ccc' : colorFn(val);
        return (
          <div key={i} className="earn-bar-row">
            <span className="earn-bar-label">{row[labelKey] as string}</span>
            <div className="earn-bar-track">
              {est !== null && (
                <div
                  className="earn-bar-estimate-marker"
                  style={{ left: `${Math.abs(est / maxVal) * 100}%` }}
                  title={`Estimate: $${est}`}
                />
              )}
              <div
                className="earn-bar-fill"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span className="earn-bar-value" style={{ color: isNull ? '#aaa' : color }}>
              {isNull ? 'Est.' : `$${val?.toFixed(2)}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="earn-section-card">
      <h3 className="earn-section-card-title">{title}</h3>
      {children}
    </div>
  );
}

// ── Tab sections ──────────────────────────────────────────────────────────────

function EarningsDateSection({ data }: { data: EarningsCompanyData }) {
  const upcoming = data.earningsDates.find((d) => d.epsActual === null);
  return (
    <div className="earn-tab-content">
      {upcoming && (
        <div className="earn-next-date-box">
          <div className="earn-next-date-label">Next Earnings Date</div>
          <div className="earn-next-date-value">{upcoming.reportDate}</div>
          <div className="earn-next-date-quarter">{upcoming.quarter}</div>
          {upcoming.epsEstimate !== null && (
            <div className="earn-next-date-est">
              EPS Estimate: <strong>${upcoming.epsEstimate.toFixed(2)}</strong>
            </div>
          )}
        </div>
      )}
      <SectionCard title="Earnings Dates History">
        <div className="earn-table-wrap">
          <table className="earn-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Report Date</th>
                <th>EPS Estimate</th>
                <th>EPS Actual</th>
                <th>Surprise</th>
                <th>Surprise %</th>
              </tr>
            </thead>
            <tbody>
              {data.earningsDates.map((row) => (
                <tr key={row.quarter}>
                  <td className="earn-td-quarter">{row.quarter}</td>
                  <td>{row.reportDate}</td>
                  <td>{row.epsEstimate !== null ? `$${row.epsEstimate.toFixed(2)}` : '—'}</td>
                  <td>{row.epsActual !== null ? `$${row.epsActual.toFixed(2)}` : <span className="earn-upcoming-badge">Upcoming</span>}</td>
                  <td className={row.surprise !== null ? (row.surprise >= 0 ? 'earn-pos' : 'earn-neg') : ''}>
                    {row.surprise !== null ? `${row.surprise >= 0 ? '+' : ''}$${row.surprise.toFixed(2)}` : '—'}
                  </td>
                  <td className={row.surprisePct !== null ? (row.surprisePct >= 0 ? 'earn-pos' : 'earn-neg') : ''}>
                    {row.surprisePct !== null ? `${row.surprisePct >= 0 ? '+' : ''}${row.surprisePct.toFixed(2)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function EarningsQualitySection({ data }: { data: EarningsCompanyData }) {
  const q = data.qualityRanking;
  const scoreMetrics = [
    { label: 'Consistency Score', value: q.consistencyScore, max: 100, color: '#22c55e' },
    { label: 'Growth Score', value: q.growthScore, max: 100, color: '#3b82f6' },
    { label: 'Quality Score', value: q.qualityScore, max: 100, color: '#8b5cf6' },
  ];
  return (
    <div className="earn-tab-content">
      <div className="earn-quality-top">
        <div className="earn-quality-grade-box">
          <div className="earn-quality-grade">{q.grade}</div>
          <div className="earn-quality-grade-label">Earnings Quality Grade</div>
        </div>
        <div className="earn-quality-score-box">
          <div className="earn-quality-score">{q.score}</div>
          <div className="earn-quality-score-label">Overall Score</div>
        </div>
        <div className="earn-quality-percentile-box">
          <div className="earn-quality-percentile">{q.percentile}th</div>
          <div className="earn-quality-percentile-label">Percentile Ranking</div>
        </div>
      </div>
      <SectionCard title="Score Breakdown">
        <div className="earn-quality-bars">
          {scoreMetrics.map((m) => (
            <div key={m.label} className="earn-quality-bar-row">
              <span className="earn-quality-bar-label">{m.label}</span>
              <div className="earn-quality-bar-track">
                <div
                  className="earn-quality-bar-fill"
                  style={{ width: `${(m.value / m.max) * 100}%`, background: m.color }}
                />
              </div>
              <span className="earn-quality-bar-value" style={{ color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
        <p className="earn-quality-desc">
          Earnings quality measures the sustainability and reliability of a company's reported earnings.
          A higher score indicates more consistent, cash-backed earnings with lower accrual ratios.
          {data.symbol} ranks in the <strong>{q.percentile}th percentile</strong> among all S&P 500 companies.
        </p>
      </SectionCard>
    </div>
  );
}

function LatestPressReleaseSection({ data }: { data: EarningsCompanyData }) {
  return (
    <div className="earn-tab-content">
      <SectionCard title="Earnings Press Releases">
        <div className="earn-press-list">
          {data.pressReleases.map((pr, i) => (
            <div key={i} className="earn-press-item">
              <div className="earn-press-meta">
                <span className="earn-press-date">{pr.date}</span>
                <span className="earn-press-quarter-badge">{pr.quarter}</span>
              </div>
              <a href={pr.url} className="earn-press-title">{pr.title}</a>
              <p className="earn-press-desc">
                {data.name} today announced financial results for the quarter ending.
                Management will provide additional commentary during the live earnings call.
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function EarningsPerShareSection({ data }: { data: EarningsCompanyData }) {
  const maxVal = Math.max(...data.epsHistory.map((d) => Math.max(d.estimate, d.actual ?? d.estimate)));
  return (
    <div className="earn-tab-content">
      <SectionCard title="Earnings Per Share (EPS) — Estimate vs. Actual">
        <BarChart
          data={data.epsHistory.map((d) => ({ quarter: d.quarter, actual: d.actual, estimate: d.estimate }))}
          maxVal={maxVal * 1.2}
          colorFn={(v) => (v >= 0 ? '#22c55e' : '#ef4444')}
          labelKey="quarter"
          valueKey="actual"
          estimateKey="estimate"
        />
        <div className="earn-bar-legend">
          <span className="earn-bar-legend-item"><span className="earn-bar-legend-dot" style={{ background: '#22c55e' }} />Actual EPS</span>
          <span className="earn-bar-legend-item"><span className="earn-bar-legend-line" />Estimate</span>
        </div>
        <div className="earn-table-wrap" style={{ marginTop: 16 }}>
          <table className="earn-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>EPS Estimate</th>
                <th>EPS Actual</th>
                <th>Beat / Miss</th>
              </tr>
            </thead>
            <tbody>
              {data.epsHistory.map((row) => {
                const diff = row.actual !== null ? row.actual - row.estimate : null;
                return (
                  <tr key={row.quarter}>
                    <td className="earn-td-quarter">{row.quarter}</td>
                    <td>${row.estimate.toFixed(2)}</td>
                    <td>{row.actual !== null ? `$${row.actual.toFixed(2)}` : <span className="earn-upcoming-badge">Upcoming</span>}</td>
                    <td className={diff !== null ? (diff >= 0 ? 'earn-pos' : 'earn-neg') : ''}>
                      {diff !== null ? `${diff >= 0 ? '▲ Beat' : '▼ Miss'} by $${Math.abs(diff).toFixed(2)}` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function QuarterlyEarningsSurpriseSection({ data }: { data: EarningsCompanyData }) {
  const maxAbs = Math.max(...data.earningsSurprise.map((d) => Math.abs(d.surprisePct)));
  return (
    <div className="earn-tab-content">
      <SectionCard title="Quarterly Earnings Surprise Amount">
        <BarChart
          data={data.earningsSurprise.map((d) => ({ quarter: d.quarter, surprisePct: d.surprisePct }))}
          maxVal={maxAbs * 1.3}
          colorFn={(v) => (v >= 0 ? '#22c55e' : '#ef4444')}
          labelKey="quarter"
          valueKey="surprisePct"
        />
        <div className="earn-table-wrap" style={{ marginTop: 16 }}>
          <table className="earn-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Surprise Amount ($)</th>
                <th>Surprise (%)</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {data.earningsSurprise.map((row) => (
                <tr key={row.quarter}>
                  <td className="earn-td-quarter">{row.quarter}</td>
                  <td className={row.surprise >= 0 ? 'earn-pos' : 'earn-neg'}>
                    {row.surprise >= 0 ? '+' : ''}${row.surprise.toFixed(2)}
                  </td>
                  <td className={row.surprisePct >= 0 ? 'earn-pos' : 'earn-neg'}>
                    {row.surprisePct >= 0 ? '+' : ''}{row.surprisePct.toFixed(2)}%
                  </td>
                  <td>
                    <span className={`earn-surprise-badge${row.surprisePct >= 0 ? ' beat' : ' miss'}`}>
                      {row.surprisePct >= 0 ? 'Beat' : 'Miss'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function YearlyEarningsForecastSection({ data }: { data: EarningsCompanyData }) {
  return (
    <div className="earn-tab-content">
      <SectionCard title="Yearly Earnings Forecast (Annual EPS Consensus)">
        <div className="earn-forecast-grid">
          {data.yearlyForecast.map((row) => (
            <div key={row.year} className="earn-forecast-card">
              <div className="earn-forecast-period">{row.year}</div>
              <div className="earn-forecast-consensus">${row.consensus.toFixed(2)}</div>
              <div className="earn-forecast-consensus-label">Consensus EPS</div>
              <div className="earn-forecast-range">
                <span className="earn-forecast-low">${row.low.toFixed(2)}</span>
                <div className="earn-forecast-range-bar">
                  <div
                    className="earn-forecast-range-fill"
                    style={{
                      left: `${((row.low - row.low * RANGE_LOW_PAD) / (row.high * RANGE_HIGH_PAD - row.low * RANGE_LOW_PAD)) * 100}%`,
                      width: `${((row.high - row.low) / (row.high * RANGE_HIGH_PAD - row.low * RANGE_LOW_PAD)) * 100}%`,
                    }}
                  />
                  <div
                    className="earn-forecast-range-dot"
                    style={{ left: `${((row.consensus - row.low * RANGE_LOW_PAD) / (row.high * RANGE_HIGH_PAD - row.low * RANGE_LOW_PAD)) * 100}%` }}
                  />
                </div>
                <span className="earn-forecast-high">${row.high.toFixed(2)}</span>
              </div>
              <div className="earn-forecast-analysts">{row.numAnalysts} analysts</div>
            </div>
          ))}
        </div>
        <div className="earn-table-wrap" style={{ marginTop: 16 }}>
          <table className="earn-table">
            <thead>
              <tr>
                <th>Fiscal Year</th>
                <th>Low</th>
                <th>Consensus</th>
                <th>High</th>
                <th># Analysts</th>
              </tr>
            </thead>
            <tbody>
              {data.yearlyForecast.map((row) => (
                <tr key={row.year}>
                  <td className="earn-td-quarter">{row.year}</td>
                  <td>${row.low.toFixed(2)}</td>
                  <td><strong>${row.consensus.toFixed(2)}</strong></td>
                  <td>${row.high.toFixed(2)}</td>
                  <td>{row.numAnalysts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function QuarterlyEarningsForecastSection({ data }: { data: EarningsCompanyData }) {
  return (
    <div className="earn-tab-content">
      <SectionCard title="Quarterly Earnings Forecast (EPS Consensus)">
        <div className="earn-forecast-grid">
          {data.quarterlyForecast.map((row) => (
            <div key={row.quarter} className="earn-forecast-card">
              <div className="earn-forecast-period">{row.quarter}</div>
              <div className="earn-forecast-consensus">${row.consensus.toFixed(2)}</div>
              <div className="earn-forecast-consensus-label">Consensus EPS</div>
              <div className="earn-forecast-range">
                <span className="earn-forecast-low">${row.low.toFixed(2)}</span>
                <div className="earn-forecast-range-bar">
                  <div
                    className="earn-forecast-range-fill"
                    style={{
                      left: `${((row.low - row.low * RANGE_LOW_PAD) / (row.high * RANGE_HIGH_PAD - row.low * RANGE_LOW_PAD)) * 100}%`,
                      width: `${((row.high - row.low) / (row.high * RANGE_HIGH_PAD - row.low * RANGE_LOW_PAD)) * 100}%`,
                    }}
                  />
                  <div
                    className="earn-forecast-range-dot"
                    style={{ left: `${((row.consensus - row.low * RANGE_LOW_PAD) / (row.high * RANGE_HIGH_PAD - row.low * RANGE_LOW_PAD)) * 100}%` }}
                  />
                </div>
                <span className="earn-forecast-high">${row.high.toFixed(2)}</span>
              </div>
              <div className="earn-forecast-analysts">{row.numAnalysts} analysts</div>
            </div>
          ))}
        </div>
        <div className="earn-table-wrap" style={{ marginTop: 16 }}>
          <table className="earn-table">
            <thead>
              <tr>
                <th>Quarter</th>
                <th>Low</th>
                <th>Consensus</th>
                <th>High</th>
                <th># Analysts</th>
              </tr>
            </thead>
            <tbody>
              {data.quarterlyForecast.map((row) => (
                <tr key={row.quarter}>
                  <td className="earn-td-quarter">{row.quarter}</td>
                  <td>${row.low.toFixed(2)}</td>
                  <td><strong>${row.consensus.toFixed(2)}</strong></td>
                  <td>${row.high.toFixed(2)}</td>
                  <td>{row.numAnalysts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function ChangeInConsensusSection({ data }: { data: EarningsCompanyData }) {
  return (
    <div className="earn-tab-content">
      <SectionCard title="Change in Consensus Estimate">
        <div className="earn-table-wrap">
          <table className="earn-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>3 Months Ago</th>
                <th>1 Month Ago</th>
                <th>1 Week Ago</th>
                <th>Current</th>
                <th>3M Change</th>
              </tr>
            </thead>
            <tbody>
              {data.consensusChange.map((row) => {
                const change3m = row.current - row.threeMonthsAgo;
                return (
                  <tr key={row.period}>
                    <td className="earn-td-quarter">{row.period}</td>
                    <td>${row.threeMonthsAgo.toFixed(2)}</td>
                    <td>${row.oneMonthAgo.toFixed(2)}</td>
                    <td>${row.oneWeekAgo.toFixed(2)}</td>
                    <td><strong>${row.current.toFixed(2)}</strong></td>
                    <td className={change3m >= 0 ? 'earn-pos' : 'earn-neg'}>
                      {change3m >= 0 ? '+' : ''}{change3m.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="earn-consensus-chart">
          {data.consensusChange.map((row) => {
            const vals = [row.threeMonthsAgo, row.oneMonthAgo, row.oneWeekAgo, row.current];
            const labels = ['3M Ago', '1M Ago', '1W Ago', 'Current'];
            const minV = Math.min(...vals) * 0.98;
            const maxV = Math.max(...vals) * 1.02;
            const range = maxV - minV || 1;
            return (
              <div key={row.period} className="earn-consensus-sparkline">
                <div className="earn-consensus-sparkline-label">{row.period}</div>
                <svg viewBox="0 0 200 60" className="earn-sparkline-svg">
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    points={vals.map((v, i) => `${(i / 3) * 180 + 10},${60 - ((v - minV) / range) * 50 - 5}`).join(' ')}
                  />
                  {vals.map((v, i) => (
                    <circle key={i} cx={(i / 3) * 180 + 10} cy={60 - ((v - minV) / range) * 50 - 5} r="4" fill="#3b82f6" />
                  ))}
                  {vals.map((v, i) => (
                    <text key={i} x={(i / 3) * 180 + 10} y={58} fontSize="8" textAnchor="middle" fill="#888">{labels[i]}</text>
                  ))}
                </svg>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

function NumberOfEstimatesChangedSection({ data }: { data: EarningsCompanyData }) {
  return (
    <div className="earn-tab-content">
      <SectionCard title="Number of Estimates Changed">
        <div className="earn-table-wrap">
          <table className="earn-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Up</th>
                <th>Down</th>
                <th>Unchanged</th>
                <th>Total</th>
                <th>Net Change</th>
              </tr>
            </thead>
            <tbody>
              {data.estimatesChanged.map((row) => {
                const net = row.up - row.down;
                return (
                  <tr key={row.period}>
                    <td className="earn-td-quarter">{row.period}</td>
                    <td className="earn-pos">{row.up} ▲</td>
                    <td className="earn-neg">{row.down} ▼</td>
                    <td className="earn-neutral">{row.unchanged}</td>
                    <td>{row.total}</td>
                    <td className={net >= 0 ? 'earn-pos' : 'earn-neg'}>
                      {net >= 0 ? '+' : ''}{net}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="earn-estimates-bars">
          {data.estimatesChanged.map((row) => (
            <div key={row.period} className="earn-estimates-bar-group">
              <div className="earn-estimates-bar-period">{row.period}</div>
              <div className="earn-estimates-stacked">
                <div
                  className="earn-estimates-stacked-seg up"
                  style={{ width: `${(row.up / row.total) * 100}%` }}
                  title={`Up: ${row.up}`}
                />
                <div
                  className="earn-estimates-stacked-seg unchanged"
                  style={{ width: `${(row.unchanged / row.total) * 100}%` }}
                  title={`Unchanged: ${row.unchanged}`}
                />
                <div
                  className="earn-estimates-stacked-seg down"
                  style={{ width: `${(row.down / row.total) * 100}%` }}
                  title={`Down: ${row.down}`}
                />
              </div>
              <div className="earn-estimates-bar-legend">
                <span className="earn-estimates-legend-item up">▲ {row.up} Up</span>
                <span className="earn-estimates-legend-item unchanged">— {row.unchanged} Unchanged</span>
                <span className="earn-estimates-legend-item down">▼ {row.down} Down</span>
              </div>
            </div>
          ))}
        </div>
        <div className="earn-estimates-chart-legend">
          <span className="earn-estimates-legend-item up">▲ Upward Revisions</span>
          <span className="earn-estimates-legend-item unchanged">— Unchanged</span>
          <span className="earn-estimates-legend-item down">▼ Downward Revisions</span>
        </div>
      </SectionCard>
    </div>
  );
}

// Padding multipliers for forecast range visualisation
const RANGE_LOW_PAD = 0.9;
const RANGE_HIGH_PAD = 1.1;

// ── Main Component ────────────────────────────────────────────────────────────

export default function EarningsContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<SubTab>('Earnings Date');
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOL);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load recently viewed from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) setRecentlyViewed(JSON.parse(stored) as string[]);
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addToRecentlyViewed = useCallback((symbol: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((s) => s !== symbol);
      const next = [symbol, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  function handleSelectSymbol(symbol: string) {
    setSelectedSymbol(symbol);
    setSearchQuery('');
    setShowDropdown(false);
    setActiveTab('Earnings Date');
    addToRecentlyViewed(symbol);
  }

  const filteredCompanies =
    searchQuery.trim().length > 0
      ? SP500_COMPANIES.filter(
          (c) =>
            c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.name.toLowerCase().includes(searchQuery.toLowerCase()),
        ).slice(0, 8)
      : [];

  const selectedCompany = SP500_COMPANIES.find((c) => c.symbol === selectedSymbol) ?? DEFAULT_COMPANY;
  const companyData = buildCompanyData(selectedCompany.symbol, selectedCompany.name);

  function renderTabContent() {
    switch (activeTab) {
      case 'Earnings Date': return <EarningsDateSection data={companyData} />;
      case 'Earnings Quality Ranking': return <EarningsQualitySection data={companyData} />;
      case 'Latest Press Release': return <LatestPressReleaseSection data={companyData} />;
      case 'Earnings Per Share': return <EarningsPerShareSection data={companyData} />;
      case 'Quarterly Earnings Surprise Amount': return <QuarterlyEarningsSurpriseSection data={companyData} />;
      case 'Yearly Earnings Forecast': return <YearlyEarningsForecastSection data={companyData} />;
      case 'Quarterly Earnings Forecast': return <QuarterlyEarningsForecastSection data={companyData} />;
      case 'Change in Consensus': return <ChangeInConsensusSection data={companyData} />;
      case 'Number of Estimates Changed': return <NumberOfEstimatesChangedSection data={companyData} />;
      default: return null;
    }
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="earn-page">
            {/* ── Symbol Search ── */}
            <div className="earn-search-section" ref={searchRef}>
              <div className="earn-search-label">Symbol Search</div>
              <div className="earn-search-wrap">
                <svg className="earn-search-icon" viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  className="earn-search-input"
                  placeholder="Search by symbol or company name…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(e.target.value.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (searchQuery.trim().length > 0) setShowDropdown(true);
                  }}
                />
                {searchQuery && (
                  <button
                    className="earn-search-clear"
                    onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
                    aria-label="Clear search"
                  >✕</button>
                )}
              </div>
              {showDropdown && filteredCompanies.length > 0 && (
                <div className="earn-search-dropdown">
                  {filteredCompanies.map((c) => (
                    <button
                      key={c.symbol}
                      className="earn-search-result"
                      onMouseDown={(e) => { e.preventDefault(); handleSelectSymbol(c.symbol); }}
                    >
                      <span className="earn-search-result-symbol">{c.symbol}</span>
                      <span className="earn-search-result-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Recently Viewed ── */}
            {recentlyViewed.length > 0 && (
              <div className="earn-recently-viewed">
                <span className="earn-recently-label">Recently Viewed</span>
                <div className="earn-recently-tags">
                  {recentlyViewed.map((sym) => {
                    const co = SP500_COMPANIES.find((c) => c.symbol === sym);
                    return (
                      <button
                        key={sym}
                        className={`earn-recently-tag${sym === selectedSymbol ? ' active' : ''}`}
                        onClick={() => handleSelectSymbol(sym)}
                        title={co?.name ?? sym}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Company Header (NASDAQ-style) ── */}
            <div className="earn-header">
              <div className="earn-header-top">
                <div className="earn-header-identity">
                  <span className="earn-header-symbol">{companyData.symbol}</span>
                  <span className="earn-header-exchange">{companyData.exchange}</span>
                  <h1 className="earn-header-company-name">{companyData.name}</h1>
                </div>
                <div className="earn-header-price-block">
                  <span className="earn-header-price">${companyData.price.toFixed(2)}</span>
                  <span className={`earn-header-change${companyData.change >= 0 ? ' pos' : ' neg'}`}>
                    {companyData.change >= 0 ? '+' : ''}{companyData.change.toFixed(2)} ({companyData.changePct >= 0 ? '+' : ''}{companyData.changePct.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <div className="earn-header-meta">
                <div className="earn-header-meta-item">
                  <span className="earn-header-meta-label">Market Cap</span>
                  <span className="earn-header-meta-value">{companyData.marketCap}</span>
                </div>
                <div className="earn-header-meta-item">
                  <span className="earn-header-meta-label">Volume</span>
                  <span className="earn-header-meta-value">{companyData.volume}</span>
                </div>
                <div className="earn-header-meta-item">
                  <span className="earn-header-meta-label">EPS (TTM)</span>
                  <span className="earn-header-meta-value">${companyData.eps.toFixed(2)}</span>
                </div>
                <div className="earn-header-meta-item">
                  <span className="earn-header-meta-label">P/E Ratio</span>
                  <span className="earn-header-meta-value">{companyData.peRatio.toFixed(1)}</span>
                </div>
                <div className="earn-header-meta-item">
                  <span className="earn-header-meta-label">Sector</span>
                  <span className="earn-header-meta-value">{companyData.sector}</span>
                </div>
                <div className="earn-header-meta-item">
                  <span className="earn-header-meta-label">Next Earnings</span>
                  <span className="earn-header-meta-value earn-next-earn-date">{companyData.nextEarningsDate}</span>
                </div>
              </div>
            </div>

            {/* ── Sub-tabs ── */}
            <div className="earn-subtabs-wrap">
              <div className="earn-subtabs">
                {SUB_TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`earn-subtab${activeTab === tab ? ' active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Tab content ── */}
            <div className="earn-content-area">
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
