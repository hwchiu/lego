import {
  BIWEEKLY_ESG_CATG_DETAIL,
  TAIWAN_TAX_CATG_DETAIL,
  INTL_TAX_CATG_DETAIL,
  NewsSummaryCatgDetail,
} from '@/app/data/newsSummaryData';

export type CatgDetailType = 'esg' | 'taiwan-tax' | 'intl-tax';

/**
 * Simulated API: queryCatgDetail
 *
 * Returns the category detail for the specified news summary category,
 * including the list of available periods (items) with their data_item_id.
 *
 * In production this will call a real backend API:
 *   GET /api/catg-detail?id=<id>
 *   - ESG:       id=2
 *   - Intl Tax:  id=1
 *   - Taiwan Tax: id=3
 *
 * @param type  The category type to fetch ('esg' | 'taiwan-tax' | 'intl-tax')
 * @returns Promise resolving to the category detail response
 */
export async function queryCatgDetail(type: CatgDetailType = 'esg'): Promise<NewsSummaryCatgDetail> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  if (type === 'taiwan-tax') return TAIWAN_TAX_CATG_DETAIL;
  if (type === 'intl-tax') return INTL_TAX_CATG_DETAIL;
  return BIWEEKLY_ESG_CATG_DETAIL;
}
