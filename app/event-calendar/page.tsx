'use client';

import { useState, useMemo, useCallback } from 'react';

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
  usdToTwdRate,
} from '@/app/data/earnings';
import { getDateLabel } from '@/app/lib/calendarUtils';

// Build a record count map from actual dateEpsData (not hardcoded companyCount)
const ALL_DAYS = [...weekDays, ...aprilMonthData];
const COMPANY_COUNT_MAP = new Map([
  ...ALL_DAYS.map((d) => [d.dateLabel, 0] as [string, number]),
  ...Object.entries(dateEpsData).map(([k, v]) => [k, v.length] as [string, number]),
]);

export default function EventCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => getDateLabel(new Date()));
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'NTD'>('USD');

  const handleSymbolSelect = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, []);

  const allEpsForDate = useMemo(() => dateEpsData[selectedDate] ?? [], [selectedDate]);
  const allRevenueForDate = useMemo(() => dateRevenueData[selectedDate] ?? [], [selectedDate]);

  // Filter by selected symbol when one is active
  const epsData = useMemo(
    () =>
      selectedSymbol
        ? allEpsForDate.filter((r) => r.symbol === selectedSymbol)
        : allEpsForDate,
    [allEpsForDate, selectedSymbol],
  );

  const revenueData = useMemo(
    () =>
      selectedSymbol
        ? allRevenueForDate.filter((r) => r.symbol === selectedSymbol)
        : allRevenueForDate,
    [allRevenueForDate, selectedSymbol],
  );

  const companyCount = useMemo(() => {
    if (selectedSymbol) return epsData.length;
    return COMPANY_COUNT_MAP.get(selectedDate) ?? 0;
  }, [selectedDate, selectedSymbol, epsData.length]);

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
            <EarningsCalendarSection
              onDateSelect={setSelectedDate}
              selectedSymbol={selectedSymbol}
              onSymbolSelect={handleSymbolSelect}
              currency={currency}
              onCurrencyChange={setCurrency}
            />
            <DetailTable
              epsData={epsData}
              revenueData={revenueData}
              selectedDateLabel={selectedDate}
              companyCount={companyCount}
              currency={currency}
              usdToTwdRate={usdToTwdRate}
            />
          </div>
        </main>
      </div>
    </>
  );
}
