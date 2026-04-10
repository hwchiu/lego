'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WATCHLIST_IDS } from '@/app/contexts/WatchlistContext';

export default function WatchlistRedirect() {
  const router = useRouter();

  useEffect(() => {
    try {
      const deletedStored = localStorage.getItem('wl-deleted');
      const deletedSet: Set<string> = deletedStored
        ? new Set(JSON.parse(deletedStored))
        : new Set();
      const dynamicStored = localStorage.getItem('wl-dynamic');
      const dynamic: Array<{ id: string }> = dynamicStored ? JSON.parse(dynamicStored) : [];

      const firstStatic = WATCHLIST_IDS.find((id) => !deletedSet.has(id));
      if (firstStatic) {
        router.replace(`/watchlist/${firstStatic}`);
      } else if (dynamic.length > 0) {
        router.replace(`/watchlist/${dynamic[0].id}`);
      } else {
        router.replace('/watchlist/create/');
      }
    } catch {
      router.replace('/watchlist/627836');
    }
  }, [router]);

  return null;
}
