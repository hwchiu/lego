'use client';

import { useState } from 'react';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';
import { ContentCardComponent } from '@/app/components/collaboration/ContentCard';
import { TaskPanel } from '@/app/components/collaboration/TaskPanel';
import { CanvasManageModal } from '@/app/components/collaboration/CanvasManageModal';
import { canvases as initialCanvases, members } from '@/app/data/collaboration';
import type { Canvas, ContentCard } from '@/app/data/collaboration';

export default function CollaborationPlaygroundPage() {
  const [canvasList, setCanvasList] = useState<Canvas[]>(initialCanvases);
  const [activeCanvasId, setActiveCanvasId] = useState(initialCanvases[0].id);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

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

  // Filter content by type for the "new card" placeholder
  const cardsByType: Record<string, ContentCard[]> = {};
  for (const card of activeCanvas.cards) {
    cardsByType[card.type] = [...(cardsByType[card.type] ?? []), card];
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
              <div className="section-eyebrow">Collaboration</div>
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
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M5 8l2 2 4-4" stroke="#4fc3f7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                任務 &amp; Slack
                {activeCanvas.tasks.filter((t) => t.status !== 'done').length > 0 && (
                  <span className="pg-badge-count">
                    {activeCanvas.tasks.filter((t) => t.status !== 'done').length}
                  </span>
                )}
              </button>
              <button className="pg-header-btn primary" onClick={() => setShowManageModal(true)}>
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                管理畫布
              </button>
            </div>
          </div>

          {/* ── Main body: canvas selector + board ── */}
          <div className="pg-body">
            {/* Canvas selector sidebar */}
            <aside className="pg-canvas-sidebar">
              <div className="pg-canvas-sidebar-label">我的畫布</div>
              <ul className="pg-canvas-nav">
                {canvasList.map((c) => (
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
                成員 ({activeCanvas.members.length})
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
                    標籤
                  </div>
                  <div className="pg-tag-cloud">
                    {activeCanvas.tags.map((t) => (
                      <span key={t} className="pg-tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </aside>

            {/* Board area */}
            <div className="pg-board-wrap">
              {/* Canvas header */}
              <div className="pg-canvas-header">
                <div>
                  <div className="pg-canvas-title">{activeCanvas.title}</div>
                  <div className="pg-canvas-desc">{activeCanvas.description}</div>
                </div>
                <div className="pg-canvas-header-meta">
                  建立於 {activeCanvas.createdAt}
                </div>
              </div>

              {/* Masonry board */}
              {activeCanvas.cards.length === 0 ? (
                <div className="pg-empty-board">
                  <div className="pg-empty-icon">📋</div>
                  <div className="pg-empty-title">畫布尚無內容</div>
                  <div className="pg-empty-sub">開始貼上文章、數據或圖片來協作吧</div>
                </div>
              ) : (
                <div className="pg-masonry">
                  {activeCanvas.cards.map((card) => (
                    <ContentCardComponent key={card.id} card={card} />
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
    </>
  );
}
