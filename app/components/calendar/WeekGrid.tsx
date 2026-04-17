'use client';

import type { WeekDay } from '@/app/data/earnings';
import { MONTH_SHORT, truncateCompanies } from '@/app/lib/calendarUtils';

/** Format a dateLabel for display: "YYYY-MM-DD" → "Mon D", otherwise pass through. */
function formatDisplayDate(dateLabel: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateLabel)) {
    const parts = dateLabel.split('-');
    return `${MONTH_SHORT[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
  }
  return dateLabel;
}

interface WeekGridProps {
  days: WeekDay[];
  todayLabel: string;
  selectedDate: string;
  onSelectDate: (dateLabel: string) => void;
  countLabel?: string;
  emptyLabel?: string;
}

interface WeekCellProps {
  day: WeekDay;
  isToday: boolean;
  isSelected: boolean;
  onSelect: () => void;
  countLabel: string;
  emptyLabel: string;
}

function WeekCell({ day, isToday, isSelected, onSelect, countLabel, emptyLabel }: WeekCellProps) {
  const hasReports = day.companies && day.companies.length > 0;
  const fullText = hasReports ? day.companies!.join(', ') : '';
  const truncated = hasReports ? truncateCompanies(day.companies!) : '';
  const isTruncated = fullText.length > truncated.length;

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
        <div className="cell-date">{formatDisplayDate(day.dateLabel)}</div>
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

export default function WeekGrid({
  days,
  todayLabel,
  selectedDate,
  onSelectDate,
  countLabel = 'Companies',
  emptyLabel = 'No Reports',
}: WeekGridProps) {
  return (
    <div className="week-grid">
      {days.map((day) => (
        <WeekCell
          key={day.dateLabel}
          day={day}
          isToday={day.dateLabel === todayLabel}
          isSelected={day.dateLabel === selectedDate}
          onSelect={() => onSelectDate(day.dateLabel)}
          countLabel={countLabel}
          emptyLabel={emptyLabel}
        />
      ))}
    </div>
  );
}
