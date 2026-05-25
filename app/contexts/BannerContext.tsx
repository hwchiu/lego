'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface BannerContextType {
  dismissed: boolean;
  dismissBanner: () => void;
}

const BannerContext = createContext<BannerContextType>({
  dismissed: false,
  dismissBanner: () => {},
});

export function BannerProvider({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState(false);

  const dismissBanner = useCallback(() => setDismissed(true), []);

  return (
    <BannerContext.Provider value={{ dismissed, dismissBanner }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  return useContext(BannerContext);
}
