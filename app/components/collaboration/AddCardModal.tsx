'use client';

import { useState } from 'react';
import type { ContentCard, Member } from '@/app/data/collaboration';
import { MentionTextarea } from './MentionTextarea';

type NewCardType = 'article' | 'link' | 'image' | 'file';

interface AddCardModalProps {
  members: Member[];
  currentUser: Member;
  onClose: () => void;
  onSubmit: (card: ContentCard) => void;
}

function nowTimestamp() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  return `${date} ${hh}:${mm}`;
}

export function AddCardModal({ members, currentUser, onClose, onSubmit }: AddCardModalProps) {
  const [type, setType] = useState<NewCardType>('article');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [fileName, setFileName] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFileName(file.name);
    } else {
      setFileName(file.name);
    }
  }

  function handleSubmit() {
    if (!title.trim()) return;

    const card: ContentCard = {
      id: `user-${Date.now()}`,
      type: type === 'link' ? 'article' : type === 'file' ? 'file' : type,
      title: title.trim(),
      addedBy: currentUser,
      addedAt: nowTimestamp(),
      comments: [],
      ...(type === 'article' && {
        text: text.trim() || undefined,
        source: sourceUrl.trim() || undefined,
      }),
      ...(type === 'link' && {
        text: '',
        source: sourceUrl.trim() || undefined,
      }),
      ...(type === 'image' && {
        imageUrl: imageUrl.trim() || undefined,
        imageCaption: imageCaption.trim() || undefined,
      }),
      ...(type === 'file' && {
        fileName: fileName || title.trim(),
        fileSize: '',
      }),
    };
    onSubmit(card);
  }

  const isValid =
    title.trim().length > 0 &&
    (type !== 'link' || sourceUrl.trim().length > 0);

  return (
    <>
      <div className="pg-modal-backdrop" onClick={onClose} />
      <div className="pg-modal" role="dialog" aria-modal="true" aria-label="Add Card">
        {/* Header */}
        <div className="pg-modal-header">
          <div style={{ fontWeight: 700, fontSize: 15 }}>Add Card to Canvas</div>
          <button className="pg-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="pg-modal-body">
          {/* Type selector */}
          <div className="pg-form-row">
            <label className="pg-form-label">Content Type</label>
            <div className="pg-type-selector">
              {(['article', 'link', 'image', 'file'] as NewCardType[]).map((t) => (
                <button
                  key={t}
                  className={`pg-type-btn${type === t ? ' active' : ''}`}
                  onClick={() => setType(t)}
                >
                  {t === 'article'
                    ? '📄 Article'
                    : t === 'link'
                      ? '🔗 Link'
                      : t === 'image'
                        ? '🖼 Image'
                        : '📎 File'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="pg-form-row">
            <label className="pg-form-label">Title *</label>
            <input
              className="pg-form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter card title..."
              maxLength={100}
            />
          </div>

          {/* Article */}
          {type === 'article' && (
            <>
              <div className="pg-form-row">
                <label className="pg-form-label">
                  Content <span style={{ fontWeight: 400, color: 'var(--c-text-4)' }}>(type @ to mention a member)</span>
                </label>
                <MentionTextarea
                  value={text}
                  onChange={setText}
                  members={members}
                  placeholder="Write your article content here..."
                  rows={5}
                />
              </div>
              <div className="pg-form-row">
                <label className="pg-form-label">Source URL</label>
                <input
                  className="pg-form-input"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </>
          )}

          {/* Link */}
          {type === 'link' && (
            <div className="pg-form-row">
              <label className="pg-form-label">URL *</label>
              <input
                className="pg-form-input"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          {/* Image */}
          {type === 'image' && (
            <>
              <div className="pg-form-row">
                <label className="pg-form-label">Image URL</label>
                <input
                  className="pg-form-input"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="pg-form-row">
                <label className="pg-form-label">Or upload an image</label>
                <input
                  type="file"
                  accept="image/*"
                  className="pg-form-input"
                  style={{ padding: '4px 8px', cursor: 'pointer' }}
                  onChange={handleFileChange}
                />
                {imageUrl && imageUrl.startsWith('data:') && (
                  <img
                    src={imageUrl}
                    alt="preview"
                    style={{ marginTop: 8, maxHeight: 120, borderRadius: 6, objectFit: 'cover' }}
                  />
                )}
              </div>
              <div className="pg-form-row">
                <label className="pg-form-label">Caption</label>
                <input
                  className="pg-form-input"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Optional caption..."
                />
              </div>
            </>
          )}

          {/* File */}
          {type === 'file' && (
            <div className="pg-form-row">
              <label className="pg-form-label">File</label>
              <input
                type="file"
                className="pg-form-input"
                style={{ padding: '4px 8px', cursor: 'pointer' }}
                onChange={handleFileChange}
              />
              {fileName && (
                <div style={{ fontSize: 12, color: 'var(--c-text-3)', marginTop: 4 }}>
                  Selected: {fileName}
                </div>
              )}
            </div>
          )}

          <div className="pg-form-actions" style={{ marginTop: 8 }}>
            <button className="pg-btn-primary" onClick={handleSubmit} disabled={!isValid}>
              Submit
            </button>
            <button className="pg-btn-ghost" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
