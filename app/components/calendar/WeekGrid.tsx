'use client';

import { WeekDay } from '@/app/data/earnings';

function WeekCell({ day }: { day: WeekDay }) {
  const hasReports = day.companies && day.companies.length > 0;

  return (
    <div className={`week-cell ${day.isToday ? 'today' : ''}`}>
      <div className="week-cell-head">{day.dayLabel}</div>
      <div className="week-cell-body">
        <div className="cell-date">{day.dateLabel}</div>
        {hasReports ? (
          <>
            <div className="cell-count">{day.companyCount}</div>
            <div className="cell-count-label">Companies</div>
            <div className="cell-co-list">
              {day.companies!.map((co) => (
                <span key={co} className="cell-co">{co}</span>
              ))}
            </div>
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
    <div className="week-grid">
      {days.map((day) => (
        <WeekCell key={day.dateLabel} day={day} />
      ))}
    </div>
  );
}
