import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreResult,
  splitHighlightSegments,
  normalizeResultUrl,
  filterResultsByPeriod,
  filterResultsByType,
  paginateResults,
  profileTabResults,
  dataExploreResults,
  type NormalizedSearchResult,
} from '../app/lib/searchRanking.ts';

function makeResult(overrides: Partial<NormalizedSearchResult> = {}): NormalizedSearchResult {
  return {
    id: '1',
    type: 'news',
    title: '',
    description: '',
    url: '',
    tags: [],
    category: '',
    date: '',
    source: '',
    score: 0,
    ...overrides,
  };
}

test('scoreResult ranks exact title match above prefix/contains/tag/category/description matches', () => {
  const exact = scoreResult(makeResult({ title: 'Kubernetes' }), 'kubernetes');
  const prefix = scoreResult(makeResult({ title: 'Kubernetes Networking' }), 'kubernetes');
  const contains = scoreResult(makeResult({ title: 'Intro to Kubernetes' }), 'kubernetes');
  const tag = scoreResult(makeResult({ title: 'Unrelated', tags: ['Kubernetes'] }), 'kubernetes');
  const category = scoreResult(makeResult({ title: 'Unrelated', category: 'Kubernetes' }), 'kubernetes');
  const description = scoreResult(makeResult({ title: 'Unrelated', description: 'about kubernetes basics' }), 'kubernetes');
  const noMatch = scoreResult(makeResult({ title: 'Unrelated' }), 'kubernetes');

  assert.ok(exact > prefix);
  assert.ok(prefix > contains);
  assert.ok(contains > tag);
  assert.ok(tag > category);
  assert.ok(category > description);
  assert.ok(description > noMatch);
});

test('scoreResult returns 0 for an empty query', () => {
  assert.equal(scoreResult(makeResult({ title: 'Anything' }), ''), 0);
});

test('splitHighlightSegments marks case-insensitive matches without altering text', () => {
  const segments = splitHighlightSegments('Understanding Kubernetes networking', 'kubernetes');
  const joined = segments.map((s) => s.text).join('');
  assert.equal(joined, 'Understanding Kubernetes networking');
  assert.ok(segments.some((s) => s.match && s.text === 'Kubernetes'));
});

test('splitHighlightSegments escapes regex special characters in the query', () => {
  assert.doesNotThrow(() => splitHighlightSegments('C++ (2024)', '(2024)'));
  const segments = splitHighlightSegments('C++ (2024)', '(2024)');
  assert.ok(segments.some((s) => s.match && s.text === '(2024)'));
});

test('normalizeResultUrl resolves protocol-less domains and leaves relative paths alone', () => {
  assert.equal(normalizeResultUrl(''), '#');
  assert.equal(normalizeResultUrl('example.com/a'), 'https://example.com/a');
  assert.equal(normalizeResultUrl('//example.com'), 'https://example.com');
  assert.equal(normalizeResultUrl('/company-profile/AAPL/'), '/company-profile/AAPL/');
  assert.equal(normalizeResultUrl('https://example.com'), 'https://example.com');
});

test('filterResultsByPeriod keeps undated results and filters dated results at the selected cutoff', () => {
  const now = Date.parse('2026-09-30T00:00:00Z');
  const results = [
    makeResult({ id: 'recent', date: '2026-09-25T00:00:00Z' }),
    makeResult({ id: 'old', date: '2026-09-22T00:00:00Z' }),
    makeResult({ id: 'company', type: 'company', date: '' }),
  ];

  assert.deepEqual(filterResultsByPeriod(results, 'week', now).map(({ id }) => id), ['recent', 'company']);
  assert.equal(filterResultsByPeriod(results, 'all', now), results);
});

test('filterResultsByType supports the extended search tabs', () => {
  const results = [
    makeResult({ id: 'report', type: 'analyst-report' }),
    makeResult({ id: 'ai-news', type: 'ai-news' }),
    makeResult({ id: 'transcript', type: 'ir-transcript' }),
    makeResult({ id: 'explore', type: 'data-explore' }),
  ];

  assert.deepEqual(filterResultsByType(results, 'analyst-report').map(({ id }) => id), ['report']);
  assert.deepEqual(filterResultsByType(results, 'ai-news').map(({ id }) => id), ['ai-news']);
  assert.deepEqual(filterResultsByType(results, 'ir-transcript').map(({ id }) => id), ['transcript']);
  assert.deepEqual(filterResultsByType(results, 'data-explore').map(({ id }) => id), ['explore']);
  assert.equal(filterResultsByType(results, 'all'), results);
});

test('paginateResults returns only the requested 0-based page', () => {
  const results = Array.from({ length: 25 }, (_, index) => makeResult({ id: String(index) }));

  assert.deepEqual(paginateResults(results, 0, 12).map(({ id }) => id), results.slice(0, 12).map(({ id }) => id));
  assert.deepEqual(paginateResults(results, 2, 12).map(({ id }) => id), ['24']);
});

test('profile tab results match company names and only enabled tabs with deep links', () => {
  const results = profileTabResults([{
    CO_CD: 'AAPL', CO_NAME: 'Apple Inc.', CO_SHORT_NAME: 'Apple',
    IS_FIN_ALIVE: 'Y', IS_IR_ALIVE: 'N', IS_NEWS_ALIVE: 'Y',
    IS_TRANSCRIPT_ALIVE: 'Y', IS_INVEST_ALIVE: 'N', IS_ACQ_ALIVE: 'N',
    IS_FUND_ALIVE: 'N', IS_STOCK_CHART_ALIVE: 'N', IS_AI_TRANSCRIPT_ALIVE: 'N',
    IS_EVENT_ALIVE: 'N', IS_PRE_EARNING_CALL: 'N',
  }], 'apple');
  assert.deepEqual(results.map((r) => r.type), ['fin-summary', 'fin-statement', 'ir-transcript']);
  assert.equal(results[2].url, '/company-profile/AAPL/?tab=IR%20Transcript');
  assert.equal(profileTabResults([], 'apple').length, 0);
});

test('Data Explore search matches real items and only configured categories', () => {
  const categories = [
    { slug: 'news-summary', label: 'News Summary', items: [{ id: 'ns-1', title: 'Apple news', summary: 'Report', tags: ['Apple'], source: 'Wire', date: '2026-01-01' }] },
    { slug: 'capital-markets', label: 'Capital Markets', items: [{ id: 'cap-1', title: 'Market news', summary: 'Apple investment', tags: [], source: 'Wire', date: '2026-01-01' }] },
    { slug: 'government-regulations', label: 'Regulations', items: [{ id: 'gov-1', title: 'Apple policy', summary: '', tags: [], source: 'Wire', date: '' }] },
  ];
  const results = dataExploreResults(categories, ['news-summary', 'capital-markets'], 'apple');
  assert.deepEqual(results.map((r) => r.id), ['news-summary:ns-1', 'capital-markets:cap-1']);
  assert.equal(results[0].url, '/data-explore/news-summary/');
  assert.equal(results[1].category, 'Capital Markets');
  assert.deepEqual(dataExploreResults(categories, ['news-summary'], 'not found'), []);
});
