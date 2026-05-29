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
