'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import rawContent from '@/content/geo-pins.md';
import { extractJson } from '@/app/lib/parseContent';

interface GeoPin {
  country: string;
  code: string;
  lat: number;
  lng: number;
  count: number;
}

const GEO_PINS: GeoPin[] = extractJson<GeoPin[]>(rawContent);

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
