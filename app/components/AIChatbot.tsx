'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import rawContent from '@/content/chatbot.md';
import { extractJson } from '@/app/lib/parseContent';

interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

interface ChatbotData {
  greeting: string;
  replies: string[];
}

const { greeting: BOT_GREETING, replies: BOT_REPLIES } = extractJson<ChatbotData>(rawContent);

// Avatar image for the Mic bot
const BOT_AVATAR_URL = 'https://i.pravatar.cc/40?img=47';

// Chat bubble icon — minimal flat speech bubble design
function ChatBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.12)"
      />
    </svg>
  );
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'bot', text: BOT_GREETING },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const replyIdxRef = useRef(0);

  // Drag state for the chatbot dialog
  const [dialogPos, setDialogPos] = useState<{ top: number; left: number } | null>(null);
  const dragState = useRef<{
    mouseStartX: number;
    mouseStartY: number;
    dialogStartTop: number;
    dialogStartLeft: number;
  } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput('');
    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const idx = replyIdxRef.current;
      replyIdxRef.current = idx + 1;
      const botMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: BOT_REPLIES[idx % BOT_REPLIES.length],
      };
      setMessages((prev) => [...prev, botMsg]);
      setTyping(false);
    }, 900 + Math.random() * 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  // Header drag: record start positions on mousedown
  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!dialogRef.current) return;
      const rect = dialogRef.current.getBoundingClientRect();
      dragState.current = {
        mouseStartX: e.clientX,
        mouseStartY: e.clientY,
        dialogStartTop: rect.top,
        dialogStartLeft: rect.left,
      };
      e.preventDefault();
    },
    [],
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragState.current || !dialogRef.current) return;
      const dx = e.clientX - dragState.current.mouseStartX;
      const dy = e.clientY - dragState.current.mouseStartY;
      const dialogW = dialogRef.current.offsetWidth;
      const dialogH = dialogRef.current.offsetHeight;
      setDialogPos({
        top: Math.max(0, Math.min(window.innerHeight - dialogH, dragState.current.dialogStartTop + dy)),
        left: Math.max(0, Math.min(window.innerWidth - dialogW, dragState.current.dialogStartLeft + dx)),
      });
    }
    function onMouseUp() {
      dragState.current = null;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <>
      {/* Side-docked floating button — peeks at right edge, slides in on hover */}
      <button
        className={`chatbot-fab${open ? ' chatbot-fab--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Chatbot"
        title="AI Chatbot"
      >
        <ChatBubbleIcon />
      </button>

      {/* Chat dialog */}
      {open && (
        <div
          ref={dialogRef}
          className="chatbot-dialog"
          role="dialog"
          aria-label="AI Chatbot Mic"
          style={
            dialogPos
              ? { top: dialogPos.top, left: dialogPos.left, right: 'auto', transform: 'none' }
              : undefined
          }
        >
          <div
            className="chatbot-dialog-header chatbot-dialog-header--draggable"
            onMouseDown={handleHeaderMouseDown}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={BOT_AVATAR_URL}
              alt="Mic avatar"
              className="chatbot-dialog-avatar"
            />
            <div>
              <div className="chatbot-dialog-name">Mic</div>
              <div className="chatbot-dialog-status">AI Chatbot · Online</div>
            </div>
            <button
              className="chatbot-dialog-close"
              onClick={() => setOpen(false)}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label="Close"
            >
              <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
                <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="chatbot-dialog-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chatbot-bubble-wrap${msg.role === 'user' ? ' chatbot-bubble-wrap--user' : ''}`}
              >
              {msg.role === 'bot' && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={BOT_AVATAR_URL}
                    alt="Mic"
                    className="chatbot-bot-avatar"
                  />
                )}
                <div className={`chatbot-bubble${msg.role === 'user' ? ' chatbot-bubble--user' : ''}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chatbot-bubble-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={BOT_AVATAR_URL}
                  alt="Mic"
                  className="chatbot-bot-avatar"
                />
                <div className="chatbot-bubble chatbot-bubble--typing">
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                  <span className="chatbot-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chatbot-dialog-input-row">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={typing}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              aria-label="Send"
            >
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden="true">
                <path
                  d="M2 10L18 3L11 10L18 17L2 10Z"
                  fill="currentColor"
                  opacity="0.2"
                />
                <path
                  d="M2 10L18 3L11 10L18 17L2 10Z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
