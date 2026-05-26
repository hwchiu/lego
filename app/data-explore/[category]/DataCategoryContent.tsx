'use client';

import { useState, useMemo, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { CATEGORIES_MAP, DataItem } from '@/app/data/dataExplore';
import { ESG_REPORTS } from '@/app/data/esgReports';
import { TAIWAN_TAX_NEWS, type TaxNewsItem } from '@/app/data/taxNews';
import WorldMapTab from '@/app/components/GovernmentRegulationsMap';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { queryCatgDetail, type CatgDetailType } from '@/app/lib/queryCatgDetail';
import { queryDataItemContent } from '@/app/lib/queryDataItemContent';
import { type NewsSummaryItem } from '@/app/data/newsSummaryData';
import { formatNumber } from '@/app/lib/formatters';
import { getPaginationRange } from '@/app/lib/paginationUtils';

const TAGS_VISIBLE_COUNT = 6;
const DEFAULT_CM_TAB = 'daily-quotes';
const CAPITAL_MARKETS_INNER_TAB_IDS = [
  'daily-quotes',
  'day-trading',
  'margin',
  'short-sale',
  'ex-dividend',
  'foreign-investors',
  'price-limit',
  'pe-ratio',
] as const;

function isCapitalMarketsInnerTab(tabId: string | null): tabId is (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number] {
  return tabId !== null && CAPITAL_MARKETS_INNER_TAB_IDS.includes(tabId as (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number]);
}

function resolveCapitalMarketsInnerTab(tabId: string | null): (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number] {
  return isCapitalMarketsInnerTab(tabId) ? tabId : DEFAULT_CM_TAB;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getYesterdayIsoDate(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return toIsoDate(d);
}

function addMonthsIsoDate(isoDate: string, months: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return toIsoDate(d);
}

function addDaysIsoDate(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

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

function InfoIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 6V9.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="4.15" r="0.65" fill="currentColor" />
    </svg>
  );
}

function CloseSmIcon() {
  return (
    <svg viewBox="0 0 14 14" width="10" height="10" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function tryOpenNativeDatePicker(inputElement: HTMLInputElement) {
  inputElement.showPicker?.();
}

// ── CSV download utility ──────────────────────────────────────────────────────

function downloadCSV(filename: string, headers: string[], dataRows: string[][]): void {
  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(','),
    ...dataRows.map((row) => row.map(escape).join(',')),
  ];
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Capital Markets numeric formatting helpers ────────────────────────────────

/** Format a numeric string (with optional commas/sign) to 2 d.p. with thousands separator. */
function fmtNum(v: string): string {
  if (v === '—' || v === '') return v;
  const isPos = v.startsWith('+');
  const num = parseFloat(v.replace(/,/g, ''));
  if (isNaN(num)) return v;
  return (isPos ? '+' : '') + formatNumber(Math.abs(num));
}

/** Format a percentage string (e.g. '22.53%' or '10%') to 2 d.p. with '%' suffix. */
function fmtPct(v: string): string {
  if (v === '—' || v === '') return v;
  const stripped = v.replace('%', '');
  const num = parseFloat(stripped.replace(/,/g, ''));
  if (isNaN(num)) return v;
  return formatNumber(num) + '%';
}

// ── Gov data-source disclosure popup ─────────────────────────────────────────

interface GovUpdateDateItem {
  id: string;
  year: string;
  date: string;
}

function GovInfoWrap() {
  const [isOpen, setIsOpen] = useState(false);
  const [updateDates, setUpdateDates] = useState<GovUpdateDateItem[]>([]);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchGovRows<GovUpdateDateItem>('getUpdateDate')
      .then((items) => setUpdateDates(items))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function getItem(id: string): GovUpdateDateItem {
    return updateDates.find((d) => d.id === id) ?? { id, year: '2025', date: '2025/06/09' };
  }

  const dv = getItem('disqualified-vendors');
  const ps = getItem('pollution-sources');
  const lb = getItem('labor-basic');
  const lg = getItem('labor-gender');
  const ls = getItem('labor-safety');
  const lm = getItem('labor-min-wage');

  return (
    <div className="de-gov-info-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`de-gov-info-btn${isOpen ? ' active' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <InfoIcon />
        <span>顯名聲明</span>
      </button>
      {isOpen && (
        <div className="de-gov-info-pop" role="dialog" aria-label="顯名聲明">
          <button
            type="button"
            className="de-gov-info-close"
            onClick={() => setIsOpen(false)}
            aria-label="關閉"
          >
            <CloseSmIcon />
          </button>
          <div className="de-gov-info-title">外部資料來源說明</div>
          <p className="de-gov-info-text">
            本網站使用部分內容來自臺灣政府資料開放平臺（https://data.gov.tw）．依據《政府資料開放授權條款》使用。原始資料版權歸資料提供單位所有．若有疑問請參考官方授權條款。
            <br /><br />
            [顯名聲明]<br />
            提供機關/行政院公共工程委員會 [{dv.year}] 招租組來廠商公告 {dv.date}<br />
            提供機關/環境部環境管理署 [{ps.year}] 列管事業汙染源裁處資料 {ps.date}<br />
            提供機關/勞動部 [{lb.year}] 違反勞動法令事業單位-勞動基準法 {lb.date}<br />
            提供機關/勞動部 [{lg.year}] 違反勞動法令事業單位-性別平等法 {lg.date}<br />
            提供機關/勞動部 [{ls.year}] 違反勞動法令事業單位-職業安全衛生法 {ls.date}<br />
            提供機關/勞動部 [{lm.year}] 違反勞動法令事業單位-最低工資法 {lm.date}<br /><br />
            此開放資料依政府資料開放授權條款 (Open Government Data License) 進行公眾釋出．使用者於遵守本條款各項規定之前提下，得利用之。政府資料開放授權條款：{' '}
            <a
              href="http://data.gov.tw/?q=principle"
              target="_blank"
              rel="noopener noreferrer"
              className="de-gov-info-link"
            >
              http://data.gov.tw/?q=principle
            </a>
          </p>
        </div>
      )}
    </div>
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
  { id: 'GlobalTech', label: 'GlobalTech', subLabel: 'GlobalTech Manufacturing', sectionTitle: 'Sustainability Reports' },
  { id: 'Apple', label: 'Apple', subLabel: 'Apple Inc.', sectionTitle: 'Environmental Progress Reports' },
];

function EsgReportsTab() {
  const [selectedCompany, setSelectedCompany] = useState<string>('GlobalTech');

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

interface CmDailyQuoteRow {
  trading_date: string;
  security_code: string;
  suspension_of_buy_after_sale_day_trading: string;
  volume: string;
  day_trading_value_of_buys: string;
  day_trading_value_of_sells?: string;
  trading_value_of_sells?: string;
  data_gen_dt?: string;
  data_gen_time?: string;
}

const CM_DAILY_QUOTES_FALLBACK_TEMPLATE = [
  { security_code: '9999', suspension_of_buy_after_sale_day_trading: 'N', volume: '6,430,000', day_trading_value_of_buys: '6,250,110,000', trading_value_of_sells: '6,198,930,000' },
  { security_code: '2317', suspension_of_buy_after_sale_day_trading: 'N', volume: '5,567,000', day_trading_value_of_buys: '659,581,000', trading_value_of_sells: '650,440,000' },
  { security_code: '2454', suspension_of_buy_after_sale_day_trading: 'Y', volume: '2,010,000', day_trading_value_of_buys: '1,830,220,000', trading_value_of_sells: '1,812,740,000' },
  { security_code: '2881', suspension_of_buy_after_sale_day_trading: 'N', volume: '3,763,000', day_trading_value_of_buys: '319,882,000', trading_value_of_sells: '318,211,000' },
  { security_code: '2882', suspension_of_buy_after_sale_day_trading: 'N', volume: '4,232,000', day_trading_value_of_buys: '410,401,000', trading_value_of_sells: '408,702,000' },
  { security_code: '2891', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,458,000', day_trading_value_of_buys: '270,552,000', trading_value_of_sells: '269,399,000' },
  { security_code: '2412', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,980,000', day_trading_value_of_buys: '220,450,000', trading_value_of_sells: '218,720,000' },
  { security_code: '3045', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,540,000', day_trading_value_of_buys: '185,200,000', trading_value_of_sells: '183,500,000' },
  { security_code: '1301', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,100,000', day_trading_value_of_buys: '198,800,000', trading_value_of_sells: '197,100,000' },
  { security_code: '1216', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,230,000', day_trading_value_of_buys: '85,600,000', trading_value_of_sells: '84,900,000' },
  { security_code: '2330', suspension_of_buy_after_sale_day_trading: 'N', volume: '8,750,000', day_trading_value_of_buys: '9,100,500,000', trading_value_of_sells: '9,050,200,000' },
  { security_code: '2303', suspension_of_buy_after_sale_day_trading: 'N', volume: '3,120,000', day_trading_value_of_buys: '560,400,000', trading_value_of_sells: '558,100,000' },
  { security_code: '2308', suspension_of_buy_after_sale_day_trading: 'Y', volume: '1,870,000', day_trading_value_of_buys: '312,700,000', trading_value_of_sells: '311,200,000' },
  { security_code: '2886', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,450,000', day_trading_value_of_buys: '281,300,000', trading_value_of_sells: '280,100,000' },
  { security_code: '2884', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,980,000', day_trading_value_of_buys: '189,600,000', trading_value_of_sells: '188,300,000' },
  { security_code: '2357', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,340,000', day_trading_value_of_buys: '145,200,000', trading_value_of_sells: '144,500,000' },
  { security_code: '2395', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,670,000', day_trading_value_of_buys: '432,100,000', trading_value_of_sells: '430,800,000' },
  { security_code: '3711', suspension_of_buy_after_sale_day_trading: 'Y', volume: '980,000', day_trading_value_of_buys: '125,400,000', trading_value_of_sells: '124,700,000' },
  { security_code: '6505', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,230,000', day_trading_value_of_buys: '268,900,000', trading_value_of_sells: '267,200,000' },
  { security_code: '1303', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,560,000', day_trading_value_of_buys: '175,300,000', trading_value_of_sells: '174,100,000' },
  { security_code: '2002', suspension_of_buy_after_sale_day_trading: 'N', volume: '3,450,000', day_trading_value_of_buys: '290,700,000', trading_value_of_sells: '289,300,000' },
  { security_code: '1402', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,120,000', day_trading_value_of_buys: '68,500,000', trading_value_of_sells: '68,100,000' },
  { security_code: '2885', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,780,000', day_trading_value_of_buys: '342,600,000', trading_value_of_sells: '341,100,000' },
  { security_code: '2892', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,890,000', day_trading_value_of_buys: '215,400,000', trading_value_of_sells: '214,200,000' },
  { security_code: '5880', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,340,000', day_trading_value_of_buys: '321,800,000', trading_value_of_sells: '320,500,000' },
  { security_code: '2912', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,450,000', day_trading_value_of_buys: '178,200,000', trading_value_of_sells: '177,600,000' },
  { security_code: '1326', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,010,000', day_trading_value_of_buys: '240,100,000', trading_value_of_sells: '239,400,000' },
  { security_code: '2207', suspension_of_buy_after_sale_day_trading: 'Y', volume: '1,760,000', day_trading_value_of_buys: '156,300,000', trading_value_of_sells: '155,800,000' },
  { security_code: '6669', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,320,000', day_trading_value_of_buys: '198,700,000', trading_value_of_sells: '197,900,000' },
  { security_code: '3034', suspension_of_buy_after_sale_day_trading: 'N', volume: '870,000', day_trading_value_of_buys: '112,500,000', trading_value_of_sells: '111,900,000' },
  { security_code: '2823', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,580,000', day_trading_value_of_buys: '187,600,000', trading_value_of_sells: '186,800,000' },
  { security_code: '2880', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,670,000', day_trading_value_of_buys: '305,400,000', trading_value_of_sells: '304,200,000' },
  { security_code: '8046', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,230,000', day_trading_value_of_buys: '148,900,000', trading_value_of_sells: '148,200,000' },
  { security_code: '3008', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,450,000', day_trading_value_of_buys: '342,100,000', trading_value_of_sells: '341,300,000' },
  { security_code: '2379', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,100,000', day_trading_value_of_buys: '256,700,000', trading_value_of_sells: '255,900,000' },
  { security_code: '4904', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,890,000', day_trading_value_of_buys: '176,400,000', trading_value_of_sells: '175,700,000' },
  { security_code: '2474', suspension_of_buy_after_sale_day_trading: 'Y', volume: '1,340,000', day_trading_value_of_buys: '189,500,000', trading_value_of_sells: '188,800,000' },
  { security_code: '2376', suspension_of_buy_after_sale_day_trading: 'N', volume: '980,000', day_trading_value_of_buys: '132,100,000', trading_value_of_sells: '131,500,000' },
  { security_code: '3481', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,670,000', day_trading_value_of_buys: '212,300,000', trading_value_of_sells: '211,600,000' },
  { security_code: '2337', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,120,000', day_trading_value_of_buys: '87,600,000', trading_value_of_sells: '87,100,000' },
  { security_code: '2327', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,450,000', day_trading_value_of_buys: '165,400,000', trading_value_of_sells: '164,700,000' },
  { security_code: '2344', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,230,000', day_trading_value_of_buys: '278,900,000', trading_value_of_sells: '277,600,000' },
  { security_code: '3474', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,560,000', day_trading_value_of_buys: '189,700,000', trading_value_of_sells: '188,900,000' },
  { security_code: '2383', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,890,000', day_trading_value_of_buys: '221,300,000', trading_value_of_sells: '220,400,000' },
  { security_code: '6415', suspension_of_buy_after_sale_day_trading: 'Y', volume: '1,670,000', day_trading_value_of_buys: '278,500,000', trading_value_of_sells: '277,200,000' },
  { security_code: '2049', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,230,000', day_trading_value_of_buys: '132,400,000', trading_value_of_sells: '131,900,000' },
  { security_code: '1590', suspension_of_buy_after_sale_day_trading: 'N', volume: '980,000', day_trading_value_of_buys: '98,700,000', trading_value_of_sells: '98,200,000' },
  { security_code: '2356', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,340,000', day_trading_value_of_buys: '143,200,000', trading_value_of_sells: '142,700,000' },
  { security_code: '2385', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,780,000', day_trading_value_of_buys: '198,400,000', trading_value_of_sells: '197,600,000' },
  { security_code: '3006', suspension_of_buy_after_sale_day_trading: 'N', volume: '870,000', day_trading_value_of_buys: '78,900,000', trading_value_of_sells: '78,400,000' },
  { security_code: '2388', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,120,000', day_trading_value_of_buys: '123,500,000', trading_value_of_sells: '122,900,000' },
  { security_code: '3324', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,560,000', day_trading_value_of_buys: '167,800,000', trading_value_of_sells: '167,100,000' },
  { security_code: '4938', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,100,000', day_trading_value_of_buys: '232,400,000', trading_value_of_sells: '231,700,000' },
  { security_code: '3037', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,670,000', day_trading_value_of_buys: '178,900,000', trading_value_of_sells: '178,200,000' },
  { security_code: '2498', suspension_of_buy_after_sale_day_trading: 'Y', volume: '1,450,000', day_trading_value_of_buys: '165,300,000', trading_value_of_sells: '164,600,000' },
  { security_code: '6271', suspension_of_buy_after_sale_day_trading: 'N', volume: '980,000', day_trading_value_of_buys: '112,100,000', trading_value_of_sells: '111,500,000' },
  { security_code: '2301', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,230,000', day_trading_value_of_buys: '132,800,000', trading_value_of_sells: '132,200,000' },
  { security_code: '5871', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,890,000', day_trading_value_of_buys: '243,600,000', trading_value_of_sells: '242,800,000' },
  { security_code: '2347', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,560,000', day_trading_value_of_buys: '178,400,000', trading_value_of_sells: '177,700,000' },
  { security_code: '3533', suspension_of_buy_after_sale_day_trading: 'N', volume: '1,120,000', day_trading_value_of_buys: '134,500,000', trading_value_of_sells: '133,900,000' },
  { security_code: '6443', suspension_of_buy_after_sale_day_trading: 'N', volume: '870,000', day_trading_value_of_buys: '98,400,000', trading_value_of_sells: '97,900,000' },
] as const;

const CM_COMPANIES = [
  { code: '9999', nameZh: '全球科技', nameEn: 'GlobalTech' },
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

function getCmDayTradingValueOfSells(row: CmDailyQuoteRow): string {
  return row.day_trading_value_of_sells ?? row.trading_value_of_sells ?? '';
}

function getCmUpdateDatetimeText(row: CmDailyQuoteRow): string {
  const dt = row.data_gen_dt?.trim() ?? '';
  const tm = row.data_gen_time?.trim() ?? '';
  const value = `${dt}${dt && tm ? ' ' : ''}${tm}`.trim();
  return value || '—';
}

interface CmDayTradingColumn {
  id:
    | 'security_code'
    | 'trading_date'
    | 'suspension_of_buy_after_sale_day_trading'
    | 'volume'
    | 'day_trading_value_of_buys'
    | 'day_trading_value_of_sells'
    | 'tsmc_updatetime';
  labels: { zh: string; en: string };
  value: (row: CmDailyQuoteRow) => string;
  tableVisible: 'Y' | 'N';
  freezePane: 'Y' | 'N';
  className?: string;
}

const CM_DAY_TRADING_COLUMNS: CmDayTradingColumn[] = [
  {
    id: 'security_code',
    labels: { zh: '標的代碼', en: 'Security Code' },
    value: (row) => row.security_code,
    tableVisible: 'Y',
    freezePane: 'Y',
    className: 'code',
  },
  {
    id: 'trading_date',
    labels: { zh: '成交日期', en: 'Trading Date' },
    value: (row) => row.trading_date,
    tableVisible: 'Y',
    freezePane: 'N',
  },
  {
    id: 'suspension_of_buy_after_sale_day_trading',
    labels: { zh: '暫停現股賣出後現款買進當沖註記', en: 'Suspension Of Buy After Sale Day Trading' },
    value: (row) => row.suspension_of_buy_after_sale_day_trading,
    tableVisible: 'Y',
    freezePane: 'N',
  },
  {
    id: 'volume',
    labels: { zh: '當日沖銷交易成交股數', en: 'Day Trading Volume' },
    value: (row) => row.volume,
    tableVisible: 'Y',
    freezePane: 'N',
    className: 'num',
  },
  {
    id: 'day_trading_value_of_buys',
    labels: { zh: '當日沖銷交易買進成交金額', en: 'Day Trading Value Of Buys' },
    value: (row) => row.day_trading_value_of_buys,
    tableVisible: 'Y',
    freezePane: 'N',
    className: 'num',
  },
  {
    id: 'day_trading_value_of_sells',
    labels: { zh: '當日沖銷交易賣出成交金額', en: 'Day Trading Value Of Sells' },
    value: (row) => getCmDayTradingValueOfSells(row),
    tableVisible: 'Y',
    freezePane: 'N',
    className: 'num',
  },
  {
    id: 'tsmc_updatetime',
    labels: { zh: '台積更新時間', en: 'TSMC Updatetime' },
    value: (row) => getCmUpdateDatetimeText(row),
    tableVisible: 'Y',
    freezePane: 'N',
  },
];

interface CmMarginTransactionRow {
  security_code: string;
  security_type: string;
  total_mp_reduction_limit: string;
  prev_mp_balance: string;
  daily_mp_purchase: string;
  daily_mp_redemption: string;
  daily_mp_cash_repayment: string;
  daily_mp_balance: string;
  margin_trading_limit: string;
  prev_ss_balance: string;
  daily_ss_sale: string;
  daily_ss_repayment: string;
  daily_ss_stock_repayment: string;
  daily_ss_balance: string;
  mp_restriction_code: string;
  ss_restriction_code: string;
  ss_ge_60_percent_mp_flag: string;
  price_volatility_flag: string;
  equity_concentration_flag: string;
  abnormal_volume_flag: string;
  disposition_measures_flag: string;
  tdr_mp_reduction: string;
  mp_balance_for_securities_financing: string;
  ss_balance_for_securities_financing: string;
  supervisory_mp_reduction: string;
  supervisory_ss_margin_increment: string;
  total_ss_margin_increment: string;
  data_gen_dt: string;
  data_gen_time: string;
}

interface CmMarginColumn {
  id: string;
  labels: { zh: string; en: string };
  value: (row: CmMarginTransactionRow) => string;
  tableVisible: 'Y' | 'N';
  freezePane: 'Y' | 'N';
  className?: string;
}

const CM_MARGIN_ALL_COLUMNS: CmMarginColumn[] = [
  { id: 'security_code', labels: { zh: '證券代號', en: 'Security Code' }, value: (row) => row.security_code, tableVisible: 'Y', freezePane: 'Y', className: 'code' },
  { id: 'security_type', labels: { zh: '證券類', en: 'Security Type' }, value: (row) => row.security_type, tableVisible: 'N', freezePane: 'N' },
  { id: 'total_mp_reduction_limit', labels: { zh: '降低融資比率(總計)', en: 'Total Reduction of Margin Purchase Limit' }, value: (row) => row.total_mp_reduction_limit, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'prev_mp_balance', labels: { zh: '昨日融資餘額', en: 'Last Day Balance of Margin Purchase' }, value: (row) => row.prev_mp_balance, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_mp_purchase', labels: { zh: '今日融資買進', en: 'New Margin Purchase' }, value: (row) => row.daily_mp_purchase, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_mp_redemption', labels: { zh: '今日融資賣出', en: 'Redemption of Margin Purchase' }, value: (row) => row.daily_mp_redemption, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_mp_cash_repayment', labels: { zh: '今日現金償還', en: 'Outstanding of Margin Purchase' }, value: (row) => row.daily_mp_cash_repayment, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_mp_balance', labels: { zh: '今日融資餘額', en: 'Balance of Margin Purchase' }, value: (row) => row.daily_mp_balance, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'margin_trading_limit', labels: { zh: '信用交易限額', en: 'Margin Trading Limit' }, value: (row) => row.margin_trading_limit, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'prev_ss_balance', labels: { zh: '昨日融券餘額', en: 'Last Day Balance of Short Sale' }, value: (row) => row.prev_ss_balance, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_ss_sale', labels: { zh: '今日融券賣出', en: 'Redemption of Short Sale' }, value: (row) => row.daily_ss_sale, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_ss_repayment', labels: { zh: '今日融券買進', en: 'New Short Sale' }, value: (row) => row.daily_ss_repayment, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_ss_stock_repayment', labels: { zh: '今日現券償還', en: 'Outstanding of Short Sale' }, value: (row) => row.daily_ss_stock_repayment, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_ss_balance', labels: { zh: '今日融券餘額', en: 'Balance of Short Sale' }, value: (row) => row.daily_ss_balance, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'mp_restriction_code', labels: { zh: '融資限制碼', en: 'Suspension of Margin Purchase' }, value: (row) => row.mp_restriction_code, tableVisible: 'N', freezePane: 'N' },
  { id: 'ss_restriction_code', labels: { zh: '融券限制碼', en: 'Suspension of Short Sale' }, value: (row) => row.ss_restriction_code, tableVisible: 'N', freezePane: 'N' },
  { id: 'ss_ge_60_percent_mp_flag', labels: { zh: '融券餘額≧融資餘額60%', en: 'Remain of Short Sale ≧ 60% of Remain of margin' }, value: (row) => row.ss_ge_60_percent_mp_flag, tableVisible: 'N', freezePane: 'N' },
  { id: 'price_volatility_flag', labels: { zh: '股價波動過度劇烈註記', en: 'Short Sale is too Volatile' }, value: (row) => row.price_volatility_flag, tableVisible: 'N', freezePane: 'N' },
  { id: 'equity_concentration_flag', labels: { zh: '股權過度集中註記', en: 'Equity Ownership is overly Concentrated' }, value: (row) => row.equity_concentration_flag, tableVisible: 'N', freezePane: 'N' },
  { id: 'abnormal_volume_flag', labels: { zh: '成交量過度異常', en: 'Trading Volume is excessively Abnormal' }, value: (row) => row.abnormal_volume_flag, tableVisible: 'N', freezePane: 'N' },
  { id: 'disposition_measures_flag', labels: { zh: '監視第二次處置註記', en: 'Stock under Disposition Measures two or more times (inclusive)' }, value: (row) => row.disposition_measures_flag, tableVisible: 'N', freezePane: 'N' },
  { id: 'tdr_mp_reduction', labels: { zh: 'tdr兌回異常降低融資比率', en: 'Margin Purchase Reduction' }, value: (row) => row.tdr_mp_reduction, tableVisible: 'N', freezePane: 'N' },
  { id: 'mp_balance_for_securities_financing', labels: { zh: '融資餘額中屬證金部分', en: 'Balance of Margin Purchase belonging to Securities' }, value: (row) => row.mp_balance_for_securities_financing, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'ss_balance_for_securities_financing', labels: { zh: '融券餘額中屬證金部分', en: 'Balance of Short Sale belonging to Securities' }, value: (row) => row.ss_balance_for_securities_financing, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'supervisory_mp_reduction', labels: { zh: '監視業務督導會報降低融資比率', en: 'Margin Purchase Reduction of Margin Purchase Leverage Limit' }, value: (row) => row.supervisory_mp_reduction, tableVisible: 'N', freezePane: 'N' },
  { id: 'supervisory_ss_margin_increment', labels: { zh: '監視業務督導會報提高融券保證金成數', en: 'Increment of Short Sale Margin Requirement' }, value: (row) => row.supervisory_ss_margin_increment, tableVisible: 'N', freezePane: 'N' },
  { id: 'total_ss_margin_increment', labels: { zh: '提高融券保證金成數(總計)', en: 'Total of Short Sale Margin Requirement Increment' }, value: (row) => row.total_ss_margin_increment, tableVisible: 'N', freezePane: 'N' },
  { id: 'tsmc_updatetime', labels: { zh: '台積更新時間', en: 'TSMC Updatetime' }, value: (row) => `${row.data_gen_dt}${row.data_gen_time ? ` ${row.data_gen_time}` : ''}`.trim() || '—', tableVisible: 'Y', freezePane: 'N' },
];

const CM_MARGIN_MOCK_DATA: CmMarginTransactionRow[] = [
  { security_code: '2330', security_type: 'TSE', total_mp_reduction_limit: '5%', prev_mp_balance: '132,521,000', daily_mp_purchase: '4,812,000', daily_mp_redemption: '3,998,000', daily_mp_cash_repayment: '721,000', daily_mp_balance: '132,614,000', margin_trading_limit: '500,000,000', prev_ss_balance: '12,987,000', daily_ss_sale: '612,000', daily_ss_repayment: '489,000', daily_ss_stock_repayment: '121,000', daily_ss_balance: '12,989,000', mp_restriction_code: 'N', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'N', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '12,341,000', ss_balance_for_securities_financing: '1,452,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'N', total_ss_margin_increment: '0%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2317', security_type: 'TSE', total_mp_reduction_limit: '3%', prev_mp_balance: '98,320,000', daily_mp_purchase: '3,120,000', daily_mp_redemption: '2,984,000', daily_mp_cash_repayment: '510,000', daily_mp_balance: '97,946,000', margin_trading_limit: '420,000,000', prev_ss_balance: '9,231,000', daily_ss_sale: '435,000', daily_ss_repayment: '402,000', daily_ss_stock_repayment: '95,000', daily_ss_balance: '9,169,000', mp_restriction_code: 'N', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'N', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '9,420,000', ss_balance_for_securities_financing: '962,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'N', total_ss_margin_increment: '0%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2454', security_type: 'TSE', total_mp_reduction_limit: '8%', prev_mp_balance: '66,780,000', daily_mp_purchase: '2,104,000', daily_mp_redemption: '2,361,000', daily_mp_cash_repayment: '440,000', daily_mp_balance: '66,083,000', margin_trading_limit: '300,000,000', prev_ss_balance: '5,675,000', daily_ss_sale: '315,000', daily_ss_repayment: '358,000', daily_ss_stock_repayment: '66,000', daily_ss_balance: '5,566,000', mp_restriction_code: 'A', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'Y', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '6,880,000', ss_balance_for_securities_financing: '730,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'Y', total_ss_margin_increment: '5%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2881', security_type: 'TSE', total_mp_reduction_limit: '2%', prev_mp_balance: '43,190,000', daily_mp_purchase: '1,250,000', daily_mp_redemption: '1,110,000', daily_mp_cash_repayment: '305,000', daily_mp_balance: '43,025,000', margin_trading_limit: '220,000,000', prev_ss_balance: '3,510,000', daily_ss_sale: '156,000', daily_ss_repayment: '149,000', daily_ss_stock_repayment: '30,000', daily_ss_balance: '3,487,000', mp_restriction_code: 'N', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'N', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '4,503,000', ss_balance_for_securities_financing: '401,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'N', total_ss_margin_increment: '0%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2882', security_type: 'TSE', total_mp_reduction_limit: '2%', prev_mp_balance: '41,870,000', daily_mp_purchase: '1,205,000', daily_mp_redemption: '1,081,000', daily_mp_cash_repayment: '276,000', daily_mp_balance: '41,718,000', margin_trading_limit: '210,000,000', prev_ss_balance: '3,201,000', daily_ss_sale: '140,000', daily_ss_repayment: '132,000', daily_ss_stock_repayment: '26,000', daily_ss_balance: '3,183,000', mp_restriction_code: 'N', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'N', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '4,255,000', ss_balance_for_securities_financing: '372,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'N', total_ss_margin_increment: '0%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2891', security_type: 'TSE', total_mp_reduction_limit: '2%', prev_mp_balance: '37,440,000', daily_mp_purchase: '1,093,000', daily_mp_redemption: '981,000', daily_mp_cash_repayment: '241,000', daily_mp_balance: '37,311,000', margin_trading_limit: '200,000,000', prev_ss_balance: '2,983,000', daily_ss_sale: '128,000', daily_ss_repayment: '121,000', daily_ss_stock_repayment: '23,000', daily_ss_balance: '2,967,000', mp_restriction_code: 'N', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'N', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '3,802,000', ss_balance_for_securities_financing: '351,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'N', total_ss_margin_increment: '0%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2412', security_type: 'TSE', total_mp_reduction_limit: '1%', prev_mp_balance: '18,412,000', daily_mp_purchase: '523,000', daily_mp_redemption: '488,000', daily_mp_cash_repayment: '101,000', daily_mp_balance: '18,346,000', margin_trading_limit: '150,000,000', prev_ss_balance: '1,322,000', daily_ss_sale: '58,000', daily_ss_repayment: '53,000', daily_ss_stock_repayment: '10,000', daily_ss_balance: '1,317,000', mp_restriction_code: 'N', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'N', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '1,942,000', ss_balance_for_securities_financing: '151,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'N', total_ss_margin_increment: '0%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '3045', security_type: 'TSE', total_mp_reduction_limit: '1%', prev_mp_balance: '16,512,000', daily_mp_purchase: '501,000', daily_mp_redemption: '472,000', daily_mp_cash_repayment: '96,000', daily_mp_balance: '16,445,000', margin_trading_limit: '140,000,000', prev_ss_balance: '1,240,000', daily_ss_sale: '54,000', daily_ss_repayment: '48,000', daily_ss_stock_repayment: '10,000', daily_ss_balance: '1,236,000', mp_restriction_code: 'N', ss_restriction_code: 'N', ss_ge_60_percent_mp_flag: 'N', price_volatility_flag: 'N', equity_concentration_flag: 'N', abnormal_volume_flag: 'N', disposition_measures_flag: 'N', tdr_mp_reduction: 'N', mp_balance_for_securities_financing: '1,823,000', ss_balance_for_securities_financing: '144,000', supervisory_mp_reduction: 'N', supervisory_ss_margin_increment: 'N', total_ss_margin_increment: '0%', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
];

// ── Daily Short Sale Balances (信用額度總量管制餘額檔) ─────────────────────────

interface CmDailyShortSaleBalanceRow {
  security_code: string;
  prev_day_m_short_sale_balance: string;
  daily_m_short_sale_volume: string;
  daily_m_short_cover_volume: string;
  daily_m_stock_redemption_volume: string;
  daily_m_short_sale_balance: string;
  daily_m_short_sale_quota: string;
  prev_day_sbl_short_sale_balance: string;
  daily_sbl_short_sale_volume: string;
  daily_sbl_return_volume: string;
  daily_sbl_adjustment_volume: string;
  daily_sbl_short_sale_balance: string;
  daily_sbl_next_day_quota: string;
  margin_trade_status: string;
  sbl_trade_status: string;
  data_gen_dt: string;
  data_gen_time: string;
}

interface CmDailyShortSaleColumn {
  id: string;
  labels: { zh: string; en: string };
  value: (row: CmDailyShortSaleBalanceRow) => string;
  tableVisible: 'Y' | 'N';
  freezePane: 'Y' | 'N';
  className?: string;
}

const CM_DAILY_SHORT_SALE_ALL_COLUMNS: CmDailyShortSaleColumn[] = [
  { id: 'security_code',                  labels: { zh: '證券代號',             en: 'Security Code' },                                       value: (r) => r.security_code,                  tableVisible: 'Y', freezePane: 'Y', className: 'code' },
  { id: 'prev_day_m_short_sale_balance',  labels: { zh: '前日融券餘額股數',     en: 'Previous day balance of Margin Short Sales' },          value: (r) => r.prev_day_m_short_sale_balance,  tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_m_short_sale_volume',      labels: { zh: '本日融券賣出股數',     en: 'Short Sales of Margin Short Sales' },                   value: (r) => r.daily_m_short_sale_volume,      tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_m_short_cover_volume',     labels: { zh: '本日融券買進股數',     en: 'Short Covering of Margin Short Sales' },                value: (r) => r.daily_m_short_cover_volume,     tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_m_stock_redemption_volume',labels: { zh: '本日現券償還股數',     en: 'Stock Redemption of Margin Short Sales' },              value: (r) => r.daily_m_stock_redemption_volume,tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_m_short_sale_balance',     labels: { zh: '本日融券餘額股數',     en: 'Current day balance of Margin Short Sales' },           value: (r) => r.daily_m_short_sale_balance,     tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_m_short_sale_quota',       labels: { zh: '本日融券限額',         en: 'Quota of Margin Short Sales' },                         value: (r) => r.daily_m_short_sale_quota,       tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'prev_day_sbl_short_sale_balance',labels: { zh: '前日借券賣出餘額股數', en: 'Previous day balance of Sbl Short Sales' },             value: (r) => r.prev_day_sbl_short_sale_balance,tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_sbl_short_sale_volume',    labels: { zh: '本日市場借券賣出股數', en: 'Current day short sales of Sbl Short Sales' },          value: (r) => r.daily_sbl_short_sale_volume,    tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_sbl_return_volume',        labels: { zh: '本日還券股數',         en: 'Current day returns of Sbl Short Sales' },              value: (r) => r.daily_sbl_return_volume,        tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_sbl_adjustment_volume',    labels: { zh: '本日調整股數',         en: 'Current day adjustments of Sbl Short Sales' },          value: (r) => r.daily_sbl_adjustment_volume,    tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_sbl_short_sale_balance',   labels: { zh: '本日借券賣出餘額股數', en: 'Current day balance of Sbl Short Sales' },              value: (r) => r.daily_sbl_short_sale_balance,   tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'daily_sbl_next_day_quota',       labels: { zh: '本日可借券賣出限額',   en: 'Quota for the next day of Sbl Short Sales' },           value: (r) => r.daily_sbl_next_day_quota,       tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'margin_trade_status',            labels: { zh: '信用交易狀態',         en: 'Eligible Trade' },                                      value: (r) => r.margin_trade_status,            tableVisible: 'N', freezePane: 'N' },
  { id: 'sbl_trade_status',               labels: { zh: '借券交易狀態',         en: 'Suspension of Sbl Short Sales' },                       value: (r) => r.sbl_trade_status,               tableVisible: 'N', freezePane: 'N' },
  { id: 'tsmc_updatetime',                labels: { zh: '台積更新時間',         en: 'TSMC Updatetime' },                                     value: (r) => `${r.data_gen_dt}${r.data_gen_time ? ` ${r.data_gen_time}` : ''}`.trim() || '—', tableVisible: 'Y', freezePane: 'N' },
];

const CM_DAILY_SHORT_SALE_MOCK_DATA: CmDailyShortSaleBalanceRow[] = [
  { security_code: '2330', prev_day_m_short_sale_balance: '12,987,000', daily_m_short_sale_volume: '612,000',   daily_m_short_cover_volume: '489,000',   daily_m_stock_redemption_volume: '121,000', daily_m_short_sale_balance: '12,989,000', daily_m_short_sale_quota: '50,000,000',  prev_day_sbl_short_sale_balance: '45,231,000', daily_sbl_short_sale_volume: '2,341,000', daily_sbl_return_volume: '1,982,000', daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '45,590,000', daily_sbl_next_day_quota: '18,000,000', margin_trade_status: 'N', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2317', prev_day_m_short_sale_balance: '9,231,000',  daily_m_short_sale_volume: '435,000',   daily_m_short_cover_volume: '402,000',   daily_m_stock_redemption_volume: '95,000',  daily_m_short_sale_balance: '9,169,000',  daily_m_short_sale_quota: '40,000,000',  prev_day_sbl_short_sale_balance: '31,452,000', daily_sbl_short_sale_volume: '1,523,000', daily_sbl_return_volume: '1,341,000', daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '31,634,000', daily_sbl_next_day_quota: '12,000,000', margin_trade_status: 'N', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2454', prev_day_m_short_sale_balance: '5,675,000',  daily_m_short_sale_volume: '315,000',   daily_m_short_cover_volume: '358,000',   daily_m_stock_redemption_volume: '66,000',  daily_m_short_sale_balance: '5,566,000',  daily_m_short_sale_quota: '25,000,000',  prev_day_sbl_short_sale_balance: '18,923,000', daily_sbl_short_sale_volume: '934,000',   daily_sbl_return_volume: '812,000',   daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '19,045,000', daily_sbl_next_day_quota: '7,000,000',  margin_trade_status: 'A', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2881', prev_day_m_short_sale_balance: '3,510,000',  daily_m_short_sale_volume: '156,000',   daily_m_short_cover_volume: '149,000',   daily_m_stock_redemption_volume: '30,000',  daily_m_short_sale_balance: '3,487,000',  daily_m_short_sale_quota: '18,000,000',  prev_day_sbl_short_sale_balance: '12,341,000', daily_sbl_short_sale_volume: '612,000',   daily_sbl_return_volume: '534,000',   daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '12,419,000', daily_sbl_next_day_quota: '5,000,000',  margin_trade_status: 'N', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2882', prev_day_m_short_sale_balance: '3,201,000',  daily_m_short_sale_volume: '140,000',   daily_m_short_cover_volume: '132,000',   daily_m_stock_redemption_volume: '26,000',  daily_m_short_sale_balance: '3,183,000',  daily_m_short_sale_quota: '16,000,000',  prev_day_sbl_short_sale_balance: '11,234,000', daily_sbl_short_sale_volume: '541,000',   daily_sbl_return_volume: '489,000',   daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '11,286,000', daily_sbl_next_day_quota: '4,500,000',  margin_trade_status: 'N', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2891', prev_day_m_short_sale_balance: '2,983,000',  daily_m_short_sale_volume: '128,000',   daily_m_short_cover_volume: '121,000',   daily_m_stock_redemption_volume: '23,000',  daily_m_short_sale_balance: '2,967,000',  daily_m_short_sale_quota: '15,000,000',  prev_day_sbl_short_sale_balance: '9,812,000',  daily_sbl_short_sale_volume: '456,000',   daily_sbl_return_volume: '412,000',   daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '9,856,000',  daily_sbl_next_day_quota: '4,000,000',  margin_trade_status: 'N', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2412', prev_day_m_short_sale_balance: '1,322,000',  daily_m_short_sale_volume: '58,000',    daily_m_short_cover_volume: '53,000',    daily_m_stock_redemption_volume: '10,000',  daily_m_short_sale_balance: '1,317,000',  daily_m_short_sale_quota: '8,000,000',   prev_day_sbl_short_sale_balance: '4,523,000',  daily_sbl_short_sale_volume: '214,000',   daily_sbl_return_volume: '196,000',   daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '4,541,000',  daily_sbl_next_day_quota: '2,000,000',  margin_trade_status: 'N', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '3045', prev_day_m_short_sale_balance: '1,240,000',  daily_m_short_sale_volume: '54,000',    daily_m_short_cover_volume: '48,000',    daily_m_stock_redemption_volume: '10,000',  daily_m_short_sale_balance: '1,236,000',  daily_m_short_sale_quota: '7,000,000',   prev_day_sbl_short_sale_balance: '4,102,000',  daily_sbl_short_sale_volume: '195,000',   daily_sbl_return_volume: '177,000',   daily_sbl_adjustment_volume: '0',       daily_sbl_short_sale_balance: '4,120,000',  daily_sbl_next_day_quota: '1,800,000',  margin_trade_status: 'N', sbl_trade_status: 'N', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
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

interface CmExRightDividendRow {
  security_code: string;
  effective_date: string;
  security_abbr_name: string;
  data_code: string;
  prev_close_price: string;
  ex_ref_price: string;
  limit_up_price: string;
  limit_down_price: string;
  open_ref_price: string;
  auction_ref_price: string;
  right_dividend_type: string;
  right_value_note: string;
  right_value: string;
  dividend_value: string;
  stock_dividend_per_1000_shares: string;
  stock_dividend_ratio: string;
  employee_bonus_capitalization: string;
  employee_bonus_stock_dividend_ratio: string;
  cash_capital_increase: string;
  cash_capital_increase_ratio: string;
  subscription_price_per_share: string;
  public_underwriting_shares: string;
  employee_subscription_shares: string;
  existing_shareholder_subscription_shares: string;
  shareholder_subscription_per_1000_shares: string;
  data_gen_dt: string;
  data_gen_time: string;
}

interface CmExRightDividendColumn {
  id: string;
  labels: { zh: string; en: string };
  value: (row: CmExRightDividendRow) => string;
  tableVisible: 'Y' | 'N';
  freezePane: 'Y' | 'N';
  className?: string;
}

const CM_EX_RIGHT_DIVIDEND_ALL_COLUMNS: CmExRightDividendColumn[] = [
  { id: 'security_code', labels: { zh: '股票代號', en: 'Security Code' }, value: (r) => r.security_code, tableVisible: 'Y', freezePane: 'Y', className: 'code' },
  { id: 'effective_date', labels: { zh: '生效日期', en: 'Effective Date' }, value: (r) => r.effective_date, tableVisible: 'Y', freezePane: 'N' },
  { id: 'security_abbr_name', labels: { zh: '股票簡稱', en: 'Abbreviation of Security Name' }, value: (r) => r.security_abbr_name, tableVisible: 'Y', freezePane: 'N' },
  { id: 'data_code', labels: { zh: '資料區分', en: 'Data Code' }, value: (r) => r.data_code, tableVisible: 'N', freezePane: 'N' },
  { id: 'prev_close_price', labels: { zh: '前一日收盤價', en: 'Closing Price before Ex-right/Ex-dividend' }, value: (r) => r.prev_close_price, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'ex_ref_price', labels: { zh: '除權參考價', en: 'Ex-right/Ex-dividend Quote' }, value: (r) => r.ex_ref_price, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'limit_up_price', labels: { zh: '漲停價', en: 'Limit Up' }, value: (r) => r.limit_up_price, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'limit_down_price', labels: { zh: '跌停價', en: 'Limit Down' }, value: (r) => r.limit_down_price, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'open_ref_price', labels: { zh: '開盤參考價', en: 'Opening Reference Price' }, value: (r) => r.open_ref_price, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'auction_ref_price', labels: { zh: '開盤競價基準', en: 'The Auction Reference Price at Market Opening' }, value: (r) => r.auction_ref_price, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'right_dividend_type', labels: { zh: '權息別', en: 'Right/Dividend' }, value: (r) => r.right_dividend_type, tableVisible: 'Y', freezePane: 'N' },
  { id: 'right_value_note', labels: { zh: '權值記號', en: 'Note of Value of Right' }, value: (r) => r.right_value_note, tableVisible: 'N', freezePane: 'N' },
  { id: 'right_value', labels: { zh: '權值', en: 'Value of Right' }, value: (r) => r.right_value, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'dividend_value', labels: { zh: '息值', en: 'Value of Dividend' }, value: (r) => r.dividend_value, tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'stock_dividend_per_1000_shares', labels: { zh: '每仟股無償配股', en: 'Stock Dividend per 1000 Shares' }, value: (r) => r.stock_dividend_per_1000_shares, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'stock_dividend_ratio', labels: { zh: '無償配股率', en: 'Stock Dividend Ratio' }, value: (r) => r.stock_dividend_ratio, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'employee_bonus_capitalization', labels: { zh: '員工紅利轉增資', en: 'Capitalization of Employee Bonuses' }, value: (r) => r.employee_bonus_capitalization, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'employee_bonus_stock_dividend_ratio', labels: { zh: '員工紅利配股率', en: 'Stock Dividend Ratio of Employee Bonuses' }, value: (r) => r.employee_bonus_stock_dividend_ratio, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'cash_capital_increase', labels: { zh: '(有償)現金增資', en: 'Raise New Capital' }, value: (r) => r.cash_capital_increase, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'cash_capital_increase_ratio', labels: { zh: '現金增資配股率', en: 'Subscription Ratio to Employee Bonuses' }, value: (r) => r.cash_capital_increase_ratio, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'subscription_price_per_share', labels: { zh: '每股認購金額(元/股)', en: 'Subscription Price per Share (nt)' }, value: (r) => r.subscription_price_per_share, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'public_underwriting_shares', labels: { zh: '公開承銷(股數)', en: 'Public Underwriting(share)' }, value: (r) => r.public_underwriting_shares, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'employee_subscription_shares', labels: { zh: '員工認購(股數)', en: 'Employee Stock(share)' }, value: (r) => r.employee_subscription_shares, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'existing_shareholder_subscription_shares', labels: { zh: '原股東認購(股數)', en: 'Subscription of Existing Shareholder(share)' }, value: (r) => r.existing_shareholder_subscription_shares, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'shareholder_subscription_per_1000_shares', labels: { zh: '股東每仟股認購股數', en: 'Subscription of Shareholder per 1000 Shares' }, value: (r) => r.shareholder_subscription_per_1000_shares, tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'tsmc_updatetime', labels: { zh: '台積更新時間', en: 'TSMC Updatetime' }, value: (r) => `${r.data_gen_dt}${r.data_gen_time ? ` ${r.data_gen_time}` : ''}`.trim() || '—', tableVisible: 'Y', freezePane: 'N' },
];

const CM_EX_RIGHT_DIVIDEND_MOCK_DATA: CmExRightDividendRow[] = [
  { security_code: '2330', effective_date: '2025-07-15', security_abbr_name: '台積電', data_code: 'A', prev_close_price: '972.00', ex_ref_price: '958.00', limit_up_price: '1,053.50', limit_down_price: '862.50', open_ref_price: '960.00', auction_ref_price: '959.50', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '4.50', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2317', effective_date: '2025-08-14', security_abbr_name: '鴻海', data_code: 'A', prev_close_price: '118.50', ex_ref_price: '113.50', limit_up_price: '124.50', limit_down_price: '102.50', open_ref_price: '114.00', auction_ref_price: '113.80', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '5.00', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2454', effective_date: '2025-07-10', security_abbr_name: '聯發科', data_code: 'B', prev_close_price: '1,290.00', ex_ref_price: '1,197.00', limit_up_price: '1,316.50', limit_down_price: '1,077.50', open_ref_price: '1,200.00', auction_ref_price: '1,198.00', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '93.00', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2881', effective_date: '2025-08-07', security_abbr_name: '富邦金', data_code: 'C', prev_close_price: '84.80', ex_ref_price: '82.80', limit_up_price: '91.00', limit_down_price: '74.60', open_ref_price: '83.00', auction_ref_price: '82.90', right_dividend_type: '權息', right_value_note: '*', right_value: '0.80', dividend_value: '2.00', stock_dividend_per_1000_shares: '8.00', stock_dividend_ratio: '0.8000', employee_bonus_capitalization: '0.20', employee_bonus_stock_dividend_ratio: '0.0200', cash_capital_increase: '50.00', cash_capital_increase_ratio: '0.0500', subscription_price_per_share: '45.00', public_underwriting_shares: '2000000', employee_subscription_shares: '1200000', existing_shareholder_subscription_shares: '6800000', shareholder_subscription_per_1000_shares: '50.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2882', effective_date: '2025-08-13', security_abbr_name: '國泰金', data_code: 'A', prev_close_price: '97.00', ex_ref_price: '94.50', limit_up_price: '103.50', limit_down_price: '85.50', open_ref_price: '95.00', auction_ref_price: '94.80', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '2.50', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2891', effective_date: '2025-08-20', security_abbr_name: '中信金', data_code: 'A', prev_close_price: '39.50', ex_ref_price: '37.70', limit_up_price: '41.40', limit_down_price: '34.00', open_ref_price: '38.00', auction_ref_price: '37.90', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '1.80', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2412', effective_date: '2025-09-10', security_abbr_name: '中華電', data_code: 'A', prev_close_price: '124.00', ex_ref_price: '119.71', limit_up_price: '131.50', limit_down_price: '107.90', open_ref_price: '120.00', auction_ref_price: '119.80', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '4.29', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '3045', effective_date: '2025-09-17', security_abbr_name: '台灣大', data_code: 'A', prev_close_price: '93.40', ex_ref_price: '89.90', limit_up_price: '98.90', limit_down_price: '80.90', open_ref_price: '90.20', auction_ref_price: '90.00', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '3.50', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1301', effective_date: '2025-10-09', security_abbr_name: '台塑', data_code: 'D', prev_close_price: '64.50', ex_ref_price: '60.20', limit_up_price: '66.20', limit_down_price: '54.20', open_ref_price: '60.50', auction_ref_price: '60.40', right_dividend_type: '權息', right_value_note: '+', right_value: '1.20', dividend_value: '4.30', stock_dividend_per_1000_shares: '12.00', stock_dividend_ratio: '1.2000', employee_bonus_capitalization: '0.15', employee_bonus_stock_dividend_ratio: '0.0150', cash_capital_increase: '30.00', cash_capital_increase_ratio: '0.0300', subscription_price_per_share: '38.00', public_underwriting_shares: '1000000', employee_subscription_shares: '600000', existing_shareholder_subscription_shares: '3400000', shareholder_subscription_per_1000_shares: '30.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1216', effective_date: '2025-09-25', security_abbr_name: '統一', data_code: 'A', prev_close_price: '82.00', ex_ref_price: '80.60', limit_up_price: '88.60', limit_down_price: '72.60', open_ref_price: '80.80', auction_ref_price: '80.70', right_dividend_type: '息', right_value_note: '—', right_value: '0.00', dividend_value: '1.40', stock_dividend_per_1000_shares: '0.00', stock_dividend_ratio: '0.0000', employee_bonus_capitalization: '0.00', employee_bonus_stock_dividend_ratio: '0.0000', cash_capital_increase: '0.00', cash_capital_increase_ratio: '0.0000', subscription_price_per_share: '0.00', public_underwriting_shares: '0', employee_subscription_shares: '0', existing_shareholder_subscription_shares: '0', shareholder_subscription_per_1000_shares: '0.00', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
];

interface CmForeignInvestorsRow {
  security_code: string;
  security_name: string;
  total_issued_shares: string;
  foreign_investor_remaining_shares: string;
  total_foreign_investor_holding_shares: string;
  foreign_investor_remaining_ratio: string;
  total_foreign_investor_holding_ratio: string;
  statutory_investment_cap_ratio: string;
  change_reason_code: string;
  last_foreign_holding_change_date: string;
  data_gen_dt: string;
  data_gen_time: string;
}

interface CmForeignInvestorsColumn {
  id: string;
  labels: { zh: string; en: string };
  value: (row: CmForeignInvestorsRow) => string;
  tableVisible: 'Y' | 'N';
  freezePane: 'Y' | 'N';
  formatType?: 'number' | 'percent';
  className?: string;
}

const CM_FOREIGN_INVESTORS_ALL_COLUMNS: CmForeignInvestorsColumn[] = [
  { id: 'security_code', labels: { zh: '證券代號', en: 'Security Code' }, value: (row) => row.security_code, tableVisible: 'Y', freezePane: 'Y', className: 'code' },
  { id: 'security_name', labels: { zh: '證券名稱', en: 'Stock Name' }, value: (row) => row.security_name, tableVisible: 'Y', freezePane: 'N' },
  { id: 'total_issued_shares', labels: { zh: '發行股數', en: 'Shares Issued' }, value: (row) => row.total_issued_shares, tableVisible: 'Y', freezePane: 'N', formatType: 'number', className: 'num' },
  { id: 'foreign_investor_remaining_shares', labels: { zh: '外資尚可投資股數', en: 'Shares Available for Foreign Investment' }, value: (row) => row.foreign_investor_remaining_shares, tableVisible: 'Y', freezePane: 'N', formatType: 'number', className: 'num' },
  { id: 'total_foreign_investor_holding_shares', labels: { zh: '全體外資持有股數', en: 'Total Shares Held by Foreign Investors' }, value: (row) => row.total_foreign_investor_holding_shares, tableVisible: 'Y', freezePane: 'N', formatType: 'number', className: 'num' },
  { id: 'foreign_investor_remaining_ratio', labels: { zh: '外資尚可投資比率', en: 'Foreign Investment Available Percentage' }, value: (row) => row.foreign_investor_remaining_ratio, tableVisible: 'Y', freezePane: 'N', formatType: 'percent', className: 'num' },
  { id: 'total_foreign_investor_holding_ratio', labels: { zh: '全體外資持股比率', en: 'Total Foreign Ownership Percentage' }, value: (row) => row.total_foreign_investor_holding_ratio, tableVisible: 'Y', freezePane: 'N', formatType: 'percent', className: 'num' },
  { id: 'statutory_investment_cap_ratio', labels: { zh: '法令投資上限比率', en: 'Regulatory Foreign Ownership Limit (FOL)' }, value: (row) => row.statutory_investment_cap_ratio, tableVisible: 'Y', freezePane: 'N', formatType: 'percent', className: 'num' },
  { id: 'change_reason_code', labels: { zh: '與前日異動原因', en: 'Reason for Day-over-Day Change' }, value: (row) => row.change_reason_code, tableVisible: 'N', freezePane: 'N' },
  { id: 'last_foreign_holding_change_date', labels: { zh: '最近一次上市公司申報外資持股異動日期', en: 'Last Reported Foreign Shareholding Change Date' }, value: (row) => row.last_foreign_holding_change_date, tableVisible: 'N', freezePane: 'N' },
  { id: 'tsmc_updatetime', labels: { zh: '台積更新時間', en: 'TSMC Updatetime' }, value: (row) => `${row.data_gen_dt}${row.data_gen_time ? ` ${row.data_gen_time}` : ''}`.trim() || '—', tableVisible: 'Y', freezePane: 'N' },
];

const CM_FOREIGN_INVESTORS_MOCK_DATA: CmForeignInvestorsRow[] = [
  { security_code: '2330', security_name: '台積電', total_issued_shares: '25,934,000,000', foreign_investor_remaining_shares: '2,413,642,000', total_foreign_investor_holding_shares: '18,231,658,000', foreign_investor_remaining_ratio: '9.31%', total_foreign_investor_holding_ratio: '70.31%', statutory_investment_cap_ratio: '79.62%', change_reason_code: '0', last_foreign_holding_change_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2317', security_name: '鴻海', total_issued_shares: '13,863,000,000', foreign_investor_remaining_shares: '1,492,016,000', total_foreign_investor_holding_shares: '6,349,092,000', foreign_investor_remaining_ratio: '10.76%', total_foreign_investor_holding_ratio: '45.80%', statutory_investment_cap_ratio: '56.56%', change_reason_code: '1', last_foreign_holding_change_date: '2025-05-22', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2454', security_name: '聯發科', total_issued_shares: '1,599,000,000', foreign_investor_remaining_shares: '151,524,000', total_foreign_investor_holding_shares: '760,876,000', foreign_investor_remaining_ratio: '9.48%', total_foreign_investor_holding_ratio: '47.58%', statutory_investment_cap_ratio: '57.06%', change_reason_code: '0', last_foreign_holding_change_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2881', security_name: '富邦金', total_issued_shares: '12,346,000,000', foreign_investor_remaining_shares: '2,004,375,000', total_foreign_investor_holding_shares: '4,782,445,000', foreign_investor_remaining_ratio: '16.23%', total_foreign_investor_holding_ratio: '38.74%', statutory_investment_cap_ratio: '54.97%', change_reason_code: '2', last_foreign_holding_change_date: '2025-05-21', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2882', security_name: '國泰金', total_issued_shares: '14,638,000,000', foreign_investor_remaining_shares: '2,261,978,000', total_foreign_investor_holding_shares: '6,101,246,000', foreign_investor_remaining_ratio: '15.45%', total_foreign_investor_holding_ratio: '41.68%', statutory_investment_cap_ratio: '57.13%', change_reason_code: '0', last_foreign_holding_change_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2891', security_name: '中信金', total_issued_shares: '19,583,000,000', foreign_investor_remaining_shares: '3,213,512,000', total_foreign_investor_holding_shares: '7,256,238,000', foreign_investor_remaining_ratio: '16.41%', total_foreign_investor_holding_ratio: '37.05%', statutory_investment_cap_ratio: '53.46%', change_reason_code: '0', last_foreign_holding_change_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2412', security_name: '中華電', total_issued_shares: '7,757,000,000', foreign_investor_remaining_shares: '1,120,936,000', total_foreign_investor_holding_shares: '3,212,154,000', foreign_investor_remaining_ratio: '14.45%', total_foreign_investor_holding_ratio: '41.41%', statutory_investment_cap_ratio: '55.86%', change_reason_code: '1', last_foreign_holding_change_date: '2025-05-20', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '3045', security_name: '台灣大', total_issued_shares: '3,422,000,000', foreign_investor_remaining_shares: '495,892,000', total_foreign_investor_holding_shares: '1,361,508,000', foreign_investor_remaining_ratio: '14.49%', total_foreign_investor_holding_ratio: '39.79%', statutory_investment_cap_ratio: '54.28%', change_reason_code: '0', last_foreign_holding_change_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1301', security_name: '台塑', total_issued_shares: '6,368,000,000', foreign_investor_remaining_shares: '1,070,457,000', total_foreign_investor_holding_shares: '2,384,743,000', foreign_investor_remaining_ratio: '16.81%', total_foreign_investor_holding_ratio: '37.45%', statutory_investment_cap_ratio: '54.26%', change_reason_code: '0', last_foreign_holding_change_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1216', security_name: '統一', total_issued_shares: '5,682,000,000', foreign_investor_remaining_shares: '1,000,143,000', total_foreign_investor_holding_shares: '1,979,357,000', foreign_investor_remaining_ratio: '17.60%', total_foreign_investor_holding_ratio: '34.84%', statutory_investment_cap_ratio: '52.44%', change_reason_code: '2', last_foreign_holding_change_date: '2025-05-19', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
];

interface CmPriceVariationLimitRow {
  security_code: string;
  limit_up_price: string;
  opening_ref_price: string;
  limit_down_price: string;
  last_trading_date: string;
  trading_method: string;
  disposition_mark: string;
  attention_mark: string;
  order_limit_mark: string;
  industry_code: string;
  security_category_code: string;
  exempt_short_sale_mark: string;
  security_ch_name: string;
  matching_interval_min: string;
  single_order_volume_limit: string;
  multiple_order_volume_limit: string;
  advance_collection_percentage: string;
  exempt_sbl_short_sale_mark: string;
  par_value_mark: string;
  allow_day_trade_mark: string;
  board_mark: string;
  data_gen_dt: string;
  data_gen_time: string;
}

interface CmPriceVariationLimitColumn {
  id: string;
  labels: { zh: string; en: string };
  value: (row: CmPriceVariationLimitRow) => string;
  tableVisible: 'Y' | 'N';
  freezePane: 'Y' | 'N';
  className?: string;
  formatType?: 'number' | 'percent';
}

const CM_PRICE_LIMIT_ALL_COLUMNS: CmPriceVariationLimitColumn[] = [
  { id: 'security_code', labels: { zh: '股票代號', en: 'Security Code' }, value: (row) => row.security_code, tableVisible: 'Y', freezePane: 'Y', className: 'code' },
  { id: 'limit_up_price', labels: { zh: '漲停價', en: 'Limit Up' }, value: (row) => row.limit_up_price, tableVisible: 'Y', freezePane: 'N', className: 'num', formatType: 'number' },
  { id: 'opening_ref_price', labels: { zh: '開盤競價基準', en: 'Opening Reference Price' }, value: (row) => row.opening_ref_price, tableVisible: 'Y', freezePane: 'N', className: 'num', formatType: 'number' },
  { id: 'limit_down_price', labels: { zh: '跌停價', en: 'Limit Down' }, value: (row) => row.limit_down_price, tableVisible: 'Y', freezePane: 'N', className: 'num', formatType: 'number' },
  { id: 'last_trading_date', labels: { zh: '上次成交日', en: 'Last Trading Date' }, value: (row) => row.last_trading_date, tableVisible: 'Y', freezePane: 'N' },
  { id: 'trading_method', labels: { zh: '交易方式', en: 'Trading Method' }, value: (row) => row.trading_method, tableVisible: 'Y', freezePane: 'N' },
  { id: 'disposition_mark', labels: { zh: '處置股票註記', en: 'Disposition Securities Mark' }, value: (row) => row.disposition_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'attention_mark', labels: { zh: '注意股票註記', en: 'Attention Securities Mark' }, value: (row) => row.attention_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'order_limit_mark', labels: { zh: '委託限制註記', en: 'Limit Order Mark' }, value: (row) => row.order_limit_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'industry_code', labels: { zh: '產業別代碼', en: 'Industry Category Code' }, value: (row) => row.industry_code, tableVisible: 'Y', freezePane: 'N' },
  { id: 'security_category_code', labels: { zh: '證券別代碼', en: 'Security Category Code' }, value: (row) => row.security_category_code, tableVisible: 'Y', freezePane: 'N' },
  { id: 'exempt_short_sale_mark', labels: { zh: '豁免平盤下融券賣出註記', en: 'Allow Short Sales When Price Under Opening Price Mark' }, value: (row) => row.exempt_short_sale_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'security_ch_name', labels: { zh: '股票中文名稱', en: 'Name' }, value: (row) => row.security_ch_name, tableVisible: 'Y', freezePane: 'N' },
  { id: 'matching_interval_min', labels: { zh: '撮合循環時間（分）', en: 'Matching Interval(min)' }, value: (row) => row.matching_interval_min, tableVisible: 'N', freezePane: 'N' },
  { id: 'single_order_volume_limit', labels: { zh: '單筆委託限制數量', en: 'Single Order Volume Limit(Shares)' }, value: (row) => row.single_order_volume_limit, tableVisible: 'N', freezePane: 'N' },
  { id: 'multiple_order_volume_limit', labels: { zh: '多筆委託限制數量', en: 'Multiple Order Volume Limit(Shares)' }, value: (row) => row.multiple_order_volume_limit, tableVisible: 'N', freezePane: 'N' },
  { id: 'advance_collection_percentage', labels: { zh: '款券預收成數(%)', en: 'Advance Collection Percentage(%)' }, value: (row) => row.advance_collection_percentage, tableVisible: 'N', freezePane: 'N', formatType: 'percent' },
  { id: 'exempt_sbl_short_sale_mark', labels: { zh: '豁免平盤下借券賣出註記', en: 'Allow SBL Short Sales When Price Under Opening Price Mark' }, value: (row) => row.exempt_sbl_short_sale_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'par_value_mark', labels: { zh: '面額註記', en: 'Par Value Mark' }, value: (row) => row.par_value_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'allow_day_trade_mark', labels: { zh: '可先買後賣現股當沖註記', en: 'Allow Day Trade Mark' }, value: (row) => row.allow_day_trade_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'board_mark', labels: { zh: '板別註記', en: 'Board Mark' }, value: (row) => row.board_mark, tableVisible: 'N', freezePane: 'N' },
  { id: 'tsmc_updatetime', labels: { zh: '台積更新時間', en: 'TSMC Updatetime' }, value: (row) => `${row.data_gen_dt}${row.data_gen_time ? ` ${row.data_gen_time}` : ''}`.trim() || '—', tableVisible: 'Y', freezePane: 'N' },
];

const CM_PRICE_LIMIT_MOCK_DATA: CmPriceVariationLimitRow[] = [
  { security_code: '2330', limit_up_price: '1,069.00', opening_ref_price: '972.00', limit_down_price: '875.00', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: 'Y', order_limit_mark: '', industry_code: '24', security_category_code: '01', exempt_short_sale_mark: 'N', security_ch_name: '台積電', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '20%', exempt_sbl_short_sale_mark: 'N', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2317', limit_up_price: '130.00', opening_ref_price: '118.50', limit_down_price: '107.00', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: '', industry_code: '31', security_category_code: '01', exempt_short_sale_mark: 'Y', security_ch_name: '鴻海', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '20%', exempt_sbl_short_sale_mark: 'Y', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2454', limit_up_price: '1,001.00', opening_ref_price: '910.00', limit_down_price: '819.00', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: 'A', industry_code: '24', security_category_code: '01', exempt_short_sale_mark: 'N', security_ch_name: '聯發科', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '30%', exempt_sbl_short_sale_mark: 'N', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2881', limit_up_price: '93.20', opening_ref_price: '84.80', limit_down_price: '76.40', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: 'Y', attention_mark: '', order_limit_mark: '', industry_code: '17', security_category_code: '01', exempt_short_sale_mark: 'N', security_ch_name: '富邦金', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '10%', exempt_sbl_short_sale_mark: 'N', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2882', limit_up_price: '106.50', opening_ref_price: '97.00', limit_down_price: '87.30', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: '', industry_code: '17', security_category_code: '01', exempt_short_sale_mark: 'N', security_ch_name: '國泰金', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '10%', exempt_sbl_short_sale_mark: 'N', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2891', limit_up_price: '121.00', opening_ref_price: '110.00', limit_down_price: '99.00', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: '', industry_code: '17', security_category_code: '01', exempt_short_sale_mark: 'N', security_ch_name: '中信金', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '10%', exempt_sbl_short_sale_mark: 'N', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2412', limit_up_price: '82.10', opening_ref_price: '74.70', limit_down_price: '67.20', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: '', industry_code: '28', security_category_code: '01', exempt_short_sale_mark: 'Y', security_ch_name: '中華電', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '20%', exempt_sbl_short_sale_mark: 'Y', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '3045', limit_up_price: '102.50', opening_ref_price: '93.40', limit_down_price: '84.10', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: '', industry_code: '28', security_category_code: '01', exempt_short_sale_mark: 'Y', security_ch_name: '台灣大', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '20%', exempt_sbl_short_sale_mark: 'Y', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1301', limit_up_price: '108.50', opening_ref_price: '98.90', limit_down_price: '88.90', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: '', industry_code: '21', security_category_code: '01', exempt_short_sale_mark: 'N', security_ch_name: '台塑', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '10%', exempt_sbl_short_sale_mark: 'N', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1216', limit_up_price: '60.00', opening_ref_price: '54.60', limit_down_price: '49.20', last_trading_date: '2025-05-23', trading_method: 'Regular', disposition_mark: '', attention_mark: '', order_limit_mark: '', industry_code: '10', security_category_code: '01', exempt_short_sale_mark: 'N', security_ch_name: '統一', matching_interval_min: '5', single_order_volume_limit: '499', multiple_order_volume_limit: '999', advance_collection_percentage: '10%', exempt_sbl_short_sale_mark: 'N', par_value_mark: '10', allow_day_trade_mark: 'Y', board_mark: 'TWSE', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
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

// ── Daily Quotes (每日收盤行情) data ─────────────────────────────────────────

interface DailyQuoteRow {
  security_code: string;
  security_name: string;
  trade_volume: string;
  open_price: string;
  high_price: string;
  low_price: string;
  close_price: string;
  price_change_indicator: string;
  price_change: string;
  bid_price: string;
  ask_price: string;
  trade_count: string;
  trade_value: string;
  pe_ratio_or_settlement_price: string;
  avg_dividend_or_strike_price: string;
  shares_per_trading_unit: string;
  currency: string;
  last_trade_date: string;
  data_gen_dt: string;
  data_gen_time: string;
}

interface DqColumn {
  id: string;
  labels: { zh: string; en: string };
  value: (row: DailyQuoteRow) => string;
  tableVisible: 'Y' | 'N';
  freezePane: 'Y' | 'N';
  className?: string;
}

const CM_QUOTES_ALL_COLUMNS: DqColumn[] = [
  { id: 'security_code',                 labels: { zh: '證券代號',               en: 'Security Code'                             }, value: (r) => r.security_code,                 tableVisible: 'Y', freezePane: 'Y', className: 'code' },
  { id: 'security_name',                 labels: { zh: '證券名稱',               en: 'Stock Name'                                }, value: (r) => r.security_name,                 tableVisible: 'Y', freezePane: 'N' },
  { id: 'trade_volume',                  labels: { zh: '成交股數',               en: 'Trading Volume'                            }, value: (r) => r.trade_volume,                  tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'open_price',                    labels: { zh: '開盤價',                 en: 'Opening Price'                             }, value: (r) => r.open_price,                    tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'high_price',                    labels: { zh: '最高價',                 en: 'Highest Price'                             }, value: (r) => r.high_price,                    tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'low_price',                     labels: { zh: '最低價',                 en: 'Lowest Price'                              }, value: (r) => r.low_price,                     tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'close_price',                   labels: { zh: '收盤',                   en: 'Closing Price'                             }, value: (r) => r.close_price,                   tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'price_change_indicator',        labels: { zh: '漲跌註記',               en: 'Price Change Indicator'                    }, value: (r) => r.price_change_indicator,        tableVisible: 'Y', freezePane: 'N' },
  { id: 'price_change',                  labels: { zh: '漲跌',                   en: 'Price Change'                              }, value: (r) => r.price_change,                  tableVisible: 'Y', freezePane: 'N', className: 'num' },
  { id: 'bid_price',                     labels: { zh: '最後買價',               en: 'Last Bid Price'                            }, value: (r) => r.bid_price,                     tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'ask_price',                     labels: { zh: '最後賣價',               en: 'Last Ask Price'                            }, value: (r) => r.ask_price,                     tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'trade_count',                   labels: { zh: '成交筆數',               en: 'Trade Count'                               }, value: (r) => r.trade_count,                   tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'trade_value',                   labels: { zh: '成交金額',               en: 'Trading Value'                             }, value: (r) => r.trade_value,                   tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'pe_ratio_or_settlement_price',  labels: { zh: '本益比或結算價',         en: 'P/E Ratio or Settlement Price'             }, value: (r) => r.pe_ratio_or_settlement_price,  tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'avg_dividend_or_strike_price',  labels: { zh: '平均股利或最新履約價',   en: 'Average Dividend or Latest Strike Price'   }, value: (r) => r.avg_dividend_or_strike_price,  tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'shares_per_trading_unit',       labels: { zh: '每交易單位所含股數',     en: 'Shares per Trading Unit'                  }, value: (r) => r.shares_per_trading_unit,       tableVisible: 'N', freezePane: 'N', className: 'num' },
  { id: 'currency',                      labels: { zh: '交易幣別',               en: 'Trading Currency'                          }, value: (r) => r.currency,                      tableVisible: 'N', freezePane: 'N' },
  { id: 'last_trade_date',               labels: { zh: '最後交易日期',           en: 'Last Trade Date'                           }, value: (r) => r.last_trade_date,               tableVisible: 'N', freezePane: 'N' },
  { id: 'tsmc_updatetime',               labels: { zh: '台積更新時間',           en: 'TSMC Updatetime'                           }, value: (r) => `${r.data_gen_dt}${r.data_gen_time ? ' ' + r.data_gen_time : ''}`.trim() || '—', tableVisible: 'Y', freezePane: 'N' },
];

const CM_DAILY_QUOTES_MOCK_DATA: DailyQuoteRow[] = [
  { security_code: '2330', security_name: '台積電',   trade_volume: '32,456,000', open_price: '980.00',  high_price: '998.00',  low_price: '975.00',  close_price: '992.00',  price_change_indicator: '+', price_change: '+12.00', bid_price: '991.00', ask_price: '993.00', trade_count: '35,621', trade_value: '32,218,500,000', pe_ratio_or_settlement_price: '25.34', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2317', security_name: '鴻海',     trade_volume: '14,230,000', open_price: '118.00',  high_price: '121.00',  low_price: '117.00',  close_price: '120.00',  price_change_indicator: '+', price_change: '+2.00',  bid_price: '119.50', ask_price: '120.50', trade_count: '12,341', trade_value: '1,703,200,000',  pe_ratio_or_settlement_price: '11.81', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2454', security_name: '聯發科',   trade_volume: '4,120,000',  open_price: '908.00',  high_price: '921.00',  low_price: '904.00',  close_price: '916.00',  price_change_indicator: '+', price_change: '+8.00',  bid_price: '915.00', ask_price: '917.00', trade_count: '8,432',  trade_value: '3,773,920,000',  pe_ratio_or_settlement_price: '9.78',  avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2881', security_name: '富邦金',   trade_volume: '9,870,000',  open_price: '84.50',   high_price: '85.80',   low_price: '84.20',   close_price: '85.40',   price_change_indicator: '+', price_change: '+0.90',  bid_price: '85.20', ask_price: '85.50', trade_count: '7,218',  trade_value: '843,468,000',    pe_ratio_or_settlement_price: '10.23', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2882', security_name: '國泰金',   trade_volume: '8,342,000',  open_price: '96.50',   high_price: '98.00',   low_price: '96.00',   close_price: '97.50',   price_change_indicator: '+', price_change: '+1.00',  bid_price: '97.30', ask_price: '97.60', trade_count: '6,543',  trade_value: '813,345,000',    pe_ratio_or_settlement_price: '12.34', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2891', security_name: '中信金',   trade_volume: '7,654,000',  open_price: '109.50',  high_price: '111.00',  low_price: '109.00',  close_price: '110.50',  price_change_indicator: '+', price_change: '+1.00',  bid_price: '110.00', ask_price: '111.00', trade_count: '5,231', trade_value: '845,847,000',   pe_ratio_or_settlement_price: '12.89', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2412', security_name: '中華電',   trade_volume: '3,210,000',  open_price: '74.20',   high_price: '75.10',   low_price: '73.90',   close_price: '74.80',   price_change_indicator: '+', price_change: '+0.60',  bid_price: '74.70', ask_price: '74.90', trade_count: '3,120',  trade_value: '240,108,000',    pe_ratio_or_settlement_price: '20.11', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '3045', security_name: '台灣大',   trade_volume: '2,890,000',  open_price: '93.20',   high_price: '94.30',   low_price: '92.80',   close_price: '93.80',   price_change_indicator: '+', price_change: '+0.60',  bid_price: '93.50', ask_price: '94.00', trade_count: '2,456',  trade_value: '271,122,000',    pe_ratio_or_settlement_price: '22.34', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1301', security_name: '台塑',     trade_volume: '5,430,000',  open_price: '98.70',   high_price: '100.00',  low_price: '98.40',   close_price: '99.60',   price_change_indicator: '+', price_change: '+0.90',  bid_price: '99.50', ask_price: '99.70', trade_count: '4,318',  trade_value: '540,828,000',    pe_ratio_or_settlement_price: '14.23', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1216', security_name: '統一',     trade_volume: '4,120,000',  open_price: '54.40',   high_price: '55.20',   low_price: '54.20',   close_price: '55.00',   price_change_indicator: '+', price_change: '+0.60',  bid_price: '54.90', ask_price: '55.10', trade_count: '3,204',  trade_value: '226,600,000',    pe_ratio_or_settlement_price: '16.78', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2303', security_name: '聯電',     trade_volume: '18,230,000', open_price: '41.20',   high_price: '42.10',   low_price: '41.00',   close_price: '41.80',   price_change_indicator: '-', price_change: '-0.40',  bid_price: '41.70', ask_price: '41.90', trade_count: '15,432', trade_value: '762,034,000',    pe_ratio_or_settlement_price: '13.45', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2308', security_name: '台達電',   trade_volume: '3,450,000',  open_price: '312.50',  high_price: '316.00',  low_price: '311.00',  close_price: '313.50',  price_change_indicator: '-', price_change: '-1.00',  bid_price: '313.00', ask_price: '314.00', trade_count: '4,231', trade_value: '1,081,575,000', pe_ratio_or_settlement_price: '19.87', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2886', security_name: '兆豐金',   trade_volume: '6,780,000',  open_price: '43.80',   high_price: '44.50',   low_price: '43.60',   close_price: '44.20',   price_change_indicator: '+', price_change: '+0.40',  bid_price: '44.10', ask_price: '44.30', trade_count: '3,987',  trade_value: '299,676,000',    pe_ratio_or_settlement_price: '11.23', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2884', security_name: '玉山金',   trade_volume: '5,320,000',  open_price: '28.90',   high_price: '29.50',   low_price: '28.70',   close_price: '29.30',   price_change_indicator: '+', price_change: '+0.40',  bid_price: '29.20', ask_price: '29.40', trade_count: '3,156',  trade_value: '155,876,000',    pe_ratio_or_settlement_price: '13.67', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2357', security_name: '華碩',     trade_volume: '2,670,000',  open_price: '419.00',  high_price: '426.00',  low_price: '417.50',  close_price: '423.00',  price_change_indicator: '+', price_change: '+4.00',  bid_price: '422.50', ask_price: '423.50', trade_count: '4,567', trade_value: '1,129,410,000', pe_ratio_or_settlement_price: '15.34', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2395', security_name: '研華',     trade_volume: '1,230,000',  open_price: '432.00',  high_price: '438.00',  low_price: '430.00',  close_price: '435.00',  price_change_indicator: '+', price_change: '+3.00',  bid_price: '434.00', ask_price: '436.00', trade_count: '2,341', trade_value: '535,050,000',    pe_ratio_or_settlement_price: '26.12', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '6505', security_name: '台塑化',   trade_volume: '4,560,000',  open_price: '68.40',   high_price: '69.20',   low_price: '68.10',   close_price: '68.80',   price_change_indicator: '-', price_change: '-0.20',  bid_price: '68.70', ask_price: '68.90', trade_count: '3,892',  trade_value: '314,528,000',    pe_ratio_or_settlement_price: '12.56', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '1303', security_name: '南亞',     trade_volume: '3,870,000',  open_price: '60.10',   high_price: '61.00',   low_price: '59.80',   close_price: '60.60',   price_change_indicator: '+', price_change: '+0.50',  bid_price: '60.50', ask_price: '60.70', trade_count: '2,678',  trade_value: '234,522,000',    pe_ratio_or_settlement_price: '10.89', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2002', security_name: '中鋼',     trade_volume: '12,340,000', open_price: '22.40',   high_price: '22.90',   low_price: '22.30',   close_price: '22.70',   price_change_indicator: '+', price_change: '+0.30',  bid_price: '22.60', ask_price: '22.80', trade_count: '7,432',  trade_value: '280,318,000',    pe_ratio_or_settlement_price: '8.23',  avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2885', security_name: '元大金',   trade_volume: '6,120,000',  open_price: '24.30',   high_price: '24.80',   low_price: '24.10',   close_price: '24.60',   price_change_indicator: '+', price_change: '+0.30',  bid_price: '24.50', ask_price: '24.70', trade_count: '3,214',  trade_value: '150,552,000',    pe_ratio_or_settlement_price: '9.45',  avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '9999', security_name: '全球科技', trade_volume: '5,670,000',  open_price: '960.00',  high_price: '975.00',  low_price: '958.00',  close_price: '970.00',  price_change_indicator: '+', price_change: '+10.00', bid_price: '969.00', ask_price: '971.00', trade_count: '6,890', trade_value: '5,499,900,000', pe_ratio_or_settlement_price: '18.90', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2880', security_name: '華南金',   trade_volume: '4,340,000',  open_price: '23.80',   high_price: '24.20',   low_price: '23.70',   close_price: '24.00',   price_change_indicator: '+', price_change: '+0.20',  bid_price: '23.90', ask_price: '24.10', trade_count: '2,543',  trade_value: '104,196,000',    pe_ratio_or_settlement_price: '10.34', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '5880', security_name: '合庫金',   trade_volume: '7,230,000',  open_price: '27.60',   high_price: '28.10',   low_price: '27.50',   close_price: '27.90',   price_change_indicator: '+', price_change: '+0.30',  bid_price: '27.80', ask_price: '28.00', trade_count: '3,876',  trade_value: '201,747,000',    pe_ratio_or_settlement_price: '11.67', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '2892', security_name: '第一金',   trade_volume: '5,430,000',  open_price: '25.10',   high_price: '25.60',   low_price: '25.00',   close_price: '25.40',   price_change_indicator: '+', price_change: '+0.30',  bid_price: '25.30', ask_price: '25.50', trade_count: '2,987',  trade_value: '137,922,000',    pe_ratio_or_settlement_price: '10.89', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
  { security_code: '3711', security_name: '日月光',   trade_volume: '8,920,000',  open_price: '119.00',  high_price: '121.50',  low_price: '118.50',  close_price: '120.50',  price_change_indicator: '-', price_change: '-0.50',  bid_price: '120.00', ask_price: '121.00', trade_count: '6,234', trade_value: '1,075,260,000', pe_ratio_or_settlement_price: '14.56', avg_dividend_or_strike_price: '—', shares_per_trading_unit: '1000', currency: 'TWD', last_trade_date: '2025-05-23', data_gen_dt: '20250523', data_gen_time: '14:30:00' },
];

function buildFallbackGetDailyQuotesRows(date: string): DailyQuoteRow[] {
  return CM_DAILY_QUOTES_MOCK_DATA.map((r) => ({ ...r, data_gen_dt: date.replace(/-/g, ''), last_trade_date: date }));
}

// ── Capital Markets tab components ──────────────────────────────────────────

function CmTableWrapper({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="de-data-section">
      <div className={`de-data-table-wrap de-cm-inner-table-wrap${className ? ` ${className}` : ''}`}>{children}</div>
    </div>
  );
}

interface CmPaginationProps {
  lang: 'zh' | 'en';
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function CmPagination({ lang, currentPage, totalPages, onPageChange }: CmPaginationProps) {
  const zh = lang === 'zh';
  return (
    <div className="cp-news-tab-pagination">
      <button
        type="button"
        className="cp-news-tab-page-btn"
        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
      >
        {zh ? '‹ 上一頁' : '‹ Prev'}
      </button>
      {getPaginationRange(currentPage, totalPages).map((item) =>
        typeof item === 'string' ? (
          <span key={item} className="cp-news-tab-page-ellipsis">…</span>
        ) : (
          <button
            key={item}
            type="button"
            className={`cp-news-tab-page-btn${currentPage === item ? ' active' : ''}`}
            onClick={() => onPageChange(item)}
            aria-label={`Page ${item + 1}`}
            aria-current={currentPage === item ? 'page' : undefined}
          >
            {item + 1}
          </button>
        )
      )}
      <button
        type="button"
        className="cp-news-tab-page-btn"
        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage >= totalPages - 1}
      >
        {zh ? '下一頁 ›' : 'Next ›'}
      </button>
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

// ── Sortable data hook with per-column filter (for GOV tabs) ─────────────────

function useGovSortableData<T>(data: T[], getters: ((row: T) => string | number)[]) {
  const [sortCol, setSortCol] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [colFilters, setColFilters] = useState<string[]>(() => Array(getters.length).fill(''));

  function handleSort(colIndex: number) {
    if (sortCol === colIndex) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(colIndex);
      setSortDir('asc');
    }
  }

  function handleColFilter(colIndex: number, value: string) {
    setColFilters((prev) => {
      const next = [...prev];
      next[colIndex] = value;
      return next;
    });
  }

  const processed = useMemo(() => {
    let rows = [...data];
    colFilters.forEach((filter, colIdx) => {
      if (filter.trim()) {
        const q = filter.toLowerCase();
        rows = rows.filter((row) => String(getters[colIdx](row)).toLowerCase().includes(q));
      }
    });
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
  }, [data, colFilters, sortCol, sortDir]);

  return { rows: processed, colFilters, handleColFilter, sortCol, sortDir, handleSort };
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

interface ThSortFilterProps {
  label: string;
  colIndex: number;
  sortCol: number | null;
  sortDir: 'asc' | 'desc';
  onSort: (i: number) => void;
  onFilter: (i: number, v: string) => void;
  filterValue: string;
  className?: string;
  showFilter?: boolean;
}

function ThSortFilter({ label, colIndex, sortCol, sortDir, onSort, onFilter, filterValue, className, showFilter = true }: ThSortFilterProps) {
  const isActive = sortCol === colIndex;
  const icon = isActive ? (sortDir === 'asc' ? '▲' : '▼') : '⇅';
  return (
    <th className={className}>
      <div className="de-th-filter-wrap">
        <button className="de-th-sort-btn" onClick={() => onSort(colIndex)}>
          {label}
          <span className={`de-th-sort-icon${isActive ? ' de-th-sort-icon--active' : ''}`}>{icon}</span>
        </button>
        {showFilter && (
          <input
            className="de-th-filter-input"
            type="text"
            value={filterValue}
            onChange={(e) => onFilter(colIndex, e.target.value)}
            placeholder="filter..."
            onClick={(e) => e.stopPropagation()}
            aria-label={`Filter ${label}`}
          />
        )}
      </div>
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

interface CmDailyQuotesTabProps {
  lang: 'zh' | 'en';
  rowsData: CmDailyQuoteRow[];
  loading: boolean;
  error: string | null;
  onVisibleRowsChange: (rows: CmDailyQuoteRow[]) => void;
}

function CmDailyQuotesTab({ lang, rowsData, loading, error, onVisibleRowsChange }: CmDailyQuotesTabProps) {
  const zh = lang === 'zh';
  const tableColumns = useMemo(
    () => CM_DAY_TRADING_COLUMNS.filter((column) => column.tableVisible === 'Y'),
    [],
  );
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    tableColumns.map((column) => column.value),
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  useEffect(() => {
    setCurrentPage(0);
  }, [rowsData, colFilters, sortCol, sortDir]);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    onVisibleRowsChange(rows);
  }, [rows, onVisibleRowsChange]);

  if (loading) {
    return (
      <CmTableWrapper>
        <div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div>
      </CmTableWrapper>
    );
  }

  if (error) {
    return (
      <CmTableWrapper>
        <div className="de-empty-state">{error}</div>
      </CmTableWrapper>
    );
  }

  return (
    <CmTableWrapper>
      <table className="de-data-table de-cm-dq-table">
        <thead>
          <tr>
            {tableColumns.map((column, index) => {
              const className = [
                column.className ?? '',
                column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : '',
              ].filter(Boolean).join(' ');
              return (
                <ThSortFilter
                  key={column.id}
                  label={column.labels[lang]}
                  colIndex={index}
                  sortCol={sortCol}
                  sortDir={sortDir}
                  onSort={handleSort}
                  onFilter={handleColFilter}
                  filterValue={colFilters[index] ?? ''}
                  className={className || undefined}
                />
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pagedRows.map((r) => (
            <tr key={`${r.security_code}-${r.trading_date}`}>
              {tableColumns.map((column) => {
                const rawValue = column.value(r);
                const displayValue = column.id === 'volume'
                  || column.id === 'day_trading_value_of_buys'
                  || column.id === 'day_trading_value_of_sells'
                  ? fmtNum(rawValue)
                  : rawValue;
                const className = [
                  column.className ?? '',
                  column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : '',
                ].filter(Boolean).join(' ');
                return (
                  <td key={column.id} className={className || undefined}>
                    {displayValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cp-news-tab-pagination">
        <button
          type="button"
          className="cp-news-tab-page-btn"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          {zh ? '‹ 上一頁' : '‹ Prev'}
        </button>
        {getPaginationRange(currentPage, totalPages).map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="cp-news-tab-page-ellipsis">…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`cp-news-tab-page-btn${currentPage === item ? ' active' : ''}`}
              onClick={() => setCurrentPage(item)}
              aria-label={`Page ${item + 1}`}
              aria-current={currentPage === item ? 'page' : undefined}
            >
              {item + 1}
            </button>
          )
        )}
        <button
          type="button"
          className="cp-news-tab-page-btn"
          onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage >= totalPages - 1}
        >
          {zh ? '下一頁 ›' : 'Next ›'}
        </button>
      </div>
    </CmTableWrapper>
  );
}

// ── Daily Quotes Field Overview Modal ────────────────────────────────────────

interface CmFieldOverviewModalProps {
  lang: 'zh' | 'en';
  isOpen: boolean;
  onClose: () => void;
  columns: Array<{ id: string; labels: { zh: string; en: string } }>;
}

function CmFieldOverviewModal({ lang, isOpen, onClose, columns }: CmFieldOverviewModalProps) {
  const zh = lang === 'zh';

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="de-dq-overview-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        className="de-dq-overview-modal"
        role="dialog"
        aria-modal="true"
        aria-label={zh ? '欄位總覽' : 'Field Overview'}
      >
        <div className="de-dq-overview-header">
          <span className="de-dq-overview-title">{zh ? '欄位總覽' : 'Field Overview'}</span>
          <button
            type="button"
            className="de-dq-overview-close"
            onClick={onClose}
            aria-label={zh ? '關閉' : 'Close'}
          >
            <CloseSmIcon />
          </button>
        </div>
        <div className="de-dq-overview-body">
          <table className="de-dq-overview-table">
            <thead>
              <tr>
                <th>English Field</th>
                <th>Chinese Field</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col) => (
                <tr key={col.id}>
                  <td>{col.labels.en}</td>
                  <td>{col.labels.zh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Daily Quotes (每日收盤行情) Tab ───────────────────────────────────────────

interface DailyQuotesTabProps {
  lang: 'zh' | 'en';
  rowsData: DailyQuoteRow[];
  loading: boolean;
  error: string | null;
  onVisibleRowsChange: (rows: DailyQuoteRow[]) => void;
}

function DailyQuotesTab({ lang, rowsData, loading, error, onVisibleRowsChange }: DailyQuotesTabProps) {
  const zh = lang === 'zh';
  const tableColumns = useMemo(
    () => CM_QUOTES_ALL_COLUMNS.filter((col) => col.tableVisible === 'Y'),
    [],
  );
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    tableColumns.map((col) => col.value),
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  useEffect(() => {
    setCurrentPage(0);
  }, [rowsData, colFilters, sortCol, sortDir]);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    onVisibleRowsChange(rows);
  }, [rows, onVisibleRowsChange]);

  if (loading) {
    return (
      <CmTableWrapper>
        <div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div>
      </CmTableWrapper>
    );
  }

  if (error) {
    return (
      <CmTableWrapper>
        <div className="de-empty-state">{error}</div>
      </CmTableWrapper>
    );
  }

  return (
    <div className="de-data-section">
      <div className="de-dq-table-scroll-wrap">
        <table className="de-data-table de-cm-dq-table">
          <thead>
            <tr>
              {tableColumns.map((col, index) => {
                const thClass = [
                  col.className ?? '',
                  col.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : '',
                ].filter(Boolean).join(' ');
                return (
                  <ThSortFilter
                    key={col.id}
                    label={col.labels[lang]}
                    colIndex={index}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onFilter={handleColFilter}
                    filterValue={colFilters[index] ?? ''}
                    showFilter={false}
                    className={thClass || undefined}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((r) => (
              <tr key={r.security_code}>
                {tableColumns.map((col) => {
                  const tdClass = [
                    col.className ?? '',
                    col.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : '',
                    col.id === 'price_change' || col.id === 'price_change_indicator'
                      ? (r.price_change_indicator === '+' ? 'pos' : r.price_change_indicator === '-' ? 'neg' : '')
                      : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <td key={col.id} className={tdClass || undefined}>
                      {col.value(r)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="cp-news-tab-pagination">
        <button
          type="button"
          className="cp-news-tab-page-btn"
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          disabled={currentPage === 0}
        >
          {zh ? '‹ 上一頁' : '‹ Prev'}
        </button>
        {getPaginationRange(currentPage, totalPages).map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="cp-news-tab-page-ellipsis">…</span>
          ) : (
            <button
              key={item}
              type="button"
              className={`cp-news-tab-page-btn${currentPage === item ? ' active' : ''}`}
              onClick={() => setCurrentPage(item)}
              aria-label={`Page ${item + 1}`}
              aria-current={currentPage === item ? 'page' : undefined}
            >
              {item + 1}
            </button>
          )
        )}
        <button
          type="button"
          className="cp-news-tab-page-btn"
          onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={currentPage >= totalPages - 1}
        >
          {zh ? '下一頁 ›' : 'Next ›'}
        </button>
      </div>
    </div>
  );
}

interface CmStandardTabProps<T> {
  lang: 'zh' | 'en';
  rowsData: T[];
  loading: boolean;
  error: string | null;
}

function CmMarginTab({ lang, rowsData, loading, error }: CmStandardTabProps<CmMarginTransactionRow>) {
  const zh = lang === 'zh';
  const tableColumns = useMemo(() => CM_MARGIN_ALL_COLUMNS.filter((column) => column.tableVisible === 'Y'), []);
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    tableColumns.map((column) => column.value),
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  if (loading) return <CmTableWrapper><div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div></CmTableWrapper>;
  if (error) return <CmTableWrapper><div className="de-empty-state">{error}</div></CmTableWrapper>;

  return (
    <div className="de-data-section">
      <div className="de-data-table-wrap de-cm-inner-table-wrap">
        <table className="de-data-table de-cm-dq-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => {
                const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                return (
                  <ThSortFilter
                    key={column.id}
                    label={column.labels[lang]}
                    colIndex={index}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onFilter={handleColFilter}
                    filterValue={colFilters[index] ?? ''}
                    showFilter={false}
                    className={className || undefined}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <tr key={`${row.security_code}-${row.data_gen_dt}-${row.data_gen_time}`}>
                {tableColumns.map((column) => {
                  const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                  const value = column.id === 'security_code' || column.id === 'tsmc_updatetime' ? column.value(row) : fmtNum(column.value(row));
                  return <td key={column.id} className={className || undefined}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CmPagination lang={lang} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

function CmShortSaleBalancesTab({ lang, rowsData, loading, error }: CmStandardTabProps<CmDailyShortSaleBalanceRow>) {
  const zh = lang === 'zh';
  const tableColumns = useMemo(() => CM_DAILY_SHORT_SALE_ALL_COLUMNS.filter((col) => col.tableVisible === 'Y'), []);
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    tableColumns.map((col) => col.value),
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  if (loading) return <CmTableWrapper><div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div></CmTableWrapper>;
  if (error) return <CmTableWrapper><div className="de-empty-state">{error}</div></CmTableWrapper>;

  return (
    <div className="de-data-section">
      <div className="de-dq-table-scroll-wrap">
        <table className="de-data-table de-cm-dq-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => {
                const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                return (
                  <ThSortFilter
                    key={column.id}
                    label={column.labels[lang]}
                    colIndex={index}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onFilter={handleColFilter}
                    filterValue={colFilters[index] ?? ''}
                    showFilter={false}
                    className={className || undefined}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <tr key={`${row.security_code}-${row.data_gen_dt}-${row.data_gen_time}`}>
                {tableColumns.map((column) => {
                  const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                  const value = column.id === 'security_code' || column.id === 'tsmc_updatetime' ? column.value(row) : fmtNum(column.value(row));
                  return <td key={column.id} className={className || undefined}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CmPagination lang={lang} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

function CmExDividendTab({ lang, rowsData, loading, error }: CmStandardTabProps<CmExRightDividendRow>) {
  const zh = lang === 'zh';
  const tableColumns = useMemo(() => CM_EX_RIGHT_DIVIDEND_ALL_COLUMNS.filter((column) => column.tableVisible === 'Y'), []);
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    tableColumns.map((column) => column.value),
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const numericFieldIds = useMemo(
    () => new Set(tableColumns.filter((column) => column.className === 'num').map((column) => column.id)),
    [tableColumns],
  );
  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  if (loading) return <CmTableWrapper><div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div></CmTableWrapper>;
  if (error) return <CmTableWrapper><div className="de-empty-state">{error}</div></CmTableWrapper>;

  return (
    <div className="de-data-section">
      <div className="de-dq-table-scroll-wrap">
        <table className="de-data-table de-cm-dq-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => {
                const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                return (
                  <ThSortFilter
                    key={column.id}
                    label={column.labels[lang]}
                    colIndex={index}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onFilter={handleColFilter}
                    filterValue={colFilters[index] ?? ''}
                    showFilter={false}
                    className={className || undefined}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <tr key={`${row.security_code}-${row.effective_date}-${row.data_code}`}>
                {tableColumns.map((column) => {
                  const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                  const value = numericFieldIds.has(column.id) ? fmtNum(column.value(row)) : column.value(row);
                  return <td key={column.id} className={className || undefined}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CmPagination lang={lang} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

function CmForeignTab({ lang, rowsData, loading, error }: CmStandardTabProps<CmForeignInvestorsRow>) {
  const zh = lang === 'zh';
  const tableColumns = useMemo(() => CM_FOREIGN_INVESTORS_ALL_COLUMNS.filter((column) => column.tableVisible === 'Y'), []);
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    tableColumns.map((column) => column.value),
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const numericFieldIds = useMemo(
    () => new Set(tableColumns.filter((column) => column.className === 'num').map((column) => column.id)),
    [tableColumns],
  );

  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  if (loading) return <CmTableWrapper><div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div></CmTableWrapper>;
  if (error) return <CmTableWrapper><div className="de-empty-state">{error}</div></CmTableWrapper>;

  return (
    <div className="de-data-section">
      <div className="de-dq-table-scroll-wrap">
        <table className="de-data-table de-cm-dq-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => {
                const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                return (
                  <ThSortFilter
                    key={column.id}
                    label={column.labels[lang]}
                    colIndex={index}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onFilter={handleColFilter}
                    filterValue={colFilters[index] ?? ''}
                    showFilter={false}
                    className={className || undefined}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <tr key={`${row.security_code}-${row.data_gen_dt}-${row.data_gen_time}`}>
                {tableColumns.map((column) => {
                  const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                  const rawValue = column.value(row);
                  const value = column.formatType === 'percent'
                    ? fmtPct(rawValue)
                    : column.formatType === 'number'
                      ? fmtNum(rawValue)
                      : rawValue;
                  return <td key={column.id} className={className || undefined}>{value}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CmPagination lang={lang} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

function CmPriceLimitTab({ lang, rowsData, loading, error }: CmStandardTabProps<CmPriceVariationLimitRow>) {
  const zh = lang === 'zh';
  const tableColumns = useMemo(() => CM_PRICE_LIMIT_ALL_COLUMNS.filter((column) => column.tableVisible === 'Y'), []);
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    tableColumns.map((column) => column.value),
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  if (loading) return <CmTableWrapper><div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div></CmTableWrapper>;
  if (error) return <CmTableWrapper><div className="de-empty-state">{error}</div></CmTableWrapper>;

  return (
    <div className="de-data-section">
      <div className="de-dq-table-scroll-wrap">
        <table className="de-data-table de-cm-dq-table">
          <thead>
            <tr>
              {tableColumns.map((column, index) => {
                const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                return (
                  <ThSortFilter
                    key={column.id}
                    label={column.labels[lang]}
                    colIndex={index}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onFilter={handleColFilter}
                    filterValue={colFilters[index] ?? ''}
                    showFilter={false}
                    className={className || undefined}
                  />
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((row) => (
              <tr key={`${row.security_code}-${row.data_gen_dt}-${row.data_gen_time}`}>
                {tableColumns.map((column) => {
                  const className = [column.className ?? '', column.freezePane === 'Y' ? 'de-cm-dq-col-sticky' : ''].filter(Boolean).join(' ');
                  const rawValue = column.value(row);
                  const value = column.formatType === 'percent'
                    ? fmtPct(rawValue)
                    : column.formatType === 'number'
                      ? fmtNum(rawValue)
                      : rawValue;
                  return <td key={column.id} className={className || undefined}>{value || '—'}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CmPagination lang={lang} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

function CmPeRatioTab({ lang, rowsData, loading, error }: CmStandardTabProps<(typeof CM_PE_RATIO)[number]>) {
  const zh = lang === 'zh';
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.yield, (r) => r.pe, (r) => r.pb],
  );
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedRows = rows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  useEffect(() => {
    setCurrentPage(0);
  }, [rows]);

  if (loading) return <CmTableWrapper><div className="de-empty-state">{zh ? '載入中…' : 'Loading...'}</div></CmTableWrapper>;
  if (error) return <CmTableWrapper><div className="de-empty-state">{error}</div></CmTableWrapper>;

  return (
    <div className="de-data-section">
      <div className="de-data-table-wrap de-cm-inner-table-wrap">
        <table className="de-data-table">
          <thead>
            <tr>
              <ThSortFilter label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
              <ThSortFilter label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
              <ThSortFilter label={zh ? '殖利率(%)' : 'Dividend Yield (%)'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} className="num" />
              <ThSortFilter label={zh ? '本益比' : 'P/E Ratio'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
              <ThSortFilter label={zh ? '股價淨值比' : 'P/B Ratio'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
            </tr>
          </thead>
          <tbody>
            {pagedRows.map((r) => (
              <tr key={r.code}>
                <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
                <td className={`num${r.yield.startsWith('-') ? ' neg' : ''}`}>{fmtPct(r.yield)}</td>
                <td className="num">{fmtNum(r.pe)}</td>
                <td className="num">{fmtNum(r.pb)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CmPagination lang={lang} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}

// ── Capital Markets — Date Picker + Layout ────────────────────────────────────

interface CmFilterBarProps {
  lang: 'zh' | 'en';
  securityCode: string;
  securityCodes: string[];
  startDate: string;
  endDate: string;
  minStartDate: string;
  maxStartDate: string;
  minEndDate: string;
  maxEndDate: string;
  onSecurityCodeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

function CmFilterBar({
  lang,
  securityCode,
  securityCodes,
  startDate,
  endDate,
  minStartDate,
  maxStartDate,
  minEndDate,
  maxEndDate,
  onSecurityCodeChange,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onClear,
}: CmFilterBarProps) {
  const zh = lang === 'zh';
  const disableSearch = !startDate || !endDate;
  const [securityCodeSearch, setSecurityCodeSearch] = useState(securityCode);
  const [isSecurityCodeOpen, setIsSecurityCodeOpen] = useState(false);
  const filteredSecurityCodes = useMemo(() => {
    const query = securityCodeSearch.trim().toLowerCase();
    if (!query) return securityCodes;
    return securityCodes.filter((code) => code.toLowerCase().includes(query));
  }, [securityCodeSearch, securityCodes]);

  useEffect(() => {
    setSecurityCodeSearch(securityCode);
  }, [securityCode]);

  return (
    <div className="de-cm-filter-wrap">
      <div className="de-cm-filter-field">
        <span className="de-cm-filter-label">{zh ? 'Security Code' : 'Security Code'}</span>
        <div className="de-cm-security-select">
          <input
            className="de-cm-filter-select de-cm-security-input"
            type="text"
            value={securityCodeSearch}
            onChange={(e) => {
              const nextValue = e.target.value;
              setSecurityCodeSearch(nextValue);
              setIsSecurityCodeOpen(true);
              if (!nextValue.trim()) {
                onSecurityCodeChange('');
              }
            }}
            onFocus={() => setIsSecurityCodeOpen(true)}
            onBlur={() => setTimeout(() => setIsSecurityCodeOpen(false), 150)}
            placeholder={zh ? '全部' : 'All'}
            aria-label={zh ? 'Security Code' : 'Security Code'}
          />
          {isSecurityCodeOpen && (
            <div className="de-cm-security-options" role="listbox" aria-label={zh ? 'Security Code 選單' : 'Security Code options'}>
              <button
                type="button"
                className={`de-cm-security-option${securityCode === '' ? ' active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSecurityCodeChange('');
                  setSecurityCodeSearch('');
                  setIsSecurityCodeOpen(false);
                }}
              >
                {zh ? '全部' : 'All'}
              </button>
              {filteredSecurityCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  className={`de-cm-security-option${securityCode === code ? ' active' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSecurityCodeChange(code);
                    setSecurityCodeSearch(code);
                    setIsSecurityCodeOpen(false);
                  }}
                >
                  {code}
                </button>
              ))}
              {filteredSecurityCodes.length === 0 && (
                <div className="de-cm-security-empty">{zh ? '查無資料' : 'No results'}</div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="de-cm-filter-field">
        <span className="de-cm-filter-label">{zh ? 'Period' : 'Period'}</span>
        <div className="de-cm-period-wrap">
          <input
            className="de-cm-period-input"
            type="date"
            value={startDate}
            min={minStartDate}
            max={maxStartDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            onClick={(e) => tryOpenNativeDatePicker(e.currentTarget)}
            onFocus={(e) => tryOpenNativeDatePicker(e.currentTarget)}
            aria-label={zh ? '起始日期' : 'Start date'}
          />
          <span className="de-cm-period-sep">~</span>
          <input
            className="de-cm-period-input"
            type="date"
            value={endDate}
            min={minEndDate}
            max={maxEndDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            onClick={(e) => tryOpenNativeDatePicker(e.currentTarget)}
            onFocus={(e) => tryOpenNativeDatePicker(e.currentTarget)}
            aria-label={zh ? '結束日期' : 'End date'}
          />
        </div>
      </div>
      <button
        type="button"
        className="de-cm-search-btn"
        onClick={onSearch}
        disabled={disableSearch}
      >
        {zh ? '搜尋' : 'Search'}
      </button>
      <button
        type="button"
        className="de-cm-clear-btn"
        onClick={onClear}
        disabled={disableSearch}
      >
        {zh ? '清除' : 'Clear'}
      </button>
    </div>
  );
}

interface CmDownloadCsvModalProps {
  lang: 'zh' | 'en';
  isOpen: boolean;
  startDate: string;
  endDate: string;
  minDate: string;
  maxDate: string;
  downloading: boolean;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onClose: () => void;
  onDownload: () => void;
}

function CmDownloadCsvModal({
  lang,
  isOpen,
  startDate,
  endDate,
  minDate,
  maxDate,
  downloading,
  onStartDateChange,
  onEndDateChange,
  onClose,
  onDownload,
}: CmDownloadCsvModalProps) {
  const zh = lang === 'zh';

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="de-cm-csv-modal-backdrop" onClick={onClose} />
      <div
        className="de-cm-csv-modal"
        role="dialog"
        aria-modal="true"
        aria-label={zh ? '下載 CSV 區間設定' : 'Download CSV date range'}
      >
        <div className="de-cm-csv-modal-header">
          <h2 className="de-cm-csv-modal-title">{zh ? '下載 CSV' : 'Download CSV'}</h2>
          <button
            type="button"
            className="de-cm-csv-modal-close"
            onClick={onClose}
            aria-label={zh ? '關閉' : 'Close'}
          >
            <CloseSmIcon />
          </button>
        </div>
        <div className="de-cm-csv-modal-body">
          <div className="de-cm-csv-modal-field">
            <span className="de-cm-filter-label">{zh ? '期間' : 'Period'}</span>
            <div className="de-cm-period-wrap">
              <input
                className="de-cm-period-input"
                type="date"
                min={minDate}
                max={maxDate}
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                onClick={(e) => tryOpenNativeDatePicker(e.currentTarget)}
                onFocus={(e) => tryOpenNativeDatePicker(e.currentTarget)}
                aria-label={zh ? '下載起始日期' : 'Download start date'}
              />
              <span className="de-cm-period-sep">~</span>
              <input
                className="de-cm-period-input"
                type="date"
                min={minDate}
                max={maxDate}
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                onClick={(e) => tryOpenNativeDatePicker(e.currentTarget)}
                onFocus={(e) => tryOpenNativeDatePicker(e.currentTarget)}
                aria-label={zh ? '下載結束日期' : 'Download end date'}
              />
            </div>
          </div>
          <div className="de-cm-csv-modal-actions">
            <button
              type="button"
              className="de-news-download-btn de-gov-csv-btn"
              onClick={onDownload}
              disabled={downloading}
            >
              <DownloadIcon />
              <span>{downloading ? (zh ? '下載中…' : 'Downloading...') : (zh ? '下載 CSV' : 'Download CSV')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── CSV download helpers for Capital Markets ──────────────────────────────────

interface CapitalMarketsCsvOptions {
  statisticsForDayTradingRows?: CmDailyQuoteRow[];
  dailyQuotesRows?: DailyQuoteRow[];
  marginRows?: CmMarginTransactionRow[];
  shortSaleRows?: CmDailyShortSaleBalanceRow[];
  exRightDividendRows?: CmExRightDividendRow[];
  foreignInvestorsRows?: CmForeignInvestorsRow[];
  priceLimitRows?: CmPriceVariationLimitRow[];
}

function downloadCapitalMarketsCSV(tabId: string, lang: 'zh' | 'en', options: CapitalMarketsCsvOptions = {}) {
  const zh = lang === 'zh';
  switch (tabId) {
    case 'daily-quotes': {
      const rows = options.dailyQuotesRows ?? [];
      downloadCSV(
        zh ? '每日收盤行情.csv' : 'daily-quotes.csv',
        CM_QUOTES_ALL_COLUMNS.map((col) => col.labels[lang]),
        rows.map((row) => CM_QUOTES_ALL_COLUMNS.map((col) => col.value(row))),
      );
      break;
    }
    case 'day-trading': {
      const rows = options.statisticsForDayTradingRows ?? [];
      const csvColumns = CM_DAY_TRADING_COLUMNS;
      downloadCSV(zh ? '每日沖銷交易標記及統計.csv' : 'statistics-for-day-trading.csv',
        csvColumns.map((column) => column.labels[lang]),
        rows.map((row) => csvColumns.map((column) => column.value(row))));
      break;
    }
    case 'margin': {
      const rows = options.marginRows ?? [];
      const csvColumns: Array<{ id: keyof CmMarginTransactionRow; labels: { zh: string; en: string } }> = [
        { id: 'security_code', labels: { zh: '證券代號', en: 'Security Code' } },
        { id: 'security_type', labels: { zh: '證券類', en: 'Security Type' } },
        { id: 'total_mp_reduction_limit', labels: { zh: '降低融資比率(總計)', en: 'Total Reduction of Margin Purchase Limit' } },
        { id: 'prev_mp_balance', labels: { zh: '昨日融資餘額', en: 'Last Day Balance of Margin Purchase' } },
        { id: 'daily_mp_purchase', labels: { zh: '今日融資買進', en: 'New Margin Purchase' } },
        { id: 'daily_mp_redemption', labels: { zh: '今日融資賣出', en: 'Redemption of Margin Purchase' } },
        { id: 'daily_mp_cash_repayment', labels: { zh: '今日現金償還', en: 'Outstanding of Margin Purchase' } },
        { id: 'daily_mp_balance', labels: { zh: '今日融資餘額', en: 'Balance of Margin Purchase' } },
        { id: 'margin_trading_limit', labels: { zh: '信用交易限額', en: 'Margin Trading Limit' } },
        { id: 'prev_ss_balance', labels: { zh: '昨日融券餘額', en: 'Last Day Balance of Short Sale' } },
        { id: 'daily_ss_sale', labels: { zh: '今日融券賣出', en: 'Redemption of Short Sale' } },
        { id: 'daily_ss_repayment', labels: { zh: '今日融券買進', en: 'New Short Sale' } },
        { id: 'daily_ss_stock_repayment', labels: { zh: '今日現券償還', en: 'Outstanding of Short Sale' } },
        { id: 'daily_ss_balance', labels: { zh: '今日融券餘額', en: 'Balance of Short Sale' } },
        { id: 'mp_restriction_code', labels: { zh: '融資限制碼', en: 'Suspension of Margin Purchase' } },
        { id: 'ss_restriction_code', labels: { zh: '融券限制碼', en: 'Suspension of Short Sale' } },
        { id: 'ss_ge_60_percent_mp_flag', labels: { zh: '融券餘額≧融資餘額60%', en: 'Remain of Short Sale ≧ 60% of Remain of margin' } },
        { id: 'price_volatility_flag', labels: { zh: '股價波動過度劇烈註記', en: 'Short Sale is too Volatile' } },
        { id: 'equity_concentration_flag', labels: { zh: '股權過度集中註記', en: 'Equity Ownership is overly Concentrated' } },
        { id: 'abnormal_volume_flag', labels: { zh: '成交量過度異常', en: 'Trading Volume is excessively Abnormal' } },
        { id: 'disposition_measures_flag', labels: { zh: '監視第二次處置註記', en: 'Stock under Disposition Measures two or more times (inclusive)' } },
        { id: 'tdr_mp_reduction', labels: { zh: 'tdr兌回異常降低融資比率', en: 'Margin Purchase Reduction' } },
        { id: 'mp_balance_for_securities_financing', labels: { zh: '融資餘額中屬證金部分', en: 'Balance of Margin Purchase belonging to Securities' } },
        { id: 'ss_balance_for_securities_financing', labels: { zh: '融券餘額中屬證金部分', en: 'Balance of Short Sale belonging to Securities' } },
        { id: 'supervisory_mp_reduction', labels: { zh: '監視業務督導會報降低融資比率', en: 'Margin Purchase Reduction of Margin Purchase Leverage Limit' } },
        { id: 'supervisory_ss_margin_increment', labels: { zh: '監視業務督導會報提高融券保證金成數', en: 'Increment of Short Sale Margin Requirement' } },
        { id: 'total_ss_margin_increment', labels: { zh: '提高融券保證金成數(總計)', en: 'Total of Short Sale Margin Requirement Increment' } },
        { id: 'data_gen_dt', labels: { zh: '資料產生日期', en: 'Data Generation Date' } },
        { id: 'data_gen_time', labels: { zh: '資料產生時間', en: 'Data Generation Time' } },
      ];
      downloadCSV(
        zh ? '融資融券餘額.csv' : 'margin-transaction.csv',
        csvColumns.map((column) => column.labels[lang]),
        rows.map((row) => csvColumns.map((column) => row[column.id] ?? '')),
      );
      break;
    }
    case 'short-sale': {
      const rows = options.shortSaleRows ?? [];
      const csvColumns: Array<{ id: keyof CmDailyShortSaleBalanceRow | 'tsmc_updatetime'; labels: { zh: string; en: string }; getValue: (r: CmDailyShortSaleBalanceRow) => string }> = [
        { id: 'security_code',                  labels: { zh: '證券代號',             en: 'Security Code' },                                       getValue: (r) => r.security_code },
        { id: 'prev_day_m_short_sale_balance',  labels: { zh: '前日融券餘額股數',     en: 'Previous day balance of Margin Short Sales' },          getValue: (r) => r.prev_day_m_short_sale_balance },
        { id: 'daily_m_short_sale_volume',      labels: { zh: '本日融券賣出股數',     en: 'Short Sales of Margin Short Sales' },                   getValue: (r) => r.daily_m_short_sale_volume },
        { id: 'daily_m_short_cover_volume',     labels: { zh: '本日融券買進股數',     en: 'Short Covering of Margin Short Sales' },                getValue: (r) => r.daily_m_short_cover_volume },
        { id: 'daily_m_stock_redemption_volume',labels: { zh: '本日現券償還股數',     en: 'Stock Redemption of Margin Short Sales' },              getValue: (r) => r.daily_m_stock_redemption_volume },
        { id: 'daily_m_short_sale_balance',     labels: { zh: '本日融券餘額股數',     en: 'Current day balance of Margin Short Sales' },           getValue: (r) => r.daily_m_short_sale_balance },
        { id: 'daily_m_short_sale_quota',       labels: { zh: '本日融券限額',         en: 'Quota of Margin Short Sales' },                         getValue: (r) => r.daily_m_short_sale_quota },
        { id: 'prev_day_sbl_short_sale_balance',labels: { zh: '前日借券賣出餘額股數', en: 'Previous day balance of Sbl Short Sales' },             getValue: (r) => r.prev_day_sbl_short_sale_balance },
        { id: 'daily_sbl_short_sale_volume',    labels: { zh: '本日市場借券賣出股數', en: 'Current day short sales of Sbl Short Sales' },          getValue: (r) => r.daily_sbl_short_sale_volume },
        { id: 'daily_sbl_return_volume',        labels: { zh: '本日還券股數',         en: 'Current day returns of Sbl Short Sales' },              getValue: (r) => r.daily_sbl_return_volume },
        { id: 'daily_sbl_adjustment_volume',    labels: { zh: '本日調整股數',         en: 'Current day adjustments of Sbl Short Sales' },          getValue: (r) => r.daily_sbl_adjustment_volume },
        { id: 'daily_sbl_short_sale_balance',   labels: { zh: '本日借券賣出餘額股數', en: 'Current day balance of Sbl Short Sales' },              getValue: (r) => r.daily_sbl_short_sale_balance },
        { id: 'daily_sbl_next_day_quota',       labels: { zh: '本日可借券賣出限額',   en: 'Quota for the next day of Sbl Short Sales' },           getValue: (r) => r.daily_sbl_next_day_quota },
        { id: 'margin_trade_status',            labels: { zh: '信用交易狀態',         en: 'Eligible Trade' },                                      getValue: (r) => r.margin_trade_status },
        { id: 'sbl_trade_status',               labels: { zh: '借券交易狀態',         en: 'Suspension of Sbl Short Sales' },                       getValue: (r) => r.sbl_trade_status },
        { id: 'tsmc_updatetime',                labels: { zh: '台積更新時間',         en: 'TSMC Updatetime' },                                     getValue: (r) => `${r.data_gen_dt}${r.data_gen_time ? ` ${r.data_gen_time}` : ''}`.trim() || '—' },
      ];
      downloadCSV(
        zh ? '信用額度總量管制餘額檔.csv' : 'daily-short-sale-balances.csv',
        csvColumns.map((col) => col.labels[lang]),
        rows.map((row) => csvColumns.map((col) => col.getValue(row))),
      );
      break;
    }
    case 'ex-dividend': {
      const rows = options.exRightDividendRows ?? [];
      const csvColumns = [
        ...CM_EX_RIGHT_DIVIDEND_ALL_COLUMNS
          .filter((column) => column.id !== 'tsmc_updatetime')
          .map((column) => ({
            labels: column.labels,
            getValue: (row: CmExRightDividendRow) => column.value(row),
          })),
        { labels: { zh: '資料產生日期', en: 'Data Generation Date' }, getValue: (row: CmExRightDividendRow) => row.data_gen_dt },
        { labels: { zh: '資料產生時間', en: 'Data Generation Time' }, getValue: (row: CmExRightDividendRow) => row.data_gen_time },
      ];
      downloadCSV(
        zh ? '除權息及上下市資訊.csv' : 'ex-right-dividend.csv',
        csvColumns.map((column) => column.labels[lang]),
        rows.map((row) => csvColumns.map((column) => column.getValue(row))),
      );
      break;
    }
    case 'foreign-investors': {
      const rows = options.foreignInvestorsRows ?? [];
      const csvColumns: Array<{ labels: { zh: string; en: string }; getValue: (row: CmForeignInvestorsRow) => string }> = [
        { labels: { zh: '證券代號', en: 'Security Code' }, getValue: (row) => row.security_code },
        { labels: { zh: '證券名稱', en: 'Stock Name' }, getValue: (row) => row.security_name },
        { labels: { zh: '發行股數', en: 'Shares Issued' }, getValue: (row) => row.total_issued_shares },
        { labels: { zh: '外資尚可投資股數', en: 'Shares Available for Foreign Investment' }, getValue: (row) => row.foreign_investor_remaining_shares },
        { labels: { zh: '全體外資持有股數', en: 'Total Shares Held by Foreign Investors' }, getValue: (row) => row.total_foreign_investor_holding_shares },
        { labels: { zh: '外資尚可投資比率', en: 'Foreign Investment Available Percentage' }, getValue: (row) => row.foreign_investor_remaining_ratio },
        { labels: { zh: '全體外資持股比率', en: 'Total Foreign Ownership Percentage' }, getValue: (row) => row.total_foreign_investor_holding_ratio },
        { labels: { zh: '法令投資上限比率', en: 'Regulatory Foreign Ownership Limit (FOL)' }, getValue: (row) => row.statutory_investment_cap_ratio },
        { labels: { zh: '與前日異動原因', en: 'Reason for Day-over-Day Change' }, getValue: (row) => row.change_reason_code },
        { labels: { zh: '最近一次上市公司申報外資持股異動日期', en: 'Last Reported Foreign Shareholding Change Date' }, getValue: (row) => row.last_foreign_holding_change_date },
        { labels: { zh: '資料產生日期', en: 'Data Generation Date' }, getValue: (row) => row.data_gen_dt },
        { labels: { zh: '資料產生時間', en: 'Data Generation Time' }, getValue: (row) => row.data_gen_time },
      ];
      downloadCSV(
        zh ? '外資投資持股統計.csv' : 'foreign-investors.csv',
        csvColumns.map((column) => column.labels[lang]),
        rows.map((row) => csvColumns.map((column) => column.getValue(row))),
      );
      break;
    }
    case 'price-limit': {
      const rows = options.priceLimitRows ?? [];
      const csvColumns: Array<{ labels: { zh: string; en: string }; getValue: (row: CmPriceVariationLimitRow) => string }> = [
        { labels: { zh: '股票代號', en: 'Security Code' }, getValue: (row) => row.security_code },
        { labels: { zh: '漲停價', en: 'Limit Up' }, getValue: (row) => row.limit_up_price },
        { labels: { zh: '開盤競價基準', en: 'Opening Reference Price' }, getValue: (row) => row.opening_ref_price },
        { labels: { zh: '跌停價', en: 'Limit Down' }, getValue: (row) => row.limit_down_price },
        { labels: { zh: '上次成交日', en: 'Last Trading Date' }, getValue: (row) => row.last_trading_date },
        { labels: { zh: '交易方式', en: 'Trading Method' }, getValue: (row) => row.trading_method },
        { labels: { zh: '處置股票註記', en: 'Disposition Securities Mark' }, getValue: (row) => row.disposition_mark },
        { labels: { zh: '注意股票註記', en: 'Attention Securities Mark' }, getValue: (row) => row.attention_mark },
        { labels: { zh: '委託限制註記', en: 'Limit Order Mark' }, getValue: (row) => row.order_limit_mark },
        { labels: { zh: '產業別代碼', en: 'Industry Category Code' }, getValue: (row) => row.industry_code },
        { labels: { zh: '證券別代碼', en: 'Security Category Code' }, getValue: (row) => row.security_category_code },
        { labels: { zh: '豁免平盤下融券賣出註記', en: 'Allow Short Sales When Price Under Opening Price Mark' }, getValue: (row) => row.exempt_short_sale_mark },
        { labels: { zh: '股票中文名稱', en: 'Name' }, getValue: (row) => row.security_ch_name },
        { labels: { zh: '撮合循環時間（分）', en: 'Matching Interval(min)' }, getValue: (row) => row.matching_interval_min },
        { labels: { zh: '單筆委託限制數量', en: 'Single Order Volume Limit(Shares)' }, getValue: (row) => row.single_order_volume_limit },
        { labels: { zh: '多筆委託限制數量', en: 'Multiple Order Volume Limit(Shares)' }, getValue: (row) => row.multiple_order_volume_limit },
        { labels: { zh: '款券預收成數(%)', en: 'Advance Collection Percentage(%)' }, getValue: (row) => row.advance_collection_percentage },
        { labels: { zh: '豁免平盤下借券賣出註記', en: 'Allow SBL Short Sales When Price Under Opening Price Mark' }, getValue: (row) => row.exempt_sbl_short_sale_mark },
        { labels: { zh: '面額註記', en: 'Par Value Mark' }, getValue: (row) => row.par_value_mark },
        { labels: { zh: '可先買後賣現股當沖註記', en: 'Allow Day Trade Mark' }, getValue: (row) => row.allow_day_trade_mark },
        { labels: { zh: '板別註記', en: 'Board Mark' }, getValue: (row) => row.board_mark },
        { labels: { zh: '資料產生日期', en: 'Data Generation Date' }, getValue: (row) => row.data_gen_dt },
        { labels: { zh: '資料產生時間', en: 'Data Generation Time' }, getValue: (row) => row.data_gen_time },
      ];
      downloadCSV(
        zh ? '漲跌幅度表.csv' : 'price-variation-limit.csv',
        csvColumns.map((column) => column.labels[lang]),
        rows.map((row) => csvColumns.map((column) => column.getValue(row) || '')),
      );
      break;
    }
    case 'pe-ratio':
      downloadCSV(zh ? '個股日本益比殖利率及股價淨值比.csv' : 'pe-ratio-dividend-yield.csv',
        zh ? ['股票代號','名稱','殖利率(%)','本益比','股價淨值比'] : ['Code','Name','Dividend Yield (%)','P/E Ratio','P/B Ratio'],
        CM_PE_RATIO.map(r => [r.code, zh ? r.nameZh : r.nameEn, r.yield, r.pe, r.pb]));
      break;
  }
}

// ── Capital Markets Layout (sidebar + content) ────────────────────────────────

interface CapitalMarketsLayoutProps {
  lang: 'zh' | 'en';
  accentColor: string;
  activeCmTab: (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number];
  onChangeCmTab: (tabId: (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number]) => void;
}

function CapitalMarketsLayout({ lang, accentColor, activeCmTab, onChangeCmTab }: CapitalMarketsLayoutProps) {
  const zh = lang === 'zh';
  const defaultQueryDate = useMemo(() => getYesterdayIsoDate(), []);
  const minAllowedDate = useMemo(() => addMonthsIsoDate(defaultQueryDate, -3), [defaultQueryDate]);
  const minAllowedDateNoCode = useMemo(() => addDaysIsoDate(defaultQueryDate, -30), [defaultQueryDate]);
  const [securityCodes, setSecurityCodes] = useState<string[]>([]);
  const [securityCode, setSecurityCode] = useState('');
  const [startDate, setStartDate] = useState(defaultQueryDate);
  const [endDate, setEndDate] = useState(defaultQueryDate);
  // day-trading tab state
  const [dailyQuoteRows, setDailyQuoteRows] = useState<CmDailyQuoteRow[]>([]);
  const [dailyQuoteVisibleRows, setDailyQuoteVisibleRows] = useState<CmDailyQuoteRow[]>([]);
  const [dailyQuotesLoading, setDailyQuotesLoading] = useState(false);
  const [dailyQuotesError, setDailyQuotesError] = useState<string | null>(null);
  // daily-quotes tab state
  const [getDailyQuotesRows, setGetDailyQuotesRows] = useState<DailyQuoteRow[]>([]);
  const [getDailyQuotesVisibleRows, setGetDailyQuotesVisibleRows] = useState<DailyQuoteRow[]>([]);
  const [getDailyQuotesLoading, setGetDailyQuotesLoading] = useState(false);
  const [getDailyQuotesError, setGetDailyQuotesError] = useState<string | null>(null);
  // margin tab state
  const [marginRows, setMarginRows] = useState<CmMarginTransactionRow[]>([]);
  const [marginLoading, setMarginLoading] = useState(false);
  const [marginError, setMarginError] = useState<string | null>(null);
  // other inner table states
  const [shortSaleRows, setShortSaleRows] = useState<CmDailyShortSaleBalanceRow[]>([]);
  const [shortSaleLoading, setShortSaleLoading] = useState(false);
  const [shortSaleError, setShortSaleError] = useState<string | null>(null);
  const [exDividendRows, setExDividendRows] = useState<CmExRightDividendRow[]>([]);
  const [exDividendLoading, setExDividendLoading] = useState(false);
  const [exDividendError, setExDividendError] = useState<string | null>(null);
  const [foreignRows, setForeignRows] = useState<CmForeignInvestorsRow[]>([]);
  const [foreignLoading, setForeignLoading] = useState(false);
  const [foreignError, setForeignError] = useState<string | null>(null);
  const [priceLimitRows, setPriceLimitRows] = useState<CmPriceVariationLimitRow[]>([]);
  const [priceLimitLoading, setPriceLimitLoading] = useState(false);
  const [priceLimitError, setPriceLimitError] = useState<string | null>(null);
  const [peRatioRows, setPeRatioRows] = useState<Array<(typeof CM_PE_RATIO)[number]>>([]);
  const [peRatioLoading, setPeRatioLoading] = useState(false);
  const [peRatioError, setPeRatioError] = useState<string | null>(null);
  const [isFieldOverviewOpen, setIsFieldOverviewOpen] = useState(false);
  const [fieldOverviewColumns, setFieldOverviewColumns] = useState<Array<{ id: string; labels: { zh: string; en: string } }>>(CM_MARGIN_ALL_COLUMNS);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadStartDate, setDownloadStartDate] = useState(defaultQueryDate);
  const [downloadEndDate, setDownloadEndDate] = useState(defaultQueryDate);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const CM_INNER_TABS = [
    { id: 'daily-quotes',      label: zh ? '每日收盤行情' : 'Daily Quotes' },
    { id: 'day-trading',       label: zh ? '每日沖銷交易標記及統計' : 'Statistics for Day Trading' },
    { id: 'margin',            label: zh ? '融資融券餘額' : 'Margin Transaction' },
    { id: 'short-sale',        label: zh ? '信用額度總量管制餘額檔' : 'Daily Short Sale Balances' },
    { id: 'ex-dividend',       label: zh ? '除權息及上下市資訊檔' : 'Ex-Right/Dividend & List/Delist' },
    { id: 'foreign-investors', label: zh ? '外資投資持股統計' : 'Invested Amt of Foreign' },
    { id: 'price-limit',       label: zh ? '漲跌幅度表檔' : 'Price Variation Limit' },
    { id: 'pe-ratio',          label: zh ? '個股日本益比、殖利率及股價淨值比' : 'P/E Ratio, Dividend Yield, P/B Ratio' },
  ];

  const queryDailyQuotes = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setDailyQuotesLoading(true);
    setDailyQuotesError(null);
    try {
      const rows = await fetchStatisticsForDayTradingRows(nextStartDate, nextEndDate, nextSecurityCode);
      setDailyQuoteRows(rows);
      setDailyQuoteVisibleRows(rows);
    } catch (error) {
      setDailyQuotesError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setDailyQuoteRows([]);
      setDailyQuoteVisibleRows([]);
    } finally {
      setDailyQuotesLoading(false);
    }
  }, [zh]);

  const queryGetDailyQuotes = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setGetDailyQuotesLoading(true);
    setGetDailyQuotesError(null);
    try {
      const rows = await fetchDailyQuotes(nextStartDate, nextEndDate, nextSecurityCode);
      setGetDailyQuotesRows(rows);
      setGetDailyQuotesVisibleRows(rows);
    } catch (error) {
      setGetDailyQuotesError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setGetDailyQuotesRows([]);
      setGetDailyQuotesVisibleRows([]);
    } finally {
      setGetDailyQuotesLoading(false);
    }
  }, [zh]);

  const queryMarginTransaction = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setMarginLoading(true);
    setMarginError(null);
    try {
      const rows = await fetchMarginTransaction(nextStartDate, nextEndDate, nextSecurityCode);
      setMarginRows(rows);
    } catch (error) {
      setMarginError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setMarginRows([]);
    } finally {
      setMarginLoading(false);
    }
  }, [zh]);

  const queryDailyShortSaleBalances = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setShortSaleLoading(true);
    setShortSaleError(null);
    try {
      const rows = await fetchDailyShortSaleBalances(nextStartDate, nextEndDate, nextSecurityCode);
      setShortSaleRows(rows);
    } catch (error) {
      setShortSaleError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setShortSaleRows([]);
    } finally {
      setShortSaleLoading(false);
    }
  }, [zh]);

  const queryRightAndDividend = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setExDividendLoading(true);
    setExDividendError(null);
    try {
      const rows = await fetchRightAndDividend(nextStartDate, nextEndDate, nextSecurityCode);
      setExDividendRows(rows);
    } catch (error) {
      setExDividendError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setExDividendRows([]);
    } finally {
      setExDividendLoading(false);
    }
  }, [zh]);

  const queryForeignInvestors = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setForeignLoading(true);
    setForeignError(null);
    try {
      const rows = await fetchInvestedAmtOfForeign(nextStartDate, nextEndDate, nextSecurityCode);
      setForeignRows(rows);
    } catch (error) {
      setForeignError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setForeignRows([]);
    } finally {
      setForeignLoading(false);
    }
  }, [zh]);

  const queryPriceVariationLimit = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setPriceLimitLoading(true);
    setPriceLimitError(null);
    try {
      const rows = await fetchPriceVariationLimit(nextStartDate, nextEndDate, nextSecurityCode);
      setPriceLimitRows(rows);
    } catch (error) {
      setPriceLimitError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setPriceLimitRows([]);
    } finally {
      setPriceLimitLoading(false);
    }
  }, [zh]);

  const queryPeRatioDividendYieldPbRatio = useCallback(async (nextStartDate: string, nextEndDate: string, nextSecurityCode: string) => {
    setPeRatioLoading(true);
    setPeRatioError(null);
    try {
      const rows = await fetchPeRatioDividendYieldPbRatio(nextStartDate, nextEndDate, nextSecurityCode);
      setPeRatioRows(rows);
    } catch (error) {
      setPeRatioError(error instanceof Error ? error.message : (zh ? '資料讀取失敗' : 'Failed to load data'));
      setPeRatioRows([]);
    } finally {
      setPeRatioLoading(false);
    }
  }, [zh]);

  useEffect(() => {
    fetchSecurityCodeOptions()
      .then((items) => {
        setSecurityCodes(items);
      })
      .catch(() => {
        setSecurityCodes(CM_COMPANIES.map((company) => company.code));
      });
  }, []);

  useEffect(() => {
    switch (activeCmTab) {
      case 'daily-quotes':
        queryGetDailyQuotes(startDate, endDate, securityCode);
        break;
      case 'day-trading':
        queryDailyQuotes(startDate, endDate, securityCode);
        break;
      case 'margin':
        queryMarginTransaction(startDate, endDate, securityCode);
        break;
      case 'short-sale':
        queryDailyShortSaleBalances(startDate, endDate, securityCode);
        break;
      case 'ex-dividend':
        queryRightAndDividend(startDate, endDate, securityCode);
        break;
      case 'foreign-investors':
        queryForeignInvestors(startDate, endDate, securityCode);
        break;
      case 'price-limit':
        queryPriceVariationLimit(startDate, endDate, securityCode);
        break;
      case 'pe-ratio':
        queryPeRatioDividendYieldPbRatio(startDate, endDate, securityCode);
        break;
      default:
        break;
    }
  }, [
    activeCmTab,
    queryDailyQuotes,
    queryDailyShortSaleBalances,
    queryRightAndDividend,
    queryGetDailyQuotes,
    queryForeignInvestors,
    queryMarginTransaction,
    queryPeRatioDividendYieldPbRatio,
    queryPriceVariationLimit,
  ]);

  const clampToAllowedDate = useCallback((value: string): string => {
    if (value < minAllowedDate) return minAllowedDate;
    if (value > defaultQueryDate) return defaultQueryDate;
    return value;
  }, [defaultQueryDate, minAllowedDate]);

  function handleSearch() {
    switch (activeCmTab) {
      case 'daily-quotes':
        queryGetDailyQuotes(startDate, endDate, securityCode);
        break;
      case 'day-trading':
        queryDailyQuotes(startDate, endDate, securityCode);
        break;
      case 'margin':
        queryMarginTransaction(startDate, endDate, securityCode);
        break;
      case 'short-sale':
        queryDailyShortSaleBalances(startDate, endDate, securityCode);
        break;
      case 'ex-dividend':
        queryRightAndDividend(startDate, endDate, securityCode);
        break;
      case 'foreign-investors':
        queryForeignInvestors(startDate, endDate, securityCode);
        break;
      case 'price-limit':
        queryPriceVariationLimit(startDate, endDate, securityCode);
        break;
      case 'pe-ratio':
        queryPeRatioDividendYieldPbRatio(startDate, endDate, securityCode);
        break;
      default:
        break;
    }
  }

  function handleClear() {
    setSecurityCode('');
    setStartDate(defaultQueryDate);
    setEndDate(defaultQueryDate);
    switch (activeCmTab) {
      case 'daily-quotes':
        queryGetDailyQuotes(defaultQueryDate, defaultQueryDate, '');
        break;
      case 'day-trading':
        queryDailyQuotes(defaultQueryDate, defaultQueryDate, '');
        break;
      case 'margin':
        queryMarginTransaction(defaultQueryDate, defaultQueryDate, '');
        break;
      case 'short-sale':
        queryDailyShortSaleBalances(defaultQueryDate, defaultQueryDate, '');
        break;
      case 'ex-dividend':
        queryRightAndDividend(defaultQueryDate, defaultQueryDate, '');
        break;
      case 'foreign-investors':
        queryForeignInvestors(defaultQueryDate, defaultQueryDate, '');
        break;
      case 'price-limit':
        queryPriceVariationLimit(defaultQueryDate, defaultQueryDate, '');
        break;
      case 'pe-ratio':
        queryPeRatioDividendYieldPbRatio(defaultQueryDate, defaultQueryDate, '');
        break;
      default:
        break;
    }
  }

  function handleSecurityCodeChange(value: string) {
    const clampedStart = clampToAllowedDate(startDate);
    const clampedEnd = clampToAllowedDate(endDate);

    if (!value) {
      setSecurityCode('');
      setStartDate(clampedEnd);
      setEndDate(clampedEnd);
      return;
    }

    setSecurityCode(value);
    if (clampedStart > clampedEnd) {
      setStartDate(clampedEnd);
      setEndDate(clampedEnd);
      return;
    }
    setStartDate(clampedStart);
    setEndDate(clampedEnd);
  }

  function handleStartDateChange(value: string) {
    if (!value) return;
    const nextStart = clampToAllowedDate(value);
    if (!securityCode) {
      setStartDate(nextStart);
      setEndDate(nextStart);
      return;
    }

    setStartDate(nextStart);
    if (endDate < nextStart) {
      setEndDate(nextStart);
    }
  }

  function handleEndDateChange(value: string) {
    if (!value) return;
    const nextEnd = clampToAllowedDate(value);
    if (!securityCode) {
      setStartDate(nextEnd);
      setEndDate(nextEnd);
      return;
    }

    setEndDate(nextEnd);
    if (nextEnd < startDate) {
      setStartDate(nextEnd);
    }
  }

  function handleOpenDownloadModal() {
    setDownloadStartDate(startDate);
    setDownloadEndDate(endDate);
    setIsDownloadModalOpen(true);
  }

  function handleDownloadModalStartDateChange(value: string) {
    if (!value) return;
    const nextStart = clampToAllowedDate(value);
    setDownloadStartDate(nextStart);
    if (downloadEndDate < nextStart) {
      setDownloadEndDate(nextStart);
    }
  }

  function handleDownloadModalEndDateChange(value: string) {
    if (!value) return;
    const nextEnd = clampToAllowedDate(value);
    setDownloadEndDate(nextEnd);
    if (nextEnd < downloadStartDate) {
      setDownloadStartDate(nextEnd);
    }
  }

  async function handleDownloadFromModal() {
    setDownloadLoading(true);
    try {
      if (activeCmTab === 'daily-quotes') {
        const downloadRows = await fetchDailyQuotes(downloadStartDate, downloadEndDate, securityCode);
        downloadCapitalMarketsCSV('daily-quotes', lang, { dailyQuotesRows: downloadRows });
      } else if (activeCmTab === 'margin') {
        const downloadRows = await fetchMarginTransaction(downloadStartDate, downloadEndDate, securityCode);
        downloadCapitalMarketsCSV('margin', lang, { marginRows: downloadRows });
      } else if (activeCmTab === 'short-sale') {
        const downloadRows = await fetchDailyShortSaleBalances(downloadStartDate, downloadEndDate, securityCode);
        downloadCapitalMarketsCSV('short-sale', lang, { shortSaleRows: downloadRows });
      } else if (activeCmTab === 'ex-dividend') {
        const downloadRows = await fetchRightAndDividend(downloadStartDate, downloadEndDate, securityCode);
        downloadCapitalMarketsCSV('ex-dividend', lang, { exRightDividendRows: downloadRows });
      } else if (activeCmTab === 'foreign-investors') {
        const downloadRows = await fetchInvestedAmtOfForeign(downloadStartDate, downloadEndDate, securityCode);
        downloadCapitalMarketsCSV('foreign-investors', lang, { foreignInvestorsRows: downloadRows });
      } else if (activeCmTab === 'price-limit') {
        const downloadRows = await fetchPriceVariationLimit(downloadStartDate, downloadEndDate, securityCode);
        downloadCapitalMarketsCSV('price-limit', lang, { priceLimitRows: downloadRows });
      } else {
        let downloadRows = dailyQuoteVisibleRows;
        if (activeCmTab === 'day-trading') {
          downloadRows = await fetchStatisticsForDayTradingRows(downloadStartDate, downloadEndDate, securityCode);
        }
        downloadCapitalMarketsCSV(activeCmTab, lang, {
          statisticsForDayTradingRows: downloadRows,
        });
      }
      setIsDownloadModalOpen(false);
    } finally {
      setDownloadLoading(false);
    }
  }

  const minStartDate = securityCode ? minAllowedDate : minAllowedDateNoCode;
  const maxStartDate = securityCode ? endDate : defaultQueryDate;
  const minEndDate = securityCode ? startDate : minAllowedDateNoCode;
  const maxEndDate = defaultQueryDate;

  const showFilterBar = true;

  return (
    <>
      <div className="de-cm-description">
        {zh
          ? '資料提供三個月內資料。畫面僅呈現重要資訊，若需完整欄位資料請直接下載檔案。若未選擇證券代碼，日期區間搜尋只限定搜尋單日'
          : 'Only the most recent three months of data are provided. While the on-screen display shows essential information only, you may download the file to access all data fields. If no Security Code is selected, the date range search will be limited to a single day.'}
      </div>
      <div className="de-cm-layout">
        <nav className="de-cm-sidebar" aria-label={zh ? 'Capital Markets 子分類' : 'Capital Markets sub categories'}>
          <div className="de-cm-sidebar-title">{zh ? '子分類' : 'Sub Category'}</div>
          {CM_INNER_TABS.map((tab) => (
            <button
              key={tab.id}
              className={`de-cm-sidebar-item${activeCmTab === tab.id ? ' active' : ''}`}
              style={activeCmTab === tab.id ? { borderLeftColor: accentColor, color: accentColor } : {}}
              onClick={() => onChangeCmTab(tab.id as (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number])}
            >
              <span className="de-cm-sidebar-item-name">{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="de-cm-content">
          <div className="de-cm-content-toolbar">
          <div className="de-cm-content-toolbar-left">
            {showFilterBar && (
              <CmFilterBar
                lang={lang}
                securityCode={securityCode}
                securityCodes={securityCodes}
                startDate={startDate}
                endDate={endDate}
                minStartDate={minStartDate}
                maxStartDate={maxStartDate}
                minEndDate={minEndDate}
                maxEndDate={maxEndDate}
                onSecurityCodeChange={handleSecurityCodeChange}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onSearch={handleSearch}
                onClear={handleClear}
              />
            )}
          </div>
          <div className="de-cm-content-toolbar-right">
            {(activeCmTab === 'daily-quotes' ||activeCmTab === 'margin' || activeCmTab === 'short-sale' || activeCmTab === 'ex-dividend' || activeCmTab === 'foreign-investors' || activeCmTab === 'price-limit') && (
              <button
                type="button"
                className="de-news-download-btn de-gov-csv-btn de-dq-field-overview-btn"
                onClick={() => {
                  if (activeCmTab === 'daily-quotes') {
                    setFieldOverviewColumns(CM_QUOTES_ALL_COLUMNS);
                  } else if (activeCmTab === 'short-sale') {
                    setFieldOverviewColumns(CM_DAILY_SHORT_SALE_ALL_COLUMNS);
                  } else if (activeCmTab === 'ex-dividend') {
                    setFieldOverviewColumns(CM_EX_RIGHT_DIVIDEND_ALL_COLUMNS);
                  } else if (activeCmTab === 'foreign-investors') {
                    setFieldOverviewColumns(CM_FOREIGN_INVESTORS_ALL_COLUMNS);
                  } else if (activeCmTab === 'price-limit') {
                    setFieldOverviewColumns(CM_PRICE_LIMIT_ALL_COLUMNS);
                  } else {
                    setFieldOverviewColumns(CM_MARGIN_ALL_COLUMNS);
                  }
                  setIsFieldOverviewOpen(true);
                }}
                title={zh ? '欄位總覽' : 'Field Overview'}
              >
                <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M7 6v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="7" cy="4" r="0.8" fill="currentColor"/>
                </svg>
                <span>{zh ? '欄位總覽' : 'Field Overview'}</span>
              </button>
            )}
            <button className="de-news-download-btn de-gov-csv-btn" onClick={handleOpenDownloadModal}>
              <DownloadIcon />
              <span>{zh ? '下載 CSV' : 'Download CSV'}</span>
            </button>
          </div>
        </div>
        {activeCmTab === 'daily-quotes'      && (
          <DailyQuotesTab
            lang={lang}
            rowsData={getDailyQuotesRows}
            loading={getDailyQuotesLoading}
            error={getDailyQuotesError}
            onVisibleRowsChange={setGetDailyQuotesVisibleRows}
          />
        )}
        {activeCmTab === 'day-trading'       && (
          <CmDailyQuotesTab
            lang={lang}
            rowsData={dailyQuoteRows}
            loading={dailyQuotesLoading}
            error={dailyQuotesError}
            onVisibleRowsChange={setDailyQuoteVisibleRows}
          />
        )}
        {activeCmTab === 'margin'            && <CmMarginTab lang={lang} rowsData={marginRows} loading={marginLoading} error={marginError} />}
        {activeCmTab === 'short-sale'        && <CmShortSaleBalancesTab lang={lang} rowsData={shortSaleRows} loading={shortSaleLoading} error={shortSaleError} />}
        {activeCmTab === 'ex-dividend'       && <CmExDividendTab lang={lang} rowsData={exDividendRows} loading={exDividendLoading} error={exDividendError} />}
        {activeCmTab === 'foreign-investors' && <CmForeignTab lang={lang} rowsData={foreignRows} loading={foreignLoading} error={foreignError} />}
        {activeCmTab === 'price-limit'       && <CmPriceLimitTab lang={lang} rowsData={priceLimitRows} loading={priceLimitLoading} error={priceLimitError} />}
        {activeCmTab === 'pe-ratio'          && <CmPeRatioTab lang={lang} rowsData={peRatioRows} loading={peRatioLoading} error={peRatioError} />}
        <CmDownloadCsvModal
          lang={lang}
          isOpen={isDownloadModalOpen}
          startDate={downloadStartDate}
          endDate={downloadEndDate}
          minDate={minAllowedDate}
          maxDate={defaultQueryDate}
          downloading={downloadLoading}
          onStartDateChange={handleDownloadModalStartDateChange}
          onEndDateChange={handleDownloadModalEndDateChange}
          onClose={() => setIsDownloadModalOpen(false)}
          onDownload={handleDownloadFromModal}
        />
        <CmFieldOverviewModal
          lang={lang}
          isOpen={isFieldOverviewOpen}
          columns={fieldOverviewColumns}
          onClose={() => setIsFieldOverviewOpen(false)}
        />
        </div>
      </div>
    </>
  );
}

// ── Government Regulations — new tab data ───────────────────────────────────

interface GovDisqualifiedRow {
  ban: string;
  transgress_control_id: string;
  fac_city_code: string;
  county_name: string;
  ems_no: string;
  fac_name: string;
  document_no: string;
  transgress_date: string;
  transgress_type: string;
  transgress_name: string;
  update_date: string;
}

interface GovRegulatoryRow {
  Corporation_Number: number;
  Case_no: string;
  Corporation_Name: string;
  Announce_Agency_No: string;
  Announce_Agency_Name: string;
  Case_Name: string;
  Expire_Date: string;
  update_date: string;
}

interface GovLaborRow {
  name: string;
  id: string;
  date: string;
  law: string;
  fine: string;
  detail: string;
}

const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '/lego';
const GOV_ERROR_TEXT_MAX_LENGTH = 200;

function buildFallbackDailyQuotesRows(date: string): CmDailyQuoteRow[] {
  return CM_DAILY_QUOTES_FALLBACK_TEMPLATE.map((item) => ({
    trading_date: date,
    security_code: item.security_code,
    suspension_of_buy_after_sale_day_trading: item.suspension_of_buy_after_sale_day_trading,
    volume: item.volume,
    day_trading_value_of_buys: item.day_trading_value_of_buys,
    day_trading_value_of_sells: item.trading_value_of_sells,
  }));
}

function filterRowsBySecurityCode<T extends { code?: string; security_code?: string }>(rows: T[], securityCode: string): T[] {
  if (!securityCode) return rows;
  return rows.filter((row) => (row.security_code ?? row.code ?? '') === securityCode);
}

function buildFallbackMarginRows(date: string): CmMarginTransactionRow[] {
  return CM_MARGIN_MOCK_DATA.map((row) => ({ ...row, data_gen_dt: date.replace(/-/g, '') }));
}

async function fetchCapitalMarketRows<T>(
  endpoint: string,
  startDate: string,
  endDate: string,
  securityCode: string,
  fallbackRows: T[],
): Promise<T[]> {
  try {
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);
    url.searchParams.set('securityCode', securityCode?.trim() ?? '');
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return fallbackRows;
    }
    const data = (await res.json()) as T[] | { items?: T[]; data?: T[]; rows?: T[] };
    if (Array.isArray(data)) {
      return data;
    }
    return data.items ?? data.data ?? data.rows ?? fallbackRows;
  } catch {
    return fallbackRows;
  }
}

async function fetchSecurityCodeOptions(): Promise<string[]> {
  try {
    const url = new URL('/getSecurityCd', window.location.origin);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return CM_COMPANIES.map((company) => company.code);
    }
    const data = (await res.json()) as
      | string[]
      | { items?: string[]; data?: string[]; list?: string[]; securityCodes?: string[] }
      | Array<{ security_code?: string; securityCode?: string; code?: string }>;

    if (Array.isArray(data) && data.length > 0) {
      if (typeof data[0] === 'string') {
        return [...new Set((data as string[]).filter((item) => item.trim() !== ''))];
      }
      const mapped = (data as Array<{ security_code?: string; securityCode?: string; code?: string }>)
        .map((item) => item.security_code ?? item.securityCode ?? item.code ?? '')
        .filter((item) => item.trim() !== '');
      return [...new Set(mapped)];
    }

    if (!Array.isArray(data)) {
      const list = data.items ?? data.data ?? data.list ?? data.securityCodes ?? [];
      return [...new Set(list.filter((item) => item.trim() !== ''))];
    }

    return CM_COMPANIES.map((company) => company.code);
  } catch {
    return CM_COMPANIES.map((company) => company.code);
  }
}

async function fetchStatisticsForDayTradingRows(startDate: string, endDate: string, securityCode: string): Promise<CmDailyQuoteRow[]> {
  try {
    const url = new URL('/getStatisticsForDayTrading', window.location.origin);
    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);
    url.searchParams.set('securityCode', securityCode?.trim() ?? '');
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return buildFallbackDailyQuotesRows(endDate);
    }
    const data = (await res.json()) as
      | CmDailyQuoteRow[]
      | { items?: CmDailyQuoteRow[]; data?: CmDailyQuoteRow[]; rows?: CmDailyQuoteRow[] };
    if (Array.isArray(data)) {
      return data;
    }
    return data.items ?? data.data ?? data.rows ?? buildFallbackDailyQuotesRows(endDate);
  } catch {
    return buildFallbackDailyQuotesRows(endDate);
  }
}

async function fetchDailyQuotes(startDate: string, endDate: string, securityCode: string): Promise<DailyQuoteRow[]> {
  try {
    const url = new URL('/getDailyQuotes', window.location.origin);
    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);
    url.searchParams.set('securityCode', securityCode?.trim() ?? '');
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return buildFallbackGetDailyQuotesRows(endDate);
    }
    const data = (await res.json()) as
      | DailyQuoteRow[]
      | { items?: DailyQuoteRow[]; data?: DailyQuoteRow[]; rows?: DailyQuoteRow[] };
    if (Array.isArray(data)) {
      return data;
    }
    return data.items ?? data.data ?? data.rows ?? buildFallbackGetDailyQuotesRows(endDate);
  } catch {
    return buildFallbackGetDailyQuotesRows(endDate);
  }
}

async function fetchMarginTransaction(startDate: string, endDate: string, securityCode: string): Promise<CmMarginTransactionRow[]> {
  const fallbackRows = filterRowsBySecurityCode(buildFallbackMarginRows(endDate), securityCode);
  return fetchCapitalMarketRows<CmMarginTransactionRow>('/getMarginTransaction', startDate, endDate, securityCode, fallbackRows);
}

async function fetchDailyShortSaleBalances(startDate: string, endDate: string, securityCode: string): Promise<CmDailyShortSaleBalanceRow[]> {
  const fallbackRows = filterRowsBySecurityCode(CM_DAILY_SHORT_SALE_MOCK_DATA.map((row) => ({ ...row, data_gen_dt: endDate.replace(/-/g, '') })), securityCode);
  return fetchCapitalMarketRows<CmDailyShortSaleBalanceRow>('/getDailyShortSaleBalances', startDate, endDate, securityCode, fallbackRows);
}

async function fetchRightAndDividend(startDate: string, endDate: string, securityCode: string): Promise<CmExRightDividendRow[]> {
  const fallbackRows = filterRowsBySecurityCode(
    CM_EX_RIGHT_DIVIDEND_MOCK_DATA,
    securityCode,
  );
  return fetchCapitalMarketRows<CmExRightDividendRow>('/getRightAndDividend', startDate, endDate, securityCode, fallbackRows);
}

async function fetchInvestedAmtOfForeign(startDate: string, endDate: string, securityCode: string): Promise<CmForeignInvestorsRow[]> {
  const fallbackRows = filterRowsBySecurityCode(CM_FOREIGN_INVESTORS_MOCK_DATA, securityCode);
  return fetchCapitalMarketRows<CmForeignInvestorsRow>('/getInvestedAmtofForeign', startDate, endDate, securityCode, fallbackRows);
}

async function fetchPriceVariationLimit(startDate: string, endDate: string, securityCode: string): Promise<CmPriceVariationLimitRow[]> {
  const fallbackRows = filterRowsBySecurityCode(
    CM_PRICE_LIMIT_MOCK_DATA.map((row) => ({ ...row, data_gen_dt: endDate.replace(/-/g, '') })),
    securityCode,
  );
  return fetchCapitalMarketRows<CmPriceVariationLimitRow>('/getPriceVariationLimit', startDate, endDate, securityCode, fallbackRows);
}

async function fetchPeRatioDividendYieldPbRatio(startDate: string, endDate: string, securityCode: string): Promise<Array<(typeof CM_PE_RATIO)[number]>> {
  const fallbackRows = filterRowsBySecurityCode(CM_PE_RATIO, securityCode);
  return fetchCapitalMarketRows<(typeof CM_PE_RATIO)[number]>('/getPeRatioDividendYieldPbRatio', startDate, endDate, securityCode, fallbackRows);
}

async function fetchGovRows<T>(endpoint: string): Promise<T[]> {
  const res = await fetch(`${APP_BASE_PATH}/api/${endpoint}`);
  if (!res.ok) {
    const rawErrorText = await res.text().catch(() => '');
    const errorText = rawErrorText.length > GOV_ERROR_TEXT_MAX_LENGTH
      ? `${rawErrorText.slice(0, GOV_ERROR_TEXT_MAX_LENGTH)}...`
      : rawErrorText;
    throw new Error(`Failed to fetch ${endpoint} (${res.status} ${res.statusText})${errorText ? `: ${errorText}` : ''}`);
  }
  const data = (await res.json()) as { items: T[] };
  return data.items;
}

function useGovApiRows<T>(endpoint: string) {
  const [sourceRows, setSourceRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchGovRows<T>(endpoint)
      .then((items) => {
        if (!cancelled) setSourceRows(items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          console.error('Government regulations API request failed:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { sourceRows, loading, error };
}

function useRegulatoryApiRows() {
  const [sourceRows, setSourceRows] = useState<GovRegulatoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${APP_BASE_PATH}/api/getRegulatoryOnPollutionSources`)
      .then(async (res) => {
        if (!res.ok) {
          const rawText = await res.text().catch(() => '');
          const errText = rawText.length > GOV_ERROR_TEXT_MAX_LENGTH
            ? `${rawText.slice(0, GOV_ERROR_TEXT_MAX_LENGTH)}...`
            : rawText;
          throw new Error(`Failed to fetch getRegulatoryOnPollutionSources (${res.status} ${res.statusText})${errText ? `: ${errText}` : ''}`);
        }
        const data = (await res.json()) as { Rvlmd_List: { Rvlmd: GovRegulatoryRow[] } };
        return data.Rvlmd_List.Rvlmd;
      })
      .then((items) => {
        if (!cancelled) setSourceRows(items);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          console.error('Government regulations API request failed:', err);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { sourceRows, loading, error };
}

// ── Government Regulations new tab components ────────────────────────────────

function GovDisqualifiedTab({ lang, accentColor }: { lang: 'zh' | 'en'; accentColor: string }) {
  const zh = lang === 'zh';
  const { sourceRows, loading, error } = useGovApiRows<GovDisqualifiedRow>('getDisqualifiedVendors');

  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    sourceRows,
    [
      (r) => r.ban,
      (r) => r.transgress_control_id,
      (r) => r.fac_city_code,
      (r) => r.county_name,
      (r) => r.ems_no,
      (r) => r.fac_name,
      (r) => r.document_no,
      (r) => r.transgress_date,
      (r) => r.transgress_type,
      (r) => r.transgress_name,
      (r) => r.update_date,
    ],
  );

  if (loading) return <div className="de-esg-loading">{zh ? '載入中…' : 'Loading…'}</div>;
  if (error) return <div className="de-esg-empty">{zh ? '載入失敗，請稍後再試。' : 'Failed to load. Please try again later.'}</div>;

  function handleDownloadCSV() {
    const headers = zh
      ? ['統一編號', '違規人管制編號', '公司（工廠）地址縣市別代碼', '裁處機關', '管制事業編號', '事業名稱', '裁處書字號', '違反時間', '污染類別', '違規人名稱', '全球科技更新此筆紀錄的時間']
      : ['UBN', 'Transgress Control ID', 'Fac. City Code', 'County Name', 'EMS No', 'Fac. Name', 'Document No', 'Transgress Date', 'Transgress Type', 'Transgress Name', 'Update Date'];
    downloadCSV(
      zh ? '拒絕往來廠商公告.csv' : 'disqualified-vendors.csv',
      headers,
      sourceRows.map((r) => [
        r.ban,
        r.transgress_control_id,
        r.fac_city_code,
        r.county_name,
        r.ems_no,
        r.fac_name,
        r.document_no,
        r.transgress_date,
        r.transgress_type,
        r.transgress_name,
        r.update_date,
      ]),
    );
  }

  return (
    <div className="de-data-section">
      <div className="de-data-section-header">
        <span className="de-data-section-title" style={{ color: accentColor }}>
          {zh ? '拒絕往來廠商公告' : 'Disqualified Vendors'}
        </span>
        <GovInfoWrap />
        <button className="de-news-download-btn de-gov-csv-btn" onClick={handleDownloadCSV}>
          <DownloadIcon />
          <span>{zh ? '下載 CSV' : 'Download CSV'}</span>
        </button>
      </div>
      <div className="de-data-table-wrap">
        <table className="de-data-table">
          <thead>
            <tr>
              <ThSortFilter label={zh ? '統一編號' : 'UBN'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
              <ThSortFilter label={zh ? '違規人管制編號' : 'Transgress Control ID'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
              <ThSortFilter label={zh ? '公司（工廠）地址縣市別代碼' : 'Fac. City Code'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} />
              <ThSortFilter label={zh ? '裁處機關' : 'County Name'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} />
              <ThSortFilter label={zh ? '管制事業編號' : 'EMS No'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} />
              <ThSortFilter label={zh ? '事業名稱' : 'Fac. Name'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} />
              <ThSortFilter label={zh ? '裁處書字號' : 'Document No'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[6] ?? ''} />
              <ThSortFilter label={zh ? '違反時間' : 'Transgress Date'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[7] ?? ''} />
              <ThSortFilter label={zh ? '污染類別' : 'Transgress Type'} colIndex={8} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[8] ?? ''} />
              <ThSortFilter label={zh ? '違規人名稱' : 'Transgress Name'} colIndex={9} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[9] ?? ''} />
              <ThSortFilter label={zh ? '全球科技更新此筆紀錄的時間' : 'Update Date'} colIndex={10} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[10] ?? ''} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.ban}>
                <td className="code">{r.ban}</td>
                <td className="code">{r.transgress_control_id}</td>
                <td className="muted">{r.fac_city_code}</td>
                <td>{r.county_name}</td>
                <td className="code">{r.ems_no}</td>
                <td>{r.fac_name}</td>
                <td className="muted">{r.document_no}</td>
                <td className="muted">{r.transgress_date}</td>
                <td>{r.transgress_type}</td>
                <td>{r.transgress_name}</td>
                <td className="muted">{r.update_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GovPollutionTab({ lang, accentColor }: { lang: 'zh' | 'en'; accentColor: string }) {
  const zh = lang === 'zh';
  const { sourceRows, loading, error } = useRegulatoryApiRows();

  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    sourceRows,
    [
      (r) => String(r.Corporation_Number),
      (r) => r.Case_no,
      (r) => r.Corporation_Name,
      (r) => r.Announce_Agency_No,
      (r) => r.Announce_Agency_Name,
      (r) => r.Case_Name,
      (r) => r.Expire_Date,
      (r) => r.update_date,
    ],
  );

  if (loading) return <div className="de-esg-loading">{zh ? '載入中…' : 'Loading…'}</div>;
  if (error) return <div className="de-esg-empty">{zh ? '載入失敗，請稍後再試。' : 'Failed to load. Please try again later.'}</div>;

  function handleDownloadCSV() {
    const headers = zh
      ? ['廠商代碼', '標案案號', '廠商名稱', '刊登機關代碼', '刊登機關名稱', '標案名稱', '拒絕往來截止日', '全球科技此筆更新的時間']
      : ['Corporation Number', 'Case No', 'Corporation Name', 'Announce Agency No', 'Announce Agency Name', 'Case Name', 'Expire Date', 'Update Date'];
    downloadCSV(
      zh ? '列管事業污染源裁處資料.csv' : 'regulatory-on-pollution-sources.csv',
      headers,
      sourceRows.map((r) => [
        String(r.Corporation_Number),
        r.Case_no,
        r.Corporation_Name,
        r.Announce_Agency_No,
        r.Announce_Agency_Name,
        r.Case_Name,
        r.Expire_Date,
        r.update_date,
      ]),
    );
  }

  return (
    <div className="de-data-section">
      <div className="de-data-section-header">
        <span className="de-data-section-title" style={{ color: accentColor }}>
          {zh ? '列管事業污染源裁處資料' : 'Regulatory on pollution sources'}
        </span>
        <GovInfoWrap />
        <button className="de-news-download-btn de-gov-csv-btn" onClick={handleDownloadCSV}>
          <DownloadIcon />
          <span>{zh ? '下載 CSV' : 'Download CSV'}</span>
        </button>
      </div>
      <div className="de-data-table-wrap">
        <table className="de-data-table">
          <thead>
            <tr>
              <ThSortFilter label={zh ? '廠商代碼' : 'Corporation Number'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
              <ThSortFilter label={zh ? '標案案號' : 'Case No'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
              <ThSortFilter label={zh ? '廠商名稱' : 'Corporation Name'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} />
              <ThSortFilter label={zh ? '刊登機關代碼' : 'Announce Agency No'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} />
              <ThSortFilter label={zh ? '刊登機關名稱' : 'Announce Agency Name'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} />
              <ThSortFilter label={zh ? '標案名稱' : 'Case Name'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} />
              <ThSortFilter label={zh ? '拒絕往來截止日' : 'Expire Date'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[6] ?? ''} />
              <ThSortFilter label={zh ? '全球科技此筆更新的時間' : 'Update Date'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[7] ?? ''} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.Corporation_Number}-${r.Case_no}`}>
                <td className="code">{r.Corporation_Number}</td>
                <td className="code">{r.Case_no}</td>
                <td>{r.Corporation_Name}</td>
                <td className="muted">{r.Announce_Agency_No}</td>
                <td>{r.Announce_Agency_Name}</td>
                <td>{r.Case_Name}</td>
                <td className="muted">{r.Expire_Date}</td>
                <td className="muted">{r.update_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GovLaborTab({ lang, accentColor }: { lang: 'zh' | 'en'; accentColor: string }) {
  const zh = lang === 'zh';
  const { sourceRows, loading, error } = useGovApiRows<GovLaborRow>('getLaborViolations');

  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    sourceRows,
    [(r) => r.name, (r) => r.id, (r) => r.date, (r) => r.law, (r) => r.fine, (r) => r.detail],
  );

  if (loading) return <div className="de-esg-loading">{zh ? '載入中…' : 'Loading…'}</div>;
  if (error) return <div className="de-esg-empty">{zh ? '載入失敗，請稍後再試。' : 'Failed to load. Please try again later.'}</div>;

  function handleDownloadCSV() {
    const headers = zh
      ? ['事業單位名稱', '統一編號', '違法日期', '違反法規', '裁罰金額(元)', '處分情形']
      : ['Company Name', 'Tax ID', 'Violation Date', 'Regulation Violated', 'Fine (NT$)', 'Details'];
    downloadCSV(
      zh ? '違反勞動法令事業單位.csv' : 'labor-violations.csv',
      headers,
      sourceRows.map((r) => [r.name, r.id, r.date, r.law, r.fine, r.detail]),
    );
  }

  return (
    <div className="de-data-section">
      <div className="de-data-section-header">
        <span className="de-data-section-title" style={{ color: accentColor }}>
          {zh ? '違反勞動法令事業單位' : 'Violations of Labor Laws'}
        </span>
        <GovInfoWrap />
        <button className="de-news-download-btn de-gov-csv-btn" onClick={handleDownloadCSV}>
          <DownloadIcon />
          <span>{zh ? '下載 CSV' : 'Download CSV'}</span>
        </button>
      </div>
      <div className="de-data-table-wrap">
        <table className="de-data-table">
          <thead>
            <tr>
              <ThSortFilter label={zh ? '事業單位名稱' : 'Company Name'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
              <ThSortFilter label={zh ? '統一編號' : 'Tax ID'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
              <ThSortFilter label={zh ? '違法日期' : 'Violation Date'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} />
              <ThSortFilter label={zh ? '違反法規' : 'Regulation Violated'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} />
              <ThSortFilter label={zh ? '裁罰金額(元)' : 'Fine (NT$)'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
              <ThSortFilter label={zh ? '處分情形' : 'Details'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} />
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

function GovPenaltyRecordsTab({ lang, accentColor }: { lang: 'zh' | 'en'; accentColor: string }) {
  const zh = lang === 'zh';
  const [activeGovTab, setActiveGovTab] = useState('disqualified-vendors');

  const innerTabs = [
    { id: 'disqualified-vendors', label: zh ? '拒絕往來廠商公告' : 'Disqualified Vendors' },
    { id: 'pollution-sources', label: zh ? '列管事業污染源裁處資料' : 'Regulatory on pollution sources' },
    { id: 'labor-violations', label: zh ? '違反勞動法令事業單位' : 'Violations of Labor Laws' },
  ];

  return (
    <div className="de-gov-penalty-layout">
      <nav className="de-gov-penalty-sidebar" aria-label={zh ? '政府處分資料子分類' : 'Government penalty sub categories'}>
        <div className="de-gov-penalty-sidebar-title">{zh ? '子分類' : 'Sub Category'}</div>
        {innerTabs.map((tab) => (
          <button
            key={tab.id}
            className={`de-gov-penalty-sidebar-item${activeGovTab === tab.id ? ' active' : ''}`}
            style={activeGovTab === tab.id ? { borderLeftColor: accentColor, color: accentColor } : {}}
            onClick={() => setActiveGovTab(tab.id)}
          >
            <span className="de-gov-penalty-sidebar-item-name">{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="de-gov-penalty-content">
        {activeGovTab === 'disqualified-vendors' && <GovDisqualifiedTab lang={lang} accentColor={accentColor} />}
        {activeGovTab === 'pollution-sources' && <GovPollutionTab lang={lang} accentColor={accentColor} />}
        {activeGovTab === 'labor-violations' && <GovLaborTab lang={lang} accentColor={accentColor} />}
      </div>
    </div>
  );
}

// ── News Summary tab components ───────────────────────────────────────────────

const NEWS_ACCENT = '#0ea5e9';

// Tag sets for each digest category (used by legacy tabs)
const TAIWAN_TAGS = new Set(['GlobalTech', 'Taiwan', 'Japan', 'JASM', 'Arizona', 'Fab 21', '12nm', '2nm', 'GT', 'CoWoS', 'Production', 'Supply Chain']);
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

// ── Bullet-list news format parser ────────────────────────────────────────────

interface TaxNewsListItem {
  date: string;
  title: string;
  summary: string;
  url: string;
}

function isTaxNewsBulletFormat(markdown: string): boolean {
  return markdown.trimStart().startsWith('#') && /- \*\*新聞日期[：:]/.test(markdown);
}

function parseTaxNewsBulletList(markdown: string): TaxNewsListItem[] {
  const items: TaxNewsListItem[] = [];
  // Remove the h1 header line
  const content = markdown.replace(/^#[^\n]*\n/, '').trim();
  // Split on list item markers
  const blocks = content.split(/\n?- \*\*新聞日期[：:]\*\*/);

  for (const block of blocks) {
    if (!block.trim()) continue;
    const item: TaxNewsListItem = { date: '', title: '', summary: '', url: '' };

    // Date is the first part before <br>
    const dateMatch = block.match(/^\s*([^<\n]+)/);
    if (dateMatch) item.date = dateMatch[1].trim();

    // Title
    const titleMatch = block.match(/\*\*新聞標題[：:]\*\*\s*([^<\n]+)/);
    if (titleMatch) item.title = titleMatch[1].trim();

    // Summary
    const summaryMatch = block.match(/\*\*新聞重點摘要[：:]\*\*\s*([^<\n]+)/);
    if (summaryMatch) item.summary = summaryMatch[1].trim();

    // URL
    const urlMatch = block.match(/\*\*新聞網址:?\*\*\s*(\S+)/);
    if (urlMatch) item.url = urlMatch[1].trim();

    if (item.title || item.date) {
      items.push(item);
    }
  }

  return items;
}

// ── Bullet-list news item card ────────────────────────────────────────────────

function TaxNewsItemCard({ item }: { item: TaxNewsListItem; accentColor: string }) {
  const hasUrl = item.url && item.url !== '#';
  return (
    <article className="de-esg-news-card">
      <div className="de-esg-news-card-header">
        {item.date && <span className="de-esg-news-card-date">{item.date}</span>}
      </div>
      <div className="de-esg-news-card-title">
        {hasUrl ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.title}
            <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: 3 }}>
              <ExternalLinkIcon />
            </span>
          </a>
        ) : (
          item.title
        )}
      </div>
      {item.summary && (
        <p className="de-esg-news-card-summary">{item.summary}</p>
      )}
    </article>
  );
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

// ── Download markdown as PDF (via browser print) ─────────────────────────────

function downloadMarkdownAsPdf(title: string, markdownContent: string): void {
  const TOPIC_SEP_RE = /={50,}[\s\S]*?NEXT\s+Topic[\s\S]*?={50,}/g;

  // Detect bullet-list tax news format: starts with # heading and has **新聞日期
  function isBulletListFormat(md: string): boolean {
    return md.trimStart().startsWith('#') && /- \*\*新聞日期[：:]/.test(md);
  }

  // Convert bullet-list tax news format to HTML
  function processBulletList(md: string): string {
    const content = md.replace(/^#[^\n]*\n/, '').trim();
    const blocks = content.split(/\n?- \*\*新聞日期[：:]\*\*/);
    const parts: string[] = [];
    for (const block of blocks) {
      if (!block.trim()) continue;
      const dateMatch = block.match(/^\s*([^<\n]+)/);
      const titleMatch = block.match(/\*\*新聞標題[：:]\*\*\s*([^<\n]+)/);
      const summaryMatch = block.match(/\*\*新聞重點摘要[：:]\*\*\s*([\s\S]*?)(?=\n\*\*新聞網址|$)/);
      const urlMatch = block.match(/\*\*新聞網址:?\*\*\s*(\S+)/);
      const date = dateMatch ? dateMatch[1].trim() : '';
      const itemTitle = titleMatch ? titleMatch[1].trim() : '';
      const summary = summaryMatch ? summaryMatch[1].replace(/<br\s*\/?>/gi, ' ').trim() : '';
      const url = urlMatch ? urlMatch[1].trim() : '';
      if (!itemTitle && !date) continue;
      const titleHtml = url && url !== '#'
        ? `<a href="${url}" style="color:#0ea5e9;text-decoration:none;">${itemTitle}</a>`
        : itemTitle;
      parts.push(
        `<div class="article">` +
        `<div class="article-meta">${date}</div>` +
        `<div class="article-title">${titleHtml}</div>` +
        (summary ? `<div class="article-summary">${summary}</div>` : '') +
        `</div>`
      );
    }
    return parts.join('\n');
  }

  // Convert markdown table rows to simple text lines
  function processTable(block: string): string {
    const lines = block.split('\n');
    const dataLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('|')) continue;
      if (/^\|[|\- ]+\|$/.test(trimmed)) continue; // separator row
      const cells = trimmed.split('|').map((c) => c.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
      if (cells.length === 0) continue;
      dataLines.push(`<div class="article">` +
        `<div class="article-title">${cells[0] ?? ''}</div>` +
        `<div class="article-meta">${[cells[2], cells[3]].filter(Boolean).join(' · ')}</div>` +
        `<div class="article-summary">${cells[4] ?? ''}</div>` +
        `</div>`);
    }
    return dataLines.join('\n');
  }

  let bodyHtml = '';

  if (isBulletListFormat(markdownContent)) {
    bodyHtml = processBulletList(markdownContent);
  } else {
    const chunks = markdownContent.split(TOPIC_SEP_RE);
    for (const chunk of chunks) {
      const lines = chunk.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      const headingLine = lines.find((l) => l.startsWith('##') && !l.includes('NEXT Topic'));
      if (!headingLine) continue;
      const topic = headingLine.replace(/^#+\s*/, '').trim();
      bodyHtml += `<h2>${topic}</h2>\n${processTable(chunk)}\n`;
    }
  }

  const html = `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8">
<title>${title}</title>
<style>
  body { font-family: 'Noto Sans TC', 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111827; margin: 32px 40px; }
  h1 { font-size: 18px; color: #0ea5e9; margin-bottom: 4px; }
  h2 { font-size: 14px; color: #1a2332; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; margin-top: 20px; }
  .article { margin: 10px 0; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 6px; page-break-inside: avoid; }
  .article-title { font-weight: 600; margin-bottom: 4px; }
  .article-meta { font-size: 11px; color: #6b7280; margin-bottom: 6px; }
  .article-summary { color: #374151; line-height: 1.6; }
  @media print { body { margin: 16px 24px; } }
</style></head><body>
<h1>${title}</h1>
${bodyHtml}
</body></html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}

// ── Shared news digest tab (queryCatgDetail pattern) ─────────────────────────

interface NewsDigestSummaryTabProps {
  catgType: CatgDetailType;
  tabTitle: string;
  tabSubtitle: string;
  itemNamePrefix: string;
  accentColor: string;
  lang: 'zh' | 'en';
}

function NewsDigestSummaryTab({
  catgType,
  tabTitle,
  tabSubtitle,
  itemNamePrefix,
  accentColor,
  lang,
}: NewsDigestSummaryTabProps) {
  const zh = lang === 'zh';

  const [periods, setPeriods] = useState<NewsSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeriodId, setActivePeriodId] = useState<string>('');
  const [activeItemName, setActiveItemName] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [sections, setSections] = useState<EsgTopicSection[]>([]);
  const [taxNewsItems, setTaxNewsItems] = useState<TaxNewsListItem[]>([]);
  const [isBulletFormat, setIsBulletFormat] = useState(false);
  const [rawMarkdown, setRawMarkdown] = useState<string>('');

  useEffect(() => {
    queryCatgDetail(catgType).then((data) => {
      const items = data.result.items;
      setPeriods(items);
      if (items.length > 0) {
        setActivePeriodId(items[0].data_item_id);
        setActiveItemName(items[0].item_name);
      }
      setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catgType]);

  useEffect(() => {
    if (!activePeriodId) return;
    setContentLoading(true);
    setSections([]);
    setTaxNewsItems([]);
    setIsBulletFormat(false);
    setRawMarkdown('');
    queryDataItemContent(activePeriodId).then((markdown) => {
      if (markdown) {
        if (isTaxNewsBulletFormat(markdown)) {
          setIsBulletFormat(true);
          setTaxNewsItems(parseTaxNewsBulletList(markdown));
        } else {
          setSections(parseEsgMarkdown(markdown));
        }
        setRawMarkdown(markdown);
      }
      setContentLoading(false);
    });
  }, [activePeriodId]);

  function stripItemPrefix(itemName: string): string {
    if (itemName.startsWith(itemNamePrefix)) {
      return itemName.slice(itemNamePrefix.length);
    }
    return itemName;
  }

  function handleDownload() {
    const periodLabel = stripItemPrefix(activeItemName) || activeItemName;
    downloadMarkdownAsPdf(`${tabTitle} ${periodLabel}`, rawMarkdown);
  }

  const hasContent = isBulletFormat ? taxNewsItems.length > 0 : sections.length > 0;

  return (
    <div className="de-tax-news-wrap">
      <div className="de-tax-news-header">
        <div className="de-tax-news-title" style={{ color: accentColor }}>{tabTitle}</div>
        <div className="de-tax-news-sub">{tabSubtitle}</div>
      </div>

      {loading ? (
        <div className="de-esg-loading">Loading periods…</div>
      ) : (
        <div className="de-intl-tax-layout">
          <nav className="de-intl-tax-sidebar" aria-label="Period list">
            <div className="de-intl-tax-sidebar-title">{zh ? '期間' : 'Period'}</div>
            {periods.length === 0 && (
              <div className="de-intl-tax-sidebar-item" style={{ opacity: 0.5 }}>—</div>
            )}
            {periods.map((item) => (
              <button
                key={item.data_item_id}
                className={`de-intl-tax-sidebar-item${activePeriodId === item.data_item_id ? ' active' : ''}`}
                style={activePeriodId === item.data_item_id ? { borderLeftColor: accentColor, color: accentColor } : {}}
                onClick={() => {
                  setActivePeriodId(item.data_item_id);
                  setActiveItemName(item.item_name);
                }}
              >
                <span className="de-intl-tax-sidebar-item-name">{stripItemPrefix(item.item_name)}</span>
              </button>
            ))}
          </nav>

          <div className="de-intl-tax-content">
            {contentLoading ? (
              <div className="de-esg-loading">Loading content…</div>
            ) : !hasContent ? (
              <div className="de-esg-empty">{zh ? '暫無相關新聞' : 'No articles found.'}</div>
            ) : (
              <>
                <div className="de-news-download-bar">
                  <button
                    className="de-news-download-btn"
                    onClick={handleDownload}
                    title={zh ? '下載 PDF' : 'Download PDF'}
                  >
                    <DownloadIcon />
                    <span>{zh ? '下載 PDF' : 'Download PDF'}</span>
                  </button>
                </div>
                {isBulletFormat ? (
                  <div className="de-esg-topic-body">
                    {taxNewsItems.map((item, i) => (
                      <TaxNewsItemCard key={i} item={item} accentColor={accentColor} />
                    ))}
                  </div>
                ) : (
                  <div className="de-esg-topics-wrap">
                    {sections.map((section, i) => (
                      <EsgTopicSectionCard key={section.topic} section={section} defaultOpen={i === 0} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
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
  const [activeItemName, setActiveItemName] = useState<string>('');
  const [contentLoading, setContentLoading] = useState(false);
  const [sections, setSections] = useState<EsgTopicSection[]>([]);
  const [rawMarkdown, setRawMarkdown] = useState<string>('');

  // Load period list on mount
  useEffect(() => {
    queryCatgDetail('esg').then((data) => {
      const items = data.result.items;
      setPeriods(items);
      if (items.length > 0) {
        setActivePeriodId(items[0].data_item_id);
        setActiveItemName(items[0].item_name);
      }
      setLoading(false);
    });
  }, []);

  // Load content when active period changes
  useEffect(() => {
    if (!activePeriodId) return;
    setContentLoading(true);
    setSections([]);
    setRawMarkdown('');
    queryDataItemContent(activePeriodId).then((markdown) => {
      if (markdown) {
        setSections(parseEsgMarkdown(markdown));
        setRawMarkdown(markdown);
      }
      setContentLoading(false);
    });
  }, [activePeriodId]);

  function handleDownload() {
    const periodLabel = stripPrefix(activeItemName) || activeItemName;
    downloadMarkdownAsPdf(`Bi-weekly ESG News Summary ${periodLabel}`, rawMarkdown);
  }

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
                onClick={() => {
                  setActivePeriodId(item.data_item_id);
                  setActiveItemName(item.item_name);
                }}
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
              <>
                <div className="de-news-download-bar">
                  <button
                    className="de-news-download-btn"
                    onClick={handleDownload}
                    title={zh ? '下載 PDF' : 'Download PDF'}
                  >
                    <DownloadIcon />
                    <span>{zh ? '下載 PDF' : 'Download PDF'}</span>
                  </button>
                </div>
                <div className="de-esg-topics-wrap">
                  {sections.map((section, i) => (
                    <EsgTopicSectionCard key={section.topic} section={section} defaultOpen={i === 0} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


export default function DataCategoryContent({ params }: { params: { category: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const isCapital = params.category === 'capital-markets';
  const isEsg = params.category === 'esg';
  const isGov = params.category === 'government-regulations';
  const isNewsSummary = params.category === 'news-summary';

  const CAPITAL_TABS = [
    { id: 'twse-info', label: 'Taiwan Stock Exchange Trading Info/Data' },
  ];

  const GOV_TABS = [
    { id: 'tw-government-penalty-records', label: '(TW) Government Penalty Records' },
  ];

  const NEWS_SUMMARY_TABS = [
    { id: 'biweekly-esg',  label: lang === 'zh' ? '雙週ESG新聞摘要' : 'Bi-weekly ESG News Summary' },
    { id: 'taiwan-news',   label: lang === 'zh' ? '每週台灣稅務快訊' : 'Weekly Taiwan Tax News Summary' },
    { id: 'intl-news',     label: lang === 'zh' ? '每週國際稅務快訊' : 'Weekly International Tax News Summary' },
  ];

  const defaultTab = isGov ? 'tw-government-penalty-records' : isCapital ? 'twse-info' : isNewsSummary ? 'biweekly-esg' : 'articles';
  const [activeSubTab, setActiveSubTab] = useState(defaultTab);
  const [activeCmTab, setActiveCmTab] = useState<(typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number]>(() => {
    const tabParam = searchParams.get('tab');
    return resolveCapitalMarketsInnerTab(tabParam);
  });

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

  const updateCapitalTabQuery = useCallback((nextTab: (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number]) => {
    if (!isCapital) return;
    const currentTab = searchParams.get('tab');
    if (currentTab === nextTab) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('tab', nextTab);
    const nextQuery = nextSearchParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [isCapital, pathname, router, searchParams]);

  const handleCapitalCmTabChange = useCallback((nextTab: (typeof CAPITAL_MARKETS_INNER_TAB_IDS)[number]) => {
    setActiveCmTab(nextTab);
    updateCapitalTabQuery(nextTab);
  }, [updateCapitalTabQuery]);

  useEffect(() => {
    if (!isCapital) return;
    const tabParam = searchParams.get('tab');
    const resolvedTab = resolveCapitalMarketsInnerTab(tabParam);
    if (resolvedTab === tabParam) {
      setActiveCmTab(resolvedTab);
      return;
    }
    setActiveCmTab(resolvedTab);
    updateCapitalTabQuery(resolvedTab);
  }, [isCapital, searchParams, updateCapitalTabQuery]);

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
              </div>
            </div>

            <div className="de-page-body">
              {hasSubTabs && (
                <SubTabBar tabs={subTabs} active={activeSubTab} color={cat.color} onChange={handleSubTabChange} />
              )}

              {/* Capital Markets — sidebar layout */}
              {isCapital && activeSubTab === 'twse-info' && (
                <CapitalMarketsLayout
                  lang={lang}
                  accentColor={cat.color}
                  activeCmTab={activeCmTab}
                  onChangeCmTab={handleCapitalCmTabChange}
                />
              )}

              {/* ESG / Gov tabs that show articles */}
              {!isCapital && !isGov && activeSubTab === 'articles' && (
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
              {activeSubTab === 'tw-government-penalty-records' && isGov && (
                <GovPenaltyRecordsTab lang={lang} accentColor={cat.color} />
              )}

              {/* News Summary tabs */}
              {activeSubTab === 'biweekly-esg' && isNewsSummary && (
                <BiweeklyEsgTab lang={lang} />
              )}
              {activeSubTab === 'taiwan-news' && isNewsSummary && (
                <NewsDigestSummaryTab
                  catgType="taiwan-tax"
                  tabTitle="Weekly Taiwan Tax News Summary"
                  tabSubtitle="Every Friday at noon, this digest leverages AI to rapidly filter, summarize, and present the latest news on Taiwan's domestic tax policy changes, tax regulation updates, and tax disputes."
                  itemNamePrefix="Weekly Taiwan Tax News Summary "
                  accentColor={NEWS_ACCENT}
                  lang={lang}
                />
              )}
              {activeSubTab === 'intl-news' && isNewsSummary && (
                <NewsDigestSummaryTab
                  catgType="intl-tax"
                  tabTitle="Weekly International Tax News Summary"
                  tabSubtitle="Every Friday at noon, this digest employs AI to rapidly filter, summarize, and present the latest news on global tax policy changes, international tax regulation updates, and tax disputes."
                  itemNamePrefix="Weekly International Tax News Summary "
                  accentColor={NEWS_ACCENT}
                  lang={lang}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
