'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { CATEGORIES } from '@/app/data/dataExplore';

// ── sub-components ─────────────────────────────────────────────────────────────

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
  released: boolean;
}

function CategoryCard({ slug, label, icon, color, description, released }: CategoryCardProps) {
  if (released) {
    return (
      <Link href={`/data-explore/${slug}`} className="de-category-card">
        <div className="de-category-card-icon" style={{ color }}>
          {icon}
        </div>
        <div className="de-category-card-body">
          <div className="de-category-card-label">{label}</div>
          <div className="de-category-card-desc">{description}</div>
          <div className="de-category-card-footer">
            <span className="de-category-card-arrow"><ArrowIcon /></span>
          </div>
        </div>
      </Link>
    );
  }
  return (
    <div className="de-category-card de-category-card--unreleased">
      <div className="de-category-card-icon" style={{ color }}>
        {icon}
      </div>
      <div className="de-category-card-body">
        <div className="de-category-card-label">{label}</div>
        <div className="de-category-card-desc">{description}</div>
        <div className="de-category-card-footer">
          <span className="de-category-card-arrow" style={{ opacity: 0 }}><ArrowIcon /></span>
        </div>
      </div>
      {/* frosted-glass coming-soon overlay */}
      <div className="de-coming-soon-overlay" aria-hidden="true">
        <svg className="de-coming-soon-lock" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="16" r="1.2" fill="currentColor" />
        </svg>
        <span className="de-coming-soon-label">Coming Soon</span>
      </div>
    </div>
  );
}

// ── page ───────────────────────────────────────────────────────────────────────

export default function DataExplorePage() {
  const totalCount = CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);

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
              <div className="de-hero-overlay" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <div className="de-hero-img-wrap">
                <img
                  src="https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=900&q=80"
                  alt=""
                  className="de-hero-img"
                  aria-hidden="true"
                />
              </div>
              <div className="de-hero-inner">
                <div className="section-eyebrow">Data Explore</div>
                <h1 className="de-hero-title">Data Explore</h1>
                <p className="de-hero-sub">
                  Curated intelligence on TSMC and its supply chain ecosystem, covering ESG, regulatory policy,
                  international standards, industry trends, company operations, and capital markets —{' '}
                  <strong>{totalCount}</strong> selected records.
                </p>
              </div>
            </div>

            <div className="de-page-body">

              {/* ── Categories ── */}
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
                      released={cat.slug === 'news-summary'}
                    />
                  ))}
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
