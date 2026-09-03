"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  status: string;
  lastLogin?: string;
  joinedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.data?.data || d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and access</p>
        </div>
        <Button disabled>Add User</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search users..."
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
                  <Skeleton className="h-4 w-[180px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[70px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-destructive" disabled>Delete</Button>
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
