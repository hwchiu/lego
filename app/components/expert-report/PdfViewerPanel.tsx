'use client';

import type { ExpertReport } from '@/app/data/expertReports';

interface PdfViewerPanelProps {
  report: ExpertReport | null;
  /** 'preview' = Dashboard mode (previewPdfUrl, may be locked). 'full' = Library mode (fullPdfUrl, always owned). */
  viewMode: 'preview' | 'full';
}

function PdfDocIcon() {
  return (
    <svg className="er-pdf-empty-icon" width="48" height="60" viewBox="0 0 48 60" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="44" height="56" rx="5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 18h24M12 27h24M12 36h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PdfViewerPanel({ report, viewMode }: PdfViewerPanelProps) {
  // No report selected
  if (!report) {
    return (
      <div className="er-pdf-panel">
        <div className="er-pdf-empty">
          <PdfDocIcon />
          <span className="er-pdf-empty-text">Select a report to preview</span>
        </div>
      </div>
    );
  }

  const isLocked = report.accessState === 'locked' || report.accessState === 'pending';

  // Locked/pending in Dashboard: show overlay instead of iframe
  if (viewMode === 'preview' && isLocked) {
    return (
      <div className="er-pdf-panel">
        <div className="er-pdf-header">
          <span className="er-pdf-header-title">{report.title}</span>
          <span className="er-pdf-ticker">{report.company}</span>
          <span className="er-pdf-label">Preview</span>
        </div>
        <div className="er-pdf-locked-overlay">
          <div className="er-pdf-locked-icon">🔒</div>
          <div className="er-pdf-locked-text">
            {report.accessState === 'pending'
              ? 'Access request submitted — awaiting approval'
              : 'Request access to read the full report'}
          </div>
        </div>
      </div>
    );
  }

  const pdfUrl = viewMode === 'full' ? report.fullPdfUrl : report.previewPdfUrl;

  return (
    <div className="er-pdf-panel">
      <div className="er-pdf-header">
        <span className="er-pdf-header-title">{report.title}</span>
        <span className="er-pdf-ticker">{report.company}</span>
        {viewMode === 'full' ? (
          <span className="er-owned-badge">✓ Owned</span>
        ) : (
          <span className="er-pdf-label">Preview</span>
        )}
      </div>
      <iframe
        className="er-pdf-iframe"
        src={pdfUrl}
        title={report.title}
        aria-label={`PDF viewer: ${report.title}`}
      />
    </div>
  );
}
