import investmentData from '@/content/investment.json';

// ── Types ─────────────────────────────────────────────────────────────────────

interface InvestmentRaw {
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
  org_catg: string | null;
  create_dt: string;
  money_raised_usd: number | null;
  trans_name_url: string;
  org_name: string;
  money_raised: number | null;
  invest_name: string;
  invest_num: number | null;
}

export interface InvestmentDeal {
  date: string;
  investedCompany: string;
  categories: string[];
  round: string;
  valueM: number | null;
  investorsNum: number | null;
  url: string;
}

export interface InvestmentResult {
  deals: InvestmentDeal[];
  investName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const USD_TO_MILLIONS = 1_000_000;

function mapRawToDeal(raw: InvestmentRaw): InvestmentDeal {
  const datePart = raw.publ_dt.slice(0, 10);
  return {
    date: datePart,
    investedCompany: raw.org_name,
    categories: raw.org_catg ? raw.org_catg.split(',').map((s) => s.trim()).filter(Boolean) : [],
    round: raw.fund_type,
    valueM: raw.money_raised_usd != null ? raw.money_raised_usd / USD_TO_MILLIONS : null,
    investorsNum: raw.invest_num,
    url: raw.trans_name_url,
  };
}

/**
 * Simulated API: getInvestmentByCoCd
 *
 * Fetches investment deal entries from the local JSON data store,
 * filtered by company code (co_cd).
 * Returns deals sorted by date descending (newest first),
 * along with the invest_name from the first matching record.
 *
 * In production this will call a real backend API:
 *   GET /api/investments?co_cd={coCd}
 *
 * @param coCd  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to an InvestmentResult
 */
export async function getInvestmentByCoCd(
  coCd: string,
): Promise<InvestmentResult> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  const rawData = investmentData as InvestmentRaw[];
  const filtered = rawData.filter((r) => r.co_cd === coCd);
  const deals = filtered.map(mapRawToDeal);

  // Sort newest first by date desc
  deals.sort((a, b) => b.date.localeCompare(a.date));

  const investName = filtered.length > 0 ? filtered[0].invest_name : coCd;

  return { deals, investName };
}
