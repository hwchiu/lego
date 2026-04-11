'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';

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

// ── Types ─────────────────────────────────────────────────────────────────────

interface IrTranscriptSection {
  heading: string;
  bullets: string[];
}

interface IrTranscriptCard {
  symbol: string;
  companyName: string;
  title: string;
  date: string;
  year: number;
  quarter: string; // e.g. "Q1", "Q2", "Q3", "Q4"
  fileUrl: string;
  sections: IrTranscriptSection[];
  tags: string[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const IR_TRANSCRIPT_DATA: IrTranscriptCard[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Q1 2026 Earnings Call Transcript',
    date: 'January 29, 2026, 5:00 PM ET',
    year: 2026,
    quarter: 'Q1',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2026/q1/aapl-20260128.htm',
    sections: [
      {
        heading: 'Revenue & EPS',
        bullets: [
          'Q1 2026 revenue: $124.3B, up 4% YoY — beat consensus estimate',
          'EPS: $2.40 (non-GAAP), above analyst forecast of $2.35',
          'Gross margin 46.9% — new all-time record for Apple',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'Services revenue: $26.3B, up 14% YoY — all-time record',
          'iPhone revenue: $69.1B, in line with expectations',
          'Mac: $9.0B; iPad: $8.1B; Wearables & Home: $11.7B',
          'Greater China revenue: $18.5B, down 11% YoY amid competitive pressures',
        ],
      },
      {
        heading: 'Management Commentary',
        bullets: [
          'Tim Cook highlighted strong Apple Intelligence feature adoption across all markets',
          'Vision Pro expanding availability; mixed-reality developer ecosystem growing',
          'CFO Kevan Parekh guided Q2 2026 revenue at $88.5B–$91.5B',
        ],
      },
      {
        heading: 'Capital Allocation',
        bullets: [
          '$30B share buyback program announced',
          'Quarterly dividend raised to $0.25/share',
          'Total capital returned to shareholders YTD: $28.3B',
        ],
      },
    ],
    tags: ['Q1 2026', 'AAPL', 'Earnings Call', 'Apple Intelligence', 'Services'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Q4 2025 Earnings Call Transcript',
    date: 'October 30, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q4',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q4/aapl-20251003.htm',
    sections: [
      {
        heading: 'Revenue & EPS',
        bullets: [
          'Q4 FY2025 revenue: $94.9B, up 6% YoY — above analyst consensus of $94.5B',
          'EPS: $1.64 (diluted), up 12% YoY',
          'Gross margin: 46.2%, highest ever for a September quarter',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone revenue: $46.2B, up 5.5% YoY driven by iPhone 17 launch demand',
          'Services revenue: $25.0B, up 13% YoY — new record for Q4',
          'Mac: $7.7B, up 2%; iPad: $7.0B, up 8%; Wearables: $8.5B, down 1%',
          'Greater China: $15.0B, up 2% — showing early recovery signs',
        ],
      },
      {
        heading: 'Management Commentary',
        bullets: [
          'Tim Cook cited Apple Intelligence as a key driver of upgrade cycle acceleration',
          'iPhone 17 Pro demand outpacing supply in multiple regions',
          'Services growth remains strong with 1B+ paid subscriptions milestone',
        ],
      },
      {
        heading: 'Guidance',
        bullets: [
          'Q1 FY2026 revenue guidance: $119B–$123B (low single-digit YoY growth)',
          'Gross margin guided at 46.5%–47.0%',
          'Operating expenses guided at $15.3B–$15.5B',
        ],
      },
    ],
    tags: ['Q4 2025', 'AAPL', 'iPhone 17', 'Services', 'Apple Intelligence'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Q3 2025 Earnings Call Transcript',
    date: 'July 31, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q3',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q3/aapl-20250628.htm',
    sections: [
      {
        heading: 'Revenue & EPS',
        bullets: [
          'Q3 FY2025 revenue: $85.8B, up 5% YoY — in line with expectations',
          'EPS: $1.45 (diluted), up 11% YoY',
          'Gross margin: 46.3%, up 100 bps YoY',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone revenue: $39.0B, flat YoY — typical mid-cycle performance',
          'Services revenue: $24.2B, up 14% YoY — approaching $100B annual run-rate',
          'Mac: $7.0B, up 3%; iPad: $7.2B, up 24% driven by new M4 iPad Pro',
        ],
      },
      {
        heading: 'Management Commentary',
        bullets: [
          'Apple Intelligence rollout progressing; new language support added in 12 languages',
          'App Store ecosystem generated $1.1T in developer billings and sales in 2024',
          'Vision Pro software ecosystem growing with 2,500+ spatial computing apps',
        ],
      },
      {
        heading: 'Guidance',
        bullets: [
          'Q4 FY2025 revenue guidance: $89B–$93B',
          'Gross margin guided at 45.5%–46.5%',
          'iPhone 17 launch expected in September to support Q4 performance',
        ],
      },
    ],
    tags: ['Q3 2025', 'AAPL', 'Services', 'iPad Pro', 'Apple Intelligence'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Q2 2025 Earnings Call Transcript',
    date: 'May 1, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q2',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q2/aapl-20250329.htm',
    sections: [
      {
        heading: 'Revenue & EPS',
        bullets: [
          'Q2 FY2025 revenue: $95.4B, up 5% YoY — beat Street estimate of $94.1B',
          'EPS: $1.65 (diluted), up 8% YoY',
          'Gross margin: 47.1% — record for a March quarter',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone revenue: $46.8B, up 2% YoY — despite macro headwinds in China',
          'Services revenue: $26.6B, up 12% YoY — all-time record',
          'Mac: $7.9B, up 7%; iPad: $6.4B, up 15% with M4 launch',
          'Greater China: $16.0B, down 2% YoY',
        ],
      },
      {
        heading: 'Management Commentary',
        bullets: [
          'Cook emphasized growing paid subscription base surpassing 1.1B globally',
          'Tariff impact discussed — Apple actively diversifying supply chain to India and Vietnam',
          'AI features being integrated across all major product lines in upcoming updates',
        ],
      },
      {
        heading: 'Guidance',
        bullets: [
          'Q3 FY2025 revenue guidance: $84B–$88B (low-to-mid single-digit growth)',
          'Gross margin guided at 45.5%–46.5%',
          'Supply chain diversification expected to reduce tariff exposure by 2026',
        ],
      },
    ],
    tags: ['Q2 2025', 'AAPL', 'Services', 'Supply Chain', 'Tariff', 'India'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Q1 2025 Earnings Call Transcript',
    date: 'January 30, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q1',
    fileUrl: 'https://s2.q4cdn.com/470004039/files/doc_earnings/2025/q1/aapl-20241228.htm',
    sections: [
      {
        heading: 'Revenue & EPS',
        bullets: [
          'Q1 FY2025 revenue: $124.3B, up 4% YoY — in-line with consensus',
          'EPS: $2.40 (diluted), up 10% YoY',
          'Gross margin: 46.9% — record gross margin for any Apple quarter',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone revenue: $69.1B, up 1% YoY — driven by iPhone 16 Pro demand',
          'Services revenue: $26.3B, up 14% YoY — all-time record',
          'Mac: $9.0B; iPad: $8.1B; Wearables: $11.7B',
          'Greater China revenue declined 11% due to intensified local competition',
        ],
      },
      {
        heading: 'Management Commentary',
        bullets: [
          'Apple Intelligence launched in US English; 11 additional languages planned for April 2025',
          'Tim Cook: customer reception of iPhone 16 AI features "extremely positive"',
          'Installed base across all devices reaching all-time highs',
        ],
      },
      {
        heading: 'Capital Allocation',
        bullets: [
          'Total capital returned to shareholders in Q1: $30.0B',
          'Share repurchases: $26.0B; dividends: $4.0B',
          'Net cash position declined to $58B as buyback pace increased',
        ],
      },
    ],
    tags: ['Q1 2025', 'AAPL', 'iPhone 16', 'Apple Intelligence', 'Services', 'China'],
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'NVIDIA Corp. (NVDA-US), Q4 2026 Earnings Call Transcript',
    date: 'February 25, 2026, 5:00 PM ET',
    year: 2026,
    quarter: 'Q4',
    fileUrl: 'https://eipbe-central.digwork.tw.ent.tsmc.com/mtl-trx/pdf/1772229761407183',
    sections: [
      {
        heading: 'Revenue & EPS',
        bullets: [
          'Q4 FY2026 revenue: $39.3B, up 78% YoY — beat consensus of $38.1B',
          'EPS: $0.89 non-GAAP, above estimate of $0.85',
          'Gross margin: 73.5% (non-GAAP), reflecting Blackwell scale-up',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'Data Center: $35.6B, up 93% YoY — driven by H100 and Blackwell ramp',
          'Blackwell architecture: $11B revenue in Q4 alone',
          'Gaming: $2.5B, up 14% YoY; Automotive: $449M, up 103% YoY',
        ],
      },
      {
        heading: 'Management Commentary',
        bullets: [
          'Jensen Huang: demand for Blackwell significantly exceeds supply; ramping as fast as possible',
          'New GB300 (Blackwell Ultra) announced for H2 2026 with improved memory bandwidth',
          'Sovereign AI and enterprise adoption expanding globally',
          'US-China export restrictions impacted H20 sales; company diversifying customer base',
        ],
      },
      {
        heading: 'Guidance',
        bullets: [
          'Q1 FY2027 guidance: revenue ~$43B ± 2%',
          'Gross margin expected ~73% non-GAAP in Q1 FY2027',
          'R&D spend increasing to support next-gen Rubin architecture',
        ],
      },
    ],
    tags: ['Q4 FY2026', 'NVDA', 'Blackwell', 'Data Center', 'AI'],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function quarterNum(q: string): number {
  const n = parseInt(q.replace('Q', ''), 10);
  return isNaN(n) ? 0 : n;
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

// ── Sub-components ────────────────────────────────────────────────────────────

interface TranscriptListItemProps {
  card: IrTranscriptCard;
  isActive: boolean;
  keyword: string;
  onClick: () => void;
}

function TranscriptListItem({ card, isActive, keyword, onClick }: TranscriptListItemProps) {
  return (
    <button
      className={`cp-irt-list-item${isActive ? ' cp-irt-list-item--active' : ''}`}
      onClick={onClick}
    >
      <div className="cp-irt-list-item-title">{highlightText(card.title, keyword)}</div>
      <div className="cp-irt-list-item-meta">
        <span className="cp-irt-list-item-date">{card.date.split(',')[0]}</span>
        <div className="cp-irt-list-item-tags">
          <span className="cp-irt-period-tag cp-irt-period-tag--year">{card.year}</span>
          <span className="cp-irt-period-tag cp-irt-period-tag--qtr">{card.quarter}</span>
        </div>
      </div>
    </button>
  );
}

interface TranscriptDetailProps {
  card: IrTranscriptCard;
  keyword: string;
  expandedSections: Record<string, boolean>;
  onToggleSection: (key: string) => void;
}

function TranscriptDetail({ card, keyword, expandedSections, onToggleSection }: TranscriptDetailProps) {
  return (
    <article className="cp-pec-card cp-irt-card">
      {/* Header */}
      <div className="cp-pec-card-header">
        <div className="cp-pec-card-header-left">
          <span className="cp-pec-card-company cp-irt-badge">IR</span>
          <div>
            <div className="cp-pec-card-title">{highlightText(card.title, keyword)}</div>
            <div className="cp-pec-card-date">{card.date}</div>
          </div>
        </div>
        <div className="cp-irt-actions">
          <a
            href={card.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cp-irt-btn cp-irt-btn--primary"
            title="Download transcript"
          >
            <DownloadIcon />
            <span>Download</span>
          </a>
          <a
            href={card.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="cp-irt-btn cp-irt-btn--outline"
            title="Open source"
          >
            <ExternalLinkIcon />
            <span>Source</span>
          </a>
        </div>
      </div>

      {/* Transcript sections */}
      <div className="cp-irt-sections">
        {card.sections.map((section) => {
          const sectionKey = `${card.symbol}-${card.year}-${card.quarter}-${section.heading}`;
          const isExpanded = expandedSections[sectionKey] !== false;
          return (
            <div key={section.heading} className="cp-irt-section">
              <button
                className="cp-irt-section-toggle"
                onClick={() => onToggleSection(sectionKey)}
                aria-expanded={isExpanded}
              >
                <span className="cp-pec-section-heading" style={{ margin: 0 }}>{section.heading}</span>
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  width="12"
                  height="12"
                  style={{ transition: 'transform 0.15s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                  aria-hidden="true"
                >
                  <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isExpanded && (
                <ul className="cp-irt-bullet-list">
                  {section.bullets.map((bullet, i) => (
                    <li key={i} className="cp-irt-bullet-item">{highlightText(bullet, keyword)}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer tags */}
      <div className="cp-pec-card-footer">
        {card.tags.map((tag) => (
          <span key={tag} className="cp-pec-tag">{highlightText(tag, keyword)}</span>
        ))}
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function IRTranscriptTab({ symbol }: IRTranscriptTabProps) {
  const allCards = useMemo(
    () => IR_TRANSCRIPT_DATA.filter((c) => c.symbol === symbol),
    [symbol]
  );

  // Sort cards newest-first (by year desc, then quarter desc)
  const sortedCards = useMemo(
    () => [...allCards].sort((a, b) => b.year - a.year || quarterNum(b.quarter) - quarterNum(a.quarter)),
    [allCards]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce keyword for filtering (200ms)
  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedKeyword(value), 200);
  }, []);

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);

  // Build period options: unique years + year+qtr combos
  const periodOptions = useMemo(() => {
    const years = new Set<string>();
    const combos: string[] = [];
    sortedCards.forEach((c) => {
      years.add(String(c.year));
      combos.push(`${c.year}-${c.quarter}`);
    });
    const opts: { value: string; label: string }[] = [{ value: 'all', label: 'All Periods' }];
    years.forEach((y) => opts.push({ value: y, label: y }));
    combos.forEach((combo) => {
      const [y, q] = combo.split('-');
      opts.push({ value: combo, label: `${y} ${q}` });
    });
    return opts;
  }, [sortedCards]);

  // Filtered list — uses debouncedKeyword so heavy nested search runs less often
  const filteredCards = useMemo(() => {
    let list = sortedCards;
    if (periodFilter !== 'all') {
      if (periodFilter.includes('-')) {
        const [y, q] = periodFilter.split('-');
        list = list.filter((c) => String(c.year) === y && c.quarter === q);
      } else {
        list = list.filter((c) => String(c.year) === periodFilter);
      }
    }
    if (debouncedKeyword.trim()) {
      const kw = debouncedKeyword.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(kw) ||
          c.tags.some((t) => t.toLowerCase().includes(kw)) ||
          c.sections.some(
            (s) =>
              s.heading.toLowerCase().includes(kw) ||
              s.bullets.some((b) => b.toLowerCase().includes(kw))
          )
      );
    }
    return list;
  }, [sortedCards, periodFilter, debouncedKeyword]);

  // Resolve selected card — default to first in filtered list (latest)
  const activeCard = useMemo(() => {
    if (selectedId) {
      const found = filteredCards.find((c) => `${c.year}-${c.quarter}` === selectedId);
      if (found) return found;
    }
    return filteredCards[0] ?? null;
  }, [filteredCards, selectedId]);

  const handleSelectCard = useCallback((card: IrTranscriptCard) => {
    setSelectedId(`${card.year}-${card.quarter}`);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchRef.current?.focus();
  }, []);

  const handleToggleSection = useCallback((key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Reset selection when filter narrows list
  useEffect(() => {
    if (selectedId && !filteredCards.find((c) => `${c.year}-${c.quarter}` === selectedId)) {
      setSelectedId(null);
    }
  }, [filteredCards, selectedId]);

  if (allCards.length === 0) {
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
      {/* ── Left Panel: Search + List ── */}
      <aside className="cp-irt-panel-left">
        {/* Keyword Search */}
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

        {/* Period Filter */}
        <div className="cp-irt-filter-row">
          <span className="cp-irt-filter-label"><FilterIcon />Period</span>
          <select
            className="cp-irt-period-select"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            aria-label="Filter by period"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="cp-irt-list">
          {filteredCards.length === 0 ? (
            <div className="cp-irt-list-empty">No transcripts match your filter.</div>
          ) : (
            filteredCards.map((card) => (
              <TranscriptListItem
                key={`${card.year}-${card.quarter}`}
                card={card}
                isActive={activeCard?.year === card.year && activeCard?.quarter === card.quarter}
                keyword={keyword}
                onClick={() => handleSelectCard(card)}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Right Panel: Detail ── */}
      <div className="cp-irt-panel-right">
        {activeCard ? (
          <TranscriptDetail
            card={activeCard}
            keyword={keyword}
            expandedSections={expandedSections}
            onToggleSection={handleToggleSection}
          />
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
