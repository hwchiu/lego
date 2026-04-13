import rawContent from '@/content/financial-data.md';
import { extractJsonBySection } from '@/app/lib/parseContent';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompanyInfo {
  symbol: string;
  name: string;
  sector: string;
  marketCap: string;
  currency: string;
  description: string;
}

export interface StatementData {
  /** Ordered list of period labels (e.g. "FY2022", "Q1 FY25"). */
  periods: string[];
  /**
   * Key/value map of accounting line items.
   * Key   = item label (e.g. "Revenue ($B)")
   * Value = array of values aligned to `periods` (same length).
   */
  items: Record<string, string[]>;
}

/**
 * Flat financial record format used in the Income Statement section of
 * financial-data.md.  Each record represents one cell in the statement table.
 *
 * Fields:
 *   rpt_fin_type      – which report/tab this row belongs to (e.g. "income")
 *   rpt_fin_item      – row label in the table (e.g. "Revenue ($B)")
 *   co_cd             – company symbol (e.g. "AAPL")
 *   curr_cd           – currency code (e.g. "USD")
 *   fiscal_year       – fiscal year as a 4-digit number
 *   calendar_quarter  – quarter within the year ("Q1"–"Q4") or "NA" for annual
 *   fld_val           – the displayed cell value (string to preserve formatting)
 */
export interface FlatFinRecord {
  rpt_fin_type: string;
  rpt_fin_item: string;
  co_cd: string;
  curr_cd: string;
  fiscal_year: number;
  calendar_quarter: string;
  fld_val: string;
}

export type StatementKey = 'income' | 'balance' | 'cashflow' | 'ratios';

export const STATEMENT_TABS: { key: StatementKey; label: string }[] = [
  { key: 'income', label: 'Income Statement' },
  { key: 'balance', label: 'Balance Sheet' },
  { key: 'cashflow', label: 'Cash Flow Statement' },
  { key: 'ratios', label: 'Financial Ratios' },
];

// Section label → markdown section name
const SECTION_MAP: Record<StatementKey, string> = {
  income: 'Income Statement',
  balance: 'Balance Sheet',
  cashflow: 'Cash Flow Statement',
  ratios: 'Financial Ratios',
};

// ─── Flat-array → StatementData converter ────────────────────────────────────

/**
 * Derives a canonical period label from fiscal_year + calendar_quarter.
 *   annual  → "FY2022"
 *   quarterly → "Q1 FY2025"
 */
function periodLabel(fiscalYear: number, calendarQuarter: string): string {
  if (calendarQuarter === 'NA') return `FY${fiscalYear}`;
  return `${calendarQuarter} FY${fiscalYear}`;
}

/** Sort key for a period so that annual < quarterly, both chronological. */
function periodSortKey(fiscalYear: number, calendarQuarter: string): number {
  const qn = calendarQuarter === 'NA' ? 0 : parseInt(calendarQuarter.slice(1), 10);
  // annual records carry a large negative quarter so they sort before quarterly
  return fiscalYear * 10 + (calendarQuarter === 'NA' ? -1 : qn);
}

/**
 * Converts a flat FlatFinRecord array into a per-company StatementData map,
 * filtering to records whose rpt_fin_type matches `type`.
 * Period ordering: annual first (chronological), then quarterly (chronological).
 */
function flatToStatementData(
  records: FlatFinRecord[],
  type: string,
): Record<string, StatementData> {
  // First pass: collect per-company cell data into a nested map
  // structure: company → item → periodLabel → value
  const cellMap: Record<string, Record<string, Record<string, string>>> = {};
  const periodSets: Record<string, Set<string>> = {};
  const itemOrder: Record<string, string[]> = {};

  for (const rec of records) {
    if (rec.rpt_fin_type !== type) continue;

    const { co_cd, rpt_fin_item, fiscal_year, calendar_quarter, fld_val } = rec;
    const label = periodLabel(fiscal_year, calendar_quarter);

    if (!cellMap[co_cd]) {
      cellMap[co_cd] = {};
      periodSets[co_cd] = new Set();
      itemOrder[co_cd] = [];
    }

    periodSets[co_cd].add(label);

    if (!cellMap[co_cd][rpt_fin_item]) {
      cellMap[co_cd][rpt_fin_item] = {};
      itemOrder[co_cd].push(rpt_fin_item);
    }

    cellMap[co_cd][rpt_fin_item][label] = fld_val;
  }

  // Second pass: assemble StatementData with sorted periods
  const result: Record<string, StatementData> = {};

  const parsePeriodSortKey = (p: string): number => {
    const mq = p.match(/^(Q\d)\s+FY(\d+)$/);
    if (mq) return periodSortKey(parseInt(mq[2], 10), mq[1]);
    const ma = p.match(/^FY(\d+)$/);
    if (ma) return periodSortKey(parseInt(ma[1], 10), 'NA');
    return 0;
  };

  for (const co_cd of Object.keys(cellMap)) {
    const sortedPeriods = [...periodSets[co_cd]].sort(
      (a, b) => parsePeriodSortKey(a) - parsePeriodSortKey(b),
    );

    const items: Record<string, string[]> = {};
    for (const item of itemOrder[co_cd]) {
      items[item] = sortedPeriods.map((p) => cellMap[co_cd][item][p] ?? '');
    }

    result[co_cd] = { periods: sortedPeriods, items };
  }

  return result;
}

// ─── Data loaders (lazy, memoised) ────────────────────────────────────────────

let _companies: CompanyInfo[] | null = null;
export function getCompanies(): CompanyInfo[] {
  if (!_companies) {
    _companies = extractJsonBySection<CompanyInfo[]>(rawContent, 'Company List');
  }
  return _companies;
}

const _stmtCache: Partial<Record<StatementKey, Record<string, StatementData>>> = {};

export function getStatement(key: StatementKey): Record<string, StatementData> {
  if (_stmtCache[key]) return _stmtCache[key]!;

  if (key === 'income') {
    // Income Statement uses the new flat-array format
    const records = extractJsonBySection<FlatFinRecord[]>(rawContent, SECTION_MAP[key]);
    _stmtCache[key] = flatToStatementData(records, 'income');
  } else {
    // Balance Sheet, Cash Flow Statement, Financial Ratios still use the legacy
    // nested { company: { periods, items } } format
    _stmtCache[key] = extractJsonBySection<Record<string, StatementData>>(
      rawContent,
      SECTION_MAP[key],
    );
  }

  return _stmtCache[key]!;
}
