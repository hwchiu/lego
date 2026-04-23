'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { COMPANY_MASTER_LIST, getCompanyByCode } from '@/app/data/companyMaster';
import { newsItems } from '@/app/data/news';
import NewsCard from '@/app/components/news/NewsCard';

// ── Feature flags — set to true to re-enable features in the next phase ──────
const FEATURE_ADD_FILE = false;
const FEATURE_SCENARIOS = false;

// Scenario suggestion buttons (hidden until next phase)
const SCENARIOS = ['Create Report', 'Boost my day', 'Help me learn', "Let's stay current", 'Write anything'] as const;

// Tools dropdown items — only AI Summary visible; others kept for future phases
const TOOLS = [
  { key: 'ai-summary', label: 'AI Summary', comingSoon: true },
];

// User display name (matches TopNav)
const USER_NAME = 'PiKa';

// Flat minimalist black SVG icons for scenario buttons
function ScenarioIconCreateReport() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 5h5M4 7.5h5M4 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ScenarioIconBoostMyDay() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M8.5 1.5L3.5 8h5L5.5 12.5l5-6.5H6.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ScenarioIconHelpMeLearn() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 2.5L1 5.5L7 8.5L13 5.5L7 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M3.5 7v3c0 0 1.5 1.5 3.5 1.5S10.5 10 10.5 10V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScenarioIconStayCurrent() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3.5 5.5h5M3.5 7.5h5M3.5 9.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11.5 1.5v4M9.5 3.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ScenarioIconWriteAnything() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M9.5 2L12 4.5L5 11.5H2.5V9L9.5 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M8 3.5L10.5 6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

const SCENARIO_ICONS: Record<(typeof SCENARIOS)[number], React.ReactNode> = {
  'Create Report': <ScenarioIconCreateReport />,
  'Boost my day': <ScenarioIconBoostMyDay />,
  'Help me learn': <ScenarioIconHelpMeLearn />,
  "Let's stay current": <ScenarioIconStayCurrent />,
  'Write anything': <ScenarioIconWriteAnything />,
};

interface CompanyProfileLandingProps {
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
}

function AiSummaryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function DeepResearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 10L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4.5 6.5h4M6.5 4.5v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function GuidedLearningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2L1 5.5L8 9L15 5.5L8 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M4 7.5V11c0 0 2 2 4 2s4-2 4-2V7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AddFileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 4v10M4 9h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="6.5" y="1.5" width="5" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 9.5a5.5 5.5 0 0 0 11 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9 15v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3 5L7 9L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaperAirplaneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      {/* Side-profile paper airplane: pointed tail left, nose right, symmetric wings, fold crease */}
      <path d="M1 9L6 3L16 9L9 9L6 15Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M1 9L9 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function CompanyProfileLanding({ favorites, onToggleFavorite }: CompanyProfileLandingProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const toolsBtnRef = useRef<HTMLButtonElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // Latest 6 news items sorted by time descending
  const latestNews = useMemo(
    () => [...newsItems].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()).slice(0, 6),
    [],
  );

  // Filter SP500 companies by query
  const filteredCompanies =
    query.trim().length > 0
      ? COMPANY_MASTER_LIST.filter(
          (c) =>
            c.symbol.toLowerCase().includes(query.toLowerCase()) ||
            c.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 8)
      : [];

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close tools menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        toolsBtnRef.current &&
        !toolsBtnRef.current.contains(e.target as Node) &&
        toolsMenuRef.current &&
        !toolsMenuRef.current.contains(e.target as Node)
      ) {
        setShowTools(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelectCompany(symbol: string) {
    setShowDropdown(false);
    router.push(`/company-profile/${symbol}`);
  }

  function handleSubmit() {
    const trimmed = query.trim();
    if (!trimmed) return;
    // If query matches a known symbol, navigate directly
    const exactMatch = COMPANY_MASTER_LIST.find(
      (c) => c.symbol.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exactMatch) {
      handleSelectCompany(exactMatch.symbol);
      return;
    }
    // Otherwise navigate to first filtered result if any
    if (filteredCompanies.length > 0) {
      handleSelectCompany(filteredCompanies[0].symbol);
    }
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="cp-landing">
            {/* ── Gemini-style greeting + search area ── */}
            <div className="cp-landing-hero">
              <p className="cp-greeting">
                Good day, <span className="cp-greeting-name">{USER_NAME}</span>
              </p>
              <h1 className="cp-hero-title">Where should we start?</h1>

              {/* Search input box */}
              <div className="cp-search-outer" ref={inputWrapRef}>
                <div className="cp-search-box">
                  <textarea
                    className="cp-search-input"
                    placeholder="Search a company, ticker (or ask a question... Coming soon)"
                    value={query}
                    rows={1}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setShowDropdown(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => {
                      if (query.trim().length > 0) setShowDropdown(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />

                  {/* Bottom toolbar */}
                  <div className="cp-search-toolbar">
                    <div className="cp-search-toolbar-left">
                      {/* Add file button — hidden until next phase (FEATURE_ADD_FILE) */}
                      {FEATURE_ADD_FILE && (
                        <button className="cp-toolbar-btn" title="Add file" aria-label="Add file">
                          <AddFileIcon />
                        </button>
                      )}

                      {/* Tools dropdown */}
                      <div className="cp-tools-wrap">
                        <button
                          ref={toolsBtnRef}
                          className={`cp-toolbar-btn cp-tools-btn${showTools ? ' active' : ''}`}
                          onClick={() => setShowTools(!showTools)}
                          aria-haspopup="true"
                          aria-expanded={showTools}
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          <span>Tools</span>
                          <ChevronDownIcon />
                        </button>
                        {showTools && (
                          <div ref={toolsMenuRef} className="cp-tools-menu">
                            {TOOLS.map((tool) => (
                              <button
                                key={tool.key}
                                className="cp-tool-item"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  // no action — coming soon
                                }}
                              >
                                <span className="cp-tool-icon">
                                  {tool.key === 'ai-summary' && <AiSummaryIcon />}
                                </span>
                                <span className="cp-tool-label">{tool.label}</span>
                                {tool.comingSoon && (
                                  <span className="cp-tool-badge">Coming soon</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit button (paper airplane) — replaces voice input */}
                    <button
                      className="cp-toolbar-btn cp-submit-btn"
                      title="Submit"
                      aria-label="Submit"
                      onClick={handleSubmit}
                    >
                      <PaperAirplaneIcon />
                    </button>
                  </div>
                </div>

                {/* Search results dropdown */}
                {showDropdown && filteredCompanies.length > 0 && (
                  <div className="cp-search-dropdown">
                    {filteredCompanies.map((company) => (
                      <button
                        key={company.symbol}
                        className="cp-search-result-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCompany(company.symbol);
                        }}
                      >
                        <span className="cp-result-symbol">{company.symbol}</span>
                        <span className="cp-result-name">{company.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Scenario buttons — hidden until next phase (FEATURE_SCENARIOS) */}
              {FEATURE_SCENARIOS && (
                <div className="cp-scenarios">
                  {SCENARIOS.map((s) => (
                    <button key={s} className="cp-scenario-btn">
                      <span className="cp-scenario-icon">{SCENARIO_ICONS[s]}</span>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Favorites section ── */}
            {favorites.length > 0 && (
              <div className="cp-favorites-section">
                <div className="cp-favorites-header">
                  <svg viewBox="0 0 14 14" width="13" height="13" fill="none" aria-hidden="true">
                    <path
                      d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
                      fill="#f59e0b"
                      stroke="#f59e0b"
                      strokeWidth="1.1"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="cp-favorites-title">Favorites</span>
                  <span className="cp-favorites-count">{favorites.length}</span>
                </div>
                <div className="cp-favorites-tags">
                  {favorites.map((sym) => {
                    const co = getCompanyByCode(sym);
                    return (
                      <div key={sym} className="cp-favorites-tag-wrap">
                        <Link href={`/company-profile/${sym}`} className="cp-favorites-tag">
                          <span className="cp-favorites-tag-symbol">{sym}</span>
                          {co && <span className="cp-favorites-tag-name">{co.CO_SHORT_NAME}</span>}
                        </Link>
                        <button
                          className="cp-favorites-tag-remove"
                          onClick={(e) => { e.preventDefault(); onToggleFavorite(sym); }}
                          aria-label={`Remove ${sym} from favorites`}
                          title="Remove from favorites"
                        >
                          <svg viewBox="0 0 12 12" fill="none" width="10" height="10" aria-hidden="true">
                            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Latest News section ── */}
            <div className="cp-news-section">
              <div className="cp-news-section-header">
                <span className="section-eyebrow">Latest News</span>
              </div>
              <div className="cp-news-grid">
                {latestNews.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
