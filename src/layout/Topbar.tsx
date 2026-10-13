import { useEffect, useRef, useState } from "react";
import type { View } from "../types";
import { lowStockThreshold } from "../lib/constants";
import { formatDateTime } from "../lib/format";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { NotificationsDropdown } from "../components/NotificationsDropdown";

type Props = {
  view: View;
  setView: (view: View) => void;
  theme: string;
  onToggleTheme: () => void;
  now: Date;
  onOpenPalette: () => void;
};

export function Topbar({
  view,
  setView,
  theme,
  onToggleTheme,
  now,
  onOpenPalette,
}: Props) {
  const {
    branches,
    activeBranch,
    activeBranchId,
    setActiveBranchId,
    products,
    settings,
  } = useStore();
  const { user, logout } = useAuth();
  const [branchOpen, setBranchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const branchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const lowStockCount = products.filter(
    (item) => item.stock <= lowStockThreshold,
  ).length;

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (branchRef.current && !branchRef.current.contains(event.target as Node))
        setBranchOpen(false);
      if (userRef.current && !userRef.current.contains(event.target as Node))
        setUserOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{view}</h1>
      </div>
      <div
        className={`store-status ${branches.length > 1 ? "clickable" : ""}`}
        ref={branchRef}
        onClick={() => branches.length > 1 && setBranchOpen((open) => !open)}
      >
        <span className="status-dot" /> {activeBranch?.name || "Current branch"}
        {branches.length > 1 && <span className="branch-caret">▾</span>}
        <span className="divider" /> <span className="muted">Register 01</span>
        {branchOpen && (
          <div className="branch-switcher">
            {branches.map((branch) => (
              <button
                key={branch._id}
                className={branch._id === activeBranchId ? "active" : ""}
                onClick={() => {
                  setActiveBranchId(branch._id);
                  setBranchOpen(false);
                  setView("sell");
                }}
              >
                <span className="status-dot" /> {branch.name}
                <small>{branch.code}</small>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="top-actions">
        <button
          className="icon-button search-trigger"
          title="Quick search"
          onClick={onOpenPalette}
        >
          ⌕
        </button>
        <time className="live-clock" dateTime={now.toISOString()}>
          {formatDateTime(now)}
        </time>
        <button
          className="icon-button theme-toggle"
          title="Toggle dark mode"
          onClick={onToggleTheme}
        >
          {theme === "light" ? "☾" : "☀"}
        </button>
        <div className="notif-wrapper">
          <button
            className="icon-button notif-button"
            title="Notifications"
            onClick={() => setNotifOpen((open) => !open)}
          >
            ♧
            {lowStockCount > 0 && (
              <span className="notif-badge">{lowStockCount}</span>
            )}
          </button>
          {notifOpen && (
            <NotificationsDropdown
              products={products}
              onClose={() => setNotifOpen(false)}
              onNavigateInventory={() => {
                setNotifOpen(false);
                setView("inventory");
              }}
              currency={settings.currency}
            />
          )}
        </div>
        <div className="user-wrapper" ref={userRef}>
          <button
            className="avatar"
            title="User menu"
            onClick={() => setUserOpen((open) => !open)}
          >
            {user?.name.slice(0, 2).toUpperCase() || "AM"}
          </button>
          {userOpen && (
            <div className="user-dropdown">
              <div className="user-info">
                <strong>{user?.name}</strong>
                <small>{user?.email}</small>
                <span className={`role-badge role-${user?.role}`}>
                  {user?.role}
                </span>
              </div>
              <button className="user-menu-item" onClick={logout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
