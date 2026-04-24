'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';
import { PecMdEntry } from '@/app/data/preEarningCalls';
import { getPreEarningCallByCoCd } from '@/app/lib/getPreEarningCallByCoCd';

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

interface FinancialBullet {
  text: string;
  subitems: string[];
}

interface BriefingSection {
  number: number;
  heading: string;
  body: string;
}

interface ParsedPec {
  /** Intro sentence from the Financial Statement section */
  intro: string;
  /** Top-level * bullet items with optional numbered subitems */
  financialBullets: FinancialBullet[];
  /** Numbered analysis sections from the Briefing section */
  briefingSections: BriefingSection[];
  /**
   * Derived display title for the list panel.
   * Falls back to the first financial bullet text when no explicit title is found.
   */
  title: string;
}

/**
 * Parse the new two-section Pre-Earnings Call markdown format:
 *
 * # Pre-Earnings Call Financial Statement
 * <intro line>
 * * bullet
 *    1. subitem
 * ...
 *
 * # Pre-Earnings Call Briefing
 * **1. Section Title**
 * <paragraph body>
 * ...
 */
function parsePecMd(md: string): ParsedPec {
  const lines = md.split('\n');

  // ── Split into the two top-level # sections ──────────────────────────────
  let financialLines: string[] = [];
  let briefingLines: string[] = [];
  let currentSection: 'none' | 'financial' | 'briefing' = 'none';

  for (const line of lines) {
    if (/^#\s+Pre-Earnings Call Financial Statement/i.test(line)) {
      currentSection = 'financial';
      continue;
    }
    if (/^#\s+Pre-Earnings Call Briefing/i.test(line)) {
      currentSection = 'briefing';
      continue;
    }
    if (currentSection === 'financial') financialLines.push(line);
    else if (currentSection === 'briefing') briefingLines.push(line);
  }

  // ── Parse Financial Statement section ────────────────────────────────────
  let intro = '';
  const financialBullets: FinancialBullet[] = [];
  let currentBullet: FinancialBullet | null = null;

  for (const line of financialLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('*Note:')) continue;

    if (trimmed.startsWith('* ')) {
      // top-level bullet: "* text"
      if (currentBullet) financialBullets.push(currentBullet);
      currentBullet = { text: trimmed.slice(2).trim(), subitems: [] };
    } else if (/^\s+\d+\.\s/.test(line) && currentBullet) {
      // numbered subitem: "   1. text"
      const subtext = trimmed.replace(/^\d+\.\s+/, '').trim();
      if (subtext) currentBullet.subitems.push(subtext);
    } else if (!intro && trimmed && !trimmed.startsWith('#')) {
      // First non-empty, non-header, non-bullet line = intro
      intro = trimmed;
    }
  }
  if (currentBullet) financialBullets.push(currentBullet);

  // ── Parse Briefing section ────────────────────────────────────────────────
  const briefingSections: BriefingSection[] = [];
  let currentBriefing: BriefingSection | null = null;
  const bodyLines: string[] = [];

  const flushBriefing = () => {
    if (!currentBriefing) return;
    currentBriefing.body = bodyLines.join(' ').replace(/\s+/g, ' ').trim();
    briefingSections.push(currentBriefing);
    bodyLines.length = 0;
  };

  for (const line of briefingLines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('---') || trimmed.startsWith('*Note:')) continue;

    // Bold numbered section header: "**1. Title**" or "**1. Title**"
    const headerMatch = trimmed.match(/^\*\*(\d+)\.\s+(.+?)\*\*$/);
    if (headerMatch) {
      flushBriefing();
      currentBriefing = { number: parseInt(headerMatch[1], 10), heading: headerMatch[2].trim(), body: '' };
      continue;
    }
    if (currentBriefing && trimmed) {
      bodyLines.push(trimmed);
    }
  }
  flushBriefing();

  // ── Derive a display title ────────────────────────────────────────────────
  // Use the intro sentence as the list-panel title, cropped at a word boundary.
  let title = intro || financialBullets[0]?.text || '';
  if (title.length > 80) {
    const wordBreak = title.lastIndexOf(' ', 77);
    title = wordBreak > 20 ? title.slice(0, wordBreak) + '…' : title.slice(0, 77) + '…';
  }

  return { intro, financialBullets, briefingSections, title };
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
            <div className="cp-pec-card-title">
              {companyName || entry.symbol} — {entry.quarter} FY{entry.year} Pre-Earnings Analysis
            </div>
            <div className="cp-pec-card-date">AI-Generated Summary for Reference Only</div>
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
          Notice: The Pre-earning call summary is collected & summary by AI. The purpose is reference only
      </div>

      {/* Body — two-section layout */}
      <div className="cp-pec-ai-body">

        {/* ── Section 1: Financial Statement ── */}
        {(parsed.intro || parsed.financialBullets.length > 0) && (
          <div className="cp-pec-section cp-pec-section--financial">
            <div className="cp-pec-section-label">
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
                <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                <path d="M4 7h6M4 4.5h4M4 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              Financial Statement
            </div>
            {parsed.intro && (
              <p className="cp-pec-intro">{highlightText(parsed.intro, keyword)}</p>
            )}
            {parsed.financialBullets.length > 0 && (
              <ul className="cp-pec-fin-list">
                {parsed.financialBullets.map((bullet, i) => (
                  <li key={i} className="cp-pec-fin-item">
                    <span className="cp-pec-fin-bullet-dot" aria-hidden="true" />
                    <span className="cp-pec-fin-bullet-text">{highlightText(bullet.text, keyword)}</span>
                    {bullet.subitems.length > 0 && (
                      <ol className="cp-pec-fin-sublist">
                        {bullet.subitems.map((sub, j) => (
                          <li key={j} className="cp-pec-fin-subitem">
                            <span className="cp-pec-fin-subitem-num">{j + 1}.</span>
                            <span>{highlightText(sub, keyword)}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ── Section 2: Pre-Earnings Briefing ── */}
        {parsed.briefingSections.length > 0 && (
          <div className="cp-pec-section cp-pec-section--briefing">
            <div className="cp-pec-section-label">
              <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M7 4.5v3l1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Earnings Briefing
            </div>
            <div className="cp-pec-briefing-list">
              {parsed.briefingSections.map((section) => (
                <div key={section.number} className="cp-pec-briefing-item">
                  <div className="cp-pec-briefing-header">
                    <span className="cp-pec-briefing-num">{section.number}</span>
                    <span className="cp-pec-briefing-heading">
                      {highlightText(section.heading, keyword)}
                    </span>
                  </div>
                  <p className="cp-pec-briefing-body">
                    {highlightText(section.body, keyword)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
  // Fetch entries via simulated API (will be replaced with real API call)
  const [sortedEntries, setSortedEntries] = useState<PecMdEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPreEarningCallByCoCd(symbol).then((entries) => {
      if (!cancelled) {
        setSortedEntries(entries);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol]);

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
      list = list.filter((e) => e.content.toLowerCase().includes(kw));
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

  if (loading) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <p className="cp-pec-empty-text">Loading Pre-Earning Call data…</p>
        </div>
      </div>
    );
  }

  if (sortedEntries.length === 0) {
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
