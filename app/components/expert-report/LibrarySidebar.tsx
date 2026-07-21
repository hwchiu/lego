'use client';

import { useLanguage } from '@/app/contexts/LanguageContext';
import type { ExpertReport } from '@/app/data/expertReports';

interface LibrarySidebarProps {
  reports: ExpertReport[];
  selectedId: string | null;
  openCategories: Set<string>;
  selectedCategory: string;
  onSelectReport: (report: ExpertReport) => void;
  onToggleCategory: (category: string) => void;
  onSelectCategory: (category: string) => void;
}

export default function LibrarySidebar({
  reports,
  selectedId,
  openCategories,
  selectedCategory,
  onSelectReport,
  onToggleCategory,
  onSelectCategory,
}: LibrarySidebarProps) {
  const { lang } = useLanguage();
  const allReportsLabel = { zh: 'All Reports', en: 'All Reports' }[lang];

  const categoryMap = new Map<string, ExpertReport[]>();
  for (const report of reports) {
    if (!categoryMap.has(report.category)) categoryMap.set(report.category, []);
    categoryMap.get(report.category)!.push(report);
  }

  return (
    <div className="er-lib-sidebar">
      <button
        className={`er-lib-all-btn${selectedCategory === '__all__' ? ' er-lib-all-btn--active' : ''}`}
        onClick={() => onSelectCategory('__all__')}
      >
        {allReportsLabel}
        <span className="er-lib-section-count">{reports.length}</span>
      </button>

      {Array.from(categoryMap.entries()).map(([category, categoryReports]) => {
        const isOpen = openCategories.has(category);
        return (
          <div key={category} className="er-lib-section">
            <div
              className="er-lib-section-header"
              onClick={() => onToggleCategory(category)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onToggleCategory(category);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <span className="er-lib-section-chevron">{isOpen ? '▾' : '▸'}</span>
              <span>{category}</span>
              <span className="er-lib-section-count">{categoryReports.length}</span>
            </div>

            {isOpen && (
              <div className="er-lib-section-items">
                {categoryReports.map((report) => (
                  <button
                    key={report.id}
                    className={`er-lib-section-item${report.id === selectedId ? ' er-lib-section-item--active' : ''}`}
                    onClick={() => {
                      onSelectCategory(category);
                      onSelectReport(report);
                    }}
                    title={report.headline}
                  >
                    {report.headline}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
