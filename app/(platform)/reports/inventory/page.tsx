"use client";

import { ReportFrame } from "@/components/resource/report-frame";

interface InventoryRow {
  _id: string;
  productId?: { name: string; sku: string; minimumStock?: number } | string;
  storeId?: { name: string } | string;
  quantity: number;
}

function productName(r: InventoryRow) {
  return typeof r.productId === "object" && r.productId ? (r.productId as { name: string }).name : "-";
}
function productSku(r: InventoryRow) {
  return typeof r.productId === "object" && r.productId ? (r.productId as { sku: string }).sku || "" : "";
}
function storeName(r: InventoryRow) {
  return typeof r.storeId === "object" && r.storeId ? (r.storeId as { name: string }).name : "-";
}

export default function InventoryReport() {
  return (
    <ReportFrame
      title="Inventory Report"
      description="Current stock levels and movements"
      api="/api/inventory"
      recordsKey="inventoryItems"
      cards={[
        { label: "Tracking", value: "Active", description: "Per store and product" },
        { label: "Granularity", value: "Store-level", description: "Stock location" },
        { label: "Status", value: "Real-time", description: "Auto-updated" },
      ]}
      columns={[
        { key: "productId", label: "Product", className: "font-medium", render: (r: InventoryRow) => productName(r) },
        { key: "sku", label: "SKU", render: (r: InventoryRow) => productSku(r) },
        { key: "storeId", label: "Store", render: (r: InventoryRow) => storeName(r) },
        { key: "quantity", label: "On Hand", render: (r: InventoryRow) => Number(r.quantity) ?? 0 },
      ]}
    />
  );
}
