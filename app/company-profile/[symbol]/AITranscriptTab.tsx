'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';
import { AiTranscriptHtmlEntry } from '@/app/data/aiTranscripts';
import { getAITranscriptByCoCd } from '@/app/lib/getAITranscriptByCoCd';
import { highlightHtml, highlightText } from '@/app/lib/htmlHighlight';

interface AITranscriptTabProps {
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseQuarterNumber(q: string): number {
  const n = parseInt(q.replace('Q', ''), 10);
  return isNaN(n) ? 0 : n;
}

/** Remove the first <h3>…</h3> from HTML to avoid duplicate title rendering. */
function stripFirstH3(html: string): string {
  return html.replace(/<h3[^>]*>[\s\S]*?<\/h3>/i, '');
}

// ── highlightHtml is imported from @/app/lib/htmlHighlight ───────────────────

function downloadHtml(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── List item ─────────────────────────────────────────────────────────────────

interface AiListItemProps {
  entry: AiTranscriptHtmlEntry;
  isActive: boolean;
  keyword: string;
  onClick: () => void;
}

function AiListItem({ entry, isActive, keyword, onClick }: AiListItemProps) {
  return (
    <button
      className={`cp-irt-list-item${isActive ? ' cp-irt-list-item--active' : ''}`}
      onClick={onClick}
    >
      <div className="cp-irt-list-item-title">{highlightText(entry.doc_title, keyword)}</div>
      <div className="cp-irt-list-item-meta">
        <div className="cp-irt-list-item-tags">
          <span className="cp-irt-period-tag cp-irt-period-tag--year">{entry.fiscal_year_no}</span>
          <span className="cp-irt-period-tag cp-irt-period-tag--qtr">{entry.fiscal_qtr_no}</span>
        </div>
      </div>
    </button>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────

interface AiTranscriptDetailProps {
  entry: AiTranscriptHtmlEntry;
  companyName: string;
  keyword: string;
}

function AiTranscriptDetail({ entry, companyName, keyword }: AiTranscriptDetailProps) {
  function handleDownload() {
    downloadHtml(`${entry.co_cd}_${entry.fiscal_year_no}_${entry.fiscal_qtr_no}-ai-transcript.html`, entry.doc_html);
  }

  const displayHtml = useMemo(() => {
    const stripped = stripFirstH3(entry.doc_html);
    return keyword.trim() ? highlightHtml(stripped, keyword) : stripped;
  }, [entry.doc_html, keyword]);

  return (
    <article className="cp-pec-card cp-pec-ai-card">
      {/* Header */}
      <div className="cp-pec-card-header">
        <div className="cp-pec-card-header-left">
          <span className="cp-pec-card-company cp-pec-ai-badge">AI</span>
          <div>
            <div className="cp-pec-card-title">{highlightText(entry.doc_title, keyword)}</div>
            <div className="cp-pec-card-date">{entry.co_cd} · {entry.fiscal_qtr_no} {entry.fiscal_year_no}</div>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="cp-pec-notice">
        Notice: BD/IT team continue to improve the AI tool. Currently the summarized transcript is for reference purpose only. (Contact Window: Alex Chang 張汶傑)
      </div>

      {/* Download button */}
      <div className="cp-pec-card-actions cp-pec-ai-download">
        <button
          className="cp-pec-card-action-btn"
          title="Download HTML"
          aria-label="Download HTML"
          onClick={handleDownload}
        >
          <DownloadIcon />
        </button>
      </div>

      {/* HTML content rendered dynamically from doc_html — strips leading h3 title to avoid duplication */}
      <div
        className="cp-pec-ai-body cp-pec-ai-html-content"
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />

      {/* Footer */}
      <div className="cp-pec-card-footer">
        <span className="cp-pec-tag cp-pec-ai-tag">AI-Generated</span>
        <span className="cp-pec-tag">{entry.fiscal_qtr_no} {entry.fiscal_year_no}</span>
        <span className="cp-pec-tag">{companyName || entry.co_cd}</span>
        <span className="cp-pec-tag">AI Transcript</span>
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AITranscriptTab({ symbol, companyName }: AITranscriptTabProps) {
  // Fetch entries via simulated API (will be replaced with real API call)
  const [sortedEntries, setSortedEntries] = useState<AiTranscriptHtmlEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAITranscriptByCoCd(symbol).then((entries) => {
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
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  const yearOptions = useMemo(() => {
    const years = [...new Set(sortedEntries.map((e) => e.fiscal_year_no))];
    return [{ value: 'all', label: 'All Years' }, ...years.map((y) => ({ value: y, label: y }))];
  }, [sortedEntries]);

  const qtrOptions = useMemo(() => {
    const qtrs = [...new Set(sortedEntries.map((e) => e.fiscal_qtr_no))].sort(
      (a, b) => parseQuarterNumber(a) - parseQuarterNumber(b)
    );
    return [{ value: 'all', label: 'All Qtrs' }, ...qtrs.map((q) => ({ value: q, label: q }))];
  }, [sortedEntries]);

  const filteredEntries = useMemo(() => {
    let list = sortedEntries;
    if (yearFilter !== 'all') {
      list = list.filter((e) => e.fiscal_year_no === yearFilter);
    }
    if (qtrFilter !== 'all') {
      list = list.filter((e) => e.fiscal_qtr_no === qtrFilter);
    }
    if (debouncedKeyword.trim()) {
      const kw = debouncedKeyword.toLowerCase();
      list = list.filter((e) => e.doc_html.toLowerCase().includes(kw));
    }
    return list;
  }, [sortedEntries, yearFilter, qtrFilter, debouncedKeyword]);

  const activeEntry = useMemo(() => {
    if (selectedId) {
      const found = filteredEntries.find((e) => `${e.fiscal_year_no}-${e.fiscal_qtr_no}` === selectedId);
      if (found) return found;
    }
    return filteredEntries[0] ?? null;
  }, [filteredEntries, selectedId]);

  const handleSelectEntry = useCallback((entry: AiTranscriptHtmlEntry) => {
    setSelectedId(`${entry.fiscal_year_no}-${entry.fiscal_qtr_no}`);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (selectedId && !filteredEntries.find((e) => `${e.fiscal_year_no}-${e.fiscal_qtr_no}` === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredEntries, selectedId]);

  if (loading) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <p className="cp-pec-empty-text">Loading AI Transcript data…</p>
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
          <p className="cp-pec-empty-text">No AI Transcript analysis available for {symbol}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-irt-layout">
      {/* Left Panel: Search + List */}
      <aside className="cp-irt-panel-left">
        <div className="cp-irt-search-box">
          <span className="cp-irt-search-icon"><SearchIcon /></span>
          <input
            ref={searchRef}
            type="text"
            className="cp-irt-search-input"
            placeholder="Search AI analyses…"
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            aria-label="Search AI transcript analyses"
          />
          {keyword && (
            <button className="cp-irt-search-clear" onClick={handleClearSearch} title="Clear search" aria-label="Clear search">
              <ClearIcon />
            </button>
          )}
        </div>

        <div className="cp-irt-filter-row">
          <span className="cp-irt-filter-label"><FilterIcon />Period</span>
          <select
            className="cp-irt-period-select"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            aria-label="Filter by year"
          >
            {yearOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="cp-irt-period-select"
            value={qtrFilter}
            onChange={(e) => setQtrFilter(e.target.value)}
            aria-label="Filter by quarter"
          >
            {qtrOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="cp-irt-list">
          {filteredEntries.length === 0 ? (
            <div className="cp-irt-list-empty">No AI analyses match your filter.</div>
          ) : (
            filteredEntries.map((entry) => (
              <AiListItem
                key={`${entry.fiscal_year_no}-${entry.fiscal_qtr_no}`}
                entry={entry}
                isActive={activeEntry?.fiscal_year_no === entry.fiscal_year_no && activeEntry?.fiscal_qtr_no === entry.fiscal_qtr_no}
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
          <AiTranscriptDetail
            entry={activeEntry}
            companyName={companyName || symbol}
            keyword={keyword}
          />
        ) : (
          <div className="cp-pec-empty">
            <span className="cp-pec-empty-icon"><NoDataIcon /></span>
            <p className="cp-pec-empty-text">Select an analysis from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
