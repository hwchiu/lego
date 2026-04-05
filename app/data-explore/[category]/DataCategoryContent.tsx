'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { CATEGORIES_MAP, DataItem } from '@/app/data/dataExplore';
import { ESG_REPORTS } from '@/app/data/esgReports';
import { TAIWAN_TAX_NEWS, type TaxNewsItem } from '@/app/data/taxNews';
import WorldMapTab from '@/app/components/GovernmentRegulationsMap';

const TAGS_VISIBLE_COUNT = 6;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

const ESG_ACCENT = '#16a34a';

// ── ESG companies list ────────────────────────────────────────────────────────

const ESG_COMPANIES: { id: 'TSMC' | 'Apple'; label: string; subLabel: string }[] = [
  { id: 'TSMC', label: 'TSMC', subLabel: 'Taiwan Semiconductor Manufacturing' },
  { id: 'Apple', label: 'Apple', subLabel: 'Apple Inc.' },
];

function EsgReportsTab() {
  const [selectedCompany, setSelectedCompany] = useState<'TSMC' | 'Apple'>('TSMC');

  const reports = useMemo(
    () =>
      ESG_REPORTS.filter((r) => r.company === selectedCompany).sort((a, b) => b.year - a.year),
    [selectedCompany],
  );

  const sectionTitle = selectedCompany === 'TSMC' ? 'Sustainability Reports' : 'Environmental Progress Reports';
  const sectionSub = ESG_COMPANIES.find((c) => c.id === selectedCompany)?.subLabel ?? '';

  return (
    <div className="de-esg-layout">
      {/* Left: company submenu sidebar */}
      <nav className="de-esg-sidebar" aria-label="Company list">
        <div className="de-esg-sidebar-title">公司列表</div>
        {ESG_COMPANIES.map((co) => (
          <button
            key={co.id}
            className={`de-esg-sidebar-item${selectedCompany === co.id ? ' active' : ''}`}
            style={selectedCompany === co.id ? { borderLeftColor: ESG_ACCENT, color: ESG_ACCENT } : {}}
            onClick={() => setSelectedCompany(co.id)}
          >
            <span className="de-esg-sidebar-item-name">{co.label}</span>
            <span className="de-esg-sidebar-item-sub">{co.subLabel}</span>
          </button>
        ))}
      </nav>

      {/* Right: report cards for selected company */}
      <div className="de-esg-content">
        <div className="de-esg-reports-section-header">
          <span
            className="de-esg-reports-company-badge"
            style={{ background: `${ESG_ACCENT}18`, color: ESG_ACCENT }}
          >
            {selectedCompany}
          </span>
          <div className="de-esg-reports-section-titles">
            <span className="de-esg-reports-section-title">{sectionTitle}</span>
            <span className="de-esg-reports-section-sub">{sectionSub}</span>
          </div>
        </div>
        <div className="de-esg-reports-grid de-esg-reports-grid--two-col">
          {reports.map((report) => (
            <article key={`${selectedCompany}-${report.year}`} className="de-esg-report-card">
              <div className="de-esg-report-card-top">
                <div className="de-esg-report-card-year" style={{ color: ESG_ACCENT }}>
                  {report.year}
                </div>
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
                  style={{ background: ESG_ACCENT }}
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
                  style={{ color: ESG_ACCENT, borderColor: `${ESG_ACCENT}45` }}
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
    </div>
  );
}

// ── Taiwan Tax News tab ────────────────────────────────────────────────────────

const TAX_ACCENT = '#2563eb';

function TaiwanTaxNewsTab() {
  const items = useMemo(
    () => [...TAIWAN_TAX_NEWS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [],
  );

  return (
    <div className="de-tax-news-wrap">
      <div className="de-tax-news-header">
        <div className="de-tax-news-title">每週台灣稅務新聞整理</div>
        <div className="de-tax-news-sub">整理台灣財政部、國稅局及各大會計師事務所最新稅務法令動態，共 {items.length} 則。</div>
      </div>
      <div className="de-tax-news-grid">
        {items.map((item) => (
          <TaxNewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface TaxNewsCardProps {
  item: TaxNewsItem;
}

function TaxNewsCard({ item }: TaxNewsCardProps) {
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
            <span className="de-tax-card-ext"><ExternalLinkIcon /></span>
          </a>
        ) : (
          item.title
        )}
      </div>
      <p className="de-tax-card-summary">{item.summary}</p>
      <div className="de-tax-card-footer">
        <span className="de-tax-card-source">來源：{item.source}</span>
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
  { id: 'taiwan-tax', label: 'Weekly Taiwan Tax News Summary' },
  { id: 'intl-tax', label: 'Weekly International Tax News Summary' },
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
              {activeSubTab === 'taiwan-tax' && isGov && <TaiwanTaxNewsTab />}
              {activeSubTab === 'intl-tax' && isGov && <WorldMapTab />}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
