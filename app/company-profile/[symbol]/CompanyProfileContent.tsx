'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { SP500_COMPANIES } from '@/app/data/sp500';
import { extractJson } from '@/app/lib/parseContent';
import companyProfileMd from '@/content/company-profile.md';

// ── Types ────────────────────────────────────────────────────────────────────

interface CompanyInfo {
  symbol: string;
  name: string;
  localCurrency: string;
  bbgId: string;
  stockExchange: string;
  publicTags: string[];
  myTags: string[];
}

interface FinancialDataPoint {
  quarter: string;
  netIncome: number;
  totalRevenue: number;
  guidance: number | null;
}

interface RevenueBreakdownItem {
  name: string;
  pct: number;
}

interface DoiRevenuePoint {
  quarter: string;
  doi: number;
  revenue: number;
  guidance: number | null;
}

interface CompanyFinancialData {
  currentQtr: {
    label: string;
    revenue: number;
    revenueUnit: string;
    revenueQoQ: number;
    grossMargin: number;
    grossMarginNote: string;
    doi: number;
  };
  nextQtr: {
    label: string;
    revenueMidpointGuidance: number;
    revenueQoQ: number;
  };
  financialIndices: FinancialDataPoint[];
  revenueBreakdown: { quarter: string; items: RevenueBreakdownItem[] };
  doiRevenue: DoiRevenuePoint[];
}

interface ProfileData {
  companies: CompanyInfo[];
  financialData: Record<string, CompanyFinancialData>;
}

// ── Parse markdown data ──────────────────────────────────────────────────────

let _parsed: ProfileData | null = null;
function getProfileData(): ProfileData {
  if (!_parsed) {
    _parsed = extractJson<ProfileData>(companyProfileMd);
  }
  return _parsed;
}

// ── Constants ────────────────────────────────────────────────────────────────

const TABS = ['FIN. Summary', 'FIN. Statement', 'News', 'IR Material', 'M&A', 'Stock'] as const;
type Tab = (typeof TABS)[number];

const FIN_INDICES = [
  'Revenue',
  'Gross Profit',
  'Gross Margin',
  'Operating Margin',
  'Net Income',
  'Net Margin',
  'Cash & Cash Equivalents',
] as const;

const FAVORITES_KEY = 'cp-favorites';

// Y-axis rounding intervals for SVG charts
const BAR_CHART_Y_INTERVAL = 2000;
const DOI_REVENUE_Y_INTERVAL = 4000;

// ── SVG Chart Components ─────────────────────────────────────────────────────

interface BarChartProps {
  data: FinancialDataPoint[];
}

function FinancialBarChart({ data }: BarChartProps) {
  const W = 420;
  const H = 100;
  const PAD = { top: 10, right: 20, bottom: 28, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue));
  const maxIncome = Math.max(...data.map((d) => d.netIncome));
  const maxVal = Math.max(maxRevenue, maxIncome, 1);

  // Round up to nearest BAR_CHART_Y_INTERVAL
  const yMax = Math.ceil(maxVal / BAR_CHART_Y_INTERVAL) * BAR_CHART_Y_INTERVAL;
  const yTicks = [0, yMax / 4, yMax / 2, (3 * yMax) / 4, yMax];

  const barGroupW = chartW / data.length;
  const barW = Math.max(4, barGroupW * 0.3);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Y-axis ticks and grid lines */}
      {yTicks.map((tick) => {
        const y = PAD.top + chartH - (tick / yMax) * chartH;
        return (
          <g key={tick}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {tick >= 1000 ? `${tick / 1000}k` : tick}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const cx = PAD.left + i * barGroupW + barGroupW / 2;
        const revenueH = (d.totalRevenue / yMax) * chartH;
        const incomeH = (d.netIncome / yMax) * chartH;
        const isGuidance = d.guidance !== null;
        return (
          <g key={d.quarter}>
            {/* Revenue bar */}
            <rect
              x={cx - barW - 2}
              y={PAD.top + chartH - revenueH}
              width={barW}
              height={revenueH}
              fill={isGuidance ? '#ef9a9a' : '#E53935'}
              opacity={isGuidance ? 0.55 : 1}
              rx="2"
            />
            {/* Net Income bar */}
            <rect
              x={cx + 2}
              y={PAD.top + chartH - incomeH}
              width={barW}
              height={incomeH}
              fill={isGuidance ? '#90caf9' : '#2196F3'}
              opacity={isGuidance ? 0.55 : 1}
              rx="2"
            />
            {/* X-axis label */}
            <text
              x={cx}
              y={H - 8}
              textAnchor="middle"
              fontSize="9"
              fill="#9ca3af"
            >
              {d.quarter}
            </text>
          </g>
        );
      })}

      {/* X-axis line */}
      <line
        x1={PAD.left}
        y1={PAD.top + chartH}
        x2={W - PAD.right}
        y2={PAD.top + chartH}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    </svg>
  );
}

interface DoiRevenueChartProps {
  data: DoiRevenuePoint[];
}

function DoiRevenueChart({ data }: DoiRevenueChartProps) {
  const W = 420;
  const H = 100;
  const PAD = { top: 10, right: 56, bottom: 28, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxDoi = Math.max(...data.map((d) => d.doi), 1);
  const doiMax = Math.ceil(maxDoi / 50) * 50;
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const revMax = Math.ceil(maxRevenue / DOI_REVENUE_Y_INTERVAL) * DOI_REVENUE_Y_INTERVAL;

  const n = data.length;
  const step = chartW / (n > 1 ? n - 1 : 1);

  const doiPoints = data.map((d, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + chartH - (d.doi / doiMax) * chartH,
  }));

  const revPoints = data.map((d, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + chartH - (d.revenue / revMax) * chartH,
  }));

  const guidancePoints = data.map((d, i) => ({
    x: PAD.left + i * step,
    y: d.guidance ? PAD.top + chartH - (d.guidance / revMax) * chartH : null,
  }));

  const toPath = (pts: Array<{ x: number; y: number }>) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

  // Bar width for DOI bars
  const barW = Math.max(6, step * 0.3);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PAD.top + chartH * (1 - t);
        const doiVal = Math.round(doiMax * t);
        const revVal = Math.round(revMax * t);
        return (
          <g key={t}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {doiVal}
            </text>
            <text x={W - PAD.right + 6} y={y + 4} textAnchor="start" fontSize="9" fill="#9ca3af">
              {revVal >= 1000 ? `${Math.round(revVal / 1000)}k` : revVal}
            </text>
          </g>
        );
      })}

      {/* DOI bars (blue) */}
      {data.map((d, i) => {
        const cx = PAD.left + i * step;
        const h = (d.doi / doiMax) * chartH;
        return (
          <rect
            key={`doi-${d.quarter}`}
            x={cx - barW / 2}
            y={PAD.top + chartH - h}
            width={barW}
            height={h}
            fill="#2196F3"
            opacity={0.7}
            rx="2"
          />
        );
      })}

      {/* Revenue line (red) */}
      <path d={toPath(revPoints)} fill="none" stroke="#E53935" strokeWidth="2" strokeLinejoin="round" />
      {revPoints.map((p, i) => (
        <circle key={`rv-${i}`} cx={p.x} cy={p.y} r="3" fill="#E53935" />
      ))}

      {/* Guidance line (gray dashed) */}
      {guidancePoints.some((p) => p.y !== null) && (
        <>
          {guidancePoints
            .filter((p) => p.y !== null)
            .map((p, i) => (
              <circle key={`gd-${i}`} cx={p.x} cy={p.y!} r="3" fill="#B0B0B0" />
            ))}
        </>
      )}

      {/* X-axis labels */}
      {data.map((d, i) => (
        <text
          key={`xl-${i}`}
          x={PAD.left + i * step}
          y={H - 8}
          textAnchor="middle"
          fontSize="9"
          fill="#9ca3af"
        >
          {d.quarter}
        </text>
      ))}

      {/* Axis line */}
      <line
        x1={PAD.left}
        y1={PAD.top + chartH}
        x2={W - PAD.right}
        y2={PAD.top + chartH}
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    </svg>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function BookmarkIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <path d="M12 14L8 11L4 14V3C4 2.45 4.45 2 5 2H11C11.55 2 12 2.45 12 3V14Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7.2L11.5 3.8M4.5 8.8L11.5 12.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <path d="M13 8A5 5 0 1 1 8 3H11M11 1V5H7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 2V4M8 12V14M2 8H4M12 8H14M3.5 3.5L5 5M11 11L12.5 12.5M3.5 12.5L5 11M11 5L12.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="16" height="16" aria-hidden="true">
      <path
        d="M8 2L9.8 5.9L14 6.5L11 9.4L11.6 13.5L8 11.5L4.4 13.5L5 9.4L2 6.5L6.2 5.9L8 2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'none'}
      />
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

interface CompanyProfileContentProps {
  symbol: string;
}

export default function CompanyProfileContent({ symbol }: CompanyProfileContentProps) {
  const [activeTab, setActiveTab] = useState<Tab>('FIN. Summary');
  const [activeFinIndex, setActiveFinIndex] = useState<string>('Gross Profit');
  const [isFavorite, setIsFavorite] = useState(false);
  const [myTags, setMyTags] = useState<string[]>([]);
  const tagsInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState('');

  // Parse markdown data
  const profileData = getProfileData();

  // Find company info — fall back to SP500 data if no profile data
  const companyInfo = profileData.companies.find((c) => c.symbol === symbol);
  const sp500Company = SP500_COMPANIES.find((c) => c.symbol === symbol);

  const companyName = companyInfo?.name ?? sp500Company?.name ?? symbol;
  const localCurrency = companyInfo?.localCurrency ?? 'USD';
  const bbgId = companyInfo?.bbgId ?? `—`;
  const stockExchange = companyInfo?.stockExchange ?? '—';
  const publicTags = companyInfo?.publicTags ?? [];

  // Financial data — only use if explicitly available for this symbol
  const finData = profileData.financialData[symbol] ?? null;

  // Load favorites & tags from localStorage
  useEffect(() => {
    try {
      const favs = localStorage.getItem('cp-favorites');
      if (favs) {
        const arr = JSON.parse(favs) as string[];
        setIsFavorite(arr.includes(symbol));
      }
      const tags = localStorage.getItem(`cp-tags-${symbol}`);
      if (tags) {
        setMyTags(JSON.parse(tags) as string[]);
      } else {
        setMyTags(companyInfo?.myTags ?? []);
      }
    } catch {
      setMyTags(companyInfo?.myTags ?? []);
    }
  }, [symbol, companyInfo]);

  function toggleFavorite() {
    setIsFavorite((prev) => {
      const next = !prev;
      try {
        const stored = localStorage.getItem('cp-favorites');
        const arr: string[] = stored ? JSON.parse(stored) : [];
        const updated = next ? [...arr.filter((s) => s !== symbol), symbol] : arr.filter((s) => s !== symbol);
        localStorage.setItem('cp-favorites', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function removeTag(tag: string) {
    setMyTags((prev) => {
      const next = prev.filter((t) => t !== tag);
      try {
        localStorage.setItem(`cp-tags-${symbol}`, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function addTag(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && tagInput.trim()) {
      setMyTags((prev) => {
        const next = [...prev, tagInput.trim()];
        try {
          localStorage.setItem(`cp-tags-${symbol}`, JSON.stringify(next));
        } catch {}
        return next;
      });
      setTagInput('');
    }
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad cp-detail-page">

            {/* ── 1.1 Top bar ── */}
            <div className="cp-detail-topbar">
              <div className="cp-detail-topbar-left">
                <Link href="/company-profile" className="cp-back-btn">
                  <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                    <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back
                </Link>
                <div className="cp-breadcrumb">
                  <span className="cp-breadcrumb-text">Company Overview /</span>
                  <h1 className="cp-company-name">{companyName}</h1>
                </div>
              </div>

              <div className="cp-detail-topbar-right">
                {/* Favorite button */}
                <button
                  className={`cp-favorite-btn${isFavorite ? ' active' : ''}`}
                  onClick={toggleFavorite}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <StarIcon filled={isFavorite} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </button>

                {/* Action icons */}
                <div className="cp-action-icons">
                  <button className="cp-action-icon-btn" title="Bookmark"><BookmarkIcon /></button>
                  <button className="cp-action-icon-btn" title="Share"><ShareIcon /></button>
                  <button className="cp-action-icon-btn" title="Refresh"><RefreshIcon /></button>
                  <button className="cp-action-icon-btn" title="Settings"><SettingsIcon /></button>
                </div>
              </div>
            </div>

            {/* ── Company info cards + Tags panel ── */}
            <div className="cp-info-tags-row">
              <div className="cp-info-cards">
                <div className="cp-info-card">
                  <span className="cp-info-label">Local Currency</span>
                  <span className="cp-info-value">{localCurrency}</span>
                </div>
                <div className="cp-info-card">
                  <span className="cp-info-label">BBG ID</span>
                  <span className="cp-info-value">{bbgId}</span>
                </div>
                <div className="cp-info-card">
                  <span className="cp-info-label">Stock Exchange</span>
                  <span className="cp-info-value">{stockExchange}</span>
                </div>
              </div>

              {/* Right panel: Public Tags + My Tags + Add Tag — same height as info cards */}
              <div className="cp-tags-panel">
                {publicTags.length > 0 && (
                  <div className="cp-tags-group">
                    <span className="cp-tags-group-label">Public Tag</span>
                    <div className="cp-tags-list">
                      {publicTags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/company-profile?tag=${encodeURIComponent(tag)}`}
                          className="cp-tag cp-tag--link"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                <div className="cp-tags-group">
                  <span className="cp-tags-group-label">My Tag</span>
                  <div className="cp-tags-list">
                    {myTags.map((tag) => (
                      <span key={tag} className="cp-tag cp-tag--my">
                        <Link
                          href={`/company-profile?tag=${encodeURIComponent(tag)}`}
                          className="cp-tag-text-link"
                        >
                          {tag}
                        </Link>
                        <button className="cp-tag-remove" onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>×</button>
                      </span>
                    ))}
                    <input
                      ref={tagsInputRef}
                      className="cp-tag-input"
                      placeholder="+ Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Navigation tabs ── */}
            <div className="cp-nav-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`cp-nav-tab${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ── Data cards (FIN. Summary tab) ── */}
            {activeTab === 'FIN. Summary' && (
              finData ? (
              <div className="cp-cards-area">
                <div className="cp-cards-main-grid">

                  {/* Column 1: Current Qtr Financial */}
                  <div className="cp-data-card">
                    <div className="cp-card-title">Current Qtr Financial</div>
                    <div className="cp-card-divider" />
                    <div className="cp-fin-metrics">
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">Revenue ({finData.currentQtr.revenueUnit})</div>
                        <div className="cp-fin-metric-value">{finData.currentQtr.revenue.toLocaleString()}</div>
                      </div>
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">Revenue QoQ</div>
                        <div className={`cp-fin-metric-value ${finData.currentQtr.revenueQoQ >= 0 ? 'pos' : 'neg'}`}>
                          {finData.currentQtr.revenueQoQ >= 0 ? '+' : ''}{finData.currentQtr.revenueQoQ}%
                        </div>
                      </div>
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">Gross Margin</div>
                        <div className="cp-fin-metric-value">
                          {finData.currentQtr.grossMargin}%
                          <span className="cp-fin-metric-note">{finData.currentQtr.grossMarginNote}</span>
                        </div>
                      </div>
                      <div className="cp-fin-metric">
                        <div className="cp-fin-metric-label">DOI (Days)</div>
                        <div className="cp-fin-metric-value">{finData.currentQtr.doi}</div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Next Qtr Key Indices + Revenue Breakdown stacked */}
                  <div className="cp-col-stack">
                    <div className="cp-data-card">
                      <div className="cp-card-title">Next Qtr Key Indices</div>
                      <div className="cp-card-divider" />
                      <div className="cp-fin-metrics">
                        <div className="cp-fin-metric">
                          <div className="cp-fin-metric-label">Revenue Midpoint Guidance</div>
                          <div className="cp-fin-metric-value">{finData.nextQtr.revenueMidpointGuidance.toLocaleString()}</div>
                        </div>
                        <div className="cp-fin-metric">
                          <div className="cp-fin-metric-label">Revenue QoQ</div>
                          <div className={`cp-fin-metric-value ${finData.nextQtr.revenueQoQ >= 0 ? 'pos' : 'neg'}`}>
                            {finData.nextQtr.revenueQoQ >= 0 ? '+' : ''}{finData.nextQtr.revenueQoQ}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cp-data-card">
                      <div className="cp-card-title">
                        Revenue Breakdown
                        <span className="cp-card-subtitle">{finData.revenueBreakdown.quarter}</span>
                      </div>
                      <div className="cp-card-divider" />
                      <div className="cp-breakdown-list">
                        {finData.revenueBreakdown.items.map((item) => (
                          <div key={item.name} className="cp-breakdown-item">
                            <span className="cp-breakdown-name">{item.name}</span>
                            <div className="cp-breakdown-bar-wrap">
                              <div className="cp-breakdown-bar" style={{ width: `${Math.min(100, item.pct)}%` }} />
                            </div>
                            <span className="cp-breakdown-pct">{item.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Financial Indices + DOI & Revenue stacked */}
                  <div className="cp-col-stack">
                    <div className="cp-data-card cp-data-card--wide">
                      <div className="cp-card-title">Financial Indices</div>
                      <div className="cp-card-divider" />
                      <div className="cp-fin-index-tabs">
                        {FIN_INDICES.map((idx) => (
                          <button
                            key={idx}
                            className={`cp-fin-index-tab${activeFinIndex === idx ? ' active' : ''}`}
                            onClick={() => setActiveFinIndex(idx)}
                          >
                            {idx}
                          </button>
                        ))}
                      </div>
                      <div className="cp-chart-legend">
                        <span className="cp-legend-dot cp-legend-dot--blue" />
                        <span className="cp-legend-label cp-legend-label--blue">Net income</span>
                        <span className="cp-legend-dot cp-legend-dot--red" />
                        <span className="cp-legend-label cp-legend-label--red">Total Revenue</span>
                        <span className="cp-legend-dot cp-legend-dot--gray" />
                        <span className="cp-legend-label cp-legend-label--gray">Guidance</span>
                      </div>
                      <FinancialBarChart data={finData.financialIndices} />
                    </div>

                    <div className="cp-data-card cp-data-card--wide2">
                      <div className="cp-card-title">DOI &amp; Revenue</div>
                      <div className="cp-card-divider" />
                      <div className="cp-chart-legend">
                        <span className="cp-legend-dot cp-legend-dot--blue" />
                        <span className="cp-legend-label cp-legend-label--blue">DOI</span>
                        <span className="cp-legend-dot cp-legend-dot--red" />
                        <span className="cp-legend-label cp-legend-label--red">Revenue</span>
                        <span className="cp-legend-dot cp-legend-dot--gray" />
                        <span className="cp-legend-label cp-legend-label--gray">Guidance</span>
                      </div>
                      <DoiRevenueChart data={finData.doiRevenue} />
                    </div>
                  </div>

                </div>
              </div>
              ) : (
              <div className="cp-tab-placeholder">
                <span className="cp-tab-placeholder-text">
                  Financial data for {symbol} is not yet available.
                </span>
              </div>
              )
            )}

            {/* Placeholder for other tabs */}
            {activeTab !== 'FIN. Summary' && (
              <div className="cp-tab-placeholder">
                <span className="cp-tab-placeholder-text">{activeTab} — Content coming soon</span>
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}
