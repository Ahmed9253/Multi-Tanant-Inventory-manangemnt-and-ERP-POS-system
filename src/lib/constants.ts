import type { Role, View } from "../types";

export const categories = [
  "All items",
  "Coffee",
  "Bakery",
  "Drinks",
  "Pantry",
] as const;

export const productCategories = categories.slice(1);

export const paymentMethods = ["Card", "Cash", "Other"] as const;

export const paymentIcons: Record<string, string> = {
  Card: "▣",
  Cash: "◫",
  Other: "•••",
};

export type NavItem = { view: View; icon: string; label: string };
export type NavGroup = { group: string; items: NavItem[] };

export const navGroups: NavGroup[] = [
  {
    group: "POS",
    items: [
      { view: "sell", icon: "🛒", label: "Sell" },
      { view: "dashboard", icon: "📊", label: "Dashboard" },
    ],
  },
  {
    group: "Management",
    items: [
      { view: "inventory", icon: "📦", label: "Inventory" },
      { view: "branches", icon: "🏪", label: "Branches" },
      { view: "reports", icon: "📈", label: "Reports" },
      { view: "customers", icon: "👥", label: "Customers" },
    ],
  },
  {
    group: "HRM",
    items: [
      { view: "employees", icon: "👤", label: "Employees" },
      { view: "payroll", icon: "💰", label: "Payroll" },
    ],
  },
  {
    group: "System",
    items: [{ view: "settings", icon: "⚙", label: "Settings" }],
  },
];

const roleAccess: Record<Role, View[]> = {
  admin: [
    "sell",
    "dashboard",
    "inventory",
    "branches",
    "reports",
    "customers",
    "employees",
    "payroll",
    "settings",
  ],
  hr: ["dashboard", "reports", "customers", "employees", "payroll"],
  manager: [
    "sell",
    "dashboard",
    "inventory",
    "branches",
    "reports",
    "customers",
  ],
  cashier: ["sell", "dashboard"],
};

export function getNavGroupsForRole(role: Role): NavGroup[] {
  const allowed = roleAccess[role];
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => allowed.includes(item.view)),
    }))
    .filter((group) => group.items.length > 0);
}

export function getDefaultView(role: Role): View {
  return roleAccess[role][0];
}

export function canAccess(role: Role, view: View): boolean {
  return roleAccess[role].includes(view);
}

export const employeeRoles: { value: "hr" | "cashier" | "manager"; label: string }[] = [
  { value: "cashier", label: "Cashier" },
  { value: "manager", label: "Manager" },
  { value: "hr", label: "HR" },
];

export const departments = [
  "Sales",
  "Operations",
  "Human Resources",
  "Administration",
  "IT",
] as const;

export const productColors = [
  "rose",
  "mint",
  "gold",
  "peach",
  "lavender",
  "sky",
  "plum",
  "olive",
] as const;

export const defaultSettings = {
  taxRate: 0.08,
  storeName: "WorkNest",
  currency: "$",
} as const;

export const lowStockThreshold = 5;
