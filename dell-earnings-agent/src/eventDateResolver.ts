import Anthropic from '@anthropic-ai/sdk';

interface Options {
  skipClaude?: boolean;  // set true in tests to skip actual API call
}

const FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

function isValidIsoDatetime(s: string): boolean {
  return s.includes('T') && !isNaN(new Date(s).getTime());
}

export async function resolveEventDate(opts: Options = {}): Promise<string> {
  if (!opts.skipClaude) {
    try {
      const client = new Anthropic();
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [
            'What is the scheduled date and time (UTC) for Dell Technologies Q1 FY2027 earnings release?',
            'Reply with ONLY an ISO 8601 UTC datetime string like: 2026-05-29T20:30:00Z',
            'If you are unsure of the exact time, use 20:30:00Z as an after-market-close estimate.',
            'Do not include any other text.',
          ].join('\n'),
        }],
      });
      const text = response.content[0]?.type === 'text'
        ? response.content[0].text.trim()
        : '';
      if (isValidIsoDatetime(text)) return text;
    } catch (e) {
      console.warn('[eventDateResolver] Claude failed, falling back to env var:', e);
    }
  }

  const envDate = process.env.EARNINGS_DATE?.trim() ?? '';
  if (isValidIsoDatetime(envDate)) return envDate;

  throw new Error(FATAL);
}
