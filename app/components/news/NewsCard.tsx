'use client';

import { useState } from 'react';
import type { NewsItem } from '@/app/data/news';

function formatPublishedAt(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (itemDay.getTime() === today.getTime()) {
    return `Today ${timeStr}`;
  } else if (itemDay.getTime() === yesterday.getTime()) {
    return `Yesterday ${timeStr}`;
  } else {
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${dateStr} ${timeStr}`;
  }
}

// Share icon — same as Company Profile "Share — Copy URL" button
function ShareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" aria-hidden="true">
      <circle cx="13" cy="3" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="13" cy="13" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="3" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7.2L11.5 3.8M4.5 8.8L11.5 12.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

// External link icon — minimal flat-line open-in-new-window icon
function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
      <path
        d="M11 7.5V11.5C11 12.05 10.55 12.5 10 12.5H2.5C1.95 12.5 1.5 12.05 1.5 11.5V4C1.5 3.45 1.95 3 2.5 3H6.5M9 1.5H12.5V5M12.5 1.5L6.5 7.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="news-card">
      <div className="news-card-corner-actions">
        <div className="news-card-share-wrap">
          <button
            className={`news-card-icon-btn${copied ? ' news-card-icon-btn--active' : ''}`}
            onClick={handleCopyLink}
            title={copied ? 'Copied!' : 'Copy Link'}
            aria-label={copied ? 'URL copied to clipboard' : 'Copy Link'}
          >
            <ShareIcon />
          </button>
          {copied && (
            <span className="news-card-copied" aria-live="polite">Copied!</span>
          )}
        </div>
        <a
          className="news-card-icon-btn"
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          title="News Glance"
          aria-label={`News Glance — 於新分頁開啟: ${item.title}`}
        >
          <ExternalLinkIcon />
        </a>
      </div>
      <div className="news-card-source">{item.source}</div>
      <h3 className="news-card-title">{item.title}</h3>
      {item.content && <p className="news-card-content">{item.content}</p>}
      <div className="news-card-meta">
        <div className="news-card-tags">
          {item.tags.map((tag) => (
            <span key={tag.symbol} className="news-tag-group">
              <a href="#" className="news-tag">
                {tag.symbol}
              </a>

            </span>
          ))}
        </div>
        <span className="news-card-time">{formatPublishedAt(item.publishedAt)}</span>
      </div>
    </div>
  );
}
