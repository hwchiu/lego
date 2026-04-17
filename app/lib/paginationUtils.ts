/**
 * Generates an array of page numbers and ellipsis markers for a truncated pagination bar.
 *
 * Strategy (common "1 … 4 5 [6] 7 8 … 20" pattern):
 *  - Always show first page and last page.
 *  - Always show `siblingCount` pages on each side of the current page.
 *  - Insert '…' where pages are skipped.
 *
 * @param currentPage  Zero-based current page index
 * @param totalPages   Total number of pages (≥ 1)
 * @param siblingCount Number of siblings on each side of the current page (default 1)
 * @returns Array of page indices (number) or 'left-ellipsis' / 'right-ellipsis' strings
 */
export function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): (number | 'left-ellipsis' | 'right-ellipsis')[] {
  // If total pages fit comfortably, just show all
  // totalPageNumbers = siblings on each side + current + first + last + 2 ellipsis placeholders
  const totalPageNumbers = siblingCount * 2 + 5; // e.g. 1 ... 4 5 6 ... 10 = 7 slots for siblingCount=1
  if (totalPages <= totalPageNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 2);

  const showLeftEllipsis = leftSiblingIndex > 1;
  const showRightEllipsis = rightSiblingIndex < totalPages - 2;

  const result: (number | 'left-ellipsis' | 'right-ellipsis')[] = [];

  // Always show first page
  result.push(0);

  if (showLeftEllipsis) {
    result.push('left-ellipsis');
  } else {
    // Fill pages between first and left sibling
    for (let i = 1; i < leftSiblingIndex; i++) {
      result.push(i);
    }
  }

  // Sibling range (includes current page)
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    result.push(i);
  }

  if (showRightEllipsis) {
    result.push('right-ellipsis');
  } else {
    // Fill pages between right sibling and last
    for (let i = rightSiblingIndex + 1; i < totalPages - 1; i++) {
      result.push(i);
    }
  }

  // Always show last page
  result.push(totalPages - 1);

  return result;
}
