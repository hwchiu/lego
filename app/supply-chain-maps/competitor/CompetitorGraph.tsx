'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  TSM_COMPETITOR_CENTER,
  TSM_COMPETITORS,
  COMPETITOR_FEED,
  type CompetitorNode,
} from '@/app/data/tsmcCompetitorData';
import { SP500_COMPANIES } from '@/app/data/sp500';

// ── Layout constants ──────────────────────────────────────────────────────────

const SVG_W = 1300;
const SVG_H = 960;
const CX = 650;
const CY = 480;
const R1 = 310; // single ring radius
const CENTER_W = 180,
  CENTER_H = 100;
const NODE_W = 140,
  NODE_H = 80;
const CORNER_R = 12;

// Node strip color — orange for competitors
const NODE_STRIP_COLOR = '#9a3412';

// ID of the center node
const CENTER_NODE_ID = 'TSM';

// ── Static lookups (computed once) ───────────────────────────────────────────

const ALL_COMPETITORS = TSM_COMPETITORS;
const UNIQUE_INDUSTRIES = [...new Set(ALL_COMPETITORS.map((c) => c.industryCategory))];

const ALL_COMPETITORS_LC = ALL_COMPETITORS.map((c) => ({
  ...c,
  nameLc: c.name.toLowerCase(),
  tickerLc: c.ticker.toLowerCase(),
}));
const UNIQUE_INDUSTRIES_LC = UNIQUE_INDUSTRIES.map((s) => ({ val: s, lc: s.toLowerCase() }));
const UNIQUE_PROCESS_LC = [
  ...new Set(ALL_COMPETITORS.flatMap((c) => c.processNodes)),
].map((s) => ({ val: s, lc: s.toLowerCase() }));

const FILTER_TABS = ['Company', 'Industry', 'Process', 'News'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// ── Initial positions ─────────────────────────────────────────────────────────

const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = (() => {
  const pos: Record<string, { x: number; y: number }> = {};
  pos[CENTER_NODE_ID] = { x: CX, y: CY };
  TSM_COMPETITORS.forEach((c, i) => {
    const a = (2 * Math.PI * i) / TSM_COMPETITORS.length - Math.PI / 2;
    pos[c.id] = { x: CX + R1 * Math.cos(a), y: CY + R1 * Math.sin(a) };
  });
  return pos;
})();

// ── Helpers ───────────────────────────────────────────────────────────────────

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

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '\u2026' : s;
}

// ── SVG Node components ───────────────────────────────────────────────────────

interface NodeProps {
  node: CompetitorNode;
  pos: { x: number; y: number };
  selected: boolean;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

function CompetitorNodeSvg({ node, pos, selected, onClick, onMouseDown }: NodeProps) {
  const bx = pos.x - NODE_W / 2,
    by = pos.y - NODE_H / 2;
  return (
    <g className="rmap-node" onClick={onClick} onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
      <rect
        x={bx}
        y={by}
        width={NODE_W}
        height={NODE_H}
        rx={CORNER_R}
        ry={CORNER_R}
        className={`rmap-node-rect rmap-node-rect--competitor${selected ? ' rmap-node-rect--selected' : ''}`}
      />
      <rect
        x={bx + 1}
        y={by + 1}
        width={NODE_W - 2}
        height={5}
        rx={CORNER_R - 1}
        ry={4}
        style={{ fill: NODE_STRIP_COLOR, opacity: selected ? 0 : 0.9, pointerEvents: 'none' }}
      />
      <text x={pos.x} y={by + 21} className="rmap-node-name" textAnchor="middle">
        {trunc(node.name, 18)}
      </text>
      <text x={pos.x} y={by + 33} className="rmap-node-ticker" textAnchor="middle">
        {node.ticker} · {node.country}
      </text>
      <text x={pos.x} y={by + 46} className="rmap-node-rel" textAnchor="middle">
        Mkt Share: {node.marketShare}%
      </text>
      <text x={pos.x} y={by + 59} className="rmap-node-fin-label" textAnchor="middle">
        Rev: {node.financials.revenue}
      </text>
      <text x={pos.x} y={by + 71} className="rmap-node-fin-label" textAnchor="middle">
        GM: {node.financials.grossMargin}
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
        Mkt Share: {node.marketShare}% · MCap: {node.financials.marketCap}
      </text>
      <text x={pos.x} y={by + 84} className="rmap-node-fin-label" textAnchor="middle">
        {trunc(node.relationship, 30)}
      </text>
    </g>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  node: CompetitorNode | null;
  onClose: () => void;
}

function DetailPanel({ node, onClose }: DetailPanelProps) {
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const cardDragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  function handleDragMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    cardDragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y };
    function onMove(ev: MouseEvent) {
      if (!cardDragRef.current) return;
      setPos({
        x: cardDragRef.current.startPosX + ev.clientX - cardDragRef.current.startX,
        y: cardDragRef.current.startPosY + ev.clientY - cardDragRef.current.startY,
      });
    }
    function onUp() {
      cardDragRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  if (!node) return null;
  const isCenter = node.id === CENTER_NODE_ID;
  const badgeColor = isCenter ? '#1a2332' : NODE_STRIP_COLOR;
  return (
    <div className="rmap-node-info-card" style={{ left: pos.x, top: pos.y }}>
      <div className="rmap-node-info-card-header" onMouseDown={handleDragMouseDown}>
        <span className="rmap-node-info-card-title">{node.name}</span>
        <button className="rmap-detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="rmap-node-info-card-body">
        <div className="rmap-detail-badge" style={{ background: badgeColor }}>
          {isCenter ? 'Center Company' : 'Competitor'}
        </div>
        <p className="rmap-detail-ticker">
          {node.ticker} &nbsp;·&nbsp; {node.exchange}
        </p>
        <p className="rmap-detail-country">
          <span className="rmap-detail-label">Industry: </span>
          <button className="rmap-detail-tag-link">{node.industryCategory}</button>
        </p>
        <p className="rmap-detail-country" style={{ marginTop: 4 }}>
          <span className="rmap-detail-label">Country: </span>
          <button className="rmap-detail-tag-link">{node.country}</button>
        </p>
        <p className="rmap-detail-country" style={{ marginTop: 4 }}>
          <span className="rmap-detail-label">Market Share: </span>
          <strong>{node.marketShare}%</strong>
        </p>
        <p className="rmap-detail-items" style={{ marginTop: 8 }}>
          <span className="rmap-detail-label">Competitive Relationship: </span>
          {node.relationship}
        </p>
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
        <div style={{ marginTop: 8 }}>
          <div className="rmap-detail-label" style={{ marginBottom: 4 }}>
            Process Nodes:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {node.processNodes.map((pn) => (
              <button key={pn} className="rmap-detail-tag rmap-detail-tag--clickable">
                {pn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tag filter row (reusable) ─────────────────────────────────────────────────

function TagFilterRow({
  label,
  tags,
  selected,
  onToggle,
  onClearAll,
  singleSelect,
}: {
  label: string;
  tags: string[];
  selected: Set<string>;
  onToggle: (tag: string) => void;
  onClearAll: () => void;
  singleSelect?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    if (showAll) return;
    const el = rowRef.current;
    if (!el) return;
    const check = () => setHasOverflow(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [showAll, tags]);

  return (
    <div className={`rmap-industry-filter-row${showAll ? ' rmap-industry-filter-row--expanded' : ''}`}>
      <span className="rmap-industry-filter-label">{label}</span>
      <div
        className={`rmap-industry-tags-scroll${showAll ? ' rmap-industry-tags-scroll--expanded' : ''}`}
        ref={rowRef}
      >
        <button
          className={`rmap-industry-tag rmap-industry-tag--all${selected.size === 0 ? ' rmap-industry-tag--active' : ''}`}
          onClick={onClearAll}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            className={`rmap-industry-tag${selected.has(tag) ? ' rmap-industry-tag--active' : ''}`}
            onClick={() => {
              if (singleSelect) {
                if (selected.has(tag)) onClearAll();
                else {
                  onClearAll();
                  onToggle(tag);
                }
              } else {
                onToggle(tag);
              }
            }}
          >
            {tag}
          </button>
        ))}
        {showAll && hasOverflow && (
          <button className="rmap-industry-tag rmap-industry-tag--more" onClick={() => setShowAll(false)}>
            less
          </button>
        )}
      </div>
      {!showAll && hasOverflow && (
        <button className="rmap-industry-tag rmap-industry-tag--more" onClick={() => setShowAll(true)}>
          more
        </button>
      )}
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  selectedIndustries: Set<string>;
  onIndustryToggle: (industry: string) => void;
  onClearAllIndustries: () => void;
  selectedProcess: Set<string>;
  onProcessToggle: (p: string) => void;
  onClearAllProcess: () => void;
}

const SUGGESTION_ITEMS = COMPETITOR_FEED.slice(0, 5);

function FilterBar({
  selectedIndustries,
  onIndustryToggle,
  onClearAllIndustries,
  selectedProcess,
  onProcessToggle,
  onClearAllProcess,
}: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('Company');

  const q = query.toLowerCase().trim();
  const showQueryResults = q.length > 0;
  const showSuggestions = focused && q.length === 0;
  const showDropdownPanel = showQueryResults || showSuggestions;

  const competitorMatches = ALL_COMPETITORS_LC.filter(
    (c) => c.nameLc.includes(q) || c.tickerLc.includes(q),
  ).map((c) => ({ label: c.name, sub: c.ticker }));

  const competitorTickers = new Set(competitorMatches.map((c) => c.sub));
  const sp500Matches = SP500_COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
  ).map((c) => ({ label: c.name, sub: c.symbol }));

  const companyResults = [
    ...competitorMatches,
    ...sp500Matches.filter((c) => !competitorTickers.has(c.sub)),
  ].slice(0, 3);

  const industryResults = UNIQUE_INDUSTRIES_LC.filter((ind) => ind.lc.includes(q))
    .map((i) => i.val)
    .slice(0, 3);
  const processResults = UNIQUE_PROCESS_LC.filter((p) => p.lc.includes(q))
    .map((p) => p.val)
    .slice(0, 3);

  return (
    <div className="rmap-filter-bar rmap-filter-bar--above">
      {/* Search row - full width */}
      <div className="rmap-filter-bar-row">
        <div className="rmap-titled-control" style={{ flex: 1 }}>
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
                placeholder="Search company, industry, process node..."
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
                      {activeTab === 'Process' && (
                        <div className="rmap-filter-group">
                          {processResults.length > 0 ? (
                            processResults.map((p) => (
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
      </div>

      {/* Category tags */}
      <TagFilterRow
        label="CATEGORY"
        tags={UNIQUE_INDUSTRIES}
        selected={selectedIndustries}
        onToggle={onIndustryToggle}
        onClearAll={onClearAllIndustries}
      />

      {/* Process Node tags */}
      <TagFilterRow
        label="PROCESS NODE"
        tags={UNIQUE_PROCESS_LC.map((p) => p.val)}
        selected={selectedProcess}
        onToggle={onProcessToggle}
        onClearAll={onClearAllProcess}
      />
    </div>
  );
}

// ── Competitor Table ──────────────────────────────────────────────────────────

function CompetitorTable() {
  const sorted = [...TSM_COMPETITORS].sort((a, b) => b.marketShare - a.marketShare);
  return (
    <div className="rmap-supplier-table-wrap">
      <div className="rmap-supplier-table-section">
        <div className="rmap-supplier-table-title">TSMC Competitors by Market Share</div>
        <table className="rmap-supplier-table">
          <thead>
            <tr>
              <th className="rmap-supplier-th">Rank</th>
              <th className="rmap-supplier-th">Company</th>
              <th className="rmap-supplier-th">Ticker</th>
              <th className="rmap-supplier-th">Country</th>
              <th className="rmap-supplier-th">Category</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Market Share</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Revenue</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Gross Margin</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c, idx) => (
              <tr key={c.id} className="rmap-supplier-tr">
                <td className="rmap-supplier-td" style={{ color: '#6b7280', fontWeight: 600 }}>
                  #{idx + 2}
                </td>
                <td className="rmap-supplier-td rmap-supplier-td--name">{c.name}</td>
                <td className="rmap-supplier-td rmap-supplier-td--ticker">{c.ticker}</td>
                <td className="rmap-supplier-td">{c.country}</td>
                <td className="rmap-supplier-td">{c.industryCategory}</td>
                <td className="rmap-supplier-td rmap-supplier-td--num">{c.marketShare}%</td>
                <td className="rmap-supplier-td rmap-supplier-td--num">{c.financials.revenue}</td>
                <td className="rmap-supplier-td rmap-supplier-td--num">{c.financials.grossMargin}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Feed Panel ────────────────────────────────────────────────────────────────

const NEWS_CATEGORY_COLORS: Record<string, string> = {
  Strategy: '#c2410c',
  Earnings: '#16a34a',
  Geopolitical: '#dc2626',
  Capacity: '#7c3aed',
  'Supply Chain': '#1d4ed8',
  Tariff: '#b45309',
};

interface FeedPanelProps {
  selectedNode: CompetitorNode | null;
}

function FeedPanel({ selectedNode }: FeedPanelProps) {
  const filteredFeed = selectedNode
    ? COMPETITOR_FEED.filter((item) => item.tickers.includes(selectedNode.id))
    : COMPETITOR_FEED;

  return (
    <div className="rmap-feed-panel">
      <div className="rmap-feed-panel-header">
        <span className="rmap-feed-panel-title">Updates</span>
        <span className="rmap-feed-panel-sub">
          {selectedNode ? selectedNode.name : 'Competitor Network News'}
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 3 }}>
                <span
                  className="rmap-news-category-tag"
                  style={{ background: NEWS_CATEGORY_COLORS[item.category] ?? '#374151' }}
                >
                  {item.category}
                </span>
              </div>
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

const MIN_VB_SCALE = 0.4;
const MAX_VB_SCALE = 2.0;
const ZOOM_STEP = 1.25;

interface ViewBoxState {
  x: number;
  y: number;
  w: number;
  h: number;
}
const DEFAULT_VB: ViewBoxState = { x: 0, y: 0, w: SVG_W, h: SVG_H };

interface PanState {
  startClientX: number;
  startClientY: number;
  startVBX: number;
  startVBY: number;
}

interface CompetitorGraphProps {
  tableOnly?: boolean;
}

export default function CompetitorGraph({ tableOnly }: CompetitorGraphProps) {
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
  const [selectedNode, setSelectedNode] = useState<CompetitorNode | null>(null);
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(new Set());
  const [selectedProcess, setSelectedProcess] = useState<Set<string>>(new Set());
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
      if (next.has(industry)) next.delete(industry);
      else next.add(industry);
      return next;
    });
  }, []);

  const clearAllIndustries = useCallback(() => {
    setSelectedIndustries(new Set());
  }, []);

  const toggleProcess = useCallback((process: string) => {
    setSelectedProcess((prev) => {
      const next = new Set(prev);
      if (next.has(process)) next.delete(process);
      else next.add(process);
      return next;
    });
  }, []);

  const clearAllProcess = useCallback(() => {
    setSelectedProcess(new Set());
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

  const handleNodeClick = useCallback((node: CompetitorNode) => {
    if (didDragRef.current) return;
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const visibleNodeIds =
    selectedIndustries.size === 0 && selectedProcess.size === 0
      ? null
      : new Set([
          CENTER_NODE_ID,
          ...ALL_COMPETITORS.filter(
            (c) =>
              (selectedIndustries.size === 0 || selectedIndustries.has(c.industryCategory)) &&
              (selectedProcess.size === 0 || c.processNodes.some((p) => selectedProcess.has(p))),
          ).map((c) => c.id),
        ]);

  if (tableOnly) {
    return <CompetitorTable />;
  }

  const vbStr = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;
  const isAtMinZoom = viewBox.w <= SVG_W * MIN_VB_SCALE + 1;
  const isAtMaxZoom = viewBox.w >= SVG_W * MAX_VB_SCALE - 1;
  const isGrabbing = !!(dragState || panState);

  return (
    <div className="rmap-graph-wrap">
      <FilterBar
        selectedIndustries={selectedIndustries}
        onIndustryToggle={toggleIndustry}
        onClearAllIndustries={clearAllIndustries}
        selectedProcess={selectedProcess}
        onProcessToggle={toggleProcess}
        onClearAllProcess={clearAllProcess}
      />

      <div className="rmap-graph-content">
        <div className="rmap-svg-container">
          <svg
            ref={svgRef}
            viewBox={vbStr}
            className="rmap-svg"
            aria-label="TSMC Competitor Relationship Graph"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={clearDrag}
            onMouseLeave={clearDrag}
            style={{ cursor: isGrabbing ? 'grabbing' : 'grab' }}
          >
            <defs>
              {/* Double-headed arrow: forward */}
              <marker
                id="arr-comp-end"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" className="rmap-arrow-marker" />
              </marker>
              {/* Double-headed arrow: backward */}
              <marker
                id="arr-comp-start"
                markerWidth="8"
                markerHeight="6"
                refX="1"
                refY="3"
                orient="auto-start-reverse"
              >
                <polygon points="0 0, 8 3, 0 6" className="rmap-arrow-marker" />
              </marker>
            </defs>

            {/* Competitor edges — double-headed arrows, no edge labels */}
            {TSM_COMPETITORS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              const cp = positions[CENTER_NODE_ID],
                np = positions[node.id];
              const ep = rectEdgePoint(cp.x, cp.y, CENTER_W, CENTER_H, np.x, np.y);
              const sp = rectEdgePoint(np.x, np.y, NODE_W, NODE_H, cp.x, cp.y);
              return (
                <line
                  key={`ec-${node.id}`}
                  x1={ep.x}
                  y1={ep.y}
                  x2={sp.x}
                  y2={sp.y}
                  className="rmap-edge rmap-edge--competitor"
                  strokeWidth={2}
                  markerEnd="url(#arr-comp-end)"
                  markerStart="url(#arr-comp-start)"
                />
              );
            })}

            {/* Competitor nodes */}
            {TSM_COMPETITORS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              return (
                <CompetitorNodeSvg
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
              node={TSM_COMPETITOR_CENTER}
              pos={positions[CENTER_NODE_ID]}
              selected={selectedNode?.id === CENTER_NODE_ID}
              onClick={() => handleNodeClick(TSM_COMPETITOR_CENTER)}
              onMouseDown={(e) => handleNodeMouseDown(CENTER_NODE_ID, e)}
            />
          </svg>

          {/* Zoom controls */}
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

        {/* Feed panel */}
        <FeedPanel selectedNode={selectedNode} />
      </div>
    </div>
  );
}
