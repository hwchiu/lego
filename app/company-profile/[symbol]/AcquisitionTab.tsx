'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getAcquisitionByCoCd, AcquisitionDeal, AcquisitionResult } from '@/app/lib/getAcquisitionByCoCd';

const AcquisitionBarLineChartNivo = dynamic(
  () => import('./InvestmentNivoCharts').then((m) => m.AcquisitionBarLineChartNivo),
  { ssr: false, loading: () => <div style={{ height: 260, background: '#f3f4f6', borderRadius: 8 }} /> },
);

// ── Stacked Bar + Line Chart ──────────────────────────────────────────────────

const CHART_START_YEAR = 1988;
const CHART_END_YEAR = 2026;

interface YearChartData {
  year: number;
  disclosedCount: number;
  undisclosedCount: number;
  disclosedValueM: number;
}

function buildYearData(deals: AcquisitionDeal[]): YearChartData[] {
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

function AcquisitionBarLineChart({ deals }: { deals: AcquisitionDeal[] }) {
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; year: number;
    disclosed: number; undisclosed: number; valueM: number;
  } | null>(null);

  const yearData = buildYearData(deals);

  const W = 820;
  const H = 230;
  const PAD = { top: 30, right: 70, bottom: 40, left: 50 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxCount = Math.max(...yearData.map((d) => d.disclosedCount + d.undisclosedCount), 1);
  const countMax = Math.ceil(maxCount / 2) * 2 || 2;

  const maxValue = Math.max(...yearData.map((d) => d.disclosedValueM), 1);
  const valueMax = Math.ceil(maxValue / 500) * 500 || 500;

  const barSlotW = chartW / yearData.length;
  const barW = Math.max(3, barSlotW * 0.65);

  const linePoints = yearData
    .map((d, i) => {
      const cx = PAD.left + i * barSlotW + barSlotW / 2;
      const cy = d.disclosedValueM > 0
        ? PAD.top + chartH - (d.disclosedValueM / valueMax) * chartH
        : null;
      return { cx, cy, year: d.year, value: d.disclosedValueM };
    })
    .filter((p) => p.cy !== null) as { cx: number; cy: number; year: number; value: number }[];

  const polyline = linePoints.map((p) => `${p.cx},${p.cy}`).join(' ');

  return (
    <div className="aapl-inv-chart-wrap" style={{ position: 'relative' }}>
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
              <text x={PAD.left - 5} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                {Math.round(countMax * t)}
              </text>
              <text x={W - PAD.right + 5} y={y + 4} textAnchor="start" fontSize="9" fill="#6b7280">
                {Math.round(valueMax * t)}
              </text>
            </g>
          );
        })}

        <text
          x={PAD.left - 36}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          fontSize="9"
          fill="#6b7280"
          transform={`rotate(-90, ${PAD.left - 36}, ${PAD.top + chartH / 2})`}
        >
          Count
        </text>
        <text
          x={W - PAD.right + 50}
          y={PAD.top + chartH / 2}
          textAnchor="middle"
          fontSize="9"
          fill="#6b7280"
          transform={`rotate(90, ${W - PAD.right + 50}, ${PAD.top + chartH / 2})`}
        >
          Value (USD $M)
        </text>

        {yearData.map((d, i) => {
          const cx = PAD.left + i * barSlotW + barSlotW / 2;
          const x = cx - barW / 2;
          const discH = (d.disclosedCount / countMax) * chartH;
          const undiscH = (d.undisclosedCount / countMax) * chartH;
          const totalH = discH + undiscH;
          const baseY = PAD.top + chartH;
          const showLabel = d.year % 5 === 0 || d.year === CHART_END_YEAR;
          const isHovered = tooltip?.year === d.year;

          return (
            <g
              key={d.year}
              onMouseEnter={(e) => {
                const svgEl = (e.currentTarget as SVGElement).closest('svg');
                if (!svgEl) return;
                const rect = svgEl.getBoundingClientRect();
                const scaleX = rect.width / W;
                const scaleY = rect.height / H;
                setTooltip({
                  x: cx * scaleX,
                  y: (baseY - totalH - 6) * scaleY,
                  year: d.year,
                  disclosed: d.disclosedCount,
                  undisclosed: d.undisclosedCount,
                  valueM: d.disclosedValueM,
                });
              }}
              style={{ cursor: 'pointer' }}
            >
              {discH > 0 && (
                <rect x={x} y={baseY - discH} width={barW} height={discH} fill={isHovered ? '#8a1f1f' : '#bf3030'} rx="1" />
              )}
              {undiscH > 0 && (
                <rect x={x} y={baseY - discH - undiscH} width={barW} height={undiscH} fill={isHovered ? '#0e4eb5' : '#1673EE'} rx="1" />
              )}
              {showLabel && (
                <text x={cx} y={H - 6} textAnchor="middle" fontSize="8" fill="#9ca3af">{d.year}</text>
              )}
            </g>
          );
        })}

        <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH} stroke="#e5e7eb" strokeWidth="1" />

        {polyline && (
          <polyline points={polyline} fill="none" stroke="#111827" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {linePoints.map((p) => (
          <circle key={p.year} cx={p.cx} cy={p.cy} r="3" fill="#111827" stroke="#fff" strokeWidth="1" />
        ))}

        <rect x={PAD.left} y={8} width="8" height="8" fill="#bf3030" rx="1" />
        <text x={PAD.left + 11} y={16} fontSize="9" fill="#374151">Count of Disclosed Value</text>
        <rect x={PAD.left + 155} y={8} width="8" height="8" fill="#1673EE" rx="1" />
        <text x={PAD.left + 168} y={16} fontSize="9" fill="#374151">Count of Undisclosed Value</text>
        <line x1={PAD.left + 340} y1={12} x2={PAD.left + 355} y2={12} stroke="#111827" strokeWidth="2" />
        <circle cx={PAD.left + 347} cy={12} r="3" fill="#111827" />
        <text x={PAD.left + 359} y={16} fontSize="9" fill="#374151">Disclosed Value (M)</text>
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
          <div>Disclosed: {tooltip.disclosed} deal{tooltip.disclosed !== 1 ? 's' : ''}</div>
          <div>Undisclosed: {tooltip.undisclosed} deal{tooltip.undisclosed !== 1 ? 's' : ''}</div>
          {tooltip.valueM > 0 && (
            <div>Value: ${tooltip.valueM >= 1000 ? `${(tooltip.valueM / 1000).toFixed(1)}B` : tooltip.valueM.toLocaleString()}M</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Company Acquisition Panel ─────────────────────────────────────────────────

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M5 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M8 1h4v4M7 6l5-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CompanyAcquisitionPanel({ deals, companyName }: { deals: AcquisitionDeal[]; companyName: string }) {
  const allCategories = [...new Set(deals.map((d) => d.categories).filter((c): c is string => !!c))].sort();
  const hasCategories = allCategories.length > 0;

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
      {hasCategories && (
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
      )}

      {/* ── Bar + Line chart ── */}
      <div className="aapl-ma-chart-section">
        <div className="aapl-ma-section-title">
          {companyName} — Annual Acquisition Activity ({CHART_START_YEAR}–{CHART_END_YEAR})
          {selectedCategories.size > 0 && (
            <span className="aapl-ma-filter-note"> · Filtered: {[...selectedCategories].join(', ')}</span>
          )}
        </div>
        <AcquisitionBarLineChartNivo deals={filteredDeals} selectedYear={selectedYear} onYearClick={handleYearClick} />
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
                <th>Acquired Company</th>
                {hasCategories && <th>Company Categories</th>}
                <th className="text-right">Value (USD $M)</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {sortedDeals.map((deal, i) => (
                <tr key={i} className="aapl-ma-table-row">
                  <td className="aapl-ma-td-date">{deal.date}</td>
                  <td className="aapl-ma-td-company">{deal.acquiredCompany}</td>
                  {hasCategories && <td>{deal.categories ? <span className="aapl-ma-industry-pill">{deal.categories}</span> : null}</td>}
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

// ── Main Component ────────────────────────────────────────────────────────────

interface AcquisitionTabProps {
  symbol: string;
  preloadedData?: AcquisitionResult | null;
}

export default function AcquisitionTab({ symbol, preloadedData }: AcquisitionTabProps) {
  // Use preloaded data from parent if available, otherwise fetch internally
  const [acquisitionResult, setAcquisitionResult] = useState<AcquisitionResult | null>(
    preloadedData !== undefined ? preloadedData : null,
  );
  const [loading, setLoading] = useState(preloadedData === undefined || preloadedData === null);

  useEffect(() => {
    if (preloadedData !== undefined) {
      setAcquisitionResult(preloadedData);
      setLoading(preloadedData === null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getAcquisitionByCoCd(symbol).then((result) => {
      if (!cancelled) {
        setAcquisitionResult(result);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol, preloadedData]);

  if (loading) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <p className="cp-pec-empty-text">Loading Acquisition data…</p>
        </div>
      </div>
    );
  }

  // Companies with acquisition data get the dedicated panel with industry filter, bar chart, and table
  if (acquisitionResult && acquisitionResult.deals.length > 0) {
    return <CompanyAcquisitionPanel deals={acquisitionResult.deals} companyName={acquisitionResult.companyName} />;
  }

  return (
    <div className="cp-pec-wrap">
      <div className="cp-pec-empty">
        <p className="cp-pec-empty-text">No Acquisition data available.</p>
      </div>
    </div>
  );
}
