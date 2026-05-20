import { Suspense } from 'react';
import CompanyProfileContent from './CompanyProfileContent';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';
import siteConfig from '@/app/data/siteConfig.json';

// These overrides keep already-linked preview/non-master symbols exported until company_master.md includes them.
const { EXTRA_COMPANY_PROFILE_SYMBOLS } = siteConfig;

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
