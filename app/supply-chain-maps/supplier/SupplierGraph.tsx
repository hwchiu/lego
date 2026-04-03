'use client';

import { useState, useCallback, useRef } from 'react';
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
const SVG_H = 900;
const CX = 650;
const CY = 450;
const R1 = 240; // tier-1 ring radius
const R2 = 430; // tier-2 ring radius
const CENTER_W = 180, CENTER_H = 100;
const T1_W = 140, T1_H = 80;
const T2_W = 110, T2_H = 65;
const CORNER_R = 12;
const SPREAD_RAD = (20 * Math.PI) / 180; // ±20° spread for tier-2 siblings

// ── Static lookups (computed once) ───────────────────────────────────────────

const ALL_SUPPLIERS = [...TSM_TIER1_SUPPLIERS, ...TSM_TIER2_SUPPLIERS];
const UNIQUE_INDUSTRIES = [...new Set(ALL_SUPPLIERS.map((s) => s.industryCategory))];
const UNIQUE_PRODUCTS = [...new Set(ALL_SUPPLIERS.flatMap((s) => s.productCategories))];

// Pre-computed lowercase for fast search filtering
const ALL_SUPPLIERS_LC = ALL_SUPPLIERS.map((s) => ({
  ...s,
  nameLc: s.name.toLowerCase(),
  tickerLc: s.ticker.toLowerCase(),
}));
const UNIQUE_INDUSTRIES_LC = UNIQUE_INDUSTRIES.map((s) => ({ val: s, lc: s.toLowerCase() }));
const UNIQUE_PRODUCTS_LC = UNIQUE_PRODUCTS.map((s) => ({ val: s, lc: s.toLowerCase() }));

// RELATION_TYPES label map for O(1) lookup
const RELATION_LABEL_MAP = new Map(RELATION_TYPES.map((r) => [r.key, r.label]));

// Pre-computed min/max per relation type key for edge width normalization
const EDGE_RANGE_MAP = new Map<RelationTypeKey, { min: number; max: number }>(
  RELATION_TYPES.filter((r) => r.key !== 'transactionAmount').map((r) => {
    const vals = EDGE_ENTITIES.map((e) => e[r.key] as number);
    return [r.key, { min: Math.min(...vals), max: Math.max(...vals) }] as [RelationTypeKey, { min: number; max: number }];
  }),
);

const RISK_TYPES = [
  { key: 'materialShortage', labelEn: 'Material Shortage', label: '材料缺料' },
  { key: 'geopolitical', labelEn: 'Geopolitical Risk', label: '國際情勢' },
  { key: 'tariff', labelEn: 'Tariff Issues', label: '關稅問題' },
];

const FILTER_TABS = ['Company', 'Industry', 'Product', 'News'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

// ── Helpers ───────────────────────────────────────────────────────────────────

const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = (() => {
  const pos: Record<string, { x: number; y: number }> = {};
  pos['TSM'] = { x: CX, y: CY };
  TSM_TIER1_SUPPLIERS.forEach((s, i) => {
    const a = (2 * Math.PI * i) / 9 - Math.PI / 2;
    pos[s.id] = { x: CX + R1 * Math.cos(a), y: CY + R1 * Math.sin(a) };
  });
  TSM_TIER2_SUPPLIERS.forEach((s) => {
    const pIdx = TSM_TIER1_SUPPLIERS.findIndex((t) => t.id === s.parentId);
    const pAngle = (2 * Math.PI * pIdx) / 9 - Math.PI / 2;
    const siblings = TSM_TIER2_SUPPLIERS.filter((t) => t.parentId === s.parentId);
    const sIdx = siblings.findIndex((t) => t.id === s.id);
    const a = pAngle + (sIdx === 0 ? -SPREAD_RAD : SPREAD_RAD);
    pos[s.id] = { x: CX + R2 * Math.cos(a), y: CY + R2 * Math.sin(a) };
  });
  return pos;
})();

function getSvgCoords(e: React.MouseEvent, svg: SVGSVGElement) {
  const rect = svg.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (SVG_W / rect.width),
    y: (e.clientY - rect.top) * (SVG_H / rect.height),
  };
}

function rectEdgePoint(nx: number, ny: number, tw: number, th: number, tx: number, ty: number) {
  const dx = tx - nx, dy = ty - ny;
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
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
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
  const bx = pos.x - T1_W / 2, by = pos.y - T1_H / 2;
  return (
    <g className="rmap-node" onClick={onClick} onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
      <rect x={bx} y={by} width={T1_W} height={T1_H} rx={CORNER_R} ry={CORNER_R}
        className={`rmap-node-rect${selected ? ' rmap-node-rect--selected' : ''}`} />
      <rect x={bx + 1} y={by + 1} width={T1_W - 2} height={5} rx={CORNER_R - 1} ry={4}
        style={{ fill: node.color, opacity: selected ? 0 : 0.9, pointerEvents: 'none' }} />
      <text x={pos.x} y={by + 21} className="rmap-node-name" textAnchor="middle">{trunc(node.name, 18)}</text>
      <text x={pos.x} y={by + 33} className="rmap-node-ticker" textAnchor="middle">{node.ticker} · {node.country}</text>
      <text x={pos.x} y={by + 46} className="rmap-node-rel" textAnchor="middle">{trunc(node.relationship, 22)}</text>
      <text x={pos.x} y={by + 59} className="rmap-node-fin-label" textAnchor="middle">Rev: {node.financials.revenue}</text>
      <text x={pos.x} y={by + 71} className="rmap-node-fin-label" textAnchor="middle">GM: {node.financials.grossMargin}</text>
    </g>
  );
}

function Tier2Node({ node, pos, selected, onClick, onMouseDown }: NodeProps) {
  const bx = pos.x - T2_W / 2, by = pos.y - T2_H / 2;
  return (
    <g className="rmap-node rmap-node--tier2" onClick={onClick} onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
      <rect x={bx} y={by} width={T2_W} height={T2_H} rx={CORNER_R - 2} ry={CORNER_R - 2}
        className={`rmap-node-rect rmap-node-rect--tier2${selected ? ' rmap-node-rect--selected' : ''}`} />
      <rect x={bx + 1} y={by + 1} width={T2_W - 2} height={4} rx={CORNER_R - 4} ry={3}
        style={{ fill: node.color, opacity: selected ? 0 : 0.75, pointerEvents: 'none' }} />
      <text x={pos.x} y={by + 17} className="rmap-node-name rmap-node-name--tier2" textAnchor="middle">{trunc(node.name, 16)}</text>
      <text x={pos.x} y={by + 28} className="rmap-node-ticker" textAnchor="middle">{node.ticker} · {node.country}</text>
      <text x={pos.x} y={by + 40} className="rmap-node-rel" textAnchor="middle">{trunc(node.relationship, 20)}</text>
      <text x={pos.x} y={by + 54} className="rmap-node-fin-label" textAnchor="middle">Rev: {node.financials.revenue}</text>
    </g>
  );
}

function CenterNodeSvg({ node, pos, selected, onClick, onMouseDown }: NodeProps) {
  const bx = pos.x - CENTER_W / 2, by = pos.y - CENTER_H / 2;
  return (
    <g className="rmap-node rmap-node--center" onClick={onClick} onMouseDown={onMouseDown} style={{ cursor: 'grab' }}>
      <rect x={bx} y={by} width={CENTER_W} height={CENTER_H} rx={CORNER_R + 2} ry={CORNER_R + 2}
        className={`rmap-node-rect rmap-node-rect--center${selected ? ' rmap-node-rect--selected' : ''}`} />
      <text x={pos.x} y={by + 28} className="rmap-node-name rmap-node-name--center" textAnchor="middle">{node.name}</text>
      <text x={pos.x} y={by + 43} className="rmap-node-ticker" textAnchor="middle">{node.ticker} · {node.exchange}</text>
      <text x={pos.x} y={by + 57} className="rmap-node-fin-label" textAnchor="middle">Rev: {node.financials.revenue}</text>
      <text x={pos.x} y={by + 70} className="rmap-node-fin-label" textAnchor="middle">GM: {node.financials.grossMargin} · MCap: {node.financials.marketCap}</text>
      <text x={pos.x} y={by + 84} className="rmap-node-fin-label" textAnchor="middle">{trunc(node.relationship, 30)}</text>
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
  const isCenter = node.id === 'TSM';
  return (
    <div className="rmap-detail-panel">
      <button className="rmap-detail-close" onClick={onClose} aria-label="關閉">×</button>
      <div className="rmap-detail-badge" style={{ background: node.color }}>
        {isCenter ? '中心公司' : `Tier ${node.tier}`}
      </div>
      <h3 className="rmap-detail-name">{node.name}</h3>
      <p className="rmap-detail-ticker">{node.ticker} &nbsp;·&nbsp; {node.exchange}</p>
      {!isCenter && (
        <p className="rmap-detail-items">
          <span className="rmap-detail-label">供應品項：</span>{node.supplyItems}
        </p>
      )}
      <div className="rmap-detail-fins">
        <div className="rmap-detail-fin">
          <span className="rmap-detail-fin-label">營收</span>
          <span className="rmap-detail-fin-val">{node.financials.revenue}</span>
        </div>
        <div className="rmap-detail-fin">
          <span className="rmap-detail-fin-label">毛利率</span>
          <span className="rmap-detail-fin-val">{node.financials.grossMargin}</span>
        </div>
        <div className="rmap-detail-fin">
          <span className="rmap-detail-fin-label">市值</span>
          <span className="rmap-detail-fin-val">{node.financials.marketCap}</span>
        </div>
      </div>
      <p className="rmap-detail-country"><span className="rmap-detail-label">國家：</span>{node.country}</p>
      <p className="rmap-detail-country" style={{ marginTop: 4 }}>
        <span className="rmap-detail-label">產業：</span>{node.industryCategory}
      </p>
      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {node.productCategories.map((cat) => (
          <span key={cat} className="rmap-detail-tag">{cat}</span>
        ))}
      </div>
    </div>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  relationType: RelationTypeKey;
  onRelationChange: (key: RelationTypeKey) => void;
}

function FilterBar({ relationType, onRelationChange }: FilterBarProps) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('Company');
  const [openDropdown, setOpenDropdown] = useState<'rel' | 'risk' | null>(null);

  const q = query.toLowerCase().trim();
  const showDropdown = q.length > 0;

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

  const industryResults = UNIQUE_INDUSTRIES_LC.filter((ind) => ind.lc.includes(q)).map((i) => i.val).slice(0, 3);
  const productResults = UNIQUE_PRODUCTS_LC.filter((p) => p.lc.includes(q)).map((p) => p.val).slice(0, 3);

  const relLabel = RELATION_LABEL_MAP.get(relationType) ?? '';

  return (
    <div className="rmap-filter-bar">
      {/* Search */}
      <div className="rmap-filter-search-wrap">
        <div className="rmap-filter-search">
          <svg className="rmap-filter-search-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            className="rmap-filter-input"
            type="text"
            placeholder="Search company, industry, product..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {showDropdown && (
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
                  {industryResults.length > 0
                    ? industryResults.map((ind) => <div key={ind} className="rmap-filter-item">{ind}</div>)
                    : <div className="rmap-filter-empty">No results</div>}
                </div>
              )}
              {activeTab === 'Product' && (
                <div className="rmap-filter-group">
                  {productResults.length > 0
                    ? productResults.map((p) => <div key={p} className="rmap-filter-item">{p}</div>)
                    : <div className="rmap-filter-empty">No results</div>}
                </div>
              )}
              {activeTab === 'News' && (
                <div className="rmap-filter-empty">News search coming soon</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Relation Type */}
      <div className="rmap-rel-wrap">
        <button
          className="rmap-rel-btn"
          onClick={() => setOpenDropdown(openDropdown === 'rel' ? null : 'rel')}
        >
          {relLabel} <span className="rmap-dropdown-arrow">▼</span>
        </button>
        {openDropdown === 'rel' && (
          <div className="rmap-rel-dropdown">
            {RELATION_TYPES.map((r) => (
              <button
                key={r.key}
                className={`rmap-rel-option${relationType === r.key ? ' rmap-rel-option--active' : ''}`}
                onClick={() => { onRelationChange(r.key); setOpenDropdown(null); }}
              >
                <span className="rmap-checkmark">{relationType === r.key ? '✓' : ''}</span>
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Risk Type */}
      <div className="rmap-risk-wrap">
        <button
          className="rmap-risk-btn"
          onClick={() => setOpenDropdown(openDropdown === 'risk' ? null : 'risk')}
        >
          Risk Type
          <span className="badge-coming-soon" style={{ marginLeft: 5 }}>Coming Soon</span>
          <span className="rmap-dropdown-arrow">▼</span>
        </button>
        {openDropdown === 'risk' && (
          <div className="rmap-risk-dropdown">
            {RISK_TYPES.map((r) => (
              <button key={r.key} className="rmap-risk-option">
                {r.labelEn}
                <span className="rmap-risk-option-sub">{r.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Graph Component ──────────────────────────────────────────────────────

export default function SupplierGraph() {
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
  const [selectedNode, setSelectedNode] = useState<SupplierNodeTSM | null>(null);
  const [relationType, setRelationType] = useState<RelationTypeKey>('transactionAmount');
  const svgRef = useRef<SVGSVGElement>(null);
  const posRef = useRef(positions);
  posRef.current = positions;
  const didDragRef = useRef(false);

  const handleNodeMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!svgRef.current) return;
    didDragRef.current = false;
    const { x, y } = getSvgCoords(e, svgRef.current);
    const nodePos = posRef.current[nodeId];
    setDragState({ nodeId, startSvgX: x, startSvgY: y, startNodeX: nodePos.x, startNodeY: nodePos.y });
  }, []);

  const dragRef = useRef(dragState);
  dragRef.current = dragState;

  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || !svgRef.current) return;
    didDragRef.current = true;
    const { x, y } = getSvgCoords(e, svgRef.current);
    setPositions((prev) => ({
      ...prev,
      [drag.nodeId]: { x: drag.startNodeX + (x - drag.startSvgX), y: drag.startNodeY + (y - drag.startSvgY) },
    }));
  }, []);

  const clearDrag = useCallback(() => setDragState(null), []);

  const handleNodeClick = useCallback((node: SupplierNodeTSM) => {
    if (didDragRef.current) return;
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  return (
    <div className="rmap-graph-wrap">
      <div className="rmap-svg-container">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="rmap-svg"
          aria-label="TSMC 供應商關係圖"
          onMouseMove={handleSvgMouseMove}
          onMouseUp={clearDrag}
          onMouseLeave={clearDrag}
          style={{ cursor: dragState ? 'grabbing' : 'default' }}
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
            const parent = TSM_TIER1_SUPPLIERS.find((t) => t.id === node.parentId);
            if (!parent) return null;
            const pp = positions[parent.id], np = positions[node.id];
            const ep = rectEdgePoint(pp.x, pp.y, T1_W, T1_H, np.x, np.y);
            const sp = rectEdgePoint(np.x, np.y, T2_W, T2_H, pp.x, pp.y);
            const edge = EDGE_ENTITIES.find((e) => e.from === parent.id && e.to === node.id);
            const val = edge ? (edge[relationType] as number) : 0;
            const mx = (ep.x + sp.x) / 2, my = (ep.y + sp.y) / 2;
            return (
              <g key={`e2-${node.id}`}>
                <line x1={ep.x} y1={ep.y} x2={sp.x} y2={sp.y}
                  className="rmap-edge rmap-edge--tier2" style={{ strokeWidth: getEdgeWidth(relationType, val) }}
                  markerEnd="url(#arr-sm)" />
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
            const cp = positions['TSM'], np = positions[node.id];
            const ep = rectEdgePoint(cp.x, cp.y, CENTER_W, CENTER_H, np.x, np.y);
            const sp = rectEdgePoint(np.x, np.y, T1_W, T1_H, cp.x, cp.y);
            const edge = EDGE_ENTITIES.find((e) => e.from === 'TSM' && e.to === node.id);
            const val = edge ? (edge[relationType] as number) : 0;
            const mx = (ep.x + sp.x) / 2, my = (ep.y + sp.y) / 2;
            return (
              <g key={`e1-${node.id}`}>
                <line x1={ep.x} y1={ep.y} x2={sp.x} y2={sp.y}
                  className="rmap-edge" style={{ strokeWidth: getEdgeWidth(relationType, val) }}
                  markerEnd="url(#arr)" />
                {val > 0 && (
                  <text x={mx} y={my - 4} className="rmap-edge-label" textAnchor="middle">
                    {val.toLocaleString()}
                  </text>
                )}
              </g>
            );
          })}

          {/* Tier 2 nodes */}
          {TSM_TIER2_SUPPLIERS.map((node) => (
            <Tier2Node key={node.id} node={node} pos={positions[node.id]}
              selected={selectedNode?.id === node.id}
              onClick={() => handleNodeClick(node)}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)} />
          ))}

          {/* Tier 1 nodes */}
          {TSM_TIER1_SUPPLIERS.map((node) => (
            <Tier1Node key={node.id} node={node} pos={positions[node.id]}
              selected={selectedNode?.id === node.id}
              onClick={() => handleNodeClick(node)}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)} />
          ))}

          {/* Center node — last for top z-order */}
          <CenterNodeSvg node={TSM_CENTER_NODE} pos={positions['TSM']}
            selected={selectedNode?.id === 'TSM'}
            onClick={() => handleNodeClick(TSM_CENTER_NODE)}
            onMouseDown={(e) => handleNodeMouseDown('TSM', e)} />
        </svg>

        <FilterBar relationType={relationType} onRelationChange={setRelationType} />
        <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>
    </div>
  );
}
