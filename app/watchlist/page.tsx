import { Suspense } from 'react';
import WatchlistTemplateContent from './WatchlistTemplateContent';

export default function WatchlistPage() {
  return (
    <Suspense fallback={<div />}>
      <WatchlistTemplateContent />
    </Suspense>
  );
}
