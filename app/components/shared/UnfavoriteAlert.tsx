'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface UnfavoriteAlertProps {
  visible: boolean;
  onClose: () => void;
}

export default function UnfavoriteAlert({ visible, onClose }: UnfavoriteAlertProps) {
  const { lang } = useLanguage();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        onClose();
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="unfav-alert-overlay" role="alert" aria-live="polite">
      <div className="unfav-alert">
        {/* Info icon */}
        <svg
          className="unfav-alert-icon"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="9" cy="5.5" r="0.9" fill="currentColor" />
        </svg>

        {/* Message */}
        <p className="unfav-alert-msg">
          {lang === 'zh'
            ? '取消收藏公司將自動取消訂閱其相關訂閱及推播通知。'
            : 'Unfavoriting a company will automatically unsubscribe you from its related subscriptions and push notifications.'}
        </p>

        {/* Close button */}
        <button
          className="unfav-alert-close"
          onClick={onClose}
          aria-label={lang === 'zh' ? '關閉提示' : 'Dismiss alert'}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
