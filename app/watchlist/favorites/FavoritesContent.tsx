'use client';

import { useState, useEffect } from 'react';
import { getAllCoFavoriteList } from '@/app/lib/watchlistApi';
import { WatchlistContent } from '@/app/watchlist/[id]/WatchlistContent';

const userAcct = 'demoUser';

export default function FavoritesContent() {
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>([]);

  useEffect(() => {
    getAllCoFavoriteList(userAcct).then((res) => {
      setFavoriteSymbols(res.co_cd);
    });
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
        getAllCoFavoriteList(userAcct).then((res) => {
          setFavoriteSymbols(res.co_cd);
        });
      }}
    />
  );
}
