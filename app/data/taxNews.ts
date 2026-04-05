// Tax news data — Taiwan weekly tax news and per-country international tax news

import taiwanTaxRaw from '@/content/data-explore/taiwan-tax-news.md';
import internationalTaxRaw from '@/content/data-explore/international-tax-news.md';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';

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
  taiwanTaxRaw,
  'Taiwan Tax News',
);

export const INTERNATIONAL_TAX_NEWS: InternationalTaxNews = extractJsonBySection<InternationalTaxNews>(
  internationalTaxRaw,
  'International Tax News',
);

export function getTaxNewsByCountry(countryId: string): TaxNewsItem[] {
  return INTERNATIONAL_TAX_NEWS[countryId] ?? [];
}
