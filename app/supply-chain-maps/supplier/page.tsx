'use client';

import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import SupplierGraph from './SupplierGraph';

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

export default function SupplierPage() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad scm-sub-page">
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

            {/* Company selector row */}
            <div className="rmap-company-row">
              <div className="rmap-company-badge">
                <span className="rmap-company-label">分析對象</span>
                <span className="rmap-company-name">Apple Inc. (AAPL)</span>
              </div>
              <p className="rmap-company-desc">
                以下關係圖呈現 Apple 的主要 Tier-1 供應商網絡，包含各公司財務概況。點擊節點查看詳細資訊，並可在連線上輸入備註。
              </p>
            </div>

            <SupplierGraph />
          </div>
        </main>
      </div>
    </>
  );
}

