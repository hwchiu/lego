import axios from 'axios';
import * as cheerio from 'cheerio';
import { TranscriptFetchResult } from './types';
import { normalizeText } from './dellIRFetcher';

const QUARTER_TOKENS = ['q1', 'first quarter', '1st quarter'];

/**
 * Returns all valid year tokens for transcript matching:
 * fiscal-year tokens, plain FY label year, and event calendar year.
 */
export function getTranscriptYearTokens(targetQuarter: string, eventDate: Date): string[] {
  const fyMatch = targetQuarter.match(/FY(\d{4})/i);
  const fyLabelYear = fyMatch?.[1] ?? '';
  const eventCalYear = String(eventDate.getUTCFullYear());

  const tokens: string[] = [];
  if (fyLabelYear) {
    tokens.push(`fy${fyLabelYear}`);
    tokens.push(`fiscal ${fyLabelYear}`);
    tokens.push(`fiscal year ${fyLabelYear}`);
    tokens.push(fyLabelYear);
  }
  if (eventCalYear && eventCalYear !== fyLabelYear) {
    tokens.push(eventCalYear);
  }
  return [...new Set(tokens)];
}

export function matchesTranscript(
  titleOrUrl: string,
  pageDateStr: string,
  eventDate: Date,
  targetQuarter: string,
): boolean {
  const norm = normalizeText(titleOrUrl);

  const hasQuarter = QUARTER_TOKENS.some(t => norm.includes(t));
  if (!hasQuarter) return false;

  const yearTokens = getTranscriptYearTokens(targetQuarter, eventDate);
  const hasYear = yearTokens.some(t => norm.includes(normalizeText(t)));
  if (!hasYear) return false;

  // Page date must be on or after eventDate (UTC day granularity)
  const pageDay = new Date(pageDateStr.slice(0, 10) + 'T00:00:00Z');
  const eventDay = new Date(
    Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()),
  );
  return pageDay.getTime() >= eventDay.getTime();
}

async function fetchFromDellIR(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const response = await axios.get(
    'https://investors.delltechnologies.com/news-releases',
    { timeout: 15_000 },
  );
  const $ = cheerio.load(response.data);

  let transcriptUrl: string | null = null;
  $('a').each((_i, el) => {
    if (transcriptUrl) return;
    const text = $(el).text().trim();
    const href = $(el).attr('href') ?? '';
    const dateText =
      $(el).closest('li, article, tr, div').find('time').attr('datetime') ??
      eventDate.toISOString().slice(0, 10);
    if (matchesTranscript(text + ' ' + href, dateText, eventDate, targetQuarter)) {
      transcriptUrl = href.startsWith('http') ? href : `https://investors.delltechnologies.com${href}`;
    }
  });

  if (!transcriptUrl) return { kind: 'not_found_yet' };

  const pageResponse = await axios.get(transcriptUrl, { timeout: 15_000 });
  const $page = cheerio.load(pageResponse.data);
  const text = $page('article').text().trim() || $page('main').text().trim();
  return text ? { kind: 'found', transcript: text } : { kind: 'not_found_yet' };
}

async function fetchFromSeekingAlpha(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const response = await axios.get(
    'https://seekingalpha.com/symbol/DELL/earnings/transcripts',
    { timeout: 15_000, headers: { 'User-Agent': 'Mozilla/5.0' } },
  );
  const $ = cheerio.load(response.data);

  let transcriptUrl: string | null = null;
  $('a').each((_i, el) => {
    if (transcriptUrl) return;
    const text = $(el).text().trim();
    const href = $(el).attr('href') ?? '';
    const dateText =
      $(el).closest('li, article, tr, div').find('time').attr('datetime') ??
      $(el).parent().text().match(/\d{4}-\d{2}-\d{2}/)?.[0] ??
      eventDate.toISOString().slice(0, 10);
    if (matchesTranscript(text + ' ' + href, dateText, eventDate, targetQuarter)) {
      transcriptUrl = href.startsWith('http') ? href : `https://seekingalpha.com${href}`;
    }
  });

  if (!transcriptUrl) return { kind: 'not_found_yet' };

  const pageResponse = await axios.get(transcriptUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const $page = cheerio.load(pageResponse.data);
  const text =
    $page('article').text().trim() ||
    $page('[data-test-id="article-content"]').text().trim();
  return text ? { kind: 'found', transcript: text } : { kind: 'not_found_yet' };
}

export async function fetchTranscript(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const results: TranscriptFetchResult[] = [];

  for (const source of [fetchFromDellIR, fetchFromSeekingAlpha]) {
    try {
      const result = await source(eventDate, targetQuarter);
      if (result.kind === 'found') return result;
      results.push(result);
    } catch (e) {
      results.push({ kind: 'error', message: String(e) });
    }
  }

  // Precedence: found > not_found_yet > error
  if (results.some(r => r.kind === 'not_found_yet')) return { kind: 'not_found_yet' };
  const errors = results.filter(
    (r): r is { kind: 'error'; message: string } => r.kind === 'error',
  );
  return { kind: 'error', message: errors.map(e => e.message).join('; ') };
}
