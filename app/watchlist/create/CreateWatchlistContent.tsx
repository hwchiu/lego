'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { COMPANY_MASTER_LIST } from '@/app/data/companyMaster';
import { useWatchlist } from '@/app/contexts/WatchlistContext';

// Symbol lookup map for quick name resolution
const SYMBOL_LOOKUP = new Map(COMPANY_MASTER_LIST.map((c) => [c.symbol, c.name]));

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
      <span className="cwl-symbol-name">{name}</span>
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

  // Watchlist config state
  const [watchlistName, setWatchlistName] = useState('');
  const [symbols, setSymbols] = useState<string[]>([]);
  const [addSymbolInput, setAddSymbolInput] = useState('');
  const [addSuggestions, setAddSuggestions] = useState<{ symbol: string; name: string }[]>([]);

  // Drag state
  const dragIdx = useRef<number | null>(null);

  const [pendingNavId, setPendingNavId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingNavId) {
      const id = pendingNavId;
      setPendingNavId(null);
      router.push(`/watchlist/${id}`);
    }
  }, [pendingNavId, router]);

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

  useEffect(() => {
    const q = addSymbolInput.toUpperCase().trim();
    if (!q) { setAddSuggestions([]); return; }
    const matches = COMPANY_MASTER_LIST.filter(
      (c) => c.symbol.startsWith(q) || c.name.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 5);
    setAddSuggestions(matches);
  }, [addSymbolInput]);

  function handleDragStart(idx: number) { dragIdx.current = idx; }
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
  function handleDragEnd() { dragIdx.current = null; }

  function handleDeleteSymbol(sym: string) {
    setSymbols((prev) => prev.filter((s) => s !== sym));
  }

  function handleSubmit() {
    const name = watchlistName.trim() || 'My Watchlist';
    if (symbols.length === 0) return;
    const newId = addWatchlist(name, symbols);
    if (newId) {
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
              <p className="cwl-greeting-sub">Good day, <strong>PiKa</strong></p>
              <h1 className="cwl-greeting-title">Create a New Watchlist</h1>
            </div>

            {/* ── Watchlist builder ── */}
            <div className="cwl-content-row">
              <div className="cwl-builder">
                <div className="cwl-field">
                  <label className="cwl-field-label" htmlFor="cwl-name-input">Watchlist Name</label>
                  <div className="cwl-name-row">
                    <input
                      id="cwl-name-input"
                      className="cwl-name-input"
                      type="text"
                      placeholder="e.g. My Portfolio"
                      value={watchlistName}
                      onChange={(e) => setWatchlistName(e.target.value)}
                      maxLength={60}
                    />
                    <button className="cwl-submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
                      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 1.5v13M1.5 8h13" />
                      </svg>
                      Create Watchlist
                    </button>
                  </div>
                </div>

                <div className="cwl-field">
                  <div className="cwl-symbols-header-row">
                    <span className="cwl-field-label">
                      Companies
                      {symbols.length > 0 && <span className="cwl-symbol-count"> ({symbols.length})</span>}
                    </span>
                  </div>

                  <div className="cwl-add-row">
                    <input
                      className="cwl-add-input"
                      type="text"
                      placeholder="Add symbol (e.g. AAPL)"
                      value={addSymbolInput}
                      onChange={(e) => setAddSymbolInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSymbol()}
                    />
                    <button className="cwl-add-btn" onClick={handleAddSymbol}>+ Add</button>
                  </div>
                  {addSuggestions.length > 0 && (
                    <div className="cwl-add-suggestions">
                      {addSuggestions.map((c) => (
                        <button
                          key={c.symbol}
                          className="cwl-add-suggestion-item"
                          onClick={() => {
                            setSymbols((prev) => prev.includes(c.symbol) ? prev : [...prev, c.symbol]);
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
                      <svg viewBox="0 0 40 40" width="36" height="36" fill="none" aria-hidden="true">
                        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
                        <path d="M14 20C14 20 16 16 20 16C24 16 26 20 26 20C26 20 24 24 20 24C16 24 14 20 14 20Z" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />
                        <circle cx="20" cy="20" r="2.5" fill="currentColor" opacity="0.4" />
                      </svg>
                      <p>Type symbols to add companies to your watchlist.</p>
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

                  {symbols.length > 0 && (
                    <div className="cwl-slot-info">
                      {symbols.length} symbol{symbols.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
