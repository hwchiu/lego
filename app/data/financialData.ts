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
 * Flat financial record format used in the Income Statement, Balance Sheet, and
 * Cash Flow Statement sections of financial-data.md.
 * Each record represents one cell in a statement table.
 *
 * Fields:
 *   rpt_fin_type      – which report/tab this row belongs to ("income" | "balance" | "cashflow")
 *   rpt_fin_item      – row label in the table (e.g. "Revenue ($B)")
 *   co_cd             – company symbol (e.g. "AAPL")
 *   curr_cd           – ISO currency code (e.g. "USD")
 *   fiscal_year       – fiscal year as a 4-digit number
 *   fiscal_quarter    – fiscal quarter ("Q1"–"Q4") or "NA" for annual records
 *   calendar_year     – calendar year as a 4-digit number (used for table display)
 *   calendar_quarter  – calendar quarter ("Q1"–"Q4") or "NA" for annual records (used for table display)
 *   fld_val           – the displayed cell value (string to preserve original formatting)
 *   doc_amt           – numeric representation of fld_val (for calculations)
 *   val_unit          – unit of the value ("Billion" | "Percent" | "Dollar" | "NA")
 *   op_seg            – operating segment ("NA" when not segment-specific)
 *   update_dt         – last data update timestamp
 */
export interface FlatFinRecord {
  rpt_fin_type: string;
  rpt_fin_item: string;
  co_cd: string;
  curr_cd: string;
  fiscal_year: number;
  fiscal_quarter: string;
  calendar_year: number;
  calendar_quarter: string;
  fld_val: string;
  doc_amt: number;
  val_unit: string;
  op_seg: string;
  update_dt: string;
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

/** Sentinel value for the calendar_quarter / fiscal_quarter fields of annual records. */
const ANNUAL_QUARTER = 'NA';

/**
 * Derives a canonical period label from calendar_year + calendar_quarter.
 * This ensures table columns always reflect calendar dates.
 *   annual  → "FY2022"
 *   quarterly → "Q1 2023"
 */
function periodLabel(calendarYear: number, calendarQuarter: string): string {
  if (calendarQuarter === ANNUAL_QUARTER) return `FY${calendarYear}`;
  return `${calendarQuarter} ${calendarYear}`;
}

/** Sort key for a period so that annual sorts before quarterly, both chronological.
 *  Annual gets quarter offset 0; Q1–Q4 get offsets 1–4.
 *  Example: FY2022 → 20220, Q1 2025 → 20251, Q4 2025 → 20254.
 */
function periodSortKey(calendarYear: number, calendarQuarter: string): number {
  if (calendarQuarter === ANNUAL_QUARTER) return calendarYear * 10;
  const m = calendarQuarter.match(/^Q(\d)$/);
  const qn = m ? parseInt(m[1], 10) : 0;
  return calendarYear * 10 + qn;
}

/** Parse a canonical period label back to a sort key. */
function parsePeriodSortKey(p: string): number {
  // Quarterly: "Q1 2025"
  const mq = p.match(/^(Q\d)\s+(\d{4})$/);
  if (mq) return periodSortKey(parseInt(mq[2], 10), mq[1]);
  // Annual: "FY2022"
  const ma = p.match(/^FY(\d+)$/);
  if (ma) return periodSortKey(parseInt(ma[1], 10), ANNUAL_QUARTER);
  return 0;
}

/**
 * Converts a flat FlatFinRecord array into a per-company StatementData map,
 * filtering to records whose rpt_fin_type matches `type`.
 * Period ordering: annual first (chronological), then quarterly (chronological).
 */
export function flatToStatementData(
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

    const { co_cd, rpt_fin_item, calendar_year, calendar_quarter, fld_val } = rec;
    const label = periodLabel(calendar_year, calendar_quarter);

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

  if (key === 'income' || key === 'balance' || key === 'cashflow') {
    // Income Statement, Balance Sheet, and Cash Flow use the flat-array format
    const records = extractJsonBySection<FlatFinRecord[]>(rawContent, SECTION_MAP[key]);
    _stmtCache[key] = flatToStatementData(records, key);
  } else {
    // Financial Ratios still uses the legacy nested { company: { periods, items } } format
    _stmtCache[key] = extractJsonBySection<Record<string, StatementData>>(
      rawContent,
      SECTION_MAP[key],
    );
  }

  return _stmtCache[key]!;
}
