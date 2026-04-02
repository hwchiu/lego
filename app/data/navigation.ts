export interface NavItem {
  label: string;
  href: string;
  icon: string; // SVG path data identifier — rendered by component
  active?: boolean;
  badge?: string;
  subItems?: SubNavItem[];
}

export interface SubNavItem {
  label: string;
  href: string;
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
  stockAnalysis:
    '<path d="M1 10L4.5 6L7 8L10 3.5L13 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  news:
    '<rect x="2" y="1.5" width="10" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  marketData:
    '<path d="M2 11H4V7H2V11ZM5.5 11H7.5V4H5.5V11ZM9 11H11V8H9V11Z" fill="currentColor"/>',
  calendar:
    '<rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3"/><path d="M1 6H13M4.5 1V4M9.5 1V4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  sectors:
    '<rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="7.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="1" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.3"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" stroke-width="1.3"/>',
  dividends:
    '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 3.5v1M7 9.5v1M5.2 6.8c0-.9.8-1.6 1.8-1.6s1.8.7 1.8 1.6-.8 1.6-1.8 1.6-1.8.7-1.8 1.6.8 1.6 1.8 1.6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  earnings:
    '<path d="M1 9L4.5 5L7.5 7.5L13 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 2H13V5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>',
  esg:
    '<path d="M7 13C7 13 2.5 10 2.5 6.2 2.5 3.5 4.5 1.5 7 1.5s4.5 2 4.5 4.7C11.5 10 7 13 7 13z" stroke="currentColor" stroke-width="1.3"/><path d="M7 12V7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  slider:
    '<path d="M1 5h12M1 9h12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="4" cy="5" r="1.5" fill="currentColor"/><circle cx="10" cy="9" r="1.5" fill="currentColor"/>',
  threat:
    '<path d="M7 1L2 3.5V7c0 3 2.5 5.3 5 6 2.5-.7 5-3 5-6V3.5L7 1Z" stroke="currentColor" stroke-width="1.3"/><path d="M7 5V8M7 9.5v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  target:
    '<circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="7" r="2.5" stroke="currentColor" stroke-width="1.3"/><path d="M7 1V3M7 11V13M1 7H3M11 7H13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  supplyMap:
    '<circle cx="7" cy="7" r="1.5" fill="currentColor"/><circle cx="2" cy="3" r="1.5" fill="currentColor"/><circle cx="12" cy="3" r="1.5" fill="currentColor"/><circle cx="2" cy="11" r="1.5" fill="currentColor"/><circle cx="12" cy="11" r="1.5" fill="currentColor"/><path d="M3 3.5L5.5 6M11 3.5L8.5 6M3 10.5L5.5 8M11 10.5L8.5 8" stroke="currentColor" stroke-width="1.2"/>',
  layers:
    '<path d="M7 1.5L1 4.5L7 7.5L13 4.5L7 1.5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M1 7.5L7 10.5L13 7.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M1 10.5L7 13.5L13 10.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>',
  network:
    '<circle cx="7" cy="7" r="2" stroke="currentColor" stroke-width="1.3"/><circle cx="7" cy="2" r="1" fill="currentColor"/><circle cx="7" cy="12" r="1" fill="currentColor"/><circle cx="2" cy="7" r="1" fill="currentColor"/><circle cx="12" cy="7" r="1" fill="currentColor"/><path d="M7 4V5M7 9V10M4 7H5M9 7H10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>',
  search:
    '<circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M9.5 9.5L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  filter:
    '<path d="M1.5 2H12.5L8.5 7V12.5L5.5 11V7L1.5 2Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>',
};

export const quickLinks: NavItem[] = [
  { label: 'About tMIC', href: '#', icon: 'info' },
  { label: 'Explore MIC Picks', href: '#', icon: 'star' },
  { label: 'Summary Report', href: '#', icon: 'report', badge: 'NEW' },
  { label: 'Subscribe Newsletters', href: '#', icon: 'mail' },
];

export const mainNav: NavItem[] = [
  { label: 'Home', href: '#', icon: 'home' },
  { label: 'Stock Analysis', href: '#', icon: 'stockAnalysis' },
  { label: 'Market News', href: '/market-news', icon: 'news', subItems: [
    { label: 'Top Market News', href: '/market-news' },
    { label: 'AI News', href: '/market-news/ai-news' },
    { label: 'News Watchlist', href: '/market-news/watchlist' },
  ] },
  { label: 'Market Data', href: '#', icon: 'marketData' },
  { label: 'Event Calendar', href: '/event-calendar', icon: 'calendar' },
  { label: 'Sectors', href: '#', icon: 'sectors' },
  { label: 'Dividends', href: '#', icon: 'dividends' },
  { label: 'Earnings', href: '#', icon: 'earnings' },
  { label: 'ESG', href: '#', icon: 'esg' },
  { label: 'Slider', href: '#', icon: 'slider' },
  { label: 'Threat Intelligence', href: '#', icon: 'threat' },
];

export const targetCompanyNav: NavItem[] = [
  { label: 'Explore Target Company Groups', href: '#', icon: 'target' },
];

export const supplyChainNav: NavItem[] = [
  { label: 'Supply Chain Maps', href: '#', icon: 'supplyMap' },
  { label: 'My Ecosystems', href: '#', icon: 'layers' },
  { label: 'Network Views', href: '#', icon: 'network' },
  { label: 'About Supply Chain Ecosystems', href: '#', icon: 'info' },
];

export const bottomLinks: NavItem[] = [
  { label: 'FIND & COMPARE', href: '#', icon: 'search' },
  { label: 'Stock Screener', href: '#', icon: 'filter' },
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
