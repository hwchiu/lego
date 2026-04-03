'use client';

import { WatchlistProvider } from '@/app/contexts/WatchlistContext';
import { LanguageProvider } from '@/app/contexts/LanguageContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WatchlistProvider>{children}</WatchlistProvider>
    </LanguageProvider>
  );
}
