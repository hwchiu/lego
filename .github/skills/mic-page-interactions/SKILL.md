---
name: mic-page-interactions
description: Use when building any new page or feature in the MIC (lego) project that includes interactive UI patterns — expand/collapse, download, save/favorite, copy link, filter, search, tabs, modals, loading states, or empty states. Ensures every page uses the same icons, interaction logic, and UX conventions across the entire site.
---

# MIC Page Interactions — Standard UI Patterns

當開發新頁面或在現有頁面加入功能時，**必須** 遵循本 Skill 中定義的標準圖示與互動模式，以確保整站使用者體驗一致。

---

## 🚨 核心原則

1. **相同功能必須使用相同圖示** — 不允許重新設計已定義的 icon
2. **互動邏輯必須一致** — 例如 Expand All / Collapse All 的狀態管理模式必須相同
3. **無障礙屬性不可省略** — `aria-label`、`aria-expanded`、`role="dialog"` 等屬性必須正確
4. **雙語標籤必須完整** — 所有 UI 文字必須提供 `zh` 和 `en` 兩個版本
5. **Icon 一律使用 inline SVG** — 禁止使用 emoji、外部圖示庫、icon fonts

---

## 📐 標準圖示庫

所有 icon 皆使用 `stroke="currentColor"`（繼承父元素文字色），`fill="none"`，`aria-hidden="true"`。

### 展開 / 收合 (Chevron)

用於單一 accordion 項目的開關箭頭。

```tsx
function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M2 5L7 10L12 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      <path d="M2 9L7 4L12 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

### 展開全部 / 收合全部 (Expand All / Collapse All)

用於「一次展開或收合所有 section」的批次操作按鈕。

```tsx
function ExpandAllIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 5.5L7 7.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8.5L7 10.5L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CollapseAllIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 4H12M2 7H12M2 10H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M5 8.5L7 6.5L9 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 5.5L7 3.5L9 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

### 下載 (Download)

用於下載 CSV / PDF / Excel 等檔案。

```tsx
function DownloadIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
```

### 搜尋 (Search)

```tsx
function SearchIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8.5 8.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
```

### 關閉 (Close / X)

用於關閉 modal、dismissible banner、清除 input 等。

```tsx
function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" width="10" height="10" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
```

### 重新整理 (Refresh)

```tsx
function RefreshIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M2 7a5 5 0 1 0 1.3-3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 3.5V7H5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

### 篩選 (Filter)

用於顯示篩選器面板或標示目前有篩選條件套用。

```tsx
function FilterIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
      <path d="M1.5 3h11M3.5 7h7M6 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
```

### 外部連結 (External Link)

用於開啟新分頁的連結按鈕。

```tsx
function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="10" height="10" aria-hidden="true">
      <path d="M6 3H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 2h3v3M12 2L8 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
```

### 複製連結 / 分享 (Share / Copy Link)

```tsx
function ShareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7.2L11.5 3.8M4.5 8.8L11.5 12.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}
```

### 收藏 / 星號 (Favorite Star)

用於 Watchlist 收藏功能。空心星 = 未收藏，實心金星 = 已收藏。

```tsx
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
      <path
        d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
        fill={filled ? '#f59e0b' : 'none'}
        stroke={filled ? '#f59e0b' : 'currentColor'}
        strokeWidth={filled ? '1.1' : '1.3'}
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

### 新增 / 加號 (Plus / Add) — 工具列按鈕尺寸

```tsx
function PlusIcon() {
  return (
    <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
```

### 載入中 (Spinner)

用於按鈕內的 inline loading 狀態，搭配 CSS animation。

```tsx
function SpinnerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 14 14" width={size} height={size} fill="none" aria-hidden="true" className="icon-spin">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="12 22" />
    </svg>
  );
}
```

CSS（加到 globals.css 的功能區塊中）：
```css
@keyframes spin { to { transform: rotate(360deg); } }
.icon-spin { animation: spin 0.8s linear infinite; transform-origin: center; }
```

### 警告 (Alert / Warning)

```tsx
function AlertIcon() {
  return (
    <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
      <path d="M7 1.5L12.5 11.5H1.5L7 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 5.5V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="7" cy="10" r="0.6" fill="currentColor" />
    </svg>
  );
}
```

---

## 🔧 互動模式標準

### 1. Expand All / Collapse All（批次展開收合）

**適用場景：** 頁面有多個可折疊的 section 或群組（例如 press release 按公司分組）。

**狀態管理：**
```tsx
const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
const allExpanded = groups.length > 0 && expandedKeys.size >= groups.length;

// 切換所有
function handleToggleAll() {
  if (allExpanded) {
    setExpandedKeys(new Set());
  } else {
    setExpandedKeys(new Set(groups.map((g) => g.key)));
  }
}

// 切換單一
function handleToggleItem(key: string) {
  setExpandedKeys((prev) => {
    const next = new Set(prev);
    if (next.has(key)) { next.delete(key); } else { next.add(key); }
    return next;
  });
}
```

**按鈕 UI：**
```tsx
// 批次按鈕（放在頁面工具列中）
<button
  className="feature-expand-btn"
  onClick={handleToggleAll}
  title={allExpanded ? labels.collapseAll[lang] : labels.expandAll[lang]}
  aria-label={allExpanded ? labels.collapseAll[lang] : labels.expandAll[lang]}
>
  {allExpanded ? <CollapseAllIcon /> : <ExpandAllIcon />}
  <span>{allExpanded ? labels.collapseAll[lang] : labels.expandAll[lang]}</span>
</button>

// 單一 section 的展開/收合按鈕
<button
  className="feature-section-toggle"
  onClick={() => handleToggleItem(item.key)}
  aria-expanded={expandedKeys.has(item.key)}
>
  <span className="feature-section-title">{item.title}</span>
  {expandedKeys.has(item.key) ? <ChevronUpIcon /> : <ChevronDownIcon />}
</button>
```

**雙語文字：**
```tsx
const labels = {
  expandAll:   { zh: '展開全部', en: 'Expand All'   },
  collapseAll: { zh: '收合全部', en: 'Collapse All' },
};
```

---

### 2. 下載 (Download)

根據下載格式，使用對應的 helper function。

#### CSV 下載
```tsx
function downloadCsv(filename: string, rows: string[][], headers: string[]) {
  const lines = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','));
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 用法
const handleDownload = useCallback(() => {
  downloadCsv('report_data', dataRows, columnHeaders);
}, [dataRows, columnHeaders]);
```

#### PDF 下載（透過瀏覽器列印）
```tsx
function downloadAsPdf(title: string, htmlContent: string): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>body{font-family:sans-serif;padding:24px;}@media print{button{display:none}}</style>
    </head><body>${htmlContent}<script>window.onload=()=>window.print();</script></body></html>`);
  win.document.close();
}
```

**按鈕 UI（標準樣式）：**
```tsx
<button
  className="feature-download-btn"
  onClick={handleDownload}
  aria-label={lang === 'zh' ? '下載 CSV' : 'Download CSV'}
  title={lang === 'zh' ? '下載 CSV' : 'Download CSV'}
>
  <DownloadIcon />
  <span>{lang === 'zh' ? '下載 CSV' : 'Download CSV'}</span>
</button>
```

**雙語文字：**
```tsx
const labels = {
  downloadCsv:  { zh: '下載 CSV',  en: 'Download CSV'  },
  downloadPdf:  { zh: '下載 PDF',  en: 'Download PDF'  },
  downloadXlsx: { zh: '下載 Excel', en: 'Download Excel' },
};
```

---

### 3. 複製連結 (Copy Link)

**規則：** 複製成功後，按鈕切換至「已複製」狀態，持續 2 秒後自動恢復，搭配 `aria-live` 提示無障礙用戶。

```tsx
const [copied, setCopied] = useState(false);

function handleCopyLink(url: string) {
  navigator.clipboard.writeText(url).catch(() => {});
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
}

// JSX
<div className="feature-share-wrap">
  <button
    className={`feature-icon-btn${copied ? ' feature-icon-btn--active' : ''}`}
    onClick={() => handleCopyLink(targetUrl)}
    title={copied ? (lang === 'zh' ? '已複製！' : 'Copied!') : (lang === 'zh' ? '複製連結' : 'Copy Link')}
    aria-label={copied ? (lang === 'zh' ? '連結已複製至剪貼板' : 'URL copied to clipboard') : (lang === 'zh' ? '複製連結' : 'Copy Link')}
  >
    <ShareIcon />
  </button>
  {copied && (
    <span className="feature-copied-label" aria-live="polite">
      {lang === 'zh' ? '已複製！' : 'Copied!'}
    </span>
  )}
</div>
```

---

### 4. 收藏 / 取消收藏 (Favorite / Unfavorite)

**規則：** 使用 `WatchlistContext` 的 `toggleFavorite`，金色實心星 = 已收藏，空心星 = 未收藏。

```tsx
import { useWatchlist } from '@/app/contexts/WatchlistContext';

const { favorites, toggleFavorite } = useWatchlist();
const isFav = favorites.has(watchlistId);

<button
  className={`feature-star-btn${isFav ? ' starred' : ''}`}
  onClick={(e) => { e.stopPropagation(); toggleFavorite(watchlistId); }}
  aria-label={isFav
    ? (lang === 'zh' ? '從收藏移除' : 'Remove from favorites')
    : (lang === 'zh' ? '加入收藏' : 'Add to favorites')}
  title={isFav
    ? (lang === 'zh' ? '從收藏移除' : 'Remove from favorites')
    : (lang === 'zh' ? '加入收藏' : 'Add to favorites')}
>
  <StarIcon filled={isFav} />
</button>
```

CSS：
```css
.feature-star-btn { background: none; border: none; cursor: pointer; color: var(--c-text-3); padding: 4px; border-radius: var(--radius-sm); }
.feature-star-btn:hover { color: #f59e0b; }
.feature-star-btn.starred { color: #f59e0b; }
```

---

### 5. 搜尋輸入框 (Search Input)

**規則：** Input 左側固定放 SearchIcon，右側放 CloseIcon（有輸入時才顯示）。

```tsx
const [query, setQuery] = useState('');

<div className="feature-search-bar">
  <span className="feature-search-icon"><SearchIcon /></span>
  <input
    className="feature-search-input"
    type="text"
    placeholder={lang === 'zh' ? '搜尋…' : 'Search…'}
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    aria-label={lang === 'zh' ? '搜尋' : 'Search'}
  />
  {query && (
    <button
      className="feature-search-clear"
      onClick={() => setQuery('')}
      aria-label={lang === 'zh' ? '清除搜尋' : 'Clear search'}
    >
      <CloseIcon />
    </button>
  )}
</div>
```

CSS：
```css
.feature-search-bar { position: relative; display: flex; align-items: center; }
.feature-search-icon { position: absolute; left: 10px; color: var(--c-text-3); pointer-events: none; }
.feature-search-input { width: 100%; padding: 7px 32px 7px 32px; border: 1px solid var(--c-border); border-radius: var(--radius); font-size: 13px; }
.feature-search-input:focus { outline: none; border-color: var(--c-accent); }
.feature-search-clear { position: absolute; right: 8px; background: none; border: none; cursor: pointer; color: var(--c-text-3); padding: 2px; }
```

---

### 6. 篩選器 (Filter Panel)

**規則：** 篩選條件套用後，Filter 按鈕顯示 active 狀態（藍色邊框或背景），並顯示已套用條件數量 badge。

```tsx
const [filterOpen, setFilterOpen] = useState(false);
const activeFilterCount = [selectedCategory, selectedStatus, dateRange].filter(Boolean).length;

<div className="feature-toolbar">
  <button
    className={`feature-filter-btn${activeFilterCount > 0 ? ' active' : ''}`}
    onClick={() => setFilterOpen((v) => !v)}
    aria-label={lang === 'zh' ? '篩選' : 'Filter'}
  >
    <FilterIcon />
    <span>{lang === 'zh' ? '篩選' : 'Filter'}</span>
    {activeFilterCount > 0 && (
      <span className="feature-filter-badge">{activeFilterCount}</span>
    )}
  </button>
</div>

{filterOpen && (
  <div className="feature-filter-panel">
    {/* 篩選選項 */}
    <button className="feature-filter-clear" onClick={handleClearAll}>
      {lang === 'zh' ? '清除全部' : 'Clear All'}
    </button>
  </div>
)}
```

CSS：
```css
.feature-filter-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border: 1px solid var(--c-border); border-radius: var(--radius); background: var(--c-white); font-size: 13px; cursor: pointer; }
.feature-filter-btn.active { border-color: var(--c-accent); color: var(--c-accent); }
.feature-filter-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 16px; height: 16px; border-radius: 8px; background: var(--c-accent); color: var(--c-white); font-size: 10px; font-weight: 600; padding: 0 4px; }
```

---

### 7. 分頁 Tabs (Tab Navigation)

**規則：** 使用 `.cp-nav-tabs` + `.cp-nav-tab` + `.active` 這組既有的全站 class。

```tsx
const TABS = ['overview', 'details', 'history'] as const;
type Tab = typeof TABS[number];
const [activeTab, setActiveTab] = useState<Tab>('overview');

const tabLabels: Record<Tab, { zh: string; en: string }> = {
  overview: { zh: '總覽', en: 'Overview' },
  details:  { zh: '詳情', en: 'Details'  },
  history:  { zh: '歷史', en: 'History'  },
};

<div className="cp-nav-tabs" role="tablist">
  {TABS.map((tab) => (
    <button
      key={tab}
      className={`cp-nav-tab${activeTab === tab ? ' active' : ''}`}
      role="tab"
      aria-selected={activeTab === tab}
      onClick={() => setActiveTab(tab)}
    >
      {tabLabels[tab][lang]}
    </button>
  ))}
</div>

<div role="tabpanel">
  {activeTab === 'overview' && <OverviewSection />}
  {activeTab === 'details'  && <DetailsSection  />}
  {activeTab === 'history'  && <HistorySection  />}
</div>
```

---

### 8. Modal / Dialog

**規則：** 必須包含 backdrop（點擊關閉）、`role="dialog"`、`aria-modal="true"`、`aria-label`，按 Escape 關閉。

```tsx
const [modalOpen, setModalOpen] = useState(false);

// Escape 鍵關閉
useEffect(() => {
  if (!modalOpen) return;
  const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setModalOpen(false); };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [modalOpen]);

// JSX
{modalOpen && (
  <>
    <div className="feature-modal-backdrop" onClick={() => setModalOpen(false)} />
    <div
      className="feature-modal"
      role="dialog"
      aria-modal="true"
      aria-label={lang === 'zh' ? '對話框標題' : 'Dialog Title'}
    >
      <div className="feature-modal-header">
        <h2 className="feature-modal-title">{lang === 'zh' ? '標題' : 'Title'}</h2>
        <button
          className="feature-modal-close"
          onClick={() => setModalOpen(false)}
          aria-label={lang === 'zh' ? '關閉' : 'Close'}
        >
          <CloseIcon />
        </button>
      </div>
      <div className="feature-modal-body">
        {/* 內容 */}
      </div>
    </div>
  </>
)}
```

CSS：
```css
.feature-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 200; }
.feature-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: var(--c-white); border-radius: var(--radius-lg); box-shadow: 0 8px 32px rgba(0,0,0,0.18); z-index: 201; min-width: 360px; max-width: 90vw; max-height: 85vh; overflow-y: auto; }
.feature-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--c-border); }
.feature-modal-title { font-size: 15px; font-weight: 600; color: var(--c-text); margin: 0; }
.feature-modal-close { background: none; border: none; cursor: pointer; color: var(--c-text-3); padding: 4px; border-radius: var(--radius-sm); }
.feature-modal-close:hover { background: var(--c-bg); color: var(--c-text); }
.feature-modal-body { padding: 20px; }
```

---

### 9. 載入狀態 (Loading States)

**頁面級載入（整頁 spinner）：**
```tsx
{isLoading && (
  <div className="feature-loading-wrap" role="status" aria-label={lang === 'zh' ? '載入中' : 'Loading'}>
    <SpinnerIcon size={24} />
    <span className="feature-loading-text">{lang === 'zh' ? '載入中…' : 'Loading…'}</span>
  </div>
)}
```

**按鈕內 inline 載入：**
```tsx
<button className="feature-action-btn" onClick={handleAction} disabled={isLoading}>
  {isLoading ? <SpinnerIcon size={13} /> : <DownloadIcon />}
  <span>{isLoading ? (lang === 'zh' ? '處理中…' : 'Processing…') : (lang === 'zh' ? '下載' : 'Download')}</span>
</button>
```

CSS：
```css
.feature-loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 48px; color: var(--c-text-3); }
.feature-loading-text { font-size: 13px; }
```

---

### 10. 空狀態 (Empty State)

**規則：** 無資料時顯示明確的空狀態訊息，不可留白。

```tsx
{items.length === 0 && !isLoading && (
  <div className="feature-empty-state">
    <p className="feature-empty-msg">
      {lang === 'zh' ? '目前沒有符合條件的資料。' : 'No results match your criteria.'}
    </p>
    {hasActiveFilters && (
      <button className="feature-empty-clear" onClick={handleClearAll}>
        {lang === 'zh' ? '清除篩選條件' : 'Clear filters'}
      </button>
    )}
  </div>
)}
```

CSS：
```css
.feature-empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; color: var(--c-text-3); text-align: center; }
.feature-empty-msg { font-size: 14px; margin: 0; }
.feature-empty-clear { background: none; border: 1px solid var(--c-border); padding: 6px 16px; border-radius: var(--radius); font-size: 13px; cursor: pointer; color: var(--c-text-2); }
.feature-empty-clear:hover { border-color: var(--c-accent); color: var(--c-accent); }
```

---

## 🗂️ 頁面工具列 (Page Toolbar) 標準排列順序

當頁面同時有多個功能按鈕時，依照下列左→右順序排列：

```
[搜尋框]  [篩選器]  [排序]  |  [展開全部/收合全部]  [重新整理]  [下載]
```

- 搜尋、篩選、排序放在**左側**（影響內容呈現）
- 展開全部、重新整理、下載放在**右側**（操作輸出）
- 以 `gap: 8px` 分隔，視覺上區隔用 `|` 分隔線（`border-left: 1px solid var(--c-border); height: 16px; margin: 0 4px;`）

---

## ✅ 開發前自查清單

開始實作新功能前，確認：

- [ ] 我需要的功能圖示是否已在本 Skill 定義？若有，直接複製 SVG 程式碼
- [ ] 互動邏輯（狀態管理）是否遵循本 Skill 的模式？
- [ ] 所有按鈕是否有 `aria-label` 或文字標籤？
- [ ] 所有 UI 文字是否有 `zh` 和 `en` 兩個版本？
- [ ] 功能按鈕的排列順序是否符合工具列標準？
- [ ] 空狀態和載入狀態是否已處理？

---

## 📚 參考實作

| 功能 | 參考檔案 |
|------|----------|
| Expand All / Collapse All | `app/press-release/page.tsx` |
| Download CSV | `app/market-data/financial-data/[symbol]/FinancialDataCompanyContent.tsx` |
| Download PDF (print) | `app/data-explore/[category]/DataCategoryContent.tsx` |
| Download Excel | `app/watchlist/[id]/WatchlistContent.tsx` |
| Copy Link | `app/components/news/NewsCard.tsx` |
| Favorite Star | `app/components/layout/Sidebar.tsx` |
| Search Input | `app/press-release/page.tsx` |
| Filter Panel | `app/company-profile/[symbol]/IRTranscriptTab.tsx` |
| Tab Navigation | `app/my-rmap/supplier/page.tsx` |
| Modal | `app/components/collaboration/CanvasManageModal.tsx` |
| Loading State | `app/press-release/page.tsx` |
