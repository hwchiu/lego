import AAPL_2026_Q1 from '@/content/ir-transcripts/AAPL_2026_Q1.html';
import AAPL_2025_Q4 from '@/content/ir-transcripts/AAPL_2025_Q4.html';
import AAPL_2025_Q3 from '@/content/ir-transcripts/AAPL_2025_Q3.html';
import AAPL_2025_Q2 from '@/content/ir-transcripts/AAPL_2025_Q2.html';
import AAPL_2025_Q1 from '@/content/ir-transcripts/AAPL_2025_Q1.html';
import AAPL_2019_Q4 from '@/content/ir-transcripts/AAPL_2019_Q4.html';
import NVDA_2026_Q4 from '@/content/ir-transcripts/NVDA_2026_Q4.html';

export interface IrTranscriptHtmlEntry {
  /** Document title, e.g. "Apple, Inc.(AAPL-US), Q1 2026 Earnings Call Transcript" */
  doc_title: string;
  /** Company code / ticker symbol, e.g. "AAPL" */
  co_cd: string;
  /** Display name for the company */
  company_name: string;
  /** Fiscal year as string, e.g. "2026" */
  fiscal_year_no: string;
  /** Fiscal quarter as string, e.g. "Q1" */
  fiscal_qtr_no: string;
  /** Event date string, e.g. "29-January-2026 5:00 PM ET" */
  event_date?: string;
  /** Original source URL */
  file_url: string;
  /** Raw HTML content of the transcript */
  doc_html: string;
}

/**
 * All IR Transcript HTML files keyed by (co_cd, fiscal_year_no, fiscal_qtr_no).
 * Sorted newest-first by getIRTranscriptByCoCd().
 */
export const IR_TRANSCRIPT_HTML_ENTRIES: IrTranscriptHtmlEntry[] = [
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q1 2026 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2026',
    fiscal_qtr_no: 'Q1',
    event_date: '29-January-2026 5:00 PM ET',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2026/q1/aapl-20260128.htm',
    doc_html: AAPL_2026_Q1,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q4 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q4',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q4/aapl-20251003.htm',
    doc_html: AAPL_2025_Q4,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q3 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q3',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q3/aapl-20250628.htm',
    doc_html: AAPL_2025_Q3,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q2 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q2',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q2/aapl-20250329.htm',
    doc_html: AAPL_2025_Q2,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q1 2025 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2025',
    fiscal_qtr_no: 'Q1',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q1/aapl-20241228.htm',
    doc_html: AAPL_2025_Q1,
  },
  {
    doc_title: 'Apple, Inc.(AAPL-US), Q4 2019 Earnings Call Transcript',
    co_cd: 'AAPL',
    company_name: 'Apple, Inc.',
    fiscal_year_no: '2019',
    fiscal_qtr_no: 'Q4',
    file_url: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2019/q4/aapl-20191030.htm',
    doc_html: AAPL_2019_Q4,
  },
  {
    doc_title: 'NVIDIA Corp.(NVDA-US), Q4 2026 Earnings Call Transcript',
    co_cd: 'NVDA',
    company_name: 'NVIDIA Corp.',
    fiscal_year_no: '2026',
    fiscal_qtr_no: 'Q4',
    file_url: 'https://eipbe-central.digwork.tw.ent.tsmc.com/mtl-trx/pdf/1772229761407183',
    doc_html: NVDA_2026_Q4,
  },
];
