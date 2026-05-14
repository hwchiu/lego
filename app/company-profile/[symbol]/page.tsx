import { Suspense } from 'react';
import CompanyProfileContent from './CompanyProfileContent';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';

const EXTRA_COMPANY_PROFILE_SYMBOLS = ['BRK-B', 'MCD', 'SMH', 'TC'] as const;

// Pre-render all known company symbols for static export
export function generateStaticParams() {
  const symbols = new Set(COMPANY_MASTER_LIST.map((company) => company.symbol));

  EXTRA_COMPANY_PROFILE_SYMBOLS.forEach((symbol) => {
    symbols.add(symbol);
  });

  return [...symbols].map((symbol) => ({ symbol }));
}

export default function CompanyDetailPage({ params }: { params: { symbol: string } }) {
  return (
    <Suspense fallback={null}>
      <CompanyProfileContent symbol={params.symbol} />
    </Suspense>
  );
}
