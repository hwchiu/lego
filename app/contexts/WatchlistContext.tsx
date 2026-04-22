'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { DYNAMIC_WATCHLIST_IDS } from '@/app/data/watchlistData';
import { getUserAllWatchlists, createWatchlistWithCompany } from '@/app/lib/watchlistApi';
import type { ApiWatchlist, WatchlistCompany } from '@/app/lib/watchlistApi';

// Default watchlist IDs and names (matches navigation.ts sub-items)
export const WATCHLIST_IDS = [] as const;
export type WatchlistId = (typeof WATCHLIST_IDS)[number];

const DEFAULT_NAMES: Record<string, string> = {};

const DEFAULT_ORDERS: Record<string, string[]> = {};

export interface DynamicWatchlist {
  id: string;
  name: string;
  symbols: string[];
}

interface WatchlistContextType {
  watchlistNames: Record<string, string>;
  setWatchlistName: (id: string, name: string) => void;
  symbolOrders: Record<string, string[]>;
  setSymbolOrder: (id: string, order: string[]) => void;
  // Dynamic watchlists (user-created, localStorage-based)
  dynamicWatchlists: DynamicWatchlist[];
  addWatchlist: (name: string, symbols: string[]) => string;
  removeWatchlist: (id: string) => void;
  // Deleted static watchlist IDs (persisted in localStorage)
  deletedWatchlists: Set<string>;
  deleteWatchlist: (id: string) => void;
  // Favorites
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  // API-sourced watchlists (from getUserAllWatchlists)
  apiWatchlists: ApiWatchlist[];
  // Create a new watchlist via createWatchlistWithCompany API stub
  createApiWatchlist: (name: string, coCdList: WatchlistCompany[]) => number;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlistNames: DEFAULT_NAMES,
  setWatchlistName: () => {},
  symbolOrders: DEFAULT_ORDERS,
  setSymbolOrder: () => {},
  dynamicWatchlists: [],
  addWatchlist: () => '',
  removeWatchlist: () => {},
  deletedWatchlists: new Set(),
  deleteWatchlist: () => {},
  favorites: new Set(),
  toggleFavorite: () => {},
  apiWatchlists: [],
  createApiWatchlist: () => -1,
});

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlistNames, setWatchlistNames] = useState<Record<string, string>>(DEFAULT_NAMES);
  const [symbolOrders, setSymbolOrders] = useState<Record<string, string[]>>(DEFAULT_ORDERS);
  const [dynamicWatchlists, setDynamicWatchlists] = useState<DynamicWatchlist[]>([]);
  const [deletedWatchlists, setDeletedWatchlists] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [apiWatchlists, setApiWatchlists] = useState<ApiWatchlist[]>([]);
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
      const storedDynamic = localStorage.getItem('wl-dynamic');
      if (storedDynamic) {
        setDynamicWatchlists(JSON.parse(storedDynamic));
      }
      const storedDeleted = localStorage.getItem('wl-deleted');
      if (storedDeleted) {
        setDeletedWatchlists(new Set(JSON.parse(storedDeleted)));
      }
      const storedFavorites = localStorage.getItem('wl-favorites');
      if (storedFavorites) {
        setFavorites(new Set(JSON.parse(storedFavorites)));
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Load API watchlists on mount
  useEffect(() => {
    const { result } = getUserAllWatchlists('demoUser');
    setApiWatchlists(result);
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

  // Persist dynamic watchlists
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('wl-dynamic', JSON.stringify(dynamicWatchlists));
    } catch {
      // ignore storage errors
    }
  }, [dynamicWatchlists, hydrated]);

  // Persist deleted watchlist IDs
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('wl-deleted', JSON.stringify([...deletedWatchlists]));
    } catch {
      // ignore storage errors
    }
  }, [deletedWatchlists, hydrated]);

  // Persist favorites
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('wl-favorites', JSON.stringify([...favorites]));
    } catch {
      // ignore storage errors
    }
  }, [favorites, hydrated]);

  function setWatchlistName(id: string, name: string) {
    setWatchlistNames((prev) => ({ ...prev, [id]: name }));
  }

  function setSymbolOrder(id: string, order: string[]) {
    setSymbolOrders((prev) => ({ ...prev, [id]: order }));
  }

  function addWatchlist(name: string, symbols: string[]): string {
    // Find the next unused dynamic ID
    const usedIds = new Set(dynamicWatchlists.map((w) => w.id));
    const nextId = DYNAMIC_WATCHLIST_IDS.find((id) => !usedIds.has(id));
    if (!nextId) return ''; // All slots used
    const newWl: DynamicWatchlist = { id: nextId, name, symbols };
    const newDynamic = [...dynamicWatchlists, newWl];
    const newNames = { ...watchlistNames, [nextId]: name };
    const newOrders = { ...symbolOrders, [nextId]: symbols };
    setDynamicWatchlists(newDynamic);
    // Also register its name and symbol order
    setWatchlistNames(newNames);
    setSymbolOrders(newOrders);
    // Persist immediately so the new page can read data on the very first render
    // (the useEffect-based persistence runs after paint, which may be too late)
    try {
      localStorage.setItem('wl-dynamic', JSON.stringify(newDynamic));
      localStorage.setItem('wl-names', JSON.stringify(newNames));
      localStorage.setItem('wl-orders', JSON.stringify(newOrders));
    } catch {
      // ignore storage errors
    }
    return nextId;
  }

  function removeWatchlist(id: string) {
    setDynamicWatchlists((prev) => prev.filter((w) => w.id !== id));
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function deleteWatchlist(id: string) {
    const isDynamic = dynamicWatchlists.some((w) => w.id === id);
    if (isDynamic) {
      removeWatchlist(id);
    } else {
      // Mark static watchlist as deleted
      setDeletedWatchlists((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
    // Remove from favorites too
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function createApiWatchlist(name: string, coCdList: WatchlistCompany[]): number {
    const { watchlistId } = createWatchlistWithCompany({ watchlistName: name, coCdList });
    if (watchlistId > 0) {
      // Add to apiWatchlists state so the sidebar updates immediately
      setApiWatchlists((prev) => [
        ...prev,
        { watchlistId, watchlistName: name, isDefault: 'N', defaultViewId: null },
      ]);
    }
    return watchlistId;
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlistNames,
        setWatchlistName,
        symbolOrders,
        setSymbolOrder,
        dynamicWatchlists,
        addWatchlist,
        removeWatchlist,
        deletedWatchlists,
        deleteWatchlist,
        favorites,
        toggleFavorite,
        apiWatchlists,
        createApiWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
