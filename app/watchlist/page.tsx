'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WatchlistRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/watchlist/627836');
  }, [router]);

  return null;
}
