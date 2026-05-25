// Intel Competitor Network data
// Sources: Mercury Research, IDC, company annual reports, analyst research (FY2023–FY2024)

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface CompetitorNode {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
  country: string;
  relationship: string;
  financials: {
    revenue: string;
    grossMargin: string;
    marketCap: string;
  };
  color: string;
  marketShare: number;
  processNodes: string[];
  industryCategory: string;
  segment: string;
}

export interface CompetitorFeedItem {
  id: number;
  title: string;
  tickers: string[];
  source: string;
  time: string;
  category: string;
}

export interface MarketShareEntry {
  id: string;
  name: string;
  marketShare: number;
}

// ---------------------------------------------------------------------------
// Center node (INTC)
// ---------------------------------------------------------------------------

export const INTEL_COMPETITOR_CENTER: CompetitorNode = {
  id: 'INTC',
  name: 'Intel Corporation',
  ticker: 'INTC',
  exchange: 'NASDAQ',
  country: 'USA',
  relationship: 'Central Company — Integrated Device Manufacturer (IDM)',
  financials: {
    revenue: '$54.2B',
    grossMargin: '41.7%',
    marketCap: '~$90B',
  },
  color: '#1a2332',
  marketShare: 60.1,
  processNodes: ['Intel 18A', 'Intel 3', 'Intel 4', 'Intel 7', '10nm', '14nm'],
  industryCategory: 'Semiconductor IDM',
  segment: 'IDM',
};

export const TC_COMPETITOR_CENTER = INTEL_COMPETITOR_CENTER;

// ---------------------------------------------------------------------------
// Competitor nodes (sorted by relevance to Intel TAM)
// ---------------------------------------------------------------------------

export const INTEL_COMPETITORS: CompetitorNode[] = [
  {
    id: 'AMD',
    name: 'AMD',
    ticker: 'AMD',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Primary x86 CPU and GPU Competitor',
    financials: {
      revenue: '$22.7B',
      grossMargin: '47.4%',
      marketCap: '~$260B',
    },
    color: '#ed1c24',
    marketShare: 39.9,
    processNodes: ['Zen 5', 'GlobalTech N4', 'GlobalTech N3', 'CDNA 3'],
    industryCategory: 'Semiconductor Fabless',
    segment: 'CPU/GPU',
  },
  {
    id: 'NVDA',
    name: 'NVIDIA',
    ticker: 'NVDA',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'GPU and AI Accelerator Competitor',
    financials: {
      revenue: '$60.9B',
      grossMargin: '72.7%',
      marketCap: '~$2.2T',
    },
    color: '#76b900',
    marketShare: 18.5,
    processNodes: ['Blackwell', 'Grace', 'GlobalTech 4N', 'HBM3e'],
    industryCategory: 'AI & Data Center',
    segment: 'GPU/AI',
  },
  {
    id: 'QCOM',
    name: 'Qualcomm',
    ticker: 'QCOM',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Mobile, Automotive, and ARM PC Competitor',
    financials: {
      revenue: '$38.9B',
      grossMargin: '55.9%',
      marketCap: '~$185B',
    },
    color: '#3253dc',
    marketShare: 8.4,
    processNodes: ['Snapdragon X Elite', '4nm', '3nm', '5G Modems'],
    industryCategory: 'Mobile & Connectivity',
    segment: 'ARM SoC',
  },
  {
    id: 'SSNLF',
    name: 'Samsung Semiconductor',
    ticker: '005930.KS',
    exchange: 'KRX',
    country: 'South Korea',
    relationship: 'IDM and Memory Competitor',
    financials: {
      revenue: '$200B',
      grossMargin: '13.0%',
      marketCap: '~$320B',
    },
    color: '#1428a0',
    marketShare: 7.2,
    processNodes: ['3nm GAA', '4nm', '5nm', '14nm'],
    industryCategory: 'Semiconductor IDM',
    segment: 'Logic & Memory',
  },
  {
    id: 'GLTC',
    name: 'GlobalTech',
    ticker: 'GLTC',
    exchange: 'NYSE',
    country: 'Taiwan',
    relationship: 'Pure-play Foundry Competitor for Intel Foundry Services',
    financials: {
      revenue: '$69.3B',
      grossMargin: '54.4%',
      marketCap: '~$900B',
    },
    color: '#b71c1c',
    marketShare: 6.8,
    processNodes: ['2nm', '3nm', '4nm', '5nm'],
    industryCategory: 'Semiconductor Foundry',
    segment: 'Foundry',
  },
  {
    id: 'ARM',
    name: 'Arm Holdings',
    ticker: 'ARM',
    exchange: 'NASDAQ',
    country: 'UK',
    relationship: 'CPU IP Architecture Competitor',
    financials: {
      revenue: '$3.2B',
      grossMargin: '97.4%',
      marketCap: '~$170B',
    },
    color: '#0091bd',
    marketShare: 5.1,
    processNodes: ['Armv9', 'Neoverse', 'Cortex-X', 'CSS'],
    industryCategory: 'Semiconductor IP',
    segment: 'CPU IP',
  },
  {
    id: 'AAPL',
    name: 'Apple',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Custom Silicon Competitor (M-series and A-series)',
    financials: {
      revenue: '$383.3B',
      grossMargin: '45.6%',
      marketCap: '~$2.9T',
    },
    color: '#555555',
    marketShare: 4.9,
    processNodes: ['M4', 'A18', '3nm', 'Neural Engine'],
    industryCategory: 'Consumer Electronics',
    segment: 'Custom Silicon',
  },
  {
    id: 'MTK',
    name: 'MediaTek',
    ticker: '2454.TW',
    exchange: 'TWSE',
    country: 'Taiwan',
    relationship: 'Mobile SoC Competitor',
    financials: {
      revenue: '$17.1B',
      grossMargin: '48.9%',
      marketCap: '~$50B',
    },
    color: '#ff6f00',
    marketShare: 4.3,
    processNodes: ['Dimensity 9400', '3nm', '6nm', 'Wi-Fi 7'],
    industryCategory: 'Semiconductor Fabless',
    segment: 'Mobile SoC',
  },
  {
    id: 'MRVL',
    name: 'Marvell Technology',
    ticker: 'MRVL',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Data Infrastructure and Custom Accelerator Competitor',
    financials: {
      revenue: '$5.5B',
      grossMargin: '47.9%',
      marketCap: '~$65B',
    },
    color: '#6d28d9',
    marketShare: 2.7,
    processNodes: ['5nm', '3nm', 'Custom XPU', 'CXL'],
    industryCategory: 'Networking & Cloud',
    segment: 'Data Infrastructure',
  },
];

export const TC_COMPETITORS = INTEL_COMPETITORS;

// ---------------------------------------------------------------------------
// Market share data (sorted high → low)
// ---------------------------------------------------------------------------

export const MARKET_SHARE_DATA: MarketShareEntry[] = [
  { id: 'INTC', name: 'Intel', marketShare: 60.1 },
  { id: 'AMD', name: 'AMD', marketShare: 39.9 },
  { id: 'NVDA', name: 'NVIDIA', marketShare: 18.5 },
  { id: 'QCOM', name: 'Qualcomm', marketShare: 8.4 },
  { id: 'SSNLF', name: 'Samsung Semiconductor', marketShare: 7.2 },
  { id: 'GLTC', name: 'GlobalTech', marketShare: 6.8 },
  { id: 'ARM', name: 'Arm Holdings', marketShare: 5.1 },
  { id: 'AAPL', name: 'Apple', marketShare: 4.9 },
  { id: 'MTK', name: 'MediaTek', marketShare: 4.3 },
  { id: 'MRVL', name: 'Marvell', marketShare: 2.7 },
];

// ---------------------------------------------------------------------------
// News feed
// ---------------------------------------------------------------------------

export const COMPETITOR_FEED: CompetitorFeedItem[] = [
  {
    id: 1,
    title: 'AMD Continues to Take x86 Server CPU Share as Intel Pushes Xeon 6 Refresh',
    tickers: ['INTC', 'AMD'],
    source: 'Mercury Research',
    time: 'Today, 9:20 AM',
    category: 'Market Share',
  },
  {
    id: 2,
    title: 'NVIDIA Extends AI Accelerator Lead, Keeping Pressure on Intel Gaudi Ramp',
    tickers: ['INTC', 'NVDA'],
    source: 'Reuters',
    time: 'Today, 8:40 AM',
    category: 'AI',
  },
  {
    id: 3,
    title: 'Qualcomm Snapdragon X Laptops Intensify Competition for Intel Core Ultra PCs',
    tickers: ['INTC', 'QCOM'],
    source: 'The Verge',
    time: 'Yesterday, 7:10 PM',
    category: 'PC',
  },
  {
    id: 4,
    title: 'GlobalTech 2nm Timetable Becomes Key Benchmark for Intel Foundry Services 18A Ambitions',
    tickers: ['INTC', 'GLTC'],
    source: 'Financial Times',
    time: 'Yesterday, 5:00 PM',
    category: 'Foundry',
  },
  {
    id: 5,
    title: 'Samsung Semiconductor Uses 3nm Narrative to Challenge Intel in Leading-Edge Manufacturing',
    tickers: ['INTC', 'SSNLF'],
    source: 'Bloomberg',
    time: 'Apr 2, 4:10 PM',
    category: 'Manufacturing',
  },
  {
    id: 6,
    title: 'Arm-Based Server Designs Gain Traction, Nudging Intel to Defend Data Center CPU Share',
    tickers: ['INTC', 'ARM'],
    source: 'SemiAnalysis',
    time: 'Apr 2, 11:35 AM',
    category: 'Data Center',
  },
  {
    id: 7,
    title: 'Apple M-Series Efficiency Narrative Keeps Competitive Pressure on Intel Notebook Roadmap',
    tickers: ['INTC', 'AAPL'],
    source: 'MacRumors',
    time: 'Apr 1, 3:15 PM',
    category: 'PC',
  },
  {
    id: 8,
    title: 'MediaTek and Qualcomm Raise the Stakes for Intel in the Next Wave of AI PCs',
    tickers: ['INTC', 'MTK', 'QCOM'],
    source: 'AnandTech',
    time: 'Apr 1, 9:45 AM',
    category: 'PC',
  },
  {
    id: 9,
    title: 'Marvell Custom Accelerator Momentum Highlights Intel Need for Broader Data Infrastructure Wins',
    tickers: ['INTC', 'MRVL'],
    source: 'Seeking Alpha',
    time: 'Mar 31, 4:20 PM',
    category: 'Networking',
  },
  {
    id: 10,
    title: 'Intel 18A Milestones Remain Central to Investor Debate Versus GlobalTech and Samsung',
    tickers: ['INTC', 'GLTC', 'SSNLF'],
    source: 'CNBC',
    time: 'Mar 31, 10:10 AM',
    category: 'Foundry',
  },
  {
    id: 11,
    title: 'AMD Notebook Attach Rate Rises at Major OEMs, Tightening the Fight with Intel Client CPUs',
    tickers: ['INTC', 'AMD'],
    source: 'DigiTimes',
    time: 'Mar 30, 1:30 PM',
    category: 'PC Demand',
  },
  {
    id: 12,
    title: 'NVIDIA, AMD, and Intel Each Signal More Aggressive AI Server Launch Cadence in 2025',
    tickers: ['INTC', 'NVDA', 'AMD'],
    source: "Barron's",
    time: 'Mar 29, 8:50 AM',
    category: 'Outlook',
  },
];
