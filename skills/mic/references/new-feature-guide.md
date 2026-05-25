# 新功能開發流程

在 MIC 中新增一個完整功能頁面的端對端步驟。

## 開發前 Checklist

- [ ] 確認功能的 prefix（2–3 字母，如 `fn-`）
- [ ] 確認是否需要動態路由（`[param]`）
- [ ] 確認資料來源（Markdown? TypeScript 常數?）
- [ ] 確認是否需要雙語（zh/en）支援

---

## Step 1：建立路由頁面

### 靜態路由

```
app/feature-name/
  ├── page.tsx              # 薄包裝層（metadata + 匯入）
  └── FeatureContent.tsx    # 功能主體（'use client'）
```

**`page.tsx` 模板：**

```tsx
// app/feature-name/page.tsx
import FeatureContent from './FeatureContent';

export const metadata = {
  title: 'Feature Name | MIC',
};

export default function Page() {
  return <FeatureContent />;
}
```

**`FeatureContent.tsx` 模板：**

```tsx
'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getAllFeatureData, type FeatureItem } from '@/app/data/featureData';

export default function FeatureContent() {
  const { lang } = useLanguage();
  const [filter, setFilter] = useState('all');
  const allData = useMemo(() => getAllFeatureData(), []);
  const filtered = useMemo(
    () => allData.filter(item => filter === 'all' || item.category === filter),
    [allData, filter]
  );

  return (
    <div className="fn-container">
      {/* ... */}
    </div>
  );
}
```

### 動態路由

```
app/feature-name/[param]/
  ├── page.tsx              # 含 generateStaticParams()
  └── FeatureDetailContent.tsx
```

```tsx
// page.tsx（動態路由）
import { getItems } from '@/app/data/featureData';
import FeatureDetailContent from './FeatureDetailContent';

export function generateStaticParams() {
  return getItems().map(item => ({ param: item.id }));  // 必填！
}

export default function Page({ params }: { params: { param: string } }) {
  return <FeatureDetailContent id={params.param} />;
}
```

---

## Step 2：建立資料層

### 資料檔案

```
content/feature-data.md     # Markdown + 嵌入式 JSON
app/data/featureData.ts     # 類型 + 常數 + 解析工具
```

**`content/feature-data.md`：**

```markdown
# Feature Data

## Items
```json
[
  { "id": "1", "title": "項目一", "titleEn": "Item One", "category": "type-a" },
  { "id": "2", "title": "項目二", "titleEn": "Item Two", "category": "type-b" }
]
```​
```

**`app/data/featureData.ts`：**

```tsx
import rawContent from '@/content/feature-data.md';
import { extractJson } from '@/app/lib/parseContent';

export interface FeatureItem {
  id: string;
  title: string;
  titleEn: string;
  category: string;
}

export const FEATURE_CATEGORIES = [
  { id: 'all', zh: '全部', en: 'All' },
  { id: 'type-a', zh: '類型 A', en: 'Type A' },
  { id: 'type-b', zh: '類型 B', en: 'Type B' },
] as const;

let _cache: FeatureItem[] | null = null;
export function getAllFeatureData(): FeatureItem[] {
  if (_cache) return _cache;
  _cache = extractJson<FeatureItem[]>(rawContent);
  return _cache;
}
```

---

## Step 3：新增樣式

在 `app/globals.css` 中，找到最後一個功能區塊之後、`@media` 響應式區塊之前插入：

```css
/* ===== FEATURE NAME ===== */

.fn-container {
  /* 頁面容器 */
}

.fn-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.fn-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
}

.fn-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.fn-card {
  background: var(--c-white);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 20px 22px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.fn-card:hover {
  border-color: var(--c-border-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
```

然後在末端的 `@media` 區塊加入響應式覆寫：

```css
/* 在 globals.css 末端 */

@media (max-width: 768px) {
  .fn-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .fn-card {
    padding: 12px 14px;
  }
}
```

---

## Step 4：更新導覽

在 `app/data/navigation.ts` 加入新路由：

```tsx
export const navItems: NavItem[] = [
  // ... existing items ...
  {
    label: '功能名稱',
    labelEn: 'Feature Name',
    href: '/feature-name/',
    icon: 'featureIcon',        // 需要在 sidebarIcons 中加入對應 icon
    section: '分析工具',         // 可選：分組標題
    // badge: 'NEW',            // 可選：'NEW' | 'SOON'
  },
];
```

**新增 SVG icon：**

```tsx
export const sidebarIcons: Record<string, string> = {
  // ... existing icons ...
  featureIcon: '<path d="..." stroke="currentColor" strokeWidth="1.3" fill="none"/>',
};
```

Icon 規格：
- ViewBox `0 0 14 14`，stroke-based，`strokeWidth="1.3"`
- 使用 stroke-based 風格（不填充）
- 從 Heroicons / Lucide 轉換，縮放到 14×14 尺寸

---

## Step 5：TypeScript 類型確認

確認以下項目：
- [ ] 所有 interface/type 定義在 `app/data/featureData.ts`
- [ ] 無 `any` 類型（strict mode 開啟）
- [ ] 無未使用的 import（`noUnusedLocals`）
- [ ] Props interface 命名為 `ComponentNameProps`

---

## Step 6：建置驗證

```bash
npm run build
```

常見建置錯誤與修法：

| 錯誤 | 原因 | 修法 |
|------|------|------|
| `generateStaticParams is not defined` | 動態路由缺少靜態參數 | 加入 `export function generateStaticParams()` |
| `cannot find module '@/content/xxx.md'` | 路徑錯誤 | 確認 content 目錄中有對應 .md 檔 |
| TypeScript 類型錯誤 | 類型不符 | 修正 interface 或加入 type assertion |
| `useRouter` is not defined | 忘記加 `'use client'` | 加入 `'use client'` directive |

---

## Step 7：Commit

```
[feat]: add feature-name page with data layer and responsive layout

- Add app/feature-name/ route with static data
- Add content/feature-data.md and app/data/featureData.ts
- Add fn- CSS classes with 768px responsive override

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## 進階：雙欄佈局頁面

```tsx
// 左欄列表 + 右欄詳情（Company Profile 模式）
<div className="fn-layout">
  <aside className="fn-sidebar">
    {items.map(item => (
      <div key={item.id}
           className={`fn-list-item ${selected?.id === item.id ? 'active' : ''}`}
           onClick={() => setSelected(item)}>
        {lang === 'zh' ? item.title : item.titleEn}
      </div>
    ))}
  </aside>
  <main className="fn-detail">
    {selected ? <DetailView item={selected} /> : <EmptyState />}
  </main>
</div>
```

```css
.fn-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  min-height: 500px;
}
@media (max-width: 900px) {
  .fn-layout {
    grid-template-columns: 1fr;
  }
}
```

---

## 進階：Search + Filter 模式

```tsx
function FeatureContent() {
  const { lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const allData = useMemo(() => getAllFeatureData(), []);

  const filtered = useMemo(() => {
    let result = allData;
    if (category !== 'all') result = result.filter(d => d.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.titleEn.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allData, category, search]);

  return (
    <>
      <div className="fn-filter-bar">
        <div className="fn-search-wrap">
          <input className="fn-search-input"
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 placeholder={lang === 'zh' ? '搜尋...' : 'Search...'} />
        </div>
        <div className="fn-category-group">
          {FEATURE_CATEGORIES.map(cat => (
            <button key={cat.id}
                    className={`fn-toggle-btn ${category === cat.id ? 'active' : ''}`}
                    onClick={() => setCategory(cat.id)}>
              {lang === 'zh' ? cat.zh : cat.en}
            </button>
          ))}
        </div>
      </div>
      <div className="fn-grid">
        {filtered.map(item => <FeatureCard key={item.id} item={item} />)}
      </div>
    </>
  );
}
```
