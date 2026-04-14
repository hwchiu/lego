'use client';

import { useState, useEffect, useCallback } from 'react';

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

  /** Fetch detail rows for a given date and category. */
  const fetchDetail = useCallback(async (dateLabel: string, category: string) => {
    try {
      const events = await getEventCalendarDetail(dateLabel, category);
      setDetailEvents(events);
    } catch {
      setDetailEvents([]);
    }
  }, []);

  // On page load: fetch detail for today + "All"
  useEffect(() => {
    void fetchDetail(getDateLabel(new Date()), ALL_TAB);
  }, [fetchDetail]);

  // When the active tab changes, re-fetch detail for the current selected date
  useEffect(() => {
    void fetchDetail(selectedDateLabel, activeTab);
  }, [activeTab, selectedDateLabel, fetchDetail]);

  const handleDateSelect = useCallback(
    (dateLabel: string) => {
      setSelectedDateLabel(dateLabel);
      void fetchDetail(dateLabel, activeTab);
    },
    [activeTab, fetchDetail],
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      void fetchDetail(selectedDateLabel, tab);
    },
    [selectedDateLabel, fetchDetail],
  );

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
