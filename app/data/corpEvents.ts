import rawContent from '@/content/corp-events.md';
import { extractJsonBySection } from '@/app/lib/parseContent';

// ─── Unified Corporate Event Interface ──────────────────────────────────────
export interface CorpEvent {
  cellLabel: string;
  company: string;
  description: string;
  eventDate: string;
  eventType: string;
  webcastLink: string;
  irLink: string;
}

// ─── Section parsers ─────────────────────────────────────────────────────────
export const shareHoldersMeetingEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Shareholders Meeting',
);

export const salesRevenueReleaseEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Sales Revenue Release',
);

export const dividendEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Dividend',
);

export const confirmedEarningsReleaseEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Confirmed Earnings Release',
);

export const conferenceEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Conference',
);

export const earningsEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Earnings',
);

export const analystsInvestorsMeetingEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Analysts Investors Meeting',
);

export const splitEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Split',
);

export const specialSituationEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Special Situation',
);

export const salesRevenueCallEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Sales Revenue Call',
);

export const guidanceCallEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Guidance Call',
);

export const projectedEarningsReleaseEvents = extractJsonBySection<Record<string, CorpEvent[]>>(
  rawContent,
  'Projected Earnings Release',
);

// ─── Event Category IDs (for Subscribe API) ──────────────────────────────────

/** Ordered list of all event categories with their IDs used in the Subscribe API. */
export const EVENT_CATEGORIES_LIST: { id: number; name: string }[] = [
  { id: 1,  name: 'Shareholders Meeting' },
  { id: 2,  name: 'Sales Revenue Release' },
  { id: 3,  name: 'Dividend' },
  { id: 4,  name: 'Confirmed Earnings Release' },
  { id: 5,  name: 'Conference' },
  { id: 6,  name: 'Earnings' },
  { id: 7,  name: 'Analysts Investors Meeting' },
  { id: 8,  name: 'Split' },
  { id: 9,  name: 'Special Situation' },
  { id: 10, name: 'Sales Revenue Call' },
  { id: 11, name: 'Guidance Call' },
  { id: 12, name: 'Projected Earnings Release' },
];

// ─── Category registry ───────────────────────────────────────────────────────
export const CORP_EVENT_CATEGORY_MAP: Record<string, Record<string, CorpEvent[]>> = {
  'Shareholders Meeting': shareHoldersMeetingEvents,
  'Sales Revenue Release': salesRevenueReleaseEvents,
  Dividend: dividendEvents,
  'Confirmed Earnings Release': confirmedEarningsReleaseEvents,
  Conference: conferenceEvents,
  Earnings: earningsEvents,
  'Analysts Investors Meeting': analystsInvestorsMeetingEvents,
  Split: splitEvents,
  'Special Situation': specialSituationEvents,
  'Sales Revenue Call': salesRevenueCallEvents,
  'Guidance Call': guidanceCallEvents,
  'Projected Earnings Release': projectedEarningsReleaseEvents,
};
