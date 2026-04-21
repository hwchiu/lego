import finFcstSumMd from '@/content/fin-fcst-sum.md';
import { extractJsonBySection } from '@/app/lib/parseContent';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FinFcstSumRecord {
  co_cd: string;
  period: string;
  cal_year_no: string;
  fld_val: number | null;
  curr_cd: string;
  op_seg: string;
  val_unit: string;
  doc_amt: number | null;
  twd_amt: number | null;
  rpt_fin_item: string;
  create_date: string;
  update_date: string;
}

// ── Cache ─────────────────────────────────────────────────────────────────────

let _allRecords: FinFcstSumRecord[] | null = null;

function getAllRecords(): FinFcstSumRecord[] {
  if (_allRecords === null) {
    _allRecords = extractJsonBySection<FinFcstSumRecord[]>(
      finFcstSumMd as string,
      'Fin Fcst Sum',
    );
  }
  return _allRecords;
}

const _cache: Record<string, FinFcstSumRecord[]> = {};

/**
 * Simulated API: getFinFcstSumByCoCd
 *
 * Fetches financial forecast summary records for a given company code.
 * Returns records with fields including rpt_fin_item, cal_year_no, period, and fld_val.
 *
 * Supported rpt_fin_item values:
 *   - GUDNC_REV: Revenue midpoint guidance for the given calendar quarter
 *   - NEXT_REV:  Revenue estimate for the next calendar quarter (stored under current quarter's label)
 *
 * In production this will call a real backend API:
 *   GET /api/fin-fcst-sum?co_cd={coCd}
 *
 * @param coCd  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to FinFcstSumRecord[]
 */
export async function getFinFcstSumByCoCd(coCd: string): Promise<FinFcstSumRecord[]> {
  if (_cache[coCd] !== undefined) return _cache[coCd];
  const all = getAllRecords();
  _cache[coCd] = all.filter((r) => r.co_cd === coCd);
  return _cache[coCd];
}
