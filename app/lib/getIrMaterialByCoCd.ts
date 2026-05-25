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
 * Fetches the PDF for the given DOC_ID from the backend and triggers a
 * browser download.  Returns `true` on success, `false` when the server
 * returns an error, an empty body, or the request fails entirely.
 *
 * In production this calls the backend to retrieve PDF bytes:
 *   GET /api/ir-materials/download?doc_id={docId}
 *
 * @param docId  Primary key of the IR material document (DOC_ID field)
 * @returns Promise<boolean>  true = file downloaded, false = no data / error
 */
export async function downloadIrMaterialByDocId(docId: string): Promise<boolean> {
  const url = `/api/ir-materials/download?doc_id=${encodeURIComponent(docId)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const blob = await res.blob();
    if (!blob || blob.size === 0) return false;
    const objUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objUrl;
    a.download = `${docId}.pdf`;
    a.click();
    URL.revokeObjectURL(objUrl);
    return true;
  } catch {
    return false;
  }
}
