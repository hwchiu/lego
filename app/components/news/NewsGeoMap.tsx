'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';

interface GeoPin {
  country: string;
  code: string;
  lat: number;
  lng: number;
  count: number;
}

// 10 major countries with approximate centroids and mock news counts
const GEO_PINS: GeoPin[] = [
  { country: 'US', code: 'US', lat: 39.5, lng: -98.35, count: 8 },
  { country: 'China', code: 'CN', lat: 35.86, lng: 104.19, count: 12 },
  { country: 'Japan', code: 'JP', lat: 36.2, lng: 138.25, count: 7 },
  { country: 'Taiwan', code: 'TW', lat: 23.97, lng: 120.97, count: 9 },
  { country: 'S. Korea', code: 'KR', lat: 35.91, lng: 127.77, count: 5 },
  { country: 'Germany', code: 'DE', lat: 51.17, lng: 10.45, count: 4 },
  { country: 'UK', code: 'GB', lat: 55.38, lng: -3.44, count: 3 },
  { country: 'India', code: 'IN', lat: 20.59, lng: 78.96, count: 6 },
  { country: 'Israel', code: 'IL', lat: 31.05, lng: 34.85, count: 2 },
  { country: 'Australia', code: 'AU', lat: -25.27, lng: 133.78, count: 2 },
];

// World TopoJSON from public CDN
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const INITIAL_POSITION: { coordinates: [number, number]; zoom: number } = {
  coordinates: [0, 0],
  zoom: 1,
};

export default function NewsGeoMap() {
  const [position, setPosition] = useState(INITIAL_POSITION);

  const handleMoveEnd = (pos: { coordinates: [number, number]; zoom: number }) => {
    setPosition(pos);
  };

  const resetView = () => setPosition(INITIAL_POSITION);

  return (
    <div className="insight-block insight-block--map">
      <div className="insight-block-title">
        Geo News Distribution
        <button className="geo-map-reset-btn" onClick={resetView} title="Reset View">
          ⟳
        </button>
      </div>
      <div className="geo-map-wrap">
        <ComposableMap
          projectionConfig={{ scale: 147, center: [0, 0] }}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#c8d8c0"
                    stroke="#b0c4a8"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { fill: '#b8ccb0', outline: 'none' },
                      pressed: { outline: 'none' },
                    }}
                  />
                ))
              }
            </Geographies>
            {GEO_PINS.map((pin) => (
              <Marker key={pin.code} coordinates={[pin.lng, pin.lat]}>
                <title>
                  {pin.country}: {pin.count} news
                </title>
                {/* Teardrop pin body */}
                <path
                  d="M 0 0 C 0 -5, -5 -7, -5 -12 A 5 5 0 1 1 5 -12 C 5 -7, 0 -5, 0 0 Z"
                  fill="#e53e3e"
                  stroke="#c53030"
                  strokeWidth={0.5}
                  opacity={0.92}
                />
                {/* Count inside pin */}
                <text
                  y={-11}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={4}
                  fontWeight="700"
                  fontFamily="-apple-system, sans-serif"
                >
                  {pin.count}
                </text>
                {/* Country label below pin */}
                <text
                  y={4}
                  textAnchor="middle"
                  fill="#1a2332"
                  fontSize={3.5}
                  fontWeight="600"
                  fontFamily="-apple-system, sans-serif"
                >
                  {pin.country}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}
