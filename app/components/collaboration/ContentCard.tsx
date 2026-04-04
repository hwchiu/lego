'use client';

import type { ContentCard, ChartBar, Member, Comment } from '@/app/data/collaboration';
import { CommentSection } from './CommentSection';

// ─── Bar chart (inline SVG) ───────────────────
function BarChart({ data, unit }: { data: ChartBar[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value));
  const W = 320;
  const H = 120;
  const pad = { top: 10, right: 10, bottom: 28, left: 36 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = chartW / data.length - 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-label="bar chart">
      {/* Y axis ticks */}
      {[0, 0.5, 1].map((t) => {
        const y = pad.top + chartH * (1 - t);
        return (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {unit}
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {/* Bars */}
      {data.map((d, i) => {
        const barH = (d.value / max) * chartH;
        const x = pad.left + i * (chartW / data.length) + 2;
        const y = pad.top + chartH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="2" fill="#4fc3f7" opacity="0.85" />
            <text
              x={x + barW / 2}
              y={H - pad.bottom + 14}
              textAnchor="middle"
              fontSize="8.5"
              fill="#6b7280"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Line chart (inline SVG) ──────────────────
function LineChart({ data, unit }: { data: ChartBar[]; unit?: string }) {
  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const range = max - min || 1;
  const W = 320;
  const H = 120;
  const pad = { top: 10, right: 10, bottom: 28, left: 40 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;

  const xStep = chartW / (data.length - 1);
  const points = data
    .map((d, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + chartH * (1 - (d.value - min) / range);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = [
    `${pad.left},${pad.top + chartH}`,
    ...data.map((d, i) => {
      const x = pad.left + i * xStep;
      const y = pad.top + chartH * (1 - (d.value - min) / range);
      return `${x},${y}`;
    }),
    `${pad.left + chartW},${pad.top + chartH}`,
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} aria-label="line chart">
      {/* Grid */}
      {[0, 0.5, 1].map((t) => {
        const y = pad.top + chartH * (1 - t);
        const val = min + range * t;
        return (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="#e5e7eb" strokeWidth="1" />
            <text x={pad.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
              {unit}
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {/* Area fill */}
      <polygon points={areaPoints} fill="#4fc3f7" fillOpacity="0.12" />
      {/* Line */}
      <polyline points={points} fill="none" stroke="#4fc3f7" strokeWidth="2" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => {
        const x = pad.left + i * xStep;
        const y = pad.top + chartH * (1 - (d.value - min) / range);
        return <circle key={i} cx={x} cy={y} r="3" fill="#4fc3f7" stroke="#fff" strokeWidth="1.5" />;
      })}
      {/* X labels (every other to avoid crowding) */}
      {data.map((d, i) => {
        if (i % 2 !== 0) return null;
        const x = pad.left + i * xStep;
        return (
          <text key={i} x={x} y={H - pad.bottom + 14} textAnchor="middle" fontSize="8.5" fill="#6b7280">
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}

// ─── AI Supply-Chain SVG ──────────────────────
function AiSupplyChainGraph() {
  const nodes = [
    { id: 'tsmc', label: '台積電', sub: 'CoWoS 封裝', x: 40, y: 90, color: '#1a2332' },
    { id: 'nvda', label: 'NVIDIA', sub: 'GPU 設計', x: 160, y: 40, color: '#76b900' },
    { id: 'amd', label: 'AMD', sub: 'GPU/CPU', x: 160, y: 140, color: '#ed1c24' },
    { id: 'aws', label: 'AWS', sub: 'Cloud AI', x: 280, y: 20, color: '#ff9900' },
    { id: 'azure', label: 'Azure', sub: 'AI Platform', x: 280, y: 80, color: '#0078d4' },
    { id: 'gcp', label: 'GCP', sub: 'TPU / AI', x: 280, y: 140, color: '#4285f4' },
    { id: 'meta', label: 'Meta', sub: 'Llama / AI', x: 280, y: 195, color: '#1877f2' },
  ];
  const edges = [
    ['tsmc', 'nvda'],
    ['tsmc', 'amd'],
    ['nvda', 'aws'],
    ['nvda', 'azure'],
    ['amd', 'gcp'],
    ['nvda', 'meta'],
  ];

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 360 230" width="100%" style={{ display: 'block' }} aria-label="AI supply chain graph">
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#9ca3af" />
        </marker>
      </defs>
      {edges.map(([from, to], i) => {
        const a = nodeMap[from];
        const b = nodeMap[to];
        return (
          <line
            key={i}
            x1={a.x + 30}
            y1={a.y + 16}
            x2={b.x}
            y2={b.y + 16}
            stroke="#9ca3af"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            markerEnd="url(#arrowhead)"
          />
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <rect x={n.x} y={n.y} width={60} height={32} rx="6" fill={n.color} opacity="0.9" />
          <text x={n.x + 30} y={n.y + 12} textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fff">
            {n.label}
          </text>
          <text x={n.x + 30} y={n.y + 24} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.7)">
            {n.sub}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── Middle East Supply Chain SVG ─────────────
function MiddleEastSupplyChainGraph() {
  const nodes = [
    { id: 'ir', label: '伊朗', x: 180, y: 75, color: '#dc2626', r: 18 },
    { id: 'sa', label: '沙烏地', x: 130, y: 120, color: '#d97706', r: 14 },
    { id: 'uae', label: 'UAE', x: 200, y: 130, color: '#059669', r: 12 },
    { id: 'horm', label: '霍爾木茲', x: 235, y: 100, color: '#7c3aed', r: 16 },
    { id: 'ind', label: '印度洋', x: 290, y: 150, color: '#2563eb', r: 14 },
    { id: 'eu', label: '歐洲', x: 60, y: 50, color: '#1a2332', r: 12 },
    { id: 'cn', label: '中國', x: 310, y: 50, color: '#dc2626', r: 14 },
    { id: 'jp', label: '日韓台', x: 340, y: 100, color: '#0891b2', r: 12 },
  ];
  const edges = [
    ['sa', 'horm', '#d97706', 'normal'],
    ['uae', 'horm', '#059669', 'normal'],
    ['horm', 'ind', '#7c3aed', 'normal'],
    ['ind', 'cn', '#2563eb', 'normal'],
    ['ind', 'jp', '#2563eb', 'normal'],
    ['sa', 'eu', '#d97706', 'dash'],
    ['ir', 'horm', '#dc2626', 'thick'],
  ];

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <svg viewBox="0 0 400 200" width="100%" style={{ display: 'block' }} aria-label="Middle East supply chain">
      <defs>
        <marker id="arrow2" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#9ca3af" />
        </marker>
      </defs>
      {/* Sea background */}
      <rect x="0" y="0" width="400" height="200" fill="#f0f9ff" rx="8" />
      <ellipse cx="230" cy="130" rx="100" ry="40" fill="#bfdbfe" opacity="0.5" />
      <text x="230" y="175" textAnchor="middle" fontSize="8" fill="#2563eb" opacity="0.7">
        印度洋 / 阿拉伯海
      </text>
      {/* Strait label */}
      <text x="235" y="88" textAnchor="middle" fontSize="7" fill="#7c3aed" fontStyle="italic">
        ⚠ 戰略要衝
      </text>
      {edges.map(([from, to, color, style], i) => {
        const a = nodeMap[from as string];
        const b = nodeMap[to as string];
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={color as string}
            strokeWidth={style === 'thick' ? 2.5 : 1.5}
            strokeDasharray={style === 'dash' ? '5 3' : undefined}
            markerEnd="url(#arrow2)"
            opacity="0.75"
          />
        );
      })}
      {nodes.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.color} opacity="0.85" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#fff">
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── World map with AI hotspot highlights ─────
function AiWorldMap() {
  // Simplified rectangular world map using SVG regions
  const regions = [
    { label: '北美', x: 40, y: 50, w: 90, h: 70, color: '#4fc3f7', opacity: 0.7, intensity: '$312B' },
    { label: '歐洲', x: 175, y: 35, w: 70, h: 55, color: '#4fc3f7', opacity: 0.5, intensity: '$98B' },
    { label: '中國', x: 280, y: 45, w: 55, h: 55, color: '#4fc3f7', opacity: 0.6, intensity: '$87B' },
    { label: '日韓台', x: 330, y: 45, w: 35, h: 35, color: '#4fc3f7', opacity: 0.55, intensity: '$64B' },
    { label: '印度', x: 255, y: 85, w: 35, h: 35, color: '#4fc3f7', opacity: 0.4, intensity: '$22B' },
    { label: '中東', x: 210, y: 75, w: 45, h: 30, color: '#fbbf24', opacity: 0.4, intensity: '$18B' },
    { label: '東南亞', x: 300, y: 100, w: 40, h: 30, color: '#4fc3f7', opacity: 0.35, intensity: '$15B' },
  ];

  return (
    <svg viewBox="0 0 420 175" width="100%" style={{ display: 'block' }} aria-label="AI investment world map">
      {/* Ocean background */}
      <rect x="0" y="0" width="420" height="175" rx="8" fill="#eff6ff" />
      {/* Simplified landmass outlines */}
      {/* Africa */}
      <ellipse cx="210" cy="115" rx="35" ry="40" fill="#e5e7eb" opacity="0.6" />
      {/* South America */}
      <ellipse cx="100" cy="130" rx="28" ry="38" fill="#e5e7eb" opacity="0.6" />
      {/* Australia */}
      <ellipse cx="350" cy="140" rx="30" ry="18" fill="#e5e7eb" opacity="0.6" />
      {/* Russia */}
      <rect x="175" y="15" width="190" height="30" rx="5" fill="#e5e7eb" opacity="0.5" />
      {regions.map((r, i) => (
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="6" fill={r.color} opacity={r.opacity} />
          <text x={r.x + r.w / 2} y={r.y + r.h / 2 - 4} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#1a2332">
            {r.label}
          </text>
          <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 8} textAnchor="middle" fontSize="7.5" fill="#0e4c7a">
            {r.intensity}
          </text>
        </g>
      ))}
      <text x="210" y="168" textAnchor="middle" fontSize="8" fill="#6b7280">
        2025 全球生成式 AI 投資分布（估計值）
      </text>
    </svg>
  );
}

// ─── Hormuz / Middle East Map ─────────────────
function MiddleEastMap() {
  return (
    <svg
      viewBox="0 0 440 220"
      width="100%"
      style={{ display: 'block' }}
      aria-label="霍爾木茲海峽與受影響供應鏈地域分布地圖"
    >
      <defs>
        <marker id="horm-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#9ca3af" />
        </marker>
        <marker id="horm-arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#dc2626" />
        </marker>
        <marker id="horm-arrow-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#d97706" />
        </marker>
        <marker id="horm-arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#2563eb" />
        </marker>
      </defs>

      {/* Ocean / sea background */}
      <rect x="0" y="0" width="440" height="220" rx="8" fill="#dbeafe" />

      {/* Arabian Sea / Indian Ocean  */}
      <ellipse cx="370" cy="150" rx="70" ry="55" fill="#bfdbfe" opacity="0.6" />

      {/* Persian Gulf water */}
      <ellipse cx="170" cy="110" rx="85" ry="28" fill="#93c5fd" opacity="0.7" />
      <text x="170" y="114" textAnchor="middle" fontSize="7.5" fill="#1e40af" fontWeight="600">
        波 斯 灣
      </text>

      {/* Gulf of Oman */}
      <ellipse cx="320" cy="130" rx="50" ry="25" fill="#bfdbfe" opacity="0.5" />
      <text x="320" y="134" textAnchor="middle" fontSize="7" fill="#1e40af" opacity="0.8">
        阿曼灣
      </text>

      {/* ── Land masses ── */}
      {/* Iran (top) */}
      <rect x="100" y="20" width="175" height="60" rx="6" fill="#d1fae5" stroke="#6ee7b7" strokeWidth="0.8" />
      <text x="187" y="46" textAnchor="middle" fontSize="11" fontWeight="700" fill="#065f46">
        伊 朗
      </text>
      <text x="187" y="60" textAnchor="middle" fontSize="8" fill="#047857">
        (衝突發起方)
      </text>

      {/* Iraq / Kuwait (top-left) */}
      <rect x="20" y="35" width="80" height="55" rx="5" fill="#fef9c3" stroke="#fde047" strokeWidth="0.8" />
      <text x="60" y="58" textAnchor="middle" fontSize="9" fontWeight="600" fill="#854d0e">
        伊拉克
      </text>
      <text x="60" y="70" textAnchor="middle" fontSize="8" fill="#92400e">
        科威特
      </text>

      {/* Saudi Arabia / Qatar / UAE (bottom) */}
      <rect x="60" y="140" width="160" height="55" rx="5" fill="#fff7ed" stroke="#fed7aa" strokeWidth="0.8" />
      <text x="140" y="162" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7c2d12">
        沙烏地阿拉伯
      </text>
      <text x="140" y="176" textAnchor="middle" fontSize="7.5" fill="#9a3412">
        卡達 · UAE · 科威特
      </text>
      <text x="140" y="188" textAnchor="middle" fontSize="7" fill="#b45309">
        主要石油出口國
      </text>

      {/* Oman (bottom-right of gulf) */}
      <rect x="240" y="148" width="70" height="50" rx="5" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="0.8" />
      <text x="275" y="170" textAnchor="middle" fontSize="9" fontWeight="600" fill="#065f46">
        阿 曼
      </text>

      {/* ── Strait of Hormuz (key bottleneck) ── */}
      <ellipse cx="280" cy="110" rx="18" ry="12" fill="#7c3aed" opacity="0.25" />
      <ellipse cx="280" cy="110" rx="18" ry="12" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeDasharray="4 2" />
      <text x="280" y="107" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#6d28d9">
        霍爾木茲
      </text>
      <text x="280" y="117" textAnchor="middle" fontSize="7" fill="#7c3aed">
        海 峽
      </text>
      {/* Warning badge */}
      <text x="280" y="97" textAnchor="middle" fontSize="9">
        ⚠
      </text>

      {/* ── Supply routes from Hormuz ── */}
      {/* To East Asia */}
      <line
        x1="296" y1="105" x2="418" y2="78"
        stroke="#dc2626" strokeWidth="2" strokeDasharray="6 3"
        markerEnd="url(#horm-arrow-red)"
      />
      {/* To India / SE Asia */}
      <line
        x1="296" y1="115" x2="418" y2="145"
        stroke="#d97706" strokeWidth="2" strokeDasharray="6 3"
        markerEnd="url(#horm-arrow-amber)"
      />
      {/* To Europe (via Saudi overland / Suez) */}
      <line
        x1="92" y1="92" x2="14" y2="58"
        stroke="#2563eb" strokeWidth="2" strokeDasharray="6 3"
        markerEnd="url(#horm-arrow-blue)"
      />

      {/* Route labels */}
      <text x="364" y="72" textAnchor="middle" fontSize="8" fontWeight="600" fill="#dc2626">
        → 東亞
      </text>
      <text x="364" y="80" textAnchor="middle" fontSize="7" fill="#dc2626">
        (中/日/韓/台)
      </text>
      <text x="364" y="140" textAnchor="middle" fontSize="8" fontWeight="600" fill="#d97706">
        → 印度/東南亞
      </text>
      <text x="38" y="52" textAnchor="middle" fontSize="8" fontWeight="600" fill="#2563eb">
        歐洲 ←
      </text>

      {/* Oil flow stat */}
      <rect x="142" y="4" width="158" height="18" rx="4" fill="#7c3aed" opacity="0.12" />
      <text x="221" y="16" textAnchor="middle" fontSize="8" fontWeight="700" fill="#6d28d9">
        每日 2,100 萬桶原油 · 佔全球海運 21%
      </text>

      {/* Legend */}
      <g transform="translate(4, 195)">
        <line x1="0" y1="5" x2="14" y2="5" stroke="#dc2626" strokeWidth="2" strokeDasharray="4 2" />
        <text x="17" y="8" fontSize="7.5" fill="#dc2626">東亞航線</text>
        <line x1="58" y1="5" x2="72" y2="5" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2" />
        <text x="75" y="8" fontSize="7.5" fill="#d97706">南亞航線</text>
        <line x1="116" y1="5" x2="130" y2="5" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 2" />
        <text x="133" y="8" fontSize="7.5" fill="#2563eb">歐洲航線</text>
      </g>
    </svg>
  );
}

// ─── Avatar ───────────────────────────────────
function Avatar({ src, name, size = 28 }: { src: string; name: string; size?: number }) {
  return (
    <img
      src={src}
      alt={name}
      title={name}
      width={size}
      height={size}
      style={{
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
        flexShrink: 0,
      }}
    />
  );
}

// ─── Main export ──────────────────────────────
interface ContentCardProps {
  card: ContentCard;
  members: Member[];
  currentUser: Member;
  onCommentsChange: (cardId: string, comments: Comment[]) => void;
  onDelete?: (cardId: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart: (cardId: string) => void;
  onDragOver: (e: React.DragEvent, cardId: string) => void;
  onDrop: (e: React.DragEvent, cardId: string) => void;
  onDragEnd: () => void;
}

export function ContentCardComponent({
  card,
  members,
  currentUser,
  onCommentsChange,
  onDelete,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ContentCardProps) {
  const classNames = [
    'pg-card',
    isDragging ? 'pg-card--dragging' : '',
    isDragOver ? 'pg-card--drag-over' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onDragOver={(e) => onDragOver(e, card.id)}
      onDrop={(e) => onDrop(e, card.id)}
    >
      {/* Card title — drag handle */}
      <div
        className="pg-card-title"
        draggable
        onDragStart={() => onDragStart(card.id)}
        onDragEnd={onDragEnd}
      >
        <span className="pg-card-title-text">{card.title}</span>
        <div className="pg-card-title-actions">
          {/* Save icon (placeholder) */}
          <button
            className="pg-card-action-btn"
            title="儲存"
            aria-label="儲存"
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
              <path d="M2 2h9l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <rect x="5" y="2" width="5" height="3.5" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
              <rect x="4" y="9" width="8" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
          {/* Edit icon (placeholder) */}
          <button
            className="pg-card-action-btn"
            title="編輯"
            aria-label="編輯"
            onClick={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
              <path d="M11 2l3 3-8 8H3v-3l8-8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </button>
          {/* Delete icon (functional) */}
          <button
            className="pg-card-action-btn pg-card-action-btn--delete"
            title="刪除"
            aria-label="刪除"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(card.id);
            }}
          >
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
              <path d="M3 4h10M6 4V2.5h4V4M5 4l.5 9h5l.5-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className="pg-card-body">
        {card.type === 'kpi' && card.kpis && (
          <div className="pg-kpi-grid">
            {card.kpis.map((k, i) => (
              <div key={i} className="pg-kpi-item">
                <div className="pg-kpi-value">{k.value}</div>
                <div className="pg-kpi-label">{k.label}</div>
                <div className={`pg-kpi-change ${k.positive ? 'pos' : 'neg'}`}>{k.change}</div>
              </div>
            ))}
          </div>
        )}

        {card.type === 'article' && (
          <>
            {card.imageUrl && (
              <img
                src={card.imageUrl}
                alt={card.title}
                style={{ width: '100%', borderRadius: '6px', marginBottom: '10px', display: 'block' }}
              />
            )}
            {card.text && <p className="pg-article-text">{card.text}</p>}
            {card.source && (
              <div className="pg-article-source">
                {(() => {
                  try {
                    const p = new URL(card.source);
                    if (p.protocol === 'http:' || p.protocol === 'https:') {
                      return (
                        <>
                          Source:{' '}
                          <a href={card.source} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--c-text-4)' }}>
                            {card.source}
                          </a>
                        </>
                      );
                    }
                  } catch {
                    // not a URL
                  }
                  return <>來源：{card.source}</>;
                })()}
              </div>
            )}
          </>
        )}

        {card.type === 'table' && card.tableData && (
          <div className="pg-table-wrap">
            <table className="pg-table">
              <thead>
                <tr>
                  {card.tableData.columns.map((c, i) => (
                    <th key={i}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.tableData.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {card.type === 'image' && card.imageUrl && (
          <>
            <img
              src={card.imageUrl}
              alt={card.title}
              style={{ width: '100%', borderRadius: '6px', display: 'block' }}
            />
            {card.imageCaption && <p className="pg-image-caption">{card.imageCaption}</p>}
          </>
        )}

        {card.type === 'chart' && card.chartData && (
          <div style={{ paddingTop: '4px' }}>
            {card.chartType === 'line' ? (
              <LineChart data={card.chartData} unit={card.chartUnit} />
            ) : (
              <BarChart data={card.chartData} unit={card.chartUnit} />
            )}
          </div>
        )}

        {card.type === 'map' && card.id.startsWith('c2') && <AiWorldMap />}
        {card.type === 'map' && card.id.startsWith('c3') && <MiddleEastMap />}

        {card.type === 'supply-chain' && card.id.startsWith('c2') && <AiSupplyChainGraph />}
        {card.type === 'supply-chain' && card.id.startsWith('c3') && <MiddleEastSupplyChainGraph />}

        {card.type === 'file' && (
          <div className="pg-file-card">
            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
                stroke="var(--c-text-3)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M14 2v6h6" stroke="var(--c-text-3)" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="pg-file-name">{card.fileName ?? card.title}</div>
              {card.fileSize && <div className="pg-file-size">{card.fileSize}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Footer: added-by info */}
      <div className="pg-card-footer">
        <Avatar src={card.addedBy.avatar} name={card.addedBy.name} size={26} />
        <span className="pg-card-adder">{card.addedBy.name}</span>
        <span className="pg-card-date">{card.addedAt}</span>
      </div>

      {/* Comment section */}
      <CommentSection
        cardId={card.id}
        comments={card.comments ?? []}
        members={members}
        currentUser={currentUser}
        onCommentsChange={onCommentsChange}
      />
    </div>
  );
}
