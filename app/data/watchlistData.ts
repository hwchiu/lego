import rawContent from '@/content/watchlist-data.md';
import { extractJson } from '@/app/lib/parseContent';

export interface HoldingEntity {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  shares: number;
  cost: number;
  todayGain: number;
  todayGainPct: number;
  revenue: string;
  revenueQoQ: string;
  revenueYoY: string;
  grossMargin: string;
  doi: string;
  nextEarning: string;
  lastQtrRevenue: string;
  lastQtrGrossMargin: string;
  lastQtrDOI: string;
}

export const holdingsData: Record<string, HoldingEntity> = extractJson<Record<string, HoldingEntity>>(rawContent);
