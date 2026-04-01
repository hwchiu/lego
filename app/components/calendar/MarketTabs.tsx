'use client';

import { useState } from 'react';
import { marketTabs } from '@/app/data/navigation';

export default function MarketTabs() {
  const [activeTab, setActiveTab] = useState('Earnings Calendar');

  return (
    <div className="market-tabs-card">
      <div className="market-tabs">
        {marketTabs.map((tab) => (
          <button
            key={tab}
            className={`market-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <button className="market-tab">More ›</button>
      </div>
    </div>
  );
}
