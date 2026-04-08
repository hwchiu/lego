'use client';

import { useState, useMemo, useCallback } from 'react';

import MonthGrid from '@/app/components/calendar/MonthGrid';
import WeekGrid from '@/app/components/calendar/WeekGrid';
import type { WeekDay } from '@/app/data/earnings';
import type { AnyEvent } from '@/app/data/eventCategories';
import { DAY_LABELS, MONTH_SHORT, MONTH_FULL, getDateLabel, getWeekStart } from '@/app/lib/calendarUtils';

function buildMonthDays(
  year: number,
  month: number,
  todayLabel: string,
  eventsByDate: Record<string, AnyEvent[]>,
): WeekDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days: WeekDay[] = [];

  const prevMonthIdx = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonthIdx + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const prevMonthDay = daysInPrevMonth - firstDay + 1 + i;
    const dateLabel = `${MONTH_SHORT[prevMonthIdx]} ${prevMonthDay}`;
    const evts = eventsByDate[dateLabel] ?? [];
    days.push({
      dayLabel: DAY_LABELS[i],
      dateLabel,
      isOutOfMonth: true,
      isToday: dateLabel === todayLabel,
      companies: evts.map((e) => e.cellLabel),
      companyCount: evts.length,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateLabel = `${MONTH_SHORT[month]} ${d}`;
    const dayOfWeek = (firstDay + d - 1) % 7;
    const evts = eventsByDate[dateLabel] ?? [];
    days.push({
      dayLabel: DAY_LABELS[dayOfWeek],
      dateLabel,
      isToday: dateLabel === todayLabel,
      companies: evts.map((e) => e.cellLabel),
      companyCount: evts.length,
    });
  }

  const lastDayOfWeek = (firstDay + daysInMonth - 1) % 7;
  const trailingCount = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek;
  const nextMonthIdx = month === 11 ? 0 : month + 1;
  for (let i = 1; i <= trailingCount; i++) {
    const dateLabel = `${MONTH_SHORT[nextMonthIdx]} ${i}`;
    const dayOfWeek = (lastDayOfWeek + i) % 7;
    const evts = eventsByDate[dateLabel] ?? [];
    days.push({
      dayLabel: DAY_LABELS[dayOfWeek],
      dateLabel,
      isOutOfMonth: true,
      isToday: dateLabel === todayLabel,
      companies: evts.map((e) => e.cellLabel),
      companyCount: evts.length,
    });
  }

  return days;
}

function buildWeekDays(
  weekStart: Date,
  todayLabel: string,
  eventsByDate: Record<string, AnyEvent[]>,
): WeekDay[] {
  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateLabel = getDateLabel(d);
    const evts = eventsByDate[dateLabel] ?? [];
    days.push({
      dayLabel: DAY_LABELS[i],
      dateLabel,
      isToday: dateLabel === todayLabel,
      companies: evts.map((e) => e.cellLabel),
      companyCount: evts.length,
    });
  }
  return days;
}

function ChevronLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9 2L5 7l4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 2l4 5-4 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface EventCategorySectionProps {
  categoryLabel: string;
  eventsByDate: Record<string, AnyEvent[]>;
  onDateSelect?: (dateLabel: string) => void;
}

export default function EventCategorySection({
  categoryLabel,
  eventsByDate,
  onDateSelect,
}: EventCategorySectionProps) {
  const today = useMemo(() => new Date(), []);
  const todayLabel = useMemo(() => getDateLabel(today), [today]);

  const [year, setYear] = useState(() => today.getFullYear());
  const [month, setMonth] = useState(() => today.getMonth());
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [isMonthlyView, setIsMonthlyView] = useState(false);
  const [selectedDateLabel, setSelectedDateLabel] = useState<string>(todayLabel);

  const handleSelectDate = useCallback(
    (dateLabel: string) => {
      setSelectedDateLabel(dateLabel);
      onDateSelect?.(dateLabel);
    },
    [onDateSelect],
  );

  const prev = useCallback(() => {
    if (isMonthlyView) {
      if (month === 0) {
        setMonth(11);
        setYear((y) => y - 1);
      } else {
        setMonth((m) => m - 1);
      }
    } else {
      setWeekStart((ws) => {
        const d = new Date(ws);
        d.setDate(d.getDate() - 7);
        return d;
      });
    }
  }, [isMonthlyView, month]);

  const next = useCallback(() => {
    if (isMonthlyView) {
      if (month === 11) {
        setMonth(0);
        setYear((y) => y + 1);
      } else {
        setMonth((m) => m + 1);
      }
    } else {
      setWeekStart((ws) => {
        const d = new Date(ws);
        d.setDate(d.getDate() + 7);
        return d;
      });
    }
  }, [isMonthlyView, month]);

  const displayLabel = useMemo(() => {
    if (isMonthlyView) return `${MONTH_FULL[month]} ${year}`;
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${getDateLabel(weekStart)} – ${getDateLabel(weekEnd)}`;
  }, [isMonthlyView, month, year, weekStart]);

  const monthDays = useMemo(
    () => buildMonthDays(year, month, todayLabel, eventsByDate),
    [year, month, todayLabel, eventsByDate],
  );

  const currentWeekDays = useMemo(
    () => buildWeekDays(weekStart, todayLabel, eventsByDate),
    [weekStart, todayLabel, eventsByDate],
  );

  return (
    <div className="cal-card">
      {/* Header */}
      <div className="cal-header ec-cal-header">
        <div className="cal-eyebrow">{categoryLabel}</div>
        <div className="cal-month-nav">
          <button className="cal-arrow" onClick={prev} aria-label="Previous">
            <ChevronLeft />
          </button>
          <span className="cal-month-label">{displayLabel}</span>
          <button className="cal-arrow" onClick={next} aria-label="Next">
            <ChevronRight />
          </button>
        </div>
        <div className="cal-controls">
          <div className="toggle-group">
            <button className="toggle-btn active cal-view-btn" onClick={() => setIsMonthlyView((v) => !v)}>
              {isMonthlyView ? 'Weekly View' : 'Monthly View'}
            </button>
          </div>
        </div>
      </div>

      {isMonthlyView ? (
        <MonthGrid
          days={monthDays}
          todayLabel={todayLabel}
          selectedDate={selectedDateLabel}
          onSelectDate={handleSelectDate}
          countLabel="Events"
          emptyLabel="No Events"
        />
      ) : (
        <WeekGrid
          days={currentWeekDays}
          todayLabel={todayLabel}
          selectedDate={selectedDateLabel}
          onSelectDate={handleSelectDate}
          countLabel="Events"
          emptyLabel="No Events"
        />
      )}
    </div>
  );
}
