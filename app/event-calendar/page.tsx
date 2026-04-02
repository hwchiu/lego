'use client';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketTabs from '@/app/components/calendar/MarketTabs';
import CalendarControls from '@/app/components/calendar/CalendarControls';
import WeekGrid from '@/app/components/calendar/WeekGrid';
import DetailTable from '@/app/components/calendar/DetailTable';
import { weekDays, epsData, revenueData } from '@/app/data/earnings';

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
            <div className="cal-card">
              <CalendarControls />
              <WeekGrid days={weekDays} />
            </div>
            <DetailTable epsData={epsData} revenueData={revenueData} />
          </div>
        </main>
      </div>
    </>
  );
}
