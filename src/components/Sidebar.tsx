import { ChevronLeft, ChevronRight, Menu, Sparkles } from 'lucide-react';
import type { MenuItem } from '../settings/settings';

type SidebarProps = {
  menus: MenuItem[];
  activeMenuId: string | null;
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onCloseMobile: () => void;
  onSelect: (menu: MenuItem) => void;
};

export function Sidebar({
  menus,
  activeMenuId,
  collapsed,
  mobileOpen,
  onToggle,
  onCloseMobile,
  onSelect,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" onClick={onCloseMobile} aria-label="Close menu" />}
      <aside className={`sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}>
        <div className="sidebar-heading">
          <div className="sidebar-title">
            <Menu size={20} />
            {!collapsed && <span>Menu</span>}
          </div>
          <button
            className="icon-button sidebar-toggle"
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
        <nav className="menu-list" aria-label="AIC destinations">
          {menus.map((menu, index) => (
            <button
              className={`menu-item ${activeMenuId === menu.id ? 'is-active' : ''}`}
              type="button"
              key={menu.id}
              onClick={() => onSelect(menu)}
              aria-label={menu.label}
              title={collapsed ? menu.label : undefined}
            >
              <span className="menu-icon" aria-hidden="true">
                {collapsed ? menu.label.slice(0, 1).toUpperCase() : <Sparkles size={15} />}
              </span>
              {!collapsed && <span className="menu-label">{menu.label}</span>}
              {!collapsed && <span className="menu-index">0{index + 1}</span>}
            </button>
          ))}
        </nav>
        {!collapsed && (
          <div className="sidebar-footnote">
            <span className="status-dot" />
            Galaxy workspace
          </div>
        )}
      </aside>
    </>
  );
}
