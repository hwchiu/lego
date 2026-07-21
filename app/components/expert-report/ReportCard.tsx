'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { ExpertReport } from '@/app/data/expertReports';

interface ReportCardProps {
  report: ExpertReport;
  isSelected: boolean;
  onSelect: (report: ExpertReport) => void;
  onDownload: (reportId: string) => void;
}

function formatDateTime(value: string, lang: 'zh' | 'en'): string {
  return new Date(value).toLocaleString(lang === 'en' ? 'en-US' : 'zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(value: number): string {
  return `USD ${value}`;
}

export default function ReportCard({
  report,
  isSelected,
  onSelect,
  onDownload,
}: ReportCardProps) {
  const { lang } = useLanguage();
  const labels = {
    updated: { zh: 'Updated', en: 'Updated' },
    analyst: { zh: 'Analyst', en: 'Analyst' },
    contributor: { zh: 'Contributor', en: 'Contributor' },
    price: { zh: 'Price', en: 'Price' },
    pageCount: { zh: 'Page Count', en: 'Page Count' },
    downloads: { zh: '次下載', en: 'times download' },
    download: { zh: 'Download', en: 'Download' },
    pending: { zh: 'Pending', en: 'Pending' },
    downloaded: { zh: 'Downloaded', en: 'Downloaded' },
  };

  const statusLabel = report.downloadStatus === 'pending'
    ? labels.pending[lang]
    : report.downloadStatus === 'downloaded'
      ? labels.downloaded[lang]
      : labels.download[lang];

  return (
    <div
      className={`er-card${isSelected ? ' er-card--selected' : ''}`}
      onClick={() => onSelect(report)}
      onKeyDown={(event) => { if (event.key === 'Enter') onSelect(report); }}
      role="button"
      tabIndex={0}
    >
      <div className="er-card-header">
        <div className="er-card-company">
          {report.companyName} ({report.company})
        </div>
        <div className="er-card-date">
          {labels.updated[lang]} · {formatDateTime(report.updatedAt, lang)}
        </div>
      </div>

      <div className="er-card-title">{report.headline}</div>

      <div className="er-card-footer">
        <button
          className={`er-card-download-btn er-card-download-btn--${report.downloadStatus}`}
          type="button"
          disabled={report.downloadStatus !== 'download'}
          onClick={(event) => {
            event.stopPropagation();
            onDownload(report.id);
          }}
        >
          {statusLabel}
        </button>
        <div className="er-card-meta">
          <span>{labels.analyst[lang]}: {report.analystName}</span>
          <span>{labels.contributor[lang]}: {report.contributor}</span>
          <span>{labels.price[lang]}: {formatPrice(report.priceUsd)}</span>
          <span>{labels.pageCount[lang]}: {report.pageCount}</span>
          <span>{report.downloadCount} {labels.downloads[lang]}</span>
        </div>
      </div>
    </div>
  );
}
