export interface EvidenceSource {
  id: string;
  title: string;
  url: string;
  extractedText: string;
  locationHint: string;
}

export interface ConfidenceScore {
  score: number;
  level: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface EvidenceMetric {
  label: string;
  value: string;
  confidence: ConfidenceScore;
  evidenceSourceIds: string[];
  calculationTrace?: string;
}

export interface PipelineTask {
  step: string;
  objective: string;
  status: 'Completed' | 'Queued';
}

export interface EarningsEvidenceCase {
  company: string;
  symbol: string;
  targetWindow: string;
  eventTimeEt: string;
  eventTimeTw: string;
  eventSummary: string;
  sourceReliabilityNote: string;
  sources: EvidenceSource[];
  metrics: EvidenceMetric[];
  taskPlan: PipelineTask[];
}

export const marvellCalendarQ22026Case: EarningsEvidenceCase = {
  company: 'Marvell Technology',
  symbol: 'MRVL',
  targetWindow: 'Calendar 2026 / Q2 (Marvell FY2027-Q1)',
  eventTimeEt: '2026-05-27 4:45 PM ET',
  eventTimeTw: '2026-05-28 04:45 (UTC+8)',
  eventSummary:
    'Marvell Technology FY2027-Q1 earnings call scheduled for 2026-05-27 at 1:45 PM PT / 4:45 PM ET. Taiwan time: 2026-05-28 04:45 UTC+8.',
  sourceReliabilityNote:
    'Evidence-first mode: every extracted value requires a verifiable quote + source URL + location hint before promotion to high-confidence output. Taiwan time (UTC+8) is the primary display timezone.',
  sources: [
    {
      id: 'src-mrvl-ir-q1fy27-announcement',
      title: 'Marvell Technology Q1 FY2027 earnings date announcement',
      url: 'https://investor.marvell.com/news-releases/news-release-details/marvell-technology-reports-first-quarter-fiscal-year-2027',
      extractedText:
        'Marvell Technology, Inc. will report its first quarter fiscal year 2027 financial results on Wednesday, May 27, 2026. A conference call to discuss the results will be held at 1:45 p.m. Pacific Time.',
      locationHint: 'Press release header (date/time paragraph)',
    },
    {
      id: 'src-mrvl-stocktitan-q1fy27',
      title: 'Marvell Q1 FY2027 earnings call time reference (market mirror)',
      url: 'https://www.stocktitan.net/news/MRVL/',
      extractedText:
        'Conference call scheduled May 27, 2026 at 4:45 PM ET (1:45 PM PT). Taiwan time equivalent: May 28, 2026 04:45 UTC+8.',
      locationHint: 'Event summary block with timezone conversion note',
    },
  ],
  metrics: [
    {
      label: 'Earnings Call Time (Taiwan)',
      value: '2026-05-28 04:45 (UTC+8)',
      confidence: {
        score: 90,
        level: 'High',
        reason:
          'Derived from official IR announcement (1:45 PM PT) via deterministic timezone conversion PT→UTC+8 (+15h). No DST ambiguity at this date.',
      },
      evidenceSourceIds: ['src-mrvl-ir-q1fy27-announcement', 'src-mrvl-stocktitan-q1fy27'],
      calculationTrace: '2026-05-27 13:45 PT (PDT, UTC-7) + 15h = 2026-05-28 04:45 UTC+8',
    },
    {
      label: 'Fiscal-to-Calendar Mapping',
      value: 'Marvell FY2027-Q1 = Calendar 2026-Q2 (Feb–Apr 2026)',
      confidence: {
        score: 88,
        level: 'High',
        reason:
          'Marvell fiscal year ends late January; Q1 FY2027 covers February–April 2026, mapping to Calendar Q2 2026.',
      },
      evidenceSourceIds: ['src-mrvl-ir-q1fy27-announcement'],
    },
  ],
  taskPlan: [
    {
      step: 'T-30m trigger',
      objective: '[Static example] Validate source URL availability and cache IR announcement text.',
      status: 'Completed',
    },
    {
      step: 'T+0 ingestion',
      objective: '[Static example] Index raw evidence snippets from IR and market mirror sources.',
      status: 'Completed',
    },
    {
      step: 'T+15m extraction',
      objective: 'Model-A: extract event time + timezone normalization. Model-B: extract financial metrics.',
      status: 'Queued',
    },
    {
      step: 'T+30m internal publish',
      objective: 'Reconcile Model-A/B/C outputs, run confidence scoring, publish internal snapshot.',
      status: 'Queued',
    },
    {
      step: 'T+2~4h formal publish',
      objective: 'Reconcile delayed transcript sources, rerun verification, publish formal version.',
      status: 'Queued',
    },
  ],
};

export const broadcomCalendarQ22026Case: EarningsEvidenceCase = {
  company: 'Broadcom',
  symbol: 'AVGO',
  targetWindow: 'Calendar 2026 / Q2',
  eventTimeEt: '2026-06-03 5:00 PM ET',
  eventTimeTw: '2026-06-04 05:00 (UTC+8)',
  eventSummary:
    'Broadcom CY2026-Q2 earnings call expected after market close on 2026-06-03 US/Eastern. Taiwan time: 2026-06-04 05:00 UTC+8 (EDT, UTC-4 offset). Pending official IR confirmation.',
  sourceReliabilityNote:
    'Evidence-first mode: date/time pending official IR announcement. Current estimate based on historical scheduling pattern and user-provided CY2026-Q2 target window. Mark as Medium confidence until confirmed.',
  sources: [
    {
      id: 'src-bcm-cy26q2-ir-pending',
      title: 'Broadcom CY2026-Q2 IR announcement (pending official release)',
      url: 'https://investors.broadcom.com/news-releases',
      extractedText:
        'Pending: expected announcement for second calendar quarter 2026 (Broadcom FY2026-Q3) results. Historical pattern: earnings calls scheduled ~35 days after quarter close.',
      locationHint: 'IR news releases page — awaiting official date confirmation',
    },
    {
      id: 'src-bcm-cy26q2-user-reference',
      title: 'User-provided CY2026-Q2 date reference (2026-06-04 TW)',
      url: 'https://investors.broadcom.com/news-releases',
      extractedText:
        'User context: Broadcom CY2026-Q2 event on 2026-06-04 Taiwan time. Maps to 2026-06-03 17:00 ET (EDT offset UTC-4) → UTC+8 = 2026-06-04 05:00.',
      locationHint: 'Handoff plan design doc — user stated date for calibration',
    },
  ],
  metrics: [
    {
      label: 'Earnings Call Time (Taiwan)',
      value: '2026-06-04 05:00 (UTC+8)',
      confidence: {
        score: 72,
        level: 'Medium',
        reason:
          'Based on user-provided CY2026-Q2 date and EDT timezone conversion. Requires official IR confirmation before promotion to High.',
      },
      evidenceSourceIds: ['src-bcm-cy26q2-user-reference'],
      calculationTrace: '2026-06-03 17:00 ET (EDT, UTC-4) + 12h = 2026-06-04 05:00 UTC+8',
    },
    {
      label: 'Fiscal-to-Calendar Mapping',
      value: 'Broadcom FY2026-Q3 = Calendar 2026-Q2 (Feb–Apr 2026)',
      confidence: {
        score: 85,
        level: 'High',
        reason:
          'Broadcom fiscal year ends late October; FY2026-Q3 covers February–April 2026, mapping to Calendar Q2 2026.',
      },
      evidenceSourceIds: ['src-bcm-cy26q2-ir-pending'],
    },
  ],
  taskPlan: [
    {
      step: 'T-30m trigger',
      objective: 'Start collector, validate IR source availability, preload parser caches.',
      status: 'Queued',
    },
    {
      step: 'T+0 ingestion',
      objective: 'Ingest official IR release + webcast/transcript metadata and index raw evidence snippets.',
      status: 'Queued',
    },
    {
      step: 'T+15m extraction',
      objective: 'Model-A: extract event time + timezone normalization. Model-B: extract financial metrics.',
      status: 'Queued',
    },
    {
      step: 'T+30m internal publish',
      objective: 'Reconcile Model-A/B/C outputs, run confidence scoring, publish internal snapshot.',
      status: 'Queued',
    },
    {
      step: 'T+2~4h formal publish',
      objective: 'Reconcile delayed transcript sources, rerun verification, publish formal version.',
      status: 'Queued',
    },
  ],
};
