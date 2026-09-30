/**
 * Pure, dependency-free search ranking/normalization/highlighting helpers.
 * Kept import-free (no path aliases) so it can be unit tested directly with
 * `node --test` without a bundler.
 */

export type SearchDocType = 'news' | 'company' | 'event';
export type SearchResultType = 'all' | SearchDocType;

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
