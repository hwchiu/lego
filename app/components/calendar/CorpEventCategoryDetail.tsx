'use client';

import type { CorpEvent } from '@/app/data/corpEvents';
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

function SubscribeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

interface CorpEventCategoryDetailProps {
  categoryLabel: string;
  events: CorpEvent[];
  selectedDateLabel?: string;
}

export default function CorpEventCategoryDetail({
  categoryLabel,
  events,
  selectedDateLabel,
}: CorpEventCategoryDetailProps) {
  const displayDate = formatDateLabel(selectedDateLabel);
  const count = events.length;

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
              {events.map((e, i) => (
                <tr key={i}>
                  <td className="td-symbol corp-event-company">{e.company}</td>
                  <td className="corp-event-desc">{e.description}</td>
                  <td className="corp-event-date">{e.eventDate}</td>
                  <td>
                    <span className="ec-type-badge">{e.eventType}</span>
                  </td>
                  <td className="td-center">
                    {e.webcastLink ? (
                      <a
                        href={e.webcastLink}
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
                    {e.irLink ? (
                      <a
                        href={e.irLink}
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
                    <button className="corp-event-subscribe-btn" title="Subscribe to this event">
                      <SubscribeIcon />
                    </button>
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
