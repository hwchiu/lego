'use client';

import { useState, useMemo, useEffect } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { useLanguage } from '@/app/contexts/LanguageContext';
import {
  pressReleases,
  getPressReleaseArchiveGroups,
  type PressRelease,
  type PRArchiveGroup,
} from '@/app/data/pressReleases';

// ─── Company color palette ────────────────────────────────────────────────────

const TICKER_COLORS: Record<string, string> = {
  NVDA: '#76b900',
  AAPL: '#555555',
  ASML: '#0066cc',
  AMD: '#ed1c24',
  QCOM: '#3253dc',
  AVGO: '#cf0a2c',
  AMAT: '#003087',
  '2454.TW': '#ee1c2e',
  LRCX: '#003f7e',
  KLAC: '#0055a4',
  '8035.T': '#c8000b',
  TSM: '#1a2332',
  TC: '#1a2332',
};

function getTickerColor(ticker: string): string {
  return TICKER_COLORS[ticker] ?? '#374151';
}

function getTileInitials(ticker: string): string {
  return ticker.replace('.TW', '').replace('.T', '').slice(0, 4);
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M2 9L7 4L12 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandAllIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 5.5L7 7.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollapseAllIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 8.5L7 6.5L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 14 14" width="10" height="10" fill="none" aria-hidden="true">
      <path d="M1.5 1.5H7.5L12.5 6.5L7.5 11.5L1.5 6.5V1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="4.5" cy="4.5" r="1" fill="currentColor" />
    </svg>
  );
}

// ─── Archive Tile ─────────────────────────────────────────────────────────────

interface ArchiveTileProps {
  pr: PressRelease;
  lang: 'zh' | 'en';
}

function ArchiveTile({ pr, lang }: ArchiveTileProps) {
  const [y, m, d] = pr.publishedAt.split('-').map(Number);
  const dateUTC = new Date(Date.UTC(y, m - 1, d));
  const dateStr = dateUTC.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const color = getTickerColor(pr.ticker);
  const initials = getTileInitials(pr.ticker);

  return (
    <div className="pr-archive-tile">
      <div className="pr-archive-tile-media" style={{ background: color }}>
        <span className="pr-archive-tile-ticker">{initials}</span>
      </div>
      <div className="pr-archive-tile-info">
        <h3 className="pr-archive-tile-title">{pr.title}</h3>
        <p className="pr-archive-tile-desc">{pr.summary}</p>
        <div className="pr-archive-tile-footer">
          <span className={`pr-archive-tile-tag pr-archive-tile-tag--${pr.relationship}`}>
            <TagIcon />
            {pr.company}
          </span>
          <time className="pr-archive-tile-date" dateTime={pr.publishedAt}>{dateStr}</time>
        </div>
      </div>
    </div>
  );
}

// ─── Archive Group ────────────────────────────────────────────────────────────

interface ArchiveGroupProps {
  group: PRArchiveGroup;
  isExpanded: boolean;
  onToggle: () => void;
  lang: 'zh' | 'en';
}

const GROUP_TYPE_LABELS: Record<string, { zh: string; en: string }> = {
  day:   { zh: '日', en: 'Daily' },
  week:  { zh: '週', en: 'Weekly' },
  month: { zh: '月', en: 'Monthly' },
};

function ArchiveGroup({ group, isExpanded, onToggle, lang }: ArchiveGroupProps) {
  const typeBadge = GROUP_TYPE_LABELS[group.type]?.[lang] ?? group.type;
  const articleWord = group.items.length === 1
    ? (lang === 'en' ? 'article' : '篇')
    : (lang === 'en' ? 'articles' : '篇');

  return (
    <section className="pr-archive-group" aria-label={group.label}>
      <div
        className="pr-archive-group-header"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } }}
        aria-expanded={isExpanded}
      >
        <span className={`pr-archive-group-type-badge pr-archive-group-type-badge--${group.type}`}>
          {typeBadge}
        </span>
        <span className="pr-archive-group-label">{group.label}</span>
        <span className="pr-archive-group-count">
          {group.items.length} {articleWord}
        </span>
        <span className="pr-archive-group-toggle" aria-hidden="true">
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </span>
      </div>

      <div className={`pr-archive-group-body${isExpanded ? ' expanded' : ''}`}>
        {isExpanded && (
          <div className="pr-archive-tiles">
            {group.items.map((pr) => (
              <ArchiveTile key={pr.id} pr={pr} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PressReleasePage() {
  const { lang } = useLanguage();

  const groups = useMemo(
    () => getPressReleaseArchiveGroups(pressReleases, lang),
    [lang],
  );

  // Expand first 3 groups by default (most recent)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initial = new Set(groups.slice(0, 3).map((g) => g.key));
    setExpandedKeys(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allExpanded = groups.length > 0 && expandedKeys.size >= groups.length;

  function handleToggleGroup(key: string) {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleToggleAll() {
    if (allExpanded) {
      setExpandedKeys(new Set());
    } else {
      setExpandedKeys(new Set(groups.map((g) => g.key)));
    }
  }

  const labels = {
    eyebrow:     { zh: 'Press Release', en: 'Press Release' },
    total:       { zh: `共 ${pressReleases.length} 篇`, en: `${pressReleases.length} articles` },
    expandAll:   { zh: '展開全部', en: 'Expand All' },
    collapseAll: { zh: '收合全部', en: 'Collapse All' },
  };

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="pr-archive-page">
              {/* Page header */}
              <div className="pr-archive-header">
                <div className="pr-archive-header-left">
                  <span className="section-eyebrow">{labels.eyebrow[lang]}</span>
                  <span className="pr-archive-total">{labels.total[lang]}</span>
                </div>
                <div className="pr-archive-header-right">
                  <button
                    className="pr-archive-expand-btn"
                    onClick={handleToggleAll}
                    title={allExpanded ? labels.collapseAll[lang] : labels.expandAll[lang]}
                  >
                    {allExpanded ? <CollapseAllIcon /> : <ExpandAllIcon />}
                    <span>{allExpanded ? labels.collapseAll[lang] : labels.expandAll[lang]}</span>
                  </button>
                </div>
              </div>

              {/* Archive groups */}
              <div className="pr-archive-groups">
                {groups.map((group) => (
                  <ArchiveGroup
                    key={group.key}
                    group={group}
                    isExpanded={expandedKeys.has(group.key)}
                    onToggle={() => handleToggleGroup(group.key)}
                    lang={lang}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
