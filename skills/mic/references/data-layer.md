# 資料層模式

MIC 的資料架構——Markdown+JSON 混合儲存、TypeScript 資料模組、Icon 儲存、SVG 圖表。

## 資料架構概覽

```
content/                     # Markdown 檔案（帶嵌入式 JSON）
app/data/                    # TypeScript 資料模組（類型 + 常數 + 工具函數）
app/lib/parseContent.ts      # Markdown → JSON 解析工具
```

---

## Markdown + JSON 混合儲存

資料以 Markdown 檔案的形式存放於 `content/`，內嵌 JSON 資料塊。好處：可讀性高、支援純文字版本控制。

### 檔案格式

```markdown
# Feature Data

這裡可以有說明文字。

## Entity Data
```json
{
  "TSM": { "name": "台積電", "shares": 120, "cost": 105.3 },
  "AAPL": { "name": "Apple", "shares": 45, "cost": 167.8 }
}
```​

## Events
```json
[
  { "id": "1", "title": "法說會", "date": "2024-01-15", "type": "earnings" },
  { "id": "2", "title": "股利發放", "date": "2024-03-20", "type": "dividend" }
]
```​
```

### 多語言資料

```markdown
## Labels
```json
{
  "header": { "zh": "最新消息", "en": "Latest News" },
  "empty":  { "zh": "目前沒有資料", "en": "No data available" }
}
```​
```

---

## parseContent 解析工具

### API

```tsx
import rawContent from '@/content/feature-data.md';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';

// 單一 JSON 塊（取第一個）
const items: Item[] = extractJson<Item[]>(rawContent);

// 按 section 標題取特定塊
const entities = extractJsonBySection<Record<string, Entity>>(rawContent, 'Entity Data');
const events = extractJsonBySection<Event[]>(rawContent, 'Events');
```

### 在元件中使用

```tsx
// app/data/featureData.ts
import rawContent from '@/content/feature-data.md';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';

export interface PortfolioItem {
  symbol: string;
  shares: number;
  cost: number;
}

// 解析一次，快取於模組層級（Next.js static build 時執行）
const rawEntities = extractJsonBySection<Record<string, { shares: number; cost: number }>>(
  rawContent,
  'Entity Data'
);

export const portfolioItems: PortfolioItem[] = Object.entries(rawEntities).map(
  ([symbol, data]) => ({ symbol, ...data })
);
```

---

## TypeScript 資料模組（`app/data/*.ts`）

**模式：類型 + 常數 + 工具函數集中同一檔案**

```tsx
// app/data/newsData.ts

// 1. 類型定義
export interface NewsItem {
  id: string;
  title: string;
  category: 'market' | 'company' | 'macro';
  date: string;
  source: string;
}

// 2. 常數
export const NEWS_CATEGORIES = [
  { id: 'market', zh: '市場', en: 'Market' },
  { id: 'company', zh: '公司', en: 'Company' },
  { id: 'macro', zh: '總體', en: 'Macro' },
] as const;

// 3. 工具函數（純函數，無 React 依賴）
export function filterNewsByCategory(items: NewsItem[], category: string): NewsItem[] {
  if (category === 'all') return items;
  return items.filter(item => item.category === category);
}

export function sortNewsByDate(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
```

### 翻譯資料（`app/data/translations.ts`）

```tsx
export const translations: Record<string, { zh: string; en: string }> = {
  'nav.home':     { zh: '首頁',   en: 'Home' },
  'nav.news':     { zh: '新聞',   en: 'News' },
  'btn.filter':   { zh: '篩選',   en: 'Filter' },
  'status.open':  { zh: '開盤中', en: 'Open' },
};

export function t(key: string, lang: 'zh' | 'en'): string {
  return translations[key]?.[lang] ?? key;
}
```

---

## Navigation 資料（`app/data/navigation.ts`）

```tsx
export interface NavItem {
  label: string;
  labelEn: string;
  href: string;
  icon: string;       // key into sidebarIcons
  badge?: 'NEW' | 'SOON';
  section?: string;   // 分組標題
}

// SVG path strings（viewBox="0 0 14 14"，stroke-based）
export const sidebarIcons: Record<string, string> = {
  home: '<path d="M7 1L1 6v7h4V9h4v4h4V6L7 1Z" stroke="currentColor" strokeWidth="1.3" fill="none"/>',
  news: '<path d="M2 3h10M2 6h10M2 9h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>',
  // ...
};

// 渲染 icon
<svg viewBox="0 0 14 14" fill="none" className="ni"
     dangerouslySetInnerHTML={{ __html: sidebarIcons[item.icon] }} />
```

**Icon 規格：**
- ViewBox：`0 0 14 14`
- 風格：Stroke-based，`stroke="currentColor"`，`strokeWidth="1.3"`，`fill="none"`
- Class：`.ni`（nav icon），預設 `opacity: 0.6`
- 儲存：SVG path string（不含外層 `<svg>` 標籤）

---

## 內嵌 SVG 圖表

MIC **不使用外部圖表庫**（D3、Chart.js 等）。所有圖表為 inline SVG。

### 長條圖

```tsx
interface ChartBar { label: string; value: number; }

function BarChart({ data }: { data: ChartBar[] }) {
  const max = Math.max(...data.map(d => d.value));
  const barWidth = 30;
  const gap = 10;
  const height = 100;
  const totalWidth = data.length * (barWidth + gap) - gap;

  return (
    <svg viewBox={`0 0 ${totalWidth} ${height}`} width="100%">
      {data.map((d, i) => {
        const barHeight = (d.value / max) * (height - 20);
        const x = i * (barWidth + gap);
        const y = height - barHeight - 10;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={barHeight}
                  fill="var(--c-accent)" rx="2" />
            <text x={x + barWidth / 2} y={height} textAnchor="middle"
                  fontSize="9" fill="var(--c-text-3)">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
```

### 折線圖（sparkline）

```tsx
function Sparkline({ values, positive = true }: { values: number[]; positive?: boolean }) {
  const w = 80, h = 30;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h}>
      <polyline points={points} fill="none"
                stroke={positive ? 'var(--c-pos)' : 'var(--c-neg)'}
                strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}
```

---

## 動態路由資料

```tsx
// app/market-data/financial-data/[symbol]/page.tsx
import { getCompanies } from '@/app/data/companiesData';

export function generateStaticParams() {
  return getCompanies().map(company => ({ symbol: company.symbol }));
}

export default function Page({ params }: { params: { symbol: string } }) {
  const company = getCompanyBySymbol(params.symbol);
  if (!company) return <div>Not Found</div>;
  return <FinancialContent company={company} />;
}
```

**規則：** 動態路由 `[param]` 必須 export `generateStaticParams()`，否則 `npm run build` 失敗。

---

## 資料快取模式

```tsx
// 模組層級快取（只在 build 時執行一次）
let _cachedData: DataItem[] | null = null;

export function getAllData(): DataItem[] {
  if (_cachedData) return _cachedData;
  _cachedData = extractJson<DataItem[]>(rawContent);
  return _cachedData;
}

// Client 端快取（useMemo）
function FeatureComponent() {
  const { filter } = useFilter();
  const allData = useMemo(() => getAllData(), []);
  const filtered = useMemo(
    () => allData.filter(item => item.category === filter),
    [allData, filter]
  );
}
```
