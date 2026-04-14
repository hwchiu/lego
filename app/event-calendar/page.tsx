'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketTabs from '@/app/components/calendar/MarketTabs';
import CorpEventCategorySection from '@/app/components/calendar/CorpEventCategorySection';
import CorpEventCategoryDetail from '@/app/components/calendar/CorpEventCategoryDetail';
import { getEventCalendarDetail, type EventCalendarDetailItem } from '@/app/lib/eventCalendarApi';
import { getDateLabel } from '@/app/lib/calendarUtils';

const ALL_TAB = 'All';

export default function EventCalendarPage() {
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>(() =>
    getDateLabel(new Date()),
  );
  const [detailEvents, setDetailEvents] = useState<EventCalendarDetailItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  /** Fetch detail rows for a given date and category, aborting any in-flight request. */
  const fetchDetail = useCallback(async (dateLabel: string, category: string) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const events = await getEventCalendarDetail(dateLabel, category);
      if (!ctrl.signal.aborted) setDetailEvents(events);
    } catch {
      if (!ctrl.signal.aborted) setDetailEvents([]);
    }
  }, []);

  // Fetch detail whenever the selected date or active tab changes (also runs on mount)
  useEffect(() => {
    void fetchDetail(selectedDateLabel, activeTab);
    return () => { abortRef.current?.abort(); };
  }, [activeTab, selectedDateLabel, fetchDetail]);

  const handleDateSelect = useCallback((dateLabel: string) => {
    setSelectedDateLabel(dateLabel);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="section-eyebrow">Event Category</div>
            <MarketTabs activeTab={activeTab} onTabChange={handleTabChange} />

            <CorpEventCategorySection
              categoryLabel={activeTab}
              onDateSelect={handleDateSelect}
            />
            <CorpEventCategoryDetail
              categoryLabel={activeTab}
              events={detailEvents}
              selectedDateLabel={selectedDateLabel}
            />
          </div>
        </main>
      </div>
    </>
  );
}
