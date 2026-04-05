'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { CATEGORIES_MAP, DataItem } from '@/app/data/dataExplore';
import { ESG_REPORTS } from '@/app/data/esgReports';
import { TSMC_FAB_LOCATIONS, FabLocation } from '@/app/data/tsmcFabs';

const TAGS_VISIBLE_COUNT = 6;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function toSvgXY(lat: number, lon: number): [number, number] {
  const x = (lon + 180) * (1000 / 360);
  const y = (90 - lat) * (500 / 180);
  return [x, y];
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
      <path d="M6 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h8A1.5 1.5 0 0012 11.5V8M8 1h5v5M13 1L6.5 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

function MapPinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="12" height="12" aria-hidden="true">
      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}

interface TagsBarProps {
  allTags: string[];
  activeTag: string | null;
  color: string;
  onSelectTag: (tag: string | null) => void;
}

function TagsBar({ allTags, activeTag, color, onSelectTag }: TagsBarProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleTags = expanded ? allTags : allTags.slice(0, TAGS_VISIBLE_COUNT);
  const hiddenCount = allTags.length - TAGS_VISIBLE_COUNT;
  const hasMore = hiddenCount > 0;

  return (
    <div className="de-tags-bar de-tags-bar--row">
      <button
        className={`de-tag-filter-btn${activeTag === null ? ' active' : ''}`}
        style={activeTag === null ? { background: color, color: '#fff', borderColor: color } : {}}
        onClick={() => onSelectTag(null)}
      >
        All
      </button>
      {visibleTags.map((tag) => (
        <button
          key={tag}
          className={`de-tag-filter-btn${activeTag === tag ? ' active' : ''}`}
          style={activeTag === tag ? { background: color, color: '#fff', borderColor: color } : {}}
          onClick={() => onSelectTag(activeTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
      {hasMore && !expanded && (
        <button
          className="de-tag-filter-btn de-tag-more-btn"
          onClick={() => setExpanded(true)}
          title={`Show ${hiddenCount} more tags`}
        >
          +{hiddenCount} more
        </button>
      )}
      {hasMore && expanded && (
        <button className="de-tag-filter-btn de-tag-more-btn" onClick={() => setExpanded(false)}>
          &minus; less
        </button>
      )}
    </div>
  );
}

interface DataItemCardProps {
  item: DataItem;
  accentColor: string;
}

function DataItemCard({ item, accentColor }: DataItemCardProps) {
  const hasLink = item.url && item.url !== '#';
  return (
    <article className="de-item-card">
      <div className="de-item-card-header">
        <span className="de-item-card-date">{formatDate(item.date)}</span>
        <span className="de-item-card-source">{item.source}</span>
      </div>
      <div className="de-item-card-title">
        {hasLink ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="de-item-card-title-link">
            {item.title}
            <span className="de-item-card-ext-icon"><ExternalLinkIcon /></span>
          </a>
        ) : (
          <span>{item.title}</span>
        )}
      </div>
      <p className="de-item-card-summary">{item.summary}</p>
      <div className="de-item-card-tags">
        {item.tags.map((tag) => (
          <span key={tag} className="de-tag" style={{ background: `${accentColor}12`, color: accentColor }}>
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

interface ArticlesTabProps {
  items: DataItem[];
  accentColor: string;
  allTags: string[];
  searchQuery: string;
  activeTag: string | null;
  onSearchChange: (q: string) => void;
  onTagSelect: (tag: string | null) => void;
  totalCount: number;
}

function ArticlesTab({ items, accentColor, allTags, searchQuery, activeTag, onSearchChange, onTagSelect, totalCount }: ArticlesTabProps) {
  return (
    <>
      <div className="de-filter-bar">
        <div className="de-filter-search-wrap">
          <span className="de-filter-search-icon"><SearchIcon /></span>
          <input
            className="de-filter-search"
            type="search"
            placeholder="Search within this category..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search data"
          />
        </div>
        {items.length !== totalCount && (
          <span className="de-filter-count">Showing {items.length} / {totalCount} records</span>
        )}
      </div>
      <TagsBar allTags={allTags} activeTag={activeTag} color={accentColor} onSelectTag={onTagSelect} />
      <section className="de-section">
        {items.length === 0 ? (
          <div className="de-empty">No results match the current filters</div>
        ) : (
          <div className="de-items-list">
            {items.map((item) => (
              <DataItemCard key={item.id} item={item} accentColor={accentColor} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

const TSMC_COLOR = '#16a34a';
const APPLE_COLOR = '#1d4ed8';

function EsgReportsTab() {
  const tsmcReports = useMemo(
    () => ESG_REPORTS.filter((r) => r.company === 'TSMC').sort((a, b) => b.year - a.year),
    [],
  );
  const appleReports = useMemo(
    () => ESG_REPORTS.filter((r) => r.company === 'Apple').sort((a, b) => b.year - a.year),
    [],
  );

  function ReportSection({ reports, company, color, sectionTitle, subTitle }: {
    reports: typeof tsmcReports;
    company: string;
    color: string;
    sectionTitle: string;
    subTitle: string;
  }) {
    return (
      <div className="de-esg-reports-section">
        <div className="de-esg-reports-section-header">
          <span className="de-esg-reports-company-badge" style={{ background: `${color}18`, color }}>
            {company}
          </span>
          <div className="de-esg-reports-section-titles">
            <span className="de-esg-reports-section-title">{sectionTitle}</span>
            <span className="de-esg-reports-section-sub">{subTitle}</span>
          </div>
        </div>
        <div className="de-esg-reports-grid">
          {reports.map((report) => (
            <article key={`${company}-${report.year}`} className="de-esg-report-card">
              <div className="de-esg-report-card-top">
                <div className="de-esg-report-card-year" style={{ color }}>{report.year}</div>
                <div className="de-esg-report-card-fiscal">{report.fiscalYear}</div>
              </div>
              <div className="de-esg-report-card-title">{report.title}</div>
              <p className="de-esg-report-card-desc">{report.description}</p>
              <div className="de-esg-report-card-actions">
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="de-esg-report-download-btn"
                  style={{ background: color }}
                  aria-label={`Download ${report.title}`}
                >
                  <DownloadIcon />
                  Download PDF
                </a>
                <a
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="de-esg-report-view-btn"
                  style={{ color, borderColor: `${color}45` }}
                  aria-label={`View ${report.title}`}
                >
                  <ExternalLinkIcon />
                  View
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="de-esg-reports">
      <ReportSection
        reports={tsmcReports}
        company="TSMC"
        color={TSMC_COLOR}
        sectionTitle="Sustainability Reports"
        subTitle="Taiwan Semiconductor Manufacturing Company"
      />
      <ReportSection
        reports={appleReports}
        company="Apple"
        color={APPLE_COLOR}
        sectionTitle="Environmental Progress Reports"
        subTitle="Apple Inc."
      />
    </div>
  );
}

const MAP_PIN_COLOR = '#2563eb';

interface MapPanelProps {
  location: FabLocation;
  onClose: () => void;
}

function MapPanel({ location, onClose }: MapPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const allFabCount = location.subLocations.reduce((sum, sl) => sum + sl.fabs.length, 0);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
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
      <div className="de-map-panel" ref={panelRef} role="dialog" aria-modal="true" aria-label={`${location.country} fab details`}>
        <div className="de-map-panel-header">
          <div className="de-map-panel-title-row">
            <span className="de-map-panel-pin-icon"><MapPinIcon /></span>
            <div>
              <div className="de-map-panel-country">{location.country}</div>
              <div className="de-map-panel-subtitle">
                {allFabCount} fab{allFabCount !== 1 ? 's' : ''} &middot; {location.subLocations.length} location{location.subLocations.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          <button className="de-map-panel-close" onClick={onClose} aria-label="Close"><CloseIcon /></button>
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

function WorldMapTab() {
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null);
  const activeLocation = useMemo(
    () => TSMC_FAB_LOCATIONS.find((l) => l.id === activeLocationId) ?? null,
    [activeLocationId],
  );
  const totalFabs = TSMC_FAB_LOCATIONS.reduce((s, l) => s + l.totalFabs, 0);

  return (
    <div className="de-world-map-wrap">
      <div className="de-world-map-header">
        <div className="de-world-map-title">TSMC Global Manufacturing Presence</div>
        <div className="de-world-map-sub">
          Click a pin to explore fab details by country and city.&nbsp;
          <strong>{totalFabs}</strong> fabs across <strong>{TSMC_FAB_LOCATIONS.length}</strong> countries&nbsp;/ regions.
        </div>
      </div>

      <div className="de-world-map-container">
        <svg viewBox="0 0 1000 500" className="de-world-svg" role="img" aria-label="TSMC global manufacturing locations world map">
          <rect width="1000" height="500" fill="#dbeafe" />
          <g className="de-map-land" fill="#c8d9e6" stroke="#a8bfcc" strokeWidth="0.6">
            <path d="M148,40 L165,33 L182,35 L190,43 L187,55 L178,66 L162,68 L150,62 L145,52 Z" />
            <path d="M408,50 L422,45 L438,47 L444,55 L437,64 L422,67 L408,60 Z" />
            <path d="M58,85 L78,62 L108,60 L148,62 L195,68 L234,72 L255,88 L272,98 L290,112 L295,132 L292,155 L288,172 L290,200 L278,220 L262,240 L248,244 L236,235 L224,220 L212,218 L198,210 L182,194 L172,182 L162,178 L155,165 L142,160 L128,152 L110,140 L88,128 L72,112 Z" />
            <path d="M248,244 L262,240 L270,248 L265,258 L255,262 L246,256 Z" />
            <path d="M238,183 L256,180 L264,186 L257,192 L240,190 Z" />
            <path d="M222,240 L256,242 L272,255 L278,272 L278,298 L272,326 L264,350 L256,375 L248,396 L238,403 L225,400 L215,390 L206,376 L200,355 L197,332 L196,308 L200,285 L208,268 L218,252 Z" />
            <path d="M450,83 L463,77 L470,83 L466,92 L456,93 Z" />
            <path d="M507,54 L528,44 L548,47 L558,58 L556,72 L548,79 L540,74 L534,65 L524,58 Z" />
            <path d="M448,60 L477,55 L509,54 L540,58 L563,65 L576,74 L579,87 L573,97 L564,105 L553,112 L542,116 L530,118 L525,112 L516,116 L508,120 L499,118 L488,122 L478,116 L472,108 L466,112 L458,105 L453,94 L452,80 Z" />
            <path d="M458,128 L492,118 L522,120 L546,130 L560,148 L568,172 L568,198 L562,225 L550,252 L535,278 L520,305 L515,328 L510,352 L502,366 L492,368 L480,360 L474,342 L468,316 L460,290 L450,263 L445,238 L445,212 L450,188 L456,162 L458,142 Z" />
            <path d="M548,118 L578,115 L608,120 L624,135 L625,152 L618,165 L605,172 L585,175 L565,168 L552,155 L548,138 Z" />
            <path d="M555,58 L614,50 L668,50 L726,52 L779,56 L825,62 L869,72 L905,88 L933,112 L941,132 L931,150 L913,158 L895,158 L877,163 L864,170 L846,173 L823,168 L805,175 L793,168 L780,168 L763,175 L752,170 L740,177 L731,178 L719,170 L707,176 L697,186 L684,188 L669,178 L655,180 L641,170 L627,162 L614,162 L602,152 L586,148 L569,143 L559,132 L554,112 L552,90 L554,72 Z" />
            <path d="M641,170 L655,180 L669,178 L684,188 L697,203 L703,222 L697,235 L683,241 L667,239 L653,226 L645,210 L639,193 Z" />
            <path d="M666,226 L671,222 L675,228 L671,232 L666,230 Z" />
            <path d="M763,175 L780,168 L800,175 L813,193 L806,208 L791,218 L775,218 L761,210 L756,196 Z" />
            <path d="M788,225 L808,218 L823,222 L827,235 L819,248 L803,250 L790,242 L786,232 Z" />
            <path d="M752,232 L774,220 L787,225 L784,240 L769,245 L753,245 Z" />
            <path d="M780,268 L800,262 L815,265 L815,274 L795,278 L778,276 Z" />
            <path d="M823,188 L834,185 L841,192 L838,200 L829,200 Z" />
            <path d="M866,132 L877,128 L887,133 L887,146 L879,156 L867,158 L861,150 L861,140 Z" />
            <path d="M855,147 L866,143 L872,150 L870,162 L860,167 L851,164 L849,154 Z" />
            <path d="M832,178 L839,175 L844,181 L842,188 L836,191 L831,186 Z" />
            <path d="M798,285 L840,270 L878,268 L908,278 L922,298 L924,320 L918,342 L900,358 L870,365 L840,363 L812,350 L799,330 L795,308 Z" />
            <path d="M942,343 L947,333 L952,335 L951,348 L945,352 Z" />
            <path d="M544,293 L551,283 L558,287 L556,303 L548,309 L542,303 Z" />
          </g>

          {TSMC_FAB_LOCATIONS.map((loc) => {
            const [x, y] = toSvgXY(loc.lat, loc.lon);
            const isActive = activeLocationId === loc.id;
            return (
              <g
                key={loc.id}
                className="de-map-pin"
                role="button"
                aria-label={`${loc.country}: ${loc.totalFabs} fab${loc.totalFabs !== 1 ? 's' : ''}`}
                tabIndex={0}
                onClick={() => setActiveLocationId(isActive ? null : loc.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveLocationId(isActive ? null : loc.id); }}
              >
                <circle cx={x} cy={y} r="18" fill={MAP_PIN_COLOR} opacity={isActive ? 0.2 : 0.1} />
                <circle cx={x} cy={y} r="12" fill={MAP_PIN_COLOR} stroke="#fff" strokeWidth="2" opacity={isActive ? 1 : 0.9} />
                <text x={x} y={y + 4} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700" fontFamily="-apple-system, sans-serif" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {loc.totalFabs}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="de-world-map-legend">
          <span className="de-world-map-legend-dot" />
          <span className="de-world-map-legend-text">TSMC fab location — number indicates total fab count</span>
        </div>
      </div>

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

interface SubTabBarProps {
  tabs: { id: string; label: string }[];
  active: string;
  color: string;
  onChange: (id: string) => void;
}

function SubTabBar({ tabs, active, color, onChange }: SubTabBarProps) {
  return (
    <div className="de-subtab-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`de-subtab-btn${active === tab.id ? ' active' : ''}`}
          style={active === tab.id ? { borderBottomColor: color, color } : {}}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

const ESG_TABS = [
  { id: 'articles', label: 'Articles' },
  { id: 'reports', label: 'ESG Reports' },
];

const GOV_TABS = [
  { id: 'articles', label: 'Articles' },
  { id: 'map', label: 'TSMC Global Presence' },
];

export default function DataCategoryContent({ params }: { params: { category: string } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState('articles');

  const cat = CATEGORIES_MAP[params.category];
  const isEsg = params.category === 'esg';
  const isGov = params.category === 'government-regulations';
  const hasSubTabs = isEsg || isGov;
  const subTabs = isEsg ? ESG_TABS : isGov ? GOV_TABS : [];

  const allTags = useMemo(() => {
    if (!cat) return [];
    const set = new Set<string>();
    cat.items.forEach((item) => item.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [cat]);

  const filteredItems = useMemo(() => {
    if (!cat) return [];
    let items = [...cat.items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (activeTag) items = items.filter((item) => item.tags.includes(activeTag));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.source.toLowerCase().includes(q),
      );
    }
    return items;
  }, [cat, searchQuery, activeTag]);

  function handleSubTabChange(id: string) {
    setActiveSubTab(id);
    setSearchQuery('');
    setActiveTag(null);
  }

  if (!cat) {
    return (
      <>
        <TopNav />
        <Banner />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <div className="page-pad">
              <div className="de-not-found">
                <div className="de-not-found-title">Category not found</div>
                <Link href="/data-explore" className="de-back-btn">
                  <BackArrowIcon /> Back to Data Explore
                </Link>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="de-page">
            <div className="de-cat-hero" style={{ borderColor: cat.color }}>
              <div className="de-cat-hero-inner">
                <Link href="/data-explore" className="de-back-btn">
                  <BackArrowIcon />
                  Data Explore
                </Link>
                <div className="de-cat-hero-meta">
                  <span className="de-cat-hero-icon" style={{ color: cat.color }}>{cat.icon}</span>
                  <div>
                    <div className="section-eyebrow">Data Explore</div>
                    <h1 className="de-cat-hero-title">{cat.label}</h1>
                  </div>
                </div>
                <p className="de-cat-hero-desc">{cat.description}</p>
                <div className="de-cat-hero-stats">
                  <span className="de-cat-stat" style={{ color: cat.color }}>{cat.items.length} records</span>
                  <span className="de-cat-stat-divider">·</span>
                  <span className="de-cat-stat">{allTags.length} tags</span>
                </div>
              </div>
            </div>

            <div className="de-page-body">
              {hasSubTabs && (
                <SubTabBar tabs={subTabs} active={activeSubTab} color={cat.color} onChange={handleSubTabChange} />
              )}

              {activeSubTab === 'articles' && (
                <ArticlesTab
                  items={filteredItems}
                  accentColor={cat.color}
                  allTags={allTags}
                  searchQuery={searchQuery}
                  activeTag={activeTag}
                  onSearchChange={setSearchQuery}
                  onTagSelect={setActiveTag}
                  totalCount={cat.items.length}
                />
              )}

              {activeSubTab === 'reports' && isEsg && <EsgReportsTab />}
              {activeSubTab === 'map' && isGov && <WorldMapTab />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
