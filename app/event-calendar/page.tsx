'use client';

import { useState, useMemo } from 'react';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketTabs from '@/app/components/calendar/MarketTabs';
import EarningsCalendarSection from '@/app/components/calendar/EarningsCalendarSection';
import DetailTable from '@/app/components/calendar/DetailTable';
import {
  weekDays,
  aprilMonthData,
  dateEpsData,
  dateRevenueData,
} from '@/app/data/earnings';
import { MONTH_SHORT } from '@/app/lib/calendarUtils';

// Build a unified lookup map for companyCount by dateLabel
const ALL_DAYS = [...weekDays, ...aprilMonthData];
const COMPANY_COUNT_MAP = new Map(ALL_DAYS.map((d) => [d.dateLabel, d.companyCount ?? 0]));

function getTodayLabel(): string {
  const today = new Date();
  return `${MONTH_SHORT[today.getMonth()]} ${today.getDate()}`;
}

export default function EventCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayLabel);

  const epsData = useMemo(() => dateEpsData[selectedDate] ?? [], [selectedDate]);
  const revenueData = useMemo(() => dateRevenueData[selectedDate] ?? [], [selectedDate]);
  const companyCount = useMemo(() => COMPANY_COUNT_MAP.get(selectedDate) ?? 0, [selectedDate]);

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
            <EarningsCalendarSection onDateSelect={setSelectedDate} />
            <DetailTable
              epsData={epsData}
              revenueData={revenueData}
              selectedDateLabel={selectedDate}
              companyCount={companyCount}
            />
          </div>
        </main>
      </div>
    </>
  );
}
