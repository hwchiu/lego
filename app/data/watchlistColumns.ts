import catalogData from './watchlist-column-catalog.json';

export interface ColumnEntry {
  id: string;
  columnId: number;
  label: string;
}

export interface CategoryEntry {
  id: string;
  label: string;
  columns: ColumnEntry[];
}

export interface WatchlistColumnCatalog {
  categories: CategoryEntry[];
}

export const watchlistColumnCatalog: WatchlistColumnCatalog = catalogData as WatchlistColumnCatalog;

/**
 * Maps category label → ordered array of column IDs.
 * Used by the "Create New View" picker to populate the Category and Available Columns panels.
 */
export const CATALOG_VIEW_CATEGORIES: Record<string, string[]> = Object.fromEntries(
  watchlistColumnCatalog.categories.map((cat) => [
    cat.label,
    cat.columns.map((col) => col.id),
  ]),
);

/**
 * Maps column ID → display label for every column defined in the catalog.
 * Used to look up labels for new catalog columns that are not in the legacy ALL_COLUMNS map.
 */
export const CATALOG_COLUMN_LABELS: Record<string, string> = Object.fromEntries(
  watchlistColumnCatalog.categories.flatMap((cat) =>
    cat.columns.map((col) => [col.id, col.label]),
  ),
);

/**
 * Maps numeric columnId → string id (e.g. 36 → "isRevenue").
 * Used when rendering custom views that store column selections as numeric columnIds.
 */
export const CATALOG_COLUMN_ID_TO_STRING_ID: Record<number, string> = Object.fromEntries(
  watchlistColumnCatalog.categories.flatMap((cat) =>
    cat.columns.map((col) => [col.columnId, col.id]),
  ),
);
