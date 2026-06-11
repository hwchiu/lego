import { ExpertReport, expertReports } from '@/app/data/expertReports';

export interface ExpertReportService {
  /** Return all reports, optionally filtered by company ticker and/or contributor name (case-insensitive substring match). */
  getReports(filters?: { company?: string; contributor?: string }): Promise<ExpertReport[]>;
  /** Return only reports with accessState === 'owned'. */
  getLibrary(): Promise<ExpertReport[]>;
  /** Optimistically change accessState from 'locked' → 'pending'. No-op if already pending/owned. */
  requestAccess(reportId: string): Promise<void>;
  /** No-op in mock — saved state is managed in component state. Reserved for API integration. */
  saveReport(reportId: string, saved: boolean): Promise<void>;
}

class MockExpertReportService implements ExpertReportService {
  // Mutable copy — mutations (requestAccess) survive for the session but reset on page reload.
  private data: ExpertReport[] = expertReports.map(r => ({ ...r }));

  async getReports(filters?: { company?: string; contributor?: string }): Promise<ExpertReport[]> {
    let result = this.data;
    if (filters?.company) {
      const q = filters.company.toLowerCase();
      result = result.filter(r => r.company.toLowerCase().includes(q));
    }
    if (filters?.contributor) {
      const q = filters.contributor.toLowerCase();
      result = result.filter(r => r.contributor.toLowerCase().includes(q));
    }
    return [...result];
  }

  async getLibrary(): Promise<ExpertReport[]> {
    return this.data.filter(r => r.accessState === 'owned');
  }

  async requestAccess(reportId: string): Promise<void> {
    const report = this.data.find(r => r.id === reportId);
    if (report && report.accessState === 'locked') {
      report.accessState = 'pending';
    }
  }

  async saveReport(_reportId: string, _saved: boolean): Promise<void> {
    // Saved state lives in component state. This method is reserved for the backend integration.
  }
}

// Singleton — component imports this directly. To swap to real API, replace this export.
export const expertReportService: ExpertReportService = new MockExpertReportService();
