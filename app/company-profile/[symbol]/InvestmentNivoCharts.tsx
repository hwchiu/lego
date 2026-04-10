'use client';

import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';

// ── Shared types ──────────────────────────────────────────────────────────────

interface InvestmentDeal {
  date: string;
  valueM: number | null;
}

// ── InvestmentBarLineChartNivo props ──────────────────────────────────────────

interface BarLineChartProps {
  deals: InvestmentDeal[];
  selectedYear?: string | null;
  onYearClick?: (year: string | null) => void;
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

export function InvestmentBarLineChartNivo({ deals, selectedYear, onYearClick }: BarLineChartProps) {
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

  // Custom layer: highlights the selected year column.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HighlightLayer = (props: any) => {
    if (!selectedYear) return null;
    const { bars, innerHeight } = props as {
      bars: Array<{ x: number; width: number; data: { indexValue: string } }>;
      innerHeight: number;
    };
    const matchingBars = bars.filter((b) => b.data.indexValue === selectedYear);
    if (matchingBars.length === 0) return null;
    const minX = Math.min(...matchingBars.map((b) => b.x));
    const maxX = Math.max(...matchingBars.map((b) => b.x + b.width));
    return (
      <rect
        x={minX - 2}
        y={0}
        width={maxX - minX + 4}
        height={innerHeight}
        fill="rgba(99,102,241,0.12)"
        rx={3}
        pointerEvents="none"
      />
    );
  };

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
        {points.map((p) => {
          const isSelected = selectedYear === String(p.year);
          return (
            <circle
              key={p.year}
              cx={p.cx}
              cy={p.cy}
              r={isSelected ? 5 : 3}
              fill={isSelected ? '#6366f1' : '#111827'}
              stroke="#fff"
              strokeWidth={isSelected ? 2 : 1.5}
              style={{ cursor: 'pointer' }}
              onClick={() => onYearClick?.(isSelected ? null : String(p.year))}
            />
          );
        })}
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
        animate={true}
        motionConfig="gentle"
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
        onClick={(datum) => {
          const yr = String(datum.indexValue);
          onYearClick?.(yr === selectedYear ? null : yr);
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers={['grid', 'axes', HighlightLayer as any, 'bars', 'markers', LineLayer as any, 'legends', 'annotations']}
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

// ── AcquisitionBarLineChartNivo ────────────────────────────────────────────────
// Same pattern as InvestmentBarLineChartNivo but for 1988–2026 acquisition data.

const ACQ_CHART_START_YEAR = 1988;
const ACQ_CHART_END_YEAR = 2026;

function buildAcqYearData(deals: InvestmentDeal[]): YearChartData[] {
  const years = Array.from(
    { length: ACQ_CHART_END_YEAR - ACQ_CHART_START_YEAR + 1 },
    (_, i) => ACQ_CHART_START_YEAR + i,
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

export function AcquisitionBarLineChartNivo({ deals, selectedYear, onYearClick }: BarLineChartProps) {
  const yearData = buildAcqYearData(deals);

  const maxCount = Math.max(...yearData.map((d) => d.disclosedCount + d.undisclosedCount), 1);
  const countMax = Math.ceil(maxCount / 2) * 2 || 2;
  const maxValue = Math.max(...yearData.map((d) => d.disclosedValueM), 1);
  const valueMax = Math.ceil(maxValue / 500) * 500 || 500;

  const barData = yearData.map((d) => ({
    year: String(d.year),
    disclosedCount: d.disclosedCount,
    undisclosedCount: d.undisclosedCount,
    disclosedValueM: d.disclosedValueM,
  }));

  const yearToIdx = new Map(yearData.map((d, i) => [String(d.year), i]));

  // Show every 5 years on x-axis to avoid crowding
  const tickYears = yearData.filter((d) => d.year % 5 === 0).map((d) => String(d.year));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HighlightLayer = (props: any) => {
    if (!selectedYear) return null;
    const { bars, innerHeight } = props as {
      bars: Array<{ x: number; width: number; data: { indexValue: string } }>;
      innerHeight: number;
    };
    const matchingBars = bars.filter((b) => b.data.indexValue === selectedYear);
    if (matchingBars.length === 0) return null;
    const minX = Math.min(...matchingBars.map((b) => b.x));
    const maxX = Math.max(...matchingBars.map((b) => b.x + b.width));
    return (
      <rect
        x={minX - 2}
        y={0}
        width={maxX - minX + 4}
        height={innerHeight}
        fill="rgba(99,102,241,0.12)"
        rx={3}
        pointerEvents="none"
      />
    );
  };

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
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {points.map((p) => {
          const isSelected = selectedYear === String(p.year);
          return (
            <circle
              key={p.year}
              cx={p.cx}
              cy={p.cy}
              r={isSelected ? 5 : 2.5}
              fill={isSelected ? '#6366f1' : '#111827'}
              stroke="#fff"
              strokeWidth={isSelected ? 2 : 1.5}
              style={{ cursor: 'pointer' }}
              onClick={() => onYearClick?.(isSelected ? null : String(p.year))}
            />
          );
        })}
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
        animate={true}
        motionConfig="gentle"
        axisBottom={{ tickSize: 0, tickPadding: 5, tickValues: tickYears }}
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
        onClick={(datum) => {
          const yr = String(datum.indexValue);
          onYearClick?.(yr === selectedYear ? null : yr);
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers={['grid', 'axes', HighlightLayer as any, 'bars', 'markers', LineLayer as any, 'legends', 'annotations']}
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
              <div>Disclosed: {d.disclosedCount} deal{d.disclosedCount !== 1 ? 's' : ''}</div>
              <div>Undisclosed: {d.undisclosedCount} deal{d.undisclosedCount !== 1 ? 's' : ''}</div>
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

// ── FundingLineChartNivo ──────────────────────────────────────────────────────
// Replaces the hand-rolled SVG line chart in the Funding panel.

interface FundingDealMinimal {
  date: string;
  valueM: number | null;
}

interface FundingLineChartProps {
  deals: FundingDealMinimal[];
  selectedYear?: string | null;
  onYearClick?: (year: string | null) => void;
}

function buildFundingYearData(deals: FundingDealMinimal[]) {
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

export function FundingLineChartNivo({ deals, selectedYear, onYearClick }: FundingLineChartProps) {
  const yearData = buildFundingYearData(deals);
  if (yearData.length === 0) return null;

  const maxValue = Math.max(...yearData.map((d) => d.totalValueM), 1);
  const valueMax = Math.ceil(maxValue / 5000) * 5000 || 5000;

  const lineData = [
    {
      id: 'funding',
      data: yearData.map((d) => ({ x: String(d.year), y: d.totalValueM })),
    },
  ];

  // Custom layer: draws a vertical highlight for the selected year
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HighlightLayer = (props: any) => {
    if (!selectedYear) return null;
    const { points, innerHeight } = props as {
      points: Array<{ x: number; data: { x: string } }>;
      innerHeight: number;
    };
    const match = points.find((p) => p.data.x === selectedYear);
    if (!match) return null;
    return (
      <line
        x1={match.x}
        y1={0}
        x2={match.x}
        y2={innerHeight}
        stroke="rgba(99,102,241,0.4)"
        strokeWidth={2}
        strokeDasharray="4,2"
        pointerEvents="none"
      />
    );
  };

  return (
    <div style={{ height: 220 }}>
      <ResponsiveLine
        data={lineData}
        margin={{ top: 20, right: 30, bottom: 40, left: 80 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 0, max: valueMax }}
        curve="monotoneX"
        animate={true}
        motionConfig="gentle"
        colors={['#3b82f6']}
        lineWidth={2}
        pointSize={8}
        pointColor="#3b82f6"
        pointBorderColor="#fff"
        pointBorderWidth={2}
        enableArea={true}
        areaOpacity={0.08}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onClick={(point: any) => {
          const yr = String(point.data?.x ?? point.data?.x);
          if (yr && yr !== 'undefined') onYearClick?.(yr === selectedYear ? null : yr);
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers={['grid', 'markers', 'axes', HighlightLayer as any, 'areas', 'lines', 'points', 'slices', 'mesh', 'legends']}
        axisBottom={{
          tickSize: 0,
          tickPadding: 5,
        }}
        axisLeft={{
          tickValues: 5,
          tickSize: 0,
          format: (v) =>
            Number(v) >= 1000
              ? `$${(Number(v) / 1000).toFixed(0)}B`
              : `$${Math.round(Number(v))}M`,
          legend: 'USD $M',
          legendPosition: 'middle',
          legendOffset: -68,
        }}
        gridYValues={5}
        tooltip={({ point }) => (
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
            <strong>{point.data.xFormatted}</strong>
            <div>
              {Number(point.data.y) >= 1000
                ? `$${(Number(point.data.y) / 1000).toFixed(1)}B`
                : `$${Number(point.data.y).toLocaleString()}M`}
            </div>
          </div>
        )}
        theme={{
          grid: { line: { stroke: '#f0f0f0', strokeWidth: 1 } },
          axis: {
            ticks: { text: { fontSize: 9, fill: '#9ca3af' } },
            legend: { text: { fontSize: 9, fill: '#6b7280' } },
          },
        }}
      />
    </div>
  );
}
