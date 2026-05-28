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

async function fetchFromMotleyFool(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const searchUrl = 'https://www.fool.com/earnings-call-transcripts/?symbol=DELL';
  const response = await axios.get(searchUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36' },
  });
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
      transcriptUrl = href.startsWith('http') ? href : `https://www.fool.com${href}`;
    }
  });

  if (!transcriptUrl) return { kind: 'not_found_yet' };

  const pageResponse = await axios.get(transcriptUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36' },
  });
  const $page = cheerio.load(pageResponse.data);
  $page('script, style, noscript').remove();
  const text = $page('article').text().trim() || $page('main').text().trim();
  return text ? { kind: 'found', transcript: text } : { kind: 'not_found_yet' };
}

async function fetchFromEdgarTranscript(
  eventDate: Date,
  _targetQuarter: string,
): Promise<TranscriptFetchResult> {
  // Dell sometimes files an 8-K with the earnings call transcript as an exhibit
  const startDt = new Date(eventDate.getTime() - 1 * 86_400_000).toISOString().slice(0, 10);
  const endDt   = new Date(eventDate.getTime() + 5 * 86_400_000).toISOString().slice(0, 10);
  const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22Dell+Technologies%22+%22earnings+call%22&dateRange=custom&startdt=${startDt}&enddt=${endDt}&forms=8-K`;

  const res = await axios.get(searchUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'DellEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)' },
  });
  const hits: any[] = res.data?.hits?.hits ?? [];

  for (const hit of hits) {
    const id: string = hit._id ?? '';
    const [accession, filename] = id.split(':');
    if (!filename) continue;
    const lc = filename.toLowerCase();
    if (lc.includes('transcript') || lc.includes('exhibit99') || lc.includes('script')) {
      const accPath = accession.replace(/-/g, '');
      const url = `https://www.sec.gov/Archives/edgar/data/1571996/${accPath}/${filename}`;
      const pageResponse = await axios.get(url, {
        timeout: 15_000,
        headers: { 'User-Agent': 'DellEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)' },
      });
      const $page = cheerio.load(pageResponse.data);
      $page('script, style').remove();
      const text = $page('body').text().trim();
      if (text) return { kind: 'found', transcript: text };
    }
  }
  return { kind: 'not_found_yet' };
}

export async function fetchTranscript(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const results: TranscriptFetchResult[] = [];

  for (const source of [fetchFromMotleyFool, fetchFromEdgarTranscript]) {
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
