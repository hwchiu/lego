'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  TSM_CENTER_NODE,
  TSM_TIER1_SUPPLIERS,
  TSM_TIER2_SUPPLIERS,
  EDGE_ENTITIES,
  RELATION_TYPES,
  type SupplierNodeTSM,
  type RelationTypeKey,
} from '@/app/data/tsmcSupplierData';
import { SP500_COMPANIES } from '@/app/data/sp500';

// ── Layout constants ──────────────────────────────────────────────────────────

const SVG_W = 1300;
const SVG_H = 960;
const CX = 650;
const CY = 480;
const R1 = 240; // tier-1 ring radius
const R2 = 430; // tier-2 ring radius
const CENTER_W = 180, CENTER_H = 100;
const T1_W = 140, T1_H = 80;
const T2_W = 110, T2_H = 65;
const CORNER_R = 12;
const SPREAD_RAD = (10 * Math.PI) / 180; // ±10° — prevents cross-parent tier-2 overlap

// Node strip colors for tiers
const TIER1_STRIP_COLOR = '#1e40af'; // dark blue
const TIER2_STRIP_COLOR = '#93c5fd'; // light blue

// Nodes with news notifications: id → count
const NODE_NOTIFICATIONS: Record<string, number> = { ASML: 3 };

// ID of the center (focal) node in the graph
const CENTER_NODE_ID = 'TSM';

// ── Static lookups (computed once) ───────────────────────────────────────────

const ALL_SUPPLIERS = [...TSM_TIER1_SUPPLIERS, ...TSM_TIER2_SUPPLIERS];
const UNIQUE_INDUSTRIES = [...new Set(ALL_SUPPLIERS.map((s) => s.industryCategory))];
const UNIQUE_PRODUCTS = [...new Set(ALL_SUPPLIERS.flatMap((s) => s.productCategories))];

const ALL_SUPPLIERS_LC = ALL_SUPPLIERS.map((s) => ({
  ...s,
  nameLc: s.name.toLowerCase(),
  tickerLc: s.ticker.toLowerCase(),
}));
const UNIQUE_INDUSTRIES_LC = UNIQUE_INDUSTRIES.map((s) => ({ val: s, lc: s.toLowerCase() }));
const UNIQUE_PRODUCTS_LC = UNIQUE_PRODUCTS.map((s) => ({ val: s, lc: s.toLowerCase() }));

const RELATION_LABEL_MAP = new Map(RELATION_TYPES.map((r) => [r.key, r.label]));

const EDGE_RANGE_MAP = new Map<RelationTypeKey, { min: number; max: number }>(
  RELATION_TYPES.filter((r) => r.key !== 'transactionAmount').map((r) => {
    const vals = EDGE_ENTITIES.map((e) => e[r.key] as number);
    return [r.key, { min: Math.min(...vals), max: Math.max(...vals) }] as [
      RelationTypeKey,
      { min: number; max: number },
    ];
  }),
);

const RISK_TYPES = [
  { key: 'materialShortage', labelEn: 'Material Shortage' },
  { key: 'geopolitical', labelEn: 'Geopolitical Risk' },
  { key: 'tariff', labelEn: 'Tariff Issues' },
];

const FILTER_TABS = ['Company', 'Industry', 'Product', 'News'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// ── Supply-chain news feed ────────────────────────────────────────────────────

interface FeedItem {
  id: number;
  title: string;
  tickers: string[];
  source: string;
  time: string;
}

const SUPPLY_CHAIN_FEED: FeedItem[] = [
  {
    id: 1,
    title: 'ASML Confirms EUV Machine Deliveries to TSMC On Track for 2nm Node',
    tickers: ['ASML', 'TSM'],
    source: 'Reuters',
    time: 'Today, 9:15 AM',
  },
  {
    id: 2,
    title: 'Applied Materials Reports Record Fab Equipment Orders Amid AI Chip Surge',
    tickers: ['AMAT', 'TSM'],
    source: 'Bloomberg',
    time: 'Today, 8:30 AM',
  },
  {
    id: 3,
    title: 'Lam Research Expands ALD Capacity to Meet TSMC 3nm Production Demand',
    tickers: ['LRCX', 'TSM'],
    source: 'Seeking Alpha',
    time: 'Yesterday, 6:00 PM',
  },
  {
    id: 4,
    title: 'TSMC Q1 2025: Supplier Risk Assessment — Geopolitical Tensions in Focus',
    tickers: ['TSM', 'ASML'],
    source: 'SA News',
    time: 'Yesterday, 4:45 PM',
  },
  {
    id: 5,
    title: 'KLA Corp Upgrades Process Control Tools for TSMC Advanced Packaging Lines',
    tickers: ['KLAC', 'TSM'],
    source: 'Zacks',
    time: 'Apr 2, 3:00 PM',
  },
  {
    id: 6,
    title: 'US Export Restrictions Could Delay ASML EUV Shipments to Taiwan',
    tickers: ['ASML', 'TSM'],
    source: 'Financial Times',
    time: 'Apr 2, 11:00 AM',
  },
  {
    id: 7,
    title: 'Shin-Etsu Chemical Raises Silicon Wafer Prices Ahead of TSMC Capacity Expansion',
    tickers: ['SHECY', 'TSM'],
    source: 'Nikkei',
    time: 'Apr 1, 9:30 AM',
  },
  {
    id: 8,
    title: 'Air Products Signs 10-Year UHP Gas Supply Agreement with TSMC Arizona Fab',
    tickers: ['APD', 'TSM'],
    source: 'PR Newswire',
    time: 'Mar 31, 2:00 PM',
  },
  {
    id: 9,
    title: 'Entegris Launches Next-Gen CMP Slurry Optimized for TSMC N2 Process Node',
    tickers: ['ENTG', 'TSM'],
    source: 'Business Wire',
    time: 'Mar 31, 10:00 AM',
  },
  {
    id: 10,
    title: 'Tokyo Electron Wins Major TSMC Order for Thermal CVD Equipment Fleet',
    tickers: ['TOELY', 'TSM'],
    source: 'Nikkei Asia',
    time: 'Mar 30, 8:00 AM',
  },
];

// Suggestions shown when search focused with empty query
const SUGGESTION_ITEMS = SUPPLY_CHAIN_FEED.slice(0, 5);

// ── Helpers ───────────────────────────────────────────────────────────────────

const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = (() => {
  const pos: Record<string, { x: number; y: number }> = {};
  pos[CENTER_NODE_ID] = { x: CX, y: CY };
  TSM_TIER1_SUPPLIERS.forEach((s, i) => {
    const a = (2 * Math.PI * i) / 9 - Math.PI / 2;
    pos[s.id] = { x: CX + R1 * Math.cos(a), y: CY + R1 * Math.sin(a) };
  });
  TSM_TIER2_SUPPLIERS.forEach((s) => {
    const pIdx = TSM_TIER1_SUPPLIERS.findIndex((t) => t.id === s.parentId);
    const pAngle = (2 * Math.PI * pIdx) / 9 - Math.PI / 2;
    const siblings = TSM_TIER2_SUPPLIERS.filter((t) => t.parentId === s.parentId);
    const sIdx = siblings.findIndex((t) => t.id === s.id);
    const sCount = siblings.length;
    const halfSpan = SPREAD_RAD * (sCount - 1);
    const a = pAngle + (-halfSpan + sIdx * SPREAD_RAD * 2);
    pos[s.id] = { x: CX + R2 * Math.cos(a), y: CY + R2 * Math.sin(a) };
  });
  return pos;
})();

function getSvgCoords(e: React.MouseEvent, svg: SVGSVGElement) {
  const rect = svg.getBoundingClientRect();
  const vb = svg.viewBox.baseVal;
  return {
    x: (e.clientX - rect.left) * (vb.width / rect.width) + vb.x,
    y: (e.clientY - rect.top) * (vb.height / rect.height) + vb.y,
  };
}

function rectEdgePoint(nx: number, ny: number, tw: number, th: number, tx: number, ty: number) {
  const dx = tx - nx,
    dy = ty - ny;
  const t = Math.min(
    dx === 0 ? Infinity : Math.abs(tw / 2 / dx),
    dy === 0 ? Infinity : Math.abs(th / 2 / dy),
  );
  return { x: nx + dx * t, y: ny + dy * t };
}

function getEdgeWidth(key: RelationTypeKey, value: number): number {
  if (key === 'transactionAmount') return 1.0 + (Math.min(value, 5000) / 5000) * 4.0;
  const range = EDGE_RANGE_MAP.get(key);
  if (!range || range.max === range.min) return 2.5;
  return 1.0 + ((value - range.min) / (range.max - range.min)) * 4.0;
}

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '\u2026' : s;
}

// ── SVG Node components ───────────────────────────────────────────────────────

interface NodeProps {
  node: SupplierNodeTSM;
  pos: { x: number; y: number };
  selected: boolean;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

function Tier1Node({ node, pos, selected, onClick, onMouseDown }: NodeProps) {
  const bx = pos.x - T1_W / 2,
    by = pos.y - T1_H / 2;
  const notif = NODE_NOTIFICATIONS[node.id];
  return (
    <g className="rmap-node" onClick={onClick} onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
      <rect
        x={bx}
        y={by}
        width={T1_W}
        height={T1_H}
        rx={CORNER_R}
        ry={CORNER_R}
        className={`rmap-node-rect rmap-node-rect--tier1${selected ? ' rmap-node-rect--selected' : ''}`}
      />
      <rect
        x={bx + 1}
        y={by + 1}
        width={T1_W - 2}
        height={5}
        rx={CORNER_R - 1}
        ry={4}
        style={{ fill: TIER1_STRIP_COLOR, opacity: selected ? 0 : 0.9, pointerEvents: 'none' }}
      />
      <text x={pos.x} y={by + 21} className="rmap-node-name" textAnchor="middle">
        {trunc(node.name, 18)}
      </text>
      <text x={pos.x} y={by + 33} className="rmap-node-ticker" textAnchor="middle">
        {node.ticker} · {node.country}
      </text>
      <text x={pos.x} y={by + 46} className="rmap-node-rel" textAnchor="middle">
        {trunc(node.relationship, 22)}
      </text>
      <text x={pos.x} y={by + 59} className="rmap-node-fin-label" textAnchor="middle">
        Rev: {node.financials.revenue}
      </text>
      <text x={pos.x} y={by + 71} className="rmap-node-fin-label" textAnchor="middle">
        GM: {node.financials.grossMargin}
      </text>
      {notif !== undefined && (
        <g>
          <circle cx={bx + T1_W - 8} cy={by + 8} r={10} fill="#dc2626" />
          <text
            x={bx + T1_W - 8}
            y={by + 12}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill="#fff"
            pointerEvents="none"
          >
            {notif}
          </text>
        </g>
      )}
    </g>
  );
}

function Tier2Node({ node, pos, selected, onClick, onMouseDown }: NodeProps) {
  const bx = pos.x - T2_W / 2,
    by = pos.y - T2_H / 2;
  return (
    <g
      className="rmap-node rmap-node--tier2"
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{ cursor: 'grab' }}
    >
      <rect
        x={bx}
        y={by}
        width={T2_W}
        height={T2_H}
        rx={CORNER_R - 2}
        ry={CORNER_R - 2}
        className={`rmap-node-rect rmap-node-rect--tier2${selected ? ' rmap-node-rect--selected' : ''}`}
      />
      <rect
        x={bx + 1}
        y={by + 1}
        width={T2_W - 2}
        height={4}
        rx={CORNER_R - 4}
        ry={3}
        style={{ fill: TIER2_STRIP_COLOR, opacity: selected ? 0 : 0.9, pointerEvents: 'none' }}
      />
      <text x={pos.x} y={by + 17} className="rmap-node-name rmap-node-name--tier2" textAnchor="middle">
        {trunc(node.name, 16)}
      </text>
      <text x={pos.x} y={by + 28} className="rmap-node-ticker" textAnchor="middle">
        {node.ticker} · {node.country}
      </text>
      <text x={pos.x} y={by + 40} className="rmap-node-rel" textAnchor="middle">
        {trunc(node.relationship, 20)}
      </text>
      <text x={pos.x} y={by + 54} className="rmap-node-fin-label" textAnchor="middle">
        Rev: {node.financials.revenue}
      </text>
    </g>
  );
}

function CenterNodeSvg({ node, pos, selected, onClick, onMouseDown }: NodeProps) {
  const bx = pos.x - CENTER_W / 2,
    by = pos.y - CENTER_H / 2;
  return (
    <g
      className="rmap-node rmap-node--center"
      onClick={onClick}
      onMouseDown={onMouseDown}
      style={{ cursor: 'grab' }}
    >
      <rect
        x={bx}
        y={by}
        width={CENTER_W}
        height={CENTER_H}
        rx={CORNER_R + 2}
        ry={CORNER_R + 2}
        className={`rmap-node-rect rmap-node-rect--center${selected ? ' rmap-node-rect--selected' : ''}`}
      />
      <text x={pos.x} y={by + 28} className="rmap-node-name rmap-node-name--center" textAnchor="middle">
        {node.name}
      </text>
      <text x={pos.x} y={by + 43} className="rmap-node-ticker" textAnchor="middle">
        {node.ticker} · {node.exchange}
      </text>
      <text x={pos.x} y={by + 57} className="rmap-node-fin-label" textAnchor="middle">
        Rev: {node.financials.revenue}
      </text>
      <text x={pos.x} y={by + 70} className="rmap-node-fin-label" textAnchor="middle">
        GM: {node.financials.grossMargin} · MCap: {node.financials.marketCap}
      </text>
      <text x={pos.x} y={by + 84} className="rmap-node-fin-label" textAnchor="middle">
        {trunc(node.relationship, 30)}
      </text>
    </g>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  node: SupplierNodeTSM | null;
  onClose: () => void;
}

function DetailPanel({ node, onClose }: DetailPanelProps) {
  if (!node) return null;
  const isCenter = node.id === CENTER_NODE_ID;
  const badgeColor = isCenter ? '#1a2332' : node.tier === 1 ? TIER1_STRIP_COLOR : TIER2_STRIP_COLOR;
  return (
    <div className="rmap-detail-panel">
      <button className="rmap-detail-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <div className="rmap-detail-badge" style={{ background: badgeColor }}>
        {isCenter ? 'Center Company' : `Tier ${node.tier}`}
      </div>
      <h3 className="rmap-detail-name">{node.name}</h3>
      <p className="rmap-detail-ticker">
        {node.ticker} &nbsp;·&nbsp; {node.exchange}
      </p>
      {/* Industry first */}
      <p className="rmap-detail-country">
        <span className="rmap-detail-label">Industry: </span>
        <button className="rmap-detail-tag-link">{node.industryCategory}</button>
      </p>
      {/* Country second */}
      <p className="rmap-detail-country" style={{ marginTop: 4 }}>
        <span className="rmap-detail-label">Country: </span>
        <button className="rmap-detail-tag-link">{node.country}</button>
      </p>
      {/* Supply items third */}
      {!isCenter && (
        <p className="rmap-detail-items" style={{ marginTop: 8 }}>
          <span className="rmap-detail-label">Supply Items: </span>
          {node.supplyItems}
        </p>
      )}
      <div className="rmap-detail-fins">
        <div className="rmap-detail-fin">
          <span className="rmap-detail-fin-label">Revenue</span>
          <span className="rmap-detail-fin-val">{node.financials.revenue}</span>
        </div>
        <div className="rmap-detail-fin">
          <span className="rmap-detail-fin-label">Gross Margin</span>
          <span className="rmap-detail-fin-val">{node.financials.grossMargin}</span>
        </div>
        <div className="rmap-detail-fin">
          <span className="rmap-detail-fin-label">Market Cap</span>
          <span className="rmap-detail-fin-val">{node.financials.marketCap}</span>
        </div>
      </div>
      {/* Product category tags — clickable */}
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {node.productCategories.map((cat) => (
          <button key={cat} className="rmap-detail-tag rmap-detail-tag--clickable">
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Filter bar (placed outside/above graph container) ────────────────────────

interface FilterBarProps {
  relationType: RelationTypeKey;
  onRelationChange: (key: RelationTypeKey) => void;
  selectedIndustries: Set<string>;
  onIndustryToggle: (industry: string) => void;
  onClearAllIndustries: () => void;
}

function FilterBar({ relationType, onRelationChange, selectedIndustries, onIndustryToggle, onClearAllIndustries }: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('Company');
  const [openDropdown, setOpenDropdown] = useState<'rel' | 'risk' | null>(null);
  const [selectedRisk, setSelectedRisk] = useState<string>(RISK_TYPES[0].key);
  const industryTagsRef = useRef<HTMLDivElement>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [hasTagOverflow, setHasTagOverflow] = useState(false);

  const q = query.toLowerCase().trim();
  const showQueryResults = q.length > 0;
  const showSuggestions = focused && q.length === 0;
  const showDropdownPanel = showQueryResults || showSuggestions;

  const supplierMatches = ALL_SUPPLIERS_LC.filter(
    (s) => s.nameLc.includes(q) || s.tickerLc.includes(q),
  ).map((s) => ({ label: s.name, sub: s.ticker }));

  const supplierTickers = new Set(supplierMatches.map((s) => s.sub));
  const sp500Matches = SP500_COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
  ).map((c) => ({ label: c.name, sub: c.symbol }));

  const companyResults = [
    ...supplierMatches,
    ...sp500Matches.filter((c) => !supplierTickers.has(c.sub)),
  ].slice(0, 3);

  const industryResults = UNIQUE_INDUSTRIES_LC.filter((ind) => ind.lc.includes(q))
    .map((i) => i.val)
    .slice(0, 3);
  const productResults = UNIQUE_PRODUCTS_LC.filter((p) => p.lc.includes(q))
    .map((p) => p.val)
    .slice(0, 3);

  const relLabel = RELATION_LABEL_MAP.get(relationType) ?? '';

  useEffect(() => {
    if (showAllTags) return;
    const el = industryTagsRef.current;
    if (!el) return;
    const check = () => setHasTagOverflow(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showAllTags]);

  return (
    <div className="rmap-filter-bar rmap-filter-bar--above">
      {/* Top row: search + relation + risk */}
      <div className="rmap-filter-bar-row">
      {/* Search */}
      <div className="rmap-titled-control">
        <div className="rmap-titled-control-label">Let&#39;s explore RMAP together…</div>
        <div className="rmap-filter-search-wrap">
        <div className="rmap-filter-search rmap-filter-search--tall">
          <svg
            className="rmap-filter-search-icon"
            width="15"
            height="15"
            viewBox="0 0 16 16"
            fill="none"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            className="rmap-filter-input"
            type="text"
            placeholder="Search company, industry, product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
          />
        </div>
        {showDropdownPanel && (
          <div className="rmap-filter-dropdown-abs">
            {showSuggestions ? (
              <div className="rmap-filter-dropdown rmap-filter-dropdown--suggestion">
                <div className="rmap-filter-suggestion-header">SUGGESTION</div>
                {SUGGESTION_ITEMS.map((item) => (
                  <div key={item.id} className="rmap-filter-suggestion-item">
                    <div className="rmap-filter-suggestion-title">{item.title}</div>
                    <div className="rmap-filter-suggestion-meta">
                      {item.tickers.map((t, i) => (
                        <span key={t}>
                          {i > 0 && ' · '}
                          <a href="#" className="rmap-filter-suggestion-ticker">
                            {t}
                          </a>
                        </span>
                      ))}
                      <span className="rmap-filter-suggestion-source"> · {item.source}</span>
                      <span className="rmap-filter-suggestion-time"> · {item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="rmap-filter-tabs">
                  {FILTER_TABS.map((tab) => (
                    <button
                      key={tab}
                      className={`rmap-filter-tab${activeTab === tab ? ' rmap-filter-tab--active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="rmap-filter-dropdown">
                  {activeTab === 'Company' && (
                    <>
                      {companyResults.length > 0 ? (
                        <div className="rmap-filter-group">
                          <div className="rmap-filter-group-label">Company</div>
                          {companyResults.map((c, i) => (
                            <div key={i} className="rmap-filter-item">
                              <span>{c.label}</span>
                              <span className="rmap-filter-item-sub">{c.sub}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rmap-filter-empty">No results</div>
                      )}
                    </>
                  )}
                  {activeTab === 'Industry' && (
                    <div className="rmap-filter-group">
                      {industryResults.length > 0 ? (
                        industryResults.map((ind) => (
                          <div key={ind} className="rmap-filter-item">
                            {ind}
                          </div>
                        ))
                      ) : (
                        <div className="rmap-filter-empty">No results</div>
                      )}
                    </div>
                  )}
                  {activeTab === 'Product' && (
                    <div className="rmap-filter-group">
                      {productResults.length > 0 ? (
                        productResults.map((p) => (
                          <div key={p} className="rmap-filter-item">
                            {p}
                          </div>
                        ))
                      ) : (
                        <div className="rmap-filter-empty">No results</div>
                      )}
                    </div>
                  )}
                  {activeTab === 'News' && (
                    <div className="rmap-filter-empty">News search coming soon</div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Relation Type — titled control */}
      <div className="rmap-titled-control">
        <div className="rmap-titled-control-label">Relation Type</div>
        <div className="rmap-rel-wrap">
          <button
            className="rmap-rel-btn"
            onClick={() => setOpenDropdown(openDropdown === 'rel' ? null : 'rel')}
          >
            {relLabel} <span className="rmap-dropdown-arrow">&#9660;</span>
          </button>
          {openDropdown === 'rel' && (
            <div className="rmap-rel-dropdown">
              {RELATION_TYPES.map((r) => (
                <button
                  key={r.key}
                  className={`rmap-rel-option${relationType === r.key ? ' rmap-rel-option--active' : ''}`}
                  onClick={() => {
                    onRelationChange(r.key);
                    setOpenDropdown(null);
                  }}
                >
                  <span className="rmap-checkmark">{relationType === r.key ? '✓' : ''}</span>
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Risk Analysis — titled control */}
      <div className="rmap-titled-control">
        <div className="rmap-titled-control-label">
          Risk Analysis
          <span className="badge-coming-soon" style={{ marginLeft: 5 }}>
            Coming Soon
          </span>
        </div>
        <div className="rmap-risk-wrap">
          <button
            className="rmap-risk-btn"
            onClick={() => setOpenDropdown(openDropdown === 'risk' ? null : 'risk')}
          >
            {RISK_TYPES.find((r) => r.key === selectedRisk)?.labelEn}
            <span className="rmap-dropdown-arrow">&#9660;</span>
          </button>
          {openDropdown === 'risk' && (
            <div className="rmap-risk-dropdown">
              {RISK_TYPES.map((r) => (
                <button
                  key={r.key}
                  className={`rmap-risk-option${r.key === selectedRisk ? ' rmap-rel-option--active' : ''}`}
                  onClick={() => {
                    setSelectedRisk(r.key);
                    setOpenDropdown(null);
                  }}
                >
                  {r.labelEn}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Industry filter row */}
      <div className={`rmap-industry-filter-row${showAllTags ? ' rmap-industry-filter-row--expanded' : ''}`}>
        <span className="rmap-industry-filter-label">INDUSTRY</span>
        <div
          className={`rmap-industry-tags-scroll${showAllTags ? ' rmap-industry-tags-scroll--expanded' : ''}`}
          ref={industryTagsRef}
        >
          {/* "All" tag — clears all industry filters */}
          <button
            className={`rmap-industry-tag rmap-industry-tag--all${selectedIndustries.size === 0 ? ' rmap-industry-tag--active' : ''}`}
            onClick={onClearAllIndustries}
          >
            All
          </button>
          {UNIQUE_INDUSTRIES.map((ind) => (
            <button
              key={ind}
              className={`rmap-industry-tag${selectedIndustries.has(ind) ? ' rmap-industry-tag--active' : ''}`}
              onClick={() => onIndustryToggle(ind)}
            >
              {ind}
            </button>
          ))}
          {showAllTags && hasTagOverflow && (
            <button
              className="rmap-industry-tag rmap-industry-tag--more"
              onClick={() => setShowAllTags(false)}
            >
              less
            </button>
          )}
        </div>
        {!showAllTags && hasTagOverflow && (
          <button
            className="rmap-industry-tag rmap-industry-tag--more"
            onClick={() => setShowAllTags(true)}
          >
            more
          </button>
        )}
      </div>
    </div>
  );
}

// ── Supplier Table (Table View tab) ───────────────────────────────────────────

function SupplierTable() {
  return (
    <div className="rmap-supplier-table-wrap">
      <div className="rmap-supplier-table-section">
        <div className="rmap-supplier-table-title">Tier 1 Suppliers</div>
        <table className="rmap-supplier-table">
          <thead>
            <tr>
              <th className="rmap-supplier-th">Company</th>
              <th className="rmap-supplier-th">Ticker</th>
              <th className="rmap-supplier-th">Country</th>
              <th className="rmap-supplier-th">Industry</th>
              <th className="rmap-supplier-th">Supply Items</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Revenue</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Gross Margin</th>
            </tr>
          </thead>
          <tbody>
            {TSM_TIER1_SUPPLIERS.map((s) => (
              <tr key={s.id} className="rmap-supplier-tr">
                <td className="rmap-supplier-td rmap-supplier-td--name">{s.name}</td>
                <td className="rmap-supplier-td rmap-supplier-td--ticker">{s.ticker}</td>
                <td className="rmap-supplier-td">{s.country}</td>
                <td className="rmap-supplier-td">{s.industryCategory}</td>
                <td className="rmap-supplier-td">{s.supplyItems}</td>
                <td className="rmap-supplier-td rmap-supplier-td--num">{s.financials.revenue}</td>
                <td className="rmap-supplier-td rmap-supplier-td--num">{s.financials.grossMargin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rmap-supplier-table-section">
        <div className="rmap-supplier-table-title">Tier 2 Suppliers</div>
        <table className="rmap-supplier-table">
          <thead>
            <tr>
              <th className="rmap-supplier-th">Company</th>
              <th className="rmap-supplier-th">Ticker</th>
              <th className="rmap-supplier-th">Country</th>
              <th className="rmap-supplier-th">Industry</th>
              <th className="rmap-supplier-th">Supply Items</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Revenue</th>
              <th className="rmap-supplier-th">Tier 1 Parent</th>
            </tr>
          </thead>
          <tbody>
            {TSM_TIER2_SUPPLIERS.map((s) => {
              const parent = TSM_TIER1_SUPPLIERS.find((t) => t.id === s.parentId);
              return (
                <tr key={s.id} className="rmap-supplier-tr">
                  <td className="rmap-supplier-td rmap-supplier-td--name">{s.name}</td>
                  <td className="rmap-supplier-td rmap-supplier-td--ticker">{s.ticker}</td>
                  <td className="rmap-supplier-td">{s.country}</td>
                  <td className="rmap-supplier-td">{s.industryCategory}</td>
                  <td className="rmap-supplier-td">{s.supplyItems}</td>
                  <td className="rmap-supplier-td rmap-supplier-td--num">{s.financials.revenue}</td>
                  <td className="rmap-supplier-td">{parent?.name ?? s.parentId}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Feed Panel (30% width, beside graph) ─────────────────────────────────────

interface FeedPanelProps {
  selectedNode: SupplierNodeTSM | null;
}

function FeedPanel({ selectedNode }: FeedPanelProps) {
  const filteredFeed = selectedNode
    ? SUPPLY_CHAIN_FEED.filter((item) => item.tickers.includes(selectedNode.ticker))
    : SUPPLY_CHAIN_FEED;

  return (
    <div className="rmap-feed-panel">
      <div className="rmap-feed-panel-header">
        <span className="rmap-feed-panel-title">Updates</span>
        <span className="rmap-feed-panel-sub">
          {selectedNode ? `${selectedNode.name}` : 'Supply Chain News'}
        </span>
      </div>
      <div className="rmap-feed-panel-list">
        {filteredFeed.length === 0 ? (
          <div className="rmap-feed-panel-empty">No news for {selectedNode?.name}</div>
        ) : (
          filteredFeed.map((item, idx) => (
            <div
              key={item.id}
              className={`rmap-feed-panel-item${idx < filteredFeed.length - 1 ? ' rmap-feed-panel-item--bordered' : ''}`}
            >
              <div className="rmap-feed-panel-item-title">{item.title}</div>
              <div className="rmap-feed-panel-item-meta">
                {item.tickers.map((t, i) => (
                  <span key={t}>
                    {i > 0 && ' · '}
                    <a href="#" className="rmap-feed-panel-ticker">
                      {t}
                    </a>
                  </span>
                ))}
                <span className="rmap-feed-panel-dot"> · </span>
                <span className="rmap-feed-panel-source">{item.source}</span>
                <span className="rmap-feed-panel-dot"> · </span>
                <span className="rmap-feed-panel-time">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Graph Component ──────────────────────────────────────────────────────

// Zoom limits (expressed as a viewBox scale factor relative to original)
const MIN_VB_SCALE = 0.4; // zoomed in to 40% of original viewBox → 2.5× magnification
const MAX_VB_SCALE = 2.0; // zoomed out to 200% → 0.5× magnification
const ZOOM_STEP = 1.25;

interface ViewBoxState { x: number; y: number; w: number; h: number }
const DEFAULT_VB: ViewBoxState = { x: 0, y: 0, w: SVG_W, h: SVG_H };

interface PanState {
  startClientX: number;
  startClientY: number;
  startVBX: number;
  startVBY: number;
}

interface SupplierGraphProps {
  tableOnly?: boolean;
}

export default function SupplierGraph({ tableOnly }: SupplierGraphProps) {
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    () => ({ ...INITIAL_POSITIONS }),
  );
  const [dragState, setDragState] = useState<{
    nodeId: string;
    startSvgX: number;
    startSvgY: number;
    startNodeX: number;
    startNodeY: number;
  } | null>(null);
  const [panState, setPanState] = useState<PanState | null>(null);
  const [selectedNode, setSelectedNode] = useState<SupplierNodeTSM | null>(null);
  const [relationType, setRelationType] = useState<RelationTypeKey>('transactionAmount');
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(new Set());
  const [viewBox, setViewBox] = useState<ViewBoxState>(DEFAULT_VB);
  const svgRef = useRef<SVGSVGElement>(null);
  const posRef = useRef(positions);
  posRef.current = positions;
  const viewBoxRef = useRef(viewBox);
  viewBoxRef.current = viewBox;
  const didDragRef = useRef(false);

  const toggleIndustry = useCallback((industry: string) => {
    setSelectedIndustries((prev) => {
      const next = new Set(prev);
      if (next.has(industry)) {
        next.delete(industry);
      } else {
        next.add(industry);
      }
      return next;
    });
  }, []);

  const clearAllIndustries = useCallback(() => {
    setSelectedIndustries(new Set());
  }, []);

  const applyZoom = useCallback((factor: number) => {
    setViewBox((prev) => {
      const curScale = prev.w / SVG_W;
      const newScale = Math.max(MIN_VB_SCALE, Math.min(MAX_VB_SCALE, curScale / factor));
      const newW = SVG_W * newScale;
      const newH = SVG_H * newScale;
      const cx = prev.x + prev.w / 2;
      const cy = prev.y + prev.h / 2;
      return { x: cx - newW / 2, y: cy - newH / 2, w: newW, h: newH };
    });
  }, []);

  const zoomIn = useCallback(() => applyZoom(ZOOM_STEP), [applyZoom]);
  const zoomOut = useCallback(() => applyZoom(1 / ZOOM_STEP), [applyZoom]);
  const zoomReset = useCallback(() => setViewBox(DEFAULT_VB), []);

  const resetGraph = useCallback(() => {
    setPositions({ ...INITIAL_POSITIONS });
    setViewBox(DEFAULT_VB);
  }, []);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    didDragRef.current = false;
    const { x, y } = getSvgCoords(e, svgRef.current);
    const nodePos = posRef.current[nodeId];
    setDragState({
      nodeId,
      startSvgX: x,
      startSvgY: y,
      startNodeX: nodePos.x,
      startNodeY: nodePos.y,
    });
  }, []);

  const handleSvgMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    // Only start pan on background clicks (nodes call stopPropagation)
    didDragRef.current = false;
    setPanState({
      startClientX: e.clientX,
      startClientY: e.clientY,
      startVBX: viewBoxRef.current.x,
      startVBY: viewBoxRef.current.y,
    });
  }, []);

  const dragRef = useRef(dragState);
  dragRef.current = dragState;
  const panRef = useRef(panState);
  panRef.current = panState;

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    const pan = panRef.current;

    if (drag) {
      if (!svgRef.current) return;
      didDragRef.current = true;
      const { x, y } = getSvgCoords(e, svgRef.current);
      setPositions((prev) => ({
        ...prev,
        [drag.nodeId]: {
          x: drag.startNodeX + (x - drag.startSvgX),
          y: drag.startNodeY + (y - drag.startSvgY),
        },
      }));
      return;
    }

    if (pan && svgRef.current) {
      didDragRef.current = true;
      const rect = svgRef.current.getBoundingClientRect();
      const vb = viewBoxRef.current;
      const scaleX = vb.w / rect.width;
      const scaleY = vb.h / rect.height;
      const dx = (e.clientX - pan.startClientX) * scaleX;
      const dy = (e.clientY - pan.startClientY) * scaleY;
      setViewBox((prev) => ({
        ...prev,
        x: pan.startVBX - dx,
        y: pan.startVBY - dy,
      }));
    }
  }, []);

  const clearDrag = useCallback(() => {
    setDragState(null);
    setPanState(null);
  }, []);

  const handleNodeClick = useCallback((node: SupplierNodeTSM) => {
    if (didDragRef.current) return;
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  // Compute which nodes to show based on industry filter
  const visibleNodeIds = selectedIndustries.size === 0
    ? null // null means show all
    : new Set([
        CENTER_NODE_ID, // always show center
        ...ALL_SUPPLIERS.filter((s) => selectedIndustries.has(s.industryCategory)).map((s) => s.id),
      ]);

  if (tableOnly) {
    return <SupplierTable />;
  }

  const vbStr = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;
  const isAtMinZoom = viewBox.w <= SVG_W * MIN_VB_SCALE + 1;
  const isAtMaxZoom = viewBox.w >= SVG_W * MAX_VB_SCALE - 1;
  const isGrabbing = !!(dragState || panState);

  return (
    <div className="rmap-graph-wrap">
      {/* Filter bar is placed ABOVE the graph container (not inside it) */}
      <FilterBar
        relationType={relationType}
        onRelationChange={setRelationType}
        selectedIndustries={selectedIndustries}
        onIndustryToggle={toggleIndustry}
        onClearAllIndustries={clearAllIndustries}
      />

      {/* Graph and feed panel side by side */}
      <div className="rmap-graph-content">
        {/* SVG container takes 70% */}
        <div className="rmap-svg-container">
          <svg
            ref={svgRef}
            viewBox={vbStr}
            className="rmap-svg"
            aria-label="TSMC Supplier Relationship Graph"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={clearDrag}
            onMouseLeave={clearDrag}
            style={{ cursor: isGrabbing ? 'grabbing' : 'grab' }}
          >
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" className="rmap-arrow-marker" />
              </marker>
              <marker id="arr-sm" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <polygon points="0 0, 6 2, 0 4" className="rmap-arrow-marker" />
              </marker>
            </defs>

            {/* Tier 1 → Tier 2 edges */}
            {TSM_TIER2_SUPPLIERS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              const parent = TSM_TIER1_SUPPLIERS.find((t) => t.id === node.parentId);
              if (!parent) return null;
              if (visibleNodeIds && !visibleNodeIds.has(parent.id)) return null;
              const pp = positions[parent.id],
                np = positions[node.id];
              const ep = rectEdgePoint(pp.x, pp.y, T1_W, T1_H, np.x, np.y);
              const sp = rectEdgePoint(np.x, np.y, T2_W, T2_H, pp.x, pp.y);
              const edge = EDGE_ENTITIES.find((e) => e.from === parent.id && e.to === node.id);
              const val = edge ? (edge[relationType] as number) : 0;
              const mx = (ep.x + sp.x) / 2,
                my = (ep.y + sp.y) / 2;
              return (
                <g key={`e2-${node.id}`}>
                  <line
                    x1={ep.x}
                    y1={ep.y}
                    x2={sp.x}
                    y2={sp.y}
                    className="rmap-edge rmap-edge--tier2"
                    style={{ strokeWidth: getEdgeWidth(relationType, val) }}
                    markerEnd="url(#arr-sm)"
                  />
                  {val > 0 && (
                    <text x={mx} y={my - 4} className="rmap-edge-label" textAnchor="middle">
                      {val.toLocaleString()}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Center → Tier 1 edges */}
            {TSM_TIER1_SUPPLIERS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              const cp = positions[CENTER_NODE_ID],
                np = positions[node.id];
              const ep = rectEdgePoint(cp.x, cp.y, CENTER_W, CENTER_H, np.x, np.y);
              const sp = rectEdgePoint(np.x, np.y, T1_W, T1_H, cp.x, cp.y);
              const edge = EDGE_ENTITIES.find((e) => e.from === CENTER_NODE_ID && e.to === node.id);
              const val = edge ? (edge[relationType] as number) : 0;
              const mx = (ep.x + sp.x) / 2,
                my = (ep.y + sp.y) / 2;
              return (
                <g key={`e1-${node.id}`}>
                  <line
                    x1={ep.x}
                    y1={ep.y}
                    x2={sp.x}
                    y2={sp.y}
                    className="rmap-edge"
                    style={{ strokeWidth: getEdgeWidth(relationType, val) }}
                    markerEnd="url(#arr)"
                  />
                  {val > 0 && (
                    <text x={mx} y={my - 4} className="rmap-edge-label" textAnchor="middle">
                      {val.toLocaleString()}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Tier 2 nodes */}
            {TSM_TIER2_SUPPLIERS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              return (
                <Tier2Node
                  key={node.id}
                  node={node}
                  pos={positions[node.id]}
                  selected={selectedNode?.id === node.id}
                  onClick={() => handleNodeClick(node)}
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                />
              );
            })}

            {/* Tier 1 nodes */}
            {TSM_TIER1_SUPPLIERS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              return (
                <Tier1Node
                  key={node.id}
                  node={node}
                  pos={positions[node.id]}
                  selected={selectedNode?.id === node.id}
                  onClick={() => handleNodeClick(node)}
                  onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
                />
              );
            })}

            {/* Center node — last for top z-order */}
            <CenterNodeSvg
              node={TSM_CENTER_NODE}
              pos={positions[CENTER_NODE_ID]}
              selected={selectedNode?.id === CENTER_NODE_ID}
              onClick={() => handleNodeClick(TSM_CENTER_NODE)}
              onMouseDown={(e) => handleNodeMouseDown(CENTER_NODE_ID, e)}
            />
          </svg>

          {/* Zoom controls — minimal flat buttons */}
          <div className="rmap-zoom-controls">
            <button
              className="rmap-zoom-btn rmap-zoom-btn--graph-reset"
              onClick={resetGraph}
              title="Reset Graph Layout"
              aria-label="Reset Graph Layout"
            >
              <svg
                viewBox="0 0 14 14"
                width="12"
                height="12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2.5 7A4.5 4.5 0 1 0 3.5 4" />
                <polyline points="3.5 1.5 3.5 4.5 6.5 4.5" />
              </svg>
            </button>
            <div className="rmap-zoom-sep" />
            <button
              className="rmap-zoom-btn"
              onClick={zoomIn}
              disabled={isAtMinZoom}
              title="Zoom In"
              aria-label="Zoom In"
            >
              +
            </button>
            <button
              className="rmap-zoom-btn rmap-zoom-btn--reset"
              onClick={zoomReset}
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              ⊡
            </button>
            <button
              className="rmap-zoom-btn"
              onClick={zoomOut}
              disabled={isAtMaxZoom}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              −
            </button>
          </div>

          <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>

        {/* Feed panel — 30% width */}
        <FeedPanel selectedNode={selectedNode} />
      </div>
    </div>
  );
}
