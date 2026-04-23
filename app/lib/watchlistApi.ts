/**
 * Watchlist API stubs
 *
 * These functions serve as integration-ready stubs for the Watchlist feature.
 * Each function currently returns mock/local data, but accepts the same
 * parameters the real backend API will expect so that integration is seamless.
 */

import companyTagsData from '@/app/data/company-tags.json';
import { newsItems } from '@/app/data/news';
import type { NewsItem } from '@/app/data/news';
import { getEventCalendarSummary } from '@/app/lib/eventCalendarApi';
import type { EventCalendarSummaryItem } from '@/app/lib/eventCalendarApi';
import { getFavoritesByUserAcct, setFavoritesInPersonality } from '@/app/lib/getFavoritesByUserAcct';
import { watchlistColumnCatalog } from '@/app/data/watchlistColumns';
import type { WatchlistColumnCatalog } from '@/app/data/watchlistColumns';
import { holdingsData as holdingsDataMap, holdingsDataQ4_2025 } from '@/app/data/watchlistData';
import type { HoldingEntity } from '@/app/data/watchlistData';

// ─── Types ──────────────────────────────────────────────────────────────────

// ── New API Types (getUserAllWatchlists / getWatchlistDetail / getWatchlistData) ──

export interface ApiWatchlist {
  watchlistId: number;
  watchlistName: string;
  isDefault: string;
  defaultViewId: number | null;
}

export interface WatchlistCompany {
  coCd: string;
  orderIndex: number;
  isPinned: 'Y' | 'N';
}

export interface WatchlistView {
  viewId: number;
  viewName: string;
  isDefaultForWatchlist: string;
  selectedCategories: number[];
}

export interface WatchlistDetailResult {
  watchlistId: number;
  watchlistName: string;
  isDefault: string;
  defaultViewId: number | null;
  companylist: WatchlistCompany[];
  viewlist: WatchlistView[];
}

export interface WatchlistDetailResponse {
  returnCd: string;
  returnMsg: string | null;
  result: WatchlistDetailResult;
}

export interface WatchlistDataItem {
  calendar_quarter: string;
  co_cd: string;
  fld_val: string | number | null;
  curr_cd: string;
  fiscal_year: number | null;
  op_seg: string;
  val_unit: string;
  update_dt: string;
  doc_amt: string | number | null;
  calendar_year: number;
  fiscal_quarter: string;
  rpt_fin_item: string;
  selectedCategories: number;
}

export interface GetWatchlistDataParams {
  watchlistId: number;
  viewId: number;
  year: string[];
  quarter: string[];
  selectedCategories: number[];
  co_cd: string[];
}

export interface CategoryIdEntry {
  rpt_fin_item: string;
  label: string;
  type: 'currency' | 'percentage' | 'string' | 'number';
}

/** Maps integer selectedCategories ID → display metadata */
export const WATCHLIST_CATEGORY_ID_MAP: Record<number, CategoryIdEntry> = {
  1:  { rpt_fin_item: 'Revenue',                   label: 'Revenue',             type: 'currency'   },
  2:  { rpt_fin_item: 'Revenue QoQ (%)',            label: 'Revenue QoQ',         type: 'percentage' },
  3:  { rpt_fin_item: 'Revenue YoY (%)',            label: 'Revenue YoY',         type: 'percentage' },
  4:  { rpt_fin_item: 'Gross Margin (%)',           label: 'Gross Margin',        type: 'percentage' },
  5:  { rpt_fin_item: 'DOI',                        label: 'DOI',                 type: 'string'     },
  6:  { rpt_fin_item: 'Next Earning Release',       label: 'Next Earning',        type: 'string'     },
  7:  { rpt_fin_item: 'Last Qtr Revenue',           label: 'Last Qtr Revenue',    type: 'currency'   },
  8:  { rpt_fin_item: 'Last Qtr Gross Margin (%)',  label: 'Last Qtr GM',         type: 'percentage' },
  9:  { rpt_fin_item: 'Last Qtr DOI',               label: 'Last Qtr DOI',        type: 'string'     },
  10: { rpt_fin_item: 'Operating Margin (%)',       label: 'Operating Margin',    type: 'percentage' },
  11: { rpt_fin_item: 'Gross Profit',               label: 'Gross Profit',        type: 'currency'   },
  20: { rpt_fin_item: 'Net Income',                 label: 'Net Income',          type: 'currency'   },
};

// ── Mock data for new API stubs ──────────────────────────────────────────────

const MOCK_WATCHLISTS: ApiWatchlist[] = [
  { watchlistId: 0, watchlistName: 'Third Test',          isDefault: 'N', defaultViewId: null },
  { watchlistId: 1, watchlistName: 'Chocy Test Function', isDefault: 'N', defaultViewId: null },
];

const MOCK_WATCHLIST_DETAILS: Record<number, WatchlistDetailResult> = {
  0: {
    watchlistId: 0,
    watchlistName: 'Third Test',
    isDefault: 'N',
    defaultViewId: null,
    companylist: [
      { coCd: 'AAPL',  orderIndex: 0, isPinned: 'N' },
      { coCd: 'NVDA',  orderIndex: 1, isPinned: 'N' },
      { coCd: 'TSLA',  orderIndex: 2, isPinned: 'N' },
      { coCd: 'GOOGL', orderIndex: 3, isPinned: 'N' },
    ],
    viewlist: [
      { viewId: 0, viewName: 'Summary', isDefaultForWatchlist: 'Y', selectedCategories: [1, 2, 3, 4, 5, 6, 20, 8, 11] },
    ],
  },
  1: {
    watchlistId: 1,
    watchlistName: 'Chocy Test Function',
    isDefault: 'N',
    defaultViewId: null,
    companylist: [
      { coCd: 'TSLA',  orderIndex: 0, isPinned: 'N' },
      { coCd: 'NVDA',  orderIndex: 1, isPinned: 'N' },
      { coCd: 'MSFT',  orderIndex: 2, isPinned: 'N' },
      { coCd: 'AMZN',  orderIndex: 3, isPinned: 'N' },
    ],
    viewlist: [
      { viewId: 0, viewName: 'Summary', isDefaultForWatchlist: 'Y', selectedCategories: [1, 2, 3, 4, 5, 6, 20, 8, 11] },
    ],
  },
};

// Maps category ID to a getter function on HoldingEntity
const CATEGORY_TO_HOLDING_FIELD: Record<number, (h: HoldingEntity) => string | number | null> = {
  1:  (h) => h.revenue,
  2:  (h) => h.revenueQoQ,
  3:  (h) => h.revenueYoY,
  4:  (h) => h.grossMargin,
  5:  (h) => h.doi,
  6:  (h) => h.nextEarning,
  7:  (h) => h.lastQtrRevenue,
  8:  (h) => h.lastQtrGrossMargin,
  9:  (h) => h.lastQtrDOI,
  10: () => null,
  11: () => null,
  20: () => null,
};

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

/** Stub user account used by add/remove favorites stubs (no userAcct parameter per API spec). */
const STUB_USER_ACCT = 'demoUser';

/**
 * Get the list of favourite company codes for a user account.
 * Delegates to the existing getFavoritesByUserAcct implementation.
 */
export function getFavoritesListByUserAcct(userAcct: string): string[] {
  return getFavoritesByUserAcct(userAcct);
}

/**
 * Get the full favourite company list for a user account in API response format.
 * Returns { co_cd: string[] }.
 * Stub — reads from localStorage via getFavoritesByUserAcct.
 */
export async function getAllCoFavoriteList(userAcct: string): Promise<{ co_cd: string[] }> {
  console.log('[API stub] getAllCoFavoriteList', { userAcct });
  const list = getFavoritesByUserAcct(userAcct);
  return { co_cd: list };
}

/**
 * Add a single company to the user's favourite list.
 * Stub — updates localStorage via setFavoritesInPersonality.
 * After calling this, invoke getAllCoFavoriteList to refresh the in-memory list.
 */
export async function addCompanyToMyFavorite(company: string): Promise<{ success: boolean }> {
  console.log('[API stub] addCompanyToMyFavorite', { company });
  if (typeof window === 'undefined') return { success: true };
  const current = getFavoritesByUserAcct(STUB_USER_ACCT);
  if (!current.includes(company)) {
    setFavoritesInPersonality([...current, company]);
  }
  return { success: true };
}

/**
 * Remove a single company from the user's favourite list.
 * Stub — updates localStorage via setFavoritesInPersonality.
 * After calling this, invoke getAllCoFavoriteList to refresh the in-memory list.
 */
export async function removeCompanyFromFavorite(company: string): Promise<{ success: boolean }> {
  console.log('[API stub] removeCompanyFromFavorite', { company });
  if (typeof window === 'undefined') return { success: true };
  const current = getFavoritesByUserAcct(STUB_USER_ACCT);
  setFavoritesInPersonality(current.filter((s) => s !== company));
  return { success: true };
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

// ── getViewAllColumns ────────────────────────────────────────────────────────

export interface ViewAllColumnEntry {
  categoryId: string;
  categoryName: string;
  columns: { column_id: number; column_name: string }[];
}

/**
 * Get all available view columns in the new API format.
 * Called on page enter; the frontend uses categoryName for Category display
 * and column_name for Available Columns display.
 */
export function getViewAllColumns(): ViewAllColumnEntry[] {
  return watchlistColumnCatalog.categories.map((cat) => ({
    categoryId: cat.id,
    categoryName: cat.label,
    columns: cat.columns.map((col) => ({
      column_id: col.columnId,
      column_name: col.label,
    })),
  }));
}

// ─── CRUD API stubs ─────────────────────────────────────────────────────────

export interface AddCompanyToWatchlistPayload {
  watchlistId: number;
  coCdList: string[];
}

/**
 * Add companies to a watchlist (POST).
 * Payload: { watchlistId, coCdList }
 * After calling, invoke getWatchlistDetail then getWatchlistData to refresh the view.
 */
export async function addCompanyToWatchlist(
  payload: AddCompanyToWatchlistPayload,
): Promise<{ success: boolean }> {
  console.log('[API stub] addCompanyToWatchlist', payload);
  if (typeof window === 'undefined') return { success: true };

  const { watchlistId, coCdList } = payload;
  const store = getApiCreatedStore();

  // Get current detail from store or fall back to mock
  let detail = store.details[watchlistId];
  if (!detail) {
    const mockDetail = MOCK_WATCHLIST_DETAILS[watchlistId];
    if (mockDetail) {
      detail = { ...mockDetail, companylist: mockDetail.companylist.map((c) => ({ ...c })) };
    } else {
      detail = {
        watchlistId,
        watchlistName: `Watchlist ${watchlistId}`,
        isDefault: 'N',
        defaultViewId: null,
        companylist: [],
        viewlist: [{ viewId: 0, viewName: 'Summary', isDefaultForWatchlist: 'Y', selectedCategories: [...DEFAULT_VIEW_CATEGORIES] }],
      };
    }
  } else {
    detail = { ...detail, companylist: detail.companylist.map((c) => ({ ...c })) };
  }

  // Append companies not already in the list
  const existingCoCds = new Set(detail.companylist.map((c) => c.coCd));
  let nextIdx = detail.companylist.reduce((max, c) => Math.max(max, c.orderIndex), -1) + 1;
  for (const coCd of coCdList) {
    if (!existingCoCds.has(coCd)) {
      detail.companylist.push({ coCd, orderIndex: nextIdx++, isPinned: 'N' });
      existingCoCds.add(coCd);
    }
  }

  store.details[watchlistId] = detail;

  // Ensure the watchlist header entry exists in the store
  if (!store.watchlists.find((w) => w.watchlistId === watchlistId)) {
    const mockWl = MOCK_WATCHLISTS.find((w) => w.watchlistId === watchlistId);
    if (mockWl) store.watchlists.push({ ...mockWl });
  }

  saveApiCreatedStore(store);
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

// ── createViewWithColumn ─────────────────────────────────────────────────────

export interface CreateViewWithColumnPayload {
  watchlistId: number;
  viewName: string;
  selectedCategories: number[]; // column_id values from getViewAllColumns()
}

/**
 * Create a new view with selected columns (POST).
 * Payload: { watchlistId, viewName, selectedCategories: number[] }
 * After calling, invoke getWatchlistDetail then getWatchlistData to refresh.
 */
export async function createViewWithColumn(
  payload: CreateViewWithColumnPayload,
): Promise<{ viewId: number }> {
  console.log('[API stub] createViewWithColumn', payload);
  if (typeof window === 'undefined') return { viewId: -1 };

  const { watchlistId, viewName, selectedCategories } = payload;
  const store = getApiCreatedStore();

  // Get or initialize detail
  let detail = store.details[watchlistId];
  if (!detail) {
    const mockDetail = MOCK_WATCHLIST_DETAILS[watchlistId];
    if (mockDetail) {
      detail = { ...mockDetail, viewlist: mockDetail.viewlist.map((v) => ({ ...v })) };
    } else {
      detail = {
        watchlistId,
        watchlistName: `Watchlist ${watchlistId}`,
        isDefault: 'N',
        defaultViewId: null,
        companylist: [],
        viewlist: [{ viewId: 0, viewName: 'Summary', isDefaultForWatchlist: 'Y', selectedCategories: [...DEFAULT_VIEW_CATEGORIES] }],
      };
    }
  } else {
    detail = { ...detail, viewlist: detail.viewlist.map((v) => ({ ...v })) };
  }

  // Generate a new unique viewId
  const maxViewId = detail.viewlist.reduce((max, v) => Math.max(max, v.viewId), 0);
  const newViewId = maxViewId + 1;

  detail.viewlist.push({
    viewId: newViewId,
    viewName,
    isDefaultForWatchlist: 'N',
    selectedCategories,
  });

  store.details[watchlistId] = detail;

  // Ensure the watchlist header entry exists
  if (!store.watchlists.find((w) => w.watchlistId === watchlistId)) {
    const mockWl = MOCK_WATCHLISTS.find((w) => w.watchlistId === watchlistId);
    if (mockWl) store.watchlists.push({ ...mockWl });
  }

  saveApiCreatedStore(store);
  return { viewId: newViewId };
}

// ── deleteView ───────────────────────────────────────────────────────────────

export interface DeleteViewPayload {
  watchlistId: number;
  viewId: number;
}

/**
 * Delete a custom view (POST).
 * Payload: { watchlistId, viewId }
 * After calling, navigate to the watchlist's Summary view.
 */
export async function deleteView(
  payload: DeleteViewPayload,
): Promise<{ success: boolean }> {
  console.log('[API stub] deleteView', payload);
  const { watchlistId, viewId } = payload;

  if (typeof window === 'undefined') return { success: true };

  const store = getApiCreatedStore();

  let detail = store.details[watchlistId];
  if (!detail) {
    const mockDetail = MOCK_WATCHLIST_DETAILS[watchlistId];
    if (mockDetail) {
      detail = { ...mockDetail, viewlist: mockDetail.viewlist.map((v) => ({ ...v })) };
    } else {
      return { success: true };
    }
  } else {
    detail = { ...detail, viewlist: [...detail.viewlist] };
  }

  detail.viewlist = detail.viewlist.filter((v) => v.viewId !== viewId);
  store.details[watchlistId] = detail;
  saveApiCreatedStore(store);

  return { success: true };
}

// ─── Company Tag API ─────────────────────────────────────────────────────────

export interface TagInfoDTO {
  tag_id: number;
  tag_name: string;
}

export interface CompanyTagListResponse {
  co_cd: string;
  tagInfoDTOList: TagInfoDTO[];
}

/**
 * Get the public tag list for a company.
 * Returns mock data from company-tags.json until the backend is ready.
 * When integrated, this function will call the backend with co_cd and return
 * the tag list in the format: { co_cd, tagInfoDTOList: [{ tag_id, tag_name }] }.
 */
export async function getCompanyTagList(co_cd: string): Promise<CompanyTagListResponse> {
  console.log('[API stub] getCompanyTagList', { co_cd });
  const tagsMap = companyTagsData as Record<string, TagInfoDTO[]>;
  const tagInfoDTOList: TagInfoDTO[] = tagsMap[co_cd] ?? [];
  return { co_cd, tagInfoDTOList };
}

// ─── CRUD API stubs ─────────────────────────────────────────────────────────

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

// ─── New Watchlist API Stubs ─────────────────────────────────────────────────

// Default categories for a new watchlist's Summary view
const DEFAULT_VIEW_CATEGORIES = [1, 2, 3, 4, 5, 6, 20, 8, 11] as const;

export interface EditWatchlistCoCdEntry {
  coCd: string;
  orderIndex: number;
  isPinned: 'Y' | 'N';
}

export interface EditWatchlistPayload {
  watchlistId: number;
  newWatchlistName: string;
  coCdList: EditWatchlistCoCdEntry[];
}

/**
 * Edit a watchlist (name and company list/order). POST.
 * Payload: { watchlistId, newWatchlistName, coCdList: [{ coCd, orderIndex, isPinned }] }
 * After calling, invoke getWatchlistDetail then getWatchlistData to refresh the view.
 */
export async function editWatchlist(payload: EditWatchlistPayload): Promise<{ success: boolean }> {
  console.log('[API stub] editWatchlist', payload);
  if (typeof window === 'undefined') return { success: true };

  const { watchlistId, newWatchlistName, coCdList } = payload;
  const store = getApiCreatedStore();

  // Get or seed detail from mock
  let detail = store.details[watchlistId];
  if (!detail) {
    const mockDetail = MOCK_WATCHLIST_DETAILS[watchlistId];
    if (mockDetail) {
      detail = { ...mockDetail };
    } else {
      detail = {
        watchlistId,
        watchlistName: newWatchlistName,
        isDefault: 'N',
        defaultViewId: null,
        companylist: [],
        viewlist: [{ viewId: 0, viewName: 'Summary', isDefaultForWatchlist: 'Y', selectedCategories: [...DEFAULT_VIEW_CATEGORIES] }],
      };
    }
  }

  detail = {
    ...detail,
    watchlistName: newWatchlistName,
    companylist: coCdList.map((e) => ({ coCd: e.coCd, orderIndex: e.orderIndex, isPinned: e.isPinned })),
  };

  store.details[watchlistId] = detail;

  // Update the watchlist header entry too
  const wlIdx = store.watchlists.findIndex((w) => w.watchlistId === watchlistId);
  if (wlIdx >= 0) {
    store.watchlists[wlIdx] = { ...store.watchlists[wlIdx], watchlistName: newWatchlistName };
  } else {
    const mockWl = MOCK_WATCHLISTS.find((w) => w.watchlistId === watchlistId);
    if (mockWl) store.watchlists.push({ ...mockWl, watchlistName: newWatchlistName });
  }

  saveApiCreatedStore(store);
  return { success: true };
}

/**
 * Delete a watchlist (POST). Accepts watchlistId as a parameter.
 * After calling, invoke getUserAllWatchlists to refresh the watchlist list.
 */
export async function deleteWatchlistById(watchlistId: number): Promise<{ success: boolean }> {
  console.log('[API stub] deleteWatchlist', { watchlistId });
  if (typeof window === 'undefined') return { success: true };

  const store = getApiCreatedStore();

  // Remove from user-created list
  store.watchlists = store.watchlists.filter((w) => w.watchlistId !== watchlistId);

  // Remove detail
  delete store.details[watchlistId];

  // Track as deleted so getUserAllWatchlists filters it out
  if (!store.deletedIds.includes(watchlistId)) {
    store.deletedIds.push(watchlistId);
  }

  saveApiCreatedStore(store);
  return { success: true };
}

// ─── User-created watchlist localStorage helpers ─────────────────────────────

const API_CREATED_KEY = 'wl-api-created';

interface ApiCreatedStore {
  watchlists: ApiWatchlist[];
  details: Record<number, WatchlistDetailResult>;
  /** IDs of watchlists that have been deleted (includes both user-created and mock) */
  deletedIds: number[];
}

function getApiCreatedStore(): ApiCreatedStore {
  if (typeof window === 'undefined') return { watchlists: [], details: {}, deletedIds: [] };
  try {
    const raw = localStorage.getItem(API_CREATED_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ApiCreatedStore>;
      return {
        watchlists: parsed.watchlists ?? [],
        details: parsed.details ?? {},
        deletedIds: parsed.deletedIds ?? [],
      };
    }
  } catch {
    // ignore
  }
  return { watchlists: [], details: {}, deletedIds: [] };
}

function saveApiCreatedStore(store: ApiCreatedStore): void {
  try {
    localStorage.setItem(API_CREATED_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

// ─── createWatchlistWithCompany ──────────────────────────────────────────────

export interface CreateWatchlistPayload {
  watchlistName: string;
  coCdList: WatchlistCompany[];
}

/**
 * Create a new watchlist with companies.
 * Stub — persists to localStorage and returns the new watchlistId.
 * Replace with a real POST API call when backend is ready.
 */
export function createWatchlistWithCompany(
  payload: CreateWatchlistPayload,
): { watchlistId: number } {
  console.log('[API stub] createWatchlistWithCompany', payload);
  if (typeof window === 'undefined') return { watchlistId: -1 };

  const store = getApiCreatedStore();
  // Derive next ID from the union of mock IDs and user-created IDs to avoid collisions
  const maxId = Math.max(
    ...MOCK_WATCHLISTS.map((w) => w.watchlistId),
    ...store.watchlists.map((w) => w.watchlistId),
    0,
  );
  const newId = maxId + 1;

  const newWatchlist: ApiWatchlist = {
    watchlistId: newId,
    watchlistName: payload.watchlistName,
    isDefault: 'N',
    defaultViewId: null,
  };

  const newDetail: WatchlistDetailResult = {
    watchlistId: newId,
    watchlistName: payload.watchlistName,
    isDefault: 'N',
    defaultViewId: null,
    companylist: payload.coCdList,
    viewlist: [
      { viewId: 0, viewName: 'Summary', isDefaultForWatchlist: 'Y', selectedCategories: [...DEFAULT_VIEW_CATEGORIES] },
    ],
  };

  store.watchlists.push(newWatchlist);
  store.details[newId] = newDetail;
  saveApiCreatedStore(store);

  return { watchlistId: newId };
}

/**
 * Get all watchlists for a user account.
 * Stub — combines mock data with user-created entries, excluding deleted ones.
 */
export function getUserAllWatchlists(_userAcct: string): { result: ApiWatchlist[] } {
  console.log('[API stub] getUserAllWatchlists', { _userAcct });
  const { watchlists: userCreated, deletedIds } = getApiCreatedStore();
  const deletedSet = new Set(deletedIds);
  const allWatchlists = [
    ...MOCK_WATCHLISTS.filter((w) => !deletedSet.has(w.watchlistId)),
    ...userCreated.filter((w) => !deletedSet.has(w.watchlistId)),
  ];
  return { result: allWatchlists };
}

/**
 * Get detail for a specific watchlist, including companylist and viewlist.
 * Stub — checks user-created localStorage entries first, then falls back to mock data.
 */
export function getWatchlistDetail(watchlistId: number): WatchlistDetailResponse {
  console.log('[API stub] getWatchlistDetail', { watchlistId });

  // Check user-created watchlists first
  const { details: userDetails } = getApiCreatedStore();
  if (userDetails[watchlistId]) {
    return { returnCd: '200', returnMsg: null, result: userDetails[watchlistId] };
  }

  const result: WatchlistDetailResult = MOCK_WATCHLIST_DETAILS[watchlistId] ?? {
    watchlistId,
    watchlistName: `Watchlist ${watchlistId}`,
    isDefault: 'N',
    defaultViewId: null,
    companylist: [],
    viewlist: [
      { viewId: 0, viewName: 'Summary', isDefaultForWatchlist: 'Y', selectedCategories: [1, 2, 3, 4, 5, 6, 20, 8, 11] },
    ],
  };
  return { returnCd: '200', returnMsg: null, result };
}

/**
 * Get watchlist table data as a flat array.
 * Returns one record per (company × selectedCategory), ordered by co_cd then category.
 * Stub — converts existing HoldingEntity data to the new flat format.
 */
export function getWatchlistData(params: GetWatchlistDataParams): WatchlistDataItem[] {
  console.log('[API stub] getWatchlistData', params);
  const { selectedCategories, co_cd, quarter, year } = params;
  const isQ4 = year[0] === '2025' && quarter[0] === 'Q4';
  const source = isQ4 ? holdingsDataQ4_2025 : holdingsDataMap;

  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 23);
  const calYear = isQ4 ? 2025 : 2026;
  const calQ = quarter[0] ?? 'Q1';

  const items: WatchlistDataItem[] = [];

  for (const coCd of co_cd) {
    const holding = source[coCd];
    for (const catId of selectedCategories) {
      const meta = WATCHLIST_CATEGORY_ID_MAP[catId];
      if (!meta) continue;
      const fieldFn = CATEGORY_TO_HOLDING_FIELD[catId];
      const fldVal = (holding && fieldFn) ? fieldFn(holding) : null;
      items.push({
        calendar_quarter: calQ,
        co_cd: coCd,
        fld_val: fldVal,
        curr_cd: 'USD',
        fiscal_year: calYear,
        op_seg: 'NA',
        val_unit: meta.type === 'currency' ? 'Billion' : meta.type === 'percentage' ? '%' : '',
        update_dt: nowStr,
        doc_amt: fldVal,
        calendar_year: calYear,
        fiscal_quarter: calQ,
        rpt_fin_item: meta.rpt_fin_item,
        selectedCategories: catId,
      });
    }
  }

  return items;
}
