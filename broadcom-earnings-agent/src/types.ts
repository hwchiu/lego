// dell-earnings-agent/src/types.ts

export type AgentStatus = 'WAITING' | 'LIVE' | 'DONE';
export type TranscriptStatus = 'pending' | 'available' | 'unavailable';
export type JobStatus = 'success' | 'partial' | 'failed' | 'skipped';

export interface MetricValue {
  value:      number;
  unit:       'B' | '%' | 'days';
  qoq:        number | null;
  yoy:        number | null;
  confidence: number;  // 0–100
}

export interface EarningsMetrics {
  revenue:     MetricValue | null;
  grossMargin: MetricValue | null;
  doi:         MetricValue | null;
}

export interface TranscriptSummary {
  highlights:        string[];
  risks:             string[];
  outlook:           string;
  keyQuotes:         string[];
  summaryConfidence: number;   // 0–100: AI self-rated confidence in summary accuracy
}

export interface PartialTranscriptEntry {
  capturedAt: string;   // ISO UTC — when this snapshot was taken
  source:     string;   // e.g. 'Motley Fool', 'Seeking Alpha'
  wordCount:  number;
  summary:    TranscriptSummary;
}

export interface JobRecord {
  jobId:             string;          // "job-1", "job-2", …
  startTime:         string;          // ISO UTC
  endTime:           string;          // ISO UTC
  status:            JobStatus;
  metricsConfidence: number | null;   // null if not attempted
  metricsExtracted:  boolean;
  error:             string | null;   // non-null only when status='failed'
  note:              string | null;   // non-null when status='partial' or 'skipped'
}

export interface AgentState {
  // Public fields (returned by GET /api/earnings)
  status:                     AgentStatus;
  eventDate:                  string | null;
  lastUpdated:                string;
  metrics:                    EarningsMetrics | null;
  metricsConfidence:          number | null;
  metricsCreatedAt:           string | null;  // set ONCE on first successful extraction
  metricsUpdatedAt:           string | null;
  transcriptStatus:           TranscriptStatus;
  transcript:                 string | null;
  transcriptSummary:          TranscriptSummary | null;
  transcriptRawFetchedAt:     string | null;
  transcriptSummaryCreatedAt: string | null;  // set ONCE on first summary generation
  transcriptSummaryUpdatedAt: string | null;
  livePartialSummaries:       PartialTranscriptEntry[];  // progressive in-call snapshots
  jobHistory:                 JobRecord[];

  // Internal fields (persisted to state.json, NOT exposed by API)
  _lastMetricsSnapshot:    EarningsMetrics | null;
  _lastSnapshotIsSuccess:  boolean;
  _transcriptAttempts:     number;  // 0–12
  _summaryAttempts:        number;  // 0–3
  _nextJobId:              number;
  _lastLiveContentLength:  number;  // tracks content growth for live partial cron
}

export type EarningsApiResponse = Omit<AgentState,
  '_lastMetricsSnapshot' | '_lastSnapshotIsSuccess' |
  '_transcriptAttempts' | '_summaryAttempts' | '_nextJobId' |
  '_lastLiveContentLength' | 'eventDate'>
  & { eventDate: string };

export type TranscriptFetchResult =
  | { kind: 'found'; transcript: string }
  | { kind: 'not_found_yet' }
  | { kind: 'error'; message: string };

/** DataStore interface — shared contract used by scheduler and index. */
export interface DataStore {
  getState(): AgentState;
  getPublicState(): EarningsApiResponse;
  setState(patch: Partial<AgentState>): void;
  appendJobRecord(record: Omit<JobRecord, 'jobId'>): void;
  reset(): void;
}
