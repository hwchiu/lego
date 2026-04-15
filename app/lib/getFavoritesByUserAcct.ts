import favoritesData from '@/app/data/FavoritesCompanyList.json';

/**
 * Returns the list of favourite company symbols for the given user account.
 * For demo purposes the data is sourced from FavoritesCompanyList.json.
 */
export function getFavoritesByUserAcct(userAcct: string): string[] {
  // userAcct is accepted as a parameter for future extensibility.
  // The demo data has a single entry keyed as "Favorites".
  void userAcct;
  const entry = favoritesData[0] as { Favorites?: string[] };
  return entry?.Favorites ?? [];
}
