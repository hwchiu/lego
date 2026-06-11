# Format Reference + Video Transcript Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen parser accuracy via historical field-format injection and add video-based caption sources to the live transcript pipeline.

**Architecture:** (1) A one-time ESM prep script crawls the last 3 Broadcom 8-K filings, extracts field metadata + few-shot examples, and writes `scripts/format-reference.json`. The TypeScript parser loads this file at startup and prepends field hints + a one-shot example to the LLM prompt. (2) A new `videoTranscriptFetcher.ts` module tries YouTube auto-captions via `yt-dlp`, then falls back to Broadcom IR webcast VTT; it is wired into `liveTranscriptFetcher.ts` as a third source.

**Tech Stack:** TypeScript (CommonJS, ts-jest), ESM JS (prep script), axios, cheerio, Node.js `child_process.spawnSync` (yt-dlp), GitHub Models API (same pattern as `aiClient.ts`)

---

## File Map

| File | Status | Responsibility |
|------|--------|----------------|
| `broadcom-earnings-agent/.gitignore` | MODIFY | add `scripts/format-reference.json` |
| `broadcom-earnings-agent/package.json` | MODIFY | add jest + ts-jest devDeps + `test` script |
| `broadcom-earnings-agent/jest.config.js` | CREATE | ts-jest config, mirrors dell-earnings-agent |
| `broadcom-earnings-agent/scripts/prepare-format-reference.mjs` | CREATE | one-time EDGAR crawler + GitHub Models AI extractor |
| `broadcom-earnings-agent/src/videoTranscriptFetcher.ts` | CREATE | yt-dlp + IR webcast VTT strategies |
| `broadcom-earnings-agent/src/liveTranscriptFetcher.ts` | MODIFY | add `tryVideoTranscript()` as third source |
| `broadcom-earnings-agent/src/claudeParser.ts` | MODIFY | load `format-reference.json`, inject field hints + one-shot |
| `broadcom-earnings-agent/__tests__/claudeParser.test.ts` | CREATE | tests for format-reference injection |
| `broadcom-earnings-agent/__tests__/videoTranscriptFetcher.test.ts` | CREATE | tests for VTT parser + stub network paths |

---

## Task 1: Add Test Infrastructure

**Files:**
- Modify: `broadcom-earnings-agent/package.json`
- Create: `broadcom-earnings-agent/jest.config.js`

- [ ] **Step 1.1: Install jest, ts-jest, @types/jest**

```bash
cd /path/to/lego/broadcom-earnings-agent
npm install --save-dev jest@^29.7.0 ts-jest@^29.1.0 @types/jest@^29.5.0
```

Expected: `package-lock.json` updated, no errors.

- [ ] **Step 1.2: Add `test` script to `package.json` scripts**

In `package.json`, update the `"scripts"` block:
```json
"scripts": {
  "start": "node dist/index.js",
  "dev": "ts-node src/index.ts",
  "build": "tsc",
  "test": "jest"
}
```

- [ ] **Step 1.3: Create `jest.config.js`**

```js
// broadcom-earnings-agent/jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
};
```

- [ ] **Step 1.4: Create `__tests__/` directory and smoke-test**

```bash
mkdir -p __tests__
echo "it('smoke', () => expect(1).toBe(1));" > __tests__/smoke.test.ts
npm test -- --testPathPattern=smoke
```

Expected output: `1 passed`

- [ ] **Step 1.5: Remove smoke test**

```bash
rm __tests__/smoke.test.ts
```

- [ ] **Step 1.6: Commit**

```bash
git add package.json package-lock.json jest.config.js
git commit -m "chore(broadcom-agent): add jest + ts-jest test infrastructure"
```

---

## Task 2: Update `.gitignore`

**Files:**
- Modify: `broadcom-earnings-agent/.gitignore`

- [ ] **Step 2.1: Add `scripts/format-reference.json` to `.gitignore`**

Append to `.gitignore`:
```
scripts/format-reference.json
```

The full `.gitignore` should be:
```
node_modules/
dist/
state.json
.env
scripts/format-reference.json
```

- [ ] **Step 2.2: Commit**

```bash
git add .gitignore
git commit -m "chore(broadcom-agent): gitignore generated format-reference.json"
```

---

## Task 3: Create `src/videoTranscriptFetcher.ts` with Tests

**Files:**
- Create: `broadcom-earnings-agent/src/videoTranscriptFetcher.ts`
- Create: `broadcom-earnings-agent/__tests__/videoTranscriptFetcher.test.ts`

The module has three pure/testable units: `parseVttToText`, `findYouTubeVideoId`, `fetchVideoTranscript`. Keep network calls behind thin wrappers so tests can mock axios and spawnSync.

- [ ] **Step 3.1: Write the failing tests first**

```ts
// broadcom-earnings-agent/__tests__/videoTranscriptFetcher.test.ts
import { parseVttToText } from '../src/videoTranscriptFetcher';

describe('parseVttToText', () => {
  it('strips WEBVTT header and timestamp lines', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:03.000
Hello everyone

00:00:03.000 --> 00:00:06.000
welcome to the call`;
    expect(parseVttToText(vtt)).toBe('Hello everyone welcome to the call');
  });

  it('strips inline HTML tags', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
<c>Revenue</c> was <b>14.9</b> billion`;
    expect(parseVttToText(vtt)).toBe('Revenue was 14.9 billion');
  });

  it('deduplicates adjacent identical lines', () => {
    const vtt = `WEBVTT

00:00:00.000 --> 00:00:02.000
Hello

00:00:01.000 --> 00:00:03.000
Hello

00:00:03.000 --> 00:00:05.000
World`;
    expect(parseVttToText(vtt)).toBe('Hello World');
  });

  it('returns empty string for blank VTT', () => {
    expect(parseVttToText('WEBVTT\n\n')).toBe('');
  });
});
```

- [ ] **Step 3.2: Run tests to verify they fail**

```bash
cd /path/to/lego/broadcom-earnings-agent
npm test -- --testPathPattern=videoTranscriptFetcher
```

Expected: FAIL with `Cannot find module '../src/videoTranscriptFetcher'`

- [ ] **Step 3.3: Create `src/videoTranscriptFetcher.ts`**

```ts
// broadcom-earnings-agent/src/videoTranscriptFetcher.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { LiveContentResult } from './liveTranscriptFetcher';

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36';

/**
 * Convert VTT caption text to plain text:
 * 1. Remove the WEBVTT header and NOTE blocks
 * 2. Remove timestamp lines (lines containing " --> ")
 * 3. Strip inline HTML tags
 * 4. Deduplicate adjacent identical lines (VTT repeats lines as captions progress)
 * 5. Join with spaces
 */
export function parseVttToText(vttContent: string): string {
  const lines = vttContent.split('\n');
  const textLines: string[] = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('WEBVTT')) continue;
    if (line.startsWith('NOTE')) continue;
    if (line.includes(' --> ')) continue;
    // Strip inline HTML tags
    const clean = line.replace(/<[^>]+>/g, '').trim();
    if (!clean) continue;
    // Deduplicate adjacent identical lines
    if (textLines.length > 0 && textLines[textLines.length - 1] === clean) continue;
    textLines.push(clean);
  }
  return textLines.join(' ');
}

// ─── Strategy 1: YouTube auto-captions via yt-dlp ───────────────────────────

function isYtDlpAvailable(): boolean {
  const result = spawnSync('yt-dlp', ['--version'], { encoding: 'utf8' });
  return result.status === 0;
}

export async function findYouTubeVideoId(_eventDate: Date): Promise<string | null> {
  try {
    const query = encodeURIComponent('Broadcom AVGO earnings call fiscal Q2 2026');
    const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
    const res = await axios.get(searchUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const html: string = res.data;
    const videoIdPattern = /\/watch\?v=([\w-]{11})/g;
    let match: RegExpExecArray | null;
    while ((match = videoIdPattern.exec(html)) !== null) {
      const videoId = match[1];
      // Look for the video title nearby in the raw HTML (~200 chars context)
      const start = Math.max(0, match.index - 200);
      const end   = Math.min(html.length, match.index + 200);
      const ctx = html.slice(start, end).toLowerCase();
      if ((ctx.includes('broadcom') || ctx.includes('avgo')) && ctx.includes('earn')) {
        return videoId;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchYouTubeCaptions(videoId: string): Promise<string | null> {
  const outputTemplate = `/tmp/avgo-captions-${videoId}`;
  const vttPath = `${outputTemplate}.en.vtt`;

  // Remove stale file from a previous run
  if (fs.existsSync(vttPath)) fs.unlinkSync(vttPath);

  const result = spawnSync(
    'yt-dlp',
    [
      '--write-auto-sub',
      '--sub-lang', 'en',
      '--skip-download',
      '--quiet',
      '-o', outputTemplate,
      `https://www.youtube.com/watch?v=${videoId}`,
    ],
    { timeout: 60_000 },
  );

  if (result.status !== 0 || !fs.existsSync(vttPath)) return null;

  const vttContent = fs.readFileSync(vttPath, 'utf8');
  fs.unlinkSync(vttPath);
  return parseVttToText(vttContent) || null;
}

// ─── Strategy 2: Broadcom IR Webcast ────────────────────────────────────────

async function findBroadcomWebcastUrl(_eventDate: Date): Promise<string | null> {
  try {
    const irUrl = 'https://investors.broadcom.com/events-and-presentations';
    const res = await axios.get(irUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const $ = cheerio.load(res.data);
    let webcastUrl: string | null = null;
    $('a').each((_i, el) => {
      if (webcastUrl) return;
      const href = $(el).attr('href') ?? '';
      const text = $(el).text().toLowerCase();
      if (
        (href.toLowerCase().includes('webcast') ||
          href.toLowerCase().includes('listen') ||
          text.includes('webcast') ||
          text.includes('listen live')) &&
        (text.includes('earn') || text.includes('q2') || text.includes('second quarter'))
      ) {
        webcastUrl = href.startsWith('http') ? href : `https://investors.broadcom.com${href}`;
      }
    });
    return webcastUrl;
  } catch {
    return null;
  }
}

async function fetchWebcastCaptions(webcastUrl: string): Promise<string | null> {
  try {
    const res = await axios.get(webcastUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const html: string = res.data;
    const $ = cheerio.load(html);

    // Try <track> elements first
    let captionUrl: string | null = null;
    $('track').each((_i, el) => {
      if (captionUrl) return;
      const src = $(el).attr('src') ?? '';
      if (src.endsWith('.vtt') || src.endsWith('.srt')) {
        captionUrl = src.startsWith('http') ? src : new URL(src, webcastUrl).href;
      }
    });

    // Fall back: scan raw HTML for .vtt/.srt URL patterns
    if (!captionUrl) {
      const captionMatch = html.match(/["'](https?:\/\/[^"']*\.(?:vtt|srt))/);
      captionUrl = captionMatch?.[1] ?? null;
    }

    if (!captionUrl) return null;

    const captionRes = await axios.get(captionUrl, { timeout: 15_000 });
    return parseVttToText(captionRes.data) || null;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function fetchVideoTranscript(
  eventDate: Date,
  _targetQuarter: string,
): Promise<LiveContentResult | null> {
  // Strategy 1: YouTube
  if (isYtDlpAvailable()) {
    try {
      const videoId = await findYouTubeVideoId(eventDate);
      if (videoId) {
        const text = await fetchYouTubeCaptions(videoId);
        if (text && text.length > 200) return { content: text, source: 'YouTube' };
      }
    } catch {
      console.warn('[videoTranscriptFetcher] YouTube strategy failed');
    }
  } else {
    console.warn('[videoTranscriptFetcher] yt-dlp not found in PATH — skipping YouTube captions');
  }

  // Strategy 2: Broadcom IR Webcast
  try {
    const webcastUrl = await findBroadcomWebcastUrl(eventDate);
    if (webcastUrl) {
      const text = await fetchWebcastCaptions(webcastUrl);
      if (text && text.length > 200) return { content: text, source: 'IR Webcast' };
    }
  } catch {
    console.warn('[videoTranscriptFetcher] IR Webcast strategy failed');
  }

  return null;
}
```

- [ ] **Step 3.4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=videoTranscriptFetcher
```

Expected: `4 passed`

- [ ] **Step 3.5: Build to check TypeScript**

```bash
npm run build 2>&1 | head -30
```

Expected: no errors (exit 0)

- [ ] **Step 3.6: Commit**

```bash
git add src/videoTranscriptFetcher.ts __tests__/videoTranscriptFetcher.test.ts
git commit -m "feat(broadcom-agent): add videoTranscriptFetcher with yt-dlp + IR webcast strategies"
```

---

## Task 4: Wire Video Source into `liveTranscriptFetcher.ts`

**Files:**
- Modify: `broadcom-earnings-agent/src/liveTranscriptFetcher.ts`

- [ ] **Step 4.1: Add `tryVideoTranscript` to `fetchLivePartialContent`**

In `src/liveTranscriptFetcher.ts`, add the import at the top:
```ts
import { fetchVideoTranscript } from './videoTranscriptFetcher';
```

Then replace the existing `fetchLivePartialContent` function body:

Old:
```ts
export async function fetchLivePartialContent(
  _eventDate: Date,
  targetQuarter: string,
): Promise<LiveContentResult | null> {
  for (const fn of [tryMotleyFool, () => trySeekingAlpha(targetQuarter)]) {
    try {
      const result = await fn();
      if (result) return result;
    } catch { /* try next source */ }
  }
  return null;
}
```

New:
```ts
export async function fetchLivePartialContent(
  eventDate: Date,
  targetQuarter: string,
): Promise<LiveContentResult | null> {
  for (const fn of [
    tryMotleyFool,
    () => trySeekingAlpha(targetQuarter),
    () => fetchVideoTranscript(eventDate, targetQuarter),
  ]) {
    try {
      const result = await fn();
      if (result) return result;
    } catch { /* try next source */ }
  }
  return null;
}
```

- [ ] **Step 4.2: Build to verify no TypeScript errors**

```bash
npm run build 2>&1 | head -20
```

Expected: exit 0, no errors

- [ ] **Step 4.3: Run all tests**

```bash
npm test
```

Expected: all existing tests pass (currently only `videoTranscriptFetcher.test.ts`)

- [ ] **Step 4.4: Commit**

```bash
git add src/liveTranscriptFetcher.ts
git commit -m "feat(broadcom-agent): wire video transcript as third live source"
```

---

## Task 5: Create `scripts/prepare-format-reference.mjs`

**Files:**
- Create: `broadcom-earnings-agent/scripts/prepare-format-reference.mjs`

This is plain ESM JavaScript (`.mjs`). It cannot `import` TypeScript files. It reimplements the table-preserving HTML extraction logic from `avgoIRFetcher.ts` inline using `cheerio`. It calls the GitHub Models API using the same pattern as `aiClient.ts`.

- [ ] **Step 5.1: Create the `scripts/` directory and the script**

```bash
mkdir -p scripts
```

Create `scripts/prepare-format-reference.mjs`:

```js
#!/usr/bin/env node
// scripts/prepare-format-reference.mjs
// One-time prep: crawls last 3 Broadcom 8-K press releases from SEC EDGAR,
// extracts field metadata via GitHub Models API, writes scripts/format-reference.json
import { execSync } from 'child_process';
import { createRequire } from 'module';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const require = createRequire(import.meta.url);
const axios   = require('axios');
const cheerio = require('cheerio');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ─── Token resolution ────────────────────────────────────────────────────────
function getGitHubToken() {
  const envPath = path.join(PROJECT_ROOT, '.env');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const m = line.match(/^GITHUB_TOKEN\s*=\s*["']?(.+?)["']?\s*$/);
      if (m) return m[1].trim();
    }
  }
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync('gh auth token', { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('GITHUB_TOKEN not found in .env, environment, or gh auth token');
  }
}

// ─── EDGAR ───────────────────────────────────────────────────────────────────
const AVGO_CIK = '1054374';
const EDGAR_HEADERS = {
  'User-Agent': 'BroadcomEarningsAgent/1.0 (contact: agent@lego2.hwchiu.com)',
  'Accept':     'application/json, text/html',
};

async function fetchRecentEdgar8Ks(count = 3) {
  // Search last 18 months to guarantee at least 3 quarterly 8-Ks
  const endDt   = new Date().toISOString().slice(0, 10);
  const startDt = new Date(Date.now() - 18 * 30 * 86_400_000).toISOString().slice(0, 10);
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22Broadcom%22&dateRange=custom&startdt=${startDt}&enddt=${endDt}&forms=8-K&entity=${AVGO_CIK}`;
  console.log('[edgar] Searching:', url);
  const res = await axios.get(url, { timeout: 20_000, headers: EDGAR_HEADERS });
  const hits = res.data?.hits?.hits ?? [];
  const results = [];
  for (const hit of hits) {
    if (results.length >= count) break;
    const id = hit._id ?? '';
    const [accession, filename] = id.split(':');
    if (!filename) continue;
    const lc = filename.toLowerCase();
    if (lc.includes('exhibit99') || lc.includes('ex99') || lc.includes('earnings')) {
      const accPath = accession.replace(/-/g, '');
      const prUrl = `https://www.sec.gov/Archives/edgar/data/${AVGO_CIK}/${accPath}/${filename}`;
      results.push({ url: prUrl, accession, filename });
    }
  }
  return results;
}

// ─── HTML extraction (mirrors avgoIRFetcher.ts table-preserving logic) ───────
function extractTextFromHtml(html) {
  const $ = cheerio.load(html);
  $('script, style, noscript').remove();

  const tableLines = [];
  $('table').each((_i, table) => {
    $(table).find('tr').each((_j, row) => {
      const cells = $(row)
        .find('td, th')
        .map((_k, cell) => $(cell).text().replace(/\s+/g, ' ').trim())
        .get()
        .filter(c => c.length > 0);
      if (cells.length > 0) tableLines.push(cells.join(' | '));
    });
  });
  $('table').remove();

  const narrativeText =
    $('article').text().trim() ||
    $('main').text().trim()    ||
    $('body').text().trim();

  return [narrativeText, ...tableLines].filter(Boolean).join('\n');
}

// ─── GitHub Models API ───────────────────────────────────────────────────────
async function callGitHubModels(token, systemPrompt, userContent) {
  const res = await axios.post(
    'https://models.inference.ai.azure.com/chat/completions',
    {
      model:       'gpt-4o-mini',
      max_tokens:  1024,
      temperature: 0.2,
      messages: [
        { role: 'system',  content: systemPrompt },
        { role: 'user',    content: userContent.slice(0, 12_000) },
      ],
    },
    {
      timeout: 30_000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
    },
  );
  return res.data.choices?.[0]?.message?.content ?? '';
}

// ─── AI field extraction ─────────────────────────────────────────────────────
const FIELD_MAP_PROMPT = `You are a financial document analyst for Broadcom press releases.
Given the text of a Broadcom quarterly earnings press release, identify:
1. The exact row label used for Revenue (e.g. "Net revenue")
2. The exact row label used for Non-GAAP Gross Margin (e.g. "Non-GAAP gross margin")
3. The exact row label used for Days Inventory Outstanding / DOI (e.g. "Days inventory outstanding")
4. The table title that contains DOI
5. The column headers for the most recent period

Return ONLY valid JSON in this format, no markdown:
{
  "quarter": "<quarter string, e.g. Q2 FY2026>",
  "tableTitle": "<table title containing DOI>",
  "rowLabels": {
    "revenue": "<exact label>",
    "grossMargin": "<exact label>",
    "doi": "<exact label>"
  },
  "columnHeaders": ["<most recent quarter>", "<prior quarter>", "<year-ago quarter>"]
}`;

const METRICS_PROMPT = `You are a financial data extraction assistant.
Extract the following metrics from the Broadcom press release text and return ONLY valid JSON.

{
  "revenue":     { "value": <number in $B>, "unit": "B" },
  "grossMargin": { "value": <% value>,      "unit": "%" },
  "doi":         { "value": <days>,          "unit": "days" }
}`;

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Broadcom Format Reference Prep Script ===\n');

  // Check yt-dlp (informational; not required for this script)
  try {
    const { execSync } = await import('child_process');
    execSync('yt-dlp --version', { stdio: 'ignore' });
    console.log('[check] yt-dlp: found ✓');
  } catch {
    console.warn('[check] yt-dlp: NOT FOUND. Install with: pip install yt-dlp');
    console.warn('        The video transcript feature will be skipped at runtime.\n');
  }

  const token = getGitHubToken();
  console.log('[auth] GitHub token: found ✓\n');

  const edgarHits = await fetchRecentEdgar8Ks(3);
  console.log(`[edgar] Found ${edgarHits.length} qualifying 8-K exhibit(s)\n`);

  if (edgarHits.length === 0) {
    console.error('[ERROR] No EDGAR 8-K exhibits found. Check network access and CIK.');
    process.exit(1);
  }

  const fewShotExamples = [];
  let fieldMap = null;

  for (const hit of edgarHits) {
    console.log(`[process] ${hit.url}`);
    try {
      const htmlRes = await axios.get(hit.url, { timeout: 20_000, headers: EDGAR_HEADERS });
      const text = extractTextFromHtml(htmlRes.data);
      if (!text || text.length < 500) {
        console.warn('  → text too short, skipping');
        continue;
      }

      // Extract field map
      const rawFieldMap = await callGitHubModels(token, FIELD_MAP_PROMPT, text);
      const cleanedFieldMap = rawFieldMap.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      let parsedFieldMap;
      try {
        parsedFieldMap = JSON.parse(cleanedFieldMap);
        console.log(`  → field map: ${parsedFieldMap.quarter}`);
      } catch {
        console.warn('  → field map JSON parse failed, skipping');
        continue;
      }

      // Use the first (most recent) successful field map as the canonical one
      if (!fieldMap) {
        fieldMap = {
          doi:         { tableTitle: parsedFieldMap.tableTitle, rowLabel: parsedFieldMap.rowLabels?.doi,         unit: 'days' },
          revenue:     {                                         rowLabel: parsedFieldMap.rowLabels?.revenue,     unit: 'B'    },
          grossMargin: {                                         rowLabel: parsedFieldMap.rowLabels?.grossMargin, unit: '%'    },
        };
      }

      // Extract verified metrics for the few-shot example
      const rawMetrics = await callGitHubModels(token, METRICS_PROMPT, text);
      const cleanedMetrics = rawMetrics.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      let parsedMetrics;
      try {
        parsedMetrics = JSON.parse(cleanedMetrics);
      } catch {
        console.warn('  → metrics JSON parse failed, using null');
        parsedMetrics = null;
      }

      // Extract a representative raw excerpt (first table lines containing DOI label)
      const doiLabel = parsedFieldMap.rowLabels?.doi ?? 'inventory';
      const tableSection = text
        .split('\n')
        .filter(l => l.toLowerCase().includes(doiLabel.toLowerCase().slice(0, 10)))
        .slice(0, 8)
        .join('\n');
      const rawExcerpt = (tableSection || text.slice(0, 500)).slice(0, 500);

      fewShotExamples.push({
        quarter:          parsedFieldMap.quarter,
        rawExcerpt,
        extractedMetrics: parsedMetrics,
      });
      console.log('  → example recorded ✓');
    } catch (err) {
      console.warn(`  → failed: ${err.message}`);
    }
  }

  if (fewShotExamples.length === 0) {
    console.warn('\n[WARN] No valid examples collected. Writing empty reference.');
  }

  const output = {
    generatedAt:    new Date().toISOString(),
    fieldMap:       fieldMap ?? {},
    fewShotExamples,
  };

  const outPath = path.join(__dirname, 'format-reference.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\n[done] Wrote ${outPath}`);
  console.log(`       ${fewShotExamples.length} few-shot example(s), fieldMap keys: ${Object.keys(output.fieldMap).join(', ')}`);

  if (fewShotExamples.length < 2) {
    console.warn('[WARN] Fewer than 2 examples. Parser fallback to generic prompt if quality is poor.');
  }
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
```

- [ ] **Step 5.2: Make the script executable and do a dry run check**

```bash
chmod +x scripts/prepare-format-reference.mjs
node --input-type=module <<'EOF'
import { readFileSync } from 'fs';
const src = readFileSync('./scripts/prepare-format-reference.mjs', 'utf8');
console.log('Script lines:', src.split('\n').length);
console.log('Syntax OK: script loaded without errors');
EOF
```

Expected: `Script lines: NNN` and `Syntax OK`

- [ ] **Step 5.3: Commit**

```bash
git add scripts/prepare-format-reference.mjs
git commit -m "feat(broadcom-agent): add prepare-format-reference.mjs prep script"
```

---

## Task 6: Inject Format Reference into `src/claudeParser.ts`

**Files:**
- Modify: `broadcom-earnings-agent/src/claudeParser.ts`
- Create: `broadcom-earnings-agent/__tests__/claudeParser.test.ts`

The `claudeParser.ts` currently uses a hardcoded `EXTRACTION_PROMPT`. We load `format-reference.json` once at module startup and prepend field hints + a one-shot example if available.

- [ ] **Step 6.1: Write the failing tests first**

```ts
// broadcom-earnings-agent/__tests__/claudeParser.test.ts
import { parseMetrics, _setFormatReferenceForTesting } from '../src/claudeParser';
import * as aiClient from '../src/aiClient';

jest.mock('../src/aiClient');
const mockChatComplete = aiClient.chatComplete as jest.MockedFunction<typeof aiClient.chatComplete>;

function mockAIResponse(text: string) {
  mockChatComplete.mockResolvedValue(text);
}

const VALID_RESPONSE = JSON.stringify({
  revenue:     { value: 14.9, unit: 'B',    qoq: 1.2,  yoy: 4.3,  confidence: 95 },
  grossMargin: { value: 69.1, unit: '%',    qoq: -0.3, yoy: 1.1,  confidence: 90 },
  doi:         { value: 52,   unit: 'days', qoq: -3,   yoy: -5,   confidence: 85 },
  overallConfidence: 90,
});

beforeEach(() => {
  mockChatComplete.mockClear();
  _setFormatReferenceForTesting(null);
});

describe('parseMetrics — baseline behavior', () => {
  it('parses a valid full response', async () => {
    mockAIResponse(VALID_RESPONSE);
    const result = await parseMetrics('some press release text');
    expect(result.metrics.revenue?.value).toBe(14.9);
    expect(result.metrics.grossMargin?.value).toBe(69.1);
    expect(result.metrics.doi?.value).toBe(52);
    expect(result.overallConfidence).toBe(90);
  });

  it('returns null metrics for null fields', async () => {
    mockAIResponse(JSON.stringify({ revenue: null, grossMargin: null, doi: null, overallConfidence: 20 }));
    const result = await parseMetrics('text');
    expect(result.metrics.revenue).toBeNull();
    expect(result.metrics.doi).toBeNull();
  });

  it('strips markdown fences before parsing', async () => {
    mockAIResponse('```json\n' + VALID_RESPONSE + '\n```');
    const result = await parseMetrics('text');
    expect(result.metrics.revenue?.value).toBe(14.9);
  });

  it('throws on malformed JSON', async () => {
    mockAIResponse('this is not json');
    await expect(parseMetrics('text')).rejects.toThrow();
  });
});

describe('parseMetrics — format reference injection', () => {
  it('passes generic prompt when no format reference is set', async () => {
    mockAIResponse(VALID_RESPONSE);
    await parseMetrics('text');
    const [systemPrompt] = mockChatComplete.mock.calls[0];
    expect(systemPrompt).not.toContain('FIELD HINTS');
  });

  it('injects FIELD HINTS section when format reference is available', async () => {
    _setFormatReferenceForTesting({
      generatedAt: '2026-05-29T00:00:00Z',
      fieldMap: {
        doi:         { tableTitle: 'Supplemental Data', rowLabel: 'Days inventory outstanding', unit: 'days' },
        revenue:     { rowLabel: 'Net revenue',         unit: 'B'    },
        grossMargin: { rowLabel: 'Non-GAAP gross margin', unit: '%'  },
      },
      fewShotExamples: [],
    });
    mockAIResponse(VALID_RESPONSE);
    await parseMetrics('text');
    const [systemPrompt] = mockChatComplete.mock.calls[0];
    expect(systemPrompt).toContain('FIELD HINTS');
    expect(systemPrompt).toContain('Days inventory outstanding');
    expect(systemPrompt).toContain('Net revenue');
    expect(systemPrompt).toContain('Non-GAAP gross margin');
  });

  it('injects ONE-SHOT EXAMPLE when fewShotExamples are available', async () => {
    _setFormatReferenceForTesting({
      generatedAt: '2026-05-29T00:00:00Z',
      fieldMap: {
        doi:         { tableTitle: 'Supplemental Data', rowLabel: 'Days inventory outstanding', unit: 'days' },
        revenue:     { rowLabel: 'Net revenue',         unit: 'B'    },
        grossMargin: { rowLabel: 'Non-GAAP gross margin', unit: '%'  },
      },
      fewShotExamples: [
        {
          quarter: 'Q1 FY2026',
          rawExcerpt: 'Net revenue | 14.9 | 14.1\nDays inventory outstanding | 52 | 55',
          extractedMetrics: { revenue: { value: 14.9, unit: 'B' }, grossMargin: { value: 69.0, unit: '%' }, doi: { value: 52, unit: 'days' } },
        },
      ],
    });
    mockAIResponse(VALID_RESPONSE);
    await parseMetrics('text');
    const [systemPrompt] = mockChatComplete.mock.calls[0];
    expect(systemPrompt).toContain('ONE-SHOT EXAMPLE');
    expect(systemPrompt).toContain('Q1 FY2026');
  });
});
```

- [ ] **Step 6.2: Run tests to verify they fail**

```bash
npm test -- --testPathPattern=claudeParser
```

Expected: FAIL — `_setFormatReferenceForTesting is not exported` and `FIELD HINTS` assertions fail

- [ ] **Step 6.3: Update `src/claudeParser.ts`**

Replace the entire file with:

```ts
import * as fs from 'fs';
import * as path from 'path';
import { chatComplete } from './aiClient';
import { EarningsMetrics, MetricValue } from './types';

// ─── Format reference (loaded once at startup) ────────────────────────────────

interface FieldEntry {
  tableTitle?: string;
  rowLabel:    string;
  unit:        string;
}

interface FewShotExample {
  quarter:          string;
  rawExcerpt:       string;
  extractedMetrics: unknown;
}

export interface FormatReference {
  generatedAt:    string;
  fieldMap:       Record<string, FieldEntry>;
  fewShotExamples: FewShotExample[];
}

// Resolved relative to compiled dist/claudeParser.js → ../../scripts/format-reference.json
// Note: __dirname in dist/ is <project-root>/dist, so ../scripts resolves correctly.
const FORMAT_REFERENCE_PATH = path.resolve(__dirname, '..', 'scripts', 'format-reference.json');

let _cachedRef: FormatReference | null | undefined = undefined;

function loadFormatReference(): FormatReference | null {
  if (_cachedRef !== undefined) return _cachedRef;
  try {
    const raw = fs.readFileSync(FORMAT_REFERENCE_PATH, 'utf8');
    _cachedRef = JSON.parse(raw) as FormatReference;
    console.log('[claudeParser] Loaded format reference from', FORMAT_REFERENCE_PATH);
  } catch {
    console.warn('[claudeParser] format-reference.json not found — using generic prompt');
    _cachedRef = null;
  }
  return _cachedRef;
}

/** Exposed for testing only — overrides the cached format reference. */
export function _setFormatReferenceForTesting(ref: FormatReference | null): void {
  _cachedRef = ref;
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

const BASE_EXTRACTION_PROMPT = `You are a financial data extraction assistant.
Extract the following metrics from the provided Broadcom press release text and return ONLY valid JSON.
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

function buildExtractionPrompt(ref: FormatReference | null): string {
  if (!ref || Object.keys(ref.fieldMap).length === 0) {
    return BASE_EXTRACTION_PROMPT;
  }

  const fm = ref.fieldMap;
  const fieldHints = [
    fm.revenue     && `- Revenue:        look for row label "${fm.revenue.rowLabel}"`,
    fm.grossMargin && `- Gross margin:   look for row label "${fm.grossMargin.rowLabel}"`,
    fm.doi         && `- DOI:            look for row label "${fm.doi.rowLabel}"${fm.doi.tableTitle ? ` in table "${fm.doi.tableTitle}"` : ''}`,
  ].filter(Boolean).join('\n');

  let shotSection = '';
  const firstExample = ref.fewShotExamples?.[0];
  if (firstExample) {
    shotSection = `
--- ONE-SHOT EXAMPLE (${firstExample.quarter}) ---
Input excerpt:
${firstExample.rawExcerpt}

Expected output:
${JSON.stringify(firstExample.extractedMetrics, null, 2)}
--- END EXAMPLE ---
`;
  }

  return `${BASE_EXTRACTION_PROMPT}

--- FIELD HINTS (from historical Broadcom reports) ---
${fieldHints}
---
${shotSection}`;
}

// ─── Core extraction ──────────────────────────────────────────────────────────

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
  const ref    = loadFormatReference();
  const prompt = buildExtractionPrompt(ref);
  const text   = await chatComplete(prompt, pressReleaseText, 1024);
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

- [ ] **Step 6.4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=claudeParser
```

Expected: `8 passed` (4 baseline + 3 format injection + the fences test already covered above)

- [ ] **Step 6.5: Run all tests**

```bash
npm test
```

Expected: all tests pass

- [ ] **Step 6.6: Build**

```bash
npm run build 2>&1 | head -20
```

Expected: exit 0

- [ ] **Step 6.7: Commit**

```bash
git add src/claudeParser.ts __tests__/claudeParser.test.ts
git commit -m "feat(broadcom-agent): inject historical format reference into parser prompt"
```

---

## Task 7: Run Prep Script, Restart Agent

- [ ] **Step 7.1: Install yt-dlp (if not present)**

```bash
pip install yt-dlp 2>&1 | tail -3
yt-dlp --version
```

Expected: version string like `2024.xx.xx`

- [ ] **Step 7.2: Run the prep script**

```bash
cd /path/to/lego/broadcom-earnings-agent
node scripts/prepare-format-reference.mjs
```

Expected output:
```
=== Broadcom Format Reference Prep Script ===
[check] yt-dlp: found ✓
[auth] GitHub token: found ✓
[edgar] Found 3 qualifying 8-K exhibit(s)
[process] https://www.sec.gov/Archives/edgar/data/1054374/...
  → field map: Q1 FY2026
  → example recorded ✓
...
[done] Wrote /path/to/scripts/format-reference.json
       3 few-shot example(s), fieldMap keys: doi, revenue, grossMargin
```

- [ ] **Step 7.3: Verify format-reference.json**

```bash
cat scripts/format-reference.json | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('generatedAt:', d['generatedAt'])
print('fieldMap keys:', list(d['fieldMap'].keys()))
print('fewShotExamples:', len(d['fewShotExamples']))
for ex in d['fewShotExamples']:
    print(' -', ex.get('quarter'), '— doi:', ex.get('extractedMetrics', {}).get('doi'))
"
```

Expected: all three keys (doi, revenue, grossMargin) present, ≥ 1 example, DOI values populated.

- [ ] **Step 7.4: Verify format-reference.json is gitignored**

```bash
git status scripts/format-reference.json
```

Expected: file does not appear (it's gitignored)

- [ ] **Step 7.5: Kill the running agent, rebuild, and restart**

```bash
# Find current PID
curl -s http://localhost:3003/api/earnings | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:', d.get('status'))"

# Rebuild
npm run build

# Kill old agent
kill $(lsof -ti :3003) 2>/dev/null || true

# Restart (detached)
setsid nohup node dist/index.js > /tmp/broadcom-agent.log 2>&1 &
sleep 3

# Verify
curl -s http://localhost:3003/api/earnings | python3 -c "import sys,json;d=json.load(sys.stdin);print('status:', d.get('status'), '| port 3003 OK')"
```

Expected: `status: WAITING | port 3003 OK`

- [ ] **Step 7.6: Verify format reference is loaded in agent logs**

```bash
tail -20 /tmp/broadcom-agent.log | grep -i "format reference"
```

Expected: `[claudeParser] Loaded format reference from .../scripts/format-reference.json`

- [ ] **Step 7.7: Final commit (any residual changes)**

```bash
cd /path/to/lego
git add -A
git status
git diff --cached --stat
# commit only if there are staged changes
git commit -m "feat(broadcom-agent): format reference + video transcript sources complete" || echo "nothing to commit"
```

---

## Self-Review Checklist

### Spec Coverage
- [x] `scripts/prepare-format-reference.mjs` — Task 5
- [x] `scripts/format-reference.json` gitignored — Task 2
- [x] `src/claudeParser.ts` format reference injection — Task 6
- [x] `src/videoTranscriptFetcher.ts` — Task 3
- [x] `src/liveTranscriptFetcher.ts` video source wiring — Task 4
- [x] `.gitignore` — Task 2
- [x] yt-dlp graceful skip when not in PATH — in `videoTranscriptFetcher.ts`
- [x] format-reference fallback to generic prompt when missing — in `claudeParser.ts`
- [x] prep script prints yt-dlp install hint if not found — in `prepare-format-reference.mjs`

### Type Consistency
- `LiveContentResult` is imported into `videoTranscriptFetcher.ts` from `liveTranscriptFetcher.ts` ✓
- `_setFormatReferenceForTesting` accepts `FormatReference | null` — test calls use same type ✓
- `FormatReference` interface in `claudeParser.ts` matches the JSON structure in prep script ✓
