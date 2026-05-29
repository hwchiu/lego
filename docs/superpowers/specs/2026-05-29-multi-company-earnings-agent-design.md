# Multi-Company Earnings Agent — Design Spec

**Date:** 2026-05-29  
**Status:** Approved  
**Author:** Copilot

---

## Overview

Extend the existing Dell earnings monitoring agent to support multiple companies simultaneously. Initial rollout adds Broadcom (AVGO) alongside Dell (DELL). Each company runs as an independent Node.js agent process. The `/earnings-agent/` page is refactored to display a company-selector list on the left and a full detail panel on the right.

---

## Goals

1. Support simultaneous monitoring of multiple companies (Dell + Broadcom to start)
2. Each company's agent is fully isolated — separate process, port, state, and config
3. UI shows left company list + right detail panel (Option C)
4. Add `metricsCreatedAt` and `transcriptSummaryCreatedAt` timestamps (first-creation, separate from last-updated)
5. Broadcom earnings date: `2026-06-03T21:00:00Z` (June 3 5 PM ET)

---

## Backend Architecture

### Approach: One Process Per Company

Each company is a standalone Node.js/Express agent with its own:
- Port (Dell: 3002, Broadcom: 3003)
- `.env` file (PORT, EARNINGS_DATE, GITHUB_TOKEN)
- `state.json` (gitignored, persisted on disk)
- Company-specific IR fetcher (uses SEC EDGAR with company CIK)

### Dell Agent (`dell-earnings-agent/`)

Minimal changes:
- `src/types.ts`: Add `metricsCreatedAt: string | null` and `transcriptSummaryCreatedAt: string | null` to `AgentState`
- `src/scheduler.ts`: Set `metricsCreatedAt` on first successful metric extraction (when currently `null`); set `transcriptSummaryCreatedAt` on first successful summary generation
- `src/dataStore.ts`: Include new fields in `makeInitialState()` defaulting to `null`
- `src/index.ts`: Default new fields in `loadState()` schema migration

### Broadcom Agent (`broadcom-earnings-agent/`)

New folder mirroring `dell-earnings-agent/` structure. Company-specific files:

- `src/avgoIRFetcher.ts`: EDGAR search using Broadcom CIK `1054374`, fetches 8-K earnings press release exhibit
- `src/transcriptFetcher.ts`: Adapted for Broadcom — tries (1) Motley Fool AVGO transcript, (2) EDGAR 8-K transcript exhibit, (3) EDGAR press release fallback
- `src/eventDateResolver.ts`: Same pattern — reads `EARNINGS_DATE` env var, falls back to AI resolution (query references "Broadcom Q2 FY2026")
- `.env`: `PORT=3003`, `EARNINGS_DATE=2026-06-03T21:00:00Z`, `GITHUB_TOKEN=<same token>`
- `package.json`, `tsconfig.json`: Copied from Dell agent

Generic files (copied verbatim): `types.ts`, `dataStore.ts`, `scheduler.ts`, `claudeParser.ts`, `claudeTranscriptSummarizer.ts`, `aiClient.ts`, `index.ts`

---

## Nginx Routing

Current Dell route `/earnings-api/` → port 3002 is replaced with company-specific routes:

```nginx
location /earnings-api/dell/ {
    proxy_pass http://localhost:3002/;
    ...
}

location /earnings-api/broadcom/ {
    proxy_pass http://localhost:3003/;
    ...
}
```

The old `/earnings-api/` route is removed to avoid ambiguity.

---

## New Type Fields

Added to `AgentState` in both agents:

```typescript
metricsCreatedAt:            string | null;  // ISO UTC — set ONCE on first successful extraction
transcriptSummaryCreatedAt:  string | null;  // ISO UTC — set ONCE on first summary generation
```

**Semantics:**
- `metricsCreatedAt`: set the first time `metricsExtracted === true` AND `metrics !== null`; never overwritten
- `metricsUpdatedAt`: already exists — updated every successful poll (unchanged)
- `transcriptSummaryCreatedAt`: set the first time `transcriptSummary` is written from `null`
- `transcriptSummaryUpdatedAt`: already exists — keep unchanged

---

## UI Changes (`app/earnings-agent/EarningsAgentContent.tsx`)

### Company Registry

Static config array in the component:

```typescript
const COMPANIES = [
  { id: 'dell',     ticker: 'DELL', name: 'Dell Technologies', quarter: 'Q1 FY2027', apiPath: '/earnings-api/dell' },
  { id: 'broadcom', ticker: 'AVGO', name: 'Broadcom Inc.',      quarter: 'Q2 FY2026', apiPath: '/earnings-api/broadcom' },
];
```

### Layout

```
┌─────────────────┬──────────────────────────────────────────┐
│ TopNav                                                      │
├─────────────────────────────────────────────────────────────┤
│ Banner                                                      │
├──────────┬──────────────────────────────────────────────────┤
│ Sidebar  │  main.main-content                              │
│          │  ┌──────────┬─────────────────────────────────┐ │
│          │  │ Company  │ Detail Panel                    │ │
│          │  │ List     │ - Status + event date           │ │
│          │  │          │ - Metrics grid (created/updated)│ │
│          │  │ [DELL ●] │ - Transcript summary            │ │
│          │  │ [AVGO ⏳]│ - Job history                   │ │
│          │  └──────────┴─────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────┘
```

### Polling

- Poll all companies every 30 seconds regardless of selected company
- Each company has independent loading/error state
- Status badge colors: WAITING=yellow, LIVE=green pulsing, DONE=grey

### Timestamp Display

Each data section shows two timestamps:
- `🕐 Created: <metricsCreatedAt>` (first time)
- `🔄 Updated: <metricsUpdatedAt>` (last update)

For transcript:
- `🕐 Fetched: <transcriptRawFetchedAt>` (first time)
- `✨ Summary created: <transcriptSummaryCreatedAt>` (first gen)
- `🔄 Summary updated: <transcriptSummaryUpdatedAt>` (if re-generated)

---

## Implementation Order

1. Update `dell-earnings-agent/` types + scheduler (add `metricsCreatedAt`, `transcriptSummaryCreatedAt`)
2. Create `broadcom-earnings-agent/` with all source files
3. Update nginx config (add broadcom route, rename dell route)
4. Update `EarningsAgentContent.tsx` for multi-company layout
5. Rebuild both agents, deploy Dell, start Broadcom
6. Rebuild Next.js UI and redeploy
7. Verify Dell data still shows; Broadcom shows WAITING status

---

## Out of Scope

- Auto-discovery of new companies (manual `COMPANIES` array is sufficient)
- Company-specific metric schemas (all companies use Revenue / Gross Margin / DOI)
- Admin UI for adding companies
