'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TSMC_FAB_LOCATIONS, FabLocation } from '@/app/data/tsmcFabs';

// ─── Icons ───────────────────────────────────────────────────────────────────

function MapPinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="12" height="12" aria-hidden="true">
      <path
        d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="8" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ─── Detail panel (fab info drawer) ──────────────────────────────────────────

interface MapPanelProps {
  location: FabLocation;
  onClose: () => void;
}

function MapPanel({ location, onClose }: MapPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const allFabCount = location.subLocations.reduce((sum, sl) => sum + sl.fabs.length, 0);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="de-map-panel-overlay">
      <div
        className="de-map-panel"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${location.country} fab details`}
      >
        <div className="de-map-panel-header">
          <div className="de-map-panel-title-row">
            <span className="de-map-panel-pin-icon">
              <MapPinIcon />
            </span>
            <div>
              <div className="de-map-panel-country">{location.country}</div>
              <div className="de-map-panel-subtitle">
                {allFabCount} fab{allFabCount !== 1 ? 's' : ''} &middot;{' '}
                {location.subLocations.length} location{location.subLocations.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <button className="de-map-panel-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="de-map-panel-body">
          {location.subLocations.map((sub) => (
            <div key={sub.city} className="de-map-city-group">
              <div className="de-map-city-label">{sub.city}</div>
              <div className="de-map-fab-stack">
                {sub.fabs.map((fab) => (
                  <div key={fab.id} className="de-map-fab-card">
                    <div className="de-map-fab-card-name">{fab.name}</div>
                    <div className="de-map-fab-card-meta">
                      <div className="de-map-fab-card-row">
                        <span className="de-map-fab-card-label">Node</span>
                        <span className="de-map-fab-card-value">{fab.node}</span>
                      </div>
                      <div className="de-map-fab-card-row">
                        <span className="de-map-fab-card-label">Established</span>
                        <span className="de-map-fab-card-value">{fab.established}</span>
                      </div>
                    </div>
                    <p className="de-map-fab-card-desc">{fab.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Leaflet map — loaded dynamically to avoid SSR issues ────────────────────

const LeafletMap = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="de-leaflet-loading">
      <div className="de-leaflet-loading-text">Loading map…</div>
    </div>
  ),
});

// ─── Main WorldMapTab component ───────────────────────────────────────────────

export default function WorldMapTab() {
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const activeLocation = TSMC_FAB_LOCATIONS.find((l) => l.id === activeLocationId) ?? null;
  const totalFabs = TSMC_FAB_LOCATIONS.reduce((s, l) => s + l.totalFabs, 0);

  const handleSelectLocation = useCallback((id: string | null) => {
    setActiveLocationId(id);
  }, []);

  return (
    <div className="de-world-map-wrap">
      <div className="de-world-map-header">
        <div className="de-world-map-title">TSMC Global Manufacturing Presence</div>
        <div className="de-world-map-sub">
          Click a pin to explore fab details by country and city.&nbsp;
          <strong>{totalFabs}</strong> fabs across{' '}
          <strong>{TSMC_FAB_LOCATIONS.length}</strong> countries&nbsp;/ regions.
        </div>
      </div>

      {/* Leaflet map */}
      <div className="de-leaflet-container">
        <LeafletMap
          locations={TSMC_FAB_LOCATIONS}
          activeLocationId={activeLocationId}
          onSelectLocation={handleSelectLocation}
        />
      </div>

      {/* Country chips */}
      <div className="de-map-country-chips">
        {TSMC_FAB_LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            className={`de-map-country-chip${activeLocationId === loc.id ? ' active' : ''}`}
            onClick={() => setActiveLocationId(activeLocationId === loc.id ? null : loc.id)}
          >
            <MapPinIcon />
            {loc.country}
            <span className="de-map-country-chip-count">{loc.totalFabs}</span>
          </button>
        ))}
      </div>

      {activeLocation && (
        <MapPanel location={activeLocation} onClose={() => setActiveLocationId(null)} />
      )}
    </div>
  );
}
