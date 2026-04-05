'use client';

import { useState, useMemo, useCallback } from 'react';

import CalendarControls from '@/app/components/calendar/CalendarControls';
import MonthGrid from '@/app/components/calendar/MonthGrid';
import WeekGrid from '@/app/components/calendar/WeekGrid';
import { weekDays as rawWeekDays, aprilMonthData } from '@/app/data/earnings';
import type { WeekDay } from '@/app/data/earnings';
import { DAY_LABELS, MONTH_SHORT, MONTH_FULL, getDateLabel, getWeekStart } from '@/app/lib/calendarUtils';

// Master map: dateLabel → WeekDay (used by both month and week builders)
const ALL_DAYS: WeekDay[] = [...rawWeekDays, ...aprilMonthData];
const MASTER_MAP = new Map<string, WeekDay>(ALL_DAYS.map((wd) => [wd.dateLabel, wd]));

function buildMonthDays(year: number, month: number, todayLabel: string): WeekDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const days: WeekDay[] = [];

  // Leading padding cells from previous month
  const prevMonthIdx = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonthIdx + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const prevMonthDay = daysInPrevMonth - firstDay + 1 + i;
    const dateLabel = `${MONTH_SHORT[prevMonthIdx]} ${prevMonthDay}`;
    const existing = MASTER_MAP.get(dateLabel);
    days.push({
      dayLabel: DAY_LABELS[i],
      dateLabel,
      isOutOfMonth: true,
      isToday: dateLabel === todayLabel,
      companies: existing?.companies,
      companyCount: existing?.companyCount,
    });
  }

  // One cell per day of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateLabel = `${MONTH_SHORT[month]} ${d}`;
    const dayOfWeek = (firstDay + d - 1) % 7;
    const existing = MASTER_MAP.get(dateLabel);
    days.push({
      dayLabel: DAY_LABELS[dayOfWeek],
      dateLabel,
      isToday: dateLabel === todayLabel,
      companies: existing?.companies,
      companyCount: existing?.companyCount,
    });
  }

  // Trailing padding cells from next month
  const lastDayOfWeek = (firstDay + daysInMonth - 1) % 7;
  const trailingCount = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek;
  const nextMonthIdx = month === 11 ? 0 : month + 1;
  for (let i = 1; i <= trailingCount; i++) {
    const dateLabel = `${MONTH_SHORT[nextMonthIdx]} ${i}`;
    const dayOfWeek = (lastDayOfWeek + i) % 7;
    const existing = MASTER_MAP.get(dateLabel);
    days.push({
      dayLabel: DAY_LABELS[dayOfWeek],
      dateLabel,
      isOutOfMonth: true,
      isToday: dateLabel === todayLabel,
      companies: existing?.companies,
      companyCount: existing?.companyCount,
    });
  }

  return days;
}

function buildWeekDays(weekStart: Date, todayLabel: string): WeekDay[] {
  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateLabel = getDateLabel(d);
    const existing = MASTER_MAP.get(dateLabel);
    days.push({
      dayLabel: DAY_LABELS[i],
      dateLabel,
      isToday: dateLabel === todayLabel,
      companies: existing?.companies,
      companyCount: existing?.companyCount,
    });
  }
  return days;
}

interface EarningsCalendarSectionProps {
  onDateSelect?: (dateLabel: string) => void;
}

export default function EarningsCalendarSection({ onDateSelect }: EarningsCalendarSectionProps) {
  // Compute "today" once on mount
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

  const monthDays = useMemo(
    () => buildMonthDays(year, month, todayLabel),
    [year, month, todayLabel],
  );

  const currentWeekDays = useMemo(
    () => buildWeekDays(weekStart, todayLabel),
    [weekStart, todayLabel],
  );

  // Compute the display label for CalendarControls
  const displayLabel = useMemo(() => {
    if (isMonthlyView) {
      return `${MONTH_FULL[month]} ${year}`;
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return `${getDateLabel(weekStart)} – ${getDateLabel(weekEnd)}`;
  }, [isMonthlyView, month, year, weekStart]);

  return (
    <div className="cal-card">
      <CalendarControls
        displayLabel={displayLabel}
        onPrev={prev}
        onNext={next}
        isMonthlyView={isMonthlyView}
        onToggleView={() => setIsMonthlyView((v) => !v)}
      />
      {isMonthlyView ? (
        <MonthGrid
          days={monthDays}
          todayLabel={todayLabel}
          selectedDate={selectedDateLabel}
          onSelectDate={handleSelectDate}
        />
      ) : (
        <WeekGrid
          days={currentWeekDays}
          todayLabel={todayLabel}
          selectedDate={selectedDateLabel}
          onSelectDate={handleSelectDate}
        />
      )}
    </div>
  );
}
