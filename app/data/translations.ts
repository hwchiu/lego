// Bilingual translations for site UI text

export const NAV_LABELS: Record<string, { zh: string; en: string }> = {
  // Quick links
  'About tMIC': { zh: '關於 tMIC', en: 'About tMIC' },
  'Explore MIC Picks': { zh: '探索精選', en: 'Explore MIC Picks' },
  'Subscribe Newsletters': { zh: '訂閱電子報', en: 'Subscribe Newsletters' },

  // Main nav
  'Company Profile': { zh: '公司分析', en: 'Company Profile' },
  Watchlist: { zh: '自選清單', en: 'Watchlist' },
  'Market News': { zh: '市場新聞', en: 'Market News' },
  'Press Release': { zh: '新聞稿', en: 'Press Release' },
  Earnings: { zh: '財報', en: 'Earnings' },
  'Event Calendar': { zh: '活動行事曆', en: 'Event Calendar' },
  'Market Data': { zh: '市場數據', en: 'Market Data' },
  'Data Explore': { zh: '數據探索', en: 'Data Explore' },

  // Sub-items
  'M&A': { zh: '企業併購', en: 'M&A' },
  'Financial Data': { zh: '財務數據', en: 'Financial Data' },
  Watchlist1: { zh: '自選清單 1', en: 'Watchlist 1' },
  'Watchlist-TC': { zh: 'TSMC清單', en: 'Watchlist-TC' },
  Watchlist2: { zh: '自選清單 2', en: 'Watchlist 2' },
  'Create Watchlist': { zh: '建立清單', en: 'Create Watchlist' },

  // Supply chain nav
  RMAP: { zh: '供應鏈圖譜', en: 'RMAP' },
  'My Ecosystems': { zh: '我的生態系', en: 'My Ecosystems' },
  'Network Views': { zh: '網絡視圖', en: 'Network Views' },
  Supplier: { zh: '供應商', en: 'Supplier' },
  Customer: { zh: '客戶', en: 'Customer' },
  Competitor: { zh: '競爭對手', en: 'Competitor' },

  // Bottom links
  'Intelligence Search': { zh: '智能搜尋', en: 'Intelligence Search' },
  'Collaboration Playground': { zh: '協作空間', en: 'Collaboration Playground' },
  'User Manual': { zh: '使用手冊', en: 'User Manual' },
};

export function t(key: string, lang: 'zh' | 'en'): string {
  const entry = NAV_LABELS[key];
  if (!entry) return key;
  return entry[lang];
}
