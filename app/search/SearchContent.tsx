'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import SearchResultRow from '@/app/components/search/SearchResultRow';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { search, POPULAR_SEARCHES, type NormalizedSearchResult, type SearchResultType } from '@/app/lib/globalSearch';

const PAGE_SIZE = 12;
const DEBOUNCE_MS = 250;

const FILTER_TYPES: SearchResultType[] = ['all', 'company', 'event', 'news'];

const FILTER_LABELS: Record<SearchResultType, { zh: string; en: string }> = {
  all: { zh: '全部', en: 'All' },
  company: { zh: '公司', en: 'Company' },
  event: { zh: '活動', en: 'Event' },
  news: { zh: '新聞', en: 'News' },
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

  const [inputValue, setInputValue] = useState(urlQuery);
  const [activeType, setActiveType] = useState<SearchResultType>(
    FILTER_TYPES.includes(urlType) ? urlType : 'all',
  );
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [state, setState] = useState<SearchState>(urlQuery ? 'loading' : 'idle');
  const [results, setResults] = useState<NormalizedSearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<SearchResultType, number>>({ all: 0, company: 0, event: 0, news: 0 });

  // Keep the input in sync when the URL changes via back/forward navigation.
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);
  useEffect(() => {
    setActiveType(FILTER_TYPES.includes(urlType) ? urlType : 'all');
  }, [urlType]);

  // Stale-response protection: only the latest request may commit state.
  const requestIdRef = useRef(0);

  useEffect(() => {
    const q = urlQuery.trim();
    setVisibleCount(PAGE_SIZE);

    if (!q) {
      setState('idle');
      setResults([]);
      setTotal(0);
      setCounts({ all: 0, company: 0, event: 0, news: 0 });
      return;
    }

    const requestId = ++requestIdRef.current;
    setState('loading');

    search({ query: q, type: activeType })
      .then((res) => {
        if (requestIdRef.current !== requestId) return; // stale response, ignore
        setResults(res.results);
        setTotal(res.total);
        setCounts(res.counts);
        setState(res.total > 0 ? 'results' : 'no_results');
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setState('error');
      });
  }, [urlQuery, activeType]);

  const navigate = useCallback((q: string, type: SearchResultType) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (type !== 'all') params.set('type', type);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  }, [router]);

  // Debounced live update as the user edits the query directly on this page.
  useEffect(() => {
    const trimmed = inputValue.trim();
    if (trimmed === urlQuery.trim()) return;
    const timer = setTimeout(() => navigate(trimmed, activeType), DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    navigate(inputValue.trim(), activeType);
  }, [inputValue, activeType, navigate]);

  const handleTypeChange = useCallback((type: SearchResultType) => {
    setActiveType(type);
    navigate(urlQuery.trim(), type);
  }, [urlQuery, navigate]);

  const visibleResults = useMemo(() => results.slice(0, visibleCount), [results, visibleCount]);
  const canLoadMore = visibleCount < results.length;

  const labels = {
    heading: { zh: '搜尋', en: 'Search' },
    placeholder: { zh: '搜尋公司、活動或新聞…', en: 'Search companies, topics, or posts…' },
    resultsFor: { zh: '搜尋結果：', en: 'Search results for ' },
    results: { zh: '筆結果', en: 'results' },
    loadMore: { zh: '載入更多', en: 'Load more' },
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

                <div className="gsearch-filters" role="tablist">
                  {FILTER_TYPES.map((type) => (
                    <button
                      key={type}
                      role="tab"
                      aria-selected={activeType === type}
                      className={`search-tab gsearch-filter${activeType === type ? ' active' : ''}`}
                      onClick={() => handleTypeChange(type)}
                    >
                      {FILTER_LABELS[type][lang]} {counts[type]}
                    </button>
                  ))}
                </div>

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
                    <ul className="gsearch-list">
                      {visibleResults.map((result) => (
                        <li key={`${result.type}-${result.id}`}>
                          <SearchResultRow result={result} query={trimmedQuery} lang={lang} />
                        </li>
                      ))}
                    </ul>
                    {canLoadMore && (
                      <div className="gsearch-load-more-wrap">
                        <button className="cp-back-btn gsearch-load-more-btn" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                          {labels.loadMore[lang]}
                        </button>
                      </div>
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
