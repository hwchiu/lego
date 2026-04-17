'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';
import { IR_TRANSCRIPT_HTML_ENTRIES, IrTranscriptHtmlEntry } from '@/app/data/irTranscripts';

interface IRTranscriptTabProps {
  symbol: string;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function DownloadIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path d="M7 1v8M4.5 6.5L7 9l2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1.5 11h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M2.5 11v1.5h9V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path
        d="M6 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h8A1.5 1.5 0 0012 11.5V8M8 1h5v5M13 1L6.5 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      width="12"
      height="12"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Parser types ──────────────────────────────────────────────────────────────

interface SpeakerSection {
  id: string;
  speaker: string;
  displayName: string;
  contentHtml: string;
}

interface Participant {
  name: string;
  role: string;
  type: 'management' | 'analyst';
}

interface ParsedTranscript {
  participants: Participant[];
  managementSections: SpeakerSection[];
  qaSections: SpeakerSection[];
  hasStructuredData: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// ── Speaker section parser ─────────────────────────────────────────────────────

function parseSpeakerSections(html: string, idPrefix = 'sp'): SpeakerSection[] {
  const sections: SpeakerSection[] = [];
  const speakerMarkerRe = /<p[^>]*>\s*<strong>([^<]{1,80})<\/strong>\s*<\/p>/g;

  let lastSpeaker: string | null = null;
  let lastMatchEnd = 0;

  for (const match of html.matchAll(speakerMarkerRe)) {
    const matchIndex = match.index ?? 0;
    if (lastSpeaker !== null) {
      const contentHtml = html.slice(lastMatchEnd, matchIndex).trim();
      const id = `${idPrefix}-${sections.length}`;
      const decoded = decodeHtmlEntities(lastSpeaker);
      const displayName = decoded.split('\u2014')[0].split('\u2013')[0].split(' \u2014')[0].trim();
      sections.push({ id, speaker: decoded, displayName, contentHtml });
    }
    lastSpeaker = match[1].trim();
    lastMatchEnd = matchIndex + match[0].length;
  }

  if (lastSpeaker !== null) {
    const contentHtml = html.slice(lastMatchEnd).trim();
    const id = `${idPrefix}-${sections.length}`;
    const decoded = decodeHtmlEntities(lastSpeaker);
    const displayName = decoded.split('\u2014')[0].split('\u2013')[0].trim();
    sections.push({ id, speaker: decoded, displayName, contentHtml });
  }

  return sections;
}

// ── Full transcript parser (handles structured HTML with participants + sections) ──

function parseTranscriptFull(html: string): ParsedTranscript {
  const participants: Participant[] = [];
  let remaining = html;

  // 1. Extract participants block
  const participantsBlockRe = /<div class="irt-participants-block">([\s\S]*?)<\/div>/;
  const participantsMatch = remaining.match(participantsBlockRe);
  if (participantsMatch) {
    remaining = remaining.replace(participantsMatch[0], '');
    const pContent = participantsMatch[1];

    for (const m of pContent.matchAll(/<p class="irt-p-mgmt"><strong>([^<]+)<\/strong>\s*[—–]+\s*([^<]*)<\/p>/g)) {
      participants.push({ name: m[1].trim(), role: decodeHtmlEntities(m[2].trim()), type: 'management' });
    }
    for (const m of pContent.matchAll(/<p class="irt-p-analyst"><strong>([^<]+)<\/strong>\s*[—–]+\s*([^<]*)<\/p>/g)) {
      participants.push({ name: m[1].trim(), role: decodeHtmlEntities(m[2].trim()), type: 'analyst' });
    }
  }

  // 2. Check for section label dividers
  const hasLabels = /<div class="irt-section-label">/.test(remaining);

  if (!hasLabels) {
    // Backward-compatible: no structured sections
    return {
      participants,
      managementSections: parseSpeakerSections(remaining, 'mgmt'),
      qaSections: [],
      hasStructuredData: false,
    };
  }

  // 3. Split by section labels — the regex captures the label text between delimiter divs
  const parts = remaining.split(/(<div class="irt-section-label">[^<]*<\/div>)/);
  // parts = [preamble, <div label1>, content1, <div label2>, content2, ...]

  let managementSections: SpeakerSection[] = [];
  let qaSections: SpeakerSection[] = [];

  for (let i = 1; i < parts.length; i += 2) {
    const labelTagMatch = parts[i].match(/<div class="irt-section-label">([^<]*)<\/div>/);
    const label = labelTagMatch ? labelTagMatch[1].replace(/&amp;/g, '&').trim() : '';
    const content = (parts[i + 1] || '').trim();

    if (/MANAGEMENT/i.test(label)) {
      managementSections = parseSpeakerSections(content, 'mgmt');
    } else if (/Q&A/i.test(label) || /Q\s*&amp;\s*A/i.test(label)) {
      qaSections = parseSpeakerSections(content, 'qa');
    }
  }

  return {
    participants,
    managementSections,
    qaSections,
    hasStructuredData: true,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseQuarterNumber(q: string): number {
  const n = parseInt(q.replace('Q', ''), 10);
  return isNaN(n) ? 0 : n;
}

// ── List Item ─────────────────────────────────────────────────────────────────

interface IrtListItemProps {
  entry: IrTranscriptHtmlEntry;
  isActive: boolean;
  onClick: () => void;
}

function IrtListItem({ entry, isActive, onClick }: IrtListItemProps) {
  const title = `${entry.companyName} (${entry.symbol}-US), ${entry.quarter} ${entry.year} Earnings Call Transcript`;
  return (
    <button
      className={`cp-irt-list-item${isActive ? ' cp-irt-list-item--active' : ''}`}
      onClick={onClick}
    >
      <div className="cp-irt-list-item-title">{title}</div>
      <div className="cp-irt-list-item-meta">
        <div className="cp-irt-list-item-tags">
          <span className="cp-irt-period-tag cp-irt-period-tag--year">{entry.year}</span>
          <span className="cp-irt-period-tag cp-irt-period-tag--qtr">{entry.quarter}</span>
        </div>
      </div>
    </button>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface IrtDetailProps {
  entry: IrTranscriptHtmlEntry;
}

function IrtDetail({ entry }: IrtDetailProps) {
  const parsed = useMemo(() => parseTranscriptFull(entry.content), [entry.content]);
  const { participants, managementSections, qaSections, hasStructuredData } = parsed;

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setExpandedIds(new Set());
  }, [entry.filename]);

  const handleChipClick = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  }, []);

  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  function handleDownload() {
    const blob = new Blob([entry.content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.filename}-ir-transcript.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const title = `${entry.companyName} (${entry.symbol}-US), ${entry.quarter} ${entry.year} Earnings Call Transcript`;

  // Chips show management speakers only (or all if no structured data)
  const execChips = managementSections;

  function renderSpeakerSection(section: SpeakerSection) {
    const isExpanded = expandedIds.has(section.id);
    return (
      <div
        key={section.id}
        className="cp-irt-speaker-section"
        ref={(el) => { sectionRefs.current[section.id] = el; }}
      >
        <button
          className={`cp-irt-speaker-header${isExpanded ? ' cp-irt-speaker-header--expanded' : ''}`}
          onClick={() => handleToggle(section.id)}
          aria-expanded={isExpanded}
        >
          <span className="cp-irt-speaker-name">{section.speaker}</span>
          <ChevronDownIcon className={`cp-irt-chevron${isExpanded ? ' cp-irt-chevron--open' : ''}`} />
        </button>
        {isExpanded && (
          <div
            className="cp-irt-speaker-body"
            dangerouslySetInnerHTML={{ __html: section.contentHtml }}
          />
        )}
      </div>
    );
  }

  const managementParticipants = participants.filter((p) => p.type === 'management');
  const analystParticipants = participants.filter((p) => p.type === 'analyst');

  return (
    <article className="cp-pec-card cp-irt-card">
      {/* Header */}
      <div className="cp-pec-card-header">
        <div className="cp-pec-card-header-left">
          <span className="cp-pec-card-company cp-irt-badge">IR</span>
          <div>
            <div className="cp-pec-card-title">{title}</div>
            <div className="cp-pec-card-date">
              {entry.symbol} · {entry.quarter} {entry.year}
              {entry.eventDate && <span className="cp-irt-event-date"> · {entry.eventDate}</span>}
            </div>
          </div>
        </div>
        <div className="cp-pec-card-actions">
          <button
            className="cp-pec-card-action-btn"
            title="Download HTML"
            aria-label="Download HTML"
            onClick={handleDownload}
          >
            <DownloadIcon />
          </button>
          <a
            href={entry.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cp-pec-card-action-btn"
            title="Open source"
            aria-label="Open source"
          >
            <ExternalLinkIcon />
          </a>
        </div>
      </div>

      {/* Executives nav chips — quick jump to management speaker sections */}
      {execChips.length > 0 && (
        <div className="cp-irt-exec-nav">
          <span className="cp-irt-exec-nav-label">Executives</span>
          <div className="cp-irt-exec-chips">
            {execChips.map((s) => (
              <button
                key={s.id}
                className={`cp-irt-exec-chip${expandedIds.has(s.id) ? ' cp-irt-exec-chip--active' : ''}`}
                onClick={() => handleChipClick(s.id)}
                title={s.speaker}
              >
                {s.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Participants block */}
      {hasStructuredData && participants.length > 0 && (
        <div className="cp-irt-participants">
          <div className="cp-irt-participants-header">PARTICIPANTS</div>
          {managementParticipants.length > 0 && (
            <div className="cp-irt-participants-group">
              <div className="cp-irt-participants-group-label">Management</div>
              <div className="cp-irt-participants-list">
                {managementParticipants.map((p) => (
                  <div key={p.name} className="cp-irt-participant-item">
                    <span className="cp-irt-participant-name">{p.name}</span>
                    <span className="cp-irt-participant-sep">—</span>
                    <span className="cp-irt-participant-role">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {analystParticipants.length > 0 && (
            <div className="cp-irt-participants-group">
              <div className="cp-irt-participants-group-label">Analysts</div>
              <div className="cp-irt-participants-list">
                {analystParticipants.map((p) => (
                  <div key={p.name} className="cp-irt-participant-item">
                    <span className="cp-irt-participant-name">{p.name}</span>
                    <span className="cp-irt-participant-sep">—</span>
                    <span className="cp-irt-participant-role">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Management Discussion Section */}
      {managementSections.length > 0 && (
        <>
          {hasStructuredData && (
            <div className="cp-irt-section-divider">
              <span className="cp-irt-section-divider-line" />
              <span className="cp-irt-section-divider-label">MANAGEMENT DISCUSSION SECTION</span>
              <span className="cp-irt-section-divider-line" />
            </div>
          )}
          <div className="cp-irt-speaker-sections">
            {managementSections.map(renderSpeakerSection)}
          </div>
        </>
      )}

      {/* Q&A Section */}
      {qaSections.length > 0 && (
        <>
          <div className="cp-irt-section-divider cp-irt-section-divider--qa">
            <span className="cp-irt-section-divider-line" />
            <span className="cp-irt-section-divider-label">Q&amp;A</span>
            <span className="cp-irt-section-divider-line" />
          </div>
          <div className="cp-irt-speaker-sections">
            {qaSections.map(renderSpeakerSection)}
          </div>
        </>
      )}

      {/* Footer */}
      <div className="cp-pec-card-footer">
        <span className="cp-pec-tag cp-irt-tag">IR Transcript</span>
        <span className="cp-pec-tag">{entry.quarter} {entry.year}</span>
        <span className="cp-pec-tag">{entry.symbol}</span>
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function IRTranscriptTab({ symbol }: IRTranscriptTabProps) {
  const allEntries = useMemo(
    () => IR_TRANSCRIPT_HTML_ENTRIES.filter((e) => e.symbol === symbol),
    [symbol]
  );

  const sortedEntries = useMemo(
    () =>
      [...allEntries].sort(
        (a, b) => b.year - a.year || parseQuarterNumber(b.quarter) - parseQuarterNumber(a.quarter)
      ),
    [allEntries]
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [qtrFilter, setQtrFilter] = useState('all');
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

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
    return [{ value: 'all', label: 'All Qtrs' }, ...qtrs.map((q) => ({ value: q, label: q }))];
  }, [sortedEntries]);

  const filteredEntries = useMemo(() => {
    let list = sortedEntries;
    if (yearFilter !== 'all') list = list.filter((e) => String(e.year) === yearFilter);
    if (qtrFilter !== 'all') list = list.filter((e) => e.quarter === qtrFilter);
    if (debouncedKeyword.trim()) {
      const kw = debouncedKeyword.toLowerCase();
      list = list.filter(
        (e) =>
          e.companyName.toLowerCase().includes(kw) ||
          e.symbol.toLowerCase().includes(kw) ||
          String(e.year).includes(kw) ||
          e.quarter.toLowerCase().includes(kw) ||
          e.content.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [sortedEntries, yearFilter, qtrFilter, debouncedKeyword]);

  const activeEntry = useMemo(() => {
    if (selectedKey) {
      const found = filteredEntries.find((e) => `${e.year}-${e.quarter}` === selectedKey);
      if (found) return found;
    }
    return filteredEntries[0] ?? null;
  }, [filteredEntries, selectedKey]);

  const handleSelectEntry = useCallback((entry: IrTranscriptHtmlEntry) => {
    setSelectedKey(`${entry.year}-${entry.quarter}`);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (selectedKey && !filteredEntries.find((e) => `${e.year}-${e.quarter}` === selectedKey)) {
      setSelectedKey(null);
    }
  }, [filteredEntries, selectedKey]);

  if (allEntries.length === 0) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <span className="cp-pec-empty-icon">
            <NoDataIcon />
          </span>
          <p className="cp-pec-empty-text">No IR Transcript available for {symbol}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-irt-layout">
      {/* Left Panel */}
      <aside className="cp-irt-panel-left">
        <div className="cp-irt-search-box">
          <span className="cp-irt-search-icon"><SearchIcon /></span>
          <input
            ref={searchRef}
            type="text"
            className="cp-irt-search-input"
            placeholder="Search transcripts…"
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            aria-label="Search IR transcripts"
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
            <div className="cp-irt-list-empty">No transcripts match your filter.</div>
          ) : (
            filteredEntries.map((entry) => (
              <IrtListItem
                key={`${entry.year}-${entry.quarter}`}
                entry={entry}
                isActive={activeEntry?.year === entry.year && activeEntry?.quarter === entry.quarter}
                onClick={() => handleSelectEntry(entry)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Right Panel */}
      <div className="cp-irt-panel-right">
        {activeEntry ? (
          <IrtDetail entry={activeEntry} />
        ) : (
          <div className="cp-pec-empty">
            <span className="cp-pec-empty-icon"><NoDataIcon /></span>
            <p className="cp-pec-empty-text">Select a transcript from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
