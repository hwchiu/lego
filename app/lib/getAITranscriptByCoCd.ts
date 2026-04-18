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
    (e) => e.symbol.toUpperCase() === coCd.toUpperCase(),
  );

  // Sort newest first (year desc, then quarter desc)
  return [...filtered].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    const qA = parseInt(a.quarter.replace('Q', ''), 10) || 0;
    const qB = parseInt(b.quarter.replace('Q', ''), 10) || 0;
    return qB - qA;
  });
}
