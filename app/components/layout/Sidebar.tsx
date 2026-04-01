'use client';

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

function QuickLink({ item }: { item: NavItem }) {
  return (
    <Link href={item.href} className="sidebar-quick-link">
      <NavIcon iconKey={item.icon} />
      {item.label}
      {item.badge && <span className="badge-new">{item.badge}</span>}
    </Link>
  );
}

function NavSection({
  label,
  items,
}: {
  label?: string;
  items: NavItem[];
}) {
  return (
    <>
      {label && <div className="sidebar-section-label">{label}</div>}
      <ul className="sidebar-nav">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className={item.active ? 'active' : ''}
            >
              <NavIcon iconKey={item.icon} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-quick">
        {quickLinks.map((item) => (
          <QuickLink key={item.label} item={item} />
        ))}
      </div>

      <NavSection label="主要導航菜單" items={mainNav} />
      <div className="sidebar-divider" />
      <NavSection label="Target Company Group" items={targetCompanyNav} />
      <div className="sidebar-divider" />
      <NavSection label="Supply Chain Ecosystems" items={supplyChainNav} />

      <div className="sidebar-bottom">
        {bottomLinks.map((item) => (
          <Link key={item.label} href={item.href}>
            <NavIcon iconKey={item.icon} />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
