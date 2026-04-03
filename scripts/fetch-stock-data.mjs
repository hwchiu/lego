#!/usr/bin/env node

/**
 * Fetch real stock market data from Yahoo Finance and write content Markdown files.
 *
 * All data is stored in content/*.md as JSON code blocks, following the existing
 * pattern used by earnings.md and banner.md. TypeScript data files in app/data/
 * import these .md files via extractJson().
 *
 * Usage:  node scripts/fetch-stock-data.mjs
 *
 * Outputs:
 *   content/market-indices.md   — market indices with sparklines
 *   content/sp500-quotes.md     — price quotes for all S&P 500 companies
 *   content/watchlist-data.md   — updated Entity Data section with real prices
 */

import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, '..', 'content');

// ── Configuration ────────────────────────────────────────────────────────────

const INDEX_MAP = [
  { name: 'Dow', symbol: '^DJI' },
  { name: 'S&P 500', symbol: '^GSPC' },
  { name: 'Nasdaq', symbol: '^IXIC' },
  { name: 'Gold', symbol: 'GC=F' },
  { name: 'Russell 2000', symbol: '^RUT' },
];

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 500;

// ── Read S&P 500 symbol list from sp500.ts ───────────────────────────────────

function readSP500Symbols() {
  const src = readFileSync(resolve(__dirname, '..', 'app', 'data', 'sp500.ts'), 'utf-8');
  const symbols = [];
  for (const match of src.matchAll(/symbol:\s*'([^']+)'/g)) {
    symbols.push(match[1]);
  }
  return symbols;
}

// ── Read existing watchlist-data.md to preserve portfolio config ──────────────

function readWatchlistPortfolio() {
  try {
    const md = readFileSync(resolve(CONTENT_DIR, 'watchlist-data.md'), 'utf-8');
    const match = md.match(/## Entity Data[\s\S]*?```json\s*([\s\S]*?)\s*```/);
    if (match) {
      const entities = JSON.parse(match[1]);
      const portfolio = {};
      for (const [sym, data] of Object.entries(entities)) {
        portfolio[sym] = { shares: data.shares || 0, cost: data.cost || 0 };
      }
      return portfolio;
    }
  } catch { /* file doesn't exist yet, use defaults */ }
  return {
    TSM: { shares: 120, cost: 105.3 },
    TSLA: { shares: 50, cost: 196.4 },
    QCOM: { shares: 80, cost: 128.9 },
    GOOGL: { shares: 60, cost: 138.5 },
    SONY: { shares: 200, cost: 18.7 },
    AAPL: { shares: 45, cost: 167.8 },
    NVDA: { shares: 30, cost: 512.6 },
    ASML: { shares: 20, cost: 598.0 },
  };
}

// ── Read existing watchlist-data.md header sections ──────────────────────────

function readWatchlistHeader() {
  try {
    const md = readFileSync(resolve(CONTENT_DIR, 'watchlist-data.md'), 'utf-8');
    const idx = md.indexOf('## Entity Data');
    if (idx !== -1) return md.slice(0, idx);
  } catch { /* file doesn't exist yet */ }
  return `# Watchlist Persistent Data

## Watchlist Names

\`\`\`json
{
  "627836": "Watchlist1",
  "738291": "Watchlist-TSM",
  "394827": "Watchlist2"
}
\`\`\`

## Symbol Orders

\`\`\`json
{
  "627836": ["TSM", "TSLA", "QCOM", "GOOGL", "SONY", "AAPL", "NVDA", "ASML"],
  "738291": ["TSM", "TSLA", "QCOM", "GOOGL", "SONY", "AAPL", "NVDA", "ASML"],
  "394827": ["TSM", "TSLA", "QCOM", "GOOGL", "SONY", "AAPL", "NVDA", "ASML"]
}
\`\`\`

> **Note:** This file records the default state. Actual user modifications are persisted in \`localStorage\` under the key \`wl-names\` (for names) and \`wl-orders\` (for symbol orders), keyed by watchlist ID.

`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n, currency) {
  if (n == null || isNaN(n)) return 'N/A';
  const sym = currency === 'JPY' ? '¥' : currency === 'TWD' ? 'NT$' : currency === 'EUR' ? '€' : '$';
  if (Math.abs(n) >= 1e12) return `${sym}${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}M`;
  return `${sym}${n.toFixed(2)}`;
}

function pctFmt(n) {
  if (n == null || isNaN(n)) return 'N/A';
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`;
}

function round2(n) {
  return n == null ? 0 : Math.round(n * 100) / 100;
}

function normalizeSparkline(prices) {
  if (!prices || prices.length === 0) return [50, 50, 50, 50, 50, 50, 50];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  return prices.map((p) => Math.round(((p - min) / range) * 100));
}

function fmtDate(d) {
  if (!d) return 'N/A';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ── Fetch indices ────────────────────────────────────────────────────────────

async function fetchIndices() {
  console.log('📈 Fetching market indices...');
  const results = [];

  for (const idx of INDEX_MAP) {
    try {
      const quote = await yahooFinance.quote(idx.symbol);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);

      const chart = await yahooFinance.chart(idx.symbol, {
        period1: startDate, period2: endDate, interval: '1d',
      });
      const closePrices = (chart.quotes || []).map((q) => q.close).filter(Boolean).slice(-7);

      results.push({
        name: idx.name,
        value: round2(quote.regularMarketPrice),
        change: round2(quote.regularMarketChange),
        changePct: round2(quote.regularMarketChangePercent),
        trend: normalizeSparkline(closePrices),
      });
      console.log(`  ✅ ${idx.name}: ${quote.regularMarketPrice}`);
    } catch (err) {
      console.error(`  ❌ ${idx.name}: ${err.message}`);
      results.push({ name: idx.name, value: 0, change: 0, changePct: 0, trend: [50, 50, 50, 50, 50, 50, 50] });
    }
  }
  return results;
}

// ── Batch-fetch ALL S&P 500 quotes ───────────────────────────────────────────

async function fetchAllQuotes(symbols) {
  console.log(`\n📊 Fetching quotes for ${symbols.length} S&P 500 symbols (batch size ${BATCH_SIZE})...`);
  const results = {};
  const batches = chunk(symbols, BATCH_SIZE);
  let ok = 0, fail = 0;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    try {
      const quotes = await yahooFinance.quote(batch);
      for (const q of quotes) {
        if (!q || !q.symbol) continue;
        results[q.symbol] = {
          price: round2(q.regularMarketPrice),
          change: round2(q.regularMarketChange),
          changePct: round2(q.regularMarketChangePercent),
        };
        ok++;
      }
    } catch {
      for (const sym of batch) {
        try {
          const q = await yahooFinance.quote(sym);
          results[sym] = { price: round2(q.regularMarketPrice), change: round2(q.regularMarketChange), changePct: round2(q.regularMarketChangePercent) };
          ok++;
        } catch { results[sym] = { price: 0, change: 0, changePct: 0 }; fail++; }
      }
    }
    const progress = Math.min(100, Math.round(((i + 1) / batches.length) * 100));
    process.stdout.write(`\r  📦 Batch ${i + 1}/${batches.length} (${progress}%) — ${ok} ok, ${fail} failed`);
    if (i < batches.length - 1) await sleep(BATCH_DELAY_MS);
  }
  console.log(`\n  ✅ Fetched ${ok} quotes, ${fail} failed`);
  return results;
}

// ── Fetch detailed holdings financials ───────────────────────────────────────

async function fetchHoldingsDetail(holdingSymbols) {
  console.log('\n💼 Fetching detailed financials for watchlist holdings...');
  const results = {};

  for (const symbol of holdingSymbols) {
    try {
      const summary = await yahooFinance.quoteSummary(symbol, {
        modules: ['financialData', 'calendarEvents', 'defaultKeyStatistics'],
      });
      const fd = summary?.financialData || {};
      const ce = summary?.calendarEvents || {};
      const currency = fd.financialCurrency || 'USD';
      const earningsDates = ce.earnings?.earningsDate || [];

      results[symbol] = {
        revenue: fmt(fd.totalRevenue, currency),
        revenueQoQ: 'N/A',
        revenueYoY: fd.revenueGrowth != null ? pctFmt(fd.revenueGrowth) : 'N/A',
        grossMargin: fd.grossMargins != null ? `${(fd.grossMargins * 100).toFixed(1)}%` : 'N/A',
        doi: 'N/A',
        nextEarning: earningsDates.length > 0 ? fmtDate(earningsDates[0]) : 'N/A',
        lastQtrRevenue: 'N/A',
        lastQtrGrossMargin: 'N/A',
        lastQtrDOI: 'N/A',
      };
      console.log(`  ✅ ${symbol}: revenue ${results[symbol].revenue}, margin ${results[symbol].grossMargin}`);
    } catch (err) {
      console.error(`  ❌ ${symbol}: ${err.message}`);
      results[symbol] = {
        revenue: 'N/A', revenueQoQ: 'N/A', revenueYoY: 'N/A',
        grossMargin: 'N/A', doi: 'N/A', nextEarning: 'N/A',
        lastQtrRevenue: 'N/A', lastQtrGrossMargin: 'N/A', lastQtrDOI: 'N/A',
      };
    }
  }
  return results;
}

// ── Write Markdown files ─────────────────────────────────────────────────────

function writeMarketIndicesMd(indices) {
  const md = `# Market Indices

> Auto-generated by \`scripts/fetch-stock-data.mjs\` — do not edit manually.
> Last updated: ${new Date().toISOString()}

\`\`\`json
${JSON.stringify(indices, null, 2)}
\`\`\`
`;
  const path = resolve(CONTENT_DIR, 'market-indices.md');
  writeFileSync(path, md, 'utf-8');
  console.log(`\n📁 Wrote ${path}`);
}

function writeSP500QuotesMd(quotes) {
  const md = `# S&P 500 Quotes

> Auto-generated by \`scripts/fetch-stock-data.mjs\` — do not edit manually.
> Last updated: ${new Date().toISOString()}
> Total symbols: ${Object.keys(quotes).length}

\`\`\`json
${JSON.stringify(quotes, null, 2)}
\`\`\`
`;
  const path = resolve(CONTENT_DIR, 'sp500-quotes.md');
  writeFileSync(path, md, 'utf-8');
  console.log(`📁 Wrote ${path} (${Object.keys(quotes).length} symbols)`);
}

function writeWatchlistDataMd(allQuotes, holdingsDetail, portfolio) {
  const header = readWatchlistHeader();
  const holdingSymbols = Object.keys(portfolio);

  const entities = {};
  for (const sym of holdingSymbols) {
    const q = allQuotes[sym] || { price: 0, change: 0, changePct: 0 };
    const d = holdingsDetail[sym] || {
      revenue: 'N/A', revenueQoQ: 'N/A', revenueYoY: 'N/A',
      grossMargin: 'N/A', doi: 'N/A', nextEarning: 'N/A',
      lastQtrRevenue: 'N/A', lastQtrGrossMargin: 'N/A', lastQtrDOI: 'N/A',
    };
    const p = portfolio[sym];
    const todayGain = +(q.change * p.shares).toFixed(2);

    entities[sym] = {
      symbol: sym,
      price: q.price,
      change: q.change,
      changePct: q.changePct,
      shares: p.shares,
      cost: p.cost,
      todayGain,
      todayGainPct: q.changePct,
      ...d,
    };
  }

  const fieldDescriptions = `### Field Descriptions

| Field | Description |
|---|---|
| \`symbol\` | Stock ticker symbol |
| \`price\` | Current share price (USD) |
| \`change\` | Absolute price change today (USD) |
| \`changePct\` | Percentage price change today (%) |
| \`shares\` | Number of shares held |
| \`cost\` | Average cost basis per share (USD) |
| \`todayGain\` | Total dollar gain/loss today across all shares |
| \`todayGainPct\` | Percentage gain/loss today (%) |
| \`revenue\` | Trailing twelve months revenue (formatted, in reporting currency) |
| \`revenueQoQ\` | Revenue change vs. prior quarter |
| \`revenueYoY\` | Revenue change vs. same quarter last year |
| \`grossMargin\` | Gross profit margin (trailing) |
| \`doi\` | Days of Inventory Outstanding |
| \`nextEarning\` | Next scheduled earnings release date |
| \`lastQtrRevenue\` | Previous quarter revenue |
| \`lastQtrGrossMargin\` | Previous quarter gross margin |
| \`lastQtrDOI\` | Previous quarter Days of Inventory Outstanding |`;

  const md = `${header}## Entity Data

> Auto-updated by \`scripts/fetch-stock-data.mjs\`.
> Last updated: ${new Date().toISOString()}

Full holding-table data for every tracked symbol. User-added symbols are persisted in \`localStorage\` under the key \`wl-extra-holdings\`.

> **DOI** = Days of Inventory Outstanding (a supply-chain efficiency metric; lower values indicate faster inventory turnover).

\`\`\`json
${JSON.stringify(entities, null, 2)}
\`\`\`

${fieldDescriptions}
`;
  const path = resolve(CONTENT_DIR, 'watchlist-data.md');
  writeFileSync(path, md, 'utf-8');
  console.log(`📁 Wrote ${path}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Fetching real stock market data...\n');

  const sp500Symbols = readSP500Symbols();
  const portfolio = readWatchlistPortfolio();
  const holdingSymbols = Object.keys(portfolio);
  console.log(`📋 Found ${sp500Symbols.length} S&P 500 symbols, ${holdingSymbols.length} watchlist holdings\n`);

  const [indices, allQuotes] = await Promise.all([
    fetchIndices(),
    fetchAllQuotes(sp500Symbols),
  ]);
  const holdingsDetail = await fetchHoldingsDetail(holdingSymbols);

  writeMarketIndicesMd(indices);
  writeSP500QuotesMd(allQuotes);
  writeWatchlistDataMd(allQuotes, holdingsDetail, portfolio);

  console.log('\n✅ Done! Content Markdown files updated.');
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
