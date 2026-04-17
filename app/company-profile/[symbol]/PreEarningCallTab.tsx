'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';
import { PRE_EARNING_CALL_MD_ENTRIES, PecMdEntry } from '@/app/data/preEarningCalls';

interface PreEarningCallTabProps {
  symbol: string;
  companyName?: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
      <path d="M1.5 3h11M3.5 7h7M6 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="15" height="15" aria-hidden="true">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ── Markdown parser ────────────────────────────────────────────────────────────

interface MdSection {
  heading: string;
  bullets: string[];
}

interface ParsedPec {
  title: string;
  intro: string;
  sections: MdSection[];
}

function parsePecMd(md: string): ParsedPec {
  const lines = md.split('\n');

  const titleLine = lines.find((l) => l.startsWith('## '));
  const title = titleLine ? titleLine.replace(/^##\s+/, '').trim() : '';

  const introLine = lines.find((l) => {
    const t = l.trim();
    return t.startsWith('**') && t.endsWith('**') && t.length > 4;
  });
  const intro = introLine ? introLine.trim().replace(/^\*\*|\*\*$/g, '') : '';

  const sections: MdSection[] = [];
  let currentHeading = '';
  let currentBullets: string[] = [];

  const flushSection = () => {
    if (!currentHeading) return;
    sections.push({ heading: currentHeading, bullets: currentBullets });
  };

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flushSection();
      currentHeading = line.replace(/^###\s+/, '').trim();
      currentBullets = [];
    } else if (currentHeading) {
      if (line.startsWith('---') || line.trim().startsWith('*Note:')) continue;
      const bullet = line.replace(/^\s*-\s+/, '');
      if (line.trimStart().startsWith('- ') && bullet) {
        currentBullets.push(bullet.trim());
      }
    }
  }
  flushSection();

  return { title, intro, sections };
}

function highlightText(text: string, keyword: string): React.ReactNode {
  if (!keyword.trim()) return text;
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} className="cp-irt-highlight">{part}</mark>
    ) : (
      part
    )
  );
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── List item ─────────────────────────────────────────────────────────────────

interface PecListItemProps {
  entry: PecMdEntry;
  isActive: boolean;
  keyword: string;
  onClick: () => void;
}

function PecListItem({ entry, isActive, keyword, onClick }: PecListItemProps) {
  const parsed = useMemo(() => parsePecMd(entry.content), [entry.content]);
  return (
    <button
      className={`cp-irt-list-item${isActive ? ' cp-irt-list-item--active' : ''}`}
      onClick={onClick}
    >
      <div className="cp-irt-list-item-title">{highlightText(parsed.title, keyword)}</div>
      <div className="cp-irt-list-item-meta">
        <div className="cp-irt-list-item-tags">
          <span className="cp-irt-period-tag cp-irt-period-tag--year">{entry.year}</span>
          <span className="cp-irt-period-tag cp-irt-period-tag--qtr">{entry.quarter}</span>
        </div>
      </div>
    </button>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────

interface PecDetailProps {
  entry: PecMdEntry;
  companyName: string;
  keyword: string;
}

function PecDetail({ entry, companyName, keyword }: PecDetailProps) {
  const parsed = useMemo(() => parsePecMd(entry.content), [entry.content]);

  function handleDownload() {
    downloadMarkdown(`${entry.filename}.md`, entry.content);
  }

  return (
    <article className="cp-pec-card cp-pec-pec-card">
      <div className="cp-pec-card-header">
        <div className="cp-pec-card-header-left">
          <span className="cp-pec-card-company">PEC</span>
          <div>
            <div className="cp-pec-card-title">{highlightText(parsed.title, keyword)}</div>
            <div className="cp-pec-card-date">{highlightText(parsed.intro, keyword)}</div>
          </div>
        </div>
        <div className="cp-pec-card-actions">
          <button
            className="cp-pec-card-action-btn"
            title="Download Markdown"
            aria-label="Download Markdown"
            onClick={handleDownload}
          >
            <DownloadIcon />
          </button>
        </div>
      </div>

      {/* Notice */}
      <div className="cp-pec-notice">
        Notice: BD/IT team continue to improve the AI tool. Currently the summarized transcript is
        for reference purpose only. (Contact Window: Alex Chang 張汶傑)
      </div>

      {/* Body — blocks and sections */}
      <div className="cp-pec-ai-body">
        {parsed.sections.map((section) => (
          <div key={section.heading} className="cp-pec-ai-block">
            <div className="cp-pec-section-heading">{highlightText(section.heading, keyword)}</div>
            {section.bullets.length > 0 && (
              <ul className="cp-pec-ai-bullet-list">
                {section.bullets.map((bullet, i) => (
                  <li key={i} className="cp-pec-ai-bullet-item">
                    {highlightText(bullet, keyword)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Footer — exactly 4 items */}
      <div className="cp-pec-card-footer">
        <span className="cp-pec-tag cp-pec-ai-tag">AI-Generated</span>
        <span className="cp-pec-tag">{entry.quarter} {entry.year}</span>
        <span className="cp-pec-tag">{companyName || entry.symbol}</span>
        <span className="cp-pec-tag">Pre-Earning Call</span>
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

function parseQuarterNumber(q: string): number {
  const n = parseInt(q.replace('Q', ''), 10);
  return isNaN(n) ? 0 : n;
}

export default function PreEarningCallTab({ symbol, companyName }: PreEarningCallTabProps) {
  const allEntries = useMemo(
    () => PRE_EARNING_CALL_MD_ENTRIES.filter((e) => e.symbol === symbol),
    [symbol]
  );

  const sortedEntries = useMemo(
    () =>
      [...allEntries].sort(
        (a, b) => b.year - a.year || parseQuarterNumber(b.quarter) - parseQuarterNumber(a.quarter)
      ),
    [allEntries]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [qtrFilter, setQtrFilter] = useState('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedKeyword(value), 200);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const yearOptions = useMemo(() => {
    const years = [...new Set(sortedEntries.map((e) => String(e.year)))];
    return [{ value: 'all', label: 'All Years' }, ...years.map((y) => ({ value: y, label: y }))];
  }, [sortedEntries]);

  const qtrOptions = useMemo(() => {
    const qtrs = [...new Set(sortedEntries.map((e) => e.quarter))].sort(
      (a, b) => parseQuarterNumber(a) - parseQuarterNumber(b)
    );
    return [
      { value: 'all', label: 'All Qtrs' },
      ...qtrs.map((q) => ({ value: q, label: q })),
    ];
  }, [sortedEntries]);

  const filteredEntries = useMemo(() => {
    let list = sortedEntries;
    if (yearFilter !== 'all') {
      list = list.filter((e) => String(e.year) === yearFilter);
    }
    if (qtrFilter !== 'all') {
      list = list.filter((e) => e.quarter === qtrFilter);
    }
    if (debouncedKeyword.trim()) {
      const kw = debouncedKeyword.toLowerCase();
      list = list.filter(
        (e) =>
          e.content.toLowerCase().includes(kw) ||
          e.symbol.toLowerCase().includes(kw) ||
          e.quarter.toLowerCase().includes(kw) ||
          String(e.year).includes(kw)
      );
    }
    return list;
  }, [sortedEntries, yearFilter, qtrFilter, debouncedKeyword]);

  const activeEntry = useMemo(() => {
    if (selectedId) {
      const found = filteredEntries.find((e) => `${e.year}-${e.quarter}` === selectedId);
      if (found) return found;
    }
    return filteredEntries[0] ?? null;
  }, [filteredEntries, selectedId]);

  const handleSelectEntry = useCallback((entry: PecMdEntry) => {
    setSelectedId(`${entry.year}-${entry.quarter}`);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (
      selectedId &&
      !filteredEntries.find((e) => `${e.year}-${e.quarter}` === selectedId)
    ) {
      setSelectedId(null);
    }
  }, [filteredEntries, selectedId]);

  if (allEntries.length === 0) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <span className="cp-pec-empty-icon">
            <NoDataIcon />
          </span>
          <p className="cp-pec-empty-text">No Pre-Earning Call summary available for {symbol}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-irt-layout">
      {/* Left Panel: Search + List */}
      <aside className="cp-irt-panel-left">
        <div className="cp-irt-search-box">
          <span className="cp-irt-search-icon">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            type="text"
            className="cp-irt-search-input"
            placeholder="Search earnings results…"
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            aria-label="Search Pre-Earning Call results"
          />
          {keyword && (
            <button
              className="cp-irt-search-clear"
              onClick={handleClearSearch}
              title="Clear search"
              aria-label="Clear search"
            >
              <ClearIcon />
            </button>
          )}
        </div>

        <div className="cp-irt-filter-row">
          <span className="cp-irt-filter-label">
            <FilterIcon />
            Period
          </span>
          <select
            className="cp-irt-period-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            aria-label="Filter by year"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="cp-irt-period-select"
            value={qtrFilter}
            onChange={(e) => setQtrFilter(e.target.value)}
            aria-label="Filter by quarter"
          >
            {qtrOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="cp-irt-list">
          {filteredEntries.length === 0 ? (
            <div className="cp-irt-list-empty">No results match your filter.</div>
          ) : (
            filteredEntries.map((entry) => (
              <PecListItem
                key={entry.filename}
                entry={entry}
                isActive={
                  activeEntry?.year === entry.year && activeEntry?.quarter === entry.quarter
                }
                keyword={keyword}
                onClick={() => handleSelectEntry(entry)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right Panel: Detail */}
      <div className="cp-irt-panel-right">
        {activeEntry ? (
          <PecDetail
            entry={activeEntry}
            companyName={companyName || activeEntry.symbol}
            keyword={keyword}
          />
        ) : (
          <div className="cp-pec-empty">
            <span className="cp-pec-empty-icon">
              <NoDataIcon />
            </span>
            <p className="cp-pec-empty-text">Select a report from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
