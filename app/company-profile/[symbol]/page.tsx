import CompanyProfileContent from './CompanyProfileContent';
import { SP500_COMPANIES } from '@/app/data/sp500';

// Pre-render all known company symbols for static export
export function generateStaticParams() {
  return SP500_COMPANIES.map((c) => ({ symbol: c.symbol }));
}

export default function CompanyDetailPage({ params }: { params: { symbol: string } }) {
  return <CompanyProfileContent symbol={params.symbol} />;
}
