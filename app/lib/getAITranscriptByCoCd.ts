import { AI_TRANSCRIPT_HTML_ENTRIES, AiTranscriptHtmlEntry } from '@/app/data/aiTranscripts';

/**
 * Simulated API: getAITranscriptByCoCd
 *
 * Fetches AI Transcript HTML entries from the local data store,
 * filtered by company code (ticker symbol).
 * Returns entries sorted by date descending (newest first).
 *
 * In production this will call a real backend API:
 *   GET /api/ai-transcripts?co_cd={coCd}
 *
 * @param coCd  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to an array of AiTranscriptHtmlEntry
 */
export async function getAITranscriptByCoCd(
  coCd: string,
): Promise<AiTranscriptHtmlEntry[]> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  const filtered = AI_TRANSCRIPT_HTML_ENTRIES.filter(
    (e) => e.co_cd.toUpperCase() === coCd.toUpperCase(),
  );

  // Sort newest first (year desc, then quarter desc)
  return [...filtered].sort((a, b) => {
    const yearA = parseInt(a.fiscal_year_no, 10);
    const yearB = parseInt(b.fiscal_year_no, 10);
    if (yearB !== yearA) return yearB - yearA;
    const qA = parseInt(a.fiscal_qtr_no.replace('Q', ''), 10) || 0;
    const qB = parseInt(b.fiscal_qtr_no.replace('Q', ''), 10) || 0;
    return qB - qA;
  });
}
