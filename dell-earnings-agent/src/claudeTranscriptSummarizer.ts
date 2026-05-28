import Anthropic from '@anthropic-ai/sdk';
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
  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `${SUMMARY_PROMPT}\n\n---\n${transcriptText}`,
    }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(cleaned);

  return {
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    risks:      Array.isArray(parsed.risks)      ? parsed.risks      : [],
    outlook:    typeof parsed.outlook === 'string' ? parsed.outlook   : '',
    keyQuotes:  Array.isArray(parsed.keyQuotes)  ? parsed.keyQuotes  : [],
  };
}
