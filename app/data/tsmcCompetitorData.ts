// T Company Competitor Network data
// Sources: TrendForce, IDC, company annual reports, analyst research (FY2023–FY2024)

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
// Center node (TC)
// ---------------------------------------------------------------------------

export const TSM_COMPETITOR_CENTER: CompetitorNode = {
  id: 'TC',
  name: 'T Company',
  ticker: 'TC',
  exchange: 'NYSE / TWSE',
  country: 'Taiwan',
  relationship: 'Central Company — Pure-play Foundry',
  financials: {
    revenue: '$69.3B',
    grossMargin: '54.4%',
    marketCap: '~$900B',
  },
  color: '#1a2332',
  marketShare: 62.3,
  processNodes: ['2nm', '3nm', '4nm', '5nm', '7nm', '28nm'],
  industryCategory: 'Advanced Foundry',
  segment: 'Foundry',
};

// ---------------------------------------------------------------------------
// Competitor nodes (sorted by market share descending)
// ---------------------------------------------------------------------------

export const TSM_COMPETITORS: CompetitorNode[] = [
  {
    id: 'SSNLF',
    name: 'Samsung Foundry',
    ticker: '005930.KS',
    exchange: 'KRX',
    country: 'South Korea',
    relationship: 'Primary Competitor — Advanced Logic Foundry',
    financials: {
      revenue: '$15.8B',
      grossMargin: '31.2%',
      marketCap: '~$290B',
    },
    color: '#1428a0',
    marketShare: 11.3,
    processNodes: ['3nm GAA', '4nm', '5nm', '8nm', '14nm'],
    industryCategory: 'Advanced Foundry',
    segment: 'Advanced Foundry',
  },
  {
    id: 'UMC',
    name: 'United Microelectronics',
    ticker: 'UMC',
    exchange: 'NYSE',
    country: 'Taiwan',
    relationship: 'Mature Node Competitor — Specialty Process',
    financials: {
      revenue: '$8.0B',
      grossMargin: '34.2%',
      marketCap: '~$18B',
    },
    color: '#0070c0',
    marketShare: 6.3,
    processNodes: ['22nm', '28nm', '40nm', '65nm'],
    industryCategory: 'Mature Node Foundry',
    segment: 'Mature Node Foundry',
  },
  {
    id: 'GFS',
    name: 'GlobalFoundries',
    ticker: 'GFS',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Mature Node Competitor — Specialty & RF',
    financials: {
      revenue: '$7.4B',
      grossMargin: '27.5%',
      marketCap: '~$17B',
    },
    color: '#e31937',
    marketShare: 6.0,
    processNodes: ['12nm', '14nm', '22nm', '28nm', '55nm'],
    industryCategory: 'Mature Node Foundry',
    segment: 'Specialty Foundry',
  },
  {
    id: 'SMICY',
    name: 'SMIC',
    ticker: '0981.HK',
    exchange: 'HKEX / SSE',
    country: 'China',
    relationship: 'Mature Node Competitor — Domestic China Foundry',
    financials: {
      revenue: '$8.3B',
      grossMargin: '22.3%',
      marketCap: '~$23B',
    },
    color: '#c0392b',
    marketShare: 5.7,
    processNodes: ['28nm', '40nm', '55nm', '90nm'],
    industryCategory: 'Mature Node Foundry',
    segment: 'Mature Node Foundry',
  },
  {
    id: 'HHGR',
    name: 'Hua Hong Semiconductor',
    ticker: '1347.HK',
    exchange: 'HKEX',
    country: 'China',
    relationship: 'Power & Embedded Flash Competitor',
    financials: {
      revenue: '$2.3B',
      grossMargin: '8.5%',
      marketCap: '~$3.1B',
    },
    color: '#6d4c41',
    marketShare: 2.2,
    processNodes: ['65nm', '90nm', '130nm', '180nm'],
    industryCategory: 'Specialty Foundry',
    segment: 'Specialty Foundry',
  },
  {
    id: 'INTC_F',
    name: 'Intel Foundry',
    ticker: 'INTC',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Emerging Advanced Node Competitor',
    financials: {
      revenue: '$4.4B',
      grossMargin: '-31.0%',
      marketCap: '~$90B',
    },
    color: '#0071c5',
    marketShare: 2.0,
    processNodes: ['Intel 3', 'Intel 18A', 'Intel 20A'],
    industryCategory: 'Advanced Foundry',
    segment: 'Advanced Foundry',
  },
  {
    id: 'PSMC',
    name: 'Powerchip Semiconductor',
    ticker: '6269.TW',
    exchange: 'TWSE',
    country: 'Taiwan',
    relationship: 'DRAM & Logic Mature Node Competitor',
    financials: {
      revenue: '$1.8B',
      grossMargin: '19.1%',
      marketCap: '~$3.8B',
    },
    color: '#7b1fa2',
    marketShare: 1.5,
    processNodes: ['40nm', '55nm', '90nm'],
    industryCategory: 'Mature Node Foundry',
    segment: 'DRAM/Specialty',
  },
  {
    id: 'TSEM',
    name: 'Tower Semiconductor',
    ticker: 'TSEM',
    exchange: 'NASDAQ',
    country: 'Israel',
    relationship: 'Specialty Analog & Mixed-Signal Competitor',
    financials: {
      revenue: '$1.5B',
      grossMargin: '24.3%',
      marketCap: '~$5.7B',
    },
    color: '#2e7d32',
    marketShare: 1.2,
    processNodes: ['SiGe', 'RF CMOS', '180nm', '350nm'],
    industryCategory: 'Specialty Foundry',
    segment: 'Analog/MEMS',
  },
  {
    id: 'IFXGF', name: 'Infineon Technologies', ticker: 'IFNNY', exchange: 'OTC', country: 'Germany',
    relationship: 'IDM Competitor — Power & Auto',
    financials: { revenue: '$14.5B', grossMargin: '45.8%', marketCap: '~$30B' },
    color: '#009e73', marketShare: 0.4, processNodes: ['28nm', '40nm', '65nm', '130nm'],
    industryCategory: 'Semiconductor IDM', segment: 'Power/Automotive',
  },
  {
    id: 'RENESAS', name: 'Renesas Electronics', ticker: '6723.T', exchange: 'TSE', country: 'Japan',
    relationship: 'IDM Competitor — MCU & Automotive',
    financials: { revenue: '$12.1B', grossMargin: '52.3%', marketCap: '~$20B' },
    color: '#d62728', marketShare: 0.3, processNodes: ['28nm', '40nm', '90nm'],
    industryCategory: 'Semiconductor IDM', segment: 'Microcontrollers',
  },
  {
    id: 'ROHM', name: 'ROHM Semiconductor', ticker: '6963.T', exchange: 'TSE', country: 'Japan',
    relationship: 'IDM Competitor — Analog & Power',
    financials: { revenue: '$3.8B', grossMargin: '43.6%', marketCap: '~$5B' },
    color: '#8c564b', marketShare: 0.2, processNodes: ['65nm', '130nm', '350nm'],
    industryCategory: 'Semiconductor IDM', segment: 'Analog/Power',
  },
  {
    id: 'XFAB', name: 'X-Fab Semiconductor', ticker: 'XFAB', exchange: 'Euronext', country: 'Germany',
    relationship: 'Specialty Foundry — Analog & MEMS',
    financials: { revenue: '$0.8B', grossMargin: '35.2%', marketCap: '~$1.2B' },
    color: '#1f77b4', marketShare: 0.3, processNodes: ['130nm', '180nm', '350nm'],
    industryCategory: 'Specialty Foundry', segment: 'Analog/MEMS',
  },
  {
    id: 'PSMC2', name: 'Powerchip Semiconductor (New)', ticker: '6239.TW', exchange: 'TWSE', country: 'Taiwan',
    relationship: 'DRAM/Specialty Foundry',
    financials: { revenue: '$2.8B', grossMargin: '28.9%', marketCap: '~$4.5B' },
    color: '#ff7f0e', marketShare: 1.1, processNodes: ['40nm', '65nm', '90nm'],
    industryCategory: 'Memory Foundry', segment: 'DRAM/Specialty',
  },
  {
    id: 'VGSC', name: 'Vanguard International Semiconductor', ticker: '5347.TW', exchange: 'TWSE', country: 'Taiwan',
    relationship: 'Mature Node Foundry — Power & Driver',
    financials: { revenue: '$1.9B', grossMargin: '36.7%', marketCap: '~$4.2B' },
    color: '#bcbd22', marketShare: 1.5, processNodes: ['90nm', '110nm', '150nm', '180nm'],
    industryCategory: 'Mature Node Foundry', segment: 'Power/Driver IC',
  },
];

// ---------------------------------------------------------------------------
// Market share data (sorted high → low)
// ---------------------------------------------------------------------------

export const MARKET_SHARE_DATA: MarketShareEntry[] = [
  { id: 'TC', name: 'T Company', marketShare: 62.3 },
  { id: 'SSNLF', name: 'Samsung Foundry', marketShare: 11.3 },
  { id: 'UMC', name: 'UMC', marketShare: 6.3 },
  { id: 'GFS', name: 'GlobalFoundries', marketShare: 6.0 },
  { id: 'SMICY', name: 'SMIC', marketShare: 5.7 },
  { id: 'HHGR', name: 'Hua Hong Semiconductor', marketShare: 2.2 },
  { id: 'INTC_F', name: 'Intel Foundry', marketShare: 2.0 },
  { id: 'PSMC', name: 'Powerchip', marketShare: 1.5 },
  { id: 'TSEM', name: 'Tower Semiconductor', marketShare: 1.2 },
];

// ---------------------------------------------------------------------------
// News feed
// ---------------------------------------------------------------------------

export const COMPETITOR_FEED: CompetitorFeedItem[] = [
  {
    id: 1,
    title: 'Samsung Foundry Struggles with 3nm GAA Yield, T Company Widens Advanced Node Lead',
    tickers: ['SSNLF', 'TC'],
    source: 'Bloomberg',
    time: 'Today, 9:20 AM',
    category: 'Strategy',
  },
  {
    id: 2,
    title: 'GlobalFoundries Doubles Down on RF and Auto-Grade Chips as T Company Avoids Mature Nodes',
    tickers: ['GFS', 'TC'],
    source: 'Reuters',
    time: 'Today, 8:45 AM',
    category: 'Strategy',
  },
  {
    id: 3,
    title: 'SMIC Achieves 7nm-Class Chip Using Immersion DUV Litho Despite US Export Restrictions',
    tickers: ['SMICY', 'TC'],
    source: 'Nikkei Asia',
    time: 'Yesterday, 7:00 PM',
    category: 'Geopolitical',
  },
  {
    id: 4,
    title: 'Intel Foundry 18A Process Enters Risk Production — CEO Eyes T Company Customers',
    tickers: ['INTC_F', 'TC'],
    source: 'The Register',
    time: 'Yesterday, 5:30 PM',
    category: 'Strategy',
  },
  {
    id: 5,
    title: 'UMC Partners with Intel for 12nm Production in US, Competing With T Company Specialty Lines',
    tickers: ['UMC', 'INTC_F', 'TC'],
    source: 'Financial Times',
    time: 'Apr 2, 4:00 PM',
    category: 'Supply Chain',
  },
  {
    id: 6,
    title: 'Samsung Foundry Wins Major Qualcomm Snapdragon Order, Pressuring T Company Exclusivity',
    tickers: ['SSNLF', 'TC'],
    source: 'Korea Herald',
    time: 'Apr 2, 10:00 AM',
    category: 'Earnings',
  },
  {
    id: 7,
    title: 'Tower Semiconductor Expands Power IC Capacity at Newport Beach Fab, Targeting EV Market',
    tickers: ['TSEM', 'TC'],
    source: 'Business Wire',
    time: 'Apr 1, 11:00 AM',
    category: 'Capacity',
  },
  {
    id: 8,
    title: 'Hua Hong Semiconductor Revenue Declines as SMIC Absorbs Domestic China Chip Orders',
    tickers: ['HHGR', 'SMICY'],
    source: 'Caixin',
    time: 'Mar 31, 3:00 PM',
    category: 'Earnings',
  },
  {
    id: 9,
    title: 'US Export Controls Push SMIC to 28nm Specialization, Ceding Advanced Node Ground to T Company',
    tickers: ['SMICY', 'TC'],
    source: 'Reuters',
    time: 'Mar 31, 9:00 AM',
    category: 'Geopolitical',
  },
  {
    id: 10,
    title: "Intel CEO Confirms 18A Yield on Track — 'We Are in the Race' Against T Company and Samsung",
    tickers: ['INTC_F', 'TC', 'SSNLF'],
    source: 'CNBC',
    time: 'Mar 30, 1:00 PM',
    category: 'Strategy',
  },
  {
    id: 11,
    title: 'Powerchip PSMC Plans Joint Venture Fab in India to Serve Local Auto and Consumer Demand',
    tickers: ['PSMC', 'TC'],
    source: 'Economic Times',
    time: 'Mar 29, 10:00 AM',
    category: 'Capacity',
  },
  {
    id: 12,
    title: 'GlobalFoundries Reports Q4 Beat on Automotive Revenue, Raises 2025 Capacity Guidance',
    tickers: ['GFS', 'TC'],
    source: 'Seeking Alpha',
    time: 'Mar 28, 4:00 PM',
    category: 'Earnings',
  },
];
