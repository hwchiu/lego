// ── Types ─────────────────────────────────────────────────────────────────────

export interface SegInfoRecord {
  CO_CD: string;
  /** Which anal_seg_level to use for Revenue Breakdown items: "1", "2", or "3" */
  SEG_LEVEL: string;
  /** The sale_type value in the segment data to filter Revenue Breakdown records */
  SEG_TYPE: string;
}

// ── Static config ─────────────────────────────────────────────────────────────

/**
 * Per-company configuration that maps a company code to the segment level and
 * sale_type used for the Revenue Breakdown card in FIN. Summary.
 *
 * In production this would be fetched from a backend API:
 *   GET /api/seg-info?co_cd={coCd}
 */
const SEG_INFO_MAP: Record<string, SegInfoRecord> = {
  AAPL: { CO_CD: 'AAPL', SEG_LEVEL: '1', SEG_TYPE: 'Revenue ($M)' },
};

// ── API function ──────────────────────────────────────────────────────────────

/**
 * Simulated API: getSegInfoByCoCd
 *
 * Returns the segment configuration for a given company code, specifying
 * which sale_type and seg_level to use when deriving the Revenue Breakdown.
 *
 * Response format:
 * {
 *   "CO_CD": "AAPL",
 *   "SEG_LEVEL": "1",
 *   "SEG_TYPE": "PG_REVENUE"
 * }
 *
 * @param coCd  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to SegInfoRecord or null if no config available
 */
export async function getSegInfoByCoCd(coCd: string): Promise<SegInfoRecord | null> {
  return SEG_INFO_MAP[coCd] ?? null;
}
