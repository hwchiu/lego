import axios from 'axios';
import * as cheerio from 'cheerio';

const EDGAR_SEARCH_URL = 'https://efts.sec.gov/LATEST/search-index';
const AVGO_CIK = '1054374';

const EDGAR_HEADERS = {
  'User-Agent': 'BroadcomEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)',
  'Accept': 'application/json, text/html',
};

const HTML_HEADERS = {
  'User-Agent': 'BroadcomEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)',
  'Accept': 'text/html',
};

async function axiosGetWithRetry(
  url: string,
  headers: Record<string, string> = EDGAR_HEADERS,
  maxRetries = 3,
): Promise<import('axios').AxiosResponse> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await axios.get(url, { timeout: 20_000, headers });
    } catch (err: unknown) {
      lastError = err;
      const status = (err as any)?.response?.status;
      console.warn(`[avgoIRFetcher] attempt ${attempt} failed for ${url} (status: ${status})`);
      await new Promise(r => setTimeout(r, attempt * 3000));
    }
  }
  throw lastError;
}

async function findEdgarPressReleaseUrl(eventDate: Date): Promise<string | null> {
  const startDt = new Date(eventDate.getTime() - 3 * 86_400_000).toISOString().slice(0, 10);
  const endDt   = new Date(eventDate.getTime() + 3 * 86_400_000).toISOString().slice(0, 10);

  const searchUrl = `${EDGAR_SEARCH_URL}?q=%22Broadcom%22&dateRange=custom&startdt=${startDt}&enddt=${endDt}&forms=8-K`;
  const res = await axiosGetWithRetry(searchUrl, EDGAR_HEADERS);
  const hits: any[] = res.data?.hits?.hits ?? [];

  for (const hit of hits) {
    const id: string = hit._id ?? '';
    const [accession, filename] = id.split(':');
    if (!filename) continue;
    const lc = filename.toLowerCase();
    if (lc.includes('exhibit99') || lc.includes('ex99') || lc.includes('earnings')) {
      const accPath = accession.replace(/-/g, '');
      return `https://www.sec.gov/Archives/edgar/data/${AVGO_CIK}/${accPath}/${filename}`;
    }
  }
  return null;
}

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
}

export async function fetchPressRelease(
  eventDate: Date,
  _targetQuarter: string,
): Promise<string | null> {
  console.log('[avgoIRFetcher] Searching SEC EDGAR for Broadcom 8-K press release...');
  const prUrl = await findEdgarPressReleaseUrl(eventDate);

  if (!prUrl) {
    console.warn('[avgoIRFetcher] No matching 8-K exhibit found on EDGAR yet.');
    return null;
  }

  console.log('[avgoIRFetcher] Found press release:', prUrl);
  const prResponse = await axiosGetWithRetry(prUrl, HTML_HEADERS);
  const $pr = cheerio.load(prResponse.data);

  $pr('script, style, noscript').remove();
  const text =
    $pr('article').text().trim() ||
    $pr('main').text().trim()    ||
    $pr('body').text().trim();

  return text || null;
}
