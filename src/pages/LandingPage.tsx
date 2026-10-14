import { useTheme } from "../hooks/useTheme";
import { BrandLogo } from "../components/BrandLogo";

type RoleChoice = "admin" | "hr" | "employee";

type Props = {
  onSelect: (role: RoleChoice) => void;
};

type Module = { icon: string; label: string };

type RoleCard = {
  role: RoleChoice;
  icon: string;
  title: string;
  badge: string;
  tagline: string;
  modules: Module[];
  accent: string;
  btnLabel: string;
};

const roleCards: RoleCard[] = [
  {
    role: "admin",
    icon: "⚙",
    title: "Administrator",
    badge: "Full Control",
    tagline:
      "Central multi-branch governance, system configurations, and operational audit logs.",
    accent: "admin",
    btnLabel: "Enter Admin Suite",
    modules: [
      { icon: "🛒", label: "Point of Sale" },
      { icon: "📊", label: "Executive Dashboard" },
      { icon: "📦", label: "Inventory Ledger" },
      { icon: "🏪", label: "Branch Network" },
      { icon: "📈", label: "Financial Reports" },
      { icon: "👥", label: "Customer Accounts" },
      { icon: "👤", label: "Employee Profiles" },
      { icon: "💰", label: "Payroll Processing" },
      { icon: "⚙", label: "System Settings" },
    ],
  },
  {
    role: "hr",
    icon: "🧑",
    title: "Human Resources",
    badge: "People & Payroll",
    tagline:
      "Workforce directory, compensation structures, salary slips, and HR analytics.",
    accent: "hr",
    btnLabel: "Enter HR Workspace",
    modules: [
      { icon: "📊", label: "HR Dashboard" },
      { icon: "📈", label: "Workforce Reports" },
      { icon: "👥", label: "Customer Directory" },
      { icon: "👤", label: "Staff Profiles" },
      { icon: "💰", label: "Payroll & Slips" },
    ],
  },
  {
    role: "employee",
    icon: "🧷",
    title: "Store Employee / POS",
    badge: "Daily Operations",
    tagline:
      "High-speed barcode checkout, inventory lookups, customer registers, and daily closing.",
    accent: "employee",
    btnLabel: "Open POS Station",
    modules: [
      { icon: "🛒", label: "Point of Sale" },
      { icon: "📊", label: "Station Dashboard" },
      { icon: "📦", label: "Stock Inquiries" },
      { icon: "🏪", label: "Branch Catalog" },
      { icon: "📈", label: "Shift Reports" },
      { icon: "👥", label: "Customer Lookup" },
    ],
  },
];

const productPillars = [
  {
    icon: "🛒",
    tag: "High-Speed POS",
    title: "Point of Sale Terminal",
    desc: "Built for rapid retail counters with instant barcode scanning, cash drawer sync, split tender, and printable thermal receipts.",
    features: [
      "Barcode & SKU instant lookup",
      "Split tender: Cash, Card & Credit",
      "Per-shift register reconciliation",
      "Custom discounts & receipt notes",
    ],
  },
  {
    icon: "📦",
    tag: "Multi-Branch ERP",
    title: "Enterprise Resource Planning",
    desc: "Unify warehouse stock, multi-store allocation, inter-branch transfer manifests, tax tiers, and automated low-stock warnings.",
    features: [
      "Live multi-branch inventory sync",
      "Automated stock reorder alerts",
      "Inter-store transfer workflows",
      "Comprehensive profit & sales reports",
    ],
  },
  {
    icon: "👥",
    tag: "Automated HRM",
    title: "Human Resource Management",
    desc: "Manage complete employee rosters, department hierarchies, automated tax and bonus calculations, and 1-click payroll ledger dispatch.",
    features: [
      "Staff directory & role assignment",
      "Automated monthly payroll runs",
      "Allowances, bonuses & deductions",
      "Audited salary slips and reports",
    ],
  },
];

const workflowSteps = [
  {
    num: "01",
    icon: "🏪",
    title: "Setup & Catalog",
    desc: "Initialize branches, configure sales tax rates, and populate catalog SKUs with pricing and baseline stock.",
  },
  {
    num: "02",
    icon: "👤",
    title: "Staff Provisioning",
    desc: "Create personnel accounts and assign granular roles — Administrators, HR managers, and store cashiers.",
  },
  {
    num: "03",
    icon: "🛒",
    title: "Point-of-Sale",
    desc: "Process front-line customer transactions with barcode speed, split payments, and real-time inventory deduction.",
  },
  {
    num: "04",
    icon: "💰",
    title: "Payroll Execution",
    desc: "Calculate monthly salaries, apply deductions and bonuses, and generate verifiable payroll records.",
  },
  {
    num: "05",
    icon: "📈",
    title: "Unified Analytics",
    desc: "Inspect executive dashboards, branch profitability metrics, and audit logs to steer business decisions.",
  },
];

const permissionRows = [
  { mod: "Point of Sale (Checkout)", a: true, h: false, e: true },
  { mod: "Operational Dashboard", a: true, h: true, e: true },
  { mod: "Live Inventory & Stock", a: true, h: false, e: true },
  { mod: "Branch Management", a: true, h: false, e: true },
  { mod: "Sales & Audit Reports", a: true, h: true, e: true },
  { mod: "Customer Directory", a: true, h: true, e: true },
  { mod: "Employee Management", a: true, h: true, e: false },
  { mod: "Payroll & Compensation", a: true, h: true, e: false },
  { mod: "System Configurations", a: true, h: false, e: false },
];

export function LandingPage({ onSelect }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <main className="landing-page">
      {/* Floating Theme Toggle (No Navbar) */}
      <button
        className="landing-theme-toggle"
        onClick={toggle}
        aria-label="Toggle dark mode"
        title="Toggle color theme"
      >
        {theme === "light" ? "☾" : "☀"}
      </button>

      <div className="landing-shell">
        {/* ================= HERO SECTION ================= */}
        <section className="landing-hero">
          {/* WorkNest Logo without any top badge */}
          <BrandLogo
            className="landing-hero-logo"
            alt="WorkNest — ERP, POS & HRM System"
          />

          <h1 className="landing-hero-title">
            Unified Enterprise{" "}
            <span className="landing-hero-title-accent">
              ERP, POS &amp; HRM
            </span>{" "}
            System
          </h1>

          <p className="landing-hero-subtitle">
            One fluid platform to run multi-branch retail checkout, real-time
            warehouse inventory, employee operations, and automated payroll
            without external dependencies.
          </p>

          {/* Quick workspace launch buttons */}
          <div className="landing-hero-actions">
            <button
              className="landing-btn landing-btn-primary"
              onClick={() => onSelect("admin")}
            >
              <span>Launch Administrator Suite</span>
              <span>→</span>
            </button>
            <button
              className="landing-btn landing-btn-secondary"
              onClick={() => onSelect("employee")}
            >
              <span>Open POS Terminal</span>
            </button>
            <button
              className="landing-btn landing-btn-secondary"
              onClick={() => onSelect("hr")}
            >
              <span>HR &amp; Payroll Workspace</span>
            </button>
          </div>

          {/* Key Metrics Strip */}
          <div className="landing-metrics-strip">
            <div className="landing-metric-cell">
              <span className="landing-metric-value">9</span>
              <span className="landing-metric-label">Core Modules</span>
            </div>
            <div className="landing-metric-cell">
              <span className="landing-metric-value">3</span>
              <span className="landing-metric-label">Role Workspaces</span>
            </div>
            <div className="landing-metric-cell">
              <span className="landing-metric-value">Real-Time</span>
              <span className="landing-metric-label">
                Inventory &amp; Sales
              </span>
            </div>
            <div className="landing-metric-cell">
              <span className="landing-metric-value">Multi-Store</span>
              <span className="landing-metric-label">Branch Sync</span>
            </div>
          </div>

          {/* CSS-Only Live Operations Mockup (Zero Images) */}
          <div className="landing-mockup-frame">
            <div className="landing-mockup-bar">
              <div className="landing-mockup-dots">
                <span className="landing-mockup-dot" />
                <span className="landing-mockup-dot" />
                <span className="landing-mockup-dot" />
              </div>
              <span className="landing-mockup-title">
                WorkNest Operational Console v2.0
              </span>
              <div className="landing-mockup-status">
                <span className="landing-mockup-dot landing-mockup-dot-active" />
                <span>ONLINE &bull; DOWNTOWN BRANCH</span>
              </div>
            </div>

            <div className="landing-mockup-grid">
              {/* Mock POS Terminal */}
              <div className="landing-mockup-panel">
                <div className="landing-panel-head">
                  <h4>
                    <span>🛒</span> POS Station #01
                  </h4>
                  <span className="landing-tag landing-tag-green">
                    ACTIVE REGISTER
                  </span>
                </div>
                <div className="landing-panel-row">
                  <span>Ticket #TX-8924</span>
                  <strong>Cashier John</strong>
                </div>
                <div className="landing-panel-row">
                  <span>Wireless Barcode Scanner</span>
                  <strong>$85.00</strong>
                </div>
                <div className="landing-panel-row">
                  <span>Thermal Receipt Rolls (5pk)</span>
                  <strong>$18.50</strong>
                </div>
                <div className="landing-panel-row landing-panel-total">
                  <span>Total (inc. tax)</span>
                  <span className="total-amount">$103.50</span>
                </div>
              </div>

              {/* Mock ERP Inventory Monitor */}
              <div className="landing-mockup-panel">
                <div className="landing-panel-head">
                  <h4>
                    <span>📦</span> Multi-Branch ERP
                  </h4>
                  <span className="landing-tag">STOCK RADAR</span>
                </div>
                <div className="landing-panel-row">
                  <span>SKU-4028 Ergonomic Chairs</span>
                  <strong>42 Units</strong>
                </div>
                <div className="landing-panel-row">
                  <span>SKU-1092 Thermal Paper</span>
                  <span className="landing-tag landing-tag-warn">8 LEFT</span>
                </div>
                <div className="landing-panel-row">
                  <span>Branch Transfer #TR-104</span>
                  <strong>Dispatched ➔</strong>
                </div>
                <div className="landing-panel-row landing-panel-total">
                  <span>Sync Status</span>
                  <strong style={{ color: "var(--accent-ok)" }}>
                    All Branches In Sync
                  </strong>
                </div>
              </div>

              {/* Mock HRM Payroll Status */}
              <div className="landing-mockup-panel">
                <div className="landing-panel-head">
                  <h4>
                    <span>💰</span> HRM &amp; Payroll
                  </h4>
                  <span className="landing-tag landing-tag-green">
                    VERIFIED
                  </span>
                </div>
                <div className="landing-panel-row">
                  <span>Active Headcount</span>
                  <strong>48 Staff Members</strong>
                </div>
                <div className="landing-panel-row">
                  <span>Current Pay Cycle</span>
                  <strong>October 2026</strong>
                </div>
                <div className="landing-progress-track">
                  <div
                    className="landing-progress-fill"
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="landing-panel-row landing-panel-total">
                  <span>Payroll Dispatched</span>
                  <span className="total-amount">$142,800.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3 CORE SUITE PILLARS ================= */}
        <section className="landing-section">
          <div className="landing-section-head">
            <span className="landing-section-step">
              The 3-In-1 Architecture
            </span>
            <h2>Complete Enterprise Coverage</h2>
            <p>
              Replace fragmented tools with a unified suite tailored for retail
              chains, franchise operations, and growing organizations.
            </p>
          </div>

          <div className="landing-pillars-grid">
            {productPillars.map((pillar) => (
              <div className="landing-pillar-card" key={pillar.title}>
                <div className="landing-pillar-top">
                  <span className="landing-pillar-icon">{pillar.icon}</span>
                  <span className="landing-tag">{pillar.tag}</span>
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.desc}</p>
                <ul className="landing-pillar-features">
                  {pillar.features.map((feat) => (
                    <li key={feat}>
                      <span className="landing-check-bullet">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ================= WORKSPACE SELECTION ================= */}
        <section className="landing-section">
          <div className="landing-section-head">
            <span className="landing-section-step">
              01 &bull; Select Workspace
            </span>
            <h2>Choose Your Operator Role</h2>
            <p>
              Select your designated profile below to launch your tailored
              environment with role-specific views and tools.
            </p>
          </div>

          <div className="landing-roles-grid">
            {roleCards.map((card) => (
              <div
                key={card.role}
                className={`landing-role-card landing-role-${card.accent}`}
                onClick={() => onSelect(card.role)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(card.role);
                  }
                }}
              >
                <div className="landing-role-header">
                  <span className="landing-role-icon">{card.icon}</span>
                  <span className="landing-tag">{card.badge}</span>
                </div>

                <h3>{card.title}</h3>
                <p className="landing-role-tagline">{card.tagline}</p>

                <ul className="landing-module-list">
                  {card.modules.map((mod) => (
                    <li className="landing-module-item" key={mod.label}>
                      <span className="landing-module-icon">{mod.icon}</span>
                      <span>{mod.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="landing-role-footer">
                  <span>{card.btnLabel}</span>
                  <span className="landing-role-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================= OPERATIONAL WORKFLOW ================= */}
        <section className="landing-section">
          <div className="landing-section-head">
            <span className="landing-section-step">
              02 &bull; Execution Pipeline
            </span>
            <h2>How WorkNest Powers Operations</h2>
            <p>
              A continuous, auditable operational flow from store opening and
              staff scheduling to checkout and financial closing.
            </p>
          </div>

          <div className="landing-workflow-flow">
            {workflowSteps.map((step) => (
              <div className="landing-step-card" key={step.num}>
                <span className="landing-step-num">{step.num}</span>
                <span className="landing-step-icon">{step.icon}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ROLE PERMISSIONS MATRIX ================= */}
        <section className="landing-section">
          <div className="landing-section-head">
            <span className="landing-section-step">
              03 &bull; Access Governance
            </span>
            <h2>Role Permissions Matrix</h2>
            <p>
              Granular access control ensures that sensitive data, executive
              financials, and payroll stay protected while giving store staff
              maximum checkout velocity.
            </p>
          </div>

          <div className="landing-matrix-card">
            <div className="landing-matrix-row landing-matrix-head">
              <span>Operational Module</span>
              <span className="landing-matrix-cell">Administrator</span>
              <span className="landing-matrix-cell">Human Resources</span>
              <span className="landing-matrix-cell">Store Employee</span>
            </div>

            {permissionRows.map((row) => (
              <div className="landing-matrix-row" key={row.mod}>
                <span className="landing-matrix-module">{row.mod}</span>
                <span
                  className={`landing-matrix-cell ${row.a ? "landing-matrix-yes" : "landing-matrix-no"}`}
                >
                  {row.a ? "✓" : "—"}
                </span>
                <span
                  className={`landing-matrix-cell ${row.h ? "landing-matrix-yes" : "landing-matrix-no"}`}
                >
                  {row.h ? "✓" : "—"}
                </span>
                <span
                  className={`landing-matrix-cell ${row.e ? "landing-matrix-yes" : "landing-matrix-no"}`}
                >
                  {row.e ? "✓" : "—"}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ================= FOOTER & LEGAL NOTICE ================= */}
      <footer className="landing-footer">
        <div className="landing-shell">
          <div className="landing-footer-top">
            <div className="landing-footer-brand">
              <BrandLogo className="landing-footer-logo" alt="WorkNest Logo" />
              <span className="landing-footer-title">
                WorkNest ERP &bull; POS &bull; HRM
              </span>
            </div>

            <div className="landing-footer-links">
              <button
                className="landing-footer-link"
                onClick={() => onSelect("admin")}
              >
                Admin Suite
              </button>
              <button
                className="landing-footer-link"
                onClick={() => onSelect("hr")}
              >
                HR &amp; Payroll
              </button>
              <button
                className="landing-footer-link"
                onClick={() => onSelect("employee")}
              >
                POS Register
              </button>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <div className="landing-footer-legal-bar">
              <div>
                <span>Powered by Quibble Byte</span>
                <span> &bull; </span>
                <span>Private Operator Workspace</span>
              </div>
              <span className="landing-license-badge">
                MIT License &bull; Quibble Byte &amp; Muhammad Ahmed
              </span>
            </div>

            <p className="landing-footer-disclaimer">
              Notice: Unauthorized or illegal use of this product or code is
              strictly prohibited. The author and repository owner (Muhammad
              Ahmed) assumes no liability or responsibility for improper usage
              or downstream deployment damages.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
