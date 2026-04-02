export const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function truncateCompanies(companies: string[], maxLen = 20): string {
  const joined = companies.join(', ');
  if (joined.length <= maxLen) return joined;
  return joined.slice(0, maxLen - 3) + '...';
}
