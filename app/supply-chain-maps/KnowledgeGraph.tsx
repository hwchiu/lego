'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TSM_TIER1_SUPPLIERS, TSM_TIER2_SUPPLIERS, TSM_CENTER_NODE } from '@/app/data/tsmcSupplierData';
import { TSM_CUSTOMERS } from '@/app/data/tsmcCustomerData';
import { TSM_COMPETITORS } from '@/app/data/tsmcCompetitorData';
import {
  STRATEGIC_PARTNERS,
  ECOSYSTEM_SUPPLIERS,
  GRAPH_EDGES,
  CUSTOMER_ARTICLES,
  type GraphEdge,
} from '@/app/data/tsmcGraphData';

// ── Types ─────────────────────────────────────────────────────────────────────

type NodeRole = 'center' | 'supplier1' | 'supplier2' | 'customer' | 'competitor' | 'partner';

interface DisplayNode {
  id: string;
  name: string;
  ticker: string;
  country: string;
  industry: string;
  segment: string;
  role: NodeRole;
  description: string;
  color: string;
  financials: { revenue: string; marketCap: string };
  articles: { title: string; source: string; date: string; url: string }[];
}

type Selection =
  | { type: 'node'; data: DisplayNode }
  | { type: 'edge'; data: GraphEdge }
  | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

const ROLE_COLORS: Record<NodeRole, { fill: string; stroke: string; text: string; edge: string }> = {
  center:     { fill: '#1a2332', stroke: '#334155', text: '#ffffff', edge: '#93c5fd' },
  supplier1:  { fill: '#dbeafe', stroke: '#2563eb', text: '#1e3a8a', edge: '#93c5fd' },
  supplier2:  { fill: '#eff6ff', stroke: '#60a5fa', text: '#1e40af', edge: '#bfdbfe' },
  customer:   { fill: '#dcfce7', stroke: '#16a34a', text: '#14532d', edge: '#86efac' },
  competitor: { fill: '#ffedd5', stroke: '#ea580c', text: '#9a3412', edge: '#fdba74' },
  partner:    { fill: '#f3e8ff', stroke: '#9333ea', text: '#581c87', edge: '#d8b4fe' },
};

function roleBadgeColor(role: NodeRole): string {
  return ROLE_COLORS[role]?.stroke ?? '#64748b';
}

// ── Build unified node list ───────────────────────────────────────────────────

function buildAllNodes(): DisplayNode[] {
  const nodes: DisplayNode[] = [];

  // Center
  nodes.push({
    id: TSM_CENTER_NODE.id,
    name: TSM_CENTER_NODE.name,
    ticker: TSM_CENTER_NODE.ticker,
    country: TSM_CENTER_NODE.country,
    industry: TSM_CENTER_NODE.industryCategory,
    segment: TSM_CENTER_NODE.segment,
    role: 'center',
    description: "Taiwan Semiconductor Manufacturing Company — world's largest pure-play foundry with ~62% market share.",
    color: '#1a2332',
    financials: { revenue: TSM_CENTER_NODE.financials.revenue, marketCap: TSM_CENTER_NODE.financials.marketCap },
    articles: [],
  });

  // Tier-1 suppliers
  for (const s of TSM_TIER1_SUPPLIERS) {
    nodes.push({
      id: s.id, name: s.name, ticker: s.ticker, country: s.country,
      industry: s.industryCategory, segment: s.segment,
      role: 'supplier1', description: s.relationship + ': ' + s.supplyItems,
      color: s.color,
      financials: { revenue: s.financials.revenue, marketCap: s.financials.marketCap },
      articles: [],
    });
  }

  // Tier-2 suppliers
  for (const s of TSM_TIER2_SUPPLIERS) {
    nodes.push({
      id: s.id, name: s.name, ticker: s.ticker, country: s.country,
      industry: s.industryCategory, segment: s.segment,
      role: 'supplier2', description: s.relationship + ': ' + s.supplyItems,
      color: s.color,
      financials: { revenue: s.financials.revenue, marketCap: s.financials.marketCap },
      articles: [],
    });
  }

  // Customers
  for (const c of TSM_CUSTOMERS) {
    nodes.push({
      id: c.id, name: c.name, ticker: c.ticker, country: c.country,
      industry: c.industryCategory, segment: c.segment,
      role: 'customer', description: c.relationship + ': ' + c.purchaseItems,
      color: c.color,
      financials: { revenue: c.financials.revenue, marketCap: c.financials.marketCap },
      articles: CUSTOMER_ARTICLES[c.id] ?? [],
    });
  }

  // Competitors
  for (const comp of TSM_COMPETITORS) {
    nodes.push({
      id: comp.id, name: comp.name, ticker: comp.ticker, country: comp.country,
      industry: comp.industryCategory, segment: comp.segment,
      role: 'competitor', description: comp.relationship,
      color: comp.color,
      financials: { revenue: comp.financials.revenue, marketCap: comp.financials.marketCap },
      articles: [],
    });
  }

  // Partners
  for (const p of STRATEGIC_PARTNERS) {
    nodes.push({
      id: p.id, name: p.name, ticker: p.ticker, country: p.country,
      industry: p.industry, segment: p.segment,
      role: 'partner', description: p.description, color: '#9333ea',
      financials: p.financials,
      articles: p.articles,
    });
  }

  // Ecosystem suppliers
  for (const e of ECOSYSTEM_SUPPLIERS) {
    // Avoid duplicates
    if (!nodes.find((n) => n.id === e.id)) {
      nodes.push({
        id: e.id, name: e.name, ticker: e.ticker, country: e.country,
        industry: e.industry, segment: e.segment,
        role: e.role as NodeRole, description: e.description, color: '#64748b',
        financials: e.financials,
        articles: e.articles,
      });
    }
  }

  return nodes;
}

const ALL_NODES = buildAllNodes();

// ── Layout helpers ────────────────────────────────────────────────────────────

interface LayoutNode extends DisplayNode {
  x: number;
  y: number;
  w: number;
  h: number;
}

const NODE_W = 112;
const NODE_H = 44;
const CENTER_W = 160;
const CENTER_H = 64;
const SVG_W = 1600;
const SVG_H = 1000;
const CCX = SVG_W / 2;
const CCY = SVG_H / 2;

function computeLayout(visible: DisplayNode[]): LayoutNode[] {
  const result: LayoutNode[] = [];

  // Center always shown
  const center = visible.find((n) => n.role === 'center');
  if (center) {
    result.push({ ...center, x: CCX, y: CCY, w: CENTER_W, h: CENTER_H });
  }

  const s1 = visible.filter((n) => n.role === 'supplier1');
  const s2 = visible.filter((n) => n.role === 'supplier2');
  const custs = visible.filter((n) => n.role === 'customer');
  const comps = visible.filter((n) => n.role === 'competitor');
  const partners = visible.filter((n) => n.role === 'partner');
  const eco = visible.filter((n) => n.role !== 'center' && n.role !== 'supplier1' && n.role !== 'supplier2' && n.role !== 'customer' && n.role !== 'competitor' && n.role !== 'partner');

  // Tier-1 right column (x=1180)
  const maxS1 = Math.min(s1.length, 12);
  const s1StartY = 110;
  const s1Step = Math.min(72, (SVG_H - s1StartY - 80) / Math.max(maxS1 - 1, 1));
  for (let i = 0; i < maxS1; i++) {
    result.push({ ...s1[i], x: 1180, y: s1StartY + i * s1Step, w: NODE_W, h: NODE_H });
  }

  // Tier-2 far-right (x=1430)
  const maxS2 = Math.min(s2.length, 10);
  const s2StartY = 130;
  const s2Step = Math.min(68, (SVG_H - s2StartY - 80) / Math.max(maxS2 - 1, 1));
  for (let i = 0; i < maxS2; i++) {
    result.push({ ...s2[i], x: 1430, y: s2StartY + i * s2Step, w: 100, h: 34 });
  }

  // Partners top-right (x=1180, after s1 section)
  const partnerStartY = s1StartY + maxS1 * s1Step + 20;
  const maxPartners = Math.min(partners.length, 5);
  const partnerStep = 64;
  for (let i = 0; i < maxPartners; i++) {
    result.push({ ...partners[i], x: 1180, y: partnerStartY + i * partnerStep, w: NODE_W, h: NODE_H });
  }

  // Customers left (x=350)
  const maxCust = Math.min(custs.length, 15);
  const custStartY = 90;
  const custStep = Math.min(58, (SVG_H - custStartY - 60) / Math.max(maxCust - 1, 1));
  for (let i = 0; i < maxCust; i++) {
    result.push({ ...custs[i], x: 350, y: custStartY + i * custStep, w: NODE_W, h: NODE_H });
  }

  // Competitors bottom row (y=940)
  const maxComp = Math.min(comps.length, 10);
  const compStartX = 260;
  const compStep = Math.min(140, (SVG_W - compStartX - 200) / Math.max(maxComp - 1, 1));
  for (let i = 0; i < maxComp; i++) {
    result.push({ ...comps[i], x: compStartX + i * compStep, y: 940, w: NODE_W, h: NODE_H });
  }

  // Eco suppliers (extra, placed below tier-2)
  for (let i = 0; i < Math.min(eco.length, 6); i++) {
    result.push({ ...eco[i], x: 1430, y: 130 + (maxS2 + i) * 60, w: 100, h: 34 });
  }

  return result;
}

// ── SearchIcon ────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<Selection>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/supply-chain-maps/supplier?q=${encodeURIComponent(query.trim())}`);
    }
  }

  // Filter options derived from all nodes
  const allIndustries = useMemo(
    () => ['all', ...Array.from(new Set(ALL_NODES.map((n) => n.industry).filter(Boolean))).sort()],
    [],
  );
  const allSegments = useMemo(
    () => ['all', ...Array.from(new Set(ALL_NODES.map((n) => n.segment).filter(Boolean))).sort()],
    [],
  );
  const allCountries = useMemo(
    () => ['all', ...Array.from(new Set(ALL_NODES.map((n) => n.country).filter(Boolean))).sort()],
    [],
  );

  // Filtered nodes
  const visibleNodes = useMemo(() => {
    return ALL_NODES.filter((n) => {
      if (n.role === 'center') return true; // always show center
      if (filterIndustry !== 'all' && n.industry !== filterIndustry) return false;
      if (filterSegment !== 'all' && n.segment !== filterSegment) return false;
      if (filterCountry !== 'all' && n.country !== filterCountry) return false;
      return true;
    });
  }, [filterIndustry, filterSegment, filterCountry]);

  const layoutNodes = useMemo(() => computeLayout(visibleNodes), [visibleNodes]);
  const nodeById = useMemo(() => {
    const m: Record<string, LayoutNode> = {};
    for (const n of layoutNodes) m[n.id] = n;
    return m;
  }, [layoutNodes]);

  // Visible edges (both endpoints must be visible)
  const visibleEdges = useMemo(() => {
    const ids = new Set(visibleNodes.map((n) => n.id));
    return GRAPH_EDGES.filter((e) => ids.has(e.from) && ids.has(e.to));
  }, [visibleNodes]);

  const selectedNodeId = selected?.type === 'node' ? selected.data.id : null;

  function handleNodeClick(n: LayoutNode) {
    setSelected((prev) =>
      prev?.type === 'node' && prev.data.id === n.id ? null : { type: 'node', data: n },
    );
  }

  function handleEdgeClick(e: GraphEdge) {
    setSelected((prev) =>
      prev?.type === 'edge' && prev.data.from === e.from && prev.data.to === e.to
        ? null
        : { type: 'edge', data: e },
    );
  }

  function resetFilters() {
    setFilterIndustry('all');
    setFilterSegment('all');
    setFilterCountry('all');
    setSelected(null);
  }

  return (
    <div className="kg-wrapper">
      {/* Hero + search */}
      <div className="kg-hero">
        <h1 className="kg-hero-title">RMAP — Relational Map</h1>
        <p className="kg-hero-subtitle">
          Search any company to explore its supply chain relationships — suppliers, customers, and competitors.
        </p>
        <form className="kg-search-wrap" onSubmit={handleSearch}>
          <div className="kg-search-box">
            <span className="kg-search-icon"><SearchIcon /></span>
            <input
              className="kg-search-input"
              type="text"
              placeholder="Search a company or ticker to explore its ecosystem…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="kg-search-btn" type="submit">Search</button>
          </div>
        </form>
      </div>

      {/* Filter bar */}
      <div className="kg-filter-bar">
        <span className="kg-filter-label">Filter:</span>

        <select
          className="kg-filter-select"
          value={filterIndustry}
          onChange={(e) => setFilterIndustry(e.target.value)}
          aria-label="Filter by Industry"
        >
          {allIndustries.map((v) => (
            <option key={v} value={v}>{v === 'all' ? 'All Industries' : v}</option>
          ))}
        </select>

        <select
          className="kg-filter-select"
          value={filterSegment}
          onChange={(e) => setFilterSegment(e.target.value)}
          aria-label="Filter by Segment"
        >
          {allSegments.map((v) => (
            <option key={v} value={v}>{v === 'all' ? 'All Segments' : v}</option>
          ))}
        </select>

        <select
          className="kg-filter-select"
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          aria-label="Filter by Country"
        >
          {allCountries.map((v) => (
            <option key={v} value={v}>{v === 'all' ? 'All Countries' : v}</option>
          ))}
        </select>

        <button className="kg-filter-reset" onClick={resetFilters}>Reset</button>
        <span className="kg-filter-count">{visibleNodes.length} nodes</span>
      </div>

      {/* Zoom controls */}
      <div className="kg-zoom-controls">
        <button className="kg-zoom-btn" onClick={() => setZoom((z) => Math.min(z + 0.15, 3))} aria-label="Zoom in">+</button>
        <button className="kg-zoom-btn" onClick={() => setZoom((z) => Math.max(z - 0.15, 0.3))} aria-label="Zoom out">−</button>
        <button className="kg-zoom-btn" onClick={() => setZoom(1)} aria-label="Reset zoom" style={{ fontSize: 10, width: 42 }}>Reset</button>
        <span className="kg-zoom-label">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Legend */}
      <div className="kg-legend">
        {(['supplier1', 'supplier2', 'customer', 'competitor', 'partner'] as NodeRole[]).map((role) => (
          <div key={role} className="kg-legend-item">
            <span className="kg-legend-dot" style={{ background: ROLE_COLORS[role].fill, border: `2px solid ${ROLE_COLORS[role].stroke}` }} />
            {role === 'supplier1' ? 'Tier-1 Supplier' : role === 'supplier2' ? 'Tier-2 Supplier' : role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
        ))}
        <span className="kg-legend-hint">Click a node for details</span>
      </div>

      {/* Graph container */}
      <div className="kg-graph-container">
        <div className="kg-graph-scroll" style={{ overflow: 'auto' }}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="kg-svg"
            style={{ width: SVG_W * zoom, height: SVG_H * zoom, display: 'block' }}
          >
            <defs>
              <filter id="node-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {visibleEdges.map((edge, i) => {
              const src = nodeById[edge.from];
              const tgt = nodeById[edge.to];
              if (!src || !tgt) return null;
              const isSelEdge = selected?.type === 'edge' && selected.data.from === edge.from && selected.data.to === edge.to;
              const isConnected = selectedNodeId === edge.from || selectedNodeId === edge.to;
              const opacity = selected && !isSelEdge && !isConnected ? 0.18 : 0.55;
              const strokeW = isSelEdge ? 3 : edge.weight * 0.6 + 0.5;
              const srcRole = src.role as NodeRole;
              const edgeColor = ROLE_COLORS[srcRole]?.edge ?? '#94a3b8';
              const mx = (src.x + tgt.x) / 2;
              const my = (src.y + tgt.y) / 2;
              const label = truncate(edge.label, 22);
              return (
                <g key={`e-${i}`} onClick={() => handleEdgeClick(edge)} style={{ cursor: 'pointer' }}>
                  <line
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={isSelEdge ? '#f59e0b' : edgeColor}
                    strokeWidth={isSelEdge ? strokeW + 1 : strokeW}
                    opacity={opacity}
                  />
                  <text
                    x={mx} y={my - 4}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize={7.5}
                    opacity={0.7}
                    style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {layoutNodes.map((n) => {
              const isCenter = n.role === 'center';
              const c = ROLE_COLORS[n.role];
              const isSelected = selectedNodeId === n.id;
              const isConnected = selected?.type === 'edge' && (selected.data.from === n.id || selected.data.to === n.id);
              const dimmed = selected && !isSelected && !isConnected;
              const rx = n.x - n.w / 2;
              const ry = n.y - n.h / 2;
              return (
                <g
                  key={n.id}
                  onClick={() => handleNodeClick(n)}
                  style={{ cursor: 'pointer', opacity: dimmed ? 0.25 : 1 }}
                >
                  <title>{n.name} ({n.ticker}) — {n.country} | {n.industry} | {n.segment}</title>
                  <rect
                    x={rx} y={ry} width={n.w} height={n.h} rx={4}
                    fill={isCenter ? '#1a2332' : c.fill}
                    stroke={isSelected ? '#f59e0b' : c.stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    filter={isSelected ? 'url(#node-glow)' : undefined}
                  />
                  <text
                    x={n.x} y={isCenter ? n.y - 10 : n.y - 8}
                    textAnchor="middle" dominantBaseline="middle"
                    fill={isCenter ? '#ffffff' : c.text}
                    fontSize={isCenter ? 15 : 10}
                    fontWeight="700"
                    style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
                  >
                    {n.ticker}
                  </text>
                  {!isCenter && (
                    <>
                      <text
                        x={n.x} y={n.y + 2}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={c.text} fontSize={7.5} opacity={0.7}
                        style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
                      >
                        {truncate(n.name, 16)}
                      </text>
                      <text
                        x={n.x} y={n.y + 13}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={c.text} fontSize={6.5} opacity={0.55}
                        style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
                      >
                        {n.country} · {truncate(n.segment, 12)}
                      </text>
                    </>
                  )}
                  {isCenter && (
                    <text
                      x={n.x} y={n.y + 12}
                      textAnchor="middle" dominantBaseline="middle"
                      fill="#94a3b8" fontSize={8.5}
                      style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
                    >
                      TSMC
                    </text>
                  )}
                </g>
              );
            })}

            {/* Section labels */}
            <text x={1180} y={80} textAnchor="middle" fill="#64748b" fontSize={9.5}
              fontWeight="700" letterSpacing="0.08em"
              style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
              SUPPLIERS
            </text>
            <text x={1430} y={80} textAnchor="middle" fill="#94a3b8" fontSize={8.5}
              fontWeight="700" letterSpacing="0.08em"
              style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
              TIER-2
            </text>
            <text x={350} y={60} textAnchor="middle" fill="#64748b" fontSize={9.5}
              fontWeight="700" letterSpacing="0.08em"
              style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
              CUSTOMERS
            </text>
            <text x={CCX} y={60} textAnchor="middle" fill="#64748b" fontSize={9.5}
              fontWeight="700" letterSpacing="0.08em"
              style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
              COMPETITORS (bottom)
            </text>
          </svg>
        </div>
      </div>

      {/* Info panel */}
      {selected && (
        <div className="kg-info-panel">
          <button className="kg-info-panel-close" onClick={() => setSelected(null)} aria-label="Close panel">×</button>

          {selected.type === 'node' && (() => {
            const n = selected.data;
            return (
              <>
                <span className="kg-info-panel-role" style={{ background: roleBadgeColor(n.role) }}>
                  {n.role === 'supplier1' ? 'Tier-1 Supplier' : n.role === 'supplier2' ? 'Tier-2 Supplier' : n.role.charAt(0).toUpperCase() + n.role.slice(1)}
                </span>
                <h2 className="kg-info-panel-name">{n.name}</h2>
                <div className="kg-info-panel-ticker">{n.ticker}</div>
                <div className="kg-info-panel-tags">
                  <span className="kg-info-panel-tag">{n.country}</span>
                  <span className="kg-info-panel-tag">{n.industry}</span>
                  <span className="kg-info-panel-tag">{n.segment}</span>
                </div>
                {n.description && <p className="kg-info-panel-desc">{n.description}</p>}
                <div className="kg-info-panel-fin">
                  <div className="kg-info-panel-fin-item">
                    <span className="kg-info-panel-fin-label">Revenue</span>
                    <span className="kg-info-panel-fin-value">{n.financials.revenue}</span>
                  </div>
                  <div className="kg-info-panel-fin-item">
                    <span className="kg-info-panel-fin-label">Market Cap</span>
                    <span className="kg-info-panel-fin-value">{n.financials.marketCap}</span>
                  </div>
                </div>
                {n.articles.length > 0 && (
                  <>
                    <div className="kg-info-panel-articles-title">Related News</div>
                    <div className="kg-info-panel-articles">
                      {n.articles.map((a, i) => (
                        <a key={i} href={a.url} className="kg-info-panel-article" target="_blank" rel="noopener noreferrer">
                          <span className="kg-info-panel-article-title">{a.title}</span>
                          <span className="kg-info-panel-article-meta">{a.source} · {a.date}</span>
                        </a>
                      ))}
                    </div>
                  </>
                )}
                {(n.role === 'supplier1' || n.role === 'supplier2') && (
                  <Link href="/my-rmap/supplier" className="kg-detail-link" style={{ marginTop: 14, display: 'inline-block' }}>View Supplier Network →</Link>
                )}
                {n.role === 'customer' && (
                  <Link href="/my-rmap/customer" className="kg-detail-link" style={{ marginTop: 14, display: 'inline-block' }}>View Customer Network →</Link>
                )}
                {n.role === 'competitor' && (
                  <Link href="/my-rmap/competitor" className="kg-detail-link" style={{ marginTop: 14, display: 'inline-block' }}>View Competitor Network →</Link>
                )}
              </>
            );
          })()}

          {selected.type === 'edge' && (
            <>
              <div className="kg-info-edge-from-to">{selected.data.from} → {selected.data.to}</div>
              <div className="kg-info-edge-label">{selected.data.label}</div>
              <p className="kg-info-edge-desc">{selected.data.description}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
