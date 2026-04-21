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
