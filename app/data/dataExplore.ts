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
  icon: string;
  color: string;
  description: string;
  items: DataItem[];
}

export const CATEGORIES: Category[] = [
  {
    slug: 'esg',
    label: 'ESG',
    icon: '🌱',
    color: '#16a34a',
    description:
      'Environmental, Social, and Governance disclosures covering TSMC and its supply chain partners — sustainability reports, carbon targets, renewable energy, and social governance.',
    items: extractJson<DataItem[]>(esgRaw),
  },
  {
    slug: 'government-regulations',
    label: 'Government Regulations & Policies',
    icon: '🏛️',
    color: '#2563eb',
    description:
      'Regulatory frameworks, export controls, semiconductor subsidies, and trade policies affecting TSMC and the broader semiconductor supply chain — including US CHIPS Act, BIS rules, and allied nation policies.',
    items: extractJson<DataItem[]>(govRegsRaw),
  },
  {
    slug: 'international-standards',
    label: 'International Standards',
    icon: '📋',
    color: '#7c3aed',
    description:
      'ISO certifications, IEC standards, SEMI standards, and quality management frameworks adopted by TSMC and its supply chain — covering quality, environmental, information security, and product compliance.',
    items: extractJson<DataItem[]>(intlStdRaw),
  },
  {
    slug: 'industry-information',
    label: 'Industry Information',
    icon: '🔬',
    color: '#ea580c',
    description:
      'Semiconductor industry trends, technology roadmaps, equipment supply chain, fab expansions, and advanced packaging developments related to TSMC and its ecosystem.',
    items: extractJson<DataItem[]>(industryRaw),
  },
  {
    slug: 'company-operations',
    label: 'Company Operations & Finance',
    icon: '📊',
    color: '#0891b2',
    description:
      'Quarterly earnings, annual financial results, operational metrics, customer relationships, and strategic business developments for TSMC and key supply chain companies.',
    items: extractJson<DataItem[]>(companyOpsRaw),
  },
  {
    slug: 'capital-markets',
    label: 'Capital Markets',
    icon: '📈',
    color: '#be123c',
    description:
      'Investment analysis, analyst ratings, price targets, institutional ownership, and capital market events for TSMC (TSM ADR) and associated semiconductor sector equities.',
    items: extractJson<DataItem[]>(capitalRaw),
  },
];

export const CATEGORIES_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);
