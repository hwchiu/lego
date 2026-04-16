'use client';

import { newsItems, type NewsCategory } from '@/app/data/news';
import rawContent from '@/content/company-changes.md';
import rawSparklines from '@/content/company-sparklines.md';
import { extractJson } from '@/app/lib/parseContent';

// Compute top-5 companies by mention count, optionally filtered by category
function computeTopCompanies(category: NewsCategory = 'all') {
  const filtered = category === 'all' ? newsItems : newsItems.filter((n) => n.category === category);
  const countMap: Record<string, { name: string; count: number }> = {};
  for (const item of filtered) {
    for (const tag of item.tags) {
      if (!countMap[tag.symbol]) {
        countMap[tag.symbol] = { name: tag.name, count: 0 };
      }
      countMap[tag.symbol].count += 1;
    }
  }
  return Object.entries(countMap)
    .map(([symbol, { name, count }]) => ({ symbol, name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Seeded mock changes loaded from markdown (one per company rank slot)
const MOCK_CHANGES: number[] = extractJson<number[]>(rawContent);

// Weekly trend data per symbol
const SPARKLINE_DATA: Record<string, number[]> = extractJson<Record<string, number[]>>(rawSparklines);

function getMockChange(index: number): number {
  return MOCK_CHANGES[index % MOCK_CHANGES.length];
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
}

function Sparkline({ data, width = 64, height = 22 }: SparklineProps) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padX = 2;
  const padY = 2;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const points = data.map((v, i) => {
    const x = padX + (i / (data.length - 1)) * innerW;
    const y = padY + (1 - (v - min) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const lastPoint = points[points.length - 1].split(',');
  return (
    <svg
      className="crt-sparkline"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <polyline className="crt-sparkline-line" points={points.join(' ')} />
      <circle
        className="crt-sparkline-dot"
        cx={lastPoint[0]}
        cy={lastPoint[1]}
        r="2"
      />
    </svg>
  );
}

interface CompanyRankingTableProps {
  activeCategory?: NewsCategory;
}

export default function CompanyRankingTable({ activeCategory = 'all' }: CompanyRankingTableProps) {
  const companies = computeTopCompanies(activeCategory);

  return (
    <div className="insight-block">
      <div className="insight-block-title">
        Company Heat Ranking
      </div>
      <div className="company-rank-table-wrap">
      <table className="company-rank-table">
        <thead>
          <tr>
            <th className="crt-th crt-th-no">#No</th>
            <th className="crt-th crt-th-company">Company</th>
            <th className="crt-th crt-th-num">Mentions</th>
            <th className="crt-th crt-th-trend">Trend</th>
            <th className="crt-th crt-th-num crt-th-change">Change</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((co, idx) => {
            const change = getMockChange(idx);
            const isPos = change >= 0;
            const sparkData = SPARKLINE_DATA[co.symbol] ?? [];
            return (
              <tr key={co.symbol} className="crt-row">
                <td className="crt-td crt-td-no">{idx + 1}</td>
                <td className="crt-td">
                  <div className="crt-company-symbol">{co.symbol}</div>
                  <div className="crt-company-name">{co.name}</div>
                </td>
                <td className="crt-td crt-td-num">
                  <div className="crt-count-bar-wrap">
                    <div
                      className="crt-count-bar"
                      style={{ width: `${(co.count / companies[0].count) * 100}%` }}
                    />
                    <span className="crt-count-value">{co.count}</span>
                  </div>
                </td>
                <td className="crt-td crt-td-trend">
                  <Sparkline data={sparkData} />
                </td>
                <td className="crt-td crt-td-num crt-td-change">
                  <span className={isPos ? 'crt-change pos' : 'crt-change neg'}>
                    {isPos ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                  </span>
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
