'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { ExpertReport } from '@/app/data/expertReports';
import ReportCard from '@/app/components/expert-report/ReportCard';

interface LibraryReportListProps {
  reports: ExpertReport[];
  selectedId: string | null;
  breadcrumbItems: string[];
  onSelect: (report: ExpertReport) => void;
}

export default function LibraryReportList({
  reports,
  selectedId,
  breadcrumbItems,
  onSelect,
}: LibraryReportListProps) {
  const { lang } = useLanguage();
  const emptyLabel = { zh: '目前沒有已下載的報告', en: 'No downloaded reports in this folder' }[lang];

  return (
    <div className="er-lib-list-panel">
      <div className="er-lib-list-label" aria-label="Library breadcrumb">
        {breadcrumbItems.map((item, index) => (
          <span key={`${item}-${index}`} className="er-lib-breadcrumb-item">
            {index > 0 && <span className="er-lib-breadcrumb-sep">/</span>}
            <span>{item}</span>
          </span>
        ))}
      </div>

      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          isSelected={report.id === selectedId}
          onSelect={onSelect}
          showActionButton={false}
          variant="library"
        />
      ))}

      {reports.length === 0 && (
        <div className="er-lib-list-empty">{emptyLabel}</div>
      )}
    </div>
  );
}
