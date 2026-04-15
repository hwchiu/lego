'use client';

import { useState, useEffect } from 'react';
import CompanyProfileLanding from './CompanyProfileLanding';
import { getFavoritesByUserAcct } from '@/app/lib/getFavoritesByUserAcct';

const FAVORITES_KEY = 'cp-favorites';

export default function CompanyProfilePage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored) as string[]);
      } else {
        setFavorites(getFavoritesByUserAcct('demoUser'));
      }
    } catch {
      // ignore
    }
  }, []);

  function handleToggleFavorite(symbol: string) {
    setFavorites((prev) => {
      const base = prev.length > 0 ? prev : getFavoritesByUserAcct('demoUser');
      const next = base.includes(symbol) ? base.filter((s) => s !== symbol) : [...base, symbol];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  return (
    <CompanyProfileLanding favorites={favorites} onToggleFavorite={handleToggleFavorite} />
  );
}
