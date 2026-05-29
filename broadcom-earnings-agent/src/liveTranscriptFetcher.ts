import axios from 'axios';
import * as cheerio from 'cheerio';
import { fetchVideoTranscript } from './videoTranscriptFetcher';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36';

export interface LiveContentResult {
  content: string;
  source:  string;
}

async function tryMotleyFool(): Promise<LiveContentResult | null> {
  try {
    const listUrl = 'https://www.fool.com/earnings-call-transcripts/?symbol=AVGO';
    const listRes = await axios.get(listUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const $ = cheerio.load(listRes.data);

    let articleUrl: string | null = null;
    $('a').each((_i, el) => {
      if (articleUrl) return;
      const href = $(el).attr('href') ?? '';
      const text = $(el).text().toLowerCase();
      if (
        (text.includes('broadcom') || text.includes('avgo')) &&
        (text.includes('earn') || text.includes('transcript') || href.includes('avgo'))
      ) {
        articleUrl = href.startsWith('http') ? href : `https://www.fool.com${href}`;
      }
    });

    if (!articleUrl) return null;

    const pageRes = await axios.get(articleUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const $page = cheerio.load(pageRes.data);
    $page('script, style, noscript').remove();
    const content = $page('article').text().trim() || $page('main').text().trim();
    return content && content.length > 200 ? { content, source: 'Motley Fool' } : null;
  } catch {
    return null;
  }
}

async function trySeekingAlpha(targetQuarter: string): Promise<LiveContentResult | null> {
  try {
    const listUrl = 'https://seekingalpha.com/symbol/AVGO/transcripts';
    const listRes = await axios.get(listUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const $ = cheerio.load(listRes.data);

    const fyMatch = targetQuarter.match(/FY(\d{4})/i);
    const fyYear = fyMatch?.[1] ?? '';

    let articleUrl: string | null = null;

    // Look for transcript article matching the quarter
    $('a[href*="/article/"]').each((_i, el) => {
      if (articleUrl) return;
      const href = $(el).attr('href') ?? '';
      const text = $(el).text().toLowerCase();
      if (
        (text.includes('q2') || text.includes('second quarter')) &&
        (fyYear ? text.includes(fyYear) : true) &&
        (text.includes('earn') || text.includes('transcript'))
      ) {
        articleUrl = href.startsWith('http') ? href : `https://seekingalpha.com${href}`;
      }
    });

    // Fallback: look in JSON-LD schema data for the article URL
    if (!articleUrl) {
      try {
        const ldJson = $('script[type="application/ld+json"]').first().html() ?? '';
        const data = JSON.parse(ldJson);
        const items: any[] = Array.isArray(data['@graph']) ? data['@graph'] : [data];
        for (const item of items) {
          if (item.url && item.headline?.toLowerCase().includes('broadcom')) {
            articleUrl = item.url;
            break;
          }
        }
      } catch { /* ignore */ }
    }

    if (!articleUrl) return null;

    const pageRes = await axios.get(articleUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const $page = cheerio.load(pageRes.data);
    $page('script, style, noscript').remove();
    const content =
      $page('article').text().trim() ||
      $page('main').text().trim()    ||
      $page('body').text().trim();
    return content && content.length > 200 ? { content, source: 'Seeking Alpha' } : null;
  } catch {
    return null;
  }
}

/**
 * Attempts to fetch whatever partial transcript content is available during a live earnings call.
 * Unlike the post-call transcript fetcher, this accepts short/incomplete content —
 * the goal is progressive in-call updates, not a complete document.
 */
export async function fetchLivePartialContent(
  eventDate: Date,
  targetQuarter: string,
): Promise<LiveContentResult | null> {
  for (const fn of [
    tryMotleyFool,
    () => trySeekingAlpha(targetQuarter),
    () => fetchVideoTranscript(eventDate, targetQuarter),
  ]) {
    try {
      const result = await fn();
      if (result) return result;
    } catch { /* try next source */ }
  }
  return null;
}
