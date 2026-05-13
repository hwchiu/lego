import rawContent from '@/content/press-releases.md';
import { extractJson } from '@/app/lib/parseContent';

export interface PressRelease {
  id: string;
  title: string;
  company: string;
  ticker: string;
  relationship: 'customer' | 'supplier';
  industry: string;
  topics: string[];
  trendingTopics: string[];
  publishedAt: string; // ISO date string YYYY-MM-DD
  summary: string;
  viewCount: number;
  url: string; // Source URL for the press release
}

export const pressReleases: PressRelease[] = extractJson<PressRelease[]>(rawContent);

// All unique topics across all press releases
export const allTopics: string[] = Array.from(
  new Set(pressReleases.flatMap((pr) => pr.topics)),
).sort();

// Count per topic
export function getTopicCounts(items: PressRelease[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const pr of items) {
    for (const topic of pr.topics) {
      counts[topic] = (counts[topic] ?? 0) + 1;
    }
  }
  return counts;
}

export type TimelineGranularity = 'year' | 'quarter' | 'month';

export interface TimelineGroup {
  key: string; // e.g. "2024", "2024-Q2", "2024-03"
  label: string; // e.g. "2024", "Q2 2024", "Mar 2024"
  total: number;
  topArticles: PressRelease[];
  items: PressRelease[];
}

function getGroupKey(date: Date, granularity: TimelineGranularity): string {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-indexed
  if (granularity === 'year') return `${y}`;
  if (granularity === 'quarter') return `${y}-Q${Math.floor(m / 3) + 1}`;
  const mm = String(m + 1).padStart(2, '0');
  return `${y}-${mm}`;
}

function getGroupLabel(
  key: string,
  granularity: TimelineGranularity,
  lang: 'zh' | 'en' = 'en',
): string {
  if (granularity === 'year') return lang === 'zh' ? `${key} 年` : key;
  if (granularity === 'quarter') {
    const [year, q] = key.split('-');
    return lang === 'zh' ? `${year} 年 ${q}` : `${q} ${year}`;
  }
  const [year, month] = key.split('-');
  if (lang === 'zh') {
    const zhMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return `${year} 年 ${zhMonths[parseInt(month, 10) - 1]}`;
  }
  const enMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${enMonths[parseInt(month, 10) - 1]} ${year}`;
}

export function groupByTimeline(
  items: PressRelease[],
  granularity: TimelineGranularity,
  maxCards = 2,
  lang: 'zh' | 'en' = 'en',
): TimelineGroup[] {
  const map = new Map<string, PressRelease[]>();

  for (const pr of items) {
    const date = new Date(pr.publishedAt);
    const key = getGroupKey(date, granularity);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(pr);
  }

  // Sort keys newest first
  const sortedKeys = Array.from(map.keys()).sort((a, b) => (a > b ? -1 : 1));

  return sortedKeys.map((key) => {
    const groupItems = map.get(key)!.sort((a, b) => b.viewCount - a.viewCount);
    return {
      key,
      label: getGroupLabel(key, granularity, lang),
      total: groupItems.length,
      topArticles: groupItems.slice(0, maxCards),
      items: groupItems,
    };
  });
}

// ─── Archive grouping (Apple Newsroom–style) ───────────────────────────────────

export type PRArchiveGroupType = 'day' | 'week' | 'biweek' | 'month';

export interface PRArchiveGroup {
  key: string;
  label: string;
  type: PRArchiveGroupType;
  items: PressRelease[];
  sortKey: string;
}

function toUTCDateString(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

/** Returns the Monday of the ISO week containing the given UTC date */
function getMondayUTC(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0=Sun, 1=Mon … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function formatDayLabel(dateStr: string, lang: 'zh' | 'en'): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatWeekLabel(weekStartStr: string, lang: 'zh' | 'en'): string {
  const [y, m, d] = weekStartStr.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);

  const locale = lang === 'en' ? 'en-US' : 'zh-TW';
  const shortOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  const endOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };

  const startStr = start.toLocaleDateString(locale, shortOpts);
  const endStr = end.toLocaleDateString(locale, endOpts);
  return lang === 'zh' ? `${startStr} – ${endStr}` : `${startStr} – ${endStr}`;
}

/**
 * Returns the start Monday of the 2-week block containing the given UTC date.
 * Uses Monday 3 Jan 2000 as epoch anchor.
 */
function getBiWeeklyStartUTC(date: Date): Date {
  const monday = getMondayUTC(date);
  const epochMonday = new Date(Date.UTC(2000, 0, 3)); // 2000-01-03 is a Monday
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const weeksSinceEpoch = Math.floor(
    (monday.getTime() - epochMonday.getTime()) / msPerWeek,
  );
  const biWeekIndex = Math.floor(weeksSinceEpoch / 2);
  return new Date(epochMonday.getTime() + biWeekIndex * 2 * msPerWeek);
}

function formatBiWeekLabel(biWeekStartStr: string, lang: 'zh' | 'en'): string {
  const [y, m, d] = biWeekStartStr.split('-').map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 13); // 2 weeks = 14 days, last day is +13

  const locale = lang === 'en' ? 'en-US' : 'zh-TW';
  const shortOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', timeZone: 'UTC' };
  const endOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' };

  const startStr = start.toLocaleDateString(locale, shortOpts);
  const endStr = end.toLocaleDateString(locale, endOpts);
  return `${startStr} – ${endStr}`;
}

function formatMonthLabel(year: number, month: number, lang: 'zh' | 'en'): string {
  if (lang === 'zh') {
    const zhMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return `${year} 年 ${zhMonths[month - 1]}`;
  }
  const enMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${enMonths[month - 1]} ${year}`;
}

/**
 * Groups press releases using smart time dimensions:
 * - < 7 days ago  → exact date group
 * - 7–29 days ago → weekly group
 * - ≥ 30 days ago → monthly group
 */
export function getPressReleaseArchiveGroups(
  items: PressRelease[],
  lang: 'zh' | 'en' = 'en',
  referenceDate?: Date,
): PRArchiveGroup[] {
  const now = referenceDate ?? new Date();
  const todayUTC = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

  const sorted = [...items].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const groupMap = new Map<string, PRArchiveGroup>();

  for (const pr of sorted) {
    const [y, m, d] = pr.publishedAt.split('-').map(Number);
    const dateUTC = new Date(Date.UTC(y, m - 1, d));
    const diffDays = Math.floor(
      (todayUTC.getTime() - dateUTC.getTime()) / (1000 * 60 * 60 * 24),
    );

    let key: string;
    let label: string;
    let type: PRArchiveGroupType;
    let sortKey: string;

    if (diffDays < 7) {
      // Within last 7 days → daily bucket
      type = 'day';
      key = `day-${pr.publishedAt}`;
      label = formatDayLabel(pr.publishedAt, lang);
      sortKey = pr.publishedAt;
    } else if (diffDays < 30) {
      // 7 days – 1 month ago → weekly bucket
      type = 'week';
      const monday = getMondayUTC(dateUTC);
      const mondayStr = toUTCDateString(monday);
      key = `week-${mondayStr}`;
      label = formatWeekLabel(mondayStr, lang);
      sortKey = mondayStr;
    } else if (diffDays < 60) {
      // 1 month – 2 months ago → bi-weekly bucket
      type = 'biweek';
      const biWeekStart = getBiWeeklyStartUTC(dateUTC);
      const biWeekStartStr = toUTCDateString(biWeekStart);
      key = `biweek-${biWeekStartStr}`;
      label = formatBiWeekLabel(biWeekStartStr, lang);
      sortKey = biWeekStartStr;
    } else if (diffDays < 90) {
      // 2 months – 3 months ago → monthly bucket
      type = 'month';
      key = `month-${y}-${String(m).padStart(2, '0')}`;
      label = formatMonthLabel(y, m, lang);
      sortKey = `${y}-${String(m).padStart(2, '0')}`;
    } else {
      // Beyond 3 months → monthly bucket (fallback)
      type = 'month';
      key = `month-${y}-${String(m).padStart(2, '0')}`;
      label = formatMonthLabel(y, m, lang);
      sortKey = `${y}-${String(m).padStart(2, '0')}`;
    }

    if (!groupMap.has(key)) {
      groupMap.set(key, { key, label, type, items: [], sortKey });
    }
    groupMap.get(key)!.items.push(pr);
  }

  return Array.from(groupMap.values()).sort((a, b) =>
    b.sortKey.localeCompare(a.sortKey),
  );
}

