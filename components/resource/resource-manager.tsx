"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { FormFields, type FieldConfig, type FormValue } from "./form-fields";

export interface ColumnDef<T = Record<string, unknown>> {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface ResourceManagerProps<T = Record<string, unknown>> {
  title: string;
  description?: string;
  api: string;
  permissionView?: string;
  createPermission?: string;
  columns: ColumnDef<T>[];
  fields: FieldConfig[];
  pageSize?: number;
  searchable?: boolean;
  createLabel?: string;
  emptyLabel?: string;
  beforeDelete?: (row: T) => Promise<boolean>;
  onCreated?: () => void;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function ResourceManager<T extends { id?: string; _id?: string } = Record<string, unknown>>({
  title,
  description,
  api,
  columns,
  fields,
  pageSize = 20,
  searchable = true,
  createLabel = "Create",
  emptyLabel = "No records found",
  beforeDelete,
  onCreated,
}: ResourceManagerProps<T>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<FormValue>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [resolvedFields, setResolvedFields] = useState<FieldConfig[]>(fields);

  useEffect(() => {
    setResolvedFields(fields);
  }, [fields]);

  const loadOptions = async () => {
    let resolved = fields;
    const asyncFields = fields.filter((f) => f.optionsUrl);
    if (asyncFields.length > 0) {
      const newFields = [...fields];
      await Promise.all(
        asyncFields.map(async (f) => {
          try {
            const res = await fetch(f.optionsUrl!);
            const d = await res.json();
            const list = d.data?.data || d.data?.products || d.data?.stores || d.data?.categories || d.data?.departments || d.data?.employees || d.data || [];
            const options = (Array.isArray(list) ? list : []).map((item: Record<string, unknown>) => {
              const lbl = f.optionLabel || "name";
              let label = String(item[lbl] ?? "Unnamed");
              if (lbl.includes("{")) {
                label = lbl.replace(/\{(\w+)\}/g, (_, k) => String(item[k] ?? ""));
              }
              return {
                label,
                value: String((item as Record<string, unknown>)[f.optionValue || "_id"] ?? ""),
              };
            });
            const idx = newFields.findIndex((x) => x.name === f.name);
            if (idx >= 0) newFields[idx] = { ...newFields[idx], options };
          } catch {
            /* ignore */
          }
        })
      );
      resolved = newFields;
    }
    setResolvedFields(resolved);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (search) params.set("search", search);
      const res = await fetch(`${api}?${params}`);
      const d = await res.json();
      if (d.success) {
        const data = d.data?.data || d.data?.products || d.data?.inventoryItems || d.data || d.items || [];
        setRows(Array.isArray(data) ? (data as T[]) : []);
        setTotal(d.pagination?.total ?? d.total ?? (Array.isArray(data) ? data.length : 0));
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [api, page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const openCreate = async () => {
    setEditing(null);
    const init: FormValue = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) init[f.name] = f.defaultValue;
    });
    setForm(init);
    await loadOptions();
    setOpen(true);
  };

  const openEdit = async (row: T) => {
    setEditing(row);
    const init: FormValue = {};
    fields.forEach((f) => {
      const val = (row as Record<string, unknown>)[f.name];
      if (val !== undefined && val !== null) init[f.name] = String(val);
    });
    setForm(init);
    await loadOptions();
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      const body = { ...form };
      const id = editing ? (editing as { _id?: string })._id || (editing as { id?: string }).id : undefined;
      const res = await fetch(id ? `${api}/${id}` : api, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(id ? "Updated successfully" : "Created successfully");
        setOpen(false);
        load();
        onCreated?.();
      } else {
        toast.error(d.error || "Request failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const del = async (row: T) => {
    const id = (row as { _id?: string })._id || (row as { id?: string }).id;
    if (!id) return;
    if (beforeDelete && !(await beforeDelete(row))) return;
    setDeleting(id);
    try {
      const res = await fetch(`${api}/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        toast.success("Deleted successfully");
        load();
      } else {
        toast.error(d.error || "Delete failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description ? <p className="text-muted-foreground">{description}</p> : null}
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" /> {createLabel}
        </Button>
      </div>

      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              {emptyLabel}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={c.key} className={c.className}>
                      {c.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const id = (row as { _id?: string })._id || (row as { id?: string }).id;
                  return (
                    <TableRow key={String(id)}>
                      {columns.map((c) => (
                        <TableCell key={c.key} className={c.className}>
                          {c.render
                            ? c.render(row)
                            : String((row as Record<string, unknown>)[c.key] ?? "-")}
                        </TableCell>
                      ))}
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={deleting === String(id)}
                          onClick={() => del(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title.slice(0, -1)}` : createLabel}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the details below." : `Add a new record.`}
            </DialogDescription>
          </DialogHeader>
          <FormFields fields={resolvedFields} value={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Saving..." : editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export { formatMoney };

export function statusBadge(status: string) {
  const color =
    status === "active" || status === "present" || status === "approved" || status === "completed" || status === "paid"
      ? "default"
      : status === "inactive" || status === "absent" || status === "rejected" || status === "cancelled" || status === "pending"
      ? "outline"
      : "secondary";
  return <Badge variant={color as "default" | "outline" | "secondary"}>{status}</Badge>;
}
