import axios from 'axios';
import * as cheerio from 'cheerio';

// SEC EDGAR is used as primary source — Dell's IR site blocks cloud server IPs.
// Dell files 8-K earnings press releases on EDGAR within minutes of announcement.
const EDGAR_SEARCH_URL = 'https://efts.sec.gov/LATEST/search-index';
const DELL_CIK = '1571996';

const EDGAR_HEADERS = {
  'User-Agent': 'DellEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)',
  'Accept': 'application/json, text/html',
};

const HTML_HEADERS = {
  'User-Agent': 'DellEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)',
  'Accept': 'text/html',
};

async function axiosGetWithRetry(url: string, headers: Record<string,string> = EDGAR_HEADERS, maxRetries = 3): Promise<import('axios').AxiosResponse> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await axios.get(url, { timeout: 20_000, headers });
      return res;
    } catch (err: unknown) {
      lastError = err;
      const status = (err as any)?.response?.status;
      console.warn(`[irFetcher] attempt ${attempt} failed for ${url} (status: ${status})`);
      await new Promise(r => setTimeout(r, attempt * 3000));
    }
  }
  throw lastError;
}

/**
 * Search SEC EDGAR for Dell 8-K filed within ±3 days of the event date.
 * Returns the URL of the earnings press release exhibit (99.1).
 */
async function findEdgarPressReleaseUrl(eventDate: Date): Promise<string | null> {
  const startDt = new Date(eventDate.getTime() - 3 * 86_400_000).toISOString().slice(0, 10);
  const endDt   = new Date(eventDate.getTime() + 3 * 86_400_000).toISOString().slice(0, 10);

  const searchUrl = `${EDGAR_SEARCH_URL}?q=%22Dell+Technologies%22&dateRange=custom&startdt=${startDt}&enddt=${endDt}&forms=8-K`;
  const res = await axiosGetWithRetry(searchUrl, EDGAR_HEADERS);
  const hits: any[] = res.data?.hits?.hits ?? [];

  // Find exhibit 99.1 (earnings press release) — prefer .htm with 'earnings' or 'exhibit99' in name
  for (const hit of hits) {
    const id: string = hit._id ?? '';
    const [accession, filename] = id.split(':');
    if (!filename) continue;
    const lc = filename.toLowerCase();
    if (lc.includes('exhibit99') || lc.includes('ex99') || lc.includes('earnings')) {
      const accPath = accession.replace(/-/g, '');
      return `https://www.sec.gov/Archives/edgar/data/${DELL_CIK}/${accPath}/${filename}`;
    }
  }
  return null;
}

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
  _targetQuarter: string,
): Promise<string | null> {
  console.log('[irFetcher] Searching SEC EDGAR for Dell 8-K press release...');
  const prUrl = await findEdgarPressReleaseUrl(eventDate);

  if (!prUrl) {
    console.warn('[irFetcher] No matching 8-K exhibit found on EDGAR yet.');
    return null;
  }

  console.log('[irFetcher] Found press release:', prUrl);
  const prResponse = await axiosGetWithRetry(prUrl, HTML_HEADERS);
  const $pr = cheerio.load(prResponse.data);

  // Remove script/style noise
  $pr('script, style, noscript').remove();
  const text =
    $pr('article').text().trim() ||
    $pr('main').text().trim()    ||
    $pr('body').text().trim();

  return text || null;
}
