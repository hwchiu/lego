import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scoreResult,
  splitHighlightSegments,
  normalizeResultUrl,
  filterResultsByPeriod,
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
