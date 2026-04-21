'use client';

import { useState, useEffect } from 'react';
import { getFavoritesListByUserAcct } from '@/app/lib/watchlistApi';
import { WatchlistContent } from '@/app/watchlist/[id]/WatchlistContent';

const userAcct = 'demoUser';

export default function FavoritesContent() {
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteSymbols(getFavoritesListByUserAcct(userAcct));
  }, []);

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
      onFavoritesSymbolsUpdate={(_symbols) => {
        setFavoriteSymbols(getFavoritesListByUserAcct(userAcct));
      }}
    />
  );
}
