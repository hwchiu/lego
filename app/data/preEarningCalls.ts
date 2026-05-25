import AAPL_FY_2026_Q1 from '@/content/pre-earning-calls/AAPL_FY_2026_Q1.md';
import AAPL_FY_2025_Q4 from '@/content/pre-earning-calls/AAPL_FY_2025_Q4.md';
import AAPL_FY_2025_Q3 from '@/content/pre-earning-calls/AAPL_FY_2025_Q3.md';
import AAPL_FY_2025_Q2 from '@/content/pre-earning-calls/AAPL_FY_2025_Q2.md';
import AAPL_FY_2025_Q1 from '@/content/pre-earning-calls/AAPL_FY_2025_Q1.md';
import NVDA_FY_2026_Q2 from '@/content/pre-earning-calls/NVDA_FY_2026_Q2.md';
import NVDA_FY_2025_Q4 from '@/content/pre-earning-calls/NVDA_FY_2025_Q4.md';
import NVDA_FY_2025_Q2 from '@/content/pre-earning-calls/NVDA_FY_2025_Q2.md';
import NVDA_FY_2024_Q4 from '@/content/pre-earning-calls/NVDA_FY_2024_Q4.md';
import NVDA_FY_2024_Q2 from '@/content/pre-earning-calls/NVDA_FY_2024_Q2.md';

export interface PecMdEntry {
  /** Filename without extension, e.g. "AAPL_FY_2026_Q1" */
  filename: string;
  /** Company ticker symbol, e.g. "AAPL" */
  symbol: string;
  /** Fiscal year, e.g. 2026 */
  year: number;
  /** Quarter string, e.g. "Q1" */
  quarter: string;
  /** Raw markdown content of the file */
  content: string;
}

/**
 * All Pre-Earning Call markdown files, keyed by filename convention:
 * {SYMBOL}_FY_{YEAR}_{QUARTER}.md
 */
export const PRE_EARNING_CALL_MD_ENTRIES: PecMdEntry[] = [
  { filename: 'AAPL_FY_2026_Q1', symbol: 'AAPL', year: 2026, quarter: 'Q1', content: AAPL_FY_2026_Q1 },
  { filename: 'AAPL_FY_2025_Q4', symbol: 'AAPL', year: 2025, quarter: 'Q4', content: AAPL_FY_2025_Q4 },
  { filename: 'AAPL_FY_2025_Q3', symbol: 'AAPL', year: 2025, quarter: 'Q3', content: AAPL_FY_2025_Q3 },
  { filename: 'AAPL_FY_2025_Q2', symbol: 'AAPL', year: 2025, quarter: 'Q2', content: AAPL_FY_2025_Q2 },
  { filename: 'AAPL_FY_2025_Q1', symbol: 'AAPL', year: 2025, quarter: 'Q1', content: AAPL_FY_2025_Q1 },
  { filename: 'NVDA_FY_2026_Q2', symbol: 'NVDA', year: 2026, quarter: 'Q2', content: NVDA_FY_2026_Q2 },
  { filename: 'NVDA_FY_2025_Q4', symbol: 'NVDA', year: 2025, quarter: 'Q4', content: NVDA_FY_2025_Q4 },
  { filename: 'NVDA_FY_2025_Q2', symbol: 'NVDA', year: 2025, quarter: 'Q2', content: NVDA_FY_2025_Q2 },
  { filename: 'NVDA_FY_2024_Q4', symbol: 'NVDA', year: 2024, quarter: 'Q4', content: NVDA_FY_2024_Q4 },
  { filename: 'NVDA_FY_2024_Q2', symbol: 'NVDA', year: 2024, quarter: 'Q2', content: NVDA_FY_2024_Q2 },
];
