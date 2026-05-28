import Anthropic from '@anthropic-ai/sdk';
import { EarningsMetrics, MetricValue } from './types';

const EXTRACTION_PROMPT = `You are a financial data extraction assistant.
Extract the following metrics from the provided Dell press release text and return ONLY valid JSON.
Return null for any metric not found or unclear.

Required JSON structure:
{
  "revenue":     { "value": <number in $B>, "unit": "B",    "qoq": <% change or null>, "yoy": <% change or null>, "confidence": <0-100> } | null,
  "grossMargin": { "value": <% value>,      "unit": "%",    "qoq": <pp delta or null>, "yoy": <pp delta or null>, "confidence": <0-100> } | null,
  "doi":         { "value": <days>,          "unit": "days", "qoq": <days delta or null>, "yoy": <days delta or null>, "confidence": <0-100> } | null,
  "overallConfidence": <0-100 integer>
}

Confidence guidelines:
- 90-100: value explicitly stated, all comparisons available
- 70-89: value stated, some comparisons inferred or partially available
- 50-69: value partially inferred or comparisons unavailable
- <50: value is estimated or source text is ambiguous / incomplete

Return ONLY the JSON object, no markdown fences, no other text.`;

type MetricField = 'revenue' | 'grossMargin' | 'doi';
const FIELD_UNITS: Record<MetricField, MetricValue['unit']> = {
  revenue: 'B',
  grossMargin: '%',
  doi: 'days',
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function parseMetricValue(raw: unknown, field: MetricField): MetricValue | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.value !== 'number') return null;
  return {
    value:      obj.value,
    unit:       FIELD_UNITS[field],
    qoq:        typeof obj.qoq === 'number' ? obj.qoq : null,
    yoy:        typeof obj.yoy === 'number' ? obj.yoy : null,
    confidence: typeof obj.confidence === 'number' ? clamp(obj.confidence) : 50,
  };
}

export async function parseMetrics(pressReleaseText: string): Promise<{
  metrics: EarningsMetrics;
  overallConfidence: number;
}> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `${EXTRACTION_PROMPT}\n\n---\n${pressReleaseText}`,
    }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
  // Strip markdown code fences if Claude wraps response despite instructions
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(cleaned);

  return {
    metrics: {
      revenue:     parseMetricValue(parsed.revenue, 'revenue'),
      grossMargin: parseMetricValue(parsed.grossMargin, 'grossMargin'),
      doi:         parseMetricValue(parsed.doi, 'doi'),
    },
    overallConfidence: typeof parsed.overallConfidence === 'number'
      ? clamp(parsed.overallConfidence)
      : 50,
  };
}
