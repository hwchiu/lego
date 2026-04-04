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

function getGroupLabel(key: string, granularity: TimelineGranularity): string {
  if (granularity === 'year') return key;
  if (granularity === 'quarter') {
    const [year, q] = key.split('-');
    return `${q} ${year}`;
  }
  const [year, month] = key.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
}

export function groupByTimeline(
  items: PressRelease[],
  granularity: TimelineGranularity,
  maxCards = 2,
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
      label: getGroupLabel(key, granularity),
      total: groupItems.length,
      topArticles: groupItems.slice(0, maxCards),
      items: groupItems,
    };
  });
}
