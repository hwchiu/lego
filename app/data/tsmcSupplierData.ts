// TSMC (Taiwan Semiconductor Manufacturing Company) supplier network data
// Sources: TSMC Annual Reports, public filings, supplier disclosures (FY2023–FY2024)

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

export interface SupplierNodeTSM {
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
  tier: 1 | 2;
  /** For tier 2 nodes: the id of their tier 1 parent */
  parentId?: string;
  productCategories: string[];
  industryCategory: string;
}

export interface EdgeEntity {
  from: string;                   // source node id
  to: string;                     // target node id
  transactionAmount: number;      // in $M USD
  newsCoMentionCount: number;     // times co-mentioned in news
  commonSupplierCount: number;    // number of common suppliers
  commonCustomerCount: number;    // number of common customers
  crossShareholdingRatio: number; // percentage 0–100
  commonBoardMembers: number;     // count
}

export const RELATION_TYPES = [
  { key: 'transactionAmount', label: 'Transaction Amount' },
  { key: 'newsCoMentionCount', label: 'News Co-mention Count' },
  { key: 'commonSupplierCount', label: 'Common Supplier Count' },
  { key: 'commonCustomerCount', label: 'Common Customer Count' },
  { key: 'crossShareholdingRatio', label: 'Cross-shareholding Ratio' },
  { key: 'commonBoardMembers', label: 'Common Board Members' },
] as const;

export type RelationTypeKey = (typeof RELATION_TYPES)[number]['key'];

// ---------------------------------------------------------------------------
// Center node
// ---------------------------------------------------------------------------

export const TSM_CENTER_NODE: SupplierNodeTSM = {
  id: 'TSM',
  name: 'TSMC',
  ticker: 'TSM',
  exchange: 'NYSE / TWSE',
  country: 'Taiwan',
  relationship: 'Central Company — Pure-play Foundry',
  supplyItems: '',
  financials: {
    revenue: '$69.3B',
    grossMargin: '54.4%',
    marketCap: '~$900B',
  },
  color: '#1a2332',
  tier: 1,
  productCategories: ['Logic Chips', 'Advanced Packaging'],
  industryCategory: 'Semiconductor Foundry',
};

// ---------------------------------------------------------------------------
// Tier 1 suppliers
// ---------------------------------------------------------------------------

export const TSM_TIER1_SUPPLIERS: SupplierNodeTSM[] = [
  {
    id: 'ASML',
    name: 'ASML Holding',
    ticker: 'ASML',
    exchange: 'NASDAQ',
    country: 'Netherlands',
    relationship: 'Lithography Systems Supplier',
    supplyItems: 'EUV & DUV lithography scanners',
    financials: {
      revenue: '$27.6B',
      grossMargin: '51.3%',
      marketCap: '~$290B',
    },
    color: '#1565c0',
    tier: 1,
    productCategories: ['EUV Systems', 'DUV Systems'],
    industryCategory: 'Semiconductor Equipment',
  },
  {
    id: 'AMAT',
    name: 'Applied Materials',
    ticker: 'AMAT',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Deposition & Etch Equipment Supplier',
    supplyItems: 'CVD, PVD, ALD deposition systems; CMP tools',
    financials: {
      revenue: '$26.5B',
      grossMargin: '47.2%',
      marketCap: '~$150B',
    },
    color: '#6a1b9a',
    tier: 1,
    productCategories: ['CVD Systems', 'PVD Systems', 'CMP Equipment'],
    industryCategory: 'Semiconductor Equipment',
  },
  {
    id: 'LRCX',
    name: 'Lam Research',
    ticker: 'LRCX',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Etch & Deposition Equipment Supplier',
    supplyItems: 'Plasma etch systems, ALD/CVD reactors',
    financials: {
      revenue: '$17.4B',
      grossMargin: '47.7%',
      marketCap: '~$105B',
    },
    color: '#00695c',
    tier: 1,
    productCategories: ['Plasma Etch Systems', 'ALD Reactors'],
    industryCategory: 'Semiconductor Equipment',
  },
  {
    id: 'KLAC',
    name: 'KLA Corporation',
    ticker: 'KLAC',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Process Control Equipment Supplier',
    supplyItems: 'Wafer inspection, metrology & yield management',
    financials: {
      revenue: '$9.8B',
      grossMargin: '60.4%',
      marketCap: '~$90B',
    },
    color: '#e65100',
    tier: 1,
    productCategories: ['Wafer Inspection', 'Metrology Systems'],
    industryCategory: 'Semiconductor Equipment',
  },
  {
    id: 'TOELY',
    name: 'Tokyo Electron',
    ticker: 'TOELY',
    exchange: 'OTC',
    country: 'Japan',
    relationship: 'Process Equipment Supplier',
    supplyItems: 'Coater/developers, thermal CVD, cleaning systems',
    financials: {
      revenue: '$17.0B',
      grossMargin: '45.8%',
      marketCap: '~$65B',
    },
    color: '#c62828',
    tier: 1,
    productCategories: ['Coater/Developer Systems', 'Thermal CVD', 'Cleaning Equipment'],
    industryCategory: 'Semiconductor Equipment',
  },
  {
    id: 'SHECY',
    name: 'Shin-Etsu Chemical',
    ticker: 'SHECY',
    exchange: 'OTC',
    country: 'Japan',
    relationship: 'Semiconductor Materials Supplier',
    supplyItems: 'Silicon wafers, photoresist, silicones',
    financials: {
      revenue: '$19.4B',
      grossMargin: '42.1%',
      marketCap: '~$55B',
    },
    color: '#2e7d32',
    tier: 1,
    productCategories: ['Silicon Wafers', 'Photoresist', 'Silicones'],
    industryCategory: 'Semiconductor Materials',
  },
  {
    id: 'SUOPY',
    name: 'Sumco Corporation',
    ticker: 'SUOPY',
    exchange: 'OTC',
    country: 'Japan',
    relationship: 'Silicon Wafer Supplier',
    supplyItems: 'Polished & epitaxial silicon wafers',
    financials: {
      revenue: '$3.1B',
      grossMargin: '28.6%',
      marketCap: '~$5.5B',
    },
    color: '#00838f',
    tier: 1,
    productCategories: ['Polished Silicon Wafers', 'Epitaxial Wafers'],
    industryCategory: 'Semiconductor Materials',
  },
  {
    id: 'APD',
    name: 'Air Products and Chemicals',
    ticker: 'APD',
    exchange: 'NYSE',
    country: 'USA',
    relationship: 'Specialty Gases Supplier',
    supplyItems: 'Ultra-high-purity gases (NF3, WF6, H2, N2, O2)',
    financials: {
      revenue: '$12.6B',
      grossMargin: '30.2%',
      marketCap: '~$40B',
    },
    color: '#4527a0',
    tier: 1,
    productCategories: ['Specialty Gases', 'UHP Gases', 'Gas Delivery Systems'],
    industryCategory: 'Industrial Gases',
  },
  {
    id: 'ENTG',
    name: 'Entegris',
    ticker: 'ENTG',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Process Materials & Filtration Supplier',
    supplyItems: 'CMP slurries, filtration, advanced packaging materials',
    financials: {
      revenue: '$3.3B',
      grossMargin: '44.2%',
      marketCap: '~$14B',
    },
    color: '#37474f',
    tier: 1,
    productCategories: ['CMP Materials', 'Filtration', 'Packaging Materials'],
    industryCategory: 'Semiconductor Materials',
  },
];

// ---------------------------------------------------------------------------
// Tier 2 suppliers
// ---------------------------------------------------------------------------

export const TSM_TIER2_SUPPLIERS: SupplierNodeTSM[] = [
  // --- ASML sub-suppliers ---
  {
    id: 'ZEISS',
    name: 'Carl Zeiss SMT',
    ticker: 'ZEISS',
    exchange: 'Private',
    country: 'Germany',
    relationship: 'Optical Systems Sub-supplier (→ ASML)',
    supplyItems: 'High-NA EUV projection optics, lens systems',
    financials: {
      revenue: '$2.8B',
      grossMargin: '38.0%',
      marketCap: 'Private',
    },
    color: '#1a237e',
    tier: 2,
    parentId: 'ASML',
    productCategories: ['EUV Optics', 'Precision Lenses'],
    industryCategory: 'Precision Optics',
  },
  {
    id: 'CYMER',
    name: 'Cymer (ASML subsidiary)',
    ticker: 'CYMER',
    exchange: 'Subsidiary',
    country: 'USA',
    relationship: 'Light Source Sub-supplier (→ ASML)',
    supplyItems: 'Excimer & EUV light sources for lithography',
    financials: {
      revenue: '$0.9B',
      grossMargin: '42.0%',
      marketCap: 'Subsidiary',
    },
    color: '#0d47a1',
    tier: 2,
    parentId: 'ASML',
    productCategories: ['Excimer Laser Sources', 'EUV Light Sources'],
    industryCategory: 'Photonics',
  },

  // --- AMAT sub-suppliers ---
  {
    id: 'MKSI',
    name: 'MKS Instruments',
    ticker: 'MKSI',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Gas & RF Sub-supplier (→ AMAT)',
    supplyItems: 'Mass flow controllers, RF power generators, gas analysis',
    financials: {
      revenue: '$3.7B',
      grossMargin: '45.3%',
      marketCap: '~$5.5B',
    },
    color: '#4a148c',
    tier: 2,
    parentId: 'AMAT',
    productCategories: ['Mass Flow Controllers', 'RF Power Systems', 'Gas Analysis'],
    industryCategory: 'Semiconductor Equipment Components',
  },
  {
    id: 'UCTT',
    name: 'Ultra Clean Holdings',
    ticker: 'UCTT',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Gas Delivery Sub-supplier (→ AMAT)',
    supplyItems: 'Gas delivery systems, chamber components, weldments',
    financials: {
      revenue: '$2.0B',
      grossMargin: '14.5%',
      marketCap: '~$1.2B',
    },
    color: '#880e4f',
    tier: 2,
    parentId: 'AMAT',
    productCategories: ['Gas Delivery Systems', 'Chamber Components'],
    industryCategory: 'Semiconductor Equipment Components',
  },

  // --- LRCX sub-suppliers ---
  {
    id: 'AZTA',
    name: 'Azenta (Brooks Automation)',
    ticker: 'AZTA',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Automation Sub-supplier (→ LRCX)',
    supplyItems: 'Wafer handling robots, FOUP automation, cryopumps',
    financials: {
      revenue: '$1.1B',
      grossMargin: '46.8%',
      marketCap: '~$2.8B',
    },
    color: '#1b5e20',
    tier: 2,
    parentId: 'LRCX',
    productCategories: ['Wafer Handling Robots', 'Cryopumps', 'FOUP Automation'],
    industryCategory: 'Semiconductor Equipment Components',
  },
  {
    id: 'COHU',
    name: 'Cohu Inc.',
    ticker: 'COHU',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Test Handler Sub-supplier (→ LRCX)',
    supplyItems: 'Semiconductor test handlers, contactors, thermal subsystems',
    financials: {
      revenue: '$0.5B',
      grossMargin: '44.0%',
      marketCap: '~$0.8B',
    },
    color: '#006064',
    tier: 2,
    parentId: 'LRCX',
    productCategories: ['Test Handlers', 'Semiconductor Contactors'],
    industryCategory: 'Semiconductor Test Equipment',
  },

  // --- KLAC sub-suppliers ---
  {
    id: 'COHR',
    name: 'Coherent Corp.',
    ticker: 'COHR',
    exchange: 'NYSE',
    country: 'USA',
    relationship: 'Laser Sub-supplier (→ KLAC)',
    supplyItems: 'Laser systems for inspection & micro-processing',
    financials: {
      revenue: '$4.7B',
      grossMargin: '39.5%',
      marketCap: '~$11B',
    },
    color: '#bf360c',
    tier: 2,
    parentId: 'KLAC',
    productCategories: ['Laser Systems', 'Photonic Components'],
    industryCategory: 'Photonics',
  },
  {
    id: 'FORM',
    name: 'FormFactor',
    ticker: 'FORM',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'Probe Card Sub-supplier (→ KLAC)',
    supplyItems: 'Advanced probe cards for wafer-level test',
    financials: {
      revenue: '$0.8B',
      grossMargin: '48.2%',
      marketCap: '~$1.4B',
    },
    color: '#01579b',
    tier: 2,
    parentId: 'KLAC',
    productCategories: ['Probe Cards', 'Wafer-Level Test'],
    industryCategory: 'Semiconductor Test Equipment',
  },

  // --- TOELY sub-suppliers ---
  {
    id: 'SEH',
    name: 'Shin-Etsu Handotai',
    ticker: 'SEH',
    exchange: 'Subsidiary',
    country: 'Japan',
    relationship: 'Wafer Sub-supplier (→ TOELY)',
    supplyItems: 'Silicon wafers for process equipment qualification',
    financials: {
      revenue: '$3.5B',
      grossMargin: '35.0%',
      marketCap: 'Subsidiary',
    },
    color: '#33691e',
    tier: 2,
    parentId: 'TOELY',
    productCategories: ['Silicon Wafers', 'Test Wafers'],
    industryCategory: 'Semiconductor Materials',
  },
  {
    id: 'NTK',
    name: 'NGK Insulators',
    ticker: 'NTK',
    exchange: 'OTC',
    country: 'Japan',
    relationship: 'Ceramics Sub-supplier (→ TOELY)',
    supplyItems: 'Ceramic components for process chambers & heaters',
    financials: {
      revenue: '$4.5B',
      grossMargin: '31.5%',
      marketCap: '~$5.0B',
    },
    color: '#e65100',
    tier: 2,
    parentId: 'TOELY',
    productCategories: ['Ceramic Components', 'Electrostatic Chucks', 'Heaters'],
    industryCategory: 'Advanced Ceramics',
  },

  // --- SHECY sub-suppliers ---
  {
    id: 'WKCMF',
    name: 'Wacker Chemie',
    ticker: 'WKCMF',
    exchange: 'OTC',
    country: 'Germany',
    relationship: 'Polysilicon Sub-supplier (→ SHECY)',
    supplyItems: 'Polysilicon feedstock for wafer manufacturing',
    financials: {
      revenue: '$7.3B',
      grossMargin: '22.8%',
      marketCap: '~$3.8B',
    },
    color: '#f57f17',
    tier: 2,
    parentId: 'SHECY',
    productCategories: ['Polysilicon', 'Hyperpure Silicon'],
    industryCategory: 'Semiconductor Materials',
  },
  {
    id: 'TKYMY',
    name: 'Tokuyama Corporation',
    ticker: 'TKYMY',
    exchange: 'OTC',
    country: 'Japan',
    relationship: 'Chemical Sub-supplier (→ SHECY)',
    supplyItems: 'Polysilicon, HF, fumed silica for semiconductor process',
    financials: {
      revenue: '$3.2B',
      grossMargin: '26.4%',
      marketCap: '~$1.6B',
    },
    color: '#4e342e',
    tier: 2,
    parentId: 'SHECY',
    productCategories: ['Polysilicon', 'Hydrofluoric Acid', 'Fumed Silica'],
    industryCategory: 'Semiconductor Chemicals',
  },

  // --- SUOPY sub-suppliers ---
  {
    id: 'SSILY',
    name: 'Siltronic AG',
    ticker: 'SSILY',
    exchange: 'OTC',
    country: 'Germany',
    relationship: 'Silicon Wafer Sub-supplier (→ SUOPY)',
    supplyItems: 'Polished & epitaxial 200/300 mm silicon wafers',
    financials: {
      revenue: '$1.8B',
      grossMargin: '30.5%',
      marketCap: '~$1.5B',
    },
    color: '#263238',
    tier: 2,
    parentId: 'SUOPY',
    productCategories: ['Polished Wafers', 'Epitaxial Wafers'],
    industryCategory: 'Semiconductor Materials',
  },
  {
    id: 'SKSILTRON',
    name: 'SK Siltron',
    ticker: 'SKSILTRON',
    exchange: 'Private',
    country: 'South Korea',
    relationship: 'Silicon Wafer Sub-supplier (→ SUOPY)',
    supplyItems: 'Silicon wafers & SiC substrates',
    financials: {
      revenue: '$1.6B',
      grossMargin: '28.0%',
      marketCap: 'Private',
    },
    color: '#37474f',
    tier: 2,
    parentId: 'SUOPY',
    productCategories: ['Silicon Wafers', 'SiC Substrates'],
    industryCategory: 'Semiconductor Materials',
  },

  // --- APD sub-suppliers ---
  {
    id: 'LIN',
    name: 'Linde plc',
    ticker: 'LIN',
    exchange: 'NYSE',
    country: 'UK / Ireland',
    relationship: 'Industrial Gas Sub-supplier (→ APD)',
    supplyItems: 'Bulk and specialty gases (N2, O2, Ar, H2, He) for fabs',
    financials: {
      revenue: '$32.9B',
      grossMargin: '47.8%',
      marketCap: '~$205B',
    },
    color: '#1565c0',
    tier: 2,
    parentId: 'APD',
    productCategories: ['Bulk Gases', 'Specialty Gases', 'On-site Gas Plants'],
    industryCategory: 'Industrial Gases',
  },
  {
    id: 'AIQUY',
    name: 'Air Liquide',
    ticker: 'AIQUY',
    exchange: 'OTC',
    country: 'France',
    relationship: 'Industrial Gas Sub-supplier (→ APD)',
    supplyItems: 'UHP gases, gas purification & distribution for semiconductor',
    financials: {
      revenue: '$29.4B',
      grossMargin: '35.2%',
      marketCap: '~$80B',
    },
    color: '#006064',
    tier: 2,
    parentId: 'APD',
    productCategories: ['UHP Gases', 'Gas Purification', 'Cryogenic Systems'],
    industryCategory: 'Industrial Gases',
  },

  // --- ENTG sub-suppliers ---
  {
    id: 'CCMP',
    name: 'CMC Materials (Cabot Microelectronics)',
    ticker: 'CCMP',
    exchange: 'NASDAQ',
    country: 'USA',
    relationship: 'CMP Slurry Sub-supplier (→ ENTG)',
    supplyItems: 'CMP slurries & polishing pads for advanced nodes',
    financials: {
      revenue: '$1.2B',
      grossMargin: '36.4%',
      marketCap: '~$3.8B',
    },
    color: '#4527a0',
    tier: 2,
    parentId: 'ENTG',
    productCategories: ['CMP Slurries', 'Polishing Pads'],
    industryCategory: 'Semiconductor Materials',
  },
  {
    id: 'AVTR',
    name: 'Avantor',
    ticker: 'AVTR',
    exchange: 'NYSE',
    country: 'USA',
    relationship: 'Process Chemicals Sub-supplier (→ ENTG)',
    supplyItems: 'High-purity process chemicals, cleaning solvents',
    financials: {
      revenue: '$7.7B',
      grossMargin: '33.8%',
      marketCap: '~$9.0B',
    },
    color: '#bf360c',
    tier: 2,
    parentId: 'ENTG',
    productCategories: ['High-Purity Chemicals', 'Process Solvents'],
    industryCategory: 'Semiconductor Chemicals',
  },
];

// ---------------------------------------------------------------------------
// Edge entities
// ---------------------------------------------------------------------------

export const EDGE_ENTITIES: EdgeEntity[] = [
  // TSM → Tier 1 (9 edges)
  {
    from: 'TSM',
    to: 'ASML',
    transactionAmount: 4800,
    newsCoMentionCount: 342,
    commonSupplierCount: 3,
    commonCustomerCount: 8,
    crossShareholdingRatio: 0.5,
    commonBoardMembers: 1,
  },
  {
    from: 'TSM',
    to: 'AMAT',
    transactionAmount: 2900,
    newsCoMentionCount: 287,
    commonSupplierCount: 8,
    commonCustomerCount: 12,
    crossShareholdingRatio: 0.3,
    commonBoardMembers: 2,
  },
  {
    from: 'TSM',
    to: 'LRCX',
    transactionAmount: 2300,
    newsCoMentionCount: 251,
    commonSupplierCount: 6,
    commonCustomerCount: 10,
    crossShareholdingRatio: 0.2,
    commonBoardMembers: 1,
  },
  {
    from: 'TSM',
    to: 'KLAC',
    transactionAmount: 1900,
    newsCoMentionCount: 198,
    commonSupplierCount: 4,
    commonCustomerCount: 7,
    crossShareholdingRatio: 0.1,
    commonBoardMembers: 1,
  },
  {
    from: 'TSM',
    to: 'TOELY',
    transactionAmount: 1600,
    newsCoMentionCount: 176,
    commonSupplierCount: 5,
    commonCustomerCount: 9,
    crossShareholdingRatio: 0.4,
    commonBoardMembers: 0,
  },
  {
    from: 'TSM',
    to: 'SHECY',
    transactionAmount: 1500,
    newsCoMentionCount: 143,
    commonSupplierCount: 7,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.2,
    commonBoardMembers: 0,
  },
  {
    from: 'TSM',
    to: 'SUOPY',
    transactionAmount: 1200,
    newsCoMentionCount: 112,
    commonSupplierCount: 5,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.1,
    commonBoardMembers: 0,
  },
  {
    from: 'TSM',
    to: 'APD',
    transactionAmount: 800,
    newsCoMentionCount: 89,
    commonSupplierCount: 3,
    commonCustomerCount: 5,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TSM',
    to: 'ENTG',
    transactionAmount: 650,
    newsCoMentionCount: 76,
    commonSupplierCount: 4,
    commonCustomerCount: 6,
    crossShareholdingRatio: 0.1,
    commonBoardMembers: 0,
  },

  // ASML → Tier 2 (2 edges)
  {
    from: 'ASML',
    to: 'ZEISS',
    transactionAmount: 1850,
    newsCoMentionCount: 128,
    commonSupplierCount: 2,
    commonCustomerCount: 3,
    crossShareholdingRatio: 24.9,
    commonBoardMembers: 2,
  },
  {
    from: 'ASML',
    to: 'CYMER',
    transactionAmount: 920,
    newsCoMentionCount: 94,
    commonSupplierCount: 1,
    commonCustomerCount: 4,
    crossShareholdingRatio: 100.0,
    commonBoardMembers: 3,
  },

  // AMAT → Tier 2 (2 edges)
  {
    from: 'AMAT',
    to: 'MKSI',
    transactionAmount: 620,
    newsCoMentionCount: 87,
    commonSupplierCount: 4,
    commonCustomerCount: 6,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'AMAT',
    to: 'UCTT',
    transactionAmount: 480,
    newsCoMentionCount: 65,
    commonSupplierCount: 3,
    commonCustomerCount: 5,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 1,
  },

  // LRCX → Tier 2 (2 edges)
  {
    from: 'LRCX',
    to: 'AZTA',
    transactionAmount: 310,
    newsCoMentionCount: 52,
    commonSupplierCount: 2,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'LRCX',
    to: 'COHU',
    transactionAmount: 140,
    newsCoMentionCount: 34,
    commonSupplierCount: 1,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },

  // KLAC → Tier 2 (2 edges)
  {
    from: 'KLAC',
    to: 'COHR',
    transactionAmount: 520,
    newsCoMentionCount: 71,
    commonSupplierCount: 3,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'KLAC',
    to: 'FORM',
    transactionAmount: 195,
    newsCoMentionCount: 44,
    commonSupplierCount: 1,
    commonCustomerCount: 2,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },

  // TOELY → Tier 2 (2 edges)
  {
    from: 'TOELY',
    to: 'SEH',
    transactionAmount: 680,
    newsCoMentionCount: 58,
    commonSupplierCount: 5,
    commonCustomerCount: 2,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'TOELY',
    to: 'NTK',
    transactionAmount: 290,
    newsCoMentionCount: 41,
    commonSupplierCount: 2,
    commonCustomerCount: 1,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },

  // SHECY → Tier 2 (2 edges)
  {
    from: 'SHECY',
    to: 'WKCMF',
    transactionAmount: 410,
    newsCoMentionCount: 49,
    commonSupplierCount: 2,
    commonCustomerCount: 2,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'SHECY',
    to: 'TKYMY',
    transactionAmount: 230,
    newsCoMentionCount: 33,
    commonSupplierCount: 3,
    commonCustomerCount: 1,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },

  // SUOPY → Tier 2 (2 edges)
  {
    from: 'SUOPY',
    to: 'SSILY',
    transactionAmount: 175,
    newsCoMentionCount: 39,
    commonSupplierCount: 2,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'SUOPY',
    to: 'SKSILTRON',
    transactionAmount: 155,
    newsCoMentionCount: 27,
    commonSupplierCount: 1,
    commonCustomerCount: 2,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },

  // APD → Tier 2 (2 edges)
  {
    from: 'APD',
    to: 'LIN',
    transactionAmount: 2000,
    newsCoMentionCount: 115,
    commonSupplierCount: 6,
    commonCustomerCount: 11,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
  {
    from: 'APD',
    to: 'AIQUY',
    transactionAmount: 1650,
    newsCoMentionCount: 97,
    commonSupplierCount: 5,
    commonCustomerCount: 9,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },

  // ENTG → Tier 2 (2 edges)
  {
    from: 'ENTG',
    to: 'CCMP',
    transactionAmount: 380,
    newsCoMentionCount: 56,
    commonSupplierCount: 3,
    commonCustomerCount: 4,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 1,
  },
  {
    from: 'ENTG',
    to: 'AVTR',
    transactionAmount: 210,
    newsCoMentionCount: 38,
    commonSupplierCount: 2,
    commonCustomerCount: 3,
    crossShareholdingRatio: 0.0,
    commonBoardMembers: 0,
  },
];
