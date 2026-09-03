"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";

export interface ReportColumn<T = Record<string, unknown>> {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface ReportCard {
  label: string;
  value: string;
  description?: string;
}

export function ReportFrame({
  title,
  description,
  api,
  columns,
  cards,
  recordsKey = "data",
}: {
  title: string;
  description: string;
  api: string;
  columns: ReportColumn[];
  cards: ReportCard[];
  recordsKey?: string;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${api}?limit=500`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const data = d.data?.data || d.data?.[recordsKey] || d.data?.inventoryItems || d.data?.products || d.data || [];
          setRows(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [api, recordsKey]);

  const exportCsv = () => {
    if (rows.length === 0) return;
    const headers = columns.map((c) => c.label).join(",");
    const body = rows
      .map((row) =>
        columns
          .map((c) => String(row[c.key] ?? "").replace(/,/g, " "))
          .join(",")
      )
      .join("\n");
    const blob = new Blob([[headers, body].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.push("/reports")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="mr-1.5 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              {c.description && <p className="text-xs text-muted-foreground mt-1">{c.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No data available for this report
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key} className={c.className}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {columns.map((c) => (
                      <TableCell key={c.key} className={c.className}>
                        {c.render ? c.render(row) : String(row[c.key] ?? "-")}
                      </TableCell>
                    ))}
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

export function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function formatDate(d: unknown) {
  if (!d) return "-";
  return new Date(String(d)).toLocaleDateString();
}
