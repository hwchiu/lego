# Expert Report Page — Design Spec

**Date:** 2026-06-11  
**Status:** Approved  
**Author:** hwchiu (via Copilot CLI brainstorming)

---

## Overview

A new page in the `/lego` financial dashboard that gives users a big-picture view of analyst expert reports. Users can search and browse reports, preview metadata and a PDF preview, request access to locked reports, and view their purchased reports in a personal library.

This is a frontend-only implementation with static mock data. The data service layer is designed as a swappable interface to allow future Spring Boot API integration without frontend changes.

---

## Page Entry Point

- **URL:** `/lego/expert-report/`
- **Sidebar nav label:** `Expert Report`
- **Sidebar icon:** `report` (already defined in `app/data/navigation.ts` sidebarIcons)
- Added as a new `NavItem` in the navigation data

---

## Two-Mode Toggle

The page has a **persistent top toggle** that switches between two modes. The toggle sits in the page header bar, right-aligned.

```
[📊 Dashboard]  [📚 My Library (7)]
```

- Switching modes does **not** reset search state in Dashboard
- Library badge shows count of owned reports
- Active mode has white background + blue text; inactive is grey text

---

## Mode 1: Dashboard (Browse & Discover)

### Layout

Horizontal split: **40% card list (left) / 60% PDF preview panel (right)**.

- Card list is independently scrollable
- PDF panel is sticky (does not scroll with cards)
- When no card is selected, PDF panel shows an empty state prompt: *"Select a report to preview"*

### Search Bar

Sits above the card list, spanning the full page width (not just the 40% panel).

Two filter inputs + action buttons:
- **Company** — free-text input (accepts ticker or name, e.g. `NVDA`, `TSMC`)
- **Contributor** — free-text input (analyst name)
- **Search** button — filters the card list
- **Reset** button — clears filters, shows all reports
- **Result count** — e.g. `127 reports` shown to the right

Filtering is client-side against the mock data array.

### Report Cards (Style B — Rich)

Each card displays:

| Field | Notes |
|---|---|
| Company ticker badge | Coloured pill, e.g. `NVDA` |
| Date | Right-aligned, `Mon DD, YYYY` |
| Title | Bold, max 2 lines, truncated with ellipsis |
| Excerpt | 1–2 line description preview, grey text |
| Contributor avatar | 14×14 circle placeholder + name |
| Download count | `↓ 342` |
| Comment count | `💬 18` |
| Save button | Toggles saved state; saved = blue fill |
| Share button | Copies report URL to clipboard |

Card click (on body, not action buttons) selects the card and loads its PDF in the right panel.

#### Access States

| State | Visual | Action |
|---|---|---|
| `owned` | Normal card, no lock | Click opens PDF preview |
| `locked` | 🔒 badge next to ticker, excerpt replaced with *"Preview locked · Request access to read full report"*, faded | **Request Access** button (outline blue) |
| `pending` | ⏳ `Pending` badge, yellow border tint | **Pending...** button (disabled, grey) |

Selected card has blue border (`1.5px solid #4a6cf7`) and light blue background (`#f8f9ff`).

### PDF Preview Panel (Dashboard)

- Header bar: report title + company ticker + `Preview` label
- Body: `<iframe>` pointing to `report.previewPdfUrl`
- If report is `locked` or `pending` and card is clicked: show a blurred/overlay state with lock icon and CTA to request access
- Empty state (no card selected): centred message *"Select a report to preview"*

---

## Mode 2: My Library

Shows only reports the current user has `owned` access to.

### Layout

Three-column layout inside the page body:

1. **Category Sidebar** (fixed ~150px width)
2. **Report List** (scrollable, ~40% of remaining width)
3. **PDF Viewer** (remaining width, full report)

### Category Sidebar

Categories are derived from `report.category` field. Each category is a **collapsible section**:

```
▾ Semiconductors  4
    TSMC Margin Expansion...   ← selected (blue highlight)
    NVIDIA Q2 FY2026...
    AVGO Q1 FY2026...
    AMD MI300X...
▸ Cloud / AI  2               ← collapsed
▸ Consumer  1                 ← collapsed
```

- Click section header to toggle expand/collapse
- Click report title to select it in the list + load PDF
- Collapsed sections show only the header row
- Expanded by default for the category of the first report
- An **"All Reports"** entry at top shows all owned reports flat

### Report List (Library)

Simplified card — no excerpt, no action buttons:
- Title (bold)
- Contributor name + date
- Selected state: blue border

### PDF Viewer (Library)

- Shows full PDF via `<iframe>` (no blurred overlay — these are owned)
- Header: title + `✓ Owned` green badge
- Scrollable within the panel

---

## Data Model

### `ExpertReport` interface

```ts
interface ExpertReport {
  id: string;
  title: string;
  excerpt: string;
  company: string;        // ticker, e.g. "NVDA"
  contributor: string;    // analyst name
  date: string;           // ISO date string
  category: string;       // e.g. "Semiconductors"
  downloadCount: number;
  commentCount: number;
  previewPdfUrl: string;  // URL for locked/owned preview
  fullPdfUrl: string;     // URL for owned full access
  accessState: 'locked' | 'pending' | 'owned';
}
```

### Mock Data

File: `app/data/expertReports.ts`  
At least **10 mock reports** across 3 categories (Semiconductors, Cloud/AI, Consumer), with mixed `accessState` values to demonstrate all UI states.

PDF URLs point to a public placeholder PDF (e.g. `https://www.w3.org/WAI/WCAG21/Techniques/pdf/PDF1`) for `previewPdfUrl`, and same for `fullPdfUrl` in mock data.

---

## Service Interface (Backend-Ready)

File: `app/lib/expertReportService.ts`

```ts
export interface ExpertReportService {
  getReports(filters?: { company?: string; contributor?: string }): Promise<ExpertReport[]>;
  getLibrary(): Promise<ExpertReport[]>;
  requestAccess(reportId: string): Promise<void>;
  saveReport(reportId: string, saved: boolean): Promise<void>;
}
```

The **mock implementation** (`MockExpertReportService`) operates on the static data array in memory. `requestAccess` optimistically mutates the report's `accessState` from `locked` → `pending` in-memory. `saveReport` toggles the `savedReportIds` set. Neither persists across page refresh — persistence is deferred to the backend integration.

The **API implementation** (future) will call `/api/expert-reports` on the Spring Boot backend using `fetch`. Swapping is done by changing a single import in `ExpertReportContent.tsx`.

---

## Component Tree

```
app/expert-report/
  page.tsx                          ← thin shell, renders ExpertReportContent
  ExpertReportContent.tsx           ← all state, mode toggle, layout shell

app/components/expert-report/
  SearchBar.tsx                     ← Company + Contributor inputs + Search/Reset
  ReportCard.tsx                    ← single card (owned/locked/pending states)
  PdfViewerPanel.tsx                ← iframe wrapper + empty/locked states
  LibrarySidebar.tsx                ← collapsible category tree
  LibraryReportList.tsx             ← simplified list for library mode
```

### State (in `ExpertReportContent`)

```ts
mode: 'dashboard' | 'library'
searchCompany: string
searchContributor: string
reports: ExpertReport[]             // filtered result
library: ExpertReport[]             // owned only
selectedReport: ExpertReport | null
openCategories: Set<string>         // which sidebar sections are expanded
savedReportIds: Set<string>         // client-side save toggle
```

---

## Navigation Integration

In `app/data/navigation.ts`, add to the main sidebar sections:

```ts
{
  label: 'Expert Report',
  href: '/expert-report',
  icon: 'report',
}
```

---

## Styling

- Uses **only** `app/globals.css` — no new CSS files, no CSS modules
- New CSS classes follow existing naming conventions (BEM-like, e.g. `.expert-report-card`, `.expert-report-pdf-panel`)
- Toggle button style mirrors existing pill-toggle patterns in the codebase
- Collapsible sidebar section headers: `cursor: pointer`, chevron rotates on expand (`▸` → `▾`)
- All components have `'use client'` as first line

---

## Constraints (from AGENTS.md)

- ❌ No Tailwind, CSS Modules, or CSS-in-JS
- ❌ No chart libraries or new npm packages
- ❌ No `next/image` for dynamic images
- ❌ No server components — all `'use client'`
- ✅ Inline SVG for icons
- ✅ Single `globals.css` stylesheet

---

## Out of Scope (This Implementation)

- Real PDF files (placeholder URLs used)
- Admin approval UI for access requests
- Comment/discussion threads (count shown, interaction deferred)
- Notification system for approved requests
- Backend Spring Boot endpoints
