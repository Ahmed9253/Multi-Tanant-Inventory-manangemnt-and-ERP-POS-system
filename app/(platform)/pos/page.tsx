"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  taxRate: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Store {
  _id: string;
  name: string;
}

interface Customer {
  _id: string;
  name: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export default function POSPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [open, setOpen] = useState(false);
  const [storeId, setStoreId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data?.products || d.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    fetch("/api/stores?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStores(d.data?.data || d.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCustomers(d.data?.data || d.data || []);
      })
      .catch(() => {});
  }, []);

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product._id === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product._id !== productId));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const tax = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity * ((item.product.taxRate || 0) / 100), 0);
  const total = subtotal + tax;

  const openCheckout = () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    if (stores.length > 0 && !storeId) setStoreId(stores[0]._id);
    setAmountPaid(total.toFixed(2));
    setOpen(true);
  };

  const completeSale = async () => {
    if (!storeId) return toast.error("Please select a store");
    const items = cart.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
      unitPrice: item.product.sellingPrice,
    }));
    const amount = Number(amountPaid);
    if (!amount || amount <= 0) return toast.error("Enter a valid payment amount");
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
          customerId: customerId || undefined,
          items,
          payments: [{ method: paymentMethod, amount }],
          discountAmount: 0,
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success(`Sale completed · ${d.data.receiptNumber || ""}`);
        setOpen(false);
        setCart([]);
        router.push("/sales");
      } else {
        toast.error(d.error || "Could not complete sale");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Point of Sale</h1>
        <p className="text-muted-foreground">Create sales transactions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
              No products found
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[calc(100vh-280px)] overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="flex flex-col items-start rounded-xl border p-4 text-left hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="font-medium text-sm">{product.name}</span>
                  <span className="text-xs text-muted-foreground">{product.sku}</span>
                  <div className="mt-2 flex items-center justify-between w-full">
                    <span className="text-sm font-bold">{formatCurrency(product.sellingPrice || 0)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <Card className="sticky top-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Cart
              <Badge variant="outline">{cart.reduce((s, i) => s + i.quantity, 0)} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                Cart is empty
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.product._id}>
                        <TableCell>
                          <div className="font-medium text-sm">{item.product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(item.product.sellingPrice || 0)} each
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.product._id, -1)}>
                              -
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button variant="outline" size="sm" className="h-6 w-6 p-0" onClick={() => updateQuantity(item.product._id, 1)}>
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-sm">{formatCurrency((item.product.sellingPrice || 0) * item.quantity)}</span>
                            <button onClick={() => removeFromCart(item.product._id)} className="text-xs text-destructive hover:underline">
                              Remove
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={openCheckout}>
                  Complete Sale
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Sale</DialogTitle>
            <DialogDescription>Total: {formatCurrency(total)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Store</Label>
              <Select value={storeId} onValueChange={(v) => setStoreId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select store..." />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Customer</Label>
              <Select value={customerId} onValueChange={(v) => setCustomerId(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Walk-in customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? "cash")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Amount Paid</Label>
              <Input
                type="number"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Change: {formatCurrency((Number(amountPaid) || 0) - total)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={completeSale} disabled={submitting}>
              {submitting ? "Processing..." : "Confirm Sale"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
