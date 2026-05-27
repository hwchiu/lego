'use client';

import { useMemo } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { marvellCalendarQ22026Case } from '@/app/data/earningsEvidenceData';
import { runStaticEvidencePipeline } from '@/app/lib/earningsEvidencePipeline';

function confidenceClass(level: 'High' | 'Medium' | 'Low'): string {
  const classMap = {
    High: 'ee-confidence--high',
    Medium: 'ee-confidence--medium',
    Low: 'ee-confidence--low',
  };

  return `ee-confidence ${classMap[level]}`;
}

export default function EarningsEvidencePage() {
  const pipelineResult = useMemo(() => runStaticEvidencePipeline(marvellCalendarQ22026Case), []);

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad ee-page">
            <div className="section-eyebrow">Earnings Evidence</div>
            <div className="ee-header">
              <h1>
                {marvellCalendarQ22026Case.company} ({marvellCalendarQ22026Case.symbol}) - {marvellCalendarQ22026Case.targetWindow}
              </h1>
              <p>{marvellCalendarQ22026Case.eventSummary}</p>
            </div>

            <section className="ee-card">
              <h2>Event Time (Corrected Calendar Window)</h2>
              <div className="ee-grid">
                <div>
                  <div className="ee-label ee-label--primary">Taiwan (UTC+8)</div>
                  <div className="ee-value ee-value--primary">{marvellCalendarQ22026Case.eventTimeTw}</div>
                </div>
                <div>
                  <div className="ee-label">US/Eastern</div>
                  <div className="ee-value">{marvellCalendarQ22026Case.eventTimeEt}</div>
                </div>
              </div>
              <p className="ee-note">{marvellCalendarQ22026Case.sourceReliabilityNote}</p>
            </section>

            <section className="ee-card">
              <h2>Evidence-Backed Metrics</h2>
              <div className="ee-metric-list">
                {marvellCalendarQ22026Case.metrics.map((metric) => (
                  <article key={metric.label} className="ee-metric-item">
                    <div className="ee-metric-main">
                      <div>
                        <h3>{metric.label}</h3>
                        <p className="ee-value">{metric.value}</p>
                      </div>
                      <div
                        className={confidenceClass(metric.confidence.level)}
                        role="status"
                        aria-label={`Confidence ${metric.confidence.level} score ${metric.confidence.score}`}
                      >
                        {metric.confidence.level} ({metric.confidence.score})
                      </div>
                    </div>
                    <p className="ee-reason">{metric.confidence.reason}</p>
                    {metric.calculationTrace && <p className="ee-trace">Trace: {metric.calculationTrace}</p>}
                    <p className="ee-source-refs">Evidence IDs: {metric.evidenceSourceIds.join(', ')}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="ee-card">
              <h2>Evidence Sources</h2>
              <div className="ee-source-list">
                {marvellCalendarQ22026Case.sources.map((source) => (
                  <article key={source.id} className="ee-source-item">
                    <div className="ee-source-head">
                      <h3>{source.title}</h3>
                      <span>{source.id}</span>
                    </div>
                    <p>{source.extractedText}</p>
                    <p className="ee-trace">Location: {source.locationHint}</p>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      Open source
                    </a>
                  </article>
                ))}
              </div>
            </section>

            <section className="ee-card">
              <h2>Execution Task Plan</h2>
              <ol className="ee-task-list">
                {marvellCalendarQ22026Case.taskPlan.map((task) => (
                  <li key={task.step} className="ee-task-item">
                    <div className="ee-task-head">
                      <strong>{task.step}</strong>
                      <span className={`ee-task-status ee-task-status--${task.status.toLowerCase()}`}>{task.status}</span>
                    </div>
                    <p>{task.objective}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="ee-card ee-card--pipeline">
              <h2>Pipeline Run (Static Stub)</h2>
              <div className="ee-pipeline-grid">
                <div className="ee-pipeline-stage">
                  <div className="ee-pipeline-label">Collector</div>
                  <div className="ee-pipeline-value">{pipelineResult.collector.sourcesLoaded} sources · {pipelineResult.collector.status}</div>
                </div>
                <div className="ee-pipeline-stage">
                  <div className="ee-pipeline-label">Extractors</div>
                  <div className="ee-pipeline-value">
                    A: {pipelineResult.extractor.A.itemsExtracted} items ·{' '}
                    B: {pipelineResult.extractor.B.itemsExtracted} items ·{' '}
                    C: {pipelineResult.extractor.C.itemsExtracted} items
                  </div>
                </div>
                <div className="ee-pipeline-stage">
                  <div className="ee-pipeline-label">Reconcile</div>
                  <div className="ee-pipeline-value">
                    {pipelineResult.reconcile.conflictsFound} conflicts · {pipelineResult.reconcile.conflictsResolved} resolved
                  </div>
                </div>
                <div className="ee-pipeline-stage">
                  <div className="ee-pipeline-label">Overall Score</div>
                  <div className={`ee-pipeline-value ${confidenceClass(pipelineResult.scoring.overallLevel)}`}>
                    {pipelineResult.scoring.overallScore} · {pipelineResult.scoring.overallLevel}
                  </div>
                </div>
                <div className="ee-pipeline-stage">
                  <div className="ee-pipeline-label">Publish Gate</div>
                  <div className={`ee-pipeline-value ${pipelineResult.publish.passed ? 'ee-pipeline-value--pass' : 'ee-pipeline-value--fail'}`}>
                    {pipelineResult.publish.passed ? 'PASSED' : 'BLOCKED'} · {pipelineResult.publish.snapshotType}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
