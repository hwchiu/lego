'use client';

import { marketTabs } from '@/app/data/navigation';

interface MarketTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MarketTabs({ activeTab, onTabChange }: MarketTabsProps) {
  return (
    <div className="market-tabs-card">
      <div className="market-tabs">
        {marketTabs.map((tab) => (
          <button
            key={tab}
            className={`market-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="market-tab">More ›</button>
      </div>
    </div>
  );
}
