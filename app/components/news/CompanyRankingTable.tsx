'use client';

import { newsItems } from '@/app/data/news';

// Compute top-5 companies by mention count across all news items
function computeTopCompanies() {
  const countMap: Record<string, { name: string; count: number }> = {};
  for (const item of newsItems) {
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

// Seeded mock changes so they are stable across renders (one per company rank slot)
function getMockChange(index: number): number {
  const values = [12.4, -5.2, 8.7, -3.1, 21.5, 6.3, -9.8];
  return values[index % values.length];
}

export default function CompanyRankingTable() {
  const companies = computeTopCompanies();

  return (
    <div className="insight-block">
      <div className="insight-block-title">
        Company Heat Ranking
      </div>
      <table className="company-rank-table">
        <thead>
          <tr>
            <th className="crt-th crt-th-no">#No</th>
            <th className="crt-th">Company</th>
            <th className="crt-th crt-th-num">Mentions</th>
            <th className="crt-th crt-th-num">Change</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((co, idx) => {
            const change = getMockChange(idx);
            const isPos = change >= 0;
            return (
              <tr key={co.symbol} className="crt-row">
                <td className="crt-td crt-td-no">{idx + 1}</td>
                <td className="crt-td">
                  <div className="crt-company-name">{co.name}</div>
                  <div className="crt-company-symbol">{co.symbol}</div>
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
                <td className="crt-td crt-td-num">
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
  );
}
