'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';
import { useWatchlist } from '@/app/contexts/WatchlistContext';

// ── AI Suggestion data ────────────────────────────────────────────────────────
interface SuggestionItem {
  id: string;
  label: string;
  type: 'event' | 'topic';
  symbols: string[];
}

const AI_SUGGESTIONS: SuggestionItem[] = [
  {
    id: 'event-us-iran',
    label: 'US-Iran Conflict',
    type: 'event',
    symbols: ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'XOM', 'CVX', 'COP', 'OXY', 'MPC'],
  },
  {
    id: 'event-claude-leak',
    label: 'Anthropic Claude Code Leak',
    type: 'event',
    symbols: ['GOOGL', 'AMZN', 'MSFT', 'NVDA', 'CRWD', 'PANW', 'ZS', 'OKTA', 'S', 'PLTR'],
  },
  {
    id: 'event-taiwan-us-trade',
    label: 'Taiwan-US Trade Agreement (15% Tariff)',
    type: 'event',
    symbols: ['TC', 'AAPL', 'QCOM', 'AVGO', 'AMAT', 'LRCX', 'INTC', 'TXN', 'MU', 'KLAC'],
  },
  {
    id: 'topic-next-gen-ai',
    label: 'Next-gen AI',
    type: 'topic',
    symbols: ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'AAPL', 'AMD', 'QCOM', 'ARM', 'SMCI'],
  },
  {
    id: 'topic-semiconductors',
    label: 'Semiconductors',
    type: 'topic',
    symbols: ['NVDA', 'TC', 'INTC', 'AMD', 'QCOM', 'ASML', 'AMAT', 'LRCX', 'KLAC', 'MU', 'AVGO', 'TXN'],
  },
  {
    id: 'topic-3d-fabric',
    label: '3D Fabric',
    type: 'topic',
    symbols: ['TC', 'NVDA', 'AMD', 'INTC', 'MU', 'AMKR', 'ASX', 'SMCI', 'AMAT', 'ENTG'],
  },
  {
    id: 'topic-reciprocal-tariff',
    label: 'US Reciprocal Tariff Policy',
    type: 'topic',
    symbols: ['AAPL', 'MSFT', 'AMZN', 'TSLA', 'NKE', 'WMT', 'COST', 'TGT', 'TC', 'QCOM'],
  },
];

const EVENT_SUGGESTIONS = AI_SUGGESTIONS.filter((s) => s.type === 'event');
const TOPIC_SUGGESTIONS = AI_SUGGESTIONS.filter((s) => s.type === 'topic');

// ── AI Explainability data ─────────────────────────────────────────────────────
interface SymbolAiInfo {
  tier: 'Primary' | 'Secondary' | 'Supporting';
  relevanceScore: number;
  posKpis: string[]; // positive-correlation KPI dimensions
  note: string;
}

interface SuggestionAiContext {
  description: string;
  keyFactors: string[];
  dataSources: string[];
  symbolInfo: Record<string, SymbolAiInfo>;
}

const AI_CONTEXT: Record<string, SuggestionAiContext> = {
  'event-us-iran': {
    description:
      'Escalation of US-Iran geopolitical tensions drives demand for defense hardware, increases oil supply-risk premiums, and accelerates government defense contracts.',
    keyFactors: [
      'Defense budget supplemental spending (+$18B)',
      'Strait of Hormuz oil-transit risk (21M bbl/day)',
      'Missile defense & air superiority procurement surge',
      'Energy price volatility (+12% crude in 30 days)',
      'NATO partner co-production agreements activated',
    ],
    dataSources: ['US DoD FY2026 Budget Request', 'EIA Oil Supply Report Apr 2026', 'Reuters Defense Procurement Database'],
    symbolInfo: {
      LMT: { tier: 'Primary', relevanceScore: 95, posKpis: ['Defense Contract Backlog ↑', 'F-35 Delivery Rate ↑', 'Government Revenue %', 'R&D Funded by DoD'], note: 'Lead contractor for F-35, THAAD, & missile systems' },
      RTX: { tier: 'Primary', relevanceScore: 93, posKpis: ['Patriot Missile Demand ↑', 'Raytheon Missiles Revenue ↑', 'DoD Contract Win Rate', 'International Sales %'], note: 'Patriot air defense & Stinger MANPAD supplier' },
      NOC: { tier: 'Primary', relevanceScore: 91, posKpis: ['B-21 Program Milestones ↑', 'Cyber Defense Revenue ↑', 'Backlog Growth YoY', 'Space Systems Revenue'], note: 'B-21 Raider stealth bomber & C4ISR systems' },
      GD: { tier: 'Primary', relevanceScore: 88, posKpis: ['Submarine Order Book ↑', 'Munitions Procurement ↑', 'International Defense Sales', 'Gulfstream Mix'], note: 'Virginia-class submarines & Stryker vehicles' },
      BA: { tier: 'Secondary', relevanceScore: 75, posKpis: ['Military Aircraft Revenue ↑', 'Tanker Deliveries ↑', 'DoD Backlog Value', 'Joint Strike Fighter %'], note: 'F/A-18, KC-46 tanker & defense systems' },
      XOM: { tier: 'Primary', relevanceScore: 90, posKpis: ['Brent Crude Price ↑', 'Refinery Utilization Rate ↑', 'Upstream Production ↑', 'LNG Export Volume'], note: 'Largest US oil major, direct oil-price beneficiary' },
      CVX: { tier: 'Primary', relevanceScore: 88, posKpis: ['WTI Spot Price ↑', 'Permian Basin Output ↑', 'Free Cash Flow Yield ↑', 'Dividend Coverage Ratio'], note: 'Integrated oil with significant Middle East exposure' },
      COP: { tier: 'Secondary', relevanceScore: 80, posKpis: ['Oil Price Realization ↑', 'Production Volume ↑', 'Cash Return Yield ↑', 'Exploration Success Rate'], note: 'Pure-play upstream E&P with global diversification' },
      OXY: { tier: 'Secondary', relevanceScore: 78, posKpis: ['Oil Price Leverage ↑', 'Permian Cost Efficiency ↑', 'DAPL Volume ↑', 'Chemical Segment Margin'], note: 'High oil-price leverage from Anadarko acquisition debt' },
      MPC: { tier: 'Supporting', relevanceScore: 65, posKpis: ['Refining Crack Spread ↑', 'Throughput Utilization ↑', 'Mid-continent Margin ↑', 'MPLX Dividend ↑'], note: 'Refiner benefits from crude-product spread widening' },
    },
  },
  'event-claude-leak': {
    description:
      'Anthropic Claude model weights leak intensifies AI IP security concerns, accelerating demand for AI-native cybersecurity tools, zero-trust architecture, and enterprise LLM governance solutions.',
    keyFactors: [
      'AI model IP protection now board-level priority',
      'Enterprise AI firewall/governance spend +35% YoY',
      'Zero-trust architecture adoption at Fortune 500 accelerating',
      'Insider threat detection AI market growing 28% CAGR',
      'Cloud AI workload security mandates from SEC & NIST',
    ],
    dataSources: ['Gartner AI Security Report 2026', 'Forrester Zero Trust Wave Q1 2026', 'IDC AI Governance Spend Tracker'],
    symbolInfo: {
      GOOGL: { tier: 'Primary', relevanceScore: 88, posKpis: ['Google Cloud AI Revenue ↑', 'Workspace Security ARR ↑', 'Gemini Enterprise Adoption ↑', 'Cloud Security Services'], note: 'GCP + Mandiant AI threat intelligence' },
      AMZN: { tier: 'Primary', relevanceScore: 87, posKpis: ['AWS AI Security Revenue ↑', 'Amazon Bedrock Guardrails ↑', 'Enterprise AI Platform Share ↑', 'GuardDuty AI Adoption'], note: 'AWS dominates enterprise AI workload security' },
      MSFT: { tier: 'Primary', relevanceScore: 92, posKpis: ['Azure AI Defender Revenue ↑', 'Copilot+ Security Bundle ↑', 'Sentinel SIEM Growth ↑', 'E5 License Attach Rate'], note: 'Microsoft Security is $20B+ revenue; AI-native SIEM leader' },
      NVDA: { tier: 'Secondary', relevanceScore: 82, posKpis: ['AI Compute Demand ↑', 'Confidential Computing GPU ↑', 'NIM Microservice Revenue ↑', 'CUDA Ecosystem Lock-in'], note: 'Hopper/Blackwell GPUs power secure AI inference' },
      CRWD: { tier: 'Primary', relevanceScore: 96, posKpis: ['AI Threat Detection Revenue ↑', 'Falcon Platform ARR ↑', 'AI-powered EDR Wins ↑', 'Federal Security Pipeline'], note: 'CrowdStrike Charlotte AI leads AI-native threat detection' },
      PANW: { tier: 'Primary', relevanceScore: 94, posKpis: ['Prisma SASE Revenue ↑', 'Cortex XDR AI Wins ↑', 'Platformization Deals ↑', 'AI Access Broker Revenue'], note: 'AI Access Security & LLM firewall pioneer' },
      ZS: { tier: 'Primary', relevanceScore: 90, posKpis: ['Zero Trust Exchange ARR ↑', 'AI-powered Data Protection ↑', 'Workload Segmentation ↑', 'SASE Market Share'], note: 'Zero-trust leader; AI workload isolation capabilities' },
      OKTA: { tier: 'Secondary', relevanceScore: 78, posKpis: ['AI Identity Governance ↑', 'Workforce Identity ARR ↑', 'Non-human Identity Market ↑', 'CIAM Revenue Growth'], note: 'Identity governance for AI service accounts & LLM APIs' },
      S:    { tier: 'Secondary', relevanceScore: 75, posKpis: ['AI Security Data Platform ↑', 'Purple AI Adoption ↑', 'Endpoint Revenue ↑', 'GCP Partnership Revenue'], note: 'SentinelOne Purple AI co-pilots threat response' },
      PLTR: { tier: 'Supporting', relevanceScore: 70, posKpis: ['AI Platform Revenue ↑', 'AIP for Defense ↑', 'Government Contract Value ↑', 'US Commercial ARR'], note: 'Palantir AIP enables AI-safe enterprise data governance' },
    },
  },
  'event-taiwan-us-trade': {
    description:
      'Taiwan-US semiconductor trade agreement with a 15% preferential tariff reshapes supply chain economics, accelerating US-based fabrication investment and benefiting companies with deep Taiwan partnerships.',
    keyFactors: [
      '15% tariff differential vs standard MFN rate (25%)',
      'TSMC Arizona fab 2nm production timeline pull-forward',
      'CHIPS Act co-investment eligibility for Taiwan partners',
      'US DoD critical-fab designation for 3nm and below',
      'Supply chain resiliency premium priced into fabless valuations',
    ],
    dataSources: ['USTR Taiwan Trade Framework 2026', 'SEMI Semiconductor Equipment Outlook', 'CHIPS Program Office Investment Report'],
    symbolInfo: {
      TC:   { tier: 'Primary', relevanceScore: 97, posKpis: ['Arizona Fab Utilization ↑', 'US Advanced Node Revenue ↑', 'N3E Customer Wins ↑', 'CHIPS Act Subsidy'], note: 'Direct beneficiary as the world\'s leading contract foundry' },
      AAPL: { tier: 'Primary', relevanceScore: 90, posKpis: ['A-series Chip Cost ↓', 'US-sourced Silicon % ↑', 'Supply Chain Resilience ↑', 'Gross Margin from Chips ↑'], note: '100% of A-series & M-series chips fabbed at TSMC' },
      QCOM: { tier: 'Primary', relevanceScore: 88, posKpis: ['Snapdragon Margin ↑', 'US-fab Premium Wafer Cost ↓', 'Auto Chip Revenue ↑', 'PC-Chip Design Wins ↑'], note: 'Qualcomm designs all SoCs at TSMC; major beneficiary' },
      AVGO: { tier: 'Primary', relevanceScore: 86, posKpis: ['Custom Silicon ASICs ↑', 'AI Accelerator Revenue ↑', 'Networking Chip Margin ↑', 'Hyperscaler Custom Revenue'], note: 'XPU + networking silicon at TSMC advanced nodes' },
      AMAT: { tier: 'Secondary', relevanceScore: 83, posKpis: ['WFE Equipment Spend ↑', 'Etch & Deposition Tools ↑', 'Service Revenue ↑', 'Advanced Node Mix ↑'], note: 'TSMC Arizona expansion drives ALD/CVD tool orders' },
      LRCX: { tier: 'Secondary', relevanceScore: 80, posKpis: ['Etch Equipment Revenue ↑', 'DRAM/Logic WFE Share ↑', 'Installed Base Upgrades ↑', 'Customer Concentration Risk ↓'], note: 'Lam etch tools are critical for 5nm and below' },
      INTC: { tier: 'Secondary', relevanceScore: 72, posKpis: ['IFS Customer Wins ↑', 'Advanced Packaging Revenue ↑', 'Intel 18A Node Adoption ↑', 'US Foundry Market Share ↑'], note: 'Intel Foundry Services positioned as US-based alternative' },
      TXN:  { tier: 'Supporting', relevanceScore: 65, posKpis: ['300mm Sherman Fab Output ↑', 'Auto/Industrial Revenue ↑', 'US Fab % ↑', 'CHIPS Act Grant'], note: 'Texas Instruments domestic 300mm capacity expansion' },
      MU:   { tier: 'Supporting', relevanceScore: 68, posKpis: ['HBM Revenue ↑', 'AI Memory ASP ↑', 'US DRAM Capacity ↑', 'CHIPS Act Funding'], note: 'Micron Idaho fab expansion + HBM AI demand tailwind' },
      KLAC: { tier: 'Supporting', relevanceScore: 70, posKpis: ['Process Control Revenue ↑', 'Logic Yield Mgmt ↑', 'Advanced Node % ↑', 'Inspection Tool Demand'], note: 'KLA inspection tools indispensable for advanced node ramp' },
    },
  },
  'topic-next-gen-ai': {
    description:
      'Next-generation AI (GPT-5 class, multimodal, agentic AI) is driving a new wave of capital expenditure across cloud infrastructure, chip design, and enterprise software — creating compounding revenue tailwinds.',
    keyFactors: [
      'Hyperscaler AI CapEx >$250B combined FY2026 (MSFT+AMZN+GOOGL+META)',
      'Inference chip TAM: $400B by 2030 (Goldman Sachs)',
      'Agentic AI workflows replacing 30% of knowledge worker tasks',
      'AI Model-as-a-Service API revenue growing 150% YoY',
      'On-device AI (Apple Intelligence, Snapdragon X) accelerating',
    ],
    dataSources: ['Goldman Sachs AI Infrastructure Report', 'IDC AI Platform Forecast 2026', 'Bloomberg Intelligence Semiconductor Tracker'],
    symbolInfo: {
      NVDA: { tier: 'Primary', relevanceScore: 99, posKpis: ['Data Center Revenue ↑', 'Blackwell GPU Shipment ↑', 'NIM Inference Revenue ↑', 'CUDA Software Moat'], note: 'Undisputed AI accelerator leader; 80%+ data center GPU share' },
      MSFT: { tier: 'Primary', relevanceScore: 95, posKpis: ['Azure AI Revenue ↑', 'Copilot ARR ↑', 'OpenAI Integration Depth ↑', 'AI Commercial Cloud $'], note: 'OpenAI partnership + Azure AI Platform driving hyperscale growth' },
      GOOGL: { tier: 'Primary', relevanceScore: 94, posKpis: ['Google Cloud AI Revenue ↑', 'Gemini Search AI ↑', 'YouTube AI Features ↑', 'TPU Custom Silicon %'], note: 'Gemini Ultra + GCP vertexAI + custom TPU competitive moat' },
      META: { tier: 'Primary', relevanceScore: 92, posKpis: ['Llama Open-source Adoption ↑', 'AI Ad Targeting ROI ↑', 'AI Infrastructure CapEx ↑', 'Reels AI Engagement ↑'], note: 'Llama AI model + AI-driven advertising efficiency leader' },
      AMZN: { tier: 'Primary', relevanceScore: 91, posKpis: ['AWS Bedrock ARR ↑', 'Trainium Chip Adoption ↑', 'AI Search Revenue ↑', 'Alexa+ AI Subscription'], note: 'AWS Bedrock + Trainium + Amazon Nova model suite' },
      AAPL: { tier: 'Secondary', relevanceScore: 82, posKpis: ['Apple Intelligence Adoption ↑', 'AI On-device Revenue ↑', 'Services AI Attach Rate ↑', 'iPhone AI Upgrade Cycle ↑'], note: 'Apple Intelligence drives iPhone 17 upgrade supercycle' },
      AMD:  { tier: 'Secondary', relevanceScore: 84, posKpis: ['MI350 GPU Revenue ↑', 'ROCm Ecosystem Wins ↑', 'AI PC CPU Revenue ↑', 'Hyperscaler Design Wins ↑'], note: 'MI300X series challenging NVDA in AI inference workloads' },
      QCOM: { tier: 'Secondary', relevanceScore: 80, posKpis: ['Snapdragon X AI Performance ↑', 'On-device NPU Revenue ↑', 'PC AI Design Wins ↑', 'Auto AI Platform Revenue'], note: 'Hexagon NPU powers on-device AI in Snapdragon X Elite' },
      ARM:  { tier: 'Secondary', relevanceScore: 85, posKpis: ['Royalty Revenue ↑', 'AI Compute Architecture Wins ↑', 'CSS Design Wins ↑', 'v9 Architecture Adoption'], note: 'ARMv9 is the dominant architecture for AI edge & mobile' },
      SMCI: { tier: 'Supporting', relevanceScore: 74, posKpis: ['AI Server Revenue ↑', 'GPU Rack Integration ↑', 'Liquid Cooling Units ↑', 'NVDA Rack Ship Partner'], note: 'Preferred partner for NVDA HGX GPU server integration' },
    },
  },
  'topic-semiconductors': {
    description:
      'Semiconductor industry in a new upcycle driven by AI, auto electrification, and advanced packaging. WFE spend recovery and AI chip unit economics are compressing historical inventory correction cycles.',
    keyFactors: [
      'AI accelerator TAM growing from $45B (2023) to $400B (2030)',
      'Leading-edge foundry capacity utilization >90%',
      'Advanced packaging (CoWoS, SoIC) bottleneck easing in 2026',
      'Auto semiconductor content per vehicle up 40% to EV transition',
      'China advanced chip restriction driving domestic supply concern',
    ],
    dataSources: ['SEMI World Fab Forecast Q1 2026', 'Gartner Semiconductor Forecast', 'IHS Markit Auto Semiconductor Report'],
    symbolInfo: {
      NVDA: { tier: 'Primary', relevanceScore: 98, posKpis: ['AI Chip Revenue ↑', 'Data Center GPU ↑', 'HBM Memory Demand ↑', 'Advanced Packaging %'], note: 'AI chip leader; every GPU needs CoWoS advanced packaging' },
      TC:   { tier: 'Primary', relevanceScore: 97, posKpis: ['Advanced Node Loading ↑', 'N3/N2 Revenue ↑', 'CoWoS Capacity ↑', 'Customer Diversification'], note: 'World leader in logic foundry; 60%+ advanced node share' },
      INTC: { tier: 'Secondary', relevanceScore: 72, posKpis: ['Intel 18A Yield ↑', 'IFS Foundry Revenue ↑', 'Panther Lake Tape-out ↑', 'x86 Server Revenue'], note: 'Intel foundry turnaround critical for US semiconductor independence' },
      AMD:  { tier: 'Secondary', relevanceScore: 85, posKpis: ['AI Accelerator Revenue ↑', 'EPYC Server Share ↑', 'MI300 GPU Shipments ↑', 'Chiplet Architecture Wins'], note: 'AMD EPYC + MI GPU suite benefiting from data center AI' },
      QCOM: { tier: 'Secondary', relevanceScore: 78, posKpis: ['Snapdragon Premium ASP ↑', 'QCT Revenue Growth ↑', 'Auto Chip Revenue ↑', 'IoT Platform Revenue'], note: 'Diversifying from mobile into auto, PC, and IoT' },
      ASML: { tier: 'Primary', relevanceScore: 96, posKpis: ['EUV Tool Shipments ↑', 'High-NA EUV Demand ↑', 'Service Revenue ↑', 'China Export Risk ↓'], note: 'EUV lithography monopoly; no advanced chip without ASML' },
      AMAT: { tier: 'Primary', relevanceScore: 90, posKpis: ['WFE Market Share ↑', 'Gate-all-around Tool Revenue ↑', 'Advanced Etch Revenue ↑', 'Service Install Base'], note: 'Leading deposition & etch tool vendor for advanced nodes' },
      LRCX: { tier: 'Secondary', relevanceScore: 86, posKpis: ['Etch Revenue ↑', 'DRAM WFE Recovery ↑', 'Customer-of-Record Wins ↑', 'Installed Base Services'], note: 'Lam Research etch/clean tools critical for memory & logic' },
      KLAC: { tier: 'Secondary', relevanceScore: 83, posKpis: ['Process Control Revenue ↑', 'Overlay Metrology Demand ↑', 'Wafer Inspection Wins ↑', 'Semiconductor Yield Value'], note: 'KLA yield management becomes more critical at 3nm+' },
      MU:   { tier: 'Secondary', relevanceScore: 82, posKpis: ['HBM Revenue ↑', 'DRAM Price Cycle ↑', 'AI Server DRAM Mix ↑', 'NAND Profitability ↑'], note: 'Micron HBM3E is a critical AI memory component' },
      AVGO: { tier: 'Primary', relevanceScore: 91, posKpis: ['Custom AI ASIC Revenue ↑', 'Networking Switch Revenue ↑', 'Hyperscaler XPU Wins ↑', 'Broadcom Software Revenue'], note: 'Custom AI ASICs for Google & Meta; networking silicon leader' },
      TXN:  { tier: 'Supporting', relevanceScore: 68, posKpis: ['Analog Revenue Recovery ↑', 'Industrial Demand ↑', 'Auto Analog Revenue ↑', 'US Fab Cost Efficiency'], note: 'TI analog/embedded benefiting from industrial IoT recovery' },
    },
  },
  'topic-3d-fabric': {
    description:
      '3D integration and heterogeneous chip assembly (CoWoS, SoIC, Foveros) is the key enabler for next-gen AI chips, overcoming reticle-size limits and enabling orders-of-magnitude memory bandwidth improvements.',
    keyFactors: [
      'CoWoS substrate bottleneck being resolved with TSMC CoWoS-S/L',
      'HBM4 memory bandwidth 2× over HBM3E for AI training',
      'Intel Foveros Direct 3D stacking reaching commercial volume',
      'OSAT (AMKR, ASE) revenues growing 25% from AI packaging demand',
      'DRAM-on-logic 3D stacking enabling CXL memory pooling',
    ],
    dataSources: ['SEMI 3D Advanced Packaging Report 2026', 'Yole Développement HBM Forecast', 'IEEE IEDM 2025 Packaging Proceedings'],
    symbolInfo: {
      TC:   { tier: 'Primary', relevanceScore: 98, posKpis: ['CoWoS Capacity Revenue ↑', 'SoIC 3D Stacking Wins ↑', 'Advanced Packaging % ↑', 'N3 + CoWoS Bundle Revenue'], note: 'TSMC CoWoS is the critical bottleneck input for AI GPUs' },
      NVDA: { tier: 'Primary', relevanceScore: 96, posKpis: ['Blackwell NVL72 Shipment ↑', 'HBM3E Memory Bandwidth ↑', 'Advanced Pkg Gross Margin ↑', 'GB200 NVL72 Rack Value'], note: 'Every Blackwell GPU requires CoWoS + HBM3E 3D stacking' },
      AMD:  { tier: 'Primary', relevanceScore: 88, posKpis: ['3D V-Cache Revenue ↑', 'MI350 Chiplet Wins ↑', 'Chiplet Design Royalties ↑', 'UCIe Standard Adoption'], note: 'AMD 3D V-Cache + chiplet architecture leadership' },
      INTC: { tier: 'Secondary', relevanceScore: 78, posKpis: ['Foveros Adopt Rate ↑', 'EMIB Revenue ↑', 'Advanced Packaging IFS ↑', 'Meteor Lake Volume ↑'], note: 'Intel Foveros/EMIB for heterogeneous integration' },
      MU:   { tier: 'Primary', relevanceScore: 92, posKpis: ['HBM3E Shipment ↑', 'HBM ASP ↑', 'AI Memory Market Share ↑', 'HBM Gross Margin ↑'], note: 'HBM3E high-bandwidth memory is the key 3D stacking product' },
      AMKR: { tier: 'Primary', relevanceScore: 87, posKpis: ['Advanced Packaging Revenue ↑', 'Fan-out WLP Revenue ↑', 'AI OSAT Wins ↑', 'Capacity Utilization ↑'], note: 'Amkor OSAT for advanced packaging; top CoWoS partner' },
      ASX:  { tier: 'Supporting', relevanceScore: 72, posKpis: ['SiP Revenue ↑', 'OSAT Market Share ↑', 'Advanced Packaging % ↑', 'Taiwan Fab Utilization'], note: 'ASE Group is a leading OSAT for complex package types' },
      SMCI: { tier: 'Secondary', relevanceScore: 80, posKpis: ['Liquid-cooled Server Revenue ↑', '3D GPU Rack Integration ↑', 'NVL72 Rack Revenue ↑', 'AI Server ASP ↑'], note: 'Supermicro integrates 3D-packaged GPUs into rack-scale systems' },
      AMAT: { tier: 'Secondary', relevanceScore: 83, posKpis: ['Wafer Bonding Tool Revenue ↑', '3D Packaging WFE Share ↑', 'Sym3 Etch Tool Revenue ↑', 'Advanced Node % ↑'], note: 'Applied wafer bonding & thermal management tools' },
      ENTG: { tier: 'Supporting', relevanceScore: 70, posKpis: ['CMP Slurry Revenue ↑', 'Advanced Materials % ↑', 'Process Yield Materials ↑', 'AI Chip Consumables'], note: 'Entegris provides critical materials for 3D wafer processes' },
    },
  },
  'topic-reciprocal-tariff': {
    description:
      'US reciprocal tariff policy introduces asymmetric import costs, reshuffling competitive dynamics between domestic producers and importers. Companies with high domestic content or pricing power are best positioned.',
    keyFactors: [
      'Average tariff on Chinese goods raised to 54%',
      'Consumer electronics exempt for 90 days pending review',
      'Domestic manufacturing companies receive implicit pricing power',
      'Supply chain diversification to Vietnam/India/Mexico accelerating',
      'Retail sector margin compression from cost pass-through limits',
    ],
    dataSources: ['USTR Tariff Schedule 2026', 'US Census Trade Data', 'Goldman Sachs Tariff Impact Study Q1 2026'],
    symbolInfo: {
      AAPL: { tier: 'Primary', relevanceScore: 88, posKpis: ['India/Vietnam Assembly % ↑', 'Services Revenue Exempt ↑', 'iPhone Tariff Exemption ↑', 'US Content Investment ↑'], note: 'Risk: 80% iPhone assembly in China; mitigation via India ramp' },
      MSFT: { tier: 'Supporting', relevanceScore: 70, posKpis: ['US Software Revenue % ↑', 'Cloud Revenue Tariff-exempt ↑', 'Azure US Data Center ↑', 'Copilot Pricing Power ↑'], note: 'Software & cloud services largely immune from tariff impact' },
      AMZN: { tier: 'Secondary', relevanceScore: 75, posKpis: ['AWS Cloud Revenue % ↑', 'Third-party Seller Adapt ↑', 'Domestic Warehouse Efficiency ↑', 'Prime Membership Sticky'], note: 'AWS tariff-exempt; retail arm vulnerable to import cost inflation' },
      TSLA: { tier: 'Secondary', relevanceScore: 76, posKpis: ['US-made EV % ↑', 'IRA Domestic Credit ↑', 'Battery Supply Chain US % ↑', 'Fremont/Texas Output ↑'], note: 'Freemont + Austin production; ~90% of US-sold cars made in US' },
      NKE:  { tier: 'Secondary', relevanceScore: 72, posKpis: ['Vietnam Factory % ↑', 'Direct-to-Consumer Revenue ↑', 'Premium Pricing Power ↑', 'SNKRS Platform Margin'], note: 'Nike shifted production from China to Vietnam (50%+); most exposed footwear' },
      WMT:  { tier: 'Secondary', relevanceScore: 74, posKpis: ['Domestic Supplier % ↑', 'Private Label Margin ↑', 'Grocery % of Revenue ↑', 'Automation Efficiency ↑'], note: 'Walmart is diversifying sourcing; grocery (tariff-free) buffers impact' },
      COST: { tier: 'Supporting', relevanceScore: 68, posKpis: ['Kirkland Domestic % ↑', 'Membership Revenue Buffer ↑', 'Bulk Purchasing Power ↑', 'Renewal Rate Sticky'], note: 'Costco membership model provides margin buffer; bulk buying power' },
      TGT:  { tier: 'Secondary', relevanceScore: 64, posKpis: ['US Private Brand % ↑', 'Digital Revenue % ↑', 'Same-day Delivery Adoption ↑', 'Tariff Mgmt Program'], note: 'Target exposed to Chinese-sourced discretionary goods' },
      TC:   { tier: 'Primary', relevanceScore: 86, posKpis: ['Arizona Fab US Revenue ↑', 'Tariff-exempt US Production ↑', 'CHIPS Act Subsidy ↑', 'US Customer Priority Access'], note: 'TSMC Arizona enables US-fabricated chips exempt from tariffs' },
      QCOM: { tier: 'Supporting', relevanceScore: 65, posKpis: ['US-designed Chip Premium ↑', 'IFA Tariff Exemption ↑', 'US Fab Partnership Value ↑', 'Patent Licensing Revenue'], note: 'Qualcomm designs in US; assembly outside; IP revenue tariff-exempt' },
    },
  },
};

// ── Default KPIs for symbols not in context ───────────────────────────────────
function getDefaultSymbolInfo(suggestionType: SuggestionItem['type']): SymbolAiInfo {
  return {
    tier: 'Supporting',
    relevanceScore: 60,
    posKpis: suggestionType === 'event'
      ? ['Revenue Growth ↑', 'Market Position ↑', 'Sector Correlation ↑']
      : ['Sector Revenue % ↑', 'R&D Investment ↑', 'Market Share ↑'],
    note: 'Selected based on sector alignment and thematic correlation.',
  };
}

// Symbol lookup map for quick name resolution
const SYMBOL_LOOKUP = new Map(COMPANY_MASTER_LIST.map((c) => [c.symbol, c.name]));

// ── Relevance donut chart ──────────────────────────────────────────────────────
function RelevanceDonut({ score }: { score: number }) {
  const size = 36;
  const sw = 3.5;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="cwl-ai-donut" aria-hidden="true">
      <defs>
        <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4fc3f7" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={sw} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#donut-grad)"
        strokeWidth={sw}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fontSize="9" fontWeight="700" fill="#1d4ed8">
        {score}
      </text>
    </svg>
  );
}

// ── Tier badge colors ─────────────────────────────────────────────────────────
const TIER_STYLE: Record<SymbolAiInfo['tier'], string> = {
  Primary:   'cwl-ai-tier cwl-ai-tier--primary',
  Secondary: 'cwl-ai-tier cwl-ai-tier--secondary',
  Supporting:'cwl-ai-tier cwl-ai-tier--supporting',
};

interface SymbolItemProps {
  symbol: string;
  index: number;
  relevance?: number;
  onDelete: (sym: string) => void;
  onDragStart: (idx: number) => void;
  onDragEnter: (idx: number) => void;
  onDragEnd: () => void;
}

function SymbolItem({ symbol, index, relevance, onDelete, onDragStart, onDragEnter, onDragEnd }: SymbolItemProps) {
  const name = SYMBOL_LOOKUP.get(symbol) ?? '';
  return (
    <div
      className="cwl-symbol-item"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <svg className="cwl-drag-handle" viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
        <path d="M3 4h8M3 7h8M3 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="cwl-symbol-badge">{symbol}</span>
      <span className="cwl-symbol-name">{name}</span>
      {relevance !== undefined && <span className="cwl-symbol-relevance">{relevance}%</span>}
      <span className="cwl-symbol-rank">#{index + 1}</span>
      <button
        className="cwl-symbol-delete"
        onClick={() => onDelete(symbol)}
        aria-label={`Remove ${symbol}`}
        title={`Remove ${symbol}`}
      >
        <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
          <path
            d="M2.5 4h9M5.5 4V2.5h3V4M5.5 6.5v4M8.5 6.5v4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
    </div>
  );
}

// ── AI Explainability Panel ───────────────────────────────────────────────────
interface AiPanelProps {
  suggestion: SuggestionItem | null;
  symbols: string[];
}

function AiPanel({ suggestion, symbols }: AiPanelProps) {
  const ctx = suggestion ? AI_CONTEXT[suggestion.id] ?? null : null;

  if (symbols.length === 0) return null;

  return (
    <div className="cwl-ai-panel">
      {/* Panel header */}
      <div className="cwl-ai-panel-header">
        <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="8" cy="12" r="0.7" fill="currentColor" />
        </svg>
        <span>AI Selection Rationale</span>
      </div>

      {/* Context card */}
      {ctx && (
        <div className="cwl-ai-context-card">
          <div className="cwl-ai-context-title">
            {suggestion?.type === 'event' ? '📰' : '🔭'} {suggestion?.label}
          </div>
          <p className="cwl-ai-context-desc">{ctx.description}</p>
          <div className="cwl-ai-context-section-label">Key Factors</div>
          <ul className="cwl-ai-factors-list">
            {ctx.keyFactors.map((f, i) => (
              <li key={i} className="cwl-ai-factor-item">{f}</li>
            ))}
          </ul>
          <div className="cwl-ai-context-section-label">Reference Sources</div>
          <div className="cwl-ai-sources-list">
            {ctx.dataSources.map((s, i) => (
              <span key={i} className="cwl-ai-source-tag">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Symbol KPI cards — sorted by relevance (high → low) */}
      <div className="cwl-ai-kpi-section-label">Company Correlation Indicators</div>
      <div className="cwl-ai-kpi-list">
        {[...symbols]
          .sort((a, b) => {
            const ra = ctx?.symbolInfo[a]?.relevanceScore ?? 60;
            const rb = ctx?.symbolInfo[b]?.relevanceScore ?? 60;
            return rb - ra;
          })
          .map((sym) => {
          const info = ctx?.symbolInfo[sym] ?? getDefaultSymbolInfo(suggestion?.type ?? 'topic');
          const name = SYMBOL_LOOKUP.get(sym) ?? '';
          return (
            <div key={sym} className="cwl-ai-kpi-card">
              <div className="cwl-ai-kpi-card-top">
                {/* Relevance donut at top-left, before company name */}
                <RelevanceDonut score={info.relevanceScore} />
                <div className="cwl-ai-kpi-identity">
                  <span className="cwl-ai-kpi-symbol">{sym}</span>
                  {name && <span className="cwl-ai-kpi-name">{name}</span>}
                </div>
                <span className={TIER_STYLE[info.tier]}>{info.tier}</span>
              </div>
              {/* Note */}
              <p className="cwl-ai-kpi-note">{info.note}</p>
              {/* Positive KPI chips */}
              <div className="cwl-ai-kpi-chips">
                {info.posKpis.map((kpi, ki) => (
                  <span key={ki} className="cwl-ai-kpi-chip">{kpi}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CreateWatchlistArchiveContent() {
  const router = useRouter();
  const { addWatchlist } = useWatchlist();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Watchlist config state
  const [watchlistName, setWatchlistName] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [addSymbolInput, setAddSymbolInput] = useState('');
  const [addSuggestions, setAddSuggestions] = useState<{ symbol: string; name: string }[]>([]);

  // Track active suggestion for AI context panel
  const [selectedSuggestion, setSelectedSuggestion] = useState<SuggestionItem | null>(null);

  // Drag state
  const dragIdx = useRef<number | null>(null);

  const [pendingNavId, setPendingNavId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingNavId) {
      const id = pendingNavId;
      setPendingNavId(null);
      router.push(`/watchlist/${id}`);
    }
  }, [pendingNavId, router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter suggestions by query
  const queryLower = query.toLowerCase().trim();
  const filteredEvents = queryLower
    ? EVENT_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(queryLower))
    : EVENT_SUGGESTIONS;
  const filteredTopics = queryLower
    ? TOPIC_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(queryLower))
    : TOPIC_SUGGESTIONS;

  function handleSelectSuggestion(item: SuggestionItem) {
    setQuery(item.label);
    setShowDropdown(false);
    setSelectedSuggestion(item);
    setSymbols((prev) => {
      const ctx = AI_CONTEXT[item.id];
      const existing = new Set(prev);
      const toAdd = item.symbols.filter((s) => !existing.has(s));
      const all = [...prev, ...toAdd];
      // Sort by relevance (high → low)
      if (ctx) {
        all.sort((a, b) => {
          const ra = ctx.symbolInfo[a]?.relevanceScore ?? 60;
          const rb = ctx.symbolInfo[b]?.relevanceScore ?? 60;
          return rb - ra;
        });
      }
      return all;
    });
    setWatchlistName((prev) => (prev.trim() ? prev : item.label));
  }

  const getRelevance = useCallback(
    (sym: string): number | undefined => {
      if (!selectedSuggestion) return undefined;
      const ctx = AI_CONTEXT[selectedSuggestion.id];
      return ctx?.symbolInfo[sym]?.relevanceScore;
    },
    [selectedSuggestion],
  );

  const handleAddSymbol = useCallback(() => {
    const parts = addSymbolInput
      .toUpperCase()
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setSymbols((prev) => {
      const existing = new Set(prev);
      const toAdd = parts.filter((s) => !existing.has(s));
      return [...prev, ...toAdd];
    });
    setAddSymbolInput('');
    setAddSuggestions([]);
  }, [addSymbolInput]);

  useEffect(() => {
    const q = addSymbolInput.toUpperCase().trim();
    if (!q) { setAddSuggestions([]); return; }
    const matches = COMPANY_MASTER_LIST.filter(
      (c) => c.symbol.startsWith(q) || c.name.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 5);
    setAddSuggestions(matches);
  }, [addSymbolInput]);

  function handleDragStart(idx: number) { dragIdx.current = idx; }
  function handleDragEnter(idx: number) {
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setSymbols((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIdx.current!, 1);
      next.splice(idx, 0, item);
      dragIdx.current = idx;
      return next;
    });
  }
  function handleDragEnd() { dragIdx.current = null; }

  function handleDeleteSymbol(sym: string) {
    setSymbols((prev) => prev.filter((s) => s !== sym));
  }

  function handleSubmit() {
    const name = watchlistName.trim() || 'My Watchlist';
    if (symbols.length === 0) return;
    const newId = addWatchlist(name, symbols);
    if (newId) {
      setPendingNavId(newId);
    } else {
      alert('Maximum number of watchlists reached (10). Please delete an existing one first.');
    }
  }

  const canSubmit = symbols.length > 0;
  const showAiPanel = symbols.length > 0;

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className={`cwl-page${showAiPanel ? ' cwl-page--wide' : ''}`}>
            {/* ── Header greeting ── */}
            <div className="cwl-greeting">
              <p className="cwl-greeting-sub">Good day, <strong>PiKa</strong></p>
              <h1 className="cwl-greeting-title">What would you like to follow? <span className="cwl-archive-label">Archive</span></h1>
            </div>

            {/* ── AI Suggestion search bar ── */}
            <div className="cwl-search-wrap" ref={searchRef}>
              <div className={`cwl-search-bar${showDropdown ? ' focused' : ''}`}>
                <svg className="cwl-search-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden="true">
                  <path d="M9 3.5C6.015 3.5 3.5 6.015 3.5 9S6.015 14.5 9 14.5 14.5 11.985 14.5 9 11.985 3.5 9 3.5Z" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.4" />
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <textarea
                  className="cwl-search-input"
                  rows={1}
                  placeholder="Ask about a current event, topic, or theme to build a watchlist…"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  aria-label="Search AI suggestions"
                  autoComplete="off"
                />
                {query && (
                  <button className="cwl-search-clear" onClick={() => { setQuery(''); setShowDropdown(true); }} aria-label="Clear search">
                    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
                      <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>

              {showDropdown && (
                <div className="cwl-dropdown">
                  {filteredEvents.length === 0 && filteredTopics.length === 0 ? (
                    <div className="cwl-dropdown-empty">No matching suggestions</div>
                  ) : (
                    <>
                      {filteredEvents.length > 0 && (
                        <div className="cwl-dropdown-section">
                          <div className="cwl-dropdown-section-label">Current Events</div>
                          {filteredEvents.map((item) => (
                            <button key={item.id} className="cwl-dropdown-item" onClick={() => handleSelectSuggestion(item)}>
                              <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true" className="cwl-dropdown-item-icon">
                                <path d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5L7 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                              </svg>
                              <span className="cwl-dropdown-item-label">{item.label}</span>
                              <span className="cwl-dropdown-item-count">{item.symbols.length} companies</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {filteredTopics.length > 0 && (
                        <div className="cwl-dropdown-section">
                          <div className="cwl-dropdown-section-label">Topics</div>
                          {filteredTopics.map((item) => (
                            <button key={item.id} className="cwl-dropdown-item" onClick={() => handleSelectSuggestion(item)}>
                              <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true" className="cwl-dropdown-item-icon">
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                                <path d="M5 7h4M7 5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                              </svg>
                              <span className="cwl-dropdown-item-label">{item.label}</span>
                              <span className="cwl-dropdown-item-count">{item.symbols.length} companies</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Two-column layout: editor + AI panel ── */}
            <div className={`cwl-content-row${showAiPanel ? ' cwl-content-row--split' : ''}`}>
              {/* ── Watchlist builder (left column) ── */}
              <div className="cwl-builder">
                <div className="cwl-field">
                  <label className="cwl-field-label" htmlFor="cwl-name-input">Watchlist Name</label>
                  <div className="cwl-name-row">
                    <input
                      id="cwl-name-input"
                      className="cwl-name-input"
                      type="text"
                      placeholder="e.g. My AI Portfolio"
                      value={watchlistName}
                      onChange={(e) => setWatchlistName(e.target.value)}
                      maxLength={60}
                    />
                    <button className="cwl-submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
                      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 1.5v13M1.5 8h13" />
                      </svg>
                      Create Watchlist
                    </button>
                  </div>
                </div>

                <div className="cwl-field">
                  <div className="cwl-symbols-header-row">
                    <span className="cwl-field-label">
                      Companies
                      {symbols.length > 0 && <span className="cwl-symbol-count"> ({symbols.length})</span>}
                    </span>
                  </div>

                  <div className="cwl-add-row">
                    <input
                      className="cwl-add-input"
                      type="text"
                      placeholder="Add symbol (e.g. AAPL)"
                      value={addSymbolInput}
                      onChange={(e) => setAddSymbolInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                    />
                    <button className="cwl-add-btn" onClick={handleAddSymbol}>+ Add</button>
                  </div>
                  {addSuggestions.length > 0 && (
                    <div className="cwl-add-suggestions">
                      {addSuggestions.map((c) => (
                        <button
                          key={c.symbol}
                          className="cwl-add-suggestion-item"
                          onClick={() => {
                            setSymbols((prev) => prev.includes(c.symbol) ? prev : [...prev, c.symbol]);
                            setAddSymbolInput('');
                            setAddSuggestions([]);
                          }}
                        >
                          <span className="cwl-add-suggestion-symbol">{c.symbol}</span>
                          <span className="cwl-add-suggestion-name">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {symbols.length === 0 ? (
                    <div className="cwl-symbols-empty">
                      <svg viewBox="0 0 40 40" width="36" height="36" fill="none" aria-hidden="true">
                        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
                        <path d="M14 20C14 20 16 16 20 16C24 16 26 20 26 20C26 20 24 24 20 24C16 24 14 20 14 20Z" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />
                        <circle cx="20" cy="20" r="2.5" fill="currentColor" opacity="0.4" />
                      </svg>
                      <p>Select a suggestion above or type symbols to add companies to your watchlist.</p>
                    </div>
                  ) : (
                    <div className="cwl-symbol-list">
                      {symbols.map((sym, idx) => (
                        <SymbolItem
                          key={sym}
                          symbol={sym}
                          index={idx}
                          relevance={getRelevance(sym)}
                          onDelete={handleDeleteSymbol}
                          onDragStart={handleDragStart}
                          onDragEnter={handleDragEnter}
                          onDragEnd={handleDragEnd}
                        />
                      ))}
                    </div>
                  )}

                  {symbols.length > 0 && (
                    <div className="cwl-slot-info">
                      {symbols.length} symbol{symbols.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* ── AI explainability panel (right column) ── */}
              {showAiPanel && (
                <AiPanel suggestion={selectedSuggestion} symbols={symbols} />
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
