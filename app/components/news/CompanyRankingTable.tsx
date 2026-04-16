'use client';

import { ResponsiveBar } from '@nivo/bar';
import { newsItems, type NewsCategory } from '@/app/data/news';

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

interface BarDatum {
  [key: string]: string | number;
  id: string;
  rank: number;
  symbol: string;
  company: string;
  mentions: number;
}

interface CompanyRankingTableProps {
  activeCategory?: NewsCategory;
}

export default function CompanyRankingTable({ activeCategory = 'all' }: CompanyRankingTableProps) {
  const companies = computeTopCompanies(activeCategory);

  // nivo horizontal bar renders bottom→top, so reverse so #1 appears at the top
  const chartData: BarDatum[] = [...companies]
    .reverse()
    .map((co, revIdx) => ({
      id: co.symbol,
      rank: companies.length - revIdx,
      symbol: co.symbol,
      company: co.name,
      mentions: co.count,
    }));

  const chartHeight = companies.length * 46 + 36;

  return (
    <div className="insight-block insight-block--ranking">
      <div className="insight-block-title">Company Heat Ranking</div>
      <div style={{ height: chartHeight }}>
        <ResponsiveBar
          data={chartData}
          keys={['mentions']}
          indexBy="id"
          layout="horizontal"
          margin={{ top: 4, right: 40, bottom: 28, left: 120 }}
          valueScale={{ type: 'linear', min: 0 }}
          padding={0.38}
          colors={['#4fc3f7']}
          borderRadius={3}
          animate={true}
          motionConfig="gentle"
          enableLabel={true}
          label={(d) => String(d.value)}
          labelSkipWidth={18}
          labelTextColor="#fff"
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            renderTick: (tick) => {
              const datum = chartData.find((d) => d.id === tick.value);
              if (!datum) return <g />;
              return (
                <g transform={`translate(${tick.x},${tick.y})`}>
                  <text
                    textAnchor="end"
                    dominantBaseline="auto"
                    style={{ fontSize: 11, fontWeight: 700, fill: '#111827' }}
                    dy="-2"
                  >
                    {datum.rank}. {datum.symbol}
                  </text>
                  <text
                    textAnchor="end"
                    dominantBaseline="hanging"
                    style={{ fontSize: 10, fill: '#9ca3af' }}
                    dy="4"
                  >
                    {datum.company}
                  </text>
                </g>
              );
            },
          }}
          axisBottom={{
            tickSize: 0,
            tickPadding: 5,
            tickValues: 4,
          }}
          gridXValues={4}
          isInteractive={true}
          tooltip={({ data }) => {
            const d = data as unknown as BarDatum;
            return (
              <div className="crt-nivo-tooltip">
                <span className="crt-nivo-tooltip-rank">#{d.rank}</span>
                <span className="crt-nivo-tooltip-symbol">{d.symbol}</span>
                <span className="crt-nivo-tooltip-name">{d.company}</span>
                <span className="crt-nivo-tooltip-count">{d.mentions} mentions</span>
              </div>
            );
          }}
          theme={{
            grid: { line: { stroke: '#f0f0f0', strokeWidth: 1 } },
            axis: {
              ticks: { text: { fontSize: 10, fill: '#6b7280' } },
            },
          }}
        />
      </div>
    </div>
  );
}
