'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseQuarterNumber(q: string): number {
  const n = parseInt(q.replace('Q', ''), 10);
  return isNaN(n) ? 0 : n;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TranscriptSearchAccessors<T> {
  /** Extract fiscal year string from entry, e.g. "2026" */
  getYear: (e: T) => string;
  /** Extract fiscal quarter string from entry, e.g. "Q1" */
  getQtr: (e: T) => string;
  /**
   * Extract all searchable text from entry.
   * Should include both the title AND the body content so that keywords
   * that appear only in the title are not incorrectly filtered out.
   */
  getSearchableText: (e: T) => string;
  /** Derive a unique string key for the entry (for selection tracking). */
  getKey: (e: T) => string;
}

export interface TranscriptSearchResult<T> {
  /** The raw input value (updated on every keystroke). */
  keyword: string;
  /**
   * The debounced value used for filtering — lags `keyword` by ~300 ms so
   * the list does not flicker on every keypress.
   */
  debouncedKeyword: string;
  yearFilter: string;
  qtrFilter: string;
  searchRef: React.RefObject<HTMLInputElement | null>;
  filteredEntries: T[];
  activeEntry: T | null;
  yearOptions: { value: string; label: string }[];
  qtrOptions: { value: string; label: string }[];
  setYearFilter: (v: string) => void;
  setQtrFilter: (v: string) => void;
  handleKeywordChange: (value: string) => void;
  handleSelectEntry: (entry: T) => void;
  handleClearSearch: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Shared search / filter / selection hook used by IRTranscriptTab,
 * AITranscriptTab, and PreEarningCallTab.
 *
 * Pass module-level (stable) accessor functions so that the internal
 * `useMemo` deps remain stable between renders.
 */
export function useTranscriptSearch<T>(
  entries: T[],
  accessors: TranscriptSearchAccessors<T>,
): TranscriptSearchResult<T> {
  const { getYear, getQtr, getSearchableText, getKey } = accessors;

  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [qtrFilter, setQtrFilter] = useState('all');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 300 ms debounce — gives the user time to finish a word before filtering.
    debounceRef.current = setTimeout(() => setDebouncedKeyword(value), 300);
  }, []);

  // Clean up timer on unmount.
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const yearOptions = useMemo(() => {
    const years = [...new Set(entries.map(getYear))];
    return [{ value: 'all', label: 'All Years' }, ...years.map((y) => ({ value: y, label: y }))];
  }, [entries, getYear]);

  const qtrOptions = useMemo(() => {
    const qtrs = [...new Set(entries.map(getQtr))].sort(
      (a, b) => parseQuarterNumber(a) - parseQuarterNumber(b),
    );
    return [{ value: 'all', label: 'All Qtrs' }, ...qtrs.map((q) => ({ value: q, label: q }))];
  }, [entries, getQtr]);

  const filteredEntries = useMemo(() => {
    let list = entries;
    if (yearFilter !== 'all') list = list.filter((e) => getYear(e) === yearFilter);
    if (qtrFilter !== 'all') list = list.filter((e) => getQtr(e) === qtrFilter);
    if (debouncedKeyword.trim()) {
      const kw = debouncedKeyword.toLowerCase();
      // Search in the full searchable text (title + body) so that items whose
      // keyword appears only in the title are never incorrectly filtered out.
      list = list.filter((e) => getSearchableText(e).toLowerCase().includes(kw));
    }
    return list;
  }, [entries, yearFilter, qtrFilter, debouncedKeyword, getYear, getQtr, getSearchableText]);

  const activeEntry = useMemo(() => {
    if (selectedKey) {
      const found = filteredEntries.find((e) => getKey(e) === selectedKey);
      if (found) return found;
    }
    return filteredEntries[0] ?? null;
  }, [filteredEntries, selectedKey, getKey]);

  const handleSelectEntry = useCallback((entry: T) => {
    setSelectedKey(getKey(entry));
  }, [getKey]);

  const handleClearSearch = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchRef.current?.focus();
  }, []);

  // If the currently selected entry has been filtered out, reset selection so
  // the first visible entry is auto-selected.
  useEffect(() => {
    if (selectedKey && !filteredEntries.find((e) => getKey(e) === selectedKey)) {
      setSelectedKey(null);
    }
  }, [filteredEntries, selectedKey, getKey]);

  return {
    keyword,
    debouncedKeyword,
    yearFilter,
    qtrFilter,
    searchRef,
    filteredEntries,
    activeEntry,
    yearOptions,
    qtrOptions,
    setYearFilter,
    setQtrFilter,
    handleKeywordChange,
    handleSelectEntry,
    handleClearSearch,
  };
}
