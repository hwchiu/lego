'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  quickLinks,
  mainNav,
  supplyChainNav,
  bottomLinks,
  sidebarIcons,
  NavItem,
  SubNavItem,
} from '@/app/data/navigation';
import { useWatchlist } from '@/app/contexts/WatchlistContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useMobileSidebar } from '@/app/contexts/MobileSidebarContext';
import { t } from '@/app/data/translations';

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

// Star icon for watchlist favorites
function StarIcon({ filled, onClick }: { filled: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      className={`sidebar-star-btn${filled ? ' starred' : ''}`}
      onClick={onClick}
      aria-label={filled ? 'Remove from favorites' : 'Add to favorites'}
      title={filled ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true">
        {filled ? (
          <path
            d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M7 1.5l1.5 3.3L12.5 5l-2.5 2.6.6 3.7L7 9.6l-3.6 1.7.6-3.7L1.5 5l3.8-.7z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
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
  const { watchlistNames, dynamicWatchlists, deletedWatchlists, favorites, toggleFavorite } = useWatchlist();
  const { lang } = useLanguage();

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setTop(rect.top);
    }
  }, [anchorRef]);

  // Detect if this is the watchlist submenu (contains watchlist-related items)
  const isWatchlistMenu = items.some((item) => item.watchlistId || item.href.startsWith('/watchlist/'));

  // Filter out deleted watchlists from both static items and dynamic lists
  const visibleItems = isWatchlistMenu
    ? items.filter((item) => !item.watchlistId || !deletedWatchlists.has(item.watchlistId))
    : items;
  const visibleDynamic = dynamicWatchlists.filter((wl) => !deletedWatchlists.has(wl.id));

  return (
    <div className="sidebar-submenu" style={{ top }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {visibleItems.map((item) => {
        const defaultLabel = item.watchlistId ? (watchlistNames[item.watchlistId] ?? item.label) : item.label;
        const displayLabel = lang === 'zh' ? t(defaultLabel, 'zh') : defaultLabel;
        const isFav = item.watchlistId ? favorites.has(item.watchlistId) : false;
        return (
          <React.Fragment key={item.label}>
            {item.dividerBefore && isWatchlistMenu && visibleDynamic.length > 0 && (
              // Dynamic watchlists are injected before the divider/create item
              <>
                {visibleDynamic.map((wl) => (
                  <div key={wl.id} className="sidebar-submenu-item sidebar-submenu-item--with-star">
                    <StarIcon
                      filled={favorites.has(wl.id)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(wl.id);
                      }}
                    />
                    <Link href={`/watchlist/${wl.id}`} className="sidebar-submenu-item-link">
                      <span className="sidebar-submenu-label">
                        {watchlistNames[wl.id] ?? wl.name}
                      </span>
                    </Link>
                  </div>
                ))}
                <div className="sidebar-submenu-divider" />
              </>
            )}
            {item.dividerBefore && !isWatchlistMenu && <div className="sidebar-submenu-divider" />}
            {item.dividerBefore && isWatchlistMenu && visibleDynamic.length === 0 && (
              <div className="sidebar-submenu-divider" />
            )}
            <div
              className={`sidebar-submenu-item${item.watchlistId ? ' sidebar-submenu-item--with-star' : ''}`}
            >
              {item.watchlistId && (
                <StarIcon
                  filled={isFav}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFavorite(item.watchlistId!);
                  }}
                />
              )}
              <Link
                href={item.href}
                className={item.watchlistId ? 'sidebar-submenu-item-link' : 'sidebar-submenu-item-link sidebar-submenu-item-link--full'}
              >
                {item.icon && !item.watchlistId && (
                  <svg
                    className="sidebar-submenu-item-icon"
                    viewBox="0 0 14 14"
                    fill="none"
                    width="13"
                    height="13"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: sidebarIcons[item.icon] ?? '' }}
                  />
                )}
                <span className="sidebar-submenu-label">{displayLabel}</span>
                {item.iconRight === 'add' && (
                  <svg
                    className="sidebar-submenu-icon-right"
                    viewBox="0 0 14 14"
                    fill="none"
                    width="13"
                    height="13"
                    aria-hidden="true"
                  >
                    <rect x="1" y="1" width="12" height="12" rx="2" fill="currentColor" fillOpacity="0.18" />
                    <path d="M7 4V10M4 7H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )}
              </Link>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

function QuickLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { lang } = useLanguage();
  const displayLabel = lang === 'zh' ? t(item.label, 'zh') : item.label;
  const isUpcoming = item.badgeStyle === 'coming-soon';
  if (isUpcoming) {
    return (
      <span
        className="sidebar-quick-link sidebar-nav-upcoming"
        title={collapsed ? displayLabel : undefined}
      >
        <NavIcon iconKey={item.icon} />
        {!collapsed && displayLabel}
        {!collapsed && item.badge && (
          <span className="badge-coming-soon">{item.badge}</span>
        )}
      </span>
    );
  }
  return (
    <Link
      href={item.href}
      className="sidebar-quick-link"
      title={collapsed ? displayLabel : undefined}
    >
      <NavIcon iconKey={item.icon} />
      {!collapsed && displayLabel}
      {!collapsed && item.badge && (
        <span
          className={item.badgeStyle === 'coming-soon' ? 'badge-coming-soon' : 'badge-new'}
          style={item.badgeColor ? { background: item.badgeColor } : undefined}
        >
          {item.badge}
        </span>
      )}
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
  const hoverActiveRef = useRef(false);
  const hasSubMenu = item.subItems && item.subItems.length > 0;
  const { lang } = useLanguage();
  const displayLabel = lang === 'zh' ? t(item.label, 'zh') : item.label;

  // An item is active if the current path matches its href, or if any of its sub-items match
  const isActive =
    item.href !== '#' &&
    (pathname === item.href ||
      pathname.startsWith(item.href + '/') ||
      (hasSubMenu && item.subItems!.some((s) => pathname === s.href || pathname.startsWith(s.href + '/'))));

  const openSubmenu = () => {
    hoverActiveRef.current = true;
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (hasSubMenu) setOpen(true);
  };

  const scheduleClose = () => {
    hoverActiveRef.current = false;
    if (hasSubMenu) {
      closeTimerRef.current = setTimeout(() => setOpen(false), 200);
    }
  };

  const toggleSubmenu = (e: React.MouseEvent) => {
    if (!hasSubMenu) return;
    e.preventDefault();
    e.stopPropagation();
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (hoverActiveRef.current) {
      // Desktop: mouse is hovering over the item — the submenu is already open via hover.
      // Keep it open; closing is handled by mouseleave.
      setOpen(true);
    } else {
      // Mobile/touch: no hover, so genuinely toggle open/close.
      setOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const isUpcoming = item.badgeStyle === 'coming-soon';

  return (
    <li
      ref={liRef}
      className={`sidebar-nav-item${isUpcoming ? ' sidebar-nav-item--upcoming' : ''}`}
      onMouseEnter={!isUpcoming ? openSubmenu : undefined}
      onMouseLeave={!isUpcoming ? scheduleClose : undefined}
    >
      {isUpcoming ? (
        <span
          className={isActive ? 'active sidebar-nav-upcoming' : 'sidebar-nav-upcoming'}
          title={collapsed ? displayLabel : undefined}
        >
          <NavIcon iconKey={item.icon} />
          {!collapsed && displayLabel}
          {!collapsed && item.badge && (
            <span className="badge-coming-soon">{item.badge}</span>
          )}
        </span>
      ) : (
        <Link
          href={item.href}
          className={isActive ? 'active' : ''}
          title={collapsed ? displayLabel : undefined}
        >
          <NavIcon iconKey={item.icon} />
          {!collapsed && displayLabel}
          {!collapsed && item.badge && (
            <span
              className={item.badgeStyle === 'coming-soon' ? 'badge-coming-soon' : 'badge-new'}
              style={item.badgeStyle !== 'coming-soon' && item.badgeColor ? { background: item.badgeColor } : undefined}
            >
              {item.badge}
            </span>
          )}
          {!collapsed && hasSubMenu && (
            <button
              className="sidebar-submenu-toggle"
              onClick={toggleSubmenu}
              aria-label={open ? 'Collapse submenu' : 'Expand submenu'}
              aria-expanded={open}
            >
              <svg
                className={`sidebar-submenu-arrow${open ? ' open' : ''}`}
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
            </button>
          )}
        </Link>
      )}
      {open && hasSubMenu && !isUpcoming && (
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
  const pathname = usePathname();
  const { lang } = useLanguage();
  const { isMobileOpen, closeSidebar, isDesktopCollapsed: collapsed, toggleDesktopCollapsed } = useMobileSidebar();
  const toggleLabel = collapsed ? 'Expand menu' : 'Collapse menu';

  // Filter out unreleased quick links ("Explore MIC Picks" and "Collaboration Playground")
  const HIDDEN_QUICK_LINKS = ['Explore MIC Picks', 'Collaboration Playground'];
  const filteredQuickLinks = quickLinks.filter((item) => !HIDDEN_QUICK_LINKS.includes(item.label));

  // When expanded, filteredQuickLinks[0] renders inside the collapse header row,
  // so only the remaining items are listed below.
  // When collapsed, the header shows only the toggle button, so all quickLinks render here.
  const visibleQuickLinks = collapsed ? filteredQuickLinks : filteredQuickLinks.slice(1);

  const mainNavLabel = lang === 'zh' ? '主要導覽' : 'Main Navigation';
  const supplyChainLabel = lang === 'zh' ? '供應鏈分析' : 'Supply Chain Analysis';

  // Close mobile sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} aria-hidden="true" />
      )}
      <nav className={`sidebar${collapsed ? ' collapsed' : ''}${isMobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-quick">
        <div className="sidebar-collapse-header">
          {!collapsed && filteredQuickLinks.length > 0 && <QuickLink item={filteredQuickLinks[0]} collapsed={false} />}
          <button
            className="sidebar-toggle-btn"
            onClick={toggleDesktopCollapsed}
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

      <NavSection label={mainNavLabel} items={mainNav} collapsed={collapsed} pathname={pathname} />
      <div className="sidebar-divider" />
      <NavSection label={supplyChainLabel} items={supplyChainNav} collapsed={collapsed} pathname={pathname} />

      <div className="sidebar-bottom">
        {bottomLinks.map((item) => {
          const label = lang === 'zh' ? t(item.label, 'zh') : item.label;
          const isUpcoming = item.badgeStyle === 'coming-soon';
          if (isUpcoming) {
            return (
              <span
                key={item.label}
                className="sidebar-nav-upcoming"
                title={collapsed ? label : undefined}
              >
                <NavIcon iconKey={item.icon} />
                {!collapsed && label}
                {!collapsed && item.badge && (
                  <span className="badge-coming-soon">{item.badge}</span>
                )}
              </span>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              title={collapsed ? label : undefined}
            >
              <NavIcon iconKey={item.icon} />
              {!collapsed && label}
              {!collapsed && item.badge && (
                <span
                  className={item.badgeStyle === 'coming-soon' ? 'badge-coming-soon' : 'badge-new'}
                  style={item.badgeStyle !== 'coming-soon' && item.badgeColor ? { background: item.badgeColor } : undefined}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
