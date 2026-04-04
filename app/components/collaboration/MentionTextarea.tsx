'use client';

import { useState, useRef } from 'react';
import type { Member } from '@/app/data/collaboration';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  members: Member[];
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MentionTextarea({
  value,
  onChange,
  members,
  placeholder,
  rows = 3,
  className,
}: MentionTextareaProps) {
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredMembers =
    mentionQuery.length > 0
      ? members.filter((m) => m.name.toLowerCase().includes(mentionQuery.toLowerCase()))
      : members;

  const showDropdown = mentionStart !== -1 && filteredMembers.length > 0;

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newVal = e.target.value;
    const cursor = e.target.selectionStart;
    onChange(newVal);

    // Detect "@" trigger before cursor
    const textBeforeCursor = newVal.slice(0, cursor);
    const atIdx = textBeforeCursor.lastIndexOf('@');

    if (
      atIdx !== -1 &&
      (atIdx === 0 || /[\s,]/.test(textBeforeCursor[atIdx - 1]))
    ) {
      const query = textBeforeCursor.slice(atIdx + 1);
      if (!query.includes('\n')) {
        setMentionQuery(query);
        setMentionStart(atIdx);
        return;
      }
    }
    setMentionStart(-1);
  }

  function selectMember(member: Member) {
    if (mentionStart === -1 || !textareaRef.current) return;
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + 1 + mentionQuery.length);
    const inserted = `@${member.name} `;
    const newVal = `${before}${inserted}${after}`;
    onChange(newVal);
    setMentionStart(-1);
    setMentionQuery('');
    // Restore focus and cursor position after the inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const pos = mentionStart + inserted.length;
        textareaRef.current.setSelectionRange(pos, pos);
      }
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape' && showDropdown) {
      setMentionStart(-1);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        className={className ?? 'pg-form-textarea'}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
      />
      {showDropdown && (
        <div className="pg-mention-dropdown">
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="pg-mention-item"
              onMouseDown={(e) => {
                e.preventDefault();
                selectMember(m);
              }}
            >
              <img src={m.avatar} alt={m.name} className="pg-mention-avatar" />
              <span>{m.name}</span>
              <span className="pg-mention-role">{m.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
