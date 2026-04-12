'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '@/app/contexts/ThemeContext';
import {
  TC_CUSTOMER_CENTER,
  TC_CUSTOMERS,
  CUSTOMER_EDGES,
  CUSTOMER_FEED,
  CUSTOMER_RELATION_TYPES,
  INDUSTRY_TRANSACTION_SUMMARY,
  type CustomerNode,
  type CustomerRelationKey,
} from '@/app/data/tcCustomerData';
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

// Node strip color
const NODE_STRIP_COLOR = '#166534'; // green — customer direction

// ID of the center node
const CENTER_NODE_ID = 'TC';

// ── Static lookups (computed once) ───────────────────────────────────────────

const ALL_CUSTOMERS = TC_CUSTOMERS;
const UNIQUE_INDUSTRIES = [...new Set(ALL_CUSTOMERS.map((c) => c.industryCategory))];

const ALL_CUSTOMERS_LC = ALL_CUSTOMERS.map((c) => ({
  ...c,
  nameLc: c.name.toLowerCase(),
  tickerLc: c.ticker.toLowerCase(),
}));
const UNIQUE_INDUSTRIES_LC = UNIQUE_INDUSTRIES.map((s) => ({ val: s, lc: s.toLowerCase() }));
const UNIQUE_PRODUCTS_LC = [
  ...new Set(ALL_CUSTOMERS.flatMap((c) => c.productCategories)),
].map((s) => ({ val: s, lc: s.toLowerCase() }));

const RELATION_LABEL_MAP = new Map(CUSTOMER_RELATION_TYPES.map((r) => [r.key, r.label]));

const EDGE_RANGE_MAP = new Map<CustomerRelationKey, { min: number; max: number }>(
  CUSTOMER_RELATION_TYPES.filter((r) => r.key !== 'transactionAmount').map((r) => {
    const vals = CUSTOMER_EDGES.map((e) => e[r.key] as number);
    return [r.key, { min: Math.min(...vals), max: Math.max(...vals) }] as [
      CustomerRelationKey,
      { min: number; max: number },
    ];
  }),
);

const FILTER_TABS = ['Company', 'Industry', 'Product', 'News'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// ── Initial positions ─────────────────────────────────────────────────────────

const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = (() => {
  const pos: Record<string, { x: number; y: number }> = {};
  pos[CENTER_NODE_ID] = { x: CX, y: CY };
  TC_CUSTOMERS.forEach((c, i) => {
    const a = (2 * Math.PI * i) / TC_CUSTOMERS.length - Math.PI / 2;
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

function getEdgeWidth(key: CustomerRelationKey, value: number): number {
  if (key === 'transactionAmount') return 1.0 + (Math.min(value, 20000) / 20000) * 4.0;
  const range = EDGE_RANGE_MAP.get(key);
  if (!range || range.max === range.min) return 2.5;
  return 1.0 + ((value - range.min) / (range.max - range.min)) * 4.0;
}

function trunc(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '\u2026' : s;
}

function formatAmount(millionUsd: number): string {
  if (millionUsd >= 1000) return `$${(millionUsd / 1000).toFixed(1)}B`;
  return `$${millionUsd}M`;
}

// ── SVG Node components ───────────────────────────────────────────────────────

interface NodeProps {
  node: CustomerNode;
  pos: { x: number; y: number };
  selected: boolean;
  onClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
}

function CustomerNodeSvg({ node, pos, selected, onClick, onMouseDown }: NodeProps) {
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
        className={`rmap-node-rect rmap-node-rect--customer${selected ? ' rmap-node-rect--selected' : ''}`}
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
        {trunc(node.industryCategory, 22)}
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
  node: CustomerNode | null;
  onClose: () => void;
}

function DetailPanel({ node, onClose }: DetailPanelProps) {
  const [pos, setPos] = useState({ x: 16, y: 16 });
  const { theme } = useTheme();
  const cardDragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

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
      cleanupRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    }
    cleanupRef.current = onUp;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }

  if (!node) return null;
  const isCenter = node.id === CENTER_NODE_ID;
  const badgeColor = isCenter ? (theme === 'dark' ? '#1e293b' : '#1a2332') : NODE_STRIP_COLOR;
  const edge = CUSTOMER_EDGES.find((e) => e.from === CENTER_NODE_ID && e.to === node.id);
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
          {isCenter ? 'Center Company' : 'Customer'}
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
        {!isCenter && (
          <p className="rmap-detail-items" style={{ marginTop: 8 }}>
            <span className="rmap-detail-label">Purchases from T Company: </span>
            {node.purchaseItems}
          </p>
        )}
        {edge && (
          <p className="rmap-detail-items" style={{ marginTop: 8 }}>
            <span className="rmap-detail-label">Annual Transaction: </span>
            {formatAmount(edge.transactionAmount)}
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
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {node.productCategories.map((cat) => (
            <button key={cat} className="rmap-detail-tag rmap-detail-tag--clickable">
              {cat}
            </button>
          ))}
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
  relationType: CustomerRelationKey;
  onRelationChange: (key: CustomerRelationKey) => void;
  selectedIndustries: Set<string>;
  onIndustryToggle: (industry: string) => void;
  onClearAllIndustries: () => void;
  selectedProducts: Set<string>;
  onProductToggle: (p: string) => void;
  onClearAllProducts: () => void;
}

const SUGGESTION_ITEMS = CUSTOMER_FEED.slice(0, 5);

function FilterBar({
  relationType,
  onRelationChange,
  selectedIndustries,
  onIndustryToggle,
  onClearAllIndustries,
  selectedProducts,
  onProductToggle,
  onClearAllProducts,
}: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('Company');
  const [relOpen, setRelOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const relRef = useRef<HTMLDivElement>(null);
  const industryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (relRef.current && !relRef.current.contains(e.target as Node)) setRelOpen(false);
      if (industryRef.current && !industryRef.current.contains(e.target as Node))
        setIndustryOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const q = query.toLowerCase().trim();
  const showQueryResults = q.length > 0;
  const showSuggestions = focused && q.length === 0;
  const showDropdownPanel = showQueryResults || showSuggestions;

  const customerMatches = ALL_CUSTOMERS_LC.filter(
    (c) => c.nameLc.includes(q) || c.tickerLc.includes(q),
  ).map((c) => ({ label: c.name, sub: c.ticker }));

  const customerTickers = new Set(customerMatches.map((c) => c.sub));
  const sp500Matches = SP500_COMPANIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q),
  ).map((c) => ({ label: c.name, sub: c.symbol }));

  const companyResults = [
    ...customerMatches,
    ...sp500Matches.filter((c) => !customerTickers.has(c.sub)),
  ].slice(0, 3);

  const industryResults = UNIQUE_INDUSTRIES_LC.filter((ind) => ind.lc.includes(q))
    .map((i) => i.val)
    .slice(0, 3);
  const productResults = UNIQUE_PRODUCTS_LC.filter((p) => p.lc.includes(q))
    .map((p) => p.val)
    .slice(0, 3);

  const selectedIndustry =
    selectedIndustries.size === 1 ? [...selectedIndustries][0] : null;

  return (
    <div className="rmap-filter-bar rmap-filter-bar--above">
      {/* Search + dropdown controls row */}
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

        {/* Relation Type dropdown */}
        <div className="rmap-titled-control">
          <div className="rmap-titled-control-label">RELATION TYPE</div>
          <div className="rmap-rel-wrap" ref={relRef}>
            <button
              className="rmap-rel-btn"
              onClick={() => {
                setRelOpen((o) => !o);
                setIndustryOpen(false);
              }}
            >
              {RELATION_LABEL_MAP.get(relationType) ?? 'Select'}
              <span className="rmap-dropdown-arrow">▾</span>
            </button>
            {relOpen && (
              <div className="rmap-rel-dropdown">
                {CUSTOMER_RELATION_TYPES.map((rt) => (
                  <button
                    key={rt.key}
                    className={`rmap-rel-option${relationType === rt.key ? ' rmap-rel-option--active' : ''}`}
                    onClick={() => {
                      onRelationChange(rt.key);
                      setRelOpen(false);
                    }}
                  >
                    <span className="rmap-checkmark">{relationType === rt.key ? '✓' : ''}</span>
                    {rt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Industry dropdown */}
        <div className="rmap-titled-control">
          <div className="rmap-titled-control-label">INDUSTRY</div>
          <div className="rmap-rel-wrap" ref={industryRef}>
            <button
              className="rmap-rel-btn"
              onClick={() => {
                setIndustryOpen((o) => !o);
                setRelOpen(false);
              }}
            >
              {selectedIndustry ?? 'All Industries'}
              <span className="rmap-dropdown-arrow">▾</span>
            </button>
            {industryOpen && (
              <div className="rmap-rel-dropdown">
                <button
                  className={`rmap-rel-option${!selectedIndustry ? ' rmap-rel-option--active' : ''}`}
                  onClick={() => {
                    onClearAllIndustries();
                    setIndustryOpen(false);
                  }}
                >
                  <span className="rmap-checkmark">{!selectedIndustry ? '✓' : ''}</span>
                  All Industries
                </button>
                {UNIQUE_INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    className={`rmap-rel-option${selectedIndustry === ind ? ' rmap-rel-option--active' : ''}`}
                    onClick={() => {
                      onClearAllIndustries();
                      if (selectedIndustry !== ind) onIndustryToggle(ind);
                      setIndustryOpen(false);
                    }}
                  >
                    <span className="rmap-checkmark">{selectedIndustry === ind ? '✓' : ''}</span>
                    {ind}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Category tags */}
      <TagFilterRow
        label="PRODUCT CATEGORY"
        tags={UNIQUE_PRODUCTS_LC.map((p) => p.val)}
        selected={selectedProducts}
        onToggle={onProductToggle}
        onClearAll={onClearAllProducts}
      />
    </div>
  );
}

// ── Customer Table ────────────────────────────────────────────────────────────

function CustomerTable() {
  return (
    <div className="rmap-supplier-table-wrap">
      <div className="rmap-supplier-table-section">
        <div className="rmap-supplier-table-title">T Company Customers</div>
        <table className="rmap-supplier-table">
          <thead>
            <tr>
              <th className="rmap-supplier-th">Company</th>
              <th className="rmap-supplier-th">Ticker</th>
              <th className="rmap-supplier-th">Country</th>
              <th className="rmap-supplier-th">Industry</th>
              <th className="rmap-supplier-th">Purchases from T Company</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Revenue</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Gross Margin</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Transaction (Annual)</th>
            </tr>
          </thead>
          <tbody>
            {TC_CUSTOMERS.map((c) => {
              const edge = CUSTOMER_EDGES.find((e) => e.to === c.id);
              return (
                <tr key={c.id} className="rmap-supplier-tr">
                  <td className="rmap-supplier-td rmap-supplier-td--name">{c.name}</td>
                  <td className="rmap-supplier-td rmap-supplier-td--ticker">{c.ticker}</td>
                  <td className="rmap-supplier-td">{c.country}</td>
                  <td className="rmap-supplier-td">{c.industryCategory}</td>
                  <td className="rmap-supplier-td">{c.purchaseItems}</td>
                  <td className="rmap-supplier-td rmap-supplier-td--num">{c.financials.revenue}</td>
                  <td className="rmap-supplier-td rmap-supplier-td--num">{c.financials.grossMargin}</td>
                  <td className="rmap-supplier-td rmap-supplier-td--num">
                    {edge ? formatAmount(edge.transactionAmount) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Industry summary table */}
      <div className="rmap-supplier-table-section">
        <div className="rmap-supplier-table-title">Revenue by Industry Category</div>
        <table className="rmap-supplier-table">
          <thead>
            <tr>
              <th className="rmap-supplier-th">Industry Category</th>
              <th className="rmap-supplier-th">Customer Companies</th>
              <th className="rmap-supplier-th rmap-supplier-th--num">Total Annual Revenue</th>
            </tr>
          </thead>
          <tbody>
            {INDUSTRY_TRANSACTION_SUMMARY.map((row) => (
              <tr key={row.industry} className="rmap-supplier-tr">
                <td className="rmap-supplier-td rmap-supplier-td--name">{row.industry}</td>
                <td className="rmap-supplier-td">{row.customers.join(', ')}</td>
                <td className="rmap-supplier-td rmap-supplier-td--num">
                  {formatAmount(row.totalAmount)}
                </td>
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
  'Supply Chain': '#1d4ed8',
  'Earnings': '#16a34a',
  'Geopolitical': '#dc2626',
  'Capacity': '#7c3aed',
  'Strategy': '#c2410c',
  'Tariff': '#b45309',
};

interface FeedPanelProps {
  selectedNode: CustomerNode | null;
}

function FeedPanel({ selectedNode }: FeedPanelProps) {
  const filteredFeed = selectedNode
    ? CUSTOMER_FEED.filter((item) => item.tickers.includes(selectedNode.ticker))
    : CUSTOMER_FEED;

  return (
    <div className="rmap-feed-panel">
      <div className="rmap-feed-panel-header">
        <span className="rmap-feed-panel-title">Updates</span>
        <span className="rmap-feed-panel-sub">
          {selectedNode ? selectedNode.name : 'Customer Network News'}
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

interface CustomerGraphProps {
  tableOnly?: boolean;
}

export default function CustomerGraph({ tableOnly }: CustomerGraphProps) {
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
  const [selectedNode, setSelectedNode] = useState<CustomerNode | null>(null);
  const [relationType, setRelationType] = useState<CustomerRelationKey>('transactionAmount');
  const [selectedIndustries, setSelectedIndustries] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
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

  const toggleProduct = useCallback((product: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(product)) next.delete(product);
      else next.add(product);
      return next;
    });
  }, []);

  const clearAllProducts = useCallback(() => {
    setSelectedProducts(new Set());
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

  const handleNodeClick = useCallback((node: CustomerNode) => {
    if (didDragRef.current) return;
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const visibleNodeIds =
    selectedIndustries.size === 0 && selectedProducts.size === 0
      ? null
      : new Set([
          CENTER_NODE_ID,
          ...ALL_CUSTOMERS.filter(
            (c) =>
              (selectedIndustries.size === 0 || selectedIndustries.has(c.industryCategory)) &&
              (selectedProducts.size === 0 ||
                c.productCategories.some((p) => selectedProducts.has(p))),
          ).map((c) => c.id),
        ]);

  if (tableOnly) {
    return <CustomerTable />;
  }

  const vbStr = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;
  const isAtMinZoom = viewBox.w <= SVG_W * MIN_VB_SCALE + 1;
  const isAtMaxZoom = viewBox.w >= SVG_W * MAX_VB_SCALE - 1;
  const isGrabbing = !!(dragState || panState);

  return (
    <div className="rmap-graph-wrap">
      <FilterBar
        relationType={relationType}
        onRelationChange={setRelationType}
        selectedIndustries={selectedIndustries}
        onIndustryToggle={toggleIndustry}
        onClearAllIndustries={clearAllIndustries}
        selectedProducts={selectedProducts}
        onProductToggle={toggleProduct}
        onClearAllProducts={clearAllProducts}
      />

      <div className="rmap-graph-content">
        <div className="rmap-svg-container">
          <svg
            ref={svgRef}
            viewBox={vbStr}
            className="rmap-svg"
            aria-label="T Company Customer Relationship Graph"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={clearDrag}
            onMouseLeave={clearDrag}
            style={{ cursor: isGrabbing ? 'grabbing' : 'grab' }}
          >
            <defs>
              {/* Arrow points FROM TC (center) TO customer (outer) — supplier→customer direction */}
              <marker id="arr-cust" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" className="rmap-arrow-marker" />
              </marker>
            </defs>

            {/* Center → Customer edges (supplier → customer direction) */}
            {TC_CUSTOMERS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              const cp = positions[CENTER_NODE_ID],
                np = positions[node.id];
              const ep = rectEdgePoint(cp.x, cp.y, CENTER_W, CENTER_H, np.x, np.y);
              const sp = rectEdgePoint(np.x, np.y, NODE_W, NODE_H, cp.x, cp.y);
              const edge = CUSTOMER_EDGES.find((e) => e.from === CENTER_NODE_ID && e.to === node.id);
              const val = edge ? (edge[relationType] as number) : 0;
              const mx = (ep.x + sp.x) / 2,
                my = (ep.y + sp.y) / 2;
              return (
                <g key={`ec-${node.id}`}>
                  <line
                    x1={ep.x}
                    y1={ep.y}
                    x2={sp.x}
                    y2={sp.y}
                    className="rmap-edge rmap-edge--customer"
                    style={{ strokeWidth: getEdgeWidth(relationType, val) }}
                    markerEnd="url(#arr-cust)"
                  />
                  {val > 0 && (
                    <text x={mx} y={my - 4} className="rmap-edge-label" textAnchor="middle">
                      {relationType === 'transactionAmount'
                        ? formatAmount(val)
                        : val.toLocaleString()}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Customer nodes */}
            {TC_CUSTOMERS.map((node) => {
              if (visibleNodeIds && !visibleNodeIds.has(node.id)) return null;
              return (
                <CustomerNodeSvg
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
              node={TC_CUSTOMER_CENTER}
              pos={positions[CENTER_NODE_ID]}
              selected={selectedNode?.id === CENTER_NODE_ID}
              onClick={() => handleNodeClick(TC_CUSTOMER_CENTER)}
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
