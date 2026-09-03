"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: { name: string };
  details?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/audit-logs?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setLogs(d.data?.logs || d.data?.auditLogs || d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  function actionBadgeVariant(action: string) {
    switch (action.toLowerCase()) {
      case "create": return "default";
      case "update": return "secondary";
      case "delete": return "destructive";
      default: return "outline";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Track system activity and changes</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search audit logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No audit logs found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell>
                      <Badge variant={actionBadgeVariant(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.resource}</TableCell>
                    <TableCell>{log.userId?.name || "System"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{log.details || "-"}</TableCell>
                    <TableCell>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>View</Button>
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
