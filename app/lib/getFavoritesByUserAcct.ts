import favoritesData from '@/app/data/FavoritesCompanyList.json';

/**
 * Local JSON format object for user personality/preferences.
 * Stored in localStorage under PERSONALITY_KEY.
 */
export interface UserPersonality {
  /** Favorite company symbols for the current user. */
  co_cd: string[];
}

const PERSONALITY_KEY = 'user-personality';

/**
 * Returns the list of favorite company symbols for the given user account.
 * Reads from the user-personality localStorage object (co_cd field).
 * Falls back to the default data in FavoritesCompanyList.json if not found.
 */
export function getFavoritesByUserAcct(_userAcct: string): string[] {
  // _userAcct is accepted as a parameter for future extensibility.
  const entry = favoritesData?.[0] as { co_cd?: string[] } | undefined;
  const fallback = entry?.co_cd ?? [];

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const stored = localStorage.getItem(PERSONALITY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as UserPersonality;
      return Array.isArray(parsed.co_cd) ? parsed.co_cd : fallback;
    }

    // Backward-compat: migrate from legacy 'cp-favorites' key (raw array)
    const legacy = localStorage.getItem('cp-favorites');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed)) {
        const personality: UserPersonality = { co_cd: parsed };
        localStorage.setItem(PERSONALITY_KEY, JSON.stringify(personality));
        localStorage.removeItem('cp-favorites');
        return parsed as string[];
      }
    }

    return fallback;
  } catch {
    return fallback;
  }
}

/**
 * Persists the given list of favorite company symbols into the user-personality
 * object in localStorage.  Creates the object if it does not exist yet.
 */
export function setFavoritesInPersonality(symbols: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(PERSONALITY_KEY);
    const personality: UserPersonality = stored ? (JSON.parse(stored) as UserPersonality) : { co_cd: [] };
    personality.co_cd = symbols;
    localStorage.setItem(PERSONALITY_KEY, JSON.stringify(personality));
  } catch {
    // ignore storage errors
  }
}
