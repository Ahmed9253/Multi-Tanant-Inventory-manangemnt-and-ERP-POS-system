"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Purchase {
  _id: string;
  referenceNumber: string;
  supplierId?: { name: string };
  total: number;
  status: string;
  createdAt: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    fetch(`/api/purchases?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setPurchases(d.data?.purchases || d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Manage purchase orders</p>
        </div>
        <Button>New Purchase</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search purchases..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[70px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : purchases.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No purchases found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.map((p) => (
                  <TableRow key={p._id}>
                    <TableCell className="font-medium">{p.referenceNumber}</TableCell>
                    <TableCell>{p.supplierId?.name || "-"}</TableCell>
                    <TableCell>{formatCurrency(p.total)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === "received" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
