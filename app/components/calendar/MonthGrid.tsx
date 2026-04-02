'use client';

import type { WeekDay } from '@/app/data/earnings';
import { DAY_LABELS, truncateCompanies } from '@/app/lib/calendarUtils';

function MonthCell({ day }: { day: WeekDay }) {
  if (day.isEmpty) {
    return <div className="month-cell-empty" />;
  }

  const hasReports = day.companies && day.companies.length > 0;
  // Extract the day number from dateLabel (e.g., "Apr 1" -> "1")
  const dayNum = day.dateLabel.split(' ')[1];

  return (
    <div className={`week-cell month-cell ${day.isToday ? 'today' : ''}`}>
      <div className="week-cell-head">{dayNum}</div>
      <div className="week-cell-body">
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

export default function MonthGrid({ days }: { days: WeekDay[] }) {
  return (
    <div className="month-grid">
      {DAY_LABELS.map((h) => (
        <div key={h} className="month-day-header">
          {h}
        </div>
      ))}
      {days.map((day, i) => (
        <MonthCell key={day.isEmpty ? `empty-${i}` : day.dateLabel} day={day} />
      ))}
    </div>
  );
}
