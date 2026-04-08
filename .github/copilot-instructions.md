# Copilot Instructions

MIC 金融資訊儀表板 (lego)。Next.js 14 靜態輸出，呈現台灣及全球金融市場資訊，包含股票、財務報表、新聞、供應鏈、日曆等功能。所有使用者介面文字支援**繁體中文 (zh)** 與**英文 (en)** 雙語切換。

## Commands

```bash
npm run dev          # Dev server (http://localhost:3000/lego)
npm run build        # TypeScript check + static export to out/
npm run lint         # ESLint
```

## Architecture

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

**Page shell:** `TopNav → Banner → div.app-body → (Sidebar + main.main-content → div.page-pad)`

## Key Conventions

- **CSS:** Single `globals.css`, vanilla CSS, CSS variables only — no Tailwind, no CSS Modules
- **Class naming:** Feature-prefixed kebab-case (`.cp-card`, `.de-panel`, `.pr-timeline`)
- **Components:** `'use client'`, default export, `interface ComponentNameProps` above component
- **State:** React Context + localStorage — no Redux/Zustand
- **i18n:** `useLanguage()` → `{ lang }` → `'zh'` / `'en'`
- **Icons:** Inline SVG `viewBox="0 0 14 14"`, stroke-based, stored as path strings in `navigation.ts`
- **Charts:** Inline `<svg>` — no charting libraries
- **Deploy:** `basePath: '/lego'`, static export (`output: 'export'`), trailing slashes

## Design Tokens

```css
--c-dark: #1a2332;    --c-text: #111827;    --c-white: #ffffff;
--c-bg: #f3f4f6;      --c-accent: #4fc3f7;  --c-orange: #ea580c;
--c-pos: #16a34a;     --c-neg: #dc2626;     --c-border: #e5e7eb;
--radius-sm: 4px;     --radius: 8px;        --radius-lg: 10px;
```

## Skills

This project uses **Superpowers skills** in `.github/skills/`. Key skills:

| Skill | When to use |
|-------|-------------|
| `mic-development` | Component patterns, CSS, data layer, routing, RWD |
| `mic-ui-style` | Design tokens, colors, typography, shadows, animations |
| `brainstorming` | Before any new feature implementation |
| `writing-plans` | Multi-step tasks requiring a plan |
| `systematic-debugging` | Any bug or unexpected behavior |
| `verification-before-completion` | Before claiming work is done |
