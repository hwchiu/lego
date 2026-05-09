/**
 * Shared News API for Press Release data.
 *
 * Uses the same /getNewsSummary endpoint as Market News but filters results
 * by news_catg === "Official Press Release" (or a caller-supplied news type).
 *
 * This file is intentionally separate from market-news — it MUST NOT modify
 * any files under app/market-news/.
 */

import type { PressRelease } from '@/app/data/pressReleases';

// ─── Internal record shape returned by /getNewsSummary ───────────────────────

interface NewsSummaryRecord {
  news_date: string;
  co_cd: string;
  news_source: string;
  comp_tag_short_name: string;
  news_catg: string;
  news_content: string;
  news_url: string;
  news_title: string;
  update_date: string;
}

// ─── Default news type used by the press-release page ────────────────────────

export const PRESS_RELEASE_NEWS_TYPE = 'Official Press Release';

// ─── Internal API call ───────────────────────────────────────────────────────

async function callGetNewsSummary(
  params: { news_dt_from: string; news_dt_to: string; co_cd: string[] },
  signal?: AbortSignal,
): Promise<NewsSummaryRecord[]> {
  const res = await fetch('/getNewsSummary', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal,
  });
  if (!res.ok) throw new Error(`getNewsSummary failed: ${res.status}`);
  return res.json();
}

// ─── Mapper ──────────────────────────────────────────────────────────────────

function mapToPressRelease(record: NewsSummaryRecord, index: number): PressRelease {
  // Normalize 'YYYY-MM-DD HH:mm:ss' → 'YYYY-MM-DD'
  const dateStr = typeof record.news_date === 'string'
    ? record.news_date.split(' ')[0]
    : String(record.news_date);

  return {
    id: `pr-api-${record.co_cd}-${dateStr}-${index}`,
    title: record.news_title,
    company: record.comp_tag_short_name || record.co_cd,
    ticker: record.co_cd,
    relationship: 'customer' as const, // not available from API; kept for type compat
    industry: '',
    topics: [],
    trendingTopics: [],
    publishedAt: dateStr,
    summary: record.news_content,
    viewCount: 0,
    url: record.news_url,
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Returns today's date as 'YYYY-MM-DD' based on UTC time.
 * Note: the returned date is the current UTC date, which may differ from the
 * user's local date when their timezone offset places them past midnight UTC.
 */
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/** Subtracts `days` from a 'YYYY-MM-DD' string, returns 'YYYY-MM-DD' (UTC). */
export function subtractDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - days);
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${mm}-${dd}`;
}

/**
 * Subtracts `months` from a 'YYYY-MM-DD' string, returns 'YYYY-MM-DD'.
 * Uses pure arithmetic on year/month components (no Date object) to avoid
 * timezone issues. Clamps day to end of target month to avoid overflow
 * (e.g. Oct 31 − 1mo → Sep 30).
 */
export function subtractMonths(dateStr: string, months: number): string {
  const [origY, origM, origD] = dateStr.split('-').map(Number);
  // Convert to 0-indexed total months since year 0, subtract, then decompose
  const totalMonths = origY * 12 + (origM - 1) - months;
  const targetYear = Math.floor(totalMonths / 12);
  const normMonthIdx = totalMonths - targetYear * 12; // 0–11
  // Last day of target month in UTC
  const lastDay = new Date(Date.UTC(targetYear, normMonthIdx + 1, 0)).getUTCDate();
  const clampedDay = Math.min(origD, lastDay);
  const mm = String(normMonthIdx + 1).padStart(2, '0');
  const dd = String(clampedDay).padStart(2, '0');
  return `${targetYear}-${mm}-${dd}`;
}

/** Formats 'YYYY-MM-DD' → 'YYYY-MM-DD HH:mm:ss' for the API. */
function toApiDateTime(dateStr: string, endOfDay = false): string {
  return `${dateStr} ${endOfDay ? '23:59:59' : '00:00:00'}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface GetPressReleaseNewsParams {
  /** Company codes to filter by. Empty array = all companies. */
  co_cd: string[];
  /** Start date 'YYYY-MM-DD'. */
  from: string;
  /** End date 'YYYY-MM-DD'. */
  to: string;
  /** News category to filter by. Defaults to PRESS_RELEASE_NEWS_TYPE. */
  newsType?: string;
  /** Optional AbortSignal for cancellation. */
  signal?: AbortSignal;
}

/**
 * Fetch press release news using the shared /getNewsSummary API.
 *
 * Results are filtered to news_catg === newsType (default: "Official Press Release")
 * and sorted newest-first.
 */
export async function getPressReleaseNews(
  params: GetPressReleaseNewsParams,
): Promise<PressRelease[]> {
  const newsType = params.newsType ?? PRESS_RELEASE_NEWS_TYPE;

  const records = await callGetNewsSummary(
    {
      news_dt_from: toApiDateTime(params.from, false),
      news_dt_to: toApiDateTime(params.to, true),
      co_cd: params.co_cd,
    },
    params.signal,
  );

  return records
    .filter((r) => r.news_catg === newsType)
    .map((record, index) => mapToPressRelease(record, index))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
