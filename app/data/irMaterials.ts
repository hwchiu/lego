/**
 * IR Material data entries in the unified API format.
 *
 * Format mirrors the production API response:
 *   GET /api/ir-materials?co_cd={coCd}
 *
 * Fields:
 *   CO_CD       — Company ticker symbol (e.g. "AAPL")
 *   DOC_TYPE    — Document category (e.g. "annual-report", "quarterly-report",
 *                 "press-release", "investor-conference", "presentation")
 *   SRC_NAME    — Source name (e.g. "Website", "SEC EDGAR")
 *   CREATE_DATE — Document creation / filing date (YYYY-MM-DD)
 *   DOC_ID      — Primary key; used by downloadIrMaterialByDocId() to fetch PDF bytes
 */
export interface IrMaterialEntry {
  CO_CD: string;
  DOC_TYPE: string;
  SRC_NAME: string;
  CREATE_DATE: string;
  DOC_ID: string;
}

export const IR_MATERIAL_ENTRIES: IrMaterialEntry[] = [
  // ── AAPL — Annual Reports (10-K) ──────────────────────────────────────────
  { CO_CD: 'AAPL', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-11-01', DOC_ID: '1594001678711001' },
  { CO_CD: 'AAPL', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2023-11-03', DOC_ID: '1594001678711002' },
  { CO_CD: 'AAPL', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2022-10-28', DOC_ID: '1594001678711003' },
  { CO_CD: 'AAPL', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2021-10-29', DOC_ID: '1594001678711004' },

  // ── AAPL — Quarterly Reports (10-Q) ───────────────────────────────────────
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-08-02', DOC_ID: '1594001678712001' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-05-03', DOC_ID: '1594001678712002' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-02-02', DOC_ID: '1594001678712003' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2023-08-04', DOC_ID: '1594001678712004' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2023-05-05', DOC_ID: '1594001678712005' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2023-02-03', DOC_ID: '1594001678712006' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2022-07-29', DOC_ID: '1594001678712007' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2022-04-29', DOC_ID: '1594001678712008' },
  { CO_CD: 'AAPL', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2022-01-28', DOC_ID: '1594001678712009' },

  // ── AAPL — Earnings Press Releases ────────────────────────────────────────
  { CO_CD: 'AAPL', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2024-10-31', DOC_ID: '1594001678713001' },
  { CO_CD: 'AAPL', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2024-08-01', DOC_ID: '1594001678713002' },
  { CO_CD: 'AAPL', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2024-05-02', DOC_ID: '1594001678713003' },
  { CO_CD: 'AAPL', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2024-02-01', DOC_ID: '1594001678713004' },
  { CO_CD: 'AAPL', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2023-11-02', DOC_ID: '1594001678713005' },
  { CO_CD: 'AAPL', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2023-08-03', DOC_ID: '1594001678713006' },

  // ── AAPL — Investor Presentations ─────────────────────────────────────────
  { CO_CD: 'AAPL', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2024-09-18', DOC_ID: '1594001678714001' },
  { CO_CD: 'AAPL', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2024-02-28', DOC_ID: '1594001678714002' },
  { CO_CD: 'AAPL', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2023-09-20', DOC_ID: '1594001678714003' },
  { CO_CD: 'AAPL', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2023-02-28', DOC_ID: '1594001678714004' },

  // ── TC (TSMC) — Annual Reports (20-F) ─────────────────────────────────────
  { CO_CD: 'TC', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2025-04-01', DOC_ID: '1594001678721001' },
  { CO_CD: 'TC', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-04-01', DOC_ID: '1594001678721002' },
  { CO_CD: 'TC', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2023-04-01', DOC_ID: '1594001678721003' },
  { CO_CD: 'TC', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2022-04-01', DOC_ID: '1594001678721004' },

  // ── TC (TSMC) — Quarterly Earnings (6-K) ──────────────────────────────────
  { CO_CD: 'TC', DOC_TYPE: 'quarterly-report', SRC_NAME: 'Website', CREATE_DATE: '2025-01-16', DOC_ID: '1594001678722001' },
  { CO_CD: 'TC', DOC_TYPE: 'quarterly-report', SRC_NAME: 'Website', CREATE_DATE: '2024-10-17', DOC_ID: '1594001678722002' },
  { CO_CD: 'TC', DOC_TYPE: 'quarterly-report', SRC_NAME: 'Website', CREATE_DATE: '2024-07-18', DOC_ID: '1594001678722003' },
  { CO_CD: 'TC', DOC_TYPE: 'quarterly-report', SRC_NAME: 'Website', CREATE_DATE: '2024-04-18', DOC_ID: '1594001678722004' },
  { CO_CD: 'TC', DOC_TYPE: 'quarterly-report', SRC_NAME: 'Website', CREATE_DATE: '2024-01-18', DOC_ID: '1594001678722005' },
  { CO_CD: 'TC', DOC_TYPE: 'quarterly-report', SRC_NAME: 'Website', CREATE_DATE: '2023-10-19', DOC_ID: '1594001678722006' },

  // ── TC (TSMC) — Investor Conference Materials ──────────────────────────────
  { CO_CD: 'TC', DOC_TYPE: 'investor-conference', SRC_NAME: 'Website', CREATE_DATE: '2024-06-04', DOC_ID: '1594001678723001' },
  { CO_CD: 'TC', DOC_TYPE: 'investor-conference', SRC_NAME: 'Website', CREATE_DATE: '2024-04-24', DOC_ID: '1594001678723002' },
  { CO_CD: 'TC', DOC_TYPE: 'investor-conference', SRC_NAME: 'Website', CREATE_DATE: '2023-06-06', DOC_ID: '1594001678723003' },

  // ── NVDA — Investor Presentations ─────────────────────────────────────────
  { CO_CD: 'NVDA', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2026-03-18', DOC_ID: '1594001678731001' },
  { CO_CD: 'NVDA', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2025-11-19', DOC_ID: '1594001678731002' },
  { CO_CD: 'NVDA', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2025-06-12', DOC_ID: '1594001678731003' },
  { CO_CD: 'NVDA', DOC_TYPE: 'presentation', SRC_NAME: 'Website', CREATE_DATE: '2025-03-19', DOC_ID: '1594001678731004' },

  // ── NVDA — Annual Reports (10-K) ──────────────────────────────────────────
  { CO_CD: 'NVDA', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2026-02-26', DOC_ID: '1594001678732001' },
  { CO_CD: 'NVDA', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2025-02-27', DOC_ID: '1594001678732002' },
  { CO_CD: 'NVDA', DOC_TYPE: 'annual-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-02-21', DOC_ID: '1594001678732003' },

  // ── NVDA — Quarterly Reports (10-Q) ───────────────────────────────────────
  { CO_CD: 'NVDA', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2025-11-20', DOC_ID: '1594001678733001' },
  { CO_CD: 'NVDA', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2025-08-27', DOC_ID: '1594001678733002' },
  { CO_CD: 'NVDA', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2025-05-28', DOC_ID: '1594001678733003' },
  { CO_CD: 'NVDA', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-11-21', DOC_ID: '1594001678733004' },
  { CO_CD: 'NVDA', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-08-28', DOC_ID: '1594001678733005' },
  { CO_CD: 'NVDA', DOC_TYPE: 'quarterly-report', SRC_NAME: 'SEC EDGAR', CREATE_DATE: '2024-05-22', DOC_ID: '1594001678733006' },

  // ── NVDA — Earnings Press Releases ────────────────────────────────────────
  { CO_CD: 'NVDA', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2026-02-26', DOC_ID: '1594001678734001' },
  { CO_CD: 'NVDA', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2025-11-19', DOC_ID: '1594001678734002' },
  { CO_CD: 'NVDA', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2025-08-27', DOC_ID: '1594001678734003' },
  { CO_CD: 'NVDA', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2025-05-28', DOC_ID: '1594001678734004' },
  { CO_CD: 'NVDA', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2025-02-26', DOC_ID: '1594001678734005' },
  { CO_CD: 'NVDA', DOC_TYPE: 'press-release', SRC_NAME: 'Website', CREATE_DATE: '2024-11-20', DOC_ID: '1594001678734006' },
];
