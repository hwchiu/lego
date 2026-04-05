'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopNav from '@/app/components/layout/TopNav';
import Banner from '@/app/components/layout/Banner';
import Sidebar from '@/app/components/layout/Sidebar';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PageLink {
  label: string;
  href: string;
  badge?: string;
}

interface Scenario {
  id: string;
  title: string;
  desc: string;
  steps: string[];
  pages: PageLink[];
}

interface Role {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  desc: string;
  color: string;
  scenarios: Scenario[];
}

// ── Data ───────────────────────────────────────────────────────────────────────

const ROLES: Role[] = [
  {
    id: 'region-sales',
    icon: '📊',
    title: 'Region Sales Manager',
    subtitle: 'Sales & Business Development',
    desc: 'Monitor key accounts, track financial performance of portfolio companies, and stay ahead of market news to support client conversations and revenue targets.',
    color: '#4fc3f7',
    scenarios: [
      {
        id: 'monitor-watchlist',
        title: 'Monitor Key Accounts & Financial Performance',
        desc: 'Track the financial health and stock movements of your most important accounts to prepare for client conversations.',
        steps: [
          'Open your Watchlist to view at-a-glance performance of target companies.',
          'Click into any company to open Company Profile and review revenue trends and margins.',
          'Check the Earnings calendar to identify upcoming reporting dates for key accounts.',
          'Set alerts for earnings surprises using Watchlist favorites.',
        ],
        pages: [
          { label: 'Watchlist', href: '/watchlist/627836' },
          { label: 'Create Watchlist', href: '/watchlist/create', badge: 'NEW' },
          { label: 'Company Profile', href: '/company-profile' },
          { label: 'Earnings', href: '/earnings' },
        ],
      },
      {
        id: 'track-news',
        title: 'Track Industry News & Competitor Moves',
        desc: 'Stay informed on market developments, competitor announcements, and sector-wide signals that affect your accounts.',
        steps: [
          'Start at Market News to filter the latest news by sector or keyword.',
          'Visit Press Release to read official company statements and product launches.',
          'Use Event Calendar to mark upcoming industry conferences and earnings calls.',
          'Identify key signals to bring into your next client briefing.',
        ],
        pages: [
          { label: 'Market News', href: '/market-news' },
          { label: 'Press Release', href: '/press-release' },
          { label: 'Event Calendar', href: '/event-calendar' },
        ],
      },
      {
        id: 'collaborate',
        title: 'Collaborate on Sales Insights & Reports',
        desc: 'Organize findings, annotate intelligence, and share insights with your team in a structured workspace.',
        steps: [
          'Open Collaboration Playground to create a new canvas for your account.',
          'Add card notes summarizing financial highlights and news findings.',
          'Use @mention to notify colleagues and assign research tasks.',
          'Export or copy the organized intelligence for your CRM or sales deck.',
        ],
        pages: [
          { label: 'Collaboration Playground', href: '/collaboration-playground' },
        ],
      },
    ],
  },
  {
    id: 'supply-chain',
    icon: '🌐',
    title: 'Supply Chain Analyst',
    subtitle: 'Procurement & Risk Management',
    desc: 'Map multi-tier supplier relationships, identify geopolitical risks, track competitor ecosystems, and monitor real-time events that may disrupt supply continuity.',
    color: '#34d399',
    scenarios: [
      {
        id: 'map-suppliers',
        title: 'Map Supplier Networks',
        desc: 'Visualize the full upstream supplier ecosystem of a target company to uncover concentration risks and alternative sources.',
        steps: [
          'Navigate to Supply Chain Maps → Supplier to load the supplier graph.',
          'Explore Tier 1 suppliers and expand nodes to reveal Tier 2 relationships.',
          'Click a supplier node to open its Company Profile for financial health details.',
          'Note geographic concentration clusters that signal geopolitical risk.',
        ],
        pages: [
          { label: 'Supplier Map', href: '/supply-chain-maps/supplier' },
          { label: 'RMAP Overview', href: '/supply-chain-maps', badge: 'NEW' },
          { label: 'Company Profile', href: '/company-profile' },
        ],
      },
      {
        id: 'competitor-ecosystem',
        title: 'Analyze Competitor Ecosystems',
        desc: 'Understand the supply chain advantages and vulnerabilities of key competitors to benchmark your own network.',
        steps: [
          'Open Supply Chain Maps → Competitor to view competitor supply relationships.',
          'Toggle to Customer view to see who depends on each node company.',
          'Compare supplier overlap between competitors to identify shared risk.',
          'Review M&A activity in Market Data to track consolidation moves.',
        ],
        pages: [
          { label: 'Competitor Map', href: '/supply-chain-maps/competitor' },
          { label: 'Customer Map', href: '/supply-chain-maps/customer' },
          { label: 'Market Data — M&A', href: '/market-data/ma' },
        ],
      },
      {
        id: 'monitor-events',
        title: 'Monitor Supply Chain Events & Data',
        desc: 'Track real-time disruptions, industry events, and emerging trends across the semiconductor supply chain.',
        steps: [
          'Visit Data Explore to browse supply chain category datasets and reports.',
          'Use Intelligence Search to pinpoint specific component or supplier mentions.',
          'Open Market News and filter for supply chain keywords.',
          'Mark critical event dates in Event Calendar to anticipate procurement windows.',
        ],
        pages: [
          { label: 'Data Explore', href: '/data-explore' },
          { label: 'Intelligence Search', href: '#' }, // placeholder — feature not yet launched
          { label: 'Market News', href: '/market-news' },
          { label: 'Event Calendar', href: '/event-calendar' },
        ],
      },
    ],
  },
  {
    id: 'investment-researcher',
    icon: '🔬',
    title: 'Investment Researcher',
    subtitle: 'Equity Research & Portfolio Strategy',
    desc: 'Conduct rigorous company analysis, evaluate M&A activity, explore thematic datasets, and build curated watchlists to support investment decisions.',
    color: '#f59e0b',
    scenarios: [
      {
        id: 'deep-dive',
        title: 'Deep Dive Company Analysis',
        desc: 'Perform thorough financial and qualitative analysis on a company before initiating coverage or a position.',
        steps: [
          'Search for a company in Company Profile to access summary metrics and AI insights.',
          'Review historical financials, revenue mix, and peer comparisons in the Financial Statement tab.',
          'Check Market Data for M&A deals involving or competing with the target company.',
          'Cross-reference findings with recent Press Releases and earnings call notes.',
        ],
        pages: [
          { label: 'Company Profile', href: '/company-profile' },
          { label: 'Market Data', href: '/market-data' },
          { label: 'Market Data — M&A', href: '/market-data/ma' },
          { label: 'Press Release', href: '/press-release' },
        ],
      },
      {
        id: 'market-themes',
        title: 'Explore Market Themes & M&A Activity',
        desc: 'Identify macro investment themes and corporate consolidation trends shaping the semiconductor sector.',
        steps: [
          'Open Market Data → M&A to review recent deal flow and valuations.',
          'Use Data Explore to browse thematic datasets by sector or region.',
          'Read industry Press Releases to validate strategic narratives.',
          'Annotate key findings in Collaboration Playground for team review.',
        ],
        pages: [
          { label: 'Market Data — M&A', href: '/market-data/ma' },
          { label: 'Data Explore', href: '/data-explore' },
          { label: 'Press Release', href: '/press-release' },
          { label: 'Collaboration Playground', href: '/collaboration-playground' },
        ],
      },
      {
        id: 'build-watchlist',
        title: 'Build a Research Watchlist',
        desc: 'Curate a focused list of coverage candidates and monitor them through earnings cycles and market events.',
        steps: [
          'Create a new Watchlist from the Watchlist section to organize your coverage universe.',
          'Add companies identified through Company Profile research.',
          'Set up the Earnings calendar view to track reporting dates in your watchlist.',
          'Monitor Event Calendar for conferences and analyst days for watchlist companies.',
        ],
        pages: [
          { label: 'Create Watchlist', href: '/watchlist/create', badge: 'START' },
          { label: 'Watchlist', href: '/watchlist/627836' },
          { label: 'Earnings', href: '/earnings' },
          { label: 'Event Calendar', href: '/event-calendar' },
        ],
      },
    ],
  },
];

const STATS = [
  { value: '3', label: 'User Roles' },
  { value: '9', label: 'Guided Scenarios' },
  { value: '12+', label: 'Platform Modules' },
  { value: '100%', label: 'Page Coverage' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      width="14"
      height="14"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
    >
      <path d="M5 2.5L9.5 7L5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="11" height="11" aria-hidden="true">
      <path d="M6 3H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M9 2h3v3M12 2L8 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ScenarioCardProps {
  scenario: Scenario;
  roleColor: string;
}

function ScenarioCard({ scenario, roleColor }: ScenarioCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div id={`scenario-${scenario.id}`} className={`um-scenario-card${expanded ? ' um-scenario-card--open' : ''}`}>
      <button
        className="um-scenario-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <span className="um-scenario-title">{scenario.title}</span>
        <ChevronIcon open={expanded} />
      </button>

      {expanded && (
        <div className="um-scenario-body">
          <p className="um-scenario-desc">{scenario.desc}</p>

          <div className="um-steps-section">
            <div className="um-steps-label">Step-by-step guide</div>
            <ol className="um-step-list">
              {scenario.steps.map((step, i) => (
                <li key={i} className="um-step-item">
                  <span className="um-step-num" style={{ background: roleColor }}>{i + 1}</span>
                  <span className="um-step-text">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="um-pages-section">
            <div className="um-steps-label">Recommended pages</div>
            <div className="um-page-links">
              {scenario.pages.map((page) => (
                <Link
                  key={page.href + page.label}
                  href={page.href}
                  className="um-page-link"
                  style={{ borderColor: roleColor, color: roleColor }}
                >
                  {page.label}
                  {page.badge && (
                    <span className="um-page-link-badge" style={{ background: roleColor }}>
                      {page.badge}
                    </span>
                  )}
                  <ExternalLinkIcon />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RoleCardProps {
  role: Role;
  selected: boolean;
  onSelect: () => void;
}

function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  return (
    <div
      className={`um-role-card${selected ? ' um-role-card--active' : ''}`}
      style={selected ? { borderColor: role.color, boxShadow: `0 0 0 1px ${role.color}22` } : undefined}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-pressed={selected}
    >
      <div className="um-role-icon">{role.icon}</div>
      <div className="um-role-subtitle" style={{ color: role.color }}>{role.subtitle}</div>
      <div className="um-role-title">{role.title}</div>
      <p className="um-role-desc">{role.desc}</p>
      <div className="um-role-footer">
        <span className="um-role-scenario-count">{role.scenarios.length} scenarios</span>
        <span className="um-role-cta" style={{ color: role.color }}>
          {selected ? 'Viewing scenarios ↓' : 'Explore →'}
        </span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function UserManualContent() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = ROLES.find((r) => r.id === selectedRoleId) ?? null;

  function handleRoleSelect(id: string) {
    setSelectedRoleId((prev) => (prev === id ? null : id));
  }

  return (
    <>
      <TopNav />
      <Banner />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <div className="um-wrap">

            {/* ── Hero ── */}
            <div className="um-hero">
              <div className="um-hero-overlay" />
              <div className="um-hero-content">
                <div className="um-eyebrow">tMIC · User Manual</div>
                <h1 className="um-hero-title">Role-Based Usage Guide</h1>
                <p className="um-hero-sub">
                  Discover how to navigate tMIC based on your role and daily workflows.
                  Select your role below to explore guided scenarios covering every platform module.
                </p>
              </div>
            </div>

            {/* ── Stats strip ── */}
            <div className="um-stats-strip">
              {STATS.map((s) => (
                <div key={s.label} className="um-stat-item">
                  <span className="um-stat-value">{s.value}</span>
                  <span className="um-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* ── Role selection ── */}
            <div className="um-section">
              <div className="um-section-head">
                <span className="um-eyebrow-sm">Step 1</span>
                <h2 className="um-section-title">Select Your Role</h2>
                <p className="um-section-sub">
                  Each role comes with tailored scenarios that map to the features you use most.
                </p>
              </div>
              <div className="um-roles-grid">
                {ROLES.map((role) => (
                  <RoleCard
                    key={role.id}
                    role={role}
                    selected={selectedRoleId === role.id}
                    onSelect={() => handleRoleSelect(role.id)}
                  />
                ))}
              </div>
            </div>

            {/* ── Scenarios for selected role ── */}
            {selectedRole && (
              <div className="um-section um-section--scenarios">
                <div className="um-section-head">
                  <span className="um-eyebrow-sm" style={{ color: selectedRole.color }}>
                    {selectedRole.icon} {selectedRole.title}
                  </span>
                  <h2 className="um-section-title">Step 2 — Choose a Scenario</h2>
                  <p className="um-section-sub">
                    Click a scenario card to expand the step-by-step guide and discover the recommended pages.
                  </p>
                </div>
                <div className="um-scenarios-list">
                  {selectedRole.scenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      roleColor={selectedRole.color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── All scenarios overview ── */}
            <div className="um-section">
              <div className="um-section-head">
                <span className="um-eyebrow-sm">All Scenarios</span>
                <h2 className="um-section-title">Complete Coverage Map</h2>
                <p className="um-section-sub">
                  Every tMIC module is covered by at least one guided scenario.
                </p>
              </div>
              <div className="um-coverage-grid">
                {ROLES.map((role) =>
                  role.scenarios.map((scenario) => (
                    <div
                      key={`${role.id}-${scenario.id}`}
                      className="um-coverage-card"
                      onClick={() => {
                        setSelectedRoleId(role.id);
                        setTimeout(() => {
                          document.getElementById(`scenario-${scenario.id}`)?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }, 100);
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedRoleId(role.id);
                      }}
                    >
                      <span className="um-coverage-role" style={{ color: role.color }}>
                        {role.icon} {role.title}
                      </span>
                      <span className="um-coverage-title">{scenario.title}</span>
                      <div className="um-coverage-pages">
                        {scenario.pages.map((p) => (
                          <span key={p.href + p.label} className="um-coverage-tag">{p.label}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── CTA ── */}
            <div className="um-cta-section">
              <h2 className="um-cta-title">Ready to Get Started?</h2>
              <p className="um-cta-sub">
                Explore any module directly or use the AI Chatbot (bottom-right) for guided step-by-step navigation.
              </p>
              <div className="um-cta-row">
                <Link href="/company-profile" className="about-site-btn about-site-btn--primary">
                  Start with Company Profile
                </Link>
                <Link href="/about" className="about-site-btn about-site-btn--ghost">
                  Back to About tMIC
                </Link>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
