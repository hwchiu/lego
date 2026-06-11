# Copilot Instructions

MIC 金融資訊儀表板 (lego)。Next.js 14 靜態輸出，呈現台灣及全球金融市場資訊，包含股票、財務報表、新聞、供應鏈、日曆等功能。所有使用者介面文字支援**繁體中文 (zh)** 與**英文 (en)** 雙語切換。

## Commands

### Frontend (Next.js)
```bash
npm run dev          # Dev server (http://localhost:3000/lego)
npm run build        # TypeScript check + static export to out/
npm run fetch-data   # Fetch live stock data → content/*.md
npx next lint        # ESLint
# Run tests (requires npm run build first):
node --test tests/static-export-company-profile-links.test.mjs
```

### Backend (Spring Boot — `backend/`)
```bash
mvn spring-boot:run  # Dev server (http://localhost:8080)
mvn test             # Unit tests
mvn package -DskipTests  # Build JAR
```

### Earnings Agents (`broadcom-earnings-agent/`, `dell-earnings-agent/`)
```bash
npm run dev          # Development with ts-node
npm run build        # Compile to dist/
npm start            # Production
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
├── [feature]/           # Route pages (page.tsx thin shell + FeatureContent.tsx)
└── globals.css          # THE ONLY stylesheet — 10K+ lines
content/                 # Markdown files with embedded JSON data blocks
backend/                 # Spring Boot 3 + Elasticsearch (Java 21, DDD, Maven)
broadcom-earnings-agent/ # TypeScript Express agent — monitors Broadcom earnings via Anthropic AI
dell-earnings-agent/     # TypeScript Express agent — monitors Dell earnings via Anthropic AI
```

**Page shell:** `TopNav → Banner → div.app-body → (Sidebar + main.main-content → div.page-pad)`

## ⛔ Hard Rules

- ❌ No Tailwind, CSS Modules, styled-components, or CSS-in-JS — `globals.css` only
- ❌ No Redux, Zustand, Jotai, or any external state library
- ❌ No chart libraries (Chart.js, Recharts, D3, etc.) — use inline `<svg>`
- ❌ No server components — every component must start with `'use client'`
- ❌ No `next/image` for dynamic/unknown images — static export only
- ❌ No SSR logic (`getServerSideProps`, `getStaticProps`) — App Router only
- ❌ Do not modify `next.config.js` without confirmation (basePath + trailing slashes are critical)
- ❌ Do not install new npm packages without explicit user approval

## Key Conventions

- **CSS:** Single `globals.css`, vanilla CSS, CSS variables only; append new feature styles before RWD section; use `/* ===== FEATURE NAME ===== */` section headers
- **Class naming:** Feature-prefixed kebab-case (`.cp-card`, `.de-panel`, `.pr-timeline`); modifiers as `--variant` (`.pr-card--compact`)
- **Components:** `'use client'` first line, default export, `interface ComponentNameProps` defined above the component; event handlers named `handle{EventName}`
- **State:** React Context + localStorage — no external libraries; contexts in `app/contexts/`
- **i18n:** `useLanguage()` → `{ lang }` → `'zh'` / `'en'`; inline bilingual map preferred (`{ zh: '...', en: '...' }[lang]`); translate UI labels, not company names/tickers/raw data
- **Icons:** Inline SVG `viewBox="0 0 14 14"`, stroke-based, stored as path strings in `navigation.ts`
- **Charts:** Inline `<svg>` — no charting libraries
- **Deploy:** `basePath: '/lego'`, static export (`output: 'export'`), trailing slashes; dynamic routes must export `generateStaticParams()`
- **Internal links:** `import Link from 'next/link'` with trailing slashes; **external links:** `<a target="_blank" rel="noopener noreferrer">`
- **Commits:** `feat|fix|refactor|style|docs|chore: description`

## Data Layer

Content lives in `content/*.md` with embedded JSON blocks; parse with `app/lib/parseContent.ts`:
```tsx
import rawContent from '@/content/feature-data.md';
import { extractJson, extractJsonBySection } from '@/app/lib/parseContent';
const items = extractJson<Item[]>(rawContent);
const section = extractJsonBySection<Record<string, Entity>>(rawContent, 'Section Name');
```

## Backend — Spring Boot + Elasticsearch

DDD layering in `backend/src/main/java/com/mic/search/`:
- `domain/` — `SearchDocument` model, repository interface
- `application/` — `SearchIndexService` (use-case layer)
- `infrastructure/elasticsearch/` — Spring Data ES repository impl, config, data initializer
- `interfaces/rest/` — `SearchController` (`POST /api/v1/search/index`, `GET /api/v1/search`)

`SearchDocument` uses ngram analyzer for fuzzy search across `coCd`, `companyName`, `title`, `content`.

## Earnings Agents

Both agents follow the same pattern (TypeScript + Express + Anthropic SDK):
- `aiClient.ts` — Anthropic API wrapper
- `claudeTranscriptSummarizer.ts` / `claudeParser.ts` — AI parsing logic
- `*IRFetcher.ts` — scrapes IR page for earnings transcripts
- `eventDateResolver.ts` — resolves earnings event date
- `scheduler.ts` — polling scheduler
- `dataStore.ts` — in-memory state
- `index.ts` — Express server; `GET /api/earnings`, `GET /api/health`

Requires `ANTHROPIC_API_KEY` in `.env`.

## Adding a New Feature

1. **Route:** `app/feature-name/page.tsx` (thin shell) + `app/feature-name/FeatureContent.tsx`
2. **Data:** `content/feature-data.md` + `app/data/featureData.ts`
3. **Styles:** Append to `app/globals.css` with `/* ===== FEATURE NAME ===== */` header
4. **Navigation:** Add entry to `app/data/navigation.ts`
5. Run `npm run build` to validate

## Design Tokens

```css
--c-dark: #1a2332;    --c-text: #111827;    --c-text-2: #374151;
--c-text-3: #6b7280;  --c-text-4: #9ca3af;  --c-white: #ffffff;
--c-bg: #f3f4f6;      --c-border: #e5e7eb;  --c-border-2: #d1d5db;
--c-accent: #4fc3f7;  --c-orange: #ea580c;
--c-pos: #16a34a;     --c-neg: #dc2626;
--radius-sm: 4px;     --radius: 8px;        --radius-lg: 10px;
```

## Skills

This project uses **Superpowers skills** in `.github/skills/`. Key skills:

| Skill | When to use |
|-------|-------------|
| `mic-development` | Component patterns, CSS, data layer, routing, RWD |
| `mic-ui-style` | Design tokens, colors, typography, shadows, animations |
| `mic-page-interactions` | Expand/collapse, search, filter, tabs, modal, loading, empty state |
| `brainstorming` | Before any new feature implementation |
| `writing-plans` | Multi-step tasks requiring a plan |
| `systematic-debugging` | Any bug or unexpected behavior |
| `verification-before-completion` | Before claiming work is done |
