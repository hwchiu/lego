import CompanyProfileContent from './CompanyProfileContent';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';

// Pre-render all known company symbols for static export
export function generateStaticParams() {
  return COMPANY_MASTER_LIST.map((c) => ({ symbol: c.symbol }));
}

export default function CompanyDetailPage({ params }: { params: { symbol: string } }) {
  return <CompanyProfileContent symbol={params.symbol} />;
}
