'use client';

import { useState, useRef, useEffect } from 'react';
import type { ExpertReport } from '@/app/data/expertReports';

interface ReportCardProps {
  report: ExpertReport;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (report: ExpertReport) => void;
  onSave: (reportId: string) => void;
  onRequestAccess: (reportId: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ReportCard({
  report,
  isSelected,
  isSaved,
  onSelect,
  onSave,
  onRequestAccess,
}: ReportCardProps) {
  const [shareCopied, setShareCopied] = useState(false);
  const shareCopiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (shareCopiedTimer.current) clearTimeout(shareCopiedTimer.current);
    };
  }, []);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/lego/expert-report/?report=${report.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    if (shareCopiedTimer.current) clearTimeout(shareCopiedTimer.current);
    setShareCopied(true);
    shareCopiedTimer.current = setTimeout(() => setShareCopied(false), 2000);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSave(report.id);
  };

  const handleRequestAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestAccess(report.id);
  };

  const cardClass = [
    'er-card',
    isSelected ? 'er-card--selected' : '',
    report.accessState === 'locked' ? 'er-card--locked' : '',
    report.accessState === 'pending' ? 'er-card--pending' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClass} onClick={() => onSelect(report)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(report)}>
      {/* Header: ticker + lock/pending badge + date */}
      <div className="er-card-header">
        <span className="er-card-ticker">{report.company}</span>
        {report.accessState === 'locked' && <span className="er-card-lock">🔒</span>}
        {report.accessState === 'pending' && (
          <span className="er-card-pending-badge">⏳ Pending</span>
        )}
        <span className="er-card-date">{formatDate(report.date)}</span>
      </div>

      {/* Title */}
      <div className="er-card-title">{report.title}</div>

      {/* Excerpt */}
      {report.accessState === 'locked' || report.accessState === 'pending' ? (
        <div className="er-card-excerpt er-card-excerpt--locked">
          Preview locked · Request access to read full report
        </div>
      ) : (
        <div className="er-card-excerpt">{report.excerpt}</div>
      )}

      {/* Footer */}
      <div className="er-card-footer">
        <div className="er-card-avatar" aria-hidden="true" />
        <span className="er-card-contributor">{report.contributor}</span>
        <span className="er-card-sep">·</span>
        <span className="er-card-stat">↓{report.downloadCount}</span>
        <span className="er-card-stat">💬{report.commentCount}</span>

        <div className="er-card-actions">
          {report.accessState === 'owned' && (
            <>
              <button
                className={`er-card-action-btn${isSaved ? ' er-card-action-btn--active' : ''}`}
                onClick={handleSave}
                title={isSaved ? 'Unsave' : 'Save'}
              >
                {isSaved ? 'Saved ✓' : 'Save'}
              </button>
              <button
                className={`er-card-action-btn${shareCopied ? ' er-card-action-btn--active' : ''}`}
                onClick={handleShare}
                title={shareCopied ? 'Copied!' : 'Share'}
              >
                {shareCopied ? 'Copied!' : 'Share'}
              </button>
            </>
          )}
          {report.accessState === 'locked' && (
            <button className="er-card-access-btn" onClick={handleRequestAccess}>
              Request Access
            </button>
          )}
          {report.accessState === 'pending' && (
            <button className="er-card-access-btn" disabled>
              Pending...
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
