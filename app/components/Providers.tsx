'use client';

import { WatchlistProvider } from '@/app/contexts/WatchlistContext';
import { LanguageProvider } from '@/app/contexts/LanguageContext';
import { MobileSidebarProvider } from '@/app/contexts/MobileSidebarContext';
import { BannerProvider } from '@/app/contexts/BannerContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <WatchlistProvider>
        <MobileSidebarProvider>
          <BannerProvider>{children}</BannerProvider>
        </MobileSidebarProvider>
      </WatchlistProvider>
    </LanguageProvider>
  );
}
