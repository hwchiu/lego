---
name: tmic-ui-style
description: tMIC 網站的完整視覺風格參照手冊。涵蓋設計令牌（Design Tokens）、色彩系統、字體排版、間距尺度、陰影層級、動畫系統、元件樣式模板、響應式斷點規則。建立新頁面、新元件或修改 UI 時必須參照此 Skill，確保視覺一致性。
---

# tMIC UI Style Guide

tMIC 金融資訊儀表板的完整視覺風格體系——從 `app/globals.css`（17,000+ 行）中提煉而成的可反覆參照規範。

## 設計哲學

> **Flat · Professional · Data-Dense**

- 扁平化設計，不使用漸層背景（僅 sidebar active 使用微漸層）
- 資訊密度優先：小字體、緊湊間距、一屏盡覽
- 專業金融風格：灰色系為基底，彩色僅用於數據語意（漲綠跌紅）
- 單一全域 CSS 檔案（vanilla CSS），無 Tailwind、無 CSS-in-JS、無 CSS Modules

## 何時使用此 Skill

- 建立新頁面或功能區塊時，需要查詢正確的色彩、字體、間距
- 新增或修改元件時，需要套用一致的 card / button / input / dropdown 樣式
- 撰寫 responsive 樣式時，需要確認斷點與行為
- 新增動畫或過場效果時，需要遵循既有的時間與緩動慣例
- 調整 z-index 層級時，需要確認不會衝突

## 技術棧

| 項目 | 值 |
|------|-----|
| 框架 | Next.js 14 (Static Export) |
| CSS 策略 | 單一 `app/globals.css`，vanilla CSS |
| CSS 變數 | `:root` 中定義 15+ 設計令牌 |
| 元件命名 | Feature-prefixed kebab-case（如 `.cp-card`、`.pr-timeline`） |
| 響應式 | Desktop-first，主斷點 768px / 480px |
| 字型 | System font stack + Noto Sans TC |

## 設計令牌速查

### 色彩系統

```css
:root {
  /* 底色 */
  --c-dark:       #1a2332;    /* Sidebar 深色背景 */
  --c-dark-2:     #111827;    /* 更深底色 */
  --c-white:      #ffffff;    /* Card、主背景 */
  --c-bg:         #f3f4f6;    /* 淺灰背景（交替行、input 背景） */

  /* 文字層級（由深到淺） */
  --c-text:       #111827;    /* 主文字 */
  --c-text-2:     #374151;    /* 次要文字 */
  --c-text-3:     #6b7280;    /* 第三層文字（灰色） */
  --c-text-4:     #9ca3af;    /* 最淡文字（placeholder、disabled） */

  /* 邊框 */
  --c-border:     #e5e7eb;    /* 標準邊框 */
  --c-border-2:   #d1d5db;    /* 較深邊框（focus、hover） */

  /* 語意色彩 */
  --c-accent:     #4fc3f7;    /* 主強調色（cyan blue） */
  --c-orange:     #ea580c;    /* 警告 / 次要動作 */
  --c-pos:        #16a34a;    /* 正向（漲、增、綠） */
  --c-neg:        #dc2626;    /* 負向（跌、減、紅） */
  --c-btn-active: #374151;    /* 按鈕 active 態 */
}
```

#### 額外常用色（非變數，直接寫入）

| 色碼 | 用途 |
|------|------|
| `#1e66f5` | Coming Soon 徽章 |
| `#bf3030` / `rgb(191,48,48)` | NEW 徽章、Banner 警告底色 |
| `#f59e0b` | 星號（收藏、已加入） |
| `rgba(79,195,247,0.17)` → `rgba(79,195,247,0.04)` | Sidebar active 漸層 |
| `rgba(0,0,0,0.45)` | Mobile overlay 遮罩 |
| `rgba(255,255,255,0.08)` ~ `0.62` | Sidebar 內白色文字 / icon 透明度 |

### 圓角

```css
--radius-sm: 4px;     /* 小元素：input、小按鈕、badge */
--radius:    8px;     /* 標準元件：card、dropdown、modal */
--radius-lg: 10px;    /* 大卡片、日曆格 */
```

特殊圓角：`18px`（pill input）、`20px`（pill button）、`50%`（圓形頭像）、`4px 16px 16px 16px`（聊天氣泡）

### 字型

```css
--font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
```

### 字體尺度

| 尺寸 | 用途 | 字重 |
|------|------|------|
| 9–9.5px | 眉標（eyebrow）、section label | 700–800 + `letter-spacing: 0.08–0.14em` + `text-transform: uppercase` |
| 10–10.5px | Badge、腳註、dropdown 分類 | 600–800 |
| 11–11.5px | 次要文字、表格欄位、sidebar 連結 | 400–500 |
| 12–12.5px | 表格資料、按鈕文字 | 400–500 |
| 13–13.5px | 主體文字、搜尋輸入框 | 400 |
| 15px | 區塊標題 | 600–700 |
| 21px | Logo | 700 + `letter-spacing: -0.5px` |
| 22–48px | 頁面大標題（特殊頁面） | 700–800 |

行高：`1`（緊湊 badge）、`1.1`（標題）、`1.5`（內文預設）、`1.6`（多行標籤）

## 陰影層級系統

```
elevation-0:  無陰影
elevation-1:  0 1px 4px rgba(0,0,0,0.05)         — 微浮（靜態）
elevation-2:  0 1px 6px rgba(0,0,0,0.07)         — Input、小 dropdown
elevation-3:  0 2px 8px rgba(0,0,0,0.06)         — Card hover
elevation-4:  0 4px 12px rgba(0,0,0,0.10)        — 標準 Card
elevation-5:  0 4px 16px rgba(0,0,0,0.10)        — Dropdown、popover
elevation-6:  0 8px 24px rgba(0,0,0,0.10)        — Modal
elevation-7:  0 12px 48px rgba(0,0,0,0.22)       — 浮動面板
elevation-8:  0 20px 60px rgba(0,0,0,0.35)       — 全屏 modal
```

Focus ring：`0 0 0 2px rgba(79,195,247,0.18)`（accent 色 ring）
Glow（語意）：`0 0 10px rgba(22,163,74,0.55)`（綠）/ `rgba(220,38,38,0.55)`（紅）/ `rgba(202,138,4,0.55)`（黃）

## Z-Index 層級表

| 層級 | 元件 |
|------|------|
| 0–2 | 堆疊卡片、表單元素 |
| 10–50 | 日曆 / 表格內部 |
| 100 | Sidebar overlay |
| 200 | TopNav、Dropdown |
| 300 | 子選單 |
| 400–500 | Modal、搜尋面板 |
| 600 | 通知面板 |
| 800 | Mobile sidebar |
| 900–1000 | Watchlist modal、AI Chatbot |
| 1200 | Chatbot（最高常規層） |

## 過渡與動畫

### 過渡時間規範

| 時長 | 用途 | 備註 |
|------|------|------|
| `0.12s` | 快速反饋（hover 色變） | `ease` |
| `0.15s` | **標準過渡**（最常用） | `background, color, border-color` |
| `0.18s` | Modal 進場 | `ease` |
| `0.22s` | Sidebar 收合 / Panel 滑入 | `ease` |
| `0.28s` | Mobile drawer 滑入 | `cubic-bezier(0.4, 0, 0.2, 1)` |

### 關鍵影格動畫

| 名稱 | 效果 | 時長 |
|------|------|------|
| `chatbot-slide-in` | 右側滑入 + 淡入 | 0.22s ease |
| `chatbot-dot-bounce` | 三點載入動畫 | 1.2s infinite（stagger 0.2s） |
| `wl-modal-in` | 縮放 + 上移淡入 | 0.18s ease |
| `rmapPanelIn` | 左側滑入 | 0.18s ease |
| `de-panel-slide-in` | 右側滑入 | 0.22s ease |
| `pr-stack-expand-in` | 縮放 + 位移展開 | 0.15s ease-out |
| `is-cursor-blink` | 游標閃爍 | 1.1s step-end infinite |

## 響應式系統

### 斷點（Desktop-first）

```css
@media (max-width: 1600px) { /* 大螢幕微調 */ }
@media (max-width: 1400px) { /* 網格降為 2 欄 */ }
@media (max-width: 1100px) { /* 單欄佈局 */ }
@media (max-width: 900px)  { /* 平板模式 */ }
@media (max-width: 768px)  { /* ★ 主要斷點：sidebar 變 drawer */ }
@media (max-width: 480px)  { /* ★ 手機：緊湊間距 */ }
```

### 768px 行為

- Sidebar → `position: fixed; left: -260px`，`.mobile-open` 滑入
- Overlay `.sidebar-overlay` → `rgba(0,0,0,0.45)`
- Grid → 單欄
- 過渡：`left 0.28s cubic-bezier(0.4, 0, 0.2, 1)`

### 480px 行為

- 更小的 padding（page-pad 縮減）
- Icon-only 按鈕
- 字體不再縮小（已達最小可讀尺寸）

## 元件樣式模板

詳見 references 子文件：

| 主題 | 檔案 |
|------|------|
| 設計令牌完整規格 | `references/design-tokens.md` |
| 可複製的元件樣式模板 | `references/component-patterns.md` |
| 動畫與過渡完整規格 | `references/animation-system.md` |
| 響應式規則與斷點行為 | `references/responsive-system.md` |

## CSS 組織規則

### globals.css 結構

```
1.   :root 設計令牌
2.   全域 Reset & 基礎排版
3.   TopNav（~58px）
4.   Search Dropdown
5.   Banner Carousel
6.   App Body & Sidebar
7.   Main Content
8.   ——— 各功能區塊（按新增順序排列）———
9.   Calendar → Week/Month Grid → Detail
10.  AI Chatbot
11.  Watchlist → Company Profile → Supply Chain
12.  Financial → Press Release → Collaboration
13.  Data Explore → User Manual → Intelligence Search
14.  Knowledge Graph
15.  ——— 響應式區塊（最末端）———
16.  @media (max-width: 768px) { ... }
17.  @media (max-width: 480px) { ... }
```

### 新增功能的 CSS 規則

1. 在最後一個功能區塊之後、響應式區塊之前插入
2. 以 `/* ===== FEATURE NAME ===== */` 開頭
3. 使用 2–3 字母的 feature prefix（如 `.fn-card`、`.fn-grid`）
4. 響應式覆寫加在對應的 `@media` 區塊內

### Class 命名慣例

```
.{prefix}-{component}           → .cp-card, .de-panel
.{prefix}-{component}-{element} → .cp-card-title, .de-panel-header
.{prefix}-{component}--{mod}    → .pr-card--compact
.{component}.{state}            → .toggle-btn.active, .week-cell.selected
```

| 功能 | Prefix |
|------|--------|
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

## Icon 系統

- 格式：Inline SVG，`viewBox="0 0 14 14"`
- 風格：Stroke-based，`stroke="currentColor"`，`strokeWidth="1.3"`，無 fill
- 儲存：`app/data/navigation.ts` 中以 SVG path string 儲存
- 渲染：`dangerouslySetInnerHTML={{ __html: iconPath }}`
- Class：`.ni`（nav icon），預設 `opacity: 0.6`

## 佈局骨架

```
<body>                              /* flex column, height: 100vh */
  <TopNav/>                         /* 58px fixed */
  <Banner/>                         /* 40px（可選） */
  <div class="app-body">            /* flex row, flex: 1 */
    <Sidebar/>                      /* 236px / 52px collapsed */
    <main class="main-content">     /* flex: 1, overflow-y: auto */
      <div class="page-pad">        /* padding: 24px 28px 40px */
        {children}
      </div>
    </main>
  </div>
</body>
```

## 快速檢查清單

新增 UI 元件前，確認以下項目：

- [ ] 顏色是否使用 CSS 變數（`--c-*`）？避免寫死色碼
- [ ] 圓角是否使用 `--radius-sm` / `--radius` / `--radius-lg`？
- [ ] 過渡是否使用 `0.15s` 標準時長？
- [ ] hover 效果是否包含 `background` + `border-color` 變化？
- [ ] 陰影是否遵循層級系統？
- [ ] z-index 是否在正確層級？
- [ ] 響應式覆寫是否加在 `@media` 區塊內？
- [ ] Class 名稱是否使用 feature prefix？
- [ ] 字體大小是否在既有尺度內（9px–21px 常用範圍）？
