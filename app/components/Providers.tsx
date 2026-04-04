'use client';

import { WatchlistProvider } from '@/app/contexts/WatchlistContext';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { MobileSidebarProvider } from '@/app/contexts/MobileSidebarContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WatchlistProvider>
        <MobileSidebarProvider>{children}</MobileSidebarProvider>
      </WatchlistProvider>
    </LanguageProvider>
  );
}
