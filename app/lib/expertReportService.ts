import {
  expertReports,
  type ExpertReport,
  type ExpertReportOption,
  type ExpertReportQuery,
  type ExpertReportSearchResponse,
} from '@/app/data/expertReports';

export interface ExpertReportService {
  searchReports(query: ExpertReportQuery): Promise<ExpertReportSearchResponse>;
  getLibrary(): Promise<ExpertReport[]>;
  downloadReport(reportId: string): Promise<void>;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

class MockExpertReportService implements ExpertReportService {
  // ponytail: keep the mock store in-memory for now; switch this singleton to real fetch calls when the backend is ready.
  private data: ExpertReport[] = expertReports.map((report) => ({ ...report }));

  async searchReports(query: ExpertReportQuery): Promise<ExpertReportSearchResponse> {
    const companyQuery = normalize(query.company);
    const contributorQuery = normalize(query.contributor);
    const headlineQuery = normalize(query.headline);

    const reports = this.data.filter((report) => {
      if (companyQuery) {
        const companyText = `${report.company} ${report.companyName}`.toLowerCase();
        if (!companyText.includes(companyQuery)) return false;
      }
      if (contributorQuery && !report.contributor.toLowerCase().includes(contributorQuery)) {
        return false;
      }
      if (headlineQuery && !report.headline.toLowerCase().includes(headlineQuery)) {
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

  async getLibrary(): Promise<ExpertReport[]> {
    return this.data
      .filter((report) => report.downloadStatus === 'downloaded')
      .map((report) => ({ ...report }));
  }

  async downloadReport(reportId: string): Promise<void> {
    const report = this.data.find((item) => item.id === reportId);
    if (!report || report.downloadStatus !== 'download') return;
    report.downloadStatus = 'pending';
    await new Promise((resolve) => setTimeout(resolve, 1200));
    report.downloadStatus = 'downloaded';
    report.downloadCount += 1;
    report.updatedAt = new Date().toISOString();
  }

  private getCompanyOptions(): ExpertReportOption[] {
    const seen = new Set<string>();
    return this.data
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
    return this.data
      .map((report) => ({ value: report.contributor, label: report.contributor }))
      .filter((option) => {
        if (seen.has(option.value)) return false;
        seen.add(option.value);
        return true;
      });
  }
}

export const expertReportService: ExpertReportService = new MockExpertReportService();
