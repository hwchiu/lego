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

// ── Shared year-parsing helper ────────────────────────────────────────────────

/** Parse quarter label like "21Q2" → "2021" */
function parseYearFromQuarter(quarter: string): string {
  const yr = parseInt(quarter.slice(0, 2), 10);
  return String(2000 + yr);
}

// ── FinancialIndicesNivoChart ─────────────────────────────────────────────────
// Replaces the hand-rolled SVG bar chart in the "Financial Indices" card.

interface FinDataPoint {
  quarter: string;
  netIncome: number;
  totalRevenue: number;
  grossProfit: number;
  grossMarginPct: number;
  operatingMarginPct: number;
  netMarginPct: number;
  cashEquivalents: number;
  guidance: number | null;
}

interface FinIndicesChartProps {
  data: FinDataPoint[];
  activeMetric: string;
}

const FIN_METRIC_CFG: Record<string, {
  key: keyof FinDataPoint;
  isPercent: boolean;
  color: string;
  label: string;
}> = {
  'Revenue':               { key: 'totalRevenue',       isPercent: false, color: '#bf3030', label: 'Total Revenue' },
  'Gross Profit':          { key: 'grossProfit',         isPercent: false, color: '#bf3030', label: 'Gross Profit' },
  'Gross Margin':          { key: 'grossMarginPct',      isPercent: true,  color: '#bf3030', label: 'Gross Margin (%)' },
  'Operating Margin':      { key: 'operatingMarginPct',  isPercent: true,  color: '#bf3030', label: 'Operating Margin (%)' },
  'Net Income':            { key: 'netIncome',           isPercent: false, color: '#1673EE', label: 'Net Income' },
  'Net Margin':            { key: 'netMarginPct',        isPercent: true,  color: '#bf3030', label: 'Net Margin (%)' },
  'Cash & Cash Equivalents': { key: 'cashEquivalents',  isPercent: false, color: '#16a34a', label: 'Cash & Equivalents' },
};

export function FinancialIndicesNivoChart({ data, activeMetric }: FinIndicesChartProps) {
  // Sort quarters chronologically: "21Q1" < "21Q2" < ... < "23Q4"
  const quarterly = [...data].sort((a, b) => a.quarter.localeCompare(b.quarter));
  const isRevenue = activeMetric === 'Revenue';
  const cfg = FIN_METRIC_CFG[activeMetric] ?? FIN_METRIC_CFG['Revenue'];

  let barData: Record<string, string | number>[];
  let keys: string[];
  let colors: string[];
  let yMax: number;
  let yAxisLabel: string;
  let legendItems: { id: string; label: string; color: string }[] | null = null;

  if (isRevenue) {
    keys = ['totalRevenue', 'netIncome'];
    colors = ['#bf3030', '#1673EE'];
    const maxVal = Math.max(...quarterly.map((d) => Math.max(d.totalRevenue, d.netIncome)), 1);
    yMax = Math.ceil(maxVal / 5000) * 5000 || 5000;
    yAxisLabel = 'USD $M';
    legendItems = [
      { id: 'totalRevenue', label: 'Total Revenue', color: '#bf3030' },
      { id: 'netIncome',    label: 'Net Income',    color: '#1673EE' },
    ];
    barData = quarterly.map((d) => ({
      quarter: d.quarter,
      totalRevenue: d.totalRevenue,
      netIncome: d.netIncome,
    }));
  } else if (cfg.isPercent) {
    keys = [cfg.key as string];
    colors = [cfg.color];
    const maxVal = Math.max(...quarterly.map((d) => Math.abs(d[cfg.key] as number)), 10);
    yMax = Math.ceil(maxVal / 10) * 10;
    yAxisLabel = '%';
    barData = quarterly.map((d) => ({
      quarter: d.quarter,
      [cfg.key as string]: d[cfg.key] as number,
    }));
  } else {
    keys = [cfg.key as string];
    colors = [cfg.color];
    const maxVal = Math.max(...quarterly.map((d) => d[cfg.key] as number), 1);
    yMax = Math.ceil(maxVal / 5000) * 5000 || 5000;
    yAxisLabel = 'USD $M';
    barData = quarterly.map((d) => ({
      quarter: d.quarter,
      [cfg.key as string]: d[cfg.key] as number,
    }));
  }

  return (
    <div style={{ height: 200 }}>
      <ResponsiveBar
        data={barData}
        keys={keys}
        indexBy="quarter"
        groupMode={isRevenue ? 'grouped' : 'stacked'}
        margin={{ top: legendItems ? 30 : 16, right: 16, bottom: 36, left: 56 }}
        valueScale={{ type: 'linear', min: 0, max: yMax }}
        colors={colors}
        borderRadius={2}
        enableLabel={false}
        animate={true}
        motionConfig="gentle"
        axisBottom={{
          tickSize: 0,
          tickPadding: 6,
        }}
        axisLeft={{
          tickValues: 5,
          tickSize: 0,
          legend: yAxisLabel,
          legendPosition: 'middle',
          legendOffset: -46,
          format: (v) =>
            cfg.isPercent
              ? `${Number(v).toFixed(0)}%`
              : Number(v) >= 1000
                ? `${(Number(v) / 1000).toFixed(0)}k`
                : String(v),
        }}
        gridYValues={5}
        tooltip={({ indexValue, id, value }) => {
          const seriesLabel: Record<string, string> = {
            totalRevenue: 'Revenue',
            netIncome: 'Net Income',
          };
          const label = seriesLabel[String(id)] ?? cfg.label;
          const formattedValue = cfg.isPercent
            ? `${Number(value).toFixed(1)}%`
            : `$${Number(value).toLocaleString()}M`;
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
              <div>{label}: {formattedValue}</div>
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
        legends={legendItems ? [
          {
            dataFrom: 'keys',
            anchor: 'top-left',
            direction: 'row',
            data: legendItems,
            itemWidth: 110,
            itemHeight: 20,
            translateX: 0,
            translateY: -28,
            symbolSize: 8,
            symbolShape: 'square',
            itemTextColor: '#374151',
            itemsSpacing: 4,
          },
        ] : []}
      />
    </div>
  );
}

// ── DoiRevenueNivoChart ───────────────────────────────────────────────────────
// Replaces the hand-rolled SVG bar+line chart in the "DOI & Revenue" card.

interface DoiRevDataPoint {
  quarter: string;
  doi: number;
  revenue: number;
  guidance: number | null;
}

interface DoiRevNivoChartProps {
  data: DoiRevDataPoint[];
}

function aggregateDoiRevByYear(
  data: DoiRevDataPoint[],
): { year: string; doi: number; revenue: number }[] {
  type Acc = { doiSum: number; doiCount: number; revenue: number };
  const map = new Map<string, Acc>();
  for (const d of data) {
    const year = parseYearFromQuarter(d.quarter);
    if (!map.has(year)) {
      map.set(year, { doiSum: 0, doiCount: 0, revenue: 0 });
    }
    const e = map.get(year)!;
    e.doiSum += d.doi;
    e.doiCount += 1;
    e.revenue += d.revenue;
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, e]) => ({
      year,
      doi: e.doiCount > 0 ? Math.round(e.doiSum / e.doiCount) : 0,
      revenue: e.revenue,
    }));
}

export function DoiRevenueNivoChart({ data }: DoiRevNivoChartProps) {
  const annual = aggregateDoiRevByYear(data);
  if (annual.length === 0) return null;

  const maxDoi = Math.max(...annual.map((d) => d.doi), 1);
  const doiMax = Math.ceil(maxDoi / 50) * 50 || 50;
  const maxRevenue = Math.max(...annual.map((d) => d.revenue), 1);
  const revMax = Math.ceil(maxRevenue / 5000) * 5000 || 5000;

  const barData = annual.map((d) => ({
    year: d.year,
    doi: d.doi,
  }));

  const yearToIdx = new Map(annual.map((d, i) => [d.year, i]));

  // Custom layer: draws the Revenue line on top of DOI bars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const RevenueLineLayer = (props: any) => {
    const { bars, innerHeight, innerWidth } = props as {
      bars: Array<{ x: number; width: number; data: { indexValue: string } }>;
      innerHeight: number;
      innerWidth: number;
    };

    const n = annual.length;
    const slotWidth = innerWidth / n;

    const points = annual.map((d) => {
      const bar = bars.find((b) => b.data.indexValue === d.year);
      const idx = yearToIdx.get(d.year)!;
      const cx = bar ? bar.x + bar.width / 2 : slotWidth * idx + slotWidth / 2;
      const cy = innerHeight - (d.revenue / revMax) * innerHeight;
      return { cx, cy, year: d.year, revenue: d.revenue };
    });

    if (points.length === 0) return null;

    const polylineStr = points.map((p) => `${p.cx},${p.cy}`).join(' ');

    return (
      <>
        {points.length >= 2 && (
          <polyline
            points={polylineStr}
            fill="none"
            stroke="#1673EE"
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
            fill="#1673EE"
            stroke="#fff"
            strokeWidth={1.5}
          />
        ))}
      </>
    );
  };

  return (
    <div style={{ height: 200 }}>
      <ResponsiveBar
        data={barData}
        keys={['doi']}
        indexBy="year"
        margin={{ top: 16, right: 60, bottom: 36, left: 52 }}
        valueScale={{ type: 'linear', min: 0, max: doiMax }}
        colors={['#bf3030']}
        borderRadius={2}
        enableLabel={false}
        animate={true}
        motionConfig="gentle"
        axisBottom={{ tickSize: 0, tickPadding: 6 }}
        axisLeft={{
          tickValues: 5,
          tickSize: 0,
          legend: 'DOI',
          legendPosition: 'middle',
          legendOffset: -40,
        }}
        axisRight={{
          tickValues: 5,
          tickSize: 0,
          format: (v) => `${Math.round((Number(v) / doiMax) * revMax)}`,
          legend: 'USD $M',
          legendPosition: 'middle',
          legendOffset: 52,
        }}
        gridYValues={5}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        layers={['grid', 'axes', 'bars', 'markers', RevenueLineLayer as any, 'legends', 'annotations']}
        tooltip={({ indexValue, value }) => {
          const annualEntry = annual.find((d) => d.year === indexValue);
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
              <div>DOI: {value} days</div>
              {annualEntry && (
                <div>
                  Revenue:{' '}
                  {annualEntry.revenue >= 1000
                    ? `$${(annualEntry.revenue / 1000).toFixed(1)}B`
                    : `$${annualEntry.revenue.toLocaleString()}M`}
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
              { id: 'doi',     label: 'DOI (avg)',      color: '#bf3030' },
              { id: 'revenue', label: 'Revenue (USD $M)', color: '#1673EE' },
            ],
            itemWidth: 130,
            itemHeight: 20,
            translateX: 0,
            translateY: -14,
            symbolSize: 8,
            symbolShape: 'square',
            itemTextColor: '#374151',
            itemsSpacing: 4,
          },
        ]}
      />
    </div>
  );
}
