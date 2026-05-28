import { chatComplete } from './aiClient';
import { TranscriptSummary } from './types';

const SUMMARY_PROMPT = `You are a financial analyst summarizing an earnings call transcript.
Return ONLY valid JSON with this exact structure:
{
  "highlights": ["3-5 key achievement bullet points as strings"],
  "risks":      ["2-4 flagged concern bullet points as strings"],
  "outlook":    "1 paragraph on forward guidance and management expectations",
  "keyQuotes":  ["3-5 notable executive quotes as strings, format: 'Name/Title: quote text'"]
}
Return ONLY the JSON object, no markdown fences, no other text.`;

export async function summarizeTranscript(transcriptText: string): Promise<TranscriptSummary> {
  const text = await chatComplete(SUMMARY_PROMPT, transcriptText, 2048);
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(cleaned);

  return {
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    risks:      Array.isArray(parsed.risks)      ? parsed.risks      : [],
    outlook:    typeof parsed.outlook === 'string' ? parsed.outlook   : '',
    keyQuotes:  Array.isArray(parsed.keyQuotes)  ? parsed.keyQuotes  : [],
  };
}
