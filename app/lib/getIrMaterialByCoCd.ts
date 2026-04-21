import { IR_MATERIAL_ENTRIES, IrMaterialEntry } from '@/app/data/irMaterials';

export type { IrMaterialEntry };

/**
 * Simulated API: getIrMaterialByCoCd
 *
 * Fetches IR Material entries from the local data store,
 * filtered by company code (ticker symbol).
 * Returns entries sorted by CREATE_DATE descending (newest first).
 *
 * In production this will call a real backend API:
 *   GET /api/ir-materials?co_cd={coCd}
 *
 * @param company  Company code / ticker symbol, e.g. "AAPL"
 * @returns Promise resolving to an array of IrMaterialEntry
 */
export async function getIrMaterialByCoCd(company: string): Promise<IrMaterialEntry[]> {
  // Simulate network latency (remove when switching to real API)
  // await new Promise((r) => setTimeout(r, 200));

  const filtered = IR_MATERIAL_ENTRIES.filter(
    (e) => e.CO_CD.toUpperCase() === company.toUpperCase(),
  );

  // Sort newest first by CREATE_DATE
  return [...filtered].sort((a, b) => {
    if (b.CREATE_DATE > a.CREATE_DATE) return 1;
    if (b.CREATE_DATE < a.CREATE_DATE) return -1;
    return 0;
  });
}

/**
 * Simulated API: downloadIrMaterialByDocId
 *
 * Opens the PDF bytes file for the given DOC_ID in a new browser tab.
 * In production this calls the backend to retrieve PDF bytes:
 *   GET /api/ir-materials/download?doc_id={docId}
 *
 * @param docId  Primary key of the IR material document (DOC_ID field)
 */
export function downloadIrMaterialByDocId(docId: string): void {
  // In production: open or stream the PDF from the backend API
  const url = `/api/ir-materials/download?doc_id=${encodeURIComponent(docId)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
