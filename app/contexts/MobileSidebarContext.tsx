'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

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

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const openSidebar = useCallback(() => setIsMobileOpen(true), []);
  const closeSidebar = useCallback(() => setIsMobileOpen(false), []);
  const toggleSidebar = useCallback(() => setIsMobileOpen((prev) => !prev), []);

  // Close sidebar on route change (resize beyond mobile)
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <MobileSidebarContext.Provider value={{ isMobileOpen, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}
