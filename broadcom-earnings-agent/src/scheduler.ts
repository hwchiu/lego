import { DataStore } from './types';
import { EarningsMetrics } from './types';
import { fetchPressRelease } from './avgoIRFetcher';
import { parseMetrics } from './claudeParser';
import { fetchTranscript } from './transcriptFetcher';
import { summarizeTranscript } from './claudeTranscriptSummarizer';

const TARGET_QUARTER = 'Q2 FY2026';
const CRON_MS = 600_000;
const HOURS_4_MS = 4 * 60 * 60 * 1_000;

/**
 * Pure function — exported for unit testing.
 * Returns true only when BOTH ticks are success-tier AND all three value fields match.
 * Comparison is pre-update (snapshot reflects the prior tick, not the current one).
 */
export function checkStabilization(
  snapshot: EarningsMetrics | null,
  snapshotIsSuccess: boolean,
  currentMetrics: EarningsMetrics,
  currentIsSuccess: boolean,
): boolean {
  if (!snapshot || !snapshotIsSuccess || !currentIsSuccess) return false;
  if (!snapshot.revenue || !snapshot.grossMargin || !snapshot.doi) return false;
  if (!currentMetrics.revenue || !currentMetrics.grossMargin || !currentMetrics.doi) return false;
  return (
    snapshot.revenue.value     === currentMetrics.revenue.value &&
    snapshot.grossMargin.value === currentMetrics.grossMargin.value &&
    snapshot.doi.value         === currentMetrics.doi.value
  );
}

export function startScheduler(dataStore: DataStore): void {
  const { status } = dataStore.getState();

  if (status === 'WAITING') {
    scheduleWaiting(dataStore);
  } else if (status === 'LIVE') {
    startBothCrons(dataStore);
  } else {
    // DONE — maybe resume transcript cron
    maybeResumeTranscriptCron(dataStore);
  }
}

const MAX_TIMEOUT_MS = 2_147_483_647; // Node's 32-bit signed int limit for setTimeout

function scheduleWaiting(dataStore: DataStore): void {
  const eventDate = new Date(dataStore.getState().eventDate!);
  const msUntil = eventDate.getTime() - Date.now();

  if (msUntil <= 0) {
    dataStore.setState({ status: 'LIVE' });
    startBothCrons(dataStore);
    return;
  }

  // Cap to avoid 32-bit overflow; re-schedule when this fires if still not time
  const delay = Math.min(msUntil, MAX_TIMEOUT_MS);
  const t = setTimeout(() => {
    if (Date.now() < eventDate.getTime()) {
      // Not yet time — re-enter waiting loop
      scheduleWaiting(dataStore);
      return;
    }
    dataStore.setState({ status: 'LIVE' });
    startBothCrons(dataStore);
  }, delay);
  if ((t as unknown as { unref?: () => void }).unref) {
    (t as unknown as { unref: () => void }).unref();
  }
}

function startBothCrons(dataStore: DataStore): void {
  startMetricsCron(dataStore);
  startTranscriptCron(dataStore);
}

function startMetricsCron(dataStore: DataStore): void {
  let lock = false;
  let stopped = false;
  let handle: ReturnType<typeof setInterval> | null = null;

  function stopCron(): void {
    stopped = true;
    // Defer to ensure handle is assigned before clearInterval runs
    Promise.resolve().then(() => {
      if (handle !== null) { clearInterval(handle); handle = null; }
    });
  }

  async function tick(): Promise<void> {
    if (stopped) return;
    if (lock) { console.warn('[metricsCron] lock held — skipping tick'); return; }
    lock = true;
    const startTime = new Date().toISOString();

    try {
      const state = dataStore.getState();
      if (state.status === 'DONE') { stopCron(); return; }

      const eventDate = new Date(state.eventDate!);

      // === 4-hour hard timeout ===
      if (Date.now() >= eventDate.getTime() + HOURS_4_MS) {
        console.log('[metricsCron] 4-hour timeout reached — marking DONE');
        dataStore.appendJobRecord({
          startTime, endTime: new Date().toISOString(),
          status: 'skipped', metricsConfidence: null, metricsExtracted: false,
          error: null, note: '4-hour timeout: monitoring window closed',
        });
        dataStore.setState({ status: 'DONE' });
        stopCron();
        return;
      }

      // === Fetch press release ===
      let pressReleaseText: string | null;
      try {
        pressReleaseText = await fetchPressRelease(eventDate, TARGET_QUARTER);
      } catch (e) {
        dataStore.appendJobRecord({
          startTime, endTime: new Date().toISOString(),
          status: 'failed', metricsConfidence: null, metricsExtracted: false,
          error: String(e), note: null,
        });
        return;
      }

      if (pressReleaseText === null) {
        dataStore.appendJobRecord({
          startTime, endTime: new Date().toISOString(),
          status: 'skipped', metricsConfidence: null, metricsExtracted: false,
          error: null, note: 'Press release not yet available',
        });
        return;
      }

      // === Parse metrics ===
      let parsed: Awaited<ReturnType<typeof parseMetrics>>;
      try {
        parsed = await parseMetrics(pressReleaseText);
      } catch (e) {
        dataStore.appendJobRecord({
          startTime, endTime: new Date().toISOString(),
          status: 'failed', metricsConfidence: null, metricsExtracted: false,
          error: String(e), note: null,
        });
        return;
      }

      const { metrics, overallConfidence } = parsed;
      const allNull = !metrics.revenue && !metrics.grossMargin && !metrics.doi;
      const allNonNull = !!metrics.revenue && !!metrics.grossMargin && !!metrics.doi;
      const isSuccess = allNonNull && overallConfidence >= 50;
      const metricsExtracted = !allNull;

      // Determine job status and note
      const jobStatus: 'success' | 'partial' = isSuccess ? 'success' : 'partial';
      let note: string | null = null;
      if (!isSuccess) {
        if (allNull) {
          note = 'All metrics null';
        } else if (!allNonNull) {
          const missing = (['revenue', 'grossMargin', 'doi'] as const)
            .filter(k => !metrics[k]).join(', ');
          note = `${missing} unavailable`;
        } else {
          note = `Confidence ${overallConfidence}/100`;
        }
      }

      // === Pre-update stabilization check ===
      const current = dataStore.getState();
      const shouldDone = isSuccess && checkStabilization(
        current._lastMetricsSnapshot,
        current._lastSnapshotIsSuccess,
        metrics as EarningsMetrics,
        isSuccess,
      );

      // === Update state ===
      if (metricsExtracted) {
        const currentState = dataStore.getState();
        dataStore.setState({
          metrics: metrics as EarningsMetrics,
          metricsConfidence: overallConfidence,
          metricsCreatedAt: currentState.metricsCreatedAt ?? new Date().toISOString(),
          metricsUpdatedAt: new Date().toISOString(),
          _lastMetricsSnapshot: metrics as EarningsMetrics,
          _lastSnapshotIsSuccess: isSuccess,
        });
      } else {
        dataStore.setState({ _lastMetricsSnapshot: null, _lastSnapshotIsSuccess: false });
      }

      // === Append JobRecord BEFORE setState(DONE) per spec ===
      dataStore.appendJobRecord({
        startTime, endTime: new Date().toISOString(),
        status: jobStatus,
        metricsConfidence: allNull ? null : overallConfidence,
        metricsExtracted,
        error: null,
        note,
      });

      if (shouldDone) {
        dataStore.setState({ status: 'DONE' });
        stopCron();
      }
    } finally {
      lock = false;
    }
  }

  tick().catch(e => console.error('[metricsCron] tick error:', e));
  handle = setInterval(() => {
    tick().catch(e => console.error('[metricsCron] tick error:', e));
  }, CRON_MS);
}

function startTranscriptCron(dataStore: DataStore): void {
  let lock = false;
  let stopped = false;
  let handle: ReturnType<typeof setInterval> | null = null;

  function stopCron(): void {
    stopped = true;
    Promise.resolve().then(() => {
      if (handle !== null) { clearInterval(handle); handle = null; }
    });
  }

  async function attemptSummary(): Promise<void> {
    const state = dataStore.getState();
    if (!state.transcript || state._summaryAttempts >= 3) { stopCron(); return; }
    try {
      const summary = await summarizeTranscript(state.transcript);
      const currentState = dataStore.getState();
      dataStore.setState({
        transcriptSummary: summary,
        transcriptSummaryCreatedAt: currentState.transcriptSummaryCreatedAt ?? new Date().toISOString(),
        transcriptSummaryUpdatedAt: new Date().toISOString(),
      });
      stopCron();
    } catch (e) {
      console.error('[transcriptCron] summary attempt failed:', e);
      const newAttempts = state._summaryAttempts + 1;
      dataStore.setState({ _summaryAttempts: newAttempts });
      if (newAttempts >= 3) stopCron();
    }
  }

  async function tick(): Promise<void> {
    if (stopped) return;
    if (lock) { console.warn('[transcriptCron] lock held — skipping tick'); return; }

    const state = dataStore.getState();

    // Terminal: transcript unavailable
    if (state.transcriptStatus === 'unavailable') { stopCron(); return; }
    // Terminal: summary done
    if (state.transcriptStatus === 'available' && state.transcriptSummary !== null) { stopCron(); return; }
    // Guard: summary attempts exhausted (cron should already be stopped)
    if (state.transcriptStatus === 'available' && state._summaryAttempts >= 3) { stopCron(); return; }

    lock = true;
    try {
      const current = dataStore.getState();
      const eventDate = new Date(current.eventDate!);

      // === 4-hour hard timeout ===
      if (Date.now() >= eventDate.getTime() + HOURS_4_MS) {
        console.log('[transcriptCron] 4-hour timeout reached — stopping');
        stopCron();
        return;
      }

      if (current.transcriptStatus === 'pending') {
        if (current._transcriptAttempts >= 12) {
          dataStore.setState({ transcriptStatus: 'unavailable' });
          stopCron();
          return;
        }

        const result = await fetchTranscript(eventDate, TARGET_QUARTER);

        if (result.kind === 'found') {
          dataStore.setState({
            transcriptStatus: 'available',
            transcript: result.transcript,
            transcriptRawFetchedAt: new Date().toISOString(),
            _summaryAttempts: 0,
          });
          // Fall through immediately to summary in same tick
          await attemptSummary();
          return;
        }

        const newAttempts = current._transcriptAttempts + 1;
        dataStore.setState({ _transcriptAttempts: newAttempts });
        if (newAttempts >= 12) {
          dataStore.setState({ transcriptStatus: 'unavailable' });
          stopCron();
        }
        return;
      }

      if (current.transcriptStatus === 'available' && current.transcriptSummary === null) {
        await attemptSummary();
      }
    } finally {
      lock = false;
    }
  }

  tick().catch(e => console.error('[transcriptCron] tick error:', e));
  handle = setInterval(() => {
    tick().catch(e => console.error('[transcriptCron] tick error:', e));
  }, CRON_MS);
}

function maybeResumeTranscriptCron(dataStore: DataStore): void {
  const state = dataStore.getState();
  const canResumeFetch =
    state.transcriptStatus === 'pending' && state._transcriptAttempts < 12;
  const canResumeSummary =
    state.transcriptStatus === 'available' &&
    state.transcriptSummary === null &&
    state._summaryAttempts < 3;

  if (canResumeFetch || canResumeSummary) {
    startTranscriptCron(dataStore);
  }
}
