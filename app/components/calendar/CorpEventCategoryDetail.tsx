'use client';

import type { EventCalendarDetailItem } from '@/app/lib/eventCalendarApi';
import { monthShortToFull } from '@/app/lib/calendarUtils';

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

function formatEventDatetime(eventDatetime: string): string {
  if (!eventDatetime) return '—';
  // Format: "2026-04-07 00:00:00.0" → "2026-04-07 00:00:00"
  const spaceIdx = eventDatetime.indexOf(' ');
  if (spaceIdx === -1) return eventDatetime;
  const datePart = eventDatetime.substring(0, spaceIdx);
  const timePart = eventDatetime.substring(spaceIdx + 1).replace(/\.0$/, '');
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return eventDatetime;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${timePart}`;
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

  // Sort by EVENT_DATETIME descending (furthest future first)
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.EVENT_DATETIME && !b.EVENT_DATETIME) return 0;
    if (!a.EVENT_DATETIME) return 1;
    if (!b.EVENT_DATETIME) return -1;
    return b.EVENT_DATETIME.localeCompare(a.EVENT_DATETIME);
  });

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
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((e, i) => (
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
