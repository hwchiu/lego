'use client';

import { useState } from 'react';
import NoDataIcon from './NoDataIcon';

interface IRTranscriptTabProps {
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

interface IrTranscriptSection {
  heading: string;
  bullets: string[];
}

interface IrTranscriptCard {
  symbol: string;
  companyName: string;
  title: string;
  date: string;
  fileUrl: string;
  sections: IrTranscriptSection[];
  tags: string[];
}

const IR_TRANSCRIPT_DATA: IrTranscriptCard[] = [
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

export default function IRTranscriptTab({ symbol }: IRTranscriptTabProps) {
  const cards = IR_TRANSCRIPT_DATA.filter((c) => c.symbol === symbol);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  function toggleSection(key: string) {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  if (cards.length === 0) {
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
    <div className="cp-pec-wrap">
      {cards.map((card) => (
        <div key={`${card.symbol}-${card.title}`} className="cp-pec-center">
          <article className="cp-pec-card cp-irt-card">
            {/* Header */}
            <div className="cp-pec-card-header">
              <div className="cp-pec-card-header-left">
                <span className="cp-pec-card-company cp-irt-badge">IR</span>
                <div>
                  <div className="cp-pec-card-title">{card.title}</div>
                  <div className="cp-pec-card-date">{card.date}</div>
                </div>
              </div>
              <div className="cp-irt-actions">
                <a
                  href={card.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-pec-action-btn"
                  title="Download transcript"
                >
                  <DownloadIcon />
                  <span>Download</span>
                </a>
                <a
                  href={card.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cp-pec-action-btn cp-pec-action-btn--outline"
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
                const sectionKey = `${card.symbol}-${section.heading}`;
                const isExpanded = expandedSections[sectionKey] !== false; // default open
                return (
                  <div key={section.heading} className="cp-irt-section">
                    <button
                      className="cp-irt-section-toggle"
                      onClick={() => toggleSection(sectionKey)}
                      aria-expanded={isExpanded}
                    >
                      <span className="cp-pec-section-heading" style={{ margin: 0 }}>{section.heading}</span>
                      <svg
                        viewBox="0 0 14 14"
                        fill="none"
                        width="12"
                        height="12"
                        style={{ transition: 'transform 0.15s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        aria-hidden="true"
                      >
                        <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {isExpanded && (
                      <ul className="cp-irt-bullet-list">
                        {section.bullets.map((bullet, i) => (
                          <li key={i} className="cp-irt-bullet-item">{bullet}</li>
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
                <span key={tag} className="cp-pec-tag">{tag}</span>
              ))}
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
