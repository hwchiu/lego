// Apple Inc. supplier network data for the RMAP Supplier Graph
// Source: Apple Supplier Responsibility Reports, public filings (FY2023–FY2024)

export interface SupplierNode {
  id: string;
  name: string;
  ticker: string;
  exchange: string;
  country: string;
  relationship: string;
  supplyItems: string;
  financials: {
    revenue: string;
    grossMargin: string;
    marketCap: string;
  };
  /** Accent color for the node's top strip and selected state (hex, e.g. '#1565c0') */
  color: string;
}

export interface SupplierEdge {
  from: string; // node id
  to: string; // node id
  label: string; // editable annotation
}

export const APPLE_CENTER_NODE: SupplierNode = {
  id: 'AAPL',
  name: 'Apple Inc.',
  ticker: 'AAPL',
  exchange: 'NASDAQ',
  country: 'USA',
  relationship: 'Central Company',
  supplyItems: '',
  financials: {
    revenue: '$391.0B',
    grossMargin: '46.2%',
    marketCap: '~$3.4T',
  },
  color: '#1a2332',
};

export const APPLE_SUPPLIERS: SupplierNode[] = [
  {
    id: 'TSM',
    name: 'TSMC',
    ticker: 'TSM',
    exchange: 'NYSE / TWSE',
    country: 'Taiwan',
    relationship: 'Semiconductor Foundry',
    supplyItems: 'A17 Pro, M3, M4 SoCs',
    financials: {
      revenue: '$69.3B',
      grossMargin: '54.4%',
      marketCap: '~$900B',
    },
    color: '#1565c0',
  },
  {
    id: 'FOXCONN',
    name: 'Foxconn',
    ticker: '2317.TW',
    exchange: 'TWSE',
    country: 'Taiwan',
    relationship: 'EMS / Assembly',
    supplyItems: 'iPhone & Mac Assembly',
    financials: {
      revenue: '$214B',
      grossMargin: '6.2%',
      marketCap: '~$55B',
    },
    color: '#6a1520',
  },
  {
    id: 'SAMSUNG',
    name: 'Samsung Electronics',
    ticker: '005930.KS',
    exchange: 'KRX',
    country: 'South Korea',
    relationship: 'Display & Memory',
    supplyItems: 'OLED Panels, NAND Flash',
    financials: {
      revenue: '$211B',
      grossMargin: '38.5%',
      marketCap: '~$320B',
    },
    color: '#1b5e20',
  },
  {
    id: 'QCOM',
    name: 'Qualcomm',
    ticker: 'QCOM',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: '5G Modem Supplier',
    supplyItems: 'Snapdragon X70 5G Modem',
    financials: {
      revenue: '$35.8B',
      grossMargin: '56.8%',
      marketCap: '~$175B',
    },
    color: '#3e2723',
  },
  {
    id: 'AVGO',
    name: 'Broadcom',
    ticker: 'AVGO',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Wi-Fi / RF Chips',
    supplyItems: 'Wi-Fi/BT Chips, RF FBAR',
    financials: {
      revenue: '$35.8B',
      grossMargin: '74.4%',
      marketCap: '~$800B',
    },
    color: '#4a148c',
  },
  {
    id: 'SONY',
    name: 'Sony (Image Sensors)',
    ticker: 'SONY',
    exchange: 'NYSE',
    country: 'Japan',
    relationship: 'Camera Sensor Supplier',
    supplyItems: 'Stacked CMOS Sensors',
    financials: {
      revenue: '$88B',
      grossMargin: '28.5%',
      marketCap: '~$120B',
    },
    color: '#006064',
  },
  {
    id: 'MURATA',
    name: 'Murata Manufacturing',
    ticker: 'MRAAY',
    exchange: 'OTC',
    country: 'Japan',
    relationship: 'Passive Components',
    supplyItems: 'MLCCs, RF Modules',
    financials: {
      revenue: '$14.6B',
      grossMargin: '39.2%',
      marketCap: '~$32B',
    },
    color: '#bf360c',
  },
  {
    id: 'GLW',
    name: 'Corning',
    ticker: 'GLW',
    exchange: 'NYSE',
    country: 'USA',
    relationship: 'Glass Supplier',
    supplyItems: 'Ceramic Shield, Gorilla Glass',
    financials: {
      revenue: '$12.6B',
      grossMargin: '36.5%',
      marketCap: '~$33B',
    },
    color: '#01579b',
  },
  {
    id: 'LUXSHARE',
    name: 'Luxshare Precision',
    ticker: '002475.SZ',
    exchange: 'SZSE',
    country: 'China',
    relationship: 'EMS / Assembly',
    supplyItems: 'iPhone, AirPods, Watch Assembly',
    financials: {
      revenue: '$28B',
      grossMargin: '12.4%',
      marketCap: '~$30B',
    },
    color: '#1a237e',
  },
  {
    id: 'SWKS',
    name: 'Skyworks Solutions',
    ticker: 'SWKS',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'RF Front-End Modules',
    supplyItems: 'RF Amplifiers & Filters',
    financials: {
      revenue: '$4.8B',
      grossMargin: '47.1%',
      marketCap: '~$14B',
    },
    color: '#004d40',
  },
  {
    id: 'LGD',
    name: 'LG Display',
    ticker: 'LPL',
    exchange: 'NYSE',
    country: 'South Korea',
    relationship: 'Display Panels',
    supplyItems: 'OLED Panels (iPhone)',
    financials: {
      revenue: '$20.8B',
      grossMargin: '2.1%',
      marketCap: '~$4B',
    },
    color: '#880e4f',
  },
  {
    id: 'TXN',
    name: 'Texas Instruments',
    ticker: 'TXN',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Power Management ICs',
    supplyItems: 'PMIC, USB Controllers',
    financials: {
      revenue: '$17.5B',
      grossMargin: '66.4%',
      marketCap: '~$170B',
    },
    color: '#37474f',
  },
];

// Default edge annotations (editable by user)
export const DEFAULT_EDGE_LABELS: Record<string, string> = {
  TSM: '',
  FOXCONN: '',
  SAMSUNG: '',
  QCOM: '',
  AVGO: '',
  SONY: '',
  MURATA: '',
  GLW: '',
  LUXSHARE: '',
  SWKS: '',
  LGD: '',
  TXN: '',
};
