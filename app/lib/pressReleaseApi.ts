import { z } from 'zod';
import { apiFetch, ApiError } from './apiClient';
import { BASE_PATH } from './basePath';

// ─── Zod Schema (Runtime validation) ─────────────────────────────────────────

export const PressReleaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  ticker: z.string(),
  relationship: z.enum(['customer', 'supplier']),
  industry: z.string(),
  topics: z.array(z.string()),
  trendingTopics: z.array(z.string()),
  publishedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format in press release data'),
  summary: z.string(),
  viewCount: z.number(),
  url: z.string(),
});

export const PressReleaseListSchema = z.array(PressReleaseSchema);

export type PressRelease = z.infer<typeof PressReleaseSchema>;

// ─── Pagination types ─────────────────────────────────────────────────────────

export const PAGE_SIZE = 12;

export interface PressReleasePage {
  items: PressRelease[];
  total: number;
  offset: number;
  hasMore: boolean;
}

// ─── In-memory cache ──────────────────────────────────────────────────────────
// The full sorted list is fetched once and cached for the lifetime of the page.

let _cache: PressRelease[] | null = null;

async function loadAll(signal?: AbortSignal): Promise<PressRelease[]> {
  if (_cache !== null) return _cache;

  const basePath = BASE_PATH;
  const url = `${basePath}/data/press-releases.json`;
  const raw = await apiFetch<unknown>(url, { signal });

  const parsed = PressReleaseListSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError(
      `Press release data validation failed: ${parsed.error.issues.map((i) => i.message).join('; ')}`,
    );
  }

  // Already sorted newest-first by the build script; normalise to be safe
  _cache = parsed.data.slice().sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return _cache;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch a page of press releases sorted newest-first.
 *
 * @param offset  Zero-based start index (default 0)
 * @param limit   Number of items to return (default PAGE_SIZE)
 * @param tickers Optional list of ticker symbols to filter by
 * @param signal  Optional AbortSignal for cancellation
 */
export async function getPressReleases(
  offset = 0,
  limit = PAGE_SIZE,
  tickers: string[] = [],
  signal?: AbortSignal,
): Promise<PressReleasePage> {
  const all = await loadAll(signal);

  const filtered =
    tickers.length > 0
      ? all.filter((pr) => tickers.includes(pr.ticker))
      : all;

  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    total: filtered.length,
    offset,
    hasMore: offset + items.length < filtered.length,
  };
}

/** Clear the in-memory cache (useful for testing). */
export function clearPressReleaseCache(): void {
  _cache = null;
}
