// Stock chart URL lookup — loaded from content/stock-urls.md
import rawContent from '@/content/stock-urls.md';
import { extractJson } from '@/app/lib/parseContent';

interface StockUrlEntry {
  url: string;
}

type StockUrlMap = Record<string, StockUrlEntry>;

const STOCK_URL_MAP: StockUrlMap = extractJson<StockUrlMap>(rawContent);

/**
 * Returns the stock chart embed URL for the given company code (CO_CD).
 * Returns null if no URL is configured for that company.
 *
 * The returned object shape is: { url: string }
 */
export function getStockUrlByCoCd(coCd: string): StockUrlEntry | null {
  return STOCK_URL_MAP[coCd] ?? null;
}
