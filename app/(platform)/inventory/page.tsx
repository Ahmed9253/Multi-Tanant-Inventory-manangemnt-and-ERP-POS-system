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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { FormFields, type FieldConfig, type FormValue } from "@/components/resource/form-fields";

interface InventoryItem {
  _id: string;
  productId?: { name: string; sku: string; minimumStock?: number } | string;
  storeId?: { name: string } | string;
  quantity: number;
  updatedAt?: string;
}

const productField: FieldConfig = {
  name: "productId", label: "Product", type: "select", optionsUrl: "/api/products", optionLabel: "{name} ({sku})", required: true,
};
const storeField: FieldConfig = {
  name: "storeId", label: "Store", type: "select", optionsUrl: "/api/stores", required: true,
};
const adjustFields: FieldConfig[] = [
  productField,
  storeField,
  { name: "quantity", label: "Quantity (use +/-)", type: "number", required: true, step: "1" },
  {
    name: "type",
    label: "Movement Type",
    type: "select",
    required: true,
    options: [
      { value: "OPENING_BALANCE", label: "Opening Balance" },
      { value: "ADJUSTMENT", label: "Adjustment" },
      { value: "PURCHASE_RECEIVED", label: "Purchase Received" },
      { value: "SALE_RETURN", label: "Sale Return" },
      { value: "TRANSFER_IN", label: "Transfer In" },
      { value: "TRANSFER_OUT", label: "Transfer Out" },
      { value: "DAMAGED", label: "Damaged" },
      { value: "LOST", label: "Lost" },
      { value: "RETURN_TO_SUPPLIER", label: "Return to Supplier" },
    ],
    defaultValue: "ADJUSTMENT",
  },
  { name: "notes", label: "Notes", type: "textarea", fullWidth: true },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormValue>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/inventory?${params}`);
    const d = await res.json();
    if (d.success) setItems(d.data?.inventoryItems || d.data?.data || d.data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdjust = () => {
    setForm({});
    setOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (d.success) {
      toast.success("Stock adjusted");
      setOpen(false);
      load();
    } else {
      toast.error(d.error || "Adjustment failed");
    }
  };

  const productName = (item: InventoryItem) =>
    typeof item.productId === "object" && item.productId ? (item.productId as { name: string }).name : "-";
  const productSku = (item: InventoryItem) =>
    typeof item.productId === "object" && item.productId ? (item.productId as { sku: string }).sku || "" : "";
  const minStock = (item: InventoryItem) =>
    typeof item.productId === "object" && item.productId ? Number((item.productId as { minimumStock?: number }).minimumStock) || 0 : 0;
  const storeName = (item: InventoryItem) =>
    typeof item.storeId === "object" && item.storeId ? (item.storeId as { name: string }).name : "-";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Track stock levels across stores</p>
        </div>
        <Button onClick={openAdjust}>
          <Plus className="mr-1.5 h-4 w-4" /> Adjust Stock
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No inventory data found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const low = minStock(item);
                  return (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">
                        {productName(item)}
                        {productSku(item) && (
                          <span className="ml-2 text-xs text-muted-foreground">({productSku(item)})</span>
                        )}
                      </TableCell>
                      <TableCell>{storeName(item)}</TableCell>
                      <TableCell>
                        <Badge variant={item.quantity <= 0 ? "destructive" : low > 0 && item.quantity <= low ? "secondary" : "default"}>
                          {item.quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={openAdjust}>Adjust</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust inventory levels for a product at a store.
            </DialogDescription>
          </DialogHeader>
          <FormFields fields={adjustFields} value={form} onChange={setForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={saving}>
              {saving ? "Adjusting..." : "Adjust"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
