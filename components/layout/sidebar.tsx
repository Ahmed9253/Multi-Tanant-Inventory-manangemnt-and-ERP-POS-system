"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hooks/use-store";
import { Logo } from "@/components/logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Building2,
  Contact,
  Truck,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  Bell,
  ClipboardList,
  CreditCard,
  History,
  Briefcase,
  CalendarDays,
  CalendarOff,
  Wallet,
  UserSquare2,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  section?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "OVERVIEW" },
  { label: "POS", href: "/pos", icon: ShoppingCart, permission: "pos.use", section: "OPERATIONS" },
  { label: "Sales", href: "/sales", icon: Receipt, permission: "sales.view", section: "OPERATIONS" },
  { label: "Products", href: "/products", icon: Package, permission: "products.view", section: "OPERATIONS" },
  { label: "Categories", href: "/categories", icon: ClipboardList, permission: "categories.view", section: "OPERATIONS" },
  { label: "Inventory", href: "/inventory", icon: Warehouse, permission: "inventory.view", section: "OPERATIONS" },
  { label: "Purchases", href: "/purchases", icon: Truck, permission: "purchases.view", section: "OPERATIONS" },
  { label: "Customers", href: "/customers", icon: Contact, permission: "customers.view", section: "OPERATIONS" },
  { label: "Suppliers", href: "/suppliers", icon: Truck, permission: "suppliers.view", section: "OPERATIONS" },
  { label: "Stores", href: "/stores", icon: Building2, permission: "stores.view", section: "BUSINESS" },
  { label: "Employees", href: "/employees", icon: UserSquare2, permission: "employees.view", section: "BUSINESS" },
  { label: "Departments", href: "/departments", icon: Briefcase, permission: "employees.view", section: "BUSINESS" },
  { label: "Attendance", href: "/attendance", icon: CalendarDays, permission: "attendance.view", section: "BUSINESS" },
  { label: "Leave", href: "/leave", icon: CalendarOff, permission: "leave.view", section: "BUSINESS" },
  { label: "Payroll", href: "/payroll", icon: CreditCard, permission: "payroll.view", section: "BUSINESS" },
  { label: "Expenses", href: "/expenses", icon: Wallet, permission: "expenses.view", section: "BUSINESS" },
  { label: "Reports", href: "/reports", icon: BarChart3, permission: "reports.view", section: "MANAGEMENT" },
  { label: "Users", href: "/users", icon: Users, permission: "users.view", section: "MANAGEMENT" },
  { label: "Roles", href: "/roles", icon: Shield, permission: "roles.view", section: "MANAGEMENT" },
  { label: "Audit Logs", href: "/audit-logs", icon: History, permission: "audit_logs.view", section: "MANAGEMENT" },
  { label: "Notifications", href: "/notifications", icon: Bell, permission: "notifications.view", section: "MANAGEMENT" },
  { label: "Settings", href: "/settings", icon: Settings, permission: "settings.view", section: "SETTINGS" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const permissions = useAppSelector((s) => s.auth.permissions);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const filteredItems = navItems.filter((item) => {
    if (!isAuthenticated) return false;
    if (!item.permission) return true;
    return permissions.includes(item.permission);
  });

  const sections = filteredItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || "OTHER";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Logo href="/dashboard" />
      </div>
      <ScrollArea className="flex-1 py-3">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="mb-2">
            <div className="px-4 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {section}
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </ScrollArea>
    </aside>
  );
}
