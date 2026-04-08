'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

/** Matches the CSS @media (max-width: 768px) breakpoint used throughout globals.css */
export const MOBILE_BREAKPOINT = 768;

interface MobileSidebarContextType {
  isMobileOpen: boolean;
  isDesktopCollapsed: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  toggleDesktopCollapsed: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType>({
  isMobileOpen: false,
  isDesktopCollapsed: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
  toggleDesktopCollapsed: () => {},
});

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  const openSidebar = useCallback(() => setIsMobileOpen(true), []);
  const closeSidebar = useCallback(() => setIsMobileOpen(false), []);
  const toggleSidebar = useCallback(() => setIsMobileOpen((prev) => !prev), []);
  const toggleDesktopCollapsed = useCallback(() => setIsDesktopCollapsed((prev) => !prev), []);

  // Close mobile sidebar on resize beyond mobile breakpoint
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
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
    <MobileSidebarContext.Provider
      value={{ isMobileOpen, isDesktopCollapsed, openSidebar, closeSidebar, toggleSidebar, toggleDesktopCollapsed }}
    >
      {children}
    </MobileSidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  return useContext(MobileSidebarContext);
}
