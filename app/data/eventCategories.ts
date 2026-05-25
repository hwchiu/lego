import rawContent from '@/content/event-categories.md';
import { extractJsonBySection } from '@/app/lib/parseContent';

// ─── Bond Events ────────────────────────────────────────────────────────────
export interface BondEvent {
  cellLabel: string;
  symbol: string;
  company: string;
  eventType: 'Issuance' | 'Rating Change' | 'Rating Reaffirm' | 'Maturity';
  amount: string;
  coupon: string;
  maturity: string;
  rating: string;
  description: string;
}

// ─── Commodity Events ────────────────────────────────────────────────────────
export interface CommodityEvent {
  cellLabel: string;
  commodity: string;
  unit: string;
  price: string;
  change: string;
  changePct: string;
  weekHigh: string;
  weekLow: string;
  relevance: string;
}

// ─── Country Events ──────────────────────────────────────────────────────────
export interface CountryEvent {
  cellLabel: string;
  country: string;
  flag: string;
  eventType: string;
  title: string;
  description: string;
  affectedCompanies: string[];
  impact: 'High' | 'Medium' | 'Low';
}

// ─── Cryptocurrency Events ───────────────────────────────────────────────────
export interface CryptoEvent {
  cellLabel: string;
  cryptoSymbol: string;
  name: string;
  price: string;
  change: string;
  changePct: string;
  volume: string;
  marketCap: string;
  relevance: string;
}

// ─── Currency Events ─────────────────────────────────────────────────────────
export interface CurrencyEvent {
  cellLabel: string;
  pair: string;
  rate: string;
  change: string;
  changePct: string;
  description: string;
  affectedCompanies: string[];
}

// ─── Dividend Aristocrat / Champion Events ───────────────────────────────────
export interface DividendGrowthEvent {
  cellLabel: string;
  symbol: string;
  company: string;
  exDate: string;
  payDate: string;
  dividend: string;
  annualDividend: string;
  yield: string;
  frequency: string;
  consecutiveYears: number;
  annualGrowth: string;
}

// ─── Basic Dividend Events ───────────────────────────────────────────────────
export interface DividendEvent {
  cellLabel: string;
  symbol: string;
  company: string;
  exDate: string;
  payDate: string;
  dividend: string;
  yield: string;
  frequency: string;
  type: string;
}

// ─── Union type for all event categories ────────────────────────────────────
export type AnyEvent =
  | BondEvent
  | CommodityEvent
  | CountryEvent
  | CryptoEvent
  | CurrencyEvent
  | DividendGrowthEvent
  | DividendEvent;

// ─── Parsed data exports ─────────────────────────────────────────────────────
export const bondEvents = extractJsonBySection<Record<string, BondEvent[]>>(
  rawContent,
  'Bonds',
);

export const commodityEvents = extractJsonBySection<Record<string, CommodityEvent[]>>(
  rawContent,
  'Commodities',
);

export const countryEvents = extractJsonBySection<Record<string, CountryEvent[]>>(
  rawContent,
  'Countries',
);

export const cryptoEvents = extractJsonBySection<Record<string, CryptoEvent[]>>(
  rawContent,
  'Cryptocurrency',
);

export const currencyEvents = extractJsonBySection<Record<string, CurrencyEvent[]>>(
  rawContent,
  'Currencies',
);

export const dividendAristocratEvents = extractJsonBySection<
  Record<string, DividendGrowthEvent[]>
>(rawContent, 'Dividend Aristocrats');

export const dividendChampionEvents = extractJsonBySection<
  Record<string, DividendGrowthEvent[]>
>(rawContent, 'Dividend Champions');

export const dividendEvents = extractJsonBySection<Record<string, DividendEvent[]>>(
  rawContent,
  'Dividends',
);

// ─── Category registry ───────────────────────────────────────────────────────

export type EventCategoryId =
  | 'bonds'
  | 'commodities'
  | 'countries'
  | 'cryptocurrency'
  | 'currencies'
  | 'dividendAristocrats'
  | 'dividendChampions'
  | 'dividends';

/** Layout strategy for the detail view */
export type DetailLayout = 'card' | 'table';

export const EVENT_CATEGORY_MAP: Record<
  string,
  { id: EventCategoryId; layout: DetailLayout; events: Record<string, AnyEvent[]> }
> = {
  Bonds: { id: 'bonds', layout: 'card', events: bondEvents as Record<string, AnyEvent[]> },
  Commodities: {
    id: 'commodities',
    layout: 'table',
    events: commodityEvents as Record<string, AnyEvent[]>,
  },
  Countries: {
    id: 'countries',
    layout: 'card',
    events: countryEvents as Record<string, AnyEvent[]>,
  },
  Cryptocurrency: {
    id: 'cryptocurrency',
    layout: 'table',
    events: cryptoEvents as Record<string, AnyEvent[]>,
  },
  Currencies: {
    id: 'currencies',
    layout: 'table',
    events: currencyEvents as Record<string, AnyEvent[]>,
  },
  'Dividend Aristocrats': {
    id: 'dividendAristocrats',
    layout: 'table',
    events: dividendAristocratEvents as Record<string, AnyEvent[]>,
  },
  'Dividend Champions': {
    id: 'dividendChampions',
    layout: 'table',
    events: dividendChampionEvents as Record<string, AnyEvent[]>,
  },
  Dividends: {
    id: 'dividends',
    layout: 'table',
    events: dividendEvents as Record<string, AnyEvent[]>,
  },
};
