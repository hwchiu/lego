'use client';

import { useState } from 'react';
import { INTERNATIONAL_TAX_NEWS, type TaxNewsItem } from '@/app/data/taxNews';

// ─── Icons ───────────────────────────────────────────────────────────────────

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

// ─── Country list ─────────────────────────────────────────────────────────────

const TAX_ACCENT = '#2563eb';

const COUNTRIES: { id: string; label: string }[] = [
  { id: 'taiwan', label: 'Taiwan' },
  { id: 'usa', label: 'United States' },
  { id: 'japan', label: 'Japan' },
  { id: 'germany', label: 'Germany' },
  { id: 'china', label: 'China' },
];

// ─── Intl Tax News Card ───────────────────────────────────────────────────────

interface IntlTaxNewsCardProps {
  item: TaxNewsItem;
}

function IntlTaxNewsCard({ item }: IntlTaxNewsCardProps) {
  const hasLink = item.url && item.url !== '#';
  return (
    <article className="de-tax-card">
      <div className="de-tax-card-header">
        <span className="de-tax-card-category" style={{ background: `${TAX_ACCENT}14`, color: TAX_ACCENT }}>
          {item.category}
        </span>
        <span className="de-tax-card-meta">
          <span className="de-tax-card-week">{item.week}</span>
          <span className="de-tax-card-date">{item.date}</span>
        </span>
      </div>
      <div className="de-tax-card-title">
        {hasLink ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="de-tax-card-link">
            {item.title}
            <span className="de-tax-card-ext">
              <ExternalLinkIcon />
            </span>
          </a>
        ) : (
          item.title
        )}
      </div>
      <p className="de-tax-card-summary">{item.summary}</p>
      <div className="de-tax-card-footer">
        <span className="de-tax-card-source">Source: {item.source}</span>
        <div className="de-tax-card-tags">
          {item.tags.map((tag) => (
            <span key={tag} className="de-tag" style={{ background: `${TAX_ACCENT}12`, color: TAX_ACCENT }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

// ─── Main WorldMapTab component ───────────────────────────────────────────────

export default function WorldMapTab() {
  const [activeCountry, setActiveCountry] = useState(COUNTRIES[0].id);
  const items: TaxNewsItem[] = INTERNATIONAL_TAX_NEWS[activeCountry] ?? [];
  const totalItems = Object.values(INTERNATIONAL_TAX_NEWS).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="de-world-map-wrap">
      <div className="de-world-map-header">
        <div className="de-world-map-title">Weekly International Tax News Summary</div>
        <div className="de-world-map-sub">
          International tax news organized by country — covering the latest tax legislation,
          regulations, and compliance updates across <strong>{COUNTRIES.length}</strong> countries /
          regions, with a total of <strong>{totalItems}</strong> news items.
        </div>
      </div>

      <div className="de-intl-tax-layout">
        {/* Left: country sidebar */}
        <nav className="de-intl-tax-sidebar" aria-label="Country list">
          <div className="de-intl-tax-sidebar-title">Countries</div>
          {COUNTRIES.map((country) => (
            <button
              key={country.id}
              className={`de-intl-tax-sidebar-item${activeCountry === country.id ? ' active' : ''}`}
              style={activeCountry === country.id ? { borderLeftColor: TAX_ACCENT, color: TAX_ACCENT } : {}}
              onClick={() => setActiveCountry(country.id)}
            >
              <span className="de-intl-tax-sidebar-item-name">{country.label}</span>
              <span className="de-intl-tax-sidebar-item-count">
                {INTERNATIONAL_TAX_NEWS[country.id]?.length ?? 0}
              </span>
            </button>
          ))}
        </nav>

        {/* Right: news card grid */}
        <div className="de-intl-tax-content">
          {items.length === 0 ? (
            <div className="de-intl-tax-empty">No tax news available for this country.</div>
          ) : (
            <div className="de-intl-tax-grid">
              {items.map((item) => (
                <IntlTaxNewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
