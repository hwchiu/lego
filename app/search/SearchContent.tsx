'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import SearchResultRow from '@/app/components/search/SearchResultRow';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { search, POPULAR_SEARCHES, SEARCH_DATA_EXPLORE_CATEGORIES, type NormalizedSearchResult, type SearchResultType } from '@/app/lib/globalSearch';
import { PROFILE_TABS, filterResultsByPeriod, paginateResults, type SearchTimePeriod } from '@/app/lib/searchRanking';
import { CATEGORIES } from '@/app/data/dataExplore';
import { getPaginationRange } from '@/app/lib/paginationUtils';

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 250;

const FILTER_TYPES: SearchResultType[] = [
  'all',
  'company',
  'event',
  'news',
  'analyst-report',
  'ai-news',
  ...PROFILE_TABS.map(([type]) => type),
  'data-explore',
];
const TIME_PERIODS: SearchTimePeriod[] = ['all', 'day', 'week', 'month', 'year'];

const FILTER_LABELS: Record<SearchResultType, { zh: string; en: string }> = {
  all: { zh: '全部', en: 'All' },
  company: { zh: '公司', en: 'Company' },
  event: { zh: '活動', en: 'Event' },
  news: { zh: '新聞', en: 'News' },
  'analyst-report': { zh: '分析師報告', en: 'Analyst Report' },
  'ai-news': { zh: 'AI 新聞', en: 'AI News' },
  'fin-summary': { zh: '財務摘要', en: 'FIN. Summary' },
  'fin-statement': { zh: '財務報表', en: 'FIN. Statement' },
  'ir-transcript': { zh: 'IR 逐字稿', en: 'IR Transcript' },
  'ai-transcript': { zh: 'AI 逐字稿', en: 'AI Transcript' },
  'pre-earning-call': { zh: '法說會預覽', en: 'Pre-Earning Call' },
  'ir-material': { zh: 'IR 資料', en: 'IR Material' },
  investment: { zh: '投資', en: 'Investment' },
  acquisition: { zh: '併購', en: 'Acquisition' },
  funding: { zh: '募資', en: 'Funding' },
  'data-explore': { zh: '資料探索', en: 'Data Explore' },
};

const TIME_PERIOD_LABELS: Record<SearchTimePeriod, { zh: string; en: string }> = {
  all: { zh: '不限時間', en: 'Any time' },
  day: { zh: '最近 24 小時', en: 'Past 24 hours' },
  week: { zh: '最近一週', en: 'Past week' },
  month: { zh: '最近一個月', en: 'Past month' },
  year: { zh: '最近一年', en: 'Past year' },
};

type SearchState = 'idle' | 'loading' | 'results' | 'no_results' | 'error';

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const urlQuery = searchParams.get('q') ?? '';
  const urlType = (searchParams.get('type') as SearchResultType | null) ?? 'all';
  const requestedPeriod = searchParams.get('period') as SearchTimePeriod | null;
  const urlPeriod = requestedPeriod && TIME_PERIODS.includes(requestedPeriod) ? requestedPeriod : 'all';
  const requestedCategory = searchParams.get('category') ?? '';
  const urlCategory = SEARCH_DATA_EXPLORE_CATEGORIES.some((slug) => slug === requestedCategory) ? requestedCategory : '';

  const [inputValue, setInputValue] = useState(urlQuery);
  const [activeType, setActiveType] = useState<SearchResultType>(
    FILTER_TYPES.includes(urlType) ? urlType : 'all',
  );
  const [activePeriod, setActivePeriod] = useState<SearchTimePeriod>(urlPeriod);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [page, setPage] = useState(0);
  const [state, setState] = useState<SearchState>(urlQuery ? 'loading' : 'idle');
  const [results, setResults] = useState<NormalizedSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Keep the input in sync when the URL changes via back/forward navigation.
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);
  useEffect(() => {
    setActiveType(FILTER_TYPES.includes(urlType) ? urlType : 'all');
  }, [urlType]);
  useEffect(() => {
    setActivePeriod(urlPeriod);
  }, [urlPeriod]);
  useEffect(() => {
    setActiveCategory(urlCategory);
  }, [urlCategory]);
  useEffect(() => {
    tabsRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeType]);

  // Stale-response protection: only the latest request may commit state.
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = urlQuery.trim();
    setPage(0);

    if (!q) {
      ++requestIdRef.current;
      setState('idle');
      setResults([]);
      setTotal(0);
      return;
    }

    const requestId = ++requestIdRef.current;
    setState('loading');

    search({ query: q, type: activeType })
      .then((res) => {
        if (requestIdRef.current !== requestId) return; // stale response, ignore
        const filteredResults = filterResultsByPeriod(res.results, activePeriod)
          .filter((result) => activeType !== 'data-explore' || !activeCategory ||
            result.url === `/data-explore/${activeCategory}/`);
        setResults(filteredResults);
        setTotal(filteredResults.length);
        setState(filteredResults.length > 0 ? 'results' : 'no_results');
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setState('error');
      });
  }, [urlQuery, activeType, activePeriod, activeCategory]);

  const navigate = useCallback((q: string, type: SearchResultType, period: SearchTimePeriod, category = activeCategory) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type !== 'all') params.set('type', type);
    if (period !== 'all') params.set('period', period);
    if (type === 'data-explore' && category) params.set('category', category);
    router.push(`/search/${params.toString() ? `?${params.toString()}` : ''}`);
  }, [router, activeCategory]);

  // Debounced live update as the user edits the query directly on this page.
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed === urlQuery.trim()) return;
    const timer = setTimeout(() => navigate(trimmed, activeType, activePeriod), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue, urlQuery, activeType, activePeriod, navigate]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputValue.trim(), activeType, activePeriod);
  }, [inputValue, activeType, activePeriod, navigate]);

  const handleTypeChange = useCallback((type: SearchResultType) => {
    setActiveType(type);
    navigate(urlQuery.trim(), type, activePeriod, '');
  }, [urlQuery, activePeriod, navigate]);

  const handlePeriodChange = useCallback((period: SearchTimePeriod) => {
    setActivePeriod(period);
    navigate(urlQuery.trim(), activeType, period);
  }, [urlQuery, activeType, navigate]);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    navigate(urlQuery.trim(), activeType, activePeriod, category);
  }, [urlQuery, activeType, activePeriod, navigate]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const visibleResults = useMemo(() => paginateResults(results, page, PAGE_SIZE), [results, page]);

  const labels = {
    heading: { zh: '搜尋', en: 'Search' },
    placeholder: { zh: '搜尋公司、活動或新聞…', en: 'Search companies, topics, or posts…' },
    periodLabel: { zh: '篩選搜尋時間', en: 'Filter search by time' },
    resultsFor: { zh: '搜尋結果：', en: 'Search results for ' },
    results: { zh: '筆結果', en: 'results' },
    previous: { zh: '‹ 上一頁', en: '‹ Prev' },
    next: { zh: '下一頁 ›', en: 'Next ›' },
    noResultsTitle: { zh: '找不到', en: 'No results for ' },
    noResultsHint: { zh: '請嘗試其他關鍵字，或探索熱門主題。', en: 'Try another keyword or explore popular topics.' },
    discoverTitle: { zh: '搜尋 LEGO', en: 'Search LEGO' },
    discoverHint: { zh: '搜尋全站的公司、活動與新聞內容。', en: 'Find companies, topics and posts across the site.' },
    popular: { zh: '熱門搜尋', en: 'Popular topics' },
  };

  const trimmedQuery = urlQuery.trim();

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="page-pad gsearch-page" role="search">
            <h1 className="gsearch-heading">{labels.heading[lang]}</h1>

            <form className="gsearch-input-wrap" onSubmit={handleSubmit}>
              <div className="gsearch-query-control">
                <svg className="gsearch-input-icon" width="18" height="18" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                  <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <label htmlFor="gsearch-input" className="sr-only">
                  {labels.placeholder[lang]}
                </label>
                <input
                  id="gsearch-input"
                  className="gsearch-input"
                  type="text"
                  placeholder={labels.placeholder[lang]}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
                {inputValue && (
                  <button
                    type="button"
                    className="gsearch-input-clear"
                    aria-label={lang === 'zh' ? '清除搜尋字詞' : 'Clear search'}
                    onClick={() => setInputValue('')}
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
              <label htmlFor="gsearch-period" className="sr-only">
                {labels.periodLabel[lang]}
              </label>
              <select
                id="gsearch-period"
                className="gsearch-period"
                value={activePeriod}
                onChange={(event) => handlePeriodChange(event.target.value as SearchTimePeriod)}
              >
                {TIME_PERIODS.map((period) => (
                  <option key={period} value={period}>{TIME_PERIOD_LABELS[period][lang]}</option>
                ))}
              </select>
            </form>

            {trimmedQuery ? (
              <>
                <p className="gsearch-summary" aria-live="polite">
                  {labels.resultsFor[lang]}<span className="gsearch-summary-query">&ldquo;{trimmedQuery}&rdquo;</span>
                  {state === 'results' && (
                    <span className="gsearch-summary-count">
                      {total.toLocaleString()} {labels.results[lang]}
                    </span>
                  )}
                </p>

                <div className="gsearch-filters" ref={tabsRef} role="tablist" aria-label={lang === 'zh' ? '搜尋類別，可水平捲動' : 'Search categories, scroll horizontally'}>
                  {FILTER_TYPES.map((type) => (
                    <button
                      key={type}
                      role="tab"
                      aria-selected={activeType === type}
                      className={`search-tab gsearch-filter${activeType === type ? ' active' : ''}`}
                      onClick={() => handleTypeChange(type)}
                    >
                      {FILTER_LABELS[type][lang]}
                    </button>
                  ))}
                </div>
                {activeType === 'data-explore' && (
                <div className="gsearch-categories" role="group" aria-label={lang === 'zh' ? '資料探索分類' : 'Data Explore categories'}>
                  <button type="button" className={`search-category-btn${!activeCategory ? ' active' : ''}`} aria-pressed={!activeCategory} onClick={() => handleCategoryChange('')}>
                    {lang === 'zh' ? '全部分類' : 'All categories'}
                  </button>
                  {CATEGORIES.filter(({ slug }) => SEARCH_DATA_EXPLORE_CATEGORIES.some((enabled) => enabled === slug)).map((category) => (
                    <button key={category.slug} type="button" className={`search-category-btn${activeCategory === category.slug ? ' active' : ''}`} aria-pressed={activeCategory === category.slug} onClick={() => handleCategoryChange(category.slug)}>
                      {category.label}
                    </button>
                  ))}
                </div>
                )}

                {state === 'loading' && (
                  <div className="gsearch-status" role="status">
                    {lang === 'zh' ? '搜尋中…' : 'Searching…'}
                  </div>
                )}

                {state === 'error' && (
                  <div className="gsearch-status" role="alert">
                    {lang === 'zh' ? '搜尋發生錯誤，請稍後再試。' : 'Something went wrong. Please try again.'}
                  </div>
                )}

                {state === 'no_results' && (
                  <div className="gsearch-empty">
                    <div className="gsearch-empty-title">
                      {labels.noResultsTitle[lang]}<span className="gsearch-summary-query">&ldquo;{trimmedQuery}&rdquo;</span>
                    </div>
                    <p className="gsearch-empty-hint">{labels.noResultsHint[lang]}</p>
                    <PopularTopics lang={lang} label={labels.popular[lang]} />
                  </div>
                )}

                {state === 'results' && (
                  <>
                    {activeType === 'data-explore' && !activeCategory ? (
                      CATEGORIES.filter(({ slug }) => SEARCH_DATA_EXPLORE_CATEGORIES.some((enabled) => enabled === slug)).map((category) => {
                        const items = visibleResults.filter((result) => result.url === `/data-explore/${category.slug}/`);
                        return items.length > 0 && (
                          <section key={category.slug} className="gsearch-category-section">
                            <h2 className="gsearch-category-heading">{category.label}</h2>
                            <ul className="gsearch-list">
                              {items.map((result) => <li key={result.id}><SearchResultRow result={result} query={trimmedQuery} lang={lang} /></li>)}
                            </ul>
                          </section>
                        );
                      })
                    ) : (
                      <ul className="gsearch-list">
                        {visibleResults.map((result) => (
                          <li key={`${result.type}-${result.id}`}>
                            <SearchResultRow result={result} query={trimmedQuery} lang={lang} />
                          </li>
                        ))}
                      </ul>
                    )}
                    {totalPages > 1 && (
                      <nav className="cp-news-tab-pagination" aria-label={lang === 'zh' ? '搜尋結果分頁' : 'Search result pages'}>
                        <button
                          type="button"
                          className="cp-news-tab-page-btn"
                          onClick={() => setPage((current) => Math.max(0, current - 1))}
                          disabled={page === 0}
                        >
                          {labels.previous[lang]}
                        </button>
                        {getPaginationRange(page, totalPages).map((item) =>
                          typeof item === 'string' ? (
                            <span key={item} className="cp-news-tab-page-ellipsis">…</span>
                          ) : (
                            <button
                              key={item}
                              type="button"
                              className={`cp-news-tab-page-btn${page === item ? ' active' : ''}`}
                              onClick={() => setPage(item)}
                              aria-label={`${lang === 'zh' ? '第' : 'Page'} ${item + 1}${lang === 'zh' ? '頁' : ''}`}
                              aria-current={page === item ? 'page' : undefined}
                            >
                              {item + 1}
                            </button>
                          ),
                        )}
                        <button
                          type="button"
                          className="cp-news-tab-page-btn"
                          onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                          disabled={page >= totalPages - 1}
                        >
                          {labels.next[lang]}
                        </button>
                      </nav>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="gsearch-discover">
                <h2 className="gsearch-discover-title">{labels.discoverTitle[lang]}</h2>
                <p className="gsearch-discover-hint">{labels.discoverHint[lang]}</p>
                <PopularTopics lang={lang} label={labels.popular[lang]} />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function PopularTopics({ lang, label }: { lang: 'zh' | 'en'; label: string }) {
  const router = useRouter();
  return (
    <div className="gsearch-popular">
      <div className="gsearch-popular-label">{label}</div>
      <div className="gsearch-popular-chips">
        {POPULAR_SEARCHES.map((topic) => (
          <button
            key={topic}
            className="search-category-btn"
            onClick={() => router.push(`/search?q=${encodeURIComponent(topic)}`)}
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  );
}
