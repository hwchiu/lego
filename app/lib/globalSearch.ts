/**
 * Shared Global Search abstraction.
 *
 * Both the header quick-search dropdown (TopNav) and the full Search Results
 * Page (`/search`) read from the same underlying index via `getElshResult`.
 * This module adds normalization, relevance ranking and type-filtering on
 * top of that shared data source so the two surfaces never diverge.
 */
import { getElshResult, type SearchResultItem } from '@/app/data/searchMockData';
import {
  normalizeResultUrl,
  scoreResult,
  splitHighlightSegments,
  type NormalizedSearchResult,
  type SearchResultType,
} from '@/app/lib/searchRanking';

export type { NormalizedSearchResult, SearchResultType };
export { normalizeResultUrl, splitHighlightSegments };

export interface SearchOptions {
  query: string;
  type?: SearchResultType;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  results: NormalizedSearchResult[];
  total: number;
  /** Counts per type, computed over the full (unpaginated) match set for the query. */
  counts: Record<SearchResultType, number>;
}

/** Popular searches shown in the header dropdown and the empty-query discovery state. */
export const POPULAR_SEARCHES = ['INTC', 'AAPL', 'NVDA'];

function normalize(item: SearchResultItem): NormalizedSearchResult {
  if (item.doc_type === 'company') {
    const symbol = item.co_cd.trim().toUpperCase();
    const title = (item.company_name || item.company_short_name || symbol).trim();
    return {
      id: item.id || `company_${symbol}`,
      type: 'company',
      title,
      description: '',
      url: `/company-profile/${symbol}/`,
      tags: [item.company_short_name].filter(Boolean),
      category: '',
      date: '',
      source: '',
      score: 0,
    };
  }

  return {
    id: item.id,
    type: item.doc_type,
    title: item.title,
    description: item.content,
    url: normalizeResultUrl(item.url),
    tags: [item.company_short_name].filter(Boolean),
    category: item.category,
    date: item.datetime,
    source: item.source,
    score: 0,
  };
}

const EMPTY_COUNTS: Record<SearchResultType, number> = { all: 0, company: 0, event: 0, news: 0 };

/**
 * Conceptually `search({ query, type, limit, offset })`, backed by the same
 * index (`getElshResult`) that powers the header quick-search dropdown.
 */
export async function search(options: SearchOptions): Promise<SearchResponse> {
  const query = options.query.trim();
  if (!query) {
    return { results: [], total: 0, counts: { ...EMPTY_COUNTS } };
  }

  const raw = await getElshResult(query);
  const ranked = raw
    .map(normalize)
    .map((r) => ({ ...r, score: scoreResult(r, query) }))
    .sort((a, b) => b.score - a.score || (b.date || '').localeCompare(a.date || ''));

  const counts: Record<SearchResultType, number> = {
    all: ranked.length,
    company: ranked.filter((r) => r.type === 'company').length,
    event: ranked.filter((r) => r.type === 'event').length,
    news: ranked.filter((r) => r.type === 'news').length,
  };

  const filtered = !options.type || options.type === 'all'
    ? ranked
    : ranked.filter((r) => r.type === options.type);

  const offset = options.offset ?? 0;
  const limit = options.limit ?? filtered.length;

  return {
    results: filtered.slice(offset, offset + limit),
    total: filtered.length,
    counts,
  };
}
