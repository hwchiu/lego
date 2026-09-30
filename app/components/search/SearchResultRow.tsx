'use client';

import Link from 'next/link';
import type { NormalizedSearchResult, SearchResultType } from '@/app/lib/globalSearch';
import { splitHighlightSegments } from '@/app/lib/globalSearch';

interface SearchResultRowProps {
  result: NormalizedSearchResult;
  query: string;
  lang: 'zh' | 'en';
}

const TYPE_LABELS: Record<Exclude<SearchResultType, 'all'>, { zh: string; en: string }> = {
  company: { zh: '公司', en: 'COMPANY' },
  event: { zh: '活動', en: 'EVENT' },
  news: { zh: '新聞', en: 'NEWS' },
  'analyst-report': { zh: '分析師報告', en: 'ANALYST REPORT' },
  'ai-news': { zh: 'AI 新聞', en: 'AI NEWS' },
  transcript: { zh: '逐字稿', en: 'TRANSCRIPT' },
};

function Highlighted({ text, query }: { text: string; query: string }) {
  const segments = splitHighlightSegments(text, query);
  return (
    <>
      {segments.map((seg, i) =>
        seg.match ? (
          <mark key={i} className="gsearch-highlight">{seg.text}</mark>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

function ArrowIcon() {
  return (
    <svg className="gsearch-item-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchTypeIcon({ type, label }: { type: NormalizedSearchResult['type']; label: string }) {
  const className = `gsearch-item-type-icon wl-feed-avatar wl-feed-avatar--${type}`;

  if (type === 'event') {
    return (
      <span className={className} role="img" aria-label={label}>
        <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
          <circle cx="14" cy="14" r="14" fill="#fef3c7" />
          <rect x="8" y="9" width="12" height="11" rx="1.5" stroke="#d97706" strokeWidth="1.4" />
          <path d="M11 9V7M17 9V7M8 12h12" stroke="#d97706" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (type === 'news' || type === 'ai-news') {
    const color = type === 'ai-news' ? '#2563eb' : '#16a34a';
    const background = type === 'ai-news' ? '#dbeafe' : '#dcfce7';
    return (
      <span className={className} role="img" aria-label={label}>
        <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
          <circle cx="14" cy="14" r="14" fill={background} />
          <rect x="8" y="8" width="12" height="12" rx="1.5" stroke={color} strokeWidth="1.4" />
          <path d="M10 11h8M10 14h8M10 16.5h5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (type === 'analyst-report') {
    return (
      <span className={`${className} wl-feed-avatar--pr`} role="img" aria-label={label}>
        <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
          <circle cx="14" cy="14" r="14" fill="#f3e8ff" />
          <path d="M8 14.2V10.1c0-.7.57-1.2 1.2-1.2h1.4l5.4-2.4c.8-.35 1.7.23 1.7 1.1v9.2c0 .87-.9 1.45-1.7 1.1l-5.4-2.4H9.2c-.63 0-1.2-.5-1.2-1.2Z" stroke="#7c3aed" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M10.6 15.5L11.9 19M19 10.2a2.8 2.8 0 0 1 0 5.6" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  if (type === 'transcript') {
    return (
      <span className={className} role="img" aria-label={label}>
        <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
          <circle cx="14" cy="14" r="14" fill="#e0f2fe" />
          <path d="M9 8.5h10v8H14l-3.5 3v-3H9v-8Z" stroke="#0284c7" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M11 11.5h6M11 14h4" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </span>
    );
  }

  return (
    <span className={className} role="img" aria-label={label}>
      <svg viewBox="0 0 28 28" fill="none" width="28" height="28" aria-hidden="true">
        <circle cx="14" cy="14" r="14" fill="#e5e7eb" />
        <path d="M8 20V10l6-3 6 3v10M11 12h1M16 12h1M11 15h1M16 15h1M13 20v-3h2v3" stroke="#4b5563" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function formatDate(datetime: string, lang: 'zh' | 'en'): string {
  if (!datetime) return '';
  const d = new Date(datetime);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function SearchResultRow({ result, query, lang }: SearchResultRowProps) {
  const isExternal = /^https?:\/\//i.test(result.url) && !result.url.startsWith('/');
  const dateStr = formatDate(result.date, lang);
  const isTaxonomy = result.type === 'company';

  const content = (
    <>
      <div className="gsearch-item-main">
        <SearchTypeIcon type={result.type} label={TYPE_LABELS[result.type][lang]} />
        <div className="gsearch-item-body">
          <div className="gsearch-item-title">
            <Highlighted text={result.title} query={query} />
          </div>
          {result.description && (
            <div className="gsearch-item-desc">
              <Highlighted text={result.description} query={query} />
            </div>
          )}
          <div className="gsearch-item-meta">
            {result.tags.map((tag) => (
              <span key={tag} className="news-tag gsearch-item-tag">{tag}</span>
            ))}
            {result.category && <span className="gsearch-item-category">{result.category}</span>}
            {dateStr && <span className="gsearch-item-date">{dateStr}</span>}
          </div>
        </div>
      </div>
      <ArrowIcon />
    </>
  );

  if (isTaxonomy || !isExternal) {
    return (
      <Link href={result.url} className="gsearch-item">
        {content}
      </Link>
    );
  }

  return (
    <a href={result.url} target="_blank" rel="noopener noreferrer" className="gsearch-item">
      {content}
    </a>
  );
}
