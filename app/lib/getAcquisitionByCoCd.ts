import acquisitionData from '@/content/apple-acquisition.json';
import { getCompanyByCode } from '@/app/data/companyMaster';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AcquisitionRaw {
  price_usd: number | null;
  target_name: string;
  target_url: string | null;
  acq_name: string;
  publ_dt_prcsn: string | null;
  trans_name: string | null;
  price_curr: string | null;
  acq_url: string;
  co_cd: string | null;
  price: number | null;
  acq_catg: string;
  update_dt: string | null;
  publ_dt: string;
  create_dt: string | null;
  trans_name_url: string | null;
}

export interface AcquisitionDeal {
  date: string;
  acquiredCompany: string;
  categories: string[];
  valueM: number | null;
  url: string;
}

export interface AcquisitionResult {
  deals: AcquisitionDeal[];
  companyName: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const USD_TO_MILLIONS = 1_000_000;

function mapRawToDeal(raw: AcquisitionRaw): AcquisitionDeal {
  const datePart = raw.publ_dt ? raw.publ_dt.slice(0, 10) : '';
  return {
    date: datePart,
    acquiredCompany: raw.target_name,
    categories: raw.acq_catg ? raw.acq_catg.split(',').map((s) => s.trim()).filter(Boolean) : [],
    valueM: raw.price_usd != null ? raw.price_usd / USD_TO_MILLIONS : null,
    url: raw.acq_url,
  };
}

/**
 * Simulated API: getAcquisitionByCoCd
 *
 * Fetches acquisition deal entries from the local JSON data store,
 * filtered by company code (co_cd).
 * Returns deals sorted by date descending (newest first),
 * along with the company display name.
 *
 * In production this will call a real backend API:
 *   GET /api/acquisitions?co_cd={coCd}
 *
 * @param coCd  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to an AcquisitionResult
 */
export async function getAcquisitionByCoCd(
  coCd: string,
): Promise<AcquisitionResult> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  const rawData = acquisitionData as AcquisitionRaw[];
  const filtered = rawData.filter((r) => r.co_cd === coCd);
  const deals = filtered.map(mapRawToDeal);

  // Sort newest first by date desc
  deals.sort((a, b) => b.date.localeCompare(a.date));

  const companyMaster = getCompanyByCode(coCd);
  const companyName = companyMaster?.CO_NAME ?? coCd;

  return { deals, companyName };
}
