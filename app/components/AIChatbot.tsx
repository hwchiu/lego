'use client';

import { useState, useRef, useEffect } from 'react';
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

  return (
    <>
      {/* Side-docked floating button */}
      <button
        className={`chatbot-fab${open ? ' chatbot-fab--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Chatbot MIC"
        title="AI Chatbot MIC"
      >
        {/* Icon always visible on right side */}
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true" className="chatbot-fab-icon">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true" className="chatbot-fab-icon">
            <rect x="3" y="9" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 13h2M13 11v10M9 19H7a4 4 0 0 1-4-4v-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M15 9V7a2 2 0 0 0-4 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            <circle cx="19" cy="5" r="3" fill="currentColor" opacity="0.25" />
            <circle cx="19" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M18 5h2M19 4v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        )}
        {/* Expandable label */}
        <span className="chatbot-fab-label">AI Chatbot MIC</span>
      </button>

      {/* Chat dialog */}
      {open && (
        <div className="chatbot-dialog" role="dialog" aria-label="AI Chatbot Mic">
          <div className="chatbot-dialog-header">
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


interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
}
