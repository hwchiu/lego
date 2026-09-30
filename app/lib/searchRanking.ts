/**
 * Pure, dependency-free search ranking/normalization/highlighting helpers.
 * Kept import-free (no path aliases) so it can be unit tested directly with
 * `node --test` without a bundler.
 */

export const PROFILE_TABS = [
  ['fin-summary', 'FIN. Summary', 'IS_FIN_ALIVE'],
  ['fin-statement', 'FIN. Statement', 'IS_FIN_ALIVE'],
  ['ir-transcript', 'IR Transcript', 'IS_TRANSCRIPT_ALIVE'],
  ['ai-transcript', 'AI Transcript', 'IS_AI_TRANSCRIPT_ALIVE'],
  ['pre-earning-call', 'Pre-Earning Call', 'IS_PRE_EARNING_CALL'],
  ['ir-material', 'IR Material', 'IS_IR_ALIVE'],
  ['investment', 'Investment', 'IS_INVEST_ALIVE'],
  ['acquisition', 'Acquisition', 'IS_ACQ_ALIVE'],
  ['funding', 'Funding', 'IS_FUND_ALIVE'],
] as const;

export type ProfileTabType = (typeof PROFILE_TABS)[number][0];
export type SearchDocType = 'news' | 'company' | 'event' | 'analyst-report' | 'ai-news' | 'data-explore' | ProfileTabType;
export type SearchResultType = 'all' | SearchDocType;
export type SearchTimePeriod = 'all' | 'day' | 'week' | 'month' | 'year';

export interface NormalizedSearchResult {
  id: string;
  type: SearchDocType;
  title: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  date: string;
  source: string;
  score: number;
}

interface SearchCompany {
  CO_CD: string;
  CO_NAME: string;
  CO_SHORT_NAME: string;
  IS_FIN_ALIVE: 'Y' | 'N';
  IS_TRANSCRIPT_ALIVE: 'Y' | 'N';
  IS_AI_TRANSCRIPT_ALIVE: 'Y' | 'N';
  IS_PRE_EARNING_CALL: 'Y' | 'N';
  IS_IR_ALIVE: 'Y' | 'N';
  IS_INVEST_ALIVE: 'Y' | 'N';
  IS_ACQ_ALIVE: 'Y' | 'N';
  IS_FUND_ALIVE: 'Y' | 'N';
}

interface SearchCategory {
  slug: string;
  label: string;
  items: { id: string; title: string; summary: string; tags: string[]; source: string; date: string }[];
}

export function profileTabResults(companies: SearchCompany[], query: string): NormalizedSearchResult[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [];
  return companies.flatMap((company) => {
    if (![company.CO_CD, company.CO_NAME, company.CO_SHORT_NAME].some((value) => value.toLocaleLowerCase().includes(q))) return [];
    return PROFILE_TABS.filter(([, , flag]) => company[flag] === 'Y').map(([type, tab]) => ({
      id: `${company.CO_CD}:${type}`,
      type,
      title: `${company.CO_SHORT_NAME || company.CO_NAME} — ${tab}`,
      description: company.CO_NAME,
      url: `/company-profile/${encodeURIComponent(company.CO_CD)}/?tab=${encodeURIComponent(tab)}`,
      tags: [company.CO_CD],
      category: tab,
      date: '',
      source: '',
      score: 0,
    }));
  });
}

export function dataExploreResults(categories: SearchCategory[], enabledSlugs: readonly string[], query: string): NormalizedSearchResult[] {
  const q = query.trim().toLocaleLowerCase();
  if (!q) return [];
  return categories.filter(({ slug }) => enabledSlugs.includes(slug)).flatMap((category) =>
    category.items.filter((item) =>
      [item.title, item.summary, ...item.tags].some((value) => value.toLocaleLowerCase().includes(q)),
    ).map((item) => ({
      id: `${category.slug}:${item.id}`,
      type: 'data-explore' as const,
      title: item.title,
      description: item.summary,
      url: `/data-explore/${category.slug}/`,
      tags: item.tags,
      category: category.label,
      date: item.date,
      source: item.source,
      score: 0,
    })),
  );
}

const SEARCH_PERIOD_MS: Record<Exclude<SearchTimePeriod, 'all'>, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  year: 365 * 24 * 60 * 60 * 1000,
};

export function filterResultsByPeriod(
  results: NormalizedSearchResult[],
  period: SearchTimePeriod,
  now = Date.now(),
): NormalizedSearchResult[] {
  if (period === 'all') return results;

  const cutoff = now - SEARCH_PERIOD_MS[period];
  return results.filter((result) => {
    if (!result.date) return true;
    const timestamp = Date.parse(result.date);
    return Number.isFinite(timestamp) && timestamp >= cutoff;
  });
}

export function filterResultsByType(
  results: NormalizedSearchResult[],
  type: SearchResultType,
): NormalizedSearchResult[] {
  return type === 'all' ? results : results.filter((result) => result.type === type);
}

export function paginateResults(
  results: NormalizedSearchResult[],
  page: number,
  pageSize: number,
): NormalizedSearchResult[] {
  const start = page * pageSize;
  return results.slice(start, start + pageSize);
}

// Matches protocol-less domain strings (e.g. "example.com/path") so external
// URLs stored without a scheme still resolve to a valid absolute link.
const DOMAIN_LIKE_URL_PATTERN = /^[^/\s?#]+\.[^/\s?#]+(?:[/?#]|$)/;

export function normalizeResultUrl(url: string): string {
  const value = url.trim();
  if (!value) return '#';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `https:${value}`;
  if (DOMAIN_LIKE_URL_PATTERN.test(value)) return `https://${value}`;
  return value;
}

/**
 * Relevance ranking, highest first:
 * 1. Exact title match      2. Title prefix match     3. Title contains query
 * 4. Tag exact match        5. Category exact match   6. Description contains query
 * A small base score keeps items that only matched on a raw field (e.g. ticker)
 * already filtered upstream by the search index.
 */
export function scoreResult(result: NormalizedSearchResult, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = result.title.toLowerCase();
  let score = 10; // base: already matched somewhere upstream

  if (title === q) score += 1000;
  else if (title.startsWith(q)) score += 500;
  else if (title.includes(q)) score += 250;

  if (result.tags.some((t) => t.toLowerCase() === q)) score += 150;
  if (result.category.toLowerCase() === q) score += 120;
  if (result.description.toLowerCase().includes(q)) score += 60;

  return score;
}

/** Splits `text` into plain/highlighted segments for safe (non-HTML) rendering. */
export function splitHighlightSegments(text: string, query: string): { text: string; match: boolean }[] {
  const q = query.trim();
  if (!q || !text) return [{ text, match: false }];

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(${escaped})`, 'ig');
  const parts = text.split(pattern);
  if (parts.length === 1) return [{ text, match: false }];

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({ text: part, match: part.toLowerCase() === q.toLowerCase() }));
}
