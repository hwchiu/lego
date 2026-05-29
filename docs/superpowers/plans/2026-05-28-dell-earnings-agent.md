# Dell Earnings Agent Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Node.js/TypeScript background agent that monitors Dell Q1 FY2027 earnings, extracts financial metrics + transcript summary via Claude, exposes results via REST API, and displays them on a new lego website page.

**Architecture:** Node.js monolith in `dell-earnings-agent/` with Express + two independent `setInterval` crons + in-memory state persisted to `state.json`. Lego Next.js static page fetches from the agent API client-side.

**Tech Stack:** Node.js 20, TypeScript 5, Express 4, Axios, Cheerio, `@anthropic-ai/sdk`, Jest + ts-jest, Next.js 14 (lego page)

**Spec:** `docs/superpowers/specs/2026-05-28-dell-earnings-agent-design.md`

---

## Chunk 1: Scaffolding + Types

### Task 1: Agent project scaffolding

**Files:**
- Create: `dell-earnings-agent/package.json`
- Create: `dell-earnings-agent/tsconfig.json`
- Create: `dell-earnings-agent/jest.config.js`
- Create: `dell-earnings-agent/.env.example`
- Create: `dell-earnings-agent/.gitignore`
- Create: `dell-earnings-agent/README.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p dell-earnings-agent/src
mkdir -p dell-earnings-agent/__tests__
```

- [ ] **Step 2: Create `dell-earnings-agent/package.json`**

```json
{
  "name": "dell-earnings-agent",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "axios": "^1.7.0",
    "cheerio": "^1.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 3: Create `dell-earnings-agent/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create `dell-earnings-agent/jest.config.js`**

```js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

- [ ] **Step 5: Create `dell-earnings-agent/.env.example`**

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
EARNINGS_DATE=          # optional fallback: ISO datetime UTC e.g. 2026-05-29T20:30:00Z
LOG_LEVEL=info
```

- [ ] **Step 6: Create `dell-earnings-agent/.gitignore`**

```
node_modules/
dist/
state.json
.env
```

- [ ] **Step 7: Create `dell-earnings-agent/README.md`**

```markdown
# Dell Earnings Agent

Monitors Dell Q1 FY2027 earnings and exposes results via REST API.

## Setup

```bash
cp .env.example .env
# Edit .env — set ANTHROPIC_API_KEY
npm install
```

## Run

```bash
npm run dev          # development (ts-node)
npm run build        # compile to dist/
npm start            # production (compiled)
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |
| `PORT` | No | HTTP port (default: 3001) |
| `EARNINGS_DATE` | No | ISO UTC fallback if Claude can't resolve date |

## API

- `GET /api/earnings` — full agent state
- `GET /api/health` — `{ ok: true, status: "WAITING|LIVE|DONE" }`
```

- [ ] **Step 8: Install dependencies**

```bash
cd dell-earnings-agent && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 9: Verify TypeScript accepts empty project**

```bash
cd dell-earnings-agent && echo 'export {};' > src/placeholder.ts && npx tsc --noEmit && rm src/placeholder.ts
```

Expected: No errors.

- [ ] **Step 10: Commit**

```bash
git add dell-earnings-agent/
git commit -m "chore: scaffold dell-earnings-agent project"
```

---

### Task 2: Shared types

**Files:**
- Create: `dell-earnings-agent/src/types.ts`

- [ ] **Step 1: Create `dell-earnings-agent/src/types.ts`**

```typescript
// dell-earnings-agent/src/types.ts

export type AgentStatus = 'WAITING' | 'LIVE' | 'DONE';
export type TranscriptStatus = 'pending' | 'available' | 'unavailable';
export type JobStatus = 'success' | 'partial' | 'failed' | 'skipped';

export interface MetricValue {
  value:      number;
  unit:       'B' | '%' | 'days';
  qoq:        number | null;
  yoy:        number | null;
  confidence: number;  // 0–100
}

export interface EarningsMetrics {
  revenue:     MetricValue | null;
  grossMargin: MetricValue | null;
  doi:         MetricValue | null;
}

export interface TranscriptSummary {
  highlights: string[];
  risks:      string[];
  outlook:    string;
  keyQuotes:  string[];
}

export interface JobRecord {
  jobId:             string;          // "job-1", "job-2", …
  startTime:         string;          // ISO UTC
  endTime:           string;          // ISO UTC
  status:            JobStatus;
  metricsConfidence: number | null;   // null if not attempted
  metricsExtracted:  boolean;
  error:             string | null;   // non-null only when status='failed'
  note:              string | null;   // non-null when status='partial' or 'skipped'
}

export interface AgentState {
  // Public fields (returned by GET /api/earnings)
  status:                     AgentStatus;
  eventDate:                  string | null;
  lastUpdated:                string;
  metrics:                    EarningsMetrics | null;
  metricsConfidence:          number | null;
  metricsUpdatedAt:           string | null;
  transcriptStatus:           TranscriptStatus;
  transcript:                 string | null;
  transcriptSummary:          TranscriptSummary | null;
  transcriptRawFetchedAt:     string | null;
  transcriptSummaryUpdatedAt: string | null;
  jobHistory:                 JobRecord[];

  // Internal fields (persisted to state.json, NOT exposed by API)
  _lastMetricsSnapshot:   EarningsMetrics | null;
  _lastSnapshotIsSuccess: boolean;
  _transcriptAttempts:    number;  // 0–12
  _summaryAttempts:       number;  // 0–3
  _nextJobId:             number;
}

export type EarningsApiResponse = Omit<AgentState,
  '_lastMetricsSnapshot' | '_lastSnapshotIsSuccess' |
  '_transcriptAttempts' | '_summaryAttempts' | '_nextJobId' | 'eventDate'>
  & { eventDate: string };

export type TranscriptFetchResult =
  | { kind: 'found'; transcript: string }
  | { kind: 'not_found_yet' }
  | { kind: 'error'; message: string };

/** DataStore interface — shared contract used by scheduler and index. */
export interface DataStore {
  getState(): AgentState;
  getPublicState(): EarningsApiResponse;
  setState(patch: Partial<AgentState>): void;
  appendJobRecord(record: Omit<JobRecord, 'jobId'>): void;
  reset(): void;
}
```

- [ ] **Step 2: Verify types compile**

```bash
cd dell-earnings-agent && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add dell-earnings-agent/src/types.ts
git commit -m "feat: add shared TypeScript types for dell-earnings-agent"
```

---

## Chunk 2: DataStore

### Task 3: DataStore implementation

**Files:**
- Create: `dell-earnings-agent/src/dataStore.ts`
- Create: `dell-earnings-agent/__tests__/dataStore.test.ts`

The DataStore holds in-memory `AgentState` and writes `state.json` on every mutation. `setState` and `appendJobRecord` must only be called while holding the per-cron boolean lock (enforced in `scheduler.ts`; DataStore does not enforce it itself). `appendJobRecord` generates the `jobId` internally from `_nextJobId`.

- [ ] **Step 1: Write failing tests**

```typescript
// dell-earnings-agent/__tests__/dataStore.test.ts
import * as fs from 'fs';
import * as path from 'path';
import { createDataStore } from '../src/dataStore';
import { AgentState } from '../src/types';

const TMP = path.join(__dirname, 'test-state.json');

afterEach(() => { if (fs.existsSync(TMP)) fs.unlinkSync(TMP); });

function makeState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    status: 'WAITING',
    eventDate: null,
    lastUpdated: new Date().toISOString(),
    metrics: null,
    metricsConfidence: null,
    metricsUpdatedAt: null,
    transcriptStatus: 'pending',
    transcript: null,
    transcriptSummary: null,
    transcriptRawFetchedAt: null,
    transcriptSummaryUpdatedAt: null,
    jobHistory: [],
    _lastMetricsSnapshot: null,
    _lastSnapshotIsSuccess: false,
    _transcriptAttempts: 0,
    _summaryAttempts: 0,
    _nextJobId: 1,
    ...overrides,
  };
}

describe('createDataStore', () => {
  it('initialises with the provided state', () => {
    const store = createDataStore(makeState(), TMP);
    expect(store.getState().status).toBe('WAITING');
  });

  it('getPublicState strips all internal fields and narrows eventDate to string', () => {
    const store = createDataStore(makeState({ eventDate: '2026-05-29T20:30:00Z' }), TMP);
    const pub = store.getPublicState();
    expect('_lastMetricsSnapshot' in pub).toBe(false);
    expect('_lastSnapshotIsSuccess' in pub).toBe(false);
    expect('_transcriptAttempts' in pub).toBe(false);
    expect('_summaryAttempts' in pub).toBe(false);
    expect('_nextJobId' in pub).toBe(false);
    expect(pub.eventDate).toBe('2026-05-29T20:30:00Z');
  });

  it('setState patches state and persists to file', () => {
    const store = createDataStore(makeState(), TMP);
    store.setState({ status: 'LIVE' });
    expect(store.getState().status).toBe('LIVE');
    const persisted = JSON.parse(fs.readFileSync(TMP, 'utf8'));
    expect(persisted.status).toBe('LIVE');
  });

  it('setState updates lastUpdated', () => {
    const before = new Date().toISOString();
    const store = createDataStore(makeState(), TMP);
    store.setState({ status: 'LIVE' });
    expect(store.getState().lastUpdated >= before).toBe(true);
  });

  it('appendJobRecord adds record with sequential jobId', () => {
    const store = createDataStore(makeState(), TMP);
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'success',
      metricsConfidence: 85,
      metricsExtracted: true,
      error: null,
      note: null,
    });
    const state = store.getState();
    expect(state.jobHistory).toHaveLength(1);
    expect(state.jobHistory[0].jobId).toBe('job-1');
    expect(state._nextJobId).toBe(2);
  });

  it('appendJobRecord updates lastUpdated', () => {
    const before = new Date().toISOString();
    const store = createDataStore(makeState(), TMP);
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'skipped',
      metricsConfidence: null,
      metricsExtracted: false,
      error: null,
      note: 'Press release not yet available',
    });
    expect(store.getState().lastUpdated >= before).toBe(true);
  });

  it('appendJobRecord persists to file', () => {
    const store = createDataStore(makeState(), TMP);
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'failed',
      metricsConfidence: null,
      metricsExtracted: false,
      error: 'Network error',
      note: null,
    });
    const persisted = JSON.parse(fs.readFileSync(TMP, 'utf8'));
    expect(persisted.jobHistory).toHaveLength(1);
    expect(persisted.jobHistory[0].jobId).toBe('job-1');
  });

  it('reset restores initial state and persists to file', () => {
    const store = createDataStore(makeState(), TMP);
    store.setState({ status: 'LIVE' });
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'success',
      metricsConfidence: 85,
      metricsExtracted: true,
      error: null,
      note: null,
    });
    store.reset();
    expect(store.getState().status).toBe('WAITING');
    expect(store.getState().jobHistory).toHaveLength(0);
    expect(store.getState()._nextJobId).toBe(1);
    const persisted = JSON.parse(fs.readFileSync(TMP, 'utf8'));
    expect(persisted.status).toBe('WAITING');
    expect(persisted.jobHistory).toHaveLength(0);
    expect(persisted._nextJobId).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd dell-earnings-agent && npm test -- __tests__/dataStore.test.ts
```

Expected: FAIL with `Cannot find module '../src/dataStore'`.

- [ ] **Step 3: Implement `dell-earnings-agent/src/dataStore.ts`**

```typescript
import * as fs from 'fs';
import { AgentState, DataStore, EarningsApiResponse, JobRecord } from './types';

export function createDataStore(
  initialState: AgentState,
  stateFilePath: string = 'state.json',
): DataStore {
  let state: AgentState = { ...initialState };
  const initial: AgentState = { ...initialState };

  function persist(): void {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');
  }

  return {
    getState(): AgentState {
      return state;
    },

    getPublicState(): EarningsApiResponse {
      const {
        _lastMetricsSnapshot,
        _lastSnapshotIsSuccess,
        _transcriptAttempts,
        _summaryAttempts,
        _nextJobId,
        eventDate,
        ...rest
      } = state;
      return { ...rest, eventDate: eventDate! };
    },

    setState(patch: Partial<AgentState>): void {
      state = { ...state, ...patch, lastUpdated: new Date().toISOString() };
      persist();
    },

    appendJobRecord(record: Omit<JobRecord, 'jobId'>): void {
      const jobId = `job-${state._nextJobId}`;
      const entry: JobRecord = { ...record, jobId };
      state = {
        ...state,
        jobHistory: [...state.jobHistory, entry],
        _nextJobId: state._nextJobId + 1,
        lastUpdated: new Date().toISOString(),
      };
      persist();
    },

    reset(): void {
      state = { ...initial };
      persist();
    },
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd dell-earnings-agent && npm test -- __tests__/dataStore.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add dell-earnings-agent/src/dataStore.ts dell-earnings-agent/__tests__/dataStore.test.ts
git commit -m "feat: implement DataStore with in-memory state and state.json persistence"
```

---

## Chunk 3: Claude Modules

### Task 4: EventDateResolver

**Files:**
- Create: `dell-earnings-agent/src/eventDateResolver.ts`
- Create: `dell-earnings-agent/__tests__/eventDateResolver.test.ts`

Resolves Dell Q1 FY2027 earnings date. Priority: Claude → `EARNINGS_DATE` env var → fatal exit.

- [ ] **Step 1: Write failing tests**

```typescript
// dell-earnings-agent/__tests__/eventDateResolver.test.ts
import { resolveEventDate } from '../src/eventDateResolver';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');
const MockAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

function mockClaudeResponse(text: string) {
  MockAnthropic.prototype.messages = {
    create: jest.fn().mockResolvedValue({
      content: [{ type: 'text', text }],
    }),
  } as any;
}

function mockClaudeFailure() {
  MockAnthropic.prototype.messages = {
    create: jest.fn().mockRejectedValue(new Error('API error')),
  } as any;
}

const EXACT_FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

describe('resolveEventDate', () => {
  beforeEach(() => MockAnthropic.mockClear());

  it('returns EARNINGS_DATE env var when skipClaude=true', async () => {
    process.env.EARNINGS_DATE = '2026-05-29T20:30:00Z';
    const result = await resolveEventDate({ skipClaude: true });
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });

  it('throws FATAL with exact message when no env var and skipClaude=true', async () => {
    delete process.env.EARNINGS_DATE;
    await expect(resolveEventDate({ skipClaude: true })).rejects.toThrow(EXACT_FATAL);
  });

  it('throws FATAL with exact message when EARNINGS_DATE is not a valid ISO datetime', async () => {
    process.env.EARNINGS_DATE = 'not-a-date';
    await expect(resolveEventDate({ skipClaude: true })).rejects.toThrow(EXACT_FATAL);
    delete process.env.EARNINGS_DATE;
  });

  it('throws FATAL with exact message when EARNINGS_DATE has no T separator (date-only string)', async () => {
    process.env.EARNINGS_DATE = '2026-05-29';
    await expect(resolveEventDate({ skipClaude: true })).rejects.toThrow(EXACT_FATAL);
    delete process.env.EARNINGS_DATE;
  });

  it('returns Claude result and ignores EARNINGS_DATE when Claude succeeds', async () => {
    process.env.EARNINGS_DATE = '2026-01-01T00:00:00Z';  // different from Claude result
    mockClaudeResponse('2026-05-29T20:30:00Z');
    const result = await resolveEventDate();
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });

  it('falls back to EARNINGS_DATE when Claude API call rejects', async () => {
    process.env.EARNINGS_DATE = '2026-05-29T20:30:00Z';
    mockClaudeFailure();
    const result = await resolveEventDate();
    expect(result).toBe('2026-05-29T20:30:00Z');
    delete process.env.EARNINGS_DATE;
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd dell-earnings-agent && npm test -- __tests__/eventDateResolver.test.ts
```

Expected: FAIL with `Cannot find module '../src/eventDateResolver'`.

- [ ] **Step 3: Implement `dell-earnings-agent/src/eventDateResolver.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface Options {
  skipClaude?: boolean;  // set true in tests to skip actual API call
}

const FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

function isValidIsoDatetime(s: string): boolean {
  return s.includes('T') && !isNaN(new Date(s).getTime());
}

export async function resolveEventDate(opts: Options = {}): Promise<string> {
  if (!opts.skipClaude) {
    try {
      const client = new Anthropic();
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: [
            'What is the scheduled date and time (UTC) for Dell Technologies Q1 FY2027 earnings release?',
            'Reply with ONLY an ISO 8601 UTC datetime string like: 2026-05-29T20:30:00Z',
            'If you are unsure of the exact time, use 20:30:00Z as an after-market-close estimate.',
            'Do not include any other text.',
          ].join('\n'),
        }],
      });
      const text = response.content[0]?.type === 'text'
        ? response.content[0].text.trim()
        : '';
      if (isValidIsoDatetime(text)) return text;
    } catch (e) {
      console.warn('[eventDateResolver] Claude failed, falling back to env var:', e);
    }
  }

  const envDate = process.env.EARNINGS_DATE?.trim() ?? '';
  if (isValidIsoDatetime(envDate)) return envDate;

  throw new Error(FATAL);
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd dell-earnings-agent && npm test -- __tests__/eventDateResolver.test.ts
```

Expected: All 6 tests PASS.

---

### Task 5: ClaudeParser

**Files:**
- Create: `dell-earnings-agent/src/claudeParser.ts`
- Create: `dell-earnings-agent/__tests__/claudeParser.test.ts`

Sends press release text to Claude; parses structured JSON. Returns `{ metrics, overallConfidence }`. Throws on API error or malformed JSON.

- [ ] **Step 1: Write failing tests**

```typescript
// dell-earnings-agent/__tests__/claudeParser.test.ts
import { parseMetrics } from '../src/claudeParser';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');
const MockAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

function mockClaudeResponse(text: string) {
  MockAnthropic.prototype.messages = {
    create: jest.fn().mockResolvedValue({
      content: [{ type: 'text', text }],
    }),
  } as any;
}

describe('parseMetrics', () => {
  beforeEach(() => MockAnthropic.mockClear());

  it('parses full valid Claude response', async () => {
    mockClaudeResponse(JSON.stringify({
      revenue:     { value: 23.9, unit: 'B',    qoq: 2.3,  yoy: 5.1,  confidence: 95 },
      grossMargin: { value: 22.1, unit: '%',    qoq: -0.4, yoy: 1.2,  confidence: 88 },
      doi:         { value: 34,   unit: 'days', qoq: -2,   yoy: -3,   confidence: 72 },
      overallConfidence: 85,
    }));
    const result = await parseMetrics('press release text');
    expect(result.metrics.revenue?.value).toBe(23.9);
    expect(result.metrics.revenue?.unit).toBe('B');
    expect(result.metrics.grossMargin?.value).toBe(22.1);
    expect(result.metrics.doi?.value).toBe(34);
    expect(result.overallConfidence).toBe(85);
  });

  it('returns null metrics for null fields', async () => {
    mockClaudeResponse(JSON.stringify({
      revenue: null, grossMargin: null, doi: null,
      overallConfidence: 20,
    }));
    const result = await parseMetrics('empty text');
    expect(result.metrics.revenue).toBeNull();
    expect(result.metrics.grossMargin).toBeNull();
    expect(result.metrics.doi).toBeNull();
    expect(result.overallConfidence).toBe(20);
  });

  it('strips markdown fences before parsing', async () => {
    mockClaudeResponse('```json\n' + JSON.stringify({
      revenue: { value: 10, unit: 'B', qoq: null, yoy: null, confidence: 80 },
      grossMargin: null, doi: null, overallConfidence: 70,
    }) + '\n```');
    const result = await parseMetrics('text');
    expect(result.metrics.revenue?.value).toBe(10);
  });

  it('throws on malformed JSON from Claude', async () => {
    mockClaudeResponse('this is not json at all');
    await expect(parseMetrics('text')).rejects.toThrow();
  });

  it('normalises unknown unit to field-appropriate default', async () => {
    mockClaudeResponse(JSON.stringify({
      revenue:     { value: 23.9, unit: 'USD billions', qoq: null, yoy: null, confidence: 80 },
      grossMargin: { value: 22.1, unit: 'percent',      qoq: null, yoy: null, confidence: 80 },
      doi:         { value: 34,   unit: 'calendar days', qoq: null, yoy: null, confidence: 80 },
      overallConfidence: 75,
    }));
    const result = await parseMetrics('text');
    expect(result.metrics.revenue?.unit).toBe('B');
    expect(result.metrics.grossMargin?.unit).toBe('%');
    expect(result.metrics.doi?.unit).toBe('days');
  });

  it('clamps confidence to 0–100', async () => {
    mockClaudeResponse(JSON.stringify({
      revenue: { value: 10, unit: 'B', qoq: null, yoy: null, confidence: 150 },
      grossMargin: null, doi: null, overallConfidence: -5,
    }));
    const result = await parseMetrics('text');
    expect(result.metrics.revenue!.confidence).toBe(100);
    expect(result.overallConfidence).toBe(0);
  });

  it('throws when Claude API call rejects', async () => {
    MockAnthropic.prototype.messages = {
      create: jest.fn().mockRejectedValue(new Error('API unavailable')),
    } as any;
    await expect(parseMetrics('text')).rejects.toThrow('API unavailable');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd dell-earnings-agent && npm test -- __tests__/claudeParser.test.ts
```

Expected: FAIL with `Cannot find module '../src/claudeParser'`.

- [ ] **Step 3: Implement `dell-earnings-agent/src/claudeParser.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { EarningsMetrics, MetricValue } from './types';

const EXTRACTION_PROMPT = `You are a financial data extraction assistant.
Extract the following metrics from the provided Dell press release text and return ONLY valid JSON.
Return null for any metric not found or unclear.

Required JSON structure:
{
  "revenue":     { "value": <number in $B>, "unit": "B",    "qoq": <% change or null>, "yoy": <% change or null>, "confidence": <0-100> } | null,
  "grossMargin": { "value": <% value>,      "unit": "%",    "qoq": <pp delta or null>, "yoy": <pp delta or null>, "confidence": <0-100> } | null,
  "doi":         { "value": <days>,          "unit": "days", "qoq": <days delta or null>, "yoy": <days delta or null>, "confidence": <0-100> } | null,
  "overallConfidence": <0-100 integer>
}

Confidence guidelines:
- 90-100: value explicitly stated, all comparisons available
- 70-89: value stated, some comparisons inferred or partially available
- 50-69: value partially inferred or comparisons unavailable
- <50: value is estimated or source text is ambiguous / incomplete

Return ONLY the JSON object, no markdown fences, no other text.`;

type MetricField = 'revenue' | 'grossMargin' | 'doi';
const FIELD_UNITS: Record<MetricField, MetricValue['unit']> = {
  revenue: 'B',
  grossMargin: '%',
  doi: 'days',
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function parseMetricValue(raw: unknown, field: MetricField): MetricValue | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.value !== 'number') return null;
  return {
    value:      obj.value,
    unit:       FIELD_UNITS[field],
    qoq:        typeof obj.qoq === 'number' ? obj.qoq : null,
    yoy:        typeof obj.yoy === 'number' ? obj.yoy : null,
    confidence: typeof obj.confidence === 'number' ? clamp(obj.confidence) : 50,
  };
}

export async function parseMetrics(pressReleaseText: string): Promise<{
  metrics: EarningsMetrics;
  overallConfidence: number;
}> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `${EXTRACTION_PROMPT}\n\n---\n${pressReleaseText}`,
    }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
  // Strip markdown code fences if Claude wraps response despite instructions
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(cleaned);

  return {
    metrics: {
      revenue:     parseMetricValue(parsed.revenue, 'revenue'),
      grossMargin: parseMetricValue(parsed.grossMargin, 'grossMargin'),
      doi:         parseMetricValue(parsed.doi, 'doi'),
    },
    overallConfidence: typeof parsed.overallConfidence === 'number'
      ? clamp(parsed.overallConfidence)
      : 50,
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd dell-earnings-agent && npm test -- __tests__/claudeParser.test.ts
```

Expected: All 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add dell-earnings-agent/src/claudeParser.ts dell-earnings-agent/__tests__/claudeParser.test.ts
git commit -m "feat: implement ClaudeParser for metric extraction with confidence scoring"
```

---

### Task 6: ClaudeTranscriptSummarizer

**Files:**
- Create: `dell-earnings-agent/src/claudeTranscriptSummarizer.ts`
- Create: `dell-earnings-agent/__tests__/claudeTranscriptSummarizer.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// dell-earnings-agent/__tests__/claudeTranscriptSummarizer.test.ts
import { summarizeTranscript } from '../src/claudeTranscriptSummarizer';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('@anthropic-ai/sdk');
const MockAnthropic = Anthropic as jest.MockedClass<typeof Anthropic>;

function mockClaudeResponse(text: string) {
  MockAnthropic.prototype.messages = {
    create: jest.fn().mockResolvedValue({
      content: [{ type: 'text', text }],
    }),
  } as any;
}

describe('summarizeTranscript', () => {
  beforeEach(() => MockAnthropic.mockClear());

  it('returns structured TranscriptSummary from valid Claude response', async () => {
    mockClaudeResponse(JSON.stringify({
      highlights: ['Revenue beat by 3%', 'AI server demand strong'],
      risks:      ['Margin pressure from DRAM costs'],
      outlook:    'Q2 guidance raised on ISG strength.',
      keyQuotes:  ['CEO: "AI demand exceeds expectations"'],
    }));
    const result = await summarizeTranscript('transcript text');
    expect(result.highlights).toHaveLength(2);
    expect(result.risks).toHaveLength(1);
    expect(typeof result.outlook).toBe('string');
    expect(result.keyQuotes).toHaveLength(1);
  });

  it('tolerates missing array fields (defaults to empty array)', async () => {
    mockClaudeResponse(JSON.stringify({
      highlights: [],
      risks: null,
      outlook: 'Some outlook.',
      keyQuotes: undefined,
    }));
    const result = await summarizeTranscript('text');
    expect(result.risks).toEqual([]);
    expect(result.keyQuotes).toEqual([]);
  });

  it('strips markdown fences before parsing', async () => {
    mockClaudeResponse('```json\n' + JSON.stringify({
      highlights: ['One highlight'],
      risks: [],
      outlook: 'Stable.',
      keyQuotes: [],
    }) + '\n```');
    const result = await summarizeTranscript('text');
    expect(result.highlights[0]).toBe('One highlight');
  });

  it('throws on malformed JSON', async () => {
    mockClaudeResponse('not json');
    await expect(summarizeTranscript('text')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd dell-earnings-agent && npm test -- __tests__/claudeTranscriptSummarizer.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `dell-earnings-agent/src/claudeTranscriptSummarizer.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { TranscriptSummary } from './types';

const SUMMARY_PROMPT = `You are a financial analyst summarizing an earnings call transcript.
Return ONLY valid JSON with this exact structure:
{
  "highlights": ["3-5 key achievement bullet points as strings"],
  "risks":      ["2-4 flagged concern bullet points as strings"],
  "outlook":    "1 paragraph on forward guidance and management expectations",
  "keyQuotes":  ["3-5 notable executive quotes as strings, format: 'Name/Title: quote text'"]
}
Return ONLY the JSON object, no markdown fences, no other text.`;

export async function summarizeTranscript(transcriptText: string): Promise<TranscriptSummary> {
  const client = new Anthropic();
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `${SUMMARY_PROMPT}\n\n---\n${transcriptText}`,
    }],
  });

  const text = response.content[0]?.type === 'text' ? response.content[0].text.trim() : '';
  const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(cleaned);

  return {
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
    risks:      Array.isArray(parsed.risks)      ? parsed.risks      : [],
    outlook:    typeof parsed.outlook === 'string' ? parsed.outlook   : '',
    keyQuotes:  Array.isArray(parsed.keyQuotes)  ? parsed.keyQuotes  : [],
  };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd dell-earnings-agent && npm test -- __tests__/claudeTranscriptSummarizer.test.ts
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add dell-earnings-agent/src/claudeTranscriptSummarizer.ts dell-earnings-agent/__tests__/claudeTranscriptSummarizer.test.ts
git commit -m "feat: implement ClaudeTranscriptSummarizer"
```

---

## Chunk 4: Fetchers

### Task 7: DellIRFetcher

**Files:**
- Create: `dell-earnings-agent/src/dellIRFetcher.ts`
- Create: `dell-earnings-agent/__tests__/dellIRFetcher.test.ts`

`fetchPressRelease(eventDate, targetQuarter)`:
- Returns `string` — press release text when found
- Returns `null` — source reachable but no matching press release yet (→ `'skipped'` JobRecord)
- Throws — network / HTTP / scrape error (→ `'failed'` JobRecord)

Content matching: title must contain a quarter token AND a fiscal-year token; publish date within ±3 UTC calendar days of `eventDate`.

- [ ] **Step 1: Write failing tests for pure content-matching logic**

```typescript
// dell-earnings-agent/__tests__/dellIRFetcher.test.ts
import { normalizeText, matchesPressRelease } from '../src/dellIRFetcher';

describe('normalizeText', () => {
  it('lowercases input', () => {
    expect(normalizeText('Q1 FY2027')).toBe('q1 fy2027');
  });
  it('collapses hyphens to space', () => {
    expect(normalizeText('Q1-FY2027')).toBe('q1 fy2027');
  });
  it('collapses underscores to space', () => {
    expect(normalizeText('first_quarter')).toBe('first quarter');
  });
  it('collapses extra whitespace', () => {
    expect(normalizeText('  Q1   FY 2027  ')).toBe('q1 fy 2027');
  });
});

describe('matchesPressRelease', () => {
  const eventDate = new Date('2026-05-29T00:00:00Z');
  const q = 'Q1 FY2027';

  it('matches standard title within ±3 days', () => {
    expect(matchesPressRelease(
      'Dell Technologies Reports Q1 FY2027 Financial Results', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches "first quarter" + "fiscal 2027"', () => {
    expect(matchesPressRelease(
      'Dell Technologies First Quarter Fiscal 2027 Results', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches "1st quarter" + FY2027', () => {
    expect(matchesPressRelease(
      'Dell 1st Quarter FY2027 Earnings', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('rejects missing quarter token', () => {
    expect(matchesPressRelease(
      'Dell FY2027 Annual Report', '2026-05-29', eventDate, q
    )).toBe(false);
  });
  it('rejects missing fiscal-year token', () => {
    expect(matchesPressRelease(
      'Dell Q1 Financial Results', '2026-05-29', eventDate, q
    )).toBe(false);
  });
  it('rejects date 4 days before eventDate', () => {
    expect(matchesPressRelease(
      'Dell Q1 FY2027 Results', '2026-05-25', eventDate, q
    )).toBe(false);
  });
  it('accepts date exactly 3 days before eventDate', () => {
    expect(matchesPressRelease(
      'Dell Q1 FY2027 Results', '2026-05-26', eventDate, q
    )).toBe(true);
  });
  it('accepts date exactly 3 days after eventDate', () => {
    expect(matchesPressRelease(
      'Dell Q1 FY2027 Results', '2026-06-01', eventDate, q
    )).toBe(true);
  });
  it('matches hyphenated token Q1-FY2027', () => {
    expect(matchesPressRelease(
      'Dell Q1-FY2027 Earnings Release', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches fiscal year 2027 multi-word token', () => {
    expect(matchesPressRelease(
      'Dell Q1 Fiscal Year 2027 Results', '2026-05-29', eventDate, q
    )).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd dell-earnings-agent && npm test -- __tests__/dellIRFetcher.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `dell-earnings-agent/src/dellIRFetcher.ts`**

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';

const DELL_IR_NEWS_URL = 'https://investors.delltechnologies.com/news-releases';

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
}

const QUARTER_TOKENS = ['q1', 'first quarter', '1st quarter'];
const FISCAL_YEAR_TOKENS = ['fy2027', 'fiscal 2027', 'fiscal year 2027'];

function hasQuarterToken(norm: string): boolean {
  return QUARTER_TOKENS.some(t => norm.includes(t));
}

function hasFiscalYearToken(norm: string): boolean {
  return FISCAL_YEAR_TOKENS.some(t => norm.includes(t));
}

/**
 * Returns true if titleOrUrl matches the target quarter/year AND
 * publishDateStr is within ±3 UTC calendar days of eventDate.
 * publishDateStr may be a full ISO string or 'YYYY-MM-DD'.
 */
export function matchesPressRelease(
  titleOrUrl: string,
  publishDateStr: string,
  eventDate: Date,
  _targetQuarter: string,
): boolean {
  const norm = normalizeText(titleOrUrl);
  if (!hasQuarterToken(norm) || !hasFiscalYearToken(norm)) return false;

  const publishDay = new Date(publishDateStr.slice(0, 10) + 'T00:00:00Z');
  const eventDay = new Date(
    Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()),
  );
  const diffDays = Math.abs((publishDay.getTime() - eventDay.getTime()) / 86_400_000);
  return diffDays <= 3;
}

export async function fetchPressRelease(
  eventDate: Date,
  targetQuarter: string,
): Promise<string | null> {
  const listResponse = await axios.get(DELL_IR_NEWS_URL, { timeout: 15_000 });
  const $ = cheerio.load(listResponse.data);

  let pressReleaseUrl: string | null = null;

  $('a').each((_i, el) => {
    if (pressReleaseUrl) return;
    const title = $(el).text().trim();
    const href  = $(el).attr('href') ?? '';
    // Try to find a date in a nearby time element or fallback to eventDate
    const dateText =
      $(el).closest('li, article, tr, div').find('time').attr('datetime') ??
      $(el).parent().text().match(/\d{4}-\d{2}-\d{2}/)?.[0] ??
      eventDate.toISOString().slice(0, 10);

    if (matchesPressRelease(title + ' ' + href, dateText, eventDate, targetQuarter)) {
      pressReleaseUrl = href.startsWith('http') ? href : `https://investors.delltechnologies.com${href}`;
    }
  });

  if (!pressReleaseUrl) return null;

  const prResponse = await axios.get(pressReleaseUrl, { timeout: 15_000 });
  const $pr = cheerio.load(prResponse.data);
  const text =
    $pr('article').text().trim() ||
    $pr('main').text().trim()    ||
    $pr('body').text().trim();

  return text || null;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd dell-earnings-agent && npm test -- __tests__/dellIRFetcher.test.ts
```

Expected: All 10 tests PASS (pure unit tests; no network).

- [ ] **Step 5: Commit**

```bash
git add dell-earnings-agent/src/dellIRFetcher.ts dell-earnings-agent/__tests__/dellIRFetcher.test.ts
git commit -m "feat: implement DellIRFetcher with content-matching and date validation"
```

---

### Task 8: TranscriptFetcher

**Files:**
- Create: `dell-earnings-agent/src/transcriptFetcher.ts`
- Create: `dell-earnings-agent/__tests__/transcriptFetcher.test.ts`

`fetchTranscript(eventDate, targetQuarter)` tries Dell IR then Seeking Alpha. Returns the first `kind='found'` result. Multi-source precedence: `found > not_found_yet > error`.

Year tokens for transcript: fiscal-year tokens + plain FY label year (e.g. `2027`) + event calendar year (e.g. `2026`). Page date must be on or after `eventDate` (UTC, day granularity).

- [ ] **Step 1: Write failing tests**

```typescript
// dell-earnings-agent/__tests__/transcriptFetcher.test.ts
import { getTranscriptYearTokens, matchesTranscript } from '../src/transcriptFetcher';

describe('getTranscriptYearTokens', () => {
  it('includes fiscal-year tokens, plain FY label year, and event calendar year', () => {
    const tokens = getTranscriptYearTokens('Q1 FY2027', new Date('2026-05-29T00:00:00Z'));
    expect(tokens).toContain('fy2027');
    expect(tokens).toContain('fiscal 2027');
    expect(tokens).toContain('fiscal year 2027');
    expect(tokens).toContain('2027');   // plain FY label year
    expect(tokens).toContain('2026');   // event calendar year
  });

  it('does not duplicate the year when FY label year equals event calendar year', () => {
    const tokens = getTranscriptYearTokens('Q1 FY2026', new Date('2026-05-29T00:00:00Z'));
    const count2026 = tokens.filter(t => t === '2026').length;
    expect(count2026).toBe(1);
  });
});

describe('matchesTranscript', () => {
  const eventDate = new Date('2026-05-29T00:00:00Z');
  const q = 'Q1 FY2027';

  it('matches Seeking Alpha plain-year style title', () => {
    expect(matchesTranscript(
      'Dell Technologies Q1 2027 Earnings Call Transcript', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches event calendar year 2026 in title', () => {
    expect(matchesTranscript(
      'DELL Q1 2026 Earnings Call Transcript', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches FY2027 in title', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('rejects wrong quarter', () => {
    expect(matchesTranscript(
      'Dell Q2 FY2027 Earnings Call', '2026-05-29', eventDate, q
    )).toBe(false);
  });
  it('rejects page date before eventDate', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-05-28', eventDate, q
    )).toBe(false);
  });
  it('accepts page date exactly on eventDate', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('accepts page date after eventDate', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-06-01', eventDate, q
    )).toBe(true);
  });
  it('rejects title with no year token', () => {
    expect(matchesTranscript(
      'Dell Q1 Earnings Call Transcript', '2026-05-29', eventDate, q
    )).toBe(false);
  });
});

// ---- fetchTranscript integration tests ----

import axios from 'axios';
import { fetchTranscript } from '../src/transcriptFetcher';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('fetchTranscript', () => {
  const eventDate2 = new Date('2026-05-29T00:00:00Z');
  const quarter = 'Q1 FY2027';

  afterEach(() => jest.clearAllMocks());

  it('returns not_found_yet when both sources return no match', async () => {
    mockAxios.get.mockResolvedValue({ data: '<html><body>no match here</body></html>' });
    const result = await fetchTranscript(eventDate2, quarter);
    expect(result.kind).toBe('not_found_yet');
  });

  it('returns error when both sources throw', async () => {
    mockAxios.get.mockRejectedValue(new Error('network down'));
    const result = await fetchTranscript(eventDate2, quarter);
    expect(result.kind).toBe('error');
  });

  it('never throws — wraps errors in error result', async () => {
    mockAxios.get.mockRejectedValue(new Error('timeout'));
    await expect(fetchTranscript(eventDate2, quarter)).resolves.toBeDefined();
    const result = await fetchTranscript(eventDate2, quarter);
    expect(['found', 'not_found_yet', 'error']).toContain(result.kind);
  });

  it('prefers not_found_yet over error (first source = not_found_yet, second throws)', async () => {
    mockAxios.get
      .mockResolvedValueOnce({ data: '<html><body>no match</body></html>' })  // DellIR → not_found_yet
      .mockRejectedValueOnce(new Error('SA error'));                           // SeekingAlpha → error
    const result = await fetchTranscript(eventDate2, quarter);
    expect(result.kind).toBe('not_found_yet');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd dell-earnings-agent && npm test -- __tests__/transcriptFetcher.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `dell-earnings-agent/src/transcriptFetcher.ts`**

```typescript
import axios from 'axios';
import * as cheerio from 'cheerio';
import { TranscriptFetchResult } from './types';
import { normalizeText } from './dellIRFetcher';

const QUARTER_TOKENS = ['q1', 'first quarter', '1st quarter'];

/**
 * Returns all valid year tokens for transcript matching:
 * fiscal-year tokens, plain FY label year, and event calendar year.
 */
export function getTranscriptYearTokens(targetQuarter: string, eventDate: Date): string[] {
  const fyMatch = targetQuarter.match(/FY(\d{4})/i);
  const fyLabelYear = fyMatch?.[1] ?? '';
  const eventCalYear = String(eventDate.getUTCFullYear());

  const tokens: string[] = [];
  if (fyLabelYear) {
    tokens.push(`fy${fyLabelYear}`);
    tokens.push(`fiscal ${fyLabelYear}`);
    tokens.push(`fiscal year ${fyLabelYear}`);
    tokens.push(fyLabelYear);
  }
  if (eventCalYear && eventCalYear !== fyLabelYear) {
    tokens.push(eventCalYear);
  }
  return [...new Set(tokens)];
}

export function matchesTranscript(
  titleOrUrl: string,
  pageDateStr: string,
  eventDate: Date,
  targetQuarter: string,
): boolean {
  const norm = normalizeText(titleOrUrl);

  const hasQuarter = QUARTER_TOKENS.some(t => norm.includes(t));
  if (!hasQuarter) return false;

  const yearTokens = getTranscriptYearTokens(targetQuarter, eventDate);
  const hasYear = yearTokens.some(t => norm.includes(normalizeText(t)));
  if (!hasYear) return false;

  // Page date must be on or after eventDate (UTC day granularity)
  const pageDay = new Date(pageDateStr.slice(0, 10) + 'T00:00:00Z');
  const eventDay = new Date(
    Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()),
  );
  return pageDay.getTime() >= eventDay.getTime();
}

async function fetchFromDellIR(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const response = await axios.get(
    'https://investors.delltechnologies.com/news-releases',
    { timeout: 15_000 },
  );
  const $ = cheerio.load(response.data);

  let transcriptUrl: string | null = null;
  $('a').each((_i, el) => {
    if (transcriptUrl) return;
    const text = $(el).text().trim();
    const href = $(el).attr('href') ?? '';
    const dateText =
      $(el).closest('li, article, tr, div').find('time').attr('datetime') ??
      eventDate.toISOString().slice(0, 10);
    if (matchesTranscript(text + ' ' + href, dateText, eventDate, targetQuarter)) {
      transcriptUrl = href.startsWith('http') ? href : `https://investors.delltechnologies.com${href}`;
    }
  });

  if (!transcriptUrl) return { kind: 'not_found_yet' };

  const pageResponse = await axios.get(transcriptUrl, { timeout: 15_000 });
  const $page = cheerio.load(pageResponse.data);
  const text = $page('article').text().trim() || $page('main').text().trim();
  return text ? { kind: 'found', transcript: text } : { kind: 'not_found_yet' };
}

async function fetchFromSeekingAlpha(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const response = await axios.get(
    'https://seekingalpha.com/symbol/DELL/earnings/transcripts',
    { timeout: 15_000, headers: { 'User-Agent': 'Mozilla/5.0' } },
  );
  const $ = cheerio.load(response.data);

  let transcriptUrl: string | null = null;
  $('a').each((_i, el) => {
    if (transcriptUrl) return;
    const text = $(el).text().trim();
    const href = $(el).attr('href') ?? '';
    const dateText =
      $(el).closest('li, article, tr, div').find('time').attr('datetime') ??
      $(el).parent().text().match(/\d{4}-\d{2}-\d{2}/)?.[0] ??
      eventDate.toISOString().slice(0, 10);
    if (matchesTranscript(text + ' ' + href, dateText, eventDate, targetQuarter)) {
      transcriptUrl = href.startsWith('http') ? href : `https://seekingalpha.com${href}`;
    }
  });

  if (!transcriptUrl) return { kind: 'not_found_yet' };

  const pageResponse = await axios.get(transcriptUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const $page = cheerio.load(pageResponse.data);
  const text =
    $page('article').text().trim() ||
    $page('[data-test-id="article-content"]').text().trim();
  return text ? { kind: 'found', transcript: text } : { kind: 'not_found_yet' };
}

export async function fetchTranscript(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const results: TranscriptFetchResult[] = [];

  for (const source of [fetchFromDellIR, fetchFromSeekingAlpha]) {
    try {
      const result = await source(eventDate, targetQuarter);
      if (result.kind === 'found') return result;
      results.push(result);
    } catch (e) {
      results.push({ kind: 'error', message: String(e) });
    }
  }

  // Precedence: found > not_found_yet > error
  if (results.some(r => r.kind === 'not_found_yet')) return { kind: 'not_found_yet' };
  const errors = results.filter(
    (r): r is { kind: 'error'; message: string } => r.kind === 'error',
  );
  return { kind: 'error', message: errors.map(e => e.message).join('; ') };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd dell-earnings-agent && npm test -- __tests__/transcriptFetcher.test.ts
```

Expected: All 12 tests PASS (8 helper + 4 fetchTranscript integration).

- [ ] **Step 5: Commit**

```bash
git add dell-earnings-agent/src/transcriptFetcher.ts dell-earnings-agent/__tests__/transcriptFetcher.test.ts
git commit -m "feat: implement TranscriptFetcher with multi-source strategy and content matching"
```

---

## Chunk 5: Scheduler

### Task 9: Scheduler

**Files:**
- Create: `dell-earnings-agent/src/scheduler.ts`
- Create: `dell-earnings-agent/__tests__/scheduler.test.ts`

The scheduler manages the state machine. It owns two independent `setInterval` crons and one `setTimeout` for the WAITING→LIVE transition. Per-cron boolean lock prevents overlapping tick execution. All state mutations go through `dataStore`. Lock-skipped ticks produce no `JobRecord`.

Key pure function to export for testing: `checkStabilization`.

- [ ] **Step 1: Write failing tests for stabilization logic**

```typescript
// dell-earnings-agent/__tests__/scheduler.test.ts
import { checkStabilization } from '../src/scheduler';
import { EarningsMetrics } from '../src/types';

function makeMetrics(rev: number): EarningsMetrics {
  return {
    revenue:     { value: rev,  unit: 'B',    qoq: 1,  yoy: 2,  confidence: 90 },
    grossMargin: { value: 22.1, unit: '%',    qoq: 0,  yoy: 1,  confidence: 85 },
    doi:         { value: 34,   unit: 'days', qoq: -1, yoy: -2, confidence: 80 },
  };
}

describe('checkStabilization', () => {
  it('returns false when snapshot is null', () => {
    expect(checkStabilization(null, false, makeMetrics(23.9), true)).toBe(false);
  });

  it('returns false when snapshot is not success-tier', () => {
    expect(checkStabilization(makeMetrics(23.9), false, makeMetrics(23.9), true)).toBe(false);
  });

  it('returns false when current tick is not success', () => {
    expect(checkStabilization(makeMetrics(23.9), true, makeMetrics(23.9), false)).toBe(false);
  });

  it('returns false when revenue values differ', () => {
    expect(checkStabilization(makeMetrics(23.9), true, makeMetrics(24.0), true)).toBe(false);
  });

  it('returns true when both ticks success and all values match', () => {
    expect(checkStabilization(makeMetrics(23.9), true, makeMetrics(23.9), true)).toBe(true);
  });

  it('ignores qoq/yoy/confidence — only compares value fields', () => {
    const snap: EarningsMetrics = {
      revenue:     { value: 23.9, unit: 'B',    qoq: 1,  yoy: 1,  confidence: 80 },
      grossMargin: { value: 22.1, unit: '%',    qoq: 0,  yoy: 0,  confidence: 80 },
      doi:         { value: 34,   unit: 'days', qoq: 0,  yoy: 0,  confidence: 80 },
    };
    const curr: EarningsMetrics = {
      revenue:     { value: 23.9, unit: 'B',    qoq: 99, yoy: 99, confidence: 99 },
      grossMargin: { value: 22.1, unit: '%',    qoq: 99, yoy: 99, confidence: 99 },
      doi:         { value: 34,   unit: 'days', qoq: 99, yoy: 99, confidence: 99 },
    };
    expect(checkStabilization(snap, true, curr, true)).toBe(true);
  });

  it('returns false when any snapshot metric is null', () => {
    const partial: EarningsMetrics = {
      revenue: { value: 23.9, unit: 'B', qoq: null, yoy: null, confidence: 80 },
      grossMargin: null,
      doi: null,
    };
    expect(checkStabilization(partial, true, makeMetrics(23.9), true)).toBe(false);
  });

  it('returns false when any current metric is null', () => {
    const partial: EarningsMetrics = {
      revenue: { value: 23.9, unit: 'B', qoq: null, yoy: null, confidence: 80 },
      grossMargin: null,
      doi: null,
    };
    expect(checkStabilization(makeMetrics(23.9), true, partial, true)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd dell-earnings-agent && npm test -- __tests__/scheduler.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `dell-earnings-agent/src/scheduler.ts`**

```typescript
import { DataStore } from './dataStore';
import { EarningsMetrics } from './types';
import { fetchPressRelease } from './dellIRFetcher';
import { parseMetrics } from './claudeParser';
import { fetchTranscript } from './transcriptFetcher';
import { summarizeTranscript } from './claudeTranscriptSummarizer';

const TARGET_QUARTER = 'Q1 FY2027';
const CRON_MS = 600_000;

/**
 * Pure function — exported for unit testing.
 * Returns true only when BOTH ticks are success-tier AND all three value fields match.
 * Comparison is pre-update (snapshot reflects the prior tick, not the current one).
 */
export function checkStabilization(
  snapshot: EarningsMetrics | null,
  snapshotIsSuccess: boolean,
  currentMetrics: EarningsMetrics,
  currentIsSuccess: boolean,
): boolean {
  if (!snapshot || !snapshotIsSuccess || !currentIsSuccess) return false;
  if (!snapshot.revenue || !snapshot.grossMargin || !snapshot.doi) return false;
  if (!currentMetrics.revenue || !currentMetrics.grossMargin || !currentMetrics.doi) return false;
  return (
    snapshot.revenue.value     === currentMetrics.revenue.value &&
    snapshot.grossMargin.value === currentMetrics.grossMargin.value &&
    snapshot.doi.value         === currentMetrics.doi.value
  );
}

export function startScheduler(dataStore: DataStore): void {
  const { status } = dataStore.getState();

  if (status === 'WAITING') {
    scheduleWaiting(dataStore);
  } else if (status === 'LIVE') {
    startBothCrons(dataStore);
  } else {
    // DONE — maybe resume transcript cron
    maybeResumeTranscriptCron(dataStore);
  }
}

function scheduleWaiting(dataStore: DataStore): void {
  const eventDate = new Date(dataStore.getState().eventDate!);
  const msUntil = eventDate.getTime() - Date.now();

  if (msUntil <= 0) {
    dataStore.setState({ status: 'LIVE' });
    startBothCrons(dataStore);
    return;
  }

  const t = setTimeout(() => {
    dataStore.setState({ status: 'LIVE' });
    startBothCrons(dataStore);
  }, msUntil);
  if (t.unref) t.unref();
}

function startBothCrons(dataStore: DataStore): void {
  startMetricsCron(dataStore);
  startTranscriptCron(dataStore);
}

function startMetricsCron(dataStore: DataStore): void {
  let lock = false;
  let stopped = false;
  let handle: ReturnType<typeof setInterval> | null = null;

  function stopCron(): void {
    stopped = true;
    // Defer to ensure handle is assigned before clearInterval runs
    Promise.resolve().then(() => {
      if (handle !== null) { clearInterval(handle); handle = null; }
    });
  }

  async function tick(): Promise<void> {
    if (stopped) return;
    if (lock) { console.warn('[metricsCron] lock held — skipping tick'); return; }
    lock = true;
    const startTime = new Date().toISOString();

    try {
      const state = dataStore.getState();
      if (state.status === 'DONE') { stopCron(); return; }

      const eventDate = new Date(state.eventDate!);

      // === Fetch press release ===
      let pressReleaseText: string | null;
      try {
        pressReleaseText = await fetchPressRelease(eventDate, TARGET_QUARTER);
      } catch (e) {
        dataStore.appendJobRecord({
          startTime, endTime: new Date().toISOString(),
          status: 'failed', metricsConfidence: null, metricsExtracted: false,
          error: String(e), note: null,
        });
        return;
      }

      if (pressReleaseText === null) {
        dataStore.appendJobRecord({
          startTime, endTime: new Date().toISOString(),
          status: 'skipped', metricsConfidence: null, metricsExtracted: false,
          error: null, note: 'Press release not yet available',
        });
        return;
      }

      // === Parse metrics ===
      let parsed: Awaited<ReturnType<typeof parseMetrics>>;
      try {
        parsed = await parseMetrics(pressReleaseText);
      } catch (e) {
        dataStore.appendJobRecord({
          startTime, endTime: new Date().toISOString(),
          status: 'failed', metricsConfidence: null, metricsExtracted: false,
          error: String(e), note: null,
        });
        return;
      }

      const { metrics, overallConfidence } = parsed;
      const allNull = !metrics.revenue && !metrics.grossMargin && !metrics.doi;
      const allNonNull = !!metrics.revenue && !!metrics.grossMargin && !!metrics.doi;
      const isSuccess = allNonNull && overallConfidence >= 50;
      const metricsExtracted = !allNull;

      // Determine job status and note
      let jobStatus: 'success' | 'partial' = isSuccess ? 'success' : 'partial';
      let note: string | null = null;
      if (!isSuccess) {
        if (allNull) {
          note = 'All metrics null';
        } else if (!allNonNull) {
          const missing = (['revenue', 'grossMargin', 'doi'] as const)
            .filter(k => !metrics[k]).join(', ');
          note = `${missing} unavailable`;
        } else {
          note = `Confidence ${overallConfidence}/100`;
        }
      }

      // === Pre-update stabilization check ===
      const current = dataStore.getState();
      const shouldDone = isSuccess && checkStabilization(
        current._lastMetricsSnapshot,
        current._lastSnapshotIsSuccess,
        metrics as EarningsMetrics,
        isSuccess,
      );

      // === Update state ===
      if (metricsExtracted) {
        dataStore.setState({
          metrics: metrics as EarningsMetrics,
          metricsConfidence: overallConfidence,
          metricsUpdatedAt: new Date().toISOString(),
          _lastMetricsSnapshot: metrics as EarningsMetrics,
          _lastSnapshotIsSuccess: isSuccess,
        });
      } else {
        dataStore.setState({ _lastMetricsSnapshot: null, _lastSnapshotIsSuccess: false });
      }

      // === Append JobRecord BEFORE setState(DONE) per spec ===
      dataStore.appendJobRecord({
        startTime, endTime: new Date().toISOString(),
        status: jobStatus,
        metricsConfidence: allNull ? null : overallConfidence,
        metricsExtracted,
        error: null,
        note,
      });

      if (shouldDone) {
        dataStore.setState({ status: 'DONE' });
        stopCron();
      }
    } finally {
      lock = false;
    }
  }

  tick().catch(e => console.error('[metricsCron] tick error:', e));
  handle = setInterval(() => {
    tick().catch(e => console.error('[metricsCron] tick error:', e));
  }, CRON_MS);
}

function startTranscriptCron(dataStore: DataStore): void {
  let lock = false;
  let stopped = false;
  let handle: ReturnType<typeof setInterval> | null = null;

  function stopCron(): void {
    stopped = true;
    Promise.resolve().then(() => {
      if (handle !== null) { clearInterval(handle); handle = null; }
    });
  }

  async function attemptSummary(): Promise<void> {
    const state = dataStore.getState();
    if (!state.transcript || state._summaryAttempts >= 3) { stopCron(); return; }
    try {
      const summary = await summarizeTranscript(state.transcript);
      dataStore.setState({
        transcriptSummary: summary,
        transcriptSummaryUpdatedAt: new Date().toISOString(),
      });
      stopCron();
    } catch (e) {
      console.error('[transcriptCron] summary attempt failed:', e);
      const newAttempts = state._summaryAttempts + 1;
      dataStore.setState({ _summaryAttempts: newAttempts });
      if (newAttempts >= 3) stopCron();
    }
  }

  async function tick(): Promise<void> {
    if (stopped) return;
    if (lock) { console.warn('[transcriptCron] lock held — skipping tick'); return; }

    const state = dataStore.getState();

    // Terminal: transcript unavailable
    if (state.transcriptStatus === 'unavailable') { stopCron(); return; }
    // Terminal: summary done
    if (state.transcriptStatus === 'available' && state.transcriptSummary !== null) { stopCron(); return; }
    // Guard: summary attempts exhausted (cron should already be stopped)
    if (state.transcriptStatus === 'available' && state._summaryAttempts >= 3) { stopCron(); return; }

    lock = true;
    try {
      const current = dataStore.getState();
      const eventDate = new Date(current.eventDate!);

      if (current.transcriptStatus === 'pending') {
        if (current._transcriptAttempts >= 12) {
          dataStore.setState({ transcriptStatus: 'unavailable' });
          stopCron();
          return;
        }

        const result = await fetchTranscript(eventDate, TARGET_QUARTER);

        if (result.kind === 'found') {
          dataStore.setState({
            transcriptStatus: 'available',
            transcript: result.transcript,
            transcriptRawFetchedAt: new Date().toISOString(),
            _summaryAttempts: 0,
          });
          // Fall through immediately to summary in same tick
          await attemptSummary();
          return;
        }

        const newAttempts = current._transcriptAttempts + 1;
        dataStore.setState({ _transcriptAttempts: newAttempts });
        if (newAttempts >= 12) {
          dataStore.setState({ transcriptStatus: 'unavailable' });
          stopCron();
        }
        return;
      }

      if (current.transcriptStatus === 'available' && current.transcriptSummary === null) {
        await attemptSummary();
      }
    } finally {
      lock = false;
    }
  }

  tick().catch(e => console.error('[transcriptCron] tick error:', e));
  handle = setInterval(() => {
    tick().catch(e => console.error('[transcriptCron] tick error:', e));
  }, CRON_MS);
}

function maybeResumeTranscriptCron(dataStore: DataStore): void {
  const state = dataStore.getState();
  const canResumeFetch =
    state.transcriptStatus === 'pending' && state._transcriptAttempts < 12;
  const canResumeSummary =
    state.transcriptStatus === 'available' &&
    state.transcriptSummary === null &&
    state._summaryAttempts < 3;

  if (canResumeFetch || canResumeSummary) {
    startTranscriptCron(dataStore);
  }
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd dell-earnings-agent && npm test -- __tests__/scheduler.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 5: Run all tests**

```bash
cd dell-earnings-agent && npm test
```

Expected: All tests across all test files PASS.

- [ ] **Step 6: Commit**

```bash
git add dell-earnings-agent/src/scheduler.ts dell-earnings-agent/__tests__/scheduler.test.ts
git commit -m "feat: implement Scheduler — state machine, metricsCron, transcriptCron, stabilization"
```

---

## Chunk 6: Index + Lego Page

### Task 10: Express server and boot sequence

**Files:**
- Create: `dell-earnings-agent/src/index.ts`

- [ ] **Step 1: Implement `dell-earnings-agent/src/index.ts`**

```typescript
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import cors from 'cors';
import { AgentState } from './types';
import { createDataStore } from './dataStore';
import { resolveEventDate } from './eventDateResolver';
import { startScheduler } from './scheduler';

const STATE_FILE = path.join(__dirname, '..', 'state.json');
const PORT = parseInt(process.env.PORT ?? '3001', 10);

function makeInitialState(): AgentState {
  return {
    status: 'WAITING',
    eventDate: null,
    lastUpdated: new Date().toISOString(),
    metrics: null,
    metricsConfidence: null,
    metricsUpdatedAt: null,
    transcriptStatus: 'pending',
    transcript: null,
    transcriptSummary: null,
    transcriptRawFetchedAt: null,
    transcriptSummaryUpdatedAt: null,
    jobHistory: [],
    _lastMetricsSnapshot: null,
    _lastSnapshotIsSuccess: false,
    _transcriptAttempts: 0,
    _summaryAttempts: 0,
    _nextJobId: 1,
  };
}

function loadState(): AgentState | null {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as AgentState;
    if (!['WAITING', 'LIVE', 'DONE'].includes(parsed.status)) return null;
    // Schema defaulting for _lastSnapshotIsSuccess (added in later spec revision)
    if (parsed._lastSnapshotIsSuccess === undefined) {
      parsed._lastSnapshotIsSuccess = false;
    }
    return parsed;
  } catch (e) {
    console.warn('[boot] Failed to load state.json, starting fresh:', e);
    return null;
  }
}

async function main(): Promise<void> {
  // Step 1: Try to load persisted state
  let state = loadState();

  if (state?.eventDate) {
    // Upgrade WAITING→LIVE if already past event time
    if (state.status === 'WAITING' && Date.now() >= new Date(state.eventDate).getTime()) {
      state = { ...state, status: 'LIVE' };
    }
    console.log(`[boot] Loaded persisted state (status=${state.status}, eventDate=${state.eventDate})`);
  } else {
    // Step 2: Resolve event date
    console.log('[boot] Resolving Dell Q1 FY2027 earnings date...');
    let eventDate: string;
    try {
      eventDate = await resolveEventDate();
      console.log('[boot] Resolved event date:', eventDate);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    // Step 3: Apply initial status
    const fresh = makeInitialState();
    fresh.eventDate = eventDate;
    fresh.status = Date.now() >= new Date(eventDate).getTime() ? 'LIVE' : 'WAITING';
    state = fresh;
  }

  const dataStore = createDataStore(state, STATE_FILE);

  // Step 4: Start HTTP server
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/earnings', (_req, res) => {
    res.json(dataStore.getPublicState());
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, status: dataStore.getState().status });
  });

  await new Promise<void>(resolve => app.listen(PORT, resolve));
  console.log(`[boot] Dell Earnings Agent running on port ${PORT}`);

  // Step 5: Start scheduler
  startScheduler(dataStore);
}

main().catch(e => {
  console.error('[boot] Fatal error:', e);
  process.exit(1);
});
```

- [ ] **Step 2: Build TypeScript — confirm no errors**

```bash
cd dell-earnings-agent && npm run build
```

Expected: `dist/` created, zero TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add dell-earnings-agent/src/index.ts
git commit -m "feat: implement Express server and boot sequence for dell-earnings-agent"
```

---

### Task 11: Lego website page

**Files:**
- Create: `app/earnings-agent/page.tsx`
- Create: `app/earnings-agent/EarningsAgentContent.tsx`
- Modify: `app/data/navigation.ts`
- Modify: `app/globals.css`

#### Step 1 — Navigation entry

- [ ] **Step 1: Add nav entry to `app/data/navigation.ts`**

Find the existing `Earnings` entry (search for `href: '/earnings/'` or the `Earnings` label). Add a new entry immediately after it:

```typescript
{
  label: { zh: '財報監控', en: 'Earnings Monitor' },
  href: '/earnings-agent/',
  icon: 'target',
},
```

**Important:** Use the `'target'` icon key (crosshair/radar — already defined in `sidebarIcons` in `navigation.ts`), which fits the monitoring theme.

- [ ] **Step 2: Verify navigation.ts compiles**

```bash
cd /home/ubuntu/lego && npx tsc --noEmit
```

Expected: No errors.

#### Step 2 — Page shell

- [ ] **Step 3: Create `app/earnings-agent/page.tsx`**

```tsx
'use client';
import EarningsAgentContent from './EarningsAgentContent';

export default function EarningsAgentPage() {
  return <EarningsAgentContent />;
}
```

#### Step 3 — Full content component

- [ ] **Step 4: Create `app/earnings-agent/EarningsAgentContent.tsx`**

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL ?? 'http://localhost:3001';

// ---- Mirror of EarningsApiResponse from agent ----
interface MetricValue {
  value: number; unit: 'B' | '%' | 'days';
  qoq: number | null; yoy: number | null; confidence: number;
}
interface EarningsMetrics {
  revenue: MetricValue | null; grossMargin: MetricValue | null; doi: MetricValue | null;
}
interface TranscriptSummary {
  highlights: string[]; risks: string[]; outlook: string; keyQuotes: string[];
}
interface JobRecord {
  jobId: string; startTime: string; endTime: string;
  status: 'success' | 'partial' | 'failed' | 'skipped';
  metricsConfidence: number | null; metricsExtracted: boolean;
  error: string | null; note: string | null;
}
interface AgentData {
  status: 'WAITING' | 'LIVE' | 'DONE';
  eventDate: string; lastUpdated: string;
  metrics: EarningsMetrics | null;
  metricsConfidence: number | null; metricsUpdatedAt: string | null;
  transcriptStatus: 'pending' | 'available' | 'unavailable';
  transcript: string | null; transcriptSummary: TranscriptSummary | null;
  transcriptRawFetchedAt: string | null; transcriptSummaryUpdatedAt: string | null;
  jobHistory: JobRecord[];
}

// ---- i18n ----
const L = {
  title:           { zh: '財報監控',        en: 'Earnings Monitor' },
  loading:         { zh: '載入中…',          en: 'Loading…' },
  agentOffline:    { zh: 'Agent 離線',       en: 'Agent offline' },
  waiting:         { zh: '等待中',           en: 'WAITING' },
  live:            { zh: '直播中',           en: 'LIVE' },
  done:            { zh: '完成',             en: 'DONE' },
  eventDate:       { zh: '財報日期',          en: 'Event Date' },
  lastUpdated:     { zh: '最後更新',          en: 'Last Updated' },
  countdown:       { zh: '距財報發布',        en: 'Time until earnings' },
  revenue:         { zh: '營收',             en: 'Revenue' },
  grossMargin:     { zh: '毛利率',            en: 'Gross Margin' },
  doi:             { zh: '庫存天數',          en: 'Days of Inventory' },
  confidence:      { zh: '信心度',           en: 'confidence' },
  overallConf:     { zh: '整體信心度',        en: 'Overall Confidence' },
  awaitingFirst:   { zh: '等待第一次提取…',   en: 'Awaiting first extraction…' },
  transcriptTitle: { zh: '法說會摘要',        en: 'Transcript Summary' },
  transcriptUnavail:{ zh: '無法取得法說會逐字稿', en: 'Transcript unavailable' },
  generating:      { zh: '正在生成摘要…',     en: 'Generating summary…' },
  highlights:      { zh: '重點',             en: 'Highlights' },
  risks:           { zh: '風險',             en: 'Risks' },
  outlook:         { zh: '展望',             en: 'Outlook' },
  keyQuotes:       { zh: '關鍵引述',          en: 'Key Quotes' },
  jobHistory:      { zh: '執行紀錄',          en: 'Job History' },
  jobId:           { zh: '任務 ID',           en: 'Job ID' },
  startTime:       { zh: '開始時間',          en: 'Start Time' },
  endTime:         { zh: '結束時間',          en: 'End Time' },
  duration:        { zh: '耗時',             en: 'Duration' },
  statusLabel:     { zh: '狀態',             en: 'Status' },
  noteLabel:       { zh: '備註',             en: 'Note' },
  qoq:             { zh: 'QoQ',             en: 'QoQ' },
  yoy:             { zh: 'YoY',             en: 'YoY' },
  na:              { zh: 'N/A',             en: 'N/A' },
} as const;

type Lang = 'zh' | 'en';
type LKey = keyof typeof L;
function t(key: LKey, lang: Lang): string { return L[key][lang]; }

function fmtDelta(val: number | null, suffix: string, lang: Lang): string {
  if (val === null) return t('na', lang);
  const sign = val >= 0 ? '▲' : '▼';
  return `${sign}${Math.abs(val)}${suffix}`;
}

function fmtDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return `${Math.round(ms / 1000)}s`;
}

function fmtLocale(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW');
}

function fmtTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleTimeString(lang === 'en' ? 'en-US' : 'zh-TW');
}

// ---- Countdown hook ----
function useCountdown(target: string | null) {
  const [parts, setParts] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!target) return;
    const ts = new Date(target).getTime();
    const tick = () => {
      const diff = ts - Date.now();
      if (diff <= 0) { setVisible(false); return; }
      setVisible(true);
      setParts({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [target]);

  return { parts, visible };
}

// ---- Main component ----
export default function EarningsAgentContent() {
  const { lang } = useLanguage();
  const [data, setData]       = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'highlights' | 'risks' | 'outlook' | 'keyQuotes'>('highlights');
  const oneShotFired = useRef(false);

  const { parts: cd, visible: showCd } = useCountdown(data?.eventDate ?? null);

  async function fetchData() {
    try {
      const res = await fetch(`${AGENT_URL}/api/earnings`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch + 10-minute poll
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 600_000);
    return () => clearInterval(id);
  }, []);

  // One-shot refetch exactly at eventDate
  useEffect(() => {
    if (!data?.eventDate || oneShotFired.current) return;
    const ms = new Date(data.eventDate).getTime() - Date.now();
    if (ms <= 0) return;
    oneShotFired.current = true;
    const id = setTimeout(fetchData, ms);
    return () => clearTimeout(id);
  }, [data?.eventDate]);

  if (loading) {
    return <div className="page-pad"><div className="ea-loading">{t('loading', lang)}</div></div>;
  }

  if (error || !data) {
    return (
      <div className="page-pad">
        <div className="ea-error-banner">
          {t('agentOffline', lang)}{error ? `: ${error}` : ''}
        </div>
      </div>
    );
  }

  const statusLabel = data.status === 'LIVE' ? t('live', lang)
    : data.status === 'DONE' ? t('done', lang) : t('waiting', lang);
  const statusMod = data.status === 'LIVE' ? '--live' : data.status === 'DONE' ? '--done' : '--waiting';

  return (
    <div className="page-pad">

      {/* ── Status bar ── */}
      <div className="ea-status-bar">
        <div className="ea-status-left">
          <span className={`ea-badge ea-badge${statusMod}`}>{statusLabel}</span>
          <span className="ea-meta">{t('eventDate', lang)}: {fmtLocale(data.eventDate, lang)}</span>
        </div>
        <div className="ea-status-right">
          <span className="ea-meta">{t('lastUpdated', lang)}: {fmtLocale(data.lastUpdated, lang)}</span>
        </div>
      </div>

      {/* ── Countdown ── */}
      {data.status === 'WAITING' && showCd && (
        <div className="ea-countdown">
          <span className="ea-meta">{t('countdown', lang)}</span>
          <span className="ea-countdown-value">
            {cd.d}d {cd.h}h {cd.m}m {cd.s}s
          </span>
        </div>
      )}

      {/* ── Metrics section ── */}
      {data.status !== 'WAITING' && (
        <section className="ea-section">
          {data.metricsConfidence !== null && (
            <div className="ea-overall-conf">
              {t('overallConf', lang)}:&nbsp;
              <span className={`ea-conf-badge ${data.metricsConfidence >= 50 ? 'ea-conf-badge--ok' : 'ea-conf-badge--warn'}`}>
                {data.metricsConfidence}%
              </span>
            </div>
          )}
          {!data.metrics ? (
            <div className="ea-placeholder">{t('awaitingFirst', lang)}</div>
          ) : (
            <div className="ea-metrics-grid">
              {(
                [
                  ['revenue',     t('revenue', lang),     '$', 'B',    '%',  '%'  ],
                  ['grossMargin', t('grossMargin', lang),  '',  '%',    'pp', 'pp' ],
                  ['doi',         t('doi', lang),          '',  ' days','d',  'd'  ],
                ] as const
              ).map(([key, label, prefix, unit, qUnit, yUnit]) => {
                const m = data.metrics![key as 'revenue' | 'grossMargin' | 'doi'];
                return (
                  <div key={key} className="ea-metric-card">
                    <div className="ea-metric-label">{label}</div>
                    {m ? (
                      <>
                        <div className="ea-metric-value">{prefix}{m.value}{unit}</div>
                        <div className="ea-metric-deltas">
                          <span>{t('qoq', lang)}: {fmtDelta(m.qoq, qUnit, lang)}</span>
                          <span>{t('yoy', lang)}: {fmtDelta(m.yoy, yUnit, lang)}</span>
                        </div>
                        <div className="ea-metric-conf">{m.confidence}% {t('confidence', lang)}</div>
                      </>
                    ) : (
                      <div className="ea-metric-na">—</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ── Transcript summary section ── */}
      {data.transcriptStatus !== 'pending' && (
        <section className="ea-section">
          <h3 className="ea-section-title">{t('transcriptTitle', lang)}</h3>
          {data.transcriptStatus === 'unavailable' && (
            <div className="ea-placeholder">{t('transcriptUnavail', lang)}</div>
          )}
          {data.transcriptStatus === 'available' && !data.transcriptSummary && (
            <div className="ea-placeholder ea-placeholder--italic">{t('generating', lang)}</div>
          )}
          {data.transcriptStatus === 'available' && data.transcriptSummary && (
            <>
              <div className="ea-tabs">
                {(['highlights', 'risks', 'outlook', 'keyQuotes'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`ea-tab${activeTab === tab ? ' ea-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {t(tab, lang)}
                  </button>
                ))}
              </div>
              <div className="ea-tab-content">
                {activeTab === 'outlook' ? (
                  <p className="ea-outlook">{data.transcriptSummary.outlook}</p>
                ) : (
                  <ul className="ea-list">
                    {data.transcriptSummary[activeTab].map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {/* ── Job history section ── */}
      {data.jobHistory.length > 0 && (
        <section className="ea-section">
          <h3 className="ea-section-title">{t('jobHistory', lang)} ({data.jobHistory.length})</h3>
          <div className="ea-table-wrap">
            <table className="ea-table">
              <thead>
                <tr>
                  <th>{t('jobId', lang)}</th>
                  <th>{t('startTime', lang)}</th>
                  <th>{t('endTime', lang)}</th>
                  <th>{t('duration', lang)}</th>
                  <th>{t('statusLabel', lang)}</th>
                  <th>{t('overallConf', lang)}</th>
                  <th>{t('noteLabel', lang)}</th>
                </tr>
              </thead>
              <tbody>
                {data.jobHistory.map(job => (
                  <tr key={job.jobId}>
                    <td>{job.jobId}</td>
                    <td>{fmtTime(job.startTime, lang)}</td>
                    <td>{fmtTime(job.endTime, lang)}</td>
                    <td>{fmtDuration(job.startTime, job.endTime)}</td>
                    <td>
                      <span className={`ea-job-badge ea-job-badge--${job.status}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.metricsConfidence !== null ? `${job.metricsConfidence}%` : '—'}</td>
                    <td className="ea-note">{job.error ?? job.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
}
```

- [ ] **Step 5: Add CSS to `app/globals.css`** — append before the RWD section at the bottom

```css
/* ===== EARNINGS AGENT ===== */
.ea-loading { padding: 48px; text-align: center; color: var(--c-text-3); font-size: 14px; }
.ea-error-banner { padding: 14px 16px; background: #fee2e2; border: 1px solid var(--c-neg); border-radius: var(--radius); color: var(--c-neg); margin-bottom: 16px; font-size: 14px; }

.ea-status-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 12px 16px; background: var(--c-white); border: 1px solid var(--c-border); border-radius: var(--radius); margin-bottom: 16px; }
.ea-status-left, .ea-status-right { display: flex; align-items: center; gap: 10px; }
.ea-meta { font-size: 13px; color: var(--c-text-3); }

.ea-badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.ea-badge--waiting { background: #fef3c7; color: #92400e; }
.ea-badge--live    { background: #d1fae5; color: #065f46; }
.ea-badge--done    { background: #dbeafe; color: #1e40af; }

.ea-countdown { display: flex; align-items: center; gap: 16px; padding: 12px 16px; background: var(--c-white); border: 1px solid var(--c-border); border-radius: var(--radius); margin-bottom: 16px; }
.ea-countdown-value { font-size: 20px; font-weight: 700; color: var(--c-text); font-variant-numeric: tabular-nums; }

.ea-section { background: var(--c-white); border: 1px solid var(--c-border); border-radius: var(--radius); padding: 16px; margin-bottom: 16px; }
.ea-section-title { font-size: 15px; font-weight: 600; color: var(--c-text); margin: 0 0 14px; }

.ea-overall-conf { font-size: 13px; color: var(--c-text-3); margin-bottom: 12px; }
.ea-conf-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.ea-conf-badge--ok   { background: #d1fae5; color: #065f46; }
.ea-conf-badge--warn { background: #fef3c7; color: #92400e; }

.ea-placeholder { padding: 24px; text-align: center; color: var(--c-text-3); font-size: 14px; }
.ea-placeholder--italic { font-style: italic; }

.ea-metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.ea-metric-card { padding: 16px; border: 1px solid var(--c-border); border-radius: var(--radius); }
.ea-metric-label { font-size: 11px; color: var(--c-text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
.ea-metric-value { font-size: 26px; font-weight: 700; color: var(--c-text); margin-bottom: 6px; }
.ea-metric-deltas { display: flex; gap: 12px; font-size: 12px; color: var(--c-text-3); margin-bottom: 4px; }
.ea-metric-conf { font-size: 11px; color: var(--c-text-4); }
.ea-metric-na { font-size: 20px; color: var(--c-text-4); padding: 8px 0; }

.ea-tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--c-border); margin-bottom: 12px; }
.ea-tab { padding: 7px 14px; border: none; background: none; font-size: 13px; color: var(--c-text-3); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; }
.ea-tab:hover { color: var(--c-text); }
.ea-tab--active { color: var(--c-accent); border-bottom-color: var(--c-accent); font-weight: 600; }

.ea-tab-content { min-height: 60px; }
.ea-list { margin: 0; padding-left: 20px; }
.ea-list li { font-size: 14px; color: var(--c-text); margin-bottom: 6px; line-height: 1.5; }
.ea-outlook { font-size: 14px; color: var(--c-text); line-height: 1.6; margin: 0; }

.ea-table-wrap { overflow-x: auto; }
.ea-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ea-table th { text-align: left; padding: 8px 10px; color: var(--c-text-3); border-bottom: 1px solid var(--c-border); font-weight: 500; white-space: nowrap; }
.ea-table td { padding: 8px 10px; border-bottom: 1px solid var(--c-border); color: var(--c-text); vertical-align: top; }
.ea-note { color: var(--c-text-3); font-size: 12px; max-width: 200px; word-break: break-word; }

.ea-job-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.ea-job-badge--success { background: #d1fae5; color: #065f46; }
.ea-job-badge--partial  { background: #fef3c7; color: #92400e; }
.ea-job-badge--failed   { background: #fee2e2; color: #991b1b; }
.ea-job-badge--skipped  { background: #f3f4f6; color: var(--c-text-3); }
```

- [ ] **Step 6: Run `npm run build` in lego root to confirm no TypeScript errors**

```bash
cd /home/ubuntu/lego && npm run build
```

Expected: Build succeeds, no errors.

- [ ] **Step 7: Commit**

```bash
git add app/earnings-agent/ app/data/navigation.ts app/globals.css
git commit -m "feat: add earnings-agent page — metrics, transcript summary, job history, i18n"
```

---

## Final Verification

- [ ] **Run all agent tests**

```bash
cd dell-earnings-agent && npm test
```

Expected: All tests PASS.

- [ ] **Build lego app**

```bash
cd /home/ubuntu/lego && npm run build
```

Expected: Static export in `out/`, no errors.

- [ ] **Smoke-test agent startup** (requires `.env` with `ANTHROPIC_API_KEY`)

```bash
cd dell-earnings-agent && npm run dev
# In another terminal:
curl http://localhost:3001/api/health
# Expected: {"ok":true,"status":"WAITING"}
curl http://localhost:3001/api/earnings
# Expected: JSON with status, eventDate, empty jobHistory, etc.
```
