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
