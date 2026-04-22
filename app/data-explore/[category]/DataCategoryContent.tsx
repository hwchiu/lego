'use client';

import { useState, useMemo, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { CATEGORIES_MAP, DataItem } from '@/app/data/dataExplore';
import { ESG_REPORTS } from '@/app/data/esgReports';
import { TAIWAN_TAX_NEWS, type TaxNewsItem } from '@/app/data/taxNews';
import WorldMapTab from '@/app/components/GovernmentRegulationsMap';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { queryCatgDetail } from '@/app/lib/queryCatgDetail';
import { queryDataItemContent } from '@/app/lib/queryDataItemContent';
import { type NewsSummaryItem } from '@/app/data/newsSummaryData';

const TAGS_VISIBLE_COUNT = 6;

const CAT_IMAGES: Record<string, string> = {
  'esg': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&q=80',
  'government-regulations': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&q=80',
  'international-standards': 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=900&q=80',
  'industry-information': 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900&q=80',
  'company-operations': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80',
  'capital-markets': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80',
  'news-summary': 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=900&q=80',
};

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

const ESG_COMPANIES: { id: string; label: string; subLabel: string; sectionTitle: string }[] = [
  { id: 'TSMC', label: 'TSMC', subLabel: 'TSMC Manufacturing', sectionTitle: 'Sustainability Reports' },
  { id: 'Apple', label: 'Apple', subLabel: 'Apple Inc.', sectionTitle: 'Environmental Progress Reports' },
];

function EsgReportsTab() {
  const [selectedCompany, setSelectedCompany] = useState<string>('TSMC');

  const reports = useMemo(
    () =>
      ESG_REPORTS.filter((r) => r.company === selectedCompany).sort((a, b) => b.year - a.year),
    [selectedCompany],
  );

  const selectedEntry = ESG_COMPANIES.find((c) => c.id === selectedCompany);
  const sectionTitle = selectedEntry?.sectionTitle ?? '';
  const sectionSub = selectedEntry?.subLabel ?? '';

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
  // Extract unique weeks sorted descending
  const weeks = useMemo(() => {
    const set = new Set<string>();
    TAIWAN_TAX_NEWS.forEach((item) => set.add(item.week));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, []);

  const [activeWeek, setActiveWeek] = useState(() => weeks[0] ?? '');

  const filteredItems = useMemo(
    () => TAIWAN_TAX_NEWS.filter((item) => item.week === activeWeek).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [activeWeek],
  );

  return (
    <div className="de-tax-news-wrap">
      <div className="de-tax-news-header">
        <div className="de-tax-news-title">Weekly Taiwan Tax News Summary</div>
        <div className="de-tax-news-sub">
          Curated tax law updates from Taiwan&apos;s Ministry of Finance, National Tax Administration,
          and major accounting firms — {TAIWAN_TAX_NEWS.length} items in total.
        </div>
      </div>

      <div className="de-intl-tax-layout">
        {/* Left: week sidebar */}
        <nav className="de-intl-tax-sidebar" aria-label="Week list">
          <div className="de-intl-tax-sidebar-title">Week</div>
          {weeks.map((week) => {
            const count = TAIWAN_TAX_NEWS.filter((item) => item.week === week).length;
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
              {filteredItems.map((item) => (
                <TaxNewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
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

// ── Capital Markets data ──────────────────────────────────────────────────────

const CM_COMPANIES = [
  { code: '2330', nameZh: '台積電', nameEn: 'TSMC' },
  { code: '2317', nameZh: '鴻海', nameEn: 'Hon Hai' },
  { code: '2454', nameZh: '聯發科', nameEn: 'MediaTek' },
  { code: '2881', nameZh: '富邦金', nameEn: 'Fubon Financial' },
  { code: '2882', nameZh: '國泰金', nameEn: 'Cathay Financial' },
  { code: '2891', nameZh: '中信金', nameEn: 'CTBC Financial' },
  { code: '2412', nameZh: '中華電', nameEn: 'Chunghwa Telecom' },
  { code: '3045', nameZh: '台灣大', nameEn: 'Taiwan Mobile' },
  { code: '1301', nameZh: '台塑', nameEn: 'Formosa Plastics' },
  { code: '1216', nameZh: '統一', nameEn: 'Uni-President' },
];

const CM_DATE = '2025/04/07';

const CM_DAILY_QUOTES = [
  { ...CM_COMPANIES[0], vol: '28,543,000', amount: '27,891,450,000', open: '970.00', high: '975.00', low: '965.00', close: '972.00', change: '+5.00', txn: '168,432' },
  { ...CM_COMPANIES[1], vol: '18,234,000', amount: '2,157,662,000', open: '117.50', high: '119.50', low: '117.00', close: '118.50', change: '+1.00', txn: '62,781' },
  { ...CM_COMPANIES[2], vol: '6,124,000',  amount: '5,578,920,000', open: '900.00', high: '918.00', low: '898.00', close: '910.00', change: '+10.00', txn: '48,923' },
  { ...CM_COMPANIES[3], vol: '12,891,000', amount: '1,093,735,000', open: '84.30',  high: '85.30',  low: '84.00',  close: '84.80', change: '+0.50', txn: '38,214' },
  { ...CM_COMPANIES[4], vol: '15,034,000', amount: '1,458,297,000', open: '96.10',  high: '97.50',  low: '95.80',  close: '97.00', change: '+0.90', txn: '45,671' },
  { ...CM_COMPANIES[5], vol: '9,812,000',  amount: '1,080,112,000', open: '109.00', high: '110.50', low: '108.50', close: '110.00', change: '+1.50', txn: '31,508' },
  { ...CM_COMPANIES[6], vol: '4,231,000',  amount: '316,043,000',   open: '74.60',  high: '75.20',  low: '74.30',  close: '74.70', change: '-0.10', txn: '14,892' },
  { ...CM_COMPANIES[7], vol: '3,178,000',  amount: '296,808,000',   open: '92.80',  high: '93.60',  low: '92.60',  close: '93.40', change: '+0.60', txn: '11,243' },
  { ...CM_COMPANIES[8], vol: '5,892,000',  amount: '582,308,000',   open: '98.60',  high: '99.50',  low: '98.40',  close: '98.90', change: '+0.30', txn: '17,632' },
  { ...CM_COMPANIES[9], vol: '7,341,000',  amount: '400,383,000',   open: '54.40',  high: '54.90',  low: '54.10',  close: '54.60', change: '+0.20', txn: '22,109' },
];

const CM_DAY_TRADING = [
  { ...CM_COMPANIES[0], buy: '3,241,000', sell: '3,189,000', net: '6,430,000', ratio: '22.53%' },
  { ...CM_COMPANIES[1], buy: '2,814,000', sell: '2,753,000', net: '5,567,000', ratio: '30.54%' },
  { ...CM_COMPANIES[2], buy: '1,023,000', sell: '987,000',   net: '2,010,000', ratio: '32.82%' },
  { ...CM_COMPANIES[3], buy: '1,892,000', sell: '1,871,000', net: '3,763,000', ratio: '29.19%' },
  { ...CM_COMPANIES[4], buy: '2,134,000', sell: '2,098,000', net: '4,232,000', ratio: '28.15%' },
  { ...CM_COMPANIES[5], buy: '1,245,000', sell: '1,213,000', net: '2,458,000', ratio: '25.05%' },
  { ...CM_COMPANIES[6], buy: '521,000',   sell: '498,000',   net: '1,019,000', ratio: '24.09%' },
  { ...CM_COMPANIES[7], buy: '412,000',   sell: '403,000',   net: '815,000',   ratio: '25.65%' },
  { ...CM_COMPANIES[8], buy: '712,000',   sell: '698,000',   net: '1,410,000', ratio: '23.93%' },
  { ...CM_COMPANIES[9], buy: '934,000',   sell: '921,000',   net: '1,855,000', ratio: '25.27%' },
];

const CM_MARGIN = [
  { ...CM_COMPANIES[0], finBuy: '1,234,000', finSell: '892,000',   finBal: '12,451,000', shoBuy: '98,000',  shoSell: '112,000', shoBal: '892,000'  },
  { ...CM_COMPANIES[1], finBuy: '2,341,000', finSell: '1,821,000', finBal: '21,234,000', shoBuy: '234,000', shoSell: '198,000', shoBal: '1,541,000' },
  { ...CM_COMPANIES[2], finBuy: '892,000',   finSell: '634,000',   finBal: '8,921,000',  shoBuy: '78,000',  shoSell: '91,000',  shoBal: '654,000'   },
  { ...CM_COMPANIES[3], finBuy: '1,892,000', finSell: '1,341,000', finBal: '18,231,000', shoBuy: '143,000', shoSell: '121,000', shoBal: '1,123,000' },
  { ...CM_COMPANIES[4], finBuy: '1,634,000', finSell: '1,123,000', finBal: '15,892,000', shoBuy: '121,000', shoSell: '109,000', shoBal: '934,000'   },
  { ...CM_COMPANIES[5], finBuy: '1,341,000', finSell: '987,000',   finBal: '13,451,000', shoBuy: '109,000', shoSell: '98,000',  shoBal: '823,000'   },
  { ...CM_COMPANIES[6], finBuy: '432,000',   finSell: '321,000',   finBal: '4,231,000',  shoBuy: '34,000',  shoSell: '29,000',  shoBal: '234,000'   },
  { ...CM_COMPANIES[7], finBuy: '323,000',   finSell: '234,000',   finBal: '3,123,000',  shoBuy: '28,000',  shoSell: '24,000',  shoBal: '198,000'   },
  { ...CM_COMPANIES[8], finBuy: '678,000',   finSell: '534,000',   finBal: '6,789,000',  shoBuy: '56,000',  shoSell: '48,000',  shoBal: '432,000'   },
  { ...CM_COMPANIES[9], finBuy: '892,000',   finSell: '712,000',   finBal: '8,923,000',  shoBuy: '72,000',  shoSell: '63,000',  shoBal: '543,000'   },
];

const CM_SHORT_SALE = [
  { ...CM_COMPANIES[0], finLimit: '50,000,000', finUsed: '12,451,000', finRatio: '24.90%', shoLimit: '5,000,000', shoUsed: '892,000',   shoRatio: '17.84%' },
  { ...CM_COMPANIES[1], finLimit: '80,000,000', finUsed: '21,234,000', finRatio: '26.54%', shoLimit: '8,000,000', shoUsed: '1,541,000', shoRatio: '19.26%' },
  { ...CM_COMPANIES[2], finLimit: '30,000,000', finUsed: '8,921,000',  finRatio: '29.74%', shoLimit: '3,000,000', shoUsed: '654,000',   shoRatio: '21.80%' },
  { ...CM_COMPANIES[3], finLimit: '60,000,000', finUsed: '18,231,000', finRatio: '30.39%', shoLimit: '6,000,000', shoUsed: '1,123,000', shoRatio: '18.72%' },
  { ...CM_COMPANIES[4], finLimit: '55,000,000', finUsed: '15,892,000', finRatio: '28.89%', shoLimit: '5,500,000', shoUsed: '934,000',   shoRatio: '16.98%' },
  { ...CM_COMPANIES[5], finLimit: '45,000,000', finUsed: '13,451,000', finRatio: '29.89%', shoLimit: '4,500,000', shoUsed: '823,000',   shoRatio: '18.29%' },
  { ...CM_COMPANIES[6], finLimit: '20,000,000', finUsed: '4,231,000',  finRatio: '21.16%', shoLimit: '2,000,000', shoUsed: '234,000',   shoRatio: '11.70%' },
  { ...CM_COMPANIES[7], finLimit: '15,000,000', finUsed: '3,123,000',  finRatio: '20.82%', shoLimit: '1,500,000', shoUsed: '198,000',   shoRatio: '13.20%' },
  { ...CM_COMPANIES[8], finLimit: '25,000,000', finUsed: '6,789,000',  finRatio: '27.16%', shoLimit: '2,500,000', shoUsed: '432,000',   shoRatio: '17.28%' },
  { ...CM_COMPANIES[9], finLimit: '30,000,000', finUsed: '8,923,000',  finRatio: '29.74%', shoLimit: '3,000,000', shoUsed: '543,000',   shoRatio: '18.10%' },
];

const CM_EX_DIVIDEND = [
  { ...CM_COMPANIES[0], exDivDate: '2025/07/16', divVal: '4.50', exRightDate: '2025/07/16', rightVal: '—', listDate: '1994/09/05' },
  { ...CM_COMPANIES[1], exDivDate: '2025/08/14', divVal: '5.00', exRightDate: '—',           rightVal: '—', listDate: '1991/06/11' },
  { ...CM_COMPANIES[2], exDivDate: '2025/07/10', divVal: '93.0', exRightDate: '—',           rightVal: '—', listDate: '2001/07/23' },
  { ...CM_COMPANIES[3], exDivDate: '2025/08/07', divVal: '2.00', exRightDate: '—',           rightVal: '—', listDate: '2003/01/02' },
  { ...CM_COMPANIES[4], exDivDate: '2025/08/13', divVal: '2.50', exRightDate: '—',           rightVal: '—', listDate: '2002/01/02' },
  { ...CM_COMPANIES[5], exDivDate: '2025/08/20', divVal: '1.80', exRightDate: '—',           rightVal: '—', listDate: '2002/12/30' },
  { ...CM_COMPANIES[6], exDivDate: '2025/09/10', divVal: '4.29', exRightDate: '—',           rightVal: '—', listDate: '2000/02/11' },
  { ...CM_COMPANIES[7], exDivDate: '2025/09/17', divVal: '3.50', exRightDate: '—',           rightVal: '—', listDate: '2002/07/09' },
  { ...CM_COMPANIES[8], exDivDate: '2025/10/09', divVal: '4.30', exRightDate: '—',           rightVal: '—', listDate: '1986/10/13' },
  { ...CM_COMPANIES[9], exDivDate: '2025/09/25', divVal: '1.40', exRightDate: '—',           rightVal: '—', listDate: '1989/09/12' },
];

const CM_FOREIGN = [
  { ...CM_COMPANIES[0], buy: '8,231,000',  sell: '6,912,000', shares: '14,521,845,000', ratio: '75.12%' },
  { ...CM_COMPANIES[1], buy: '12,341,000', sell: '9,823,000', shares: '6,234,512,000',  ratio: '44.89%' },
  { ...CM_COMPANIES[2], buy: '2,134,000',  sell: '1,892,000', shares: '892,341,000',    ratio: '56.34%' },
  { ...CM_COMPANIES[3], buy: '4,231,000',  sell: '3,812,000', shares: '5,234,123,000',  ratio: '38.12%' },
  { ...CM_COMPANIES[4], buy: '3,892,000',  sell: '3,341,000', shares: '4,892,341,000',  ratio: '42.67%' },
  { ...CM_COMPANIES[5], buy: '3,412,000',  sell: '2,923,000', shares: '4,312,567,000',  ratio: '41.23%' },
  { ...CM_COMPANIES[6], buy: '892,000',    sell: '812,000',   shares: '1,892,341,000',  ratio: '47.31%' },
  { ...CM_COMPANIES[7], buy: '623,000',    sell: '589,000',   shares: '823,412,000',    ratio: '29.45%' },
  { ...CM_COMPANIES[8], buy: '1,234,000',  sell: '1,123,000', shares: '2,123,456,000',  ratio: '34.56%' },
  { ...CM_COMPANIES[9], buy: '1,892,000',  sell: '1,712,000', shares: '2,892,341,000',  ratio: '32.81%' },
];

const CM_PRICE_LIMIT = [
  { ...CM_COMPANIES[0], refPrice: '972.00', ceiling: '1,069.00', floor: '875.00', pct: '10%' },
  { ...CM_COMPANIES[1], refPrice: '118.50', ceiling: '130.00',   floor: '107.00', pct: '10%' },
  { ...CM_COMPANIES[2], refPrice: '910.00', ceiling: '1,001.00', floor: '819.00', pct: '10%' },
  { ...CM_COMPANIES[3], refPrice: '84.80',  ceiling: '93.20',    floor: '76.40',  pct: '10%' },
  { ...CM_COMPANIES[4], refPrice: '97.00',  ceiling: '106.50',   floor: '87.30',  pct: '10%' },
  { ...CM_COMPANIES[5], refPrice: '110.00', ceiling: '121.00',   floor: '99.00',  pct: '10%' },
  { ...CM_COMPANIES[6], refPrice: '74.70',  ceiling: '82.10',    floor: '67.20',  pct: '10%' },
  { ...CM_COMPANIES[7], refPrice: '93.40',  ceiling: '102.50',   floor: '84.10',  pct: '10%' },
  { ...CM_COMPANIES[8], refPrice: '98.90',  ceiling: '108.50',   floor: '88.90',  pct: '10%' },
  { ...CM_COMPANIES[9], refPrice: '54.60',  ceiling: '60.00',    floor: '49.20',  pct: '10%' },
];

const CM_PE_RATIO = [
  { ...CM_COMPANIES[0], yield: '0.46', pe: '25.34', pb: '6.12' },
  { ...CM_COMPANIES[1], yield: '4.22', pe: '11.81', pb: '1.34' },
  { ...CM_COMPANIES[2], yield: '10.21', pe: '9.78',  pb: '3.45' },
  { ...CM_COMPANIES[3], yield: '2.36', pe: '10.23', pb: '1.08' },
  { ...CM_COMPANIES[4], yield: '2.58', pe: '12.34', pb: '1.23' },
  { ...CM_COMPANIES[5], yield: '1.64', pe: '12.89', pb: '1.12' },
  { ...CM_COMPANIES[6], yield: '5.74', pe: '20.11', pb: '2.67' },
  { ...CM_COMPANIES[7], yield: '3.75', pe: '22.34', pb: '2.89' },
  { ...CM_COMPANIES[8], yield: '4.35', pe: '14.23', pb: '1.56' },
  { ...CM_COMPANIES[9], yield: '2.56', pe: '16.78', pb: '1.43' },
];

// ── Capital Markets tab components ──────────────────────────────────────────

function CmTableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="de-data-section">
      <div className="de-data-section-header">
        <span className="de-data-section-sub">Reference date: {CM_DATE}</span>
        <span className="de-data-section-date">Source: TWSE</span>
      </div>
      <div className="de-data-table-wrap">{children}</div>
    </div>
  );
}

// ── Sortable data hook ─────────────────────────────────────────────────────

function useSortableData<T>(data: T[], getters: ((row: T) => string | number)[]) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');

  function handleSort(colIndex: number) {
    if (sortCol === colIndex) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(colIndex);
      setSortDir('asc');
    }
  }

  const processed = useMemo(() => {
    let rows = [...data];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        getters.some((g) => String(g(row)).toLowerCase().includes(q)),
      );
    }
    if (sortCol !== null) {
      const getter = getters[sortCol];
      rows.sort((a, b) => {
        const av = getter(a);
        const bv = getter(b);
        const an = typeof av === 'number' ? av : Number(String(av).replace(/,/g, ''));
        const bn = typeof bv === 'number' ? bv : Number(String(bv).replace(/,/g, ''));
        const isNum = !isNaN(an) && !isNaN(bn) && String(av) !== '' && String(bv) !== '';
        const cmp = isNum ? an - bn : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, sortCol, sortDir]);

  return { rows: processed, search, setSearch, sortCol, sortDir, handleSort };
}

interface ThSortProps {
  label: string;
  colIndex: number;
  sortCol: number | null;
  sortDir: 'asc' | 'desc';
  onSort: (i: number) => void;
  className?: string;
}

function ThSort({ label, colIndex, sortCol, sortDir, onSort, className }: ThSortProps) {
  const isActive = sortCol === colIndex;
  const icon = isActive ? (sortDir === 'asc' ? '▲' : '▼') : '⇅';
  return (
    <th className={className}>
      <button className="de-th-sort-btn" onClick={() => onSort(colIndex)}>
        {label}
        <span className={`de-th-sort-icon${isActive ? ' de-th-sort-icon--active' : ''}`}>{icon}</span>
      </button>
    </th>
  );
}

interface SortSearchBarProps {
  search: string;
  onSearch: (v: string) => void;
  total: number;
  filtered: number;
}

function SortSearchBar({ search, onSearch, total, filtered }: SortSearchBarProps) {
  return (
    <div className="de-table-search-wrap">
      <input
        className="de-table-search-input"
        type="search"
        placeholder="Search table..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search table"
      />
      {search.trim() && (
        <span className="de-table-search-count">{filtered} / {total}</span>
      )}
    </div>
  );
}

function CmNameCell({ lang, code, nameZh, nameEn }: { lang: 'zh' | 'en'; code: string; nameZh: string; nameEn: string }) {
  return (
    <>
      <td className="code">{code}</td>
      <td>{lang === 'zh' ? nameZh : nameEn}</td>
    </>
  );
}

function CmDailyQuotesTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_DAILY_QUOTES,
    [
      (r) => r.code,
      (r) => (zh ? r.nameZh : r.nameEn),
      (r) => r.vol,
      (r) => r.amount,
      (r) => r.open,
      (r) => r.high,
      (r) => r.low,
      (r) => r.close,
      (r) => r.change,
      (r) => r.txn,
    ],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_DAILY_QUOTES.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '成交股數' : 'Volume'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '成交金額' : 'Amount (NT$)'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '開盤價' : 'Open'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '最高價' : 'High'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '最低價' : 'Low'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '收盤價' : 'Close'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '漲跌' : 'Change'} colIndex={8} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '成交筆數' : 'Transactions'} colIndex={9} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{r.vol}</td>
              <td className="num">{r.amount}</td>
              <td className="num">{r.open}</td>
              <td className="num">{r.high}</td>
              <td className="num">{r.low}</td>
              <td className="num">{r.close}</td>
              <td className={`num ${r.change.startsWith('+') ? 'pos' : r.change.startsWith('-') ? 'neg' : ''}`}>{r.change}</td>
              <td className="num">{r.txn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmDayTradingTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_DAY_TRADING,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.buy, (r) => r.sell, (r) => r.net, (r) => r.ratio],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_DAY_TRADING.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '當沖買進股數' : 'Day-Trade Buy'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '當沖賣出股數' : 'Day-Trade Sell'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '當沖成交股數' : 'Day-Trade Volume'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '占總成交股數比' : '% of Total Vol.'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{r.buy}</td>
              <td className="num">{r.sell}</td>
              <td className="num">{r.net}</td>
              <td className="num">{r.ratio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmMarginTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_MARGIN,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.finBuy, (r) => r.finSell, (r) => r.finBal, (r) => r.shoBuy, (r) => r.shoSell, (r) => r.shoBal],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_MARGIN.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '融資買進' : 'Margin Buy'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融資賣出' : 'Margin Sell'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融資餘額' : 'Margin Balance'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融券賣出' : 'Short Sell'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融券買進' : 'Short Buy'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融券餘額' : 'Short Balance'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{r.finBuy}</td>
              <td className="num">{r.finSell}</td>
              <td className="num">{r.finBal}</td>
              <td className="num">{r.shoBuy}</td>
              <td className="num">{r.shoSell}</td>
              <td className="num">{r.shoBal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmShortSaleTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_SHORT_SALE,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.finLimit, (r) => r.finUsed, (r) => r.finRatio, (r) => r.shoLimit, (r) => r.shoUsed, (r) => r.shoRatio],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_SHORT_SALE.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '融資限額' : 'Margin Limit'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融資已用' : 'Margin Used'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融資使用率' : 'Margin Util.'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融券限額' : 'Short Limit'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融券已用' : 'Short Used'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '融券使用率' : 'Short Util.'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{r.finLimit}</td>
              <td className="num">{r.finUsed}</td>
              <td className="num">{r.finRatio}</td>
              <td className="num">{r.shoLimit}</td>
              <td className="num">{r.shoUsed}</td>
              <td className="num">{r.shoRatio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmExDividendTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_EX_DIVIDEND,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.exDivDate, (r) => r.divVal, (r) => r.exRightDate, (r) => r.rightVal, (r) => r.listDate],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_EX_DIVIDEND.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '除息日' : 'Ex-Div Date'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '息值(元)' : 'Div. Value'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '除權日' : 'Ex-Right Date'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '權值' : 'Right Value'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '上市日期' : 'Listing Date'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td>{r.exDivDate}</td>
              <td className="num">{r.divVal}</td>
              <td className="muted">{r.exRightDate}</td>
              <td className="num muted">{r.rightVal}</td>
              <td className="muted">{r.listDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmForeignTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_FOREIGN,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.buy, (r) => r.sell, (r) => r.shares, (r) => r.ratio],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_FOREIGN.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '外資買進(股)' : 'Foreign Buy'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '外資賣出(股)' : 'Foreign Sell'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '外資持股股數' : 'Foreign Holdings'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '持股比例' : 'Holding %'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{r.buy}</td>
              <td className="num">{r.sell}</td>
              <td className="num">{r.shares}</td>
              <td className="num">{r.ratio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmPriceLimitTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_PRICE_LIMIT,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.refPrice, (r) => r.ceiling, (r) => r.floor, (r) => r.pct],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_PRICE_LIMIT.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '參考收盤價' : 'Ref. Price'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '漲停價格' : 'Upper Limit'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '跌停價格' : 'Lower Limit'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '漲跌幅限制' : 'Limit %'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{r.refPrice}</td>
              <td className="num pos">{r.ceiling}</td>
              <td className="num neg">{r.floor}</td>
              <td className="num">{r.pct}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmPeRatioTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    CM_PE_RATIO,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.yield, (r) => r.pe, (r) => r.pb],
  );
  return (
    <CmTableWrapper>
      <SortSearchBar search={search} onSearch={setSearch} total={CM_PE_RATIO.length} filtered={rows.length} />
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSort label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            <ThSort label={zh ? '殖利率(%)' : 'Dividend Yield (%)'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '本益比' : 'P/E Ratio'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
            <ThSort label={zh ? '股價淨值比' : 'P/B Ratio'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{r.yield}</td>
              <td className="num">{r.pe}</td>
              <td className="num">{r.pb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

// ── Government Regulations — new tab data ───────────────────────────────────

const GOV_REG_DISQUALIFIED = [
  { name: '豐盛工程有限公司',       id: '12345678', period: '2024/03/01–2026/02/28', reason: '偽造文書、詐欺', agency: '行政院公共工程委員會' },
  { name: '大成建設股份有限公司',   id: '23456789', period: '2024/05/15–2025/05/14', reason: '圍標', agency: '採購機關' },
  { name: '信義科技股份有限公司',   id: '34567890', period: '2023/11/01–2024/10/31', reason: '履約品質不符', agency: '行政院公共工程委員會' },
  { name: '華光電子工業股份有限公司', id: '45678901', period: '2024/01/20–2025/01/19', reason: '違反採購法', agency: '採購機關' },
  { name: '東方資訊股份有限公司',   id: '56789012', period: '2024/07/01–2026/06/30', reason: '洗錢防制', agency: '法務部' },
  { name: '新興企業股份有限公司',   id: '67890123', period: '2023/09/01–2024/08/31', reason: '偽造標單', agency: '行政院公共工程委員會' },
  { name: '明德科技股份有限公司',   id: '78901234', period: '2024/04/10–2025/04/09', reason: '違反採購法', agency: '採購機關' },
  { name: '長隆機械有限公司',       id: '89012345', period: '2024/08/01–2025/07/31', reason: '未依約交貨', agency: '採購機關' },
  { name: '興業貿易股份有限公司',   id: '90123456', period: '2023/12/01–2024/11/30', reason: '圍標', agency: '行政院公共工程委員會' },
  { name: '金鑫企業有限公司',       id: '01234567', period: '2024/06/01–2025/05/31', reason: '不實申報', agency: '採購機關' },
];

const GOV_REG_POLLUTION = [
  { name: '南亞塑膠工業股份有限公司', city: '桃園市', date: '2024/10/15', reason: '廢水超標排放', fine: '200,000', law: '水污染防治法' },
  { name: '台灣化學纖維股份有限公司', city: '彰化縣', date: '2024/09/20', reason: '空氣污染物超量', fine: '300,000', law: '空氣污染防制法' },
  { name: '長春石油化學股份有限公司', city: '雲林縣', date: '2024/08/11', reason: '有毒物質洩漏', fine: '500,000', law: '毒性化學物質管理法' },
  { name: '中鋼股份有限公司',         city: '高雄市', date: '2024/11/03', reason: '煙塵超標', fine: '150,000', law: '空氣污染防制法' },
  { name: '永豐餘造紙股份有限公司',   city: '苗栗縣', date: '2024/07/22', reason: '廢水處理不當', fine: '120,000', law: '水污染防治法' },
  { name: '台灣化成工業股份有限公司', city: '台南市', date: '2024/12/05', reason: '廢棄物非法棄置', fine: '400,000', law: '廢棄物清理法' },
  { name: '大同股份有限公司',         city: '台北市', date: '2024/06/18', reason: '噪音超標', fine: '80,000',  law: '噪音管制法' },
  { name: '義聯鋼鐵股份有限公司',     city: '高雄市', date: '2024/05/29', reason: '廢氣排放超標', fine: '250,000', law: '空氣污染防制法' },
  { name: '東元電機股份有限公司',     city: '桃園市', date: '2024/03/14', reason: '廢水未達標', fine: '100,000', law: '水污染防治法' },
  { name: '宏碁股份有限公司',         city: '新北市', date: '2024/04/08', reason: '有害事業廢棄物違規', fine: '180,000', law: '廢棄物清理法' },
];

const GOV_REG_LABOR = [
  { name: '某某製造股份有限公司',   id: '11223344', date: '2024/11/15', law: '勞動基準法第24條', fine: '60,000',  detail: '未給付加班費' },
  { name: '大統食品股份有限公司',   id: '22334455', date: '2024/10/08', law: '勞動基準法第38條', fine: '30,000',  detail: '特別休假未依規定' },
  { name: '晶圓代工技術股份有限公司', id: '33445566', date: '2024/09/22', law: '職業安全衛生法第6條', fine: '90,000',  detail: '安全設備未符合規定' },
  { name: '精密機械製造有限公司',   id: '44556677', date: '2024/08/14', law: '勞動基準法第30條', fine: '45,000',  detail: '工時超過法定上限' },
  { name: '東南電子股份有限公司',   id: '55667788', date: '2024/07/30', law: '性別平等工作法第10條', fine: '100,000', detail: '同工不同酬' },
  { name: '長發建設股份有限公司',   id: '66778899', date: '2024/06/19', law: '職業安全衛生法第17條', fine: '120,000', detail: '未提供安全防護' },
  { name: '寶達通訊股份有限公司',   id: '77889900', date: '2024/05/07', law: '勞動基準法第14條', fine: '50,000',  detail: '未依法訂立勞動契約' },
  { name: '金豐紡織股份有限公司',   id: '88990011', date: '2024/04/25', law: '勞工退休金條例第14條', fine: '75,000',  detail: '未足額提撥退休金' },
  { name: '凱旋科技股份有限公司',   id: '99001122', date: '2024/03/13', law: '勞動基準法第59條', fine: '40,000',  detail: '職災未依規補償' },
  { name: '和順物流股份有限公司',   id: '00112233', date: '2024/02/28', law: '勞動基準法第79條', fine: '30,000',  detail: '工資記錄不全' },
];

// ── Government Regulations new tab components ────────────────────────────────

function GovDisqualifiedTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    GOV_REG_DISQUALIFIED,
    [(r) => r.name, (r) => r.id, (r) => r.period, (r) => r.reason, (r) => r.agency],
  );
  return (
    <div className="de-data-section">
      <div className="de-data-section-header">
        <span className="de-data-section-title">
          {zh ? '拒絕往來廠商公告' : 'Announcement of Disqualified Vendors'}
        </span>
        <span className="de-data-section-date">Source: 行政院公共工程委員會</span>
      </div>
      <div className="de-data-table-wrap">
        <div style={{ padding: '8px 12px 0' }}>
          <SortSearchBar search={search} onSearch={setSearch} total={GOV_REG_DISQUALIFIED.length} filtered={rows.length} />
        </div>
        <table className="de-data-table">
          <thead>
            <tr>
              <ThSort label={zh ? '廠商名稱' : 'Vendor Name'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '統一編號' : 'Tax ID'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '禁止往來期間' : 'Banned Period'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '違法事由' : 'Violation Reason'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '主管機關' : 'Authority'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td className="code">{r.id}</td>
                <td className="muted">{r.period}</td>
                <td>{r.reason}</td>
                <td className="muted">{r.agency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GovPollutionTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    GOV_REG_POLLUTION,
    [(r) => r.name, (r) => r.city, (r) => r.date, (r) => r.reason, (r) => r.fine, (r) => r.law],
  );
  return (
    <div className="de-data-section">
      <div className="de-data-section-header">
        <span className="de-data-section-title">
          {zh ? '列管事業污染源裁處資料' : 'Regulatory data on industrial pollution sources'}
        </span>
        <span className="de-data-section-date">Source: 環境部</span>
      </div>
      <div className="de-data-table-wrap">
        <div style={{ padding: '8px 12px 0' }}>
          <SortSearchBar search={search} onSearch={setSearch} total={GOV_REG_POLLUTION.length} filtered={rows.length} />
        </div>
        <table className="de-data-table">
          <thead>
            <tr>
              <ThSort label={zh ? '事業名稱' : 'Company Name'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '所在縣市' : 'City/County'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '裁處日期' : 'Penalty Date'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '違規事由' : 'Violation'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '裁處金額(元)' : 'Fine (NT$)'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
              <ThSort label={zh ? '法規依據' : 'Regulation'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td className="muted">{r.city}</td>
                <td className="muted">{r.date}</td>
                <td>{r.reason}</td>
                <td className="num">{r.fine}</td>
                <td className="muted">{r.law}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GovLaborTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, search, setSearch, sortCol, sortDir, handleSort } = useSortableData(
    GOV_REG_LABOR,
    [(r) => r.name, (r) => r.id, (r) => r.date, (r) => r.law, (r) => r.fine, (r) => r.detail],
  );
  return (
    <div className="de-data-section">
      <div className="de-data-section-header">
        <span className="de-data-section-title">
          {zh ? '違反勞動法令事業單位' : 'Violations of Labor Laws'}
        </span>
        <span className="de-data-section-date">Source: 勞動部</span>
      </div>
      <div className="de-data-table-wrap">
        <div style={{ padding: '8px 12px 0' }}>
          <SortSearchBar search={search} onSearch={setSearch} total={GOV_REG_LABOR.length} filtered={rows.length} />
        </div>
        <table className="de-data-table">
          <thead>
            <tr>
              <ThSort label={zh ? '事業單位名稱' : 'Company Name'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '統一編號' : 'Tax ID'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '違法日期' : 'Violation Date'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '違反法規' : 'Regulation Violated'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
              <ThSort label={zh ? '裁罰金額(元)' : 'Fine (NT$)'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} className="num" />
              <ThSort label={zh ? '處分情形' : 'Details'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td className="code">{r.id}</td>
                <td className="muted">{r.date}</td>
                <td className="muted">{r.law}</td>
                <td className="num">{r.fine}</td>
                <td>{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── News Summary tab components ───────────────────────────────────────────────

const NEWS_ACCENT = '#0ea5e9';

// Tag sets for each digest category (used by legacy tabs)
const TAIWAN_TAGS = new Set(['TSMC', 'Taiwan', 'Japan', 'JASM', 'Arizona', 'Fab 21', '12nm', '2nm', 'TC', 'CoWoS', 'Production', 'Supply Chain']);
const INTL_TAGS = new Set(['NVIDIA', 'Apple', 'AAPL', 'Intel', 'INTC', 'ASML', 'SK Hynix', 'HBM4', 'Blackwell', 'GPU', 'Qualcomm', 'Broadcom', 'Samsung SDI', 'Memory', 'Recovery', 'Orders', 'AI', 'Data Center', 'Earnings']);

function newsMatchesSet(item: DataItem, tagSet: Set<string>): boolean {
  return item.tags.some((t) => tagSet.has(t));
}

interface NewsDigestTabProps {
  items: DataItem[];
  tagSet: Set<string>;
  heading: string;
  subheading: string;
  lang: 'zh' | 'en';
  periodLabel: string;
}

function NewsDigestTab({ items, tagSet, heading, subheading, lang, periodLabel }: NewsDigestTabProps) {
  const zh = lang === 'zh';

  // Group articles into biweekly / weekly periods based on date
  const filtered = useMemo(() => {
    return items
      .filter((item) => newsMatchesSet(item, tagSet))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, tagSet]);

  // Group by 2-week periods (using ISO year-week, rounded to biweekly)
  const groups = useMemo(() => {
    const map = new Map<string, DataItem[]>();
    filtered.forEach((item) => {
      const d = new Date(item.date);
      const weekOfYear = Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7);
      const periodNum = Math.ceil(weekOfYear / 2);
      const key = `${d.getFullYear()} — ${periodLabel} ${periodNum}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered, periodLabel]);

  const [activePeriod, setActivePeriod] = useState<string>(() => groups[0]?.[0] ?? '');
  // sync if groups change
  const activePeriodFinal = activePeriod || groups[0]?.[0] || '';

  const activeItems = groups.find(([key]) => key === activePeriodFinal)?.[1] ?? filtered;

  return (
    <div className="de-tax-news-wrap">
      <div className="de-tax-news-header">
        <div className="de-tax-news-title" style={{ color: NEWS_ACCENT }}>{heading}</div>
        <div className="de-tax-news-sub">{subheading}</div>
      </div>
      <div className="de-intl-tax-layout">
        <nav className="de-intl-tax-sidebar" aria-label="Period list">
          <div className="de-intl-tax-sidebar-title">{zh ? '期間' : 'Period'}</div>
          {groups.length === 0 && (
            <div className="de-intl-tax-sidebar-item" style={{ opacity: 0.5 }}>—</div>
          )}
          {groups.map(([key, grpItems]) => (
            <button
              key={key}
              className={`de-intl-tax-sidebar-item${activePeriodFinal === key ? ' active' : ''}`}
              style={activePeriodFinal === key ? { borderLeftColor: NEWS_ACCENT, color: NEWS_ACCENT } : {}}
              onClick={() => setActivePeriod(key)}
            >
              <span className="de-intl-tax-sidebar-item-name">{key}</span>
              <span className="de-intl-tax-sidebar-item-count">{grpItems.length}</span>
            </button>
          ))}
        </nav>
        <div className="de-intl-tax-content">
          {(groups.length === 0 ? filtered : activeItems).length === 0 ? (
            <div className="de-intl-tax-empty">{zh ? '暫無相關新聞' : 'No articles found.'}</div>
          ) : (
            <div className="de-items-list">
              {(groups.length === 0 ? filtered : activeItems).map((item) => (
                <DataItemCard key={item.id} item={item} accentColor={NEWS_ACCENT} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Markdown parser for ESG news content ─────────────────────────────────────

interface EsgNewsArticle {
  title: string;
  url: string;
  site: string;
  date: string;
  summary: string;
}

interface EsgTopicSection {
  topic: string;
  articles: EsgNewsArticle[];
}

const TOPIC_SEPARATOR = /={60,}\s*\n\s*##\s+NEXT\s+Topic\s*##\s*\n\s*={60,}/;

function parseMarkdownTableRow(row: string): string[] {
  return row
    .split('|')
    .map((cell) => cell.trim())
    .filter((_, i, arr) => i > 0 && i < arr.length - 1);
}

function parseEsgMarkdown(markdown: string): EsgTopicSection[] {
  const chunks = markdown.split(TOPIC_SEPARATOR);
  const sections: EsgTopicSection[] = [];

  for (const chunk of chunks) {
    const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Find topic heading
    const headingIdx = lines.findIndex((l) => l.startsWith('##') && !l.includes('NEXT Topic'));
    if (headingIdx === -1) continue;
    const topic = lines[headingIdx].replace(/^#+\s*/, '').trim();

    // Find table rows (skip heading row and separator row)
    const tableRows = lines.filter((l) => l.startsWith('|') && !l.startsWith('|---') && !l.startsWith('| ---') && !l.match(/^\|[-| ]+\|$/));
    // Skip the header row (first table row contains column names)
    const dataRows = tableRows.slice(1);

    const articles: EsgNewsArticle[] = dataRows.map((row) => {
      const cells = parseMarkdownTableRow(row);
      return {
        title: cells[0] ?? '',
        url: cells[1] ?? '',
        site: cells[2] ?? '',
        date: cells[3] ?? '',
        summary: cells[4] ?? '',
      };
    }).filter((a) => a.title);

    if (topic) {
      sections.push({ topic, articles });
    }
  }

  return sections;
}

// ── ESG topic collapsible section component ───────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
      <path
        d={open ? 'M3 5l4 4 4-4' : 'M5 3l4 4-4 4'}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface EsgTopicSectionProps {
  section: EsgTopicSection;
  defaultOpen?: boolean;
}

function EsgTopicSectionCard({ section, defaultOpen = true }: EsgTopicSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="de-esg-topic-section">
      <button
        className="de-esg-topic-header"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={`de-esg-topic-chevron${open ? ' de-esg-topic-chevron--open' : ''}`}>
          <ChevronIcon open={open} />
        </span>
        <span className="de-esg-topic-title">{section.topic}</span>
        <span className="de-esg-topic-count">{section.articles.length} 則</span>
      </button>

      {open && (
        <div className="de-esg-topic-body">
          {section.articles.map((article, i) => (
            <article key={i} className="de-esg-news-card">
              <div className="de-esg-news-card-header">
                {article.site && (
                  <span className="de-esg-news-card-site">{article.site}</span>
                )}
                {article.date && (
                  <span className="de-esg-news-card-date">{article.date}</span>
                )}
              </div>
              <div className="de-esg-news-card-title">
                {article.url && article.url !== '#' ? (
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title}
                    <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 3 }}>
                      <ExternalLinkIcon />
                    </span>
                  </a>
                ) : (
                  article.title
                )}
              </div>
              {article.summary && (
                <p className="de-esg-news-card-summary">{article.summary}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

// ── BiweeklyEsgTab — uses queryCatgDetail + queryDataItemContent ──────────────

const BIWEEKLY_ESG_PREFIX = 'Bi-weekly ESG News Summary ';

function stripPrefix(itemName: string): string {
  if (itemName.startsWith(BIWEEKLY_ESG_PREFIX)) {
    return itemName.slice(BIWEEKLY_ESG_PREFIX.length);
  }
  return itemName;
}

function BiweeklyEsgTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';

  const [periods, setPeriods] = useState<NewsSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeriodId, setActivePeriodId] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [sections, setSections] = useState<EsgTopicSection[]>([]);

  // Load period list on mount
  useEffect(() => {
    queryCatgDetail().then((data) => {
      const items = data.result.items;
      setPeriods(items);
      if (items.length > 0) {
        setActivePeriodId(items[0].data_item_id);
      }
      setLoading(false);
    });
  }, []);

  // Load content when active period changes
  useEffect(() => {
    if (!activePeriodId) return;
    setContentLoading(true);
    setSections([]);
    queryDataItemContent(activePeriodId).then((markdown) => {
      if (markdown) {
        setSections(parseEsgMarkdown(markdown));
      }
      setContentLoading(false);
    });
  }, [activePeriodId]);

  return (
    <div className="de-tax-news-wrap">
      <div className="de-tax-news-header">
        <div className="de-tax-news-title" style={{ color: NEWS_ACCENT }}>Bi-weekly ESG News Summary</div>
        <div className="de-tax-news-sub">
          Every other Friday at noon, this digest utilizes AI to quickly filter, summarize, and present Taiwan and global ESG-related news, enabling you to stay abreast of market developments.
        </div>
      </div>

      {loading ? (
        <div className="de-esg-loading">Loading periods…</div>
      ) : (
        <div className="de-intl-tax-layout">
          {/* Left: period sidebar */}
          <nav className="de-intl-tax-sidebar" aria-label="Period list">
            <div className="de-intl-tax-sidebar-title">{zh ? '期間' : 'Period'}</div>
            {periods.length === 0 && (
              <div className="de-intl-tax-sidebar-item" style={{ opacity: 0.5 }}>—</div>
            )}
            {periods.map((item) => (
              <button
                key={item.data_item_id}
                className={`de-intl-tax-sidebar-item${activePeriodId === item.data_item_id ? ' active' : ''}`}
                style={activePeriodId === item.data_item_id ? { borderLeftColor: NEWS_ACCENT, color: NEWS_ACCENT } : {}}
                onClick={() => setActivePeriodId(item.data_item_id)}
              >
                <span className="de-intl-tax-sidebar-item-name">{stripPrefix(item.item_name)}</span>
              </button>
            ))}
          </nav>

          {/* Right: collapsible topic sections */}
          <div className="de-intl-tax-content">
            {contentLoading ? (
              <div className="de-esg-loading">Loading content…</div>
            ) : sections.length === 0 ? (
              <div className="de-esg-empty">{zh ? '暫無相關新聞' : 'No articles found.'}</div>
            ) : (
              <div className="de-esg-topics-wrap">
                {sections.map((section, i) => (
                  <EsgTopicSectionCard key={section.topic} section={section} defaultOpen={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default function DataCategoryContent({ params }: { params: { category: string } }) {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const isCapital = params.category === 'capital-markets';
  const isEsg = params.category === 'esg';
  const isGov = params.category === 'government-regulations';
  const isNewsSummary = params.category === 'news-summary';

  const CAPITAL_TABS = [
    { id: 'daily-quotes',      label: lang === 'zh' ? '每日收盤行情' : 'Daily Quotes' },
    { id: 'day-trading',       label: lang === 'zh' ? '每日沖銷交易標記及統計' : 'Objects and Statistics for Day Trading' },
    { id: 'margin',            label: lang === 'zh' ? '融資融券餘額' : 'Margin Transaction Summary' },
    { id: 'short-sale',        label: lang === 'zh' ? '信用額度總量管制餘額檔' : 'Daily Short Sale Balances' },
    { id: 'ex-dividend',       label: lang === 'zh' ? '除權息及上下市資訊檔' : 'Ex-Right/Dividend and List/Delist Data' },
    { id: 'foreign-investors', label: lang === 'zh' ? '外資投資持股統計' : 'Summary of Invested Amount of Foreign Investors' },
    { id: 'price-limit',       label: lang === 'zh' ? '漲跌幅度表檔' : 'Price Variation Limit' },
    { id: 'pe-ratio',          label: lang === 'zh' ? '個股日本益比、殖利率及股價淨值比' : 'Individual Stock P/E Ratio, Dividend Yield, and P/B Ratio' },
  ];

  const GOV_TABS = [
    { id: 'articles',             label: lang === 'zh' ? '相關法規' : 'Articles' },
    { id: 'taiwan-tax',           label: lang === 'zh' ? '每週台灣稅務快訊' : 'Weekly Taiwan Tax News Summary' },
    { id: 'intl-tax',             label: lang === 'zh' ? '每週國際稅務快訊' : 'Weekly International Tax News Summary' },
    { id: 'disqualified-vendors', label: lang === 'zh' ? '拒絕往來廠商公告' : 'Announcement of Disqualified Vendors' },
    { id: 'pollution-sources',    label: lang === 'zh' ? '列管事業污染源裁處資料' : 'Regulatory data on industrial pollution sources' },
    { id: 'labor-violations',     label: lang === 'zh' ? '違反勞動法令事業單位' : 'Violations of Labor Laws' },
  ];

  const NEWS_SUMMARY_TABS = [
    { id: 'biweekly-esg',  label: lang === 'zh' ? '雙週ESG新聞摘要' : 'Bi-weekly ESG News Summary' },
    { id: 'taiwan-news',   label: lang === 'zh' ? '每週台灣稅務快訊' : 'Weekly Taiwan Tax News Summary' },
    { id: 'intl-news',     label: lang === 'zh' ? '每週國際稅務快訊' : 'Weekly International Tax News Summary' },
  ];

  const defaultTab = isCapital ? 'daily-quotes' : isNewsSummary ? 'biweekly-esg' : 'articles';
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);

  const hasSubTabs = isEsg || isGov || isCapital || isNewsSummary;
  const subTabs = isCapital ? CAPITAL_TABS : isEsg ? ESG_TABS : isGov ? GOV_TABS : isNewsSummary ? NEWS_SUMMARY_TABS : [];

  const cat = CATEGORIES_MAP[params.category];

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
              <div className="de-cat-hero-overlay" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="de-cat-hero-img-wrap">
                <img
                  src={CAT_IMAGES[cat.slug] ?? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80'}
                  alt=""
                  className="de-cat-hero-img"
                  aria-hidden="true"
                />
              </div>
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
                {!isCapital && (
                  <div className="de-cat-hero-stats">
                    <span className="de-cat-stat" style={{ color: cat.color }}>{cat.items.length} records</span>
                    <span className="de-cat-stat-divider">·</span>
                    <span className="de-cat-stat">{allTags.length} tags</span>
                  </div>
                )}
              </div>
            </div>

            <div className="de-page-body">
              {hasSubTabs && (
                <SubTabBar tabs={subTabs} active={activeSubTab} color={cat.color} onChange={handleSubTabChange} />
              )}

              {/* Capital Markets tabs */}
              {isCapital && activeSubTab === 'daily-quotes'      && <CmDailyQuotesTab lang={lang} />}
              {isCapital && activeSubTab === 'day-trading'       && <CmDayTradingTab lang={lang} />}
              {isCapital && activeSubTab === 'margin'            && <CmMarginTab lang={lang} />}
              {isCapital && activeSubTab === 'short-sale'        && <CmShortSaleTab lang={lang} />}
              {isCapital && activeSubTab === 'ex-dividend'       && <CmExDividendTab lang={lang} />}
              {isCapital && activeSubTab === 'foreign-investors' && <CmForeignTab lang={lang} />}
              {isCapital && activeSubTab === 'price-limit'       && <CmPriceLimitTab lang={lang} />}
              {isCapital && activeSubTab === 'pe-ratio'          && <CmPeRatioTab lang={lang} />}

              {/* ESG / Gov tabs that show articles */}
              {!isCapital && activeSubTab === 'articles' && (
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

              {activeSubTab === 'reports'               && isEsg  && <EsgReportsTab />}
              {activeSubTab === 'taiwan-tax'            && isGov  && <TaiwanTaxNewsTab />}
              {activeSubTab === 'intl-tax'              && isGov  && <WorldMapTab />}
              {activeSubTab === 'disqualified-vendors'  && isGov  && <GovDisqualifiedTab lang={lang} />}
              {activeSubTab === 'pollution-sources'     && isGov  && <GovPollutionTab lang={lang} />}
              {activeSubTab === 'labor-violations'      && isGov  && <GovLaborTab lang={lang} />}

              {/* News Summary tabs */}
              {activeSubTab === 'biweekly-esg' && isNewsSummary && (
                <BiweeklyEsgTab lang={lang} />
              )}
              {activeSubTab === 'taiwan-news' && isNewsSummary && (
                <NewsDigestTab
                  items={cat.items}
                  tagSet={TAIWAN_TAGS}
                  heading="Weekly Taiwan Tax News Summary"
                  subheading="Taiwan-focused semiconductor industry highlights — TSMC operations, domestic policy, and fab updates."
                  lang={lang}
                  periodLabel="Week"
                />
              )}
              {activeSubTab === 'intl-news' && isNewsSummary && (
                <NewsDigestTab
                  items={cat.items}
                  tagSet={INTL_TAGS}
                  heading="Weekly International Tax News Summary"
                  subheading="International semiconductor market intelligence — NVIDIA, Apple, Intel, ASML, SK Hynix and beyond."
                  lang={lang}
                  periodLabel="Week"
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
