import AAPL_2026_Q1 from '@/content/ai-transcripts/AAPL_2026_Q1.html';
import AAPL_2025_Q4 from '@/content/ai-transcripts/AAPL_2025_Q4.html';
import AAPL_2025_Q3 from '@/content/ai-transcripts/AAPL_2025_Q3.html';
import AAPL_2025_Q2 from '@/content/ai-transcripts/AAPL_2025_Q2.html';
import AAPL_2025_Q1 from '@/content/ai-transcripts/AAPL_2025_Q1.html';
import AAPL_2019_Q4 from '@/content/ai-transcripts/AAPL_2019_Q4.html';
import NVDA_2026_Q4 from '@/content/ai-transcripts/NVDA_2026_Q4.html';

export interface AiTranscriptHtmlEntry {
  /** Filename without extension, e.g. "AAPL_2026_Q1" */
  filename: string;
  /** Company ticker symbol, e.g. "AAPL" */
  symbol: string;
  /** Calendar year, e.g. 2026 */
  year: number;
  /** Quarter string, e.g. "Q1" */
  quarter: string;
  /** Raw HTML content of the file */
  content: string;
}

/**
 * All AI Transcript HTML files, keyed by filename convention:
 * {SYMBOL}_{YEAR}_{QUARTER}.html
 *
 * Each entry can be retrieved by (symbol, year, quarter).
 */
export const AI_TRANSCRIPT_HTML_ENTRIES: AiTranscriptHtmlEntry[] = [
  { filename: 'AAPL_2026_Q1', symbol: 'AAPL', year: 2026, quarter: 'Q1', content: AAPL_2026_Q1 },
  { filename: 'AAPL_2025_Q4', symbol: 'AAPL', year: 2025, quarter: 'Q4', content: AAPL_2025_Q4 },
  { filename: 'AAPL_2025_Q3', symbol: 'AAPL', year: 2025, quarter: 'Q3', content: AAPL_2025_Q3 },
  { filename: 'AAPL_2025_Q2', symbol: 'AAPL', year: 2025, quarter: 'Q2', content: AAPL_2025_Q2 },
  { filename: 'AAPL_2025_Q1', symbol: 'AAPL', year: 2025, quarter: 'Q1', content: AAPL_2025_Q1 },
  { filename: 'AAPL_2019_Q4', symbol: 'AAPL', year: 2019, quarter: 'Q4', content: AAPL_2019_Q4 },
  { filename: 'NVDA_2026_Q4', symbol: 'NVDA', year: 2026, quarter: 'Q4', content: NVDA_2026_Q4 },
];

