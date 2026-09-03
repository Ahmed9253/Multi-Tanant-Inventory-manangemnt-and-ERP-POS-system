"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/use-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  UserSquare2,
  Receipt,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardData {
  totalProducts: number;
  activeProducts: number;
  totalCustomers: number;
  totalEmployees: number;
  lowStockCount: number;
  salesThisMonth: { total: number; count: number };
  salesToday: { total: number; count: number };
  purchasesThisMonth: number;
  expensesThisMonth: number;
  recentSales: Array<{
    _id: string;
    receiptNumber: string;
    total: number;
    createdAt: string;
    customerId?: { name: string };
  }>;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data
    ? [
        {
          title: "Sales This Month",
          value: formatCurrency(data.salesThisMonth.total),
          icon: DollarSign,
          description: `${data.salesThisMonth.count} orders`,
        },
        {
          title: "Today's Sales",
          value: formatCurrency(data.salesToday.total),
          icon: TrendingUp,
          description: `${data.salesToday.count} orders`,
        },
        {
          title: "Products",
          value: String(data.totalProducts),
          icon: Package,
          description: `${data.activeProducts} active`,
        },
        {
          title: "Customers",
          value: String(data.totalCustomers),
          icon: Users,
          description: "Total customers",
        },
        {
          title: "Employees",
          value: String(data.totalEmployees),
          icon: UserSquare2,
          description: "Active employees",
        },
        {
          title: "Purchases",
          value: formatCurrency(data.purchasesThisMonth),
          icon: Receipt,
          description: "This month",
        },
        {
          title: "Expenses",
          value: formatCurrency(data.expensesThisMonth),
          icon: DollarSign,
          description: "This month (approved)",
        },
        {
          title: "Low Stock",
          value: String(data.lowStockCount),
          icon: AlertTriangle,
          description: data.lowStockCount > 0 ? "Needs attention" : "All good",
        },
      ]
    : [];

  const salesData = data?.recentSales?.map((s) => ({
    name: s.receiptNumber,
    total: s.total,
  })) || [];

  const pieData = [
    { name: "Sales", value: data?.salesThisMonth.total || 0 },
    { name: "Purchases", value: data?.purchasesThisMonth || 0 },
    { name: "Expenses", value: data?.expensesThisMonth || 0 },
  ].filter((d) => d.value > 0);

  const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--destructive))"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || "User"}
          </p>
        </div>
        <Badge variant="outline">This Month</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No sales data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatCurrency(Number(value) || 0)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                No financial data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {data?.recentSales && data.recentSales.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentSales.map((sale) => (
                <div
                  key={sale._id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{sale.receiptNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.customerId?.name || "Walk-in customer"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(sale.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
