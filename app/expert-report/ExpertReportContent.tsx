'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ExpertReport, ExpertReportQuery, ExpertReportSearchResponse } from '@/app/data/expertReports';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { expertReportService } from '@/app/lib/expertReportService';
import SearchBar from '@/app/components/expert-report/SearchBar';
import ReportCard from '@/app/components/expert-report/ReportCard';
import PdfViewerPanel from '@/app/components/expert-report/PdfViewerPanel';
import LibrarySidebar from '@/app/components/expert-report/LibrarySidebar';
import LibraryReportList from '@/app/components/expert-report/LibraryReportList';

type Mode = 'dashboard' | 'library';

const EMPTY_RESPONSE: ExpertReportSearchResponse = {
  reports: [],
  companyOptions: [],
  contributorOptions: [],
};

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number): Date {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getDefaultQuery(): ExpertReportQuery {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = addMonths(today, -6);
  return {
    company: '',
    contributor: '',
    publishDateStart: toIsoDate(start),
    publishDateEnd: toIsoDate(today),
    headline: '',
  };
}

export default function ExpertReportContent() {
  const { lang } = useLanguage();
  const [mode, setMode] = useState<Mode>('dashboard');
  const [query, setQuery] = useState<ExpertReportQuery>(getDefaultQuery);
  const [appliedQuery, setAppliedQuery] = useState<ExpertReportQuery>(getDefaultQuery);
  const [dashboardData, setDashboardData] = useState<ExpertReportSearchResponse>(EMPTY_RESPONSE);
  const [selectedReport, setSelectedReport] = useState<ExpertReport | null>(null);
  const [libraryReports, setLibraryReports] = useState<ExpertReport[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('__all__');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [selectedLibraryReport, setSelectedLibraryReport] = useState<ExpertReport | null>(null);

  const labels = {
    dashboard: { zh: 'Report Dashboard', en: 'Report Dashboard' },
    library: { zh: 'My Library', en: 'My Library' },
    empty: { zh: '沒有符合條件的報告。', en: 'No reports match your search criteria.' },
    allReports: { zh: 'All Reports', en: 'All Reports' },
  };

  const minPublishDate = useMemo(() => getDefaultQuery().publishDateStart, []);
  const maxPublishDate = useMemo(() => getDefaultQuery().publishDateEnd, []);

  useEffect(() => {
    void Promise.all([loadDashboard(appliedQuery), loadLibrary()]);
  }, []);

  async function loadDashboard(nextQuery: ExpertReportQuery) {
    const nextData = await expertReportService.searchReports(nextQuery);
    setDashboardData(nextData);
    setSelectedReport((current) => nextData.reports.find((report) => report.id === current?.id) ?? nextData.reports[0] ?? null);
  }

  async function loadLibrary() {
    const nextLibrary = await expertReportService.getLibrary();
    setLibraryReports(nextLibrary);
    if (nextLibrary.length > 0) {
      setOpenCategories((current) => {
        if (current.size > 0) return current;
        return new Set([nextLibrary[0].category]);
      });
    }
    setSelectedLibraryReport((current) => nextLibrary.find((report) => report.id === current?.id) ?? nextLibrary[0] ?? null);
  }

  async function handleSearch() {
    setAppliedQuery(query);
    await loadDashboard(query);
  }

  async function handleReset() {
    const defaults = getDefaultQuery();
    setQuery(defaults);
    setAppliedQuery(defaults);
    await loadDashboard(defaults);
  }

  async function handleDownload(reportId: string) {
    setDashboardData((current) => ({
      ...current,
      reports: current.reports.map((report) => (
        report.id === reportId && report.downloadStatus === 'download'
          ? { ...report, downloadStatus: 'pending' }
          : report
      )),
    }));
    setSelectedReport((current) => (
      current?.id === reportId && current.downloadStatus === 'download'
        ? { ...current, downloadStatus: 'pending' }
        : current
    ));
    setLibraryReports((current) => current.map((report) => (
      report.id === reportId && report.downloadStatus === 'download'
        ? { ...report, downloadStatus: 'pending' }
        : report
    )));

    await expertReportService.downloadReport(reportId);
    await Promise.all([loadDashboard(appliedQuery), loadLibrary()]);
  }

  function handlePublishDateStartChange(value: string) {
    setQuery((current) => ({
      ...current,
      publishDateStart: value,
      publishDateEnd: current.publishDateEnd && value && current.publishDateEnd < value ? value : current.publishDateEnd,
    }));
  }

  function handlePublishDateEndChange(value: string) {
    setQuery((current) => ({
      ...current,
      publishDateEnd: value,
      publishDateStart: current.publishDateStart && value && current.publishDateStart > value ? value : current.publishDateStart,
    }));
  }

  const categoryLabel = selectedCategory === '__all__' ? labels.allReports[lang] : selectedCategory;
  const displayedLibraryReports = selectedCategory === '__all__'
    ? libraryReports
    : libraryReports.filter((report) => report.category === selectedCategory);

  function handleToggleCategory(category: string) {
    setOpenCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  return (
    <div className="er-page">
      <div className="er-mode-bar">
        <div className="er-mode-toggle">
          <button
            className={`er-mode-btn${mode === 'dashboard' ? ' er-mode-btn--active' : ''}`}
            onClick={() => setMode('dashboard')}
          >
            {labels.dashboard[lang]}
          </button>
          <button
            className={`er-mode-btn${mode === 'library' ? ' er-mode-btn--active' : ''}`}
            onClick={() => setMode('library')}
          >
            {labels.library[lang]}
            {libraryReports.length > 0 && (
              <span className="er-mode-badge">{libraryReports.length}</span>
            )}
          </button>
        </div>
      </div>

      {mode === 'dashboard' && (
        <div className="er-dashboard">
          <SearchBar
            company={query.company}
            contributor={query.contributor}
            publishDateStart={query.publishDateStart}
            publishDateEnd={query.publishDateEnd}
            headline={query.headline}
            companyOptions={dashboardData.companyOptions}
            contributorOptions={dashboardData.contributorOptions}
            minDate={minPublishDate}
            maxDate={maxPublishDate}
            resultCount={dashboardData.reports.length}
            onCompanyChange={(value) => setQuery((current) => ({ ...current, company: value }))}
            onContributorChange={(value) => setQuery((current) => ({ ...current, contributor: value }))}
            onPublishDateStartChange={handlePublishDateStartChange}
            onPublishDateEndChange={handlePublishDateEndChange}
            onHeadlineChange={(value) => setQuery((current) => ({ ...current, headline: value }))}
            onSearch={handleSearch}
            onReset={handleReset}
          />

          <div className="er-split">
            <div className="er-cards-panel">
              {dashboardData.reports.length === 0 ? (
                <div className="er-empty">{labels.empty[lang]}</div>
              ) : (
                dashboardData.reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    isSelected={selectedReport?.id === report.id}
                    onSelect={setSelectedReport}
                    onDownload={handleDownload}
                  />
                ))
              )}
            </div>
            <PdfViewerPanel report={selectedReport} viewMode="preview" />
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
              onSelect={setSelectedLibraryReport}
              onDownload={handleDownload}
            />
          </div>
          <PdfViewerPanel report={selectedLibraryReport} viewMode="full" />
        </div>
      )}
    </div>
  );
}
