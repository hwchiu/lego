#!/usr/bin/env node

/**
 * Fetch real stock market data from Yahoo Finance and write TypeScript data files.
 *
 * Usage:  node scripts/fetch-stock-data.mjs
 *
 * Outputs:
 *   app/data/generated/indexData.ts      — market indices with sparklines
 *   app/data/generated/holdingsMarketData.ts — per-symbol price + financial data
 */

import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', 'app', 'data', 'generated');

// ── Configuration ────────────────────────────────────────────────────────────

const INDEX_MAP = [
  { name: 'Dow', symbol: '^DJI' },
  { name: 'S&P 500', symbol: '^GSPC' },
  { name: 'Nasdaq', symbol: '^IXIC' },
  { name: 'Gold', symbol: 'GC=F' },
  { name: 'Russell 2000', symbol: '^RUT' },
];

const HOLDING_SYMBOLS = ['TSM', 'TSLA', 'QCOM', 'GOOGL', 'SONY', 'AAPL', 'NVDA', 'ASML'];

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

/** Normalize sparkline points to 0–100 scale */
function normalizeSparkline(prices) {
  if (!prices || prices.length === 0) return [50, 50, 50, 50, 50, 50, 50];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  return prices.map((p) => Math.round(((p - min) / range) * 100));
}

/** Format a date as "Mon DD, YYYY" */
function fmtDate(d) {
  if (!d) return 'N/A';
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Fetch indices ────────────────────────────────────────────────────────────

async function fetchIndices() {
  console.log('📈 Fetching market indices...');
  const results = [];

  for (const idx of INDEX_MAP) {
    try {
      const quote = await yahooFinance.quote(idx.symbol);

      // Fetch 14-day chart for sparkline (get ~7 trading days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);

      const chart = await yahooFinance.chart(idx.symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      });

      const closePrices = (chart.quotes || []).map((q) => q.close).filter(Boolean).slice(-7);

      results.push({
        name: idx.name,
        value: round2(quote.regularMarketPrice),
        change: round2(quote.regularMarketChange),
        changePct: round2(quote.regularMarketChangePercent),
        trend: normalizeSparkline(closePrices),
      });

      console.log(`  ✅ ${idx.name} (${idx.symbol}): ${quote.regularMarketPrice}`);
    } catch (err) {
      console.error(`  ❌ Failed to fetch ${idx.name} (${idx.symbol}):`, err.message);
      results.push({
        name: idx.name,
        value: 0,
        change: 0,
        changePct: 0,
        trend: [50, 50, 50, 50, 50, 50, 50],
      });
    }
  }

  return results;
}

// ── Fetch holdings market data ───────────────────────────────────────────────

async function fetchHoldings() {
  console.log('\n💼 Fetching holdings market data...');
  const results = {};

  for (const symbol of HOLDING_SYMBOLS) {
    try {
      const [quote, summary] = await Promise.all([
        yahooFinance.quote(symbol),
        yahooFinance.quoteSummary(symbol, {
          modules: ['financialData', 'calendarEvents', 'defaultKeyStatistics'],
        }).catch(() => ({})),
      ]);

      const financialData = summary?.financialData || {};
      const calendarEvents = summary?.calendarEvents || {};
      const currency = financialData.financialCurrency || 'USD';

      // Revenue from financialData (TTM, in reporting currency)
      const totalRevenue = financialData.totalRevenue;
      const revenueGrowth = financialData.revenueGrowth;
      const grossMargin = financialData.grossMargins;

      // Next earnings date
      const earningsDates = calendarEvents.earnings?.earningsDate || [];
      const nextEarning = earningsDates.length > 0 ? fmtDate(earningsDates[0]) : 'N/A';

      results[symbol] = {
        price: round2(quote.regularMarketPrice),
        change: round2(quote.regularMarketChange),
        changePct: round2(quote.regularMarketChangePercent),
        revenue: fmt(totalRevenue, currency),
        revenueQoQ: 'N/A',
        revenueYoY: revenueGrowth != null ? pctFmt(revenueGrowth) : 'N/A',
        grossMargin: grossMargin != null ? `${(grossMargin * 100).toFixed(1)}%` : 'N/A',
        doi: 'N/A',
        nextEarning,
        lastQtrRevenue: 'N/A',
        lastQtrGrossMargin: 'N/A',
        lastQtrDOI: 'N/A',
      };

      console.log(`  ✅ ${symbol}: $${quote.regularMarketPrice} (${quote.regularMarketChangePercent > 0 ? '+' : ''}${quote.regularMarketChangePercent?.toFixed(2)}%)`);
    } catch (err) {
      console.error(`  ❌ Failed to fetch ${symbol}:`, err.message);
      results[symbol] = {
        price: 0, change: 0, changePct: 0,
        revenue: 'N/A', revenueQoQ: 'N/A', revenueYoY: 'N/A',
        grossMargin: 'N/A', doi: 'N/A', nextEarning: 'N/A',
        lastQtrRevenue: 'N/A', lastQtrGrossMargin: 'N/A', lastQtrDOI: 'N/A',
      };
    }
  }

  return results;
}

// ── Write output files ───────────────────────────────────────────────────────

function writeIndexData(indices) {
  const ts = `// Auto-generated by scripts/fetch-stock-data.mjs — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface StockIndex {
  name: string;
  value: number;
  change: number;
  changePct: number;
  trend: number[];
}

export const stockIndexes: StockIndex[] = ${JSON.stringify(indices, null, 2)};
`;
  const path = resolve(OUT_DIR, 'indexData.ts');
  writeFileSync(path, ts, 'utf-8');
  console.log(`\n📁 Wrote ${path}`);
}

function writeHoldingsData(holdings) {
  const ts = `// Auto-generated by scripts/fetch-stock-data.mjs — do not edit manually
// Last updated: ${new Date().toISOString()}

export interface HoldingMarketData {
  price: number;
  change: number;
  changePct: number;
  revenue: string;
  revenueQoQ: string;
  revenueYoY: string;
  grossMargin: string;
  doi: string;
  nextEarning: string;
  lastQtrRevenue: string;
  lastQtrGrossMargin: string;
  lastQtrDOI: string;
}

export const holdingsMarketData: Record<string, HoldingMarketData> = ${JSON.stringify(holdings, null, 2)};
`;
  const path = resolve(OUT_DIR, 'holdingsMarketData.ts');
  writeFileSync(path, ts, 'utf-8');
  console.log(`📁 Wrote ${path}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Fetching real stock market data...\n');
  mkdirSync(OUT_DIR, { recursive: true });

  const [indices, holdings] = await Promise.all([
    fetchIndices(),
    fetchHoldings(),
  ]);

  writeIndexData(indices);
  writeHoldingsData(holdings);

  console.log('\n✅ Done! Generated data files are ready.');
}

main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
