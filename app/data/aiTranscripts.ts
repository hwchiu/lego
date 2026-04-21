import AAPL_2026_Q1 from '@/content/ai-transcripts/AAPL_2026_Q1.html';
import AAPL_2025_Q4 from '@/content/ai-transcripts/AAPL_2025_Q4.html';
import AAPL_2025_Q3 from '@/content/ai-transcripts/AAPL_2025_Q3.html';
import AAPL_2025_Q2 from '@/content/ai-transcripts/AAPL_2025_Q2.html';
import AAPL_2025_Q1 from '@/content/ai-transcripts/AAPL_2025_Q1.html';
import AAPL_2019_Q4 from '@/content/ai-transcripts/AAPL_2019_Q4.html';
import NVDA_2026_Q4 from '@/content/ai-transcripts/NVDA_2026_Q4.html';

export interface AiTranscriptHtmlEntry {
  /** Document title, e.g. "AI Summarization (Calendar year: Q1 2026)" */
  doc_title: string;
  /** Company code / ticker symbol, e.g. "AAPL" */
  co_cd: string;
  /** Display name for the company */
  company_name: string;
  /** Fiscal year as string, e.g. "2026" */
  fiscal_year_no: string;
  /** Fiscal quarter as string, e.g. "Q1" */
  fiscal_qtr_no: string;
  /** Raw HTML content of the AI summary */
  doc_html: string;
}

/**
 * All AI Transcript HTML files keyed by (co_cd, fiscal_year_no, fiscal_qtr_no).
 * Sorted newest-first by getAITranscriptByCoCd().
 */
export const AI_TRANSCRIPT_HTML_ENTRIES: AiTranscriptHtmlEntry[] = [
  { doc_title: 'AI Summarization (Calendar year: Q1 2026)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2026', fiscal_qtr_no: 'Q1', doc_html: AAPL_2026_Q1 },
  { doc_title: 'AI Summarization (Calendar year: Q4 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q4', doc_html: AAPL_2025_Q4 },
  { doc_title: 'AI Summarization (Calendar year: Q3 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q3', doc_html: AAPL_2025_Q3 },
  { doc_title: 'AI Summarization (Calendar year: Q2 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q2', doc_html: AAPL_2025_Q2 },
  { doc_title: 'AI Summarization (Calendar year: Q1 2025)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2025', fiscal_qtr_no: 'Q1', doc_html: AAPL_2025_Q1 },
  { doc_title: 'AI Summarization (Calendar year: Q4 2019)', co_cd: 'AAPL', company_name: 'Apple, Inc.', fiscal_year_no: '2019', fiscal_qtr_no: 'Q4', doc_html: AAPL_2019_Q4 },
  { doc_title: 'AI Summarization (Calendar year: Q4 2026)', co_cd: 'NVDA', company_name: 'NVIDIA Corp.', fiscal_year_no: '2026', fiscal_qtr_no: 'Q4', doc_html: NVDA_2026_Q4 },
];

