'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TSMC_FAB_LOCATIONS } from '@/app/data/tsmcFabs';
import { getTaxNewsByCountry, type TaxNewsItem } from '@/app/data/taxNews';

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

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="11" height="11" aria-hidden="true">
      <path
        d="M6 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h8A1.5 1.5 0 0012 11.5V8M8 1h5v5M13 1L6.5 7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Tax news panel — shown when a country pin is clicked ────────────────────

const TAX_ACCENT = '#2563eb';

interface TaxNewsPanelProps {
  countryId: string;
  countryName: string;
  onClose: () => void;
}

function TaxNewsPanel({ countryId, countryName, onClose }: TaxNewsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const newsItems: TaxNewsItem[] = getTaxNewsByCountry(countryId);

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
        className="de-map-panel de-map-panel--tax"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${countryName} tax news`}
      >
        <div className="de-map-panel-header">
          <div className="de-map-panel-title-row">
            <span className="de-map-panel-pin-icon">
              <MapPinIcon />
            </span>
            <div>
              <div className="de-map-panel-country">{countryName}</div>
              <div className="de-map-panel-subtitle">國際稅務新聞整理 · {newsItems.length} 則</div>
            </div>
          </div>
          <button className="de-map-panel-close" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="de-map-panel-body">
          {newsItems.length === 0 ? (
            <div className="de-map-tax-empty">目前尚無此國家的稅務新聞資料</div>
          ) : (
            newsItems.map((item) => (
              <article key={item.id} className="de-map-tax-card">
                <div className="de-map-tax-card-header">
                  <span className="de-map-tax-card-category" style={{ background: `${TAX_ACCENT}14`, color: TAX_ACCENT }}>
                    {item.category}
                  </span>
                  <span className="de-map-tax-card-date">{item.date}</span>
                </div>
                <div className="de-map-tax-card-title">
                  {item.url && item.url !== '#' ? (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="de-map-tax-card-link">
                      {item.title}
                      <span className="de-map-tax-card-ext"><ExternalLinkIcon /></span>
                    </a>
                  ) : (
                    item.title
                  )}
                </div>
                <p className="de-map-tax-card-summary">{item.summary}</p>
                <div className="de-map-tax-card-source">來源：{item.source}</div>
                <div className="de-map-tax-card-tags">
                  {item.tags.map((tag) => (
                    <span key={tag} className="de-map-tax-card-tag">{tag}</span>
                  ))}
                </div>
              </article>
            ))
          )}
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
        <div className="de-world-map-title">國際稅務新聞整理（以台積電廠區國家為維度）</div>
        <div className="de-world-map-sub">
          點選地圖上的 Pin 或下方國家按鈕，查看各國最新稅務新聞整理。涵蓋台積電廠區所在的{' '}
          <strong>{TSMC_FAB_LOCATIONS.length}</strong> 個國家／地區，共計{' '}
          <strong>{totalFabs}</strong> 座廠房所在地。
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
        <TaxNewsPanel
          countryId={activeLocation.id}
          countryName={activeLocation.country}
          onClose={() => setActiveLocationId(null)}
        />
      )}
    </div>
  );
}
