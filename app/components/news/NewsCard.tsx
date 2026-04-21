'use client';

import Link from 'next/link';
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

interface NewsCardProps {
  item: NewsItem;
}

export default function NewsCard({ item }: NewsCardProps) {
  return (
    <div className="news-card">
      <div className="news-card-source">{item.source}</div>
      <h3 className="news-card-title">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-card-title-link">
          {item.title}
        </a>
      </h3>
      {item.content && <p className="news-card-content">{item.content}</p>}
      <div className="news-card-meta">
        <div className="news-card-tags">
          {item.tags.map((tag) => (
            <span key={tag.symbol} className="news-tag-group">
              <Link href={`/company-profile/${tag.symbol}`} className="news-tag">
                {tag.symbol}
              </Link>
            </span>
          ))}
        </div>
        <span className="news-card-time">{formatPublishedAt(item.publishedAt)}</span>
      </div>
    </div>
  );
}
