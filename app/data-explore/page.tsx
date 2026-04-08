'use client';

import { useState, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { CATEGORIES, DataItem } from '@/app/data/dataExplore';

// ── helpers ────────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function getAllItems(): (DataItem & { categorySlug: string; categoryLabel: string })[] {
  return CATEGORIES.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categorySlug: cat.slug,
      categoryLabel: cat.label,
    })),
  );
}

// ── sub-components ─────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" width="18" height="18" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path
        d="M5 3l6 5-6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CategoryCardProps {
  slug: string;
  label: string;
  icon: ReactNode;
  color: string;
  description: string;
  count: number;
}

function CategoryCard({ slug, label, icon, color, description, count }: CategoryCardProps) {
  return (
    <Link href={`/data-explore/${slug}`} className="de-category-card">
      <div className="de-category-card-icon" style={{ color }}>
        {icon}
      </div>
      <div className="de-category-card-body">
        <div className="de-category-card-label">{label}</div>
        <div className="de-category-card-desc">{description}</div>
        <div className="de-category-card-footer">
          <span className="de-category-card-count" style={{ color: 'var(--c-text-2)' }}>{count} records</span>
          <span className="de-category-card-arrow"><ArrowIcon /></span>
        </div>
      </div>
    </Link>
  );
}

interface RecentItemCardProps {
  item: DataItem & { categorySlug: string; categoryLabel: string };
}

function RecentItemCard({ item }: RecentItemCardProps) {
  const cat = CATEGORIES.find((c) => c.slug === item.categorySlug);
  return (
    <article className="de-recent-card">
      <div className="de-recent-card-header">
        <span
          className="de-recent-card-cat"
          style={{ background: cat ? `${cat.color}18` : '#f3f4f6', color: cat?.color ?? '#374151' }}
        >
          {item.categoryLabel}
        </span>
        <span className="de-recent-card-date">{formatDate(item.date)}</span>
      </div>
      <div className="de-recent-card-title">{item.title}</div>
      <div className="de-recent-card-summary">{item.summary}</div>
      <div className="de-recent-card-tags">
        {item.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="de-tag">{tag}</span>
        ))}
      </div>
      <div className="de-recent-card-source">
        <span className="de-recent-card-source-label">Source: </span>
        {item.url && item.url !== '#' ? (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="de-recent-card-source-link">
            {item.source}
          </a>
        ) : (
          <span className="de-recent-card-source-text">{item.source}</span>
        )}
      </div>
    </article>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function DataExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const allItems = useMemo(() => getAllItems(), []);

  const recentItems = useMemo(() => {
    const sorted = [...allItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (!searchQuery.trim()) return sorted.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return sorted
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          item.categoryLabel.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [allItems, searchQuery]);

  const totalCount = allItems.length;

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="de-page">

            {/* ── Hero ── */}
            <div className="de-hero">
              <div className="de-hero-inner">
                <div className="section-eyebrow">Data Explore</div>
                <h1 className="de-hero-title">Data Explore</h1>
                <p className="de-hero-sub">
                  Curated intelligence on T Company and its supply chain ecosystem, covering ESG, regulatory policy,
                  international standards, industry trends, company operations, and capital markets —{' '}
                  <strong>{totalCount}</strong> selected records.
                </p>
                <div className="de-hero-search-wrap">
                  <span className="de-hero-search-icon"><SearchIcon /></span>
                  <input
                    className="de-hero-search"
                    type="search"
                    placeholder="Search by title, tag, or category…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search data"
                  />
                </div>
              </div>
            </div>

            <div className="de-page-body">

              {/* ── Categories ── */}
              {!searchQuery.trim() && (
                <section className="de-section">
                  <div className="de-section-header">
                    <h2 className="de-section-title">Categories</h2>
                    <span className="de-section-sub">Browse all data by category</span>
                  </div>
                  <div className="de-categories-grid">
                    {CATEGORIES.map((cat) => (
                      <CategoryCard
                        key={cat.slug}
                        slug={cat.slug}
                        label={cat.label}
                        icon={cat.icon}
                        color={cat.color}
                        description={cat.description}
                        count={cat.items.length}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ── Recent / Search Results ── */}
              <section className="de-section">
                <div className="de-section-header">
                  <h2 className="de-section-title">
                    {searchQuery.trim() ? `Search results: "${searchQuery}"` : 'Latest Data'}
                  </h2>
                  {searchQuery.trim() && (
                    <span className="de-section-sub">{recentItems.length} results found</span>
                  )}
                </div>
                {recentItems.length === 0 ? (
                  <div className="de-empty">No results found for &ldquo;{searchQuery}&rdquo;</div>
                ) : (
                  <div className="de-recent-grid">
                    {recentItems.map((item) => (
                      <RecentItemCard key={item.id} item={item} />
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
