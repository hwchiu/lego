'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';

interface CalendarControlsProps {
  displayLabel: string;
  onPrev: () => void;
  onNext: () => void;
  isMonthlyView: boolean;
  onToggleView: () => void;
  selectedSymbol?: string;
  onSymbolSelect?: (symbol: string) => void;
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

function ClearIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function CalendarControls({
  displayLabel,
  onPrev,
  onNext,
  isMonthlyView,
  onToggleView,
  selectedSymbol = '',
  onSymbolSelect,
}: CalendarControlsProps) {
  const [inputValue, setInputValue] = useState(selectedSymbol);
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep input in sync when external symbol changes (e.g., cleared from parent)
  useEffect(() => {
    setInputValue(selectedSymbol);
  }, [selectedSymbol]);

  // Filter SP500 list based on input — match symbol prefix or name substring
  const suggestions = useMemo(() => {
    const q = inputValue.trim().toUpperCase();
    if (!q) return [];
    return COMPANY_MASTER_LIST.filter(
      (c) => c.symbol.startsWith(q) || c.name.toUpperCase().includes(q),
    ).slice(0, 8);
  }, [inputValue]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  }, []);

  const handleSelect = useCallback(
    (symbol: string) => {
      setInputValue(symbol);
      setIsOpen(false);
      onSymbolSelect?.(symbol);
    },
    [onSymbolSelect],
  );

  const handleClear = useCallback(() => {
    setInputValue('');
    setIsOpen(false);
    onSymbolSelect?.('');
  }, [onSymbolSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'Enter' && suggestions.length > 0) {
        handleSelect(suggestions[0].symbol);
      }
    },
    [suggestions, handleSelect],
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="cal-header">
      <div className="cal-eyebrow">Earnings Calendar</div>
      <div className="cal-month-nav">
        <button className="cal-arrow" onClick={onPrev} aria-label="Previous">
          ‹
        </button>
        <span className="cal-month-label">{displayLabel}</span>
        <button className="cal-arrow" onClick={onNext} aria-label="Next">
          ›
        </button>
      </div>
      <div className="cal-controls">
        {/* Company Search with autocomplete */}
        <div className="cal-search-wrap" ref={wrapRef}>
          <input
            className="cal-search __safly_input_chrome __safly_input_ms"
            type="text"
            placeholder="Company Search"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => inputValue.trim() && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
          {inputValue && (
            <button className="cal-search-clear" onClick={handleClear} aria-label="Clear search">
              <ClearIcon />
            </button>
          )}
          {isOpen && suggestions.length > 0 && (
            <ul className="cal-search-dropdown" role="listbox">
              {suggestions.map((c) => (
                <li
                  key={c.symbol}
                  className="cal-search-option"
                  role="option"
                  onMouseDown={() => handleSelect(c.symbol)}
                >
                  <span className="cal-search-symbol">{c.symbol}</span>
                  <span className="cal-search-name">{c.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="toggle-group">
          <button className="toggle-btn active cal-view-btn" onClick={onToggleView}>
            <CalendarIcon />
            {isMonthlyView ? 'Weekly View' : 'Monthly View'}
          </button>
        </div>
      </div>
    </div>
  );
}
