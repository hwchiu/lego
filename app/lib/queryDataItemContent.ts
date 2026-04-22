import { NEWS_SUMMARY_CONTENT } from '@/app/data/newsSummaryData';

/**
 * Simulated API: queryDataItemContent
 *
 * Returns the markdown content for a given data item ID.
 * The content contains ESG news organized by topic, separated by
 * topic dividers, and formatted as markdown tables.
 *
 * In production this will call a real backend API:
 *   GET /api/data-item-content?data_item_id={dataItemId}
 *
 * @param dataItemId  The unique ID of the data item (e.g. "15217")
 * @returns Promise resolving to a markdown string, or null if not found
 */
export async function queryDataItemContent(dataItemId: string): Promise<string | null> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  return NEWS_SUMMARY_CONTENT[dataItemId] ?? null;
}
