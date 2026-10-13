import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { getNavGroupsForRole } from "../lib/constants";
import { BrandLogo } from "../components/BrandLogo";
import type { View } from "../types";

type Props = {
  view: View;
  setView: (view: View) => void;
};

export function Sidebar({ view, setView }: Props) {
  const { settings } = useStore();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const groups = user ? getNavGroupsForRole(user.role) : [];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BrandLogo className="sidebar-brand-logo" />
        <div>
          <strong>{settings.storeName}</strong>
          <small>ERP System</small>
        </div>
      </div>
      <nav className="sidebar-nav">
        {groups.map((group) => (
          <div className="sidebar-group" key={group.group}>
            <p className="sidebar-group-label">{group.group}</p>
            {group.items.map((item) => (
              <button
                key={item.view}
                className={`sidebar-item ${view === item.view ? "active" : ""}`}
                onClick={() => setView(item.view)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div
          className="theme-toggle-switch"
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Toggle dark mode"
        >
          <span className="theme-toggle-icon sun">☀</span>
          <span className="theme-toggle-icon moon">☾</span>
          <span className={`theme-toggle-slider ${theme}`} />
        </div>
        <div className="sidebar-user">
          <span className="sidebar-avatar">
            {user?.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </div>
        </div>
      </div>
    </aside>
  );
}
