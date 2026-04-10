// Collaboration Playground — static seed data

// ─────────────────────────────────────────────
// Bilingual tag master map (zh → en)
// ─────────────────────────────────────────────
export const TAG_I18N: Record<string, string> = {
  科技: 'Technology',
  Apple: 'Apple',
  AI: 'AI',
  NVIDIA: 'NVIDIA',
  半導體: 'Semiconductors',
  供應鏈: 'Supply Chain',
  地緣政治: 'Geopolitics',
  法說會: 'Earnings Call',
  市場趨勢: 'Market Trends',
  財務: 'Finance',
  風險管理: 'Risk Management',
  能源: 'Energy',
  產業分析: 'Industry Analysis',
  消費電子: 'Consumer Electronics',
  雲端: 'Cloud',
  'T Company': 'T Company',
  產業趨勢: 'Industry Trends',
  原油: 'Crude Oil',
  霍爾木茲: 'Hormuz',
};

export interface Member {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export type CardType = 'article' | 'kpi' | 'table' | 'image' | 'chart' | 'map' | 'supply-chain' | 'file';

export interface KPIMetric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

export interface TableData {
  columns: string[];
  rows: string[][];
}

export interface ChartBar {
  label: string;
  value: number;
}

export interface Comment {
  id: string;
  author: Member;
  text: string;
  createdAt: string;
  editedAt?: string;
}

export interface ContentCard {
  id: string;
  type: CardType;
  title: string;
  addedBy: Member;
  addedAt: string;
  // article / image
  text?: string;
  source?: string;
  imageUrl?: string;
  imageCaption?: string;
  // kpi
  kpis?: KPIMetric[];
  // table
  tableData?: TableData;
  // chart
  chartData?: ChartBar[];
  chartType?: 'bar' | 'line';
  chartUnit?: string;
  // file attachment
  fileName?: string;
  fileSize?: string;
  // map / supply-chain are rendered via inline SVG; title + addedBy are sufficient
  // comments
  comments?: Comment[];
  // likes
  likes?: number;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: Member;
  due: string;
  priority: TaskPriority;
  slackRef?: string;
}

export interface Canvas {
  id: string;
  title: string;
  description: string;
  tags: string[];
  members: Member[];
  cards: ContentCard[];
  tasks: Task[];
  createdAt: string;
}

// ─────────────────────────────────────────────
// Members (using local portrait photos)
// ─────────────────────────────────────────────
export const members: Member[] = [
  { id: 'm0', name: 'HungWei Chiu', avatar: '/images/hwchiu_github_avatar.jpg', role: 'Founder & Lead Analyst' },
  { id: 'm1', name: 'James Lin', avatar: '/images/avatars/men-10.jpg', role: 'Research Analyst' },
  { id: 'm2', name: 'Claire Chen', avatar: '/images/avatars/women-18.jpg', role: 'Supply Chain Manager' },
  { id: 'm3', name: 'Kevin Huang', avatar: '/images/avatars/men-32.jpg', role: 'Market Strategist' },
  { id: 'm4', name: 'Sherry Wang', avatar: '/images/avatars/women-34.jpg', role: 'Data Scientist' },
  { id: 'm5', name: 'Hugo Zhang', avatar: '/images/avatars/men-45.jpg', role: 'Risk Analyst' },
  { id: 'm6', name: 'Amy Wu', avatar: '/images/avatars/women-56.jpg', role: 'Industry Researcher' },
  { id: 'm7', name: 'Ryan Liu', avatar: '/images/avatars/men-67.jpg', role: 'Financial Analyst' },
];

const [, m1, m2, m3, m4, m5, m6, m7] = members;

// ─────────────────────────────────────────────
// Canvas 1: 2026 Q1 APPL 法說會討論
// ─────────────────────────────────────────────
const canvas1Cards: ContentCard[] = [
  {
    id: 'c1-kpi',
    type: 'kpi',
    title: 'Apple Q1 FY2026 關鍵財務指標',
    addedBy: m7,
    addedAt: '2026-02-01 09:32',
    kpis: [
      { label: '總營收', value: '$124.3B', change: '+4.0% YoY', positive: true },
      { label: 'iPhone 營收', value: '$69.1B', change: '+1.8% YoY', positive: true },
      { label: '服務營收', value: '$26.3B', change: '+14.3% YoY', positive: true },
      { label: 'EPS', value: '$2.40', change: '+8.1% YoY', positive: true },
    ],
  },
  {
    id: 'c1-article',
    type: 'article',
    title: 'Apple Q1 FY2026 法說會重點摘要',
    addedBy: m1,
    addedAt: '2026-02-01 10:15',
    imageUrl:
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=75',
    text:
      'Apple 於 2026 年 1 月底召開 Q1 FY2026 法說會，執行長 Tim Cook 表示公司整體業績超越市場預期。服務業務持續強勁，年增 14.3%，成為主要成長引擎。iPhone 在中國市場雖面臨競爭壓力，但印度市場的雙位數成長彌補了缺口。管理層對 Vision Pro 第二代產品線持審慎樂觀態度，並預告 AI 功能將在 iOS 20 中大幅擴展，帶動 iPhone 升級潮。毛利率達 46.9%，刷新歷史紀錄，顯示服務與高毛利產品比重持續提升。',
    source: 'Apple Inc. Q1 FY2026 Earnings Call Transcript',
  },
  {
    id: 'c1-table',
    type: 'table',
    title: '各產品線營收比較 (Q1 FY2026 vs Q1 FY2025)',
    addedBy: m4,
    addedAt: '2026-02-01 11:45',
    tableData: {
      columns: ['產品線', 'Q1 FY2026', 'Q1 FY2025', '年增率', '趨勢'],
      rows: [
        ['iPhone', '$69.1B', '$67.9B', '+1.8%', '↑'],
        ['Mac', '$7.7B', '$7.5B', '+2.7%', '↑'],
        ['iPad', '$8.1B', '$7.8B', '+3.8%', '↑'],
        ['穿戴裝置 & 家用', '$13.1B', '$11.7B', '+12.0%', '↑'],
        ['服務', '$26.3B', '$23.0B', '+14.3%', '↑'],
        ['合計', '$124.3B', '$119.6B', '+3.9%', '↑'],
      ],
    },
  },
  {
    id: 'c1-chart',
    type: 'chart',
    title: '服務業務季度營收成長趨勢 (十億美元)',
    addedBy: m3,
    addedAt: '2026-02-02 09:00',
    chartType: 'bar',
    chartUnit: 'B',
    chartData: [
      { label: 'Q1 FY24', value: 20.9 },
      { label: 'Q2 FY24', value: 23.9 },
      { label: 'Q3 FY24', value: 24.2 },
      { label: 'Q4 FY24', value: 25.0 },
      { label: 'Q1 FY25', value: 23.0 },
      { label: 'Q2 FY25', value: 24.6 },
      { label: 'Q3 FY25', value: 25.4 },
      { label: 'Q4 FY25', value: 25.6 },
      { label: 'Q1 FY26', value: 26.3 },
    ],
  },
  {
    id: 'c1-image',
    type: 'image',
    title: 'Apple Park — 2026 春季產品發佈活動',
    addedBy: m6,
    addedAt: '2026-02-03 14:20',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=75',
    imageCaption:
      'Apple 工程師展示 AI 驅動的最新 MacBook Pro，搭載 M4 Ultra 晶片，效能提升 40%。',
  },
];

// ─────────────────────────────────────────────
// Canvas 2: AI 快速發展產業的變動
// ─────────────────────────────────────────────
const canvas2Cards: ContentCard[] = [
  {
    id: 'c2-article',
    type: 'article',
    title: 'AI 浪潮重塑科技版圖：2026 年關鍵趨勢分析',
    addedBy: m3,
    addedAt: '2026-03-05 08:30',
    imageUrl:
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=75',
    text:
      '生成式 AI 正以前所未有的速度重塑全球科技與半導體產業格局。NVIDIA 的 H200 與 GB200 系列 GPU 供不應求，交期延至 2026 Q3；T Company CoWoS 封裝產能成為整個 AI 供應鏈的瓶頸所在。微軟、Google、Meta 與 Amazon 合計在 2025 年投入超過 $2,000 億美元的 AI 資本支出。與此同時，模型效率化趨勢（如 MoE 架構）正在改變推論端的硬體需求，對 ASIC 設計公司（如 Trainium、TPU）形成挑戰。AI PC 滲透率在 2026 年預計突破 35%，拉動 DRAM 需求大幅升溫。',
    source: 'tMIC 研究部門 — AI 產業季度報告',
  },
  {
    id: 'c2-kpi',
    type: 'kpi',
    title: 'AI 產業關鍵市場指標 (2026 Q1)',
    addedBy: m4,
    addedAt: '2026-03-06 10:00',
    kpis: [
      { label: '全球 AI 市場規模', value: '$621B', change: '+38.1% YoY', positive: true },
      { label: 'NVIDIA 市值', value: '$2.8T', change: '+22.4% YTD', positive: true },
      { label: 'AI 晶片需求年增率', value: '+85%', change: 'vs 2025: +67%', positive: true },
      { label: 'Gen AI 投資總額', value: '$138B', change: '+51% YoY', positive: true },
    ],
  },
  {
    id: 'c2-table',
    type: 'table',
    title: '主要 AI 科技公司營收及市值比較',
    addedBy: m1,
    addedAt: '2026-03-07 11:30',
    tableData: {
      columns: ['公司', '市值', 'Q1 2026 營收', 'YoY 成長', 'AI 資本支出佔比'],
      rows: [
        ['NVIDIA', '$2.8T', '$39.3B', '+78%', '—'],
        ['Microsoft', '$3.1T', '$69.6B', '+16%', '42%'],
        ['Alphabet', '$2.5T', '$96.5B', '+12%', '38%'],
        ['Meta', '$1.8T', '$52.4B', '+21%', '35%'],
        ['Amazon (AWS)', '$2.1T', '$187.8B', '+10%', '28%'],
        ['T Company (T Company)', '$1.1T', '$25.5B', '+34%', '—'],
      ],
    },
  },
  {
    id: 'c2-chart',
    type: 'chart',
    title: '全球 AI 市場規模成長預測 (十億美元)',
    addedBy: m7,
    addedAt: '2026-03-08 09:15',
    chartType: 'bar',
    chartUnit: 'B',
    chartData: [
      { label: '2022', value: 120 },
      { label: '2023', value: 195 },
      { label: '2024', value: 298 },
      { label: '2025', value: 450 },
      { label: '2026E', value: 621 },
      { label: '2027E', value: 890 },
    ],
  },
  {
    id: 'c2-map',
    type: 'map',
    title: '全球 AI 投資地域分布熱圖',
    addedBy: m6,
    addedAt: '2026-03-08 15:40',
  },
  {
    id: 'c2-supply-chain',
    type: 'supply-chain',
    title: 'AI 算力供應鏈示意圖',
    addedBy: m2,
    addedAt: '2026-03-09 10:00',
  },
  {
    id: 'c2-image',
    type: 'image',
    title: 'NVIDIA GTC 2026 — Jensen Huang 主題演講',
    addedBy: m5,
    addedAt: '2026-03-10 08:00',
    imageUrl:
      'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=600&q=75',
    imageCaption:
      '記者會現場，Jensen Huang 展示 Blackwell Ultra 架構，宣告下一代 AI 算力革命正式到來。',
  },
];

// ─────────────────────────────────────────────
// Canvas 3: 美伊戰爭對供應鏈的影響
// ─────────────────────────────────────────────
const canvas3Cards: ContentCard[] = [
  {
    id: 'c3-article',
    type: 'article',
    title: '美伊緊張局勢升溫，霍爾木茲海峽風險重燃供應鏈警報',
    addedBy: m5,
    addedAt: '2026-01-15 07:45',
    text:
      '2026 年 1 月初，美國與伊朗之間的外交緊張再度升溫，霍爾木茲海峽的通行安全引發全球供應鏈高度警戒。該海峽每日通過約 2,100 萬桶原油，佔全球海運原油供應的近 21%。伊朗已發出警告，若衝突升級，不排除封鎖海峽。對半導體產業而言，特殊製程氣體（氖氣、氪氣）及稀土元素的替代供應鏈尚不成熟，短期內料將面臨嚴峻壓力。T Company已啟動緊急庫存盤點，並加速與日本、歐洲供應商的備援協議洽商。',
    source: 'Reuters / tMIC 地緣風險小組',
  },
  {
    id: 'c3-kpi',
    type: 'kpi',
    title: '地緣衝突關鍵市場衝擊指標',
    addedBy: m3,
    addedAt: '2026-01-16 09:00',
    kpis: [
      { label: '布蘭特原油價格', value: '$94.2/桶', change: '+18.3% (2週內)', positive: false },
      { label: '天然氣價格', value: '$4.8/MMBtu', change: '+22.1% (2週內)', positive: false },
      { label: '中東航線保險費率', value: '+340%', change: '歷史次高', positive: false },
      { label: '半導體特殊氣體漲幅', value: '+15%', change: '氖氣 +28%', positive: false },
    ],
  },
  {
    id: 'c3-map',
    type: 'map',
    title: '霍爾木茲海峽與受影響供應鏈地域分布',
    addedBy: m2,
    addedAt: '2026-01-17 10:30',
  },
  {
    id: 'c3-table',
    type: 'table',
    title: '主要受影響商品與半導體供應鏈應對策略',
    addedBy: m5,
    addedAt: '2026-01-18 14:00',
    tableData: {
      columns: ['商品 / 原料', '影響程度', '主要受影響業者', '替代方案', '預估恢復期'],
      rows: [
        ['原油', '🔴 極高', 'T Company, Samsung Fabs', '北極航線、管線調度', '視衝突時長'],
        ['液化天然氣 (LNG)', '🔴 高', 'Intel, GloFo, SMIC', '美國 LNG 替代', '3–6 個月'],
        ['半導體特殊氣體', '🟠 中高', 'T Company、聯電、力積電', '日本、歐洲供應商', '2–4 個月'],
        ['稀土元素', '🟡 中', 'Apple, Qualcomm', '供應商多元化', '6–12 個月'],
        ['聚酯薄膜 (PET)', '🟡 低中', '面板廠 AUO / BOE', '台灣本地庫存', '1–2 個月'],
      ],
    },
  },
  {
    id: 'c3-chart',
    type: 'chart',
    title: '2026 年 Q1 原油價格走勢 (布蘭特 $/桶)',
    addedBy: m7,
    addedAt: '2026-01-20 08:30',
    chartType: 'line',
    chartUnit: '$',
    chartData: [
      { label: '1/1', value: 79.8 },
      { label: '1/5', value: 81.2 },
      { label: '1/10', value: 83.5 },
      { label: '1/13', value: 87.1 },
      { label: '1/16', value: 90.4 },
      { label: '1/20', value: 94.2 },
      { label: '1/25', value: 92.8 },
      { label: '2/1', value: 89.5 },
      { label: '2/10', value: 86.3 },
      { label: '2/20', value: 88.7 },
      { label: '3/1', value: 85.4 },
    ],
  },
  {
    id: 'c3-supply-chain',
    type: 'supply-chain',
    title: '中東衝突下供應鏈替代路線示意圖',
    addedBy: m2,
    addedAt: '2026-01-22 11:15',
  },
];

// ─────────────────────────────────────────────
// Tasks per canvas
// ─────────────────────────────────────────────
const canvas1Tasks: Task[] = [
  {
    id: 't1-1',
    title: '整理 Apple 服務業務競爭對手分析（Spotify、Netflix）',
    status: 'in-progress',
    assignee: m1,
    due: '2026-02-10',
    priority: 'high',
    slackRef: '#apple-q1-discussion',
  },
  {
    id: 't1-2',
    title: '確認T Company在 iPhone 供應鏈中佔比與未來展望',
    status: 'todo',
    assignee: m2,
    due: '2026-02-15',
    priority: 'medium',
    slackRef: '#apple-q1-discussion',
  },
  {
    id: 't1-3',
    title: '製作 Apple vs Samsung 競爭態勢 Slide',
    status: 'done',
    assignee: m7,
    due: '2026-02-05',
    priority: 'low',
    slackRef: '#apple-q1-discussion',
  },
  {
    id: 't1-4',
    title: '追蹤 FY2026 Q2 法說會日期並設定日曆提醒',
    status: 'todo',
    assignee: m3,
    due: '2026-03-01',
    priority: 'low',
  },
];

const canvas2Tasks: Task[] = [
  {
    id: 't2-1',
    title: '深入研究 CoWoS 封裝產能對 NVDA 出貨的影響',
    status: 'in-progress',
    assignee: m4,
    due: '2026-03-15',
    priority: 'high',
    slackRef: '#ai-industry-trends',
  },
  {
    id: 't2-2',
    title: '撰寫 AI PC 市場佔有率趨勢報告（AMD / Intel / NVDA）',
    status: 'todo',
    assignee: m6,
    due: '2026-03-20',
    priority: 'high',
    slackRef: '#ai-industry-trends',
  },
  {
    id: 't2-3',
    title: '更新 AI 市場規模數據（IDC 最新報告）',
    status: 'done',
    assignee: m1,
    due: '2026-03-08',
    priority: 'medium',
  },
  {
    id: 't2-4',
    title: 'Assign：比較 Google TPU v5 與 NVIDIA H200 成本效益',
    status: 'todo',
    assignee: m7,
    due: '2026-03-25',
    priority: 'medium',
    slackRef: '#ai-industry-trends',
  },
];

const canvas3Tasks: Task[] = [
  {
    id: 't3-1',
    title: '評估T Company特殊氣體庫存水位（目前存量可支撐幾週）',
    status: 'in-progress',
    assignee: m5,
    due: '2026-01-25',
    priority: 'high',
    slackRef: '#geopolitical-risk',
  },
  {
    id: 't3-2',
    title: '聯繫日本 Linde 確認替代氖氣供應協議進度',
    status: 'todo',
    assignee: m2,
    due: '2026-01-28',
    priority: 'high',
    slackRef: '#geopolitical-risk',
  },
  {
    id: 't3-3',
    title: '整理替代航運路線（好望角 vs 蘇伊士）成本比較',
    status: 'done',
    assignee: m3,
    due: '2026-01-20',
    priority: 'medium',
  },
  {
    id: 't3-4',
    title: '建立地緣風險月報 Dashboard（每月更新）',
    status: 'todo',
    assignee: m4,
    due: '2026-02-01',
    priority: 'low',
    slackRef: '#geopolitical-risk',
  },
];

// ─────────────────────────────────────────────
// Canvases
// ─────────────────────────────────────────────
export const canvases: Canvas[] = [
  {
    id: 'cv1',
    title: '2026 Q1 APPL 法說會討論',
    description: '彙整 Apple Q1 FY2026 法說會重點、財務數據與市場反應，供決策參考。',
    tags: ['科技', 'Apple', '法說會', '消費電子', '供應鏈'],
    members: [m1, m7, m4, m3, m6],
    cards: canvas1Cards,
    tasks: canvas1Tasks,
    createdAt: '2026-01-28',
  },
  {
    id: 'cv2',
    title: 'AI 快速發展產業的變動',
    description: '追蹤生成式 AI 對半導體、雲端及終端裝置產業的結構性影響。',
    tags: ['AI', 'NVIDIA', '半導體', '雲端', 'T Company', '產業趨勢'],
    members: [m3, m4, m1, m6, m7, m2],
    cards: canvas2Cards,
    tasks: canvas2Tasks,
    createdAt: '2026-03-01',
  },
  {
    id: 'cv3',
    title: '美伊戰爭對供應鏈的影響',
    description: '監測美伊地緣衝突對半導體原材料、能源及航運成本的衝擊與因應策略。',
    tags: ['地緣政治', '供應鏈', '原油', '霍爾木茲', '半導體', '風險管理'],
    members: [m5, m2, m3, m7, m4],
    cards: canvas3Cards,
    tasks: canvas3Tasks,
    createdAt: '2026-01-14',
  },
];
