import { Suspense } from 'react';
import CompanyProfileContent from './CompanyProfileContent';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';

// These symbols are linked from shipped UI/data but are not present in company_master.md.
// Keep them statically exported so those links do not fall through to the 404 page.
const EXTRA_COMPANY_PROFILE_SYMBOLS = ['BRK-B', 'MCD', 'SMH', 'TC'] as const;

// Pre-render all known company symbols for static export
export function generateStaticParams() {
  const symbols = new Set([
    ...COMPANY_MASTER_LIST.map((company) => company.symbol),
    ...EXTRA_COMPANY_PROFILE_SYMBOLS,
  ]);

  return [...symbols].map((symbol) => ({ symbol }));
}

export default function CompanyDetailPage({ params }: { params: { symbol: string } }) {
  return (
    <Suspense fallback={null}>
      <CompanyProfileContent symbol={params.symbol} />
    </Suspense>
  );
}
