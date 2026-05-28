// dell-earnings-agent/__tests__/transcriptFetcher.test.ts
import { getTranscriptYearTokens, matchesTranscript } from '../src/transcriptFetcher';

describe('getTranscriptYearTokens', () => {
  it('includes fiscal-year tokens, plain FY label year, and event calendar year', () => {
    const tokens = getTranscriptYearTokens('Q1 FY2027', new Date('2026-05-29T00:00:00Z'));
    expect(tokens).toContain('fy2027');
    expect(tokens).toContain('fiscal 2027');
    expect(tokens).toContain('fiscal year 2027');
    expect(tokens).toContain('2027');   // plain FY label year
    expect(tokens).toContain('2026');   // event calendar year
  });

  it('does not duplicate the year when FY label year equals event calendar year', () => {
    const tokens = getTranscriptYearTokens('Q1 FY2026', new Date('2026-05-29T00:00:00Z'));
    const count2026 = tokens.filter(t => t === '2026').length;
    expect(count2026).toBe(1);
  });
});

describe('matchesTranscript', () => {
  const eventDate = new Date('2026-05-29T00:00:00Z');
  const q = 'Q1 FY2027';

  it('matches Seeking Alpha plain-year style title', () => {
    expect(matchesTranscript(
      'Dell Technologies Q1 2027 Earnings Call Transcript', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches event calendar year 2026 in title', () => {
    expect(matchesTranscript(
      'DELL Q1 2026 Earnings Call Transcript', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('matches FY2027 in title', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('rejects wrong quarter', () => {
    expect(matchesTranscript(
      'Dell Q2 FY2027 Earnings Call', '2026-05-29', eventDate, q
    )).toBe(false);
  });
  it('rejects page date before eventDate', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-05-28', eventDate, q
    )).toBe(false);
  });
  it('accepts page date exactly on eventDate', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-05-29', eventDate, q
    )).toBe(true);
  });
  it('accepts page date after eventDate', () => {
    expect(matchesTranscript(
      'Dell Q1 FY2027 Earnings Call', '2026-06-01', eventDate, q
    )).toBe(true);
  });
  it('rejects title with no year token', () => {
    expect(matchesTranscript(
      'Dell Q1 Earnings Call Transcript', '2026-05-29', eventDate, q
    )).toBe(false);
  });
});

// ---- fetchTranscript integration tests ----

import axios from 'axios';
import { fetchTranscript } from '../src/transcriptFetcher';

jest.mock('axios');
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('fetchTranscript', () => {
  const eventDate2 = new Date('2026-05-29T00:00:00Z');
  const quarter = 'Q1 FY2027';

  afterEach(() => jest.clearAllMocks());

  it('returns not_found_yet when both sources return no match', async () => {
    mockAxios.get.mockResolvedValue({ data: '<html><body>no match here</body></html>' });
    const result = await fetchTranscript(eventDate2, quarter);
    expect(result.kind).toBe('not_found_yet');
  });

  it('returns error when both sources throw', async () => {
    mockAxios.get.mockRejectedValue(new Error('network down'));
    const result = await fetchTranscript(eventDate2, quarter);
    expect(result.kind).toBe('error');
  });

  it('never throws — wraps errors in error result', async () => {
    mockAxios.get.mockRejectedValue(new Error('timeout'));
    await expect(fetchTranscript(eventDate2, quarter)).resolves.toBeDefined();
    const result = await fetchTranscript(eventDate2, quarter);
    expect(['found', 'not_found_yet', 'error']).toContain(result.kind);
  });

  it('prefers not_found_yet over error (first source = not_found_yet, second throws)', async () => {
    mockAxios.get
      .mockResolvedValueOnce({ data: '<html><body>no match</body></html>' })  // DellIR → not_found_yet
      .mockRejectedValueOnce(new Error('SA error'));                           // SeekingAlpha → error
    const result = await fetchTranscript(eventDate2, quarter);
    expect(result.kind).toBe('not_found_yet');
  });
});
