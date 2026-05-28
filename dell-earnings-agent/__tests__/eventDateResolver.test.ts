// dell-earnings-agent/__tests__/eventDateResolver.test.ts
import { resolveEventDate } from '../src/eventDateResolver';
import * as aiClient from '../src/aiClient';

jest.mock('../src/aiClient');
const mockChatComplete = aiClient.chatComplete as jest.MockedFunction<typeof aiClient.chatComplete>;

function mockAIResponse(text: string) {
  mockChatComplete.mockResolvedValue(text);
}

function mockAIFailure() {
  mockChatComplete.mockRejectedValue(new Error('API error'));
}

const EXACT_FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

describe('resolveEventDate', () => {
  beforeEach(() => mockChatComplete.mockClear());

  it('returns EARNINGS_DATE env var when skipAI=true', async () => {
    process.env.EARNINGS_DATE = '2026-05-29T20:30:00Z';
    const result = await resolveEventDate({ skipAI: true });
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });

  it('throws FATAL with exact message when no env var and skipAI=true', async () => {
    delete process.env.EARNINGS_DATE;
    await expect(resolveEventDate({ skipAI: true })).rejects.toThrow(EXACT_FATAL);
  });

  it('throws FATAL with exact message when EARNINGS_DATE is not a valid ISO datetime', async () => {
    process.env.EARNINGS_DATE = 'not-a-date';
    await expect(resolveEventDate({ skipAI: true })).rejects.toThrow(EXACT_FATAL);
    delete process.env.EARNINGS_DATE;
  });

  it('throws FATAL with exact message when EARNINGS_DATE has no T separator (date-only string)', async () => {
    process.env.EARNINGS_DATE = '2026-05-29';
    await expect(resolveEventDate({ skipAI: true })).rejects.toThrow(EXACT_FATAL);
    delete process.env.EARNINGS_DATE;
  });

  it('returns AI result only when EARNINGS_DATE env var is missing', async () => {
    delete process.env.EARNINGS_DATE;
    mockAIResponse('2026-05-29T20:30:00Z');
    const result = await resolveEventDate();
    expect(result).toBe('2026-05-29T20:30:00Z');
  });

  it('returns EARNINGS_DATE and skips AI when env var is set', async () => {
    process.env.EARNINGS_DATE = '2026-05-29T20:30:00Z';
    // AI should never be called
    const result = await resolveEventDate();
    expect(mockChatComplete).not.toHaveBeenCalled();
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });
});
