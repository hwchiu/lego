'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WatchlistRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Requirement #1: Always redirect to Watchlist Favorites
    router.replace('/watchlist/favorites/');
  }, [router]);

  return null;
}
