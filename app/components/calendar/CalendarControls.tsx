'use client';

import { useState } from 'react';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

export default function CalendarControls() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(3); // April = 3
  const [currency, setCurrency] = useState<'USD' | 'NTD'>('USD');

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

  return (
    <div className="cal-header">
      <div className="cal-eyebrow">Earnings Calendar</div>
      <div className="cal-month-nav">
        <button className="cal-arrow" onClick={prev} aria-label="Previous month">
          ‹
        </button>
        <span className="cal-month-label">
          {MONTHS[month]} {year}
        </span>
        <button className="cal-arrow" onClick={next} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="cal-controls">
        <input className="cal-search" type="text" placeholder="Company Search" />
        <div className="toggle-group">
          <button className="toggle-btn active">Monthly View</button>
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
