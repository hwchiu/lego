import WatchlistContent from './WatchlistContent';
import { DYNAMIC_WATCHLIST_IDS } from '@/app/data/watchlistData';

// Required for static export: pre-render all known watchlist IDs
export function generateStaticParams() {
  const dynamicIds = [...DYNAMIC_WATCHLIST_IDS].map((id) => ({ id }));
  return [...dynamicIds];
}

export default function WatchlistPage({ params }: { params: { id: string } }) {
  return <WatchlistContent params={params} />;
}
