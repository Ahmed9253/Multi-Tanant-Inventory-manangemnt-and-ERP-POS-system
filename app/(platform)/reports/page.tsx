"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReportCard {
  title: string;
  description: string;
  href: string;
  badge?: string;
}

const reports: ReportCard[] = [
  { title: "Sales Report", description: "View sales performance and trends", href: "/reports/sales", badge: "Popular" },
  { title: "Inventory Report", description: "Current stock levels and movements", href: "/reports/inventory" },
  { title: "Purchase Report", description: "Purchase history and supplier analysis", href: "/reports/purchases" },
  { title: "Expense Report", description: "Expense breakdown by category", href: "/reports/expenses" },
  { title: "Employee Report", description: "Employee metrics and attendance", href: "/reports/employees" },
  { title: "Payroll Report", description: "Payroll summaries and deductions", href: "/reports/payroll" },
  { title: "Profit & Loss", description: "Revenue vs expenses overview", href: "/reports/profit-loss", badge: "Key" },
  { title: "Tax Report", description: "Tax liabilities and filings", href: "/reports/tax" },
];

export default function ReportsPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Generate and view business reports</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card
            key={report.title}
            className="cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
            onClick={() => router.push(report.href)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{report.title}</CardTitle>
                {report.badge && <Badge variant="secondary">{report.badge}</Badge>}
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push(report.href)}>
                View Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
