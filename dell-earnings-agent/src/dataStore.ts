import * as fs from 'fs';
import { AgentState, DataStore, EarningsApiResponse, JobRecord } from './types';

export function createDataStore(
  initialState: AgentState,
  stateFilePath: string = 'state.json',
): DataStore {
  let state: AgentState = { ...initialState };
  const initial: AgentState = { ...initialState };

  function persist(): void {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2), 'utf8');
  }

  return {
    getState(): AgentState {
      return state;
    },

    getPublicState(): EarningsApiResponse {
      const {
        _lastMetricsSnapshot,
        _lastSnapshotIsSuccess,
        _transcriptAttempts,
        _summaryAttempts,
        _nextJobId,
        eventDate,
        ...rest
      } = state;
      return { ...rest, eventDate: eventDate! };
    },

    setState(patch: Partial<AgentState>): void {
      state = { ...state, ...patch, lastUpdated: new Date().toISOString() };
      persist();
    },

    appendJobRecord(record: Omit<JobRecord, 'jobId'>): void {
      const jobId = `job-${state._nextJobId}`;
      const entry: JobRecord = { ...record, jobId };
      state = {
        ...state,
        jobHistory: [...state.jobHistory, entry],
        _nextJobId: state._nextJobId + 1,
        lastUpdated: new Date().toISOString(),
      };
      persist();
    },

    reset(): void {
      state = { ...initial };
      persist();
    },
  };
}
