'use client';

import { useState } from 'react';

import CalendarControls from '@/app/components/calendar/CalendarControls';
import MonthGrid from '@/app/components/calendar/MonthGrid';
import WeekGrid from '@/app/components/calendar/WeekGrid';
import type { WeekDay } from '@/app/data/earnings';
import { DAY_LABELS } from '@/app/lib/calendarUtils';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

interface EarningsCalendarSectionProps {
  weekDays: WeekDay[];
  monthData: WeekDay[];
}

function buildMonthDays(
  year: number,
  month: number,
  weekDays: WeekDay[],
  monthData: WeekDay[],
): WeekDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const days: WeekDay[] = [];

  // Build a Map for O(1) lookup by dateLabel (monthData entries supplement weekDays)
  const dayDataMap = new Map([...weekDays, ...monthData].map((wd) => [wd.dateLabel, wd]));

  // Leading padding cells from previous month
  const prevMonthIdx = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = new Date(prevYear, prevMonthIdx + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const prevMonthDay = daysInPrevMonth - firstDay + 1 + i;
    const dateLabel = `${MONTH_SHORT[prevMonthIdx]} ${prevMonthDay}`;
    const existing = dayDataMap.get(dateLabel);
    days.push({
      dayLabel: DAY_LABELS[i],
      dateLabel,
      isOutOfMonth: true,
      companies: existing?.companies,
      companyCount: existing?.companyCount,
    });
  }

  // One cell per day of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateLabel = `${MONTH_SHORT[month]} ${d}`;
    const dayOfWeek = (firstDay + d - 1) % 7;
    const existing = dayDataMap.get(dateLabel);

    days.push({
      dayLabel: DAY_LABELS[dayOfWeek],
      dateLabel,
      isToday: existing?.isToday,
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
    const existing = dayDataMap.get(dateLabel);
    days.push({
      dayLabel: DAY_LABELS[dayOfWeek],
      dateLabel,
      isOutOfMonth: true,
      companies: existing?.companies,
      companyCount: existing?.companyCount,
    });
  }

  return days;
}

export default function EarningsCalendarSection({ weekDays, monthData }: EarningsCalendarSectionProps) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // April = index 3
  const [isMonthlyView, setIsMonthlyView] = useState(false);

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const monthDays = buildMonthDays(year, month, weekDays, monthData);

  return (
    <div className="cal-card">
      <CalendarControls
        year={year}
        month={month}
        onPrev={prev}
        onNext={next}
        isMonthlyView={isMonthlyView}
        onToggleView={() => setIsMonthlyView((v) => !v)}
      />
      {isMonthlyView ? <MonthGrid days={monthDays} /> : <WeekGrid days={weekDays} />}
    </div>
  );
}
