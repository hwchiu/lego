'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { ExpertReport } from '@/app/data/expertReports';
import ReportCard from '@/app/components/expert-report/ReportCard';

interface LibraryReportListProps {
  reports: ExpertReport[];
  selectedId: string | null;
  categoryLabel: string;
  onSelect: (report: ExpertReport) => void;
  onDownload: (reportId: string) => void;
}

export default function LibraryReportList({
  reports,
  selectedId,
  categoryLabel,
  onSelect,
  onDownload,
}: LibraryReportListProps) {
  const { lang } = useLanguage();
  const emptyLabel = { zh: '目前沒有已下載的報告', en: 'No downloaded reports in this category' }[lang];
  const reportLabel = reports.length === 1
    ? { zh: '筆資料', en: 'report' }[lang]
    : { zh: '筆資料', en: 'reports' }[lang];

  return (
    <div className="er-lib-list-panel">
      <div className="er-lib-list-label">
        {categoryLabel} · {reports.length} {reportLabel}
      </div>
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          isSelected={report.id === selectedId}
          onSelect={onSelect}
          onDownload={onDownload}
        />
      ))}
      {reports.length === 0 && (
        <div className="er-lib-list-empty">{emptyLabel}</div>
      )}
    </div>
  );
}
