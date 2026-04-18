/**
 * Watchlist API stubs
 *
 * These functions serve as integration-ready stubs for the Watchlist feature.
 * Each function currently returns mock/local data, but accepts the same
 * parameters the real backend API will expect so that integration is seamless.
 */

import { newsItems } from '@/app/data/news';
import type { NewsItem } from '@/app/data/news';
import { getEventCalendarSummary } from '@/app/lib/eventCalendarApi';
import type { EventCalendarSummaryItem } from '@/app/lib/eventCalendarApi';
import { getFavoritesByUserAcct } from '@/app/lib/getFavoritesByUserAcct';
import { watchlistColumnCatalog } from '@/app/data/watchlistColumns';
import type { WatchlistColumnCatalog } from '@/app/data/watchlistColumns';
import { holdingsData as holdingsDataMap, holdingsDataQ4_2025 } from '@/app/data/watchlistData';
import type { HoldingEntity } from '@/app/data/watchlistData';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ColumnMeta {
  id: string;
  label: string;
  type: string;
  format?: string;
  align: string;
  sortable: boolean;
}

export interface SummaryDataResponse {
  viewName: string;
  columns: ColumnMeta[];
  data: Record<string, unknown>[];
}

export interface ViewCategoryInfo {
  id: string;
  label: string;
  columns: ColumnMeta[];
}

export interface ViewCatgNColInfoResponse {
  categories: ViewCategoryInfo[];
}

export interface EventInfoItem {
  eventId: string;
  company: string;
  ticker: string;
  eventType: string;
  eventDatetime: string;
  description: string;
  fiscalYear: string;
  fiscalQuarter: string;
}

// ─── Calendar year / quarter generation ─────────────────────────────────────

/**
 * Build year and quarter lists (requirement #7).
 * Exported for pages that need year/quarter selection data (e.g. financial data filters).
 * calendar_year: current year backwards for 8 years.
 * calendar_quarter: Q1–Q4 + NA.
 */
export function buildCalendarYearQuarter(): {
  calendar_year: string[];
  calendar_quarter: string[];
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const years: string[] = [];
  for (let i = 0; i < 8; i++) {
    years.push(String(currentYear - i));
  }
  return {
    calendar_year: years,
    calendar_quarter: ['Q1', 'Q2', 'Q3', 'Q4', 'NA'],
  };
}

/**
 * Build last 8 quarter options from the current date backwards.
 * E.g. if now is 2026 Q1 → [2026 Q1, 2025 Q4, 2025 Q3, ..., 2024 Q2]
 */
export function buildRecentQuarters(): { year: number; q: number }[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentQ = Math.ceil(currentMonth / 3); // 1-4

  const quarters: { year: number; q: number }[] = [];
  let y = currentYear;
  let q = currentQ;
  for (let i = 0; i < 8; i++) {
    quarters.push({ year: y, q });
    q--;
    if (q < 1) {
      q = 4;
      y--;
    }
  }
  return quarters;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Get the list of favourite company codes for a user account.
 * Delegates to the existing getFavoritesByUserAcct implementation.
 */
export function getFavoritesListByUserAcct(userAcct: string): string[] {
  return getFavoritesByUserAcct(userAcct);
}

/**
 * Get the company list for a specific user-created watchlist.
 * Currently reads from localStorage (WatchlistContext persisted data).
 * Will be replaced with a backend call.
 */
export function getCompListByWatchlistId(
  _userAcct: string,
  _watchlistId: string,
): string[] {
  // Stub: actual data is already managed by WatchlistContext.
  // This function exists as an API integration point.
  if (typeof window === 'undefined') return [];
  try {
    const ordersRaw = localStorage.getItem('wl-orders');
    if (!ordersRaw) return [];
    const orders = JSON.parse(ordersRaw) as Record<string, string[]>;
    return orders[_watchlistId] ?? [];
  } catch {
    return [];
  }
}

/**
 * Convert the existing HoldingEntity data into the new unified API response
 * format with column metadata and row data.
 */
function toColumnMeta(id: string, label: string, type: string, format?: string, align = 'right'): ColumnMeta {
  return { id, label, type, format, align, sortable: true };
}

const SUMMARY_COLUMNS: ColumnMeta[] = [
  toColumnMeta('company', 'Company', 'string', undefined, 'left'),
  toColumnMeta('revenue', 'Revenue', 'currency', '$0.00B'),
  toColumnMeta('revenueQoQ', 'Revenue QoQ', 'percentage', '+0.0%'),
  toColumnMeta('revenueYoY', 'Revenue YoY', 'percentage', '+0.0%'),
  toColumnMeta('grossMargin', 'Gross Margin', 'percentage', '0.0%'),
  toColumnMeta('doi', 'DOI', 'string'),
  toColumnMeta('nextEarningRelease', 'Next Earning Release', 'string'),
  toColumnMeta('lastQtrRevenue', 'Last Qtr Revenue', 'currency', '$0.00B'),
  toColumnMeta('lastQtrGrossMargin', 'Last Qtr Gross Margin', 'percentage', '0.0%'),
  toColumnMeta('lastQtrDOI', 'Last Qtr DOI', 'string'),
];

function holdingToRow(h: HoldingEntity): Record<string, unknown> {
  return {
    company: h.symbol,
    revenue: h.revenue,
    revenueQoQ: h.revenueQoQ === 'N/A' ? null : h.revenueQoQ,
    revenueYoY: h.revenueYoY === 'N/A' ? null : h.revenueYoY,
    grossMargin: h.grossMargin,
    doi: h.doi === 'N/A' ? null : h.doi,
    nextEarningRelease: h.nextEarning,
    lastQtrRevenue: h.lastQtrRevenue === 'N/A' ? null : h.lastQtrRevenue,
    lastQtrGrossMargin: h.lastQtrGrossMargin === 'N/A' ? null : h.lastQtrGrossMargin,
    lastQtrDOI: h.lastQtrDOI === 'N/A' ? null : h.lastQtrDOI,
  };
}

/**
 * Get Summary tab data for a list of companies.
 * Returns the standard view-name + columns + data response format.
 */
export function getSummaryDataByCompList(
  companyList: string[],
  quarterKey?: string,
): SummaryDataResponse {
  const isQ4 = quarterKey === '2025-Q4';
  const source = isQ4 ? holdingsDataQ4_2025 : holdingsDataMap;
  const data = companyList
    .filter((sym) => source[sym])
    .map((sym) => holdingToRow(source[sym]));

  return {
    viewName: 'Summary',
    columns: SUMMARY_COLUMNS,
    data,
  };
}

/**
 * Get custom view tab data for a list of companies.
 * Uses the same response format as getSummaryDataByCompList.
 */
export function getTableInfoByCompListNViewId(
  companyList: string[],
  _viewId: string,
  quarterKey?: string,
): SummaryDataResponse {
  // Stub — returns the same Summary structure as a placeholder.
  // When the backend is ready, viewId will select the right column set.
  return getSummaryDataByCompList(companyList, quarterKey);
}

/**
 * Get news items filtered by a list of company tickers.
 * Uses the existing newsItems data (PR#232 "模式 A" pattern — data is
 * imported from TS modules which read from markdown/JSON via parseContent).
 */
export function getNewsInfoByCompanyList(companyList: string[]): NewsItem[] {
  const companySet = new Set(companyList);
  return newsItems.filter((item) =>
    item.tags.some((tag) => companySet.has(tag.symbol)),
  );
}

/**
 * Get event info filtered by a list of company tickers.
 * Uses the eventCalendarApi module to read from static JSON data.
 */
export async function getEventInfoByCompanyList(
  companyList: string[],
): Promise<EventInfoItem[]> {
  const companySet = new Set(companyList);
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1);

  // Fetch "All" events for the current month (summary endpoint)
  let summaryItems: EventCalendarSummaryItem[] = [];
  try {
    summaryItems = await getEventCalendarSummary(year, month, 'All');
  } catch {
    // graceful fallback if the static data is unavailable
  }

  // Filter to companies in our list
  const results: EventInfoItem[] = [];
  for (const item of summaryItems) {
    const companies = item.EVENT_COMPANY_LIST
      ? item.EVENT_COMPANY_LIST.split(',').map((s) => s.trim())
      : [];
    const matched = companies.filter((c) => companySet.has(c));
    if (matched.length === 0) continue;
    for (const ticker of matched) {
      results.push({
        eventId: `${item.EVENT_YEAR}-${item.EVENT_MONTH}-${item.EVENT_DATE}-${ticker}`,
        company: ticker,
        ticker,
        eventType: item.EVENT_TYPE,
        eventDatetime: `${item.EVENT_YEAR}-${String(parseInt(item.EVENT_MONTH)).padStart(2, '0')}-${String(parseInt(item.EVENT_DATE)).padStart(2, '0')}`,
        description: `${item.EVENT_TYPE} event for ${ticker}`,
        fiscalYear: item.EVENT_YEAR,
        fiscalQuarter: '',
      });
    }
  }
  return results;
}

/**
 * Get view category and column info for the "Add/Edit View" modal.
 * Reads from watchlist-column-catalog.json (PR#232 pattern — static import
 * via TS module).
 */
export function getViewCatgNColInfo(): ViewCatgNColInfoResponse {
  const catalog: WatchlistColumnCatalog = watchlistColumnCatalog;

  // Infer column type from label keywords
  const PCT_KEYWORDS = ['%', 'margin', 'roe', 'roa', 'roc', 'roic', 'growth', 'intensity'];
  const NUM_KEYWORDS = ['eps', 'doi'];

  function inferColumnType(label: string): { type: string; format?: string } {
    const lowerLabel = label.toLowerCase();
    if (PCT_KEYWORDS.some((kw) => lowerLabel.includes(kw))) {
      return { type: 'percentage', format: '0.0%' };
    }
    if (NUM_KEYWORDS.some((kw) => lowerLabel.includes(kw))) {
      return { type: 'number' };
    }
    return { type: 'currency', format: '$0.00B' };
  }

  return {
    categories: catalog.categories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      columns: cat.columns.map((col) => {
        const { type, format } = inferColumnType(col.label);
        return {
          id: col.id,
          label: col.label,
          type,
          format,
          align: 'right' as const,
          sortable: true,
        };
      }),
    })),
  };
}

// ─── CRUD API stubs ─────────────────────────────────────────────────────────

/**
 * Add companies to a watchlist. Called when the user clicks "Submit" in the
 * Add Company modal.
 */
export async function addCompanyToWatchlist(
  _userAcct: string,
  _watchlistId: string,
  _symbols: string[],
): Promise<{ success: boolean }> {
  // Stub — front-end already updates localStorage via WatchlistContext.
  // Replace with actual API call when backend is ready.
  console.log('[API stub] addCompanyToWatchlist', { _userAcct, _watchlistId, _symbols });
  return { success: true };
}

/**
 * Save a custom view (create or update). Called when the user clicks
 * "Save View" in the Manage View modal.
 */
export async function saveView(
  _userAcct: string,
  _watchlistId: string,
  _viewName: string,
  _columns: string[],
): Promise<{ success: boolean; viewId: string }> {
  console.log('[API stub] saveView', { _userAcct, _watchlistId, _viewName, _columns });
  return { success: true, viewId: `view-${Date.now()}` };
}

/**
 * Delete a custom view. Called when the user clicks "Delete" in the
 * Edit Views tab.
 */
export async function deleteView(
  _userAcct: string,
  _watchlistId: string,
  _viewId: string,
): Promise<{ success: boolean }> {
  console.log('[API stub] deleteView', { _userAcct, _watchlistId, _viewId });
  return { success: true };
}

/**
 * Update watchlist info (name, company order). Called when the user clicks
 * "Save" in the Edit Watchlist modal.
 */
export async function updateWatchlistInfo(
  _userAcct: string,
  _watchlistId: string,
  _name: string,
  _symbolOrder: string[],
): Promise<{ success: boolean }> {
  console.log('[API stub] updateWatchlistInfo', { _userAcct, _watchlistId, _name, _symbolOrder });
  return { success: true };
}
