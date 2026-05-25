import rawContent from '@/content/earnings.md';
import { extractJson } from '@/app/lib/parseContent';

export type ReportTime = 'Pre' | 'Post' | 'During-Market';
export type BeatMiss = 'Beat' | 'Miss' | null;

export interface WeekDay {
  dayLabel: string;   // SUN, MON...
  dateLabel: string;  // Apr 1, Mar 30...
  isToday?: boolean;
  companies?: string[];
  companyCount?: number;
  isEmpty?: boolean;      // placeholder cell for month grid padding
  isOutOfMonth?: boolean; // previous/next month day shown as padding
}

export interface EpsRow {
  symbol: string;
  company: string;
  report: ReportTime;
  mktCap: string;
  epsNormalized: string;
  epsYoY: string;
  epsYoYPositive: boolean;
  epsGaap: string;
  epsActual: string | null;
  epsBeatMiss: BeatMiss;
  lastQGaap: string;
  lastQBeatMiss: BeatMiss;
  beatsL2Y: number;
  missedL2Y: number;
}

export interface RevenueRow {
  symbol: string;
  company: string;
  report: ReportTime;
  mktCap: string;
  revConsensus: string;
  revYoY: string;
  revYoYPositive: boolean;
  revHighEst: string;
  revActual: string | null;
  revBeatMiss: BeatMiss;
  lastQActual: string;
  lastQBeatMiss: BeatMiss;
}

interface EarningsData {
  weekDays: WeekDay[];
  aprilMonthData: WeekDay[];
  epsData: EpsRow[];
  revenueData: RevenueRow[];
  dateEpsData: Record<string, EpsRow[]>;
  dateRevenueData: Record<string, RevenueRow[]>;
  usdToTwdRate?: number;
}

const data = extractJson<EarningsData>(rawContent);

export const weekDays: WeekDay[] = data.weekDays;
export const aprilMonthData: WeekDay[] = data.aprilMonthData;
export const epsData: EpsRow[] = data.epsData;
export const revenueData: RevenueRow[] = data.revenueData;
export const dateEpsData: Record<string, EpsRow[]> = data.dateEpsData ?? {};
export const dateRevenueData: Record<string, RevenueRow[]> = data.dateRevenueData ?? {};
/** USD → TWD exchange rate pre-fetched from earnings.md (2025-04 rate: 32.7) */
export const usdToTwdRate: number = data.usdToTwdRate ?? 32.7;
