'use client';

import { useState, useEffect } from 'react';
import CompanyProfileLanding from './CompanyProfileLanding';
import { setFavoritesInPersonality } from '@/app/lib/getFavoritesByUserAcct';
import { getFavoritesListByUserAcct } from '@/app/lib/watchlistApi';

export default function CompanyProfilePage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(getFavoritesListByUserAcct('demoUser'));
  }, []);

  function handleToggleFavorite(symbol: string) {
    setFavorites((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      setFavoritesInPersonality(next);
      return next;
    });
  }

  return (
    <CompanyProfileLanding favorites={favorites} onToggleFavorite={handleToggleFavorite} />
  );
}
