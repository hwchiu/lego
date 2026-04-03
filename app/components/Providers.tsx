'use client';

import { WatchlistProvider } from '@/app/contexts/WatchlistContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <WatchlistProvider>{children}</WatchlistProvider>;
}
