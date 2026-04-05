'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import CompetitorGraph from './CompetitorGraph';
import { TSM_COMPETITORS, MARKET_SHARE_DATA } from '@/app/data/tsmcCompetitorData';

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path
        d="M10 3L5 8L10 13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M14 6v16M6 14h16" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const COMPETITOR_TABS = ['Network Graph', 'Table View', 'Analytics', 'Risk Heatmap'] as const;
type CompetitorTab = (typeof COMPETITOR_TABS)[number];

// Top 4 competitors by market share (excluding TSMC itself) for summary cards
const TOP_COMPETITORS = MARKET_SHARE_DATA.filter((e) => e.id !== 'TSM')
  .sort((a, b) => b.marketShare - a.marketShare)
  .slice(0, 4);

export default function CompetitorPage() {
  const [activeTab, setActiveTab] = useState<CompetitorTab>('Network Graph');

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad scm-sub-page">
            {/* Breadcrumb */}
            <div className="scm-sub-topbar">
              <Link href="/supply-chain-maps" className="cp-back-btn">
                <BackArrowIcon />
                Back
              </Link>
              <div className="scm-sub-breadcrumb">
                <span className="cp-breadcrumb-text">RMAP /</span>
                <h1 className="scm-sub-title">Competitor Network</h1>
              </div>
            </div>

            {/* Company header */}
            <div className="rmap-company-header">
              <span className="rmap-risk-light rmap-risk-light--green" title="No active risk signals" />
              <div className="rmap-company-header-info">
                <div className="rmap-company-header-name">TSM</div>
                <div className="rmap-company-header-full">
                  Taiwan Semiconductor Manufacturing Company
                </div>
              </div>
            </div>

            {/* Summary cards — competitor market shares (high → low) */}
            <div className="rmap-summary-cards">
              {TOP_COMPETITORS.map((entry) => {
                const node = TSM_COMPETITORS.find((c) => c.id === entry.id);
                return (
                  <div key={entry.id} className="cp-data-card rmap-summary-card">
                    <div className="rmap-summary-card-title">{entry.name}</div>
                    <div className="rmap-summary-card-value">{entry.marketShare}%</div>
                    <div className="rmap-summary-card-sub">
                      {node?.industryCategory ?? 'Foundry'} · Market Share
                    </div>
                  </div>
                );
              })}
              <div className="cp-data-card rmap-summary-card rmap-summary-card--add">
                <PlusIcon />
                <div className="rmap-summary-card-add-label">Add Custom Card</div>
              </div>
            </div>

            {/* Nav tabs */}
            <div className="cp-nav-tabs rmap-supplier-tabs">
              {COMPETITOR_TABS.map((tab) => (
                <button
                  key={tab}
                  className={`cp-nav-tab${activeTab === tab ? ' active rmap-tab-blue' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'Network Graph' && <CompetitorGraph />}
            {activeTab === 'Table View' && <CompetitorGraph tableOnly />}
            {activeTab !== 'Network Graph' && activeTab !== 'Table View' && (
              <div className="cp-tab-placeholder">
                <span className="cp-tab-placeholder-text">{activeTab} — Coming Soon</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
