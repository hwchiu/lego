import rawContent from '@/content/market-indices.md';
import { extractJson } from '@/app/lib/parseContent';

export interface StockIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
  trend: number[]; // sparkline points (y values, 0–100 scale)
}

export const stockIndexes: StockIndex[] = extractJson<StockIndex[]>(rawContent);
