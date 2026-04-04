'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { SP500_COMPANIES } from '@/app/data/sp500';
import { useWatchlist } from '@/app/contexts/WatchlistContext';

// ── AI Suggestion data ────────────────────────────────────────────────────────
// Sourced from content/watchlist-suggestions.md

interface SuggestionItem {
  id: string;
  label: string;
  type: 'event' | 'topic';
  symbols: string[];
}

const AI_SUGGESTIONS: SuggestionItem[] = [
  {
    id: 'event-us-iran',
    label: 'US-Iran Conflict',
    type: 'event',
    symbols: ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'XOM', 'CVX', 'COP', 'OXY', 'MPC'],
  },
  {
    id: 'event-claude-leak',
    label: 'Anthropic Claude Code Leak',
    type: 'event',
    symbols: ['GOOGL', 'AMZN', 'MSFT', 'NVDA', 'CRWD', 'PANW', 'ZS', 'OKTA', 'S', 'PLTR'],
  },
  {
    id: 'event-taiwan-us-trade',
    label: 'Taiwan-US Trade Agreement (15% Tariff)',
    type: 'event',
    symbols: ['TSM', 'AAPL', 'QCOM', 'AVGO', 'AMAT', 'LRCX', 'INTC', 'TXN', 'MU', 'KLAC'],
  },
  {
    id: 'topic-next-gen-ai',
    label: 'Next-gen AI',
    type: 'topic',
    symbols: ['NVDA', 'MSFT', 'GOOGL', 'META', 'AMZN', 'AAPL', 'AMD', 'QCOM', 'ARM', 'SMCI'],
  },
  {
    id: 'topic-semiconductors',
    label: 'Semiconductors',
    type: 'topic',
    symbols: ['NVDA', 'TSM', 'INTC', 'AMD', 'QCOM', 'ASML', 'AMAT', 'LRCX', 'KLAC', 'MU', 'AVGO', 'TXN'],
  },
  {
    id: 'topic-3d-fabric',
    label: '3D Fabric',
    type: 'topic',
    symbols: ['TSM', 'NVDA', 'AMD', 'INTC', 'MU', 'AMKR', 'ASX', 'SMCI', 'AMAT', 'ENTG'],
  },
  {
    id: 'topic-reciprocal-tariff',
    label: 'US Reciprocal Tariff Policy',
    type: 'topic',
    symbols: ['AAPL', 'MSFT', 'AMZN', 'TSLA', 'NKE', 'WMT', 'COST', 'TGT', 'TSM', 'QCOM'],
  },
];

const EVENT_SUGGESTIONS = AI_SUGGESTIONS.filter((s) => s.type === 'event');
const TOPIC_SUGGESTIONS = AI_SUGGESTIONS.filter((s) => s.type === 'topic');

// Symbol lookup map for quick name resolution
const SYMBOL_LOOKUP = new Map(SP500_COMPANIES.map((c) => [c.symbol, c.name]));

// ── Symbol list item ──────────────────────────────────────────────────────────

interface SymbolItemProps {
  symbol: string;
  index: number;
  onDelete: (sym: string) => void;
  onDragStart: (idx: number) => void;
  onDragEnter: (idx: number) => void;
  onDragEnd: () => void;
}

function SymbolItem({ symbol, index, onDelete, onDragStart, onDragEnter, onDragEnd }: SymbolItemProps) {
  const name = SYMBOL_LOOKUP.get(symbol) ?? '';
  return (
    <div
      className="cwl-symbol-item"
      draggable
      onDragStart={() => onDragStart(index)}
      onDragEnter={() => onDragEnter(index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <svg className="cwl-drag-handle" viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
        <path d="M3 4h8M3 7h8M3 10h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span className="cwl-symbol-badge">{symbol}</span>
      {name && <span className="cwl-symbol-name">{name}</span>}
      <span className="cwl-symbol-rank">#{index + 1}</span>
      <button
        className="cwl-symbol-delete"
        onClick={() => onDelete(symbol)}
        aria-label={`Remove ${symbol}`}
        title={`Remove ${symbol}`}
      >
        <svg viewBox="0 0 14 14" fill="none" width="12" height="12" aria-hidden="true">
          <path
            d="M2.5 4h9M5.5 4V2.5h3V4M5.5 6.5v4M8.5 6.5v4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="3" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CreateWatchlistContent() {
  const router = useRouter();
  const { addWatchlist } = useWatchlist();

  // Search bar state
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Watchlist config state
  const [watchlistName, setWatchlistName] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [addSymbolInput, setAddSymbolInput] = useState('');
  const [addSuggestions, setAddSuggestions] = useState<{ symbol: string; name: string }[]>([]);

  // Drag state
  const dragIdx = useRef<number | null>(null);

  // Pending navigation: set after a successful addWatchlist so the redirect
  // fires inside a useEffect (after React has committed the new context state)
  const [pendingNavId, setPendingNavId] = useState<string | null>(null);

  // Redirect to the newly created watchlist once React state is committed
  useEffect(() => {
    if (pendingNavId) {
      const id = pendingNavId;
      setPendingNavId(null); // reset so a future creation always re-triggers this effect
      router.push(`/watchlist/${id}`);
    }
  }, [pendingNavId, router]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter suggestions by query
  const queryLower = query.toLowerCase().trim();
  const filteredEvents = queryLower
    ? EVENT_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(queryLower))
    : EVENT_SUGGESTIONS;
  const filteredTopics = queryLower
    ? TOPIC_SUGGESTIONS.filter((s) => s.label.toLowerCase().includes(queryLower))
    : TOPIC_SUGGESTIONS;

  // Handle suggestion selection
  function handleSelectSuggestion(item: SuggestionItem) {
    setQuery(item.label);
    setShowDropdown(false);
    // Pre-populate symbols (deduplicate)
    setSymbols((prev) => {
      const existing = new Set(prev);
      const toAdd = item.symbols.filter((s) => !existing.has(s));
      return [...prev, ...toAdd];
    });
    // Auto-fill watchlist name if empty
    setWatchlistName((prev) => (prev.trim() ? prev : item.label));
  }

  // Add symbol from text input
  const handleAddSymbol = useCallback(() => {
    const parts = addSymbolInput
      .toUpperCase()
      .split(/[,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    setSymbols((prev) => {
      const existing = new Set(prev);
      const toAdd = parts.filter((s) => !existing.has(s));
      return [...prev, ...toAdd];
    });
    setAddSymbolInput('');
    setAddSuggestions([]);
  }, [addSymbolInput]);

  // Symbol input autocomplete
  useEffect(() => {
    const q = addSymbolInput.toUpperCase().trim();
    if (!q) {
      setAddSuggestions([]);
      return;
    }
    const matches = SP500_COMPANIES.filter(
      (c) => c.symbol.startsWith(q) || c.name.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 5);
    setAddSuggestions(matches);
  }, [addSymbolInput]);

  // Drag-to-reorder handlers
  function handleDragStart(idx: number) {
    dragIdx.current = idx;
  }
  function handleDragEnter(idx: number) {
    if (dragIdx.current === null || dragIdx.current === idx) return;
    setSymbols((prev) => {
      const next = [...prev];
      const [item] = next.splice(dragIdx.current!, 1);
      next.splice(idx, 0, item);
      dragIdx.current = idx;
      return next;
    });
  }
  function handleDragEnd() {
    dragIdx.current = null;
  }

  function handleDeleteSymbol(sym: string) {
    setSymbols((prev) => prev.filter((s) => s !== sym));
  }

  // Submit
  function handleSubmit() {
    const name = watchlistName.trim() || 'My Watchlist';
    if (symbols.length === 0) return;
    const newId = addWatchlist(name, symbols);
    if (newId) {
      // Schedule redirect via useEffect so it fires after React commits the new
      // WatchlistContext state (avoids navigating to the page before data is ready)
      setPendingNavId(newId);
    } else {
      alert('Maximum number of watchlists reached (10). Please delete an existing one first.');
    }
  }

  const canSubmit = symbols.length > 0;

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="cwl-page">
            {/* ── Header greeting ── */}
            <div className="cwl-greeting">
              <p className="cwl-greeting-sub">Good day, HungWei</p>
              <h1 className="cwl-greeting-title">What would you like to follow?</h1>
            </div>

            {/* ── AI Suggestion search bar ── */}
            <div className="cwl-search-wrap" ref={searchRef}>
              <div className={`cwl-search-bar${showDropdown ? ' focused' : ''}`}>
                <svg
                  className="cwl-search-icon"
                  viewBox="0 0 20 20"
                  width="16"
                  height="16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M9 3.5C6.015 3.5 3.5 6.015 3.5 9S6.015 14.5 9 14.5 14.5 11.985 14.5 9 11.985 3.5 9 3.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" opacity="0.4" />
                  <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <textarea
                  className="cwl-search-input"
                  rows={1}
                  placeholder="Ask about a current event, topic, or theme to build a watchlist…"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  aria-label="Search AI suggestions"
                  autoComplete="off"
                />
                {query && (
                  <button
                    className="cwl-search-clear"
                    onClick={() => {
                      setQuery('');
                      setShowDropdown(true);
                    }}
                    aria-label="Clear search"
                  >
                    <svg viewBox="0 0 12 12" width="12" height="12" fill="none" aria-hidden="true">
                      <path
                        d="M2 2L10 10M10 2L2 10"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="cwl-dropdown">
                  {filteredEvents.length === 0 && filteredTopics.length === 0 ? (
                    <div className="cwl-dropdown-empty">No matching suggestions</div>
                  ) : (
                    <>
                      {filteredEvents.length > 0 && (
                        <div className="cwl-dropdown-section">
                          <div className="cwl-dropdown-section-label">Current Events</div>
                          {filteredEvents.map((item) => (
                            <button
                              key={item.id}
                              className="cwl-dropdown-item"
                              onClick={() => handleSelectSuggestion(item)}
                            >
                              <svg
                                viewBox="0 0 14 14"
                                width="13"
                                height="13"
                                fill="none"
                                aria-hidden="true"
                                className="cwl-dropdown-item-icon"
                              >
                                <path
                                  d="M7 1L8.5 5H13L9.5 7.5L11 12L7 9.5L3 12L4.5 7.5L1 5H5.5L7 1Z"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="cwl-dropdown-item-label">{item.label}</span>
                              <span className="cwl-dropdown-item-count">{item.symbols.length} companies</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {filteredTopics.length > 0 && (
                        <div className="cwl-dropdown-section">
                          <div className="cwl-dropdown-section-label">Topics</div>
                          {filteredTopics.map((item) => (
                            <button
                              key={item.id}
                              className="cwl-dropdown-item"
                              onClick={() => handleSelectSuggestion(item)}
                            >
                              <svg
                                viewBox="0 0 14 14"
                                width="13"
                                height="13"
                                fill="none"
                                aria-hidden="true"
                                className="cwl-dropdown-item-icon"
                              >
                                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2" />
                                <path
                                  d="M5 7h4M7 5v4"
                                  stroke="currentColor"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="cwl-dropdown-item-label">{item.label}</span>
                              <span className="cwl-dropdown-item-count">{item.symbols.length} companies</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Watchlist builder ── */}
            <div className="cwl-builder">
              {/* Name input */}
              <div className="cwl-field">
                <label className="cwl-field-label" htmlFor="cwl-name-input">
                  Watchlist Name
                </label>
                <input
                  id="cwl-name-input"
                  className="cwl-name-input"
                  type="text"
                  placeholder="e.g. My AI Portfolio"
                  value={watchlistName}
                  onChange={(e) => setWatchlistName(e.target.value)}
                  maxLength={60}
                />
              </div>

              {/* Symbol panel */}
              <div className="cwl-field">
                {/* Header row: label + submit button */}
                <div className="cwl-symbols-header-row">
                  <span className="cwl-field-label">
                    Companies
                    {symbols.length > 0 && (
                      <span className="cwl-symbol-count"> ({symbols.length})</span>
                    )}
                  </span>
                  <button
                    className="cwl-submit-btn"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="13"
                      height="13"
                      fill="none"
                      aria-hidden="true"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 1.5v13M1.5 8h13" />
                    </svg>
                    Create Watchlist
                  </button>
                </div>

                {/* Add symbol row */}
                <div className="cwl-add-row">
                  <input
                    className="cwl-add-input"
                    type="text"
                    placeholder="Add symbol (e.g. AAPL)"
                    value={addSymbolInput}
                    onChange={(e) => setAddSymbolInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                  />
                  <button className="cwl-add-btn" onClick={handleAddSymbol}>
                    + Add
                  </button>
                </div>
                {addSuggestions.length > 0 && (
                  <div className="cwl-add-suggestions">
                    {addSuggestions.map((c) => (
                      <button
                        key={c.symbol}
                        className="cwl-add-suggestion-item"
                        onClick={() => {
                          setSymbols((prev) =>
                            prev.includes(c.symbol) ? prev : [...prev, c.symbol],
                          );
                          setAddSymbolInput('');
                          setAddSuggestions([]);
                        }}
                      >
                        <span className="cwl-add-suggestion-symbol">{c.symbol}</span>
                        <span className="cwl-add-suggestion-name">{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {symbols.length === 0 ? (
                  <div className="cwl-symbols-empty">
                    <svg
                      viewBox="0 0 40 40"
                      width="36"
                      height="36"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
                      <path
                        d="M14 20C14 20 16 16 20 16C24 16 26 20 26 20C26 20 24 24 20 24C16 24 14 20 14 20Z"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        opacity="0.4"
                      />
                      <circle cx="20" cy="20" r="2.5" fill="currentColor" opacity="0.4" />
                    </svg>
                    <p>
                      Select a suggestion above or type symbols to add companies to your watchlist.
                    </p>
                  </div>
                ) : (
                  <div className="cwl-symbol-list">
                    {symbols.map((sym, idx) => (
                      <SymbolItem
                        key={sym}
                        symbol={sym}
                        index={idx}
                        onDelete={handleDeleteSymbol}
                        onDragStart={handleDragStart}
                        onDragEnter={handleDragEnter}
                        onDragEnd={handleDragEnd}
                      />
                    ))}
                  </div>
                )}

                {/* Symbol count info */}
                {symbols.length > 0 && (
                  <div className="cwl-slot-info">
                    {symbols.length} symbol{symbols.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
