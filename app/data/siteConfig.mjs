export const SITE_BASE_PATH = '/lego';

// These symbols are linked from shipped UI/data but are not present in company_master.md:
// BRK-B/MCD appear in watchlist data, SMH appears in news data, and TC appears across earnings/search/watchlist data.
// They stay separate as a deliberate export override because those links already ship today, while company_master.md still excludes these preview/non-master symbols.
// Keep them statically exported so those links do not fall through to the 404 page.
export const EXTRA_COMPANY_PROFILE_SYMBOLS = ['BRK-B', 'MCD', 'SMH', 'TC'];
