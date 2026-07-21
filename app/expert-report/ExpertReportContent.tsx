'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  ExpertReport,
  ExpertReportLibraryResponse,
  ExpertReportQuery,
  ExpertReportSearchResponse,
} from '@/app/data/expertReports';
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

const EMPTY_LIBRARY: ExpertReportLibraryResponse = {
  folders: [],
  reports: [],
};

function EmptyReportIcon() {
  return (
    <svg className="er-empty-icon" width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect x="9" y="7" width="26" height="34" rx="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M18 18h18M18 25h18M18 32h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="38.5" cy="37.5" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M34.5 37.5h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

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
  const [libraryData, setLibraryData] = useState<ExpertReportLibraryResponse>(EMPTY_LIBRARY);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('__all__');
  const [openFolderIds, setOpenFolderIds] = useState<Set<string>>(new Set());
  const [selectedLibraryReport, setSelectedLibraryReport] = useState<ExpertReport | null>(null);

  const labels = {
    dashboard: { zh: 'Report Dashboard', en: 'Report Dashboard' },
    library: { zh: 'My Library', en: 'My Library' },
    allReports: { zh: 'All Reports', en: 'All Reports' },
  };

  const minPublishDate = useMemo(() => getDefaultQuery().publishDateStart, []);
  const maxPublishDate = useMemo(() => getDefaultQuery().publishDateEnd, []);

  useEffect(() => {
    void Promise.all([loadDashboard(appliedQuery), loadLibrary()]);
  }, []);

  const reportsByFolder = useMemo(() => {
    return libraryData.reports.reduce<Record<string, ExpertReport[]>>((acc, report) => {
      if (!report.libraryFolderId) return acc;
      if (!acc[report.libraryFolderId]) acc[report.libraryFolderId] = [];
      acc[report.libraryFolderId].push(report);
      return acc;
    }, {});
  }, [libraryData.reports]);

  const displayedLibraryReports = selectedFolderId === '__all__'
    ? libraryData.reports
    : libraryData.reports.filter((report) => report.libraryFolderId === selectedFolderId);

  const selectedFolderName = selectedFolderId === '__all__'
    ? labels.allReports[lang]
    : libraryData.folders.find((folder) => folder.id === selectedFolderId)?.name ?? labels.allReports[lang];

  useEffect(() => {
    setSelectedLibraryReport((current) => displayedLibraryReports.find((report) => report.id === current?.id) ?? displayedLibraryReports[0] ?? null);
  }, [displayedLibraryReports]);

  async function loadDashboard(nextQuery: ExpertReportQuery) {
    const nextData = await expertReportService.searchReports(nextQuery);
    setDashboardData(nextData);
    setSelectedReport((current) => nextData.reports.find((report) => report.id === current?.id) ?? null);
  }

  async function loadLibrary() {
    const nextLibrary = await expertReportService.getLibrary();
    setLibraryData(nextLibrary);
    setOpenFolderIds((current) => {
      const nextIds = nextLibrary.folders.map((folder) => folder.id);
      if (current.size === 0) {
        return new Set(nextIds);
      }

      const nextOpen = new Set(nextIds.filter((folderId) => current.has(folderId)));
      return nextOpen.size > 0 ? nextOpen : new Set(nextIds.slice(0, 1));
    });
    setSelectedFolderId((current) => (
      current === '__all__' || nextLibrary.folders.some((folder) => folder.id === current)
        ? current
        : '__all__'
    ));
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

    await expertReportService.downloadReport(reportId);
    await Promise.all([loadDashboard(appliedQuery), loadLibrary()]);
  }

  async function handleCreateFolder(name: string) {
    const folder = await expertReportService.createLibraryFolder(name);
    await loadLibrary();
    setSelectedFolderId(folder.id);
    setOpenFolderIds((current) => new Set([...current, folder.id]));
  }

  async function handleRenameFolder(folderId: string, name: string) {
    await expertReportService.renameLibraryFolder(folderId, name);
    await loadLibrary();
  }

  async function handleMoveReport(reportId: string, folderId: string) {
    await expertReportService.moveLibraryReport(reportId, folderId);
    await loadLibrary();
    setSelectedFolderId(folderId);
  }

  function handleSelectDashboardReport(report: ExpertReport) {
    setSelectedReport(report);
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

  function handleToggleFolder(folderId: string) {
    setOpenFolderIds((current) => {
      const next = new Set(current);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  }

  const breadcrumbItems = [labels.library[lang], selectedFolderName];

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
            {libraryData.reports.length > 0 && (
              <span className="er-mode-badge">{libraryData.reports.length}</span>
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
                <div className="er-empty">
                  <EmptyReportIcon />
                  <div className="er-empty-title">No analyst reports available</div>
                  <div className="er-empty-copy">Try adjusting your query criteria and search again.</div>
                </div>
              ) : (
                dashboardData.reports.map((report) => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    isSelected={selectedReport?.id === report.id}
                    onSelect={handleSelectDashboardReport}
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
            folders={libraryData.folders}
            reportsByFolder={reportsByFolder}
            selectedId={selectedLibraryReport?.id ?? null}
            openFolderIds={openFolderIds}
            selectedFolderId={selectedFolderId}
            onSelectReport={setSelectedLibraryReport}
            onToggleFolder={handleToggleFolder}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onMoveReport={handleMoveReport}
          />
          <div className="er-library-main">
            <LibraryReportList
              reports={displayedLibraryReports}
              selectedId={selectedLibraryReport?.id ?? null}
              breadcrumbItems={breadcrumbItems}
              onSelect={setSelectedLibraryReport}
            />
          </div>
          <PdfViewerPanel report={selectedLibraryReport} viewMode="full" />
        </div>
      )}
    </div>
  );
}
