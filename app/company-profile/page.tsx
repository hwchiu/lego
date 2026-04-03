'use client';

import { useState, useEffect } from 'react';
import CompanyProfileLanding from './CompanyProfileLanding';

const FAVORITES_KEY = 'cp-favorites';

export default function CompanyProfilePage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) setFavorites(JSON.parse(stored) as string[]);
    } catch {
      // ignore
    }
  }, []);

  function handleToggleFavorite(symbol: string) {
    setFavorites((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
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
