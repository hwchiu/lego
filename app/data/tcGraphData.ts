// Unified GlobalTech ecosystem graph data for Knowledge Graph visualization
// Aggregates suppliers, customers, competitors, and strategic partners (~200 companies)

export type NodeRole = 'center' | 'supplier1' | 'supplier2' | 'customer' | 'competitor' | 'partner';

export interface GraphNode {
  id: string;
  name: string;
  ticker: string;
  country: string;
  industry: string;
  segment: string;
  role: NodeRole;
  description: string;
  financials: { revenue: string; marketCap: string };
  articles: GraphArticle[];
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  weight: number;
  description: string;
}

export interface GraphArticle {
  title: string;
  source: string;
  date: string;
  url: string;
}

export const STRATEGIC_PARTNERS: GraphNode[] = [
  {
    id: 'AMKR', name: 'Amkor Technology', ticker: 'AMKR', country: 'USA',
    industry: 'Advanced Packaging', segment: 'OSAT',
    role: 'partner', description: "World's 2nd largest OSAT; partners with GlobalTech on CoWoS-S advanced packaging.",
    financials: { revenue: '$6.1B', marketCap: '~$4.5B' },
    articles: [
      { title: 'Amkor Expands CoWoS Packaging Capacity in Arizona', source: 'Semiconductor Digest', date: '2024-Q3', url: '#' },
      { title: 'GlobalTech-Amkor Partnership Strengthens AI Chip Packaging', source: 'EE Times', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'ASX', name: 'ASE Group', ticker: 'ASX', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'OSAT',
    role: 'partner', description: "World's largest OSAT; handles 3D IC packaging and advanced SiP solutions for GlobalTech customers.",
    financials: { revenue: '$19.0B', marketCap: '~$12B' },
    articles: [
      { title: 'ASE Group Invests $1B in 3D IC Packaging Facilities', source: 'DigiTimes', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'PTI', name: 'Powertech Technology', ticker: '6239.TW', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'Memory Packaging',
    role: 'partner', description: 'Leading memory module packaging partner for GlobalTech HBM and DRAM stacking.',
    financials: { revenue: '$2.8B', marketCap: '~$2.2B' },
    articles: [
      { title: 'Powertech Scales HBM Packaging for AI Chip Demand', source: 'TechInsights', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'IBIDEN', name: 'Ibiden Co.', ticker: '4062.T', country: 'Japan',
    industry: 'Electronic Components', segment: 'Package Substrates',
    role: 'partner', description: 'Leading IC package substrate supplier; provides ABF substrates for GlobalTech advanced node packages.',
    financials: { revenue: '$2.9B', marketCap: '~$3.5B' },
    articles: [
      { title: 'Ibiden Expands ABF Substrate Capacity for AI Chips', source: 'Nikkei', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'SHINKO', name: 'Shinko Electric Industries', ticker: '6967.T', country: 'Japan',
    industry: 'Electronic Components', segment: 'Package Substrates',
    role: 'partner', description: 'Key IC substrate supplier for flip-chip BGA and advanced packaging.',
    financials: { revenue: '$1.8B', marketCap: '~$2.1B' },
    articles: [
      { title: 'Shinko Electric Reports Strong AI Chip Substrate Orders', source: 'Reuters', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'UNIMICRON', name: 'Unimicron Technology', ticker: '3037.TW', country: 'Taiwan',
    industry: 'Electronic Components', segment: 'PCB/Substrates',
    role: 'partner', description: 'Leading PCB and ABF substrate manufacturer serving GlobalTech packaging ecosystem.',
    financials: { revenue: '$3.3B', marketCap: '~$3.2B' },
    articles: [
      { title: 'Unimicron Wins GlobalTech Advanced Substrate Orders', source: 'DigiTimes Asia', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'CHMOS', name: 'ChipMOS Technologies', ticker: 'IMOS', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'Testing',
    role: 'partner', description: 'Leading semiconductor testing and assembly house for display drivers and memory chips.',
    financials: { revenue: '$0.9B', marketCap: '~$0.6B' },
    articles: [
      { title: 'ChipMOS Expands OLED Driver IC Testing Capacity', source: 'DigiTimes', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'KYEC', name: 'King Yuan Electronics', ticker: '2449.TW', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'Testing',
    role: 'partner', description: 'GlobalTech supply chain testing partner; provides IC testing services for advanced logic and analog chips.',
    financials: { revenue: '$1.1B', marketCap: '~$1.0B' },
    articles: [
      { title: 'King Yuan Electronics Invests in AI Chip Test Systems', source: 'DigiTimes Asia', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'SPIL', name: 'Siliconware Precision (SPIL)', ticker: '2325.TW', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'OSAT',
    role: 'partner', description: 'Subsidiary of ASE; key packaging and test partner in GlobalTech advanced packaging supply chain.',
    financials: { revenue: '$4.8B', marketCap: '~$3.0B' },
    articles: [
      { title: 'SPIL Ramps Fan-out Packaging for 5G Chips', source: 'EE Times Asia', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'AT_S', name: 'AT&S Austria', ticker: 'ATS', country: 'Austria',
    industry: 'Electronic Components', segment: 'PCB/Substrates',
    role: 'partner', description: 'European PCB and IC substrate manufacturer serving GlobalTech HPC and automotive chip packaging.',
    financials: { revenue: '$2.0B', marketCap: '~$0.8B' },
    articles: [
      { title: 'AT&S Delivers ABF Substrates for Next-Gen AI Processors', source: 'Reuters', date: '2024-Q1', url: '#' },
    ],
  },
];

export const ECOSYSTEM_SUPPLIERS: GraphNode[] = [
  {
    id: 'LINDE', name: 'Linde plc', ticker: 'LIN', country: 'USA',
    industry: 'Industrial Gases', segment: 'Specialty Gases',
    role: 'supplier1', description: "World's largest industrial gas company; supplies ultra-high-purity gases (N2, O2, Ar, H2, NF3) critical for wafer fabrication.",
    financials: { revenue: '$32.9B', marketCap: '~$220B' },
    articles: [
      { title: 'Linde Expands UHP Gas Supply to GlobalTech Arizona Fab', source: 'Chemical & Engineering News', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'AIRL', name: 'Air Liquide', ticker: 'AI.PA', country: 'France',
    industry: 'Industrial Gases', segment: 'Specialty Gases',
    role: 'supplier1', description: 'Global specialty gas supplier; provides critical process gases and on-site gas generation for fabs.',
    financials: { revenue: '$29.9B', marketCap: '~$80B' },
    articles: [
      { title: 'Air Liquide Wins Long-term Gas Supply Contract with GlobalTech', source: 'Bloomberg', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'MERCK_KG', name: 'Merck KGaA (Electronics)', ticker: 'MRK.DE', country: 'Germany',
    industry: 'Semiconductor Materials', segment: 'Photoresist/Chemicals',
    role: 'supplier1', description: 'EUV photoresist and liquid crystal materials leader; critical for GlobalTech N3/N2 advanced nodes.',
    financials: { revenue: '$5.2B (Elec.)', marketCap: '~$50B' },
    articles: [
      { title: 'Merck KGaA EUV Photoresist Qualifies at GlobalTech 2nm Node', source: 'Semiconductor Today', date: '2024-Q3', url: '#' },
    ],
  },
  {
    id: 'JSR', name: 'JSR Corporation', ticker: '4185.T', country: 'Japan',
    industry: 'Semiconductor Materials', segment: 'Photoresist/Chemicals',
    role: 'supplier1', description: 'Leading photoresist supplier; provides EUV and ArF immersion resists for GlobalTech advanced processes.',
    financials: { revenue: '$3.1B', marketCap: '~$8B' },
    articles: [
      { title: 'JSR Photoresist Adopted for GlobalTech 3nm Production', source: 'Nikkei Asia', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'TOK', name: 'Tokyo Ohka Kogyo (TOK)', ticker: '4186.T', country: 'Japan',
    industry: 'Semiconductor Materials', segment: 'Photoresist/Chemicals',
    role: 'supplier1', description: 'Photoresist and specialty chemical supplier; key partner for GlobalTech advanced lithography.',
    financials: { revenue: '$1.4B', marketCap: '~$3.8B' },
    articles: [
      { title: 'TOK Expands Photoresist Production for EUV Demand', source: 'DigiTimes', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'SKSIL', name: 'SK Siltron', ticker: 'private', country: 'South Korea',
    industry: 'Semiconductor Materials', segment: 'Silicon Wafers',
    role: 'supplier1', description: 'Major silicon wafer producer; key supplier of 300mm polished and epitaxial wafers for GlobalTech.',
    financials: { revenue: '$1.6B', marketCap: 'Private' },
    articles: [
      { title: 'SK Siltron Invests in Wafer Capacity for GlobalTech N2 Node', source: 'Korea Herald', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'DUPONT', name: 'DuPont Electronics', ticker: 'DD', country: 'USA',
    industry: 'Semiconductor Materials', segment: 'Advanced Materials',
    role: 'supplier1', description: 'Advanced semiconductor materials supplier; provides photoresists, dielectric films, and CMP products.',
    financials: { revenue: '$12.1B', marketCap: '~$30B' },
    articles: [
      { title: 'DuPont Launches Low-k Dielectric Material for 2nm Chips', source: 'Chemical Week', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'CABOT', name: 'CMC Materials (Cabot)', ticker: 'CCMP', country: 'USA',
    industry: 'Semiconductor Materials', segment: 'CMP Materials',
    role: 'supplier2', description: 'CMP slurries and polishing pad supplier for tungsten, copper, and barrier CMP processes.',
    financials: { revenue: '$1.3B', marketCap: '~$3.5B' },
    articles: [
      { title: 'Cabot CMP Slurry Adopted for GlobalTech 3D NAND Logic', source: 'Solid State Technology', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'AXNX', name: 'Axcelis Technologies', ticker: 'ACLS', country: 'USA',
    industry: 'Semiconductor Equipment', segment: 'Ion Implant',
    role: 'supplier2', description: 'Ion implantation equipment supplier for source/drain doping in advanced logic nodes.',
    financials: { revenue: '$1.1B', marketCap: '~$3.0B' },
    articles: [
      { title: 'Axcelis Ion Implant Tools Gain Share at Advanced Foundries', source: 'EE Times', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'HITACH', name: 'Hitachi High-Tech', ticker: '8036.T', country: 'Japan',
    industry: 'Semiconductor Equipment', segment: 'Inspection/Metrology',
    role: 'supplier2', description: 'SEM-based CD metrology and wafer inspection tools for advanced node process control.',
    financials: { revenue: '$2.8B', marketCap: '~$4.5B' },
    articles: [
      { title: 'Hitachi High-Tech SEM Metrology Adopted at GlobalTech N3', source: 'Semiconductor Digest', date: '2024-Q1', url: '#' },
    ],
  },
];

export const CUSTOMER_ARTICLES: Record<string, GraphArticle[]> = {
  NVDA: [
    { title: 'NVIDIA Blackwell B200 GPU Enters GlobalTech N4P Volume Production', source: 'Wccftech', date: '2024-Q2', url: '#' },
    { title: 'GlobalTech CoWoS-L Capacity Expansion Driven by NVIDIA Demand', source: 'DigiTimes', date: '2024-Q3', url: '#' },
  ],
  AAPL: [
    { title: 'Apple A18 Pro Chip Tape-Out at GlobalTech 3nm Node', source: 'MacRumors', date: '2024-Q1', url: '#' },
    { title: 'Apple M4 Silicon Uses GlobalTech N3E Second-Gen 3nm Process', source: 'AnandTech', date: '2024-Q2', url: '#' },
  ],
  QCOM: [
    { title: 'Qualcomm Snapdragon 8 Elite Manufactured on GlobalTech 3nm', source: 'The Verge', date: '2024-Q3', url: '#' },
    { title: 'Qualcomm Shifts Modem Production from Samsung to GlobalTech', source: 'Reuters', date: '2024-Q2', url: '#' },
  ],
  AMD: [
    { title: 'AMD MI300X AI GPU Achieves Record Sales on GlobalTech N5', source: "Tom's Hardware", date: '2024-Q1', url: '#' },
    { title: 'AMD Zen 5 CPU Tapes Out at GlobalTech 3nm for 2025 Launch', source: 'PC Gamer', date: '2024-Q2', url: '#' },
  ],
  META: [
    { title: 'Meta MTIA v2 AI Chip Enters GlobalTech N3 Production', source: 'The Information', date: '2024-Q2', url: '#' },
  ],
  GOOGL: [
    { title: 'Google TPU v5 Uses GlobalTech 5nm for Hyperscale AI Workloads', source: 'SemiAnalysis', date: '2024-Q1', url: '#' },
  ],
};

export const GRAPH_EDGES: GraphEdge[] = [
  { from: 'GT', to: 'ASML', label: 'EUV System Procurement', weight: 5, description: "GlobalTech is ASML's largest customer; ~15 High-NA EUV tools on order for N2 node." },
  { from: 'GT', to: 'AMAT', label: 'CVD/PVD/CMP Tools', weight: 5, description: "Applied Materials supplies majority of GlobalTech's deposition and CMP equipment fleet." },
  { from: 'GT', to: 'LRCX', label: 'Etch Equipment', weight: 5, description: 'Lam Research etch tools are the primary platform for GlobalTech N3/N5 via-patterning.' },
  { from: 'GT', to: 'KLAC', label: 'Process Control & Inspection', weight: 4, description: 'KLA inspection tools deployed across all GlobalTech advanced node production lines.' },
  { from: 'GT', to: 'TOELY', label: 'Coater/Developer & CVD', weight: 4, description: 'Tokyo Electron supplies CLEAN TRACK coater/developer systems for photolithography.' },
  { from: 'GT', to: 'SHECY', label: 'Silicon Wafers & Photoresist', weight: 4, description: "Shin-Etsu is GlobalTech's primary 300mm polished silicon wafer supplier." },
  { from: 'GT', to: 'SUOPY', label: 'Silicon Wafers', weight: 3, description: 'Sumco provides polished and epitaxial 300mm silicon wafers for logic production.' },
  { from: 'GT', to: 'APD', label: 'Specialty Gases', weight: 3, description: 'Air Products delivers UHP NF3, WF6, and specialty gases to all GlobalTech fabs.' },
  { from: 'GT', to: 'ENTG', label: 'CMP & Filtration Materials', weight: 3, description: 'Entegris provides contamination control materials and advanced packaging materials.' },
  { from: 'NVDA', to: 'GT', label: 'AI GPU Wafers', weight: 5, description: 'NVIDIA orders H100/H200/B200 GPU wafers at N4/N4P nodes; ~$14B annual spend.' },
  { from: 'AAPL', to: 'GT', label: 'A/M-series Chips', weight: 5, description: 'Apple accounts for ~25% of GlobalTech revenue; A18/M4 chips on N3E.' },
  { from: 'QCOM', to: 'GT', label: 'Snapdragon SoCs', weight: 4, description: 'Qualcomm sources all Snapdragon 8-gen and X Elite chips at GlobalTech N4/N3.' },
  { from: 'AVGO', to: 'GT', label: 'AI ASICs & Networking', weight: 4, description: 'Broadcom XPU custom AI accelerators and P-series networking chips at N3/N5.' },
  { from: 'AMD', to: 'GT', label: 'CPUs & AI GPUs', weight: 4, description: 'AMD sources Zen5 CPUs and MI300 GPUs at GlobalTech N5/N4P; ~$5B annual revenue.' },
  { from: 'META', to: 'GT', label: 'Custom AI Accelerators', weight: 3, description: 'Meta MTIA v2 inference chip manufactured at GlobalTech N3.' },
  { from: 'GOOGL', to: 'GT', label: 'TPU AI Chips', weight: 3, description: 'Google TPU v5/v6 AI training chips ordered at GlobalTech N5 and N3 nodes.' },
  { from: 'MSFT', to: 'GT', label: 'Maia AI Accelerators', weight: 3, description: 'Microsoft Azure Maia 100 AI accelerator chip manufactured at GlobalTech N5.' },
  { from: 'MRVL', to: 'GT', label: 'Custom AI Silicon', weight: 3, description: 'Marvell custom XPU AI accelerators for hyperscalers at GlobalTech N5/N3.' },
  { from: 'MTEKF', to: 'GT', label: 'Mobile SoCs', weight: 3, description: 'MediaTek Dimensity 9400 manufactured at GlobalTech N3E; ~$4B annual spending.' },
  { from: 'GT', to: 'AMKR', label: 'CoWoS Packaging', weight: 3, description: 'GlobalTech partners with Amkor for CoWoS-S back-end packaging for AI chips.' },
  { from: 'GT', to: 'ASX', label: 'SiP & 3D IC Packaging', weight: 3, description: 'ASE Group handles advanced SiP and fan-out WLP for GlobalTech customers.' },
  { from: 'GT', to: 'IBIDEN', label: 'Package Substrates', weight: 3, description: 'Ibiden ABF substrates are required for GlobalTech flip-chip packages on advanced nodes.' },
  { from: 'GT', to: 'SSNLF', label: 'Foundry Competition', weight: 4, description: 'Samsung Foundry competes directly with GlobalTech for AI chip orders at 3nm GAA node.' },
  { from: 'GT', to: 'INTC_F', label: 'IFS Competition', weight: 3, description: 'Intel Foundry Services (IFS) targets GlobalTech customers with Intel 18A process.' },
  { from: 'GT', to: 'GFS', label: 'Mature Node Competition', weight: 3, description: 'GlobalFoundries competes with GlobalTech in specialty and mature process nodes.' },
  { from: 'ASML', to: 'ZEISS', label: 'Optics Supply', weight: 5, description: 'Carl Zeiss supplies EUV optics exclusively to ASML; critical sole-source relationship.' },
  { from: 'AMAT', to: 'AZTA', label: 'Wafer Handling', weight: 3, description: 'Brooks Automation vacuum robots and transfer systems used in AMAT CVD chambers.' },
];
