import { MONTH_SHORT } from '@/app/lib/calendarUtils';

// ─── Types matching the JSON API format ────────────────────────────────────

export interface EventCalendarSummaryItem {
  EVENT_MONTH: string;
  EVENT_DATE: string;
  EVENT_COUNT: string;
  EVENT_COMPANY_LIST: string;
}

export interface EventCalendarDetailItem {
  COMPANY_NAME: string;
  CONTACT_EMAIL: string;
  CONTACT_NAME: string;
  CONTACT_PHONE: string;
  CO_CD: string;
  CO_SHORT_NAME: string;
  DESCRIPTION: string;
  EVENT_DATETIME: string;
  EVENT_ID: string;
  EVENT_TYPE: string;
  FISCAL_PERIOD: string;
  FISCAL_QUARTER: string;
  FISCAL_YEAR: string;
  IR_LINK: string;
  IS_SUB: boolean;
  LAST_MODIFY_DATETIME: string;
  MARKET_TIME_CODE: string;
  TICKER: string;
  WEBCAST_LINK: string;
}

// ─── Calendar cell data derived from summary ────────────────────────────────

export interface CalendarCellData {
  companies: string[];
  count: number;
}

/** Map: "Apr 7" → CalendarCellData */
export type CalendarSummaryMap = Record<string, CalendarCellData>;

// ─── API functions ──────────────────────────────────────────────────────────

const SUMMARY_URL = '/lego/data/event-calendar-summary.json';
const DETAIL_URL = '/lego/data/event-calendar-detail.json';

/** Fetch the summary JSON used to populate calendar cells. */
export async function getEventCalendarSummary(): Promise<EventCalendarSummaryItem[]> {
  const res = await fetch(SUMMARY_URL);
  return res.json() as Promise<EventCalendarSummaryItem[]>;
}

/**
 * Fetch event detail records filtered by date and event category.
 * @param dateLabel  Date in "Mon D" format, e.g. "Apr 7"
 * @param category   Event category label, or "All" for no category filter
 */
export async function getEventCalendarDetail(
  dateLabel: string,
  category: string,
): Promise<EventCalendarDetailItem[]> {
  const res = await fetch(DETAIL_URL);
  const allItems = (await res.json()) as EventCalendarDetailItem[];

  // Filter by date
  const filtered = allItems.filter((item) => {
    const d = new Date(item.EVENT_DATETIME);
    if (isNaN(d.getTime())) return false;
    const itemLabel = `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`;
    return itemLabel === dateLabel;
  });

  if (category === 'All') return filtered;
  return filtered.filter((item) => item.EVENT_TYPE === category);
}

// ─── Utility: convert summary items to CalendarSummaryMap ──────────────────

/**
 * Convert raw summary items from the JSON API to the "Mon D" → CalendarCellData
 * map consumed by the calendar grid builders.
 */
export function buildCalendarSummaryMap(
  items: EventCalendarSummaryItem[],
): CalendarSummaryMap {
  const map: CalendarSummaryMap = {};
  for (const item of items) {
    const monthIdx = parseInt(item.EVENT_MONTH, 10) - 1;
    const day = parseInt(item.EVENT_DATE, 10);
    if (monthIdx < 0 || monthIdx > 11 || isNaN(day)) continue;
    const key = `${MONTH_SHORT[monthIdx]} ${day}`;
    const companies = item.EVENT_COMPANY_LIST
      ? item.EVENT_COMPANY_LIST.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    map[key] = { companies, count: parseInt(item.EVENT_COUNT, 10) || companies.length };
  }
  return map;
}
