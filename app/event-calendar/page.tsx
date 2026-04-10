'use client';

import { useState, useMemo } from 'react';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import MarketTabs from '@/app/components/calendar/MarketTabs';
import CorpEventCategorySection from '@/app/components/calendar/CorpEventCategorySection';
import CorpEventCategoryDetail from '@/app/components/calendar/CorpEventCategoryDetail';
import { CORP_EVENT_CATEGORY_MAP, type CorpEvent } from '@/app/data/corpEvents';
import { getDateLabel } from '@/app/lib/calendarUtils';

const ALL_TAB = 'All';

function mergeAllEvents(): Record<string, CorpEvent[]> {
  const merged: Record<string, CorpEvent[]> = {};
  for (const evtsByDate of Object.values(CORP_EVENT_CATEGORY_MAP)) {
    for (const [date, evtList] of Object.entries(evtsByDate)) {
      if (!merged[date]) merged[date] = [];
      merged[date].push(...evtList);
    }
  }
  return merged;
}

const ALL_EVENTS_BY_DATE = mergeAllEvents();

export default function EventCalendarPage() {
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [eventCategoryDate, setEventCategoryDate] = useState<string>(() =>
    getDateLabel(new Date()),
  );

  // Corp event category data — merge all when "All" tab is active
  const corpEventsByDate = useMemo(
    () => (activeTab === ALL_TAB ? ALL_EVENTS_BY_DATE : CORP_EVENT_CATEGORY_MAP[activeTab]),
    [activeTab],
  );

  const corpEvents = useMemo(
    () => (corpEventsByDate ? (corpEventsByDate[eventCategoryDate] ?? []) : []),
    [corpEventsByDate, eventCategoryDate],
  );

  const hasCorpCategoryData = !!corpEventsByDate;

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

            {hasCorpCategoryData ? (
              <>
                <CorpEventCategorySection
                  categoryLabel={activeTab}
                  eventsByDate={corpEventsByDate}
                  onDateSelect={setEventCategoryDate}
                />
                <CorpEventCategoryDetail
                  categoryLabel={activeTab}
                  events={corpEvents}
                  selectedDateLabel={eventCategoryDate}
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
