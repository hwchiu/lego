'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Default watchlist IDs and names (matches navigation.ts sub-items)
export const WATCHLIST_IDS = ['627836', '738291', '394827'] as const;
export type WatchlistId = (typeof WATCHLIST_IDS)[number];

const DEFAULT_NAMES: Record<string, string> = {
  '627836': 'Watchlist1',
  '738291': 'Watchlist-TSM',
  '394827': 'Watchlist2',
};

const DEFAULT_SYMBOL_ORDER = ['TSM', 'TSLA', 'QCOM', 'GOOGL', 'SONY', 'AAPL', 'NVDA', 'ASML'];

const DEFAULT_ORDERS: Record<string, string[]> = {
  '627836': [...DEFAULT_SYMBOL_ORDER],
  '738291': [...DEFAULT_SYMBOL_ORDER],
  '394827': [...DEFAULT_SYMBOL_ORDER],
};

interface WatchlistContextType {
  watchlistNames: Record<string, string>;
  setWatchlistName: (id: string, name: string) => void;
  symbolOrders: Record<string, string[]>;
  setSymbolOrder: (id: string, order: string[]) => void;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlistNames: DEFAULT_NAMES,
  setWatchlistName: () => {},
  symbolOrders: DEFAULT_ORDERS,
  setSymbolOrder: () => {},
});

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlistNames, setWatchlistNames] = useState<Record<string, string>>(DEFAULT_NAMES);
  const [symbolOrders, setSymbolOrders] = useState<Record<string, string[]>>(DEFAULT_ORDERS);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedNames = localStorage.getItem('wl-names');
      if (storedNames) {
        setWatchlistNames((prev) => ({ ...prev, ...JSON.parse(storedNames) }));
      }
      const storedOrders = localStorage.getItem('wl-orders');
      if (storedOrders) {
        setSymbolOrders((prev) => ({ ...prev, ...JSON.parse(storedOrders) }));
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist names to localStorage when they change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('wl-names', JSON.stringify(watchlistNames));
    } catch {
      // ignore storage errors
    }
  }, [watchlistNames, hydrated]);

  // Persist orders to localStorage when they change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('wl-orders', JSON.stringify(symbolOrders));
    } catch {
      // ignore storage errors
    }
  }, [symbolOrders, hydrated]);

  function setWatchlistName(id: string, name: string) {
    setWatchlistNames((prev) => ({ ...prev, [id]: name }));
  }

  function setSymbolOrder(id: string, order: string[]) {
    setSymbolOrders((prev) => ({ ...prev, [id]: order }));
  }

  return (
    <WatchlistContext.Provider value={{ watchlistNames, setWatchlistName, symbolOrders, setSymbolOrder }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
