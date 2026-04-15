import favoritesData from '@/app/data/FavoritesCompanyList.json';

/**
 * Returns the list of favorite company symbols for the given user account.
 * For demo purposes the data is sourced from FavoritesCompanyList.json.
 */
export function getFavoritesByUserAcct(_userAcct: string): string[] {
  // _userAcct is accepted as a parameter for future extensibility.
  const entry = favoritesData?.[0] as { co_cd?: string[] } | undefined;
  const fallback = entry?.co_cd ?? [];

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = localStorage.getItem('cp-favorites');
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
