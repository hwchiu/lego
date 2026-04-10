'use client';

import { useState } from 'react';

interface AITranscriptTabProps {
  symbol: string;
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
    title: 'AI Analysis — Apple, Inc. (AAPL-US), Q1 2026 Earnings Call Transcript',
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
    title: 'AI Analysis — NVIDIA Corp. (NVDA-US), Q4 FY2026 Earnings Call Transcript',
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

export default function AITranscriptTab({ symbol }: AITranscriptTabProps) {
  const aiTranscripts = AI_TRANSCRIPT_DATA.filter((a) => a.symbol === symbol);
  const [expandedQuotes, setExpandedQuotes] = useState(false);

  if (aiTranscripts.length === 0) {
    return (
      <div className="cp-pec-wrap">
        <div className="cp-pec-empty">
          <span className="cp-pec-empty-icon">🤖</span>
          <p className="cp-pec-empty-text">No AI Transcript analysis available for {symbol}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-pec-wrap">
      {aiTranscripts.map((ai) => (
        <div key={ai.symbol} className="cp-pec-center">
          {/* ── AI Transcript card ── */}
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
              <span className="cp-pec-tag">{ai.symbol}</span>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
