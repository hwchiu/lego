'use client';

interface SearchBarProps {
  company: string;
  contributor: string;
  resultCount: number;
  onCompanyChange: (value: string) => void;
  onContributorChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export default function SearchBar({
  company,
  contributor,
  resultCount,
  onCompanyChange,
  onContributorChange,
  onSearch,
  onReset,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="er-search-bar">
      <input
        className="er-search-input"
        type="text"
        placeholder="Company (e.g. NVDA, TSMC)"
        value={company}
        onChange={e => onCompanyChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Filter by company"
      />
      <input
        className="er-search-input"
        type="text"
        placeholder="Contributor"
        value={contributor}
        onChange={e => onContributorChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Filter by contributor"
      />
      <button className="er-search-btn" onClick={onSearch}>Search</button>
      <button className="er-search-reset" onClick={onReset}>Reset</button>
      <span className="er-search-count">{resultCount} reports</span>
    </div>
  );
}
