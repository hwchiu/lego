'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TSM_TIER1_SUPPLIERS, TSM_TIER2_SUPPLIERS } from '@/app/data/tsmcSupplierData';
import { TSM_CUSTOMERS } from '@/app/data/tsmcCustomerData';
import { TSM_COMPETITORS } from '@/app/data/tsmcCompetitorData';
import type { SupplierNodeTSM } from '@/app/data/tsmcSupplierData';
import type { CustomerNode } from '@/app/data/tsmcCustomerData';
import type { CompetitorNode } from '@/app/data/tsmcCompetitorData';

// ── Selected-node union ───────────────────────────────────────────────────────

type SelectedNode =
  | { kind: 'supplier1'; data: SupplierNodeTSM }
  | { kind: 'supplier2'; data: SupplierNodeTSM }
  | { kind: 'customer'; data: CustomerNode }
  | { kind: 'competitor'; data: CompetitorNode };

function getNodeId(node: SelectedNode): string {
  return node.data.id;
}

function truncate(name: string, max: number): string {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

// ── Colour palette ────────────────────────────────────────────────────────────

const BLUE_NODE = '#2563eb';
const BLUE_BG = '#dbeafe';
const BLUE_TEXT = '#1e3a8a';
const BLUE_EDGE = '#93c5fd';
const BLUE2_NODE = '#60a5fa';
const BLUE2_BG = '#eff6ff';
const BLUE2_TEXT = '#1e40af';
const BLUE2_EDGE = '#bfdbfe';
const GREEN_NODE = '#16a34a';
const GREEN_BG = '#dcfce7';
const GREEN_TEXT = '#14532d';
const GREEN_EDGE = '#86efac';
const ORANGE_NODE = '#ea580c';
const ORANGE_BG = '#ffedd5';
const ORANGE_TEXT = '#9a3412';
const ORANGE_EDGE = '#fdba74';

// ── Node dimensions ───────────────────────────────────────────────────────────

const CW = 160, CH = 64;       // TSMC center
const OW = 110, OH = 36;       // tier-1 / customer / competitor
const T2W = 100, T2H = 32;     // tier-2

// ── Graph coordinates (1400 × 900 viewBox) ───────────────────────────────────

const CCX = 700, CCY = 450;
const T1X = 960;
const T2X = 1235;
const CUSTX = 435;
const COMPY = 812;

// 9 tier-1 nodes spread y 175 → 727 (step ≈ 69)
const T1_CY = Array.from({ length: 9 }, (_, i) => 175 + i * 69);

// 6 tier-2 nodes — same y as parent tier-1
const T2_CY = T1_CY.slice(0, 6);

// 6 customer nodes
const CUST_CY = [175, 285, 395, 505, 615, 725];

// 4 competitor nodes
const COMP_CX = [480, 620, 760, 900];

// ── Data slices ───────────────────────────────────────────────────────────────

const T1_NODES = TSM_TIER1_SUPPLIERS.slice(0, 9);
const TOP6_CUST = TSM_CUSTOMERS.slice(0, 6);
const TOP4_COMP = TSM_COMPETITORS.slice(0, 4);

// One tier-2 child per first-6 tier-1 parents
const VIS_T2: SupplierNodeTSM[] = T1_NODES.slice(0, 6)
  .map((t1) => TSM_TIER2_SUPPLIERS.find((t2) => t2.parentId === t1.id))
  .filter((n): n is SupplierNodeTSM => Boolean(n));

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SupplierIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="14" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="26" y="28" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20.5H28C31 20.5 33 22.5 33 25.5V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="20.5" r="2.5" fill="currentColor" />
      <circle cx="35" cy="34.5" r="2.5" fill="currentColor" />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="26" y="14" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="28" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M26 20.5H20C17 20.5 15 22.5 15 25.5V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="35" cy="20.5" r="2.5" fill="currentColor" />
      <circle cx="13" cy="34.5" r="2.5" fill="currentColor" />
    </svg>
  );
}

function CompetitorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="15" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="31" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="28" y="31" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M24 17V24M24 24L12 31M24 24L36 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}

// ── SVG node helper ───────────────────────────────────────────────────────────

interface NodeRectProps {
  cx: number;
  cy: number;
  w: number;
  h: number;
  fill: string;
  stroke: string;
  label: string;
  sublabel?: string;
  textFill: string;
  labelSize?: number;
  subSize?: number;
  selected?: boolean;
  onClick: () => void;
}

function NodeRect({
  cx, cy, w, h, fill, stroke, label, sublabel, textFill,
  labelSize = 10, subSize = 8, selected, onClick,
}: NodeRectProps) {
  const rx = cx - w / 2;
  const ry = cy - h / 2;
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <rect
        x={rx} y={ry} width={w} height={h} rx={4}
        fill={fill}
        stroke={selected ? '#f59e0b' : stroke}
        strokeWidth={selected ? 2.5 : 1.5}
        filter={selected ? 'url(#node-glow)' : undefined}
      />
      <text
        x={cx}
        y={sublabel ? cy - 5 : cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textFill}
        fontSize={labelSize}
        fontWeight="700"
        style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textFill}
          fontSize={subSize}
          opacity={0.65}
          style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

function DetailPanel({ node, onClose }: { node: SelectedNode; onClose: () => void }) {
  let name = '',
    ticker = '',
    typeLabel = '',
    country = '',
    industry = '',
    revenue = '',
    mktCap = '',
    viewHref = '';

  if (node.kind === 'supplier1' || node.kind === 'supplier2') {
    name = node.data.name;
    ticker = node.data.ticker;
    typeLabel = node.kind === 'supplier1' ? 'Supplier Tier-1' : 'Supplier Tier-2';
    country = node.data.country;
    industry = node.data.industryCategory;
    revenue = node.data.financials.revenue;
    mktCap = node.data.financials.marketCap;
    viewHref = '/my-rmap/supplier';
  } else if (node.kind === 'customer') {
    name = node.data.name;
    ticker = node.data.ticker;
    typeLabel = 'Customer';
    country = node.data.country;
    industry = node.data.industryCategory;
    revenue = node.data.financials.revenue;
    mktCap = node.data.financials.marketCap;
    viewHref = '/my-rmap/customer';
  } else {
    name = node.data.name;
    ticker = node.data.ticker;
    typeLabel = 'Competitor';
    country = node.data.country;
    industry = node.data.industryCategory;
    revenue = node.data.financials.revenue;
    mktCap = node.data.financials.marketCap;
    viewHref = '/my-rmap/competitor';
  }

  const badgeBg =
    node.kind === 'customer' ? GREEN_NODE : node.kind === 'competitor' ? ORANGE_NODE : BLUE_NODE;

  return (
    <div className="kg-detail-panel">
      <button className="kg-detail-close" onClick={onClose} aria-label="Close detail panel">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
      <span className="kg-detail-badge" style={{ background: badgeBg }}>
        {typeLabel}
      </span>
      <div className="kg-detail-name">{name}</div>
      <div className="kg-detail-ticker">{ticker}</div>
      <div className="kg-detail-rows">
        {country && (
          <div className="kg-detail-row">
            <span>Country</span>
            <span>{country}</span>
          </div>
        )}
        {industry && (
          <div className="kg-detail-row">
            <span>Industry</span>
            <span>{industry}</span>
          </div>
        )}
        {revenue && (
          <div className="kg-detail-row">
            <span>Revenue</span>
            <span>{revenue}</span>
          </div>
        )}
        {mktCap && (
          <div className="kg-detail-row">
            <span>Mkt Cap</span>
            <span>{mktCap}</span>
          </div>
        )}
      </div>
      <Link href={viewHref} className="kg-detail-link">
        View Full Page →
      </Link>
    </div>
  );
}

// ── Scenario cards (Detailed Views) ──────────────────────────────────────────

const DETAIL_VIEW_CARDS = [
  {
    key: 'supplier',
    title: 'Supplier Network',
    description:
      'Explore upstream supply relationships and tier-1/tier-2 supplier ecosystems for any company.',
    href: '/my-rmap/supplier',
    icon: <SupplierIcon />,
    color: '#2196F3',
  },
  {
    key: 'customer',
    title: 'Customer Network',
    description:
      'Discover downstream customer relationships and distribution channels for a target company.',
    href: '/my-rmap/customer',
    icon: <CustomerIcon />,
    color: '#43a047',
  },
  {
    key: 'competitor',
    title: 'Competitor Network',
    description:
      'Map out competitive relationships and peer companies within the same market ecosystem.',
    href: '/my-rmap/competitor',
    icon: <CompetitorIcon />,
    color: '#ef6c00',
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function KnowledgeGraph() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SelectedNode | null>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/supply-chain-maps/supplier?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function selectNode(node: SelectedNode) {
    setSelected((prev) =>
      prev && prev.kind === node.kind && getNodeId(prev) === getNodeId(node) ? null : node,
    );
  }

  const selId = selected ? getNodeId(selected) : null;

  // ── Edge endpoint helpers ──────────────────────────────────────────────────

  // TSMC center edges
  const cRight = { x: CCX + CW / 2, y: CCY };      // to tier-1
  const cLeft = { x: CCX - CW / 2, y: CCY };       // to customers
  const cBot = { x: CCX, y: CCY + CH / 2 };        // to competitors

  // Tier-1 left/right edges
  const t1LE = (cy: number) => ({ x: T1X - OW / 2, y: cy });
  const t1RE = (cy: number) => ({ x: T1X + OW / 2, y: cy });

  // Tier-2 left edge
  const t2LE = (cy: number) => ({ x: T2X - T2W / 2, y: cy });

  // Customer right edge
  const custRE = (cy: number) => ({ x: CUSTX + OW / 2, y: cy });

  // Competitor top edge
  const compTE = (cx: number) => ({ x: cx, y: COMPY - OH / 2 });

  return (
    <div className="kg-wrapper">
      {/* ── Hero + search ── */}
      <div className="kg-hero">
        <h1 className="kg-hero-title">RMAP — Relational Map</h1>
        <p className="kg-hero-subtitle">
          Search any company to explore its supply chain relationships — suppliers, customers, and
          competitors.
        </p>
        <form className="kg-search-wrap" onSubmit={handleSearch}>
          <div className="kg-search-box">
            <span className="kg-search-icon">
              <SearchIcon />
            </span>
            <input
              className="kg-search-input"
              type="text"
              placeholder="Search a company or ticker to explore its ecosystem…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="kg-search-btn" type="submit">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* ── Legend ── */}
      <div className="kg-legend">
        <div className="kg-legend-item">
          <span className="kg-legend-dot" style={{ background: BLUE_BG, border: `2px solid ${BLUE_NODE}` }} />
          Tier-1 Supplier
        </div>
        <div className="kg-legend-item">
          <span className="kg-legend-dot" style={{ background: BLUE2_BG, border: `2px solid ${BLUE2_NODE}` }} />
          Tier-2 Supplier
        </div>
        <div className="kg-legend-item">
          <span className="kg-legend-dot" style={{ background: GREEN_BG, border: `2px solid ${GREEN_NODE}` }} />
          Customer
        </div>
        <div className="kg-legend-item">
          <span className="kg-legend-dot" style={{ background: ORANGE_BG, border: `2px solid ${ORANGE_NODE}` }} />
          Competitor
        </div>
        <span className="kg-legend-hint">Click a node for details</span>
      </div>

      {/* ── Graph container ── */}
      <div className="kg-graph-container">
        <div className="kg-graph-scroll">
          <svg
            viewBox="0 0 1400 900"
            className="kg-svg"
            preserveAspectRatio="xMidYMid meet"
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

            {/* ── Edges: TSMC → Tier-1 ── */}
            {T1_CY.map((cy, i) => (
              <line
                key={`e-t1-${i}`}
                x1={cRight.x} y1={cRight.y}
                x2={t1LE(cy).x} y2={t1LE(cy).y}
                stroke={BLUE_EDGE}
                strokeWidth={1.5}
                opacity={0.6}
              />
            ))}

            {/* ── Edges: Tier-1 → Tier-2 ── */}
            {VIS_T2.map((_, i) => (
              <line
                key={`e-t2-${i}`}
                x1={t1RE(T1_CY[i]).x} y1={t1RE(T1_CY[i]).y}
                x2={t2LE(T2_CY[i]).x} y2={t2LE(T2_CY[i]).y}
                stroke={BLUE2_EDGE}
                strokeWidth={1.2}
                strokeDasharray="4 3"
                opacity={0.55}
              />
            ))}

            {/* ── Edges: TSMC → Customers ── */}
            {CUST_CY.map((cy, i) => (
              <line
                key={`e-c-${i}`}
                x1={cLeft.x} y1={cLeft.y}
                x2={custRE(cy).x} y2={custRE(cy).y}
                stroke={GREEN_EDGE}
                strokeWidth={1.5}
                opacity={0.6}
              />
            ))}

            {/* ── Edges: TSMC → Competitors ── */}
            {COMP_CX.map((cx, i) => (
              <line
                key={`e-comp-${i}`}
                x1={cBot.x} y1={cBot.y}
                x2={compTE(cx).x} y2={compTE(cx).y}
                stroke={ORANGE_EDGE}
                strokeWidth={1.5}
                opacity={0.6}
              />
            ))}

            {/* ── Tier-2 nodes ── */}
            {VIS_T2.map((node, i) => (
              <NodeRect
                key={node.id}
                cx={T2X} cy={T2_CY[i]}
                w={T2W} h={T2H}
                fill={BLUE2_BG}
                stroke={BLUE2_NODE}
                label={node.ticker}
                sublabel={truncate(node.name, 14)}
                textFill={BLUE2_TEXT}
                labelSize={9}
                subSize={7}
                selected={selId === node.id}
                onClick={() => selectNode({ kind: 'supplier2', data: node })}
              />
            ))}

            {/* ── Tier-1 nodes ── */}
            {T1_NODES.map((node, i) => (
              <NodeRect
                key={node.id}
                cx={T1X} cy={T1_CY[i]}
                w={OW} h={OH}
                fill={BLUE_BG}
                stroke={BLUE_NODE}
                label={node.ticker}
                sublabel={truncate(node.name, 15)}
                textFill={BLUE_TEXT}
                labelSize={10}
                subSize={7.5}
                selected={selId === node.id}
                onClick={() => selectNode({ kind: 'supplier1', data: node })}
              />
            ))}

            {/* ── Customer nodes ── */}
            {TOP6_CUST.map((node, i) => (
              <NodeRect
                key={node.id}
                cx={CUSTX} cy={CUST_CY[i]}
                w={OW} h={OH}
                fill={GREEN_BG}
                stroke={GREEN_NODE}
                label={node.ticker}
                sublabel={truncate(node.name, 15)}
                textFill={GREEN_TEXT}
                labelSize={10}
                subSize={7.5}
                selected={selId === node.id}
                onClick={() => selectNode({ kind: 'customer', data: node })}
              />
            ))}

            {/* ── Competitor nodes ── */}
            {TOP4_COMP.map((node, i) => (
              <NodeRect
                key={node.id}
                cx={COMP_CX[i]} cy={COMPY}
                w={OW} h={OH}
                fill={ORANGE_BG}
                stroke={ORANGE_NODE}
                label={node.ticker}
                sublabel={truncate(node.name, 15)}
                textFill={ORANGE_TEXT}
                labelSize={10}
                subSize={7.5}
                selected={selId === node.id}
                onClick={() => selectNode({ kind: 'competitor', data: node })}
              />
            ))}

            {/* ── TSMC center node ── */}
            <g onClick={() => setSelected(null)} style={{ cursor: 'default' }}>
              <rect
                x={CCX - CW / 2} y={CCY - CH / 2}
                width={CW} height={CH} rx={6}
                fill="#1a2332"
                stroke="#334155"
                strokeWidth={2}
              />
              <text
                x={CCX} y={CCY - 10}
                textAnchor="middle" dominantBaseline="middle"
                fill="#ffffff" fontSize={18} fontWeight="700"
                style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
              >
                TSM
              </text>
              <text
                x={CCX} y={CCY + 12}
                textAnchor="middle" dominantBaseline="middle"
                fill="#94a3b8" fontSize={8.5}
                style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}
              >
                TSMC
              </text>
            </g>

            {/* ── Section labels ── */}
            <text x={T1X} y={135} textAnchor="middle" fill="#64748b" fontSize={9.5}
              fontWeight="700" letterSpacing="0.08em" textDecoration="none"
              style={{ fontFamily: 'var(--font)', textTransform: 'uppercase', pointerEvents: 'none' }}>
              SUPPLIERS
            </text>
            <text x={T2X} y={135} textAnchor="middle" fill="#94a3b8" fontSize={8.5}
              fontWeight="700" letterSpacing="0.08em"
              style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
              TIER-2
            </text>
            <text x={CUSTX} y={135} textAnchor="middle" fill="#64748b" fontSize={9.5}
              fontWeight="700" letterSpacing="0.08em"
              style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
              CUSTOMERS
            </text>
            <text x={CCX} y={870} textAnchor="middle" fill="#64748b" fontSize={9.5}
              fontWeight="700" letterSpacing="0.08em"
              style={{ fontFamily: 'var(--font)', pointerEvents: 'none' }}>
              COMPETITORS
            </text>
          </svg>
        </div>

        {/* ── Detail panel overlay ── */}
        {selected && <DetailPanel node={selected} onClose={() => setSelected(null)} />}
      </div>

      {/* ── Detailed Views section ── */}
      <div className="kg-scenarios-section">
        <h2 className="kg-section-title">Detailed Views</h2>
        <div className="kg-scenario-grid">
          {DETAIL_VIEW_CARDS.map((card) => (
            <Link key={card.key} href={card.href} className="kg-scenario-card">
              <div className="kg-scenario-icon" style={{ color: card.color }}>
                {card.icon}
              </div>
              <div className="kg-scenario-body">
                <h3 className="kg-scenario-title">{card.title}</h3>
                <p className="kg-scenario-desc">{card.description}</p>
              </div>
              <div className="kg-scenario-arrow" style={{ color: card.color }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M7 4L13 10L7 16"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
