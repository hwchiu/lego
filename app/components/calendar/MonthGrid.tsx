'use client';

import type { WeekDay } from '@/app/data/earnings';
import { DAY_LABELS, truncateCompanies } from '@/app/lib/calendarUtils';

interface MonthGridProps {
  days: WeekDay[];
  todayLabel: string;
  selectedDate: string;
  onSelectDate: (dateLabel: string) => void;
  countLabel?: string;
  emptyLabel?: string;
}

interface MonthCellProps {
  day: WeekDay;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
  countLabel: string;
  emptyLabel: string;
}

function MonthCell({ day, isToday, isSelected, onSelect, countLabel, emptyLabel }: MonthCellProps) {
  if (day.isEmpty) {
    return <div className="month-cell-empty" />;
  }

  const hasReports = day.companies && day.companies.length > 0;
  // Extract the day number from dateLabel (e.g., "Apr 1" -> "1", "Mar 30" -> "30")
  const dayNum = day.dateLabel.split(' ')[1];
  const fullText = hasReports ? day.companies!.join(', ') : '';
  const truncated = hasReports ? truncateCompanies(day.companies!) : '';
  const isTruncated = fullText.length > truncated.length;

  return (
    <div
      className={`week-cell month-cell${isToday ? ' today' : ''}${day.isOutOfMonth ? ' month-cell-out' : ''}${isSelected ? ' selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={isSelected}
    >
      <div className="week-cell-head">{dayNum}</div>
      <div className="week-cell-body">
        {hasReports ? (
          <>
            <div className="cell-count-row">
              <span className="cell-count">{day.companyCount}</span>
              <span className="cell-count-label">{countLabel}</span>
            </div>
            <div className="cell-co-tooltip-wrap">
              <div className="cell-co-text">{truncated}</div>
              {isTruncated && (
                <div className="cell-co-tooltip">{fullText}</div>
              )}
            </div>
          </>
        ) : (
          <div className="cell-empty">{emptyLabel}</div>
        )}
      </div>
    </div>
  );
}

export default function MonthGrid({
  days,
  todayLabel,
  selectedDate,
  onSelectDate,
  countLabel = 'Companies',
  emptyLabel = 'No Reports',
}: MonthGridProps) {
  return (
    <div className="month-grid">
      {DAY_LABELS.map((h) => (
        <div key={h} className="month-day-header">
          {h}
        </div>
      ))}
      {days.map((day, i) => (
        <MonthCell
          key={day.isEmpty ? `empty-${i}` : day.dateLabel}
          day={day}
          isToday={day.dateLabel === todayLabel}
          isSelected={day.dateLabel === selectedDate}
          onSelect={() => !day.isEmpty && onSelectDate(day.dateLabel)}
          countLabel={countLabel}
          emptyLabel={emptyLabel}
        />
      ))}
    </div>
  );
}
