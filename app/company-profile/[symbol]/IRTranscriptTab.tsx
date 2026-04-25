'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';
import { IrTranscriptHtmlEntry } from '@/app/data/irTranscripts';
import { getIRTranscriptByCoCd } from '@/app/lib/getIRTranscriptByCoCd';
import { highlightHtml, highlightText } from '@/app/lib/htmlHighlight';
import { useTranscriptSearch, TranscriptSearchAccessors } from './useTranscriptSearch';

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

function ExpandAllIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path d="M3 5L7 1L11 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 9L7 13L11 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollapseAllIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path d="M3 1L7 5L11 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13L7 9L11 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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

// ── Search accessors (module-level for stable references) ─────────────────────

const irtAccessors: TranscriptSearchAccessors<IrTranscriptHtmlEntry> = {
  getYear: (e) => e.fiscal_year_no,
  getQtr: (e) => e.fiscal_qtr_no,
  // Include both title and HTML body so items are never filtered out just
  // because a keyword matches the title but not the body content.
  getSearchableText: (e) => `${e.doc_title} ${e.doc_html}`,
  getKey: (e) => `${e.fiscal_year_no}-${e.fiscal_qtr_no}`,
};

// ── List Item ─────────────────────────────────────────────────────────────────

interface IrtListItemProps {
  entry: IrTranscriptHtmlEntry;
  isActive: boolean;
  keyword: string;
  onClick: () => void;
}

function IrtListItem({ entry, isActive, keyword, onClick }: IrtListItemProps) {
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

// ── HTML keyword highlighter is imported from @/app/lib/htmlHighlight ─────────

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface IrtDetailProps {
  entry: IrTranscriptHtmlEntry;
  keyword: string;
}

function IrtDetail({ entry, keyword }: IrtDetailProps) {
  const parsed = useMemo(() => parseTranscriptFull(entry.doc_html), [entry.doc_html]);
  const { participants, managementSections, qaSections, hasStructuredData } = parsed;

  const allSections = useMemo(
    () => [...managementSections, ...qaSections],
    [managementSections, qaSections],
  );

  // When keyword changes, auto-expand all sections that contain the keyword
  const keywordExpandedIds = useMemo(() => {
    if (!keyword.trim()) return new Set<string>();
    const kw = keyword.toLowerCase();
    const ids = new Set<string>();
    for (const s of allSections) {
      if (
        s.speaker.toLowerCase().includes(kw) ||
        s.contentHtml.toLowerCase().includes(kw)
      ) {
        ids.add(s.id);
      }
    }
    return ids;
  }, [allSections, keyword]);

  const [manualExpandedIds, setManualExpandedIds] = useState<Set<string>>(new Set());
  // manualCollapsedIds tracks sections explicitly collapsed by the user (overrides keyword-expand)
  const [manualCollapsedIds, setManualCollapsedIds] = useState<Set<string>>(new Set());
  // selectedChipIds tracks which exec chips are active for filtering (multi-select)
  const [selectedChipIds, setSelectedChipIds] = useState<Set<string>>(new Set());
  // collapsedAll=true suppresses keyword-expand and only shows manualExpandedIds
  const [collapsedAll, setCollapsedAll] = useState(false);
  // isExpandedState tracks the user/auto-expand intent for the toggle-all button.
  // Using an explicit state (not derived) ensures the button reflects intended state
  // even when chips are selected and sections are auto-expanded.
  const [isExpandedState, setIsExpandedState] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Merge manually expanded with keyword-expanded.
  // When collapsedAll=true, keyword expansion is suppressed (only manual expansions show).
  // manualCollapsedIds always prevents a section from being keyword-auto-expanded.
  const expandedIds = useMemo(() => {
    const merged = new Set(manualExpandedIds);
    if (!collapsedAll) {
      keywordExpandedIds.forEach((id) => {
        if (!manualCollapsedIds.has(id)) merged.add(id);
      });
    }
    return merged;
  }, [collapsedAll, manualExpandedIds, keywordExpandedIds, manualCollapsedIds]);

  useEffect(() => {
    setManualExpandedIds(new Set());
    setManualCollapsedIds(new Set());
    setSelectedChipIds(new Set());
    setCollapsedAll(false);
    setIsExpandedState(false);
  }, [entry.co_cd, entry.fiscal_year_no, entry.fiscal_qtr_no]);

  const managementParticipants = useMemo(() => participants.filter((p) => p.type === 'management'), [participants]);
  const analystParticipants = useMemo(() => participants.filter((p) => p.type === 'analyst'), [participants]);

  // Analyst chips — one chip per analyst from the structured participants block.
  // Use "analyst-{name}" as the virtual chip ID so IDs never collide with section IDs.
  const analystChips = useMemo(
    () => analystParticipants.map((p) => ({ id: `analyst-${p.name}`, displayName: p.name, role: p.role })),
    [analystParticipants],
  );

  // Build a map from chip id → displayName for efficient lookup.
  // Includes both exec section IDs and analyst virtual IDs.
  const chipDisplayNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of managementSections) {
      map.set(s.id, s.displayName);
    }
    for (const chip of analystChips) {
      map.set(chip.id, chip.displayName);
    }
    return map;
  }, [managementSections, analystChips]);

  const handleChipClick = useCallback((id: string) => {
    setSelectedChipIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        // Toggle off — remove filter for this chip
        next.delete(id);
        return next;
      }
      // Toggle on — add filter and expand + scroll to section
      next.add(id);
      return next;
    });
    // Expand the section and scroll to it.
    // For exec chips the id is the section id directly; for analyst virtual IDs find
    // the first Q&A section whose speaker contains the chip display name.
    setManualExpandedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      if (sectionRefs.current[id]) {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Virtual analyst chip — find first matching Q&A section
        const chipName = chipDisplayNames.get(id)?.toLowerCase() ?? '';
        if (chipName) {
          const match = qaSections.find((s) => s.speaker.toLowerCase().includes(chipName));
          if (match) {
            setManualExpandedIds((prev) => { const n = new Set(prev); n.add(match.id); return n; });
            sectionRefs.current[match.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }, 60);
  }, [chipDisplayNames, qaSections]);

  const handleToggle = useCallback((id: string, expand: boolean) => {
    setManualExpandedIds((prev) => {
      const next = new Set(prev);
      expand ? next.add(id) : next.delete(id);
      return next;
    });
    setManualCollapsedIds((prev) => {
      const next = new Set(prev);
      expand ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  function handleDownload() {
    const blob = new Blob([entry.doc_html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${entry.co_cd}_${entry.fiscal_year_no}_${entry.fiscal_qtr_no}-ir-transcript.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Chips show management speakers only (or all if no structured data)
  const execChips = managementSections;

  // Determine whether a section is visible given the current chip filter.
  // "Operator" sections are always visible (conversation starters, above filter scope).
  // When no chips are selected, all sections are visible.
  const isSectionVisible = useCallback((section: SpeakerSection): boolean => {
    if (selectedChipIds.size === 0) return true;
    if (/^operator$/i.test(section.displayName.trim())) return true;
    const speakerLower = section.speaker.toLowerCase();
    for (const chipId of selectedChipIds) {
      const chipName = chipDisplayNames.get(chipId);
      if (chipName && speakerLower.includes(chipName.toLowerCase())) {
        return true;
      }
    }
    return false;
  }, [selectedChipIds, chipDisplayNames]);

  // When chip selection changes, auto-expand all newly-visible sections
  useEffect(() => {
    if (selectedChipIds.size === 0) return;
    setIsExpandedState(true);
    setCollapsedAll(false);
    setManualCollapsedIds((prev) => (prev.size === 0 ? prev : new Set()));
    setManualExpandedIds((prev) => {
      const next = new Set(prev);
      for (const section of allSections) {
        if (/^operator$/i.test(section.displayName.trim())) { next.add(section.id); continue; }
        const speakerLower = section.speaker.toLowerCase();
        for (const chipId of selectedChipIds) {
          const chipName = chipDisplayNames.get(chipId);
          if (chipName && speakerLower.includes(chipName.toLowerCase())) {
            next.add(section.id);
            break;
          }
        }
      }
      return next;
    });
  }, [selectedChipIds, allSections, chipDisplayNames]);

  function handleToggleAll() {
    if (isExpandedState) {
      setIsExpandedState(false);
      setCollapsedAll(true);
      setManualExpandedIds(new Set());
      setManualCollapsedIds(new Set());
    } else {
      setIsExpandedState(true);
      setCollapsedAll(false);
      setManualExpandedIds(new Set(allSections.filter(isSectionVisible).map((s) => s.id)));
      setManualCollapsedIds(new Set());
    }
  }

  function renderSpeakerSection(section: SpeakerSection) {
    if (!isSectionVisible(section)) return null;
    const isExpanded = expandedIds.has(section.id);
    const highlightedHtml = keyword.trim() ? highlightHtml(section.contentHtml, keyword) : section.contentHtml;
    return (
      <div
        key={section.id}
        className="cp-irt-speaker-section"
        ref={(el) => { sectionRefs.current[section.id] = el; }}
      >
        <button
          className={`cp-irt-speaker-header${isExpanded ? ' cp-irt-speaker-header--expanded' : ''}`}
          onClick={() => handleToggle(section.id, !isExpanded)}
          aria-expanded={isExpanded}
        >
          <span className="cp-irt-speaker-name">{highlightText(section.speaker, keyword)}</span>
          <ChevronDownIcon className={`cp-irt-chevron${isExpanded ? ' cp-irt-chevron--open' : ''}`} />
        </button>
        {isExpanded && (
          <div
            className="cp-irt-speaker-body"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        )}
      </div>
    );
  }

  return (
    <article className="cp-pec-card cp-irt-card">
      {/* Header */}
      <div className="cp-pec-card-header">
        <div className="cp-pec-card-header-left">
          <span className="cp-pec-card-company cp-irt-badge">IR</span>
          <div className="cp-pec-card-title-wrap">
            <div className="cp-pec-card-title">{highlightText(entry.doc_title, keyword)}</div>
            <div className="cp-pec-card-date">
              {entry.co_cd} · {entry.fiscal_qtr_no} {entry.fiscal_year_no}
              {entry.event_date && <span className="cp-irt-event-date"> · {entry.event_date}</span>}
            </div>
          </div>
        </div>
        <div className="cp-pec-card-actions">
          <button
            className="cp-pec-card-action-btn"
            title={isExpandedState ? 'Collapse all sections' : 'Expand all sections'}
            aria-label={isExpandedState ? 'Collapse all sections' : 'Expand all sections'}
            onClick={handleToggleAll}
          >
            {isExpandedState ? <CollapseAllIcon /> : <ExpandAllIcon />}
          </button>
          <button
            className="cp-pec-card-action-btn"
            title="Download HTML"
            aria-label="Download HTML"
            onClick={handleDownload}
          >
            <DownloadIcon />
          </button>
        </div>
      </div>

      {/* Executives nav chips — quick jump to management speaker sections */}
      {execChips.length > 0 && (
        <div className={`cp-irt-exec-nav${analystChips.length > 0 ? ' cp-irt-exec-nav--no-border' : ''}`}>
          <span className="cp-irt-exec-nav-label">Executives</span>
          <div className="cp-irt-exec-chips">
            {execChips.map((s) => (
              <button
                key={s.id}
                className={`cp-irt-exec-chip${selectedChipIds.has(s.id) ? ' cp-irt-exec-chip--active' : ''}`}
                onClick={() => handleChipClick(s.id)}
                title={s.speaker}
              >
                {s.displayName}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysts nav chips — quick filter to analyst speaker sections */}
      {analystChips.length > 0 && (
        <div className="cp-irt-exec-nav">
          <span className="cp-irt-exec-nav-label">Analysts</span>
          <div className="cp-irt-exec-chips">
            {analystChips.map((chip) => (
              <button
                key={chip.id}
                className={`cp-irt-exec-chip cp-irt-analyst-chip${selectedChipIds.has(chip.id) ? ' cp-irt-analyst-chip--active' : ''}`}
                onClick={() => handleChipClick(chip.id)}
                title={`${chip.displayName} — ${chip.role}`}
              >
                {chip.displayName}
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
                    <span className="cp-irt-participant-name">{highlightText(p.name, keyword)}</span>
                    <span className="cp-irt-participant-sep">—</span>
                    <span className="cp-irt-participant-role">{highlightText(p.role, keyword)}</span>
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
                    <span className="cp-irt-participant-name">{highlightText(p.name, keyword)}</span>
                    <span className="cp-irt-participant-sep">—</span>
                    <span className="cp-irt-participant-role">{highlightText(p.role, keyword)}</span>
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
        <span className="cp-pec-tag">{entry.fiscal_qtr_no} {entry.fiscal_year_no}</span>
        <span className="cp-pec-tag">{entry.co_cd}</span>
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function IRTranscriptTab({ symbol }: IRTranscriptTabProps) {
  // Fetch entries via simulated API (will be replaced with real API call)
  const [sortedEntries, setSortedEntries] = useState<IrTranscriptHtmlEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getIRTranscriptByCoCd(symbol).then((entries) => {
      if (!cancelled) {
        setSortedEntries(entries);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [symbol]);

  const {
    keyword,
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
  } = useTranscriptSearch(sortedEntries, irtAccessors);

  if (loading) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <p className="cp-pec-empty-text">Loading IR Transcript data…</p>
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
            maxLength={100}
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

      {/* Right Panel */}
      <div className="cp-irt-panel-right">
        {activeEntry ? (
          <IrtDetail entry={activeEntry} keyword={keyword} />
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
