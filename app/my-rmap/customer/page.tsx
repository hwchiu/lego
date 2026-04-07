'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import CustomerGraph from '@/app/supply-chain-maps/customer/CustomerGraph';
import { TSM_CUSTOMERS, INDUSTRY_TRANSACTION_SUMMARY } from '@/app/data/tsmcCustomerData';

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

const CUSTOMER_TABS = ['Network Graph', 'Table View', 'Analytics', 'Risk Heatmap'] as const;
type CustomerTab = (typeof CUSTOMER_TABS)[number];

function formatAmount(millionUsd: number): string {
  if (millionUsd >= 1000) return `$${(millionUsd / 1000).toFixed(1)}B`;
  return `$${millionUsd}M`;
}

const TOP_INDUSTRIES = [...INDUSTRY_TRANSACTION_SUMMARY]
  .sort((a, b) => b.totalAmount - a.totalAmount)
  .slice(0, 3);

export default function MyRmapCustomerPage() {
  const [activeTab, setActiveTab] = useState<CustomerTab>('Network Graph');

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
              <Link href="/my-rmap" className="cp-back-btn">
                <BackArrowIcon />
                Back
              </Link>
              <div className="scm-sub-breadcrumb">
                <span className="cp-breadcrumb-text">My RMAP /</span>
                <h1 className="scm-sub-title">Customer Network</h1>
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

            {/* Summary cards */}
            <div className="rmap-summary-cards">
              {TOP_INDUSTRIES.map((ind) => (
                <div key={ind.industry} className="cp-data-card rmap-summary-card">
                  <div className="rmap-summary-card-title">{ind.industry}</div>
                  <div className="rmap-summary-card-value">{formatAmount(ind.totalAmount)}</div>
                  <div className="rmap-summary-card-sub">
                    {ind.customers.length} customer{ind.customers.length !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
              <div className="cp-data-card rmap-summary-card">
                <div className="rmap-summary-card-title">Total Customer Count</div>
                <div className="rmap-summary-card-value">{TSM_CUSTOMERS.length}</div>
                <div className="rmap-summary-card-sub">Tracked downstream customers</div>
              </div>
              <div className="cp-data-card rmap-summary-card rmap-summary-card--add">
                <PlusIcon />
                <div className="rmap-summary-card-add-label">Add Custom Card</div>
              </div>
            </div>

            {/* Nav tabs */}
            <div className="cp-nav-tabs rmap-supplier-tabs">
              {CUSTOMER_TABS.map((tab) => (
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
            {activeTab === 'Network Graph' && <CustomerGraph />}
            {activeTab === 'Table View' && <CustomerGraph tableOnly />}
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
