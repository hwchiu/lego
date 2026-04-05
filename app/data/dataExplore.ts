import esgRaw from '@/content/data-explore/esg.md';
import govRegsRaw from '@/content/data-explore/government-regulations.md';
import intlStdRaw from '@/content/data-explore/international-standards.md';
import industryRaw from '@/content/data-explore/industry-information.md';
import companyOpsRaw from '@/content/data-explore/company-operations.md';
import capitalRaw from '@/content/data-explore/capital-markets.md';
import { extractJson } from '@/app/lib/parseContent';

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
  /** SVG inner HTML paths string — rendered via dangerouslySetInnerHTML in a 28×28 viewBox */
  icon: string;
  color: string;
  description: string;
  items: DataItem[];
}

export const CATEGORIES: Category[] = [
  {
    slug: 'esg',
    label: 'ESG',
    // Leaf sprout — sustainability / environment
    icon: '<path d="M14 16C14 16 8 14 6 9C4.5 5.5 7 3 10 4C12 4.7 13 6.5 14 8C15 6.5 16 4.7 18 4C21 3 23.5 5.5 22 9C20 14 14 16 14 16Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M14 16V23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    color: '#16a34a',
    description:
      'Environmental, Social, and Governance disclosures covering TSMC and its supply chain partners — sustainability reports, carbon targets, renewable energy, and social governance.',
    items: extractJson<DataItem[]>(esgRaw),
  },
  {
    slug: 'government-regulations',
    label: 'Government Regulations & Policies',
    // Columned building — government / institution
    icon: '<path d="M3 12L14 5L25 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 24H25" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 13V23M11 13V23M17 13V23M22 13V23" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    color: '#2563eb',
    description:
      'Regulatory frameworks, export controls, semiconductor subsidies, and trade policies affecting TSMC and the broader semiconductor supply chain — including US CHIPS Act, BIS rules, and allied nation policies.',
    items: extractJson<DataItem[]>(govRegsRaw),
  },
  {
    slug: 'international-standards',
    label: 'International Standards',
    // Shield with checkmark — certification / compliance
    icon: '<path d="M14 3L5 7V14C5 18.5 8.8 22.7 14 24C19.2 22.7 23 18.5 23 14V7L14 3Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M10 14L12.5 16.5L18 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    color: '#7c3aed',
    description:
      'ISO certifications, IEC standards, SEMI standards, and quality management frameworks adopted by TSMC and its supply chain — covering quality, environmental, information security, and product compliance.',
    items: extractJson<DataItem[]>(intlStdRaw),
  },
  {
    slug: 'industry-information',
    label: 'Industry Information',
    // Chip / circuit board — semiconductor / technology
    icon: '<rect x="9" y="9" width="10" height="10" rx="1.5" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M12 6V9M16 6V9M12 19V22M16 19V22M6 12H9M6 16H9M19 12H22M19 16H22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
    color: '#ea580c',
    description:
      'Semiconductor industry trends, technology roadmaps, equipment supply chain, fab expansions, and advanced packaging developments related to TSMC and its ecosystem.',
    items: extractJson<DataItem[]>(industryRaw),
  },
  {
    slug: 'company-operations',
    label: 'Company Operations & Finance',
    // Bar chart — operations / financial performance
    icon: '<path d="M4 22H24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="6" y="12" width="4" height="10" rx="1" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="12" y="7" width="4" height="15" rx="1" stroke="currentColor" stroke-width="1.7" fill="none"/><rect x="18" y="15" width="4" height="7" rx="1" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    color: '#0891b2',
    description:
      'Quarterly earnings, annual financial results, operational metrics, customer relationships, and strategic business developments for TSMC and key supply chain companies.',
    items: extractJson<DataItem[]>(companyOpsRaw),
  },
  {
    slug: 'capital-markets',
    label: 'Capital Markets',
    // Trending line chart — equities / markets
    icon: '<path d="M4 20L9 14L15 18L22 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 24H24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="22" cy="8" r="2.5" stroke="currentColor" stroke-width="1.7" fill="none"/>',
    color: '#be123c',
    description:
      'Investment analysis, analyst ratings, price targets, institutional ownership, and capital market events for TSMC (TSM ADR) and associated semiconductor sector equities.',
    items: extractJson<DataItem[]>(capitalRaw),
  },
];

export const CATEGORIES_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);
