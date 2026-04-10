'use client';

import { useState, useRef, useEffect } from 'react';
import type { Member } from '@/app/data/collaboration';
import { BASE_PATH } from '@/app/lib/basePath';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  members: Member[];
  placeholder?: string;
  rows?: number;
  className?: string;
}

interface DropdownPos {
  top: number;
  left: number;
  width: number;
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
  const [dropdownPos, setDropdownPos] = useState<DropdownPos | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredMembers =
    mentionQuery.length > 0
      ? members.filter((m) => m.name.toLowerCase().includes(mentionQuery.toLowerCase()))
      : members;

  const showDropdown = mentionStart !== -1 && filteredMembers.length > 0;

  // Calculate fixed-position coordinates for the dropdown so it escapes
  // any overflow:hidden ancestors (e.g. .pg-card, .pg-board-wrap)
  useEffect(() => {
    if (showDropdown && textareaRef.current) {
      const rect = textareaRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
      });
    } else {
      setDropdownPos(null);
    }
  }, [showDropdown, value]);

  // Close dropdown when the page scrolls so it doesn't drift away
  useEffect(() => {
    if (!showDropdown) return;
    const close = () => setMentionStart(-1);
    window.addEventListener('scroll', close, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', close, { capture: true });
  }, [showDropdown]);

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
      {showDropdown && dropdownPos && (
        <div
          className="pg-mention-dropdown"
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: dropdownPos.width,
            zIndex: 9999,
          }}
        >
          {filteredMembers.map((m) => (
            <div
              key={m.id}
              className="pg-mention-item"
              onMouseDown={(e) => {
                e.preventDefault();
                selectMember(m);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BASE_PATH + m.avatar} alt={m.name} className="pg-mention-avatar" />
              <span>{m.name}</span>
              <span className="pg-mention-role">{m.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
