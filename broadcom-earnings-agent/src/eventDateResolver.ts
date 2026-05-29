import { chatComplete } from './aiClient';

interface Options {
  skipAI?: boolean;
}

const FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

function isValidIsoDatetime(s: string): boolean {
  return s.includes('T') && !isNaN(new Date(s).getTime());
}

export async function resolveEventDate(opts: Options = {}): Promise<string> {
  const envDate = process.env.EARNINGS_DATE?.trim() ?? '';
  if (isValidIsoDatetime(envDate)) return envDate;

  if (!opts.skipAI) {
    try {
      const text = await chatComplete(
        'You are a financial calendar assistant. Reply with ONLY an ISO 8601 UTC datetime string, no other text.',
        [
          'What is the scheduled date and time (UTC) for Broadcom Inc. (AVGO) Q2 FY2026 earnings release?',
          'Reply with ONLY an ISO 8601 UTC datetime string like: 2026-06-03T21:00:00Z',
          'If you are unsure of the exact time, use 21:00:00Z as an after-market-close estimate.',
        ].join('\n'),
        64,
      );
      if (isValidIsoDatetime(text)) return text;
    } catch (e) {
      console.warn('[eventDateResolver] AI failed, falling back to env var:', e);
    }
  }

  throw new Error(FATAL);
}
