# Multi-Company Earnings Agent Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the earnings monitoring system to support multiple companies (Dell + Broadcom) simultaneously, with a refactored UI showing a left company-selector and right detail panel, plus first-created + last-updated timestamps.

**Architecture:** Two independent Node.js agent processes (Dell on port 3002, Broadcom on port 3003), each with its own state.json and .env. Nginx routes `/earnings-api/dell/` and `/earnings-api/broadcom/` to the respective ports. The Next.js UI polls all registered company endpoints simultaneously.

**Tech Stack:** Node.js/TypeScript (agents), Express, SEC EDGAR API, Next.js 14 (UI), nginx

**Spec:** `docs/superpowers/specs/2026-05-29-multi-company-earnings-agent-design.md`

---

## Chunk 1: Dell Agent — Add Created-At Timestamp Fields

### Task 1: Add `metricsCreatedAt` and `transcriptSummaryCreatedAt` to types

**Files:**
- Modify: `dell-earnings-agent/src/types.ts`

- [ ] **Step 1: Add two new fields to `AgentState` in `dell-earnings-agent/src/types.ts`**

Add immediately after `metricsUpdatedAt` and after `transcriptSummaryUpdatedAt`:

```typescript
export interface AgentState {
  // Public fields (returned by GET /api/earnings)
  status:                     AgentStatus;
  eventDate:                  string | null;
  lastUpdated:                string;
  metrics:                    EarningsMetrics | null;
  metricsConfidence:          number | null;
  metricsCreatedAt:           string | null;  // NEW: set ONCE on first successful extraction
  metricsUpdatedAt:           string | null;
  transcriptStatus:           TranscriptStatus;
  transcript:                 string | null;
  transcriptSummary:          TranscriptSummary | null;
  transcriptRawFetchedAt:     string | null;
  transcriptSummaryCreatedAt: string | null;  // NEW: set ONCE on first summary generation
  transcriptSummaryUpdatedAt: string | null;
  jobHistory:                 JobRecord[];

  // Internal fields (persisted to state.json, NOT exposed by API)
  _lastMetricsSnapshot:   EarningsMetrics | null;
  _lastSnapshotIsSuccess: boolean;
  _transcriptAttempts:    number;
  _summaryAttempts:       number;
  _nextJobId:             number;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd dell-earnings-agent && npm run build 2>&1 | tail -5
```
Expected: TypeScript errors about missing fields in `makeInitialState`. Fix in next task.

---

### Task 2: Initialize new fields in `index.ts`

**Files:**
- Modify: `dell-earnings-agent/src/index.ts`

- [ ] **Step 1: Add new fields to `makeInitialState()`**

In `dell-earnings-agent/src/index.ts`, update `makeInitialState()`:

```typescript
function makeInitialState(): AgentState {
  return {
    status: 'WAITING',
    eventDate: null,
    lastUpdated: new Date().toISOString(),
    metrics: null,
    metricsConfidence: null,
    metricsCreatedAt: null,        // NEW
    metricsUpdatedAt: null,
    transcriptStatus: 'pending',
    transcript: null,
    transcriptSummary: null,
    transcriptRawFetchedAt: null,
    transcriptSummaryCreatedAt: null,  // NEW
    transcriptSummaryUpdatedAt: null,
    jobHistory: [],
    _lastMetricsSnapshot: null,
    _lastSnapshotIsSuccess: false,
    _transcriptAttempts: 0,
    _summaryAttempts: 0,
    _nextJobId: 1,
  };
}
```

- [ ] **Step 2: Add schema migration in `loadState()`**

In `dell-earnings-agent/src/index.ts`, after the existing `_lastSnapshotIsSuccess` default:

```typescript
// Schema defaulting for fields added later
if (parsed._lastSnapshotIsSuccess === undefined) {
  parsed._lastSnapshotIsSuccess = false;
}
if (parsed.metricsCreatedAt === undefined) {
  parsed.metricsCreatedAt = null;
}
if (parsed.transcriptSummaryCreatedAt === undefined) {
  parsed.transcriptSummaryCreatedAt = null;
}
```

- [ ] **Step 3: Build and confirm no errors**

```bash
cd dell-earnings-agent && npm run build 2>&1 | tail -5
```
Expected: `tsc` exits 0, no output.

---

### Task 3: Set `createdAt` fields in scheduler on first write

**Files:**
- Modify: `dell-earnings-agent/src/scheduler.ts`

- [ ] **Step 1: Set `metricsCreatedAt` on first successful metrics extraction**

In `startMetricsCron → tick()`, find the `setState` block that sets `metricsUpdatedAt` (~line 169):

```typescript
// === Update state ===
if (metricsExtracted) {
  const currentState = dataStore.getState();
  dataStore.setState({
    metrics: metrics as EarningsMetrics,
    metricsConfidence: overallConfidence,
    metricsCreatedAt: currentState.metricsCreatedAt ?? new Date().toISOString(),  // ADD
    metricsUpdatedAt: new Date().toISOString(),
    _lastMetricsSnapshot: metrics as EarningsMetrics,
    _lastSnapshotIsSuccess: isSuccess,
  });
} else {
  dataStore.setState({ _lastMetricsSnapshot: null, _lastSnapshotIsSuccess: false });
}
```

Note: `metricsCreatedAt` uses `?? new Date().toISOString()` — it's only set if currently null.

- [ ] **Step 2: Set `transcriptSummaryCreatedAt` on first summary generation**

In `startTranscriptCron → attemptSummary()`, find the `setState` block that sets `transcriptSummaryUpdatedAt` (~line 222):

```typescript
const summary = await summarizeTranscript(state.transcript);
const currentState = dataStore.getState();
dataStore.setState({
  transcriptSummary: summary,
  transcriptSummaryCreatedAt: currentState.transcriptSummaryCreatedAt ?? new Date().toISOString(),  // ADD
  transcriptSummaryUpdatedAt: new Date().toISOString(),
});
```

- [ ] **Step 3: Build, confirm clean**

```bash
cd dell-earnings-agent && npm run build 2>&1 | tail -5
```
Expected: exits 0.

- [ ] **Step 4: Restart Dell agent to pick up changes**

```bash
APID=$(cat /home/ubuntu/dell-agent.pid)
kill $APID
sleep 1
cd /home/ubuntu/lego/dell-earnings-agent
nohup node dist/index.js >> /home/ubuntu/dell-agent.log 2>&1 &
echo $! > /home/ubuntu/dell-agent.pid
disown $(cat /home/ubuntu/dell-agent.pid)
sleep 3
curl -s http://localhost:3002/api/earnings | python3 -c "import sys,json; d=json.load(sys.stdin); print('status:', d['status'], '| metricsCreatedAt:', d.get('metricsCreatedAt'))"
```
Expected: `status: DONE | metricsCreatedAt: 2026-05-29T...` (schema migration applied on load)

- [ ] **Step 5: Commit**

```bash
cd /home/ubuntu/lego
git add dell-earnings-agent/src/types.ts dell-earnings-agent/src/index.ts dell-earnings-agent/src/scheduler.ts
git commit -m "feat(dell-agent): add metricsCreatedAt and transcriptSummaryCreatedAt timestamp fields

- AgentState: two new nullable ISO UTC fields (created-at semantics: set once, never overwritten)
- makeInitialState: initialize both to null
- loadState: schema-default both for existing state.json
- scheduler: set metricsCreatedAt on first extraction, transcriptSummaryCreatedAt on first summary

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
```

---

## Chunk 2: Create `broadcom-earnings-agent`

### Task 4: Scaffold project structure

**Files:**
- Create: `broadcom-earnings-agent/package.json`
- Create: `broadcom-earnings-agent/tsconfig.json`
- Create: `broadcom-earnings-agent/.gitignore`
- Create: `broadcom-earnings-agent/.env`

- [ ] **Step 1: Create `broadcom-earnings-agent/package.json`**

```json
{
  "name": "broadcom-earnings-agent",
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

- [ ] **Step 2: Create `broadcom-earnings-agent/tsconfig.json`**

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

- [ ] **Step 3: Create `broadcom-earnings-agent/.gitignore`**

```
node_modules/
dist/
state.json
.env
```

- [ ] **Step 4: Create `broadcom-earnings-agent/.env`**

```
PORT=3003
EARNINGS_DATE=2026-06-03T21:00:00Z
GITHUB_TOKEN=<copy the same token from dell-earnings-agent/.env>
LOG_LEVEL=info
```

To copy the token: `grep GITHUB_TOKEN /home/ubuntu/lego/dell-earnings-agent/.env`

---

### Task 5: Copy generic source files

**Files:**
- Create: `broadcom-earnings-agent/src/types.ts`
- Create: `broadcom-earnings-agent/src/dataStore.ts`
- Create: `broadcom-earnings-agent/src/aiClient.ts`
- Create: `broadcom-earnings-agent/src/claudeParser.ts`
- Create: `broadcom-earnings-agent/src/claudeTranscriptSummarizer.ts`
- Create: `broadcom-earnings-agent/src/index.ts`

- [ ] **Step 1: Copy generic files from dell-earnings-agent**

```bash
mkdir -p /home/ubuntu/lego/broadcom-earnings-agent/src
cd /home/ubuntu/lego

# These files are 100% generic — no Dell-specific content
cp dell-earnings-agent/src/types.ts                    broadcom-earnings-agent/src/types.ts
cp dell-earnings-agent/src/dataStore.ts                broadcom-earnings-agent/src/dataStore.ts
cp dell-earnings-agent/src/aiClient.ts                 broadcom-earnings-agent/src/aiClient.ts
cp dell-earnings-agent/src/claudeParser.ts             broadcom-earnings-agent/src/claudeParser.ts
cp dell-earnings-agent/src/claudeTranscriptSummarizer.ts broadcom-earnings-agent/src/claudeTranscriptSummarizer.ts
cp dell-earnings-agent/src/index.ts                    broadcom-earnings-agent/src/index.ts

echo "Copied. Verify no Dell-specific strings in generic files:"
grep -l 'DELL\|Dell\|1571996' broadcom-earnings-agent/src/types.ts broadcom-earnings-agent/src/dataStore.ts broadcom-earnings-agent/src/aiClient.ts broadcom-earnings-agent/src/index.ts 2>/dev/null || echo "Clean — no Dell references"
```

Expected: `Clean — no Dell references`

---

### Task 6: Create Broadcom-specific `eventDateResolver.ts`

**Files:**
- Create: `broadcom-earnings-agent/src/eventDateResolver.ts`

- [ ] **Step 1: Create file**

```typescript
// broadcom-earnings-agent/src/eventDateResolver.ts
import { chatComplete } from './aiClient';

interface Options {
  skipAI?: boolean;
}

const FATAL = 'FATAL: Cannot determine earnings date. Set EARNINGS_DATE=<ISO UTC> in .env';

function isValidIsoDatetime(s: string): boolean {
  return s.includes('T') && !isNaN(new Date(s).getTime());
}

export async function resolveEventDate(opts: Options = {}): Promise<string> {
  const envDate = process.env.EARNINGS_DATE?.trim() ?? '';
  if (isValidIsoDatetime(envDate)) return envDate;

  if (!opts.skipAI) {
    try {
      const text = await chatComplete(
        'You are a financial calendar assistant. Reply with ONLY an ISO 8601 UTC datetime string, no other text.',
        [
          'What is the scheduled date and time (UTC) for Broadcom Inc. (AVGO) Q2 FY2026 earnings release?',
          'Reply with ONLY an ISO 8601 UTC datetime string like: 2026-06-03T21:00:00Z',
          'If you are unsure of the exact time, use 21:00:00Z as an after-market-close estimate.',
        ].join('\n'),
        64,
      );
      if (isValidIsoDatetime(text)) return text;
    } catch (e) {
      console.warn('[eventDateResolver] AI failed, falling back to env var:', e);
    }
  }

  throw new Error(FATAL);
}
```

---

### Task 7: Create Broadcom EDGAR IR fetcher

**Files:**
- Create: `broadcom-earnings-agent/src/avgoIRFetcher.ts`

- [ ] **Step 1: Create the file**

```typescript
// broadcom-earnings-agent/src/avgoIRFetcher.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

const EDGAR_SEARCH_URL = 'https://efts.sec.gov/LATEST/search-index';
const AVGO_CIK = '1054374';

const EDGAR_HEADERS = {
  'User-Agent': 'BroadcomEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)',
  'Accept': 'application/json, text/html',
};

const HTML_HEADERS = {
  'User-Agent': 'BroadcomEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)',
  'Accept': 'text/html',
};

async function axiosGetWithRetry(
  url: string,
  headers: Record<string, string> = EDGAR_HEADERS,
  maxRetries = 3,
): Promise<import('axios').AxiosResponse> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await axios.get(url, { timeout: 20_000, headers });
    } catch (err: unknown) {
      lastError = err;
      const status = (err as any)?.response?.status;
      console.warn(`[avgoIRFetcher] attempt ${attempt} failed for ${url} (status: ${status})`);
      await new Promise(r => setTimeout(r, attempt * 3000));
    }
  }
  throw lastError;
}

async function findEdgarPressReleaseUrl(eventDate: Date): Promise<string | null> {
  const startDt = new Date(eventDate.getTime() - 3 * 86_400_000).toISOString().slice(0, 10);
  const endDt   = new Date(eventDate.getTime() + 3 * 86_400_000).toISOString().slice(0, 10);

  const searchUrl = `${EDGAR_SEARCH_URL}?q=%22Broadcom%22&dateRange=custom&startdt=${startDt}&enddt=${endDt}&forms=8-K`;
  const res = await axiosGetWithRetry(searchUrl, EDGAR_HEADERS);
  const hits: any[] = res.data?.hits?.hits ?? [];

  for (const hit of hits) {
    const id: string = hit._id ?? '';
    const [accession, filename] = id.split(':');
    if (!filename) continue;
    const lc = filename.toLowerCase();
    if (lc.includes('exhibit99') || lc.includes('ex99') || lc.includes('earnings')) {
      const accPath = accession.replace(/-/g, '');
      return `https://www.sec.gov/Archives/edgar/data/${AVGO_CIK}/${accPath}/${filename}`;
    }
  }
  return null;
}

export function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[-_\s]+/g, ' ').trim();
}

export async function fetchPressRelease(
  eventDate: Date,
  _targetQuarter: string,
): Promise<string | null> {
  console.log('[avgoIRFetcher] Searching SEC EDGAR for Broadcom 8-K press release...');
  const prUrl = await findEdgarPressReleaseUrl(eventDate);

  if (!prUrl) {
    console.warn('[avgoIRFetcher] No matching 8-K exhibit found on EDGAR yet.');
    return null;
  }

  console.log('[avgoIRFetcher] Found press release:', prUrl);
  const prResponse = await axiosGetWithRetry(prUrl, HTML_HEADERS);
  const $pr = cheerio.load(prResponse.data);

  $pr('script, style, noscript').remove();
  const text =
    $pr('article').text().trim() ||
    $pr('main').text().trim()    ||
    $pr('body').text().trim();

  return text || null;
}
```

---

### Task 8: Create Broadcom transcript fetcher

**Files:**
- Create: `broadcom-earnings-agent/src/transcriptFetcher.ts`

- [ ] **Step 1: Create the file**

```typescript
// broadcom-earnings-agent/src/transcriptFetcher.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { TranscriptFetchResult } from './types';
import { normalizeText, fetchPressRelease } from './avgoIRFetcher';

const QUARTER_TOKENS = ['q2', 'second quarter', '2nd quarter'];
const AVGO_CIK = '1054374';

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

  const pageDay = new Date(pageDateStr.slice(0, 10) + 'T00:00:00Z');
  const eventDay = new Date(
    Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()),
  );
  return pageDay.getTime() >= eventDay.getTime();
}

async function fetchFromMotleyFool(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const searchUrl = 'https://www.fool.com/earnings-call-transcripts/?symbol=AVGO';
  const response = await axios.get(searchUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36' },
  });
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
      transcriptUrl = href.startsWith('http') ? href : `https://www.fool.com${href}`;
    }
  });

  if (!transcriptUrl) return { kind: 'not_found_yet' };

  const pageResponse = await axios.get(transcriptUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36' },
  });
  const $page = cheerio.load(pageResponse.data);
  $page('script, style, noscript').remove();
  const text = $page('article').text().trim() || $page('main').text().trim();
  return text ? { kind: 'found', transcript: text } : { kind: 'not_found_yet' };
}

async function fetchFromEdgarTranscript(
  eventDate: Date,
  _targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const startDt = new Date(eventDate.getTime() - 1 * 86_400_000).toISOString().slice(0, 10);
  const endDt   = new Date(eventDate.getTime() + 5 * 86_400_000).toISOString().slice(0, 10);
  const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22Broadcom%22+%22earnings+call%22&dateRange=custom&startdt=${startDt}&enddt=${endDt}&forms=8-K`;

  const res = await axios.get(searchUrl, {
    timeout: 15_000,
    headers: { 'User-Agent': 'BroadcomEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)' },
  });
  const hits: any[] = res.data?.hits?.hits ?? [];

  for (const hit of hits) {
    const id: string = hit._id ?? '';
    const [accession, filename] = id.split(':');
    if (!filename) continue;
    const lc = filename.toLowerCase();
    if (lc.includes('transcript') || lc.includes('exhibit99') || lc.includes('script')) {
      const accPath = accession.replace(/-/g, '');
      const url = `https://www.sec.gov/Archives/edgar/data/${AVGO_CIK}/${accPath}/${filename}`;
      const pageResponse = await axios.get(url, {
        timeout: 15_000,
        headers: { 'User-Agent': 'BroadcomEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)' },
      });
      const $page = cheerio.load(pageResponse.data);
      $page('script, style').remove();
      const text = $page('body').text().trim();
      if (text) return { kind: 'found', transcript: text };
    }
  }
  return { kind: 'not_found_yet' };
}

async function fetchFromEdgarPressRelease(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  try {
    const text = await fetchPressRelease(eventDate, targetQuarter);
    if (text && text.length > 500) {
      return { kind: 'found', transcript: `[Source: SEC EDGAR Press Release]\n\n${text}` };
    }
  } catch (e) {
    return { kind: 'error', message: `EDGAR press release fallback failed: ${String(e)}` };
  }
  return { kind: 'not_found_yet' };
}

export async function fetchTranscript(
  eventDate: Date,
  targetQuarter: string,
): Promise<TranscriptFetchResult> {
  const results: TranscriptFetchResult[] = [];

  for (const source of [fetchFromMotleyFool, fetchFromEdgarTranscript, fetchFromEdgarPressRelease]) {
    try {
      const result = await source(eventDate, targetQuarter);
      if (result.kind === 'found') return result;
      results.push(result);
    } catch (e) {
      results.push({ kind: 'error', message: String(e) });
    }
  }

  if (results.some(r => r.kind === 'not_found_yet')) return { kind: 'not_found_yet' };
  const errors = results.filter(
    (r): r is { kind: 'error'; message: string } => r.kind === 'error',
  );
  return { kind: 'error', message: errors.map(e => e.message).join('; ') };
}
```

---

### Task 9: Create Broadcom `scheduler.ts` with correct quarter constant

**Files:**
- Create: `broadcom-earnings-agent/src/scheduler.ts`

- [ ] **Step 1: Copy Dell's scheduler and update the TARGET_QUARTER constant**

```bash
cp /home/ubuntu/lego/dell-earnings-agent/src/scheduler.ts \
   /home/ubuntu/lego/broadcom-earnings-agent/src/scheduler.ts
```

Then edit `broadcom-earnings-agent/src/scheduler.ts` — change line 8:
```typescript
// Before:
const TARGET_QUARTER = 'Q1 FY2027';
// After:
const TARGET_QUARTER = 'Q2 FY2026';
```

---

### Task 10: Install dependencies and build Broadcom agent

- [ ] **Step 1: Install npm dependencies**

```bash
cd /home/ubuntu/lego/broadcom-earnings-agent
npm install 2>&1 | tail -5
```
Expected: `added N packages`

- [ ] **Step 2: Build**

```bash
npm run build 2>&1
```
Expected: `tsc` exits 0, `dist/` directory created.

- [ ] **Step 3: Verify dist files exist**

```bash
ls dist/
```
Expected: `index.js  aiClient.js  avgoIRFetcher.js  claudeParser.js  claudeTranscriptSummarizer.js  dataStore.js  eventDateResolver.js  scheduler.js  transcriptFetcher.js  types.js`

- [ ] **Step 4: Commit Broadcom agent source**

```bash
cd /home/ubuntu/lego
git add broadcom-earnings-agent/package.json broadcom-earnings-agent/tsconfig.json broadcom-earnings-agent/.gitignore broadcom-earnings-agent/src/
git commit -m "feat: add broadcom-earnings-agent for AVGO Q2 FY2026

- Independent Node.js agent on port 3003
- EDGAR fetcher using Broadcom CIK 1054374
- Transcript fetcher: Motley Fool AVGO + EDGAR fallbacks
- Earnings date: 2026-06-03T21:00:00Z (June 3 5PM ET)
- Same types/scheduler/AI stack as Dell agent

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
```

---

## Chunk 3: Nginx Routing Update

### Task 11: Add Broadcom route and rename Dell route

**Files:**
- Modify: `/etc/nginx/sites-enabled/lego2.hwchiu.com`

- [ ] **Step 1: Replace the Dell earnings route and add Broadcom**

Read the current nginx config:
```bash
cat /etc/nginx/sites-enabled/lego2.hwchiu.com
```

Edit `/etc/nginx/sites-enabled/lego2.hwchiu.com` (requires `sudo cp` via `/tmp`): replace the existing `location /earnings-api/` block with two company-specific blocks:

```nginx
# Dell Earnings Agent API
location /earnings-api/dell/ {
    proxy_pass http://localhost:3002/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}

# Broadcom Earnings Agent API
location /earnings-api/broadcom/ {
    proxy_pass http://localhost:3003/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, OPTIONS";
}
```

Use the Python write-via-tmp pattern (required due to permissions):
```bash
python3 << 'PYEOF'
content = open('/etc/nginx/sites-enabled/lego2.hwchiu.com').read()
old_block = '''    # Dell Earnings Agent API
    location /earnings-api/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }'''
new_block = '''    # Dell Earnings Agent API
    location /earnings-api/dell/ {
        proxy_pass http://localhost:3002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }

    # Broadcom Earnings Agent API
    location /earnings-api/broadcom/ {
        proxy_pass http://localhost:3003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }'''
new_content = content.replace(old_block, new_block)
assert new_content != content, "Block not found — check for exact whitespace match"
open('/tmp/nginx-lego2-updated.conf', 'w').write(new_content)
print("Written to /tmp/nginx-lego2-updated.conf")
PYEOF
sudo cp /tmp/nginx-lego2-updated.conf /etc/nginx/sites-enabled/lego2.hwchiu.com
sudo nginx -t 2>&1 | grep -v 'Permission denied\|user.*directive\|pid'
sudo nginx -s reload
```
Expected: `nginx: the configuration file ... syntax is ok` + `nginx: configuration file ... test is successful`

- [ ] **Step 2: Verify routes work**

```bash
# Dell should still work
curl -s -o /dev/null -w "%{http_code}" https://lego2.hwchiu.com/earnings-api/dell/api/earnings
# Expected: 200

# Broadcom — will 502 until agent starts (that's ok for now)
curl -s -o /dev/null -w "%{http_code}" https://lego2.hwchiu.com/earnings-api/broadcom/api/health
# Expected: 502 (agent not started yet — that's expected)
```

---

## Chunk 4: UI Refactor — Multi-Company Layout

### Task 12: Rewrite `EarningsAgentContent.tsx`

**Files:**
- Modify: `app/earnings-agent/EarningsAgentContent.tsx`
- Modify: `app/globals.css`

The current file is 509 lines (single-company). It will be rewritten as a multi-company layout.

- [ ] **Step 1: Replace `EarningsAgentContent.tsx` with the multi-company version**

Full replacement content for `app/earnings-agent/EarningsAgentContent.tsx`:

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

const BASE_URL = typeof window !== 'undefined'
  ? window.location.origin
  : 'https://lego2.hwchiu.com';

// ---- Company Registry ----
const COMPANIES = [
  { id: 'dell',     ticker: 'DELL', name: 'Dell Technologies', quarter: 'Q1 FY2027', apiPath: `${BASE_URL}/earnings-api/dell` },
  { id: 'broadcom', ticker: 'AVGO', name: 'Broadcom Inc.',      quarter: 'Q2 FY2026', apiPath: `${BASE_URL}/earnings-api/broadcom` },
] as const;

type CompanyId = typeof COMPANIES[number]['id'];

// ---- Type mirrors ----
interface MetricValue {
  value: number; unit: 'B' | '%' | 'days';
  qoq: number | null; yoy: number | null; confidence: number;
}
interface EarningsMetrics {
  revenue: MetricValue | null; grossMargin: MetricValue | null; doi: MetricValue | null;
}
interface TranscriptSummary {
  highlights: string[]; risks: string[]; outlook: string; keyQuotes: string[];
  summaryConfidence?: number;
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
  metricsConfidence: number | null;
  metricsCreatedAt: string | null;
  metricsUpdatedAt: string | null;
  transcriptStatus: 'pending' | 'available' | 'unavailable';
  transcript: string | null;
  transcriptSummary: TranscriptSummary | null;
  transcriptRawFetchedAt: string | null;
  transcriptSummaryCreatedAt: string | null;
  transcriptSummaryUpdatedAt: string | null;
  jobHistory: JobRecord[];
}

// ---- i18n ----
const L = {
  title:              { zh: '財報監控',              en: 'Earnings Monitor' },
  loading:            { zh: '載入中…',                en: 'Loading…' },
  agentOffline:       { zh: 'Agent 離線',             en: 'Agent offline' },
  waiting:            { zh: '等待中',                 en: 'WAITING' },
  live:               { zh: '直播中',                 en: 'LIVE' },
  done:               { zh: '完成',                   en: 'DONE' },
  companies:          { zh: '公司',                   en: 'Companies' },
  eventDate:          { zh: '財報日期',                en: 'Event Date' },
  lastUpdated:        { zh: '最後更新',                en: 'Last Updated' },
  metricsCreated:     { zh: '指標首次建立',             en: 'Metrics created' },
  metricsAt:          { zh: '指標最後更新',             en: 'Metrics updated' },
  summaryCreated:     { zh: '摘要首次建立',             en: 'Summary created' },
  transcriptAt:       { zh: '摘要最後更新',             en: 'Summary updated' },
  fetchedAt:          { zh: '逐字稿取得時間',           en: 'Transcript fetched' },
  countdown:          { zh: '距財報發布',              en: 'Time until earnings' },
  revenue:            { zh: '營收',                   en: 'Revenue' },
  grossMargin:        { zh: '毛利率',                  en: 'Gross Margin' },
  doi:                { zh: '庫存天數',                en: 'Days of Inventory' },
  confidence:         { zh: '信心度',                 en: 'confidence' },
  overallConf:        { zh: '整體信心度',               en: 'Overall Confidence' },
  awaitingFirst:      { zh: '等待第一次提取…',           en: 'Awaiting first extraction…' },
  transcriptTitle:    { zh: '法說會摘要',               en: 'Transcript Summary' },
  transcriptUnavail:  { zh: '無法取得法說會逐字稿',       en: 'Transcript unavailable' },
  generating:         { zh: '正在生成摘要…',             en: 'Generating summary…' },
  summaryConf:        { zh: '摘要信心度',               en: 'Summary confidence' },
  highlights:         { zh: '重點',                   en: 'Highlights' },
  risks:              { zh: '風險',                   en: 'Risks' },
  outlook:            { zh: '展望',                   en: 'Outlook' },
  keyQuotes:          { zh: '關鍵引述',                en: 'Key Quotes' },
  jobHistory:         { zh: '執行紀錄',                en: 'Job History' },
  jobId:              { zh: '任務 ID',                 en: 'Job ID' },
  startTime:          { zh: '開始時間',                en: 'Start Time' },
  endTime:            { zh: '結束時間',                en: 'End Time' },
  duration:           { zh: '耗時',                   en: 'Duration' },
  statusLabel:        { zh: '狀態',                   en: 'Status' },
  noteLabel:          { zh: '備註',                   en: 'Note' },
  qoq:                { zh: 'QoQ',                   en: 'QoQ' },
  yoy:                { zh: 'YoY',                   en: 'YoY' },
  na:                 { zh: 'N/A',                   en: 'N/A' },
} as const;

type LKey = keyof typeof L;
function t(key: LKey, lang: 'zh' | 'en'): string { return L[key][lang]; }

// ---- Helpers ----
function fmtLocale(iso: string | null, lang: 'zh' | 'en'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  });
}

function fmtTime(iso: string, lang: 'zh' | 'en'): string {
  const d = new Date(iso);
  return d.toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function fmtDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 0) return '—';
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}

function fmtDelta(val: number | null, unit: string, lang: 'zh' | 'en'): string {
  if (val === null) return t('na', lang);
  const sign = val > 0 ? '+' : '';
  return `${sign}${val}${unit}`;
}

function useCd(eventDate: string | null) {
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!eventDate) return;
    const target = new Date(eventDate).getTime();
    function update() {
      const diff = target - Date.now();
      if (diff <= 0) { setShow(false); return; }
      setShow(true);
      const s = Math.floor(diff / 1000);
      setCd({ d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 });
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [eventDate]);
  return { cd, show };
}

// ---- Company Detail Panel ----
interface DetailPanelProps {
  company: typeof COMPANIES[number];
  data: AgentData | null;
  loading: boolean;
  error: string | null;
  lang: 'zh' | 'en';
}

function DetailPanel({ company, data, loading, error, lang }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'highlights' | 'risks' | 'outlook' | 'keyQuotes'>('highlights');
  const { cd, show: showCd } = useCd(data?.status === 'WAITING' ? data.eventDate : null);

  if (loading) {
    return <div className="ea-detail-placeholder">{t('loading', lang)}</div>;
  }
  if (error || !data) {
    return (
      <div className="ea-error-banner">
        {t('agentOffline', lang)}{error ? `: ${error}` : ''}
      </div>
    );
  }

  const statusLabel = data.status === 'LIVE' ? t('live', lang)
    : data.status === 'DONE' ? t('done', lang) : t('waiting', lang);
  const statusMod = data.status === 'LIVE' ? '--live' : data.status === 'DONE' ? '--done' : '--waiting';

  return (
    <div className="ea-detail">
      {/* Header */}
      <div className="ea-detail-header">
        <div className="ea-detail-title">
          <span className="ea-detail-ticker">{company.ticker}</span>
          <span className="ea-detail-name">{company.name}</span>
          <span className="ea-detail-quarter">{company.quarter}</span>
        </div>
        <div className="ea-status-bar">
          <span className={`ea-badge ea-badge${statusMod}`}>{statusLabel}</span>
          <span className="ea-meta">{t('eventDate', lang)}: {fmtLocale(data.eventDate, lang)}</span>
          <span className="ea-meta">{t('lastUpdated', lang)}: {fmtLocale(data.lastUpdated, lang)}</span>
        </div>
      </div>

      {/* Countdown */}
      {data.status === 'WAITING' && showCd && (
        <div className="ea-countdown">
          <span className="ea-meta">{t('countdown', lang)}</span>
          <span className="ea-countdown-value">{cd.d}d {cd.h}h {cd.m}m {cd.s}s</span>
        </div>
      )}

      {/* Metrics */}
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
              {([
                ['revenue',     t('revenue', lang),     '$', 'B',    '%',  '%'  ],
                ['grossMargin', t('grossMargin', lang),  '',  '%',    'pp', 'pp' ],
                ['doi',         t('doi', lang),          '',  ' days','d',  'd'  ],
              ] as const).map(([key, label, prefix, unit, qUnit, yUnit]) => {
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
                    ) : <div className="ea-metric-na">—</div>}
                  </div>
                );
              })}
            </div>
          )}
          <div className="ea-data-ts-group">
            {data.metricsCreatedAt && (
              <div className="ea-data-ts">🕐 {t('metricsCreated', lang)}: {fmtLocale(data.metricsCreatedAt, lang)}</div>
            )}
            {data.metricsUpdatedAt && (
              <div className="ea-data-ts">🔄 {t('metricsAt', lang)}: {fmtLocale(data.metricsUpdatedAt, lang)}</div>
            )}
          </div>
        </section>
      )}

      {/* Transcript */}
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
              {typeof data.transcriptSummary.summaryConfidence === 'number' && (
                <div className="ea-overall-conf ea-overall-conf--transcript">
                  {t('summaryConf', lang)}:&nbsp;
                  <span className={`ea-conf-badge ${data.transcriptSummary.summaryConfidence >= 70 ? 'ea-conf-badge--ok' : 'ea-conf-badge--warn'}`}>
                    {data.transcriptSummary.summaryConfidence}%
                  </span>
                </div>
              )}
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
          <div className="ea-data-ts-group">
            {data.transcriptRawFetchedAt && (
              <div className="ea-data-ts">🕐 {t('fetchedAt', lang)}: {fmtLocale(data.transcriptRawFetchedAt, lang)}</div>
            )}
            {data.transcriptSummaryCreatedAt && (
              <div className="ea-data-ts">✨ {t('summaryCreated', lang)}: {fmtLocale(data.transcriptSummaryCreatedAt, lang)}</div>
            )}
            {data.transcriptSummaryUpdatedAt && (
              <div className="ea-data-ts">🔄 {t('transcriptAt', lang)}: {fmtLocale(data.transcriptSummaryUpdatedAt, lang)}</div>
            )}
          </div>
        </section>
      )}

      {/* Job History */}
      {data.jobHistory.length > 0 && (
        <section className="ea-section">
          <h3 className="ea-section-title">{t('jobHistory', lang)} ({data.jobHistory.length})</h3>
          <div className="ea-table-wrap">
            <table className="ea-table">
              <thead>
                <tr>
                  <th>{t('jobId', lang)}</th>
                  <th>{t('startTime', lang)}</th>
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
                    <td>{fmtDuration(job.startTime, job.endTime)}</td>
                    <td>
                      <span className={`ea-job-badge ea-job-badge--${job.status}`}>{job.status}</span>
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

// ---- Main component ----
export default function EarningsAgentContent() {
  const { lang } = useLanguage();
  const [selected, setSelected] = useState<CompanyId>('dell');
  const [companyData, setCompanyData] = useState<Record<CompanyId, AgentData | null>>({
    dell: null, broadcom: null,
  });
  const [companyLoading, setCompanyLoading] = useState<Record<CompanyId, boolean>>({
    dell: true, broadcom: true,
  });
  const [companyError, setCompanyError] = useState<Record<CompanyId, string | null>>({
    dell: null, broadcom: null,
  });

  // Poll all companies every 30s
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchAll() {
    await Promise.all(
      COMPANIES.map(async (co) => {
        try {
          const res = await fetch(`${co.apiPath}/api/earnings`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json: AgentData = await res.json();
          setCompanyData(prev => ({ ...prev, [co.id]: json }));
          setCompanyError(prev => ({ ...prev, [co.id]: null }));
        } catch (e) {
          setCompanyError(prev => ({ ...prev, [co.id]: String(e) }));
        } finally {
          setCompanyLoading(prev => ({ ...prev, [co.id]: false }));
        }
      })
    );
  }

  useEffect(() => {
    fetchAll();
    pollRef.current = setInterval(fetchAll, 30_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCompany = COMPANIES.find(c => c.id === selected)!;

  function statusMod(data: AgentData | null) {
    if (!data) return '--waiting';
    return data.status === 'LIVE' ? '--live' : data.status === 'DONE' ? '--done' : '--waiting';
  }
  function statusDot(data: AgentData | null) {
    if (!data) return '○';
    return data.status === 'LIVE' ? '●' : data.status === 'DONE' ? '✓' : '○';
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad">
            <div className="ea-multi-layout">

              {/* Left: company list */}
              <div className="ea-company-list">
                <div className="ea-company-list-title">{t('companies', lang)}</div>
                {COMPANIES.map(co => {
                  const data = companyData[co.id];
                  const mod = statusMod(data);
                  const dot = statusDot(data);
                  const isActive = selected === co.id;
                  return (
                    <button
                      key={co.id}
                      className={`ea-company-item${isActive ? ' ea-company-item--active' : ''}`}
                      onClick={() => setSelected(co.id)}
                    >
                      <span className={`ea-company-dot ea-company-dot${mod}`}>{dot}</span>
                      <div className="ea-company-info">
                        <span className="ea-company-ticker">{co.ticker}</span>
                        <span className="ea-company-name">{co.name}</span>
                        <span className="ea-company-quarter">{co.quarter}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right: detail */}
              <div className="ea-detail-panel">
                <DetailPanel
                  company={selectedCompany}
                  data={companyData[selected]}
                  loading={companyLoading[selected]}
                  error={companyError[selected]}
                  lang={lang}
                />
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add new CSS classes to `app/globals.css`**

Append at the bottom before the existing RWD section:

```css
/* ===== EARNINGS AGENT — MULTI-COMPANY LAYOUT ===== */

.ea-multi-layout {
  display: flex;
  gap: 0;
  min-height: 600px;
  align-items: flex-start;
}

/* ── Company list (left) ── */
.ea-company-list {
  width: 200px;
  flex-shrink: 0;
  border-right: 1px solid var(--c-border);
  padding-right: 12px;
  margin-right: 20px;
}

.ea-company-list-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--c-text-3);
  padding: 0 8px 10px;
}

.ea-company-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 10px 8px;
  border: none;
  background: transparent;
  border-radius: var(--radius);
  cursor: pointer;
  text-align: left;
  transition: background .15s;
}

.ea-company-item:hover { background: var(--c-bg); }
.ea-company-item--active { background: var(--c-bg); }

.ea-company-dot {
  font-size: 14px;
  line-height: 1.4;
  flex-shrink: 0;
}
.ea-company-dot--live    { color: var(--c-pos); }
.ea-company-dot--done    { color: var(--c-text-3); }
.ea-company-dot--waiting { color: #f59e0b; }

.ea-company-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.ea-company-ticker {
  font-weight: 700;
  font-size: 13px;
  color: var(--c-text);
}

.ea-company-name {
  font-size: 11px;
  color: var(--c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
}

.ea-company-quarter {
  font-size: 10px;
  color: var(--c-text-4);
}

/* ── Detail panel (right) ── */
.ea-detail-panel {
  flex: 1;
  min-width: 0;
}

.ea-detail { width: 100%; }

.ea-detail-header {
  margin-bottom: 16px;
}

.ea-detail-title {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.ea-detail-ticker {
  font-size: 20px;
  font-weight: 700;
  color: var(--c-text);
}

.ea-detail-name {
  font-size: 15px;
  color: var(--c-text-2);
}

.ea-detail-quarter {
  font-size: 12px;
  color: var(--c-text-3);
  background: var(--c-bg);
  padding: 2px 8px;
  border-radius: 12px;
}

.ea-detail-placeholder {
  color: var(--c-text-3);
  padding: 40px 0;
  text-align: center;
}

/* ── Timestamp group ── */
.ea-data-ts-group {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* RWD */
@media (max-width: 768px) {
  .ea-multi-layout {
    flex-direction: column;
  }
  .ea-company-list {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--c-border);
    padding-right: 0;
    margin-right: 0;
    margin-bottom: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .ea-company-item {
    width: auto;
    flex-direction: row;
    align-items: center;
    border: 1px solid var(--c-border);
  }
  .ea-company-item--active {
    border-color: var(--c-accent);
  }
}
```

- [ ] **Step 3: Build Next.js**

```bash
cd /home/ubuntu/lego && npm run build 2>&1 | tail -20
```
Expected: `Route (app) ... /earnings-agent  ... static` and build exits 0. Fix any TypeScript errors before continuing.

- [ ] **Step 4: Commit UI changes**

```bash
cd /home/ubuntu/lego
git add app/earnings-agent/EarningsAgentContent.tsx app/globals.css
git commit -m "feat(ui): multi-company earnings page with left-list + right-detail layout

- Company registry: DELL + AVGO with separate API endpoints
- Left panel: company selector with live status badges
- Right panel: DetailPanel component with full metrics/transcript/jobs
- Timestamps: metricsCreatedAt + transcriptSummaryCreatedAt (first-created)
  alongside metricsUpdatedAt + transcriptSummaryUpdatedAt (last-updated)
- Polls all companies simultaneously every 30s
- Responsive: stacks vertically on mobile

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main
```

---

## Chunk 5: Deploy and Verify

### Task 13: Deploy to lego2.hwchiu.com

- [ ] **Step 1: Restart Dell agent with latest build**

```bash
APID=$(cat /home/ubuntu/dell-agent.pid)
kill $APID
sleep 1
cd /home/ubuntu/lego/dell-earnings-agent && npm run build
nohup node dist/index.js >> /home/ubuntu/dell-agent.log 2>&1 &
echo $! > /home/ubuntu/dell-agent.pid
disown $(cat /home/ubuntu/dell-agent.pid)
sleep 3
curl -s http://localhost:3002/api/earnings | python3 -c "import sys,json; d=json.load(sys.stdin); print('Dell:', d['status'], '| metricsCreatedAt:', d.get('metricsCreatedAt','MISSING'))"
```
Expected: `Dell: DONE | metricsCreatedAt: 2026-05-29T...`

- [ ] **Step 2: Start Broadcom agent**

```bash
cd /home/ubuntu/lego/broadcom-earnings-agent
nohup node dist/index.js >> /home/ubuntu/broadcom-agent.log 2>&1 &
echo $! > /home/ubuntu/broadcom-agent.pid
disown $(cat /home/ubuntu/broadcom-agent.pid)
sleep 3
curl -s http://localhost:3003/api/earnings | python3 -c "import sys,json; d=json.load(sys.stdin); print('Broadcom:', d['status'], '| eventDate:', d.get('eventDate'))"
```
Expected: `Broadcom: WAITING | eventDate: 2026-06-03T21:00:00Z`

- [ ] **Step 3: Restart static file server with new Next.js build**

```bash
SPID=$(ss -tlnp | grep ':4173' | grep -oP 'pid=\K[0-9]+' | head -1)
kill $SPID
sleep 1
nohup serve -s /home/ubuntu/lego/out -p 4173 >> /home/ubuntu/serve.log 2>&1 &
disown $!
sleep 2
ss -tlnp | grep 4173 && echo "✅ serve up"
```

- [ ] **Step 4: Smoke test the full stack**

```bash
# Dell API via nginx
curl -s -o /dev/null -w "Dell API: %{http_code}\n" https://lego2.hwchiu.com/earnings-api/dell/api/earnings

# Broadcom API via nginx
curl -s -o /dev/null -w "Broadcom API: %{http_code}\n" https://lego2.hwchiu.com/earnings-api/broadcom/api/earnings

# UI page
curl -s -o /dev/null -w "UI: %{http_code}\n" https://lego2.hwchiu.com/lego/earnings-agent/
```
Expected: all 200.

- [ ] **Step 5: Manually verify in browser**

Open `https://lego2.hwchiu.com/lego/earnings-agent/`:
- ✅ Left panel shows DELL (DONE ✓) and AVGO (WAITING ○)
- ✅ DELL detail shows metrics, transcript summary, job history
- ✅ DELL shows `Metrics created:` and `Metrics updated:` timestamps
- ✅ Clicking AVGO switches to Broadcom detail with WAITING status + countdown
- ✅ Page scrolls within `.main-content` (not browser window)
