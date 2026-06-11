# Expert Report Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-mode Expert Report page — Dashboard (browse/search all reports with PDF preview) and My Library (owned reports with collapsible category sidebar + PDF viewer).

**Architecture:** Static mock data behind a swappable service interface, all state in `ExpertReportContent.tsx`, five focused sub-components in `app/components/expert-report/`. The service interface (`ExpertReportService`) is designed to swap mock → Spring Boot API by changing one import.

**Tech Stack:** Next.js 14 App Router (static export), TypeScript, React `useState`/`useMemo`/`useEffect`, inline SVG icons, `globals.css` only (no new packages).

**Spec:** `docs/superpowers/specs/2026-06-11-expert-report-design.md`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/data/expertReports.ts` | **Create** | `ExpertReport` interface + 10 mock reports |
| `app/lib/expertReportService.ts` | **Create** | `ExpertReportService` interface + `MockExpertReportService` |
| `app/globals.css` | **Modify** | Append `er-*` CSS classes (Expert Report page styles) |
| `app/data/navigation.ts` | **Modify** | Add Expert Report nav item to `mainNav` |
| `app/components/expert-report/SearchBar.tsx` | **Create** | Company + Contributor inputs + Search/Reset buttons |
| `app/components/expert-report/ReportCard.tsx` | **Create** | Single report card (owned/locked/pending states) |
| `app/components/expert-report/PdfViewerPanel.tsx` | **Create** | iframe PDF viewer with empty/locked overlay states |
| `app/components/expert-report/LibrarySidebar.tsx` | **Create** | Collapsible category tree for Library mode |
| `app/components/expert-report/LibraryReportList.tsx` | **Create** | Simplified report list for Library mode |
| `app/expert-report/ExpertReportContent.tsx` | **Create** | All page state + layout shell (Dashboard + Library) |
| `app/expert-report/page.tsx` | **Create** | Thin shell: TopNav + Banner + Sidebar + ExpertReportContent |

---

## Task 1: Data Model and Mock Reports

**Files:**
- Create: `app/data/expertReports.ts`

- [ ] **Step 1: Create the data file**

```typescript
// app/data/expertReports.ts

export interface ExpertReport {
  id: string;
  title: string;
  excerpt: string;
  company: string;       // ticker symbol, e.g. "NVDA"
  contributor: string;   // analyst name
  date: string;          // ISO date string, e.g. "2026-06-05"
  category: string;      // e.g. "Semiconductors"
  downloadCount: number;
  commentCount: number;
  previewPdfUrl: string; // partial preview PDF URL
  fullPdfUrl: string;    // full report PDF URL (owned only)
  accessState: 'locked' | 'pending' | 'owned';
}

// Public sample PDF used as placeholder for all mock reports.
// Replace with real URLs when integrating the backend.
const SAMPLE_PDF = 'https://www.africau.edu/images/default/sample.pdf';

export const expertReports: ExpertReport[] = [
  {
    id: 'rpt-001',
    title: 'NVIDIA Q2 FY2026 Deep Dive: AI Infrastructure Supercycle',
    excerpt: 'Examines NVIDIA\'s Q2 results and the structural drivers behind the AI infrastructure demand cycle — data centre capex, H100/H200 supply tightness, and inference workload growth.',
    company: 'NVDA',
    contributor: 'Sarah Chen',
    date: '2026-06-05',
    category: 'Semiconductors',
    downloadCount: 342,
    commentCount: 18,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'owned',
  },
  {
    id: 'rpt-002',
    title: 'TSMC Margin Expansion: Advanced Node Roadmap to 2028',
    excerpt: 'Forward-looking analysis on TSMC\'s N2/N3 pricing power, gross margin trajectory, and competitive dynamics with Intel Foundry and Samsung LSI.',
    company: 'TSM',
    contributor: 'James Liu',
    date: '2026-06-03',
    category: 'Semiconductors',
    downloadCount: 521,
    commentCount: 34,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'owned',
  },
  {
    id: 'rpt-003',
    title: 'Broadcom AI Networking: Post-VMware Synergy Analysis',
    excerpt: 'Deep dive into Broadcom\'s custom AI accelerator business (XPU) and Ethernet switching TAM expansion post VMware integration.',
    company: 'AVGO',
    contributor: 'Mike Wang',
    date: '2026-05-28',
    category: 'Semiconductors',
    downloadCount: 189,
    commentCount: 12,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'locked',
  },
  {
    id: 'rpt-004',
    title: 'AMD MI300X vs H100: Data Centre Workload Benchmark',
    excerpt: 'Comparative performance-per-dollar analysis of AMD\'s MI300X versus NVIDIA H100 across LLM training, inference, and HPC workloads.',
    company: 'AMD',
    contributor: 'Anna Park',
    date: '2026-05-20',
    category: 'Semiconductors',
    downloadCount: 278,
    commentCount: 22,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'pending',
  },
  {
    id: 'rpt-005',
    title: 'Intel Foundry 18A: Can It Win Back TSMC Defectors?',
    excerpt: 'Analysis of Intel\'s 18A process node competitiveness, yield ramp timeline, and potential customer wins from major fabless players.',
    company: 'INTC',
    contributor: 'David Kim',
    date: '2026-05-15',
    category: 'Semiconductors',
    downloadCount: 156,
    commentCount: 9,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'locked',
  },
  {
    id: 'rpt-006',
    title: 'Microsoft Azure AI: Copilot Monetisation and Margin Outlook',
    excerpt: 'Examining Azure\'s AI revenue attach rate, Copilot seat growth trajectory, and the path to incremental operating margin improvement in FY2027.',
    company: 'MSFT',
    contributor: 'Sarah Chen',
    date: '2026-06-01',
    category: 'Cloud / AI',
    downloadCount: 413,
    commentCount: 27,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'owned',
  },
  {
    id: 'rpt-007',
    title: 'Amazon AWS: Graviton4 Cost Advantage and GenAI Services TAM',
    excerpt: 'AWS custom silicon strategy, Graviton4 TCO advantage over x86, and Bedrock/SageMaker competitive positioning versus Azure and Google.',
    company: 'AMZN',
    contributor: 'James Liu',
    date: '2026-05-25',
    category: 'Cloud / AI',
    downloadCount: 198,
    commentCount: 15,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'locked',
  },
  {
    id: 'rpt-008',
    title: 'Google TPU v5p: Hyperscaler In-House AI Infrastructure Cost Model',
    excerpt: 'Cost modelling of Google\'s TPU v5p versus GPU alternatives for internal LLM training workloads — implications for third-party chip demand.',
    company: 'GOOGL',
    contributor: 'Anna Park',
    date: '2026-05-18',
    category: 'Cloud / AI',
    downloadCount: 334,
    commentCount: 21,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'owned',
  },
  {
    id: 'rpt-009',
    title: 'Apple Silicon Roadmap: M4 Series and iPhone 17 ASP Implications',
    excerpt: 'Detailed teardown of Apple\'s M4 chip strategy, iPhone 17 BOM cost changes, and gross margin implications of the in-house modem transition.',
    company: 'AAPL',
    contributor: 'Mike Wang',
    date: '2026-06-02',
    category: 'Consumer',
    downloadCount: 602,
    commentCount: 41,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'owned',
  },
  {
    id: 'rpt-010',
    title: 'Sony PlayStation 6: Launch Economics and Gaming Hardware Cycle',
    excerpt: 'PS6 BOM estimate, AMD custom APU design-win analysis, and historical correlation between console launches and semiconductor content growth.',
    company: 'SONY',
    contributor: 'David Kim',
    date: '2026-05-10',
    category: 'Consumer',
    downloadCount: 87,
    commentCount: 5,
    previewPdfUrl: SAMPLE_PDF,
    fullPdfUrl: SAMPLE_PDF,
    accessState: 'locked',
  },
];
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors related to `expertReports.ts`

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/data/expertReports.ts
git commit -m "feat(expert-report): add ExpertReport interface and 10 mock reports"
```

---

## Task 2: Service Interface and Mock Implementation

**Files:**
- Create: `app/lib/expertReportService.ts`

- [ ] **Step 1: Create the service file**

```typescript
// app/lib/expertReportService.ts
import { ExpertReport, expertReports } from '@/app/data/expertReports';

export interface ExpertReportService {
  /** Return all reports, optionally filtered by company ticker and/or contributor name (case-insensitive substring match). */
  getReports(filters?: { company?: string; contributor?: string }): Promise<ExpertReport[]>;
  /** Return only reports with accessState === 'owned'. */
  getLibrary(): Promise<ExpertReport[]>;
  /** Optimistically change accessState from 'locked' → 'pending'. No-op if already pending/owned. */
  requestAccess(reportId: string): Promise<void>;
  /** No-op in mock — saved state is managed in component state. Reserved for API integration. */
  saveReport(reportId: string, saved: boolean): Promise<void>;
}

class MockExpertReportService implements ExpertReportService {
  // Mutable copy — mutations (requestAccess) survive for the session but reset on page reload.
  private data: ExpertReport[] = expertReports.map(r => ({ ...r }));

  async getReports(filters?: { company?: string; contributor?: string }): Promise<ExpertReport[]> {
    let result = this.data;
    if (filters?.company) {
      const q = filters.company.toLowerCase();
      result = result.filter(r => r.company.toLowerCase().includes(q));
    }
    if (filters?.contributor) {
      const q = filters.contributor.toLowerCase();
      result = result.filter(r => r.contributor.toLowerCase().includes(q));
    }
    return [...result];
  }

  async getLibrary(): Promise<ExpertReport[]> {
    return this.data.filter(r => r.accessState === 'owned');
  }

  async requestAccess(reportId: string): Promise<void> {
    const report = this.data.find(r => r.id === reportId);
    if (report && report.accessState === 'locked') {
      report.accessState = 'pending';
    }
  }

  async saveReport(_reportId: string, _saved: boolean): Promise<void> {
    // Saved state lives in component state. This method is reserved for the backend integration.
  }
}

// Singleton — component imports this directly. To swap to real API, replace this export.
export const expertReportService: ExpertReportService = new MockExpertReportService();
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/lib/expertReportService.ts
git commit -m "feat(expert-report): add ExpertReportService interface and mock implementation"
```

---

## Task 3: CSS Classes

**Files:**
- Modify: `app/globals.css` (append to end)

- [ ] **Step 1: Append Expert Report CSS to globals.css**

Append the following block to the very end of `app/globals.css`:

```css
/* ===================================================================
   EXPERT REPORT PAGE  (er-*)
   =================================================================== */

/* ── Page shell ── */
.er-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ── Mode toggle bar ── */
.er-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-white);
  flex-shrink: 0;
}
.er-topbar-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--c-text);
}
.er-mode-toggle {
  display: flex;
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 6px;
  padding: 2px;
  margin-left: auto;
  gap: 2px;
}
.er-mode-btn {
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--c-text-3);
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}
.er-mode-btn--active {
  background: var(--c-white);
  color: #4a6cf7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.er-lib-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #4a6cf7;
  color: #fff;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  padding: 0 5px;
  margin-left: 4px;
  min-width: 16px;
  height: 16px;
}

/* ── Search bar ── */
.er-search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-bottom: 1px solid var(--c-border);
  background: var(--c-white);
  flex-shrink: 0;
}
.er-search-input {
  flex: 1;
  padding: 6px 10px;
  font-size: 12px;
  border: 1px solid var(--c-border-2);
  border-radius: var(--radius-sm);
  background: var(--c-bg);
  color: var(--c-text);
  outline: none;
  transition: border-color 0.15s;
}
.er-search-input:focus {
  border-color: #4a6cf7;
  background: var(--c-white);
}
.er-search-btn {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  background: #4a6cf7;
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: opacity 0.15s;
}
.er-search-btn:hover {
  opacity: 0.88;
}
.er-search-reset {
  padding: 6px 10px;
  font-size: 12px;
  background: var(--c-white);
  color: var(--c-text-3);
  border: 1px solid var(--c-border-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.15s;
}
.er-search-reset:hover {
  border-color: var(--c-btn-active);
  color: var(--c-text);
}
.er-search-count {
  font-size: 11px;
  color: var(--c-text-4);
  white-space: nowrap;
}

/* ── Dashboard body (40/60 split) ── */
.er-dashboard-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.er-card-list {
  width: 40%;
  min-width: 280px;
  border-right: 1px solid var(--c-border);
  overflow-y: auto;
  padding: 10px 10px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.er-pdf-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
  background: #f5f6f8;
}

/* ── Report card ── */
.er-card {
  background: var(--c-white);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.er-card:hover {
  border-color: #93c5fd;
  box-shadow: 0 1px 4px rgba(74, 108, 247, 0.1);
}
.er-card--selected {
  border: 1.5px solid #4a6cf7;
  background: #f8f9ff;
}
.er-card--locked {
  background: #fafafa;
  opacity: 0.92;
}
.er-card--pending {
  border-color: #f5d87a;
  background: #fffbf0;
}
.er-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}
.er-card-ticker {
  font-size: 10px;
  font-weight: 600;
  color: #4a6cf7;
  background: #f0f4ff;
  padding: 1px 7px;
  border-radius: 10px;
}
.er-card-lock {
  font-size: 11px;
  line-height: 1;
}
.er-card-pending-badge {
  font-size: 9px;
  font-weight: 600;
  color: #92400e;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: 10px;
}
.er-card-date {
  margin-left: auto;
  font-size: 10px;
  color: var(--c-text-4);
}
.er-card-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text);
  line-height: 1.35;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.er-card-excerpt {
  font-size: 11px;
  color: var(--c-text-3);
  line-height: 1.45;
  margin-bottom: 7px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.er-card-excerpt--locked {
  color: var(--c-text-4);
  font-style: italic;
}
.er-card-footer {
  display: flex;
  align-items: center;
  gap: 5px;
}
.er-card-avatar {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e0e4ea;
  flex-shrink: 0;
}
.er-card-contributor {
  font-size: 10px;
  color: var(--c-text-2);
}
.er-card-sep {
  color: var(--c-border-2);
  font-size: 10px;
  margin: 0 1px;
}
.er-card-stat {
  font-size: 10px;
  color: var(--c-text-4);
}
.er-card-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}
.er-card-action-btn {
  padding: 2px 8px;
  font-size: 10px;
  border: 1px solid var(--c-border-2);
  border-radius: 3px;
  background: var(--c-white);
  color: var(--c-text-3);
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.er-card-action-btn:hover {
  border-color: #4a6cf7;
  color: #4a6cf7;
}
.er-card-action-btn--active {
  background: #4a6cf7;
  border-color: #4a6cf7;
  color: #fff;
}
.er-card-access-btn {
  padding: 2px 9px;
  font-size: 10px;
  font-weight: 600;
  background: var(--c-white);
  border: 1px solid #4a6cf7;
  border-radius: 3px;
  color: #4a6cf7;
  cursor: pointer;
  transition: background 0.12s;
}
.er-card-access-btn:hover {
  background: #f0f4ff;
}
.er-card-access-btn:disabled {
  border-color: var(--c-border-2);
  color: var(--c-text-4);
  cursor: default;
  background: var(--c-bg);
}

/* ── PDF viewer panel ── */
.er-pdf-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--c-white);
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}
.er-pdf-header-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--c-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.er-pdf-label {
  font-size: 10px;
  color: var(--c-text-4);
  flex-shrink: 0;
}
.er-owned-badge {
  font-size: 10px;
  font-weight: 600;
  color: #166534;
  background: #dcfce7;
  padding: 1px 7px;
  border-radius: 10px;
  flex-shrink: 0;
}
.er-pdf-ticker {
  font-size: 10px;
  font-weight: 600;
  color: #4a6cf7;
  background: #f0f4ff;
  padding: 1px 7px;
  border-radius: 10px;
  flex-shrink: 0;
}
.er-pdf-iframe {
  flex: 1;
  border: none;
  width: 100%;
  height: 100%;
  display: block;
}
.er-pdf-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--c-text-4);
}
.er-pdf-empty-icon {
  opacity: 0.3;
}
.er-pdf-empty-text {
  font-size: 13px;
}
.er-pdf-locked-overlay {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #fafafa;
  color: var(--c-text-3);
}
.er-pdf-locked-icon {
  font-size: 32px;
  opacity: 0.4;
}
.er-pdf-locked-text {
  font-size: 13px;
  text-align: center;
}

/* ── Library mode layout ── */
.er-library-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
.er-lib-sidebar {
  width: 180px;
  min-width: 160px;
  border-right: 1px solid var(--c-border);
  overflow-y: auto;
  padding: 8px 0;
  background: var(--c-white);
  flex-shrink: 0;
}
.er-lib-all-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-3);
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  transition: background 0.12s, color 0.12s;
}
.er-lib-all-btn:hover {
  background: var(--c-bg);
  color: var(--c-text);
}
.er-lib-all-btn--active {
  color: #4a6cf7;
  background: #f0f4ff;
}
.er-lib-section {
  margin-bottom: 2px;
}
.er-lib-section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text-2);
  cursor: pointer;
  user-select: none;
  transition: background 0.12s;
}
.er-lib-section-header:hover {
  background: var(--c-bg);
}
.er-lib-section-chevron {
  font-size: 9px;
  color: var(--c-text-4);
  transition: transform 0.15s;
  flex-shrink: 0;
}
.er-lib-section-count {
  margin-left: auto;
  font-size: 10px;
  color: var(--c-text-4);
}
.er-lib-section-items {
  padding: 2px 0 4px 14px;
}
.er-lib-section-item {
  display: block;
  padding: 4px 10px 4px 8px;
  font-size: 11px;
  color: var(--c-text-3);
  cursor: pointer;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background 0.1s, color 0.1s;
  width: 100%;
  text-align: left;
  border: none;
  background: none;
}
.er-lib-section-item:hover {
  background: var(--c-bg);
  color: var(--c-text);
}
.er-lib-section-item--active {
  color: #4a6cf7;
  font-weight: 600;
  background: #f0f4ff;
}

/* ── Library report list ── */
.er-lib-list-panel {
  width: 38%;
  min-width: 200px;
  border-right: 1px solid var(--c-border);
  overflow-y: auto;
  padding: 10px 8px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.er-lib-list-label {
  font-size: 10px;
  color: var(--c-text-4);
  padding: 0 4px 4px;
}
.er-lib-item {
  background: var(--c-white);
  border: 1px solid var(--c-border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  cursor: pointer;
  transition: border-color 0.12s;
}
.er-lib-item:hover {
  border-color: #93c5fd;
}
.er-lib-item--active {
  border: 1.5px solid #4a6cf7;
  background: #f8f9ff;
}
.er-lib-item-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--c-text);
  margin-bottom: 3px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.35;
}
.er-lib-item-meta {
  font-size: 10px;
  color: var(--c-text-4);
}

/* dark mode overrides */
html.dark .er-topbar,
html.dark .er-search-bar,
html.dark .er-pdf-header,
html.dark .er-lib-sidebar {
  background: var(--c-white);
  border-color: var(--c-border);
}
html.dark .er-card {
  background: var(--c-white);
  border-color: var(--c-border);
}
html.dark .er-card--selected {
  background: #1e2a4a;
}
html.dark .er-card--pending {
  background: #2a2210;
}
html.dark .er-pdf-panel,
html.dark .er-pdf-locked-overlay {
  background: var(--c-bg);
}
html.dark .er-mode-toggle {
  background: var(--c-bg);
  border-color: var(--c-border);
}
html.dark .er-mode-btn--active {
  background: var(--c-white);
}
```

- [ ] **Step 2: Verify build compiles (CSS is not compiled by tsc, so just check no syntax errors visually)**

Scan the appended block for unclosed braces. The block opens with `/* ===== EXPERT REPORT PAGE */` and should close cleanly.

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/globals.css
git commit -m "feat(expert-report): add er-* CSS classes to globals.css"
```

---

## Task 4: SearchBar Component

**Files:**
- Create: `app/components/expert-report/SearchBar.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

interface SearchBarProps {
  company: string;
  contributor: string;
  resultCount: number;
  onCompanyChange: (value: string) => void;
  onContributorChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function SearchBar({
  company,
  contributor,
  resultCount,
  onCompanyChange,
  onContributorChange,
  onSearch,
  onReset,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="er-search-bar">
      <input
        className="er-search-input"
        type="text"
        placeholder="Company (e.g. NVDA, TSMC)"
        value={company}
        onChange={e => onCompanyChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Filter by company"
      />
      <input
        className="er-search-input"
        type="text"
        placeholder="Contributor"
        value={contributor}
        onChange={e => onContributorChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Filter by contributor"
      />
      <button className="er-search-btn" onClick={onSearch}>Search</button>
      <button className="er-search-reset" onClick={onReset}>Reset</button>
      <span className="er-search-count">{resultCount} reports</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/components/expert-report/SearchBar.tsx
git commit -m "feat(expert-report): add SearchBar component"
```

---

## Task 5: ReportCard Component

**Files:**
- Create: `app/components/expert-report/ReportCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

import { useState } from 'react';
import type { ExpertReport } from '@/app/data/expertReports';

interface ReportCardProps {
  report: ExpertReport;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (report: ExpertReport) => void;
  onSave: (reportId: string) => void;
  onRequestAccess: (reportId: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReportCard({
  report,
  isSelected,
  isSaved,
  onSelect,
  onSave,
  onRequestAccess,
}: ReportCardProps) {
  const [shareCopied, setShareCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/lego/expert-report/?report=${report.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(report.id);
  };

  const handleRequestAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestAccess(report.id);
  };

  const cardClass = [
    'er-card',
    isSelected ? 'er-card--selected' : '',
    report.accessState === 'locked' ? 'er-card--locked' : '',
    report.accessState === 'pending' ? 'er-card--pending' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass} onClick={() => onSelect(report)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(report)}>
      {/* Header: ticker + lock/pending badge + date */}
      <div className="er-card-header">
        <span className="er-card-ticker">{report.company}</span>
        {report.accessState === 'locked' && <span className="er-card-lock">🔒</span>}
        {report.accessState === 'pending' && (
          <span className="er-card-pending-badge">⏳ Pending</span>
        )}
        <span className="er-card-date">{formatDate(report.date)}</span>
      </div>

      {/* Title */}
      <div className="er-card-title">{report.title}</div>

      {/* Excerpt */}
      {report.accessState === 'locked' || report.accessState === 'pending' ? (
        <div className="er-card-excerpt er-card-excerpt--locked">
          Preview locked · Request access to read full report
        </div>
      ) : (
        <div className="er-card-excerpt">{report.excerpt}</div>
      )}

      {/* Footer */}
      <div className="er-card-footer">
        <div className="er-card-avatar" aria-hidden="true" />
        <span className="er-card-contributor">{report.contributor}</span>
        <span className="er-card-sep">·</span>
        <span className="er-card-stat">↓{report.downloadCount}</span>
        <span className="er-card-stat">💬{report.commentCount}</span>

        <div className="er-card-actions">
          {report.accessState === 'owned' && (
            <>
              <button
                className={`er-card-action-btn${isSaved ? ' er-card-action-btn--active' : ''}`}
                onClick={handleSave}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                {isSaved ? 'Saved ✓' : 'Save'}
              </button>
              <button
                className={`er-card-action-btn${shareCopied ? ' er-card-action-btn--active' : ''}`}
                onClick={handleShare}
                title={shareCopied ? 'Copied!' : 'Share'}
              >
                {shareCopied ? 'Copied!' : 'Share'}
              </button>
            </>
          )}
          {report.accessState === 'locked' && (
            <button className="er-card-access-btn" onClick={handleRequestAccess}>
              Request Access
            </button>
          )}
          {report.accessState === 'pending' && (
            <button className="er-card-access-btn" disabled>
              Pending...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/components/expert-report/ReportCard.tsx
git commit -m "feat(expert-report): add ReportCard component with owned/locked/pending states"
```

---

## Task 6: PdfViewerPanel Component

**Files:**
- Create: `app/components/expert-report/PdfViewerPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

import type { ExpertReport } from '@/app/data/expertReports';

interface PdfViewerPanelProps {
  report: ExpertReport | null;
  /** 'preview' = Dashboard mode (previewPdfUrl, may be locked). 'full' = Library mode (fullPdfUrl, always owned). */
  viewMode: 'preview' | 'full';
}

function PdfDocIcon() {
  return (
    <svg className="er-pdf-empty-icon" width="48" height="60" viewBox="0 0 48 60" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="56" rx="5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 18h24M12 27h24M12 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PdfViewerPanel({ report, viewMode }: PdfViewerPanelProps) {
  // No report selected
  if (!report) {
    return (
      <div className="er-pdf-panel">
        <div className="er-pdf-empty">
          <PdfDocIcon />
          <span className="er-pdf-empty-text">Select a report to preview</span>
        </div>
      </div>
    );
  }

  const isLocked = report.accessState === 'locked' || report.accessState === 'pending';

  // Locked/pending in Dashboard: show overlay instead of iframe
  if (viewMode === 'preview' && isLocked) {
    return (
      <div className="er-pdf-panel">
        <div className="er-pdf-header">
          <span className="er-pdf-header-title">{report.title}</span>
          <span className="er-pdf-ticker">{report.company}</span>
          <span className="er-pdf-label">Preview</span>
        </div>
        <div className="er-pdf-locked-overlay">
          <div className="er-pdf-locked-icon">🔒</div>
          <div className="er-pdf-locked-text">
            {report.accessState === 'pending'
              ? 'Access request submitted — awaiting approval'
              : 'Request access to read the full report'}
          </div>
        </div>
      </div>
    );
  }

  const pdfUrl = viewMode === 'full' ? report.fullPdfUrl : report.previewPdfUrl;

  return (
    <div className="er-pdf-panel">
      <div className="er-pdf-header">
        <span className="er-pdf-header-title">{report.title}</span>
        <span className="er-pdf-ticker">{report.company}</span>
        {viewMode === 'full' ? (
          <span className="er-owned-badge">✓ Owned</span>
        ) : (
          <span className="er-pdf-label">Preview</span>
        )}
      </div>
      <iframe
        className="er-pdf-iframe"
        src={pdfUrl}
        title={report.title}
        aria-label={`PDF viewer: ${report.title}`}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/components/expert-report/PdfViewerPanel.tsx
git commit -m "feat(expert-report): add PdfViewerPanel component"
```

---

## Task 7: LibrarySidebar Component

**Files:**
- Create: `app/components/expert-report/LibrarySidebar.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

import type { ExpertReport } from '@/app/data/expertReports';

interface LibrarySidebarProps {
  reports: ExpertReport[];                     // all owned reports
  selectedId: string | null;                   // currently selected report id
  openCategories: Set<string>;                 // expanded category names
  selectedCategory: string;                    // '__all__' or a category name
  onSelectReport: (report: ExpertReport) => void;
  onToggleCategory: (category: string) => void;
  onSelectCategory: (category: string) => void;
}

export default function LibrarySidebar({
  reports,
  selectedId,
  openCategories,
  selectedCategory,
  onSelectReport,
  onToggleCategory,
  onSelectCategory,
}: LibrarySidebarProps) {
  // Build category → reports map, preserving insertion order
  const categoryMap = new Map<string, ExpertReport[]>();
  for (const r of reports) {
    if (!categoryMap.has(r.category)) categoryMap.set(r.category, []);
    categoryMap.get(r.category)!.push(r);
  }

  return (
    <div className="er-lib-sidebar">
      {/* All Reports */}
      <button
        className={`er-lib-all-btn${selectedCategory === '__all__' ? ' er-lib-all-btn--active' : ''}`}
        onClick={() => onSelectCategory('__all__')}
      >
        All Reports
        <span className="er-lib-section-count">{reports.length}</span>
      </button>

      {/* Per-category collapsible sections */}
      {Array.from(categoryMap.entries()).map(([category, catReports]) => {
        const isOpen = openCategories.has(category);
        return (
          <div key={category} className="er-lib-section">
            <div
              className="er-lib-section-header"
              onClick={() => onToggleCategory(category)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onToggleCategory(category)}
            >
              <span className="er-lib-section-chevron">{isOpen ? '▾' : '▸'}</span>
              <span>{category}</span>
              <span className="er-lib-section-count">{catReports.length}</span>
            </div>

            {isOpen && (
              <div className="er-lib-section-items">
                {catReports.map(r => (
                  <button
                    key={r.id}
                    className={`er-lib-section-item${r.id === selectedId ? ' er-lib-section-item--active' : ''}`}
                    onClick={() => {
                      onSelectCategory(category);
                      onSelectReport(r);
                    }}
                    title={r.title}
                  >
                    {r.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/components/expert-report/LibrarySidebar.tsx
git commit -m "feat(expert-report): add LibrarySidebar with collapsible categories"
```

---

## Task 8: LibraryReportList Component

**Files:**
- Create: `app/components/expert-report/LibraryReportList.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client';

import type { ExpertReport } from '@/app/data/expertReports';

interface LibraryReportListProps {
  reports: ExpertReport[];
  selectedId: string | null;
  categoryLabel: string;
  onSelect: (report: ExpertReport) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LibraryReportList({
  reports,
  selectedId,
  categoryLabel,
  onSelect,
}: LibraryReportListProps) {
  return (
    <div className="er-lib-list-panel">
      <div className="er-lib-list-label">
        {categoryLabel} · {reports.length} {reports.length === 1 ? 'report' : 'reports'}
      </div>
      {reports.map(r => (
        <div
          key={r.id}
          className={`er-lib-item${r.id === selectedId ? ' er-lib-item--active' : ''}`}
          onClick={() => onSelect(r)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onSelect(r)}
        >
          <div className="er-lib-item-title">{r.title}</div>
          <div className="er-lib-item-meta">
            {r.contributor} · {formatDate(r.date)}
          </div>
        </div>
      ))}
      {reports.length === 0 && (
        <div style={{ padding: '20px 4px', fontSize: '12px', color: 'var(--c-text-4)', textAlign: 'center' }}>
          No reports in this category
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/components/expert-report/LibraryReportList.tsx
git commit -m "feat(expert-report): add LibraryReportList component"
```

---

## Task 9: ExpertReportContent — Main Page Logic

**Files:**
- Create: `app/expert-report/ExpertReportContent.tsx`

- [ ] **Step 1: Create the content component**

```tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import SearchBar from '@/app/components/expert-report/SearchBar';
import ReportCard from '@/app/components/expert-report/ReportCard';
import PdfViewerPanel from '@/app/components/expert-report/PdfViewerPanel';
import LibrarySidebar from '@/app/components/expert-report/LibrarySidebar';
import LibraryReportList from '@/app/components/expert-report/LibraryReportList';
import { expertReportService } from '@/app/lib/expertReportService';
import type { ExpertReport } from '@/app/data/expertReports';

type Mode = 'dashboard' | 'library';

export default function ExpertReportContent() {
  const [mode, setMode] = useState<Mode>('dashboard');

  // Raw report data — mutated optimistically on requestAccess
  const [allReports, setAllReports] = useState<ExpertReport[]>([]);

  // Dashboard search state: inputs are live-controlled; filters only applied on Search click
  const [searchCompany, setSearchCompany] = useState('');
  const [searchContributor, setSearchContributor] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ company: '', contributor: '' });

  // Selected report (shared across modes)
  const [selectedReport, setSelectedReport] = useState<ExpertReport | null>(null);

  // Saved report IDs (client-side, does not persist across page reload)
  const [savedReportIds, setSavedReportIds] = useState<Set<string>>(new Set());

  // Library state
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');

  // Load data on mount
  useEffect(() => {
    expertReportService.getReports().then(reports => {
      setAllReports(reports);
      // Expand first category of owned reports by default
      const firstOwned = reports.find(r => r.accessState === 'owned');
      if (firstOwned) {
        setOpenCategories(new Set([firstOwned.category]));
      }
    });
  }, []);

  // Derived: filtered reports for Dashboard
  const filteredReports = useMemo(() => {
    return allReports.filter(r => {
      const matchCompany =
        !appliedFilters.company ||
        r.company.toLowerCase().includes(appliedFilters.company.toLowerCase());
      const matchContributor =
        !appliedFilters.contributor ||
        r.contributor.toLowerCase().includes(appliedFilters.contributor.toLowerCase());
      return matchCompany && matchContributor;
    });
  }, [allReports, appliedFilters]);

  // Derived: library (owned only)
  const library = useMemo(() => allReports.filter(r => r.accessState === 'owned'), [allReports]);

  // Derived: library list shown for selected category
  const libraryListReports = useMemo(() => {
    if (selectedCategory === '__all__') return library;
    return library.filter(r => r.category === selectedCategory);
  }, [library, selectedCategory]);

  const libraryListLabel = selectedCategory === '__all__' ? 'All Reports' : selectedCategory;

  // Handlers
  const handleSearch = () => setAppliedFilters({ company: searchCompany, contributor: searchContributor });
  const handleReset = () => {
    setSearchCompany('');
    setSearchContributor('');
    setAppliedFilters({ company: '', contributor: '' });
  };

  const handleModeSwitch = (newMode: Mode) => {
    setMode(newMode);
    setSelectedReport(null);
  };

  const handleSelectReport = (report: ExpertReport) => setSelectedReport(report);

  const handleSave = (reportId: string) => {
    setSavedReportIds(prev => {
      const next = new Set(prev);
      if (next.has(reportId)) next.delete(reportId);
      else next.add(reportId);
      return next;
    });
  };

  const handleRequestAccess = async (reportId: string) => {
    await expertReportService.requestAccess(reportId);
    // Optimistic update
    setAllReports(prev =>
      prev.map(r => r.id === reportId ? { ...r, accessState: 'pending' } : r)
    );
    // Also update selectedReport if it's the same one
    setSelectedReport(prev =>
      prev?.id === reportId ? { ...prev, accessState: 'pending' } : prev
    );
  };

  const handleToggleCategory = (category: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleLibrarySelectReport = (report: ExpertReport) => {
    setSelectedReport(report);
  };

  return (
    <div className="er-page">
      {/* Top bar: title + mode toggle */}
      <div className="er-topbar">
        <span className="er-topbar-title">Expert Report</span>
        <div className="er-mode-toggle">
          <button
            className={`er-mode-btn${mode === 'dashboard' ? ' er-mode-btn--active' : ''}`}
            onClick={() => handleModeSwitch('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`er-mode-btn${mode === 'library' ? ' er-mode-btn--active' : ''}`}
            onClick={() => handleModeSwitch('library')}
          >
            📚 My Library
            {library.length > 0 && (
              <span className="er-lib-badge">{library.length}</span>
            )}
          </button>
        </div>
      </div>

      {/* ── DASHBOARD MODE ── */}
      {mode === 'dashboard' && (
        <>
          <SearchBar
            company={searchCompany}
            contributor={searchContributor}
            resultCount={filteredReports.length}
            onCompanyChange={setSearchCompany}
            onContributorChange={setSearchContributor}
            onSearch={handleSearch}
            onReset={handleReset}
          />
          <div className="er-dashboard-body">
            <div className="er-card-list">
              {filteredReports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  isSelected={selectedReport?.id === report.id}
                  isSaved={savedReportIds.has(report.id)}
                  onSelect={handleSelectReport}
                  onSave={handleSave}
                  onRequestAccess={handleRequestAccess}
                />
              ))}
              {filteredReports.length === 0 && (
                <div style={{ padding: '32px 8px', textAlign: 'center', color: 'var(--c-text-4)', fontSize: '13px' }}>
                  No reports match your search
                </div>
              )}
            </div>
            <PdfViewerPanel report={selectedReport} viewMode="preview" />
          </div>
        </>
      )}

      {/* ── LIBRARY MODE ── */}
      {mode === 'library' && (
        <div className="er-library-body">
          <LibrarySidebar
            reports={library}
            selectedId={selectedReport?.id ?? null}
            openCategories={openCategories}
            selectedCategory={selectedCategory}
            onSelectReport={handleLibrarySelectReport}
            onToggleCategory={handleToggleCategory}
            onSelectCategory={setSelectedCategory}
          />
          <LibraryReportList
            reports={libraryListReports}
            selectedId={selectedReport?.id ?? null}
            categoryLabel={libraryListLabel}
            onSelect={handleLibrarySelectReport}
          />
          <PdfViewerPanel report={selectedReport} viewMode="full" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1 | head -20
```
Expected: no errors

- [ ] **Step 3: Commit**

```bash
cd /home/ubuntu/lego
git add app/expert-report/ExpertReportContent.tsx
git commit -m "feat(expert-report): add ExpertReportContent with dashboard and library modes"
```

---

## Task 10: Page Shell, Navigation, and Build Verification

**Files:**
- Create: `app/expert-report/page.tsx`
- Modify: `app/data/navigation.ts`

- [ ] **Step 1: Create the thin page shell**

```tsx
// app/expert-report/page.tsx
'use client';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import ExpertReportContent from './ExpertReportContent';

export default function ExpertReportPage() {
  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <ExpertReportContent />
        </main>
      </div>
    </>
  );
}
```

Note: `ExpertReportContent` fills `main-content` without `page-pad` because the split-panel layout needs full height. The `er-page` class handles its own padding.

- [ ] **Step 2: Add Expert Report to the navigation**

In `app/data/navigation.ts`, find the `mainNav` array and add a new item after `'Data Explore'`:

Find this line:
```ts
  { label: 'Data Explore', href: '/data-explore', icon: 'dataExplore' },
```

Replace with:
```ts
  { label: 'Data Explore', href: '/data-explore', icon: 'dataExplore' },
  { label: 'Expert Report', href: '/expert-report', icon: 'report' },
```

- [ ] **Step 3: Run full TypeScript check**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit 2>&1
```
Expected: zero errors. Fix any type errors before continuing.

- [ ] **Step 4: Run production build**

```bash
cd /home/ubuntu/lego && npm run build 2>&1 | tail -30
```
Expected: `✓ Compiled successfully` or `Route (app) ...` table with no errors. The `expert-report` route should appear in the output.

- [ ] **Step 5: Restart the static file server**

```bash
# Stop existing server
kill $(lsof -ti:4173) 2>/dev/null || true
# Start fresh
cd /home/ubuntu/lego
setsid nohup npx serve -s out -p 4173 > /tmp/lego-serve.log 2>&1 &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:4173/lego/expert-report/
```
Expected: `200`

- [ ] **Step 6: Browser verification — Dashboard mode**

Open `https://lego2.hwchiu.com/lego/expert-report/` and verify:
- [ ] Sidebar shows "Expert Report" nav item with document icon
- [ ] Page loads with "📊 Dashboard" toggle active
- [ ] Search bar shows Company + Contributor inputs
- [ ] 10 report cards visible; `rpt-003`, `rpt-005`, `rpt-007`, `rpt-010` show 🔒 lock badge
- [ ] `rpt-004` shows ⏳ Pending badge with yellow tint
- [ ] Clicking `rpt-001` (NVDA, owned) selects it and loads PDF iframe on the right
- [ ] Clicking `rpt-003` (AVGO, locked) shows lock overlay in PDF panel
- [ ] "Request Access" on `rpt-003` changes it to ⏳ Pending immediately (optimistic update)
- [ ] Save button on an owned card toggles blue fill
- [ ] Share button copies URL, shows "Copied!"
- [ ] Typing "NVDA" in Company input + clicking Search shows only NVDA reports
- [ ] Reset button clears filters and shows all 10 reports

- [ ] **Step 7: Browser verification — Library mode**

Click "📚 My Library" toggle and verify:
- [ ] Badge shows `5` (the 5 owned reports)
- [ ] Sidebar shows Semiconductors (2), Cloud/AI (2), Consumer (1)
- [ ] First category (Semiconductors) is expanded by default
- [ ] Clicking ▸ Consumer expands it; clicking ▾ collapses it
- [ ] "All Reports" shows all 5 owned reports in the list
- [ ] Clicking a report in sidebar selects it and shows full PDF with ✓ Owned badge
- [ ] Selecting by category filters the report list

- [ ] **Step 8: Final commit**

```bash
cd /home/ubuntu/lego
git add app/expert-report/page.tsx app/data/navigation.ts
git commit -m "feat(expert-report): add page shell and navigation entry

- page.tsx thin shell with TopNav/Banner/Sidebar/ExpertReportContent
- Add Expert Report to mainNav after Data Explore

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ Dashboard 40/60 split — Task 9 (`er-dashboard-body`, `er-card-list` 40%, `er-pdf-panel` flex:1)
- ✅ Search bar (Company + Contributor + Search/Reset + count) — Task 4
- ✅ ReportCard Style B (excerpt + contributor + download count + comment count + save/share) — Task 5
- ✅ Access states locked/pending/owned — Task 5 + Task 9 `handleRequestAccess`
- ✅ PDF preview panel with empty state + locked overlay — Task 6
- ✅ Two-mode toggle (Dashboard ↔ My Library) — Task 9 + Task 3 CSS
- ✅ Library collapsible sidebar with All Reports + categories — Task 7
- ✅ Library report list (simplified) — Task 8
- ✅ Library PDF viewer (full, ✓ Owned badge) — Task 6 `viewMode="full"`
- ✅ Data model `ExpertReport` interface — Task 1
- ✅ Service interface + MockExpertReportService — Task 2
- ✅ Navigation entry — Task 10
- ✅ CSS in globals.css only — Task 3
- ✅ All components have `'use client'` — verified in each task
- ✅ No new npm packages — confirmed

**Type consistency:**
- `ExpertReport` defined in Task 1, imported in Tasks 2, 5, 6, 7, 8, 9 ✅
- `expertReportService` singleton exported in Task 2, imported in Task 9 ✅
- `ExpertReportService.requestAccess(reportId: string)` used consistently ✅
- `PdfViewerPanel` prop is `viewMode` (not `mode` — avoid clash with page `mode` state) ✅
- `LibrarySidebar` receives both `selectedCategory` and `selectedId` — both used correctly ✅
