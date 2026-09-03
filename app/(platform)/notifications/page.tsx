"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/notifications?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setNotifications(d.data?.notifications || d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">View system notifications and alerts</p>
        </div>
        <Button variant="outline" disabled>Mark All Read</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search notifications..."
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
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[70px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n._id} className={n.isRead ? "" : "bg-muted/30"}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{n.message}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{n.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.isRead ? "secondary" : "default"}>
                        {n.isRead ? "Read" : "Unread"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(n.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>Details</Button>
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
