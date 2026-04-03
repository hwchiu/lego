import WatchlistContent from './WatchlistContent';

// Required for static export: pre-render all known watchlist IDs
export function generateStaticParams() {
  return [{ id: '627836' }, { id: '738291' }, { id: '394827' }];
}

export default function WatchlistPage({ params }: { params: { id: string } }) {
  return <WatchlistContent params={params} />;
}
