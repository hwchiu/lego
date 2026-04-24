'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { getWatchlistDetail } from '@/app/lib/watchlistApi';
import { WatchlistContent } from '@/app/watchlist/[id]/WatchlistContent';
import FavoritesContent from '@/app/watchlist/favorites/FavoritesContent';

export default function WatchlistTemplateContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get('id');
  const watchlistId = rawId !== null ? parseInt(rawId, 10) : null;

  // Always call useMemo at the top level (Rules of Hooks)
  const { detail, symbols, watchlistName } = useMemo(() => {
    // id=0 is reserved for Favorites — skip generic detail lookup
    if (watchlistId === null || isNaN(watchlistId) || watchlistId === 0) {
      return { detail: null, symbols: [] as string[], watchlistName: '' };
    }

    const detailResp = getWatchlistDetail(watchlistId);
    const detail = detailResp.result;
    const symbols = detail.companylist
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((c) => c.coCd);

    return { detail, symbols, watchlistName: detail.watchlistName };
  }, [watchlistId]);

  // id=0 is reserved for the Favorites page
  if (watchlistId === 0) {
    return <FavoritesContent />;
  }

  if (watchlistId === null || isNaN(watchlistId)) {
    return (
      <>
        <TopNav />
        <Banner />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <div className="page-pad wl-page">
              <p style={{ padding: '32px 0', color: 'var(--c-text)', opacity: 0.5 }}>
                No watchlist selected.
              </p>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (!detail) {
    return (
      <>
        <TopNav />
        <Banner />
        <div className="app-body">
          <Sidebar />
          <main className="main-content">
            <div className="page-pad wl-page">
              <p style={{ padding: '32px 0', color: 'var(--c-text)', opacity: 0.5 }}>
                Watchlist not found.
              </p>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <WatchlistContent
      params={{ id: String(watchlistId) }}
      initialSymbols={symbols}
      watchlistNameOverride={watchlistName}
      useOverrideName={true}
    />
  );
}
