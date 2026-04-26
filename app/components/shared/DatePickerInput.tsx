'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const CAL_MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const CAL_DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface MiniCalendarProps {
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (val: string) => void;
  onClose: () => void;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
}

function MiniCalendar({ value, onChange, onClose, minDate, maxDate }: MiniCalendarProps) {
  const today = new Date();
  const initDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  const minDateObj = minDate ? new Date(minDate + 'T00:00:00') : null;
  const maxDateObj = maxDate ? new Date(maxDate + 'T00:00:00') : null;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${mm}-${dd}`;
    const dateObj = new Date(dateStr + 'T00:00:00');
    if (minDateObj && dateObj < minDateObj) return;
    if (maxDateObj && dateObj > maxDateObj) return;
    onChange(dateStr);
    onClose();
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cp-mini-cal">
      <div className="cp-mini-cal-header">
        <button className="cp-mini-cal-nav" onClick={prevMonth} aria-label="Previous month">
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M9 2.5L4.5 7L9 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="cp-mini-cal-title">{CAL_MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button className="cp-mini-cal-nav" onClick={nextMonth} aria-label="Next month">
          <svg viewBox="0 0 14 14" fill="none" width="12" height="12">
            <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="cp-mini-cal-grid">
        {CAL_DAY_NAMES.map((d) => (
          <span key={d} className="cp-mini-cal-dayname">{d}</span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={`empty-${i}`} className="cp-mini-cal-cell cp-mini-cal-cell--empty" />;
          const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
          const isSelected = selectedDate !== null &&
            day === selectedDate.getDate() &&
            viewMonth === selectedDate.getMonth() &&
            viewYear === selectedDate.getFullYear();
          const cellDate = new Date(viewYear, viewMonth, day);
          const isDisabled =
            (minDateObj !== null && cellDate < minDateObj) ||
            (maxDateObj !== null && cellDate > maxDateObj);
          return (
            <button
              key={day}
              className={`cp-mini-cal-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}${isDisabled ? ' disabled' : ''}`}
              onClick={() => selectDay(day)}
              disabled={isDisabled}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const CAL_WIDTH = 220;
const CAL_HEIGHT = 290;
const CAL_Z_INDEX = 9999;

export interface DatePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onPageReset?: () => void;
  error?: boolean;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
}

export function formatDateDisplay(v: string): string {
  if (!v) return '';
  const d = new Date(v + 'T00:00:00');
  if (isNaN(d.getTime())) return v;
  return `${CAL_MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function DatePickerInput({ value, onChange, placeholder = 'Select date', onPageReset, error, minDate, maxDate }: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const [calStyle, setCalStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const calRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function calcCalStyle(): React.CSSProperties {
    if (!containerRef.current) return {};
    const rect = containerRef.current.getBoundingClientRect();

    let top = rect.bottom + 4;
    let left = rect.left;

    if (top + CAL_HEIGHT > window.innerHeight) {
      top = rect.top - CAL_HEIGHT - 4;
    }
    if (left + CAL_WIDTH > window.innerWidth) {
      left = rect.right - CAL_WIDTH;
    }
    if (left < 0) left = 0;

    return { position: 'fixed', top, left, zIndex: CAL_Z_INDEX };
  }

  function handleToggle() {
    if (!open) setCalStyle(calcCalStyle());
    setOpen((o) => !o);
  }

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        calRef.current && !calRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleClose() { setOpen(false); }
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('resize', handleClose);
    document.addEventListener('scroll', handleClose, true);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('resize', handleClose);
      document.removeEventListener('scroll', handleClose, true);
    };
  }, [open]);

  function handleChange(val: string) {
    onChange(val);
    if (onPageReset) onPageReset();
  }

  return (
    <div className="cp-datepicker-wrap" ref={containerRef}>
      <div
        className={`cp-datepicker-input${open ? ' active' : ''}${error ? ' cp-datepicker-input--error' : ''}`}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleToggle(); }}
      >
        <svg className="cp-datepicker-icon" viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
          <rect x="1" y="2.5" width="12" height="10.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M4 1v3M10 1v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M1 6h12" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        <span className={`cp-datepicker-text${!value ? ' placeholder' : ''}`}>
          {value ? formatDateDisplay(value) : placeholder}
        </span>
        {value && (
          <button
            className="cp-datepicker-clear"
            onClick={(e) => { e.stopPropagation(); handleChange(''); }}
            aria-label="Clear date"
          >
            <svg viewBox="0 0 14 14" fill="none" width="10" height="10">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {open && mounted && createPortal(
        <div ref={calRef} style={calStyle}>
          <MiniCalendar value={value} onChange={handleChange} onClose={() => setOpen(false)} minDate={minDate} maxDate={maxDate} />
        </div>,
        document.body
      )}
    </div>
  );
}
