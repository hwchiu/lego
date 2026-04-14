// S&P 500 / company list — backward-compatible re-exports built on top of companyMaster
// All callers that import SP500_COMPANIES, SP500Company, or resolveSymbolAlias continue to work.
import { COMPANY_MASTER_DATA } from './companyMaster';

export interface SP500Company {
  symbol: string;
  name: string;
}

/** Resolves symbol aliases to their canonical data symbol (e.g. TSM → TC). */
export function resolveSymbolAlias(symbol: string): string {
  if (symbol === 'TSM') return 'TC';
  return symbol;
}

export const SP500_COMPANIES: SP500Company[] = COMPANY_MASTER_DATA.map((c) => ({
  symbol: c.CO_CD,
  name: c.CO_NAME,
}));
