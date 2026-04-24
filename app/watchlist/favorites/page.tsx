'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/watchlist/?id=0');
  }, [router]);
  return null;
}
