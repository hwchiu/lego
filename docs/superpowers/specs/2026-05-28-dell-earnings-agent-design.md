# Dell Q1 FY2027 Earnings Monitoring Agent — Design Spec

**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

A Node.js backend agent that autonomously monitors Dell's Q1 FY2027 earnings event. Once the earnings event begins, it fetches the press release and earnings call transcript every 10 minutes, uses Claude to extract financial metrics and generate an AI summary, and exposes the results via a REST API. A new page in the lego website displays the live data.

---

## System Components

### Backend Agent (`dell-earnings-agent/`)

A single Node.js process with TypeScript. Runs as a persistent background server.

**Modules:**

| Module | Responsibility |
|--------|---------------|
| `index.ts` | Express server entry point; starts scheduler and API |
| `eventDateResolver.ts` | Uses Claude to determine Dell Q1 FY2027 earnings date on startup |
| `scheduler.ts` | node-cron orchestration; manages state transitions |
| `dellIRFetcher.ts` | Fetches ir.dell.com; extracts press release text |
| `transcriptFetcher.ts` | Fetches earnings call transcript from Dell IR or Seeking Alpha |
| `claudeParser.ts` | Structured extraction of Revenue, Margin, DOI, QoQ, YoY from press release |
| `claudeTranscriptSummarizer.ts` | Generates structured AI summary (highlights, risks, outlook, key quotes) |
| `dataStore.ts` | In-memory store + persists to `state.json` for crash recovery |

### Website Page (`app/earnings-agent/`)

New static page in the lego Next.js app. Fetches the agent REST API client-side and displays:
- Agent status badge (WAITING / LIVE / DONE)
- Event date and countdown
- Financial metrics cards (Revenue, Margin, DOI with QoQ/YoY deltas)
- AI Transcript Summary tab (highlights, risks, outlook, key quotes)
- Last updated timestamp

---

## Agent Lifecycle (State Machine)

```
STARTUP
  └─▶ EventDateResolver resolves Dell Q1 FY2027 earnings date
        └─▶ If current time >= eventDate → skip WAITING, enter LIVE immediately
        └─▶ If current time < eventDate  → WAITING (hourly cron checks if eventDate reached)
              └─▶ LIVE  (metrics cron: every 10 minutes)
                    ├─▶ DellIRFetcher → fetch press release
                    ├─▶ ClaudeParser  → extract metrics
                    └─▶ DataStore → persist
                          └─▶ METRICS_DONE when revenue, grossMargin, doi all non-null
                                            AND identical across 2 consecutive polls
                                            (metrics cron stops)
```

**Transcript lifecycle runs in parallel on the same 10-minute cron, independently of metrics:**

```
LIVE (transcript cron: every 10 minutes)
  ├─▶ SKIP if transcriptStatus = 'unavailable'              (terminal — stop forever)
  ├─▶ SKIP if transcriptStatus = 'available'
  │         AND transcriptSummary is non-null               (fully done — stop forever)
  │
  ├─▶ If transcriptStatus = 'pending' (_transcriptAttempts < 12):
  │     → TranscriptFetcher → fetch transcript
  │     → if null: increment _transcriptAttempts, retry next interval
  │     → if fetched: set transcriptStatus = 'available', store raw text, reset _summaryAttempts = 0
  │     → After 12 failed fetch attempts: set transcriptStatus = 'unavailable', stop cron
  │
  └─▶ If transcriptStatus = 'available' AND transcriptSummary is null (_summaryAttempts < 3):
        → ClaudeTranscriptSummarizer → generate summary
        → if success: set transcriptSummary, set transcriptUpdatedAt
        → if error: increment _summaryAttempts, retry next interval
        → After 3 failed summary attempts: set transcriptSummary = null permanently,
          UI stays on "Generating summary…" indefinitely (no further retries)
```

**DONE state** = METRICS_DONE (transcript cron may still be running). The `status` field transitions:
- `WAITING` → `LIVE` (on first metrics cron tick after eventDate)
- `LIVE` → `DONE` (once metrics are stable; transcript cron continues until fully done or both counters exhausted)

**Restart when DONE but transcript pending:** On startup, if loaded state is `DONE` and transcript work is incomplete (transcriptStatus = 'available' but transcriptSummary null, or transcriptStatus = 'pending'), resume the transcript cron using persisted `_transcriptAttempts` and `_summaryAttempts` (not from zero).

State is persisted to `state.json` so the agent can resume after a restart without losing previous poll results.

---

## REST API

**Base URL:** `http://localhost:3001` (port configurable via `PORT` env var on the agent)

**Frontend URL discovery:** The lego website page reads `process.env.NEXT_PUBLIC_AGENT_URL` at build time. Default value is `http://localhost:3001`. To deploy with a different host, set `NEXT_PUBLIC_AGENT_URL=http://<host>:<port>` in the lego `.env.local` before running `npm run build`.

### `GET /api/earnings`

Returns current agent state and all collected data.

```json
{
  "status": "WAITING | LIVE | DONE",
  "eventDate": "2026-05-29T20:30:00Z",
  "lastUpdated": "2026-05-28T11:40:00Z",
  "metrics": {
    "revenue":      { "value": 23.9, "unit": "B",    "qoq": 2.3,  "yoy": 5.1  },
    "grossMargin":  { "value": 22.1, "unit": "%",    "qoq": -0.4, "yoy": 1.2  },
    "doi":          { "value": 34,   "unit": "days", "qoq": -2,   "yoy": -3   }
  },
  "metricsUpdatedAt": "ISO timestamp or null",
  "transcriptStatus": "pending | available | unavailable",
  "transcript": "full raw transcript text or null",
  "transcriptSummary": {
    "highlights": ["...", "..."],
    "risks":      ["...", "..."],
    "outlook":    "narrative paragraph...",
    "keyQuotes":  ["CEO: ...", "CFO: ..."]
  },
  "transcriptUpdatedAt": "ISO timestamp or null"
}
```

`lastUpdated` is set by the server on every `setState()` call and reflects the most recent change to any field. It is always non-null after startup.

### `GET /api/health`

Returns `{ "ok": true, "status": "<current state>" }`.

**CORS:** Enabled for all origins (the lego static site fetches from a different origin).

---

## Data Sources

| Data | Source |
|------|--------|
| Earnings date | Claude (web search / knowledge) on agent startup |
| Press release | ir.dell.com investor relations page |
### `transcriptFetcher.ts` — Transcript Source Strategy

Tries sources in priority order; stops at first success:

1. **Dell IR page** (`ir.dell.com/news-events/events-calendar`) — look for a transcript link on the earnings event page
2. **Seeking Alpha** (`seekingalpha.com/symbol/DELL/earnings/transcripts`) — public transcript page scrape
3. **Not available** — returns `null`; the agent continues showing metrics without transcript section

The module exposes a single `fetchTranscript(eventDate: Date): Promise<string | null>` function. Callers do not need to know which source succeeded.

---

## Claude Usage

### `claudeParser.ts` — Metric Extraction

Sends press release HTML/text to Claude with a structured prompt requesting JSON output:
- Revenue (value in $B, QoQ %, YoY %)
- Gross Margin (%, QoQ delta in pp, YoY delta in pp)
- Days of Inventory Outstanding / DOI (days, QoQ delta in days, YoY delta in days)

Uses `claude-3-5-sonnet-20241022` with structured JSON response format.

### `claudeTranscriptSummarizer.ts` — Transcript Summary

Sends transcript text to Claude with a prompt requesting:
- **highlights**: 3–5 bullet points of key achievements
- **risks**: 2–4 bullet points of flagged concerns
- **outlook**: 1 paragraph on forward guidance
- **keyQuotes**: 3–5 notable executive quotes

Uses `claude-3-5-sonnet-20241022`.

### `eventDateResolver.ts` — Date Lookup

On startup, calls Claude asking for the Dell Q1 FY2027 earnings release date and time (UTC). Falls back to a configurable `EARNINGS_DATE` environment variable if Claude cannot determine it.

**Startup boot contract:**
1. Try Claude → parse ISO datetime from response
2. If Claude fails or returns unparseable output → read `EARNINGS_DATE` env var
3. If `EARNINGS_DATE` is also missing or invalid → **agent exits with a non-zero code** and logs:
   `FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env`

This guarantees the agent never enters WAITING with an undefined event date.

---

## Configuration

Environment variables (`.env` file in `dell-earnings-agent/`):

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
POLL_INTERVAL_MINUTES=10
EARNINGS_DATE=          # optional override: ISO datetime UTC
LOG_LEVEL=info
```

---

## Project Structure

```
dell-earnings-agent/
├── src/
│   ├── index.ts
│   ├── types.ts                    ← AgentState, EarningsApiResponse, all shared interfaces
│   ├── eventDateResolver.ts
│   ├── scheduler.ts
│   ├── dellIRFetcher.ts
│   ├── claudeParser.ts
│   ├── transcriptFetcher.ts
│   ├── claudeTranscriptSummarizer.ts
│   └── dataStore.ts
├── state.json          (gitignored — runtime persistence)
├── .env                (gitignored — secrets)
├── .env.example
├── package.json
├── tsconfig.json
└── README.md

app/earnings-agent/
├── page.tsx
└── EarningsAgentContent.tsx
```

---

## Website Page Design

**Route:** `/earnings-agent`  
**Nav entry:** Added to `app/data/navigation.ts` immediately after the existing `Earnings` entry (line ~111), with label `{ zh: '財報監控', en: 'Earnings Monitor' }`.

**Layout:**
1. **Status bar** — agent status badge + event date + last-updated timestamp
2. **Metrics section** — three cards: Revenue, Gross Margin, DOI. Each shows value, QoQ delta (▲▼ in pp or days, or "N/A" if null), YoY delta (▲▼ or "N/A" if null). Hidden when status is WAITING.
3. **Transcript Summary section** — rendering driven by `transcriptStatus`:

   | `transcriptStatus` | `transcriptSummary` | UI shown |
   |--------------------|---------------------|----------|
   | `'pending'` | `null` | Section hidden entirely |
   | `'unavailable'` | `null` | "Transcript unavailable" message |
   | `'available'` | `null` | "Generating summary…" placeholder |
   | `'available'` | object | Full tabbed summary (Highlights / Risks / Outlook / Key Quotes) |

4. **Loading/error states** — spinner on initial mount fetch; error banner if agent unreachable.

Client-side data fetching: fetch immediately on component mount, then repeat every 10 minutes (600,000 ms) via `setInterval`. Both the initial fetch and interval use the same `NEXT_PUBLIC_AGENT_URL` base URL.

**i18n:** All UI labels support zh/en via `useLanguage()`. Company names, metric values, and transcript text are not translated.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Dell IR page unreachable | Log error, retry on next interval |
| Press release not yet posted | Keep status LIVE, retry next interval |
| Transcript fetch fails 12 consecutive times | Set `transcriptStatus = 'unavailable'`, stop transcript cron; UI shows "Transcript unavailable" |
| Transcript summarization fails 3 consecutive times | Stop summary retries; `transcriptSummary` stays `null`; UI shows "Generating summary…" permanently |
| Claude returns malformed JSON | Log error, discard response, keep last successful data, retry next interval |
| Claude returns partial metrics (some fields null) | Store partial data; display available fields; mark missing fields as `null` in API response |
| Claude API error (rate limit, network, 5xx) | Log error, keep last successful data, retry next interval |
| Agent server unreachable | Website shows "Agent offline" error banner |
| Agent restart with valid `state.json` | Load persisted state on startup, resume from last known state and status |
| `state.json` corrupted or unparseable | Log warning, reset to WAITING state, re-resolve event date |
| API response with HTTP error | Website shows error banner with status code; retries on next poll cycle |

---

## Typed Interfaces

```typescript
// Shared types (src/types.ts)
type AgentStatus = 'WAITING' | 'LIVE' | 'DONE';
type TranscriptStatus = 'pending' | 'available' | 'unavailable';

interface MetricValue {
  value: number;       // always present if MetricValue is non-null
  unit: string;        // "B" | "%" | "days"
  qoq: number | null;  // null if prior-quarter comparison data unavailable
  yoy: number | null;  // null if prior-year comparison data unavailable
}

interface EarningsMetrics {
  revenue:     MetricValue | null;
  grossMargin: MetricValue | null;
  doi:         MetricValue | null;
}

interface TranscriptSummary {
  highlights: string[];
  risks:      string[];
  outlook:    string;
  keyQuotes:  string[];
}

interface AgentState {
  // Public fields (exposed via GET /api/earnings)
  status:               AgentStatus;
  eventDate:            string | null;         // ISO UTC
  lastUpdated:          string;                // ISO UTC; set on every setState() call
  metrics:              EarningsMetrics | null;
  metricsUpdatedAt:     string | null;
  transcriptStatus:     TranscriptStatus;      // 'pending' | 'available' | 'unavailable'
  transcript:           string | null;         // raw text when transcriptStatus = 'available'
  transcriptSummary:    TranscriptSummary | null;
  transcriptUpdatedAt:  string | null;

  // Internal fields (persisted to state.json, NOT exposed by API)
  _consecutivePollCount:  number;
  _lastMetricsSnapshot:   EarningsMetrics | null;
  _transcriptAttempts:    number;  // 0–12, fetch retry counter
  _summaryAttempts:       number;  // 0–3, summarization retry counter
}

// GET /api/earnings response type (internal fields stripped)
type EarningsApiResponse = Omit<AgentState, '_consecutivePollCount' | '_lastMetricsSnapshot' | '_transcriptAttempts'>;

// Module interfaces
interface DellIRFetcher {
  fetchPressRelease(): Promise<string | null>;  // returns press release plain text, or null if not posted
}

interface ClaudeParser {
  parseMetrics(pressReleaseText: string): Promise<EarningsMetrics>;  // throws on unrecoverable error
}

interface DataStore {
  getState(): AgentState;
  setState(patch: Partial<AgentState>): void;  // merges patch, persists to state.json synchronously
  getPublicState(): EarningsApiResponse;       // strips internal _ fields for API response
  reset(): void;                               // clears to initial WAITING state
}
```

`state.json` on disk has the same shape as `AgentState` (including `_` prefixed internal fields). `GET /api/earnings` returns `EarningsApiResponse` (internal fields stripped).

**API nullability by status:**

| Field | WAITING | LIVE | DONE |
|-------|---------|------|------|
| `eventDate` | string | string | string |
| `lastUpdated` | string | string | string |
| `metrics` | `null` | object (partial ok) | object |
| `metricsUpdatedAt` | `null` | string | string |
| `transcriptStatus` | `'pending'` | `'pending'` or `'available'` or `'unavailable'` | any |
| `transcript` | `null` | string or `null` | string or `null` |
| `transcriptSummary` | `null` | object or `null` | object or `null` |
| `transcriptUpdatedAt` | `null` | string or `null` | string or `null` |

## Out of Scope
- Historical earnings tracking (future iteration)
- Multiple company tracking (future iteration)
- Push notifications / webhooks
