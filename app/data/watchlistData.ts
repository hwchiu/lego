import rawContent from '@/content/watchlist-data.md';
import { extractJsonBySection } from '@/app/lib/parseContent';

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

// Q1 2026 (current / latest) entity data
export const holdingsData: Record<string, HoldingEntity> = extractJsonBySection<Record<string, HoldingEntity>>(rawContent, 'Entity Data');

// Q4 2025 historical snapshot
export const holdingsDataQ4_2025: Record<string, HoldingEntity> = extractJsonBySection<Record<string, HoldingEntity>>(rawContent, 'Entity Data Q4 2025');

// Pre-generated IDs for dynamically created watchlists (static-export compatible)
// These IDs are reserved for user-created watchlists stored in localStorage
export const DYNAMIC_WATCHLIST_IDS = [
  '912847', '583926', '374819', '647203', '829516',
  '193472', '756381', '482039', '261748', '935061',
] as const;
