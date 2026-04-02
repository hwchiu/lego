export interface NewsCompanyTag {
  symbol: string;
  name: string;
  change: number; // percent change, positive = up, negative = down
}

export interface NewsItem {
  id: string;
  source: string;
  title: string;
  category: string; // matches NewsCategory key
  tags: NewsCompanyTag[];
  publishedAt: Date; // UTC timestamp
  url: string;
}

export type NewsCategory =
  | 'all'
  | 'semiconductor'
  | 'tech'
  | 'investment'
  | 'ai'
  | 'supplyChain'
  | 'earnings'
  | 'policy';

export const newsCategories: { key: NewsCategory; label: string }[] = [
  { key: 'all', label: 'All News' },
  { key: 'semiconductor', label: 'Semiconductor (半導體)' },
  { key: 'tech', label: 'Tech' },
  { key: 'investment', label: 'Investment' },
  { key: 'ai', label: 'AI & Computing' },
  { key: 'supplyChain', label: 'Supply Chain (供應鏈)' },
  { key: 'earnings', label: 'Earnings & Revenue' },
  { key: 'policy', label: 'Policy & Regulation' },
];

// Reference "now" for relative timestamps — used by ts() helper
const now = new Date('2026-04-02T03:06:53Z');

function ts(daysAgo: number, hour: number, min: number): Date {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, min, 0, 0);
  return d;
}

export const newsItems: NewsItem[] = [
  {
    id: 'news-1',
    source: 'Bloomberg',
    title: 'NVIDIA and Intel Announce $5 Billion Partnership to Co-Develop AI Data Center Chips',
    category: 'semiconductor',
    tags: [
      { symbol: 'NVDA', name: 'NVIDIA', change: 8.3 },
      { symbol: 'INTC', name: 'Intel', change: 22.1 },
    ],
    publishedAt: ts(0, 14, 22),
    url: '#',
  },
  {
    id: 'news-2',
    source: 'Reuters',
    title: 'Apple Unveils M5 Chip with 4× AI GPU Performance, Powers New MacBook Pro and iPad Pro',
    category: 'tech',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: 3.7 }],
    publishedAt: ts(0, 11, 45),
    url: '#',
  },
  {
    id: 'news-3',
    source: 'CNBC',
    title: 'Global Semiconductor Revenue Surpasses $790 Billion in 2025, NVIDIA First to Hit $100B in Annual Sales',
    category: 'earnings',
    tags: [{ symbol: 'NVDA', name: 'NVIDIA', change: 5.2 }],
    publishedAt: ts(0, 9, 10),
    url: '#',
  },
  {
    id: 'news-4',
    source: 'The Wall Street Journal',
    title: "Intel's AI Accelerator Roadmap Gains Momentum After NVIDIA Investment — Analysts Upgrade to Buy",
    category: 'investment',
    tags: [{ symbol: 'INTC', name: 'Intel', change: -1.4 }],
    publishedAt: ts(1, 16, 30),
    url: '#',
  },
  {
    id: 'news-5',
    source: 'TechCrunch',
    title: 'NVIDIA Blackwell Ultra GPUs Ship to Hyperscalers Ahead of Schedule, Cementing AI Infrastructure Lead',
    category: 'ai',
    tags: [{ symbol: 'NVDA', name: 'NVIDIA', change: 6.1 }],
    publishedAt: ts(1, 13, 55),
    url: '#',
  },
  {
    id: 'news-6',
    source: 'Nikkei Asia',
    title: 'Intel–NVIDIA $5B Deal Sparks Rally in Asian Chip Suppliers — TSMC, Samsung SDI Among Beneficiaries',
    category: 'supplyChain',
    tags: [{ symbol: 'TSM', name: 'TSMC', change: 4.8 }],
    publishedAt: ts(1, 8, 20),
    url: '#',
  },
  {
    id: 'news-7',
    source: 'Financial Times',
    title: 'Apple Silicon Strategy Deepens with TSMC 2nm Exclusive Deal for Next-Generation A-Series Chips',
    category: 'supplyChain',
    tags: [
      { symbol: 'AAPL', name: 'Apple', change: 2.5 },
      { symbol: 'TSM', name: 'TSMC', change: 3.9 },
    ],
    publishedAt: ts(1, 7, 0),
    url: '#',
  },
  {
    id: 'news-8',
    source: 'Barron\'s',
    title: 'Semiconductor ETF SMH Hits All-Time High as AI Chip Demand Outpaces Supply Through 2026',
    category: 'investment',
    tags: [{ symbol: 'SMH', name: 'VanEck Semi ETF', change: 3.2 }],
    publishedAt: ts(0, 15, 40),
    url: '#',
  },
  {
    id: 'news-9',
    source: 'The Verge',
    title: 'Intel Foundry Services Secures $3B U.S. Government Contract to Produce Domestic Defense Chips',
    category: 'policy',
    tags: [{ symbol: 'INTC', name: 'Intel', change: 7.6 }],
    publishedAt: ts(0, 10, 5),
    url: '#',
  },
  {
    id: 'news-10',
    source: 'Seeking Alpha',
    title: "NVIDIA's Data Center Revenue Grows 142% YoY in Q1 FY2026; Company Raises Full-Year Outlook",
    category: 'earnings',
    tags: [{ symbol: 'NVDA', name: 'NVIDIA', change: 9.7 }],
    publishedAt: ts(2, 18, 15),
    url: '#',
  },
  {
    id: 'news-11',
    source: 'MacRumors',
    title: 'Apple Plans to Bring On-Device AI Models to iPhone 18 with Custom Neural Engine Based on M5 Architecture',
    category: 'ai',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: -0.8 }],
    publishedAt: ts(2, 12, 30),
    url: '#',
  },
  {
    id: 'news-12',
    source: 'Reuters',
    title: 'Intel CEO Pat Gelsinger Confirms 18A Process Node on Track; Mass Production Begins Q3 2026',
    category: 'semiconductor',
    tags: [{ symbol: 'INTC', name: 'Intel', change: 4.3 }],
    publishedAt: ts(2, 9, 45),
    url: '#',
  },
];
