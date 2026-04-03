'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

// ── Icons ────────────────────────────────────────────────────────────────────

function SupplierIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="14" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="26" y="28" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M22 20.5H28C31 20.5 33 22.5 33 25.5V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="20.5" r="2.5" fill="currentColor" />
      <circle cx="35" cy="34.5" r="2.5" fill="currentColor" />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="26" y="14" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="28" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M26 20.5H20C17 20.5 15 22.5 15 25.5V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="35" cy="20.5" r="2.5" fill="currentColor" />
      <circle cx="13" cy="34.5" r="2.5" fill="currentColor" />
    </svg>
  );
}

function CompetitorIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="15" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="31" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="28" y="31" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M24 17V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 24L12 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 24L36 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 12L16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Scenario card data ────────────────────────────────────────────────────────

interface ScenarioCard {
  key: 'supplier' | 'customer' | 'competitor';
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const SCENARIO_CARDS: ScenarioCard[] = [
  {
    key: 'supplier',
    title: 'Supplier Network',
    description: 'Explore upstream supply relationships and tier-1/tier-2 supplier ecosystems for any company.',
    href: '/supply-chain-maps/supplier',
    icon: <SupplierIcon />,
    color: '#2196F3',
  },
  {
    key: 'customer',
    title: 'Customer Network',
    description: 'Discover downstream customer relationships and distribution channels for a target company.',
    href: '/supply-chain-maps/customer',
    icon: <CustomerIcon />,
    color: '#43a047',
  },
  {
    key: 'competitor',
    title: 'Competitor Network',
    description: 'Map out competitive relationships and peer companies within the same market ecosystem.',
    href: '/supply-chain-maps/competitor',
    icon: <CompetitorIcon />,
    color: '#ef6c00',
  },
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function SupplyChainLanding() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/supply-chain-maps/supplier?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="scm-landing">
            {/* ── Hero + Search ── */}
            <div className="scm-hero">
              <h1 className="scm-hero-title">Supply Chain Ecosystem</h1>
              <p className="scm-hero-subtitle">
                Search any company to explore its supply chain relationships — suppliers, customers, and competitors.
              </p>

              <form className="scm-search-wrap" onSubmit={handleSearch}>
                <div className="scm-search-box">
                  <span className="scm-search-icon">
                    <SearchIcon />
                  </span>
                  <input
                    className="scm-search-input"
                    type="text"
                    placeholder="Search a company or ticker to explore its ecosystem…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button className="scm-search-btn" type="submit">
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* ── Scenario Cards ── */}
            <div className="scm-scenarios-section">
              <h2 className="scm-section-title">Choose a Scenario</h2>
              <div className="scm-scenario-grid">
                {SCENARIO_CARDS.map((card) => (
                  <Link key={card.key} href={card.href} className="scm-scenario-card">
                    <div className="scm-scenario-icon" style={{ color: card.color }}>
                      {card.icon}
                    </div>
                    <div className="scm-scenario-body">
                      <h3 className="scm-scenario-title">{card.title}</h3>
                      <p className="scm-scenario-desc">{card.description}</p>
                    </div>
                    <div className="scm-scenario-arrow" style={{ color: card.color }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
