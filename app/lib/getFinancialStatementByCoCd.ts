import tcFinStmtMd from '@/content/tc-financial-statement.md';
import aaplFinStmtMd from '@/content/apple-financial-statement.md';
import { getStatement, getCompanies, flatToStatementData } from '@/app/data/financialData';
import type { StatementData, FlatFinRecord } from '@/app/data/financialData';
import { extractJsonBySection } from '@/app/lib/parseContent';

// ── Types ─────────────────────────────────────────────────────────────────────

export type StatementType = 'income' | 'balance' | 'cashflow' | 'segment';

// Simple table type (legacy — kept for type completeness)
export interface SimpleStatementPeriodData {
  columns: string[];
  rows: string[][];
}

export interface SimpleStatementData {
  source: string;
  annualData: SimpleStatementPeriodData;
  quarterlyData: SimpleStatementPeriodData;
}

export type TabDataEntry =
  | { kind: 'simple'; data: SimpleStatementData }
  | { kind: 'findata'; data: StatementData };

export type CompanyStatements = Partial<Record<StatementType, TabDataEntry>>;

// ── Segment Report flat record type ───────────────────────────────────────────

interface SegmentRecord {
  calendar_year: number;
  calendar_quarter: string;
  fiscal_year: number;
  fiscal_quarter: string;
  anal_seg_level1: string;
  anal_seg_level2?: string;
  anal_seg_level3?: string;
  co_cd: string;
  co_name?: string;
  curr_cd: string;
  sale_type: string;
  fld_val: number | null;
  curr_num?: number | null;
  fld_val_yoy?: number | null;
  fld_val_qoq?: number | null;
  curr_num_yoy?: number | null;
  curr_num_qoq?: number | null;
  category?: string;
  update_dt?: string;
}

/** Format a numeric segment value for display based on sale_type. */
function formatSegmentValue(val: number | null, saleType: string): string {
  if (val === null || val === undefined) return '—';
  const isPct = saleType.includes('(%)');
  const isGrowth = /growth|yoy/i.test(saleType);
  if (isPct && isGrowth) {
    const sign = val > 0 ? '+' : '';
    return `${sign}${val}%`;
  }
  if (isPct) return `${val}%`;
  return Math.round(val) === val
    ? val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : val.toFixed(1);
}

/** Convert SegmentRecord[] to StatementData (same period-label logic as flatToStatementData). */
function segmentToStatementData(records: SegmentRecord[], co_cd: string): StatementData | null {
  const filtered = records.filter((r) => r.co_cd === co_cd);
  if (!filtered.length) return null;

  const ANNUAL_QUARTER = 'NA';

  function pLabel(calYear: number, calQ: string): string {
    return calQ === ANNUAL_QUARTER ? `FY${calYear}` : `${calQ} ${calYear}`;
  }
  function pSortKey(calYear: number, calQ: string): number {
    if (calQ === ANNUAL_QUARTER) return calYear * 10;
    const m = calQ.match(/^Q([1-4])$/);
    return calYear * 10 + (m ? parseInt(m[1], 10) : 5);
  }

  const periodSet = new Set<string>();
  const sortKeyMap = new Map<string, number>();
  for (const rec of filtered) {
    const lbl = pLabel(rec.calendar_year, rec.calendar_quarter);
    periodSet.add(lbl);
    sortKeyMap.set(lbl, pSortKey(rec.calendar_year, rec.calendar_quarter));
  }
  const periods = [...periodSet].sort((a, b) => (sortKeyMap.get(a) ?? 0) - (sortKeyMap.get(b) ?? 0));

  const saleTypeOrder: string[] = [];
  const saleTypeSeen = new Set<string>();
  const itemOrders: Record<string, string[]> = {};
  const itemSeen: Record<string, Set<string>> = {};
  const valueMap: Record<string, Record<string, string>> = {};

  for (const rec of filtered) {
    const { sale_type, anal_seg_level1, calendar_year, calendar_quarter, fld_val } = rec;
    if (!saleTypeSeen.has(sale_type)) {
      saleTypeOrder.push(sale_type);
      saleTypeSeen.add(sale_type);
      itemOrders[sale_type] = [];
      itemSeen[sale_type] = new Set();
    }
    if (!itemSeen[sale_type].has(anal_seg_level1)) {
      itemOrders[sale_type].push(anal_seg_level1);
      itemSeen[sale_type].add(anal_seg_level1);
    }
    const lbl = pLabel(calendar_year, calendar_quarter);
    const key = `${sale_type}__${anal_seg_level1}`;
    if (!valueMap[key]) valueMap[key] = {};
    valueMap[key][lbl] = formatSegmentValue(fld_val, sale_type);
  }

  const items: Record<string, string[]> = {};
  for (const saleType of saleTypeOrder) {
    items[saleType] = periods.map(() => '');
    for (const segName of itemOrders[saleType]) {
      const key = `${saleType}__${segName}`;
      items[segName] = periods.map((p) => valueMap[key]?.[p] ?? '');
    }
  }

  return { periods, items };
}

// ── Data loaders ───────────────────────────────────────────────────────────────

/**
 * Config map for companies whose statement data lives in a dedicated markdown file.
 */
const MD_FIN_CONFIG: Record<
  string,
  { mdContent: string; sections: Partial<Record<'income' | 'balance' | 'cashflow', string>> }
> = {
  TC: {
    mdContent: tcFinStmtMd as string,
    sections: {
      income:   'Income Statement',
      balance:  'Balance Sheet',
      cashflow: 'Cash Flow Statement',
    },
  },
  AAPL: {
    mdContent: aaplFinStmtMd as string,
    sections: {
      income:   'Income Statement',
      balance:  'Balance Sheet',
      cashflow: 'Cash Flow Statement',
    },
  },
};

/** Per-symbol, per-type cache for markdown-sourced StatementData. */
const _mdFinCache: Record<string, Partial<Record<'income' | 'balance' | 'cashflow', StatementData | null>>> = {};

function getMarkdownFinData(symbol: string, type: 'income' | 'balance' | 'cashflow'): StatementData | null {
  if (!_mdFinCache[symbol]) _mdFinCache[symbol] = {};
  const cache = _mdFinCache[symbol];
  if (type in cache) return cache[type] ?? null;

  const config = MD_FIN_CONFIG[symbol];
  if (!config) {
    cache[type] = null;
    return null;
  }

  const section = config.sections[type];
  if (!section) {
    cache[type] = null;
    return null;
  }

  const records = extractJsonBySection<FlatFinRecord[]>(config.mdContent, section);
  const stmtMap = flatToStatementData(records, type);
  cache[type] = stmtMap[symbol] ?? null;
  return cache[type] ?? null;
}

let _aaplSegmentCache: StatementData | null | undefined = undefined;
function getAaplSegmentData(): StatementData | null {
  if (_aaplSegmentCache !== undefined) return _aaplSegmentCache;
  const records = extractJsonBySection<SegmentRecord[]>(aaplFinStmtMd as string, 'Segment Report');
  _aaplSegmentCache = segmentToStatementData(records, 'AAPL');
  return _aaplSegmentCache;
}

function buildCompanyStatements(symbol: string): CompanyStatements {
  const result: CompanyStatements = {};

  if (MD_FIN_CONFIG[symbol]) {
    for (const type of ['income', 'balance', 'cashflow'] as const) {
      const data = getMarkdownFinData(symbol, type);
      if (data) result[type] = { kind: 'findata', data };
    }
    if (symbol === 'AAPL') {
      const segData = getAaplSegmentData();
      if (segData) result.segment = { kind: 'findata', data: segData };
    }
    return result;
  }

  if (getCompanies().some((c) => c.symbol === symbol)) {
    for (const key of ['income', 'balance', 'cashflow'] as const) {
      const data = getStatement(key)[symbol] ?? null;
      if (data) result[key] = { kind: 'findata', data };
    }
    return result;
  }

  return result;
}

/**
 * Simulated API: getFinancialStatementByCoCd
 *
 * Fetches financial statement data from the local data store,
 * filtered by company code (co_cd).
 * Returns available statement sections (income, balance, cashflow, segment).
 *
 * In production this will call a real backend API:
 *   GET /api/financial-statements?co_cd={coCd}
 *
 * @param coCd  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to CompanyStatements
 */
export async function getFinancialStatementByCoCd(
  coCd: string,
): Promise<CompanyStatements> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  return buildCompanyStatements(coCd);
}
