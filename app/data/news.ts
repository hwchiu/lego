export interface NewsCompanyTag {
  symbol: string;
  name: string;
  change: number; // percent change, positive = up, negative = down
}

export interface NewsItem {
  id: string;
  source: string;
  title: string;
  content: string;
  category: string; // matches NewsCategory key
  fileType: string; // legacy alias of category for existing consumers
  tags: NewsCompanyTag[];
  publishedAt: Date;
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

interface RawNewsItem {
  news_date: string;
  co_cd: string;
  news_source: string;
  comp_tag_short_name: string;
  news_catg: string;
  news_content: string;
  news_url: string;
  news_title: string;
  update_date: string;
  tag_change: number;
}

const now = new Date('2026-04-02T03:06:53Z');

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toTz8IsoFromUtc(date: Date): string {
  const shifted = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const y = shifted.getUTCFullYear();
  const m = pad2(shifted.getUTCMonth() + 1);
  const d = pad2(shifted.getUTCDate());
  const hh = pad2(shifted.getUTCHours());
  const mm = pad2(shifted.getUTCMinutes());
  const ss = pad2(shifted.getUTCSeconds());
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}+08:00`;
}

function ts8(daysAgo: number, hour: number, min: number): string {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, min, 0, 0);
  return toTz8IsoFromUtc(d);
}

// Raw news storage converted to backend-style schema
const rawNewsItems: RawNewsItem[] = [
  {
    news_date: ts8(0, 14, 22),
    co_cd: 'NVDA',
    news_source: 'Bloomberg',
    comp_tag_short_name: 'NVIDIA',
    news_catg: 'semiconductor',
    news_content: 'NVIDIA and Intel announce a $5B partnership to co-develop AI data center chips and accelerate large-scale infrastructure deployment.',
    news_url: 'https://www.bloomberg.com/news/articles/nvidia-intel-ai-partnership',
    news_title: 'NVIDIA and Intel Announce $5 Billion Partnership to Co-Develop AI Data Center Chips',
    update_date: ts8(0, 14, 32),
    tag_change: 8.3,
  },
  {
    news_date: ts8(0, 11, 45),
    co_cd: 'AAPL',
    news_source: 'Reuters',
    comp_tag_short_name: 'Apple',
    news_catg: 'tech',
    news_content: 'Apple unveiled the M5 chip with major AI GPU performance improvements for new MacBook Pro and iPad Pro product lines.',
    news_url: 'https://www.reuters.com/technology/apple-m5-chip-ai-gpu-macbook-pro-ipad-pro',
    news_title: 'Apple Unveils M5 Chip with 4× AI GPU Performance, Powers New MacBook Pro and iPad Pro',
    update_date: ts8(0, 12, 0),
    tag_change: 3.7,
  },
  {
    news_date: ts8(0, 9, 10),
    co_cd: 'NVDA',
    news_source: 'CNBC',
    comp_tag_short_name: 'NVIDIA',
    news_catg: 'earnings',
    news_content: 'Global semiconductor revenue topped $790B in 2025, with NVIDIA becoming the first chip company to surpass $100B annual sales.',
    news_url: 'https://www.cnbc.com/2026/04/01/semiconductor-revenue-790-billion-nvidia-100b-annual-sales.html',
    news_title: 'Global Semiconductor Revenue Surpasses $790 Billion in 2025, NVIDIA First to Hit $100B in Annual Sales',
    update_date: ts8(0, 9, 20),
    tag_change: 5.2,
  },
  {
    news_date: ts8(1, 16, 30),
    co_cd: 'INTC',
    news_source: 'The Wall Street Journal',
    comp_tag_short_name: 'Intel',
    news_catg: 'investment',
    news_content: 'Analysts upgraded Intel after momentum in its AI accelerator roadmap and strategic investment headlines involving NVIDIA.',
    news_url: 'https://www.wsj.com/articles/intel-ai-accelerator-nvidia-investment-analysts-upgrade',
    news_title: "Intel's AI Accelerator Roadmap Gains Momentum After NVIDIA Investment — Analysts Upgrade to Buy",
    update_date: ts8(1, 16, 42),
    tag_change: -1.4,
  },
  {
    news_date: ts8(1, 13, 55),
    co_cd: 'NVDA',
    news_source: 'TechCrunch',
    comp_tag_short_name: 'NVIDIA',
    news_catg: 'ai',
    news_content: 'NVIDIA Blackwell Ultra GPU shipments reached hyperscalers ahead of schedule, reinforcing leadership in AI infrastructure.',
    news_url: 'https://techcrunch.com/2026/04/01/nvidia-blackwell-ultra-gpus-hyperscalers-ahead-of-schedule',
    news_title: 'NVIDIA Blackwell Ultra GPUs Ship to Hyperscalers Ahead of Schedule, Cementing AI Infrastructure Lead',
    update_date: ts8(1, 14, 5),
    tag_change: 6.1,
  },
  {
    news_date: ts8(1, 8, 20),
    co_cd: 'TC',
    news_source: 'Nikkei Asia',
    comp_tag_short_name: 'TSMC',
    news_catg: 'supplyChain',
    news_content: 'The Intel–NVIDIA deal triggered broad gains in Asian semiconductor suppliers including TSMC and related ecosystem firms.',
    news_url: 'https://asia.nikkei.com/Business/Tech/Semiconductors/Intel-NVIDIA-deal-sparks-rally-asian-chip-suppliers',
    news_title: 'Intel–NVIDIA $5B Deal Sparks Rally in Asian Chip Suppliers — TSMC, Samsung SDI Among Beneficiaries',
    update_date: ts8(1, 8, 35),
    tag_change: 4.8,
  },
  {
    news_date: ts8(1, 7, 0),
    co_cd: 'AAPL',
    news_source: 'Financial Times',
    comp_tag_short_name: 'Apple',
    news_catg: 'supplyChain',
    news_content: 'Apple deepened its silicon strategy with an exclusive TSMC 2nm arrangement for the next generation of A-series chips.',
    news_url: 'https://www.ft.com/content/apple-silicon-tsmc-2nm-exclusive-deal-a-series',
    news_title: 'Apple Silicon Strategy Deepens with TSMC 2nm Exclusive Deal for Next-Generation A-Series Chips',
    update_date: ts8(1, 7, 12),
    tag_change: 2.5,
  },
  {
    news_date: ts8(0, 15, 40),
    co_cd: 'SMH',
    news_source: "Barron's",
    comp_tag_short_name: 'VanEck Semi ETF',
    news_catg: 'investment',
    news_content: 'SMH reached a record high as AI chip demand kept outpacing supply expectations across the 2026 outlook.',
    news_url: 'https://www.barrons.com/articles/semiconductor-etf-smh-all-time-high-ai-chip-demand',
    news_title: 'Semiconductor ETF SMH Hits All-Time High as AI Chip Demand Outpaces Supply Through 2026',
    update_date: ts8(0, 15, 50),
    tag_change: 3.2,
  },
  {
    news_date: ts8(0, 10, 5),
    co_cd: 'INTC',
    news_source: 'The Verge',
    comp_tag_short_name: 'Intel',
    news_catg: 'policy',
    news_content: 'Intel Foundry Services secured a $3B U.S. government contract tied to domestic production of defense-related chips.',
    news_url: 'https://www.theverge.com/2026/4/2/intel-foundry-services-3b-us-government-contract-defense-chips',
    news_title: 'Intel Foundry Services Secures $3B U.S. Government Contract to Produce Domestic Defense Chips',
    update_date: ts8(0, 10, 18),
    tag_change: 7.6,
  },
  {
    news_date: ts8(2, 18, 15),
    co_cd: 'NVDA',
    news_source: 'Seeking Alpha',
    comp_tag_short_name: 'NVIDIA',
    news_catg: 'earnings',
    news_content: 'NVIDIA data center revenue grew 142% YoY in Q1 FY2026 and management raised the full-year outlook.',
    news_url: 'https://seekingalpha.com/article/nvidia-data-center-revenue-142-q1-fy2026-raises-outlook',
    news_title: "NVIDIA's Data Center Revenue Grows 142% YoY in Q1 FY2026; Company Raises Full-Year Outlook",
    update_date: ts8(2, 18, 26),
    tag_change: 9.7,
  },
  {
    news_date: ts8(2, 12, 30),
    co_cd: 'AAPL',
    news_source: 'MacRumors',
    comp_tag_short_name: 'Apple',
    news_catg: 'ai',
    news_content: 'Apple is planning on-device AI capabilities for iPhone 18 based on a custom Neural Engine architecture derived from M5.',
    news_url: 'https://www.macrumors.com/2026/03/31/apple-on-device-ai-iphone-18-m5-neural-engine',
    news_title: 'Apple Plans to Bring On-Device AI Models to iPhone 18 with Custom Neural Engine Based on M5 Architecture',
    update_date: ts8(2, 12, 40),
    tag_change: -0.8,
  },
  {
    news_date: ts8(2, 9, 45),
    co_cd: 'INTC',
    news_source: 'Reuters',
    comp_tag_short_name: 'Intel',
    news_catg: 'semiconductor',
    news_content: 'Intel confirmed its 18A process node schedule remains on track with planned mass production starting in Q3 2026.',
    news_url: 'https://www.reuters.com/technology/intel-18a-process-node-mass-production-q3-2026',
    news_title: 'Intel CEO Pat Gelsinger Confirms 18A Process Node on Track; Mass Production Begins Q3 2026',
    update_date: ts8(2, 9, 58),
    tag_change: 4.3,
  },
  {
    news_date: ts8(3, 15, 0),
    co_cd: 'AAPL',
    news_source: 'Bloomberg',
    comp_tag_short_name: 'Apple',
    news_catg: 'earnings',
    news_content: 'Apple reported record services revenue of $24.2B in Q2 FY2026, with App Store growth as a key driver.',
    news_url: 'https://www.bloomberg.com/news/articles/apple-record-services-revenue-q2-fy2026',
    news_title: 'Apple Reports Record Services Revenue of $24.2B in Q2 FY2026, App Store Growth Leads',
    update_date: ts8(3, 15, 10),
    tag_change: 4.1,
  },
  {
    news_date: ts8(3, 10, 20),
    co_cd: 'AAPL',
    news_source: 'The Verge',
    comp_tag_short_name: 'Apple',
    news_catg: 'tech',
    news_content: 'Leaked details of Apple Vision Pro 2 point to a lighter design, M5 Ultra chip, and lower entry price target.',
    news_url: 'https://www.theverge.com/2026/3/30/apple-vision-pro-2-leaked-specs',
    news_title: 'Apple Vision Pro 2 Leaked: Lighter Design, M5 Ultra Chip, and Sub-$2,000 Entry Model Expected',
    update_date: ts8(3, 10, 30),
    tag_change: 1.9,
  },
  {
    news_date: ts8(4, 9, 0),
    co_cd: 'AAPL',
    news_source: 'CNBC',
    comp_tag_short_name: 'Apple',
    news_catg: 'supplyChain',
    news_content: 'Apple expanded India production plans with a goal to manufacture 25% of iPhones outside China by 2027.',
    news_url: 'https://www.cnbc.com/2026/03/29/apple-india-manufacturing-25-percent-iphones-2027',
    news_title: 'Apple Expands India Manufacturing — Plans to Produce 25% of iPhones Outside China by 2027',
    update_date: ts8(4, 9, 15),
    tag_change: 2.3,
  },
  {
    news_date: ts8(4, 14, 30),
    co_cd: 'AAPL',
    news_source: 'Wall Street Journal',
    comp_tag_short_name: 'Apple',
    news_catg: 'ai',
    news_content: 'Apple Intelligence reportedly reached 1 billion active devices, accelerating expectations for software-driven hardware upgrades.',
    news_url: 'https://www.wsj.com/articles/apple-intelligence-1-billion-devices',
    news_title: 'Apple Intelligence Reaches 1 Billion Active Devices, Driving Software Upgrade Cycle Ahead of Expectations',
    update_date: ts8(4, 14, 44),
    tag_change: 3.0,
  },
  {
    news_date: ts8(5, 11, 45),
    co_cd: 'AAPL',
    news_source: 'Financial Times',
    comp_tag_short_name: 'Apple',
    news_catg: 'policy',
    news_content: 'Apple and Google renewed their search deal while antitrust scrutiny continues under an ongoing DOJ case.',
    news_url: 'https://www.ft.com/content/apple-google-20b-search-deal-doj',
    news_title: 'Apple and Google Renew $20B Search Deal; Antitrust Review Ongoing in DOJ Case',
    update_date: ts8(5, 11, 58),
    tag_change: -1.2,
  },
  {
    news_date: ts8(5, 8, 15),
    co_cd: 'AAPL',
    news_source: 'Seeking Alpha',
    comp_tag_short_name: 'Apple',
    news_catg: 'investment',
    news_content: 'Apple buyback activity reached $110B in FY2025, highlighted as the largest corporate repurchase program on record.',
    news_url: 'https://seekingalpha.com/article/apple-buyback-110b-fy2025',
    news_title: 'Apple Buyback Program Reaches $110B in FY2025 — Largest Corporate Buyback in History',
    update_date: ts8(5, 8, 28),
    tag_change: 2.7,
  },
];

export const newsItems: NewsItem[] = rawNewsItems.map((item, index) => ({
  id: `news-${index + 1}`,
  source: item.news_source,
  title: item.news_title,
  content: item.news_content,
  category: item.news_catg,
  fileType: item.news_catg,
  tags: [{ symbol: item.co_cd, name: item.comp_tag_short_name, change: item.tag_change }],
  publishedAt: new Date(item.news_date),
  url: item.news_url,
}));
