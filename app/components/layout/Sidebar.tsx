'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  quickLinks,
  mainNav,
  targetCompanyNav,
  supplyChainNav,
  bottomLinks,
  sidebarIcons,
  NavItem,
} from '@/app/data/navigation';

function NavIcon({ iconKey }: { iconKey: string }) {
  const svgContent = sidebarIcons[iconKey] || '';
  return (
    <svg
      className="ni"
      viewBox="0 0 14 14"
      fill="none"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
      {direction === 'left' ? (
        <path
          d="M9 2.5L4.5 7L9 11.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M5 2.5L9.5 7L5 11.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function QuickLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  return (
    <Link
      href={item.href}
      className="sidebar-quick-link"
      title={collapsed ? item.label : undefined}
    >
      <NavIcon iconKey={item.icon} />
      {!collapsed && item.label}
      {!collapsed && item.badge && <span className="badge-new">{item.badge}</span>}
    </Link>
  );
}

function NavSection({
  label,
  items,
  collapsed,
}: {
  label?: string;
  items: NavItem[];
  collapsed: boolean;
}) {
  return (
    <>
      {!collapsed && label && <div className="sidebar-section-label">{label}</div>}
      <ul className="sidebar-nav">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={item.active ? 'active' : ''}
              title={collapsed ? item.label : undefined}
            >
              <NavIcon iconKey={item.icon} />
              {!collapsed && item.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const toggleLabel = collapsed ? '展開選單' : '收合選單';
  // When expanded, quickLinks[0] renders inside the collapse header row,
  // so only the remaining items are listed below.
  // When collapsed, the header shows only the toggle button, so all quickLinks render here.
  const visibleQuickLinks = collapsed ? quickLinks : quickLinks.slice(1);

  return (
    <nav className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-quick">
        <div className="sidebar-collapse-header">
          {!collapsed && <QuickLink item={quickLinks[0]} collapsed={false} />}
          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={toggleLabel}
            aria-label={toggleLabel}
          >
            <ChevronIcon direction={collapsed ? 'right' : 'left'} />
          </button>
        </div>
        {visibleQuickLinks.map((item) => (
          <QuickLink key={item.label} item={item} collapsed={collapsed} />
        ))}
      </div>

      <NavSection label="主要導航菜單" items={mainNav} collapsed={collapsed} />
      <div className="sidebar-divider" />
      <NavSection label="Target Company Group" items={targetCompanyNav} collapsed={collapsed} />
      <div className="sidebar-divider" />
      <NavSection label="Supply Chain Ecosystems" items={supplyChainNav} collapsed={collapsed} />

      <div className="sidebar-bottom">
        {bottomLinks.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            title={collapsed ? item.label : undefined}
          >
            <NavIcon iconKey={item.icon} />
            {!collapsed && item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
