# Design Tokens 完整規格

tMIC 設計令牌（Design Tokens）的完整參照文件，涵蓋所有 CSS 自訂屬性與衍生值。

## 色彩令牌

### 核心變數（`:root`）

| 變數 | 值 | 語意 | 使用場景 |
|------|-----|------|----------|
| `--c-dark` | `#1a2332` | 深色底 | Sidebar 背景、active 按鈕文字底色 |
| `--c-dark-2` | `#111827` | 更深底 | 極深背景需求 |
| `--c-white` | `#ffffff` | 白色 | Card 背景、主內容區 |
| `--c-bg` | `#f3f4f6` | 淺灰底 | 頁面背景、交替行、hover 底色、input 背景 |
| `--c-text` | `#111827` | 主文字 | 標題、重要內文 |
| `--c-text-2` | `#374151` | 次文字 | 副標題、表格標籤 |
| `--c-text-3` | `#6b7280` | 三級文字 | 說明文字、muted 內容 |
| `--c-text-4` | `#9ca3af` | 最淡文字 | Placeholder、disabled 文字 |
| `--c-border` | `#e5e7eb` | 標準邊框 | Card 邊框、分隔線 |
| `--c-border-2` | `#d1d5db` | 深邊框 | Input border、hover 邊框、focus 態 |
| `--c-accent` | `#4fc3f7` | 強調色 | Active nav、highlight、focus ring |
| `--c-orange` | `#ea580c` | 橘色 | 警告、次要動作 |
| `--c-pos` | `#16a34a` | 正向綠 | 股價上漲、正值 |
| `--c-neg` | `#dc2626` | 負向紅 | 股價下跌、負值 |
| `--c-btn-active` | `#374151` | 按鈕 active | Toggle 按鈕選中態 |

### 衍生色彩（非變數，直接使用）

| 色碼 | 語意 | 出現位置 |
|------|------|----------|
| `#1e66f5` | 藍色徽章 | Coming Soon badge |
| `#bf3030` | 紅色徽章 / 警告 | NEW badge、Banner 底色 |
| `#f59e0b` | 金色 / 收藏 | 星號 icon（filled star） |
| `rgba(79,195,247,0.17)` | 強調色淡底 | Sidebar active 漸層起點 |
| `rgba(79,195,247,0.04)` | 強調色極淡 | Sidebar active 漸層終點 |
| `rgba(79,195,247,0.18)` | 強調色 ring | Focus ring (box-shadow) |
| `rgba(0,0,0,0.45)` | 遮罩 | Mobile overlay |
| `rgba(255,255,255,0.08)` | 白色極淡 | Sidebar scrollbar |
| `rgba(255,255,255,0.1)` | 白色淡底 | Sidebar button hover |
| `rgba(255,255,255,0.45)` | 白色半透 | Sidebar icon 預設色 |
| `rgba(255,255,255,0.62)` | 白色較亮 | Sidebar 文字 |
| `rgba(255,255,255,0.85)` | 白色明亮 | Sidebar hover 文字 |

### 色彩使用原則

1. **永遠使用 CSS 變數**——避免在 globals.css 中寫死 hex 值（衍生色除外）
2. **文字層級**——按內容重要性選用 `--c-text` → `--c-text-2` → `--c-text-3` → `--c-text-4`
3. **邊框層級**——靜態用 `--c-border`，互動態用 `--c-border-2`
4. **語意色彩**——漲用 `--c-pos`、跌用 `--c-neg`，不可反轉（中文慣例：綠漲紅跌要確認目標市場）
5. **強調色**——`--c-accent` 僅用於 active / selected / focus 態，不用於大面積背景

## 間距令牌

### 常用 Padding 值

| 值 | 語意 | 典型使用 |
|-----|------|----------|
| `2px` | 微間距 | Badge 內距、極小 gap |
| `4px` | 小間距 | Input padding-vertical、小按鈕 |
| `6px` | 緊湊間距 | Dropdown item、nav pill |
| `8px` | 標準內距 | 元件內部 padding |
| `10–12px` | 中等內距 | Card padding、section 間隔 |
| `14–16px` | 大內距 | Section padding |
| `20–24px` | 容器內距 | Page-level padding |
| `28px` | 水平頁距 | `.page-pad` 左右 |
| `40px` | 底部頁距 | `.page-pad` 底部 |

### 常用 Gap 值（Flex/Grid）

| 值 | 使用場景 |
|-----|----------|
| `2–3px` | 緊湊列表 |
| `4px` | 表單欄位、icon + text |
| `6px` | Nav items、pills |
| `8px` | 標準元件 gap |
| `10–12px` | 中等區塊 |
| `16–20px` | 主要 section gap |

### 固定尺寸

| 元件 | 尺寸 |
|------|------|
| TopNav 高度 | `58px` |
| Banner 高度 | `40px` |
| Sidebar 寬度 | `236px`（展開）/ `52px`（收合） |
| Icon 標準尺寸 | `14×14px` |
| Avatar | `34–36px` |
| Toggle button | `26×26px` |
| Scrollbar 寬度 | `4px` |

## 圓角令牌

| 變數 | 值 | 使用場景 |
|------|-----|----------|
| `--radius-sm` | `4px` | Input、小按鈕、badge、table cell |
| `--radius` | `8px` | Card、dropdown、modal、standard component |
| `--radius-lg` | `10px` | 大卡片、日曆格 |

### 特殊圓角

| 值 | 使用場景 |
|-----|----------|
| `2px` | Scrollbar thumb |
| `3px` | Banner label 底色 |
| `18px` | Pill-shaped input（chatbot 搜尋） |
| `20px` | Pill-shaped button（category filter） |
| `50%` | 圓形（avatar、icon-only button） |
| `4px 16px 16px 16px` | Chat bubble（Bot 方向） |
| `16px 4px 16px 16px` | Chat bubble（User 方向） |

## 陰影令牌

### 浮起層級

| 層級 | 值 | 用途 |
|------|-----|------|
| Subtle | `0 1px 4px rgba(0,0,0,0.05)` | 微浮起、靜態 card |
| Light | `0 1px 6px rgba(0,0,0,0.07)` | Input、小 dropdown |
| Hover | `0 2px 8px rgba(0,0,0,0.06)` | Card hover |
| Standard | `0 4px 12px rgba(0,0,0,0.10)` | 標準 card shadow |
| Dropdown | `0 4px 16px rgba(0,0,0,0.10)` | Dropdown、popover |
| Modal | `0 8px 24px rgba(0,0,0,0.10)` | 彈窗 |
| Float | `0 12px 48px rgba(0,0,0,0.22)` | 浮動面板 |
| Overlay | `0 20px 60px rgba(0,0,0,0.35)` | 全屏 modal |

### Focus Ring

| 值 | 語意 |
|-----|------|
| `0 0 0 2px rgba(79,195,247,0.18)` | Accent focus（預設） |
| `0 0 0 2px rgba(30,136,229,0.22)` | Blue focus |
| `0 0 0 2px var(--c-dark)` | Dark focus |
| `0 0 0 3px rgba(0,0,0,0.08)` | 暗色 outline |

### 語意 Glow

| 值 | 語意 |
|-----|------|
| `0 0 10px rgba(22,163,74,0.55)` | 正向 glow（綠） |
| `0 0 10px rgba(220,38,38,0.55)` | 負向 glow（紅） |
| `0 0 10px rgba(202,138,4,0.55)` | 警告 glow（黃） |

## 字型令牌

### Font Family

```css
--font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
```

- iOS → San Francisco
- macOS → San Francisco
- Windows → Segoe UI
- 中文支援 → Noto Sans TC（由 Google Fonts CDN 載入）
- 備選 → 系統 sans-serif

### Font Weight 語意

| Weight | 語意 | 典型場景 |
|--------|------|----------|
| `400` | Regular | 內文、表格資料 |
| `500` | Medium | 次強調（nav tab、表格標題） |
| `600` | Semi-bold | 卡片副標、active nav |
| `700` | Bold | 標題、section label |
| `800` | Extra-bold | Eyebrow、badge、強烈強調 |

### Line Height

| 值 | 使用場景 |
|-----|----------|
| `1` | Badge、icon-only 元素 |
| `1.1` | 標題（緊湊） |
| `1.5` | 內文（預設） |
| `1.6` | 多行 label |

### Letter Spacing

| 值 | 使用場景 |
|-----|----------|
| `-0.5px` | Logo（收緊） |
| `normal` | 一般文字 |
| `0.01–0.05em` | 輕微拉寬 |
| `0.08–0.14em` | Eyebrow / uppercase label |
