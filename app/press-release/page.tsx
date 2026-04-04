'use client';

import { useState, useMemo } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import {
  pressReleases,
  allTopics,
  getTopicCounts,
  groupByTimeline,
  type PressRelease,
  type TimelineGranularity,
} from '@/app/data/pressReleases';

// ─── Types ────────────────────────────────────────────────────────────────────

type PRTab = 'timeline' | 'list';

const PAGE_SIZE = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PressReleaseCardProps {
  pr: PressRelease;
  compact?: boolean;
}

function PressReleaseCard({ pr, compact = false }: PressReleaseCardProps) {
  const date = new Date(pr.publishedAt);
  const dateStr = date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
  const relationshipLabel = pr.relationship === 'customer' ? '客戶' : '供應商';
  const relationshipColor = pr.relationship === 'customer' ? '#0369a1' : '#7c3aed';

  return (
    <div className={`pr-card${compact ? ' pr-card--compact' : ''}`}>
      <div className="pr-card-meta">
        <span className="pr-card-date">{dateStr}</span>
        <span className="pr-card-relationship" style={{ color: relationshipColor }}>
          {relationshipLabel}
        </span>
      </div>
      <div className="pr-card-title">{pr.title}</div>
      {!compact && <div className="pr-card-summary">{pr.summary}</div>}
      <div className="pr-card-tags">
        <span className="pr-tag pr-tag--company">{pr.company}</span>
        <span className="pr-tag pr-tag--industry">{pr.industry}</span>
        {pr.topics.slice(0, 2).map((t) => (
          <span key={t} className="pr-tag pr-tag--topic">
            {t}
          </span>
        ))}
        {pr.trendingTopics.slice(0, 1).map((t) => (
          <span key={t} className="pr-tag pr-tag--trending">
            {t}
          </span>
        ))}
      </div>
      <div className="pr-card-stats">
        <svg viewBox="0 0 14 14" width="11" height="11" fill="none" aria-hidden="true" style={{ opacity: 0.5 }}>
          <path d="M1 7C1 7 3 3 7 3C11 3 13 7 13 7C13 7 11 11 7 11C3 11 1 7 1 7Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="7" cy="7" r="1.8" fill="currentColor" />
        </svg>
        <span>{(pr.viewCount / 1000).toFixed(1)}K</span>
      </div>
    </div>
  );
}

// ─── Timeline View ─────────────────────────────────────────────────────────────

interface TimelineViewProps {
  items: PressRelease[];
}

function TimelineView({ items }: TimelineViewProps) {
  const [granularity, setGranularity] = useState<TimelineGranularity>('year');
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());

  const filteredItems = useMemo(() => {
    if (selectedTopics.size === 0) return items;
    return items.filter((pr) => pr.topics.some((t) => selectedTopics.has(t)));
  }, [items, selectedTopics]);

  const groups = useMemo(() => groupByTimeline(filteredItems, granularity), [filteredItems, granularity]);
  const topicCounts = useMemo(() => getTopicCounts(items), [items]);

  function toggleTopic(topic: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topic)) next.delete(topic);
      else next.add(topic);
      return next;
    });
  }

  return (
    <div className="pr-timeline-layout">
      {/* ── Left: Timeline (70%) ── */}
      <div className="pr-timeline-main">
        {/* Granularity switcher */}
        <div className="pr-granularity-bar">
          <span className="pr-granularity-label">檢視維度</span>
          {(['year', 'quarter', 'month'] as TimelineGranularity[]).map((g) => (
            <button
              key={g}
              className={`pr-granularity-btn${granularity === g ? ' active' : ''}`}
              onClick={() => setGranularity(g)}
            >
              {g === 'year' ? '年度' : g === 'quarter' ? '季度' : '月份'}
            </button>
          ))}
          {selectedTopics.size > 0 && (
            <button className="pr-granularity-clear" onClick={() => setSelectedTopics(new Set())}>
              清除篩選
            </button>
          )}
        </div>

        {filteredItems.length === 0 ? (
          <div className="pr-empty">
            <div className="pr-empty-text">無符合篩選條件的 Press Release</div>
          </div>
        ) : (
          <div className="pr-timeline">
            {groups.map((group) => (
              <div className="pr-timeline-group" key={group.key}>
                {/* Center node */}
                <div className="pr-timeline-node-wrap">
                  <div className="pr-timeline-node">
                    <div className="pr-timeline-node-dot" />
                    <div className="pr-timeline-node-label">{group.label}</div>
                    <div className="pr-timeline-node-count">{group.total} 篇</div>
                  </div>
                </div>
                {/* Cards row */}
                <div className="pr-timeline-cards-row">
                  <div className="pr-timeline-side pr-timeline-side--left">
                    {group.topArticles[0] && <PressReleaseCard pr={group.topArticles[0]} compact />}
                  </div>
                  <div className="pr-timeline-side pr-timeline-side--right">
                    {group.topArticles[1] && <PressReleaseCard pr={group.topArticles[1]} compact />}
                  </div>
                </div>
              </div>
            ))}
            {/* End cap */}
            <div className="pr-timeline-end" />
          </div>
        )}
      </div>

      {/* ── Right: Topics panel (30%) ── */}
      <aside className="pr-topics-panel">
        <div className="pr-topics-panel-title">Press Releases by Topic</div>
        <div className="pr-topics-list">
          {allTopics.map((topic) => {
            const count = topicCounts[topic] ?? 0;
            const isActive = selectedTopics.has(topic);
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
        {selectedTopics.size > 0 && (
          <div className="pr-topics-active-info">
            已選 {selectedTopics.size} 個 Topic，顯示 {filteredItems.length} 篇
          </div>
        )}
      </aside>
    </div>
  );
}

// ─── List View ─────────────────────────────────────────────────────────────────

interface ListViewProps {
  items: PressRelease[];
}

function ListView({ items }: ListViewProps) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [filterRelationship, setFilterRelationship] = useState<'all' | 'customer' | 'supplier'>('all');

  const filtered = useMemo(() => {
    let list = [...items].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
    if (filterRelationship !== 'all') list = list.filter((pr) => pr.relationship === filterRelationship);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (pr) =>
          pr.title.toLowerCase().includes(q) ||
          pr.company.toLowerCase().includes(q) ||
          pr.topics.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [items, search, filterRelationship]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function goTo(p: number) {
    const clamped = Math.max(0, Math.min(totalPages - 1, p));
    setPage(clamped);
  }

  function handleSearch(val: string) {
    setSearch(val);
    setPage(0);
  }

  function handleRelFilter(val: 'all' | 'customer' | 'supplier') {
    setFilterRelationship(val);
    setPage(0);
  }

  return (
    <div className="pr-list-view">
      {/* Filter bar */}
      <div className="pr-list-filter-bar">
        <div className="pr-list-search-wrap">
          <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true" className="pr-list-search-icon">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8.5 8.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="pr-list-search"
            type="text"
            placeholder="搜尋標題、公司名稱或主題..."
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
              {r === 'all' ? '全部' : r === 'customer' ? '客戶' : '供應商'}
            </button>
          ))}
        </div>
      </div>

      {/* Article count */}
      <div className="pr-list-count">
        共 <strong>{filtered.length}</strong> 篇，依時間由近到遠排序
      </div>

      {/* List */}
      {paged.length === 0 ? (
        <div className="pr-empty">
          <div className="pr-empty-text">無符合條件的 Press Release</div>
        </div>
      ) : (
        <div className="pr-list">
          {paged.map((pr) => (
            <PressReleaseCard key={pr.id} pr={pr} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pr-pagination">
          <button className="pr-page-arrow" onClick={() => goTo(page - 1)} disabled={page === 0}>
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M8.5 3L4.5 7L8.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <button className="pr-page-arrow" onClick={() => goTo(page + 1)} disabled={page >= totalPages - 1}>
            <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
              <path d="M5.5 3L9.5 7L5.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">Press Release</div>
            <h1 className="pr-page-title">Press Releases</h1>
            <p className="pr-page-sub">台積電核心供應商與客戶最新新聞稿彙整</p>

            {/* Tabs */}
            <div className="cp-nav-tabs" style={{ marginBottom: 0 }}>
              <button
                className={`cp-nav-tab${activeTab === 'timeline' ? ' active' : ''}`}
                onClick={() => setActiveTab('timeline')}
              >
                Timeline View
                <span className="badge-new" style={{ marginLeft: 6 }}>NEW</span>
              </button>
              <button
                className={`cp-nav-tab${activeTab === 'list' ? ' active' : ''}`}
                onClick={() => setActiveTab('list')}
              >
                List View
              </button>
            </div>
            <div className="pr-tab-divider" />

            {/* Tab content */}
            {activeTab === 'timeline' ? (
              <TimelineView items={pressReleases} />
            ) : (
              <ListView items={pressReleases} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
