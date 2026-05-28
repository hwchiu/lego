import axios from 'axios';
import * as cheerio from 'cheerio';

const DELL_IR_NEWS_URL = 'https://investors.delltechnologies.com/news-releases';

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
}

const QUARTER_TOKENS = ['q1', 'first quarter', '1st quarter'];
const FISCAL_YEAR_TOKENS = ['fy2027', 'fiscal 2027', 'fiscal year 2027'];

function hasQuarterToken(norm: string): boolean {
  return QUARTER_TOKENS.some(t => norm.includes(t));
}

function hasFiscalYearToken(norm: string): boolean {
  return FISCAL_YEAR_TOKENS.some(t => norm.includes(t));
}

/**
 * Returns true if titleOrUrl matches the target quarter/year AND
 * publishDateStr is within ±3 UTC calendar days of eventDate.
 * publishDateStr may be a full ISO string or 'YYYY-MM-DD'.
 */
export function matchesPressRelease(
  titleOrUrl: string,
  publishDateStr: string,
  eventDate: Date,
  _targetQuarter: string,
): boolean {
  const norm = normalizeText(titleOrUrl);
  if (!hasQuarterToken(norm) || !hasFiscalYearToken(norm)) return false;

  const publishDay = new Date(publishDateStr.slice(0, 10) + 'T00:00:00Z');
  const eventDay = new Date(
    Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()),
  );
  const diffDays = Math.abs((publishDay.getTime() - eventDay.getTime()) / 86_400_000);
  return diffDays <= 3;
}

export async function fetchPressRelease(
  eventDate: Date,
  targetQuarter: string,
): Promise<string | null> {
  const listResponse = await axios.get(DELL_IR_NEWS_URL, {
    timeout: 15_000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; DellEarningsAgent/1.0)',
    },
  });
  const $ = cheerio.load(listResponse.data);

  let pressReleaseUrl: string | null = null;

  $('a').each((_i, el) => {
    if (pressReleaseUrl) return;
    const title = $(el).text().trim();
    const href  = $(el).attr('href') ?? '';
    // Try to find a date in a nearby time element or fallback to eventDate
    const dateText =
      $(el).closest('li, article, tr, div').find('time').attr('datetime') ??
      $(el).parent().text().match(/\d{4}-\d{2}-\d{2}/)?.[0] ??
      eventDate.toISOString().slice(0, 10);

    if (matchesPressRelease(title + ' ' + href, dateText, eventDate, targetQuarter)) {
      pressReleaseUrl = href.startsWith('http') ? href : `https://investors.delltechnologies.com${href}`;
    }
  });

  if (!pressReleaseUrl) return null;

  const prResponse = await axios.get(pressReleaseUrl, {
    timeout: 15_000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; DellEarningsAgent/1.0)',
    },
  });
  const $pr = cheerio.load(prResponse.data);
  const text =
    $pr('article').text().trim() ||
    $pr('main').text().trim()    ||
    $pr('body').text().trim();

  return text || null;
}
