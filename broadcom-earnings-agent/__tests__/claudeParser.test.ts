import { parseMetrics, _setFormatReferenceForTesting } from '../src/claudeParser';
import * as aiClient from '../src/aiClient';

jest.mock('../src/aiClient');
const mockChatComplete = aiClient.chatComplete as jest.MockedFunction<typeof aiClient.chatComplete>;

function mockAIResponse(text: string) {
  mockChatComplete.mockResolvedValue(text);
}

const VALID_RESPONSE = JSON.stringify({
  revenue:     { value: 14.9, unit: 'B',    qoq: 1.2,  yoy: 4.3,  confidence: 95 },
  grossMargin: { value: 69.1, unit: '%',    qoq: -0.3, yoy: 1.1,  confidence: 90 },
  doi:         { value: 52,   unit: 'days', qoq: -3,   yoy: -5,   confidence: 85 },
  overallConfidence: 90,
});

beforeEach(() => {
  mockChatComplete.mockClear();
  _setFormatReferenceForTesting(null);
});

describe('parseMetrics — baseline behavior', () => {
  it('parses a valid full response', async () => {
    mockAIResponse(VALID_RESPONSE);
    const result = await parseMetrics('some press release text');
    expect(result.metrics.revenue?.value).toBe(14.9);
    expect(result.metrics.grossMargin?.value).toBe(69.1);
    expect(result.metrics.doi?.value).toBe(52);
    expect(result.overallConfidence).toBe(90);
  });

  it('returns null metrics for null fields', async () => {
    mockAIResponse(JSON.stringify({ revenue: null, grossMargin: null, doi: null, overallConfidence: 20 }));
    const result = await parseMetrics('text');
    expect(result.metrics.revenue).toBeNull();
    expect(result.metrics.doi).toBeNull();
  });

  it('strips markdown fences before parsing', async () => {
    mockAIResponse('```json\n' + VALID_RESPONSE + '\n```');
    const result = await parseMetrics('text');
    expect(result.metrics.revenue?.value).toBe(14.9);
  });

  it('throws on malformed JSON', async () => {
    mockAIResponse('this is not json');
    await expect(parseMetrics('text')).rejects.toThrow();
  });
});

describe('parseMetrics — format reference injection', () => {
  it('passes generic prompt when no format reference is set', async () => {
    mockAIResponse(VALID_RESPONSE);
    await parseMetrics('text');
    const [systemPrompt] = mockChatComplete.mock.calls[0];
    expect(systemPrompt).not.toContain('FIELD HINTS');
  });

  it('passes generic prompt when fieldMap is empty', async () => {
    _setFormatReferenceForTesting({ generatedAt: '2026-05-29T00:00:00Z', fieldMap: {}, fewShotExamples: [] });
    mockAIResponse(VALID_RESPONSE);
    await parseMetrics('text');
    const [systemPrompt] = mockChatComplete.mock.calls[0];
    expect(systemPrompt).not.toContain('FIELD HINTS');
  });

  it('injects FIELD HINTS section when format reference is available', async () => {
    _setFormatReferenceForTesting({
      generatedAt: '2026-05-29T00:00:00Z',
      fieldMap: {
        doi:         { tableTitle: 'Supplemental Data', rowLabel: 'Days inventory outstanding', unit: 'days' },
        revenue:     { rowLabel: 'Net revenue',         unit: 'B'    },
        grossMargin: { rowLabel: 'Non-GAAP gross margin', unit: '%'  },
      },
      fewShotExamples: [],
    });
    mockAIResponse(VALID_RESPONSE);
    await parseMetrics('text');
    const [systemPrompt] = mockChatComplete.mock.calls[0];
    expect(systemPrompt).toContain('FIELD HINTS');
    expect(systemPrompt).toContain('Days inventory outstanding');
    expect(systemPrompt).toContain('Net revenue');
    expect(systemPrompt).toContain('Non-GAAP gross margin');
  });

  it('injects ONE-SHOT EXAMPLE when fewShotExamples are available', async () => {
    _setFormatReferenceForTesting({
      generatedAt: '2026-05-29T00:00:00Z',
      fieldMap: {
        doi:         { tableTitle: 'Supplemental Data', rowLabel: 'Days inventory outstanding', unit: 'days' },
        revenue:     { rowLabel: 'Net revenue',         unit: 'B'    },
        grossMargin: { rowLabel: 'Non-GAAP gross margin', unit: '%'  },
      },
      fewShotExamples: [
        {
          quarter: 'Q1 FY2026',
          rawExcerpt: 'Net revenue | 14.9 | 14.1\nDays inventory outstanding | 52 | 55',
          extractedMetrics: { revenue: { value: 14.9, unit: 'B' }, grossMargin: { value: 69.0, unit: '%' }, doi: { value: 52, unit: 'days' } },
        },
      ],
    });
    mockAIResponse(VALID_RESPONSE);
    await parseMetrics('text');
    const [systemPrompt] = mockChatComplete.mock.calls[0];
    expect(systemPrompt).toContain('ONE-SHOT EXAMPLE');
    expect(systemPrompt).toContain('Q1 FY2026');
  });
});
