---
name: tmic-development
description: Use when building features, fixing bugs, adding pages, or modifying UI in the tMIC (lego) project. Covers component structure, CSS conventions, data layer patterns, i18n, routing, and responsive design for this Next.js static-export financial dashboard.
---

# tMIC Development Conventions

Comprehensive coding conventions and patterns for the tMIC financial dashboard — extracted from 65+ Copilot agent PRs and codebase analysis.

## Architecture Overview

```
app/
├── components/
│   ├── layout/          # TopNav, Sidebar, Banner (shared across all pages)
│   ├── news/            # NewsCard, CompanyRankingTable, NewsCategoryTabs
│   ├── calendar/        # MonthGrid, WeekGrid, DetailTable, CalendarControls
│   └── collaboration/   # TaskPanel, ContentCard, CommentSection, AddCardModal
├── contexts/            # LanguageContext, WatchlistContext, MobileSidebarContext
├── data/                # TypeScript data modules (navigation, sp500, news, etc.)
├── lib/                 # Pure utilities (parseContent, calendarUtils)
├── [feature]/           # Route pages (page.tsx + FeatureContent.tsx)
└── globals.css          # Single global stylesheet (10K+ lines)

content/                 # Markdown files with embedded JSON data blocks
```

**Page shell (every page):**
```
TopNav → Banner → div.app-body → (Sidebar + main.main-content → div.page-pad)
```

## Component Conventions

### Structure
- **All components:** `'use client'` directive, functional, default export
- **Props:** TypeScript interface defined directly above component, named `ComponentNameProps`
- **Sub-components:** Private functions in the same file (not exported)
- **Icon components:** `function IconName()` returning inline `<svg>` with `aria-hidden="true"`

```tsx
'use client';

import { useState, useCallback } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface FeatureCardProps {
  title: string;
  onAction: (id: string) => void;
}

function StarIcon({ filled }: { filled: boolean }) {
  return <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">...</svg>;
}

export default function FeatureCard({ title, onAction }: FeatureCardProps) {
  const { lang } = useLanguage();
  const [active, setActive] = useState(false);
  // ...
}
```

### Hooks Usage
| Hook | Usage |
|------|-------|
| `useState` | Local UI state (modals, toggles, filters, form inputs) |
| `useCallback` | Memoized event handlers |
| `useMemo` | Computed/filtered lists |
| `useRef` | DOM references (textarea, drag tracking, timers) |
| `useEffect` | Side effects with cleanup (click-outside, scroll, localStorage sync) |

### Context Hooks
- `useLanguage()` → `{ lang, toggleLang }` — zh/en toggle
- `useWatchlist()` → `{ watchlistNames, favorites, toggleFavorite, addWatchlist }`
- `useMobileSidebar()` → `{ isMobileOpen, toggleSidebar, closeSidebar }`

### Event Handler Naming
- Pattern: `handle{EventName}` (e.g., `handleCopyLink`, `handleKeyDown`, `handleToggleFavorite`)

### Navigation
- **Internal links:** `import Link from 'next/link'` with trailing slashes
- **Programmatic:** `useRouter()` → `router.push('/path/')`
- **External:** `<a href="..." target="_blank" rel="noopener noreferrer">`

## CSS Conventions

### Single File: `app/globals.css`
- **No CSS-in-JS, no Tailwind, no CSS modules** — vanilla CSS only
- Organized by feature with comment headers: `/* ===== FEATURE NAME ===== */`
- New feature styles appended in order; RWD styles at the very end

### Design Tokens
```css
:root {
  /* Colors */
  --c-dark: #1a2332;        --c-text: #111827;
  --c-dark-2: #111827;      --c-text-2: #374151;
  --c-white: #ffffff;       --c-text-3: #6b7280;
  --c-bg: #f3f4f6;          --c-text-4: #9ca3af;
  --c-border: #e5e7eb;      --c-orange: #ea580c;
  --c-border-2: #d1d5db;    --c-pos: #16a34a;
  --c-accent: #4fc3f7;      --c-neg: #dc2626;

  /* Radius */
  --radius-sm: 4px;  --radius: 8px;  --radius-lg: 10px;

  /* Font */
  --font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
}
```

### Class Naming: Feature-Prefixed Kebab-Case
Each feature uses a 2-3 letter prefix, then hyphen-separated component/element names:

| Feature | Prefix | Examples |
|---------|--------|----------|
| TopNav | `topnav-` | `.topnav-logo`, `.topnav-search-wrap`, `.topnav-action-btn` |
| Sidebar | `sidebar-` | `.sidebar-nav-item`, `.sidebar-toggle-btn`, `.sidebar-section-label` |
| Company Profile | `cp-` | `.cp-news-grid`, `.cp-landing`, `.cp-search-box` |
| Press Release | `pr-` | `.pr-card`, `.pr-card--compact`, `.pr-timeline-layout` |
| Collaboration | `pg-` | `.pg-card`, `.pg-masonry`, `.pg-mention-tag` |
| Data Explore | `de-` | `.de-category-card`, `.de-hero-search`, `.de-tag` |
| Financial Stmt | `fin-stmt-` | `.fin-stmt-table`, `.fin-stmt-sidebar`, `.fin-stmt-neg` |
| Supply Chain | `rmap-` | `.rmap-graph-content`, `.rmap-feed-panel` |
| M&A | `aapl-ma-` | `.aapl-ma-table`, `.aapl-ma-filter-bar` |
| Watchlist Create | `cwl-` | `.cwl-layout`, `.cwl-symbol-item`, `.cwl-submit-btn` |

**Modifiers:** `.component--variant` (e.g., `.pr-card--compact`, `.topnav-action-btn--icon-only`)
**State:** Applied via JS className (e.g., `className={active ? 'active' : ''}`)

### Typography Scale
- 9–9.5px: Labels, eyebrows (`font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase`)
- 11–12px: Secondary text, table cells
- 12.5–13px: Body text, nav items
- 13.5px: Search input, user name
- 15–18px: Section titles
- 21px: Logo

### Transitions
- Duration: `0.12s–0.22s` (mostly `0.15s`)
- Properties: `background`, `color`, `border-color`, `opacity`
- Sidebar collapse: `width 0.22s ease, min-width 0.22s ease`
- Mobile drawer: `left 0.28s cubic-bezier(0.4, 0, 0.2, 1)`

### Responsive Breakpoints
```css
/* Desktop-first approach, media queries at end of globals.css */
@media (max-width: 768px) { /* Tablet/phone — sidebar drawer, grid collapse */ }
@media (max-width: 480px) { /* Small phone — tighter spacing, icon-only buttons */ }
```

**Additional content-specific breakpoints:** 1400px, 1100px, 900px, 860px, 700px (for grids).

### Mobile Sidebar Pattern
- `MobileSidebarContext` manages open/close state
- Sidebar: `position: fixed; left: -260px` → `left: 0` on `.mobile-open`
- Overlay: `.sidebar-overlay` with `rgba(0,0,0,0.45)` backdrop
- Auto-close on route change via `useEffect` on `pathname`
- Hide desktop collapse toggle; always show expanded nav on mobile

## Data Layer

### Data Sources (Markdown + JSON)
Content lives in `content/*.md` with embedded JSON:

```markdown
## Entity Data
```json
{
  "TSM": { "shares": 120, "cost": 105.3 },
  "AAPL": { "shares": 45, "cost": 167.8 }
}
```​
```

### Parsing Utilities (`app/lib/parseContent.ts`)
```tsx
import rawContent from '@/content/feature-data.md';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';

// Single JSON block
const items: Item[] = extractJson<Item[]>(rawContent);

// Multi-section file
const entities = extractJsonBySection<Record<string, Entity>>(rawContent, 'Entity Data');
```

### Data Module Pattern (`app/data/*.ts`)
Types + constants + utility functions co-located:
```tsx
export interface DataItem { id: string; title: string; category: string; }
export const CATEGORIES: Category[] = [/* ... */];
export function getDataByCategory(id: string): DataItem[] { /* parse markdown */ }
```

### SVG Icon Storage
Navigation icons stored in `app/data/navigation.ts` as SVG path strings:
```tsx
export const sidebarIcons: Record<string, string> = {
  home: '<path d="M7 1L1 6v7h4V9h4v4h4V6L7 1Z" stroke="currentColor" strokeWidth="1.3"/>',
};

// Rendered with dangerouslySetInnerHTML:
<svg viewBox="0 0 14 14" fill="none" dangerouslySetInnerHTML={{ __html: sidebarIcons[key] }} />
```

### Inline SVG Charts
Charts are rendered as inline `<svg>` — no external charting libraries:
```tsx
function BarChart({ data }: { data: ChartBar[] }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <svg viewBox="0 0 320 120" width="100%">
      {data.map((d, i) => <rect ... fill="#4fc3f7" />)}
    </svg>
  );
}
```

## Internationalization (i18n)

- Two languages: `'zh'` (Traditional Chinese) | `'en'`
- Translations in `app/data/translations.ts` as `Record<string, { zh: string; en: string }>`
- Helper function: `t(key, lang)` returns translated string
- Per-component bilingual maps for feature-specific labels
- **What IS translated:** Navigation, button labels, status/priority, section titles
- **What is NOT translated:** Company names, symbols, news titles, code

```tsx
const { lang } = useLanguage();
const label = lang === 'zh' ? '主要導覽' : 'Main Navigation';
const dateStr = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', opts);
```

## State Management

- **React Context API only** — no Redux, Zustand, or external state
- **localStorage persistence** with hydration pattern:

```tsx
// Load on mount
useEffect(() => {
  try {
    const stored = localStorage.getItem('key');
    if (stored) setState(prev => ({ ...prev, ...JSON.parse(stored) }));
  } catch { /* silent fail */ }
}, []);

// Persist on change
useEffect(() => {
  localStorage.setItem('key', JSON.stringify(state));
}, [state]);
```

### ID Generation
```tsx
const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? `prefix-${crypto.randomUUID()}`
  : `prefix-${Date.now()}-${Math.random().toString(36).slice(2)}`;
```

## Adding a New Feature

### 1. Create Route
```
app/feature-name/
  ├── page.tsx              # Thin wrapper
  └── FeatureContent.tsx    # Heavy lifting ('use client')
```

For dynamic routes: `app/feature-name/[param]/page.tsx` with `generateStaticParams()`

### 2. Add Data
```
content/feature-data.md     # Markdown with JSON blocks
app/data/featureData.ts     # Types, constants, parser
```

### 3. Add Styles
Append to `app/globals.css` with section comment:
```css
/* ===== FEATURE NAME ===== */
.fn-container { /* ... */ }
.fn-card { /* ... */ }
```

### 4. Update Navigation
Add entry to `app/data/navigation.ts`:
```tsx
{ label: 'Feature Name', href: '/feature-name', icon: 'iconKey', badge: 'NEW' }
```

## Build & Deploy

```bash
npm run build        # TypeScript check + static export to out/
```

- **Output:** Static HTML (`output: 'export'`)
- **Base path:** `/lego` (all asset refs use `/lego/` prefix)
- **Trailing slashes:** Enabled
- **No SSR** — all pages prerendered at build time
- **Static params:** Dynamic routes must export `generateStaticParams()`

## Commit Message Convention

```
[feat|fix|refactor]: descriptive title (present tense)

Optional detailed explanation.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

## Common Patterns from Bug Fixes

| Issue | Root Cause | Fix Pattern |
|-------|-----------|-------------|
| CSS override not working | Later same-specificity rule wins | Check globals.css order; move critical rules later |
| `position: fixed` broken inside component | Parent has `transform` (creates containing block) | Remove transform; use `box-shadow` for visual lift |
| Mobile overflow | `overflow: hidden` + no wrap | Set `overflow: visible` + `flex-wrap: wrap` on mobile |
| Table overflow on mobile | Fixed column layout | Wrap in `overflow-x: auto` container |
| Filter bar overflow on mobile | Horizontal scroll pattern | Replace with `flex-wrap: wrap` at ≤768px |

## Security & Validation

- **URL validation:** `new URL(url)` → check `protocol === 'http:' || 'https:'`
- **File size:** Enforce `MAX_SIZE = 5 * 1024 * 1024` (5MB)
- **Image data URI:** Verify `result.startsWith('data:image/')`
- **@Mentions:** Build regex from known member names only (no wildcards)

## Quick Reference

| Aspect | Convention |
|--------|-----------|
| **Framework** | Next.js 14, React 18, TypeScript, static export |
| **CSS** | Single `globals.css`, CSS variables, BEM-like prefixes |
| **Data** | Markdown → JSON extraction, TypeScript data modules |
| **State** | React Context + localStorage, no external state libraries |
| **Icons** | Inline SVGs (14×14 viewBox), stored as path strings |
| **Charts** | Inline `<svg>`, no charting libraries |
| **i18n** | `useLanguage()` context, `t()` helper, zh/en |
| **Routing** | App Router, `[param]` dynamic, `generateStaticParams()` |
| **RWD** | Desktop-first, ≤768px tablet, ≤480px phone |
| **Testing** | `npm run build` (static prerender catches errors) |
| **Deploy** | `basePath: '/lego'`, trailing slashes, Nginx/static |
