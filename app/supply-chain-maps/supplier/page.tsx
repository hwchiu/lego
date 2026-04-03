'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import SupplierGraph from './SupplierGraph';
import { TSM_TIER1_SUPPLIERS, TSM_TIER2_SUPPLIERS, EDGE_ENTITIES } from '@/app/data/tsmcSupplierData';

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

const SUPPLIER_TABS = ['Network Graph', 'Table View', 'Analytics', 'Risk Heatmap'] as const;
type SupplierTab = (typeof SUPPLIER_TABS)[number];

// Compute summary stats
const tier1Count = TSM_TIER1_SUPPLIERS.length;
const tier2Count = TSM_TIER2_SUPPLIERS.length;
const tier1TotalRevenue = EDGE_ENTITIES.filter((e) => e.from === 'TSM').reduce(
  (sum, e) => sum + e.transactionAmount,
  0,
);

function formatRevenue(millionUsd: number): string {
  if (millionUsd >= 1000) return `$${(millionUsd / 1000).toFixed(1)}B`;
  return `$${millionUsd}M`;
}

export default function SupplierPage() {
  const [activeTab, setActiveTab] = useState<SupplierTab>('Network Graph');

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
                <h1 className="scm-sub-title">Supplier Network</h1>
              </div>
            </div>

            {/* Company header with risk light */}
            <div className="rmap-company-header">
              <span className="rmap-risk-light rmap-risk-light--green" title="No active risk signals" />
              <div className="rmap-company-header-info">
                <div className="rmap-company-header-name">TSM</div>
                <div className="rmap-company-header-full">Taiwan Semiconductor Manufacturing Company</div>
              </div>
            </div>

            {/* Summary cards */}
            <div className="rmap-summary-cards">
              <div className="cp-data-card rmap-summary-card">
                <div className="rmap-summary-card-title">Tier 1 Supplier Count</div>
                <div className="rmap-summary-card-value">{tier1Count}</div>
                <div className="rmap-summary-card-sub">Direct suppliers</div>
              </div>
              <div className="cp-data-card rmap-summary-card">
                <div className="rmap-summary-card-title">Tier 2 Supplier Count</div>
                <div className="rmap-summary-card-value">{tier2Count}</div>
                <div className="rmap-summary-card-sub">Indirect suppliers</div>
              </div>
              <div className="cp-data-card rmap-summary-card">
                <div className="rmap-summary-card-title">Tier 1 Total Trade Revenue</div>
                <div className="rmap-summary-card-value">{formatRevenue(tier1TotalRevenue)}</div>
                <div className="rmap-summary-card-sub">Annual transaction amount</div>
              </div>
              <div className="cp-data-card rmap-summary-card rmap-summary-card--add">
                <PlusIcon />
                <div className="rmap-summary-card-add-label">Add Custom Card</div>
              </div>
            </div>

            {/* Nav tabs */}
            <div className="cp-nav-tabs rmap-supplier-tabs">
              {SUPPLIER_TABS.map((tab) => (
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
            {activeTab === 'Network Graph' && <SupplierGraph />}
            {activeTab === 'Table View' && <SupplierGraph tableOnly />}
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
