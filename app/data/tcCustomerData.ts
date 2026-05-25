// Intel Customer Network data
// Sources: Intel Annual Reports, OEM disclosures, hyperscaler infrastructure commentary (FY2023–FY2024)

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
// Center node (INTC)
// ---------------------------------------------------------------------------

export const INTEL_CUSTOMER_CENTER: CustomerNode = {
  id: 'INTC',
  name: 'Intel Corporation',
  ticker: 'INTC',
  exchange: 'NASDAQ',
  country: 'USA',
  relationship: 'Central Company — Integrated Device Manufacturer (IDM)',
  purchaseItems: '',
  financials: {
    revenue: '$54.2B',
    grossMargin: '41.7%',
    marketCap: '~$90B',
  },
  color: '#1a2332',
  productCategories: ['PC CPUs', 'Server CPUs', 'AI Accelerators', 'Foundry Services'],
  industryCategory: 'Semiconductor IDM',
  segment: 'IDM',
};

export const TC_CUSTOMER_CENTER = INTEL_CUSTOMER_CENTER;

// ---------------------------------------------------------------------------
// Customer nodes
// ---------------------------------------------------------------------------

export const INTEL_CUSTOMERS: CustomerNode[] = [
  {
    id: 'HPQ',
    name: 'HP Inc',
    ticker: 'HPQ',
    exchange: 'NYSE',
    country: 'USA',
    relationship: 'Largest PC OEM Customer — Core Ultra & vPro Platforms',
    purchaseItems: 'Intel Core Ultra notebook CPUs, vPro enterprise platforms, workstation processors',
    financials: {
      revenue: '$53.6B',
      grossMargin: '21.4%',
      marketCap: '~$15B',
    },
    color: '#0096d6',
    productCategories: ['Commercial PCs', 'Consumer Laptops', 'Workstations'],
    industryCategory: 'PC OEM',
    segment: 'PC & Client',
  },
  {
    id: 'DELL',
    name: 'Dell Technologies',
    ticker: 'DELL',
    exchange: 'NYSE',
    country: 'USA',
    relationship: 'Enterprise PC & Server OEM Customer',
    purchaseItems: 'Intel Core Ultra CPUs, Xeon 6 processors, enterprise motherboard chipsets',
    financials: {
      revenue: '$88.4B',
      grossMargin: '21.9%',
      marketCap: '~$90B',
    },
    color: '#0076ce',
    productCategories: ['Enterprise PCs', 'PowerEdge Servers', 'Workstations'],
    industryCategory: 'Enterprise Hardware',
    segment: 'Server & Enterprise',
  },
  {
    id: 'LENOVO',
    name: 'Lenovo Group',
    ticker: '0992.HK',
    exchange: 'HKEX',
    country: 'China',
    relationship: '#1 Global PC Maker — Client & Workstation CPU Customer',
    purchaseItems: 'Intel Core Ultra notebook processors, workstation Xeon CPUs, commercial desktop platforms',
    financials: {
      revenue: '$79.1B',
      grossMargin: '16.5%',
      marketCap: '~$14B',
    },
    color: '#e2231a',
    productCategories: ['Notebooks', 'Desktops', 'Workstations', 'Commercial PCs'],
    industryCategory: 'PC OEM',
    segment: 'PC & Client',
  },
  {
    id: 'MSFT',
    name: 'Microsoft',
    ticker: 'MSFT',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Cloud Platform Customer — Azure Xeon & Gaudi Deployments',
    purchaseItems: 'Intel Xeon server CPUs, Intel Gaudi AI accelerators, networking and security silicon',
    financials: {
      revenue: '$245.1B',
      grossMargin: '69.8%',
      marketCap: '~$3.1T',
    },
    color: '#0078d4',
    productCategories: ['Cloud Infrastructure', 'Enterprise AI', 'Server Platforms'],
    industryCategory: 'Cloud Computing',
    segment: 'Data Center & AI',
  },
  {
    id: 'AMZN',
    name: 'Amazon/AWS',
    ticker: 'AMZN',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Hyperscale Cloud Customer — Xeon-Based Compute Fleets',
    purchaseItems: 'Intel Xeon processors for EC2 fleets, storage controllers, networking silicon',
    financials: {
      revenue: '$574.8B',
      grossMargin: '48.3%',
      marketCap: '~$1.9T',
    },
    color: '#ff9900',
    productCategories: ['Cloud Infrastructure', 'Compute Instances', 'Data Center Servers'],
    industryCategory: 'Cloud Computing',
    segment: 'Cloud Infrastructure',
  },
  {
    id: 'GOOGL',
    name: 'Google/Alphabet',
    ticker: 'GOOGL',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Data Center & AI Infrastructure Customer',
    purchaseItems: 'Intel Xeon CPUs for Google Cloud servers, AI host processors, networking platforms',
    financials: {
      revenue: '$307.4B',
      grossMargin: '58.1%',
      marketCap: '~$2.0T',
    },
    color: '#4285f4',
    productCategories: ['Cloud Servers', 'AI Infrastructure', 'Data Center Platforms'],
    industryCategory: 'Cloud Computing',
    segment: 'Cloud Infrastructure',
  },
  {
    id: 'META',
    name: 'Meta',
    ticker: 'META',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Data Center & AI Server Customer',
    purchaseItems: 'Intel Xeon server CPUs, rack-scale host processors, accelerator control silicon',
    financials: {
      revenue: '$134.9B',
      grossMargin: '81.0%',
      marketCap: '~$1.2T',
    },
    color: '#1877f2',
    productCategories: ['AI Servers', 'Data Center Systems', 'Rack Infrastructure'],
    industryCategory: 'Internet Platform',
    segment: 'Data Center & AI',
  },
  {
    id: 'SMCI',
    name: 'SuperMicro Computer',
    ticker: 'SMCI',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Server ODM Customer — Xeon Platform Integrator',
    purchaseItems: 'Intel Xeon 6 CPUs, server motherboards, accelerator-ready rack platforms',
    financials: {
      revenue: '$14.9B',
      grossMargin: '15.5%',
      marketCap: '~$40B',
    },
    color: '#00a651',
    productCategories: ['Server Platforms', 'AI Racks', 'Enterprise Motherboards'],
    industryCategory: 'Server ODM',
    segment: 'Server & Enterprise',
  },
  {
    id: 'ASUS',
    name: 'ASUSTeK Computer',
    ticker: '2357.TW',
    exchange: 'TWSE',
    country: 'Taiwan',
    relationship: 'PC & Server OEM Customer',
    purchaseItems: 'Intel Core Ultra notebook CPUs, gaming desktop processors, Xeon server platforms',
    financials: {
      revenue: '$18.1B',
      grossMargin: '17.4%',
      marketCap: '~$15B',
    },
    color: '#0057b8',
    productCategories: ['Laptops', 'Gaming PCs', 'Servers', 'Motherboards'],
    industryCategory: 'PC OEM',
    segment: 'PC & Client',
  },
  {
    id: 'ACER',
    name: 'Acer',
    ticker: '2353.TW',
    exchange: 'TWSE',
    country: 'Taiwan',
    relationship: 'PC OEM Customer — Mainstream Notebook CPU Buyer',
    purchaseItems: 'Intel Core Ultra notebook processors, Chromebook CPUs, commercial desktop platforms',
    financials: {
      revenue: '$8.4B',
      grossMargin: '10.8%',
      marketCap: '~$4.5B',
    },
    color: '#83b81a',
    productCategories: ['Notebooks', 'Chromebooks', 'Desktop PCs'],
    industryCategory: 'PC OEM',
    segment: 'PC & Client',
  },
];

export const TC_CUSTOMERS = INTEL_CUSTOMERS;

// ---------------------------------------------------------------------------
// Customer edges (INTC → Customer, Intel supply direction)
// ---------------------------------------------------------------------------

export const CUSTOMER_EDGES: CustomerEdge[] = [
  {
    from: 'INTC',
    to: 'HPQ',
    transactionAmount: 5200,
    newsCoMentionCount: 246,
    commonSupplierCount: 9,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'DELL',
    transactionAmount: 4900,
    newsCoMentionCount: 231,
    commonSupplierCount: 8,
    commonCustomerCount: 5,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'LENOVO',
    transactionAmount: 5600,
    newsCoMentionCount: 219,
    commonSupplierCount: 7,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'MSFT',
    transactionAmount: 3600,
    newsCoMentionCount: 214,
    commonSupplierCount: 10,
    commonCustomerCount: 6,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'AMZN',
    transactionAmount: 3300,
    newsCoMentionCount: 201,
    commonSupplierCount: 9,
    commonCustomerCount: 6,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'GOOGL',
    transactionAmount: 3000,
    newsCoMentionCount: 188,
    commonSupplierCount: 8,
    commonCustomerCount: 5,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'META',
    transactionAmount: 2400,
    newsCoMentionCount: 174,
    commonSupplierCount: 8,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'SMCI',
    transactionAmount: 2100,
    newsCoMentionCount: 169,
    commonSupplierCount: 6,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'ASUS',
    transactionAmount: 1800,
    newsCoMentionCount: 144,
    commonSupplierCount: 5,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'INTC',
    to: 'ACER',
    transactionAmount: 1500,
    newsCoMentionCount: 128,
    commonSupplierCount: 5,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
];

// ---------------------------------------------------------------------------
// Industry transaction summary (for summary cards)
// ---------------------------------------------------------------------------

export const INDUSTRY_TRANSACTION_SUMMARY: IndustrySummary[] = [
  { industry: 'PC & Client', totalAmount: 14100, customers: ['HPQ', 'LENOVO', 'ASUS', 'ACER'] },
  { industry: 'Data Center & AI', totalAmount: 6000, customers: ['MSFT', 'META'] },
  { industry: 'Cloud Infrastructure', totalAmount: 6300, customers: ['AMZN', 'GOOGL'] },
  { industry: 'Server & Enterprise', totalAmount: 7000, customers: ['DELL', 'SMCI'] },
];

// ---------------------------------------------------------------------------
// News feed
// ---------------------------------------------------------------------------

export const CUSTOMER_FEED: CustomerFeedItem[] = [
  {
    id: 1,
    title: 'HP and Dell Ramp Intel Core Ultra Shipments for Back-to-School Season',
    tickers: ['INTC', 'HPQ', 'DELL'],
    source: 'Bloomberg',
    time: 'Today, 9:15 AM',
    category: 'PC Demand',
  },
  {
    id: 2,
    title: 'Lenovo Broadens ThinkPad AI PC Portfolio Around Intel Core Ultra vPro Platforms',
    tickers: ['INTC', 'LENOVO'],
    source: 'Nikkei Asia',
    time: 'Today, 8:25 AM',
    category: 'Product',
  },
  {
    id: 3,
    title: 'Microsoft Azure Expands Intel Xeon Infrastructure for Enterprise AI Workloads',
    tickers: ['INTC', 'MSFT'],
    source: 'Reuters',
    time: 'Yesterday, 6:40 PM',
    category: 'Cloud',
  },
  {
    id: 4,
    title: 'AWS Keeps Adding Intel Xeon-Based EC2 Capacity for Balanced General-Purpose Instances',
    tickers: ['INTC', 'AMZN'],
    source: 'The Information',
    time: 'Yesterday, 4:50 PM',
    category: 'Cloud',
  },
  {
    id: 5,
    title: 'Google Cloud Refreshes Internal Server Fleet with New Intel Xeon Platforms',
    tickers: ['INTC', 'GOOGL'],
    source: 'Seeking Alpha',
    time: 'Apr 2, 3:30 PM',
    category: 'Infrastructure',
  },
  {
    id: 6,
    title: 'Meta Continues Intel-Based Host Server Deployments Alongside Custom AI Accelerators',
    tickers: ['INTC', 'META'],
    source: 'SemiAnalysis',
    time: 'Apr 2, 11:10 AM',
    category: 'AI',
  },
  {
    id: 7,
    title: 'Supermicro Highlights Intel Xeon 6 Racks for Enterprise Inference Clusters',
    tickers: ['INTC', 'SMCI'],
    source: 'Business Wire',
    time: 'Apr 1, 2:20 PM',
    category: 'Server',
  },
  {
    id: 8,
    title: 'ASUS Unveils New Commercial Notebooks Built on Intel Core Ultra and vPro',
    tickers: ['INTC', 'ASUS'],
    source: 'DigiTimes',
    time: 'Apr 1, 9:30 AM',
    category: 'PC Demand',
  },
  {
    id: 9,
    title: 'Acer Adds Intel AI PCs Across Mainstream Consumer and Education Channels',
    tickers: ['INTC', 'ACER'],
    source: 'The Verge',
    time: 'Mar 31, 1:15 PM',
    category: 'Product',
  },
  {
    id: 10,
    title: 'Intel and Top OEMs Signal Stable Commercial Refresh Cycle Into 2025',
    tickers: ['INTC', 'HPQ', 'DELL', 'LENOVO'],
    source: 'Financial Times',
    time: 'Mar 30, 8:40 AM',
    category: 'Outlook',
  },
];
