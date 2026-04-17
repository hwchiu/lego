import AAPL_2026_Q1 from '@/content/ir-transcripts/AAPL_2026_Q1.html';
import AAPL_2025_Q4 from '@/content/ir-transcripts/AAPL_2025_Q4.html';
import AAPL_2025_Q3 from '@/content/ir-transcripts/AAPL_2025_Q3.html';
import AAPL_2025_Q2 from '@/content/ir-transcripts/AAPL_2025_Q2.html';
import AAPL_2025_Q1 from '@/content/ir-transcripts/AAPL_2025_Q1.html';
import AAPL_2019_Q4 from '@/content/ir-transcripts/AAPL_2019_Q4.html';
import NVDA_2026_Q4 from '@/content/ir-transcripts/NVDA_2026_Q4.html';

export interface IrTranscriptHtmlEntry {
  /** Filename without extension, e.g. "AAPL_2026_Q1" */
  filename: string;
  /** Company ticker symbol, e.g. "AAPL" */
  symbol: string;
  /** Display name for the company */
  companyName: string;
  /** Calendar year, e.g. 2026 */
  year: number;
  /** Quarter string, e.g. "Q1" */
  quarter: string;
  /** Event date string, e.g. "29-January-2026 5:00 PM ET" */
  eventDate?: string;
  /** Original source URL */
  fileUrl: string;
  /** Raw HTML content of the transcript file */
  content: string;
}

/**
 * All IR Transcript HTML files, keyed by filename convention:
 * {SYMBOL}_{YEAR}_{QUARTER}.html
 *
 * Each entry can be retrieved by (symbol, year, quarter).
 */
export const IR_TRANSCRIPT_HTML_ENTRIES: IrTranscriptHtmlEntry[] = [
  {
    filename: 'AAPL_2026_Q1',
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    year: 2026,
    quarter: 'Q1',
    eventDate: '29-January-2026 5:00 PM ET',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2026/q1/aapl-20260128.htm',
    content: AAPL_2026_Q1,
  },
  {
    filename: 'AAPL_2025_Q4',
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    year: 2025,
    quarter: 'Q4',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q4/aapl-20251003.htm',
    content: AAPL_2025_Q4,
  },
  {
    filename: 'AAPL_2025_Q3',
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    year: 2025,
    quarter: 'Q3',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q3/aapl-20250628.htm',
    content: AAPL_2025_Q3,
  },
  {
    filename: 'AAPL_2025_Q2',
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    year: 2025,
    quarter: 'Q2',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q2/aapl-20250329.htm',
    content: AAPL_2025_Q2,
  },
  {
    filename: 'AAPL_2025_Q1',
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    year: 2025,
    quarter: 'Q1',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q1/aapl-20241228.htm',
    content: AAPL_2025_Q1,
  },
  {
    filename: 'AAPL_2019_Q4',
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    year: 2019,
    quarter: 'Q4',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2019/q4/aapl-20191030.htm',
    content: AAPL_2019_Q4,
  },
  {
    filename: 'NVDA_2026_Q4',
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    year: 2026,
    quarter: 'Q4',
    fileUrl: 'https://eipbe-central.digwork.tw.ent.tsmc.com/mtl-trx/pdf/1772229761407183',
    content: NVDA_2026_Q4,
  },
];
