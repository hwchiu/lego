'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllCoFavoriteList, WATCHLIST_MAX_COMPANIES } from '@/app/lib/watchlistApi';
import { WatchlistContent } from '@/app/watchlist/[id]/WatchlistContent';

const userAcct = 'demoUser';

// localStorage key — remember if the user has dismissed the onboarding dialog
const ONBOARD_KEY = 'wl-favorites-onboard-dismissed';

export default function FavoritesContent() {
  const [favoriteSymbols, setFavoriteSymbols] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);

  useEffect(() => {
    getAllCoFavoriteList(userAcct).then((res) => {
      const top10 = res.co_cd.slice(0, WATCHLIST_MAX_COMPANIES);
      setFavoriteSymbols(top10);
      setLoaded(true);
      // Show onboarding dialog only when favorites are empty AND user hasn't dismissed before
      if (top10.length === 0 && typeof window !== 'undefined') {
        const dismissed = localStorage.getItem(ONBOARD_KEY);
        if (!dismissed) setShowOnboard(true);
      }
    });
  }, []);

  function handleDismissOnboard() {
    setShowOnboard(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ONBOARD_KEY, '1');
    }
  }

  return (
    <>
      {/* Empty Favorites Onboarding Dialog */}
      {loaded && showOnboard && (
        <div
          className="wl-modal-overlay"
          onClick={handleDismissOnboard}
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboard-title"
        >
          <div
            className="wl-modal wl-modal--onboard"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wl-modal-header">
              <span className="wl-modal-title" id="onboard-title">
                Welcome to Your Favorites! ⭐
              </span>
              <button
                className="wl-modal-cancel-btn"
                onClick={handleDismissOnboard}
                aria-label="Close"
              >
                <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="wl-modal-body wl-onboard-body">
              <div className="wl-onboard-icon">
                <svg viewBox="0 0 48 48" fill="none" width="48" height="48">
                  <circle cx="24" cy="24" r="22" fill="#fef3c7" />
                  <path d="M24 10l3.5 7.1 7.8 1.1-5.65 5.5 1.33 7.8L24 27.8l-6.98 3.7 1.33-7.8L12.7 18.2l7.8-1.1L24 10z"
                    fill="#f59e0b" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="wl-onboard-message">
                Your Favorites list is currently empty.
              </p>
              <p className="wl-onboard-hint">
                To add companies to your Favorites, visit a{' '}
                <strong>Company Profile</strong> page and click the{' '}
                <strong>☆ Favorite</strong> button.
              </p>
              <div className="wl-onboard-actions">
                <Link
                  href="/company-profile/"
                  className="wl-onboard-link-btn"
                  onClick={handleDismissOnboard}
                >
                  Go to Company Profile
                </Link>
                <button
                  className="wl-modal-cancel-btn wl-onboard-dismiss-btn"
                  onClick={handleDismissOnboard}
                >
                  Got it, I&apos;ll add later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WatchlistContent
        params={{ id: 'favorites' }}
        initialSymbols={favoriteSymbols}
        watchlistNameOverride="Favorites"
        useOverrideName
        forceFavoriteStar
        disableDeleteWatchlist
        disableNameEdit
        disableCompanyDelete
        onFavoritesSymbolsUpdate={(_symbols) => {
          getAllCoFavoriteList(userAcct).then((res) => {
            setFavoriteSymbols(res.co_cd.slice(0, WATCHLIST_MAX_COMPANIES));
          });
        }}
      />
    </>
  );
}
