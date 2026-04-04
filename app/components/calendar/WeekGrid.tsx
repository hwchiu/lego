'use client';

import type { WeekDay } from '@/app/data/earnings';
import { truncateCompanies } from '@/app/lib/calendarUtils';

function WeekCell({ day }: { day: WeekDay }) {
  const hasReports = day.companies && day.companies.length > 0;

  return (
    <div className={`week-cell ${day.isToday ? 'today' : ''}`}>
      <div className="week-cell-head">{day.dayLabel}</div>
      <div className="week-cell-body">
        <div className="cell-date">{day.dateLabel}</div>
        {hasReports ? (
          <>
            <div className="cell-count-row">
              <span className="cell-count">{day.companyCount}</span>
              <span className="cell-count-label">Companies</span>
            </div>
            <div className="cell-co-text">{truncateCompanies(day.companies!)}</div>
          </>
        ) : (
          <div className="cell-empty">No Reports</div>
        )}
      </div>
    </div>
  );
}

export default function WeekGrid({ days }: { days: WeekDay[] }) {
  return (
    <div className="week-grid-scroll-wrap">
      <div className="week-grid">
        {days.map((day) => (
          <WeekCell key={day.dateLabel} day={day} />
        ))}
      </div>
    </div>
  );
}
