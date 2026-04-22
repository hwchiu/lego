'use client';

import { useState, useEffect } from 'react';
import CompanyProfileLanding from './CompanyProfileLanding';
import { getAllCoFavoriteList, addCompanyToMyFavorite, removeCompanyFromFavorite } from '@/app/lib/watchlistApi';

const USER_ACCT = 'demoUser';

export default function CompanyProfilePage() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    getAllCoFavoriteList(USER_ACCT).then((res) => {
      setFavorites(res.co_cd);
    });
  }, []);

  async function handleToggleFavorite(symbol: string) {
    if (favorites.includes(symbol)) {
      await removeCompanyFromFavorite(symbol);
    } else {
      await addCompanyToMyFavorite(symbol);
    }
    const res = await getAllCoFavoriteList(USER_ACCT);
    setFavorites(res.co_cd);
  }

  return (
    <CompanyProfileLanding favorites={favorites} onToggleFavorite={handleToggleFavorite} />
  );
}
