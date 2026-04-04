'use client';

import { createContext, useContext, useState } from 'react';

interface MobileSidebarContextType {
  isMobileOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  isMobileOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function MobileSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  return (
    <MobileSidebarContext.Provider
      value={{
        isMobileOpen,
        openSidebar: () => setIsMobileOpen(true),
        closeSidebar: () => setIsMobileOpen(false),
        toggleSidebar: () => setIsMobileOpen((prev) => !prev),
      }}
    >
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}
