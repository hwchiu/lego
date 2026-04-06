'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { SP500_COMPANIES } from '@/app/data/sp500';
import {
  pressReleases,
  allTopics,
  getTopicCounts,
  groupByTimeline,
  type PressRelease,
  type TimelineGroup,
  type TimelineGranularity,
} from '@/app/data/pressReleases';

// ─── Types ────────────────────────────────────────────────────────────────────

type PRTab = 'timeline' | 'list';
type RelFilter = 'all' | 'customer' | 'supplier';

const PAGE_SIZE = 10;

// ─── PressReleaseCard ─────────────────────────────────────────────────────────

interface PressReleaseCardProps {
  pr: PressRelease;
  compact?: boolean;
  lang: 'zh' | 'en';
}

function PressReleaseCard({ pr, compact = false, lang }: PressReleaseCardProps) {
  const date = new Date(pr.publishedAt);
  const dateStr = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`pr-card${compact ? ' pr-card--compact' : ''}`}>
      {/* Corner triangle: blue for customer, dark-red for supplier */}
      <div className={`pr-card-tri ${pr.relationship === 'customer' ? 'pr-card-tri--customer' : 'pr-card-tri--supplier'}`} />

      {/* Date top-left + company tag for compact cards */}
      <div className="pr-card-date-row">
        <div className="pr-card-date">{dateStr}</div>
        {compact && <span className="pr-tag pr-tag--neutral pr-card-compact-company">{pr.company}</span>}
      </div>

      {/* Title */}
      <div className="pr-card-title">{pr.title}</div>

      {/* Summary (full card only) */}
      {!compact && <div className="pr-card-summary">{pr.summary}</div>}

      {/* Tags split into sections (full card only) */}
      {!compact && (
        <div className="pr-card-tags-wrap">
          {pr.ticker && (
            <div className="pr-card-tag-section">
              <span className="pr-card-tag-label">Symbol</span>
              <div className="pr-card-tags">
                <span className="pr-tag pr-tag--symbol">{pr.ticker}</span>
              </div>
            </div>
          )}
          <div className="pr-card-tag-section">
            <span className="pr-card-tag-label">Company</span>
            <div className="pr-card-tags">
              <span className="pr-tag pr-tag--neutral">{pr.company}</span>
            </div>
          </div>
          <div className="pr-card-tag-section">
            <span className="pr-card-tag-label">Industry</span>
            <div className="pr-card-tags">
              <span className="pr-tag pr-tag--neutral">{pr.industry}</span>
            </div>
          </div>
          {pr.topics.length > 0 && (
            <div className="pr-card-tag-section">
              <span className="pr-card-tag-label">Topic</span>
              <div className="pr-card-tags">
                {pr.topics.map((t) => (
                  <span key={t} className="pr-tag pr-tag--neutral">
                    {t}
                  </span>
                ))}
                {pr.trendingTopics.slice(0, 1).map((t) => (
                  <span key={t} className="pr-tag pr-tag--neutral">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View count */}
      <div className="pr-card-stats">
        <svg
          viewBox="0 0 14 14"
          width="11"
          height="11"
          fill="none"
          aria-hidden="true"
          style={{ opacity: 0.5 }}
        >
          <path
            d="M1 7C1 7 3 3 7 3C11 3 13 7 13 7C13 7 11 11 7 11C3 11 1 7 1 7Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <circle cx="7" cy="7" r="1.8" fill="currentColor" />
        </svg>
        <span>{(pr.viewCount / 1000).toFixed(1)}K</span>
      </div>
    </div>
  );
}

// ─── Gallery Modal ─────────────────────────────────────────────────────────────

interface GalleryModalProps {
  group: TimelineGroup;
  onClose: () => void;
  lang: 'zh' | 'en';
}

function GalleryModal({ group, onClose, lang }: GalleryModalProps) {
  return (
    <div className="pr-gallery-overlay" onClick={onClose}>
      <div className="pr-gallery-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pr-gallery-header">
          <div className="pr-gallery-title-row">
            <span className="pr-gallery-period">{group.label}</span>
            <span className="pr-gallery-count">
              {group.total} {lang === 'en' ? 'articles' : '篇'}
            </span>
          </div>
          <button className="pr-gallery-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
              <path
                d="M2 2L12 12M12 2L2 12"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="pr-gallery-grid">
          {group.items.map((pr) => (
            <PressReleaseCard key={pr.id} pr={pr} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CardStack ────────────────────────────────────────────────────────────────

interface CardStackProps {
  group: TimelineGroup;
  articles: PressRelease[];
  onOpenGallery: (group: TimelineGroup) => void;
  lang: 'zh' | 'en';
}

function CardStack({ group, articles, onOpenGallery, lang }: CardStackProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (articles.length === 0) return null;

  const layerCount = Math.min(articles.length - 1, 3); // up to 3 decorative layers behind top card

  return (
    <div
      className="pr-card-stack"
      onClick={() => onOpenGallery(group)}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setHoveredIdx(null);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpenGallery(group);
      }}
      aria-label={`View ${articles.length} articles for ${group.label}`}
    >
      {/* Decorative background layers */}
      {Array.from({ length: layerCount }, (_, i) => (
        <div key={i} className={`pr-card-stack-layer pr-card-stack-layer--${i + 1}`} />
      ))}
      {/* Top card */}
      <div className="pr-card-stack-top">
        <PressReleaseCard pr={articles[0]} compact lang={lang} />
      </div>
      {/* Count badge */}
      {articles.length > 1 && (
        <div className="pr-card-stack-badge">{articles.length}</div>
      )}

      {/* Hover expand: fan-out card list below the stack */}
      {isExpanded && articles.length > 1 && (
        <div
          className="pr-card-stack-expand"
          onClick={(e) => e.stopPropagation()}
        >
          {articles.map((pr, i) => {
            const date = new Date(pr.publishedAt);
            const dateStr = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const isActive = hoveredIdx === i;
            return (
              <div
                key={pr.id}
                className={`pr-card-stack-expand-item${isActive ? ' active' : ''}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGallery(group);
                }}
              >
                <span
                  className={`pr-card-stack-expand-dot${pr.relationship === 'customer' ? ' customer' : ' supplier'}`}
                />
                <div className="pr-card-stack-expand-body">
                  <div className="pr-card-stack-expand-date">{dateStr}</div>
                  <div className="pr-card-stack-expand-title">{pr.title}</div>
                  {isActive && pr.summary && (
                    <div className="pr-card-stack-expand-summary">{pr.summary}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TimelineView ─────────────────────────────────────────────────────────────

interface TimelineViewProps {
  items: PressRelease[];
  lang: 'zh' | 'en';
  companyFilter: string;
}

function TimelineView({ items, lang, companyFilter }: TimelineViewProps) {
  const [granularity, setGranularity] = useState<TimelineGranularity>('year');
  // null = show All topics (no filter), Set = filter to these topics
  const [selectedTopics, setSelectedTopics] = useState<Set<string> | null>(null);
  const [openGroup, setOpenGroup] = useState<TimelineGroup | null>(null);

  const filteredItems = useMemo(() => {
    let list = items;
    if (companyFilter) {
      const q = companyFilter.toUpperCase();
      list = list.filter((pr) => pr.ticker.toUpperCase() === q || pr.company.toLowerCase().includes(companyFilter.toLowerCase()));
    }
    if (selectedTopics !== null && selectedTopics.size > 0)
      list = list.filter((pr) => pr.topics.some((t) => selectedTopics.has(t)));
    return list;
  }, [items, companyFilter, selectedTopics]);

  const groups = useMemo(
    () => groupByTimeline(filteredItems, granularity, 2, lang),
    [filteredItems, granularity, lang],
  );
  const topicCounts = useMemo(() => getTopicCounts(items), [items]);

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => {
      if (prev === null) {
        // Was showing all — now select only this topic
        return new Set([topic]);
      }
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  function selectAllTopics() {
    setSelectedTopics(null);
  }

  const handleOpenGallery = useCallback((group: TimelineGroup) => {
    setOpenGroup(group);
  }, []);

  const handleCloseGallery = useCallback(() => {
    setOpenGroup(null);
  }, []);

  const hasFilters = selectedTopics !== null && selectedTopics.size > 0;

  return (
    <div className="pr-timeline-layout">
      {/* Gallery modal */}
      {openGroup && (
        <GalleryModal group={openGroup} onClose={handleCloseGallery} lang={lang} />
      )}

      {/* Left: Topics filter panel (30%) */}
      <aside className="pr-topics-panel">
        <div className="pr-topics-panel-title">
          {lang === 'en' ? 'Filter by Topic' : '依主題篩選'}
        </div>
        <div className="pr-topics-list">
          {/* All option */}
          <button
            className={`pr-topic-item${selectedTopics === null ? ' active' : ''}`}
            onClick={selectAllTopics}
          >
            <span className="pr-topic-name">{lang === 'en' ? 'All' : '全部'}</span>
            <span className="pr-topic-count">{filteredItems.length}</span>
          </button>
          {allTopics.map((topic) => {
            const count = topicCounts[topic] ?? 0;
            const isActive = selectedTopics !== null && selectedTopics.has(topic);
            return (
              <button
                key={topic}
                className={`pr-topic-item${isActive ? ' active' : ''}`}
                onClick={() => toggleTopic(topic)}
              >
                <span className="pr-topic-name">{topic}</span>
                <span className="pr-topic-count">{count}</span>
              </button>
            );
          })}
        </div>
        {hasFilters && (
          <div className="pr-topics-active-info">
            {lang === 'en'
              ? `${selectedTopics!.size} topic(s) selected · ${filteredItems.length} articles`
              : `已選 ${selectedTopics!.size} 個 Topic，顯示 ${filteredItems.length} 篇`}
          </div>
        )}
      </aside>

      {/* Right: Timeline main content (70%) */}
      <div className="pr-timeline-main">
        {/* Granularity filter bar (Relation filter removed, use Company search above) */}
        <div className="pr-granularity-bar">
          <span className="pr-granularity-label">
            {lang === 'en' ? 'Time Dimension' : '檢視維度'}
          </span>
          {(['year', 'quarter', 'month'] as TimelineGranularity[]).map((g) => (
            <button
              key={g}
              className={`pr-granularity-btn${granularity === g ? ' active' : ''}`}
              onClick={() => setGranularity(g)}
            >
              {g === 'year'
                ? lang === 'en'
                  ? 'Annual'
                  : '年度'
                : g === 'quarter'
                  ? lang === 'en'
                    ? 'Quarterly'
                    : '季度'
                  : lang === 'en'
                    ? 'Monthly'
                    : '月份'}
            </button>
          ))}

          {hasFilters && (
            <button
              className="pr-granularity-clear"
              onClick={selectAllTopics}
            >
              {lang === 'en' ? 'Clear Filters' : '清除篩選'}
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="pr-empty">
            <div className="pr-empty-text">
              {lang === 'en'
                ? 'No matching Press Releases'
                : '無符合篩選條件的 Press Release'}
            </div>
          </div>
        ) : (
          <div className="pr-timeline">
            {groups.map((group) => {
              // Left = Customer, Right = Supplier
              const leftItems = group.items.filter((pr) => pr.relationship === 'customer');
              const rightItems = group.items.filter((pr) => pr.relationship === 'supplier');
              return (
                <div className="pr-timeline-group" key={group.key}>
                  {/* BI-style timeline node */}
                  <div className="pr-timeline-node-wrap">
                    <div className="pr-timeline-node">
                      <div className="pr-timeline-node-dot" />
                      <div className="pr-timeline-node-inner">
                        <div className="pr-timeline-node-label">{group.label}</div>
                        <div className="pr-timeline-node-count">
                          <span className="pr-timeline-node-count-num">{group.total}</span>
                          <span className="pr-timeline-node-count-unit">
                            {lang === 'en' ? 'articles' : '篇'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card stacks */}
                  <div className="pr-timeline-cards-row">
                    <div className="pr-timeline-side pr-timeline-side--left">
                      {leftItems.length > 0 && (
                        <CardStack
                          group={group}
                          articles={leftItems}
                          onOpenGallery={handleOpenGallery}
                          lang={lang}
                        />
                      )}
                    </div>
                    <div className="pr-timeline-side pr-timeline-side--right">
                      {rightItems.length > 0 && (
                        <CardStack
                          group={group}
                          articles={rightItems}
                          onOpenGallery={handleOpenGallery}
                          lang={lang}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="pr-timeline-end" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ListView ─────────────────────────────────────────────────────────────────

interface ListViewProps {
  items: PressRelease[];
  lang: 'zh' | 'en';
  companyFilter: string;
}

function ListView({ items, lang, companyFilter }: ListViewProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<RelFilter>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = useMemo(() => {
    let list = [...items].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    if (companyFilter.trim()) {
      const cq = companyFilter.toUpperCase();
      list = list.filter((pr) => pr.ticker.toUpperCase() === cq || pr.company.toLowerCase().includes(companyFilter.toLowerCase()));
    }
    if (filterRelationship !== 'all')
      list = list.filter((pr) => pr.relationship === filterRelationship);
    if (dateFrom) list = list.filter((pr) => pr.publishedAt >= dateFrom);
    if (dateTo) list = list.filter((pr) => pr.publishedAt <= dateTo);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (pr) =>
          pr.title.toLowerCase().includes(q) ||
          pr.company.toLowerCase().includes(q) ||
          pr.ticker.toLowerCase().includes(q) ||
          pr.topics.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [items, search, filterRelationship, dateFrom, dateTo, companyFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function goTo(p: number) {
    setPage(Math.max(0, Math.min(totalPages - 1, p)));
  }

  function handleSearch(val: string) {
    setSearch(val);
    setPage(0);
  }

  function handleRelFilter(val: RelFilter) {
    setFilterRelationship(val);
    setPage(0);
  }

  return (
    <div className="pr-list-view">
      {/* Search + relationship tabs */}
      <div className="pr-list-filter-bar">
        <div className="pr-list-search-wrap">
          <svg
            viewBox="0 0 14 14"
            width="13"
            height="13"
            fill="none"
            aria-hidden="true"
            className="pr-list-search-icon"
          >
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8.5 8.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="pr-list-search"
            type="text"
            placeholder={
              lang === 'en'
                ? 'Search title, company or topic…'
                : '搜尋標題、公司名稱或主題...'
            }
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="pr-list-rel-tabs">
          {(['all', 'customer', 'supplier'] as const).map((r) => (
            <button
              key={r}
              className={`pr-list-rel-tab${filterRelationship === r ? ' active' : ''}`}
              onClick={() => handleRelFilter(r)}
            >
              {r === 'all'
                ? lang === 'en'
                  ? 'All'
                  : '全部'
                : r === 'customer'
                  ? lang === 'en'
                    ? 'Customer'
                    : '客戶'
                  : lang === 'en'
                    ? 'Supplier'
                    : '供應商'}
            </button>
          ))}
        </div>
      </div>

      {/* Date range filter */}
      <div className="pr-date-filter-bar">
        <span className="pr-date-filter-label">
          {lang === 'en' ? 'Date Range' : '時間區間'}
        </span>
        <div className="pr-date-filter-inputs">
          <div className="pr-date-input-wrap">
            <svg
              viewBox="0 0 14 14"
              width="11"
              height="11"
              fill="none"
              aria-hidden="true"
              className="pr-date-cal-icon"
            >
              <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 5.5H13" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4.5 1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M9.5 1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              className="pr-date-input"
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              aria-label={lang === 'en' ? 'Start date' : '開始日期'}
            />
          </div>
          <span className="pr-date-sep">—</span>
          <div className="pr-date-input-wrap">
            <svg
              viewBox="0 0 14 14"
              width="11"
              height="11"
              fill="none"
              aria-hidden="true"
              className="pr-date-cal-icon"
            >
              <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M1 5.5H13" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4.5 1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              <path d="M9.5 1V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            <input
              className="pr-date-input"
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              aria-label={lang === 'en' ? 'End date' : '結束日期'}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              className="pr-date-clear"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setPage(0);
              }}
            >
              {lang === 'en' ? 'Clear' : '清除'}
            </button>
          )}
        </div>
      </div>

      {/* Article count */}
      <div className="pr-list-count">
        {lang === 'en' ? (
          <>
            <strong>{filtered.length}</strong> articles · sorted by date, newest first
          </>
        ) : (
          <>
            共 <strong>{filtered.length}</strong> 篇，依時間由近到遠排序
          </>
        )}
      </div>

      {/* List */}
      {paged.length === 0 ? (
        <div className="pr-empty">
          <div className="pr-empty-text">
            {lang === 'en' ? 'No matching Press Releases' : '無符合條件的 Press Release'}
          </div>
        </div>
      ) : (
        <div className="pr-list">
          {paged.map((pr) => (
            <PressReleaseCard key={pr.id} pr={pr} lang={lang} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pr-pagination">
          <button
            className="pr-page-arrow"
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
          >
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
              <path
                d="M8.5 3L4.5 7L8.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`pr-page-btn${page === i ? ' active' : ''}`}
              onClick={() => goTo(i)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="pr-page-arrow"
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
              <path
                d="M5.5 3L9.5 7L5.5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PressReleasePage() {
  const [activeTab, setActiveTab] = useState<PRTab>('timeline');
  const [companyFilter, setCompanyFilter] = useState('');
  const [companySuggestions, setCompanySuggestions] = useState<typeof SP500_COMPANIES>([]);
  const companyInputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { lang } = useLanguage();

  function handleCompanyInput(val: string) {
    setCompanyFilter(val);
    if (val.trim().length > 0) {
      const q = val.toUpperCase();
      const suggestions = SP500_COMPANIES.filter(
        (c) =>
          c.symbol.startsWith(q) ||
          c.name.toLowerCase().includes(val.toLowerCase()),
      ).slice(0, 8);
      setCompanySuggestions(suggestions);
      setShowSuggestions(true);
    } else {
      setCompanySuggestions([]);
      setShowSuggestions(false);
    }
  }

  function selectCompany(symbol: string) {
    setCompanyFilter(symbol);
    setShowSuggestions(false);
    setCompanySuggestions([]);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (companyInputRef.current && !companyInputRef.current.closest('.pr-company-search-wrap')?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            {/* Compact header — title removed per design */}
            <div className="pr-page-header">
              <span className="section-eyebrow">Press Release</span>
            </div>

            {/* Tab navigation + Company search + Color legend */}
            <div className="pr-tab-header-row">
              <div className="cp-nav-tabs" style={{ marginBottom: 0 }}>
                <button
                  className={`cp-nav-tab${activeTab === 'timeline' ? ' active' : ''}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Timeline View
                  <span className="badge-new" style={{ marginLeft: 6 }}>
                    NEW
                  </span>
                </button>
                <button
                  className={`cp-nav-tab${activeTab === 'list' ? ' active' : ''}`}
                  onClick={() => setActiveTab('list')}
                >
                  List View
                </button>
              </div>

              {/* Company search bar */}
              <div className="pr-company-search-wrap" ref={companyInputRef}>
                <svg
                  viewBox="0 0 14 14"
                  width="13"
                  height="13"
                  fill="none"
                  aria-hidden="true"
                  className="pr-company-search-icon"
                >
                  <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8.5 8.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <input
                  className="pr-company-search-input"
                  type="text"
                  placeholder={lang === 'en' ? 'Search by symbol (e.g. AAPL)…' : '輸入 symbol 篩選公司...'}
                  value={companyFilter}
                  onChange={(e) => handleCompanyInput(e.target.value)}
                  onFocus={() => companyFilter && setShowSuggestions(true)}
                />
                {companyFilter && (
                  <button
                    className="pr-company-search-clear"
                    onClick={() => { setCompanyFilter(''); setCompanySuggestions([]); setShowSuggestions(false); }}
                    aria-label="Clear company filter"
                  >
                    <svg viewBox="0 0 14 14" width="11" height="11" fill="none" aria-hidden="true">
                      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
                {showSuggestions && companySuggestions.length > 0 && (
                  <div className="pr-company-suggestions">
                    {companySuggestions.map((c) => (
                      <button
                        key={c.symbol}
                        className="pr-company-suggestion-item"
                        onMouseDown={(e) => { e.preventDefault(); selectCompany(c.symbol); }}
                      >
                        <span className="pr-company-suggestion-symbol">{c.symbol}</span>
                        <span className="pr-company-suggestion-name">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color legend */}
              <div className="pr-legend">
                <span className="pr-legend-item">
                  <span className="pr-legend-tri pr-legend-tri--customer" aria-hidden="true">▲</span>
                  <span className="pr-legend-label">Customer</span>
                </span>
                <span className="pr-legend-item">
                  <span className="pr-legend-tri pr-legend-tri--supplier" aria-hidden="true">▲</span>
                  <span className="pr-legend-label">Supplier</span>
                </span>
              </div>
            </div>
            <div className="pr-tab-divider" />

            {activeTab === 'timeline' ? (
              <TimelineView items={pressReleases} lang={lang} companyFilter={companyFilter} />
            ) : (
              <ListView items={pressReleases} lang={lang} companyFilter={companyFilter} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}

