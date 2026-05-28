// dell-earnings-agent/__tests__/claudeParser.test.ts
import { parseMetrics } from '../src/claudeParser';
import * as aiClient from '../src/aiClient';

jest.mock('../src/aiClient');
const mockChatComplete = aiClient.chatComplete as jest.MockedFunction<typeof aiClient.chatComplete>;

function mockAIResponse(text: string) {
  mockChatComplete.mockResolvedValue(text);
}

describe('parseMetrics', () => {
  beforeEach(() => mockChatComplete.mockClear());

  it('parses full valid Claude response', async () => {
    mockAIResponse(JSON.stringify({
      revenue:     { value: 23.9, unit: 'B',    qoq: 2.3,  yoy: 5.1,  confidence: 95 },
      grossMargin: { value: 22.1, unit: '%',    qoq: -0.4, yoy: 1.2,  confidence: 88 },
      doi:         { value: 34,   unit: 'days', qoq: -2,   yoy: -3,   confidence: 72 },
      overallConfidence: 85,
    }));
    const result = await parseMetrics('press release text');
    expect(result.metrics.revenue?.value).toBe(23.9);
    expect(result.metrics.revenue?.unit).toBe('B');
    expect(result.metrics.grossMargin?.value).toBe(22.1);
    expect(result.metrics.doi?.value).toBe(34);
    expect(result.overallConfidence).toBe(85);
  });

  it('returns null metrics for null fields', async () => {
    mockAIResponse(JSON.stringify({
      revenue: null, grossMargin: null, doi: null,
      overallConfidence: 20,
    }));
    const result = await parseMetrics('empty text');
    expect(result.metrics.revenue).toBeNull();
    expect(result.metrics.grossMargin).toBeNull();
    expect(result.metrics.doi).toBeNull();
    expect(result.overallConfidence).toBe(20);
  });

  it('strips markdown fences before parsing', async () => {
    mockAIResponse('```json\n' + JSON.stringify({
      revenue: { value: 10, unit: 'B', qoq: null, yoy: null, confidence: 80 },
      grossMargin: null, doi: null, overallConfidence: 70,
    }) + '\n```');
    const result = await parseMetrics('text');
    expect(result.metrics.revenue?.value).toBe(10);
  });

  it('throws on malformed JSON from Claude', async () => {
    mockAIResponse('this is not json at all');
    await expect(parseMetrics('text')).rejects.toThrow();
  });

  it('normalises unknown unit to field-appropriate default', async () => {
    mockAIResponse(JSON.stringify({
      revenue:     { value: 23.9, unit: 'USD billions', qoq: null, yoy: null, confidence: 80 },
      grossMargin: { value: 22.1, unit: 'percent',      qoq: null, yoy: null, confidence: 80 },
      doi:         { value: 34,   unit: 'calendar days', qoq: null, yoy: null, confidence: 80 },
      overallConfidence: 75,
    }));
    const result = await parseMetrics('text');
    expect(result.metrics.revenue?.unit).toBe('B');
    expect(result.metrics.grossMargin?.unit).toBe('%');
    expect(result.metrics.doi?.unit).toBe('days');
  });

  it('clamps confidence to 0–100', async () => {
    mockAIResponse(JSON.stringify({
      revenue: { value: 10, unit: 'B', qoq: null, yoy: null, confidence: 150 },
      grossMargin: null, doi: null, overallConfidence: -5,
    }));
    const result = await parseMetrics('text');
    expect(result.metrics.revenue!.confidence).toBe(100);
    expect(result.overallConfidence).toBe(0);
  });

  it('throws when AI call rejects', async () => {
    mockChatComplete.mockRejectedValue(new Error('API unavailable'));
    await expect(parseMetrics('text')).rejects.toThrow('API unavailable');
  });
});
