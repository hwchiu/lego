import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import cors from 'cors';
import { AgentState } from './types';
import { createDataStore } from './dataStore';
import { resolveEventDate } from './eventDateResolver';
import { startScheduler } from './scheduler';

const STATE_FILE = path.join(__dirname, '..', 'state.json');
const PORT = parseInt(process.env.PORT ?? '3001', 10);

function makeInitialState(): AgentState {
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
  };
}

function loadState(): AgentState | null {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as AgentState;
    if (!['WAITING', 'LIVE', 'DONE'].includes(parsed.status)) return null;
    // Schema defaulting for _lastSnapshotIsSuccess (added in later spec revision)
    if (parsed._lastSnapshotIsSuccess === undefined) {
      parsed._lastSnapshotIsSuccess = false;
    }
    return parsed;
  } catch (e) {
    console.warn('[boot] Failed to load state.json, starting fresh:', e);
    return null;
  }
}

async function main(): Promise<void> {
  // Step 1: Try to load persisted state
  let state = loadState();

  if (state?.eventDate) {
    // Upgrade WAITING→LIVE if already past event time
    if (state.status === 'WAITING' && Date.now() >= new Date(state.eventDate).getTime()) {
      state = { ...state, status: 'LIVE' };
    }
    console.log(`[boot] Loaded persisted state (status=${state.status}, eventDate=${state.eventDate})`);
  } else {
    // Step 2: Resolve event date
    console.log('[boot] Resolving Dell Q1 FY2027 earnings date...');
    let eventDate: string;
    try {
      eventDate = await resolveEventDate();
      console.log('[boot] Resolved event date:', eventDate);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

    // Step 3: Apply initial status
    const fresh = makeInitialState();
    fresh.eventDate = eventDate;
    fresh.status = Date.now() >= new Date(eventDate).getTime() ? 'LIVE' : 'WAITING';
    state = fresh;
  }

  const dataStore = createDataStore(state, STATE_FILE);

  // Step 4: Start HTTP server
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/api/earnings', (_req, res) => {
    res.json(dataStore.getPublicState());
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, status: dataStore.getState().status });
  });

  await new Promise<void>(resolve => app.listen(PORT, resolve));
  console.log(`[boot] Dell Earnings Agent running on port ${PORT}`);

  // Step 5: Start scheduler
  startScheduler(dataStore);
}

main().catch(e => {
  console.error('[boot] Fatal error:', e);
  process.exit(1);
});
