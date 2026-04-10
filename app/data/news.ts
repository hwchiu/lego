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
  fileType: string; // document type: 10-K, 10-Q, 8-K, Press Release, etc.
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
  { key: 'semiconductor', label: 'Semiconductor' },
  { key: 'tech', label: 'Tech' },
  { key: 'investment', label: 'Investment' },
  { key: 'ai', label: 'AI & Computing' },
  { key: 'supplyChain', label: 'Supply Chain' },
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
    fileType: 'Research Note',
    tags: [
      { symbol: 'NVDA', name: 'NVIDIA', change: 8.3 },
      { symbol: 'INTC', name: 'Intel', change: 22.1 },
    ],
    publishedAt: ts(0, 14, 22),
    url: 'https://www.bloomberg.com/news/articles/nvidia-intel-ai-partnership',
  },
  {
    id: 'news-2',
    source: 'Reuters',
    title: 'Apple Unveils M5 Chip with 4× AI GPU Performance, Powers New MacBook Pro and iPad Pro',
    category: 'tech',
    fileType: 'Press Release',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: 3.7 }],
    publishedAt: ts(0, 11, 45),
    url: 'https://www.reuters.com/technology/apple-m5-chip-ai-gpu-macbook-pro-ipad-pro',
  },
  {
    id: 'news-3',
    source: 'CNBC',
    title: 'Global Semiconductor Revenue Surpasses $790 Billion in 2025, NVIDIA First to Hit $100B in Annual Sales',
    category: 'earnings',
    fileType: 'Earnings Call',
    tags: [{ symbol: 'NVDA', name: 'NVIDIA', change: 5.2 }],
    publishedAt: ts(0, 9, 10),
    url: 'https://www.cnbc.com/2026/04/01/semiconductor-revenue-790-billion-nvidia-100b-annual-sales.html',
  },
  {
    id: 'news-4',
    source: 'The Wall Street Journal',
    title: "Intel's AI Accelerator Roadmap Gains Momentum After NVIDIA Investment — Analysts Upgrade to Buy",
    category: 'investment',
    fileType: 'Analyst Report',
    tags: [{ symbol: 'INTC', name: 'Intel', change: -1.4 }],
    publishedAt: ts(1, 16, 30),
    url: 'https://www.wsj.com/articles/intel-ai-accelerator-nvidia-investment-analysts-upgrade',
  },
  {
    id: 'news-5',
    source: 'TechCrunch',
    title: 'NVIDIA Blackwell Ultra GPUs Ship to Hyperscalers Ahead of Schedule, Cementing AI Infrastructure Lead',
    category: 'ai',
    fileType: 'Research Note',
    tags: [{ symbol: 'NVDA', name: 'NVIDIA', change: 6.1 }],
    publishedAt: ts(1, 13, 55),
    url: 'https://techcrunch.com/2026/04/01/nvidia-blackwell-ultra-gpus-hyperscalers-ahead-of-schedule',
  },
  {
    id: 'news-6',
    source: 'Nikkei Asia',
    title: 'Intel–NVIDIA $5B Deal Sparks Rally in Asian Chip Suppliers — T Company, Samsung SDI Among Beneficiaries',
    category: 'supplyChain',
    fileType: 'Press Release',
    tags: [{ symbol: 'TC', name: 'T Company', change: 4.8 }],
    publishedAt: ts(1, 8, 20),
    url: 'https://asia.nikkei.com/Business/Tech/Semiconductors/Intel-NVIDIA-deal-sparks-rally-asian-chip-suppliers',
  },
  {
    id: 'news-7',
    source: 'Financial Times',
    title: 'Apple Silicon Strategy Deepens with T Company 2nm Exclusive Deal for Next-Generation A-Series Chips',
    category: 'supplyChain',
    fileType: 'Analyst Report',
    tags: [
      { symbol: 'AAPL', name: 'Apple', change: 2.5 },
      { symbol: 'TC', name: 'T Company', change: 3.9 },
    ],
    publishedAt: ts(1, 7, 0),
    url: 'https://www.ft.com/content/apple-silicon-tsmc-2nm-exclusive-deal-a-series',
  },
  {
    id: 'news-8',
    source: "Barron's",
    title: 'Semiconductor ETF SMH Hits All-Time High as AI Chip Demand Outpaces Supply Through 2026',
    category: 'investment',
    fileType: 'Analyst Report',
    tags: [{ symbol: 'SMH', name: 'VanEck Semi ETF', change: 3.2 }],
    publishedAt: ts(0, 15, 40),
    url: 'https://www.barrons.com/articles/semiconductor-etf-smh-all-time-high-ai-chip-demand',
  },
  {
    id: 'news-9',
    source: 'The Verge',
    title: 'Intel Foundry Services Secures $3B U.S. Government Contract to Produce Domestic Defense Chips',
    category: 'policy',
    fileType: '8-K',
    tags: [{ symbol: 'INTC', name: 'Intel', change: 7.6 }],
    publishedAt: ts(0, 10, 5),
    url: 'https://www.theverge.com/2026/4/2/intel-foundry-services-3b-us-government-contract-defense-chips',
  },
  {
    id: 'news-10',
    source: 'Seeking Alpha',
    title: "NVIDIA's Data Center Revenue Grows 142% YoY in Q1 FY2026; Company Raises Full-Year Outlook",
    category: 'earnings',
    fileType: '10-Q',
    tags: [{ symbol: 'NVDA', name: 'NVIDIA', change: 9.7 }],
    publishedAt: ts(2, 18, 15),
    url: 'https://seekingalpha.com/article/nvidia-data-center-revenue-142-q1-fy2026-raises-outlook',
  },
  {
    id: 'news-11',
    source: 'MacRumors',
    title: 'Apple Plans to Bring On-Device AI Models to iPhone 18 with Custom Neural Engine Based on M5 Architecture',
    category: 'ai',
    fileType: 'Press Release',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: -0.8 }],
    publishedAt: ts(2, 12, 30),
    url: 'https://www.macrumors.com/2026/03/31/apple-on-device-ai-iphone-18-m5-neural-engine',
  },
  {
    id: 'news-12',
    source: 'Reuters',
    title: 'Intel CEO Pat Gelsinger Confirms 18A Process Node on Track; Mass Production Begins Q3 2026',
    category: 'semiconductor',
    fileType: 'Press Release',
    tags: [{ symbol: 'INTC', name: 'Intel', change: 4.3 }],
    publishedAt: ts(2, 9, 45),
    url: 'https://www.reuters.com/technology/intel-18a-process-node-mass-production-q3-2026',
  },
  {
    id: 'news-13',
    source: 'Bloomberg',
    title: 'Apple Reports Record Services Revenue of $24.2B in Q2 FY2026, App Store Growth Leads',
    category: 'earnings',
    fileType: '10-Q',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: 4.1 }],
    publishedAt: ts(3, 15, 0),
    url: 'https://www.bloomberg.com/news/articles/apple-record-services-revenue-q2-fy2026',
  },
  {
    id: 'news-14',
    source: 'The Verge',
    title: 'Apple Vision Pro 2 Leaked: Lighter Design, M5 Ultra Chip, and Sub-$2,000 Entry Model Expected',
    category: 'tech',
    fileType: 'Press Release',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: 1.9 }],
    publishedAt: ts(3, 10, 20),
    url: 'https://www.theverge.com/2026/3/30/apple-vision-pro-2-leaked-specs',
  },
  {
    id: 'news-15',
    source: 'CNBC',
    title: 'Apple Expands India Manufacturing — Plans to Produce 25% of iPhones Outside China by 2027',
    category: 'supplyChain',
    fileType: '8-K',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: 2.3 }],
    publishedAt: ts(4, 9, 0),
    url: 'https://www.cnbc.com/2026/03/29/apple-india-manufacturing-25-percent-iphones-2027',
  },
  {
    id: 'news-16',
    source: 'Wall Street Journal',
    title: 'Apple Intelligence Reaches 1 Billion Active Devices, Driving Software Upgrade Cycle Ahead of Expectations',
    category: 'ai',
    fileType: 'Research Note',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: 3.0 }],
    publishedAt: ts(4, 14, 30),
    url: 'https://www.wsj.com/articles/apple-intelligence-1-billion-devices',
  },
  {
    id: 'news-17',
    source: 'Financial Times',
    title: 'Apple and Google Renew $20B Search Deal; Antitrust Review Ongoing in DOJ Case',
    category: 'policy',
    fileType: '8-K',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: -1.2 }],
    publishedAt: ts(5, 11, 45),
    url: 'https://www.ft.com/content/apple-google-20b-search-deal-doj',
  },
  {
    id: 'news-18',
    source: 'Seeking Alpha',
    title: 'Apple Buyback Program Reaches $110B in FY2025 — Largest Corporate Buyback in History',
    category: 'investment',
    fileType: 'Annual Report',
    tags: [{ symbol: 'AAPL', name: 'Apple', change: 2.7 }],
    publishedAt: ts(5, 8, 15),
    url: 'https://seekingalpha.com/article/apple-buyback-110b-fy2025',
  },
];
