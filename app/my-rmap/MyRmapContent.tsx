'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

// ── Icons ─────────────────────────────────────────────────────────────────────

function SupplierIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="4" y="14" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <rect x="26" y="28" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M22 20.5H28C31 20.5 33 22.5 33 25.5V28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path
        d="M26 20.5H20C17 20.5 15 22.5 15 25.5V28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      <path d="M24 17V24M24 24L12 31M24 24L36 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="12" cy="3" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="4" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.4" />
      <line x1="5.7" y1="7.1" x2="10.3" y2="4.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="5.7" y1="8.9" x2="10.3" y2="11.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function NetworkPreview1() {
  const nodes = [
    { x: 120, y: 80, r: 16, label: 'T Company', fill: '#1a2332' },
    { x: 50, y: 40, r: 10, label: 'ASML', fill: '#2563eb' },
    { x: 190, y: 40, r: 10, label: 'NVDA', fill: '#2563eb' },
    { x: 40, y: 130, r: 10, label: 'AMAT', fill: '#2563eb' },
    { x: 200, y: 130, r: 10, label: 'AAPL', fill: '#2563eb' },
    { x: 120, y: 160, r: 8, label: 'LRCX', fill: '#4f46e5' },
    { x: 80, y: 85, r: 8, label: 'KLA', fill: '#4f46e5' },
  ];
  const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 6], [3, 6], [0, 6]];
  return (
    <svg viewBox="0 0 240 200" width="100%" style={{ display: 'block' }}>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke="#93c5fd" strokeWidth="1.2" opacity="0.7" />
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={n.r} fill={n.fill} />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={n.r > 12 ? 6 : 5} fontWeight="700">{n.label}</text>
        </g>
      ))}
    </svg>
  );
}

function NetworkPreview2() {
  const center = { x: 120, y: 30, label: 'TC', r: 14 };
  const tier1 = [
    { x: 40, y: 100, label: 'ASML', r: 10 },
    { x: 95, y: 100, label: 'AMAT', r: 10 },
    { x: 150, y: 100, label: 'LRCX', r: 10 },
    { x: 205, y: 100, label: 'KLA', r: 10 },
  ];
  const tier2 = [
    { x: 25, y: 165, label: 'SHW', r: 7, parent: 0 },
    { x: 60, y: 165, label: 'APD', r: 7, parent: 0 },
    { x: 95, y: 165, label: 'ENTG', r: 7, parent: 1 },
    { x: 150, y: 165, label: 'TOELY', r: 7, parent: 2 },
    { x: 200, y: 165, label: 'MKSI', r: 7, parent: 3 },
    { x: 228, y: 165, label: 'BRKS', r: 7, parent: 3 },
  ];
  return (
    <svg viewBox="0 0 240 200" width="100%" style={{ display: 'block' }}>
      {tier1.map((n) => (
        <line key={n.label} x1={center.x} y1={center.y} x2={n.x} y2={n.y} stroke="#4fc3f7" strokeWidth="1.4" opacity="0.7" />
      ))}
      {tier2.map((n) => (
        <line key={n.label} x1={tier1[n.parent].x} y1={tier1[n.parent].y} x2={n.x} y2={n.y} stroke="#93c5fd" strokeWidth="1" opacity="0.5" />
      ))}
      {tier2.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="#4f46e5" />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={4} fontWeight="700">{n.label}</text>
        </g>
      ))}
      {tier1.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r={n.r} fill="#1e40af" />
          <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={5} fontWeight="700">{n.label}</text>
        </g>
      ))}
      <circle cx={center.x} cy={center.y} r={center.r} fill="#1a2332" />
      <text x={center.x} y={center.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={6} fontWeight="700">{center.label}</text>
    </svg>
  );
}

function NetworkPreview3() {
  const hub = { x: 120, y: 100 };
  const risks = [
    { x: 55, y: 45, label: 'Geo Risk', fill: '#dc2626', r: 14 },
    { x: 185, y: 45, label: 'Supply', fill: '#ea580c', r: 14 },
    { x: 30, y: 120, label: 'Tariff', fill: '#d97706', r: 12 },
    { x: 210, y: 120, label: 'Tech', fill: '#7c3aed', r: 12 },
    { x: 75, y: 175, label: 'FX', fill: '#0891b2', r: 10 },
    { x: 165, y: 175, label: 'Labor', fill: '#059669', r: 10 },
  ];
  return (
    <svg viewBox="0 0 240 200" width="100%" style={{ display: 'block' }}>
      {risks.map((r, i) => (
        <line key={i} x1={hub.x} y1={hub.y} x2={r.x} y2={r.y} stroke="#e2e8f0" strokeWidth="1.5" opacity="0.8" />
      ))}
      <circle cx={hub.x} cy={hub.y} r={22} fill="#1a2332" />
      <text x={hub.x} y={hub.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={7} fontWeight="700">T Company</text>
      {risks.map((r) => (
        <g key={r.label}>
          <circle cx={r.x} cy={r.y} r={r.r} fill={r.fill} opacity="0.9" />
          <text x={r.x} y={r.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={4.5} fontWeight="600">{r.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ── Scenario cards ────────────────────────────────────────────────────────────

const SCENARIO_CARDS = [
  {
    key: 'supplier',
    title: "T Company's Supplier Network",
    description: 'Explore upstream supply relationships and tier-1/tier-2 supplier ecosystems for T Company.',
    href: '/my-rmap/supplier',
    icon: <SupplierIcon />,
    color: '#2196F3',
    createDate: 'Jan 15, 2025',
    author: 'System',
  },
  {
    key: 'customer',
    title: "T Company's Customer Network",
    description: 'Discover downstream customer relationships and distribution channels for T Company.',
    href: '/my-rmap/customer',
    icon: <CustomerIcon />,
    color: '#43a047',
    createDate: 'Jan 15, 2025',
    author: 'System',
  },
  {
    key: 'competitor',
    title: "T Company's Competitor Network",
    description: 'Map out competitive relationships and peer companies in the same market ecosystem as T Company.',
    href: '/my-rmap/competitor',
    icon: <CompetitorIcon />,
    color: '#ef6c00',
    createDate: 'Jan 15, 2025',
    author: 'System',
  },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function MyRmapContent() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  function handleShare(e: React.MouseEvent, card: (typeof SCENARIO_CARDS)[number]) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/lego${card.href}/`;
    if (navigator.share) {
      navigator.share({ title: card.title, url }).catch(() => {});
    } else {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopiedKey(card.key);
          setTimeout(() => setCopiedKey(null), 1800);
        })
        .catch(() => {});
    }
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="mrmap-landing">
            {/* ── Hero ── */}
            <div className="mrmap-hero">
              <h1 className="mrmap-hero-title">My RMAP</h1>
              <p className="mrmap-hero-subtitle">
                Personalized relational maps for the scenarios, news items, and tasks you track.
              </p>
            </div>

            {/* ── Scenario cards ── */}
            <div className="mrmap-scenarios-section">
              <h2 className="mrmap-section-title">Choose a View</h2>
              <div className="mrmap-scenario-grid">
                {SCENARIO_CARDS.map((card) => (
                  <div key={card.key} className="mrmap-scenario-card-wrap">
                    <Link href={card.href} className="mrmap-scenario-card">
                      <div className="mrmap-scenario-icon" style={{ color: card.color }}>
                        {card.icon}
                      </div>
                      <div className="mrmap-scenario-body">
                        <h3 className="mrmap-scenario-title">{card.title}</h3>
                        <p className="mrmap-scenario-desc">{card.description}</p>
                        <div className="mrmap-scenario-meta">
                          <span className="mrmap-scenario-meta-item">
                            <span className="mrmap-scenario-meta-label">Created:</span>{' '}
                            {card.createDate}
                          </span>
                          <span className="mrmap-scenario-meta-dot">·</span>
                          <span className="mrmap-scenario-meta-item">
                            <span className="mrmap-scenario-meta-label">By:</span> {card.author}
                          </span>
                        </div>
                      </div>
                      <div className="mrmap-scenario-arrow" style={{ color: card.color }}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 4L13 10L7 16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </Link>
                    <button
                      className="mrmap-scenario-share-btn"
                      onClick={(e) => handleShare(e, card)}
                      title={copiedKey === card.key ? 'Link copied!' : 'Share this network'}
                      aria-label="Share this network"
                    >
                      {copiedKey === card.key ? (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path d="M3 8l3.5 3.5L13 4.5" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <ShareIcon />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Build Your Own RMAP — Coming Soon ── */}
            <div className="mrmap-build-section">
              <div className="mrmap-coming-soon-card">
                <div className="mrmap-coming-soon-badge">
                  <span>In Design</span>
                </div>
                <h2 className="mrmap-coming-soon-title">Build Your Own RMAP</h2>
                <p className="mrmap-coming-soon-subtitle">
                  Describe any scenario and let AI map the relational network for you — companies,
                  dependencies, risks, and signals all in one view.
                </p>

                {/* Three preview images side by side */}
                <div className="mrmap-coming-soon-images">
                  <div className="mrmap-coming-soon-img-card">
                    <div className="mrmap-coming-soon-img mrmap-coming-soon-img--network">
                      <NetworkPreview1 />
                    </div>
                    <p className="mrmap-coming-soon-img-caption">Knowledge Graph</p>
                  </div>
                  <div className="mrmap-coming-soon-img-card">
                    <div className="mrmap-coming-soon-img mrmap-coming-soon-img--supply">
                      <NetworkPreview2 />
                    </div>
                    <p className="mrmap-coming-soon-img-caption">Supply Chain Map</p>
                  </div>
                  <div className="mrmap-coming-soon-img-card">
                    <div className="mrmap-coming-soon-img mrmap-coming-soon-img--risk">
                      <NetworkPreview3 />
                    </div>
                    <p className="mrmap-coming-soon-img-caption">Risk Network</p>
                  </div>
                </div>

                <div className="mrmap-coming-soon-features">
                  <div className="mrmap-coming-soon-feature">
                    <span className="mrmap-coming-soon-feature-icon">◈</span>
                    <span>AI-powered relationship discovery</span>
                  </div>
                  <div className="mrmap-coming-soon-feature">
                    <span className="mrmap-coming-soon-feature-icon">◈</span>
                    <span>Real-time data integration</span>
                  </div>
                  <div className="mrmap-coming-soon-feature">
                    <span className="mrmap-coming-soon-feature-icon">◈</span>
                    <span>Custom scenario modeling</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
