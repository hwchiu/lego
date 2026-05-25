'use client';

import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

export default function NotFound() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="not-found-wrap">
            <div className="not-found-content">
              <h1 className="not-found-title">404</h1>
              <p className="not-found-desc">This page could not be found.</p>
              <Link href="/about" className="not-found-link">
                Go to About tMIC
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
