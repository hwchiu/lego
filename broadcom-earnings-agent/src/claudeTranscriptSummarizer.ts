import { chatComplete } from './aiClient';
import { TranscriptSummary } from './types';

const SUMMARY_PROMPT = `You are a senior financial analyst specializing in technology sector earnings.
You have been given an official earnings document from Broadcom Inc. for Q2 FY2026.
Extract ALL key financial information and produce a comprehensive, analyst-quality summary.

Return ONLY valid JSON with this EXACT structure (no markdown fences, no other text):
{
  "highlights": [
    "8-12 specific achievement bullet points — each must contain exact numbers from the document",
    "Cover: total revenue, segment revenue (ISG/CSG), AI-specific metrics, EPS, cash flow, bookings, YoY growth rates",
    "Format: '<Metric>: <value>, <change vs prior period>'"
  ],
  "risks": [
    "3-5 concrete risk factors, challenges, or concerns mentioned or implied in the document",
    "Include macro risks, margin pressure, competitive dynamics if mentioned"
  ],
  "outlook": "Write 2-3 paragraphs covering: (1) Q2 FY27 specific guidance with exact numbers, (2) Full-year FY27 guidance with exact numbers, (3) Management's strategic priorities and tone. Quote specific figures wherever available.",
  "keyQuotes": [
    "5-7 direct verbatim executive quotes from the document",
    "Format each as: 'FirstName LastName, Title: \"exact quote text\"'"
  ],
  "summaryConfidence": 90
}

summaryConfidence (integer 0–100): Your self-rated confidence that this summary is complete, accurate, and faithfully represents the source material. Penalise if key figures are missing or the source is partial.

IMPORTANT: Replace the example strings above with real content from the document. Every highlight must include a specific number.`;

export async function summarizeTranscript(transcriptText: string): Promise<TranscriptSummary> {
  // Trim to ~12k chars to stay within token limits while keeping rich content
  const trimmed = transcriptText.length > 12_000
    ? transcriptText.slice(0, 12_000) + '\n...[truncated]'
    : transcriptText;

  const text = await chatComplete(SUMMARY_PROMPT, trimmed, 4096);
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(cleaned);

  return {
    highlights:        Array.isArray(parsed.highlights)  ? parsed.highlights  : [],
    risks:             Array.isArray(parsed.risks)        ? parsed.risks        : [],
    outlook:           typeof parsed.outlook === 'string' ? parsed.outlook      : '',
    keyQuotes:         Array.isArray(parsed.keyQuotes)   ? parsed.keyQuotes   : [],
    summaryConfidence: typeof parsed.summaryConfidence === 'number'
      ? Math.max(0, Math.min(100, Math.round(parsed.summaryConfidence)))
      : 50,
  };
}
