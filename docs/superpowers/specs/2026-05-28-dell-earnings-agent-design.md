# Dell Q1 FY2027 Earnings Monitoring Agent — Design Spec

**Date:** 2026-05-28  
**Status:** Approved

---

## Overview

A Node.js backend agent that autonomously monitors Dell's Q1 FY2027 earnings event. Once the earnings event begins, it fetches the press release and earnings call transcript every 10 minutes, uses Claude to extract financial metrics (with confidence scores) and generate an AI summary, records each **metrics cron run** with start/end time and confidence, and exposes the results via a REST API. A new page in the lego website displays the live data including job history.

---

## System Components

### Backend Agent (`dell-earnings-agent/`)

A single Node.js process with TypeScript. Runs as a persistent background server.

**Modules:**

| Module | Responsibility |
|--------|---------------|
| `index.ts` | Express server entry point; starts scheduler and API |
| `eventDateResolver.ts` | Uses Claude to determine Dell Q1 FY2027 earnings date on startup |
| `scheduler.ts` | Orchestrates cron-style polling via `setInterval`; manages state transitions; implements per-cron boolean lock to skip overlapping ticks |
| `dellIRFetcher.ts` | Fetches ir.dell.com; extracts press release text |
| `transcriptFetcher.ts` | Fetches earnings call transcript from Dell IR or Seeking Alpha |
| `claudeParser.ts` | Structured extraction of Revenue, Margin, DOI, QoQ, YoY from press release |
| `claudeTranscriptSummarizer.ts` | Generates structured AI summary (highlights, risks, outlook, key quotes) |
| `dataStore.ts` | In-memory store + persists to `state.json` for crash recovery |

### Website Page (`app/earnings-agent/`)

New static page in the lego Next.js app. Fetches the agent REST API client-side and displays:
- Agent status badge (WAITING / LIVE / DONE)
- Event date and countdown
- Financial metrics cards (Revenue, Gross Margin, DOI with QoQ/YoY deltas and per-metric confidence %)
- Overall extraction confidence badge
- AI Transcript Summary tab (highlights, risks, outlook, key quotes)
- Job history log table (every 10-min **metrics cron** run: start time, end time, status, overall confidence)
- Last updated timestamp

---

## Agent Lifecycle (State Machine)

```
STARTUP
  └─▶ EventDateResolver resolves Dell Q1 FY2027 earnings date
        └─▶ If current time >= eventDate → skip WAITING, enter LIVE immediately
        └─▶ If current time < eventDate  → WAITING (one-shot setTimeout scheduled for eventDate; fires on or after that time subject to event-loop delay)
              └─▶ LIVE  (metricsCron: every 10 minutes; transcriptCron: every 10 minutes, separate instance)
                    metricsCron:
                    ├─▶ DellIRFetcher → fetch press release
                    ├─▶ ClaudeParser  → extract metrics
                    └─▶ DataStore → persist; append JobRecord
                          └─▶ METRICS_DONE when _lastMetricsSnapshot is non-null (success-tier),
                                            all 3 prior metrics non-null AND current tick is
                                            'success' (all 3 non-null, confidence≥50) with
                                            value fields identical (compare pre-update; snapshot
                                            updated after check; metricsExtracted=false resets)
                                            (metricsCron stops; transcriptCron continues independently)
```

**Two independent crons run in parallel during LIVE state:**
- **`metricsCron`** — fires every 10 minutes; fetches press release, extracts metrics, appends `JobRecord`. Stops when metrics reach DONE condition.
- **`transcriptCron`** — fires every 10 minutes (same cadence, separate `setInterval` instance); fetches transcript and/or generates summary. Continues independently even after `metricsCron` stops; stops when transcript reaches a terminal state.

**Transcript cron logic:**

```
LIVE (transcriptCron: every 10 minutes, separate from metricsCron)
  ├─▶ SKIP if transcriptStatus = 'unavailable'              (terminal — stop forever)
  ├─▶ SKIP if transcriptStatus = 'available'
  │         AND transcriptSummary is non-null               (fully done — stop forever)
  │
  ├─▶ If transcriptStatus = 'pending' (_transcriptAttempts < 12):
  │     → TranscriptFetcher → fetch transcript
  │     → if `kind='not_found_yet'` (source loaded, no transcript link/content yet): increment _transcriptAttempts, retry next interval
  │     → if `kind='error'` (network / scrape failure): increment _transcriptAttempts, retry next interval
  │     → if `kind='found'`: set transcriptStatus = 'available', store raw text, set transcriptRawFetchedAt = now(), reset _summaryAttempts = 0; **then immediately fall through to the summary branch below in the same tick** (do not wait for the next interval)
  │     → After 12 retryable returns (not_found_yet or error): set transcriptStatus = 'unavailable', stop cron
  │
  └─▶ If transcriptStatus = 'available' AND transcriptSummary is null AND _summaryAttempts < 3:
        → ClaudeTranscriptSummarizer → generate summary
        → if success: set transcriptSummary, set transcriptSummaryUpdatedAt = now(), stop transcriptCron
        → if error: increment _summaryAttempts, retry next interval
        → After 3 failed summary attempts (_summaryAttempts >= 3): **stop transcriptCron**;
          transcriptSummary stays null permanently; UI stays on "Generating summary…" indefinitely

  └─▶ If transcriptStatus = 'available' AND transcriptSummary is null AND _summaryAttempts >= 3:
        → **skip tick immediately; no-op** (cron should already be stopped, but guard prevents runaway loops)
```

**Metrics cron tick (every 10 minutes):**

Each cron tick is recorded as a `JobRecord` in `jobHistory` via `dataStore.appendJobRecord()`:
- `startTime`: set at the top of the tick handler
- `endTime`: set after all work completes (metrics fetch + extraction attempt)
- `status` rules:
  - `'skipped'` — press release not yet posted (`fetchPressRelease` returns null — source reachable, no matching content yet); `note` = `"Press release not yet available"`
  - `'failed'` — unhandled exception or Claude API error; `error` = exception message
  - `'partial'` — extraction completed but `metricsConfidence < 50` OR any of revenue/grossMargin/doi is null; `note` = brief reason (e.g., `"Confidence 42/100"` or `"doi unavailable"`)
  - `'success'` — all three metrics non-null AND `metricsConfidence >= 50`
- `metricsConfidence`: the overall confidence returned by Claude; null when status = 'failed' or 'skipped'
- `metricsExtracted`: true if at least one non-null metric was stored this tick

**When `metricsExtracted = false`** (status `'failed'`, `'skipped'`, or `'partial'` with **all metrics null**): the public fields `metrics`, `metricsConfidence`, and `metricsUpdatedAt` are **left unchanged** (last successfully extracted values are preserved). The tick still writes a `JobRecord` with the appropriate status.

**When `metricsExtracted = true`** (status `'success'` or `'partial'` with **at least one non-null metric**): store the partial or full data; update `metrics`, `metricsConfidence`, and `metricsUpdatedAt`.
- `error`: non-null only when status = 'failed'
- `note`: non-null when status = 'partial' or 'skipped'

**jobHistory scope:** Only `metricsCron` ticks generate `JobRecord` entries. `transcriptCron` never writes to `jobHistory`. Transcript-only retry ticks (after metricsCron stops) do NOT append to jobHistory. History is frozen (no new entries added) once status transitions to DONE.

**Terminal tick ordering:** On the tick that triggers the DONE transition (stabilization condition met), `dataStore.appendJobRecord()` is called **before** `dataStore.setState({ status: 'DONE' })`, so the final JobRecord is included in the frozen history.

**Lock-skip behavior:** If a `metricsCron` tick fires while the previous tick is still running (boolean lock is held), the new tick is **silently dropped** — no `JobRecord` is created and no warning is shown to the user. Only the agent log receives a warning. This prevents double-counting in the job history.

The `status` field transitions:
- `WAITING` → `LIVE`: triggered by a one-shot `setTimeout` scheduled for `eventDate` (fires on or after that time, subject to event-loop delay). On transition, `metricsCron` and `transcriptCron` start and **both fire their first tick immediately** (no 10-minute wait).
- `LIVE` → `DONE`: triggered by `metricsCron` when the **stabilization condition** is met. Evaluation order within each tick:
  1. **Compare first (pre-update):** check whether `_lastMetricsSnapshot` is non-null, all three of its stored `revenue`, `grossMargin`, `doi` values are non-null, **and the snapshot was set by a `'success'` tick** (metricsConfidence ≥ 50), AND the current tick also has status `'success'` (all three metrics non-null, metricsConfidence ≥ 50) with each metric's `value` strictly equal to the corresponding snapshot `value`.
  2. **Then update/reset:** if `metricsExtracted = true`, update `_lastMetricsSnapshot` to the current `metrics` and record whether the tick was `'success'`; if `metricsExtracted = false`, reset `_lastMetricsSnapshot = null`.
  This ordering ensures a single tick can never self-match (snapshot reflects the prior tick, not the current one). Only the `value` field is compared; `qoq`, `yoy`, and `confidence` are excluded from the value comparison. Both ticks must be `'success'` to prevent early DONE on low-confidence partial ticks.

**`_lastMetricsSnapshot` update rules:**
- After every `metricsCron` tick with status `'success'` (all 3 non-null, confidence ≥ 50): update `_lastMetricsSnapshot` to the current `metrics` and mark snapshot as success-tier.
- After every `metricsCron` tick with `metricsExtracted = true` but status `'partial'`: update `_lastMetricsSnapshot` to the current `metrics` but mark as partial-tier (cannot satisfy stabilization as the snapshot side).
- After any tick with `metricsExtracted = false` (status `'failed'`, `'skipped'`, or `'partial'` with all-null metrics): reset `_lastMetricsSnapshot = null`.

The WAITING `setTimeout` is cancelled once LIVE is entered. The startup fast-path (skip WAITING, enter LIVE immediately) also fires both crons' first ticks immediately on boot.

**Restart when DONE but transcript pending:** On startup, if loaded state is `DONE` and transcript work is still retryable, resume the transcript cron using persisted counters (not from zero). Resume conditions:
- `transcriptStatus = 'pending'` AND `_transcriptAttempts < 12` → resume fetch cron
- `transcriptStatus = 'available'` AND `transcriptSummary = null` AND `_summaryAttempts < 3` → resume summary cron
- If `_transcriptAttempts >= 12` or `_summaryAttempts >= 3`, counters are exhausted — do NOT restart; terminal state is already correct.

State is persisted to `state.json` so the agent can resume after a restart without losing previous poll results.

---

## REST API

**Base URL:** `http://localhost:3001` (port configurable via `PORT` env var on the agent)

**Frontend URL discovery:** The lego website page reads `process.env.NEXT_PUBLIC_AGENT_URL` at build time. Default value is `http://localhost:3001`. To deploy with a different host, set `NEXT_PUBLIC_AGENT_URL=http://<host>:<port>` in the lego `.env.local` before running `npm run build`.

**CORS:** Enabled for all origins on every endpoint (the lego static site fetches from a different origin).

### `GET /api/earnings`

Returns current agent state and all collected data.

```json
{
  "status": "WAITING | LIVE | DONE",
  "eventDate": "2026-05-29T20:30:00Z",
  "lastUpdated": "2026-05-28T11:40:00Z",
  "metrics": {
    "revenue":      { "value": 23.9, "unit": "B",    "qoq": 2.3,  "yoy": 5.1,  "confidence": 95 },
    "grossMargin":  { "value": 22.1, "unit": "%",    "qoq": -0.4, "yoy": 1.2,  "confidence": 88 },
    "doi":          { "value": 34,   "unit": "days", "qoq": -2,   "yoy": -3,   "confidence": 72 }
  },
  "metricsConfidence": 85,
  "metricsUpdatedAt": "ISO timestamp or null",
  "transcriptStatus": "pending | available | unavailable",
  "transcript": "full raw transcript text or null",
  "transcriptSummary": {
    "highlights": ["...", "..."],
    "risks":      ["...", "..."],
    "outlook":    "narrative paragraph...",
    "keyQuotes":  ["CEO: ...", "CFO: ..."]
  },
  "transcriptRawFetchedAt": "ISO timestamp or null",
  "transcriptSummaryUpdatedAt": "ISO timestamp or null",
  "jobHistory": [
    {
      "jobId": "job-1",
      "startTime": "2026-05-29T20:30:00Z",
      "endTime": "2026-05-29T20:30:45Z",
      "status": "success | partial | failed | skipped",
      "metricsConfidence": 85,
      "metricsExtracted": true,
      "error": null,
      "note": null
    }
  ]
}
```

`lastUpdated` is updated on every `setState()` call AND every `appendJobRecord()` call, and reflects the most recent change to any field. It is always non-null after startup.

`jobHistory` accumulates all job records from the start of LIVE state until DONE. Each entry covers one 10-minute cron tick. History is frozen (no new entries added) once status reaches DONE.

### `GET /api/health`

Returns `{ "ok": true, "status": "<current state>" }`.

---

## Data Sources

| Data | Source |
|------|--------|
| Earnings date | Claude (web search / knowledge) on agent startup |
| Press release | ir.dell.com investor relations page |

### Content Matching Rules

Both fetchers receive `eventDate: Date` and `targetQuarter: string` (e.g. `"Q1 FY2027"`) and must reject content that does not match the target event:
- **Press release:** accept only items whose title/URL contains **both** a quarter token (one of: `Q1`, `first quarter`, `1st quarter`) **and** a fiscal-year token (one of: `FY2027`, `fiscal 2027`, `fiscal year 2027`), AND whose publish date is within ±3 days of `eventDate` (see date normalization rules below).
- **Transcript:** accept only items whose title/URL contains **both** a quarter token (same list as above) **and** a year token. For transcripts, the accepted year tokens are: all fiscal-year tokens above (`FY2027`, `fiscal 2027`, `fiscal year 2027`) **plus** the plain four-digit year from the FY label (`2027`) **plus** the four-digit calendar year of `eventDate` (e.g. `2026`, derived from `eventDate.getUTCFullYear()`). This covers both Seeking Alpha's `"Q1 2027 Earnings Call"` style and press releases dated in the actual event calendar year. Page date must be on or after `eventDate` (UTC calendar-date comparison). Older-quarter transcripts on the same page must be skipped.

**Token matching normalization:** all title/URL token comparisons are **case-insensitive** and **punctuation-normalized** (strip or replace hyphens, underscores, extra whitespace before comparison). For example, `"Q1-FY2027"`, `"q1 fy2027"`, and `"Q1 FY 2027"` should all match.

**Date normalization:** when a source page exposes only a calendar date (no time component), compare at day granularity using **UTC** for all sources. Do not reject same-day content solely because the time component is unavailable.

### `transcriptFetcher.ts` — Transcript Source Strategy

Tries sources in priority order; stops at first success:

1. **Dell IR page** (`ir.dell.com/news-events/events-calendar`) — look for a transcript link on the earnings event page
2. **Seeking Alpha** (`seekingalpha.com/symbol/DELL/earnings/transcripts`) — public transcript page scrape
3. **Not available** — all sources exhausted for this tick; the fetcher returns `{ kind: 'not_found_yet' }` or `{ kind: 'error' }`. The `unavailable` terminal state is **never set by the fetcher**; it is set by `scheduler.ts` only after 12 total retryable returns.

The module exposes a single `fetchTranscript(eventDate: Date, targetQuarter: string): Promise<{ kind: 'found'; transcript: string } | { kind: 'not_found_yet' } | { kind: 'error'; message: string }>` function. Return semantics:
- `kind='found'` — transcript text successfully retrieved
- `kind='not_found_yet'` — source pages loaded successfully but no transcript link or content found yet (not yet posted)
- `kind='error'` — network failure, scrape error, or HTTP error; `message` contains the reason

Both `not_found_yet` and `error` are retryable; `scheduler.ts` increments `_transcriptAttempts` for either and declares terminal `transcriptStatus='unavailable'` after 12 total retryable returns. `transcriptFetcher.ts` performs no direct state mutations.

**Multi-source aggregation:** sources are tried in order (Dell IR first, then Seeking Alpha); the function returns the first `kind='found'` result. If one source returns `error` and another returns `not_found_yet`, the function returns `not_found_yet` (precedence: `found` > `not_found_yet` > `error`). Only if all sources return `error` does the function return `error`.

---

## Claude Usage

### `claudeParser.ts` — Metric Extraction

Sends press release HTML/text to Claude with a structured prompt requesting JSON output:
- Revenue (value in $B, QoQ %, YoY %, confidence 0–100)
- Gross Margin (%, QoQ delta in pp, YoY delta in pp, confidence 0–100)
- Days of Inventory Outstanding / DOI (days, QoQ delta in days, YoY delta in days, confidence 0–100)
- Overall extraction confidence (0–100): Claude self-rates how complete and unambiguous the source data was

Claude is instructed to lower confidence when: values are inferred rather than explicitly stated, source text is incomplete, or QoQ/YoY comparisons are unavailable.

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

**Full boot sequence (`index.ts`):**
1. Load `state.json` if it exists and is valid:
   - If loaded state has `eventDate` set and status is `WAITING`, `LIVE`, or `DONE` → skip Claude date resolution; use persisted state
   - If loaded state is `WAITING` and `currentTime >= eventDate` → upgrade status to `LIVE` in memory before HTTP server starts
   - **Schema defaulting:** if `_lastSnapshotIsSuccess` is missing from loaded state (older `state.json`), default it to `false` — this conservatively treats any existing snapshot as partial-tier, ensuring DONE is not triggered until two fresh success-tier ticks are observed.
   - If `state.json` is missing, corrupted, or `eventDate` is null → proceed to step 2
2. Run `eventDateResolver` to determine `eventDate` (Claude → env var → fatal exit); create fresh initial `AgentState`
3. Apply the initial status decision: if `currentTime >= eventDate`, set status to `LIVE` now (do not expose a WAITING state that would immediately flip); otherwise status = `WAITING`
4. **Start HTTP server** (only now — state is fully initialized; API always returns the correct status and non-null `eventDate`)
5. Start scheduler — branch by loaded/resolved status:
   - `WAITING`: schedule a one-shot `setTimeout` to fire at `eventDate` (milliseconds until event); on fire, transition to LIVE and start both crons immediately
   - `LIVE` (persisted or just transitioned): start `metricsCron` + `transcriptCron`; fire both first ticks immediately (no 10-minute wait)
   - `DONE` with retryable transcript (see resume conditions): start `transcriptCron` only using persisted counters; **fire first tick immediately** (no 10-minute wait), then repeat every 600,000 ms; do NOT re-enter LIVE or reset metrics
   - `DONE` with exhausted counters: no crons; serve final state read-only

---

## Configuration

Environment variables (`.env` file in `dell-earnings-agent/`):

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
EARNINGS_DATE=          # optional fallback: ISO datetime UTC (used only if Claude cannot determine the date)
LOG_LEVEL=info
```

The poll interval is fixed at **10 minutes** in both `metricsCron` and `transcriptCron`. Each cron fires its first tick immediately on start, then **schedules tick attempts** every 600,000 ms via `setInterval` (not a wall-clock `*/10 * * * *` expression), anchored after the immediate first tick. Lock-skips or slow ticks may cause executed ticks to be more than 10 minutes apart; the 600,000 ms interval governs scheduling only. The website's polling `setInterval` is also fixed at 600,000 ms. None of these are configurable, to avoid frontend/backend clock drift.

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
1. **Status bar** — agent status badge (WAITING / LIVE / DONE) + event date + last-updated timestamp. When status is `WAITING`, show a live countdown to the event date (days / hours / minutes / seconds, updated every second via `setInterval(1000)`). The countdown is hidden when `Date.now() >= new Date(eventDate).getTime()` (local clock comparison), so it disappears at the correct moment even if the next API poll hasn't arrived yet.
2. **Metrics section** — three cards: Revenue, Gross Margin, DOI. Each shows value, QoQ delta (▲▼ in pp or days, or "N/A" if null), YoY delta (▲▼ or "N/A" if null), and per-metric confidence badge (e.g., "95% confidence"). An overall confidence badge (from `metricsConfidence`) is shown at the top of the section.
   - Hidden when `status = 'WAITING'`
   - When `status = 'LIVE'` and `metrics = null` (no extraction yet): show section header with a "Awaiting first extraction…" placeholder in place of all three cards
   - When `status = 'LIVE'` and a specific metric object is `null` (partial extraction): render that card with a "—" placeholder and no confidence badge
3. **Transcript Summary section** — rendering driven by `transcriptStatus`:

   | `transcriptStatus` | `transcriptSummary` | UI shown |
   |--------------------|---------------------|----------|
   | `'pending'` | `null` | Section hidden entirely |
   | `'unavailable'` | `null` | "Transcript unavailable" message |
   | `'available'` | `null` | "Generating summary…" placeholder |
   | `'available'` | object | Full tabbed summary (Highlights / Risks / Outlook / Key Quotes) |

4. **Job History section** — table of all metrics cron jobs since LIVE began. Columns: Job ID, Start Time, End Time, Duration, Status (success/partial/failed/skipped badge), Overall Confidence, Note. Hidden when `jobHistory` is empty. The section header shows total job count. History is frozen once status = DONE; transcript-only ticks after DONE do not appear.
5. **Loading/error states** — spinner on initial mount fetch; error banner if agent unreachable.

Client-side data fetching: fetch immediately on component mount, then repeat every 10 minutes (600,000 ms) via `setInterval`. Additionally, schedule a one-shot `setTimeout` to fire at `new Date(eventDate).getTime() - Date.now()` ms (i.e., exactly when the countdown reaches zero) to trigger an immediate refetch — this prevents a page opened just before the event from staying stale in WAITING state for up to 10 minutes. Both the initial fetch, interval, and one-shot use the same `NEXT_PUBLIC_AGENT_URL` base URL.

**i18n:** All UI labels support zh/en via `useLanguage()`. Company names, metric values, and transcript text are not translated.

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Dell IR page unreachable | Log error, retry on next interval; JobRecord status = 'failed', error = exception message |
| Press release not yet posted | Keep status LIVE, retry next interval; JobRecord status = 'skipped', note = "Press release not yet available" |
| Transcript fetch returns `not_found_yet` or `error` 12 times total | Set `transcriptStatus = 'unavailable'`, stop transcript cron; UI shows "Transcript unavailable"; no JobRecord added (transcript-only tick) |
| Transcript summarization fails 3 consecutive times | Stop summary retries; `transcriptSummary` stays `null`; UI shows "Generating summary…" permanently; no JobRecord added |
| Claude returns malformed JSON | Log error, discard response, keep last successful data, retry next interval; JobRecord status = 'failed', error = parse error message |
| Claude returns partial metrics (some of revenue/grossMargin/doi null, at least one non-null) | Store partial data (`metricsExtracted=true`); update `metrics`/`metricsConfidence`/`metricsUpdatedAt`; JobRecord status = 'partial', note = "<field> unavailable" |
| Claude returns all-null metrics | Do NOT overwrite public metrics; `metricsExtracted=false`; JobRecord status = 'partial', note = "All metrics null" |
| Claude returns low-confidence metrics (`metricsConfidence < 50`) | Store data; JobRecord status = 'partial', note = "Confidence <N>/100"; website shows confidence badge in warning color |
| Claude API error (rate limit, network, 5xx) | Log error, keep last successful data, retry next interval; JobRecord status = 'failed', error = API error message |
| Agent server unreachable | Website shows "Agent offline" error banner |
| Agent restart with valid `state.json` | Load persisted state on startup, resume from last known state and status |
| `state.json` corrupted or unparseable | Log warning, discard corrupted state, re-run `eventDateResolver`, then apply normal WAITING/LIVE boot decision based on current time |
| API response with HTTP error | Website shows error banner with status code; retries on next poll cycle |

---

## Typed Interfaces

```typescript
// Shared types (src/types.ts)
type AgentStatus = 'WAITING' | 'LIVE' | 'DONE';
type TranscriptStatus = 'pending' | 'available' | 'unavailable';
type JobStatus = 'success' | 'partial' | 'failed' | 'skipped';

interface MetricValue {
  value:      number;                   // always present if MetricValue is non-null
  unit:       'B' | '%' | 'days';       // constrained to known units; claudeParser must validate
  qoq:        number | null;
  yoy:        number | null;
  confidence: number;       // 0–100, Claude self-rating for this metric
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

interface JobRecord {
  jobId:             string;          // generated by DataStore using _nextJobId: "job-1", "job-2", …
  startTime:         string;          // ISO UTC — when metricsCron tick began
  endTime:           string;          // ISO UTC — when metricsCron tick completed
  status:            JobStatus;       // 'success' | 'partial' | 'failed' | 'skipped'
  metricsConfidence: number | null;   // overall confidence from Claude (0–100), null if extraction not attempted or failed
  metricsExtracted:  boolean;         // true if at least one non-null metric was stored this tick
  error:             string | null;   // non-null only when status = 'failed' (exception/API error)
  note:              string | null;   // non-null when status = 'partial' or 'skipped'; human-readable reason
}

interface AgentState {
  // Public fields (exposed via GET /api/earnings)
  status:             AgentStatus;
  eventDate:          string | null;   // null only during startup resolution (before WAITING/LIVE/DONE is entered); HTTP server only starts accepting requests after resolution, so API callers always receive a non-null value
  lastUpdated:        string;                // ISO UTC; updated on every setState() call AND every appendJobRecord() call
  metrics:            EarningsMetrics | null;
  metricsConfidence:  number | null;         // overall extraction confidence (0–100), null before first extraction
  metricsUpdatedAt:   string | null;          // ISO UTC; updated whenever metrics are stored (metricsExtracted=true, status 'success' or 'partial'); unchanged on 'failed'/'skipped' ticks
  transcriptStatus:   TranscriptStatus;
  transcript:         string | null;
  transcriptSummary:  TranscriptSummary | null;
  transcriptRawFetchedAt:  string | null;   // set when transcriptStatus becomes 'available' (raw text fetch time)
  transcriptSummaryUpdatedAt: string | null; // set when transcriptSummary is successfully populated
  jobHistory:         JobRecord[];           // all job records; frozen after DONE

  // Internal fields (persisted to state.json, NOT exposed by API)
  _lastMetricsSnapshot:       EarningsMetrics | null;
  _lastSnapshotIsSuccess:     boolean;   // true if snapshot was set by a 'success' tick (confidence≥50); false if partial-tier
  _transcriptAttempts:        number;  // 0–12
  _summaryAttempts:           number;  // 0–3
  _nextJobId:                 number;  // counter for sequential job IDs
}

// GET /api/earnings response type (internal fields stripped; eventDate narrowed to non-null)
type EarningsApiResponse = Omit<AgentState,
  '_lastMetricsSnapshot' | '_lastSnapshotIsSuccess' |
  '_transcriptAttempts' | '_summaryAttempts' | '_nextJobId' | 'eventDate'>
  & { eventDate: string };

// Module interfaces
interface DellIRFetcher {
  // Returns null when source is reachable but no matching press release found yet (→ skipped JobRecord).
  // Throws on network/HTTP/scrape errors (→ failed JobRecord).
  fetchPressRelease(eventDate: Date, targetQuarter: string): Promise<string | null>;
}

interface ClaudeParser {
  // Returns metrics with per-metric confidence and overall confidence; throws on unrecoverable error
  parseMetrics(pressReleaseText: string): Promise<{ metrics: EarningsMetrics; overallConfidence: number }>;
}

interface DataStore {
  getState(): AgentState;
  // setState and appendJobRecord are synchronous and must only be called from within a
  // per-cron boolean lock (implemented in scheduler.ts). Node.js's single-threaded event loop
  // does NOT serialize overlapping async ticks once they await I/O — concurrent ticks can
  // interleave between awaits. Correctness depends entirely on the explicit lock: if a tick
  // fires while the prior tick's lock is held, the new tick is skipped (log a warning).
  // appendJobRecord() also bumps lastUpdated to keep the timestamp consistent with any state change.
  setState(patch: Partial<AgentState>): void;
  getPublicState(): EarningsApiResponse;
  // DataStore generates the jobId internally using _nextJobId; caller supplies all other fields.
  // Also bumps lastUpdated (same as setState) so jobHistory mutations are reflected in the timestamp.
  appendJobRecord(record: Omit<JobRecord, 'jobId'>): void;
  reset(): void;
}
```

`state.json` on disk has the same shape as `AgentState` (including `_` prefixed internal fields). `GET /api/earnings` returns `EarningsApiResponse` (internal fields stripped).

**API nullability by status:**

| Field | WAITING | LIVE | DONE |
|-------|---------|------|------|
| `eventDate` | string | string | string |
| `lastUpdated` | string | string | string |
| `metrics` | `null` | `null` or object (partial or full; null before first extraction) | object (all three non-null, stabilized) |
| `metricsConfidence` | `null` | `null` or number (null before first extraction) | number |
| `metricsUpdatedAt` | `null` | `null` or string (null before first extraction) | string |
| `transcriptStatus` | `'pending'` | `'pending'` or `'available'` or `'unavailable'` | any |
| `transcript` | `null` | string or `null` | string or `null` |
| `transcriptSummary` | `null` | object or `null` | object or `null` |
| `transcriptRawFetchedAt` | `null` | string or `null` | string or `null` |
| `transcriptSummaryUpdatedAt` | `null` | string or `null` | string or `null` |
| `jobHistory` | `[]` (empty array) | array (grows each metricsCron tick) | array (frozen, non-empty) |

## Out of Scope
- Historical earnings tracking (future iteration)
- Multiple company tracking (future iteration)
- Push notifications / webhooks
