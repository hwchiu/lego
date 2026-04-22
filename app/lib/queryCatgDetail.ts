import { BIWEEKLY_ESG_CATG_DETAIL, NewsSummaryCatgDetail } from '@/app/data/newsSummaryData';

/**
 * Simulated API: queryCatgDetail
 *
 * Returns the category detail for the Bi-weekly ESG News Summary,
 * including the list of available periods (items) with their data_item_id.
 *
 * In production this will call a real backend API:
 *   GET /api/catg-detail?id=2
 *
 * @returns Promise resolving to the category detail response
 */
export async function queryCatgDetail(): Promise<NewsSummaryCatgDetail> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  return BIWEEKLY_ESG_CATG_DETAIL;
}
