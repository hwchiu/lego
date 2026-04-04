'use client';

import { useState } from 'react';
import type { Comment, Member } from '@/app/data/collaboration';
import { MentionTextarea } from './MentionTextarea';

interface CommentSectionProps {
  cardId: string;
  comments: Comment[];
  members: Member[];
  currentUser: Member;
  onCommentsChange: (cardId: string, comments: Comment[]) => void;
}

function nowTimestamp() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  return `${date} ${hh}:${mm}`;
}

// Render text highlighting @MemberName patterns that match known members
function renderMentions(text: string, members: Member[]) {
  const memberNames = members.map((m) => m.name);
  // Build alternation from longest name first to avoid partial matches
  const escaped = memberNames
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length === 0) return <span>{text}</span>;
  const pattern = new RegExp(`(@(?:${escaped.join('|')}))`, 'g');
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('@') && memberNames.includes(part.slice(1)) ? (
          <span key={i} className="pg-mention-tag">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function CommentSection({
  cardId,
  comments,
  members,
  currentUser,
  onCommentsChange,
}: CommentSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  function handleAddComment() {
    if (!newComment.trim()) return;
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? `cmt-${crypto.randomUUID()}`
        : `cmt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const comment: Comment = {
      id,
      author: currentUser,
      text: newComment.trim(),
      createdAt: nowTimestamp(),
    };
    onCommentsChange(cardId, [...comments, comment]);
    setNewComment('');
  }

  function startEdit(id: string) {
    const c = comments.find((c) => c.id === id);
    if (!c) return;
    setEditingId(id);
    setEditText(c.text);
  }

  function saveEdit(id: string) {
    if (!editText.trim()) return;
    onCommentsChange(
      cardId,
      comments.map((c) =>
        c.id === id ? { ...c, text: editText.trim(), editedAt: nowTimestamp() } : c,
      ),
    );
    setEditingId(null);
    setEditText('');
  }

  function deleteComment(id: string) {
    onCommentsChange(
      cardId,
      comments.filter((c) => c.id !== id),
    );
  }

  return (
    <div className="pg-comment-section">
      <button className="pg-comment-toggle" onClick={() => setIsOpen((v) => !v)}>
        {/* Chat bubble icon */}
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden="true">
          <path
            d="M2 3h12a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5l-3 3V4a1 1 0 0 1 1-1z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        Comments ({comments.length})
        <svg
          viewBox="0 0 16 16"
          width="10"
          height="10"
          fill="none"
          aria-hidden="true"
          style={{
            marginLeft: 'auto',
            transition: 'transform 0.15s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="pg-comment-body">
          {comments.length === 0 && (
            <div className="pg-comment-empty">No comments yet. Be the first to comment!</div>
          )}

          {comments.map((c) => (
            <div key={c.id} className="pg-comment-item">
              <img src={c.author.avatar} alt={c.author.name} className="pg-comment-avatar" />
              <div className="pg-comment-content">
                <div className="pg-comment-header">
                  <span className="pg-comment-author">{c.author.name}</span>
                  <span className="pg-comment-time">
                    {c.createdAt}
                    {c.editedAt ? ' (edited)' : ''}
                  </span>
                  <div className="pg-comment-actions">
                    <button className="pg-comment-btn" onClick={() => startEdit(c.id)}>
                      Edit
                    </button>
                    <button className="pg-comment-btn delete" onClick={() => deleteComment(c.id)}>
                      Delete
                    </button>
                  </div>
                </div>

                {editingId === c.id ? (
                  <div>
                    <MentionTextarea
                      value={editText}
                      onChange={setEditText}
                      members={members}
                      rows={2}
                      className="pg-comment-textarea"
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <button
                        className="pg-btn-primary"
                        style={{ fontSize: 11, padding: '3px 10px' }}
                        onClick={() => saveEdit(c.id)}
                        disabled={!editText.trim()}
                      >
                        Save
                      </button>
                      <button
                        className="pg-btn-ghost"
                        style={{ fontSize: 11, padding: '3px 10px' }}
                        onClick={() => {
                          setEditingId(null);
                          setEditText('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pg-comment-text">{renderMentions(c.text, members)}</div>
                )}
              </div>
            </div>
          ))}

          {/* New comment input */}
          <div className="pg-comment-form">
            <img src={currentUser.avatar} alt={currentUser.name} className="pg-comment-avatar" />
            <div style={{ flex: 1 }}>
              <MentionTextarea
                value={newComment}
                onChange={setNewComment}
                members={members}
                placeholder="Add a comment… (type @ to mention a member)"
                rows={2}
                className="pg-comment-textarea"
              />
              <button
                className="pg-btn-primary"
                style={{ fontSize: 11, padding: '3px 10px', marginTop: 5 }}
                disabled={!newComment.trim()}
                onClick={handleAddComment}
              >
                Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
