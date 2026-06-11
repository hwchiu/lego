'use client';

import type { ExpertReport } from '@/app/data/expertReports';

interface LibraryReportListProps {
  reports: ExpertReport[];
  selectedId: string | null;
  categoryLabel: string;
  onSelect: (report: ExpertReport) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LibraryReportList({
  reports,
  selectedId,
  categoryLabel,
  onSelect,
}: LibraryReportListProps) {
  return (
    <div className="er-lib-list-panel">
      <div className="er-lib-list-label">
        {categoryLabel} · {reports.length} {reports.length === 1 ? 'report' : 'reports'}
      </div>
      {reports.map(r => (
        <div
          key={r.id}
          className={`er-lib-item${r.id === selectedId ? ' er-lib-item--active' : ''}`}
          onClick={() => onSelect(r)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onSelect(r)}
        >
          <div className="er-lib-item-title">{r.title}</div>
          <div className="er-lib-item-meta">
            {r.contributor} · {formatDate(r.date)}
          </div>
        </div>
      ))}
      {reports.length === 0 && (
        <div className="er-lib-list-empty">
          No reports in this category
        </div>
      )}
    </div>
  );
}
