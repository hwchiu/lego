'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { ContentCardComponent } from '@/app/components/collaboration/ContentCard';
import { TaskPanel } from '@/app/components/collaboration/TaskPanel';
import { CanvasManageModal } from '@/app/components/collaboration/CanvasManageModal';
import { AddCardModal } from '@/app/components/collaboration/AddCardModal';
import { canvases as initialCanvases, members, TAG_I18N } from '@/app/data/collaboration';
import type { Canvas, ContentCard, Comment } from '@/app/data/collaboration';
import { useLanguage } from '@/app/contexts/LanguageContext';

const STORAGE_KEY = 'pg-canvas-state';

function loadCanvases(): Canvas[] {
  if (typeof window === 'undefined') return initialCanvases;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Canvas[];
  } catch (err) {
    console.warn('[CollaborationPlayground] Failed to load saved canvas state:', err);
  }
  return initialCanvases;
}

export default function CollaborationPlaygroundPage() {
  const { lang } = useLanguage();
  const isEn = lang === 'en';
  const [canvasList, setCanvasList] = useState<Canvas[]>(loadCanvases);
  const [activeCanvasId, setActiveCanvasId] = useState(initialCanvases[0].id);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Drag-and-drop state
  const dragCardIdRef = useRef<string | null>(null);
  const [dragOverCardId, setDragOverCardId] = useState<string | null>(null);

  // Persist canvas state to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canvasList));
    } catch {
      // ignore quota errors
    }
  }, [canvasList]);

  const toggleFullscreen = useCallback(() => setIsFullscreen((v) => !v), []);

  // Close fullscreen on Escape key
  useEffect(() => {
    if (!isFullscreen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFullscreen]);

  const activeCanvas = canvasList.find((c) => c.id === activeCanvasId) ?? canvasList[0];

  function handleCreateCanvas(title: string, description: string, tags: string[]) {
    const newCanvas: Canvas = {
      id: `cv-${Date.now()}`,
      title,
      description,
      tags,
      members: [members[0]],
      cards: [],
      tasks: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setCanvasList([...canvasList, newCanvas]);
    setActiveCanvasId(newCanvas.id);
    setShowManageModal(false);
  }

  function handleDeleteCanvas(id: string) {
    const next = canvasList.filter((c) => c.id !== id);
    setCanvasList(next);
    if (activeCanvasId === id && next.length > 0) {
      setActiveCanvasId(next[0].id);
    }
  }

  function handleAddCard(card: ContentCard) {
    setCanvasList((prev) =>
      prev.map((c) =>
        c.id === activeCanvasId ? { ...c, cards: [...c.cards, card] } : c,
      ),
    );
    setShowAddCardModal(false);
  }

  function handleDeleteCard(cardId: string) {
    setCanvasList((prev) =>
      prev.map((c) =>
        c.id !== activeCanvasId ? c : { ...c, cards: c.cards.filter((card) => card.id !== cardId) },
      ),
    );
  }

  function handleCommentsChange(cardId: string, newComments: Comment[]) {
    setCanvasList((prev) =>
      prev.map((canvas) => {
        if (canvas.id !== activeCanvasId) return canvas;
        return {
          ...canvas,
          cards: canvas.cards.map((card) =>
            card.id === cardId ? { ...card, comments: newComments } : card,
          ),
        };
      }),
    );
  }

  // ── Drag-and-drop handlers ──────────────────
  function handleDragStart(cardId: string) {
    dragCardIdRef.current = cardId;
  }

  function handleDragOver(e: React.DragEvent, cardId: string) {
    e.preventDefault();
    setDragOverCardId(cardId);
  }

  function handleDrop(e: React.DragEvent, targetCardId: string) {
    e.preventDefault();
    const sourceId = dragCardIdRef.current;
    if (!sourceId || sourceId === targetCardId) {
      setDragOverCardId(null);
      return;
    }
    setCanvasList((prev) =>
      prev.map((c) => {
        if (c.id !== activeCanvasId) return c;
        const cards = [...c.cards];
        const fromIdx = cards.findIndex((card) => card.id === sourceId);
        const toIdx = cards.findIndex((card) => card.id === targetCardId);
        if (fromIdx === -1 || toIdx === -1) return c;
        const [moved] = cards.splice(fromIdx, 1);
        cards.splice(toIdx, 0, moved);
        return { ...c, cards };
      }),
    );
    dragCardIdRef.current = null;
    setDragOverCardId(null);
  }

  function handleDragEnd() {
    dragCardIdRef.current = null;
    setDragOverCardId(null);
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* ── Page header ── */}
          <div className="pg-page-header">
            <div className="pg-page-header-left">
              <h1 className="pg-page-title">
                <svg viewBox="0 0 18 18" width="20" height="20" fill="none" aria-hidden="true" style={{ marginRight: 8, flexShrink: 0 }}>
                  <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="9" cy="9" r="2" fill="currentColor" />
                </svg>
                Collaboration Playground
              </h1>
            </div>
            <div className="pg-page-header-right">
              <button className="pg-header-btn" onClick={() => setShowTaskPanel((v) => !v)}>
                {/* Pure black task/checklist icon */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isEn ? 'Task & Slack' : '任務 & Slack'}
                {activeCanvas.tasks.filter((t) => t.status !== 'done').length > 0 && (
                  <span className="pg-badge-count">
                    {activeCanvas.tasks.filter((t) => t.status !== 'done').length}
                  </span>
                )}
              </button>
              <button className="pg-header-btn primary" onClick={() => setShowManageModal(true)}>
                {/* Manage/grid icon — white flat design */}
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                {isEn ? 'Manage Canvas' : '管理畫布'}
              </button>
            </div>
          </div>

          {/* ── Main body: canvas selector + board ── */}
          <div className="pg-body">
            {/* Canvas selector sidebar — hidden when collapsed */}
            {!isSidebarCollapsed && (
              <aside className="pg-canvas-sidebar">
                <div className="pg-canvas-sidebar-header">
                  <span className="pg-canvas-sidebar-label" style={{ margin: 0, padding: 0 }}>
                    {isEn ? 'My Canvases' : '我的畫布'}
                  </span>
                  <button
                    className="pg-sidebar-collapse-btn"
                    onClick={() => setIsSidebarCollapsed(true)}
                    title={isEn ? 'Collapse sidebar' : '收合側欄'}
                    aria-label="Collapse sidebar"
                  >
                    {/* Hamburger / collapse icon */}
                    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
                      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <>
                  <ul className="pg-canvas-nav">                    {canvasList.map((c) => (
                      <li key={c.id}>
                        <button
                          className={`pg-canvas-nav-btn${c.id === activeCanvasId ? ' active' : ''}`}
                          onClick={() => setActiveCanvasId(c.id)}
                        >
                          <span className="pg-canvas-nav-icon">
                            {/* color dot */}
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background:
                                  c.id === 'cv1' ? '#4fc3f7' : c.id === 'cv2' ? '#a855f7' : '#f59e0b',
                                flexShrink: 0,
                                display: 'inline-block',
                              }}
                            />
                          </span>
                          <span className="pg-canvas-nav-title">{c.title}</span>
                          <span className="pg-canvas-nav-count">{c.cards.length}</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Members of current canvas */}
                  <div className="pg-canvas-sidebar-label" style={{ marginTop: 16 }}>
                    {isEn ? `Members (${activeCanvas.members.length})` : `成員 (${activeCanvas.members.length})`}
                  </div>
                  <div className="pg-member-stack">
                    {activeCanvas.members.map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar}
                        alt={m.name}
                        title={`${m.name} · ${m.role}`}
                        width={30}
                        height={30}
                        style={{
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #fff',
                          marginLeft: -6,
                        }}
                      />
                    ))}
                  </div>

                  {/* Tags */}
                  {activeCanvas.tags.length > 0 && (
                    <>
                      <div className="pg-canvas-sidebar-label" style={{ marginTop: 16 }}>
                        {isEn ? 'Tags' : '標籤'}
                      </div>
                      <div className="pg-tag-cloud">
                        {activeCanvas.tags.map((t) => (
                          <span key={t} className="pg-tag">
                            {isEn ? (TAG_I18N[t] ?? t) : t}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </>
              </aside>
            )}

            {/* Expand button shown when sidebar is fully collapsed */}
            {isSidebarCollapsed && (
              <div className="pg-sidebar-expand-zone">
                <button
                  className="pg-sidebar-expand-btn"
                  onClick={() => setIsSidebarCollapsed(false)}
                  title={isEn ? 'Expand sidebar' : '展開側欄'}
                  aria-label="Expand sidebar"
                >
                  {/* Right-pointing chevron arrow */}
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* Board area */}
            <div className={`pg-board-wrap${isFullscreen ? ' pg-board-wrap--fullscreen' : ''}`}>
              {/* Canvas header */}
              <div className="pg-canvas-header">
                <div>
                  <div className="pg-canvas-title">{activeCanvas.title}</div>
                  <div className="pg-canvas-desc">{activeCanvas.description}</div>
                </div>
                <div className="pg-canvas-header-right">
                  <div className="pg-canvas-header-meta">
                    {isEn ? `Created on ${activeCanvas.createdAt}` : `建立於 ${activeCanvas.createdAt}`}
                  </div>
                  <button
                    className="pg-add-card-btn"
                    onClick={() => setShowAddCardModal(true)}
                    title={isEn ? 'Add a new card' : '新增卡片'}
                  >
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" aria-hidden="true">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {isEn ? 'Add Card' : '新增卡片'}
                  </button>
                  <button
                    className="pg-fullscreen-btn"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? (isEn ? 'Exit fullscreen' : '離開全螢幕') : (isEn ? 'Fullscreen' : '全螢幕查看')}
                    aria-label={isFullscreen ? (isEn ? 'Exit fullscreen' : '離開全螢幕') : (isEn ? 'Fullscreen' : '全螢幕查看')}
                  >
                    {isFullscreen ? (
                      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
                        <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
                        <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Masonry board */}
              {activeCanvas.cards.length === 0 ? (
                <div className="pg-empty-board">
                  <div className="pg-empty-icon">📋</div>
                  <div className="pg-empty-title">
                    {isEn ? 'No content yet' : '畫布尚無內容'}
                  </div>
                  <div className="pg-empty-sub">
                    {isEn
                      ? 'Click "+ Add Card" in the header to add cards to this canvas'
                      : '點選上方「新增卡片」按鈕來新增卡片'}
                  </div>
                </div>
              ) : (
                <div className="pg-masonry">
                  {activeCanvas.cards.map((card) => (
                    <ContentCardComponent
                      key={card.id}
                      card={card}
                      members={members}
                      currentUser={members[0]}
                      onCommentsChange={handleCommentsChange}
                      onDelete={handleDeleteCard}
                      isDragging={dragCardIdRef.current === card.id}
                      isDragOver={dragOverCardId === card.id}
                      onDragStart={handleDragStart}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Task panel */}
            {showTaskPanel && (
              <TaskPanel canvas={activeCanvas} onClose={() => setShowTaskPanel(false)} />
            )}
          </div>
        </main>
      </div>

      {/* Canvas manage modal */}
      {showManageModal && (
        <CanvasManageModal
          canvases={canvasList}
          activeCanvasId={activeCanvasId}
          onClose={() => setShowManageModal(false)}
          onCreate={handleCreateCanvas}
          onDelete={handleDeleteCanvas}
        />
      )}

      {/* Add card modal */}
      {showAddCardModal && (
        <AddCardModal
          currentUser={members[0]}
          onClose={() => setShowAddCardModal(false)}
          onSubmit={handleAddCard}
        />
      )}
    </>
  );
}
