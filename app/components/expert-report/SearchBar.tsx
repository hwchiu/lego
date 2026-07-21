'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import DatePickerInput from '@/app/components/shared/DatePickerInput';
import { useLanguage } from '@/app/contexts/LanguageContext';
import type { ExpertReportOption } from '@/app/data/expertReports';

interface SearchBarProps {
  company: string;
  contributor: string;
  publishDateStart: string;
  publishDateEnd: string;
  headline: string;
  companyOptions: ExpertReportOption[];
  contributorOptions: ExpertReportOption[];
  minDate: string;
  maxDate: string;
  resultCount: number;
  onCompanyChange: (value: string) => void;
  onContributorChange: (value: string) => void;
  onPublishDateStartChange: (value: string) => void;
  onPublishDateEndChange: (value: string) => void;
  onHeadlineChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

interface SearchableSelectProps {
  label: string;
  placeholder: string;
  value: string;
  options: ExpertReportOption[];
  onChange: (value: string) => void;
  onEnter: () => void;
}

function SearchableSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
  onEnter,
}: SearchableSelectProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const filteredOptions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return options.slice(0, 8);
    return options
      .filter((option) => option.label.toLowerCase().includes(query))
      .slice(0, 8);
  }, [options, value]);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      onEnter();
      setOpen(false);
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="er-field" ref={wrapRef}>
      <label className="er-field-label">{label}</label>
      <div className={`er-combobox${open ? ' er-combobox--open' : ''}`}>
        <input
          className="er-search-input"
          type="text"
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          aria-label={label}
          autoComplete="off"
        />
        {open && filteredOptions.length > 0 && (
          <div className="er-combobox-menu" role="listbox">
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                className="er-combobox-option"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchBar({
  company,
  contributor,
  publishDateStart,
  publishDateEnd,
  headline,
  companyOptions,
  contributorOptions,
  minDate,
  maxDate,
  resultCount,
  onCompanyChange,
  onContributorChange,
  onPublishDateStartChange,
  onPublishDateEndChange,
  onHeadlineChange,
  onSearch,
  onReset,
}: SearchBarProps) {
  const { lang } = useLanguage();
  const copy = {
    criteria: { zh: 'Query Criteria', en: 'Query Criteria' },
    company: { zh: 'Company', en: 'Company' },
    contributor: { zh: 'Contributor', en: 'Contributor' },
    publishDateStart: { zh: 'Publish Date Start', en: 'Publish Date Start' },
    publishDateEnd: { zh: 'Publish Date End', en: 'Publish Date End' },
    headline: { zh: 'Headline', en: 'Headline' },
    companyPlaceholder: { zh: '輸入公司名稱或代碼', en: 'Type company name or ticker' },
    contributorPlaceholder: { zh: '輸入機構名稱', en: 'Type contributor name' },
    headlinePlaceholder: { zh: '輸入最多 50 個字', en: 'Type up to 50 characters' },
    search: { zh: 'Search', en: 'Search' },
    reset: { zh: 'Reset', en: 'Reset' },
    reports: { zh: '筆資料', en: 'reports' },
    startPlaceholder: { zh: '選擇開始日期', en: 'Select start date' },
    endPlaceholder: { zh: '選擇結束日期', en: 'Select end date' },
  };

  function handleHeadlineKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') onSearch();
  }

  return (
    <div className="er-search-bar">
      <div className="er-search-header">
        <div className="er-search-title">{copy.criteria[lang]}</div>
        <div className="er-search-count">
          {resultCount} {copy.reports[lang]}
        </div>
      </div>

      <div className="er-search-grid">
        <SearchableSelect
          label={copy.company[lang]}
          placeholder={copy.companyPlaceholder[lang]}
          value={company}
          options={companyOptions}
          onChange={onCompanyChange}
          onEnter={onSearch}
        />

        <SearchableSelect
          label={copy.contributor[lang]}
          placeholder={copy.contributorPlaceholder[lang]}
          value={contributor}
          options={contributorOptions}
          onChange={onContributorChange}
          onEnter={onSearch}
        />

        <div className="er-field">
          <label className="er-field-label">{copy.publishDateStart[lang]}</label>
          <DatePickerInput
            value={publishDateStart}
            onChange={onPublishDateStartChange}
            placeholder={copy.startPlaceholder[lang]}
            minDate={minDate}
            maxDate={publishDateEnd || maxDate}
          />
        </div>

        <div className="er-field">
          <label className="er-field-label">{copy.publishDateEnd[lang]}</label>
          <DatePickerInput
            value={publishDateEnd}
            onChange={onPublishDateEndChange}
            placeholder={copy.endPlaceholder[lang]}
            minDate={publishDateStart || minDate}
            maxDate={maxDate}
          />
        </div>

        <div className="er-field er-field--headline">
          <label className="er-field-label">{copy.headline[lang]}</label>
          <input
            className="er-search-input"
            type="text"
            value={headline}
            maxLength={50}
            placeholder={copy.headlinePlaceholder[lang]}
            onChange={(event) => onHeadlineChange(event.target.value)}
            onKeyDown={handleHeadlineKeyDown}
            aria-label={copy.headline[lang]}
          />
        </div>

        <div className="er-search-actions">
          <button className="er-search-btn" type="button" onClick={onSearch}>
            {copy.search[lang]}
          </button>
          <button className="er-search-reset" type="button" onClick={onReset}>
            {copy.reset[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}
