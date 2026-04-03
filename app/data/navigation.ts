export interface NavItem {
  label: string;
  href: string;
  icon: string; // SVG path data identifier — rendered by component
  active?: boolean;
  badge?: string;
  badgeColor?: string; // optional custom badge background color
  badgeStyle?: 'new' | 'coming-soon'; // badge visual style
  subItems?: SubNavItem[];
}

export interface SubNavItem {
  label: string;
  href: string;
  dividerBefore?: boolean; // render a thin divider line above this item
  watchlistId?: string; // if set, label is dynamically overridden by WatchlistContext
  iconRight?: 'add'; // optional right-aligned icon
}

export interface SidebarSection {
  label?: string;
  items: NavItem[];
}

// SVG icon paths (14x14 viewBox) — referenced by key
export const sidebarIcons: Record<string, string> = {
  info:
    '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 6.5V10M7 4V5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  star:
    '<path d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  report:
    '<rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  mail:
    '<rect x="1" y="3" width="12" height="9" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 5l6 4 6-4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  home:
    '<path d="M7 1.5L1 6.5H2.5V12.5H5.5V9H8.5V12.5H11.5V6.5H13L7 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
  news:
    '<rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  marketData:
    '<path d="M2 11H4V7H2V11ZM5.5 11H7.5V4H5.5V11ZM9 11H11V8H9V11Z" fill="currentColor"/>',
  calendar:
    '<rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 6H13M4.5 1V4M9.5 1V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  earnings:
    '<path d="M1 9L4.5 5L7.5 7.5L13 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 2H13V5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  target:
    '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 1V3M7 11V13M1 7H3M11 7H13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  supplyMap:
    '<circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="2" cy="3" r="1.5" fill="currentColor"/><circle cx="12" cy="3" r="1.5" fill="currentColor"/><circle cx="2" cy="11" r="1.5" fill="currentColor"/><circle cx="12" cy="11" r="1.5" fill="currentColor"/><path d="M3 3.5L5.5 6M11 3.5L8.5 6M3 10.5L5.5 8M11 10.5L8.5 8" stroke="currentColor" stroke-width="1.2"/>',
  layers:
    '<path d="M7 1.5L1 4.5L7 7.5L13 4.5L7 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M1 7.5L7 10.5L13 7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M1 10.5L7 13.5L13 10.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  network:
    '<circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="2" r="1" fill="currentColor"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="2" cy="7" r="1" fill="currentColor"/><circle cx="12" cy="7" r="1" fill="currentColor"/><path d="M7 4V5M7 9V10M4 7H5M9 7H10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  watchlist:
    '<path d="M1.5 7C1.5 7 3.5 3 7 3C10.5 3 12.5 7 12.5 7C12.5 7 10.5 11 7 11C3.5 11 1.5 7 1.5 7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.8" fill="currentColor"/>',
  // Press Release — megaphone / announcement icon
  pressRelease:
    '<path d="M2.5 8.5V5.5H4.5L9.5 2.5V11.5L4.5 8.5H2.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M11 5C11.8 5.5 12.3 6.2 12.3 7S11.8 8.5 11 9" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M4.5 8.5V12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  // Data Explore — compass icon
  dataExplore:
    '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M9 5L7.8 8.2L4.5 9.5L5.7 6.3L9 5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="currentColor" fill-opacity="0.25"/>',
  // Intelligence Search — magnifying glass with a spark/crosshair inside
  intelligenceSearch:
    '<circle cx="5.5" cy="5.5" r="4" stroke="currentColor" stroke-width="1.3"/><path d="M8.5 8.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M3.5 5.5h4M5.5 3.5v4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  // Collaboration Playground — two overlapping circles with a shared center dot
  collaborationPlayground:
    '<circle cx="5" cy="5" r="3" stroke="currentColor" stroke-width="1.3"/><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="1.2" fill="currentColor"/>',
};

export const quickLinks: NavItem[] = [
  { label: 'About tMIC', href: '/about', icon: 'info' },
  { label: 'Explore MIC Picks', href: '#', icon: 'star', badge: 'Coming soon', badgeStyle: 'coming-soon' },
  { label: 'Subscribe Newsletters', href: '#', icon: 'mail' },
];

export const mainNav: NavItem[] = [
  { label: 'Company Profile', href: '/company-profile', icon: 'home' },
  {
    label: 'Watchlist',
    href: '/watchlist/627836',
    icon: 'watchlist',
    subItems: [
      { label: 'Watchlist1', href: '/watchlist/627836', watchlistId: '627836' },
      { label: 'Watchlist-TSM', href: '/watchlist/738291', watchlistId: '738291' },
      { label: 'Watchlist2', href: '/watchlist/394827', watchlistId: '394827' },
      { label: 'Create Watchlist', href: '#', dividerBefore: true, iconRight: 'add' },
    ],
  },
  { label: 'Market News', href: '/market-news', icon: 'news' },
  { label: 'Press Release', href: '#', icon: 'pressRelease' },
  { label: 'Earnings', href: '#', icon: 'earnings' },
  { label: 'Event Calendar', href: '/event-calendar', icon: 'calendar' },
  {
    label: 'Market Data',
    href: '#',
    icon: 'marketData',
    subItems: [{ label: 'Financial Data', href: '#' }],
  },
  { label: 'Data Explore', href: '/data-explore', icon: 'dataExplore' },
];

export const supplyChainNav: NavItem[] = [
  {
    label: 'RMAP',
    href: '/supply-chain-maps',
    icon: 'supplyMap',
    badge: 'NEW',
    badgeColor: '#BF3030',
    subItems: [
      { label: 'Supplier', href: '/supply-chain-maps/supplier' },
      { label: 'Customer', href: '/supply-chain-maps/customer' },
      { label: 'Competitor', href: '/supply-chain-maps/competitor' },
    ],
  },
  { label: 'My Ecosystems', href: '#', icon: 'layers' },
  { label: 'Network Views', href: '#', icon: 'network' },
];

export const bottomLinks: NavItem[] = [
  { label: 'Intelligence Search', href: '#', icon: 'intelligenceSearch' },
  { label: 'Collaboration Playground', href: '#', icon: 'collaborationPlayground' },
];

export const marketTabs = [
  'Earnings Calendar',
  'Bonds',
  'Commodities',
  'Countries',
  'Cryptocurrency',
  'Currencies',
  'Dividend Aristocrats',
  'Dividend Champions',
  'Dividends',
  'Emerging Markets',
  'ETF Strategies',
  'Global & Regional',
  'Growth vs. Value',
  'Key Market Data',
];
