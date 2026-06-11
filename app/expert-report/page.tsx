'use client';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import ExpertReportContent from './ExpertReportContent';

export default function ExpertReportPage() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <ExpertReportContent />
        </main>
      </div>
    </>
  );
}
