"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { PERMISSIONS, type Permission } from "@/types";

interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
}

const permissionGroups: { group: string; keys: Permission[] }[] = [
  { group: "Products", keys: ["products.view", "products.create", "products.update", "products.delete"] },
  { group: "Categories", keys: ["categories.view", "categories.manage"] },
  { group: "Inventory", keys: ["inventory.view", "inventory.adjust", "inventory.transfer"] },
  { group: "Sales", keys: ["sales.view", "sales.create", "sales.update", "sales.refund"] },
  { group: "Purchases", keys: ["purchases.view", "purchases.create", "purchases.receive"] },
  { group: "Customers", keys: ["customers.view", "customers.create", "customers.update"] },
  { group: "Suppliers", keys: ["suppliers.view", "suppliers.create", "suppliers.update"] },
  { group: "Stores", keys: ["stores.view", "stores.create", "stores.update", "stores.delete"] },
  { group: "Users & Roles", keys: ["users.view", "users.invite", "users.manage", "roles.view", "roles.manage"] },
  { group: "HR", keys: ["employees.view", "employees.create", "employees.update", "attendance.view", "attendance.manage", "leave.view", "leave.manage", "payroll.view", "payroll.manage"] },
  { group: "Expenses", keys: ["expenses.view", "expenses.create", "expenses.manage"] },
  { group: "Reports & Settings", keys: ["reports.view", "reports.export", "settings.view", "settings.manage"] },
  { group: "System", keys: ["audit_logs.view", "notifications.view", "pos.use"] },
];

const permLabels: Record<string, string> = {
  view: "View", create: "Create", update: "Update", delete: "Delete", manage: "Manage",
  adjust: "Adjust", transfer: "Transfer", refund: "Refund", receive: "Receive",
  invite: "Invite", export: "Export", use: "Use",
};

function labelFor(perm: string) {
  const parts = perm.split(".");
  return permLabels[parts[parts.length - 1]] || parts[parts.length - 1];
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [perms, setPerms] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/roles");
    const d = await res.json();
    if (d.success) {
      const list = d.data?.data || d.data || [];
      setRoles(Array.isArray(list) ? list : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = roles.filter((r) =>
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setPerms(new Set());
    setOpen(true);
  };

  const openEdit = (r: Role) => {
    if (r.isSystem) {
      toast.info("System roles cannot be edited");
      return;
    }
    setEditing(r);
    setName(r.name);
    setDescription(r.description || "");
    setPerms(new Set(r.permissions));
    setOpen(true);
  };

  const togglePerm = (p: string) => {
    setPerms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const toggleAllPerm = (groupKeys: string[], on: boolean) => {
    setPerms((prev) => {
      const next = new Set(prev);
      groupKeys.forEach((p) => (on ? next.add(p) : next.delete(p)));
      return next;
    });
  };

  const submit = async () => {
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
    const body = { name, description, permissions: Array.from(perms) };
    const id = editing?._id;
    const res = await fetch(id ? `/api/roles/${id}` : "/api/roles", {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    setSaving(false);
    if (d.success) {
      toast.success(id ? "Role updated" : "Role created");
      setOpen(false);
      load();
    } else {
      toast.error(d.error || "Request failed");
    }
  };

  const del = async (r: Role) => {
    if (r.isSystem) return toast.info("System roles cannot be deleted");
    const res = await fetch(`/api/roles/${r._id}`, { method: "DELETE" });
    const d = await res.json();
    if (d.success) {
      toast.success("Role deleted");
      load();
    } else {
      toast.error(d.error || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage roles and permissions</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Role
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search roles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
              No roles found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>{r.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{r.permissions.length} permissions</Badge>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="sm" className="text-destructive"
                        disabled={r.isSystem}
                        onClick={() => del(r)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Role" : "Add Role"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the role and its permissions." : "Create a new role with permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block">Name <span className="text-destructive">*</span></Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Manager" />
              </div>
              <div>
                <Label className="mb-1.5 block">Description</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>

            <div className="max-h-[40vh] space-y-3 overflow-y-auto rounded-lg border p-3">
              <p className="text-sm text-muted-foreground">Select permissions</p>
              {permissionGroups.map((g) => (
                <div key={g.group} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{g.group}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleAllPerm(g.keys, true)}>
                        All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toggleAllPerm(g.keys, false)}>
                        None
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {g.keys.map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        variant={perms.has(p) ? "default" : "outline"}
                        onClick={() => togglePerm(p)}
                      >
                        {labelFor(p)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
