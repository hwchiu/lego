import fundingData from '@/content/funding.json';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FundingRecord {
  org_url: string;
  fund_type: string;
  fund_amount: number | null;
  fund_amount_curr: string;
  money_raised_curr: string;
  trans_name: string;
  fund_amount_usd: number | null;
  co_cd: string;
  update_dt: string;
  data_type: string;
  publ_dt: string;
  org_catg: string;
  create_dt: string;
  money_raised_usd: number | null;
  trans_name_url: string;
  org_name: string;
  money_raised: number | null;
  invest_name: string;
  invest_num: number | null;
}

/**
 * Simulated API: getFundingByCoCd
 *
 * Fetches funding records from the local JSON data store,
 * filtered by company code (co_cd).
 * Returns records sorted by publ_dt descending (newest first).
 *
 * In production this will call a real backend API:
 *   GET /api/fundings?co_cd={coCd}
 *
 * @param coCd  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to an array of FundingRecord
 */
export async function getFundingByCoCd(
  coCd: string,
): Promise<FundingRecord[]> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  const allRecords = fundingData as FundingRecord[];
  const filtered = allRecords.filter((r) => r.co_cd === coCd);

  // Sort newest first by publ_dt desc
  return [...filtered].sort((a, b) => b.publ_dt.localeCompare(a.publ_dt));
}
