'use client';

import { useState, useEffect } from 'react';
import type { ExpertReport } from '@/app/data/expertReports';
import { expertReportService } from '@/app/lib/expertReportService';
import SearchBar from '@/app/components/expert-report/SearchBar';
import ReportCard from '@/app/components/expert-report/ReportCard';
import PdfViewerPanel from '@/app/components/expert-report/PdfViewerPanel';
import LibrarySidebar from '@/app/components/expert-report/LibrarySidebar';
import LibraryReportList from '@/app/components/expert-report/LibraryReportList';

type Mode = 'dashboard' | 'library';

interface Filters {
  company: string;
  contributor: string;
}

export default function ExpertReportContent() {
  const [mode, setMode] = useState<Mode>('dashboard');

  // Dashboard state
  const [allReports, setAllReports] = useState<ExpertReport[]>([]);
  const [filters, setFilters] = useState<Filters>({ company: '', contributor: '' });
  const [appliedFilters, setAppliedFilters] = useState<Filters>({ company: '', contributor: '' });
  const [selectedReport, setSelectedReport] = useState<ExpertReport | null>(null);
  const [savedReportIds, setSavedReportIds] = useState<Set<string>>(new Set());

  // Library state
  const [libraryReports, setLibraryReports] = useState<ExpertReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedLibraryReport, setSelectedLibraryReport] = useState<ExpertReport | null>(null);

  useEffect(() => {
    async function load() {
      const reports = await expertReportService.getReports();
      setAllReports(reports);

      const lib = await expertReportService.getLibrary();
      setLibraryReports(lib);

      // Expand the first owned category by default
      if (lib.length > 0) {
        setOpenCategories(new Set([lib[0].category]));
      }
    }
    load();
  }, []);

  // Dashboard: filtered reports (client-side)
  const filteredReports = allReports.filter(r => {
    const companyMatch = !appliedFilters.company ||
      r.company.toLowerCase().includes(appliedFilters.company.toLowerCase());
    const contributorMatch = !appliedFilters.contributor ||
      r.contributor.toLowerCase().includes(appliedFilters.contributor.toLowerCase());
    return companyMatch && contributorMatch;
  });

  function handleSearch() {
    setAppliedFilters({ company: filters.company, contributor: filters.contributor });
  }

  function handleReset() {
    setFilters({ company: '', contributor: '' });
    setAppliedFilters({ company: '', contributor: '' });
  }

  async function handleRequestAccess(reportId: string) {
    await expertReportService.requestAccess(reportId);
    const updated = await expertReportService.getReports();
    setAllReports(updated);
    // Use functional update to avoid stale closure if user changes selection during async call
    setSelectedReport(prev =>
      prev?.id === reportId ? (updated.find(r => r.id === reportId) ?? null) : prev
    );
  }

  function handleSave(reportId: string) {
    expertReportService.saveReport(reportId, !savedReportIds.has(reportId));
    setSavedReportIds(prev => {
      const next = new Set(prev);
      if (next.has(reportId)) {
        next.delete(reportId);
      } else {
        next.add(reportId);
      }
      return next;
    });
  }

  // Library: derive displayed reports from selectedCategory
  const displayedLibraryReports = selectedCategory === '__all__'
    ? libraryReports
    : libraryReports.filter(r => r.category === selectedCategory);

  const categoryLabel = selectedCategory === '__all__' ? 'All Reports' : selectedCategory;

  function handleToggleCategory(category: string) {
    setOpenCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }

  function handleModeSwitch(newMode: Mode) {
    setMode(newMode);
    if (newMode === 'library') {
      setSelectedReport(null);
    } else {
      setSelectedLibraryReport(null);
    }
  }

  return (
    <div className="er-page">
      {/* Mode Toggle */}
      <div className="er-mode-bar">
        <div className="er-mode-toggle">
          <button
            className={`er-mode-btn${mode === 'dashboard' ? ' er-mode-btn--active' : ''}`}
            onClick={() => handleModeSwitch('dashboard')}
          >
            Report Dashboard
          </button>
          <button
            className={`er-mode-btn${mode === 'library' ? ' er-mode-btn--active' : ''}`}
            onClick={() => handleModeSwitch('library')}
          >
            My Library
            {libraryReports.length > 0 && (
              <span className="er-mode-badge">{libraryReports.length}</span>
            )}
          </button>
        </div>
      </div>

      {mode === 'dashboard' && (
        <div className="er-dashboard">
          {/* Search Bar */}
          <SearchBar
            company={filters.company}
            contributor={filters.contributor}
            resultCount={filteredReports.length}
            onCompanyChange={v => setFilters(f => ({ ...f, company: v }))}
            onContributorChange={v => setFilters(f => ({ ...f, contributor: v }))}
            onSearch={handleSearch}
            onReset={handleReset}
          />

          {/* Split panel: cards + PDF viewer */}
          <div className="er-split">
            <div className="er-cards-panel">
              {filteredReports.length === 0 ? (
                <div className="er-empty">No reports match your search criteria.</div>
              ) : (
                filteredReports.map(r => (
                  <ReportCard
                    key={r.id}
                    report={r}
                    isSelected={selectedReport?.id === r.id}
                    isSaved={savedReportIds.has(r.id)}
                    onSelect={setSelectedReport}
                    onSave={handleSave}
                    onRequestAccess={handleRequestAccess}
                  />
                ))
              )}
            </div>
            <PdfViewerPanel
              report={selectedReport}
              viewMode="preview"
            />
          </div>
        </div>
      )}

      {mode === 'library' && (
        <div className="er-library">
          <LibrarySidebar
            reports={libraryReports}
            selectedId={selectedLibraryReport?.id ?? null}
            openCategories={openCategories}
            selectedCategory={selectedCategory}
            onSelectReport={setSelectedLibraryReport}
            onToggleCategory={handleToggleCategory}
            onSelectCategory={setSelectedCategory}
          />
          <div className="er-library-main">
            <LibraryReportList
              reports={displayedLibraryReports}
              selectedId={selectedLibraryReport?.id ?? null}
              categoryLabel={categoryLabel}
              savedReportIds={savedReportIds}
              onSelect={setSelectedLibraryReport}
              onSave={handleSave}
            />
          </div>
          <PdfViewerPanel
            report={selectedLibraryReport}
            viewMode="full"
          />
        </div>
      )}
    </div>
  );
}
