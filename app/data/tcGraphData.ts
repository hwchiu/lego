// Unified Intel ecosystem graph data for Knowledge Graph visualization
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
    role: 'partner', description: "World's 2nd largest OSAT; partners with Intel on advanced packaging solutions.",
    financials: { revenue: '$6.1B', marketCap: '~$4.5B' },
    articles: [
      { title: 'Amkor Expands Advanced Packaging Capacity for Intel Programs in Arizona', source: 'Semiconductor Digest', date: '2024-Q3', url: '#' },
      { title: 'Intel-Amkor Collaboration Supports US Packaging Footprint', source: 'EE Times', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'ASX', name: 'ASE Group', ticker: 'ASX', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'OSAT',
    role: 'partner', description: "World's largest OSAT; handles 3D IC packaging and advanced SiP solutions for Intel platforms.",
    financials: { revenue: '$19.0B', marketCap: '~$12B' },
    articles: [
      { title: 'ASE Group Invests $1B in 3D IC Packaging Facilities for Advanced Compute Customers', source: 'DigiTimes', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'PTI', name: 'Powertech Technology', ticker: '6239.TW', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'Memory Packaging',
    role: 'partner', description: 'Leading memory module packaging partner for Intel data center and advanced memory programs.',
    financials: { revenue: '$2.8B', marketCap: '~$2.2B' },
    articles: [
      { title: 'Powertech Scales HBM Packaging for AI Server Demand', source: 'TechInsights', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'IBIDEN', name: 'Ibiden Co.', ticker: '4062.T', country: 'Japan',
    industry: 'Electronic Components', segment: 'Package Substrates',
    role: 'partner', description: 'Leading IC package substrate supplier; provides ABF substrates for Intel advanced CPU and AI packages.',
    financials: { revenue: '$2.9B', marketCap: '~$3.5B' },
    articles: [
      { title: 'Ibiden Expands ABF Substrate Capacity for Intel and AI Server Programs', source: 'Nikkei', date: '2024-Q2', url: '#' },
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
    role: 'partner', description: 'Leading PCB and ABF substrate manufacturer serving Intel packaging ecosystem programs.',
    financials: { revenue: '$3.3B', marketCap: '~$3.2B' },
    articles: [
      { title: 'Unimicron Wins Intel Advanced Substrate Orders', source: 'DigiTimes Asia', date: '2024-Q1', url: '#' },
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
    role: 'partner', description: 'Intel supply chain testing partner; provides IC testing services for advanced logic and analog chips.',
    financials: { revenue: '$1.1B', marketCap: '~$1.0B' },
    articles: [
      { title: 'King Yuan Electronics Invests in AI Chip Test Systems', source: 'DigiTimes Asia', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'SPIL', name: 'Siliconware Precision (SPIL)', ticker: '2325.TW', country: 'Taiwan',
    industry: 'Advanced Packaging', segment: 'OSAT',
    role: 'partner', description: 'Subsidiary of ASE; key packaging and test partner in Intel advanced packaging supply chain.',
    financials: { revenue: '$4.8B', marketCap: '~$3.0B' },
    articles: [
      { title: 'SPIL Ramps Fan-out Packaging for Next-Generation Compute Chips', source: 'EE Times Asia', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'AT_S', name: 'AT&S Austria', ticker: 'ATS', country: 'Austria',
    industry: 'Electronic Components', segment: 'PCB/Substrates',
    role: 'partner', description: 'European PCB and IC substrate manufacturer serving Intel HPC and automotive chip packaging.',
    financials: { revenue: '$2.0B', marketCap: '~$0.8B' },
    articles: [
      { title: 'AT&S Delivers ABF Substrates for Next-Gen Intel AI Processors', source: 'Reuters', date: '2024-Q1', url: '#' },
    ],
  },
];

export const ECOSYSTEM_SUPPLIERS: GraphNode[] = [
  {
    id: 'LINDE', name: 'Linde plc', ticker: 'LIN', country: 'USA',
    industry: 'Industrial Gases', segment: 'Specialty Gases',
    role: 'supplier1', description: "World's largest industrial gas company; supplies ultra-high-purity gases (N2, O2, Ar, H2, NF3) critical for Intel wafer fabrication.",
    financials: { revenue: '$32.9B', marketCap: '~$220B' },
    articles: [
      { title: 'Linde Expands UHP Gas Supply to Intel Arizona Fab', source: 'Chemical & Engineering News', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'AIRL', name: 'Air Liquide', ticker: 'AI.PA', country: 'France',
    industry: 'Industrial Gases', segment: 'Specialty Gases',
    role: 'supplier1', description: 'Global specialty gas supplier; provides critical process gases and on-site gas generation for Intel fabs.',
    financials: { revenue: '$29.9B', marketCap: '~$80B' },
    articles: [
      { title: 'Air Liquide Wins Long-term Gas Supply Contract with Intel', source: 'Bloomberg', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'MERCK_KG', name: 'Merck KGaA (Electronics)', ticker: 'MRK.DE', country: 'Germany',
    industry: 'Semiconductor Materials', segment: 'Photoresist/Chemicals',
    role: 'supplier1', description: 'EUV photoresist and liquid crystal materials leader; critical for Intel 18A and Intel 3 process flows.',
    financials: { revenue: '$5.2B (Elec.)', marketCap: '~$50B' },
    articles: [
      { title: 'Merck KGaA EUV Photoresist Qualifies for Intel 18A Production', source: 'Semiconductor Today', date: '2024-Q3', url: '#' },
    ],
  },
  {
    id: 'JSR', name: 'JSR Corporation', ticker: '4185.T', country: 'Japan',
    industry: 'Semiconductor Materials', segment: 'Photoresist/Chemicals',
    role: 'supplier1', description: 'Leading photoresist supplier; provides EUV and ArF immersion resists for Intel advanced processes.',
    financials: { revenue: '$3.1B', marketCap: '~$8B' },
    articles: [
      { title: 'JSR Photoresist Adopted for Intel 3 Volume Production', source: 'Nikkei Asia', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'TOK', name: 'Tokyo Ohka Kogyo (TOK)', ticker: '4186.T', country: 'Japan',
    industry: 'Semiconductor Materials', segment: 'Photoresist/Chemicals',
    role: 'supplier1', description: 'Photoresist and specialty chemical supplier; key partner for Intel advanced lithography.',
    financials: { revenue: '$1.4B', marketCap: '~$3.8B' },
    articles: [
      { title: 'TOK Expands Photoresist Production for Intel EUV Demand', source: 'DigiTimes', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'SKSIL', name: 'SK Siltron', ticker: 'private', country: 'South Korea',
    industry: 'Semiconductor Materials', segment: 'Silicon Wafers',
    role: 'supplier1', description: 'Major silicon wafer producer; key supplier of 300mm polished and epitaxial wafers for Intel.',
    financials: { revenue: '$1.6B', marketCap: 'Private' },
    articles: [
      { title: 'SK Siltron Invests in Wafer Capacity for Intel 18A Node', source: 'Korea Herald', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'DUPONT', name: 'DuPont Electronics', ticker: 'DD', country: 'USA',
    industry: 'Semiconductor Materials', segment: 'Advanced Materials',
    role: 'supplier1', description: 'Advanced semiconductor materials supplier; provides photoresists, dielectric films, and CMP products.',
    financials: { revenue: '$12.1B', marketCap: '~$30B' },
    articles: [
      { title: 'DuPont Launches Low-k Dielectric Material for Intel 18A-class Chips', source: 'Chemical Week', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'CABOT', name: 'CMC Materials (Cabot)', ticker: 'CCMP', country: 'USA',
    industry: 'Semiconductor Materials', segment: 'CMP Materials',
    role: 'supplier2', description: 'CMP slurries and polishing pad supplier for tungsten, copper, and barrier CMP processes.',
    financials: { revenue: '$1.3B', marketCap: '~$3.5B' },
    articles: [
      { title: 'Cabot CMP Slurry Adopted for Intel Advanced Logic Processing', source: 'Solid State Technology', date: '2024-Q1', url: '#' },
    ],
  },
  {
    id: 'AXNX', name: 'Axcelis Technologies', ticker: 'ACLS', country: 'USA',
    industry: 'Semiconductor Equipment', segment: 'Ion Implant',
    role: 'supplier2', description: 'Ion implantation equipment supplier for source/drain doping in advanced logic nodes.',
    financials: { revenue: '$1.1B', marketCap: '~$3.0B' },
    articles: [
      { title: 'Axcelis Ion Implant Tools Gain Share at Intel and Other Advanced Logic Makers', source: 'EE Times', date: '2024-Q2', url: '#' },
    ],
  },
  {
    id: 'HITACH', name: 'Hitachi High-Tech', ticker: '8036.T', country: 'Japan',
    industry: 'Semiconductor Equipment', segment: 'Inspection/Metrology',
    role: 'supplier2', description: 'SEM-based CD metrology and wafer inspection tools for advanced node process control.',
    financials: { revenue: '$2.8B', marketCap: '~$4.5B' },
    articles: [
      { title: 'Hitachi High-Tech SEM Metrology Adopted at Intel 3 Production Lines', source: 'Semiconductor Digest', date: '2024-Q1', url: '#' },
    ],
  },
];

export const CUSTOMER_ARTICLES: Record<string, GraphArticle[]> = {
  HPQ: [
    { title: 'HP Launches New EliteBook with Intel Core Ultra Processors', source: 'HP Newsroom', date: '2024-Q2', url: '#' },
    { title: 'HP Commercial PC Refresh Lifts Intel vPro Attach Rates', source: 'Channel Futures', date: '2024-Q3', url: '#' },
  ],
  DELL: [
    { title: 'Dell PowerEdge Servers Adopt Intel Xeon 6 for AI Inference', source: 'Dell Technologies', date: '2024-Q2', url: '#' },
    { title: 'Dell Expands Latitude Portfolio Around Intel Core Ultra', source: 'CRN', date: '2024-Q2', url: '#' },
  ],
  LENOVO: [
    { title: 'Lenovo Debuts ThinkPad AI PCs Powered by Intel Core Ultra', source: 'Nikkei Asia', date: '2024-Q2', url: '#' },
    { title: 'Lenovo Workstations Standardize on New Intel Xeon Platforms', source: 'DigiTimes', date: '2024-Q3', url: '#' },
  ],
  MSFT: [
    { title: 'Microsoft Azure Deploys Intel Gaudi 3 AI Accelerators', source: 'Microsoft Azure Blog', date: '2024-Q3', url: '#' },
    { title: 'Azure Expands Intel Xeon Fleet for Enterprise AI Inference', source: 'Reuters', date: '2024-Q2', url: '#' },
  ],
  AMZN: [
    { title: 'AWS Adds More Intel Xeon-Based EC2 Options for General Compute', source: 'AWS Blog', date: '2024-Q2', url: '#' },
    { title: 'Amazon Keeps Intel in Broad Data Center Mix Despite Custom Silicon Push', source: 'The Information', date: '2024-Q3', url: '#' },
  ],
  GOOGL: [
    { title: 'Google Cloud Refreshes Internal Server Fleet with Intel Xeon', source: 'Google Cloud Blog', date: '2024-Q2', url: '#' },
    { title: 'Google Uses Intel Platforms for Balanced AI Host Infrastructure', source: 'SemiAnalysis', date: '2024-Q3', url: '#' },
  ],
};

export const GRAPH_EDGES: GraphEdge[] = [
  { from: 'INTC', to: 'ASML', label: 'EUV System Procurement', weight: 5, description: "Intel is one of ASML's largest customers, with High-NA EUV central to Intel 18A and beyond." },
  { from: 'INTC', to: 'AMAT', label: 'CVD/PVD/CMP Tools', weight: 5, description: "Applied Materials supplies a large share of Intel's deposition and CMP equipment fleet." },
  { from: 'INTC', to: 'LRCX', label: 'Etch Equipment', weight: 5, description: 'Lam Research etch tools are core platforms for Intel advanced node manufacturing.' },
  { from: 'INTC', to: 'KLAC', label: 'Process Control & Inspection', weight: 4, description: 'KLA inspection tools support Intel yield learning and high-volume ramp execution.' },
  { from: 'INTC', to: 'TOELY', label: 'Coater/Developer & CVD', weight: 4, description: 'Tokyo Electron supplies coater/developer and cleaning systems across Intel fabs.' },
  { from: 'INTC', to: 'SHECY', label: 'Silicon Wafers & Photoresist', weight: 4, description: "Shin-Etsu is a major 300mm wafer and materials supplier to Intel's logic operations." },
  { from: 'INTC', to: 'SUOPY', label: 'Silicon Wafers', weight: 3, description: 'Sumco provides polished and epitaxial 300mm silicon wafers for Intel logic production.' },
  { from: 'INTC', to: 'APD', label: 'Specialty Gases', weight: 3, description: 'Air Products delivers UHP NF3, WF6, and specialty gases to Intel manufacturing sites.' },
  { from: 'INTC', to: 'ENTG', label: 'CMP & Filtration Materials', weight: 3, description: 'Entegris provides contamination control materials and advanced packaging inputs to Intel.' },
  { from: 'INTC', to: 'HPQ', label: 'PC CPU Supply', weight: 5, description: 'Intel supplies Core Ultra and vPro processors used across HP commercial and consumer PCs.' },
  { from: 'INTC', to: 'DELL', label: 'Enterprise PC & Server CPUs', weight: 5, description: 'Dell sources Intel CPUs for Latitude notebooks, Precision workstations, and PowerEdge servers.' },
  { from: 'INTC', to: 'LENOVO', label: 'Notebook & Desktop CPUs', weight: 4, description: 'Lenovo relies on Intel client and workstation processors across ThinkPad and desktop families.' },
  { from: 'INTC', to: 'MSFT', label: 'Xeon & Gaudi Infrastructure', weight: 4, description: 'Microsoft uses Intel Xeon platforms and Gaudi accelerators for Azure infrastructure deployments.' },
  { from: 'INTC', to: 'AMZN', label: 'Xeon Cloud Instances', weight: 4, description: 'AWS continues to deploy Intel Xeon-based EC2 instances for broad enterprise workloads.' },
  { from: 'INTC', to: 'GOOGL', label: 'Cloud Server Platforms', weight: 4, description: 'Google Cloud uses Intel Xeon platforms for balanced compute and AI host infrastructure.' },
  { from: 'INTC', to: 'AMKR', label: 'Advanced Packaging', weight: 3, description: 'Intel works with Amkor on advanced packaging and geographic diversification of back-end capacity.' },
  { from: 'INTC', to: 'ASX', label: 'SiP & 3D IC Packaging', weight: 3, description: 'ASE Group handles advanced SiP and packaging services that complement Intel compute programs.' },
  { from: 'INTC', to: 'IBIDEN', label: 'Package Substrates', weight: 3, description: 'Ibiden ABF substrates are required for Intel high-performance CPU and AI packages.' },
  { from: 'INTC', to: 'AMD', label: 'x86 CPU Competition', weight: 5, description: "AMD is Intel's primary x86 CPU rival in client and server processors." },
  { from: 'INTC', to: 'NVDA', label: 'AI Accelerator Competition', weight: 5, description: 'NVIDIA dominates AI accelerators, pressuring Intel Gaudi and broader data center strategy.' },
  { from: 'INTC', to: 'QCOM', label: 'ARM PC Competition', weight: 4, description: "Qualcomm's Snapdragon X platforms challenge Intel in thin-and-light AI PCs." },
  { from: 'INTC', to: 'TSM', label: 'Foundry Competition', weight: 4, description: 'TSMC remains the benchmark competitor for Intel Foundry Services on leading-edge nodes.' },
  { from: 'INTC', to: 'ARM', label: 'CPU Architecture Competition', weight: 3, description: "Arm's architecture gains share in servers and PCs, challenging Intel's x86 position." },
  { from: 'ASML', to: 'ZEISS', label: 'Optics Supply', weight: 5, description: 'Carl Zeiss supplies EUV optics exclusively to ASML; critical sole-source relationship.' },
  { from: 'AMAT', to: 'AZTA', label: 'Wafer Handling', weight: 3, description: 'Brooks Automation vacuum robots and transfer systems are used in AMAT process tools.' },
];
