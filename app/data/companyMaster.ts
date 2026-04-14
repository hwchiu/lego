// Company master data — loaded from content/company_master.md
import rawContent from '@/content/company_master.md';
import { extractJson } from '@/app/lib/parseContent';

export interface CompanyMaster {
  CO_CD: string;
  CO_NAME: string;
  CO_SHORT_NAME: string;
  IS_FIN_ALIVE: 'Y' | 'N';
  IS_IR_ALIVE: 'Y' | 'N';
  IS_NEWS_ALIVE: 'Y' | 'N';
  IS_TRANSCRIPT_ALIVE: 'Y' | 'N';
  IS_INVEST_ALIVE: 'Y' | 'N';
  IS_ACQ_ALIVE: 'Y' | 'N';
  IS_FUND_ALIVE: 'Y' | 'N';
  IS_STOCK_CHART_ALIVE: 'Y' | 'N';
  IS_AI_TRANSCRIPT_ALIVE: 'Y' | 'N';
  IS_EVENT_ALIVE: 'Y' | 'N';
}

export const COMPANY_MASTER_DATA: CompanyMaster[] = extractJson<CompanyMaster[]>(rawContent);

/** Returns the full company master list. */
export function getCompanyMaster(): CompanyMaster[] {
  return COMPANY_MASTER_DATA;
}

/** Looks up a single company by its ticker symbol (CO_CD). */
export function getCompanyByCode(code: string): CompanyMaster | undefined {
  return COMPANY_MASTER_DATA.find((c) => c.CO_CD === code);
}
