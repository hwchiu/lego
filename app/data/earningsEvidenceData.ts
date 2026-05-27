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

export const broadcomCalendarQ12026Case: EarningsEvidenceCase = {
  company: 'Broadcom',
  symbol: 'AVGO',
  targetWindow: 'Calendar 2026 / Q1',
  eventTimeEt: '2026-03-04 5:00 PM ET',
  eventTimeTw: '2026-03-05 06:00 (UTC+8)',
  eventSummary:
    'Broadcom Q1 FY2026 earnings call was scheduled after market close on 2026-03-04, conference call at 5:00 PM ET.',
  sourceReliabilityNote:
    'Evidence-first mode requires verifiable quote + source URL + location hint for every extracted value before promotion to high-confidence output.',
  sources: [
    {
      id: 'src-bcm-ir-announcement',
      title: 'Broadcom investor-relations announcement (mirrored summary)',
      url: 'https://www.stocktitan.net/news/AVGO/broadcom-inc-to-announce-first-quarter-fiscal-year-2026-financial-rhojqc9g3gi5.html',
      extractedText:
        'Broadcom Inc. to announce first quarter fiscal year 2026 financial results on Wednesday, March 4, 2026 ... conference call at 2:00 p.m. Pacific Time.',
      locationHint: 'Announcement body (date/time paragraph)',
    },
    {
      id: 'src-bcm-q1-result',
      title: 'Broadcom fiscal Q1 2026 results release (investor relations mirror)',
      url: 'https://www.gurufocus.com/news/8678797/broadcom-inc-announces-first-quarter-fiscal-year-2026-financial-results-and-quarterly-dividend',
      extractedText:
        'Conference call hosted on March 4, 2026, 5:00 PM ET. Revenue and profitability figures released with Q2 guidance.',
      locationHint: 'Release recap with earnings-call context',
    },
  ],
  metrics: [
    {
      label: 'Earnings Call Time',
      value: '2026-03-04 5:00 PM ET',
      confidence: {
        score: 92,
        level: 'High',
        reason: 'Cross-confirmed by announcement and results release mirrors with matching timestamp.',
      },
      evidenceSourceIds: ['src-bcm-ir-announcement', 'src-bcm-q1-result'],
    },
    {
      label: 'Calendar Conversion (TW)',
      value: '2026-03-05 06:00 (UTC+8)',
      confidence: {
        score: 95,
        level: 'High',
        reason: 'Deterministic timezone conversion from ET to UTC+8 with no ambiguous DST transition at event timestamp.',
      },
      evidenceSourceIds: ['src-bcm-ir-announcement'],
      calculationTrace: '2026-03-04 17:00 ET + 13 hours = 2026-03-05 06:00 UTC+8',
    },
  ],
  taskPlan: [
    {
      step: 'T-30m trigger',
      objective: 'Start collector, validate source availability, preload parser caches.',
      status: 'Completed',
    },
    {
      step: 'T+0 ingestion',
      objective: 'Ingest release + webcast/transcript metadata and index raw evidence snippets.',
      status: 'Completed',
    },
    {
      step: 'T+15m extraction',
      objective: 'Extract key metrics (revenue, gross margin, DOI, segment revenue) and bind evidence pointers.',
      status: 'Queued',
    },
    {
      step: 'T+30m internal publish',
      objective: 'Publish internal snapshot with H/M/L confidence and unresolved candidates.',
      status: 'Queued',
    },
    {
      step: 'T+2~4h formal publish',
      objective: 'Reconcile delayed sources, rerun verification, publish formal version.',
      status: 'Queued',
    },
  ],
};
