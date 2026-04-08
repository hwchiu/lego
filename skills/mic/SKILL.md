---
name: mic-development
description: Use when building features, fixing bugs, adding pages, or modifying UI in the MIC (lego) project. Covers component structure, CSS conventions, design tokens, data layer patterns, i18n, routing, state management, and responsive design for this Next.js static-export financial dashboard.
---

# MIC Development — Complete Reference

完整的 MIC 金融儀表板開發規範——元件結構、CSS 系統、設計令牌、資料層、i18n、路由的統一參照手冊。

## 設計哲學

> **Flat · Professional · Data-Dense**

- 扁平化設計，不使用漸層背景（僅 sidebar active 使用微漸層）
- 資訊密度優先：小字體、緊湊間距、一屏盡覽
- 單一全域 CSS 檔案（vanilla CSS），無 Tailwind、無 CSS-in-JS、無 CSS Modules
- **永遠使用 CSS 變數**，避免寫死 hex 值

## 架構總覽

```
app/
├── components/
│   ├── layout/          # TopNav, Sidebar, Banner（所有頁面共用）
│   ├── news/            # NewsCard, CompanyRankingTable, NewsCategoryTabs
│   ├── calendar/        # MonthGrid, WeekGrid, DetailTable, CalendarControls
│   └── collaboration/   # TaskPanel, ContentCard, CommentSection, AddCardModal
├── contexts/            # LanguageContext, WatchlistContext, MobileSidebarContext
├── data/                # TypeScript 資料模組（navigation, sp500, news 等）
├── lib/                 # 純工具函數（parseContent, calendarUtils）
├── [feature]/           # 路由頁面（page.tsx + FeatureContent.tsx）
└── globals.css          # 單一全域樣式表（17,000+ 行）

content/                 # 帶有嵌入式 JSON 資料塊的 Markdown 檔案
```

### 頁面框架（每個頁面）

```
TopNav (58px fixed)
  └── Banner (40px, optional)
    └── div.app-body (flex row)
          ├── Sidebar (236px / 52px collapsed)
          └── main.main-content (flex: 1, overflow-y: auto)
                └── div.page-pad (padding: 24px 28px 40px)
                      └── {page content}
```

---

## 元件規範

### 結構模板

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface FeatureCardProps {
  title: string;
  onAction: (id: string) => void;
}

// 私有子元件：與主元件同檔，不 export
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
      {/* ... */}
    </svg>
  );
}

export default function FeatureCard({ title, onAction }: FeatureCardProps) {
  const { lang } = useLanguage();
  const [active, setActive] = useState(false);
  // ...
}
```

**規則：**
- 所有元件：`'use client'` directive、functional、**default export**
- Props 介面定義在元件正上方，命名為 `ComponentNameProps`
- 私有子元件（Icon 等）放在同一檔案，不 export
- Icon：`function IconName()` 回傳 inline `<svg>` 帶 `aria-hidden="true"`

### Hooks 使用慣例

| Hook | 使用場景 |
|------|----------|
| `useState` | 本地 UI 狀態（modal、toggle、filter、表單輸入） |
| `useCallback` | 事件 handler 記憶化 |
| `useMemo` | 計算/過濾列表 |
| `useRef` | DOM 參考（textarea、拖曳追蹤、timer） |
| `useEffect` | Side effects + cleanup（click-outside、scroll、localStorage sync） |

### Context Hooks

```tsx
const { lang, toggleLang } = useLanguage();            // zh / en 切換
const { watchlistNames, favorites, toggleFavorite } = useWatchlist();
const { isMobileOpen, toggleSidebar, closeSidebar } = useMobileSidebar();
```

### 事件 Handler 命名

```tsx
// 模式：handle{EventName}
handleCopyLink, handleKeyDown, handleToggleFavorite, handleFilterChange
```

### Navigation

```tsx
// 內部連結
import Link from 'next/link';
<Link href="/feature-name/">文字</Link>   // 帶 trailing slash

// 程式化跳轉
const router = useRouter();
router.push('/path/');

// 外部連結
<a href="..." target="_blank" rel="noopener noreferrer">外部連結</a>
```

---

## CSS 規範

### globals.css 組織結構

```
1.  :root 設計令牌（CSS 變數）
2.  全域 Reset & 基礎排版
3.  TopNav（58px）
4.  Search Dropdown
5.  Banner Carousel
6.  App Body & Sidebar
7.  Main Content
8.  ——— 各功能區塊（按新增順序排列）———
9.  Calendar → AI Chatbot → Watchlist → Company Profile → ...
10. ——— 響應式區塊（最末端）———
11. @media (max-width: 768px) { ... }
12. @media (max-width: 480px) { ... }
```

**新增功能 CSS 規則：**
1. 插入位置：最後一個功能區塊之後、響應式區塊之前
2. 以 `/* ===== FEATURE NAME ===== */` 開頭
3. 響應式覆寫加在最末端的 `@media` 區塊內

### Class 命名：Feature-Prefixed Kebab-Case

```
.{prefix}-{component}              → .cp-card, .de-panel
.{prefix}-{component}-{element}    → .cp-card-title, .de-panel-header
.{prefix}-{component}--{modifier}  → .pr-card--compact
.{component}.{state}               → .toggle-btn.active, .week-cell.selected
```

| 功能模組 | Prefix |
|----------|--------|
| TopNav | `topnav-` |
| Sidebar | `sidebar-` |
| Calendar | `cal-` / `week-` / `month-` |
| Company Profile | `cp-` |
| Press Release | `pr-` |
| Collaboration | `pg-` |
| Data Explore | `de-` |
| Financial Statement | `fin-stmt-` |
| Supply Chain | `rmap-` |
| M&A | `aapl-ma-` |
| Watchlist | `cwl-` / `wl-` |
| Chatbot | `chatbot-` |
| Knowledge Graph | `kg-` |
| Intelligence Search | `is-` |

---

## 設計令牌速查

### 色彩系統

```css
:root {
  /* 底色 */
  --c-dark:     #1a2332;   /* Sidebar 深色背景 */
  --c-dark-2:   #111827;   /* 更深底色 */
  --c-white:    #ffffff;   /* Card、主內容區 */
  --c-bg:       #f3f4f6;   /* 淺灰底（input、hover、交替行） */

  /* 文字層級 */
  --c-text:     #111827;   /* 主文字 */
  --c-text-2:   #374151;   /* 次要文字 */
  --c-text-3:   #6b7280;   /* 說明文字 / muted */
  --c-text-4:   #9ca3af;   /* Placeholder / disabled */

  /* 邊框 */
  --c-border:   #e5e7eb;   /* 靜態邊框 */
  --c-border-2: #d1d5db;   /* Focus / hover 邊框 */

  /* 語意色彩 */
  --c-accent:     #4fc3f7; /* Active / selected / focus ring */
  --c-orange:     #ea580c; /* 警告 / 次要動作 */
  --c-pos:        #16a34a; /* 漲 / 正值（綠） */
  --c-neg:        #dc2626; /* 跌 / 負值（紅） */
  --c-btn-active: #374151; /* Toggle 按鈕 active 態 */

  /* 圓角 */
  --radius-sm: 4px;    /* Input、badge、小按鈕 */
  --radius:    8px;    /* Card、dropdown、modal */
  --radius-lg: 10px;   /* 大卡片、日曆格 */

  /* 字型 */
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
}
```

### 字體尺度

| 尺寸 | 用途 | 字重 |
|------|------|------|
| 9–9.5px | Eyebrow / section label | `700–800` + `letter-spacing: 0.08–0.14em` + `text-transform: uppercase` |
| 10–10.5px | Badge、腳註 | `600–800` |
| 11–11.5px | 次要文字、表格欄位、sidebar 連結 | `400–500` |
| 12–12.5px | 表格資料、按鈕文字 | `400–500` |
| 13–13.5px | 主體文字、搜尋輸入框 | `400` |
| 15px | 區塊標題 | `600–700` |
| 21px | Logo | `700` + `letter-spacing: -0.5px` |

### 陰影層級

| 層級 | 值 | 用途 |
|------|-----|------|
| Subtle | `0 1px 4px rgba(0,0,0,0.05)` | 靜態 card |
| Light | `0 1px 6px rgba(0,0,0,0.07)` | Input、小 dropdown |
| Hover | `0 2px 8px rgba(0,0,0,0.06)` | Card hover |
| Standard | `0 4px 12px rgba(0,0,0,0.10)` | 標準 card |
| Dropdown | `0 4px 16px rgba(0,0,0,0.10)` | Dropdown、popover |
| Modal | `0 8px 24px rgba(0,0,0,0.10)` | 彈窗 |
| Float | `0 12px 48px rgba(0,0,0,0.22)` | 浮動面板 |
| Focus ring | `0 0 0 2px rgba(79,195,247,0.18)` | Focus 態 |

### 過渡時間

| 時長 | 用途 | 緩動 |
|------|------|------|
| `0.12s` | 色彩快速反饋（checkbox、hover） | `ease` |
| **`0.15s`** | **標準過渡（最常用）** | `ease` |
| `0.18s` | Modal、面板進場 | `ease` |
| `0.22s` | Sidebar 收合、Panel 滑入 | `ease` |
| `0.28s` | Mobile drawer 滑入 | `cubic-bezier(0.4, 0, 0.2, 1)` |

```css
/* ✅ 標準過渡寫法 */
transition: background 0.15s, color 0.15s, border-color 0.15s;
/* ❌ 不用 transition: all */
```

### Z-Index 層級

| 層級 | 元件 |
|------|------|
| 0–50 | 卡片堆疊、表格、日曆內部 |
| 100 | Sidebar overlay |
| 200 | TopNav、Dropdown |
| 300 | 子選單 |
| 400–500 | Modal、搜尋面板 |
| 800 | Mobile sidebar |
| 1000–1200 | Watchlist modal、Chatbot（最高） |

---

## 常見元件 CSS 模板

### Card（最常見基礎元件）

```css
.{prefix}-card {
  background: var(--c-white);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 20px 22px;
  margin-bottom: 16px;
}
/* 可點擊 */
.{prefix}-card--clickable {
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.{prefix}-card--clickable:hover {
  border-color: var(--c-border-2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
```

### Toggle Button（篩選、分類選項）

```css
.{prefix}-toggle-btn {
  padding: 4px 11px;
  font-size: 11.5px;
  font-weight: 500;
  background: var(--c-white);
  border: 1px solid var(--c-border-2);
  border-radius: var(--radius-sm);
  color: var(--c-text-3);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.{prefix}-toggle-btn:hover { background: var(--c-bg); color: var(--c-text-2); }
.{prefix}-toggle-btn.active {
  background: var(--c-btn-active);
  color: var(--c-white);
  border-color: var(--c-btn-active);
}
```

### Table

```css
.{prefix}-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.{prefix}-table th {
  font-size: 10px; font-weight: 700; color: var(--c-text-3);
  text-transform: uppercase; letter-spacing: 0.08em;
  padding: 8px 10px; border-bottom: 1.5px solid var(--c-border-2); text-align: left;
}
.{prefix}-table td { padding: 8px 10px; border-bottom: 1px solid var(--c-border); color: var(--c-text-2); }
.{prefix}-table tr:hover { background: var(--c-bg); }
```

完整元件模板（Input、Dropdown、Modal、Badge、Tabs 等）→ 見 [`references/component-css.md`](references/component-css.md)

---

## 資料層

### Markdown + JSON 模式

```markdown
<!-- content/feature-data.md -->
## Entity Data
```json
{
  "TSM": { "shares": 120, "cost": 105.3 },
  "AAPL": { "shares": 45, "cost": 167.8 }
}
```​
```

### 解析工具（`app/lib/parseContent.ts`）

```tsx
import rawContent from '@/content/feature-data.md';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';

const items: Item[] = extractJson<Item[]>(rawContent);
const entities = extractJsonBySection<Record<string, Entity>>(rawContent, 'Entity Data');
```

### TypeScript 資料模組（`app/data/*.ts`）

類型 + 常數 + 工具函數集中在同一檔案：

```tsx
export interface DataItem { id: string; title: string; category: string; }
export const CATEGORIES: Category[] = [/* ... */];
export function getDataByCategory(id: string): DataItem[] { /* parse markdown */ }
```

### SVG Icon 儲存（`app/data/navigation.ts`）

```tsx
export const sidebarIcons: Record<string, string> = {
  home: '<path d="M7 1L1 6v7h4V9h4v4h4V6L7 1Z" stroke="currentColor" strokeWidth="1.3"/>',
};

// 渲染
<svg viewBox="0 0 14 14" fill="none" dangerouslySetInnerHTML={{ __html: sidebarIcons[key] }} />
```

### 內嵌 SVG 圖表（無外部庫）

```tsx
function BarChart({ data }: { data: ChartBar[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <svg viewBox="0 0 320 120" width="100%">
      {data.map((d, i) => (
        <rect key={i} x={i * 40} y={120 - (d.value / max) * 100}
              width={30} height={(d.value / max) * 100} fill="var(--c-accent)" />
      ))}
    </svg>
  );
}
```

詳細資料層模式 → 見 [`references/data-layer.md`](references/data-layer.md)

---

## 國際化（i18n）

- 兩種語言：`'zh'`（繁體中文）| `'en'`
- 翻譯存放在 `app/data/translations.ts`，格式：`Record<string, { zh: string; en: string }>`
- Helper：`t(key, lang)` 回傳翻譯字串

```tsx
const { lang } = useLanguage();
const label = lang === 'zh' ? '主要導覽' : 'Main Navigation';
const dateStr = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', opts);
```

**翻譯範圍：**
- ✅ 導覽、按鈕文字、狀態/優先度、區塊標題
- ❌ 公司名稱、股票代號、新聞標題、程式碼

---

## 狀態管理

**只用 React Context API**——不用 Redux、Zustand 或其他外部狀態庫。

### localStorage 持久化模式

```tsx
// 掛載時讀取
useEffect(() => {
  try {
    const stored = localStorage.getItem('mic-feature-key');
    if (stored) setState(prev => ({ ...prev, ...JSON.parse(stored) }));
  } catch { /* silent fail */ }
}, []);

// 變更時寫入
useEffect(() => {
  localStorage.setItem('mic-feature-key', JSON.stringify(state));
}, [state]);
```

### ID 生成

```tsx
const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? `prefix-${crypto.randomUUID()}`
  : `prefix-${Date.now()}-${Math.random().toString(36).slice(2)}`;
```

---

## 響應式設計

### 斷點（Desktop-first）

```css
@media (max-width: 1400px) { /* Grid 降為 2 欄 */ }
@media (max-width: 1100px) { /* 單欄佈局 */ }
@media (max-width: 900px)  { /* 平板模式 */ }
@media (max-width: 768px)  { /* ★ 主要斷點：sidebar drawer */ }
@media (max-width: 480px)  { /* ★ 手機：緊湊間距 */ }
```

**所有 `@media` 查詢集中在 `globals.css` 最末端。**

### 768px 主要行為

- Sidebar → `position: fixed; left: -260px` → `.mobile-open` 滑入
- Grid → 單欄；表格 → `overflow-x: auto` 包裝
- `page-pad` → `padding: 16px 12px 24px`

### Mobile Sidebar Context

```tsx
const { isMobileOpen, isDesktopCollapsed, toggleSidebar, toggleDesktopCollapsed } = useMobileSidebar();

// TopNav 漢堡按鈕
const handleHamburger = () => {
  if (window.innerWidth <= 768) toggleSidebar();
  else toggleDesktopCollapsed();
};
```

佈局尺寸速查與完整響應式規則 → 見 [`references/responsive-system.md`](references/responsive-system.md)

---

## 安全與驗證

```tsx
// URL 驗證
const url = new URL(input);
if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Invalid URL');

// 檔案大小
const MAX_SIZE = 5 * 1024 * 1024;  // 5MB
if (file.size > MAX_SIZE) return;

// Image data URI 驗證
if (!result.startsWith('data:image/')) return;

// @Mentions：只從已知成員名稱建構 regex（不用萬用字元）
```

---

## 建置與部署

```bash
npm run dev      # Dev server → http://localhost:3000/lego
npm run build    # TypeScript check + static export → out/
npm run lint     # ESLint
```

| 項目 | 值 |
|------|-----|
| Output | Static HTML（`output: 'export'`） |
| Base path | `/lego` |
| Trailing slashes | 啟用 |
| Dynamic routes | 必須 export `generateStaticParams()` |
| SSR | ❌ 不支援（全部靜態預渲染） |

---

## Commit 規範

```
[feat|fix|refactor]: 描述性標題（現在式）

選填：詳細說明。

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## 常見 Bug 快速查表

| 問題 | 根因 | 修法 |
|------|------|------|
| CSS 覆寫無效 | 後面同特異度規則獲勝 | 確認 globals.css 順序；關鍵規則移後 |
| `position: fixed` 失效 | 父元素有 `transform` | 移除 transform；改用 `box-shadow` 視覺提升 |
| Mobile overflow | `overflow: hidden` + 無 wrap | 改 `overflow: visible` + `flex-wrap: wrap` |
| 表格 Mobile overflow | 固定欄位布局 | 用 `overflow-x: auto` 容器包裝 |
| Filter bar Mobile overflow | 水平滾動模式 | ≤768px 改為 `flex-wrap: wrap` |

---

## 參考文件索引

| 主題 | 檔案 |
|------|------|
| 設計令牌完整規格（色彩、間距、圓角、陰影、字型） | [`references/design-tokens.md`](references/design-tokens.md) |
| 完整元件 CSS 模板（Card、Button、Input、Dropdown、Modal、Table 等） | [`references/component-css.md`](references/component-css.md) |
| 動畫與過渡系統（Keyframes、命名、效能原則） | [`references/animation-system.md`](references/animation-system.md) |
| 響應式系統（斷點行為、Mobile Sidebar、佈局尺寸） | [`references/responsive-system.md`](references/responsive-system.md) |
| 資料層模式（Markdown+JSON、parseContent、TypeScript 模組） | [`references/data-layer.md`](references/data-layer.md) |
| 新功能開發流程（路由、資料、樣式、導覽、類型） | [`references/new-feature-guide.md`](references/new-feature-guide.md) |
