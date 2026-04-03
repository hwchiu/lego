'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { CATEGORIES_MAP, DataItem } from '@/app/data/dataExplore';

// ── helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── sub-components ─────────────────────────────────────────────────────────────

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="de-item-card-title-link"
          >
            {item.title}
            <span className="de-item-card-ext-icon">
              <ExternalLinkIcon />
            </span>
          </a>
        ) : (
          <span>{item.title}</span>
        )}
      </div>
      <p className="de-item-card-summary">{item.summary}</p>
      <div className="de-item-card-tags">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="de-tag"
            style={{ background: `${accentColor}12`, color: accentColor }}
          >
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function DataCategoryContent({ params }: { params: { category: string } }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const cat = CATEGORIES_MAP[params.category];

  // Gather all unique tags for this category
  const allTags = useMemo(() => {
    if (!cat) return [];
    const set = new Set<string>();
    cat.items.forEach((item) => item.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [cat]);

  const filteredItems = useMemo(() => {
    if (!cat) return [];
    let items = [...cat.items].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (activeTag) {
      items = items.filter((item) => item.tags.includes(activeTag));
    }
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

  // Not found
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

            {/* ── Category Hero ── */}
            <div className="de-cat-hero" style={{ borderColor: cat.color }}>
              <div className="de-cat-hero-inner">
                <Link href="/data-explore" className="de-back-btn">
                  <BackArrowIcon />
                  Data Explore
                </Link>
                <div className="de-cat-hero-meta">
                  <span className="de-cat-hero-icon" style={{ color: cat.color }}>
                    {cat.icon}
                  </span>
                  <div>
                    <div className="section-eyebrow">Data Explore</div>
                    <h1 className="de-cat-hero-title">{cat.label}</h1>
                  </div>
                </div>
                <p className="de-cat-hero-desc">{cat.description}</p>
                <div className="de-cat-hero-stats">
                  <span className="de-cat-stat" style={{ color: cat.color }}>
                    {cat.items.length} records
                  </span>
                  <span className="de-cat-stat-divider">·</span>
                  <span className="de-cat-stat">{allTags.length} tags</span>
                </div>
              </div>
            </div>

            <div className="de-page-body">

              {/* ── Filter bar ── */}
              <div className="de-filter-bar">
                <div className="de-filter-search-wrap">
                  <span className="de-filter-search-icon"><SearchIcon /></span>
                  <input
                    className="de-filter-search"
                    type="search"
                    placeholder="Search within this category…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search data"
                  />
                </div>
                {filteredItems.length !== cat.items.length && (
                  <span className="de-filter-count">
                    Showing {filteredItems.length} / {cat.items.length} records
                  </span>
                )}
              </div>

              {/* ── Tags ── */}
              <div className="de-tags-bar">
                <button
                  className={`de-tag-filter-btn${activeTag === null ? ' active' : ''}`}
                  style={activeTag === null ? { background: cat.color, color: '#fff', borderColor: cat.color } : {}}
                  onClick={() => setActiveTag(null)}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={`de-tag-filter-btn${activeTag === tag ? ' active' : ''}`}
                    style={
                      activeTag === tag
                        ? { background: cat.color, color: '#fff', borderColor: cat.color }
                        : {}
                    }
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* ── Data Items ── */}
              <section className="de-section">
                {filteredItems.length === 0 ? (
                  <div className="de-empty">No results match the current filters</div>
                ) : (
                  <div className="de-items-list">
                    {filteredItems.map((item) => (
                      <DataItemCard key={item.id} item={item} accentColor={cat.color} />
                    ))}
                  </div>
                )}
              </section>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
