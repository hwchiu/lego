'use client';

import { useRef, useState, useCallback } from 'react';

interface GeoPin {
  country: string;
  code: string;
  lat: number;
  lng: number;
  count: number;
}

// Major countries with approximate centroids and mock news counts
const GEO_PINS: GeoPin[] = [
  { country: '美國', code: 'US', lat: 39.5, lng: -98.35, count: 8 },
  { country: '中國', code: 'CN', lat: 35.86, lng: 104.19, count: 12 },
  { country: '日本', code: 'JP', lat: 36.2, lng: 138.25, count: 7 },
  { country: '台灣', code: 'TW', lat: 23.97, lng: 120.97, count: 9 },
  { country: '韓國', code: 'KR', lat: 35.91, lng: 127.77, count: 5 },
  { country: '德國', code: 'DE', lat: 51.17, lng: 10.45, count: 4 },
  { country: '英國', code: 'GB', lat: 55.38, lng: -3.44, count: 3 },
  { country: '印度', code: 'IN', lat: 20.59, lng: 78.96, count: 6 },
  { country: '以色列', code: 'IL', lat: 31.05, lng: 34.85, count: 2 },
  { country: '澳洲', code: 'AU', lat: -25.27, lng: 133.78, count: 2 },
];

// Map dimensions (SVG viewBox)
const MAP_W = 800;
const MAP_H = 400;

// Convert geographic coordinates to SVG coordinates (equirectangular projection)
function lngLatToXY(lng: number, lat: number): [number, number] {
  const x = ((lng + 180) / 360) * MAP_W;
  const y = ((90 - lat) / 180) * MAP_H;
  return [x, y];
}

// Simplified world land mass outlines (approximate polygons for continents)
const LAND_PATHS = [
  // North America
  'M 82,100 L 95,85 L 118,78 L 140,75 L 160,82 L 175,90 L 185,105 L 190,118 L 178,130 L 165,138 L 155,150 L 148,162 L 140,175 L 128,182 L 118,185 L 105,178 L 98,165 L 88,150 L 80,138 L 78,120 Z',
  // South America
  'M 135,200 L 148,195 L 162,198 L 170,210 L 168,228 L 160,248 L 150,265 L 140,278 L 130,282 L 120,270 L 118,252 L 122,235 L 128,218 Z',
  // Europe
  'M 350,78 L 370,72 L 390,74 L 405,80 L 410,90 L 405,100 L 395,108 L 375,110 L 360,105 L 348,96 Z',
  // Africa
  'M 355,120 L 380,115 L 405,118 L 420,132 L 425,155 L 420,180 L 408,200 L 390,212 L 370,215 L 352,205 L 340,185 L 338,162 L 342,140 Z',
  // Asia (simplified combined shape)
  'M 415,68 L 460,60 L 520,58 L 575,62 L 620,70 L 650,80 L 660,95 L 640,108 L 610,115 L 575,118 L 540,125 L 510,130 L 478,132 L 450,125 L 425,118 L 412,105 L 410,88 Z',
  // Southeast Asia
  'M 565,132 L 590,130 L 600,140 L 595,155 L 578,158 L 562,148 L 560,138 Z',
  // Australia
  'M 598,252 L 635,242 L 665,248 L 680,265 L 672,285 L 648,295 L 620,292 L 600,280 L 592,265 Z',
  // Japan (simplified)
  'M 638,98 L 648,94 L 655,98 L 650,108 L 640,110 L 634,104 Z',
];

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export default function NewsGeoMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const dragStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.85 : 1.18;
    setTransform((prev) => {
      const newScale = Math.min(4, Math.max(0.5, prev.scale * delta));
      // Zoom toward cursor position
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return prev;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const newX = cx - (cx - prev.x) * (newScale / prev.scale);
      const newY = cy - (cy - prev.y) * (newScale / prev.scale);
      return { x: newX, y: newY, scale: newScale };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    dragStart.current = { x: e.clientX, y: e.clientY, tx: transform.x, ty: transform.y };
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setTransform((prev) => ({
      ...prev,
      x: dragStart.current!.tx + dx,
      y: dragStart.current!.ty + dy,
    }));
  }, []);

  const handleMouseUp = useCallback(() => {
    dragStart.current = null;
  }, []);

  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
    <div className="insight-block insight-block--map">
      <div className="insight-block-title">
        <span className="insight-block-icon">🌏</span>
        地緣新聞分布
        <button className="geo-map-reset-btn" onClick={resetView} title="重置視角">
          ⟳
        </button>
      </div>
      <div className="geo-map-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="geo-map-svg"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: dragStart.current ? 'grabbing' : 'grab' }}
        >
          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
            {/* Ocean background */}
            <rect x="0" y="0" width={MAP_W} height={MAP_H} fill="#dce8f0" />

            {/* Land masses */}
            {LAND_PATHS.map((d, i) => (
              <path key={i} d={d} fill="#c8d8c0" stroke="#b0c4a8" strokeWidth="0.8" />
            ))}

            {/* Grid lines */}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const [, y] = lngLatToXY(0, lat);
              return (
                <line
                  key={`lat${lat}`}
                  x1={0}
                  y1={y}
                  x2={MAP_W}
                  y2={y}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
              );
            })}
            {[-150, -90, -30, 30, 90, 150].map((lng) => {
              const [x] = lngLatToXY(lng, 0);
              return (
                <line
                  key={`lng${lng}`}
                  x1={x}
                  y1={0}
                  x2={x}
                  y2={MAP_H}
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Pin markers */}
            {GEO_PINS.map((pin) => {
              const [px, py] = lngLatToXY(pin.lng, pin.lat);
              const pinH = 28;
              const pinW = 20;
              const badgeR = 10;
              return (
                <g key={pin.code} className="geo-pin-group">
                  {/* Tooltip background */}
                  <title>{pin.country}: {pin.count} 則新聞</title>
                  {/* Pin body — teardrop shape */}
                  <path
                    d={`M ${px} ${py}
                        C ${px} ${py - pinH * 0.4}, ${px - pinW / 2} ${py - pinH * 0.55}, ${px - pinW / 2} ${py - pinH * 0.72}
                        A ${pinW / 2} ${pinW / 2} 0 1 1 ${px + pinW / 2} ${py - pinH * 0.72}
                        C ${px + pinW / 2} ${py - pinH * 0.55}, ${px} ${py - pinH * 0.4}, ${px} ${py} Z`}
                    fill="#e53e3e"
                    stroke="#c53030"
                    strokeWidth="1"
                    opacity="0.92"
                  />
                  {/* White circle inside pin */}
                  <circle
                    cx={px}
                    cy={py - pinH * 0.72}
                    r={badgeR * 0.55}
                    fill="white"
                    opacity="0.9"
                  />
                  {/* Count badge below pin */}
                  <rect
                    x={px - badgeR * 1.5}
                    y={py - pinH - badgeR * 0.3}
                    width={badgeR * 3}
                    height={badgeR * 1.6}
                    rx={badgeR * 0.4}
                    fill="#1a2332"
                    opacity="0.88"
                  />
                  <text
                    x={px}
                    y={py - pinH + badgeR * 0.9}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="7.5"
                    fontWeight="700"
                    fontFamily="-apple-system, sans-serif"
                  >
                    {pin.count}
                  </text>
                  {/* Country label */}
                  <text
                    x={px}
                    y={py + 9}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="6.5"
                    fontWeight="600"
                    fontFamily="-apple-system, sans-serif"
                  >
                    {pin.country}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <div className="geo-map-hint">滾輪縮放 · 拖曳平移</div>
      </div>
    </div>
  );
}
