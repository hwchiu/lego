'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  quickLinks,
  mainNav,
  targetCompanyNav,
  supplyChainNav,
  bottomLinks,
  sidebarIcons,
  NavItem,
  SubNavItem,
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

function SubMenu({
  items,
  anchorRef,
  onMouseEnter,
  onMouseLeave,
}: {
  items: SubNavItem[];
  anchorRef: React.RefObject<HTMLLIElement | null>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const [top, setTop] = useState(0);

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setTop(rect.top);
    }
  }, [anchorRef]);

  return (
    <div className="sidebar-submenu" style={{ top }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {items.map((item) => (
        <React.Fragment key={item.label}>
          {item.dividerBefore && <div className="sidebar-submenu-divider" />}
          <Link href={item.href} className="sidebar-submenu-item">
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </div>
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

function NavItemRow({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasSubMenu = item.subItems && item.subItems.length > 0;

  // An item is active if the current path matches its href, or if any of its sub-items match
  const isActive =
    item.href !== '#' &&
    (pathname === item.href ||
      pathname.startsWith(item.href + '/') ||
      (hasSubMenu && item.subItems!.some((s) => pathname === s.href || pathname.startsWith(s.href + '/'))));

  const openSubmenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (hasSubMenu) setOpen(true);
  };

  const scheduleClose = () => {
    if (hasSubMenu) {
      closeTimerRef.current = setTimeout(() => setOpen(false), 200);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  return (
    <li
      ref={liRef}
      className="sidebar-nav-item"
      onMouseEnter={openSubmenu}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={item.href}
        className={isActive ? 'active' : ''}
        title={collapsed ? item.label : undefined}
      >
        <NavIcon iconKey={item.icon} />
        {!collapsed && item.label}
        {!collapsed && hasSubMenu && (
          <svg
            className="sidebar-submenu-arrow"
            viewBox="0 0 14 14"
            fill="none"
            width="10"
            height="10"
            aria-hidden="true"
          >
            <path
              d="M5 2.5L9.5 7L5 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Link>
      {open && hasSubMenu && (
        <SubMenu
          items={item.subItems!}
          anchorRef={liRef}
          onMouseEnter={openSubmenu}
          onMouseLeave={scheduleClose}
        />
      )}
    </li>
  );
}

function NavSection({
  label,
  items,
  collapsed,
  pathname,
}: {
  label?: string;
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
}) {
  return (
    <>
      {!collapsed && label && <div className="sidebar-section-label">{label}</div>}
      <ul className="sidebar-nav">
        {items.map((item) => (
          <NavItemRow key={item.label} item={item} collapsed={collapsed} pathname={pathname} />
        ))}
      </ul>
    </>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
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

      <NavSection label="Main Navigation" items={mainNav} collapsed={collapsed} pathname={pathname} />
      <div className="sidebar-divider" />
      <NavSection label="Target Company Group" items={targetCompanyNav} collapsed={collapsed} pathname={pathname} />
      <div className="sidebar-divider" />
      <NavSection label="Supply Chain Ecosystems" items={supplyChainNav} collapsed={collapsed} pathname={pathname} />

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
