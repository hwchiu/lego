export type DownloadStatus = 'download' | 'pending' | 'downloaded';

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

const SAMPLE_PDF = '/lego/pdfs/expert-report-sample.pdf';

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
