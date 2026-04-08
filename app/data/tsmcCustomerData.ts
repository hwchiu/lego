// T Company Customer Network data
// Sources: T Company Annual Reports, company 10-K filings, public revenue disclosures (FY2023–FY2024)

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface CustomerNode {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
  country: string;
  relationship: string;
  purchaseItems: string;
  financials: {
    revenue: string;
    grossMargin: string;
    marketCap: string;
  };
  color: string;
  productCategories: string[];
  industryCategory: string;
  segment: string;
}

export interface CustomerEdge {
  from: string;
  to: string;
  transactionAmount: number;
  newsCoMentionCount: number;
  commonSupplierCount: number;
  commonCustomerCount: number;
  crossShareholdingRatio: number;
  commonBoardMembers: number;
}

export interface IndustrySummary {
  industry: string;
  totalAmount: number;
  customers: string[];
}

export interface CustomerFeedItem {
  id: number;
  title: string;
  tickers: string[];
  source: string;
  time: string;
  category: string;
}

export const CUSTOMER_RELATION_TYPES = [
  { key: 'transactionAmount', label: 'Transaction Amount' },
  { key: 'newsCoMentionCount', label: 'News Co-mention Count' },
  { key: 'commonSupplierCount', label: 'Common Supplier Count' },
  { key: 'commonCustomerCount', label: 'Common Customer Count' },
  { key: 'crossShareholdingRatio', label: 'Cross-shareholding Ratio' },
  { key: 'commonBoardMembers', label: 'Common Board Members' },
] as const;

export type CustomerRelationKey = (typeof CUSTOMER_RELATION_TYPES)[number]['key'];

// ---------------------------------------------------------------------------
// Center node (TC)
// ---------------------------------------------------------------------------

export const TSM_CUSTOMER_CENTER: CustomerNode = {
  id: 'TC',
  name: 'T Company',
  ticker: 'TC',
  exchange: 'NYSE / TWSE',
  country: 'Taiwan',
  relationship: 'Central Company — Pure-play Foundry',
  purchaseItems: '',
  financials: {
    revenue: '$69.3B',
    grossMargin: '54.4%',
    marketCap: '~$900B',
  },
  color: '#1a2332',
  productCategories: ['Logic Chips', 'Advanced Packaging'],
  industryCategory: 'Semiconductor Foundry',
  segment: 'Foundry',
};

// ---------------------------------------------------------------------------
// Customer nodes
// ---------------------------------------------------------------------------

export const TSM_CUSTOMERS: CustomerNode[] = [
  {
    id: 'AAPL',
    name: 'Apple',
    ticker: 'AAPL',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Largest Customer — Custom Silicon',
    purchaseItems: 'A17 Pro, M3/M4 SoC, custom AI silicon',
    financials: {
      revenue: '$383.3B',
      grossMargin: '45.6%',
      marketCap: '~$2.9T',
    },
    color: '#1565c0',
    productCategories: ['Smartphones', 'Personal Computers', 'Tablets', 'Wearables'],
    industryCategory: 'Consumer Electronics',
    segment: 'Consumer Electronics',
  },
  {
    id: 'NVDA',
    name: 'NVIDIA',
    ticker: 'NVDA',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'AI Accelerator & GPU Customer',
    purchaseItems: 'H100/H200/B100 GPUs, Grace CPU',
    financials: {
      revenue: '$60.9B',
      grossMargin: '72.7%',
      marketCap: '~$2.2T',
    },
    color: '#76b900',
    productCategories: ['AI Accelerators', 'Data Center GPUs', 'Automotive SoC'],
    industryCategory: 'AI & Data Center',
    segment: 'AI/Cloud',
  },
  {
    id: 'AMD',
    name: 'Advanced Micro Devices',
    ticker: 'AMD',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'CPU/GPU & FPGA Customer',
    purchaseItems: 'Ryzen CPUs, Instinct MI300X, Radeon GPUs',
    financials: {
      revenue: '$22.7B',
      grossMargin: '47.4%',
      marketCap: '~$230B',
    },
    color: '#ed1c24',
    productCategories: ['PC Processors', 'AI GPUs', 'Data Center CPUs'],
    industryCategory: 'PC & Data Center',
    segment: 'CPU/GPU',
  },
  {
    id: 'QCOM',
    name: 'Qualcomm',
    ticker: 'QCOM',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Mobile SoC & Connectivity Customer',
    purchaseItems: 'Snapdragon 8 Gen series, X-series modems',
    financials: {
      revenue: '$38.9B',
      grossMargin: '55.9%',
      marketCap: '~$185B',
    },
    color: '#3253dc',
    productCategories: ['Mobile SoC', '5G Modems', 'Automotive Chips'],
    industryCategory: 'Mobile & Connectivity',
    segment: 'Mobile SoC',
  },
  {
    id: 'AVGO',
    name: 'Broadcom',
    ticker: 'AVGO',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Networking & Custom ASIC Customer',
    purchaseItems: 'Custom AI XPUs, networking ASICs',
    financials: {
      revenue: '$51.6B',
      grossMargin: '67.9%',
      marketCap: '~$780B',
    },
    color: '#cc0000',
    productCategories: ['Networking ASICs', 'Custom AI Chips', 'Storage Controllers'],
    industryCategory: 'Networking & Cloud',
    segment: 'Networking',
  },
  {
    id: 'MTKMF',
    name: 'MediaTek',
    ticker: '2454.TW',
    exchange: 'TWSE',
    country: 'Taiwan',
    relationship: 'Mobile & IoT SoC Customer',
    purchaseItems: 'Dimensity 9300 series, T-series Wi-Fi SoC',
    financials: {
      revenue: '$16.3B',
      grossMargin: '47.1%',
      marketCap: '~$55B',
    },
    color: '#0891b2',
    productCategories: ['Mobile SoC', 'Smart TV Chips', 'IoT Processors'],
    industryCategory: 'Mobile & Connectivity',
    segment: 'Mobile SoC',
  },
  {
    id: 'MRVL',
    name: 'Marvell Technology',
    ticker: 'MRVL',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Data Infrastructure Silicon Customer',
    purchaseItems: 'Custom AI ASICs, data center PHY',
    financials: {
      revenue: '$5.5B',
      grossMargin: '47.9%',
      marketCap: '~$65B',
    },
    color: '#6d28d9',
    productCategories: ['Data Infrastructure', 'Custom AI ASICs', 'Optical DSP'],
    industryCategory: 'Networking & Cloud',
    segment: 'Networking',
  },
  {
    id: 'INTC',
    name: 'Intel',
    ticker: 'INTC',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Advanced Process Node Customer (partial)',
    purchaseItems: 'Meteor Lake tiles, Intel 3 test lots',
    financials: {
      revenue: '$54.2B',
      grossMargin: '41.7%',
      marketCap: '~$90B',
    },
    color: '#0068b5',
    productCategories: ['PC Processors', 'Data Center CPUs', 'AI Accelerators'],
    industryCategory: 'PC & Data Center',
    segment: 'CPU/GPU',
  },
  {
    id: 'SONY',
    name: 'Sony Group',
    ticker: 'SONY',
    exchange: 'NYSE',
    country: 'Japan',
    relationship: 'Image Sensor & PS5 SoC Customer',
    purchaseItems: 'PlayStation 5 SoC, CMOS image sensors',
    financials: {
      revenue: '$88.2B',
      grossMargin: '27.3%',
      marketCap: '~$105B',
    },
    color: '#1a1a1a',
    productCategories: ['Image Sensors', 'Gaming Consoles', 'Consumer Electronics'],
    industryCategory: 'Consumer Electronics',
    segment: 'Image Sensors',
  },
  {
    id: 'TXN',
    name: 'Texas Instruments',
    ticker: 'TXN',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Analog & Embedded Processing Customer',
    purchaseItems: 'High-performance analog ICs, embedded MCUs',
    financials: {
      revenue: '$17.5B',
      grossMargin: '65.8%',
      marketCap: '~$155B',
    },
    color: '#c0392b',
    productCategories: ['Analog Chips', 'Embedded Processors', 'Industrial ICs'],
    industryCategory: 'Industrial & Analog',
    segment: 'Analog/Mixed Signal',
  },
  {
    id: 'META', name: 'Meta Platforms', ticker: 'META', exchange: 'NASDAQ', country: 'USA',
    relationship: 'AI Chip Customer — Custom AI ASICs',
    purchaseItems: 'MTIA custom AI accelerator chips (N5/N3 node)',
    financials: { revenue: '$134.9B', grossMargin: '81.0%', marketCap: '~$1.3T' },
    color: '#1877f2', productCategories: ['AI Accelerators'], industryCategory: 'Technology', segment: 'AI/Cloud',
  },
  {
    id: 'AMZN', name: 'Amazon (AWS)', ticker: 'AMZN', exchange: 'NASDAQ', country: 'USA',
    relationship: 'Cloud Silicon Customer — Graviton & Trainium',
    purchaseItems: 'Graviton4 CPUs, Trainium2 ML chips',
    financials: { revenue: '$554B', grossMargin: '47.0%', marketCap: '~$2T' },
    color: '#ff9900', productCategories: ['Cloud CPUs', 'AI Training Chips'], industryCategory: 'Technology', segment: 'AI/Cloud',
  },
  {
    id: 'GOOGL', name: 'Google (Alphabet)', ticker: 'GOOGL', exchange: 'NASDAQ', country: 'USA',
    relationship: 'AI Chip Customer — TPU',
    purchaseItems: 'Custom TPU v5/v6 AI accelerators',
    financials: { revenue: '$307B', grossMargin: '57.4%', marketCap: '~$2.1T' },
    color: '#4285f4', productCategories: ['TPU Chips', 'AI Accelerators'], industryCategory: 'Technology', segment: 'AI/Cloud',
  },
  {
    id: 'MSFT', name: 'Microsoft', ticker: 'MSFT', exchange: 'NASDAQ', country: 'USA',
    relationship: 'AI Chip Customer — Maia AI',
    purchaseItems: 'Azure Maia AI accelerator chips',
    financials: { revenue: '$211B', grossMargin: '68.9%', marketCap: '~$3T' },
    color: '#0078d4', productCategories: ['AI Accelerators'], industryCategory: 'Technology', segment: 'AI/Cloud',
  },
  {
    id: 'ARM', name: 'Arm Holdings', ticker: 'ARM', exchange: 'NASDAQ', country: 'UK',
    relationship: 'IP Core Customer — Chip Design',
    purchaseItems: 'Advanced process node test chips & partner tape-outs',
    financials: { revenue: '$3.2B', grossMargin: '97.4%', marketCap: '~$170B' },
    color: '#0091bd', productCategories: ['CPU IP Cores'], industryCategory: 'Semiconductor IP', segment: 'IP Cores',
  },
  {
    id: 'STM', name: 'STMicroelectronics', ticker: 'STM', exchange: 'NYSE', country: 'Switzerland',
    relationship: 'Customer — Automotive & Industrial',
    purchaseItems: 'Advanced automotive microcontrollers, power ICs',
    financials: { revenue: '$17.3B', grossMargin: '41.7%', marketCap: '~$22B' },
    color: '#003087', productCategories: ['Automotive ICs', 'Power Management'], industryCategory: 'Semiconductor IDM', segment: 'Automotive',
  },
  {
    id: 'NXP', name: 'NXP Semiconductors', ticker: 'NXPI', exchange: 'NASDAQ', country: 'Netherlands',
    relationship: 'Customer — Automotive Chips',
    purchaseItems: 'S32 automotive processors, radar ICs',
    financials: { revenue: '$12.6B', grossMargin: '57.5%', marketCap: '~$50B' },
    color: '#ff6600', productCategories: ['Automotive Processors', 'Radar ICs'], industryCategory: 'Semiconductor IDM', segment: 'Automotive',
  },
  {
    id: 'ADI', name: 'Analog Devices', ticker: 'ADI', exchange: 'NASDAQ', country: 'USA',
    relationship: 'Customer — Analog & Mixed Signal',
    purchaseItems: 'High-performance analog ICs, data converters',
    financials: { revenue: '$9.4B', grossMargin: '67.6%', marketCap: '~$90B' },
    color: '#0033a0', productCategories: ['Analog ICs', 'Data Converters'], industryCategory: 'Semiconductor IDM', segment: 'Analog/Mixed Signal',
  },
  {
    id: 'MCHP', name: 'Microchip Technology', ticker: 'MCHP', exchange: 'NASDAQ', country: 'USA',
    relationship: 'Customer — MCU & Analog',
    purchaseItems: 'PIC32 microcontrollers, dsPIC DSPs',
    financials: { revenue: '$5.8B', grossMargin: '65.9%', marketCap: '~$20B' },
    color: '#e31837', productCategories: ['Microcontrollers', 'DSPs'], industryCategory: 'Semiconductor IDM', segment: 'Microcontrollers',
  },
  {
    id: 'MTEKF', name: 'MediaTek', ticker: '2454.TW', exchange: 'TWSE', country: 'Taiwan',
    relationship: 'Major Customer — Mobile SoCs',
    purchaseItems: 'Dimensity 9400 & Dimensity 6000 mobile SoCs (N3/N4)',
    financials: { revenue: '$17.1B', grossMargin: '48.9%', marketCap: '~$50B' },
    color: '#e0222a', productCategories: ['Mobile SoCs', 'Wi-Fi Chips'], industryCategory: 'Semiconductor Fabless', segment: 'Mobile SoC',
  },
  {
    id: 'HIMAX', name: 'Himax Technologies', ticker: 'HIMX', exchange: 'NASDAQ', country: 'Taiwan',
    relationship: 'Customer — Display Drivers',
    purchaseItems: 'OLED display driver ICs, LCOS panels',
    financials: { revenue: '$0.9B', grossMargin: '35.8%', marketCap: '~$0.8B' },
    color: '#0a6abf', productCategories: ['Display Driver ICs', 'LCOS'], industryCategory: 'Semiconductor Fabless', segment: 'Display',
  },
  {
    id: 'CRUS', name: 'Cirrus Logic', ticker: 'CRUS', exchange: 'NASDAQ', country: 'USA',
    relationship: 'Customer — Audio Chips',
    purchaseItems: 'Smart codec & audio amplifier ICs for Apple devices',
    financials: { revenue: '$1.9B', grossMargin: '53.0%', marketCap: '~$5B' },
    color: '#204b5c', productCategories: ['Smart Codecs', 'Audio Amplifiers'], industryCategory: 'Semiconductor Fabless', segment: 'Audio',
  },
];

// ---------------------------------------------------------------------------
// Customer edges (TC → Customer, supplier → customer direction)
// ---------------------------------------------------------------------------

export const CUSTOMER_EDGES: CustomerEdge[] = [
  {
    from: 'TC',
    to: 'AAPL',
    transactionAmount: 17500,
    newsCoMentionCount: 524,
    commonSupplierCount: 12,
    commonCustomerCount: 2,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'NVDA',
    transactionAmount: 9200,
    newsCoMentionCount: 398,
    commonSupplierCount: 8,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'AMD',
    transactionAmount: 6500,
    newsCoMentionCount: 312,
    commonSupplierCount: 9,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'QCOM',
    transactionAmount: 5500,
    newsCoMentionCount: 287,
    commonSupplierCount: 7,
    commonCustomerCount: 5,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'AVGO',
    transactionAmount: 4800,
    newsCoMentionCount: 245,
    commonSupplierCount: 6,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'MTKMF',
    transactionAmount: 4500,
    newsCoMentionCount: 198,
    commonSupplierCount: 5,
    commonCustomerCount: 2,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'MRVL',
    transactionAmount: 2400,
    newsCoMentionCount: 156,
    commonSupplierCount: 4,
    commonCustomerCount: 2,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'INTC',
    transactionAmount: 3200,
    newsCoMentionCount: 289,
    commonSupplierCount: 11,
    commonCustomerCount: 5,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'SONY',
    transactionAmount: 2000,
    newsCoMentionCount: 134,
    commonSupplierCount: 3,
    commonCustomerCount: 1,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TC',
    to: 'TXN',
    transactionAmount: 800,
    newsCoMentionCount: 78,
    commonSupplierCount: 2,
    commonCustomerCount: 1,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
];

// ---------------------------------------------------------------------------
// Industry transaction summary (for summary cards)
// ---------------------------------------------------------------------------

export const INDUSTRY_TRANSACTION_SUMMARY: IndustrySummary[] = [
  { industry: 'Consumer Electronics', totalAmount: 19500, customers: ['AAPL', 'SONY'] },
  { industry: 'Mobile & Connectivity', totalAmount: 10000, customers: ['QCOM', 'MTKMF'] },
  { industry: 'PC & Data Center', totalAmount: 9700, customers: ['AMD', 'INTC'] },
  { industry: 'AI & Data Center', totalAmount: 9200, customers: ['NVDA'] },
  { industry: 'Networking & Cloud', totalAmount: 7200, customers: ['AVGO', 'MRVL'] },
  { industry: 'Industrial & Analog', totalAmount: 800, customers: ['TXN'] },
];

// ---------------------------------------------------------------------------
// News feed
// ---------------------------------------------------------------------------

export const CUSTOMER_FEED: CustomerFeedItem[] = [
  {
    id: 1,
    title: 'Apple Secures Exclusive T Company 3nm Capacity for iPhone 16 Pro A17 Pro Chip Through 2025',
    tickers: ['AAPL', 'TC'],
    source: 'Bloomberg',
    time: 'Today, 9:15 AM',
    category: 'Supply Chain',
  },
  {
    id: 2,
    title: 'NVIDIA Places Record T Company CoWoS-L Orders for H200 and Upcoming B100 GPU Production',
    tickers: ['NVDA', 'TC'],
    source: 'Reuters',
    time: 'Today, 8:30 AM',
    category: 'Capacity',
  },
  {
    id: 3,
    title: "AMD's Instinct MI300X Ramps at T Company N5, Signals Strong AI Datacenter Demand in 2025",
    tickers: ['AMD', 'TC'],
    source: 'Seeking Alpha',
    time: 'Yesterday, 6:00 PM',
    category: 'Earnings',
  },
  {
    id: 4,
    title: 'Qualcomm Snapdragon 8 Gen 4 Tape-Out at T Company N3E Confirmed for Late 2024 Volume Ramp',
    tickers: ['QCOM', 'TC'],
    source: 'AnandTech',
    time: 'Yesterday, 4:45 PM',
    category: 'Supply Chain',
  },
  {
    id: 5,
    title: "Broadcom's Custom XPU Business on Track for $10B Revenue, All Chips Fabbed at T Company",
    tickers: ['AVGO', 'TC'],
    source: 'Financial Times',
    time: 'Apr 2, 3:00 PM',
    category: 'Earnings',
  },
  {
    id: 6,
    title: 'MediaTek Dimensity 9400 Tape-Out at T Company N3E, Targets Flagship Android Market',
    tickers: ['MTKMF', 'TC'],
    source: 'Nikkei Asia',
    time: 'Apr 2, 11:00 AM',
    category: 'Supply Chain',
  },
  {
    id: 7,
    title: 'Marvell Unveils Next-Gen Custom AI Silicon Platform Built on T Company 3nm Process',
    tickers: ['MRVL', 'TC'],
    source: 'Business Wire',
    time: 'Apr 1, 9:30 AM',
    category: 'Strategy',
  },
  {
    id: 8,
    title: 'Intel Foundry Services Transfers Meteor Lake Tile Production to T Company for Holiday Demand',
    tickers: ['INTC', 'TC'],
    source: "Tom's Hardware",
    time: 'Mar 31, 2:00 PM',
    category: 'Geopolitical',
  },
  {
    id: 9,
    title: "Sony's Next-Gen Image Sensor Adopts T Company Stacked Process, Enabling 8K at 60fps",
    tickers: ['SONY', 'TC'],
    source: 'Nikkei',
    time: 'Mar 31, 10:00 AM',
    category: 'Strategy',
  },
  {
    id: 10,
    title: 'Texas Instruments Dual-Sources Analog Lines from T Company Specialty Fabs Amid Tariff Risks',
    tickers: ['TXN', 'TC'],
    source: 'Reuters',
    time: 'Mar 30, 8:00 AM',
    category: 'Tariff',
  },
  {
    id: 11,
    title: 'T Company Arizona Fab Begins 4nm Apple Silicon Production, Easing US Geopolitical Supply Concerns',
    tickers: ['TC', 'AAPL'],
    source: 'The Verge',
    time: 'Mar 29, 2:00 PM',
    category: 'Geopolitical',
  },
  {
    id: 12,
    title: 'NVIDIA and T Company Sign Long-Term Advanced Packaging Deal for CoWoS and SoIC Technologies',
    tickers: ['NVDA', 'TC'],
    source: 'SA News',
    time: 'Mar 28, 11:00 AM',
    category: 'Capacity',
  },
];
