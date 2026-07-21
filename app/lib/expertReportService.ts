import {
  expertReportLibraryFolders,
  expertReports,
  type ExpertReport,
  type ExpertReportLibraryResponse,
  type ExpertReportOption,
  type ExpertReportQuery,
  type ExpertReportSearchResponse,
  type LibraryFolder,
} from '@/app/data/expertReports';

interface StoredExpertReportState {
  data: ExpertReport[];
  folders: LibraryFolder[];
}

export interface ExpertReportService {
  searchReports(query: ExpertReportQuery): Promise<ExpertReportSearchResponse>;
  getLibrary(): Promise<ExpertReportLibraryResponse>;
  downloadReport(reportId: string): Promise<void>;
  createLibraryFolder(name: string): Promise<LibraryFolder>;
  renameLibraryFolder(folderId: string, name: string): Promise<LibraryFolder>;
  moveLibraryReport(reportId: string, folderId: string): Promise<void>;
}

const STORAGE_KEY = 'expert-report-library-state-v2';

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesFuzzyText(candidate: string, query: string): boolean {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return true;
  const candidateText = normalize(candidate);
  return normalizedQuery.split(' ').every((token) => candidateText.includes(token));
}

function createDefaultState(): StoredExpertReportState {
  return {
    data: expertReports.map((report) => ({ ...report })),
    folders: expertReportLibraryFolders.map((folder) => ({ ...folder })),
  };
}

class MockExpertReportService implements ExpertReportService {
  // ponytail: keep the mock store in localStorage-backed client memory for now; replace this singleton with real fetch calls when the backend is ready.
  private state: StoredExpertReportState = createDefaultState();
  private initialized = false;

  async searchReports(query: ExpertReportQuery): Promise<ExpertReportSearchResponse> {
    this.ensureLoaded();

    const companyQuery = normalize(query.company);
    const contributorQuery = normalize(query.contributor);
    const headlineQuery = normalize(query.headline);

    const reports = this.state.data.filter((report) => {
      if (companyQuery && !matchesFuzzyText(`${report.companyName} ${report.company}`, companyQuery)) {
        return false;
      }
      if (contributorQuery && !matchesFuzzyText(report.contributor, contributorQuery)) {
        return false;
      }
      if (headlineQuery && !matchesFuzzyText(report.headline, headlineQuery)) {
        return false;
      }
      if (query.publishDateStart && report.publishDate < query.publishDateStart) return false;
      if (query.publishDateEnd && report.publishDate > query.publishDateEnd) return false;
      return true;
    });

    return {
      reports: reports.map((report) => ({ ...report })),
      companyOptions: this.getCompanyOptions(),
      contributorOptions: this.getContributorOptions(),
    };
  }

  async getLibrary(): Promise<ExpertReportLibraryResponse> {
    this.ensureLoaded();

    return {
      folders: this.state.folders.map((folder) => ({ ...folder })),
      reports: this.state.data
        .filter((report) => report.downloadStatus === 'downloaded')
        .map((report) => ({ ...report })),
    };
  }

  async downloadReport(reportId: string): Promise<void> {
    this.ensureLoaded();

    const report = this.state.data.find((item) => item.id === reportId);
    if (!report || report.downloadStatus !== 'download') return;

    report.downloadStatus = 'pending';
    this.persist();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    report.downloadStatus = 'downloaded';
    report.downloadCount += 1;
    report.updatedAt = new Date().toISOString();
    report.libraryFolderId = this.resolveInitialFolderId(report);
    this.persist();
  }

  async createLibraryFolder(name: string): Promise<LibraryFolder> {
    this.ensureLoaded();

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Folder name is required.');
    }

    const folder: LibraryFolder = {
      id: `folder-${Date.now().toString(36)}`,
      name: trimmedName,
    };

    this.state.folders.push(folder);
    this.persist();
    return { ...folder };
  }

  async renameLibraryFolder(folderId: string, name: string): Promise<LibraryFolder> {
    this.ensureLoaded();

    const folder = this.state.folders.find((item) => item.id === folderId);
    if (!folder) {
      throw new Error('Folder not found.');
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Folder name is required.');
    }

    folder.name = trimmedName;
    this.persist();
    return { ...folder };
  }

  async moveLibraryReport(reportId: string, folderId: string): Promise<void> {
    this.ensureLoaded();

    const folder = this.state.folders.find((item) => item.id === folderId);
    if (!folder) {
      throw new Error('Folder not found.');
    }

    const report = this.state.data.find((item) => item.id === reportId);
    if (!report || report.downloadStatus !== 'downloaded') {
      throw new Error('Downloaded report not found.');
    }

    report.libraryFolderId = folder.id;
    report.updatedAt = new Date().toISOString();
    this.persist();
  }

  private getCompanyOptions(): ExpertReportOption[] {
    const seen = new Set<string>();
    return this.state.data
      .map((report) => ({
        value: `${report.companyName} (${report.company})`,
        label: `${report.companyName} (${report.company})`,
      }))
      .filter((option) => {
        if (seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  }

  private getContributorOptions(): ExpertReportOption[] {
    const seen = new Set<string>();
    return this.state.data
      .map((report) => ({ value: report.contributor, label: report.contributor }))
      .filter((option) => {
        if (seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  }

  private resolveInitialFolderId(report: ExpertReport): string | null {
    if (report.libraryFolderId) return report.libraryFolderId;
    const sameCategoryFolder = this.state.folders.find((folder) => normalize(folder.name) === normalize(report.category));
    return sameCategoryFolder?.id ?? this.state.folders[0]?.id ?? null;
  }

  private ensureLoaded() {
    if (this.initialized || typeof window === 'undefined') {
      this.initialized = true;
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredExpertReportState>;
        if (Array.isArray(parsed.data) && Array.isArray(parsed.folders)) {
          this.state = {
            data: parsed.data.map((report) => ({ ...report })) as ExpertReport[],
            folders: parsed.folders.map((folder) => ({ ...folder })) as LibraryFolder[],
          };
        }
      }
    } catch (error) {
      console.warn('Failed to restore expert report library state.', error);
      this.state = createDefaultState();
    }

    this.initialized = true;
  }

  private persist() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}

export const expertReportService: ExpertReportService = new MockExpertReportService();
