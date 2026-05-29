import * as fs from 'fs';
import * as path from 'path';
import { chatComplete } from './aiClient';
import { EarningsMetrics, MetricValue } from './types';

// ─── Format reference (loaded once at startup) ────────────────────────────────

interface FieldEntry {
  tableTitle?: string;
  rowLabel:    string;
  unit:        string;
}

interface FewShotExample {
  quarter:          string;
  rawExcerpt:       string;
  extractedMetrics: unknown;
}

export interface FormatReference {
  generatedAt:    string;
  fieldMap:       Record<string, FieldEntry>;
  fewShotExamples: FewShotExample[];
}

// Resolved relative to compiled dist/claudeParser.js → ../scripts/format-reference.json
// __dirname in dist/ is <project-root>/dist, so ../scripts resolves to <project-root>/scripts
const FORMAT_REFERENCE_PATH = path.resolve(__dirname, '..', 'scripts', 'format-reference.json');

let _cachedRef: FormatReference | null | undefined = undefined;

function loadFormatReference(): FormatReference | null {
  if (_cachedRef !== undefined) return _cachedRef;
  try {
    const raw = fs.readFileSync(FORMAT_REFERENCE_PATH, 'utf8');
    _cachedRef = JSON.parse(raw) as FormatReference;
    console.log('[claudeParser] Loaded format reference from', FORMAT_REFERENCE_PATH);
  } catch {
    console.warn('[claudeParser] format-reference.json not found — using generic prompt');
    _cachedRef = null;
  }
  return _cachedRef;
}

/** Exposed for testing only — overrides the cached format reference. */
export function _setFormatReferenceForTesting(ref: FormatReference | null): void {
  _cachedRef = ref;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

const BASE_EXTRACTION_PROMPT = `You are a financial data extraction assistant.
Extract the following metrics from the provided Broadcom press release text and return ONLY valid JSON.
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

function buildExtractionPrompt(ref: FormatReference | null): string {
  if (!ref || Object.keys(ref.fieldMap).length === 0) {
    return BASE_EXTRACTION_PROMPT;
  }

  const fm = ref.fieldMap;
  const fieldHints = [
    fm.revenue     && `- Revenue:        look for row label "${fm.revenue.rowLabel}"`,
    fm.grossMargin && `- Gross margin:   look for row label "${fm.grossMargin.rowLabel}"`,
    fm.doi         && `- DOI:            look for row label "${fm.doi.rowLabel}"${fm.doi.tableTitle ? ` in table "${fm.doi.tableTitle}"` : ''}`,
  ].filter(Boolean).join('\n');

  let shotSection = '';
  const firstExample = ref.fewShotExamples?.[0];
  if (firstExample) {
    shotSection = `
--- ONE-SHOT EXAMPLE (${firstExample.quarter}) ---
Input excerpt:
${firstExample.rawExcerpt}

Expected output:
${JSON.stringify(firstExample.extractedMetrics, null, 2)}
--- END EXAMPLE ---
`;
  }

  return `${BASE_EXTRACTION_PROMPT}

--- FIELD HINTS (from historical Broadcom reports) ---
${fieldHints}
---
${shotSection}`;
}

// ─── Core extraction ──────────────────────────────────────────────────────────

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
  const ref    = loadFormatReference();
  const prompt = buildExtractionPrompt(ref);
  const text   = await chatComplete(prompt, pressReleaseText, 1024);
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
