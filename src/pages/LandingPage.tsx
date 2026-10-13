import { useTheme } from "../hooks/useTheme";

type RoleChoice = "admin" | "hr" | "employee";

type Props = {
  onSelect: (role: RoleChoice) => void;
};

type Module = { icon: string; label: string };

type RoleCard = {
  role: RoleChoice;
  icon: string;
  title: string;
  tagline: string;
  modules: Module[];
  accent: string;
};

const roleCards: RoleCard[] = [
  {
    role: "admin",
    icon: "⚙",
    title: "Administrator",
    tagline: "Full system control",
    accent: "admin",
    modules: [
      { icon: "🛒", label: "Point of Sale" },
      { icon: "📊", label: "Dashboard" },
      { icon: "📦", label: "Inventory" },
      { icon: "🏪", label: "Branches" },
      { icon: "📈", label: "Reports" },
      { icon: "👥", label: "Customers" },
      { icon: "👤", label: "Employees" },
      { icon: "💰", label: "Payroll" },
      { icon: "⚙", label: "Settings" },
    ],
  },
  {
    role: "hr",
    icon: "🧑",
    title: "Human Resources",
    tagline: "People & payroll",
    accent: "hr",
    modules: [
      { icon: "📊", label: "Dashboard" },
      { icon: "📈", label: "Reports" },
      { icon: "👥", label: "Customers" },
      { icon: "👤", label: "Employees" },
      { icon: "💰", label: "Payroll" },
    ],
  },
  {
    role: "employee",
    icon: "🧷",
    title: "Employee",
    tagline: "Daily operations",
    accent: "employee",
    modules: [
      { icon: "🛒", label: "Point of Sale" },
      { icon: "📊", label: "Dashboard" },
      { icon: "📦", label: "Inventory" },
      { icon: "🏪", label: "Branches" },
      { icon: "📈", label: "Reports" },
      { icon: "👥", label: "Customers" },
    ],
  },
];

const workflowSteps: { num: string; icon: string; title: string; desc: string }[] = [
  {
    num: "01",
    icon: "🏪",
    title: "Setup",
    desc: "Admin creates branches and configures inventory, tax rates, and system settings.",
  },
  {
    num: "02",
    icon: "👤",
    title: "Staff",
    desc: "Admin creates employee accounts — HR staff, branch managers, and cashiers with role-based access.",
  },
  {
    num: "03",
    icon: "💰",
    title: "Payroll",
    desc: "HR manages employee records, generates monthly payroll, and tracks bonus and deductions.",
  },
  {
    num: "04",
    icon: "🛒",
    title: "Operate",
    desc: "Employees handle point-of-sale transactions, manage inventory, and serve customers daily.",
  },
  {
    num: "05",
    icon: "📈",
    title: "Analyze",
    desc: "Admins and HR review reports, sales analytics, and operational metrics to make decisions.",
  },
];

const highlights: { icon: string; title: string; desc: string }[] = [
  {
    icon: "🏪",
    title: "Branch-first",
    desc: "Run one store or many from a single workspace with per-branch switching.",
  },
  {
    icon: "📦",
    title: "Live inventory",
    desc: "Stock, pricing, and low-stock alerts stay accurate with every sale.",
  },
  {
    icon: "🛡",
    title: "Role-based access",
    desc: "Admins, HR, and employees each see only the tools they need.",
  },
];

const permissionRows = [
  { mod: "Point of Sale", a: true, h: false, e: true },
  { mod: "Dashboard", a: true, h: true, e: true },
  { mod: "Inventory", a: true, h: false, e: true },
  { mod: "Branches", a: true, h: false, e: true },
  { mod: "Reports", a: true, h: true, e: true },
  { mod: "Customers", a: true, h: true, e: true },
  { mod: "Employees", a: true, h: true, e: false },
  { mod: "Payroll", a: true, h: true, e: false },
  { mod: "Settings", a: true, h: false, e: false },
];

export function LandingPage({ onSelect }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <main className="landing-page">
      <header className="landing-topbar">
        <div className="landing-brand">
          <span className="landing-brand-mark">◌</span>
          <div>
            <strong>WorkNest</strong>
            <small>ERP · POS · HRM</small>
          </div>
        </div>
        <div className="landing-topbar-actions">
          <span className="landing-topbar-tag">Private operator workspace</span>
          <button
            className="landing-theme-toggle"
            onClick={toggle}
            aria-label="Toggle dark mode"
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <span className="landing-hero-badge">
          <span className="landing-hero-badge-dot" />
          Billing, inventory &amp; people in one place
        </span>
        <span className="landing-hero-mark">◌</span>
        <h1 className="landing-hero-title">WorkNest</h1>
        <p className="landing-hero-tagline">
          The complete ERP, POS &amp; HRM platform
        </p>
        <p className="landing-hero-sub">
          One system for sales, inventory, branches, employees, and payroll.
          Choose your role to enter the workspace.
        </p>
        <div className="landing-hero-stats">
          <div className="landing-hero-stat">
            <strong>9</strong>
            <span>Modules</span>
          </div>
          <div className="landing-hero-stat">
            <strong>3</strong>
            <span>Roles</span>
          </div>
          <div className="landing-hero-stat">
            <strong>1</strong>
            <span>Workspace</span>
          </div>
        </div>
      </section>

      <section className="landing-highlights">
        {highlights.map((item) => (
          <article className="highlight-card" key={item.title}>
            <span className="highlight-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="landing-roles">
        <div className="landing-section-header">
          <span className="landing-section-num">01</span>
          <h2>Choose your workspace</h2>
        </div>
        <div className="landing-cards">
          {roleCards.map((card) => (
            <button
              key={card.role}
              className={`landing-card landing-card-${card.accent}`}
              onClick={() => onSelect(card.role)}
            >
              <div className="landing-card-header">
                <span className="landing-card-icon">{card.icon}</span>
                <div>
                  <strong>{card.title}</strong>
                  <small>{card.tagline}</small>
                </div>
              </div>
              <ul className="landing-card-list">
                {card.modules.map((mod) => (
                  <li key={mod.label} className="landing-list-item">
                    <span className="landing-list-icon">{mod.icon}</span>
                    <span className="landing-list-text">{mod.label}</span>
                  </li>
                ))}
              </ul>
              <div className="landing-card-cta">
                <span>Sign in</span>
                <span className="landing-card-arrow">→</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="landing-workflow">
        <div className="landing-section-header">
          <span className="landing-section-num">02</span>
          <h2>How it works</h2>
        </div>
        <div className="workflow-list">
          {workflowSteps.map((step, index) => (
            <div className="workflow-list-item" key={step.num}>
              <div className="workflow-list-marker">
                <span className="workflow-list-num">{step.num}</span>
                {index < workflowSteps.length - 1 && (
                  <span className="workflow-list-line" />
                )}
              </div>
              <div className="workflow-list-body">
                <div className="workflow-list-title">
                  <span className="workflow-list-icon">{step.icon}</span>
                  <h3>{step.title}</h3>
                </div>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-permissions">
        <div className="landing-section-header">
          <span className="landing-section-num">03</span>
          <h2>Role permissions</h2>
        </div>
        <div className="permissions-table">
          <div className="permissions-row permissions-head">
            <span>Module</span>
            <span className="permissions-role permissions-role-admin">Admin</span>
            <span className="permissions-role permissions-role-hr">HR</span>
            <span className="permissions-role permissions-role-employee">
              Employee
            </span>
          </div>
          {permissionRows.map((row) => (
            <div className="permissions-row" key={row.mod}>
              <span className="permissions-mod">{row.mod}</span>
              <span className={row.a ? "perm-yes" : "perm-no"}>
                {row.a ? "✓" : "—"}
              </span>
              <span className={row.h ? "perm-yes" : "perm-no"}>
                {row.h ? "✓" : "—"}
              </span>
              <span className={row.e ? "perm-yes" : "perm-no"}>
                {row.e ? "✓" : "—"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="landing-footer-brand">
          <span className="landing-footer-mark">◌</span>
          <strong>WorkNest ERP System</strong>
        </div>
        <div className="landing-footer-meta">
          <span>Powered by Quibble Byte</span>
          <span className="landing-footer-dot" />
          <span>Private operator workspace</span>
        </div>
      </footer>
    </main>
  );
}
