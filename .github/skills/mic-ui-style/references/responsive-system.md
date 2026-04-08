# 響應式系統

MIC 的 Desktop-first 響應式設計規範——斷點定義、各斷點行為、Mobile Sidebar 模式。

## 斷點定義

```
Desktop (default)
  │
  ├── ≤ 1600px   大螢幕微調
  ├── ≤ 1400px   Masonry 網格降為 2 欄
  ├── ≤ 1100px   單欄佈局
  ├── ≤ 900px    平板模式
  ├── ≤ 860px    篩選列調整
  ├── ≤ 768px    ★ 主要斷點（Tablet / 手機）
  ├── ≤ 700px    內容網格收合
  └── ≤ 480px    ★ 手機斷點（緊湊模式）
```

### JavaScript 常數

```tsx
// app/contexts/MobileSidebarContext.tsx
export const MOBILE_BREAKPOINT = 768;
```

## 各斷點行為

### ≤ 1600px — 大螢幕微調

- 部分 masonry 網格欄位微調
- 無重大佈局變化

### ≤ 1400px — 網格降欄

- Masonry grid → 2 columns
- 大型 dashboard grid 收窄

### ≤ 1100px — 單欄模式

- 多欄佈局 → 全部堆疊為單欄
- Company Profile 等雙欄 → 單欄

### ≤ 900px — 平板

- Nav 調整
- Filter bar 換行
- Table 啟用水平滾動

### ≤ 768px — 主要行動斷點 ★

這是最重要的斷點，觸發完整的行動版佈局：

#### Sidebar

```css
.sidebar {
  position: fixed;
  top: 0;
  left: -260px;         /* 隱藏在螢幕左側 */
  width: 236px;
  height: 100vh;
  z-index: 800;
  transition: left 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.sidebar.mobile-open {
  left: 0;              /* 滑入 */
}
```

#### Sidebar Overlay

```css
.sidebar-overlay {
  display: none;
}
@media (max-width: 768px) {
  .sidebar-overlay.visible {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 799;
  }
}
```

#### 主內容區

```css
@media (max-width: 768px) {
  html, body {
    overflow: auto;         /* 允許全頁滾動 */
  }
  .app-body {
    flex-direction: column;
  }
  .main-content {
    overflow: visible;      /* 不再獨立滾動 */
  }
  .page-pad {
    padding: 16px 12px 24px;  /* 縮小邊距 */
  }
}
```

#### Grid 收合

```css
@media (max-width: 768px) {
  .week-grid {
    grid-template-columns: 1fr;   /* 7 欄 → 1 欄 */
  }
  .pg-masonry {
    columns: 1;
  }
}
```

#### TopNav 調整

```css
@media (max-width: 768px) {
  .topnav {
    padding: 0 12px;
    gap: 8px;
  }
  .topnav-search-wrap {
    display: none;      /* 隱藏搜尋框，改用 icon */
  }
}
```

### ≤ 480px — 手機緊湊模式 ★

在 768px 基礎上進一步調整：

```css
@media (max-width: 480px) {
  .page-pad {
    padding: 10px 8px 16px;    /* 進一步縮小 */
  }
  .topnav {
    height: 48px;              /* TopNav 縮小 */
    padding: 0 8px;
  }
  /* 部分按鈕改為 icon-only */
  .{prefix}-btn-label {
    display: none;
  }
}
```

## Mobile Sidebar 完整流程

### Context API

```tsx
// app/contexts/MobileSidebarContext.tsx
interface MobileSidebarContextType {
  isMobileOpen: boolean;
  isDesktopCollapsed: boolean;
  toggleSidebar: () => void;      // Mobile: 開關 drawer
  closeSidebar: () => void;       // Mobile: 關閉 drawer
  toggleDesktopCollapsed: () => void;  // Desktop: 收合/展開
}
```

### TopNav 漢堡按鈕

```tsx
// TopNav.tsx
const handleHamburger = () => {
  if (window.innerWidth <= MOBILE_BREAKPOINT) {
    toggleSidebar();           // Mobile → 開關 drawer
  } else {
    toggleDesktopCollapsed();  // Desktop → 收合/展開
  }
};
```

### 路由變更自動關閉

```tsx
// Sidebar.tsx
useEffect(() => {
  closeSidebar();  // pathname 變化時自動關閉 mobile drawer
}, [pathname]);
```

### Collapse 行為（Desktop）

```css
.sidebar.collapsed {
  width: 52px;
  min-width: 52px;
}
.sidebar.collapsed .sidebar-nav-label,
.sidebar.collapsed .sidebar-section-label {
  display: none;       /* 只顯示 icon */
}
```

## 響應式撰寫規則

### 1. 新增響應式樣式的位置

所有 `@media` 查詢集中在 `globals.css` 最末端，按斷點分組：

```css
/* ===== 檔案最末端 ===== */

/* --- 768px 區塊 --- */
@media (max-width: 768px) {
  /* 所有 768px 覆寫 */
  .new-feature-grid { grid-template-columns: 1fr; }
}

/* --- 480px 區塊 --- */
@media (max-width: 480px) {
  /* 所有 480px 覆寫 */
  .new-feature-card { padding: 10px; }
}
```

### 2. 常見響應式 Pattern

**Grid 收合**
```css
.{prefix}-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 768px) {
  .{prefix}-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
```

**表格水平滾動**
```css
@media (max-width: 768px) {
  .{prefix}-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

**Filter bar 換行**
```css
@media (max-width: 768px) {
  .{prefix}-filter-bar {
    flex-wrap: wrap;
    gap: 6px;
  }
}
```

**隱藏次要元素**
```css
@media (max-width: 768px) {
  .{prefix}-secondary-info {
    display: none;
  }
}
```

### 3. 避免事項

- ❌ 不要在功能區塊中間寫 `@media` 查詢（全部集中到末尾）
- ❌ 不要使用 `display: none !important`（優先用 layout 調整取代隱藏）
- ❌ 不要縮小字體到 9px 以下（已達最小可讀尺寸）
- ❌ 不要在 mobile 使用 `position: fixed` 的 tooltip（觸控裝置不適合 hover）
- ✅ 優先使用 `flex-wrap: wrap` 而非 `overflow: hidden`
- ✅ 表格超寬時用 `overflow-x: auto` 包裝，而非壓縮欄寬
- ✅ 響應式圖片使用 `max-width: 100%; height: auto;`

## 佈局尺寸速查

| 元件 | Desktop | Tablet (≤768px) | Phone (≤480px) |
|------|---------|------------------|----------------|
| TopNav 高度 | 58px | 58px | 48px |
| Sidebar 寬度 | 236px / 52px | Drawer 236px | Drawer 236px |
| Page padding | 24px 28px 40px | 16px 12px 24px | 10px 8px 16px |
| Grid 欄數 | 2–7 欄 | 1–2 欄 | 1 欄 |
| 標準 gap | 16px | 8–12px | 6–8px |
