import AAPL_FY_2026_Q1 from '@/content/ai-transcripts/AAPL_FY_2026_Q1.md';
import AAPL_FY_2025_Q4 from '@/content/ai-transcripts/AAPL_FY_2025_Q4.md';
import AAPL_FY_2025_Q3 from '@/content/ai-transcripts/AAPL_FY_2025_Q3.md';
import AAPL_FY_2025_Q2 from '@/content/ai-transcripts/AAPL_FY_2025_Q2.md';
import AAPL_FY_2025_Q1 from '@/content/ai-transcripts/AAPL_FY_2025_Q1.md';
import NVDA_FY_2026_Q4 from '@/content/ai-transcripts/NVDA_FY_2026_Q4.md';

export interface AiTranscriptMdEntry {
  /** Filename without extension, e.g. "AAPL_FY_2026_Q1" */
  filename: string;
  /** Company ticker symbol, e.g. "AAPL" */
  symbol: string;
  /** Calendar / fiscal year, e.g. 2026 */
  year: number;
  /** Quarter string, e.g. "Q1" */
  quarter: string;
  /** Raw markdown content of the file */
  content: string;
}

/**
 * All AI Transcript markdown files, keyed by filename convention:
 * {SYMBOL}_FY_{YEAR}_{QUARTER}.md
 */
export const AI_TRANSCRIPT_MD_ENTRIES: AiTranscriptMdEntry[] = [
  { filename: 'AAPL_FY_2026_Q1', symbol: 'AAPL', year: 2026, quarter: 'Q1', content: AAPL_FY_2026_Q1 },
  { filename: 'AAPL_FY_2025_Q4', symbol: 'AAPL', year: 2025, quarter: 'Q4', content: AAPL_FY_2025_Q4 },
  { filename: 'AAPL_FY_2025_Q3', symbol: 'AAPL', year: 2025, quarter: 'Q3', content: AAPL_FY_2025_Q3 },
  { filename: 'AAPL_FY_2025_Q2', symbol: 'AAPL', year: 2025, quarter: 'Q2', content: AAPL_FY_2025_Q2 },
  { filename: 'AAPL_FY_2025_Q1', symbol: 'AAPL', year: 2025, quarter: 'Q1', content: AAPL_FY_2025_Q1 },
  { filename: 'NVDA_FY_2026_Q4', symbol: 'NVDA', year: 2026, quarter: 'Q4', content: NVDA_FY_2026_Q4 },
];
