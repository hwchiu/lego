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
 *   content/market-indices.md    — market indices with sparklines
 *   content/sp500-quotes.md      — price quotes for all S&P 500 companies
 *   content/watchlist-data.md    — updated Entity Data section with real prices
 *   content/market-news.md       — 3 latest Google News items (semiconductor/tech)
 *   content/press-releases.md    — prepended with 3 new press releases from Yahoo Finance
 *   content/corp-events.md       — Projected Earnings Release section updated with upcoming earnings
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

// ── News / PR / Events crawl config ─────────────────────────────────────────

/** Companies tracked for press-release search and calendar events */
const TRACKED_COMPANIES = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation',             relationship: 'customer', industry: 'Semiconductors' },
  { symbol: 'AAPL', name: 'Apple Inc.',                     relationship: 'customer', industry: 'Consumer Electronics' },
  { symbol: 'AMD',  name: 'Advanced Micro Devices, Inc.',   relationship: 'customer', industry: 'Semiconductors' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.',                  relationship: 'customer', industry: 'Semiconductors' },
  { symbol: 'AVGO', name: 'Broadcom Inc.',                  relationship: 'customer', industry: 'Semiconductors' },
  { symbol: 'ASML', name: 'ASML Holding N.V.',              relationship: 'supplier', industry: 'Semiconductor Equipment' },
  { symbol: 'AMAT', name: 'Applied Materials, Inc.',        relationship: 'supplier', industry: 'Semiconductor Equipment' },
  { symbol: 'LRCX', name: 'Lam Research Corporation',       relationship: 'supplier', industry: 'Semiconductor Equipment' },
  { symbol: 'MSFT', name: 'Microsoft Corporation',          relationship: 'customer', industry: 'Technology' },
  { symbol: 'INTC', name: 'Intel Corporation',              relationship: 'customer', industry: 'Semiconductors' },
  { symbol: 'MU',   name: 'Micron Technology, Inc.',        relationship: 'supplier', industry: 'Memory Semiconductors' },
  { symbol: 'TSLA', name: 'Tesla, Inc.',                    relationship: 'customer', industry: 'Electric Vehicles' },
  { symbol: 'GOOGL',name: 'Alphabet Inc.',                  relationship: 'customer', industry: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.',               relationship: 'customer', industry: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms, Inc.',           relationship: 'customer', industry: 'Technology' },
  { symbol: 'TXN',  name: 'Texas Instruments Incorporated', relationship: 'supplier', industry: 'Semiconductors' },
  { symbol: 'KLAC', name: 'KLA Corporation',                relationship: 'supplier', industry: 'Semiconductor Equipment' },
];

/** PR distribution publishers — news with these sources are treated as press releases */
const PR_PUBLISHERS = [
  'PR Newswire', 'PRNewswire', 'Business Wire', 'Businesswire',
  'Globe Newswire', 'GlobeNewswire', 'Accesswire', 'EIN Presswire',
];

/** Number of items to fetch per category per daily run */
const DAILY_NEWS_COUNT = 3;
const DAILY_PR_COUNT = 3;
const DAILY_EVENT_COUNT = 3;

/** Google News RSS search query for semiconductor/tech industry */
const GOOGLE_NEWS_QUERY = 'TSMC semiconductor chip AI supply chain NVIDIA Apple';

/** News category keyword classifier */
const CATEGORY_KEYWORDS = {
  semiconductor: ['semiconductor', 'chip', 'wafer', 'foundry', 'TSMC', 'ASML', 'EUV', 'process node', 'fab', 'lithography'],
  ai:            ['AI', 'artificial intelligence', 'machine learning', 'LLM', 'GPU', 'deep learning', 'neural', 'generative'],
  earnings:      ['earnings', 'revenue', 'quarterly', 'EPS', 'guidance', 'profit', 'results', 'financial'],
  supplyChain:   ['supply chain', 'inventory', 'supplier', 'manufacturing', 'production', 'capacity', 'allocation'],
  investment:    ['investment', 'acquisition', 'deal', 'funding', 'IPO', 'buyback', 'dividend', 'capital'],
  policy:        ['regulation', 'policy', 'antitrust', 'export', 'ban', 'tariff', 'government', 'sanction', 'DOJ', 'FTC'],
  tech:          ['launch', 'product', 'software', 'platform', 'cloud', 'device', 'feature', 'update'],
};

// ── Read S&P 500 symbol list from content/company_master.md ─────────────────

function readSP500Symbols() {
  const src = readFileSync(resolve(CONTENT_DIR, 'company_master.md'), 'utf-8');
  const match = src.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return [];
  const companies = JSON.parse(match[1]);
  return companies.map((c) => c.CO_CD);
}

// ── Read portfolio config from watchlist-data.md (single source of truth) ─────
// To add/remove stocks, edit the "## Portfolio Config" section in the MD file.

function readWatchlistPortfolio() {
  try {
    const md = readFileSync(resolve(CONTENT_DIR, 'watchlist-data.md'), 'utf-8');
    const match = md.match(/## Portfolio Config[\s\S]*?```json\s*([\s\S]*?)\s*```/);
    if (match) {
      return JSON.parse(match[1]);
    }
  } catch { /* file doesn't exist yet */ }

  console.warn('⚠️  No Portfolio Config found in watchlist-data.md. No holdings to fetch.');
  return {};
}

// ── Read existing watchlist-data.md header sections ──────────────────────────

function readWatchlistHeader() {
  try {
    const md = readFileSync(resolve(CONTENT_DIR, 'watchlist-data.md'), 'utf-8');
    const idx = md.indexOf('## Entity Data');
    if (idx !== -1) return md.slice(0, idx);
  } catch { /* file doesn't exist yet */ }
  // Minimal bootstrap — user should populate Portfolio Config in the MD
  return `# Watchlist Persistent Data

## Watchlist Names

\`\`\`json
{
  "627836": "Watchlist1",
  "738291": "Watchlist-TC",
  "394827": "Watchlist2"
}
\`\`\`

## Symbol Orders

\`\`\`json
{
  "627836": [],
  "738291": [],
  "394827": []
}
\`\`\`

> **Note:** This file records the default state. Actual user modifications are persisted in \`localStorage\` under the key \`wl-names\` (for names) and \`wl-orders\` (for symbol orders), keyed by watchlist ID.

## Portfolio Config

> Edit this section to add/remove tracked stocks. The \`shares\` and \`cost\` fields are your portfolio positions.

\`\`\`json
{}
\`\`\`

`;
}

// ── Read historical snapshot sections that follow the live Entity Data block ──
// These sections (e.g. "## Entity Data Q4 2025") are hand-authored historical
// snapshots and must be preserved verbatim across every script re-run.

function readWatchlistHistoricalSections() {
  try {
    const md = readFileSync(resolve(CONTENT_DIR, 'watchlist-data.md'), 'utf-8');
    // Find the first historical-snapshot heading that comes after ## Entity Data
    const entityDataIdx = md.indexOf('## Entity Data');
    if (entityDataIdx === -1) return '';
    // Look for the next ## heading that is NOT "## Entity Data" itself
    const afterEntityData = md.slice(entityDataIdx + '## Entity Data'.length);
    const nextSectionMatch = afterEntityData.match(/\n## /);
    if (!nextSectionMatch) return '';
    // +1 to skip the newline character so the returned string starts with ##
    const historicalStart = entityDataIdx + '## Entity Data'.length + nextSectionMatch.index + 1;
    return md.slice(historicalStart);
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn('⚠️  Could not read historical sections:', err.message);
  }
  return '';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n, currency) {
  if (n == null || isNaN(n)) return 'N/A';
  const sym = currency === 'JPY' ? '¥' : currency === 'TWD' ? 'NT$' : currency === 'EUR' ? '€' : '$';
  if (Math.abs(n) >= 1e9) return `${sym}${(n / 1e9).toFixed(2)}`;
  if (Math.abs(n) >= 1e6) return `${sym}${(n / 1e6).toFixed(2)}`;
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

// ── News category classifier ──────────────────────────────────────────────────

function classifyCategory(text) {
  const lower = text.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) return cat;
  }
  return 'tech';
}

// ── Google News RSS parser (no extra dependencies) ────────────────────────────

function extractXmlText(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const m = re.exec(xml);
  if (!m) return '';
  return (m[1] ?? m[2] ?? '').trim();
}

function parseRssItems(xml) {
  const items = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    // Strip trailing " - Source Name" suffix only when it's a short recognisable source label
    const rawTitle = extractXmlText(block, 'title');
    const titleSuffixRe = /\s+-\s+[^-]{2,40}$/;  // " - Short Source Name" at end
    const title = rawTitle.replace(titleSuffixRe, '').trim() || rawTitle.trim();
    // Prefer the <link> text content; Google News RSS 2.0 puts the URL there directly
    const link = extractXmlText(block, 'link');
    const pubDate = extractXmlText(block, 'pubDate');
    const source  = extractXmlText(block, 'source');
    // Fallback: grab the first https URL from the raw block (handles <link/> atom-style feeds)
    const rawLink = link || (block.match(/https?:\/\/[^\s<"']{10,}/)?.[0] ?? '');
    if (title) items.push({ title, link: rawLink, pubDate, source });
  }
  return items;
}

// ── Fetch Google News ─────────────────────────────────────────────────────────

async function fetchGoogleNews(count = DAILY_NEWS_COUNT) {
  console.log('\n📰 Fetching Google News RSS...');
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(GOOGLE_NEWS_QUERY)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const xml = await res.text();
    const parsed = parseRssItems(xml);
    const items = parsed.slice(0, count);
    const now = new Date().toISOString();

    const newsItems = items.map((item) => {
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : now;
      const category = classifyCategory(item.title);
      // Try to match a known company ticker from the title/link
      const titleLower = item.title.toLowerCase();
      const matched = TRACKED_COMPANIES.find((c) =>
        titleLower.includes(c.symbol.toLowerCase()) ||
        titleLower.includes(c.name.split(' ')[0].toLowerCase()),
      );
      return {
        news_date: pubDate,
        co_cd: matched?.symbol || 'SEMI',
        news_source: item.source || 'Google News',
        comp_tag_short_name: matched?.name.split(' ')[0] || 'Semiconductor',
        news_catg: category,
        news_content: item.title,
        news_url: item.link,
        news_title: item.title,
        update_date: now,
        tag_change: 0,
      };
    });

    console.log(`  ✅ Fetched ${newsItems.length} Google News items`);
    return newsItems;
  } catch (err) {
    console.error(`  ❌ Google News fetch failed: ${err.message}`);
    return [];
  }
}

// ── Fetch Press Releases via Yahoo Finance search ─────────────────────────────

async function fetchYahooPressReleases(count = DAILY_PR_COUNT) {
  console.log('\n📋 Fetching press releases via Yahoo Finance search...');
  const results = [];
  const now = new Date();
  let idCounter = 0;

  const TOPICS_MAP = {
    semiconductor: 'Semiconductors',
    ai:            'AI & Computing',
    earnings:      'Financial Results',
    supplyChain:   'Supply Chain',
    investment:    'Investment',
    policy:        'Policy & Regulation',
    tech:          'Technology',
  };

  function buildPRItem(item, company) {
    const pubDate = item.providerPublishTime
      ? new Date(item.providerPublishTime * 1000).toISOString().slice(0, 10)
      : now.toISOString().slice(0, 10);
    const category = classifyCategory(item.title);
    const industryTopic = TOPICS_MAP[category] || 'Technology';
    idCounter += 1;
    return {
      id: `pr-crawled-${idCounter}`,
      title: item.title,
      company: company.name,
      ticker: company.symbol,
      relationship: company.relationship,
      industry: company.industry,
      topics: [industryTopic],
      trendingTopics: [`#${company.symbol}`],
      publishedAt: pubDate,
      summary: item.title,
      viewCount: 0,
      url: item.link,
    };
  }

  for (const company of TRACKED_COMPANIES) {
    if (results.length >= count) break;
    try {
      const searchResult = await yahooFinance.search(company.symbol, { newsCount: 10 });
      const newsArray = searchResult?.news || [];
      for (const item of newsArray) {
        if (results.length >= count) break;
        if (!item.title || !item.link) continue;
        const isPR = PR_PUBLISHERS.some((pub) =>
          (item.publisher || '').toLowerCase().includes(pub.toLowerCase()),
        );
        if (!isPR) continue;
        results.push(buildPRItem(item, company));
        console.log(`  ✅ PR: [${company.symbol}] ${item.title.slice(0, 70)}...`);
      }
    } catch (err) {
      console.error(`  ❌ PR search for ${company.symbol}: ${err.message}`);
    }
  }

  // Fallback: if no strict PR matches, take any top news from Yahoo Finance search
  if (results.length < count) {
    for (const company of TRACKED_COMPANIES) {
      if (results.length >= count) break;
      try {
        const searchResult = await yahooFinance.search(company.symbol, { newsCount: 5 });
        const newsArray = searchResult?.news || [];
        for (const item of newsArray) {
          if (results.length >= count) break;
          if (!item.title || !item.link) continue;
          // Skip if already added
          if (results.some((r) => r.title === item.title)) continue;
          results.push(buildPRItem(item, company));
          console.log(`  ✅ PR (fallback): [${company.symbol}] ${item.title.slice(0, 70)}...`);
        }
      } catch (err) {
        console.error(`  ❌ PR fallback search for ${company.symbol}: ${err.message}`);
      }
    }
  }

  console.log(`  ✅ Collected ${results.length} press release items`);
  return results.slice(0, count);
}

// ── Fetch upcoming corporate events via Yahoo Finance calendarEvents ───────────

/**
 * Formats a JavaScript Date as "Mon DD, YYYY" (e.g., "May 12, 2026")
 * matching the date-key format used in corp-events.md.
 */
function fmtEventDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Returns "Mon DD" key used as the JSON property key in corp-events sections */
function fmtDateKey(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Builds the description string for a projected earnings calendar event */
function buildProjectedEarningsDesc(companyName) {
  return `${companyName} projected earnings release. Analyst estimates and guidance details will be available closer to the date. Key metrics to watch: revenue growth, margin trends, and forward guidance.`;
}

async function fetchCorpEarningsEvents(count = DAILY_EVENT_COUNT) {
  console.log('\n📅 Fetching upcoming earnings events via Yahoo Finance...');
  const events = []; // { dateKey, company, symbol, earningsDate }
  const today = new Date();

  for (const company of TRACKED_COMPANIES) {
    if (events.length >= count) break;
    try {
      const summary = await yahooFinance.quoteSummary(company.symbol, {
        modules: ['calendarEvents'],
      });
      const earningsDates = summary?.calendarEvents?.earnings?.earningsDate || [];
      for (const d of earningsDates) {
        const date = new Date(d);
        if (date > today) {
          events.push({ date, company });
          console.log(`  ✅ ${company.symbol} earnings: ${fmtEventDate(date)}`);
          break; // take only the next upcoming date per company
        }
      }
    } catch (err) {
      console.error(`  ❌ Calendar events for ${company.symbol}: ${err.message}`);
    }
  }

  // Sort by date ascending and take the first `count`
  events.sort((a, b) => a.date - b.date);
  const selected = events.slice(0, count);

  // Convert to CorpEvent objects grouped by date key
  const grouped = {};
  for (const { date, company } of selected) {
    const key = fmtDateKey(date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({
      cellLabel: company.symbol,
      company: company.name,
      description: buildProjectedEarningsDesc(company.name),
      eventDate: fmtEventDate(date),
      eventType: 'Projected Earnings Release',
      webcastLink: `https://finance.yahoo.com/quote/${company.symbol}`,
      irLink: `https://finance.yahoo.com/quote/${company.symbol}`,
    });
  }

  console.log(`  ✅ Collected events for ${selected.length} companies`);
  return grouped;
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

// ── Write Market News Markdown ────────────────────────────────────────────────

function writeMarketNewsMd(newsItems) {
  const md = `# Market News — Daily Crawl

> Auto-generated by \`scripts/fetch-stock-data.mjs\` — do not edit manually.
> Last updated: ${new Date().toISOString()}

\`\`\`json
${JSON.stringify(newsItems, null, 2)}
\`\`\`
`;
  const path = resolve(CONTENT_DIR, 'market-news.md');
  writeFileSync(path, md, 'utf-8');
  console.log(`\n📁 Wrote ${path} (${newsItems.length} news items)`);
}

// ── Prepend Press Releases to existing press-releases.md ─────────────────────

function readPressReleasesMd() {
  try {
    const md = readFileSync(resolve(CONTENT_DIR, 'press-releases.md'), 'utf-8');
    const match = md.match(/```json\s*([\s\S]*?)\s*```/);
    if (match) return JSON.parse(match[1]);
  } catch { /* file doesn't exist */ }
  return [];
}

function writePressReleasesMd(items) {
  const md = `# Press Releases — TSMC Key Suppliers & Customers

> Auto-updated by \`scripts/fetch-stock-data.mjs\`.
> Last updated: ${new Date().toISOString()}

Data sourced from public press releases of TSMC's key ecosystem partners.

\`\`\`json
${JSON.stringify(items, null, 2)}
\`\`\`
`;
  const path = resolve(CONTENT_DIR, 'press-releases.md');
  writeFileSync(path, md, 'utf-8');
  console.log(`📁 Wrote ${path} (${items.length} total press release items)`);
}

function prependPressReleasesMd(newItems) {
  if (!newItems.length) {
    console.log('  ⚠️  No new press release items to prepend');
    return;
  }
  const existing = readPressReleasesMd();
  // De-duplicate by title + URL
  const existingKeys = new Set(existing.map((r) => `${r.title}|${r.url}`));
  const dedupedNew = newItems.filter((r) => !existingKeys.has(`${r.title}|${r.url}`));
  writePressReleasesMd([...dedupedNew, ...existing]);
  console.log(`  ✅ Prepended ${dedupedNew.length} new press release(s) (${newItems.length - dedupedNew.length} duplicate(s) skipped)`);
}

// ── Update Projected Earnings Release section in corp-events.md ──────────────

function updateCorpEventsMd(newEventGroups) {
  if (!Object.keys(newEventGroups).length) {
    console.log('  ⚠️  No new corp event items to add');
    return;
  }
  try {
    const mdPath = resolve(CONTENT_DIR, 'corp-events.md');
    const md = readFileSync(mdPath, 'utf-8');

    // Find the "Projected Earnings Release" section and its JSON block
    const sectionRe = /(## Projected Earnings Release\s*\n```json\s*)([\s\S]*?)(\s*```)/;
    const m = sectionRe.exec(md);
    if (!m) {
      console.warn('  ⚠️  Projected Earnings Release section not found in corp-events.md');
      return;
    }

    const existing = JSON.parse(m[2]);
    // Merge new events: add new date keys, or append to existing date keys
    for (const [dateKey, entries] of Object.entries(newEventGroups)) {
      if (!existing[dateKey]) {
        existing[dateKey] = entries;
      } else {
        // Append only if not already present (same cellLabel + eventDate)
        for (const entry of entries) {
          const isDuplicate = existing[dateKey].some(
            (e) => e.cellLabel === entry.cellLabel && e.eventDate === entry.eventDate,
          );
          if (!isDuplicate) existing[dateKey].push(entry);
        }
      }
    }

    const updatedMd = md.replace(sectionRe, `$1${JSON.stringify(existing, null, 2)}$3`);
    writeFileSync(mdPath, updatedMd, 'utf-8');
    const count = Object.values(newEventGroups).reduce((s, arr) => s + arr.length, 0);
    console.log(`📁 Updated corp-events.md: added ${count} projected earnings event(s)`);
  } catch (err) {
    console.error(`  ❌ Failed to update corp-events.md: ${err.message}`);
  }
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
  const historicalSections = readWatchlistHistoricalSections();
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
${historicalSections ? `\n${historicalSections}` : ''}`;
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

  // ── Daily crawl: news, press releases, corporate events ──────────────────
  const [googleNews, pressReleases, corpEventGroups] = await Promise.all([
    fetchGoogleNews(DAILY_NEWS_COUNT),
    fetchYahooPressReleases(DAILY_PR_COUNT),
    fetchCorpEarningsEvents(DAILY_EVENT_COUNT),
  ]);

  writeMarketNewsMd(googleNews);
  prependPressReleasesMd(pressReleases);
  updateCorpEventsMd(corpEventGroups);

  console.log('\n✅ Done! Content Markdown files updated.');
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
