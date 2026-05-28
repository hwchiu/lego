// dell-earnings-agent/__tests__/eventDateResolver.test.ts
import { resolveEventDate } from '../src/eventDateResolver';
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

function mockClaudeFailure() {
  MockAnthropic.prototype.messages = {
    create: jest.fn().mockRejectedValue(new Error('API error')),
  } as any;
}

const EXACT_FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

describe('resolveEventDate', () => {
  beforeEach(() => MockAnthropic.mockClear());

  it('returns EARNINGS_DATE env var when skipClaude=true', async () => {
    process.env.EARNINGS_DATE = '2026-05-29T20:30:00Z';
    const result = await resolveEventDate({ skipClaude: true });
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });

  it('throws FATAL with exact message when no env var and skipClaude=true', async () => {
    delete process.env.EARNINGS_DATE;
    await expect(resolveEventDate({ skipClaude: true })).rejects.toThrow(EXACT_FATAL);
  });

  it('throws FATAL with exact message when EARNINGS_DATE is not a valid ISO datetime', async () => {
    process.env.EARNINGS_DATE = 'not-a-date';
    await expect(resolveEventDate({ skipClaude: true })).rejects.toThrow(EXACT_FATAL);
    delete process.env.EARNINGS_DATE;
  });

  it('throws FATAL with exact message when EARNINGS_DATE has no T separator (date-only string)', async () => {
    process.env.EARNINGS_DATE = '2026-05-29';
    await expect(resolveEventDate({ skipClaude: true })).rejects.toThrow(EXACT_FATAL);
    delete process.env.EARNINGS_DATE;
  });

  it('returns Claude result and ignores EARNINGS_DATE when Claude succeeds', async () => {
    process.env.EARNINGS_DATE = '2026-01-01T00:00:00Z';  // different from Claude result
    mockClaudeResponse('2026-05-29T20:30:00Z');
    const result = await resolveEventDate();
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });

  it('falls back to EARNINGS_DATE when Claude API call rejects', async () => {
    process.env.EARNINGS_DATE = '2026-05-29T20:30:00Z';
    mockClaudeFailure();
    const result = await resolveEventDate();
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });
});
