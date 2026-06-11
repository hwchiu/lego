'use client';

import type { ExpertReport } from '@/app/data/expertReports';

interface LibrarySidebarProps {
  reports: ExpertReport[];                     // all owned reports
  selectedId: string | null;                   // currently selected report id
  openCategories: Set<string>;                 // expanded category names
  selectedCategory: string;                    // '__all__' or a category name
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
  // Build category → reports map, preserving insertion order
  const categoryMap = new Map<string, ExpertReport[]>();
  for (const r of reports) {
    if (!categoryMap.has(r.category)) categoryMap.set(r.category, []);
    categoryMap.get(r.category)!.push(r);
  }

  return (
    <div className="er-lib-sidebar">
      {/* All Reports */}
      <button
        className={`er-lib-all-btn${selectedCategory === '__all__' ? ' er-lib-all-btn--active' : ''}`}
        onClick={() => onSelectCategory('__all__')}
      >
        All Reports
        <span className="er-lib-section-count">{reports.length}</span>
      </button>

      {/* Per-category collapsible sections */}
      {Array.from(categoryMap.entries()).map(([category, catReports]) => {
        const isOpen = openCategories.has(category);
        return (
          <div key={category} className="er-lib-section">
            <div
              className="er-lib-section-header"
              onClick={() => onToggleCategory(category)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onToggleCategory(category)}
            >
              <span className="er-lib-section-chevron">{isOpen ? '▾' : '▸'}</span>
              <span>{category}</span>
              <span className="er-lib-section-count">{catReports.length}</span>
            </div>

            {isOpen && (
              <div className="er-lib-section-items">
                {catReports.map(r => (
                  <button
                    key={r.id}
                    className={`er-lib-section-item${r.id === selectedId ? ' er-lib-section-item--active' : ''}`}
                    onClick={() => {
                      onSelectCategory(category);
                      onSelectReport(r);
                    }}
                    title={r.title}
                  >
                    {r.title}
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
