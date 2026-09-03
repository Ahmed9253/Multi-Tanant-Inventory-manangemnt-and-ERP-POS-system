"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export default function ProfitLossReport() {
  const router = useRouter();
  const [data, setData] = useState<{ revenue: number; expenses: number; purchases: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/sales?limit=500").then((r) => r.json()),
      fetch("/api/expenses?limit=500").then((r) => r.json()),
      fetch("/api/purchases?limit=500").then((r) => r.json()),
    ])
      .then(([sales, expenses, purchases]) => {
        const revenue = (sales.data?.data || sales.data?.sales || sales.data || [])
          .filter((s: { status: string }) => s.status === "completed")
          .reduce((s: number, x: { total: number }) => s + (Number(x.total) || 0), 0);
        const exp = (expenses.data?.data || expenses.data || [])
          .reduce((s: number, x: { amount: number }) => s + (Number(x.amount) || 0), 0);
        const pur = (purchases.data?.data || purchases.data || [])
          .reduce((s: number, x: { total: number }) => s + (Number(x.total) || 0), 0);
        setData({ revenue, expenses: exp, purchases: pur });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grossProfit = (data?.revenue || 0) - (data?.expenses || 0);
  const netProfit = grossProfit - (data?.purchases || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.push("/reports")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profit &amp; Loss</h1>
          <p className="text-muted-foreground">Revenue vs expenses overview</p>
        </div>
      </div>

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (Sales)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{formatMoney(data.revenue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{formatMoney(data.expenses)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatMoney(data.purchases)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                  {formatMoney(netProfit)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenue from completed sales</span>
                <span>{formatMoney(data.revenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total expenses</span>
                <span>-{formatMoney(data.expenses)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Purchase orders</span>
                <span>-{formatMoney(data.purchases)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Net Profit</span>
                <span className={netProfit >= 0 ? "text-emerald-600" : "text-destructive"}>{formatMoney(netProfit)}</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
