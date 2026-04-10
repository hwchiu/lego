'use client';

import { ResponsiveBar } from '@nivo/bar';

// ── Shared types ──────────────────────────────────────────────────────────────

interface InvestmentDeal {
  date: string;
  valueM: number | null;
}

interface YearChartData {
  year: number;
  disclosedCount: number;
  undisclosedCount: number;
  disclosedValueM: number;
}

const CHART_START_YEAR = 2012;
const CHART_END_YEAR = 2026;

function buildYearData(deals: InvestmentDeal[]): YearChartData[] {
  const years = Array.from(
    { length: CHART_END_YEAR - CHART_START_YEAR + 1 },
    (_, i) => CHART_START_YEAR + i,
  );
  const map = new Map<number, YearChartData>();
  for (const y of years) {
    map.set(y, { year: y, disclosedCount: 0, undisclosedCount: 0, disclosedValueM: 0 });
  }
  for (const d of deals) {
    const yr = parseInt(d.date.slice(0, 4), 10);
    const entry = map.get(yr);
    if (!entry) continue;
    if (d.valueM != null) {
      entry.disclosedCount += 1;
      entry.disclosedValueM += d.valueM;
    } else {
      entry.undisclosedCount += 1;
    }
  }
  return years.map((y) => map.get(y)!);
}

// ── InvestmentBarLineChartNivo ─────────────────────────────────────────────────
// Replaces the hand-rolled SVG stacked-bar + line chart.

export function InvestmentBarLineChartNivo({ deals }: { deals: InvestmentDeal[] }) {
  const yearData = buildYearData(deals);

  const maxCount = Math.max(...yearData.map((d) => d.disclosedCount + d.undisclosedCount), 1);
  const countMax = Math.ceil(maxCount / 2) * 2 || 2;
  const maxValue = Math.max(...yearData.map((d) => d.disclosedValueM), 1);
  const valueMax = Math.ceil(maxValue / 500) * 500 || 500;

  const barData = yearData.map((d) => ({
    year: String(d.year),
    disclosedCount: d.disclosedCount,
    undisclosedCount: d.undisclosedCount,
    // carry extra data for tooltip
    disclosedValueM: d.disclosedValueM,
  }));

  // Index → position lookup for the line layer fallback
  const yearToIdx = new Map(yearData.map((d, i) => [String(d.year), i]));

  // Custom layer: draws the line for disclosedValueM on top of the bars.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LineLayer = (props: any) => {
    const { bars, innerHeight, innerWidth } = props as {
      bars: Array<{ x: number; width: number; data: { indexValue: string } }>;
      innerHeight: number;
      innerWidth: number;
    };

    const n = yearData.length;
    const slotWidth = innerWidth / n;

    const points = yearData
      .filter((d) => d.disclosedValueM > 0)
      .map((d) => {
        const bar = bars.find((b) => b.data.indexValue === String(d.year));
        const idx = yearToIdx.get(String(d.year))!;
        const cx = bar ? bar.x + bar.width / 2 : slotWidth * idx + slotWidth / 2;
        const cy = innerHeight - (d.disclosedValueM / valueMax) * innerHeight;
        return { cx, cy, year: d.year };
      });

    if (points.length === 0) return null;

    const polylineStr = points.map((p) => `${p.cx},${p.cy}`).join(' ');

    return (
      <>
        {points.length >= 2 && (
          <polyline
            points={polylineStr}
            fill="none"
            stroke="#111827"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {points.map((p) => (
          <circle
            key={p.year}
            cx={p.cx}
            cy={p.cy}
            r={3}
            fill="#111827"
            stroke="#fff"
            strokeWidth="1.5"
          />
        ))}
      </>
    );
  };

  return (
    <div className="aapl-inv-chart-wrap" style={{ height: 260 }}>
      <ResponsiveBar
        data={barData}
        keys={['disclosedCount', 'undisclosedCount']}
        indexBy="year"
        groupMode="stacked"
        margin={{ top: 30, right: 75, bottom: 40, left: 55 }}
        valueScale={{ type: 'linear', min: 0, max: countMax }}
        colors={['#3b82f6', '#ef4444']}
        borderRadius={1}
        enableLabel={false}
        axisBottom={{ tickSize: 0, tickPadding: 5 }}
        axisLeft={{
          tickValues: 5,
          tickSize: 0,
          legend: 'Count',
          legendPosition: 'middle',
          legendOffset: -44,
        }}
        axisRight={{
          tickValues: 5,
          tickSize: 0,
          format: (v) => `${Math.round((Number(v) / countMax) * valueMax)}`,
          legend: 'Value (USD $M)',
          legendPosition: 'middle',
          legendOffset: 62,
        }}
        gridYValues={5}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers={['grid', 'axes', 'bars', 'markers', LineLayer as any, 'legends', 'annotations']}
        tooltip={({ indexValue, data }) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = data as any;
          return (
            <div
              style={{
                background: '#1f2937',
                color: '#fff',
                padding: '6px 10px',
                borderRadius: 6,
                fontSize: 11,
                whiteSpace: 'nowrap',
              }}
            >
              <strong>{indexValue}</strong>
              <div>
                Disclosed: {d.disclosedCount} deal{d.disclosedCount !== 1 ? 's' : ''}
              </div>
              <div>
                Undisclosed: {d.undisclosedCount} deal{d.undisclosedCount !== 1 ? 's' : ''}
              </div>
              {d.disclosedValueM > 0 && (
                <div>
                  Value: $
                  {d.disclosedValueM >= 1000
                    ? `${(d.disclosedValueM / 1000).toFixed(1)}B`
                    : d.disclosedValueM.toLocaleString()}
                  M
                </div>
              )}
            </div>
          );
        }}
        theme={{
          grid: { line: { stroke: '#f0f0f0', strokeWidth: 1 } },
          axis: {
            ticks: { text: { fontSize: 9, fill: '#9ca3af' } },
            legend: { text: { fontSize: 9, fill: '#6b7280' } },
          },
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-left',
            direction: 'row',
            data: [
              { id: 'disclosedCount', label: 'Count of Disclosed Value', color: '#3b82f6' },
              { id: 'undisclosedCount', label: 'Count of Undisclosed Value', color: '#ef4444' },
              { id: 'line', label: 'Disclosed Value (M)', color: '#111827' },
            ],
            itemWidth: 175,
            itemHeight: 20,
            translateX: 0,
            translateY: -28,
            symbolSize: 8,
            symbolShape: 'square',
            itemTextColor: '#374151',
            itemsSpacing: 2,
          },
        ]}
      />
    </div>
  );
}

// ── MABarChartSmallNivo ────────────────────────────────────────────────────────
// Replaces the hand-rolled SVG grouped-bar chart in the M&A panel.

export function MABarChartSmallNivo({
  data,
}: {
  data: { year: number; deals: number; value: number }[];
}) {
  const maxDeals = Math.max(...data.map((d) => d.deals));
  const maxValue = Math.max(...data.map((d) => d.value));
  const dealsMax = Math.ceil(maxDeals / 1000) * 1000 || 1000;
  const valueMax = Math.ceil(maxValue / 1000) * 1000 || 1000;
  const sharedMax = Math.max(dealsMax, valueMax);

  const barData = data.map((d) => ({
    year: String(d.year),
    deals: d.deals,
    value: d.value,
  }));

  return (
    <div style={{ height: 180 }}>
      <ResponsiveBar
        data={barData}
        keys={['deals', 'value']}
        indexBy="year"
        groupMode="grouped"
        margin={{ top: 20, right: 55, bottom: 30, left: 55 }}
        valueScale={{ type: 'linear', min: 0, max: sharedMax }}
        colors={['#3b82f6', '#f59e0b']}
        borderRadius={1}
        enableLabel={false}
        axisBottom={{ tickSize: 0, tickPadding: 5 }}
        axisLeft={{
          tickValues: 3,
          tickSize: 0,
          format: (v) => Number(v).toLocaleString(),
        }}
        axisRight={{
          tickValues: 3,
          tickSize: 0,
          format: (v) =>
            `$${Math.round((Number(v) / sharedMax) * valueMax)}B`,
        }}
        theme={{
          grid: { line: { stroke: '#f0f0f0', strokeWidth: 1 } },
          axis: { ticks: { text: { fontSize: 9, fill: '#9ca3af' } } },
        }}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'top-left',
            direction: 'row',
            data: [
              { id: 'deals', label: 'Deals', color: '#3b82f6' },
              { id: 'value', label: 'Value ($B)', color: '#f59e0b' },
            ],
            itemWidth: 80,
            itemHeight: 20,
            translateX: 0,
            translateY: -18,
            symbolSize: 8,
            symbolShape: 'square',
            itemTextColor: '#374151',
          },
        ]}
      />
    </div>
  );
}
