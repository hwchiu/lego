/** Mock Elasticsearch search results for simulating the global search API. */

export type SearchDocType = 'news' | 'company' | 'event';

export interface SearchResultItem {
  doc_type: SearchDocType;
  co_cd: string;
  company_name: string;
  company_short_name: string;
  title: string;
  content: string;
  datetime: string;
  category: string;
  url: string;
  source: string;
  id: string;
}

export const MOCK_SEARCH_RESULTS: SearchResultItem[] = [
  // ── Companies ──────────────────────────────────────────────────────────────
  {
    doc_type: 'company',
    co_cd: 'GT',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '',
    content: '',
    datetime: '',
    category: '',
    url: '',
    source: '',
    id: '',
  },
  {
    doc_type: 'company',
    co_cd: 'AAPL',
    company_name: 'Apple Inc.',
    company_short_name: 'Apple',
    title: '',
    content: '',
    datetime: '',
    category: '',
    url: '',
    source: '',
    id: '',
  },
  {
    doc_type: 'company',
    co_cd: 'NVDA',
    company_name: 'NVIDIA Corporation',
    company_short_name: 'NVIDIA',
    title: '',
    content: '',
    datetime: '',
    category: '',
    url: '',
    source: '',
    id: '',
  },
  {
    doc_type: 'company',
    co_cd: 'ACME',
    company_name: 'ACME 企業有限公司',
    company_short_name: '',
    title: '',
    content: '',
    datetime: '',
    category: '',
    url: '',
    source: '',
    id: '',
  },
  {
    doc_type: 'company',
    co_cd: 'GLOB',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '',
    content: '',
    datetime: '',
    category: '',
    url: '',
    source: '',
    id: '',
  },
  // ── Events ─────────────────────────────────────────────────────────────────
  {
    doc_type: 'event',
    co_cd: 'GT',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '全球科技 2024 年度技術論壇',
    content: '全球科技將於 2024 年 3 月舉辦年度技術論壇，展示最新先進製程與封裝技術進展。',
    datetime: '2024-03-15T09:00:00Z',
    category: '法說會',
    url: 'https://example.com/globaltech-tech-forum-2024',
    source: '全球科技官網',
    id: 'event_tc_20240315_001',
  },
  {
    doc_type: 'event',
    co_cd: 'GLOB',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '全球科技參與國際電子展',
    content: '全球科技將於 2023 年 12 月 1 日至 12 月 3 日參加在台北舉辦的國際電子展。屆時將展示其最新的 AIoT 解決方案和智慧城市應用。',
    datetime: '2023-12-01T09:00:00Z',
    category: '展覽活動',
    url: 'https://example.com/globaltech-expo-event-101',
    source: '展覽主辦方',
    id: 'event_globaltech_20231201_002',
  },
  {
    doc_type: 'event',
    co_cd: 'AAPL',
    company_name: 'Apple Inc.',
    company_short_name: 'Apple',
    title: 'Apple WWDC 2024 開發者大會',
    content: 'Apple 年度開發者大會 WWDC 2024 將於六月在加州庫比蒂諾舉行，預計發表 iOS 18、macOS 15 等重大更新。',
    datetime: '2024-06-10T17:00:00Z',
    category: '產品發表',
    url: 'https://example.com/apple-wwdc-2024',
    source: 'Apple Newsroom',
    id: 'event_aapl_20240610_003',
  },
  {
    doc_type: 'event',
    co_cd: 'NVDA',
    company_name: 'NVIDIA Corporation',
    company_short_name: 'NVIDIA',
    title: 'NVIDIA GTC 2024 — AI 超算峰會',
    content: 'NVIDIA GTC 2024 將於三月在聖荷西舉行，CEO Jensen Huang 將發表主題演講，揭示下一代 AI 晶片 Blackwell 架構。',
    datetime: '2024-03-18T18:00:00Z',
    category: '產品發表',
    url: 'https://example.com/nvidia-gtc-2024',
    source: 'NVIDIA Newsroom',
    id: 'event_nvda_20240318_004',
  },
  {
    doc_type: 'event',
    co_cd: 'GT',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '全球科技 Q3 2023 法人說明會',
    content: '全球科技將於 2023 年 10 月舉辦第三季法人說明會，說明當季財務表現與未來展望。',
    datetime: '2023-10-19T08:00:00Z',
    category: '法說會',
    url: 'https://example.com/globaltech-q3-2023-earnings-call',
    source: '全球科技投資人關係',
    id: 'event_tc_20231019_005',
  },
  {
    doc_type: 'event',
    co_cd: 'AAPL',
    company_name: 'Apple Inc.',
    company_short_name: 'Apple',
    title: 'Apple Q1 2024 財報說明會',
    content: 'Apple 發布 2024 財年第一季財報，並舉辦線上投資人說明會，討論 iPhone 15 系列銷售表現。',
    datetime: '2024-02-01T21:00:00Z',
    category: '法說會',
    url: 'https://example.com/apple-q1-2024-earnings',
    source: 'Apple Investor Relations',
    id: 'event_aapl_20240201_006',
  },
  // ── News ───────────────────────────────────────────────────────────────────
  {
    doc_type: 'news',
    co_cd: 'GT',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '全球科技創新技術論壇登場，揭示未來半導體發展藍圖',
    content: '全球科技於今日舉行年度創新技術論壇，正式揭示 2nm 及以下製程的最新研發進展，並展示 CoWoS 先進封裝量產進度。',
    datetime: '2023-10-26T10:00:00Z',
    category: '科技新聞',
    url: 'https://example.com/globaltech-tech-forum-news-123',
    source: '經濟日報',
    id: 'news_gt_20231026_001',
  },
  {
    doc_type: 'news',
    co_cd: 'NVDA',
    company_name: 'NVIDIA Corporation',
    company_short_name: 'NVIDIA',
    title: 'NVIDIA H100 供不應求，AI 伺服器需求爆發式成長',
    content: 'NVIDIA H100 GPU 持續供應緊張，各大雲端業者爭相採購，帶動 AI 伺服器市場規模快速擴張。',
    datetime: '2023-11-08T14:30:00Z',
    category: '產業動態',
    url: 'https://example.com/nvidia-h100-demand-2023',
    source: '工商時報',
    id: 'news_nvda_20231108_002',
  },
  {
    doc_type: 'news',
    co_cd: 'AAPL',
    company_name: 'Apple Inc.',
    company_short_name: 'Apple',
    title: 'Apple 發布 Vision Pro 混合實境頭戴裝置正式上市資訊',
    content: 'Apple 宣布 Vision Pro 空間運算裝置將於 2024 年 2 月 2 日在美國正式開賣，起售價 3499 美元。',
    datetime: '2024-01-08T18:00:00Z',
    category: '產品發表',
    url: 'https://example.com/apple-vision-pro-launch',
    source: 'Apple Newsroom',
    id: 'news_aapl_20240108_003',
  },
  {
    doc_type: 'news',
    co_cd: 'GT',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '全球科技 2nm 製程量產時程確認，預計 2025 年下半年導入',
    content: '全球科技確認 2nm 製程 (N2) 將於 2025 年下半年進入量產，首批客戶包括 Apple 及 NVIDIA。',
    datetime: '2024-02-20T08:30:00Z',
    category: '科技新聞',
    url: 'https://example.com/globaltech-2nm-production-timeline',
    source: '電子時報',
    id: 'news_tc_20240220_004',
  },
  {
    doc_type: 'news',
    co_cd: 'NVDA',
    company_name: 'NVIDIA Corporation',
    company_short_name: 'NVIDIA',
    title: 'NVIDIA Blackwell 架構 GPU 正式發表，AI 訓練效能大幅提升',
    content: 'NVIDIA 在 GTC 2024 發表 Blackwell 架構，新一代 B100/B200 GPU 相較 H100 訓練效能提升達 4 倍。',
    datetime: '2024-03-18T19:00:00Z',
    category: '產品發表',
    url: 'https://example.com/nvidia-blackwell-announcement',
    source: 'NVIDIA Newsroom',
    id: 'news_nvda_20240318_005',
  },
  {
    doc_type: 'news',
    co_cd: 'AAPL',
    company_name: 'Apple Inc.',
    company_short_name: 'Apple',
    title: 'Apple 在印度擴大製造產能，iPhone 16 部分型號於印度生產',
    content: 'Apple 持續推動供應鏈多元化，iPhone 16 系列部分機型已在印度金奈與浦那工廠生產。',
    datetime: '2024-04-12T10:00:00Z',
    category: '產業動態',
    url: 'https://example.com/apple-india-manufacturing-2024',
    source: '路透社',
    id: 'news_aapl_20240412_006',
  },
  {
    doc_type: 'news',
    co_cd: 'GT',
    company_name: '全球科技股份有限公司',
    company_short_name: '全球科技',
    title: '全球科技亞利桑那廠首批晶片出爐，美國製造迎里程碑',
    content: '全球科技位於美國亞利桑那州鳳凰城的晶圓廠成功生產首批 4nm 晶片，標誌美國先進半導體製造新頁。',
    datetime: '2024-04-23T15:00:00Z',
    category: '公司動態',
    url: 'https://example.com/globaltech-arizona-first-chips',
    source: '彭博社',
    id: 'news_tc_20240423_007',
  },
];

function filterMockResults(query: string): SearchResultItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_SEARCH_RESULTS.filter((item) => {
    const fields = [
      item.co_cd,
      item.company_name,
      item.company_short_name,
      item.title,
      item.content,
      item.category,
    ];
    return fields.some((f) => f.toLowerCase().includes(q));
  });
}

/**
 * Get Elasticsearch results.
 * - When `NEXT_PUBLIC_ELSH_SEARCH_API` exists, request backend API.
 * - Otherwise fallback to local mock data.
 */
// Raw shape returned by the Spring Boot /api/v1/search endpoint
interface EsApiItem {
  id: string;
  coCd: string;
  companyName: string;
  companyShortName: string;
  title: string;
  content: string;
  date: string;       // "YYYY-MM-DD"
  category: string;
}

function mapEsApiItem(item: EsApiItem): SearchResultItem {
  return {
    id: item.id,
    doc_type: 'news',
    co_cd: item.coCd ?? '',
    company_name: item.companyName ?? '',
    company_short_name: item.companyShortName ?? '',
    title: item.title ?? '',
    content: item.content ?? '',
    datetime: item.date ? `${item.date}T00:00:00` : '',
    category: item.category ?? '',
    url: '',
    source: 'elasticsearch',
  };
}

export async function getElshResult(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  // Note: NEXT_PUBLIC_* vars are injected at build time in Next.js (client usage).
  const apiUrl = process.env.NEXT_PUBLIC_ELSH_SEARCH_API?.trim();
  if (!apiUrl) {
    return filterMockResults(query);
  }

  try {
    const hasQueryString = apiUrl.includes('?');
    const url = `${apiUrl}${hasQueryString ? '&' : '?'}q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return filterMockResults(query);

    const data = await res.json();

    // Spring Boot backend returns { results: EsApiItem[], total: number }
    const rawItems: EsApiItem[] | null =
      Array.isArray(data) ? data as EsApiItem[] :
      Array.isArray((data as { results?: unknown[] }).results) ? (data as { results: EsApiItem[] }).results :
      Array.isArray((data as { data?: unknown[] }).data) ? (data as { data: EsApiItem[] }).data :
      null;

    if (rawItems) return rawItems.map(mapEsApiItem);

    return filterMockResults(query);
  } catch {
    return filterMockResults(query);
  }
}
