/**
 * Shared Global Search abstraction.
 *
 * Both the header quick-search dropdown (TopNav) and the full Search Results
 * Page (`/search`) read from the same underlying index via `getElshResult`.
 * This module adds normalization, relevance ranking and type-filtering on
 * top of that shared data source so the two surfaces never diverge.
 */
import { getElshResult, type SearchResultItem } from '@/app/data/searchMockData';
import { COMPANY_MASTER_DATA } from '@/app/data/companyMaster';
import { CATEGORIES } from '@/app/data/dataExplore';
import {
  PROFILE_TABS,
  profileTabResults,
  dataExploreResults,
  normalizeResultUrl,
  filterResultsByType,
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
export const SEARCH_DATA_EXPLORE_CATEGORIES = ['news-summary', 'capital-markets'] as const;

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
    type: item.doc_type === 'transcript' ? 'ir-transcript' : item.doc_type,
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

const SEARCH_TYPES: SearchResultType[] = ['all', 'company', 'event', 'news', 'analyst-report', 'ai-news', ...PROFILE_TABS.map(([type]) => type), 'data-explore'];
const EMPTY_COUNTS = Object.fromEntries(SEARCH_TYPES.map((type) => [type, 0])) as Record<SearchResultType, number>;

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
  const ranked = [
    ...raw.map(normalize),
    ...profileTabResults(COMPANY_MASTER_DATA, query),
    ...dataExploreResults(CATEGORIES, SEARCH_DATA_EXPLORE_CATEGORIES, query),
  ]
    .map((r) => ({ ...r, score: scoreResult(r, query) }))
    .sort((a, b) => b.score - a.score || (b.date || '').localeCompare(a.date || ''));

  const counts = { ...EMPTY_COUNTS };
  for (const result of ranked) {
    counts.all++;
    counts[result.type]++;
  }

  const filtered = filterResultsByType(ranked, options.type ?? 'all');

  const offset = options.offset ?? 0;
  const limit = options.limit ?? filtered.length;

  return {
    results: filtered.slice(offset, offset + limit),
    total: filtered.length,
    counts,
  };
}
