'use client';

/** Flat line-art "no data" icon — consistent empty-state icon used across sub-page tabs. */
export default function NoDataIcon() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="34" height="26" rx="3" stroke="#cbd5e0" strokeWidth="1.5" />
      <path d="M3 14.5h34" stroke="#cbd5e0" strokeWidth="1.5" />
      <path d="M13 7v26M24 7v26" stroke="#cbd5e0" strokeWidth="1.2" />
      <path d="M6 19.5l4 4M10 19.5l-4 4" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 25.5l4 4M10 25.5l-4 4" stroke="#cbd5e0" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 19.5h7M15 25.5h5" stroke="#cbd5e0" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M26 19.5h7M26 25.5h5" stroke="#cbd5e0" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
