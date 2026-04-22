'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import {
  getWatchlistDetail,
  getWatchlistData,
  WATCHLIST_CATEGORY_ID_MAP,
} from '@/app/lib/watchlistApi';
import type { WatchlistDataItem } from '@/app/lib/watchlistApi';

// Default summary view categories
const SUMMARY_CATEGORIES = [1, 2, 3, 4, 5, 6, 20, 8, 11];

export default function WatchlistTemplateContent() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get('id');
  const watchlistId = rawId !== null ? parseInt(rawId, 10) : null;

  const { detail, data, categoryOrder } = useMemo(() => {
    if (watchlistId === null || isNaN(watchlistId)) {
      return { detail: null, data: [], categoryOrder: [] };
    }

    const detailResp = getWatchlistDetail(watchlistId);
    const detail = detailResp.result;

    // Use the default view's selectedCategories, or fall back to SUMMARY_CATEGORIES
    const defaultView = detail.viewlist.find((v) => v.isDefaultForWatchlist === 'Y') ?? detail.viewlist[0];
    const categoryOrder = defaultView?.selectedCategories ?? SUMMARY_CATEGORIES;
    const co_cd = detail.companylist
      .slice()
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((c) => c.coCd);

    const data = getWatchlistData({
      watchlistId,
      viewId: defaultView?.viewId ?? 0,
      year: ['2026'],
      quarter: ['Q1'],
      selectedCategories: categoryOrder,
      co_cd,
    });

    return { detail, data, categoryOrder };
  }, [watchlistId]);

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

  // Build a map: co_cd → categoryId → WatchlistDataItem
  const dataMap = new Map<string, Map<number, WatchlistDataItem>>();
  for (const item of data) {
    if (!dataMap.has(item.co_cd)) dataMap.set(item.co_cd, new Map());
    dataMap.get(item.co_cd)!.set(item.selectedCategories, item);
  }

  const companies = detail.companylist
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map((c) => c.coCd);

  function formatValue(item: WatchlistDataItem | undefined, catId: number): string {
    if (!item || item.fld_val === null || item.fld_val === undefined) return '-';
    const meta = WATCHLIST_CATEGORY_ID_MAP[catId];
    if (!meta) return String(item.fld_val);
    if (meta.type === 'percentage') {
      const v = typeof item.fld_val === 'string' ? item.fld_val : `${item.fld_val}`;
      return v;
    }
    if (meta.type === 'currency') {
      const v = typeof item.fld_val === 'number' ? item.fld_val : parseFloat(String(item.fld_val));
      if (isNaN(v)) return String(item.fld_val);
      return `$${v.toFixed(2)}B`;
    }
    return String(item.fld_val);
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad wl-page">
            {/* Header */}
            <section className="wl-portfolio-section">
              <div className="wl-portfolio-left">
                <div className="wl-portfolio-title-row">
                  <h1 className="wl-portfolio-title">{detail.watchlistName}</h1>
                  <span className="wl-badge">{companies.length} companies</span>
                </div>
                <p className="wl-portfolio-desc">
                  Summary View &mdash; {categoryOrder.length} metrics &bull; Q1 2026
                </p>
              </div>
            </section>

            {/* Table */}
            <div className="wl-table-wrap">
              <table className="wl-table">
                <thead className="wl-thead--white">
                  <tr>
                    <th className="wl-th wl-th--sticky">Company</th>
                    {categoryOrder.map((catId) => {
                      const meta = WATCHLIST_CATEGORY_ID_MAP[catId];
                      return (
                        <th key={catId} className="wl-th">
                          {meta?.label ?? `Cat ${catId}`}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((co) => {
                    const coData = dataMap.get(co);
                    return (
                      <tr key={co} className="wl-tr">
                        <td className="wl-td wl-td--sticky wl-symbol">
                          <Link
                            href={`/company-profile/${co}/`}
                            className="wl-symbol-link"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {co}
                          </Link>
                        </td>
                        {categoryOrder.map((catId) => {
                          const item = coData?.get(catId);
                          const meta = WATCHLIST_CATEGORY_ID_MAP[catId];
                          const raw = item?.fld_val;
                          let cls = '';
                          if (meta?.type === 'percentage' && raw !== null && raw !== undefined) {
                            const n = parseFloat(String(raw));
                            if (!isNaN(n)) cls = n >= 0 ? 'pos' : 'neg';
                          }
                          return (
                            <td key={catId} className={`wl-td${cls ? ` ${cls}` : ''}`}>
                              {formatValue(item, catId)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
