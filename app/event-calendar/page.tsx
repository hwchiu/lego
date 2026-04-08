'use client';

import { useState, useMemo, useCallback } from 'react';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketTabs from '@/app/components/calendar/MarketTabs';
import EarningsCalendarSection from '@/app/components/calendar/EarningsCalendarSection';
import DetailTable from '@/app/components/calendar/DetailTable';
import EventCategorySection from '@/app/components/calendar/EventCategorySection';
import EventCategoryDetail from '@/app/components/calendar/EventCategoryDetail';
import {
  weekDays,
  aprilMonthData,
  dateEpsData,
  dateRevenueData,
  usdToTwdRate,
} from '@/app/data/earnings';
import { EVENT_CATEGORY_MAP } from '@/app/data/eventCategories';
import { getDateLabel } from '@/app/lib/calendarUtils';

// Build a record count map from actual dateEpsData (not hardcoded companyCount)
const ALL_DAYS = [...weekDays, ...aprilMonthData];
const COMPANY_COUNT_MAP = new Map([
  ...ALL_DAYS.map((d) => [d.dateLabel, 0] as [string, number]),
  ...Object.entries(dateEpsData).map(([k, v]) => [k, v.length] as [string, number]),
]);

export default function EventCalendarPage() {
  const [activeTab, setActiveTab] = useState('Earnings Calendar');
  const [selectedDate, setSelectedDate] = useState<string>(() => getDateLabel(new Date()));
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'NTD'>('USD');
  const [eventCategoryDate, setEventCategoryDate] = useState<string>(() =>
    getDateLabel(new Date()),
  );

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

  // Event category data (non-earnings tabs)
  const categoryEntry = EVENT_CATEGORY_MAP[activeTab];
  const categoryEvents = useMemo(
    () => (categoryEntry ? (categoryEntry.events[eventCategoryDate] ?? []) : []),
    [categoryEntry, eventCategoryDate],
  );
  const categoryEventCount = useMemo(
    () => categoryEvents.length,
    [categoryEvents],
  );

  const isEarnings = activeTab === 'Earnings Calendar';
  const hasCategoryData = !!categoryEntry;

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">Event Category</div>
            <MarketTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {isEarnings ? (
              <>
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
              </>
            ) : hasCategoryData ? (
              <>
                <EventCategorySection
                  categoryLabel={activeTab}
                  eventsByDate={categoryEntry.events}
                  onDateSelect={setEventCategoryDate}
                />
                <EventCategoryDetail
                  categoryId={categoryEntry.id}
                  categoryLabel={activeTab}
                  layout={categoryEntry.layout}
                  events={categoryEvents}
                  selectedDateLabel={eventCategoryDate}
                  eventCount={categoryEventCount}
                />
              </>
            ) : (
              <div className="ec-coming-soon">
                <p className="ec-coming-soon-title">{activeTab}</p>
                <p className="ec-coming-soon-sub">Coming Soon</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
