// Tax news data — Taiwan weekly tax news and per-country international tax news

import taxNewsRaw from '@/content/data-explore/tax-news.md';
import { extractJsonBySection } from '@/app/lib/parseContent';

export interface TaxNewsItem {
  id: string;
  week: string;
  date: string;
  title: string;
  category: string;
  summary: string;
  source: string;
  url: string;
  tags: string[];
}

export type InternationalTaxNews = Record<string, TaxNewsItem[]>;

export const TAIWAN_TAX_NEWS: TaxNewsItem[] = extractJsonBySection<TaxNewsItem[]>(
  taxNewsRaw,
  'Taiwan Tax News',
);

export const INTERNATIONAL_TAX_NEWS: InternationalTaxNews = extractJsonBySection<InternationalTaxNews>(
  taxNewsRaw,
  'International Tax News',
);

export function getTaxNewsByCountry(countryId: string): TaxNewsItem[] {
  return INTERNATIONAL_TAX_NEWS[countryId] ?? [];
}
