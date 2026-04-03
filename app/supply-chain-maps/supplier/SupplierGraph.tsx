'use client';

import { useState, useCallback, useRef } from 'react';
import {
  APPLE_CENTER_NODE,
  APPLE_SUPPLIERS,
  DEFAULT_EDGE_LABELS,
  type SupplierNode,
} from '@/app/data/appleSupplierData';

// ── Layout constants ─────────────────────────────────────────────────────────

const SVG_W = 1100;
const SVG_H = 820;
const CX = SVG_W / 2;
const CY = SVG_H / 2;
const ORBIT_R = 310; // radius of supplier ring
const NODE_W = 154;
const NODE_H = 92;
const CENTER_W = 170;
const CENTER_H = 96;
const CORNER_R = 14; // border-radius for SVG rounded rects

// Text truncation limits for SVG node labels
const MAX_NODE_NAME_LENGTH = 18;
const MAX_RELATIONSHIP_LENGTH = 22;

// Edge label input sizing (foreignObject dimensions in SVG units)
const EDGE_INPUT_HALF_W = 54;
const EDGE_INPUT_HALF_H = 12;
const EDGE_INPUT_W = EDGE_INPUT_HALF_W * 2;
const EDGE_INPUT_H = EDGE_INPUT_HALF_H * 2;

// ── Helpers ──────────────────────────────────────────────────────────────────

function getNodePositions(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: CX + ORBIT_R * Math.cos(angle),
      y: CY + ORBIT_R * Math.sin(angle),
    };
  });
}

// Clamp edge endpoint to rect boundary so the arrow starts/ends at the border
function rectEdgePoint(
  nx: number,
  ny: number,
  tw: number,
  th: number,
  tx: number,
  ty: number,
): { x: number; y: number } {
  const dx = tx - nx;
  const dy = ty - ny;
  const hw = tw / 2;
  const hh = th / 2;
  const sx = dx === 0 ? Infinity : Math.abs(hw / dx);
  const sy = dy === 0 ? Infinity : Math.abs(hh / dy);
  const t = Math.min(sx, sy);
  return { x: nx + dx * t, y: ny + dy * t };
}

// ── Sub-components ───────────────────────────────────────────────────────────

interface CenterNodeProps {
  node: SupplierNode;
  onClick: () => void;
  selected: boolean;
}

function CenterNode({ node, onClick, selected }: CenterNodeProps) {
  const x = CX - CENTER_W / 2;
  const y = CY - CENTER_H / 2;
  return (
    <g className="rmap-node rmap-node--center" onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={x}
        y={y}
        width={CENTER_W}
        height={CENTER_H}
        rx={CORNER_R}
        ry={CORNER_R}
        className={`rmap-node-rect rmap-node-rect--center${selected ? ' rmap-node-rect--selected' : ''}`}
      />
      {/* Company name */}
      <text x={CX} y={CY - 22} className="rmap-node-name rmap-node-name--center" textAnchor="middle">
        {node.name}
      </text>
      <text x={CX} y={CY - 6} className="rmap-node-ticker" textAnchor="middle">
        {node.ticker} · {node.exchange}
      </text>
      {/* Financials row */}
      <text x={CX} y={CY + 12} className="rmap-node-fin-label" textAnchor="middle">
        Rev: {node.financials.revenue}
      </text>
      <text x={CX} y={CY + 26} className="rmap-node-fin-label" textAnchor="middle">
        GM: {node.financials.grossMargin} · MCap: {node.financials.marketCap}
      </text>
    </g>
  );
}

interface SupplierNodeBoxProps {
  node: SupplierNode;
  x: number;
  y: number;
  onClick: () => void;
  selected: boolean;
}

function SupplierNodeBox({ node, x, y, onClick, selected }: SupplierNodeBoxProps) {
  const bx = x - NODE_W / 2;
  const by = y - NODE_H / 2;
  return (
    <g className="rmap-node" onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={bx}
        y={by}
        width={NODE_W}
        height={NODE_H}
        rx={CORNER_R}
        ry={CORNER_R}
        className={`rmap-node-rect${selected ? ' rmap-node-rect--selected' : ''}`}
        style={{ fill: selected ? node.color : undefined }}
      />
      {/* Accent strip at top */}
      <rect
        x={bx + 1}
        y={by + 1}
        width={NODE_W - 2}
        height={5}
        rx={CORNER_R - 1}
        ry={4}
        style={{ fill: node.color, opacity: selected ? 0 : 0.85 }}
      />
      <text x={x} y={by + 22} className="rmap-node-name" textAnchor="middle">
        {node.name.length > MAX_NODE_NAME_LENGTH ? node.name.slice(0, MAX_NODE_NAME_LENGTH - 1) + '…' : node.name}
      </text>
      <text x={x} y={by + 35} className="rmap-node-ticker" textAnchor="middle">
        {node.ticker} · {node.country}
      </text>
      <text x={x} y={by + 50} className="rmap-node-rel" textAnchor="middle">
        {node.relationship.length > MAX_RELATIONSHIP_LENGTH ? node.relationship.slice(0, MAX_RELATIONSHIP_LENGTH - 1) + '…' : node.relationship}
      </text>
      <text x={x} y={by + 64} className="rmap-node-fin-label" textAnchor="middle">
        Rev: {node.financials.revenue}
      </text>
      <text x={x} y={by + 77} className="rmap-node-fin-label" textAnchor="middle">
        GM: {node.financials.grossMargin}
      </text>
    </g>
  );
}

// ── Edge label input overlay ─────────────────────────────────────────────────

interface EdgeLabelInputProps {
  nodeId: string;
  mx: number; // midpoint x in SVG coords
  my: number; // midpoint y in SVG coords
  value: string;
  onChange: (id: string, val: string) => void;
}

function EdgeLabelInput({ nodeId, mx, my, value, onChange }: EdgeLabelInputProps) {
  return (
    <foreignObject x={mx - EDGE_INPUT_HALF_W} y={my - EDGE_INPUT_HALF_H} width={EDGE_INPUT_W} height={EDGE_INPUT_H} style={{ overflow: 'visible' }}>
      <input
        className="rmap-edge-input"
        type="text"
        placeholder="備註…"
        value={value}
        onChange={(e) => onChange(nodeId, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />
    </foreignObject>
  );
}

// ── Detail panel ─────────────────────────────────────────────────────────────

interface DetailPanelProps {
  node: SupplierNode | null;
  onClose: () => void;
}

function DetailPanel({ node, onClose }: DetailPanelProps) {
  if (!node) return null;
  const isCenter = node.id === 'AAPL';
  return (
    <div className="rmap-detail-panel">
      <button className="rmap-detail-close" onClick={onClose} aria-label="關閉">
        ×
      </button>
      <div className="rmap-detail-badge" style={{ background: node.color }}>
        {isCenter ? '中心公司' : node.relationship}
      </div>
      <h3 className="rmap-detail-name">{node.name}</h3>
      <p className="rmap-detail-ticker">
        {node.ticker} &nbsp;·&nbsp; {node.exchange}
      </p>
      {!isCenter && (
        <p className="rmap-detail-items">
          <span className="rmap-detail-label">供應品項：</span>
          {node.supplyItems}
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
      <p className="rmap-detail-country">
        <span className="rmap-detail-label">國家：</span>
        {node.country}
      </p>
    </div>
  );
}

// ── Main Graph Component ─────────────────────────────────────────────────────

export default function SupplierGraph() {
  const [edgeLabels, setEdgeLabels] = useState<Record<string, string>>(DEFAULT_EDGE_LABELS);
  const [selectedNode, setSelectedNode] = useState<SupplierNode | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const positions = getNodePositions(APPLE_SUPPLIERS.length);

  const handleEdgeLabel = useCallback((id: string, val: string) => {
    setEdgeLabels((prev) => ({ ...prev, [id]: val }));
  }, []);

  const handleNodeClick = useCallback(
    (node: SupplierNode) => {
      setSelectedNode((prev) => (prev?.id === node.id ? null : node));
    },
    [],
  );

  return (
    <div className="rmap-graph-wrap">
      {/* Legend */}
      <div className="rmap-legend">
        <span className="rmap-legend-dot rmap-legend-dot--center" />
        <span className="rmap-legend-text">中心公司 (Apple)</span>
        <span className="rmap-legend-dot rmap-legend-dot--supplier" />
        <span className="rmap-legend-text">供應商</span>
        <span className="rmap-legend-dash" />
        <span className="rmap-legend-text">供應關係（可輸入備註）</span>
      </div>

      <div className="rmap-svg-container">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="rmap-svg"
          aria-label="Apple 供應商關係圖"
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" className="rmap-arrow-marker" />
            </marker>
          </defs>

          {/* Edges */}
          {APPLE_SUPPLIERS.map((supplier, i) => {
            const { x: nx, y: ny } = positions[i];
            const ep = rectEdgePoint(CX, CY, CENTER_W, CENTER_H, nx, ny);
            const sp = rectEdgePoint(nx, ny, NODE_W, NODE_H, CX, CY);
            const mx = (ep.x + sp.x) / 2;
            const my = (ep.y + sp.y) / 2;
            return (
              <g key={`edge-${supplier.id}`}>
                <line
                  x1={ep.x}
                  y1={ep.y}
                  x2={sp.x}
                  y2={sp.y}
                  className="rmap-edge"
                  markerEnd="url(#arrowhead)"
                />
                <EdgeLabelInput
                  nodeId={supplier.id}
                  mx={mx}
                  my={my}
                  value={edgeLabels[supplier.id] ?? ''}
                  onChange={handleEdgeLabel}
                />
              </g>
            );
          })}

          {/* Supplier nodes */}
          {APPLE_SUPPLIERS.map((supplier, i) => (
            <SupplierNodeBox
              key={supplier.id}
              node={supplier}
              x={positions[i].x}
              y={positions[i].y}
              selected={selectedNode?.id === supplier.id}
              onClick={() => handleNodeClick(supplier)}
            />
          ))}

          {/* Center node (Apple) — rendered last so it's on top */}
          <CenterNode
            node={APPLE_CENTER_NODE}
            selected={selectedNode?.id === APPLE_CENTER_NODE.id}
            onClick={() => handleNodeClick(APPLE_CENTER_NODE)}
          />
        </svg>

        {/* Detail panel overlay */}
        <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
      </div>

      <p className="rmap-source-note">
        * 資料來源：Apple Supplier Responsibility Report、公開財報（FY2023–FY2024）。點擊節點查看詳細資訊。
      </p>
    </div>
  );
}
