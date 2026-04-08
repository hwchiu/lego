'use client';

import { useState } from 'react';

interface PreEarningCallTabProps {
  symbol: string;
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="15" height="15" aria-hidden="true">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path
        d="M6 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h8A1.5 1.5 0 0012 11.5V8M8 1h5v5M13 1L6.5 7.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface AiTranscriptBlock {
  heading: string;
  content: string;
}

interface AiTranscript {
  symbol: string;
  title: string;
  model: string;
  generatedAt: string;
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sentimentScore: number; // 0–100
  blocks: AiTranscriptBlock[];
  keyQuotes: string[];
  risks: string[];
}

const AI_TRANSCRIPT_DATA: AiTranscript[] = [
  {
    symbol: 'AAPL',
    title: 'AI Summary — Apple, Inc. (AAPL-US), Q1 2026 Earnings Call Transcript',
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
  },
  {
    symbol: 'NVDA',
    title: 'AI Summary — NVIDIA Corp. (NVDA-US), Q4 FY2026 Earnings Call Transcript',
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
          'Q1 FY2027 revenue guidance of ~$43B (±2%) came in above consensus of ~$41.5B, signaling supply constraints are gradually easing while demand remains unabated. Gross margin expected at ~73% non-GAAP, with operating leverage driving further EPS upside potential.',
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
  },
];

interface PecCard {
  symbol: string;
  companyName: string;
  title: string;
  date: string;
  fileUrl: string;
  sections: { heading: string; bullets: string[] }[];
  tags: string[];
}

const PEC_DATA: PecCard[] = [
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Q1 2026 Earnings Call Transcript',
    date: 'January 29, 2026, 5:00 PM ET',
    fileUrl: 'https://eipbe-central.digwork.tw.ent.tsmc.com/mtl-trx/pdf/1769810598219498',
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
          'CFO Luca Maestri guided Q2 2026 revenue at $88.5B–$91.5B',
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
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'NVIDIA Corp. (NVDA-US), Q4 2026 Earnings Call Transcript',
    date: 'February 25, 2026, 5:00 PM ET',
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

export default function PreEarningCallTab({ symbol }: PreEarningCallTabProps) {
  const cards = PEC_DATA.filter((c) => c.symbol === symbol);
  const aiTranscripts = AI_TRANSCRIPT_DATA.filter((a) => a.symbol === symbol);
  const [expandedQuotes, setExpandedQuotes] = useState(false);

  if (cards.length === 0) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <span className="cp-pec-empty-icon">📋</span>
          <p className="cp-pec-empty-text">No Pre-Earning Call summary available for {symbol}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-pec-wrap">
      {cards.map((card) => {
        const ai = aiTranscripts.find((a) => a.symbol === card.symbol);
        return (
          <div key={card.symbol} className="cp-pec-row">
            {/* ── Original PEC card ── */}
            <article className="cp-pec-card">
              <div className="cp-pec-card-header">
                <div className="cp-pec-card-header-left">
                  <span className="cp-pec-card-company">{card.symbol}</span>
                  <div>
                    <div className="cp-pec-card-title">{card.title}</div>
                    <div className="cp-pec-card-date">{card.date}</div>
                  </div>
                </div>
                <div className="cp-pec-card-actions">
                  <a
                    href={card.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-pec-card-action-btn"
                    aria-label="Download PDF"
                    title="Download PDF"
                  >
                    <DownloadIcon />
                  </a>
                  <a
                    href={card.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-pec-card-action-btn"
                    aria-label="Open in new tab"
                    title="Open in new tab"
                  >
                    <ExternalLinkIcon />
                  </a>
                </div>
              </div>

              <div className="cp-pec-card-body">
                {card.sections.map((section) => (
                  <div key={section.heading} className="cp-pec-section">
                    <div className="cp-pec-section-heading">{section.heading}</div>
                    <ul className="cp-pec-bullet-list">
                      {section.bullets.map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="cp-pec-card-footer">
                {card.tags.map((tag) => (
                  <span key={tag} className="cp-pec-tag">{tag}</span>
                ))}
              </div>
            </article>

            {/* ── AI Transcript card ── */}
            {ai && (
              <article className="cp-pec-card cp-pec-ai-card">
                {/* AI card header */}
                <div className="cp-pec-card-header">
                  <div className="cp-pec-card-header-left">
                    <span className="cp-pec-card-company cp-pec-ai-badge">AI</span>
                    <div>
                      <div className="cp-pec-card-title">{ai.title}</div>
                      <div className="cp-pec-card-date">
                        Generated {ai.generatedAt} · Model: {ai.model}
                      </div>
                    </div>
                  </div>
                  <div className="cp-pec-ai-sentiment">
                    <span className={`cp-pec-ai-sentiment-badge cp-pec-ai-sentiment--${ai.sentiment.toLowerCase()}`}>
                      {ai.sentiment}
                    </span>
                    <div className="cp-pec-ai-score-bar">
                      <div
                        className="cp-pec-ai-score-fill"
                        style={{ width: `${ai.sentimentScore}%` }}
                      />
                    </div>
                    <span className="cp-pec-ai-score-label">{ai.sentimentScore}/100</span>
                  </div>
                </div>

                {/* AI analysis blocks */}
                <div className="cp-pec-ai-body">
                  {ai.blocks.map((block) => (
                    <div key={block.heading} className="cp-pec-ai-block">
                      <div className="cp-pec-section-heading">{block.heading}</div>
                      <p className="cp-pec-ai-text">{block.content}</p>
                    </div>
                  ))}
                </div>

                {/* Key quotes */}
                <div className="cp-pec-ai-quotes-section">
                  <button
                    className="cp-pec-ai-quotes-toggle"
                    onClick={() => setExpandedQuotes((v) => !v)}
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
                      {ai.keyQuotes.map((q, i) => (
                        <li key={i} className="cp-pec-ai-quote-item">{q}</li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Risks */}
                <div className="cp-pec-ai-risks-section">
                  <div className="cp-pec-section-heading" style={{ marginBottom: 8 }}>Key Risks</div>
                  <ul className="cp-pec-ai-risk-list">
                    {ai.risks.map((r, i) => (
                      <li key={i} className="cp-pec-ai-risk-item">{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="cp-pec-card-footer">
                  <span className="cp-pec-tag cp-pec-ai-tag">AI-Generated</span>
                  <span className="cp-pec-tag cp-pec-ai-tag">{ai.model}</span>
                  <span className="cp-pec-tag">{card.symbol}</span>
                </div>
              </article>
            )}
          </div>
        );
      })}
    </div>
  );
}
