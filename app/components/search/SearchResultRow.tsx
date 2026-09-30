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
        <span className={`gsearch-item-badge gsearch-item-badge--${result.type}`}>
          {TYPE_LABELS[result.type][lang]}
        </span>
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
