'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
}

const BOT_GREETING = '我是你的AI Chatbot Mic! Feel like asking a question today?';

// Simple canned responses for simulation
const BOT_REPLIES = [
  '好問題！根據目前的市場數據，半導體產業正處於強勢上升週期。',
  '目前 NVIDIA 的新聞提及次數在所有科技公司中排名第一，顯示市場對 AI 晶片的高度關注。',
  '根據最新消息，台積電與蘋果的 2nm 獨家合作預計將進一步鞏固其晶圓代工龍頭地位。',
  '從地緣政治角度來看，中美貿易關係對半導體供應鏈的影響持續是市場焦點。',
  '我目前沒有足夠資訊回答這個問題，建議參考最新的市場報告。',
  '這是個很有意思的觀點！市場分析師普遍認為 AI 算力需求將在 2026 年持續增長。',
];

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
      {/* Floating button */}
      <button
        className={`chatbot-fab${open ? ' chatbot-fab--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="AI Chatbot"
        title="AI Chatbot Mic"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22" aria-hidden="true">
            <path
              d="M12 2C6.48 2 2 6.03 2 11C2 13.62 3.2 15.98 5.14 17.61L4 22L8.8 19.89C9.83 20.27 10.9 20.5 12 20.5C17.52 20.5 22 16.47 22 11C22 6.03 17.52 2 12 2Z"
              fill="currentColor"
              opacity="0.15"
            />
            <path
              d="M12 2C6.48 2 2 6.03 2 11C2 13.62 3.2 15.98 5.14 17.61L4 22L8.8 19.89C9.83 20.27 10.9 20.5 12 20.5C17.52 20.5 22 16.47 22 11C22 6.03 17.52 2 12 2Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8.5" cy="11" r="1.2" fill="currentColor" />
            <circle cx="12" cy="11" r="1.2" fill="currentColor" />
            <circle cx="15.5" cy="11" r="1.2" fill="currentColor" />
          </svg>
        )}
        <span className="chatbot-fab-label">AI Chatbot</span>
      </button>

      {/* Chat dialog */}
      {open && (
        <div className="chatbot-dialog" role="dialog" aria-label="AI Chatbot Mic">
          <div className="chatbot-dialog-header">
            <div className="chatbot-dialog-avatar">🤖</div>
            <div>
              <div className="chatbot-dialog-name">Mic</div>
              <div className="chatbot-dialog-status">AI Chatbot · 線上</div>
            </div>
            <button
              className="chatbot-dialog-close"
              onClick={() => setOpen(false)}
              aria-label="關閉"
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
                {msg.role === 'bot' && <div className="chatbot-bot-avatar">🤖</div>}
                <div className={`chatbot-bubble${msg.role === 'user' ? ' chatbot-bubble--user' : ''}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chatbot-bubble-wrap">
                <div className="chatbot-bot-avatar">🤖</div>
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
              placeholder="輸入訊息…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={typing}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              aria-label="送出"
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
