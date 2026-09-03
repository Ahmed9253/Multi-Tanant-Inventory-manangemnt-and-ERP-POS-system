"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface BusinessSettings {
  name: string;
  legalName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  currency?: string;
  timezone?: string;
  taxRate?: number;
  taxName?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<BusinessSettings>({
    name: "",
    taxRate: 0,
    taxName: "Tax",
    country: "US",
    currency: "USD",
    timezone: "UTC",
  });

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          setForm({ ...form, ...d.data });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof BusinessSettings, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/business", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) toast.success("Settings saved");
      else toast.error(d.error || "Failed to save");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your business and application preferences</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-muted animate-pulse rounded-xl" />
          <div className="h-28 bg-muted animate-pulse rounded-xl" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Business Settings</CardTitle>
              <CardDescription>Configure your business information</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Business Name</Label>
                <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Legal Name</Label>
                <Input value={form.legalName || ""} onChange={(e) => set("legalName", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input type="email" value={form.email || ""} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>Address</Label>
                <Input value={form.address || ""} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>City</Label>
                <Input value={form.city || ""} onChange={(e) => set("city", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>State / Region</Label>
                <Input value={form.state || ""} onChange={(e) => set("state", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Country</Label>
                <Input value={form.country || ""} onChange={(e) => set("country", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Currency</Label>
                <Input value={form.currency || ""} onChange={(e) => set("currency", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Timezone</Label>
                <Input value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>Configure default tax rates and names</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Default Tax Rate (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.taxRate ?? 0}
                  onChange={(e) => set("taxRate", Number(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Tax Name</Label>
                <Input value={form.taxName || ""} onChange={(e) => set("taxName", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </>
      )}

      <Separator />
      <p className="text-xs text-muted-foreground">
        Settings are saved and applied across all stores, products, and transactions for this business.
      </p>
    </div>
  );
}
