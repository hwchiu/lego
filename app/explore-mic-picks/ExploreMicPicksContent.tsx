'use client';

import type { CSSProperties, ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useState, useCallback, useEffect } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

// ─────────────────────────────────────────────────────────────────
// Inline SVG chart components (no external libraries)
// ─────────────────────────────────────────────────────────────────

function GdpBarChart() {
  const bars = [
    { label: '美國', value: 2.7, color: '#4fc3f7' },
    { label: '歐元區', value: 0.8, color: '#81c784' },
    { label: '中國', value: 4.6, color: '#ef5350' },
    { label: '日本', value: 1.2, color: '#ffd54f' },
    { label: '印度', value: 6.5, color: '#ba68c8' },
  ];
  const max = 7.5;
  const W = 240,
    H = 90,
    barW = 34,
    gap = 14;
  return (
    <svg viewBox={`0 0 ${W} ${H + 22}`} width="100%" aria-label="GDP增長預測圖">
      <text x="0" y="10" fontSize="9" fontWeight="700" fill="#374151" letterSpacing="0.3">
        2024 年 GDP 增長預測 (%)
      </text>
      {bars.map((b, i) => {
        const bH = (b.value / max) * 72;
        const x = i * (barW + gap);
        const y = H - bH;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={barW} height={bH} fill={b.color} rx="3" opacity="0.85" />
            <text x={x + barW / 2} y={H + 9} textAnchor="middle" fontSize="8" fill="#6b7280">
              {b.label}
            </text>
            <text
              x={x + barW / 2}
              y={y - 3}
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="700"
              fill="#111827"
            >
              {b.value}%
            </text>
          </g>
        );
      })}
      <line x1="0" y1={H} x2={W} y2={H} stroke="#e5e7eb" strokeWidth="1" />
    </svg>
  );
}

function FabUtilizationChart() {
  const groups = [
    { label: "Q1'24", tsmc: 85, samsung: 72, intel: 65 },
    { label: "Q2'24", tsmc: 88, samsung: 75, intel: 68 },
    { label: "Q3'24", tsmc: 92, samsung: 78, intel: 70 },
    { label: "Q4'24", tsmc: 95, samsung: 80, intel: 72 },
  ];
  const colors = ['#4fc3f7', '#ffd54f', '#ef9a9a'];
  const labels = ['T Company', '三星', '英特爾'];
  const W = 250,
    H = 90,
    barW = 16,
    barGap = 3,
    groupW = 56;
  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" aria-label="晶圓廠產能利用率圖">
      <text x="0" y="10" fontSize="9" fontWeight="700" fill="#374151" letterSpacing="0.3">
        晶圓廠產能利用率 (%)
      </text>
      {groups.map((g, gi) => {
        const vals = [g.tsmc, g.samsung, g.intel];
        return (
          <g key={g.label}>
            {vals.map((v, bi) => {
              const bH = (v / 100) * 70;
              const x = gi * groupW + bi * (barW + barGap);
              const y = H - bH;
              return (
                <g key={bi}>
                  <rect
                    x={x}
                    y={y}
                    width={barW}
                    height={bH}
                    fill={colors[bi]}
                    rx="2"
                    opacity="0.82"
                  />
                  <text
                    x={x + barW / 2}
                    y={y - 2}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#374151"
                  >
                    {v}
                  </text>
                </g>
              );
            })}
            <text
              x={gi * groupW + (3 * barW + 2 * barGap) / 2}
              y={H + 9}
              textAnchor="middle"
              fontSize="7.5"
              fill="#6b7280"
            >
              {g.label}
            </text>
          </g>
        );
      })}
      <line x1="0" y1={H} x2={W} y2={H} stroke="#e5e7eb" strokeWidth="1" />
      {labels.map((name, i) => (
        <g key={name}>
          <rect x={i * 72} y={H + 17} width="8" height="8" fill={colors[i]} rx="1" />
          <text x={i * 72 + 11} y={H + 24} fontSize="7.5" fill="#6b7280">
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function MarketSizeChart() {
  const data = [
    { segment: 'AI / HPC', value: 185, growth: '+42%', color: '#4fc3f7' },
    { segment: '智能手機', value: 142, growth: '+8%', color: '#81c784' },
    { segment: '汽車電子', value: 98, growth: '+31%', color: '#ffb74d' },
    { segment: 'IoT', value: 76, growth: '+18%', color: '#ba68c8' },
    { segment: '消費電子', value: 62, growth: '-3%', color: '#ef9a9a' },
  ];
  const max = 200;
  const W = 250,
    rowH = 22;
  return (
    <svg viewBox={`0 0 ${W} ${data.length * rowH + 18}`} width="100%" aria-label="細分市場規模圖">
      <text x="0" y="10" fontSize="9" fontWeight="700" fill="#374151" letterSpacing="0.3">
        2024 年細分市場規模 (十億美元)
      </text>
      {data.map((d, i) => {
        const bW = (d.value / max) * 130;
        const y = 16 + i * rowH;
        return (
          <g key={d.segment}>
            <text x="0" y={y + 12} fontSize="8.5" fill="#374151" fontWeight="600">
              {d.segment}
            </text>
            <rect x={62} y={y + 2} width={bW} height={14} fill={d.color} rx="2" opacity="0.85" />
            <text x={62 + bW + 5} y={y + 12} fontSize="8.5" fill="#374151" fontWeight="700">
              ${d.value}B
            </text>
            <text
              x={220}
              y={y + 12}
              fontSize="8.5"
              fill={d.growth.startsWith('+') ? '#16a34a' : '#dc2626'}
              fontWeight="700"
            >
              {d.growth}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CustomerRevenueChart() {
  const data = [
    { name: 'Apple', q3: 89.5, q4: 111.4, c1: '#bae6fd', c2: '#4fc3f7' },
    { name: 'NVIDIA', q3: 18.1, q4: 22.1, c1: '#bbf7d0', c2: '#4ade80' },
    { name: 'Qualcomm', q3: 8.5, q4: 9.9, c1: '#fde68a', c2: '#fbbf24' },
    { name: 'AMD', q3: 6.1, q4: 6.8, c1: '#e9d5ff', c2: '#a78bfa' },
  ];
  const max = 120;
  const W = 250,
    H = 95,
    barW = 20,
    barGap = 4,
    groupW = 58;
  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} width="100%" aria-label="主要客戶季度營收圖">
      <text x="0" y="10" fontSize="9" fontWeight="700" fill="#374151" letterSpacing="0.3">
        主要客戶季度營收 (十億美元)
      </text>
      {data.map((d, i) => {
        const vals = [d.q3, d.q4];
        const cs = [d.c1, d.c2];
        return (
          <g key={d.name}>
            {vals.map((v, bi) => {
              const bH = (v / max) * 75;
              const x = i * groupW + bi * (barW + barGap);
              const y = H - bH;
              return (
                <g key={bi}>
                  <rect x={x} y={y} width={barW} height={bH} fill={cs[bi]} rx="2" />
                  {v > 15 && (
                    <text
                      x={x + barW / 2}
                      y={y - 2}
                      textAnchor="middle"
                      fontSize="6.5"
                      fill="#374151"
                    >
                      {v}
                    </text>
                  )}
                </g>
              );
            })}
            <text
              x={i * groupW + barW + barGap / 2}
              y={H + 9}
              textAnchor="middle"
              fontSize="7.5"
              fill="#6b7280"
            >
              {d.name}
            </text>
          </g>
        );
      })}
      <line x1="0" y1={H} x2={W} y2={H} stroke="#e5e7eb" strokeWidth="1" />
      {['Q3 2024', 'Q4 2024'].map((q, i) => (
        <g key={q}>
          <rect x={i * 80} y={H + 18} width="8" height="8" fill={i === 0 ? '#d1d5db' : '#4fc3f7'} rx="1" />
          <text x={i * 80 + 11} y={H + 25} fontSize="7.5" fill="#6b7280">
            {q}
          </text>
        </g>
      ))}
    </svg>
  );
}

function DataInsightFlow() {
  const steps = [
    {
      label: '原始\n數據',
      color: '#e0f2fe',
      border: '#4fc3f7',
      iconPath: 'M17 4v8M17 12l-4-4M17 12l4-4M8 3h-4v11h13',
    },
    {
      label: '清洗\n分類',
      color: '#f3e8ff',
      border: '#a78bfa',
      iconPath: 'M15 15a6 6 0 1 1-8.5-8.5A6 6 0 0 1 15 15ZM18 18l-3.5-3.5',
    },
    {
      label: '交叉\n分析',
      color: '#fef9c3',
      border: '#fbbf24',
      iconPath: 'M3 16h4v-6H3zM9 16h4V8H9zM15 16h4V4h-4zM2 17h18',
    },
    {
      label: '趨勢\n識別',
      color: '#dcfce7',
      border: '#4ade80',
      iconPath: 'M2 14l5-5 4 3 7-8M14 4h5v5',
    },
    {
      label: '風險\n預警',
      color: '#fee2e2',
      border: '#f87171',
      iconPath: 'M10 2L2 17h16L10 2ZM10 8v5M10 14.5v.5',
    },
    {
      label: '洞察\n報告',
      color: '#e0f2fe',
      border: '#4fc3f7',
      iconPath: 'M4 2h9l4 4v13H4V2ZM13 2v4h4M7 10h7M7 13h5',
    },
  ];
  const W = 260,
    boxW = 34,
    boxH = 42,
    step = 42;
  return (
    <svg viewBox={`0 0 ${W} 70`} width="100%" aria-label="從數據到洞察流程圖">
      <defs>
        <marker
          id="emp-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="#9ca3af" />
        </marker>
      </defs>
      {steps.map((s, i) => {
        const x = i * step + 1;
        const lines = s.label.split('\n');
        const iconCx = x + boxW / 2;
        const iconCy = 26;
        const iconScale = 0.55; // scale 20-unit icon path to ~11px
        return (
          <g key={i}>
            <rect
              x={x}
              y="14"
              width={boxW}
              height={boxH}
              fill={s.color}
              stroke={s.border}
              strokeWidth="1.5"
              rx="4"
            />
            <g transform={`translate(${iconCx - 10 * iconScale}, ${iconCy - 10 * iconScale}) scale(${iconScale})`}>
              <path d={s.iconPath} stroke={s.border} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {lines.map((line, li) => (
              <text
                key={li}
                x={x + boxW / 2}
                y={42 + li * 9}
                textAnchor="middle"
                fontSize="7"
                fill="#374151"
                fontWeight="600"
              >
                {line}
              </text>
            ))}
            {i < steps.length - 1 && (
              <path
                d={`M${x + boxW + 1} 35 L${x + step - 1} 35`}
                stroke="#9ca3af"
                strokeWidth="1.5"
                markerEnd="url(#emp-arrow)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ProcessRoadmap() {
  const nodes = [
    { label: '7nm', year: '2018', active: true, tsmc: true, samsung: true },
    { label: '5nm', year: '2020', active: true, tsmc: true, samsung: false },
    { label: '3nm', year: '2022', active: true, tsmc: true, samsung: true },
    { label: '2nm', year: '2025', active: false, tsmc: true, samsung: false },
    { label: '1.4nm', year: '2027', active: false, tsmc: true, samsung: false },
  ];
  const W = 260,
    step = 50;
  return (
    <svg viewBox={`0 0 ${W} 80`} width="100%" aria-label="先進製程技術路線圖">
      <text x="0" y="10" fontSize="9" fontWeight="700" fill="#374151" letterSpacing="0.3">
        先進製程技術路線圖
      </text>
      <line x1="15" y1="42" x2="245" y2="42" stroke="#4fc3f7" strokeWidth="2.5" />
      <path d="M245 38 L255 42 L245 46 Z" fill="#4fc3f7" />
      {nodes.map((n, i) => {
        const cx = 15 + i * step;
        const fill = n.active ? '#4fc3f7' : '#fbbf24';
        return (
          <g key={n.label}>
            <circle cx={cx} cy="42" r="7" fill={fill} stroke="white" strokeWidth="1.5" />
            <text
              x={cx}
              y="42"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="6"
              fill="white"
              fontWeight="800"
            >
              {n.label}
            </text>
            <text x={cx} y="56" textAnchor="middle" fontSize="7" fill="#6b7280">
              {n.year}
            </text>
            {n.tsmc && (
              <text x={cx} y="27" textAnchor="middle" fontSize="6.5" fill="#4fc3f7" fontWeight="700">
                T Company
              </text>
            )}
            {n.samsung && (
              <text x={cx} y="18" textAnchor="middle" fontSize="6" fill="#fbbf24" fontWeight="700">
                Samsung
              </text>
            )}
          </g>
        );
      })}
      <text x="205" y="72" fontSize="7.5" fill="#fbbf24" fontWeight="700">
        ◈ 研發中
      </text>
    </svg>
  );
}

function IndustryChainDiagram() {
  const layers = [
    {
      label: '上游',
      items: ['EDA工具', 'IP授權', '設備商', '材料供應'],
      color: '#e0f2fe',
      border: '#4fc3f7',
      bg: '#4fc3f7',
    },
    {
      label: '中游',
      items: ['晶圓製造', '封裝測試', '光罩製作'],
      color: '#fef9c3',
      border: '#fbbf24',
      bg: '#fbbf24',
    },
    {
      label: '下游',
      items: ['IC設計', '品牌商', '系統整合'],
      color: '#dcfce7',
      border: '#4ade80',
      bg: '#16a34a',
    },
  ];
  return (
    <svg viewBox="0 0 260 110" width="100%" aria-label="半導體產業鏈全覽圖">
      <text x="0" y="10" fontSize="9" fontWeight="700" fill="#374151" letterSpacing="0.3">
        半導體產業鏈全覽
      </text>
      <defs>
        <marker
          id="emp-chain-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill="#9ca3af" />
        </marker>
      </defs>
      {layers.map((layer, li) => {
        const y = 18 + li * 30;
        return (
          <g key={layer.label}>
            <rect x="0" y={y} width="28" height="22" fill={layer.bg} rx="3" />
            <text
              x="14"
              y={y + 15}
              textAnchor="middle"
              fontSize="8.5"
              fill="white"
              fontWeight="700"
            >
              {layer.label}
            </text>
            {layer.items.map((item, ii) => {
              const ix = 34 + ii * 76;
              return (
                <g key={item}>
                  <rect
                    x={ix}
                    y={y}
                    width="68"
                    height="22"
                    fill={layer.color}
                    stroke={layer.border}
                    strokeWidth="1"
                    rx="3"
                  />
                  <text x={ix + 34} y={y + 15} textAnchor="middle" fontSize="7.5" fill="#374151" fontWeight="600">
                    {item}
                  </text>
                  {ii < layer.items.length - 1 && (
                    <path
                      d={`M${ix + 68} ${y + 11} L${ix + 74} ${y + 11}`}
                      stroke="#9ca3af"
                      strokeWidth="1"
                      markerEnd="url(#emp-chain-arrow)"
                    />
                  )}
                </g>
              );
            })}
            {li < layers.length - 1 && (
              <path
                d={`M14 ${y + 22} L14 ${y + 28}`}
                stroke="#9ca3af"
                strokeWidth="1.5"
                markerEnd="url(#emp-chain-arrow)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Cover illustration — clean editorial tech art (no charts/numbers)
// ─────────────────────────────────────────────────────────────────

function CoverIllustration() {
  const cx = 140,
    cy = 100;
  const orbitR = 62;
  const nodeAnglesDeg = [0, 60, 120, 180, 240, 300];
  const nodes = nodeAnglesDeg.map((deg) => {
    const a = (deg - 90) * (Math.PI / 180);
    return { x: cx + Math.cos(a) * orbitR, y: cy + Math.sin(a) * orbitR };
  });
  const cardinals = [0, 90, 180, 270].map((deg) => {
    const a = deg * (Math.PI / 180);
    return { x: cx + Math.cos(a) * 30, y: cy + Math.sin(a) * 30 };
  });
  const ticks = Array.from({ length: 24 }).map((_, i) => {
    const a = (i / 24) * 2 * Math.PI - Math.PI / 2;
    const isMajor = i % 6 === 0;
    const r1 = 81;
    const r2 = r1 + (isMajor ? 6 : 3);
    return { x1: cx + Math.cos(a) * r1, y1: cy + Math.sin(a) * r1, x2: cx + Math.cos(a) * r2, y2: cy + Math.sin(a) * r2, isMajor };
  });
  const hexCenters: [number, number][] = [
    [cx - 12, cy - 7], [cx, cy - 14], [cx + 12, cy - 7],
    [cx - 12, cy + 7], [cx, cy + 14], [cx + 12, cy + 7],
    [cx, cy],
  ];

  return (
    <svg viewBox="0 0 280 200" width="100%" height="200" aria-hidden="true">
      <defs>
        <radialGradient id="il-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#0f2a4a" />
          <stop offset="100%" stopColor="#07111f" />
        </radialGradient>
        <radialGradient id="il-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="280" height="200" fill="url(#il-bg)" rx="8" />

      {/* Subtle dot grid */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) =>
        [0, 1, 2, 3, 4, 5, 6].map((j) => (
          <circle key={`d${i}-${j}`} cx={14 + i * 28} cy={14 + j * 28} r="0.7" fill="#2563eb" opacity="0.22" />
        )),
      )}

      {/* Outer precision ring */}
      <circle cx={cx} cy={cy} r="87" fill="none" stroke="#4fc3f7" strokeWidth="0.4" opacity="0.18" />

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <line
          key={`tick${i}`}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke="#4fc3f7"
          strokeWidth={t.isMajor ? '0.8' : '0.5'}
          opacity={t.isMajor ? '0.5' : '0.22'}
        />
      ))}

      {/* Connection lines center → nodes */}
      {nodes.map((n, i) => (
        <line key={`cl${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="#4fc3f7" strokeWidth="0.45" opacity="0.22" />
      ))}

      {/* Orbit ring */}
      <circle cx={cx} cy={cy} r={orbitR} fill="none" stroke="#4fc3f7" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.32" />

      {/* Orbital nodes */}
      {nodes.map((n, i) => (
        <g key={`node${i}`}>
          <circle cx={n.x} cy={n.y} r="5.5" fill="#0f2a4a" stroke="#4fc3f7" strokeWidth="0.9" opacity="0.9" />
          <circle cx={n.x} cy={n.y} r="2" fill="#7dd3fc" opacity="0.9" />
        </g>
      ))}

      {/* Middle ring */}
      <circle cx={cx} cy={cy} r="30" fill="none" stroke="#4fc3f7" strokeWidth="1.2" opacity="0.38" />

      {/* Cardinal diamond accents */}
      {cardinals.map((c, i) => (
        <g key={`card${i}`} transform={`translate(${c.x},${c.y}) rotate(45)`}>
          <rect x="-2.5" y="-2.5" width="5" height="5" fill="#4fc3f7" opacity="0.55" />
        </g>
      ))}

      {/* Core glow */}
      <circle cx={cx} cy={cy} r="24" fill="url(#il-glow)" />

      {/* Chip-like hex grid in core */}
      {hexCenters.map(([hx, hy], i) => {
        const s = 6;
        const pts = Array.from({ length: 6 })
          .map((_, j) => {
            const a = (j * 60 - 30) * (Math.PI / 180);
            return `${hx + s * Math.cos(a)},${hy + s * Math.sin(a)}`;
          })
          .join(' ');
        return <polygon key={`hex${i}`} points={pts} fill="none" stroke="#4fc3f7" strokeWidth="0.6" opacity="0.38" />;
      })}

      {/* Center glow dot */}
      <circle cx={cx} cy={cy} r="9" fill="#4fc3f7" opacity="0.18" />
      <circle cx={cx} cy={cy} r="4.5" fill="#4fc3f7" opacity="0.7" />
      <circle cx={cx} cy={cy} r="1.8" fill="#e0f7fa" />

      {/* Watermark text */}
      <text x={cx} y="193" textAnchor="middle" fontSize="6" fill="#4fc3f7" opacity="0.3" fontFamily="monospace" letterSpacing="2">
        INTELLIGENCE · ANALYTICS
      </text>
    </svg>
  );
}

// Compact thumbnail for bookshelf card
function CoverIllustrationThumb() {
  const cx = 60,
    cy = 55;
  const orbitR = 28;
  const nodeAnglesDeg = [0, 60, 120, 180, 240, 300];
  const nodes = nodeAnglesDeg.map((deg) => {
    const a = (deg - 90) * (Math.PI / 180);
    return { x: cx + Math.cos(a) * orbitR, y: cy + Math.sin(a) * orbitR };
  });
  const cardinals = [0, 90, 180, 270].map((deg) => {
    const a = deg * (Math.PI / 180);
    return { x: cx + Math.cos(a) * 13, y: cy + Math.sin(a) * 13 };
  });
  return (
    <svg viewBox="0 0 120 110" width="100%" aria-hidden="true">
      <defs>
        <radialGradient id="th-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={orbitR} fill="none" stroke="#4fc3f7" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.45" />
      {nodes.map((n, i) => (
        <g key={`tn${i}`}>
          <circle cx={n.x} cy={n.y} r="3" fill="none" stroke="#4fc3f7" strokeWidth="0.7" opacity="0.8" />
          <circle cx={n.x} cy={n.y} r="1.2" fill="#7dd3fc" opacity="0.9" />
        </g>
      ))}
      {nodes.map((n, i) => (
        <line key={`tl${i}`} x1={cx} y1={cy} x2={n.x} y2={n.y} stroke="#4fc3f7" strokeWidth="0.4" opacity="0.25" />
      ))}
      <circle cx={cx} cy={cy} r="13" fill="none" stroke="#4fc3f7" strokeWidth="0.8" opacity="0.4" />
      {cardinals.map((c, i) => (
        <g key={`tc${i}`} transform={`translate(${c.x},${c.y}) rotate(45)`}>
          <rect x="-1.5" y="-1.5" width="3" height="3" fill="#4fc3f7" opacity="0.5" />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="10" fill="url(#th-glow)" />
      <circle cx={cx} cy={cy} r="4" fill="#4fc3f7" opacity="0.7" />
      <circle cx={cx} cy={cy} r="1.5" fill="#e0f7fa" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Flat SVG icon components (minimal line design)
// ─────────────────────────────────────────────────────────────────

const iconInlineStyle: CSSProperties = { display: 'inline', verticalAlign: 'middle' };

function InsightIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <path d="M7 1a4 4 0 0 1 2 7.46V10H5V8.46A4 4 0 0 1 7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 11h4M5.5 12.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <path d="M5.5 8.5l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 9.5 3 10.5a2 2 0 0 0 2.8 2.8l1.5-1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 4.5l1-1a2 2 0 0 0-2.8-2.8L6.7 2.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <path d="M7 2.5 1.5 12h11L7 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 6v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="10.5" r="0.7" fill="currentColor" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <path d="M9.5 1.5a3 3 0 0 0-2 4.8L3 10.8a1.4 1.4 0 0 0 2 2l4.5-4.5A3 3 0 0 0 13.5 4l-1.7 1.5L10 4l1.5-2.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <path d="M1 10l3.5-3.5 2.5 2 5-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3h4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function ChartBarIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true" style={iconInlineStyle}>
      <path d="M1 12h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="2" y="6" width="2.5" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="5.75" y="3" width="2.5" height="9" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="9.5" y="8" width="2.5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

// Larger icons for segment/capability cards
function ChipIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <rect x="3.5" y="3.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6 7.5h1.5M8.5 7.5H10M6 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M6 1v2.5M10 1v2.5M6 12.5V15M10 12.5V15M1 6h2.5M12.5 6H15M1 10h2.5M12.5 10H15" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <rect x="4" y="1" width="8" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.5 12h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CarIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <path d="M2 9 3.8 5h8.4L14 9v3H2V9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <circle cx="5" cy="12.5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="11" cy="12.5" r="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 5l-1 4M10 5l1 4" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1.5C6.5 3.5 5.5 5.5 5.5 8s1 4.5 2.5 6.5M8 1.5c1.5 2 2.5 4 2.5 6.5s-1 4.5-2.5 6.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M1.5 8h13M2.5 5h11M2.5 11h11" stroke="currentColor" strokeWidth="1" opacity="0.65" />
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <path d="M13 8A5 5 0 0 1 5 12.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 8a5 5 0 0 1 8-3.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14.5 6 13 8l-2-1.5M1.5 10 3 8l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <circle cx="8" cy="9.5" r="1.8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5 12A4 4 0 0 1 5 7M11 12A4 4 0 0 0 11 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.5 14A7 7 0 0 1 2.5 5M13.5 14A7 7 0 0 0 13.5 5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <path d="M1.5 5v8h13V5H8L6 3H1.5V5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 8.5h6M5 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <path d="M10.5 1.5 5 8.5h5.5L5.5 14.5l9-8H9l1.5-5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
      <path d="M3 4h10l2 4-7 6-7-6 2-4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M1 8h14" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────
// Individual page components (6 pages)
// ─────────────────────────────────────────────────────────────────

function Page1Cover() {
  const sections = [
    { num: '一', title: '宏觀經濟與地緣政治' },
    { num: '二', title: '半導體產業鏈' },
    { num: '三', title: '細分市場應用' },
    { num: '四', title: '競爭情報' },
    { num: '五', title: '新技術與研發趨勢' },
    { num: '六', title: '客戶與供應商動態' },
  ];
  return (
    <div className="emp-page-wrap emp-page-wrap--cover">
      <div className="emp-cover-brand">
        <div className="emp-cover-eyebrow">MIC PICKS · 情報電子報</div>
        <div className="emp-cover-meta">
          <span className="emp-cover-vol">Vol. 1</span>
          <span className="emp-cover-dot">·</span>
          <span className="emp-cover-issue">2025 年第一季</span>
        </div>
      </div>
      <div className="emp-cover-illus-wrap">
        <CoverIllustration />
      </div>
      <div className="emp-cover-body">
        <h1 className="emp-cover-title">半導體產業<br />深度洞察</h1>
        <div className="emp-cover-divider" />
        <p className="emp-cover-tagline">
          整合全球宏觀數據、產業鏈動態與競爭情報，<br />
          賦能T Company的每一個戰略決策。
        </p>
        <div className="emp-cover-toc">
          <div className="emp-cover-toc-label">本期內容</div>
          <div className="emp-cover-toc-grid">
            {sections.map((s) => (
              <div key={s.num} className="emp-cover-toc-item">
                <span className="emp-cover-toc-num">{s.num}</span>
                <span className="emp-cover-toc-text">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="emp-page-footer">
        <span>第 1 頁，共 6 頁</span>
        <span>MIC Intelligence · 2025 Q1</span>
      </div>
    </div>
  );
}

function Page2Macro() {
  const risks = [
    { tag: '高風險', text: '中美晶片出口管制持續升級，影響先進製程設備採購', level: 'high' },
    { tag: '中風險', text: '俄烏衝突導致氖氣等稀有材料供應鏈受阻', level: 'mid' },
    { tag: '關注', text: '印太經濟框架（IPEF）對台灣半導體出口的潛在影響', level: 'low' },
  ];
  const rates = [
    { bank: '美聯準會', rate: '5.25–5.50%', trend: '↓ 降息週期', color: '#4fc3f7' },
    { bank: '歐洲央行', rate: '4.50%', trend: '↓ 逐步降息', color: '#81c784' },
    { bank: '日本央行', rate: '0.10%', trend: '↑ 緩步升息', color: '#ffd54f' },
  ];
  return (
    <div className="emp-page-wrap">
      <div className="emp-page-header emp-page-header--blue">
        <span className="emp-page-section-num">一</span>
        <span className="emp-page-section-title">宏觀經濟與地緣政治資訊</span>
      </div>
      <div className="emp-page-content emp-page-content--two-col">
        <div className="emp-col">
          <div className="emp-subsection-title">GDP 增長預測</div>
          <GdpBarChart />
          <div className="emp-insight-box emp-insight-box--blue">
            <span className="emp-insight-label"><InsightIcon /> 洞察</span>
            <span>
              印度6.5%高速增長預示半導體需求新動能；中國4.6%放緩需關注訂單結構調整。
            </span>
          </div>
          <div className="emp-subsection-title emp-subsection-title--mt">主要央行利率政策</div>
          <div className="emp-rate-table">
            {rates.map((r) => (
              <div key={r.bank} className="emp-rate-row">
                <span className="emp-rate-dot" style={{ background: r.color }} />
                <span className="emp-rate-bank">{r.bank}</span>
                <span className="emp-rate-value">{r.rate}</span>
                <span className="emp-rate-trend">{r.trend}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="emp-col">
          <div className="emp-subsection-title">地緣政治風險預警</div>
          <div className="emp-risk-list">
            {risks.map((r, i) => (
              <div key={i} className={`emp-risk-item emp-risk-item--${r.level}`}>
                <span className="emp-risk-tag">{r.tag}</span>
                <span className="emp-risk-text">{r.text}</span>
              </div>
            ))}
          </div>
          <div className="emp-subsection-title emp-subsection-title--mt">政策解讀摘要</div>
          <div className="emp-policy-list">
            <div className="emp-policy-item">
              <span className="emp-policy-flag emp-policy-flag--text">US</span>
              <div>
                <div className="emp-policy-name">《晶片與科學法》補貼計畫</div>
                <div className="emp-policy-desc">提供 527 億美元補貼，T Company亞利桑那廠已獲批 66 億美元直接資金。</div>
              </div>
            </div>
            <div className="emp-policy-item">
              <span className="emp-policy-flag emp-policy-flag--text">EU</span>
              <div>
                <div className="emp-policy-name">歐洲晶片法案</div>
                <div className="emp-policy-desc">目標2030年達全球20%市占率，德國、法國積極招商建廠。</div>
              </div>
            </div>
            <div className="emp-policy-item">
              <span className="emp-policy-flag emp-policy-flag--text">JP</span>
              <div>
                <div className="emp-policy-name">日本半導體振興計畫</div>
                <div className="emp-policy-desc">補助T Company熊本廠建設，目標恢復日本先進晶圓製造能力。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="emp-page-footer">
        <span>第 2 頁，共 6 頁 · 宏觀經濟與地緣政治</span>
        <span>MIC Intelligence · 2025 Q1</span>
      </div>
    </div>
  );
}

// Maps milestone status text to the corresponding CSS modifier class.
const MILESTONE_STATUS_CLASS: Record<string, string> = {
  量產: 'emp-milestone-status--ok',
  供貨: 'emp-milestone-status--ok',
  研發: 'emp-milestone-status--pending',
  試產: 'emp-milestone-status--pending',
};

// Maps supplier risk level (Chinese) to the corresponding CSS modifier suffix.
const SUPPLIER_RISK_CLASS: Record<string, string> = { 高: 'high', 中: 'mid', 低: 'low' };

function Page3SupplyChain() {
  const milestones = [
    { company: 'T Company', node: '2nm (N2)', status: '量產', date: 'H2 2025' },
    { company: 'T Company', node: '1.4nm (A14)', status: '研發', date: '2027' },
    { company: '三星', node: '2nm SF2', status: '研發', date: '2025' },
    { company: '英特爾', node: '18A', status: '試產', date: '2025' },
    { company: 'ASML', node: 'High-NA EUV', status: '供貨', date: '2024' },
  ];
  return (
    <div className="emp-page-wrap">
      <div className="emp-page-header emp-page-header--amber">
        <span className="emp-page-section-num">二</span>
        <span className="emp-page-section-title">半導體產業鏈資訊</span>
      </div>
      <div className="emp-page-content emp-page-content--two-col">
        <div className="emp-col">
          <div className="emp-subsection-title">產業鏈全覽</div>
          <IndustryChainDiagram />
          <div className="emp-insight-box emp-insight-box--amber">
            <span className="emp-insight-label"><LinkIcon /> 關鍵節點</span>
            <span>ASML High-NA EUV 設備交付進度是 2nm 以下製程的核心制約因素。</span>
          </div>
          <div className="emp-subsection-title emp-subsection-title--mt">晶圓廠產能利用率</div>
          <FabUtilizationChart />
        </div>
        <div className="emp-col">
          <div className="emp-subsection-title">製程里程碑追蹤</div>
          <div className="emp-milestone-table">
            <div className="emp-milestone-header">
              <span>公司</span>
              <span>製程節點</span>
              <span>狀態</span>
              <span>時程</span>
            </div>
            {milestones.map((m, i) => (
              <div key={i} className="emp-milestone-row">
                <span className="emp-milestone-company">{m.company}</span>
                <span className="emp-milestone-node">{m.node}</span>
                <span className={`emp-milestone-status ${MILESTONE_STATUS_CLASS[m.status] ?? 'emp-milestone-status--pending'}`}>
                  {m.status}
                </span>
                <span className="emp-milestone-date">{m.date}</span>
              </div>
            ))}
          </div>
          <div className="emp-subsection-title emp-subsection-title--mt">供應鏈風險分析</div>
          <div className="emp-supply-risk">
            <div className="emp-supply-risk-item">
              <span className="emp-supply-risk-icon"><WarningIcon /></span>
              <div>
                <div className="emp-supply-risk-title">HBM 封裝產能緊張</div>
                <div className="emp-supply-risk-desc">AI 伺服器需求爆發，SK Hynix / Micron HBM3E 供不應求，影響 CoWoS 先進封裝排程。</div>
              </div>
            </div>
            <div className="emp-supply-risk-item">
              <span className="emp-supply-risk-icon"><WrenchIcon /></span>
              <div>
                <div className="emp-supply-risk-title">特殊氣體供應預警</div>
                <div className="emp-supply-risk-desc">氙氣、氖氣等稀有氣體依賴烏克蘭產源，需建立六個月以上的戰略庫存。</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="emp-page-footer">
        <span>第 3 頁，共 6 頁 · 半導體產業鏈</span>
        <span>MIC Intelligence · 2025 Q1</span>
      </div>
    </div>
  );
}

function Page4Markets() {
  const segments: { iconNode: ReactNode; name: string; color: string; bg: string; points: string[] }[] = [
    {
      iconNode: <ChipIcon />,
      name: 'AI / HPC',
      color: '#4fc3f7',
      bg: '#e0f2fe',
      points: ['輝達 H200/B200 需求超過供給 3–4 倍', 'CoWoS 封裝成為T Company主要增長引擎', 'AMD MI300 系列搶攻資料中心市占'],
    },
    {
      iconNode: <PhoneIcon />,
      name: '智能手機',
      color: '#4ade80',
      bg: '#dcfce7',
      points: ['2024 年全球出貨量 12.4 億支，年增 6%', 'Apple A18 Pro 採 3nm N3E 製程', '高通 Snapdragon 8 Gen4 切入 3nm'],
    },
    {
      iconNode: <CarIcon />,
      name: '汽車電子',
      color: '#fbbf24',
      bg: '#fef9c3',
      points: ['車用晶片市場 2028 年達 1,060 億美元', '自動駕駛 SoC 轉向 7nm 及以下製程', 'AEC-Q100 車規認證週期縮短為重要競爭力'],
    },
    {
      iconNode: <GlobeIcon />,
      name: 'IoT / 消費電子',
      color: '#a78bfa',
      bg: '#f3e8ff',
      points: ['工業 IoT 帶動成熟製程（28nm/40nm）需求回升', '遊戲機換機週期帶動 6nm 製程填產能', '智慧家居 SoC 需求量持續增長'],
    },
  ];
  return (
    <div className="emp-page-wrap">
      <div className="emp-page-header emp-page-header--green">
        <span className="emp-page-section-num">三</span>
        <span className="emp-page-section-title">細分市場應用資訊</span>
      </div>
      <div className="emp-page-content">
        <div className="emp-market-chart-row">
          <div className="emp-market-chart-wrap">
            <MarketSizeChart />
          </div>
          <div className="emp-insight-box emp-insight-box--green emp-insight-box--compact">
            <span className="emp-insight-label"><ChartBarIcon /> 需求驅動力</span>
            <span>AI/HPC 年增 42% 成為T Company最強成長引擎，汽車電子 31% 增速緊隨其後，兩者合計佔先進製程新增需求的 65%。</span>
          </div>
        </div>
        <div className="emp-segment-grid">
          {segments.map((s) => (
            <div key={s.name} className="emp-segment-card" style={{ borderTopColor: s.color }}>
              <div className="emp-segment-card-header">
                <span className="emp-segment-icon">{s.iconNode}</span>
                <span className="emp-segment-name" style={{ color: s.color }}>
                  {s.name}
                </span>
              </div>
              <ul className="emp-segment-points">
                {s.points.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="emp-page-footer">
        <span>第 4 頁，共 6 頁 · 細分市場應用</span>
        <span>MIC Intelligence · 2025 Q1</span>
      </div>
    </div>
  );
}

function Page5Competitive() {
  const competitors = [
    {
      name: 'T Company',
      revenue: '$693B',
      capex: '$32B',
      node: '3nm/2nm',
      share: '61%',
      color: '#4fc3f7',
    },
    {
      name: 'Samsung',
      revenue: '$224B',
      capex: '$28B',
      node: '4nm/3nm',
      share: '13%',
      color: '#fbbf24',
    },
    {
      name: 'Intel Foundry',
      revenue: '$18B',
      capex: '$20B',
      node: '18A/3nm',
      share: '2%',
      color: '#f87171',
    },
    {
      name: 'GlobalFoundries',
      revenue: '$7.4B',
      capex: '$1B',
      node: '12nm/22nm',
      share: '6%',
      color: '#a78bfa',
    },
  ];
  const newTech = [
    {
      name: 'GAAFET (GAA)',
      maturity: 70,
      horizon: '量產中',
      color: '#4fc3f7',
      desc: '全繞閘場效電晶體，T Company N2 採用，提升效能/功耗比 15%',
    },
    {
      name: 'Chiplet / 異質整合',
      maturity: 85,
      horizon: '主流化',
      color: '#4ade80',
      desc: 'CoWoS、SoIC-X 封裝技術，AI 加速器標配架構',
    },
    {
      name: '背面供電 (BSPDN)',
      maturity: 45,
      horizon: '2026–2027',
      color: '#fbbf24',
      desc: 'A14/N14 製程導入，可提升電路密度 20% 以上',
    },
    {
      name: '量子計算',
      maturity: 15,
      horizon: '2030+',
      color: '#a78bfa',
      desc: '目前處於實驗室階段，與矽基 CMOS 融合路徑仍不明朗',
    },
  ];
  return (
    <div className="emp-page-wrap">
      <div className="emp-page-header emp-page-header--red">
        <span className="emp-page-section-num">四 / 五</span>
        <span className="emp-page-section-title">競爭情報 · 新技術與研發趨勢</span>
      </div>
      <div className="emp-page-content emp-page-content--two-col">
        <div className="emp-col">
          <div className="emp-subsection-title">主要競爭對手多維度對比</div>
          <div className="emp-competitor-table">
            <div className="emp-competitor-header">
              <span>公司</span>
              <span>年營收</span>
              <span>資本支出</span>
              <span>最先進節點</span>
              <span>代工市占</span>
            </div>
            {competitors.map((c) => (
              <div key={c.name} className="emp-competitor-row">
                <span className="emp-competitor-name" style={{ color: c.color }}>
                  {c.name}
                </span>
                <span>{c.revenue}</span>
                <span>{c.capex}</span>
                <span className="emp-competitor-node">{c.node}</span>
                <span className="emp-competitor-share">{c.share}</span>
              </div>
            ))}
          </div>
          <div className="emp-insight-box emp-insight-box--red emp-insight-box--compact">
            <span className="emp-insight-label"><TargetIcon /> 戰略洞察</span>
            <span>T Company市占 61% 持續擴大，三星良率問題導致客戶回流，英特爾代工業務虧損壓力仍大。</span>
          </div>
          <div className="emp-subsection-title emp-subsection-title--mt">製程技術路線圖</div>
          <ProcessRoadmap />
        </div>
        <div className="emp-col">
          <div className="emp-subsection-title">新技術成熟度評估</div>
          <div className="emp-tech-list">
            {newTech.map((t) => (
              <div key={t.name} className="emp-tech-item">
                <div className="emp-tech-item-top">
                  <span className="emp-tech-name">{t.name}</span>
                  <span className="emp-tech-horizon" style={{ color: t.color }}>
                    {t.horizon}
                  </span>
                </div>
                <div className="emp-tech-bar-wrap">
                  <div
                    className="emp-tech-bar"
                    style={{ width: `${t.maturity}%`, background: t.color }}
                  />
                </div>
                <div className="emp-tech-desc">{t.desc}</div>
              </div>
            ))}
          </div>
          <div className="emp-insight-box emp-insight-box--purple emp-insight-box--compact">
            <span className="emp-insight-label"><EyeIcon /> 前瞻視野</span>
            <span>GAAFET 與 Chiplet 已是產業主流；背面供電技術將成為 2nm 以下製程的關鍵差異化因素。</span>
          </div>
        </div>
      </div>
      <div className="emp-page-footer">
        <span>第 5 頁，共 6 頁 · 競爭情報與新技術趨勢</span>
        <span>MIC Intelligence · 2025 Q1</span>
      </div>
    </div>
  );
}

function Page6CustomerSupplier() {
  const suppliers = [
    { name: 'ASML', type: '設備', status: '關鍵', risk: '高', color: '#f87171', desc: 'High-NA EUV 唯一供應商，交付週期長達 18 個月' },
    { name: 'Applied Materials', type: '設備', status: '穩定', risk: '中', color: '#fbbf24', desc: 'ALD/CVD 設備擴產，與T Company共同研發次世代製程' },
    { name: 'Shin-Etsu', type: '材料', status: '穩定', risk: '低', color: '#4ade80', desc: '光阻劑與矽晶圓全球市占第一，穩定供貨協議到2028年' },
  ];
  return (
    <div className="emp-page-wrap">
      <div className="emp-page-header emp-page-header--orange">
        <span className="emp-page-section-num">六</span>
        <span className="emp-page-section-title">客戶與供應商動態 · MIC 整理能力總結</span>
      </div>
      <div className="emp-page-content emp-page-content--two-col">
        <div className="emp-col">
          <div className="emp-subsection-title">主要客戶季度營收動態</div>
          <CustomerRevenueChart />
          <div className="emp-insight-box emp-insight-box--orange emp-insight-box--compact">
            <span className="emp-insight-label"><TrendingUpIcon /> 訂單展望</span>
            <span>Apple Q4 業績超預期，iPhone 16 周期強勁；NVIDIA H200 產能全數由T Company CoWoS 供應。</span>
          </div>
          <div className="emp-subsection-title emp-subsection-title--mt">關鍵供應商動態</div>
          <div className="emp-supplier-list">
            {suppliers.map((s) => (
              <div key={s.name} className="emp-supplier-item">
                <div className="emp-supplier-top">
                  <span className="emp-supplier-name" style={{ color: s.color }}>
                    {s.name}
                  </span>
                  <span className="emp-supplier-type">{s.type}</span>
                  <span className={`emp-supplier-risk emp-supplier-risk--${SUPPLIER_RISK_CLASS[s.risk] ?? 'low'}`}>
                    風險 {s.risk}
                  </span>
                </div>
                <div className="emp-supplier-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="emp-col">
          <div className="emp-subsection-title">從數據到洞察：MIC 整理流程</div>
          <DataInsightFlow />
          <div className="emp-subsection-title emp-subsection-title--mt">MIC 資訊整理能力總結</div>
          <div className="emp-capability-grid">
            {(() => {
              const capabilities: { iconNode: ReactNode; title: string; desc: string }[] = [
                { iconNode: <SyncIcon />, title: '跨領域整合', desc: '將經濟、政策、技術、市場四維數據交叉分析，形成完整情境判斷。' },
                { iconNode: <SignalIcon />, title: '動態即時追蹤', desc: '持續監控 200+ 資訊源，重大事件 24 小時內完成預警更新。' },
                { iconNode: <FolderIcon />, title: '系統性分類', desc: '六大資訊類型、三十個子類別，支援快速檢索與交叉分析。' },
                { iconNode: <BoltIcon />, title: '預警機制', desc: '設定閾值觸發器，自動識別供應鏈斷鏈風險與市場異動訊號。' },
                { iconNode: <DiamondIcon />, title: '決策賦能', desc: '每份報告附帶「決策建議」區塊，直接對應T Company戰略場景。' },
                { iconNode: <ChartBarIcon />, title: '可視化呈現', desc: '複雜數據轉化為圖表與儀表板，降低閱讀門檻，提升洞察效率。' },
              ];
              return capabilities.map((c) => (
                <div key={c.title} className="emp-capability-item">
                  <span className="emp-capability-icon">{c.iconNode}</span>
                  <div>
                    <div className="emp-capability-title">{c.title}</div>
                    <div className="emp-capability-desc">{c.desc}</div>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
      <div className="emp-page-footer">
        <span>第 6 頁，共 6 頁 · 客戶供應商動態</span>
        <span>MIC Intelligence · 2025 Q1</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Page renderer
// ─────────────────────────────────────────────────────────────────

const TOTAL_PAGES = 6;

function renderPage(idx: number) {
  switch (idx) {
    case 0:
      return <Page1Cover />;
    case 1:
      return <Page2Macro />;
    case 2:
      return <Page3SupplyChain />;
    case 3:
      return <Page4Markets />;
    case 4:
      return <Page5Competitive />;
    case 5:
      return <Page6CustomerSupplier />;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────
// Bookshelf data & types
// ─────────────────────────────────────────────────────────────────

interface MicIssue {
  id: string;
  vol: number;
  title: string;
  year: number;
  quarter: string;
  category: string;
  coverGradient: string;
  accentColor: string;
  pages: number;
  publishedLabel: string;
  available: boolean;
}

const MIC_ISSUES: MicIssue[] = [
  {
    id: 'vol-1-2025-q1',
    vol: 1,
    title: '半導體產業深度洞察',
    year: 2025,
    quarter: 'Q1',
    category: 'Semiconductor',
    coverGradient: 'linear-gradient(145deg, #0369a1 0%, #0ea5e9 60%, #38bdf8 100%)',
    accentColor: '#0369a1',
    pages: 6,
    publishedLabel: 'March 2025',
    available: true,
  },
  {
    id: 'vol-2-2025-q2',
    vol: 2,
    title: 'AI 晶片競合格局',
    year: 2025,
    quarter: 'Q2',
    category: 'Semiconductor',
    coverGradient: 'linear-gradient(145deg, #6d28d9 0%, #a78bfa 60%, #c4b5fd 100%)',
    accentColor: '#6d28d9',
    pages: 6,
    publishedLabel: 'June 2025',
    available: false,
  },
  {
    id: 'vol-3-2025-q3',
    vol: 3,
    title: '次世代科技趨勢',
    year: 2025,
    quarter: 'Q3',
    category: 'Tech Trends',
    coverGradient: 'linear-gradient(145deg, #15803d 0%, #22c55e 60%, #86efac 100%)',
    accentColor: '#15803d',
    pages: 6,
    publishedLabel: 'September 2025',
    available: false,
  },
  {
    id: 'vol-4-2024-q4',
    vol: 4,
    title: '總體經濟與科技投資',
    year: 2024,
    quarter: 'Q4',
    category: 'Macroeconomics',
    coverGradient: 'linear-gradient(145deg, #b45309 0%, #f59e0b 60%, #fcd34d 100%)',
    accentColor: '#b45309',
    pages: 6,
    publishedLabel: 'December 2024',
    available: false,
  },
  {
    id: 'vol-5-2024-q3',
    vol: 5,
    title: '先進封裝技術革命',
    year: 2024,
    quarter: 'Q3',
    category: 'Semiconductor',
    coverGradient: 'linear-gradient(145deg, #b91c1c 0%, #f87171 60%, #fca5a5 100%)',
    accentColor: '#b91c1c',
    pages: 6,
    publishedLabel: 'September 2024',
    available: false,
  },
  {
    id: 'vol-6-2024-q2',
    vol: 6,
    title: '開源生態系與企業軟體',
    year: 2024,
    quarter: 'Q2',
    category: 'Tech Trends',
    coverGradient: 'linear-gradient(145deg, #c2410c 0%, #fb923c 60%, #fdba74 100%)',
    accentColor: '#c2410c',
    pages: 6,
    publishedLabel: 'June 2024',
    available: false,
  },
];

// ─────────────────────────────────────────────────────────────────
// Shelf sidebar — left menu tree (by category & year/quarter)
// ─────────────────────────────────────────────────────────────────

interface MicShelfSidebarProps {
  activeCategory: string | null;
  activeYear: number | null;
  activeQuarter: string | null;
  onSelectAll: () => void;
  onSelectCategory: (cat: string) => void;
  onSelectYear: (year: number) => void;
  onSelectQuarter: (year: number, quarter: string) => void;
}

function MicShelfSidebar({
  activeCategory,
  activeYear,
  activeQuarter,
  onSelectAll,
  onSelectCategory,
  onSelectYear,
  onSelectQuarter,
}: MicShelfSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const categories = [...new Set(MIC_ISSUES.map((i) => i.category))];
  const years = [...new Set(MIC_ISSUES.map((i) => i.year))].sort((a, b) => b - a);
  const isAllActive = !activeCategory && !activeYear && !activeQuarter;

  // Label shown in the mobile toggle button
  const activeSummary =
    activeCategory ??
    (activeYear
      ? `${activeYear}${activeQuarter ? ` ${activeQuarter}` : ''}`
      : 'All Newsletters');

  const handleSelectAll = useCallback(() => {
    onSelectAll();
    setIsMobileOpen(false);
  }, [onSelectAll]);

  const handleSelectCategory = useCallback(
    (cat: string) => {
      onSelectCategory(cat);
      setIsMobileOpen(false);
    },
    [onSelectCategory],
  );

  const handleSelectYear = useCallback(
    (year: number) => {
      onSelectYear(year);
      setIsMobileOpen(false);
    },
    [onSelectYear],
  );

  const handleSelectQuarter = useCallback(
    (year: number, quarter: string) => {
      onSelectQuarter(year, quarter);
      setIsMobileOpen(false);
    },
    [onSelectQuarter],
  );

  return (
    <div className="emp-shelf-sidebar">
      {/* Mobile-only toggle row — hidden on desktop via CSS */}
      <button
        className="emp-shelf-mobile-toggle"
        onClick={() => setIsMobileOpen((o) => !o)}
        aria-expanded={isMobileOpen}
        aria-controls="emp-shelf-tree"
      >
        <span className="emp-shelf-mobile-toggle-label">
          <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
            <path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="emp-shelf-mobile-toggle-text">{activeSummary}</span>
          {!isAllActive && <span className="emp-shelf-mobile-active-dot" aria-hidden="true" />}
        </span>
        <svg
          className={`emp-shelf-mobile-chevron${isMobileOpen ? ' open' : ''}`}
          viewBox="0 0 14 14"
          fill="none"
          width="14"
          height="14"
          aria-hidden="true"
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Desktop header — hidden on mobile via CSS */}
      <div className="emp-shelf-sidebar-header">Newsletter Library</div>

      <nav
        id="emp-shelf-tree"
        className={`emp-shelf-tree${isMobileOpen ? ' mobile-open' : ''}`}
        aria-label="Newsletter categories"
      >
        {/* All */}
        <div className="emp-shelf-tree-group">
          <button
            className={`emp-shelf-tree-node${isAllActive ? ' active' : ''}`}
            onClick={handleSelectAll}
          >
            <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
              <path d="M2 3h10M2 7h10M2 11h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            All Newsletters
            <span className="emp-shelf-tree-count">{MIC_ISSUES.length}</span>
          </button>
        </div>

        {/* By category */}
        <div className="emp-shelf-tree-section-label">By Category</div>
        <div className="emp-shelf-tree-group">
          {categories.map((cat) => {
            const count = MIC_ISSUES.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                className={`emp-shelf-tree-node emp-shelf-tree-node--indent${activeCategory === cat ? ' active' : ''}`}
                onClick={() => handleSelectCategory(cat)}
              >
                {cat}
                <span className="emp-shelf-tree-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* By year/quarter */}
        <div className="emp-shelf-tree-section-label">By Year</div>
        {years.map((year) => {
          const quarters = [
            ...new Set(MIC_ISSUES.filter((i) => i.year === year).map((i) => i.quarter)),
          ].sort();
          return (
            <div key={year} className="emp-shelf-tree-year-group">
              <button
                className={`emp-shelf-tree-node${activeYear === year && !activeQuarter ? ' active' : ''}`}
                onClick={() => handleSelectYear(year)}
              >
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
                  <rect x="2" y="2" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 1v3M9 1v3M2 6h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {year}
                <span className="emp-shelf-tree-count">
                  {MIC_ISSUES.filter((i) => i.year === year).length}
                </span>
              </button>
              <div className="emp-shelf-tree-quarter-group">
                {quarters.map((q) => {
                  const count = MIC_ISSUES.filter((i) => i.year === year && i.quarter === q).length;
                  return (
                    <button
                      key={q}
                      className={`emp-shelf-tree-node emp-shelf-tree-node--quarter${activeYear === year && activeQuarter === q ? ' active' : ''}`}
                      onClick={() => handleSelectQuarter(year, q)}
                    >
                      {q}
                      <span className="emp-shelf-tree-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Shelf card — Apple Books-style 3D book cover
// ─────────────────────────────────────────────────────────────────

interface MicShelfCardProps {
  issue: MicIssue;
  onOpen: (id: string) => void;
}

function MicShelfCard({ issue, onOpen }: MicShelfCardProps) {
  const handleClick = useCallback(() => {
    if (issue.available) onOpen(issue.id);
  }, [issue, onOpen]);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      if (issue.available && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        onOpen(issue.id);
      }
    },
    [issue, onOpen],
  );

  return (
    <div
      className={`emp-shelf-card${issue.available ? '' : ' emp-shelf-card--unavailable'}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={issue.available ? 'button' : undefined}
      tabIndex={issue.available ? 0 : undefined}
      aria-label={issue.available ? `Open ${issue.title}` : `${issue.title} — Coming Soon`}
    >
      <div className="emp-shelf-card-book">
        <div className="emp-shelf-card-spine" style={{ background: issue.accentColor }} />
        <div className="emp-shelf-card-cover" style={{ background: issue.coverGradient }}>
          <div className="emp-shelf-card-cover-eyebrow">MIC PICKS</div>
          {issue.available ? (
            <div className="emp-shelf-card-cover-illus">
              <CoverIllustrationThumb />
            </div>
          ) : (
            <div className="emp-shelf-card-cover-category">{issue.category}</div>
          )}
          <div className="emp-shelf-card-cover-title">{issue.title}</div>
          <div className="emp-shelf-card-cover-vol">
            Vol. {issue.vol} · {issue.year} {issue.quarter}
          </div>
          {!issue.available && <div className="emp-shelf-card-coming-soon">Coming Soon</div>}
        </div>
      </div>
      <div className="emp-shelf-card-info">
        <div className="emp-shelf-card-info-title">{issue.title}</div>
        <div className="emp-shelf-card-info-meta">
          {issue.publishedLabel} · {issue.category}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Bookshelf overview — grid + search + sidebar
// ─────────────────────────────────────────────────────────────────

interface MicShelfProps {
  onOpen: (id: string) => void;
}

function MicShelf({ onOpen }: MicShelfProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<number | null>(null);
  const [activeQuarter, setActiveQuarter] = useState<string | null>(null);

  const handleSelectAll = useCallback(() => {
    setActiveCategory(null);
    setActiveYear(null);
    setActiveQuarter(null);
  }, []);

  const handleSelectCategory = useCallback((cat: string) => {
    setActiveCategory(cat);
    setActiveYear(null);
    setActiveQuarter(null);
  }, []);

  const handleSelectYear = useCallback((year: number) => {
    setActiveYear(year);
    setActiveCategory(null);
    setActiveQuarter(null);
  }, []);

  const handleSelectQuarter = useCallback((year: number, quarter: string) => {
    setActiveYear(year);
    setActiveQuarter(quarter);
    setActiveCategory(null);
  }, []);

  const filtered = MIC_ISSUES.filter((issue) => {
    if (activeCategory && issue.category !== activeCategory) return false;
    if (activeYear && issue.year !== activeYear) return false;
    if (activeQuarter && issue.quarter !== activeQuarter) return false;
    if (query) {
      const q = query.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q) ||
        issue.publishedLabel.includes(q) ||
        `vol. ${issue.vol}`.includes(q) ||
        String(issue.year).includes(q)
      );
    }
    return true;
  });

  return (
    <div className="emp-shelf-layout">
      <MicShelfSidebar
        activeCategory={activeCategory}
        activeYear={activeYear}
        activeQuarter={activeQuarter}
        onSelectAll={handleSelectAll}
        onSelectCategory={handleSelectCategory}
        onSelectYear={handleSelectYear}
        onSelectQuarter={handleSelectQuarter}
      />
      <div className="emp-shelf-main">
        <div className="emp-shelf-header">
          <h2 className="emp-shelf-title">
            <svg viewBox="0 0 16 16" fill="none" width="18" height="18" aria-hidden="true">
              <path d="M3 2h7l3 3v9H3V2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              <path d="M6 7h5M6 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            MIC PICKS Library
          </h2>
          <div className="emp-shelf-search-wrap">
            <svg
              viewBox="0 0 14 14"
              fill="none"
              width="13"
              height="13"
              className="emp-shelf-search-icon"
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              className="emp-shelf-search-input"
              type="search"
              placeholder="Search newsletters..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search newsletters"
            />
          </div>
        </div>
        <div className="emp-shelf-grid">
          {filtered.length === 0 ? (
            <div className="emp-shelf-empty">No newsletters found</div>
          ) : (
            filtered.map((issue) => <MicShelfCard key={issue.id} issue={issue} onOpen={onOpen} />)
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Magazine reader — wraps the 6-page reader with a back-to-shelf button
// ─────────────────────────────────────────────────────────────────

interface MicReaderProps {
  issue: MicIssue;
  onBack: () => void;
}

function MicReader({ issue, onBack }: MicReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [animState, setAnimState] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const totalPages = issue.pages;

  const goTo = useCallback(
    (target: number) => {
      if (target < 0 || target >= totalPages || animState !== 'idle') return;
      setDirection(target > currentPage ? 'next' : 'prev');
      setAnimState('exit');
      setTimeout(() => {
        setCurrentPage(target);
        setAnimState('enter');
        setTimeout(() => setAnimState('idle'), 30); // brief tick to let React flush the enter-class before clearing
      }, 350);
    },
    [currentPage, animState, totalPages],
  );

  const handleNext = useCallback(() => goTo(currentPage + 1), [currentPage, goTo]);
  const handlePrev = useCallback(() => goTo(currentPage - 1), [currentPage, goTo]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev]);

  const pageClass = [
    'emp-page',
    animState === 'exit' && direction === 'next' ? 'emp-page--exit-left' : '',
    animState === 'exit' && direction === 'prev' ? 'emp-page--exit-right' : '',
    animState === 'enter' && direction === 'next' ? 'emp-page--enter-right' : '',
    animState === 'enter' && direction === 'prev' ? 'emp-page--enter-left' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="emp-reader-outer">
      {/* Toolbar */}
      <div className="emp-reader-toolbar">
        <button className="emp-reader-back-btn" onClick={onBack} aria-label="Back to library">
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
            <path
              d="M9 2L4 7l5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Library
        </button>
        <span className="emp-reader-brand">
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
            <path
              d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          MIC PICKS Intelligence Newsletter
        </span>
        <span className="emp-reader-vol">
          Vol. {issue.vol} · {issue.year} {issue.quarter}
        </span>
        <span className="emp-reader-pagenum">
          {currentPage + 1} / {totalPages}
        </span>
      </div>

      {/* Stage */}
      <div className="emp-reader-stage">
        <button
          className="emp-nav-btn emp-nav-btn--prev"
          onClick={handlePrev}
          disabled={currentPage === 0 || animState !== 'idle'}
          aria-label="上一頁"
        >
          ‹
        </button>

        <div
          className="emp-magazine"
          aria-live="polite"
          aria-label={`第 ${currentPage + 1} 頁，共 ${totalPages} 頁`}
        >
          <div className={pageClass}>{renderPage(currentPage)}</div>
        </div>

        <button
          className="emp-nav-btn emp-nav-btn--next"
          onClick={handleNext}
          disabled={currentPage === totalPages - 1 || animState !== 'idle'}
          aria-label="下一頁"
        >
          ›
        </button>
      </div>

      {/* Footer: dots + hint */}
      <div className="emp-reader-footer">
        <div className="emp-dots" role="tablist" aria-label="頁面導覽">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === currentPage}
              aria-label={`跳至第 ${i + 1} 頁`}
              className={`emp-dot${i === currentPage ? ' emp-dot--active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

export default function ExploreMicPicksContent() {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const selectedIssue = selectedIssueId
    ? (MIC_ISSUES.find((i) => i.id === selectedIssueId) ?? null)
    : null;

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            {selectedIssue ? (
              <MicReader issue={selectedIssue} onBack={() => setSelectedIssueId(null)} />
            ) : (
              <MicShelf onOpen={setSelectedIssueId} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
