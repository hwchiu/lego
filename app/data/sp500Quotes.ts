import rawContent from '@/content/sp500-quotes.md';
import { extractJson } from '@/app/lib/parseContent';

export interface StockQuote {
  price: number;
  change: number;
  changePct: number;
}

export const sp500Quotes: Record<string, StockQuote> = extractJson<Record<string, StockQuote>>(rawContent);
