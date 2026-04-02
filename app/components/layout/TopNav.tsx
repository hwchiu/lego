'use client';

export default function TopNav() {
  return (
    <header className="topnav">
      <div className="topnav-logo">
        M<span className="logo-i">i</span>C
      </div>
      <div className="topnav-search-wrap">
        <svg
          className="topnav-search-icon"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          className="topnav-search"
          type="text"
          placeholder="Company, Symbols, Analysts, Keywords"
        />
      </div>
      <div className="topnav-user">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="topnav-avatar"
          src="https://i.pravatar.cc/40?img=12"
          alt="User Avatar"
        />
        <span className="topnav-name">Sherry Wang</span>
      </div>
    </header>
  );
}
