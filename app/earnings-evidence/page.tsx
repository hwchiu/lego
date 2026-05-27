'use client';

import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { broadcomCalendarQ12026Case } from '@/app/data/earningsEvidenceData';

function confidenceClass(level: 'High' | 'Medium' | 'Low'): string {
  if (level === 'High') return 'ee-confidence ee-confidence--high';
  if (level === 'Medium') return 'ee-confidence ee-confidence--medium';
  return 'ee-confidence ee-confidence--low';
}

export default function EarningsEvidencePage() {
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
                {broadcomCalendarQ12026Case.company} ({broadcomCalendarQ12026Case.symbol}) - {broadcomCalendarQ12026Case.targetWindow}
              </h1>
              <p>{broadcomCalendarQ12026Case.eventSummary}</p>
            </div>

            <section className="ee-card">
              <h2>Event Time (Corrected Calendar Window)</h2>
              <div className="ee-grid">
                <div>
                  <div className="ee-label">US/Eastern</div>
                  <div className="ee-value">{broadcomCalendarQ12026Case.eventTimeEt}</div>
                </div>
                <div>
                  <div className="ee-label">Taiwan (UTC+8)</div>
                  <div className="ee-value">{broadcomCalendarQ12026Case.eventTimeTw}</div>
                </div>
              </div>
              <p className="ee-note">{broadcomCalendarQ12026Case.sourceReliabilityNote}</p>
            </section>

            <section className="ee-card">
              <h2>Evidence-Backed Metrics</h2>
              <div className="ee-metric-list">
                {broadcomCalendarQ12026Case.metrics.map((metric) => (
                  <article key={metric.label} className="ee-metric-item">
                    <div className="ee-metric-main">
                      <div>
                        <h3>{metric.label}</h3>
                        <p className="ee-value">{metric.value}</p>
                      </div>
                      <div className={confidenceClass(metric.confidence.level)}>
                        {metric.confidence.level} ({metric.confidence.score})
                      </div>
                    </div>
                    <p className="ee-reason">{metric.confidence.reason}</p>
                    {metric.calculationTrace ? <p className="ee-trace">Trace: {metric.calculationTrace}</p> : null}
                    <p className="ee-source-refs">Evidence IDs: {metric.evidenceSourceIds.join(', ')}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="ee-card">
              <h2>Evidence Sources</h2>
              <div className="ee-source-list">
                {broadcomCalendarQ12026Case.sources.map((source) => (
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
                {broadcomCalendarQ12026Case.taskPlan.map((task) => (
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
          </div>
        </main>
      </div>
    </>
  );
}
