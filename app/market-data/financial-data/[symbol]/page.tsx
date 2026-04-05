import FinancialDataCompanyContent from './FinancialDataCompanyContent';
import { getCompanies } from '@/app/data/financialData';

// Pre-render all known company symbols for static export
export function generateStaticParams() {
  return getCompanies().map((c) => ({ symbol: c.symbol }));
}

export default function FinancialDataCompanyPage({ params }: { params: { symbol: string } }) {
  return <FinancialDataCompanyContent symbol={params.symbol} />;
}
