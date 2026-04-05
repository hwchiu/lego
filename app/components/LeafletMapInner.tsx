'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import type { FabLocation } from '@/app/data/tsmcFabs';

// Fix Leaflet's default marker icon URLs broken by webpack asset hashing
// (happens with Next.js / Webpack; must be done before any map renders)
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Custom numbered marker icon ─────────────────────────────────────────────

function createFabIcon(count: number, isActive: boolean) {
  const bg = isActive ? '#1d4ed8' : '#2563eb';
  const shadow = isActive ? 'rgba(29,78,216,0.45)' : 'rgba(37,99,235,0.3)';
  const size = count > 9 ? 36 : 32;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:${count > 9 ? 11 : 12}px;font-weight:800;color:#fff;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      box-shadow:0 2px 8px ${shadow};
      cursor:pointer;transition:transform 0.15s;
      ${isActive ? 'transform:scale(1.18);' : ''}
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
}

// Minimal interface for Leaflet.MarkerCluster (not exported by @types/leaflet)
interface MarkerCluster {
  getChildCount: () => number;
}

// ─── Map click handler — deselects on map background click ──────────────────

function MapClickHandler({ onDeselect }: { onDeselect: () => void }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', onDeselect);
    return () => {
      map.off('click', onDeselect);
    };
  }, [map, onDeselect]);
  return null;
}

// ─── LeafletMapInner ──────────────────────────────────────────────────────────

interface LeafletMapInnerProps {
  locations: FabLocation[];
  activeLocationId: string | null;
  onSelectLocation: (id: string | null) => void;
}

export default function LeafletMapInner({
  locations,
  activeLocationId,
  onSelectLocation,
}: LeafletMapInnerProps) {
  // Flatten all sub-locations into individual map markers
  // Each city gets its own marker at its lat/lon; clicking opens the country panel
  const markers = locations.flatMap((loc) =>
    loc.subLocations.map((sub) => ({
      locationId: loc.id,
      city: sub.city,
      lat: sub.lat,
      lon: sub.lon,
      fabCount: sub.fabs.length,
      country: loc.country,
    })),
  );

  return (
    <MapContainer
      center={[30, 20]}
      zoom={2}
      style={{ height: '420px', width: '100%', borderRadius: '10px' }}
      scrollWheelZoom={false}
      className="de-leaflet-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onDeselect={() => onSelectLocation(null)} />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        iconCreateFunction={(cluster: MarkerCluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            className: '',
            html: `<div style="
              width:40px;height:40px;border-radius:50%;
              background:#1d4ed8;border:3px solid #fff;
              display:flex;align-items:center;justify-content:center;
              font-size:13px;font-weight:800;color:#fff;
              font-family:-apple-system,sans-serif;
              box-shadow:0 2px 10px rgba(29,78,216,0.45);
            ">${count}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
        }}
      >
        {markers.map((m) => {
          const isActive = activeLocationId === m.locationId;
          const icon = createFabIcon(m.fabCount, isActive);
          return (
            <Marker
              key={`${m.locationId}-${m.city}`}
              position={[m.lat, m.lon]}
              icon={icon}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent?.stopPropagation();
                  onSelectLocation(isActive ? null : m.locationId);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -16]} opacity={0.92}>
                <strong>{m.country}</strong>
                <br />
                {m.city}
                <br />
                {m.fabCount} fab{m.fabCount !== 1 ? 's' : ''}
              </Tooltip>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

