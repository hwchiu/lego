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

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getTodayIsoDate(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return toIsoDate(today);
}

function getYesterdayIsoDate(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
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

interface CmDailyQuoteRow {
  trading_date: string;
  security_code: string;
  suspension_of_buy_after_sale_day_trading: string;
  volume: string;
  day_trading_value_of_buys: string;
  trading_value_of_sells: string;
}

const CM_DAILY_QUOTES_FALLBACK_TEMPLATE = [
  { security_code: '2330', suspension_of_buy_after_sale_day_trading: 'N', volume: '6,430,000', day_trading_value_of_buys: '6,250,110,000', trading_value_of_sells: '6,198,930,000' },
  { security_code: '2317', suspension_of_buy_after_sale_day_trading: 'N', volume: '5,567,000', day_trading_value_of_buys: '659,581,000', trading_value_of_sells: '650,440,000' },
  { security_code: '2454', suspension_of_buy_after_sale_day_trading: 'Y', volume: '2,010,000', day_trading_value_of_buys: '1,830,220,000', trading_value_of_sells: '1,812,740,000' },
  { security_code: '2881', suspension_of_buy_after_sale_day_trading: 'N', volume: '3,763,000', day_trading_value_of_buys: '319,882,000', trading_value_of_sells: '318,211,000' },
  { security_code: '2882', suspension_of_buy_after_sale_day_trading: 'N', volume: '4,232,000', day_trading_value_of_buys: '410,401,000', trading_value_of_sells: '408,702,000' },
  { security_code: '2891', suspension_of_buy_after_sale_day_trading: 'N', volume: '2,458,000', day_trading_value_of_buys: '270,552,000', trading_value_of_sells: '269,399,000' },
] as const;

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
}

function ThSortFilter({ label, colIndex, sortCol, sortDir, onSort, onFilter, filterValue, className }: ThSortFilterProps) {
  const isActive = sortCol === colIndex;
  const icon = isActive ? (sortDir === 'asc' ? '▲' : '▼') : '⇅';
  return (
    <th className={className}>
      <div className="de-th-filter-wrap">
        <button className="de-th-sort-btn" onClick={() => onSort(colIndex)}>
          {label}
          <span className={`de-th-sort-icon${isActive ? ' de-th-sort-icon--active' : ''}`}>{icon}</span>
        </button>
        <input
          className="de-th-filter-input"
          type="text"
          value={filterValue}
          onChange={(e) => onFilter(colIndex, e.target.value)}
          placeholder="filter..."
          onClick={(e) => e.stopPropagation()}
          aria-label={`Filter ${label}`}
        />
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
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    rowsData,
    [
      (r) => r.security_code,
      (r) => r.trading_date,
      (r) => r.suspension_of_buy_after_sale_day_trading,
      (r) => r.volume,
      (r) => r.day_trading_value_of_buys,
      (r) => r.trading_value_of_sells,
    ],
  );

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
            <ThSortFilter label={zh ? '標的代碼' : 'Security Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} className="de-cm-dq-col-sticky" />
            <ThSortFilter label={zh ? '成交日期' : 'Trading Date'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
            <ThSortFilter label={zh ? '暫停現股賣出後現款買進當沖註記' : 'Suspension Of Buy After Sale Day Trading'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} />
            <ThSortFilter label={zh ? '當日沖銷交易成交股數' : 'Volume'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
            <ThSortFilter label={zh ? '當日沖銷交易買進成交金額' : 'Day Trading Value Of Buys'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
            <ThSortFilter label={zh ? '當日沖銷交易賣出成交金額' : 'Trading Value Of Sells'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.security_code}-${r.trading_date}`}>
              <td className="code de-cm-dq-col-sticky">{r.security_code}</td>
              <td>{r.trading_date}</td>
              <td>{r.suspension_of_buy_after_sale_day_trading}</td>
              <td className="num">{fmtNum(r.volume)}</td>
              <td className="num">{fmtNum(r.day_trading_value_of_buys)}</td>
              <td className="num">{fmtNum(r.trading_value_of_sells)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmDayTradingTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    CM_DAY_TRADING,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.buy, (r) => r.sell, (r) => r.net, (r) => r.ratio],
  );
  return (
    <CmTableWrapper>
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSortFilter label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
            <ThSortFilter label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
            <ThSortFilter label={zh ? '當沖買進股數' : 'Day-Trade Buy'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} className="num" />
            <ThSortFilter label={zh ? '當沖賣出股數' : 'Day-Trade Sell'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
            <ThSortFilter label={zh ? '當沖成交股數' : 'Day-Trade Volume'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
            <ThSortFilter label={zh ? '占總成交股數比' : '% of Total Vol.'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{fmtNum(r.buy)}</td>
              <td className="num">{fmtNum(r.sell)}</td>
              <td className="num">{fmtNum(r.net)}</td>
              <td className={`num${r.ratio.startsWith('-') ? ' neg' : ''}`}>{fmtPct(r.ratio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmMarginTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    CM_MARGIN,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.finBuy, (r) => r.finSell, (r) => r.finBal, (r) => r.shoBuy, (r) => r.shoSell, (r) => r.shoBal],
  );
  return (
    <CmTableWrapper>
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSortFilter label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
            <ThSortFilter label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
            <ThSortFilter label={zh ? '融資買進' : 'Margin Buy'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融資賣出' : 'Margin Sell'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融資餘額' : 'Margin Balance'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融券賣出' : 'Short Sell'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融券買進' : 'Short Buy'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[6] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融券餘額' : 'Short Balance'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[7] ?? ''} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{fmtNum(r.finBuy)}</td>
              <td className="num">{fmtNum(r.finSell)}</td>
              <td className="num">{fmtNum(r.finBal)}</td>
              <td className="num">{fmtNum(r.shoBuy)}</td>
              <td className="num">{fmtNum(r.shoSell)}</td>
              <td className="num">{fmtNum(r.shoBal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmShortSaleTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    CM_SHORT_SALE,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.finLimit, (r) => r.finUsed, (r) => r.finRatio, (r) => r.shoLimit, (r) => r.shoUsed, (r) => r.shoRatio],
  );
  return (
    <CmTableWrapper>
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSortFilter label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
            <ThSortFilter label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
            <ThSortFilter label={zh ? '融資限額' : 'Margin Limit'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融資已用' : 'Margin Used'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融資使用率' : 'Margin Util.'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融券限額' : 'Short Limit'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融券已用' : 'Short Used'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[6] ?? ''} className="num" />
            <ThSortFilter label={zh ? '融券使用率' : 'Short Util.'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[7] ?? ''} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{fmtNum(r.finLimit)}</td>
              <td className="num">{fmtNum(r.finUsed)}</td>
              <td className={`num${r.finRatio.startsWith('-') ? ' neg' : ''}`}>{fmtPct(r.finRatio)}</td>
              <td className="num">{fmtNum(r.shoLimit)}</td>
              <td className="num">{fmtNum(r.shoUsed)}</td>
              <td className={`num${r.shoRatio.startsWith('-') ? ' neg' : ''}`}>{fmtPct(r.shoRatio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmExDividendTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    CM_EX_DIVIDEND,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.exDivDate, (r) => r.divVal, (r) => r.exRightDate, (r) => r.rightVal, (r) => r.listDate],
  );
  return (
    <CmTableWrapper>
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSortFilter label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
            <ThSortFilter label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
            <ThSortFilter label={zh ? '除息日' : 'Ex-Div Date'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} />
            <ThSortFilter label={zh ? '息值(元)' : 'Div. Value'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
            <ThSortFilter label={zh ? '除權日' : 'Ex-Right Date'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} />
            <ThSortFilter label={zh ? '權值' : 'Right Value'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} className="num" />
            <ThSortFilter label={zh ? '上市日期' : 'Listing Date'} colIndex={6} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[6] ?? ''} />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td>{r.exDivDate}</td>
              <td className="num">{fmtNum(r.divVal)}</td>
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
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    CM_FOREIGN,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.buy, (r) => r.sell, (r) => r.shares, (r) => r.ratio],
  );
  return (
    <CmTableWrapper>
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSortFilter label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
            <ThSortFilter label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
            <ThSortFilter label={zh ? '外資買進(股)' : 'Foreign Buy'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} className="num" />
            <ThSortFilter label={zh ? '外資賣出(股)' : 'Foreign Sell'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
            <ThSortFilter label={zh ? '外資持股股數' : 'Foreign Holdings'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
            <ThSortFilter label={zh ? '持股比例' : 'Holding %'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{fmtNum(r.buy)}</td>
              <td className="num">{fmtNum(r.sell)}</td>
              <td className="num">{fmtNum(r.shares)}</td>
              <td className={`num${r.ratio.startsWith('-') ? ' neg' : ''}`}>{fmtPct(r.ratio)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmPriceLimitTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    CM_PRICE_LIMIT,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.refPrice, (r) => r.ceiling, (r) => r.floor, (r) => r.pct],
  );
  return (
    <CmTableWrapper>
      <table className="de-data-table">
        <thead>
          <tr>
            <ThSortFilter label={zh ? '股票代號' : 'Code'} colIndex={0} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[0] ?? ''} />
            <ThSortFilter label={zh ? '名稱' : 'Name'} colIndex={1} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[1] ?? ''} />
            <ThSortFilter label={zh ? '參考收盤價' : 'Ref. Price'} colIndex={2} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[2] ?? ''} className="num" />
            <ThSortFilter label={zh ? '漲停價格' : 'Upper Limit'} colIndex={3} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[3] ?? ''} className="num" />
            <ThSortFilter label={zh ? '跌停價格' : 'Lower Limit'} colIndex={4} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[4] ?? ''} className="num" />
            <ThSortFilter label={zh ? '漲跌幅限制' : 'Limit %'} colIndex={5} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[5] ?? ''} className="num" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className="num">{fmtNum(r.refPrice)}</td>
              <td className="num">{fmtNum(r.ceiling)}</td>
              <td className="num">{fmtNum(r.floor)}</td>
              <td className={`num${r.pct.startsWith('-') ? ' neg' : ''}`}>{fmtPct(r.pct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

function CmPeRatioTab({ lang }: { lang: 'zh' | 'en' }) {
  const zh = lang === 'zh';
  const { rows, colFilters, handleColFilter, sortCol, sortDir, handleSort } = useGovSortableData(
    CM_PE_RATIO,
    [(r) => r.code, (r) => (zh ? r.nameZh : r.nameEn), (r) => r.yield, (r) => r.pe, (r) => r.pb],
  );
  return (
    <CmTableWrapper>
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
          {rows.map((r) => (
            <tr key={r.code}>
              <CmNameCell lang={lang} code={r.code} nameZh={r.nameZh} nameEn={r.nameEn} />
              <td className={`num${r.yield.startsWith('-') ? ' neg' : ''}`}>{fmtPct(r.yield)}</td>
              <td className="num">{fmtNum(r.pe)}</td>
              <td className="num">{fmtNum(r.pb)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CmTableWrapper>
  );
}

// ── Capital Markets — Date Picker + Layout ────────────────────────────────────

interface CmDatePickerProps {
  lang: 'zh' | 'en';
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const CM_MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const CM_MONTH_NAMES_ZH = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
const CM_DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const CM_DAY_LABELS_ZH = ['日','一','二','三','四','五','六'];

function CmDatePicker({ lang, selectedDate, onSelect, onSearch, onClear }: CmDatePickerProps) {
  const zh = lang === 'zh';
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxSelectableDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d;
  }, [today]);
  const minDate = useMemo(() => {
    const d = new Date(maxSelectableDate);
    d.setMonth(d.getMonth() - 3);
    return d;
  }, [maxSelectableDate]);

  const [viewYear, setViewYear] = useState(maxSelectableDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(maxSelectableDate.getMonth());
  const [calOpen, setCalOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function isoDate(y: number, m: number, d: number): string {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function isDisabled(y: number, m: number, d: number): boolean {
    const dt = new Date(y, m, d);
    return dt < minDate || dt > maxSelectableDate;
  }

  function buildCalendar() {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: Array<{ day: number | null; date: string | null }> = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: null, date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: isoDate(viewYear, viewMonth, d) });
    return cells;
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    const firstOfNext = new Date(nextY, nextM, 1);
    if (firstOfNext > maxSelectableDate) return;
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const canGoNext = (() => {
    const nextM = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    return new Date(nextY, nextM, 1) <= maxSelectableDate;
  })();

  const canGoPrev = (() => {
    const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
    const lastOfPrev = new Date(prevY, prevM + 1, 0);
    return lastOfPrev >= minDate;
  })();

  const cells = buildCalendar();
  const monthLabel = zh
    ? `${viewYear}年 ${CM_MONTH_NAMES_ZH[viewMonth]}`
    : `${CM_MONTH_NAMES[viewMonth]} ${viewYear}`;
  const dayLabels = zh ? CM_DAY_LABELS_ZH : CM_DAY_LABELS;

  const displayText = selectedDate
    ? selectedDate
    : (zh ? '選擇日期…' : 'Select date…');

  return (
    <div className="de-cm-datepicker-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`de-cm-datepicker-input${calOpen ? ' open' : ''}`}
        onClick={() => setCalOpen(v => !v)}
        aria-haspopup="dialog"
        aria-expanded={calOpen}
      >
        <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
          <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.3"/>
          <path d="M4 1v2.5M10 1v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <span>{displayText}</span>
      </button>
      {calOpen && (
        <div className="de-cm-cal-popup" role="dialog" aria-label={zh ? '日期選擇器' : 'Date picker'}>
          <div className="de-cm-cal-nav">
            <button type="button" className="de-cm-cal-nav-btn" onClick={prevMonth} disabled={!canGoPrev} aria-label={zh ? '上個月' : 'Previous month'}>
              <svg viewBox="0 0 14 14" fill="none" width="12" height="12"><path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="de-cm-cal-month">{monthLabel}</span>
            <button type="button" className="de-cm-cal-nav-btn" onClick={nextMonth} disabled={!canGoNext} aria-label={zh ? '下個月' : 'Next month'}>
              <svg viewBox="0 0 14 14" fill="none" width="12" height="12"><path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="de-cm-cal-grid">
            {dayLabels.map(d => (
              <div key={d} className="de-cm-cal-day-label">{d}</div>
            ))}
            {cells.map((cell, i) => {
              if (!cell.day || !cell.date) return <div key={`empty-${i}`} className="de-cm-cal-cell de-cm-cal-cell--empty" />;
              const disabled = isDisabled(viewYear, viewMonth, cell.day);
              const isSelected = cell.date === selectedDate;
              const isToday = cell.date === isoDate(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <button
                  key={cell.date}
                  type="button"
                  className={`de-cm-cal-cell${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}${disabled ? ' disabled' : ''}`}
                  disabled={disabled}
                  onClick={() => { onSelect(cell.date!); setCalOpen(false); }}
                  aria-label={cell.date}
                  aria-pressed={isSelected}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
          <div className="de-cm-cal-hint">
            {zh ? `可選範圍：${minDate.toLocaleDateString('zh-TW')} – 昨天` : `Range: ${minDate.toLocaleDateString('en-US')} – Yesterday`}
          </div>
        </div>
      )}
      <button
        type="button"
        className="de-cm-search-btn"
        onClick={() => { onSearch(); setCalOpen(false); }}
        disabled={!selectedDate}
      >
        {zh ? '搜尋' : 'Search'}
      </button>
      <button
        type="button"
        className="de-cm-clear-btn"
        onClick={onClear}
        disabled={!selectedDate}
      >
        {zh ? '清除' : 'Clear'}
      </button>
    </div>
  );
}

// ── CSV download helpers for Capital Markets ──────────────────────────────────

interface CapitalMarketsCsvOptions {
  dailyQuotesRows?: CmDailyQuoteRow[];
}

function downloadCapitalMarketsCSV(tabId: string, lang: 'zh' | 'en', options: CapitalMarketsCsvOptions = {}) {
  const zh = lang === 'zh';
  switch (tabId) {
    case 'daily-quotes': {
      const rows = options.dailyQuotesRows ?? [];
      downloadCSV(zh ? '每日收盤行情.csv' : 'daily-quotes.csv',
        zh
          ? ['標的代碼', '成交日期', '暫停現股賣出後現款買進當沖註記', '當日沖銷交易成交股數', '當日沖銷交易買進成交金額', '當日沖銷交易賣出成交金額']
          : ['Security Code', 'Trading Date', 'Suspension Of Buy After Sale Day Trading', 'Volume', 'Day Trading Value Of Buys', 'Trading Value Of Sells'],
        rows.map((r) => [r.security_code, r.trading_date, r.suspension_of_buy_after_sale_day_trading, r.volume, r.day_trading_value_of_buys, r.trading_value_of_sells]));
      break;
    }
    case 'day-trading':
      downloadCSV(zh ? '每日沖銷交易.csv' : 'day-trading.csv',
        zh ? ['股票代號','名稱','當沖買進股數','當沖賣出股數','當沖成交股數','占總成交股數比'] : ['Code','Name','Day-Trade Buy','Day-Trade Sell','Day-Trade Volume','% of Total Vol.'],
        CM_DAY_TRADING.map(r => [r.code, zh ? r.nameZh : r.nameEn, r.buy, r.sell, r.net, r.ratio]));
      break;
    case 'margin':
      downloadCSV(zh ? '融資融券餘額.csv' : 'margin-transaction.csv',
        zh ? ['股票代號','名稱','融資買進','融資賣出','融資餘額','融券賣出','融券買進','融券餘額'] : ['Code','Name','Margin Buy','Margin Sell','Margin Balance','Short Sell','Short Buy','Short Balance'],
        CM_MARGIN.map(r => [r.code, zh ? r.nameZh : r.nameEn, r.finBuy, r.finSell, r.finBal, r.shoBuy, r.shoSell, r.shoBal]));
      break;
    case 'short-sale':
      downloadCSV(zh ? '信用額度總量管制餘額.csv' : 'short-sale-balances.csv',
        zh ? ['股票代號','名稱','融資限額','融資已用','融資使用率','融券限額','融券已用','融券使用率'] : ['Code','Name','Margin Limit','Margin Used','Margin Util.','Short Limit','Short Used','Short Util.'],
        CM_SHORT_SALE.map(r => [r.code, zh ? r.nameZh : r.nameEn, r.finLimit, r.finUsed, r.finRatio, r.shoLimit, r.shoUsed, r.shoRatio]));
      break;
    case 'ex-dividend':
      downloadCSV(zh ? '除權息及上下市資訊.csv' : 'ex-right-dividend.csv',
        zh ? ['股票代號','名稱','除息日','息值(元)','除權日','權值','上市日期'] : ['Code','Name','Ex-Div Date','Div. Value','Ex-Right Date','Right Value','Listing Date'],
        CM_EX_DIVIDEND.map(r => [r.code, zh ? r.nameZh : r.nameEn, r.exDivDate, r.divVal, r.exRightDate, r.rightVal, r.listDate]));
      break;
    case 'foreign-investors':
      downloadCSV(zh ? '外資投資持股統計.csv' : 'foreign-investors.csv',
        zh ? ['股票代號','名稱','外資買進(股)','外資賣出(股)','外資持股股數','持股比例'] : ['Code','Name','Foreign Buy','Foreign Sell','Foreign Holdings','Holding %'],
        CM_FOREIGN.map(r => [r.code, zh ? r.nameZh : r.nameEn, r.buy, r.sell, r.shares, r.ratio]));
      break;
    case 'price-limit':
      downloadCSV(zh ? '漲跌幅度表.csv' : 'price-variation-limit.csv',
        zh ? ['股票代號','名稱','參考收盤價','漲停價格','跌停價格','漲跌幅限制'] : ['Code','Name','Ref. Price','Upper Limit','Lower Limit','Limit %'],
        CM_PRICE_LIMIT.map(r => [r.code, zh ? r.nameZh : r.nameEn, r.refPrice, r.ceiling, r.floor, r.pct]));
      break;
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

function formatCapitalMarketUpdateDatetime(value: unknown, lang: 'zh' | 'en'): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }
  return parsedDate.toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function CapitalMarketsLayout({ lang, accentColor, activeCmTab, onChangeCmTab }: CapitalMarketsLayoutProps) {
  const zh = lang === 'zh';
  const defaultQueryDate = useMemo(() => getYesterdayIsoDate(), []);
  const [selectedDate, setSelectedDate] = useState<string | null>(defaultQueryDate);
  const [dailyQuoteRows, setDailyQuoteRows] = useState<CmDailyQuoteRow[]>([]);
  const [dailyQuoteVisibleRows, setDailyQuoteVisibleRows] = useState<CmDailyQuoteRow[]>([]);
  const [dailyQuotesLoading, setDailyQuotesLoading] = useState(false);
  const [dailyQuotesError, setDailyQuotesError] = useState<string | null>(null);
  const [updateDatetime, setUpdateDatetime] = useState<string | null>(null);
  const [updateDatetimeLoading, setUpdateDatetimeLoading] = useState(false);
  const updateDatetimeDisplay = updateDatetime ?? getTodayIsoDate();

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

  const queryDailyQuotes = useCallback(async (date: string) => {
    setDailyQuotesLoading(true);
    setDailyQuotesError(null);
    try {
      const rows = await fetchDailyQuotesRowsByDate(date);
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

  useEffect(() => {
    if (activeCmTab !== 'daily-quotes') return;
    setSelectedDate(defaultQueryDate);
    queryDailyQuotes(defaultQueryDate);
  }, [activeCmTab, defaultQueryDate, queryDailyQuotes]);

  useEffect(() => {
    let cancelled = false;
    setUpdateDatetimeLoading(true);
    setUpdateDatetime(null);

    const url = new URL('/getUpdateDatetime', window.location.origin);
    url.searchParams.set('category', activeCmTab);
    url.searchParams.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);

    fetch(url.toString(), { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as
          | { updateDatetime?: string; updateDateTime?: string; datetime?: string; data?: { updateDatetime?: string; updateDateTime?: string; datetime?: string } }
          | string;
        if (typeof data === 'string') return data;
        return data.updateDatetime ?? data.updateDateTime ?? data.datetime ?? data.data?.updateDatetime ?? data.data?.updateDateTime ?? data.data?.datetime ?? null;
      })
      .then((value) => {
        if (cancelled) return;
        setUpdateDatetime(formatCapitalMarketUpdateDatetime(value, lang));
      })
      .catch(() => {
        if (!cancelled) setUpdateDatetime(null);
      })
      .finally(() => {
        if (!cancelled) setUpdateDatetimeLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeCmTab, lang]);

  function handleSearch() {
    if (!selectedDate) return;
    if (activeCmTab === 'daily-quotes') {
      queryDailyQuotes(selectedDate);
    }
  }
  function handleClear() {
    setSelectedDate(null);
    if (activeCmTab === 'daily-quotes') {
      queryDailyQuotes(defaultQueryDate);
    }
  }
  function handleDownload() {
    downloadCapitalMarketsCSV(activeCmTab, lang, {
      dailyQuotesRows: dailyQuoteVisibleRows,
    });
  }

  return (
    <>
      <div className="de-cm-description">
        {zh
          ? '資料僅可查近三個月資料，預設顯示最新更新日期資料，若要查看或下載其他日期資料則在上方選取對應日期。'
          : 'Only the most recent three months of data are provided. To download data, please search for the corresponding date and then click "Download" to retrieve the data for that specific date.'}
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
            <CmDatePicker
              lang={lang}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
              onSearch={handleSearch}
              onClear={handleClear}
            />
            <span className="de-cm-ref-date">
              tMIC Update Date: {updateDatetimeLoading ? (zh ? '載入中…' : 'Loading...') : updateDatetimeDisplay}
            </span>
          </div>
          <div className="de-cm-content-toolbar-right">
            <button className="de-news-download-btn de-gov-csv-btn" onClick={handleDownload}>
              <DownloadIcon />
              <span>{zh ? '下載 CSV' : 'Download CSV'}</span>
            </button>
          </div>
        </div>
        {activeCmTab === 'daily-quotes'      && (
          <CmDailyQuotesTab
            lang={lang}
            rowsData={dailyQuoteRows}
            loading={dailyQuotesLoading}
            error={dailyQuotesError}
            onVisibleRowsChange={setDailyQuoteVisibleRows}
          />
        )}
        {activeCmTab === 'day-trading'       && <CmDayTradingTab lang={lang} />}
        {activeCmTab === 'margin'            && <CmMarginTab lang={lang} />}
        {activeCmTab === 'short-sale'        && <CmShortSaleTab lang={lang} />}
        {activeCmTab === 'ex-dividend'       && <CmExDividendTab lang={lang} />}
        {activeCmTab === 'foreign-investors' && <CmForeignTab lang={lang} />}
        {activeCmTab === 'price-limit'       && <CmPriceLimitTab lang={lang} />}
        {activeCmTab === 'pe-ratio'          && <CmPeRatioTab lang={lang} />}
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
    trading_value_of_sells: item.trading_value_of_sells,
  }));
}

async function fetchDailyQuotesRowsByDate(date: string): Promise<CmDailyQuoteRow[]> {
  try {
    const url = new URL('/getDailyQuotesByDate', window.location.origin);
    url.searchParams.set('date', date);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      return buildFallbackDailyQuotesRows(date);
    }
    const data = (await res.json()) as { items?: CmDailyQuoteRow[] } | CmDailyQuoteRow[];
    if (Array.isArray(data)) {
      return data;
    }
    if (Array.isArray(data.items)) {
      return data.items;
    }
    return buildFallbackDailyQuotesRows(date);
  } catch {
    return buildFallbackDailyQuotesRows(date);
  }
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
      ? ['統一編號', '違規人管制編號', '公司（工廠）地址縣市別代碼', '裁處機關', '管制事業編號', '事業名稱', '裁處書字號', '違反時間', '污染類別', '違規人名稱', '台積更新此筆紀錄的時間']
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
              <ThSortFilter label={zh ? '台積更新此筆紀錄的時間' : 'Update Date'} colIndex={10} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[10] ?? ''} />
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
      ? ['廠商代碼', '標案案號', '廠商名稱', '刊登機關代碼', '刊登機關名稱', '標案名稱', '拒絕往來截止日', '台積此筆更新的時間']
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
              <ThSortFilter label={zh ? '台積此筆更新的時間' : 'Update Date'} colIndex={7} sortCol={sortCol} sortDir={sortDir} onSort={handleSort} onFilter={handleColFilter} filterValue={colFilters[7] ?? ''} />
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
    return isCapitalMarketsInnerTab(tabParam) ? tabParam : DEFAULT_CM_TAB;
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
    if (isCapitalMarketsInnerTab(tabParam)) {
      setActiveCmTab(tabParam);
      return;
    }
    setActiveCmTab(DEFAULT_CM_TAB);
    updateCapitalTabQuery(DEFAULT_CM_TAB);
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
