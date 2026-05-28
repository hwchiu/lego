// dell-earnings-agent/__tests__/scheduler.test.ts
import { checkStabilization } from '../src/scheduler';
import { EarningsMetrics } from '../src/types';

function makeMetrics(rev: number): EarningsMetrics {
  return {
    revenue:     { value: rev,  unit: 'B',    qoq: 1,  yoy: 2,  confidence: 90 },
    grossMargin: { value: 22.1, unit: '%',    qoq: 0,  yoy: 1,  confidence: 85 },
    doi:         { value: 34,   unit: 'days', qoq: -1, yoy: -2, confidence: 80 },
  };
}

describe('checkStabilization', () => {
  it('returns false when snapshot is null', () => {
    expect(checkStabilization(null, false, makeMetrics(23.9), true)).toBe(false);
  });

  it('returns false when snapshot is not success-tier', () => {
    expect(checkStabilization(makeMetrics(23.9), false, makeMetrics(23.9), true)).toBe(false);
  });

  it('returns false when current tick is not success', () => {
    expect(checkStabilization(makeMetrics(23.9), true, makeMetrics(23.9), false)).toBe(false);
  });

  it('returns false when revenue values differ', () => {
    expect(checkStabilization(makeMetrics(23.9), true, makeMetrics(24.0), true)).toBe(false);
  });

  it('returns true when both ticks success and all values match', () => {
    expect(checkStabilization(makeMetrics(23.9), true, makeMetrics(23.9), true)).toBe(true);
  });

  it('ignores qoq/yoy/confidence — only compares value fields', () => {
    const snap: EarningsMetrics = {
      revenue:     { value: 23.9, unit: 'B',    qoq: 1,  yoy: 1,  confidence: 80 },
      grossMargin: { value: 22.1, unit: '%',    qoq: 0,  yoy: 0,  confidence: 80 },
      doi:         { value: 34,   unit: 'days', qoq: 0,  yoy: 0,  confidence: 80 },
    };
    const curr: EarningsMetrics = {
      revenue:     { value: 23.9, unit: 'B',    qoq: 99, yoy: 99, confidence: 99 },
      grossMargin: { value: 22.1, unit: '%',    qoq: 99, yoy: 99, confidence: 99 },
      doi:         { value: 34,   unit: 'days', qoq: 99, yoy: 99, confidence: 99 },
    };
    expect(checkStabilization(snap, true, curr, true)).toBe(true);
  });

  it('returns false when any snapshot metric is null', () => {
    const partial: EarningsMetrics = {
      revenue: { value: 23.9, unit: 'B', qoq: null, yoy: null, confidence: 80 },
      grossMargin: null,
      doi: null,
    };
    expect(checkStabilization(partial, true, makeMetrics(23.9), true)).toBe(false);
  });

  it('returns false when any current metric is null', () => {
    const partial: EarningsMetrics = {
      revenue: { value: 23.9, unit: 'B', qoq: null, yoy: null, confidence: 80 },
      grossMargin: null,
      doi: null,
    };
    expect(checkStabilization(makeMetrics(23.9), true, partial, true)).toBe(false);
  });
});
