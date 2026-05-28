// dell-earnings-agent/__tests__/claudeTranscriptSummarizer.test.ts
import { summarizeTranscript } from '../src/claudeTranscriptSummarizer';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');
const MockAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

function mockClaudeResponse(text: string) {
  MockAnthropic.prototype.messages = {
    create: jest.fn().mockResolvedValue({
      content: [{ type: 'text', text }],
    }),
  } as any;
}

describe('summarizeTranscript', () => {
  beforeEach(() => MockAnthropic.mockClear());

  it('returns structured TranscriptSummary from valid Claude response', async () => {
    mockClaudeResponse(JSON.stringify({
      highlights: ['Revenue beat by 3%', 'AI server demand strong'],
      risks:      ['Margin pressure from DRAM costs'],
      outlook:    'Q2 guidance raised on ISG strength.',
      keyQuotes:  ['CEO: "AI demand exceeds expectations"'],
    }));
    const result = await summarizeTranscript('transcript text');
    expect(result.highlights).toHaveLength(2);
    expect(result.risks).toHaveLength(1);
    expect(typeof result.outlook).toBe('string');
    expect(result.keyQuotes).toHaveLength(1);
  });

  it('tolerates missing array fields (defaults to empty array)', async () => {
    mockClaudeResponse(JSON.stringify({
      highlights: [],
      risks: null,
      outlook: 'Some outlook.',
      keyQuotes: undefined,
    }));
    const result = await summarizeTranscript('text');
    expect(result.risks).toEqual([]);
    expect(result.keyQuotes).toEqual([]);
  });

  it('strips markdown fences before parsing', async () => {
    mockClaudeResponse('```json\n' + JSON.stringify({
      highlights: ['One highlight'],
      risks: [],
      outlook: 'Stable.',
      keyQuotes: [],
    }) + '\n```');
    const result = await summarizeTranscript('text');
    expect(result.highlights[0]).toBe('One highlight');
  });

  it('throws on malformed JSON', async () => {
    mockClaudeResponse('not json');
    await expect(summarizeTranscript('text')).rejects.toThrow();
  });
});
