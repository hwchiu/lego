# Design: Historical Format Reference + Video Transcript Source

**Date:** 2026-05-29  
**Project:** broadcom-earnings-agent  
**Status:** Approved — ready for implementation

---

## Problem Statement

Two weaknesses in the current agent ahead of the 6/4 earnings event:

1. **Parser fragility**: The `claudeParser.ts` extracts metrics (especially DOI) from SEC EDGAR HTML with no prior knowledge of Broadcom's specific table format. On the first run, DOI is often null because the LLM doesn't know which table/row label to look for. Using past quarterly reports to pre-build a format reference reduces this risk.

2. **Live transcript limited to text sources**: The `liveTranscriptFetcher.ts` only scrapes Motley Fool and Seeking Alpha — both JS-heavy and often unavailable during the live call. Adding video-based captioning (YouTube auto-captions + IR webcast) provides a more reliable real-time content source.

---

## Feature 1: Historical Format Reference

### Goal

Run once before 6/4. Crawl the last 3 Broadcom quarterly earnings 8-K press releases from SEC EDGAR, extract structured field metadata and raw table excerpts, and save them to `scripts/format-reference.json`. The parser injects this context into the AI prompt on every metrics extraction call.

### Script: `scripts/prepare-format-reference.mjs`

**Inputs:** None (uses SEC EDGAR public API, same CIK `1054374`)

**Token:** Reads `GITHUB_TOKEN` from `.env` or falls back to `gh auth token` — same pattern as `aiClient.ts`. The script calls the GitHub Models API directly (plain ESM, cannot import TypeScript source). No new credentials needed.

**Process:**
1. Query EDGAR full-text search for Broadcom 8-K filings (last 12 months)
2. Filter to Ex.99/earnings press release exhibits (same logic as `avgoIRFetcher.ts`)
3. For each of the 3 most recent results:
   a. Download and parse the HTML using the improved table-preserving extractor
   b. Call GitHub Models API (same token) to extract a `FieldMap`:
      ```json
      {
        "quarter": "Q1 FY2026",
        "tableTitle": "GAAP to Non-GAAP Reconciliation",
        "rowLabels": {
          "revenue": "Net revenue",
          "grossMargin": "Non-GAAP gross margin",
          "doi": "Days inventory outstanding"
        },
        "columnHeaders": ["Q1 FY2026", "Q4 FY2025", "Q1 FY2025"]
      }
      ```
   c. Extract the relevant table section as a raw text excerpt (≤ 500 chars)
   d. Record the verified extracted metrics for that quarter as the expected output

**Output: `scripts/format-reference.json`**
```json
{
  "generatedAt": "2026-05-29T...",
  "fieldMap": {
    "doi": {
      "tableTitle": "...",
      "rowLabel": "Days inventory outstanding",
      "unit": "days"
    },
    "revenue": { "rowLabel": "Net revenue", "unit": "B" },
    "grossMargin": { "rowLabel": "Non-GAAP gross margin", "unit": "%" }
  },
  "fewShotExamples": [
    {
      "quarter": "Q1 FY2026",
      "rawExcerpt": "...",
      "extractedMetrics": { "revenue": {...}, "grossMargin": {...}, "doi": {...} }
    }
  ]
}
```

This file is gitignored (generated artifact). Added to `.gitignore`.

### Parser Integration: `src/claudeParser.ts`

- Loads `format-reference.json` once at module level (cached, falls back gracefully if missing)
- Prepends two sections to the extraction prompt:
  1. **Field hints**: "In Broadcom press releases, DOI appears with row label '...' in table '...'"
  2. **Few-shot example**: one `rawExcerpt → extractedMetrics` pair from the most recent quarter

### Error Handling

- If EDGAR returns no results for a quarter: skip that quarter, continue
- If AI extraction fails for a report: skip that report, continue
- If the script produces < 2 valid examples: prints a warning but still saves whatever it found
- If `format-reference.json` is missing at runtime: parser falls back to the generic prompt (current behavior)

---

## Feature 2: Video Transcript Source

### Goal

During the LIVE phase (every 20 min), attempt to extract real-time captions from the Broadcom earnings call video. Two strategies tried in order: YouTube auto-captions (via `yt-dlp`) then Broadcom IR webcast page VTT track.

### New File: `src/videoTranscriptFetcher.ts`

**Strategy 1 — YouTube auto-captions**

1. `findYouTubeVideoId(eventDate)`:
   - GET `https://www.youtube.com/results?search_query=Broadcom+AVGO+Q2+FY2026+earnings`
   - Parse HTML for video IDs (`/watch?v=XXXXXXXXXXX`)
   - Filter: video title must contain "broadcom" or "avgo" AND "earn" (case-insensitive)
   - Return the first matching video ID, or `null`

2. `fetchYouTubeCaptions(videoId)`:
   - Runs: `yt-dlp --write-auto-sub --sub-lang en --skip-download --quiet -o /tmp/avgo-captions-%(id)s %(url)s`
   - Reads `/tmp/avgo-captions-{videoId}.en.vtt`
   - Strips VTT timestamps/tags → plain text
   - Returns the text, or `null` if yt-dlp fails / captions unavailable

3. System check: if `yt-dlp` is not found in PATH, logs a warning and returns `null` (graceful skip)

**Strategy 2 — Broadcom IR Webcast**

1. `findBroadcomWebcastUrl(eventDate)`:
   - GET `https://investors.broadcom.com/events-and-presentations`
   - Find anchor tags with href containing "webcast", "listen", or "live" near text matching the event date
   - Return the first matching URL, or `null`

2. `fetchWebcastCaptions(webcastUrl)`:
   - GET the webcast page
   - Look for `<track>` elements or JavaScript variables containing `.vtt` or `.srt` URLs
   - Download and parse the caption file → plain text
   - Returns text, or `null` if no caption track found

**Exported function:**
```typescript
export async function fetchVideoTranscript(eventDate: Date, targetQuarter: string): Promise<LiveContentResult | null>
```
Tries Strategy 1 then Strategy 2. Returns `{ content: string; source: 'YouTube' | 'IR Webcast' }` or `null`.

### Integration: `src/liveTranscriptFetcher.ts`

`fetchLivePartialContent()` gains `tryVideoTranscript()` as a third source, tried after Motley Fool and Seeking Alpha.

### System Dependency

`yt-dlp` must be installed:
```bash
pip install yt-dlp
# or
apt install yt-dlp
```

`prepare-format-reference.mjs` setup section prints the install command if `yt-dlp` is not found.

---

## File Changes Summary

| File | Change |
|------|--------|
| `scripts/prepare-format-reference.mjs` | NEW — one-time prep script |
| `scripts/format-reference.json` | NEW — generated output (gitignored) |
| `src/claudeParser.ts` | MODIFIED — inject format reference into prompt |
| `src/videoTranscriptFetcher.ts` | NEW — yt-dlp + IR webcast strategies |
| `src/liveTranscriptFetcher.ts` | MODIFIED — add `tryVideoTranscript()` source |
| `.gitignore` | MODIFIED — add `scripts/format-reference.json` |

---

## Run Order Before 6/4

```bash
pip install yt-dlp                             # ensure system dependency
cd broadcom-earnings-agent
npm run build                                   # compile TypeScript
node scripts/prepare-format-reference.mjs       # one-time prep
# verify: cat scripts/format-reference.json
# restart agent to pick up new build
```
