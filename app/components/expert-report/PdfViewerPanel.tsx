'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { ExpertReport } from '@/app/data/expertReports';

interface PdfViewerPanelProps {
  report: ExpertReport | null;
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
  const { lang } = useLanguage();
  const labels = {
    empty: { zh: '選取一筆報告以預覽', en: 'Select a report to preview' },
    preview: { zh: 'Preview', en: 'Preview' },
    downloaded: { zh: 'Downloaded', en: 'Downloaded' },
  };

  if (!report) {
    return (
      <div className="er-pdf-panel">
        <div className="er-pdf-empty">
          <PdfDocIcon />
          <span className="er-pdf-empty-text">{labels.empty[lang]}</span>
        </div>
      </div>
    );
  }

  const pdfUrl = viewMode === 'full' ? report.fullPdfUrl : report.previewPdfUrl;

  return (
    <div className="er-pdf-panel">
      <div className="er-pdf-header">
        <span className="er-pdf-header-title">{report.headline}</span>
        <span className="er-pdf-label">
          {viewMode === 'full' ? labels.downloaded[lang] : labels.preview[lang]}
        </span>
      </div>
      <iframe
        className="er-pdf-iframe"
        src={pdfUrl}
        title={report.headline}
        aria-label={`PDF viewer: ${report.headline}`}
      />
    </div>
  );
}
