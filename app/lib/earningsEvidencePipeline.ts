/**
 * earningsEvidencePipeline.ts
 *
 * Static stub for the A-team evidence pipeline.
 * All stages return fixed structures derived from the static case data.
 * Replace each stage with real implementations as the pipeline matures.
 *
 * Pipeline stages:
 *   collector → extractor (A/B/C) → reconcile → scoring → publish
 */

import type { EarningsEvidenceCase, EvidenceMetric } from '@/app/data/earningsEvidenceData';

// ─── Stage result types ───────────────────────────────────────────────────────

export interface CollectorResult {
  caseId: string;
  sourcesLoaded: number;
  status: 'ready' | 'partial' | 'failed';
}

export interface ExtractorResult {
  model: 'A' | 'B' | 'C';
  itemsExtracted: number;
  confidenceHint: 'High' | 'Medium' | 'Low';
}

export interface ReconcileResult {
  conflictsFound: number;
  conflictsResolved: number;
  unresolvedItems: string[];
}

export interface ScoringResult {
  metrics: Array<{
    label: string;
    score: number;
    level: 'High' | 'Medium' | 'Low';
  }>;
  overallScore: number;
  overallLevel: 'High' | 'Medium' | 'Low';
}

export interface PublishResult {
  snapshotType: 'internal' | 'formal';
  publishedAt: string;
  pendingItems: string[];
  passed: boolean;
}

export interface PipelineRunResult {
  caseId: string;
  collector: CollectorResult;
  extractor: { A: ExtractorResult; B: ExtractorResult; C: ExtractorResult };
  reconcile: ReconcileResult;
  scoring: ScoringResult;
  publish: PublishResult;
}

// ─── Stub helpers ─────────────────────────────────────────────────────────────

function scoreLevel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 85) return 'High';
  if (score >= 70) return 'Medium';
  return 'Low';
}

function buildScoringFromMetrics(metrics: EvidenceMetric[]): ScoringResult {
  const scored = metrics.map((m) => ({
    label: m.label,
    score: m.confidence.score,
    level: m.confidence.level,
  }));
  const avg = scored.reduce((sum, m) => sum + m.score, 0) / (scored.length || 1);
  const overall = Math.round(avg);
  return { metrics: scored, overallScore: overall, overallLevel: scoreLevel(overall) };
}

// ─── Main stub entry point ────────────────────────────────────────────────────

/**
 * runStaticEvidencePipeline
 *
 * Accepts an EarningsEvidenceCase and returns a fully populated PipelineRunResult
 * derived from the static data. No real API calls are made.
 *
 * @param evidenceCase - The static case object to run through the pipeline.
 * @returns PipelineRunResult with all stage results populated from static data.
 */
export function runStaticEvidencePipeline(evidenceCase: EarningsEvidenceCase): PipelineRunResult {
  const caseId = `${evidenceCase.symbol}-${evidenceCase.targetWindow.replace(/\s+/g, '-')}`;

  // Stage 1: Collector (stub — counts loaded sources)
  const collector: CollectorResult = {
    caseId,
    sourcesLoaded: evidenceCase.sources.length,
    status: evidenceCase.sources.length > 0 ? 'ready' : 'failed',
  };

  // Stage 2: Extractors (stub — reports item counts based on case data)
  const extractorA: ExtractorResult = {
    model: 'A',
    itemsExtracted: evidenceCase.metrics.filter((m) => m.label.toLowerCase().includes('time') || m.label.toLowerCase().includes('mapping')).length,
    confidenceHint: 'High',
  };
  const extractorB: ExtractorResult = {
    model: 'B',
    itemsExtracted: evidenceCase.metrics.filter((m) => !m.label.toLowerCase().includes('time') && !m.label.toLowerCase().includes('mapping')).length,
    confidenceHint: 'Medium',
  };
  const extractorC: ExtractorResult = {
    model: 'C',
    itemsExtracted: 0,
    confidenceHint: 'Low',
  };

  // Stage 3: Reconcile (stub — no real conflicts in static data)
  const reconcile: ReconcileResult = {
    conflictsFound: 0,
    conflictsResolved: 0,
    unresolvedItems: [],
  };

  // Stage 4: Confidence Scoring (derived from static case metrics)
  const scoring = buildScoringFromMetrics(evidenceCase.metrics);

  // Stage 5: Publish gate (internal snapshot for static runs)
  const pendingItems = evidenceCase.metrics
    .filter((m) => m.confidence.level === 'Low')
    .map((m) => m.label);

  const publish: PublishResult = {
    snapshotType: 'internal',
    publishedAt: new Date().toISOString(),
    pendingItems,
    passed: scoring.overallLevel !== 'Low',
  };

  return {
    caseId,
    collector,
    extractor: { A: extractorA, B: extractorB, C: extractorC },
    reconcile,
    scoring,
    publish,
  };
}
