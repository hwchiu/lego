/** Mock Elasticsearch search results for simulating the global search API. */

export type SearchDocType = 'news' | 'company' | 'event';

export interface SearchResultItem {
  doc_type: SearchDocType;
  co_cd: string;
  company_name: string;
  company_short_name: string;
  title: string;
  content: string;
  datetime: string;
  category: string;
  url: string;
  source: string;
  id: string;
}

export const MOCK_SEARCH_RESULTS: SearchResultItem[] = [
  // ── Companies ──────────────────────────────────────────────────────────────
];

function filterMockResults(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_SEARCH_RESULTS.filter((item) => {
    const fields = [
      item.co_cd,
      item.company_name,
      item.company_short_name,
      item.title,
      item.content,
      item.category,
    ];
    return fields.some((f) => f.toLowerCase().includes(q));
  });
}

/**
 * Get Elasticsearch results.
 * - When `NEXT_PUBLIC_ELSH_SEARCH_API` exists, request backend API.
 * - Otherwise fallback to local mock data.
 */
// Raw shape returned by the Spring Boot /api/v1/search endpoint
interface EsApiItem {
  id?: string;
  docType?: string;
  doc_type?: string;
  coCd?: string;
  co_cd?: string;
  companyName?: string;
  company_name?: string;
  companyShortName?: string;
  company_short_name?: string;
  title?: string;
  content?: string;
  date?: string;       // "YYYY-MM-DD"
  datetime?: string;
  category?: string;
  url?: string;
  source?: string;
}

function mapEsApiItem(item: EsApiItem): SearchResultItem {
  const rawDocType = (item.doc_type ?? item.docType ?? '').toLowerCase();
  const docType: SearchDocType =
    rawDocType === 'company' || rawDocType === 'event' || rawDocType === 'news'
      ? rawDocType
      : 'news';

  const rawDate = item.datetime ?? item.date ?? '';
  const datetime = rawDate && rawDate.includes('T') ? rawDate : (rawDate ? `${rawDate}T00:00:00` : '');

  return {
    id: item.id ?? '',
    doc_type: docType,
    co_cd: item.co_cd ?? item.coCd ?? '',
    company_name: item.company_name ?? item.companyName ?? '',
    company_short_name: item.company_short_name ?? item.companyShortName ?? '',
    title: item.title ?? '',
    content: item.content ?? '',
    datetime,
    category: item.category ?? '',
    url: item.url ?? '',
    source: item.source ?? 'elasticsearch',
  };
}

export async function getElshResult(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  // Note: NEXT_PUBLIC_* vars are injected at build time in Next.js (client usage).
  const apiUrl = process.env.NEXT_PUBLIC_ELSH_SEARCH_API?.trim();
  if (!apiUrl) {
    return filterMockResults(query);
  }

  try {
    const urlObj = /^https?:\/\//i.test(apiUrl)
      ? new URL(apiUrl)
      : new URL(apiUrl, window.location.origin);
    urlObj.searchParams.set('q', q);
    const res = await fetch(urlObj.toString(), { method: 'GET', cache: 'no-store' });
    if (!res.ok) return filterMockResults(query);

    const data = await res.json();

    // Spring Boot backend returns { results: EsApiItem[], total: number }
    const rawItems: EsApiItem[] | null =
      Array.isArray(data) ? data as EsApiItem[] :
      Array.isArray((data as { results?: unknown[] }).results) ? (data as { results: EsApiItem[] }).results :
      Array.isArray((data as { data?: unknown[] }).data) ? (data as { data: EsApiItem[] }).data :
      null;

    if (rawItems) return rawItems.map(mapEsApiItem);

    return filterMockResults(query);
  } catch {
    return filterMockResults(query);
  }
}
