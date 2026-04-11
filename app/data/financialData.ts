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
  if (!_stmtCache[key]) {
    _stmtCache[key] = extractJsonBySection<Record<string, StatementData>>(
      rawContent,
      SECTION_MAP[key],
    );
  }
  return _stmtCache[key]!;
}
