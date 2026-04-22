import type { ReactNode } from 'react';
import esgRaw from '@/content/data-explore/esg.md';
import govRegsRaw from '@/content/data-explore/government-regulations.md';
import intlStdRaw from '@/content/data-explore/international-standards.md';
import industryRaw from '@/content/data-explore/industry-information.md';
import companyOpsRaw from '@/content/data-explore/company-operations.md';
import capitalRaw from '@/content/data-explore/capital-markets.md';
import newsSummaryRaw from '@/content/data-explore/news-summary.md';
import { extractJson } from '@/app/lib/parseContent';

// ── Category icon components ────────────────────────────────────────────────
// Style matches RMAP / User Manual: 48×48 viewBox, stroke-based, rounded caps.
// Width/height intentionally omitted — controlled by CSS at each usage site.

function EsgIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Stem */}
      <path d="M24 40V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Left leaf */}
      <path
        d="M24 26C22 20 14 14 8 16C9 24 16 28 24 26Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right leaf */}
      <path
        d="M24 20C26 14 34 8 40 10C39 18 32 22 24 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Ground node */}
      <circle cx="24" cy="40" r="2.5" fill="currentColor" />
    </svg>
  );
}

function GovernmentIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Pediment */}
      <path
        d="M8 22L24 8L40 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Header bar */}
      <rect x="8" y="22" width="32" height="4" rx="1" stroke="currentColor" strokeWidth="2" />
      {/* Three columns */}
      <rect x="12" y="26" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="21.5" y="26" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="31" y="26" width="5" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
      {/* Base */}
      <rect x="8" y="40" width="32" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function StandardsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Shield */}
      <path
        d="M24 6L38 12V26C38 34 30 40 24 42C18 40 10 34 10 26V12L24 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M17 25L22 30L31 19"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IndustryIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Chip body */}
      <rect x="14" y="14" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
      {/* Left pins */}
      <path d="M14 19H8M14 24H8M14 29H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Right pins */}
      <path d="M34 19H40M34 24H40M34 29H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Top pins */}
      <path d="M19 14V8M24 14V8M29 14V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Bottom pins */}
      <path d="M19 34V40M24 34V40M29 34V40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Center node */}
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}

function CompanyOpsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Axes */}
      <path d="M10 8V40H42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Ascending bars */}
      <rect x="14" y="28" width="7" height="12" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="24" y="20" width="7" height="20" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="34" y="12" width="7" height="28" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CapitalMarketsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Axes */}
      <path d="M8 40H40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 40V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Trending-up line */}
      <path
        d="M10 36L18 28L26 30L34 18L42 12"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Data-point nodes */}
      <circle cx="18" cy="28" r="2.5" fill="currentColor" />
      <circle cx="26" cy="30" r="2.5" fill="currentColor" />
      <circle cx="34" cy="18" r="2.5" fill="currentColor" />
      {/* Arrow tip */}
      <path
        d="M38 10L42 12L40 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NewsSummaryIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* Page outline */}
      <rect x="8" y="6" width="32" height="36" rx="3" stroke="currentColor" strokeWidth="2" />
      {/* Title bar */}
      <rect x="14" y="13" width="20" height="3" rx="1" stroke="currentColor" strokeWidth="2" />
      {/* Horizontal lines representing news text */}
      <path d="M14 21h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 26h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 31h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      {/* Small accent circle (breaking news dot) */}
      <circle cx="34" cy="35" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M34 33v2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="34" cy="37" r="0.8" fill="currentColor" />
    </svg>
  );
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface DataItem {
  id: string;
  title: string;
  source: string;
  date: string;
  summary: string;
  tags: string[];
  url: string;
}

export interface Category {
  slug: string;
  label: string;
  icon: ReactNode;
  color: string;
  description: string;
  items: DataItem[];
}

// ── Data ────────────────────────────────────────────────────────────────────

export const CATEGORIES: Category[] = [
  {
    slug: 'news-summary',
    label: 'News Summary',
    icon: <NewsSummaryIcon />,
    color: '#0ea5e9',
    description:
      'Curated news summaries covering TSMC, its supply chain ecosystem, and the broader semiconductor industry — aggregated from major financial and technology media outlets.',
    items: extractJson<DataItem[]>(newsSummaryRaw),
  },
  {
    slug: 'esg',
    label: 'ESG',
    icon: <EsgIcon />,
    color: '#16a34a',
    description:
      'Environmental, Social, and Governance disclosures covering TSMC and its supply chain partners — sustainability reports, carbon targets, renewable energy, and social governance.',
    items: extractJson<DataItem[]>(esgRaw),
  },
  {
    slug: 'government-regulations',
    label: 'Government Regulations & Policies',
    icon: <GovernmentIcon />,
    color: '#2563eb',
    description:
      'Regulatory frameworks, export controls, semiconductor subsidies, and trade policies affecting TSMC and the broader semiconductor supply chain — including US CHIPS Act, BIS rules, and allied nation policies.',
    items: extractJson<DataItem[]>(govRegsRaw),
  },
  {
    slug: 'international-standards',
    label: 'International Standards',
    icon: <StandardsIcon />,
    color: '#7c3aed',
    description:
      'ISO certifications, IEC standards, SEMI standards, and quality management frameworks adopted by TSMC and its supply chain — covering quality, environmental, information security, and product compliance.',
    items: extractJson<DataItem[]>(intlStdRaw),
  },
  {
    slug: 'industry-information',
    label: 'Industry Information',
    icon: <IndustryIcon />,
    color: '#ea580c',
    description:
      'Semiconductor industry trends, technology roadmaps, equipment supply chain, fab expansions, and advanced packaging developments related to TSMC and its ecosystem.',
    items: extractJson<DataItem[]>(industryRaw),
  },
  {
    slug: 'company-operations',
    label: 'Company Operations & Finance',
    icon: <CompanyOpsIcon />,
    color: '#0891b2',
    description:
      'Quarterly earnings, annual financial results, operational metrics, customer relationships, and strategic business developments for TSMC and key supply chain companies.',
    items: extractJson<DataItem[]>(companyOpsRaw),
  },
  {
    slug: 'capital-markets',
    label: 'Capital Markets',
    icon: <CapitalMarketsIcon />,
    color: '#be123c',
    description:
      'Investment analysis, analyst ratings, price targets, institutional ownership, and capital market events for TSMC (TC ADR) and associated semiconductor sector equities.',
    items: extractJson<DataItem[]>(capitalRaw),
  },
];

export const CATEGORIES_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);
