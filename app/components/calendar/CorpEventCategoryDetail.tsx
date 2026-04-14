'use client';

import { useState, useCallback } from 'react';
import type { EventCalendarDetailItem } from '@/app/lib/eventCalendarApi';
import { monthShortToFull, MONTH_SHORT } from '@/app/lib/calendarUtils';

function formatDateLabel(dateLabel: string | undefined): string {
  if (!dateLabel) return '—';
  const parts = dateLabel.split(' ');
  const day = parts[1]?.padStart(2, '0') ?? '';
  const month = monthShortToFull(parts[0]);
  return `${day} ${month}`;
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path d="M7 1h3v3M10 1L5.5 5.5M4 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubscribeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SubscribedIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 6l1.8 1.8 3.2-3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatEventDatetime(eventDatetime: string): string {
  if (!eventDatetime) return '—';
  const d = new Date(eventDatetime);
  if (isNaN(d.getTime())) return eventDatetime;
  const month = MONTH_SHORT[d.getMonth()];
  return `${month} ${d.getDate()}, ${d.getFullYear()}`;
}

async function subscribeToEvent(event: EventCalendarDetailItem): Promise<void> {
  // TODO: implement subscription API call
  await Promise.resolve();
  void event;
}

interface CorpEventCategoryDetailProps {
  categoryLabel: string;
  events: EventCalendarDetailItem[];
  selectedDateLabel?: string;
}

export default function CorpEventCategoryDetail({
  categoryLabel,
  events,
  selectedDateLabel,
}: CorpEventCategoryDetailProps) {
  const displayDate = formatDateLabel(selectedDateLabel);
  const count = events.length;
  const [subscribedIndices, setSubscribedIndices] = useState<Set<number>>(new Set());
  const [pendingIndices, setPendingIndices] = useState<Set<number>>(new Set());

  const handleSubscribe = useCallback(async (event: EventCalendarDetailItem, index: number) => {
    if (subscribedIndices.has(index) || pendingIndices.has(index)) return;
    setPendingIndices(prev => new Set(prev).add(index));
    try {
      await subscribeToEvent(event);
      setSubscribedIndices(prev => new Set(prev).add(index));
    } finally {
      setPendingIndices(prev => { const s = new Set(prev); s.delete(index); return s; });
    }
  }, [subscribedIndices, pendingIndices]);

  return (
    <div className="detail-card">
      <div className="detail-header">
        <div className="detail-eyebrow">
          {displayDate}&nbsp;·&nbsp;{count} {count === 1 ? 'Event' : 'Events'}
        </div>
        <div className="detail-tabs">
          <button className="detail-tab">{categoryLabel}</button>
        </div>
      </div>

      {count === 0 ? (
        <div className="ec-empty">
          <p className="ec-empty-text">No {categoryLabel} events on this date.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table corp-event-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Description</th>
                <th>Event Date</th>
                <th>Event Type</th>
                <th className="td-center-h">Webcast Link</th>
                <th className="td-center-h">IR Link</th>
                <th className="td-center-h">Subscription</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const isSubscribed = subscribedIndices.has(i);
                const isPending = pendingIndices.has(i);
                return (
                  <tr key={e.EVENT_ID || i}>
                    <td className="td-symbol corp-event-company">{e.COMPANY_NAME}</td>
                    <td className="corp-event-desc">{e.DESCRIPTION}</td>
                    <td className="corp-event-date">{formatEventDatetime(e.EVENT_DATETIME)}</td>
                    <td>
                      <span className="ec-type-badge">{e.EVENT_TYPE}</span>
                    </td>
                    <td className="td-center">
                      {e.WEBCAST_LINK ? (
                        <a
                          href={e.WEBCAST_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="corp-event-link"
                          title="Webcast"
                        >
                          <ExternalLinkIcon />
                          <span>Webcast</span>
                        </a>
                      ) : (
                        <span className="td-na">—</span>
                      )}
                    </td>
                    <td className="td-center">
                      {e.IR_LINK ? (
                        <a
                          href={e.IR_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="corp-event-link"
                          title="IR Page"
                        >
                          <ExternalLinkIcon />
                          <span>IR</span>
                        </a>
                      ) : (
                        <span className="td-na">—</span>
                      )}
                    </td>
                    <td className="td-center">
                      <button
                        className={`corp-event-subscribe-btn${isSubscribed ? ' subscribed' : ''}`}
                        title={isSubscribed ? 'Subscribed' : 'Subscribe to this event'}
                        onClick={() => handleSubscribe(e, i)}
                        disabled={isPending || isSubscribed}
                        aria-pressed={isSubscribed}
                      >
                        {isSubscribed ? <SubscribedIcon /> : <SubscribeIcon />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
