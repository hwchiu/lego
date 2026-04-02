'use client';

import { useState } from 'react';

import CalendarControls from '@/app/components/calendar/CalendarControls';
import MonthGrid from '@/app/components/calendar/MonthGrid';
import WeekGrid from '@/app/components/calendar/WeekGrid';
import { weekDays } from '@/app/data/earnings';
import type { WeekDay } from '@/app/data/earnings';
import { DAY_LABELS } from '@/app/lib/calendarUtils';

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function buildMonthDays(year: number, month: number): WeekDay[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const days: WeekDay[] = [];

  // Build a Map for O(1) lookup by dateLabel
  const dayDataMap = new Map(weekDays.map((wd) => [wd.dateLabel, wd]));

  // Padding cells before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    days.push({ dayLabel: '', dateLabel: '', isEmpty: true });
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

  return days;
}

export default function EarningsCalendarSection() {
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

  const monthDays = buildMonthDays(year, month);

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
