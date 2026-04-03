'use client';

import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

interface SupplyChainSubPageProps {
  title: string;
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SupplyChainSubPage({ title }: SupplyChainSubPageProps) {
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
                <h1 className="scm-sub-title">{title}</h1>
              </div>
            </div>
            <div className="cp-tab-placeholder">
              <span className="cp-tab-placeholder-text">{title} — Content coming soon</span>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
