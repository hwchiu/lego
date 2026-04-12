'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';

interface AITranscriptTabProps {
  symbol: string;
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

// ── Types ─────────────────────────────────────────────────────────────────────

interface AiTranscriptBlock {
  heading: string;
  content: string;
}

interface AiTranscript {
  symbol: string;
  companyName: string;
  title: string;
  date: string;
  year: number;
  quarter: string;
  model: string;
  generatedAt: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sentimentScore: number;
  blocks: AiTranscriptBlock[];
  keyQuotes: string[];
  risks: string[];
  tags: string[];
}

const AI_TRANSCRIPT_DATA: AiTranscript[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'AI Analysis — Apple, Inc. (AAPL-US), Q1 2026 Earnings Call',
    date: 'January 29, 2026, 5:00 PM ET',
    year: 2026,
    quarter: 'Q1',
    model: 'GPT-4o',
    generatedAt: 'January 29, 2026',
    sentiment: 'Bullish',
    sentimentScore: 72,
    blocks: [
      {
        heading: 'Overall Tone',
        content:
          'Management tone was confident and forward-looking. Tim Cook emphasized the transformative role of Apple Intelligence across its product lineup, while CFO Luca Maestri delivered reassuring guidance. The call struck an optimistic note despite near-term China headwinds.',
      },
      {
        heading: 'Key Financial Highlights',
        content:
          'Apple posted record Q1 revenue of $124.3B (+4% YoY) and a record gross margin of 46.9%, underscoring Services momentum. EPS of $2.40 beat consensus by $0.05. The Services segment reached an all-time high of $26.3B (+14% YoY), reinforcing the platform flywheel thesis.',
      },
      {
        heading: 'AI & Product Strategy',
        content:
          'Apple Intelligence was cited as a key driver of iPhone upgrade cycles, with Cook noting strong early adoption in supported regions. Vision Pro ecosystem development is progressing, with developer interest described as "extremely high." The company hinted at deeper on-device AI integration in upcoming iOS 20.',
      },
      {
        heading: 'Geopolitical & Macro Risks',
        content:
          'Greater China revenue declined 11% YoY to $18.5B, reflecting intensifying local competition from Huawei and broader macro softness. Management acknowledged the challenge but expressed confidence in brand loyalty and upcoming AI-enabled product refreshes to re-accelerate the region.',
      },
      {
        heading: 'Q2 2026 Outlook',
        content:
          'Guidance of $88.5B–$91.5B for Q2 2026 was slightly below the high end of Street expectations, suggesting moderated iPhone demand post-holiday season. Gross margin guided at 46.5%–47.5%, implying Services mix tailwind persists.',
      },
    ],
    keyQuotes: [
      '"Apple Intelligence is creating a new era of personal computing." — Tim Cook',
      '"Our Services business is firing on all cylinders — every metric is at a record." — Luca Maestri',
      '"We continue to invest aggressively because we see a multiyear AI supercycle ahead." — Tim Cook',
    ],
    risks: [
      'China revenue under structural pressure from local competition',
      'Regulatory scrutiny on App Store fees in EU and US',
      'Vision Pro ramp slower than original internal targets',
    ],
    tags: ['Q1 2026', 'AAPL', 'Earnings Call', 'Apple Intelligence', 'Services'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'AI Analysis — Apple, Inc. (AAPL-US), Q4 2025 Earnings Call',
    date: 'October 30, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q4',
    model: 'GPT-4o',
    generatedAt: 'October 30, 2025',
    sentiment: 'Bullish',
    sentimentScore: 68,
    blocks: [
      {
        heading: 'Overall Tone',
        content:
          'Management struck an upbeat tone with iPhone 17 launch demand exceeding expectations. Tim Cook expressed confidence in the recovery trajectory for Greater China and highlighted the growing Services ecosystem as a durable revenue engine.',
      },
      {
        heading: 'Key Financial Highlights',
        content:
          'Q4 FY2025 revenue reached $94.9B (+6% YoY), beating consensus of $94.5B. Diluted EPS of $1.64 grew 12% YoY. Gross margin of 46.2% was the highest ever for a September quarter, driven by favorable Services mix.',
      },
      {
        heading: 'AI & Product Strategy',
        content:
          'iPhone 17 demand outpaced supply in multiple regions, with Pro models driving the strongest upgrade pull. Apple Intelligence rollout gained momentum with new language support. Services crossed 1B+ paid subscriptions, reinforcing ecosystem stickiness.',
      },
      {
        heading: 'Geopolitical & Macro Risks',
        content:
          'Greater China revenue showed early recovery at $15.0B (+2% YoY), though the base remains fragile amid ongoing competition from domestic handset makers. Management guided cautiously on macro uncertainty heading into calendar 2026.',
      },
      {
        heading: 'Q1 FY2026 Outlook',
        content:
          'Revenue guidance of $119B–$123B implies low single-digit YoY growth, conservative relative to Street models. Gross margin guidance of 46.5%–47.0% signals continued Services tailwind. Operating expenses guided at $15.3B–$15.5B.',
      },
    ],
    keyQuotes: [
      '"iPhone 17 demand has been exceptional — Pro models are in short supply globally." — Tim Cook',
      '"Services is now a $100B annual run-rate business and still growing double digits." — CFO',
      '"Apple Intelligence is the most significant software feature in our history." — Tim Cook',
    ],
    risks: [
      'iPhone 17 supply constraints limiting near-term revenue capture',
      'China recovery fragile — geopolitical risk remains elevated',
      'Wearables segment showing signs of saturation',
    ],
    tags: ['Q4 2025', 'AAPL', 'iPhone 17', 'Services', 'Apple Intelligence'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'AI Analysis — Apple, Inc. (AAPL-US), Q3 2025 Earnings Call',
    date: 'July 31, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q3',
    model: 'GPT-4o',
    generatedAt: 'July 31, 2025',
    sentiment: 'Neutral',
    sentimentScore: 58,
    blocks: [
      {
        heading: 'Overall Tone',
        content:
          'The tone was measured and steady, with management focused on the Services growth story and the mid-cycle iPhone performance. Cook was notably enthusiastic about the new M4 iPad Pro and its contribution to the overall ecosystem.',
      },
      {
        heading: 'Key Financial Highlights',
        content:
          'Q3 FY2025 revenue of $85.8B (+5% YoY) aligned with expectations. Diluted EPS of $1.45 grew 11% YoY. Gross margin of 46.3% expanded 100 bps YoY on the back of rising Services contribution.',
      },
      {
        heading: 'AI & Product Strategy',
        content:
          "Apple Intelligence expanded language support to 12 languages, accelerating global rollout. The M4 iPad Pro drove a 24% iPad revenue surge, demonstrating Apple Silicon's halo effect. The App Store ecosystem generated $1.1T in developer billings in 2024.",
      },
      {
        heading: 'Geopolitical & Macro Risks',
        content:
          'No significant China commentary this quarter — management sidestepped direct questions on Greater China trajectory. Macro headwinds in Europe cited as a modest demand dampener for iPhone.',
      },
      {
        heading: 'Q4 FY2025 Outlook',
        content:
          'Revenue guidance of $89B–$93B incorporates iPhone 17 launch seasonality. Gross margin guided at 45.5%–46.5%, with a potential dip on iPhone launch costs. iPhone 17 launch is the key Q4 catalyst to watch.',
      },
    ],
    keyQuotes: [
      '"The M4 iPad Pro is the most capable device we have ever made." — Tim Cook',
      '"Apple Intelligence is rolling out globally — we are just getting started." — Tim Cook',
      '"Services approaching a $100B annual run-rate is a testament to our ecosystem." — CFO',
    ],
    risks: [
      'iPhone revenue flat YoY — upgrade cycle maturation risk',
      'Vision Pro adoption slower than initial projections',
      'Regulatory pressure on App Store business model intensifying in EU',
    ],
    tags: ['Q3 2025', 'AAPL', 'Services', 'iPad Pro', 'Apple Intelligence'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'AI Analysis — Apple, Inc. (AAPL-US), Q2 2025 Earnings Call',
    date: 'May 1, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q2',
    model: 'GPT-4o',
    generatedAt: 'May 1, 2025',
    sentiment: 'Bullish',
    sentimentScore: 65,
    blocks: [
      {
        heading: 'Overall Tone',
        content:
          "Management projected resilience amid tariff concerns, with Cook emphasizing supply chain diversification into India and Vietnam as a structural hedge. The Services record provided a positive anchor to an otherwise mixed macro narrative.",
      },
      {
        heading: 'Key Financial Highlights',
        content:
          'Q2 FY2025 revenue of $95.4B (+5% YoY) beat Street estimate of $94.1B. Diluted EPS of $1.65 grew 8% YoY. Gross margin of 47.1% set a record for a March quarter, as Services mix diluted hardware cost pressure.',
      },
      {
        heading: 'AI & Product Strategy',
        content:
          'Services reached an all-time record of $26.6B (+12% YoY), with paid subscriptions now exceeding 1.1B globally. The M4 iPad launch drove a 15% iPad revenue surge. AI features are being integrated across all major product lines in upcoming OS updates.',
      },
      {
        heading: 'Geopolitical & Macro Risks',
        content:
          'Greater China revenue declined 2% YoY to $16.0B, showing sequential improvement. Tariff exposure was a key topic — management guided that supply chain diversification to India and Vietnam will reduce exposure by 2026.',
      },
      {
        heading: 'Q3 FY2025 Outlook',
        content:
          'Revenue guidance of $84B–$88B implies low-to-mid single-digit growth, conservative relative to buyside models. Gross margin guided at 45.5%–46.5%. Supply chain costs from diversification will be a near-term margin headwind.',
      },
    ],
    keyQuotes: [
      '"We are actively diversifying our supply chain — India and Vietnam are key pillars." — Tim Cook',
      '"Services crossed 1.1 billion paid subscriptions — a new milestone for Apple." — Tim Cook',
      '"Tariffs are a real dynamic, but we are managing them aggressively." — CFO',
    ],
    risks: [
      'Tariff exposure if US-China trade tensions escalate further',
      'China revenue recovery pace uncertain amid competition',
      'Supply chain diversification costs compressing near-term margins',
    ],
    tags: ['Q2 2025', 'AAPL', 'Services', 'Supply Chain', 'Tariff', 'India'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'AI Analysis — Apple, Inc. (AAPL-US), Q1 2025 Earnings Call',
    date: 'January 30, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q1',
    model: 'GPT-4o',
    generatedAt: 'January 30, 2025',
    sentiment: 'Bullish',
    sentimentScore: 70,
    blocks: [
      {
        heading: 'Overall Tone',
        content:
          "Management projected confidence on the back of record-breaking financials and the initial launch of Apple Intelligence. Tim Cook's enthusiasm around the AI-driven upgrade cycle was palpable, even as China headwinds remained a recurring concern.",
      },
      {
        heading: 'Key Financial Highlights',
        content:
          'Q1 FY2025 revenue of $124.3B (+4% YoY) matched consensus. Diluted EPS of $2.40 grew 10% YoY. Gross margin of 46.9% was an all-time record for any Apple quarter, driven by Services mix and iPhone 16 Pro ASP uplift.',
      },
      {
        heading: 'AI & Product Strategy',
        content:
          'Apple Intelligence launched in US English, with 11 additional languages planned for April 2025. Customer reception of iPhone 16 AI features was described as "extremely positive." Installed base across all devices hit all-time highs, broadening the addressable upgrade pool.',
      },
      {
        heading: 'Geopolitical & Macro Risks',
        content:
          'Greater China revenue declined 11% YoY — the most significant regional drag. Local competition from Huawei and broader macro softness were cited. Management remains confident in brand loyalty and upcoming AI refreshes to stabilize the region.',
      },
      {
        heading: 'Q2 FY2025 Outlook',
        content:
          'Q2 FY2025 guidance implied low single-digit YoY revenue growth with stable gross margins. Capital return remained robust: $30.0B returned in Q1, with a $26.0B buyback component reflecting strong free cash flow generation.',
      },
    ],
    keyQuotes: [
      '"Apple Intelligence is the beginning of a new chapter for iPhone." — Tim Cook',
      '"Our installed base is at all-time highs — the upgrade opportunity ahead is enormous." — Tim Cook',
      '"We returned $30 billion to shareholders this quarter alone." — CFO',
    ],
    risks: [
      'China revenue decline 11% YoY — structural competitive pressure',
      'Apple Intelligence limited to US English at launch — global rollout pace uncertain',
      'Regulatory overhang on App Store and financial services in multiple jurisdictions',
    ],
    tags: ['Q1 2025', 'AAPL', 'iPhone 16', 'Apple Intelligence', 'Services', 'China'],
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'AI Analysis — NVIDIA Corp. (NVDA-US), Q4 FY2026 Earnings Call',
    date: 'February 25, 2026, 5:00 PM ET',
    year: 2026,
    quarter: 'Q4',
    model: 'GPT-4o',
    generatedAt: 'February 25, 2026',
    sentiment: 'Bullish',
    sentimentScore: 88,
    blocks: [
      {
        heading: 'Overall Tone',
        content:
          'Jensen Huang delivered one of the most emphatic earnings calls in recent memory, declaring that demand for Blackwell "far exceeds our ability to supply." The tone was highly bullish, with management framing NVIDIA as the foundational infrastructure layer for the global AI build-out.',
      },
      {
        heading: 'Key Financial Highlights',
        content:
          'Q4 FY2026 revenue hit $39.3B (+78% YoY), beating consensus of $38.1B. Non-GAAP EPS of $0.89 surpassed estimates of $0.85. Gross margin of 73.5% (non-GAAP) was slightly above guidance, reflecting early Blackwell scale efficiencies. Data Center alone contributed $35.6B — up 93% YoY.',
      },
      {
        heading: 'Blackwell Architecture Ramp',
        content:
          'Blackwell generated $11B in its first full quarter of production, making it the fastest product ramp in NVIDIA history. Management indicated GB200 NVL72 racks are fully sold out through at least mid-2026. The upcoming GB300 (Blackwell Ultra) with higher memory bandwidth is on track for H2 2026.',
      },
      {
        heading: 'Sovereign AI & Enterprise',
        content:
          'Jensen highlighted Sovereign AI as a new structural growth pillar — governments in Europe, Middle East, and Asia are building national AI infrastructure on NVIDIA platforms. Enterprise AI deployment accelerated, with CSP capex continuing to surprise to the upside.',
      },
      {
        heading: 'FY2027 Q1 Guidance',
        content:
          'Q1 FY2027 revenue guidance of ~$43B (+/-2%) came in above consensus of ~$41.5B, signaling supply constraints are gradually easing while demand remains unabated. Gross margin expected at ~73% non-GAAP, with operating leverage driving further EPS upside potential.',
      },
    ],
    keyQuotes: [
      '"The demand for Blackwell is incredible — every major cloud, every enterprise wants it now." — Jensen Huang',
      '"We are not just a chip company. We are the AI infrastructure company." — Jensen Huang',
      '"Sovereign AI is real — nations are building their own intelligence infrastructure." — Jensen Huang',
    ],
    risks: [
      'US-China export restrictions limiting H20 and future China-market chip sales',
      'Supply chain constraints capping near-term revenue realization',
      'Potential competitive pressure from AMD MI300X+ and custom CSP ASICs',
      'Concentration risk: ~90% of revenue from Data Center segment',
    ],
    tags: ['Q4 FY2026', 'NVDA', 'Blackwell', 'Data Center', 'AI'],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseQuarterNumber(q: string): number {
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

interface AiListItemProps {
  card: AiTranscript;
  isActive: boolean;
  keyword: string;
  onClick: () => void;
}

function AiListItem({ card, isActive, keyword, onClick }: AiListItemProps) {
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

interface AiTranscriptDetailProps {
  card: AiTranscript;
  keyword: string;
  expandedQuotes: boolean;
  onToggleQuotes: () => void;
}

function AiTranscriptDetail({ card, keyword, expandedQuotes, onToggleQuotes }: AiTranscriptDetailProps) {
  return (
    <article className="cp-pec-card cp-pec-ai-card">
      {/* Header */}
      <div className="cp-pec-card-header">
        <div className="cp-pec-card-header-left">
          <span className="cp-pec-card-company cp-pec-ai-badge">AI</span>
          <div>
            <div className="cp-pec-card-title">{highlightText(card.title, keyword)}</div>
            <div className="cp-pec-card-date">
              Generated {card.generatedAt} · Model: {card.model}
            </div>
          </div>
        </div>
        <div className="cp-pec-ai-sentiment">
          <span className={`cp-pec-ai-sentiment-badge cp-pec-ai-sentiment--${card.sentiment.toLowerCase()}`}>
            {card.sentiment}
          </span>
          <div className="cp-pec-ai-score-bar">
            <div
              className="cp-pec-ai-score-fill"
              style={{ width: `${card.sentimentScore}%` }}
            />
          </div>
          <span className="cp-pec-ai-score-label">{card.sentimentScore}/100</span>
        </div>
        <div className="cp-pec-card-actions">
          <button className="cp-pec-card-action-btn" title="Download PDF" aria-label="Download PDF">
            <DownloadIcon />
          </button>
        </div>
      </div>

      {/* AI analysis blocks */}
      <div className="cp-pec-ai-body">
        {card.blocks.map((block) => (
          <div key={block.heading} className="cp-pec-ai-block">
            <div className="cp-pec-section-heading">{highlightText(block.heading, keyword)}</div>
            <p className="cp-pec-ai-text">{highlightText(block.content, keyword)}</p>
          </div>
        ))}
      </div>

      {/* Key quotes */}
      <div className="cp-pec-ai-quotes-section">
        <button
          className="cp-pec-ai-quotes-toggle"
          onClick={onToggleQuotes}
          aria-expanded={expandedQuotes}
        >
          <span className="cp-pec-section-heading" style={{ margin: 0 }}>Key Quotes</span>
          <svg
            viewBox="0 0 14 14"
            fill="none"
            width="12"
            height="12"
            style={{ transition: 'transform 0.15s', transform: expandedQuotes ? 'rotate(180deg)' : 'rotate(0deg)' }}
            aria-hidden="true"
          >
            <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {expandedQuotes && (
          <ul className="cp-pec-ai-quote-list">
            {card.keyQuotes.map((q, i) => (
              <li key={i} className="cp-pec-ai-quote-item">{highlightText(q, keyword)}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Risks */}
      <div className="cp-pec-ai-risks-section">
        <div className="cp-pec-section-heading" style={{ marginBottom: 8 }}>Key Risks</div>
        <ul className="cp-pec-ai-risk-list">
          {card.risks.map((r, i) => (
            <li key={i} className="cp-pec-ai-risk-item">{highlightText(r, keyword)}</li>
          ))}
        </ul>
      </div>

      {/* Footer tags */}
      <div className="cp-pec-card-footer">
        <span className="cp-pec-tag cp-pec-ai-tag">AI-Generated</span>
        <span className="cp-pec-tag cp-pec-ai-tag">{card.model}</span>
        {card.tags.map((tag) => (
          <span key={tag} className="cp-pec-tag">{highlightText(tag, keyword)}</span>
        ))}
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AITranscriptTab({ symbol }: AITranscriptTabProps) {
  const allCards = useMemo(
    () => AI_TRANSCRIPT_DATA.filter((c) => c.symbol === symbol),
    [symbol]
  );

  const sortedCards = useMemo(
    () => [...allCards].sort((a, b) => b.year - a.year || parseQuarterNumber(b.quarter) - parseQuarterNumber(a.quarter)),
    [allCards]
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [qtrFilter, setQtrFilter] = useState('all');
  const [expandedQuotes, setExpandedQuotes] = useState(false);
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
    const years = [...new Set(sortedCards.map((c) => String(c.year)))];
    return [{ value: 'all', label: 'All Years' }, ...years.map((y) => ({ value: y, label: y }))];
  }, [sortedCards]);

  const qtrOptions = useMemo(() => {
    const qtrs = [...new Set(sortedCards.map((c) => c.quarter))].sort(
      (a, b) => parseQuarterNumber(a) - parseQuarterNumber(b)
    );
    return [{ value: 'all', label: 'All Qtrs' }, ...qtrs.map((q) => ({ value: q, label: q }))];
  }, [sortedCards]);

  const filteredCards = useMemo(() => {
    let list = sortedCards;
    if (yearFilter !== 'all') {
      list = list.filter((c) => String(c.year) === yearFilter);
    }
    if (qtrFilter !== 'all') {
      list = list.filter((c) => c.quarter === qtrFilter);
    }
    if (debouncedKeyword.trim()) {
      const kw = debouncedKeyword.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(kw) ||
          c.tags.some((t) => t.toLowerCase().includes(kw)) ||
          c.blocks.some(
            (b) =>
              b.heading.toLowerCase().includes(kw) ||
              b.content.toLowerCase().includes(kw)
          ) ||
          c.keyQuotes.some((q) => q.toLowerCase().includes(kw)) ||
          c.risks.some((r) => r.toLowerCase().includes(kw))
      );
    }
    return list;
  }, [sortedCards, yearFilter, qtrFilter, debouncedKeyword]);

  const activeCard = useMemo(() => {
    if (selectedId) {
      const found = filteredCards.find((c) => `${c.year}-${c.quarter}` === selectedId);
      if (found) return found;
    }
    return filteredCards[0] ?? null;
  }, [filteredCards, selectedId]);

  const handleSelectCard = useCallback((card: AiTranscript) => {
    setSelectedId(`${card.year}-${card.quarter}`);
    setExpandedQuotes(false);
  }, []);

  const handleClearSearch = useCallback(() => {
    setKeyword('');
    setDebouncedKeyword('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchRef.current?.focus();
  }, []);

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
          {filteredCards.length === 0 ? (
            <div className="cp-irt-list-empty">No AI analyses match your filter.</div>
          ) : (
            filteredCards.map((card) => (
              <AiListItem
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

      {/* Right Panel: Detail */}
      <div className="cp-irt-panel-right">
        {activeCard ? (
          <AiTranscriptDetail
            card={activeCard}
            keyword={keyword}
            expandedQuotes={expandedQuotes}
            onToggleQuotes={() => setExpandedQuotes((v) => !v)}
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
