'use client';

import { useState, useMemo } from 'react';
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

// ─── Constants ────────────────────────────────────────────────────────────────

const TAX_ACCENT = '#2563eb';

const COUNTRY_LABELS: Record<string, string> = {
  taiwan: 'Taiwan',
  usa: 'United States',
  japan: 'Japan',
  germany: 'Germany',
  china: 'China',
};

// ─── Intl Tax News Card ───────────────────────────────────────────────────────

interface IntlTaxNewsCardProps {
  item: TaxNewsItem;
  countryId: string;
}

function IntlTaxNewsCard({ item, countryId }: IntlTaxNewsCardProps) {
  const hasLink = item.url && item.url !== '#';
  return (
    <article className="de-tax-card">
      <div className="de-tax-card-header">
        <span className="de-tax-card-category" style={{ background: `${TAX_ACCENT}14`, color: TAX_ACCENT }}>
          {item.category}
        </span>
        <span className="de-tax-card-meta">
          <span className="de-tax-card-country">{COUNTRY_LABELS[countryId] ?? countryId}</span>
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
  // Build flat list of all items with country info
  const allItemsWithCountry = useMemo(() => {
    const result: { item: TaxNewsItem; countryId: string }[] = [];
    for (const [countryId, items] of Object.entries(INTERNATIONAL_TAX_NEWS)) {
      for (const item of items) {
        result.push({ item, countryId });
      }
    }
    return result;
  }, []);

  // Extract unique weeks sorted descending (newest first)
  const weeks = useMemo(() => {
    const set = new Set<string>();
    allItemsWithCountry.forEach(({ item }) => set.add(item.week));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [allItemsWithCountry]);

  const [activeWeek, setActiveWeek] = useState(() => weeks[0] ?? '');

  // Items for selected week, from all countries
  const filteredItems = useMemo(
    () => allItemsWithCountry.filter(({ item }) => item.week === activeWeek),
    [allItemsWithCountry, activeWeek],
  );

  const totalItems = allItemsWithCountry.length;
  const countryCount = Object.keys(INTERNATIONAL_TAX_NEWS).length;

  return (
    <div className="de-world-map-wrap">
      <div className="de-world-map-header">
        <div className="de-world-map-title">Weekly International Tax News Summary</div>
        <div className="de-world-map-sub">
          International tax news organized by week — covering the latest tax legislation,
          regulations, and compliance updates across <strong>{countryCount}</strong> countries /
          regions, with a total of <strong>{totalItems}</strong> news items.
        </div>
      </div>

      <div className="de-intl-tax-layout">
        {/* Left: week sidebar */}
        <nav className="de-intl-tax-sidebar" aria-label="Week list">
          <div className="de-intl-tax-sidebar-title">週別 (Week)</div>
          {weeks.map((week) => {
            const count = allItemsWithCountry.filter(({ item }) => item.week === week).length;
            return (
              <button
                key={week}
                className={`de-intl-tax-sidebar-item${activeWeek === week ? ' active' : ''}`}
                style={activeWeek === week ? { borderLeftColor: TAX_ACCENT, color: TAX_ACCENT } : {}}
                onClick={() => setActiveWeek(week)}
              >
                <span className="de-intl-tax-sidebar-item-name">{week}</span>
                <span className="de-intl-tax-sidebar-item-count">{count}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: news card grid */}
        <div className="de-intl-tax-content">
          {filteredItems.length === 0 ? (
            <div className="de-intl-tax-empty">No tax news available for this week.</div>
          ) : (
            <div className="de-intl-tax-grid">
              {filteredItems.map(({ item, countryId }) => (
                <IntlTaxNewsCard key={item.id} item={item} countryId={countryId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
