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
  └─▶ EventDateResolver asks Claude for Dell Q1 FY2027 earnings date
        └─▶ WAITING  (cron checks every hour if event date has arrived)
              └─▶ LIVE  (cron polls every 10 minutes)
                    ├─▶ DellIRFetcher → fetch press release
                    ├─▶ ClaudeParser  → extract metrics
                    ├─▶ TranscriptFetcher → fetch transcript
                    ├─▶ ClaudeTranscriptSummarizer → AI summary
                    └─▶ DataStore → persist state.json
                          └─▶ DONE  (when transcript captured and metrics stable)
```

State is persisted to `state.json` so the agent can resume after a restart without losing previous poll results.

---

## REST API

**Base URL:** `http://localhost:3001` (configurable via `PORT` env var)

### `GET /api/earnings`

Returns current agent state and all collected data.

```json
{
  "status": "WAITING | LIVE | DONE",
  "eventDate": "2026-05-29T20:30:00Z",
  "lastUpdated": "2026-05-28T11:40:00Z",
  "metrics": {
    "revenue":  { "value": 23.9, "unit": "B",    "qoq": 2.3,  "yoy": 5.1  },
    "margin":   { "value": 22.1, "unit": "%",    "qoq": -0.4, "yoy": 1.2  },
    "doi":      { "value": 34,   "unit": "days", "qoq": -2,   "yoy": -3   }
  },
  "metricsUpdatedAt": "ISO timestamp or null",
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

### `GET /api/health`

Returns `{ "ok": true, "status": "<current state>" }`.

**CORS:** Enabled for all origins (the lego static site fetches from a different origin).

---

## Data Sources

| Data | Source |
|------|--------|
| Earnings date | Claude (web search / knowledge) on agent startup |
| Press release | ir.dell.com investor relations page |
| Earnings call transcript | ir.dell.com or Seeking Alpha (public transcript) |

---

## Claude Usage

### `claudeParser.ts` — Metric Extraction

Sends press release HTML/text to Claude with a structured prompt requesting JSON output:
- Revenue (value, unit, QoQ %, YoY %)
- Gross/Operating Margin (value, QoQ %, YoY %)
- Days of Inventory (DOI) (value, QoQ delta, YoY delta)

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
**Nav entry:** Added to `app/data/navigation.ts` under a relevant section.

**Layout:**
1. **Status bar** — agent status badge + event date + last-updated timestamp
2. **Metrics section** — three cards: Revenue, Gross Margin, DOI. Each shows value, QoQ delta (▲▼), YoY delta (▲▼). Hidden when status is WAITING.
3. **Transcript Summary section** — tabbed: Highlights | Risks | Outlook | Key Quotes. Hidden when transcript not yet available.
4. **Loading/error states** — spinner when fetching, error banner if agent unreachable.

Client-side polling: `setInterval` at `POLL_INTERVAL_MINUTES * 60 * 1000` (default 10 min).

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Dell IR page unreachable | Log error, retry on next interval |
| Press release not yet posted | Keep status LIVE, retry next interval |
| Transcript not yet available | Metrics shown without transcript section |
| Claude API error | Log error, keep last successful data, retry next interval |
| Agent server unreachable | Website shows "Agent offline" error banner |
| Agent restart | Loads `state.json` on startup, resumes from last known state |

---

## Out of Scope

- Authentication on the REST API (local network use only)
- Historical earnings tracking (future iteration)
- Multiple company tracking (future iteration)
- Push notifications / webhooks
