'use client';

import { useState } from 'react';

interface NewsTag {
  symbol: string;
  name: string;
  change: number;
}

interface NewsItem {
  id: string;
  source: string;
  title: string;
  category: string;
  publishedAt: Date | string;
  url: string;
  tags: NewsTag[];
}

function formatPublishedAt(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const timeStr = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (itemDay.getTime() === today.getTime()) {
    return `Today ${timeStr}`;
  } else if (itemDay.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  } else {
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${dateStr} ${timeStr}`;
  }
}

// Save icon SVG
function SaveIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path
        d="M11 12.5L7 9.5L3 12.5V2.5C3 1.95 3.45 1.5 4 1.5H10C10.55 1.5 11 1.95 11 2.5V12.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Link icon SVG
function LinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path
        d="M5.5 8.5L8.5 5.5M6 4H4C2.9 4 2 4.9 2 6V10C2 11.1 2.9 12 4 12H8C9.1 12 10 11.1 10 10V8M8 2H10C11.1 2 12 2.9 12 4V6C12 7.1 11.1 8 10 8H8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Eye icon SVG for News Glance
function EyeIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="13" height="13" aria-hidden="true">
      <path
        d="M1 7C1 7 3 3 7 3C11 3 13 7 13 7C13 7 11 11 7 11C3 11 1 7 1 7Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7" cy="7" r="1.8" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

// Close icon SVG
interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="news-card">
      <div className="news-card-source">{item.source}</div>
      <h3 className="news-card-title">{item.title}</h3>
      <div className="news-card-meta">
        <div className="news-card-tags">
          {item.tags.map((tag) => (
            <span key={tag.symbol} className="news-tag-group">
              <a href="#" className="news-tag">
                {tag.symbol}
              </a>
              <span className={tag.change >= 0 ? 'news-price pos' : 'news-price neg'}>
                {tag.change >= 0 ? '+' : ''}
                {tag.change.toFixed(1)}%
              </span>
            </span>
          ))}
        </div>
        <span className="news-card-time">{formatPublishedAt(item.publishedAt)}</span>
      </div>
      <div className="news-card-actions">
        <button
          className={`news-action-btn${saved ? ' news-action-btn--active' : ''}`}
          onClick={() => setSaved(!saved)}
          title={saved ? 'Saved' : 'Save'}
        >
          <SaveIcon />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button
          className={`news-action-btn${copied ? ' news-action-btn--active' : ''}`}
          onClick={handleCopyLink}
          title="Copy Link"
        >
          <LinkIcon />
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <a
          className="news-action-btn"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          title="News Glance"
          aria-label={`News Glance — 於新分頁開啟: ${item.title}`}
        >
          <EyeIcon />
          News Glance
        </a>
      </div>
    </div>
  );
}
