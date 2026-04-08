'use client';

import { useState, useRef, useCallback } from 'react';
import type { ContentCard, Member } from '@/app/data/collaboration';

interface AddCardModalProps {
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

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function AddCardModal({ currentUser, onClose, onSubmit }: AddCardModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('File is too large. Please choose a file under 5 MB.');
      return;
    }
    setFileName(file.name);
    setFileType(file.type);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === 'string' && result.startsWith('data:image/')) {
          setFileDataUrl(result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFileDataUrl('');
    }
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  function clearFile() {
    setFileName('');
    setFileType('');
    setFileDataUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleSubmit() {
    if (!title.trim()) return;
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `user-${crypto.randomUUID()}`
        : `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const ts = nowTimestamp();

    let card: ContentCard;

    if (fileDataUrl && fileType.startsWith('image/')) {
      // Image uploaded — image card, may also carry text/source
      card = {
        id,
        type: 'image',
        title: title.trim(),
        addedBy: currentUser,
        addedAt: ts,
        comments: [],
        imageUrl: fileDataUrl,
        imageCaption: content.trim() || undefined,
        source: isSafeUrl(url.trim()) ? url.trim() : undefined,
      };
    } else if (fileName && !fileType.startsWith('image/')) {
      // Non-image file — file card
      card = {
        id,
        type: 'file',
        title: title.trim(),
        addedBy: currentUser,
        addedAt: ts,
        comments: [],
        fileName,
        fileSize: '',
        text: content.trim() || undefined,
        source: isSafeUrl(url.trim()) ? url.trim() : undefined,
      };
    } else {
      // Article (text + optional URL)
      card = {
        id,
        type: 'article',
        title: title.trim(),
        addedBy: currentUser,
        addedAt: ts,
        comments: [],
        text: content.trim() || undefined,
        source: isSafeUrl(url.trim()) ? url.trim() : undefined,
      };
    }

    onSubmit(card);
  }

  const isValid = title.trim().length > 0;

  return (
    <>
      <div className="pg-modal-backdrop" onClick={onClose} />
      <div className="pg-add-modal" role="dialog" aria-modal="true" aria-label="Add Card">
        {/* Header */}
        <div className="pg-add-modal-header">
          <span className="pg-add-modal-title">Add Card to Canvas</span>
          <button className="pg-add-modal-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="none" width="13" height="13" aria-hidden="true">
              <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="pg-add-modal-body">
          {/* Title */}
          <div className="pg-add-field">
            <label className="pg-add-label">Title</label>
            <input
              className="pg-add-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title…"
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Content */}
          <div className="pg-add-field">
            <label className="pg-add-label">Content</label>
            <textarea
              className="pg-add-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your content here…"
              rows={4}
            />
          </div>

          {/* URL */}
          <div className="pg-add-field">
            <label className="pg-add-label">URL</label>
            <input
              className="pg-add-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>

          {/* Drag & Drop upload */}
          <div className="pg-add-field">
            <label className="pg-add-label">Attachment</label>
            <div
              className={`pg-add-dropzone${isDragOver ? ' pg-add-dropzone--over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              aria-label="Upload file by drag and drop or click"
            >
              {fileName ? (
                <div className="pg-add-dropzone-preview">
                  {fileDataUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={fileDataUrl} alt="preview" className="pg-add-dropzone-img" />
                  ) : (
                    <div className="pg-add-dropzone-file-info">
                      <svg viewBox="0 0 20 20" fill="none" width="26" height="26" aria-hidden="true">
                        <path d="M5 2h8l4 4v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M13 2v5h4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      </svg>
                      <span className="pg-add-dropzone-filename">{fileName}</span>
                    </div>
                  )}
                  <button
                    className="pg-add-dropzone-clear"
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    aria-label="Remove file"
                  >
                    <svg viewBox="0 0 16 16" fill="none" width="12" height="12" aria-hidden="true">
                      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" width="26" height="26" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="pg-add-dropzone-text">Drag &amp; drop or click to upload</span>
                  <span className="pg-add-dropzone-hint">Images or files · max 5 MB</span>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          {/* Submit */}
          <button className="pg-add-submit-btn" onClick={handleSubmit} disabled={!isValid}>
            Submit
          </button>
        </div>
      </div>
    </>
  );
}

