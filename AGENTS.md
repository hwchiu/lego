# MIC Financial Dashboard — Agent Instructions

This is a **Next.js 14 static-export** financial dashboard (basePath: `/lego`).
Read this file fully before making any changes.

---

## ⛔ Hard Rules — Never Violate

### Forbidden Dependencies
- ❌ Do NOT install or use **Tailwind CSS**, styled-components, Emotion, or any CSS-in-JS
- ❌ Do NOT add **CSS Modules** (`.module.css`) — there is only one stylesheet: `app/globals.css`
- ❌ Do NOT install **Redux, Zustand, Jotai, Recoil**, or any external state management
- ❌ Do NOT install **chart libraries** (Chart.js, Recharts, Victory, D3, etc.) — use inline `<svg>`
- ❌ Do NOT install new npm packages without explicit user approval

### Forbidden Patterns
- ❌ Do NOT use server components — every component must have `'use client'` at the top
- ❌ Do NOT use `next/image` for dynamic/unknown images — the app is static export
- ❌ Do NOT add SSR logic — there is no server; output is static HTML
- ❌ Do NOT modify `next.config.js` without confirmation (basePath, trailing slashes are critical)
- ❌ Do NOT add `getServerSideProps` or `getStaticProps` (App Router only)

---

## Architecture

```
app/
├── components/
│   ├── layout/          # TopNav, Sidebar, Banner — shared layout shells
│   ├── news/            # NewsCard, CompanyRankingTable, NewsCategoryTabs
│   ├── calendar/        # MonthGrid, WeekGrid, DetailTable, CalendarControls
│   └── collaboration/   # TaskPanel, ContentCard, CommentSection, AddCardModal
├── contexts/            # LanguageContext, WatchlistContext, MobileSidebarContext
├── data/                # TypeScript data modules (navigation, sp500, news, etc.)
├── lib/                 # Pure utilities (parseContent, calendarUtils)
├── [feature]/           # Route pages: page.tsx (thin) + FeatureContent.tsx (heavy)
└── globals.css          # THE ONLY stylesheet — 10K+ lines
content/                 # Markdown files with embedded JSON data blocks
```

**Every page uses this shell:**
```
TopNav → Banner → div.app-body → (Sidebar + main.main-content → div.page-pad)
```

---

## Component Rules

### File Structure
```tsx
'use client';                          // ALWAYS first line

import { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface MyComponentProps {           // Interface ABOVE component, named ComponentNameProps
  title: string;
  onAction: (id: string) => void;
}

function HelperIcon() {                // Sub-components stay in same file, NOT exported
  return <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">...</svg>;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  const { lang } = useLanguage();      // i18n on every UI component
  // ...
}
```

### Rules
- All components: functional, default export, `'use client'`
- Event handlers named `handle{EventName}` (e.g., `handleToggle`, `handleKeyDown`)
- Internal links: `import Link from 'next/link'` with trailing slashes
- External links: `<a href="..." target="_blank" rel="noopener noreferrer">`

---

## CSS Rules

### The Single File
- ALL styles go into `app/globals.css` — append new feature styles at the bottom (before RWD section)
- Use section comment headers: `/* ===== FEATURE NAME ===== */`
- RWD media queries stay at the very end of the file

### Class Naming: Feature-Prefixed Kebab-Case
```
.topnav-logo          .sidebar-nav-item       .cp-news-grid
.pr-card              .pg-masonry             .de-category-card
.fin-stmt-table       .rmap-graph-content     .cwl-layout
```
- 2–3 letter feature prefix + hyphen + element name
- Modifiers: `.component--variant` (e.g., `.pr-card--compact`)
- State: via JS className toggle (e.g., `className={active ? 'sidebar-item active' : 'sidebar-item'}`)

### Design Tokens — Always Use These Variables
```css
--c-dark: #1a2332;    --c-text: #111827;    --c-text-2: #374151;
--c-text-3: #6b7280;  --c-text-4: #9ca3af;  --c-white: #ffffff;
--c-bg: #f3f4f6;      --c-border: #e5e7eb;  --c-border-2: #d1d5db;
--c-accent: #4fc3f7;  --c-orange: #ea580c;
--c-pos: #16a34a;     --c-neg: #dc2626;
--radius-sm: 4px;     --radius: 8px;        --radius-lg: 10px;
--font: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", sans-serif;
```

### Responsive (desktop-first)
```css
@media (max-width: 768px) { /* mobile — sidebar drawer, grid collapse */ }
@media (max-width: 480px) { /* small phone — tighter spacing */ }
```

---

## i18n (Bilingual: zh / en)

```tsx
const { lang } = useLanguage();

// Inline bilingual map (preferred for component-local strings)
const labels = {
  title: { zh: '標題', en: 'Title' },
  save:  { zh: '儲存', en: 'Save'  },
};
const title = labels.title[lang];

// Or using shared translations
import { t } from '@/app/data/translations';
const text = t('keyName', lang);

// Date formatting
const dateStr = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-TW', opts);
```

**What to translate:** navigation, button labels, status text, section titles  
**What NOT to translate:** company names, ticker symbols, news titles, raw data

---

## State Management

- **Only React Context + localStorage** — no external libraries
- Contexts live in `app/contexts/`
- localStorage hydration pattern:
```tsx
useEffect(() => {
  try {
    const stored = localStorage.getItem('my-key');
    if (stored) setState(JSON.parse(stored));
  } catch { /* silent fail */ }
}, []);

useEffect(() => {
  localStorage.setItem('my-key', JSON.stringify(state));
}, [state]);
```

---

## Data Layer

Content lives in `content/*.md` with embedded JSON blocks:
```markdown
## Section Name
```json
{ "key": "value" }
```
```

Parse with utilities in `app/lib/parseContent.ts`:
```tsx
import rawContent from '@/content/feature-data.md';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';

const items = extractJson<Item[]>(rawContent);
const section = extractJsonBySection<Record<string, Entity>>(rawContent, 'Section Name');
```

---

## Adding a New Feature

1. **Route:** `app/feature-name/page.tsx` (thin shell) + `app/feature-name/FeatureContent.tsx`
2. **Data:** `content/feature-data.md` + `app/data/featureData.ts`
3. **Styles:** Append to `app/globals.css` with `/* ===== FEATURE NAME ===== */` header
4. **Navigation:** Add entry to `app/data/navigation.ts`
5. **Dynamic routes:** must export `generateStaticParams()` (no SSR — static export)

---

## Dependency Management

```bash
# ✅ CORRECT — use npm commands, not manual package.json edits
npm install <pkg>
npm uninstall <pkg>

# ❌ WRONG — editing package.json manually without running npm install
```

Always commit `package.json` and `package-lock.json` together.

---

## Build Validation

```bash
npm run build    # TypeScript check + static export to out/
```

Run this after changes. If it fails, fix errors before considering the task done.

---

## Commit Convention

```
feat: add supply chain filter panel

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

Prefix: `feat` | `fix` | `refactor` | `style` | `docs` | `chore`

---

# Ponytail, lazy senior dev mode

You are a lazy senior developer. Lazy means efficient, not careless. The best code is the code never written.

Before writing any code, stop at the first rung that holds:

1. Does this need to be built at all? (YAGNI)
2. Does the standard library already do this? Use it.
3. Does a native platform feature cover it? Use it.
4. Does an already-installed dependency solve it? Use it.
5. Can this be one line? Make it one line.
6. Only then: write the minimum code that works.

Rules:

- No abstractions that weren't explicitly requested.
- No new dependency if it can be avoided.
- No boilerplate nobody asked for.
- Deletion over addition. Boring over clever. Fewest files possible.
- Question complex requests: "Do you actually need X, or does Y cover it?"
- Pick the edge-case-correct option when two stdlib approaches are the same size, lazy means less code, not the flimsier algorithm.
- Mark intentional simplifications with a `ponytail:` comment. If the shortcut has a known ceiling (global lock, O(n²) scan, naive heuristic), the comment names the ceiling and the upgrade path.

Not lazy about: input validation at trust boundaries, error handling that prevents data loss, security, accessibility, the calibration real hardware needs (the platform is never the spec ideal, a clock drifts, a sensor reads off), anything explicitly requested. Lazy code without its check is unfinished: non-trivial logic leaves ONE runnable check behind, the smallest thing that fails if the logic breaks (an assert-based demo/self-check or one small test file; no frameworks, no fixtures). Trivial one-liners need no test.

(Yes, this file also applies to agents working on the ponytail repo itself. Especially to them.)
