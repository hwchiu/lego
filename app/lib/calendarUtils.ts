export const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Format a Date as "Mon D" — e.g., "Apr 5" */
export function getDateLabel(date: Date): string {
  return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}`;
}

/** Format a Date as "YYYY-MM-DD" — e.g., "2026-04-05" */
export function getIsoDateLabel(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Return a new Date set to the Sunday of the week containing `date`. */
export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

/** Convert a "YYYY-MM-DD" date string to "Mon D" display format — e.g., "2026-04-05" → "Apr 5" */
export function isoDateToDisplayLabel(isoDate: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const parts = isoDate.split('-');
    return `${MONTH_SHORT[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}`;
  }
  return isoDate;
}

/** Map a 3-letter short month name to its full name (e.g., "Apr" → "April"). */
export function monthShortToFull(short: string): string {
  const idx = MONTH_SHORT.indexOf(short);
  return idx >= 0 ? MONTH_FULL[idx] : short;
}

export function truncateCompanies(companies: string[], maxLen = 20): string {
  const joined = companies.join(', ');
  if (joined.length <= maxLen) return joined;
  return joined.slice(0, maxLen - 3) + '...';
}
