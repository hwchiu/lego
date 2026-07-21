export type DownloadStatus = 'download' | 'pending' | 'downloaded';

// ---- My Library API response types (from /getMyLibrary) ----
export interface MyLibraryApiContributor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface MyLibraryApiDocument {
  research_document_id: string;
  price: number;
  co_cd: string;
  headline: string;
  synopsis: string;
  fileddate: string;
  analyst_name: string;
  pdf_url: string;
  contributor: MyLibraryApiContributor;
  metrics: { downloads: number; page_count: number };
  status: { status: string; is_purchased: 'Y' | 'N' };
}

export type MyLibraryApiResponse = Record<string, MyLibraryApiDocument[]>;

export interface LibraryFolder {
  id: string;
  name: string;
}

export interface ExpertReport {
  id: string;
  company: string;
  companyName: string;
  analystName: string;
  contributor: string;
  publishDate: string;
  updatedAt: string;
  headline: string;
  summary: string;
  category: string;
  priceUsd: number;
  pageCount: number;
  downloadCount: number;
  previewPdfUrl: string;
  fullPdfUrl: string;
  downloadStatus: DownloadStatus;
  libraryFolderId: string | null;
}

export interface ExpertReportQuery {
  company: string;
  contributor: string;
  publishDateStart: string;
  publishDateEnd: string;
  headline: string;
}

export interface ExpertReportOption {
  value: string;
  label: string;
}

export interface ExpertReportSearchResponse {
  reports: ExpertReport[];
  companyOptions: ExpertReportOption[];
  contributorOptions: ExpertReportOption[];
}

export interface ExpertReportLibraryResponse {
  folders: LibraryFolder[];
  reports: ExpertReport[];
}

const SAMPLE_PDF = [
  'data:application/pdf;base64,',
  'JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA0IDAgUiA+PiA+PiAvQ29udGVudHMgNSAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8IC9MZW5ndGggMzY0ID4+CnN0cmVhbQpCVAovRjEgMjIgVGYKNzIgNzIwIFRkCihNSUMgRXhwZXJ0IFJlcG9ydCBTYW1wbGUpIFRqCjAgLTI4IFRkCi9GMSAxMyBUZgooVXNlIHRoZSBsaWJyYXJ5IHZpZXdlciB0b29sYmFyIHRvIHNlYXJjaCBrZXl3b3Jkcywgem9vbSwgY2hhbmdlIHJlYWRpbmcgbW9kZSwgYW5kIGVudGVyIGZ1bGwgc2NyZWVuLikgVGoKMCAtMjQgVGQKKFNhbXBsZSBrZXl3b3JkczogTlZJRElBLCBUU01DLCBDbG91ZCwgQ29uc3VtZXIsIFNlbWljb25kdWN0b3JzLikgVGoKMCAtMjQgVGQKKFRoaXMgbG9jYWwgUERGIGlzIGJ1bmRsZWQgb25seSBmb3IgVUkgdmVyaWZpY2F0aW9uIG9mIHRoZSBleHBlcnQgcmVwb3J0IGxpYnJhcnkgZXhwZXJpZW5jZS4pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCjAwMDAwMDAzMTEgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSA2IC9Sb290IDEgMCBSID4+CnN0YXJ0eHJlZgo3MjYKJSVFT0YK',
].join('');

// Sample data matching /getMyLibrary API response format
export const myLibraryApiResponse: MyLibraryApiResponse = {
  semiconductor: [
    {
      research_document_id: 'post-9527',
      price: 500,
      co_cd: 'NVDA',
      headline: 'NVIDIA Q2 FY2026 Deep Dive: AI Infrastructure Supercycle',
      synopsis: 'Examines NVIDIA\'s Q2 results and the structural drivers behind the AI infrastructure demand cycle — data centre capex, H100/H200 supply tightness, and inference workload growth.',
      fileddate: '2026-06-05T00:00:00Z',
      analyst_name: 'Peter Chen',
      pdf_url: SAMPLE_PDF,
      contributor: { id: 'user-101', name: 'Sarah Chen', avatarUrl: null },
      metrics: { downloads: 342, page_count: 18 },
      status: { status: 'DOWNLOADED', is_purchased: 'Y' },
    },
    {
      research_document_id: '66054789',
      price: 600,
      co_cd: '2330',
      headline: 'TSMC At 40% Growth: Can Its 2-Nanometer Ramp Protect Margins?',
      synopsis: 'Taiwan Semiconductor Manufacturing Company Limited reported second quarter results highlighted by revenue growth driven primarily by strong demand for advanced process technologies.',
      fileddate: '2026-07-18T22:58:10Z',
      analyst_name: 'Ishan Majumdar',
      pdf_url: SAMPLE_PDF,
      contributor: { id: 'user-102', name: 'Baptista Research', avatarUrl: null },
      metrics: { downloads: 156, page_count: 63 },
      status: { status: 'DOWNLOADED', is_purchased: 'Y' },
    },
    {
      research_document_id: 'post-9530',
      price: 450,
      co_cd: 'AVGO',
      headline: 'Broadcom Custom AI Silicon: Networking Attach Rate Remains The Key Margin Lever',
      synopsis: 'Looks at the custom AI silicon roadmap and the networking attach assumptions embedded in consensus.',
      fileddate: '2026-07-08T00:00:00Z',
      analyst_name: 'Mike Wang',
      pdf_url: SAMPLE_PDF,
      contributor: { id: 'user-104', name: 'J.P. Morgan', avatarUrl: null },
      metrics: { downloads: 136, page_count: 29 },
      status: { status: 'DOWNLOADED', is_purchased: 'Y' },
    },
  ],
  healthcare: [
    {
      research_document_id: 'post-9529',
      price: 450,
      co_cd: 'ADI',
      headline: 'Analog Devices Mid-Cycle Update: Automotive & Industrial Recovery Timeline',
      synopsis: 'A comprehensive review of Analog Devices\' performance amidst shifting automotive chip supply chains and industrial automation trends.',
      fileddate: '2026-05-20T14:30:00Z',
      analyst_name: 'Robert Taylor',
      pdf_url: SAMPLE_PDF,
      contributor: { id: 'user-103', name: 'Wedbush Securities Inc.', avatarUrl: null },
      metrics: { downloads: 89, page_count: 12 },
      status: { status: 'DOWNLOADED', is_purchased: 'Y' },
    },
  ],
};

export const expertReportLibraryFolders: LibraryFolder[] = [
  { id: 'folder-semiconductors', name: 'Semiconductors' },
  { id: 'folder-cloud-ai', name: 'Cloud / AI' },
  { id: 'folder-consumer', name: 'Consumer' },
];

export const expertReports: ExpertReport[] = [
  {
    id: 'rpt-001',
    company: 'NVDA',
    companyName: 'NVIDIA',
    analystName: 'Sarah Chen',
    contributor: 'Morgan Stanley',
    publishDate: '2026-07-19',
    updatedAt: '2026-07-20T08:30:00Z',
    headline: 'NVIDIA Blackwell Demand Check: Enterprise AI Rack Deployments Accelerate Into 2H26',
    summary: 'Channel check covering Blackwell rack deployment pacing, enterprise adoption signals, and near-term rack mix changes.',
    category: 'Semiconductors',
    priceUsd: 249,
    pageCount: 38,
    downloadCount: 182,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'download',
    libraryFolderId: null,
  },
  {
    id: 'rpt-002',
    company: 'TSM',
    companyName: 'TSMC',
    analystName: 'James Liu',
    contributor: 'Goldman Sachs',
    publishDate: '2026-07-14',
    updatedAt: '2026-07-18T06:10:00Z',
    headline: 'TSMC 2nm Capacity Allocation: Smartphone Recovery Meets AI ASIC Upside',
    summary: 'Examines 2nm allocation mix and how AI ASIC demand changes the 2027 capacity planning baseline.',
    category: 'Semiconductors',
    priceUsd: 199,
    pageCount: 31,
    downloadCount: 244,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'downloaded',
    libraryFolderId: 'folder-semiconductors',
  },
  {
    id: 'rpt-003',
    company: 'AVGO',
    companyName: 'Broadcom',
    analystName: 'Mike Wang',
    contributor: 'J.P. Morgan',
    publishDate: '2026-07-08',
    updatedAt: '2026-07-15T04:45:00Z',
    headline: 'Broadcom Custom AI Silicon: Networking Attach Rate Remains The Key Margin Lever',
    summary: 'Looks at the custom AI silicon roadmap and the networking attach assumptions embedded in consensus.',
    category: 'Semiconductors',
    priceUsd: 219,
    pageCount: 29,
    downloadCount: 136,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'pending',
    libraryFolderId: null,
  },
  {
    id: 'rpt-004',
    company: 'MSFT',
    companyName: 'Microsoft',
    analystName: 'Anna Park',
    contributor: 'Bank of America',
    publishDate: '2026-06-27',
    updatedAt: '2026-07-02T11:15:00Z',
    headline: 'Copilot ARPU Watch: Microsoft 365 Seat Expansion and Azure Inference Upsell',
    summary: 'Tracks enterprise Copilot pricing realization and the downstream effect on Azure inference consumption.',
    category: 'Cloud / AI',
    priceUsd: 179,
    pageCount: 24,
    downloadCount: 301,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'downloaded',
    libraryFolderId: 'folder-cloud-ai',
  },
  {
    id: 'rpt-005',
    company: 'AMZN',
    companyName: 'Amazon',
    analystName: 'David Kim',
    contributor: 'Citi Research',
    publishDate: '2026-06-18',
    updatedAt: '2026-06-21T09:00:00Z',
    headline: 'AWS Trainium and Bedrock: Cost Curve Still Supports Margin Expansion',
    summary: 'Assesses whether Trainium and Bedrock adoption is improving AWS margin quality relative to public peers.',
    category: 'Cloud / AI',
    priceUsd: 159,
    pageCount: 27,
    downloadCount: 118,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'downloaded',
    libraryFolderId: 'folder-cloud-ai',
  },
  {
    id: 'rpt-006',
    company: 'AAPL',
    companyName: 'Apple',
    analystName: 'Sarah Chen',
    contributor: 'UBS',
    publishDate: '2026-05-29',
    updatedAt: '2026-06-04T07:25:00Z',
    headline: 'Apple On-Device AI Monetization: Hardware ASP Tailwind Before Services Catch Up',
    summary: 'Explores the near-term ASP and margin benefits from on-device AI before service monetization fully lands.',
    category: 'Consumer',
    priceUsd: 169,
    pageCount: 22,
    downloadCount: 412,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'downloaded',
    libraryFolderId: 'folder-consumer',
  },
  {
    id: 'rpt-007',
    company: 'AMD',
    companyName: 'AMD',
    analystName: 'James Liu',
    contributor: 'Morgan Stanley',
    publishDate: '2026-04-15',
    updatedAt: '2026-04-23T10:05:00Z',
    headline: 'AMD MI400 Supply Planning: Rack-Scale Wins Need Better Memory Visibility',
    summary: 'Covers GPU rack build plans, memory constraints, and OEM enablement into 2027.',
    category: 'Semiconductors',
    priceUsd: 189,
    pageCount: 35,
    downloadCount: 165,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'download',
    libraryFolderId: null,
  },
  {
    id: 'rpt-008',
    company: 'GOOGL',
    companyName: 'Alphabet',
    analystName: 'Anna Park',
    contributor: 'Goldman Sachs',
    publishDate: '2026-03-06',
    updatedAt: '2026-03-10T05:40:00Z',
    headline: 'Alphabet Search AI ROI: TPU Efficiency Gains Offset Higher Query Compute',
    summary: 'Analyzes the economics of AI search rollouts and TPU efficiency assumptions behind the margin outlook.',
    category: 'Cloud / AI',
    priceUsd: 149,
    pageCount: 26,
    downloadCount: 208,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    downloadStatus: 'downloaded',
    libraryFolderId: 'folder-cloud-ai',
  },
];
