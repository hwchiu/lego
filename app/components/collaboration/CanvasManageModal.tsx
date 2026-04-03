'use client';

import { useState } from 'react';
import type { Canvas } from '@/app/data/collaboration';

interface CanvasManageModalProps {
  canvases: Canvas[];
  activeCanvasId: string;
  onClose: () => void;
  onCreate: (title: string, description: string, tags: string[]) => void;
  onDelete: (id: string) => void;
}

type ModalTab = 'list' | 'create';

const PRESET_TAGS = ['科技', 'Apple', 'AI', 'NVIDIA', '半導體', '供應鏈', '地緣政治', '法說會', '市場趨勢', '財務', '風險管理', '能源', '產業分析'];

export function CanvasManageModal({
  canvases,
  activeCanvasId,
  onClose,
  onCreate,
  onDelete,
}: CanvasManageModalProps) {
  const [tab, setTab] = useState<ModalTab>('list');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function addCustomTag() {
    const t = customTag.trim();
    if (t && !selectedTags.includes(t)) {
      setSelectedTags((prev) => [...prev, t]);
    }
    setCustomTag('');
  }

  function handleCreate() {
    if (!title.trim()) return;
    onCreate(title.trim(), description.trim(), selectedTags);
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setTab('list');
  }

  function handleShare(id: string) {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/collaboration-playground?canvas=${id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      {/* Backdrop */}
      <div className="pg-modal-backdrop" onClick={onClose} />

      {/* Modal */}
      <div className="pg-modal" role="dialog" aria-modal="true" aria-label="管理畫布">
        {/* Header */}
        <div className="pg-modal-header">
          <div className="pg-modal-tabs">
            <button
              className={`pg-modal-tab${tab === 'list' ? ' active' : ''}`}
              onClick={() => setTab('list')}
            >
              畫布管理
            </button>
            <button
              className={`pg-modal-tab${tab === 'create' ? ' active' : ''}`}
              onClick={() => setTab('create')}
            >
              ＋ 建立新畫布
            </button>
          </div>
          <button className="pg-modal-close" onClick={onClose} aria-label="關閉">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="pg-modal-body">
          {tab === 'list' && (
            <div className="pg-canvas-list">
              {canvases.map((c) => (
                <div key={c.id} className={`pg-canvas-list-item${c.id === activeCanvasId ? ' active' : ''}`}>
                  <div className="pg-canvas-list-info">
                    <div className="pg-canvas-list-title">
                      {c.id === activeCanvasId && (
                        <span className="pg-canvas-active-dot" title="當前畫布" />
                      )}
                      {c.title}
                    </div>
                    <div className="pg-canvas-list-desc">{c.description}</div>
                    <div className="pg-canvas-list-tags">
                      {c.tags.slice(0, 4).map((t) => (
                        <span key={t} className="pg-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="pg-canvas-list-meta">
                      建立於 {c.createdAt} &nbsp;·&nbsp; {c.members.length} 位成員 &nbsp;·&nbsp;{' '}
                      {c.cards.length} 個卡片
                    </div>
                  </div>
                  <div className="pg-canvas-list-actions">
                    <button
                      className="pg-action-btn share"
                      onClick={() => handleShare(c.id)}
                      title="分享畫布"
                    >
                      {copied === c.id ? '✓ 已複製' : '🔗 分享'}
                    </button>
                    {c.id !== activeCanvasId && (
                      <>
                        {confirmDeleteId === c.id ? (
                          <span className="pg-delete-confirm">
                            確定刪除？
                            <button
                              className="pg-action-btn danger"
                              onClick={() => {
                                onDelete(c.id);
                                setConfirmDeleteId(null);
                              }}
                            >
                              確定
                            </button>
                            <button
                              className="pg-action-btn"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              取消
                            </button>
                          </span>
                        ) : (
                          <button
                            className="pg-action-btn delete"
                            onClick={() => setConfirmDeleteId(c.id)}
                            title="刪除畫布"
                          >
                            🗑 刪除
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'create' && (
            <div className="pg-create-form">
              <div className="pg-form-row">
                <label className="pg-form-label">畫布名稱 *</label>
                <input
                  className="pg-form-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：2026 Q2 TSMC 法說會"
                  maxLength={60}
                />
              </div>
              <div className="pg-form-row">
                <label className="pg-form-label">描述</label>
                <textarea
                  className="pg-form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="簡短說明這個畫布的用途..."
                  rows={3}
                />
              </div>
              <div className="pg-form-row">
                <label className="pg-form-label">標籤（產業、公司、議題）</label>
                <div className="pg-tag-grid">
                  {PRESET_TAGS.map((t) => (
                    <button
                      key={t}
                      className={`pg-tag-toggle${selectedTags.includes(t) ? ' selected' : ''}`}
                      onClick={() => toggleTag(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="pg-custom-tag-row">
                  <input
                    className="pg-form-input"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="自訂標籤..."
                    onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                  />
                  <button className="pg-btn-ghost" onClick={addCustomTag}>
                    新增
                  </button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="pg-selected-tags">
                    {selectedTags.map((t) => (
                      <span key={t} className="pg-tag selected">
                        {t}{' '}
                        <button onClick={() => toggleTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', color: 'inherit' }}>
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="pg-form-actions">
                <button className="pg-btn-primary" onClick={handleCreate} disabled={!title.trim()}>
                  建立畫布
                </button>
                <button className="pg-btn-ghost" onClick={onClose}>
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
