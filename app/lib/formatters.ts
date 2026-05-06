/**
 * formatters.ts
 *
 * Common numeric and date formatting utilities for the MIC financial dashboard.
 * All functions are pure (no React dependency) and re-exported from here so
 * individual feature files import from a single location.
 *
 * Sections:
 *   1. Currency / Money
 *   2. Stock Price
 *   3. Signed Numbers (gain / loss)
 *   4. Percentages
 *   5. General Numbers
 *   6. Dates
 *   7. Color Inference (type-based, no column-name hard-coding)
 */

import { monthShortToFull } from '@/app/lib/calendarUtils';

// ── 1. Currency / Money ────────────────────────────────────────────────────────

/**
 * Format a USD value that is expressed in **millions (M)**.
 *
 * Unit suffixes (M / B) are intentionally **omitted** from the output so that
 * callers can render the unit label separately (e.g. in a table column header
 * or adjacent text element), keeping the numeric part clean and consistent.
 *
 * - `valueM >= 1000` (≥ 1 billion)  → `"$2.5"` (uses `decimals` for B-tier, default 1)
 * - `1 <= valueM < 1000`             → `"$450.00"` (2 decimal places + thousands separator)
 * - `valueM < 1`                     → `"$0.50"` (2 decimal places)
 *
 * @param valueM   Numeric value in millions USD
 * @param decimals Decimal places for the B-tier output (default: 1)
 * @returns Formatted string without unit suffix, e.g. "$2.5", "$450.00", "$0.50"
 *
 * @example
 * formatUsdM(2500)       // "$2.5"
 * formatUsdM(2500, 2)    // "$2.50"
 * formatUsdM(450)        // "$450.00"
 * formatUsdM(1234.5)     // "$1,234.50"
 * formatUsdM(0.5)        // "$0.50"
 */
export function formatUsdM(valueM: number, decimals = 1): string {
  if (valueM >= 1000) return `$${(valueM / 1000).toFixed(decimals)}`;
  if (valueM >= 1) return `$${valueM.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${valueM.toFixed(2)}`;
}

/**
 * Format a raw USD value (as returned from the API, no unit) into a millions
 * display string with 2 decimal places and **no "$" prefix**.
 *
 * Divide by 1 000 000, then format with thousands separator and 2 decimals.
 *
 * @param rawUsd  Raw USD amount from API (e.g. `250000000` for $250 M)
 * @returns Formatted millions string without "$" (e.g. `"250.00"`, `"1,500.00"`)
 *
 * @example
 * formatRawUsdToM(250000000)   // "250.00"
 * formatRawUsdToM(1500000000)  // "1,500.00"
 * formatRawUsdToM(250000)      // "0.25"
 */
export function formatRawUsdToM(rawUsd: number): string {
  const millions = rawUsd / 1_000_000;
  return millions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── 2. Stock Price ─────────────────────────────────────────────────────────────

/**
 * Format a stock price to exactly 2 decimal places.
 *
 * @param value  Numeric price
 * @returns `"123.45"`
 *
 * @example
 * formatPrice(123.456) // "123.46"
 * formatPrice(5)       // "5.00"
 */
export function formatPrice(value: number): string {
  return value.toFixed(2);
}

// ── 3. Signed Numbers ─────────────────────────────────────────────────────────

/**
 * Format a signed numeric value (gain / loss).
 * Positive values are prefixed with `"+"`.
 *
 * @param value    Numeric value
 * @param decimals Decimal places (default: 2)
 * @returns `"+1.23"` or `"-0.45"`
 *
 * @example
 * formatSigned(1.234)  // "+1.23"
 * formatSigned(-0.456) // "-0.46"
 */
export function formatSigned(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}`;
}

/**
 * Format a signed percentage value (gain / loss %).
 * Positive values are prefixed with `"+"`.
 *
 * Use {@link inferColorClass} on the numeric value (or the resulting string) to
 * obtain the CSS class (`"pos"` / `"neg"`) for green / red rendering.
 *
 * @param value    Numeric percentage (e.g. 1.23 for 1.23%)
 * @param decimals Decimal places (default: 2)
 * @returns `"+1.23%"` or `"-0.45%"`
 *
 * @example
 * formatSignedPct(1.234)  // "+1.23%"
 * formatSignedPct(-0.456) // "-0.46%"
 */
export function formatSignedPct(value: number, decimals = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// ── 4. Percentages ────────────────────────────────────────────────────────────

/**
 * Format a plain percentage value (no sign prefix).
 *
 * @param value    Numeric percentage (e.g. 45.3 for 45.3%)
 * @param decimals Decimal places (default: 1)
 * @returns `"45.3%"`
 *
 * @example
 * formatPct(45.3)    // "45.3%"
 * formatPct(45.3, 0) // "45%"
 */
export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ── 5. General Numbers ────────────────────────────────────────────────────────

/**
 * Format a large number with thousands separators and fixed decimal places.
 * Uses `en-US` locale for consistent `","` separators.
 *
 * @param value          Numeric value
 * @param fractionDigits Minimum / maximum fraction digits (default: 2)
 * @returns `"1,234,567.00"` or `"1,234.50"` (when fractionDigits = 2)
 *
 * @example
 * formatNumber(1234567)    // "1,234,567.00"
 * formatNumber(1234.5, 2)  // "1,234.50"
 * formatNumber(1234, 0)    // "1,234"
 */
export function formatNumber(value: number, fractionDigits = 2): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

// ── 6. Dates ──────────────────────────────────────────────────────────────────

/**
 * Convert a short date label (`"Apr 5"` produced by `getDateLabel()`) to the
 * long display format `"05 April"`.
 *
 * Returns `"—"` for falsy / undefined input.
 *
 * @param dateLabel  Short label from `calendarUtils.getDateLabel()` — e.g. `"Apr 5"`
 * @returns `"05 April"` or `"—"`
 *
 * @example
 * formatDateLabelFull("Apr 5")  // "05 April"
 * formatDateLabelFull("Dec 31") // "31 December"
 * formatDateLabelFull(undefined) // "—"
 */
export function formatDateLabelFull(dateLabel: string | undefined): string {
  if (!dateLabel) return '—';
  const parts = dateLabel.split(' ');
  const day = parts[1]?.padStart(2, '0') ?? '';
  const month = monthShortToFull(parts[0]);
  return `${day} ${month}`;
}

/**
 * Convert a UTC datetime string (from the API) to a local-time display string.
 *
 * Input format:  `"2026-04-07 00:00:00.0"` (UTC)
 * Output format: `"2026-04-07 14:30"` (browser local time)
 *
 * Returns `"—"` for empty input and the original string if parsing fails.
 *
 * @param utcDatetime  UTC timestamp string from the API
 * @returns `"YYYY-MM-DD HH:MM"` in local time, or `"—"` / original on error
 *
 * @example
 * formatEventDatetime("2026-04-07 06:30:00.0") // "2026-04-07 14:30" (UTC+8)
 */
export function formatEventDatetime(utcDatetime: string): string {
  if (!utcDatetime) return '—';
  const utcString = utcDatetime.replace(' ', 'T').replace(/\.0$/, '') + 'Z';
  const date = new Date(utcString);
  if (isNaN(date.getTime())) return utcDatetime;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Extract the `"YYYY-MM-DD"` portion from a datetime string.
 *
 * Returns `"—"` for falsy / undefined input.
 *
 * @param dateStr  Any string beginning with `"YYYY-MM-DD"` (e.g. `"2022-02-16 00:00:00.0"`)
 * @returns `"2022-02-16"` or `"—"`
 *
 * @example
 * formatIsoDate("2022-02-16 00:00:00.0") // "2022-02-16"
 * formatIsoDate("2026-04-07")            // "2026-04-07"
 * formatIsoDate(undefined)               // "—"
 */
export function formatIsoDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  return dateStr.slice(0, 10);
}

// ── 7. Color Inference ────────────────────────────────────────────────────────

/**
 * Infer the CSS color class for a value based on its **content / type** —
 * without hard-coding column names.
 *
 * Rules (applied in order):
 * - `number > 0`          → `""` (neutral)
 * - `number < 0`          → `"neg"` (red)
 * - `number === 0`         → `""` (neutral)
 * - `string` starts `"+"` → `""` (neutral)
 * - `string` starts `"-"` → `"neg"`
 * - everything else        → `""` (neutral)
 *
 * @param value  A numeric or string cell value
 * @returns `"neg"` | `""`
 *
 * @example
 * inferColorClass(1.5)     // ""
 * inferColorClass(-0.3)    // "neg"
 * inferColorClass("+1.2%") // ""
 * inferColorClass("-0.5%") // "neg"
 * inferColorClass("N/A")   // ""
 */
export function inferColorClass(value: string | number): 'pos' | 'neg' | '' {
  if (typeof value === 'number') {
    if (value < 0) return 'neg';
    return '';
  }
  if (value.startsWith('-')) return 'neg';
  return '';
}

/**
 * Infer the Excel ARGB font color for a value based on its **content / type** —
 * without hard-coding column names.
 *
 * - Positive / `"+"` prefix → `"FF16A34A"` (green)
 * - Negative / `"-"` prefix → `"FFDC2626"` (red)
 * - Neutral                  → `null` (use default color)
 *
 * @param value  A numeric or string cell value
 * @returns ARGB color string or `null`
 *
 * @example
 * inferColorArgb("+5.3%")  // "FF16A34A"
 * inferColorArgb(-2.1)     // "FFDC2626"
 * inferColorArgb("N/A")    // null
 */
export function inferColorArgb(value: string | number): string | null {
  const cls = inferColorClass(value);
  if (cls === 'pos') return 'FF16A34A';
  if (cls === 'neg') return 'FFDC2626';
  return null;
}
