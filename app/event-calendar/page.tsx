'use client';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketTabs from '@/app/components/calendar/MarketTabs';
import EarningsCalendarSection from '@/app/components/calendar/EarningsCalendarSection';
import DetailTable from '@/app/components/calendar/DetailTable';
import { epsData, revenueData } from '@/app/data/earnings';

export default function EventCalendarPage() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">Event Category</div>
            <MarketTabs />
            <EarningsCalendarSection />
            <DetailTable epsData={epsData} revenueData={revenueData} />
          </div>
        </main>
      </div>
    </>
  );
}
