'use client';

import { useState } from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface CalendarControlsProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  isMonthlyView: boolean;
  onToggleView: () => void;
}

function CalendarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <rect x="1.5" y="3.5" width="13" height="11" rx="1.5" stroke="white" strokeWidth="1.5" />
      <path d="M1.5 7.5h13" stroke="white" strokeWidth="1.5" />
      <path d="M5.5 1.5v3M10.5 1.5v3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function CalendarControls({
  year,
  month,
  onPrev,
  onNext,
  isMonthlyView,
  onToggleView,
}: CalendarControlsProps) {
  const [currency, setCurrency] = useState<'USD' | 'NTD'>('USD');

  return (
    <div className="cal-header">
      <div className="cal-eyebrow">Earnings Calendar</div>
      <div className="cal-month-nav">
        <button className="cal-arrow" onClick={onPrev} aria-label="Previous month">
          ‹
        </button>
        <span className="cal-month-label">
          {MONTHS[month]} {year}
        </span>
        <button className="cal-arrow" onClick={onNext} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="cal-controls">
        <input className="cal-search" type="text" placeholder="Company Search" />
        <div className="toggle-group">
          <button className="toggle-btn active cal-view-btn" onClick={onToggleView}>
            <CalendarIcon />
            {isMonthlyView ? 'Weekly View' : 'Monthly View'}
          </button>
        </div>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${currency === 'USD' ? 'active' : ''}`}
            onClick={() => setCurrency('USD')}
          >
            USD
          </button>
          <button
            className={`toggle-btn ${currency === 'NTD' ? 'active' : ''}`}
            onClick={() => setCurrency('NTD')}
          >
            NTD
          </button>
        </div>
      </div>
    </div>
  );
}
