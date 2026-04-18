'use client';

import { useMemo } from 'react';
import { getFavoritesByUserAcct } from '@/app/lib/getFavoritesByUserAcct';
import { WatchlistContent } from '@/app/watchlist/[id]/WatchlistContent';

const userAcct = 'demoUser';

export default function FavoritesContent() {
  const favoriteSymbols = useMemo(() => getFavoritesByUserAcct(userAcct), []);

  return (
    <WatchlistContent
      params={{ id: 'favorites' }}
      initialSymbols={favoriteSymbols}
      watchlistNameOverride="Favorites"
      useOverrideName
      forceFavoriteStar
      disableDeleteWatchlist
      disableNameEdit
      disableCompanyDelete
    />
  );
}
