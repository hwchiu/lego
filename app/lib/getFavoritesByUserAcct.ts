import favoritesData from '@/app/data/FavoritesCompanyList.json';

/**
 * Returns the list of favorite company symbols for the given user account.
 * For demo purposes the data is sourced from FavoritesCompanyList.json.
 */
export function getFavoritesByUserAcct(_userAcct: string): string[] {
  // _userAcct is accepted as a parameter for future extensibility.
  // The demo data has a single entry keyed as "Favorites".
  const entry = favoritesData[0] as { Favorites?: string[] };
  return entry?.Favorites ?? [];
}
