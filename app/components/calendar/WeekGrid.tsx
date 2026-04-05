'use client';

import type { WeekDay } from '@/app/data/earnings';
import { truncateCompanies } from '@/app/lib/calendarUtils';

interface WeekGridProps {
  days: WeekDay[];
  todayLabel: string;
  selectedDate: string;
  onSelectDate: (dateLabel: string) => void;
}

interface WeekCellProps {
  day: WeekDay;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

function WeekCell({ day, isToday, isSelected, onSelect }: WeekCellProps) {
  const hasReports = day.companies && day.companies.length > 0;

  return (
    <div
      className={`week-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={isSelected}
    >
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

export default function WeekGrid({ days, todayLabel, selectedDate, onSelectDate }: WeekGridProps) {
  return (
    <div className="week-grid">
      {days.map((day) => (
        <WeekCell
          key={day.dateLabel}
          day={day}
          isToday={day.dateLabel === todayLabel}
          isSelected={day.dateLabel === selectedDate}
          onSelect={() => onSelectDate(day.dateLabel)}
        />
      ))}
    </div>
  );
}
