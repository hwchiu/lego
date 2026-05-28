// dell-earnings-agent/__tests__/dellIRFetcher.test.ts
import { normalizeText, matchesPressRelease } from '../src/dellIRFetcher';

describe('normalizeText', () => {
  it('lowercases input', () => {
    expect(normalizeText('Q1 FY2027')).toBe('q1 fy2027');
  });
  it('collapses hyphens to space', () => {
    expect(normalizeText('Q1-FY2027')).toBe('q1 fy2027');
  });
  it('collapses underscores to space', () => {
    expect(normalizeText('first_quarter')).toBe('first quarter');
  });
  it('collapses extra whitespace', () => {
    expect(normalizeText('  Q1   FY 2027  ')).toBe('q1 fy 2027');
  });
});

describe('matchesPressRelease', () => {
  const eventDate = new Date('2026-05-29T00:00:00Z');
  const q = 'Q1 FY2027';

  it('matches standard title within ±3 days', () => {
    expect(matchesPressRelease(
      'Dell Technologies Reports Q1 FY2027 Financial Results', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches "first quarter" + "fiscal 2027"', () => {
    expect(matchesPressRelease(
      'Dell Technologies First Quarter Fiscal 2027 Results', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches "1st quarter" + FY2027', () => {
    expect(matchesPressRelease(
      'Dell 1st Quarter FY2027 Earnings', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('rejects missing quarter token', () => {
    expect(matchesPressRelease(
      'Dell FY2027 Annual Report', '2026-05-29', eventDate, q
    )).toBe(false);
  });
  it('rejects missing fiscal-year token', () => {
    expect(matchesPressRelease(
      'Dell Q1 Financial Results', '2026-05-29', eventDate, q
    )).toBe(false);
  });
  it('rejects date 4 days before eventDate', () => {
    expect(matchesPressRelease(
      'Dell Q1 FY2027 Results', '2026-05-25', eventDate, q
    )).toBe(false);
  });
  it('accepts date exactly 3 days before eventDate', () => {
    expect(matchesPressRelease(
      'Dell Q1 FY2027 Results', '2026-05-26', eventDate, q
    )).toBe(true);
  });
  it('accepts date exactly 3 days after eventDate', () => {
    expect(matchesPressRelease(
      'Dell Q1 FY2027 Results', '2026-06-01', eventDate, q
    )).toBe(true);
  });
  it('matches hyphenated token Q1-FY2027', () => {
    expect(matchesPressRelease(
      'Dell Q1-FY2027 Earnings Release', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches fiscal year 2027 multi-word token', () => {
    expect(matchesPressRelease(
      'Dell Q1 Fiscal Year 2027 Results', '2026-05-29', eventDate, q
    )).toBe(true);
  });
});
