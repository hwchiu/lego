'use client';

import type { ExpertReport } from '@/app/data/expertReports';
import ReportCard from '@/app/components/expert-report/ReportCard';

interface LibraryReportListProps {
  reports: ExpertReport[];
  selectedId: string | null;
  categoryLabel: string;
  savedReportIds: Set<string>;
  onSelect: (report: ExpertReport) => void;
  onSave: (reportId: string) => void;
}

export default function LibraryReportList({
  reports,
  selectedId,
  categoryLabel,
  savedReportIds,
  onSelect,
  onSave,
}: LibraryReportListProps) {
  return (
    <div className="er-lib-list-panel">
      <div className="er-lib-list-label">
        {categoryLabel} · {reports.length} {reports.length === 1 ? 'report' : 'reports'}
      </div>
      {reports.map(r => (
        <ReportCard
          key={r.id}
          report={r}
          isSelected={r.id === selectedId}
          isSaved={savedReportIds.has(r.id)}
          onSelect={onSelect}
          onSave={onSave}
          onRequestAccess={() => {}}
        />
      ))}
      {reports.length === 0 && (
        <div className="er-lib-list-empty">
          No reports in this category
        </div>
      )}
    </div>
  );
}
