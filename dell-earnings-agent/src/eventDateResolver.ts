import { chatComplete } from './aiClient';

interface Options {
  skipAI?: boolean;  // set true in tests to skip actual API call
}

const FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

function isValidIsoDatetime(s: string): boolean {
  return s.includes('T') && !isNaN(new Date(s).getTime());
}

export async function resolveEventDate(opts: Options = {}): Promise<string> {
  // Env var takes priority — set EARNINGS_DATE in .env for production
  const envDate = process.env.EARNINGS_DATE?.trim() ?? '';
  if (isValidIsoDatetime(envDate)) return envDate;

  if (!opts.skipAI) {
    try {
      const text = await chatComplete(
        'You are a financial calendar assistant. Reply with ONLY an ISO 8601 UTC datetime string, no other text.',
        [
          'What is the scheduled date and time (UTC) for Dell Technologies Q1 FY2027 earnings release?',
          'Reply with ONLY an ISO 8601 UTC datetime string like: 2026-05-29T20:30:00Z',
          'If you are unsure of the exact time, use 20:30:00Z as an after-market-close estimate.',
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
