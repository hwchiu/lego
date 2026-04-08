'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TC_TIER1_SUPPLIERS, TC_TIER2_SUPPLIERS, TC_CENTER_NODE } from '@/app/data/tcSupplierData';
import { TC_CUSTOMERS } from '@/app/data/tcCustomerData';
import { TC_COMPETITORS } from '@/app/data/tcCompetitorData';
import {
  STRATEGIC_PARTNERS,
  ECOSYSTEM_SUPPLIERS,
  GRAPH_EDGES,
  CUSTOMER_ARTICLES,
  type GraphEdge,
} from '@/app/data/tcGraphData';
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
    id: TC_CENTER_NODE.id,
    name: TC_CENTER_NODE.name,
    ticker: TC_CENTER_NODE.ticker,
    country: TC_CENTER_NODE.country,
    industry: TC_CENTER_NODE.industryCategory,
    segment: TC_CENTER_NODE.segment,
    role: 'center',
    description: "T Company — world's largest pure-play foundry with ~62% market share.",
    color: '#1a2332',
    financials: { revenue: TC_CENTER_NODE.financials.revenue, marketCap: TC_CENTER_NODE.financials.marketCap },
    articles: [],
  });

  // Tier-1 suppliers
  for (const s of TC_TIER1_SUPPLIERS) {
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
  for (const s of TC_TIER2_SUPPLIERS) {
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
  for (const c of TC_CUSTOMERS) {
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
  for (const comp of TC_COMPETITORS) {
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

// ── Aggregated feed items from all nodes ─────────────────────────────────────

interface KgFeedItem {
  id: string;
  title: string;
  ticker: string;
  nodeId: string;
  source: string;
  date: string;
  url: string;
}

const ALL_FEED_ITEMS: KgFeedItem[] = ALL_NODES.flatMap((n) =>
  n.articles.map((a, i) => ({
    id: `${n.id}-${i}`,
    title: a.title,
    ticker: n.ticker,
    nodeId: n.id,
    source: a.source,
    date: a.date,
    url: a.url,
  })),
);

// ── Draggable node info card ──────────────────────────────────────────────────

interface KgNodeInfoCardProps {
  node: DisplayNode | null;
  onClose: () => void;
}

function KgNodeInfoCard({ node, onClose }: KgNodeInfoCardProps) {
  const [pos, setPos] = useState({ x: 16, y: 16 });
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

  // Reset position when a new node is selected
  useEffect(() => {
    if (node) setPos({ x: 16, y: 16 });
  }, [node?.id]);

  function handleDragMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    cardDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
    };
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

  const badgeColor = roleBadgeColor(node.role);
  const roleLabel =
    node.role === 'supplier1'
      ? 'Tier-1 Supplier'
      : node.role === 'supplier2'
        ? 'Tier-2 Supplier'
        : node.role.charAt(0).toUpperCase() + node.role.slice(1);

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
          {roleLabel}
        </div>
        <p className="rmap-detail-ticker">
          {node.ticker} &nbsp;·&nbsp; {node.country}
        </p>
        <p className="rmap-detail-country">
          <span className="rmap-detail-label">Industry: </span>
          <button className="rmap-detail-tag-link">{node.industry}</button>
        </p>
        {node.segment && (
          <p className="rmap-detail-country" style={{ marginTop: 4 }}>
            <span className="rmap-detail-label">Segment: </span>
            <button className="rmap-detail-tag-link">{node.segment}</button>
          </p>
        )}
        {node.description && (
          <p className="rmap-detail-items" style={{ marginTop: 8 }}>
            {node.description}
          </p>
        )}
        <div className="rmap-detail-fins">
          <div className="rmap-detail-fin">
            <span className="rmap-detail-fin-label">Revenue</span>
            <span className="rmap-detail-fin-val">{node.financials.revenue}</span>
          </div>
          <div className="rmap-detail-fin">
            <span className="rmap-detail-fin-label">Market Cap</span>
            <span className="rmap-detail-fin-val">{node.financials.marketCap}</span>
          </div>
        </div>
        {node.role === 'supplier1' || node.role === 'supplier2' ? (
          <Link href="/my-rmap/supplier" className="kg-detail-link" style={{ marginTop: 10, display: 'inline-block' }}>
            View Supplier Network →
          </Link>
        ) : node.role === 'customer' ? (
          <Link href="/my-rmap/customer" className="kg-detail-link" style={{ marginTop: 10, display: 'inline-block' }}>
            View Customer Network →
          </Link>
        ) : node.role === 'competitor' ? (
          <Link href="/my-rmap/competitor" className="kg-detail-link" style={{ marginTop: 10, display: 'inline-block' }}>
            View Competitor Network →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

// ── Feed panel (right side of graph) ─────────────────────────────────────────

interface KgFeedPanelProps {
  selectedNode: DisplayNode | null;
}

function KgFeedPanel({ selectedNode }: KgFeedPanelProps) {
  const filteredFeed = selectedNode
    ? ALL_FEED_ITEMS.filter((item) => item.nodeId === selectedNode.id)
    : ALL_FEED_ITEMS;

  return (
    <div className="rmap-feed-panel">
      <div className="rmap-feed-panel-header">
        <span className="rmap-feed-panel-title">Updates</span>
        <span className="rmap-feed-panel-sub">
          {selectedNode ? selectedNode.name : 'Ecosystem News'}
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
              <div className="rmap-feed-panel-item-title">
                <a href={item.url} className="rmap-feed-panel-item-title" target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              </div>
              <div className="rmap-feed-panel-item-meta">
                <a href="#" className="rmap-feed-panel-ticker">
                  {item.ticker}
                </a>
                <span className="rmap-feed-panel-dot"> · </span>
                <span className="rmap-feed-panel-source">{item.source}</span>
                <span className="rmap-feed-panel-dot"> · </span>
                <span className="rmap-feed-panel-time">{item.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

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

// ── Zoom / pan constants ──────────────────────────────────────────────────────

const MIN_VB_SCALE = 0.4; // smaller viewBox → zoomed in (2.5× magnification)
const MAX_VB_SCALE = 2.0; // larger viewBox → zoomed out (0.5× magnification)
const ZOOM_STEP = 1.25;

interface ViewBoxState { x: number; y: number; w: number; h: number }
const DEFAULT_VB: ViewBoxState = { x: 0, y: 0, w: SVG_W, h: SVG_H };

interface PanState {
  startClientX: number;
  startClientY: number;
  startVBX: number;
  startVBY: number;
}

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

// ── FilterRow ─────────────────────────────────────────────────────────────────

const TAG_SHOW_LIMIT = 5;

interface FilterRowProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

function FilterRow({ label, options, selected, onChange, expanded, onToggleExpand }: FilterRowProps) {
  const isAllActive = selected.length === 0;
  const visibleOptions = expanded ? options : options.slice(0, TAG_SHOW_LIMIT);
  const hiddenCount = options.length - TAG_SHOW_LIMIT;

  function handleTagClick(value: string) {
    if (value === 'all') {
      onChange([]);
      return;
    }
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="kg-filter-row">
      <span className="kg-filter-row-label">{label}</span>
      <div className="kg-filter-tags">
        <button
          className={`kg-filter-tag${isAllActive ? ' active' : ''}`}
          onClick={() => handleTagClick('all')}
        >
          All
        </button>
        {visibleOptions.map((opt) => (
          <button
            key={opt}
            className={`kg-filter-tag${selected.includes(opt) ? ' active' : ''}`}
            onClick={() => handleTagClick(opt)}
          >
            {opt}
          </button>
        ))}
        {hiddenCount > 0 && !expanded && (
          <button className="kg-filter-more-btn" onClick={onToggleExpand}>
            +{hiddenCount} More ▾
          </button>
        )}
        {hiddenCount > 0 && expanded && (
          <button className="kg-filter-more-btn" onClick={onToggleExpand}>
            Less ▴
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filterIndustries, setFilterIndustries] = useState<string[]>([]);
  const [filterSegments, setFilterSegments] = useState<string[]>([]);
  const [filterCountries, setFilterCountries] = useState<string[]>([]);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    industry: false,
    segment: false,
    country: false,
  });
  const [viewBox, setViewBox] = useState<ViewBoxState>(DEFAULT_VB);
  const [panState, setPanState] = useState<PanState | null>(null);
  const [selected, setSelected] = useState<Selection>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const viewBoxRef = useRef(viewBox);
  viewBoxRef.current = viewBox;
  const panRef = useRef(panState);
  panRef.current = panState;
  const didDragRef = useRef(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/supply-chain-maps/supplier?q=${encodeURIComponent(query.trim())}`);
    }
  }

  // Filter options derived from all nodes (no 'all' entry — handled by FilterRow)
  const industryOptions = useMemo(
    () => Array.from(new Set(ALL_NODES.map((n) => n.industry).filter(Boolean))).sort(),
    [],
  );
  const segmentOptions = useMemo(
    () => Array.from(new Set(ALL_NODES.map((n) => n.segment).filter(Boolean))).sort(),
    [],
  );
  const countryOptions = useMemo(
    () => Array.from(new Set(ALL_NODES.map((n) => n.country).filter(Boolean))).sort(),
    [],
  );

  // Filtered nodes (multi-select: empty array = show all)
  const visibleNodes = useMemo(() => {
    return ALL_NODES.filter((n) => {
      if (n.role === 'center') return true;
      if (filterIndustries.length > 0 && !filterIndustries.includes(n.industry ?? '')) return false;
      if (filterSegments.length > 0 && !filterSegments.includes(n.segment ?? '')) return false;
      if (filterCountries.length > 0 && !filterCountries.includes(n.country ?? '')) return false;
      return true;
    });
  }, [filterIndustries, filterSegments, filterCountries]);

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
    if (didDragRef.current) return;
    setSelected((prev) =>
      prev?.type === 'node' && prev.data.id === n.id ? null : { type: 'node', data: n },
    );
  }

  function handleEdgeClick(e: GraphEdge) {
    if (didDragRef.current) return;
    setSelected((prev) =>
      prev?.type === 'edge' && prev.data.from === e.from && prev.data.to === e.to
        ? null
        : { type: 'edge', data: e },
    );
  }

  function resetFilters() {
    setFilterIndustries([]);
    setFilterSegments([]);
    setFilterCountries([]);
    setExpandedFilters({ industry: false, segment: false, country: false });
    setSelected(null);
  }

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
    setViewBox(DEFAULT_VB);
    setSelected(null);
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

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const pan = panRef.current;
    if (pan && svgRef.current) {
      didDragRef.current = true;
      const vb = viewBoxRef.current;
      const rect = svgRef.current.getBoundingClientRect();
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

  const clearPan = useCallback(() => {
    setPanState(null);
  }, []);

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
        <FilterRow
          label="Industry"
          options={industryOptions}
          selected={filterIndustries}
          onChange={setFilterIndustries}
          expanded={expandedFilters.industry}
          onToggleExpand={() =>
            setExpandedFilters((e) => ({ ...e, industry: !e.industry }))
          }
        />
        <FilterRow
          label="Segment"
          options={segmentOptions}
          selected={filterSegments}
          onChange={setFilterSegments}
          expanded={expandedFilters.segment}
          onToggleExpand={() =>
            setExpandedFilters((e) => ({ ...e, segment: !e.segment }))
          }
        />
        <FilterRow
          label="Country"
          options={countryOptions}
          selected={filterCountries}
          onChange={setFilterCountries}
          expanded={expandedFilters.country}
          onToggleExpand={() =>
            setExpandedFilters((e) => ({ ...e, country: !e.country }))
          }
        />
        <div className="kg-filter-footer">
          <span className="kg-filter-count">{visibleNodes.length} nodes</span>
        </div>
      </div>

      {/* Legend */}      <div className="kg-legend">
        {(['supplier1', 'supplier2', 'customer', 'competitor', 'partner'] as NodeRole[]).map((role) => (
          <div key={role} className="kg-legend-item">
            <span className="kg-legend-dot" style={{ background: ROLE_COLORS[role].fill, border: `2px solid ${ROLE_COLORS[role].stroke}` }} />
            {role === 'supplier1' ? 'Tier-1 Supplier' : role === 'supplier2' ? 'Tier-2 Supplier' : role.charAt(0).toUpperCase() + role.slice(1)}
          </div>
        ))}
        <span className="kg-legend-hint">Click a node for details</span>
      </div>

      {/* Graph + Feed panel side by side */}
      <div className="rmap-graph-content">
        {/* Graph area (70%) with draggable info card overlay */}
        <div className="rmap-svg-container">
          <svg
            ref={svgRef}
            viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
            className="rmap-svg"
            aria-label="RMAP Relational Graph"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={clearPan}
            onMouseLeave={clearPan}
            style={{ cursor: panState ? 'grabbing' : 'grab' }}
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
                      onMouseDown={(e) => { e.stopPropagation(); didDragRef.current = false; }}
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
                          T Company
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

          {/* Zoom controls — minimal flat buttons, consistent with Supplier Network */}
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
              disabled={viewBox.w <= SVG_W * MIN_VB_SCALE + 1}
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
              disabled={viewBox.w >= SVG_W * MAX_VB_SCALE - 1}
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              −
            </button>
          </div>

          {/* Draggable node info card overlay */}
          <KgNodeInfoCard
            node={selected?.type === 'node' ? selected.data : null}
            onClose={() => setSelected(null)}
          />
        </div>

        {/* News feed panel (30%) */}
        <KgFeedPanel selectedNode={selected?.type === 'node' ? selected.data : null} />
      </div>
    </div>
  );
}
