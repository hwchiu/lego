'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import NoDataIcon from './NoDataIcon';

interface PreEarningCallTabProps {
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


// ── Types ─────────────────────────────────────────────────────────────────────

interface PecSection {
  heading: string;
  bullets: string[];
}

interface PecRecord {
  symbol: string;
  companyName: string;
  title: string;
  date: string;
  year: number;
  quarter: string;
  sections: PecSection[];
  tags: string[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PRE_EARNING_CALL_DATA: PecRecord[] = [
  // ── NVDA ──────────────────────────────────────────────────────────────────
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'NVIDIA Corp. (NVDA-US), Fiscal Q2 FY2026 Earnings Results',
    date: 'August 27, 2025, 5:00 PM ET',
    year: 2026,
    quarter: 'Q2',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $46.7B (increased 6% QoQ, increased 56% YoY) — record quarter',
          'Gross margin was 72.4% GAAP, compared to 60.5% in the prior-year quarter',
          'Net income was $26.4B (increased 59% from $16.6B in the year-ago quarter)',
          'Non-GAAP EPS: $0.68, beating consensus estimate of $0.64',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'Data Center: $41.1B (increased 5% QoQ, +154% YoY) — driven by Blackwell ramp',
          'Gaming: $4.3B (increased 14% QoQ) — boosted by GeForce RTX 50 series',
          'Professional Visualization: $601M (increased 18% QoQ)',
          'Automotive: $586M (increased 3% QoQ)',
          'OEM & Other: $88M',
        ],
      },
      {
        heading: 'Profitability & Balance Sheet',
        bullets: [
          'Operating income: $29.7B GAAP; operating margin: 63.6%',
          'Free cash flow: $26.8B for the quarter',
          'Cash & equivalents: $53.7B on balance sheet',
          'Share repurchases: $7.0B returned to shareholders in Q2',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q3 FY2026 revenue guidance: ~$54.0B (±2%), up ~16% QoQ — above consensus of $52.0B',
          'Q3 FY2026 gross margin guidance: ~74.6% non-GAAP',
          'After-hours stock moved +1.4% to ~$125.50 before paring gains',
          'Key catalyst: Blackwell GB200 NVL72 racks fully allocated through Q4 FY2026',
        ],
      },
    ],
    tags: ['Q2 FY2026', 'NVDA', 'Blackwell', 'Data Center', 'Record Revenue'],
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'NVIDIA Corp. (NVDA-US), Fiscal Q4 FY2025 Earnings Results',
    date: 'February 26, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q4',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $39.3B (increased 12% QoQ, increased 78% YoY) — record quarter',
          'Gross margin was 73.0% GAAP (73.5% non-GAAP)',
          'Net income was $22.1B (increased 80% YoY)',
          'Non-GAAP EPS: $0.89, beating estimate of $0.85',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'Data Center: $35.6B (+93% YoY) — Blackwell architecture generated $11B in first full quarter',
          'Gaming: $2.5B (+14% YoY) — GeForce RTX 50 series launch demand strong',
          'Professional Visualization: $511M (+10% YoY)',
          'Automotive: $449M (+103% YoY) — DRIVE Thor ramp accelerating',
          'OEM & Other: $105M',
        ],
      },
      {
        heading: 'Profitability & Balance Sheet',
        bullets: [
          'Operating income: $23.5B GAAP; operating margin: 59.8%',
          'Free cash flow: $19.3B for the quarter',
          'Cash & equivalents: $43.2B on balance sheet',
          'Share repurchases: $8.0B; dividend raised to $0.01/share (post-split)',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q1 FY2026 revenue guidance: ~$43.0B (±2%), signaling continued strong demand',
          'Q1 FY2026 gross margin guidance: ~73.5% non-GAAP',
          'After-hours stock rose +4.2% to ~$133.80 before settling +1.8%',
          'GB300 (Blackwell Ultra) with higher HBM bandwidth on track for H2 CY2025',
        ],
      },
    ],
    tags: ['Q4 FY2025', 'NVDA', 'Blackwell', 'Data Center', 'Automotive'],
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'NVIDIA Corp. (NVDA-US), Fiscal Q2 FY2025 Earnings Results',
    date: 'August 28, 2024, 5:00 PM ET',
    year: 2025,
    quarter: 'Q2',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $30.0B (increased 15% QoQ, increased 122% YoY) — record quarter',
          'Gross margin was 75.0% GAAP (75.7% non-GAAP)',
          'Net income was $16.6B (increased 168% YoY from $6.2B)',
          'Non-GAAP EPS: $0.68, beating estimate of $0.65',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'Data Center: $26.3B (+16% QoQ, +154% YoY) — H100/H200 demand continuing',
          'Gaming: $2.9B (+9% QoQ) — seasonal pickup from desktop discrete GPUs',
          'Professional Visualization: $454M (+20% QoQ)',
          'Automotive: $346M (+5% QoQ)',
          'OEM & Other: $88M',
        ],
      },
      {
        heading: 'Profitability & Balance Sheet',
        bullets: [
          'Operating income: $18.6B GAAP; operating margin: 62.0%',
          'Free cash flow: $14.5B for the quarter',
          'Cash & equivalents: $34.8B on balance sheet',
          'Share repurchases: $7.5B in the quarter; $50B buyback authorized',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q3 FY2025 revenue guidance: ~$32.5B (±2%), continued demand above expectations',
          'Q3 FY2025 gross margin guidance: ~74.6% non-GAAP',
          'After-hours stock initially surged +7.2% before settling +2.5%',
          'Blackwell (GB200) production ramp on track for Q4 FY2025; limited early supply',
        ],
      },
    ],
    tags: ['Q2 FY2025', 'NVDA', 'H100', 'Data Center', 'AI Infrastructure'],
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'NVIDIA Corp. (NVDA-US), Fiscal Q4 FY2024 Earnings Results',
    date: 'February 21, 2024, 5:00 PM ET',
    year: 2024,
    quarter: 'Q4',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $22.1B (increased 22% QoQ, increased 265% YoY) — record quarter',
          'Gross margin was 76.7% GAAP — record full-year gross margin of 72.7%',
          'Net income was $12.3B (increased 769% YoY)',
          'Non-GAAP EPS: $5.16 (pre-split), beating estimate of $4.59',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'Data Center: $18.4B (+5% QoQ, +409% YoY) — H100 Hopper demand unabated',
          'Gaming: $2.9B (+56% QoQ) — Ada Lovelace RTX 40 refresh driving upgrades',
          'Professional Visualization: $463M (+11% QoQ)',
          'Automotive: $281M (+8% QoQ)',
          'OEM & Other: $90M',
        ],
      },
      {
        heading: 'Profitability & Balance Sheet',
        bullets: [
          'Operating income: $13.6B GAAP; operating margin: 61.5%',
          'Free cash flow: $11.5B for the quarter',
          'Cash & equivalents: $25.9B on balance sheet',
          'Share repurchases: $9.5B for FY2024; 10-for-1 stock split announced',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q1 FY2025 revenue guidance: ~$24.0B (±2%), sustaining triple-digit YoY growth',
          'Q1 FY2025 gross margin guidance: ~77% non-GAAP',
          'After-hours stock surged +16.4% to ~$674 (pre-split) on record beat',
          'Blackwell architecture (next-gen) formally introduced at GTC 2024',
        ],
      },
    ],
    tags: ['Q4 FY2024', 'NVDA', 'Hopper', 'Data Center', 'Record Beat'],
  },
  {
    symbol: 'NVDA',
    companyName: 'NVIDIA Corp.',
    title: 'NVIDIA Corp. (NVDA-US), Fiscal Q2 FY2024 Earnings Results',
    date: 'August 23, 2023, 5:00 PM ET',
    year: 2024,
    quarter: 'Q2',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $13.5B (increased 88% QoQ, increased 101% YoY) — record quarter',
          'Gross margin was 70.1% GAAP vs 43.5% in the year-ago quarter',
          'Net income was $6.2B (increased 843% YoY from $656M)',
          'Non-GAAP EPS: $2.70 (pre-split), well above estimate of $2.09',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'Data Center: $10.3B (+141% QoQ) — H100 shipped at scale for first time; first >$10B quarter',
          'Gaming: $2.5B (+11% QoQ) — gradual recovery from inventory correction',
          'Professional Visualization: $379M (+28% QoQ)',
          'Automotive: $253M (+15% QoQ)',
          'OEM & Other: $66M',
        ],
      },
      {
        heading: 'Profitability & Balance Sheet',
        bullets: [
          'Operating income: $6.8B GAAP; operating margin: 50.4%',
          'Free cash flow: $6.3B — significant leap YoY',
          'Cash & equivalents: $16.0B on balance sheet',
          'Share repurchases: $3.4B in the quarter',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q3 FY2024 revenue guidance: ~$16.0B (±2%), implying sustained AI capex demand',
          'Q3 FY2024 gross margin guidance: ~71.5% non-GAAP',
          'After-hours stock rose +8.5% to ~$502 (pre-split) on massive beat',
          'H100/A100 allocation backlogs estimated at 6–9 months across hyperscalers',
        ],
      },
    ],
    tags: ['Q2 FY2024', 'NVDA', 'H100', 'Data Center', 'AI Supercycle'],
  },

  // ── AAPL ──────────────────────────────────────────────────────────────────
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Fiscal Q1 FY2026 Earnings Results',
    date: 'January 29, 2026, 5:00 PM ET',
    year: 2026,
    quarter: 'Q1',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $124.3B (increased 4% YoY) — record for the quarter',
          'Gross margin was 46.9% GAAP — all-time record for Apple',
          'Net income was $36.3B (increased 10% YoY); diluted EPS $2.40 (+10% YoY)',
          'EPS beat consensus estimate of $2.35 by $0.05',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone: $69.1B (in line with expectations); Apple Intelligence driving upgrade interest',
          'Services: $26.3B (+14% YoY) — all-time record; >1B paid subscriptions',
          'Mac: $9.0B (+15% YoY) — M4 family driving strong commercial refresh',
          'iPad: $8.1B (+7% YoY)',
          'Wearables, Home & Accessories: $11.7B (+3% YoY)',
          'Greater China: $18.5B (-11% YoY) — Huawei competition remains headwind',
        ],
      },
      {
        heading: 'Profitability & Capital Return',
        bullets: [
          'Operating income: $41.8B GAAP; operating margin: 33.6%',
          'Free cash flow: $30.0B for the quarter',
          'Total capital returned: $30.0B ($26.0B buybacks + $3.9B dividends)',
          'Quarterly dividend: $0.25/share',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q2 FY2026 revenue guidance: $88.5B–$91.5B (low single-digit YoY growth)',
          'Q2 FY2026 gross margin guidance: 46.5%–47.5%',
          'After-hours stock declined -0.8% on greater-than-expected China weakness',
          'Apple Intelligence expansion to additional languages seen as mid-term catalyst',
        ],
      },
    ],
    tags: ['Q1 FY2026', 'AAPL', 'Apple Intelligence', 'Services Record', 'China'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Fiscal Q4 FY2025 Earnings Results',
    date: 'October 30, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q4',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $94.9B (increased 6% YoY) — record for the September quarter',
          'Gross margin was 46.2% GAAP — highest ever for a Q4 September quarter',
          'Net income was $24.7B (increased 8% YoY); diluted EPS $1.64 (+12% YoY)',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone: $46.2B (+5% YoY) — iPhone 17 demand exceeded initial supply',
          'Services: $25.0B (+12% YoY) — record; crossed 1B+ paid subscriptions milestone',
          'Mac: $7.7B (+1% YoY) — M4 Mac mini and MacBook Pro refresh cycle continuing',
          'iPad: $7.0B (-2% YoY) — post-refresh digestion phase',
          'Wearables, Home & Accessories: $9.0B (+3% YoY)',
          'Greater China: $15.1B (+2% YoY) — first positive quarter in five',
        ],
      },
      {
        heading: 'Profitability & Capital Return',
        bullets: [
          'Operating income: $26.5B GAAP; operating margin: 27.9%',
          'Free cash flow: $26.8B for the quarter',
          'Total capital returned: $25.0B ($21.0B buybacks + $3.7B dividends)',
          'Cumulative capital return program exceeded $800B since 2012',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q1 FY2026 revenue guidance: $119B–$123B (low single-digit YoY growth)',
          'Q1 FY2026 gross margin guidance: 46.5%–47.0%',
          'After-hours stock rose +2.5% on China recovery signal and iPhone 17 demand',
          'Apple Intelligence rollout expanded to 7 additional languages in iOS 19.2',
        ],
      },
    ],
    tags: ['Q4 FY2025', 'AAPL', 'iPhone 17', 'Services', 'China Recovery'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Fiscal Q3 FY2025 Earnings Results',
    date: 'July 31, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q3',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $85.8B (increased 5% YoY) — beat consensus estimate of $84.6B',
          'Gross margin was 46.3% GAAP (+100 bps YoY) — expanded on Services mix',
          'Net income was $21.9B (increased 8% YoY); diluted EPS $1.45 (+11% YoY)',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone: $39.3B (+2% YoY) — mid-cycle, in line with seasonal expectations',
          'Services: $24.2B (+12% YoY) — record June quarter; advertising & AppleTV+ growing',
          'Mac: $7.9B (+5% YoY) — M4 MacBook Air strong consumer demand',
          'iPad: $7.2B (+24% YoY) — M4 iPad Pro and new iPad Air driving upgrade cycle',
          'Wearables, Home & Accessories: $7.2B (+1% YoY)',
          'Greater China: $14.3B (-3% YoY) — still challenged by Huawei competition',
        ],
      },
      {
        heading: 'Profitability & Capital Return',
        bullets: [
          'Operating income: $23.6B GAAP; operating margin: 27.5%',
          'Free cash flow: $28.9B year-to-date (9-month period)',
          'Total capital returned: $23.8B in Q3 ($20.0B buybacks + $3.8B dividends)',
          'App Store developer billings exceeded $1.1T globally in fiscal 2024',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q4 FY2025 revenue guidance: $89B–$93B — iPhone 17 launch expected in September',
          'Q4 FY2025 gross margin guidance: 45.5%–46.5% (iPhone launch cost timing)',
          'After-hours stock rose +1.2% on Services beat and iPad strength',
          'Apple Intelligence adding 12 new language supports accelerating global adoption',
        ],
      },
    ],
    tags: ['Q3 FY2025', 'AAPL', 'iPad Pro M4', 'Services', 'Apple Intelligence'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Fiscal Q2 FY2025 Earnings Results',
    date: 'May 1, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q2',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $95.4B (increased 5% YoY) — beat consensus estimate of $94.1B',
          'Gross margin was 47.1% GAAP — record for the March quarter',
          'Net income was $24.8B (increased 8% YoY); diluted EPS $1.65 (+8% YoY)',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone: $46.8B (+2% YoY) — modest growth on mid-cycle iPhone 16',
          'Services: $26.6B (+12% YoY) — record; paid subscriptions exceeding 1.1B globally',
          'Mac: $7.9B (+6% YoY) — M4 Mac mini launched; strong SMB and education demand',
          'iPad: $6.4B (+15% YoY) — new iPad Air refresh driving units',
          'Wearables, Home & Accessories: $7.5B (+4% YoY)',
          'Greater China: $16.0B (-2% YoY) — sequential improvement from -11% in Q1',
        ],
      },
      {
        heading: 'Profitability & Capital Return',
        bullets: [
          'Operating income: $26.5B GAAP; operating margin: 27.8%',
          'Free cash flow: $24.1B for the quarter',
          'Total capital returned: $24.0B ($20.0B buybacks + $3.9B dividends)',
          'Supply chain diversification to India and Vietnam reducing tariff exposure',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q3 FY2025 revenue guidance: $84B–$88B (incorporating iPad M4 Pro tailwind)',
          'Q3 FY2025 gross margin guidance: 45.5%–46.5%',
          'After-hours stock rose +2.1% as tariff risk viewed as manageable',
          'India manufacturing now accounts for >20% of iPhone production',
        ],
      },
    ],
    tags: ['Q2 FY2025', 'AAPL', 'Services Record', 'Supply Chain', 'India'],
  },
  {
    symbol: 'AAPL',
    companyName: 'Apple, Inc.',
    title: 'Apple, Inc. (AAPL-US), Fiscal Q1 FY2025 Earnings Results',
    date: 'January 30, 2025, 5:00 PM ET',
    year: 2025,
    quarter: 'Q1',
    sections: [
      {
        heading: 'Financial Highlights',
        bullets: [
          'Revenue was $124.3B (increased 4% YoY) — record Q1 for Apple',
          'Gross margin was 46.9% GAAP — all-time record gross margin',
          'Net income was $36.3B (increased 10% YoY); diluted EPS $2.40 (+10% YoY)',
        ],
      },
      {
        heading: 'Segment Performance',
        bullets: [
          'iPhone: $69.1B (+1% YoY) — iPhone 16 cycle measured; Pro models leading',
          'Services: $26.3B (+14% YoY) — record quarter; every geography at record highs',
          'Mac: $9.0B (+15% YoY) — M4 Pro/Max chip halo effect driving commercial refresh',
          'iPad: $8.1B (+7% YoY)',
          'Wearables, Home & Accessories: $11.7B (+3% YoY)',
          'Greater China: $18.5B (-11% YoY) — most significant regional pressure',
        ],
      },
      {
        heading: 'Profitability & Capital Return',
        bullets: [
          'Operating income: $41.8B GAAP; operating margin: 33.6%',
          'Free cash flow: $30.0B for the quarter',
          'Total capital returned: $30.0B ($26.0B buybacks + $3.9B dividends)',
          'Installed base of active devices reached all-time high across all product lines',
        ],
      },
      {
        heading: 'Outlook & Market Reaction',
        bullets: [
          'Q2 FY2025 revenue guidance: $89B–$93B (low single-digit growth expected)',
          'Q2 FY2025 gross margin guidance: 46.5%–47.0%',
          'After-hours stock declined -2.5% on China revenue decline steeper than forecast',
          'Apple Intelligence US English only at launch; 11 additional languages by April 2025',
        ],
      },
    ],
    tags: ['Q1 FY2025', 'AAPL', 'iPhone 16', 'Apple Intelligence', 'China'],
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

interface PecListItemProps {
  card: PecRecord;
  isActive: boolean;
  keyword: string;
  onClick: () => void;
}

function PecListItem({ card, isActive, keyword, onClick }: PecListItemProps) {
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

interface PecDetailProps {
  card: PecRecord;
  keyword: string;
}

function PecDetail({ card, keyword }: PecDetailProps) {
  return (
    <article className="cp-pec-card cp-pec-pec-card">
      <div className="cp-pec-card-header">
        <div className="cp-pec-card-header-left">
          <span className="cp-pec-card-company">PEC</span>
          <div>
            <div className="cp-pec-card-title">{highlightText(card.title, keyword)}</div>
            <div className="cp-pec-card-date">{card.date}</div>
          </div>
        </div>
        <div className="cp-pec-card-actions">
          <button className="cp-pec-card-action-btn" title="Download PDF" aria-label="Download PDF">
            <DownloadIcon />
          </button>
          <a
            className="cp-pec-card-action-btn"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            title="Open source"
            aria-label="Open source"
          >
            <ExternalLinkIcon />
          </a>
        </div>
      </div>

      <div className="cp-pec-card-body">
        {card.sections.map((section) => (
          <div key={section.heading}>
            <div className="cp-pec-section-heading">{highlightText(section.heading, keyword)}</div>
            <ul className="cp-pec-bullet-list">
              {section.bullets.map((bullet, i) => (
                <li key={i}>{highlightText(bullet, keyword)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="cp-pec-card-footer">
        {card.tags.map((tag) => (
          <span key={tag} className="cp-pec-tag">{highlightText(tag, keyword)}</span>
        ))}
      </div>
    </article>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function PreEarningCallTab({ symbol }: PreEarningCallTabProps) {
  const allCards = useMemo(
    () => PRE_EARNING_CALL_DATA.filter((c) => c.symbol === symbol),
    [symbol]
  );

  const sortedCards = useMemo(
    () =>
      [...allCards].sort(
        (a, b) => b.year - a.year || parseQuarterNumber(b.quarter) - parseQuarterNumber(a.quarter)
      ),
    [allCards]
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
          c.sections.some(
            (s) =>
              s.heading.toLowerCase().includes(kw) ||
              s.bullets.some((b) => b.toLowerCase().includes(kw))
          )
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

  const handleSelectCard = useCallback((card: PecRecord) => {
    setSelectedId(`${card.year}-${card.quarter}`);
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
          <span className="cp-irt-search-icon"><SearchIcon /></span>
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
            <div className="cp-irt-list-empty">No results match your filter.</div>
          ) : (
            filteredCards.map((card) => (
              <PecListItem
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
          <PecDetail card={activeCard} keyword={keyword} />
        ) : (
          <div className="cp-pec-empty">
            <span className="cp-pec-empty-icon"><NoDataIcon /></span>
            <p className="cp-pec-empty-text">Select a report from the list.</p>
          </div>
        )}
      </div>
    </div>
  );
}
