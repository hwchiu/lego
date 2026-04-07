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

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2L11.5 8.5L18 10L11.5 11.5L10 18L8.5 11.5L2 10L8.5 8.5L10 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Scenario cards ────────────────────────────────────────────────────────────

const SCENARIO_CARDS = [
  {
    key: 'supplier',
    title: 'Supplier Network',
    description:
      'Explore upstream supply relationships and tier-1/tier-2 supplier ecosystems for any company.',
    href: '/my-rmap/supplier',
    icon: <SupplierIcon />,
    color: '#2196F3',
  },
  {
    key: 'customer',
    title: 'Customer Network',
    description:
      'Discover downstream customer relationships and distribution channels for a target company.',
    href: '/my-rmap/customer',
    icon: <CustomerIcon />,
    color: '#43a047',
  },
  {
    key: 'competitor',
    title: 'Competitor Network',
    description:
      'Map out competitive relationships and peer companies within the same market ecosystem.',
    href: '/my-rmap/competitor',
    icon: <CompetitorIcon />,
    color: '#ef6c00',
  },
];

// ── Placeholder RMAP result ───────────────────────────────────────────────────

function GeneratedRmapPreview({ prompt }: { prompt: string }) {
  const nodes = [
    { label: 'TSMC', x: 50, y: 50, color: '#1a2332', textColor: '#fff' },
    { label: 'NVDA', x: 20, y: 20, color: '#2563eb', textColor: '#fff' },
    { label: 'AAPL', x: 80, y: 20, color: '#2563eb', textColor: '#fff' },
    { label: 'ASML', x: 80, y: 80, color: '#2563eb', textColor: '#fff' },
    { label: 'AMAT', x: 20, y: 80, color: '#2563eb', textColor: '#fff' },
  ];

  return (
    <div className="mrmap-build-result">
      <div className="mrmap-build-result-header">
        <SparkleIcon />
        <span>Generated RMAP Preview</span>
      </div>
      <p className="mrmap-build-result-prompt">
        Scenario: <em>{prompt.length > 80 ? prompt.slice(0, 79) + '…' : prompt}</em>
      </p>
      <div className="mrmap-build-result-graph">
        <svg viewBox="0 0 100 100" className="mrmap-mini-svg">
          {/* Edges from center to outer nodes */}
          {nodes.slice(1).map((n, i) => (
            <line
              key={i}
              x1={nodes[0].x} y1={nodes[0].y}
              x2={n.x} y2={n.y}
              stroke="#93c5fd"
              strokeWidth={0.8}
              opacity={0.7}
            />
          ))}
          {/* Nodes */}
          {nodes.map((n) => (
            <g key={n.label}>
              <circle cx={n.x} cy={n.y} r={8} fill={n.color} />
              <text
                x={n.x} y={n.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={n.textColor}
                fontSize={4}
                fontWeight="700"
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
        <p className="mrmap-build-result-note">
          This is a placeholder preview. Full RMAP generation with real-time data will be available
          in a future release.
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MyRmapContent() {
  const [prompt, setPrompt] = useState('');
  const [generated, setGenerated] = useState('');

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (prompt.trim()) {
      setGenerated(prompt.trim());
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
                  <Link key={card.key} href={card.href} className="mrmap-scenario-card">
                    <div className="mrmap-scenario-icon" style={{ color: card.color }}>
                      {card.icon}
                    </div>
                    <div className="mrmap-scenario-body">
                      <h3 className="mrmap-scenario-title">{card.title}</h3>
                      <p className="mrmap-scenario-desc">{card.description}</p>
                    </div>
                    <div className="mrmap-scenario-arrow" style={{ color: card.color }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
                ))}
              </div>
            </div>

            {/* ── Build Your Own RMAP ── */}
            <div className="mrmap-build-section">
              <div className="mrmap-build-card">
                <div className="mrmap-build-card-header">
                  <SparkleIcon />
                  <h2 className="mrmap-build-title">Build Your Own RMAP</h2>
                </div>
                <p className="mrmap-build-desc">
                  Create a personalized relational map based on an event, news item, or task
                  you&apos;re tracking.
                </p>
                <form className="mrmap-build-form" onSubmit={handleGenerate}>
                  <textarea
                    className="mrmap-build-textarea"
                    placeholder="Describe a scenario, event, or task… e.g. 'How does the CHIPS Act affect TSMC supplier relationships?' or 'Map NVIDIA's AI chip supply chain'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    maxLength={500}
                  />
                  <div className="mrmap-build-actions">
                    <span className="mrmap-build-hint">
                      {prompt.length}/500 characters
                    </span>
                    <button
                      className="mrmap-build-btn"
                      type="submit"
                      disabled={!prompt.trim()}
                    >
                      <SparkleIcon />
                      Generate RMAP
                    </button>
                  </div>
                </form>

                {generated && <GeneratedRmapPreview prompt={generated} />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
