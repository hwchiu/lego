// dell-earnings-agent/__tests__/dataStore.test.ts
import * as fs from 'fs';
import * as path from 'path';
import { createDataStore } from '../src/dataStore';
import { AgentState } from '../src/types';

const TMP = path.join(__dirname, 'test-state.json');

afterEach(() => { if (fs.existsSync(TMP)) fs.unlinkSync(TMP); });

function makeState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    status: 'WAITING',
    eventDate: null,
    lastUpdated: new Date().toISOString(),
    metrics: null,
    metricsConfidence: null,
    metricsUpdatedAt: null,
    transcriptStatus: 'pending',
    transcript: null,
    transcriptSummary: null,
    transcriptRawFetchedAt: null,
    transcriptSummaryUpdatedAt: null,
    jobHistory: [],
    _lastMetricsSnapshot: null,
    _lastSnapshotIsSuccess: false,
    _transcriptAttempts: 0,
    _summaryAttempts: 0,
    _nextJobId: 1,
    ...overrides,
  };
}

describe('createDataStore', () => {
  it('initialises with the provided state', () => {
    const store = createDataStore(makeState(), TMP);
    expect(store.getState().status).toBe('WAITING');
  });

  it('getPublicState strips all internal fields and narrows eventDate to string', () => {
    const store = createDataStore(makeState({ eventDate: '2026-05-29T20:30:00Z' }), TMP);
    const pub = store.getPublicState();
    expect('_lastMetricsSnapshot' in pub).toBe(false);
    expect('_lastSnapshotIsSuccess' in pub).toBe(false);
    expect('_transcriptAttempts' in pub).toBe(false);
    expect('_summaryAttempts' in pub).toBe(false);
    expect('_nextJobId' in pub).toBe(false);
    expect(pub.eventDate).toBe('2026-05-29T20:30:00Z');
  });

  it('setState patches state and persists to file', () => {
    const store = createDataStore(makeState(), TMP);
    store.setState({ status: 'LIVE' });
    expect(store.getState().status).toBe('LIVE');
    const persisted = JSON.parse(fs.readFileSync(TMP, 'utf8'));
    expect(persisted.status).toBe('LIVE');
  });

  it('setState updates lastUpdated', () => {
    const before = new Date().toISOString();
    const store = createDataStore(makeState(), TMP);
    store.setState({ status: 'LIVE' });
    expect(store.getState().lastUpdated >= before).toBe(true);
  });

  it('appendJobRecord adds record with sequential jobId', () => {
    const store = createDataStore(makeState(), TMP);
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'success',
      metricsConfidence: 85,
      metricsExtracted: true,
      error: null,
      note: null,
    });
    const state = store.getState();
    expect(state.jobHistory).toHaveLength(1);
    expect(state.jobHistory[0].jobId).toBe('job-1');
    expect(state._nextJobId).toBe(2);
  });

  it('appendJobRecord updates lastUpdated', () => {
    const before = new Date().toISOString();
    const store = createDataStore(makeState(), TMP);
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'skipped',
      metricsConfidence: null,
      metricsExtracted: false,
      error: null,
      note: 'Press release not yet available',
    });
    expect(store.getState().lastUpdated >= before).toBe(true);
  });

  it('appendJobRecord persists to file', () => {
    const store = createDataStore(makeState(), TMP);
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'failed',
      metricsConfidence: null,
      metricsExtracted: false,
      error: 'Network error',
      note: null,
    });
    const persisted = JSON.parse(fs.readFileSync(TMP, 'utf8'));
    expect(persisted.jobHistory).toHaveLength(1);
    expect(persisted.jobHistory[0].jobId).toBe('job-1');
  });

  it('reset restores initial state and persists to file', () => {
    const store = createDataStore(makeState(), TMP);
    store.setState({ status: 'LIVE' });
    store.appendJobRecord({
      startTime: '2026-05-29T20:30:00Z',
      endTime:   '2026-05-29T20:30:45Z',
      status: 'success',
      metricsConfidence: 85,
      metricsExtracted: true,
      error: null,
      note: null,
    });
    store.reset();
    expect(store.getState().status).toBe('WAITING');
    expect(store.getState().jobHistory).toHaveLength(0);
    expect(store.getState()._nextJobId).toBe(1);
    const persisted = JSON.parse(fs.readFileSync(TMP, 'utf8'));
    expect(persisted.status).toBe('WAITING');
    expect(persisted.jobHistory).toHaveLength(0);
    expect(persisted._nextJobId).toBe(1);
  });
});
