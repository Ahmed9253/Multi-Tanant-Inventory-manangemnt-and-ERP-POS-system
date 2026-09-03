"use client";

import { ResourceManager, formatMoney, statusBadge } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  minimumStock: number;
  status: string;
  categoryId?: { name: string };
}

const columns = [
  { key: "name", label: "Name", className: "font-medium", render: (r: Row) => r.name },
  { key: "sku", label: "SKU" },
  {
    key: "categoryId",
    label: "Category",
    render: (r: Row) => (r.categoryId && typeof r.categoryId === "object" ? (r.categoryId as { name: string }).name : "-"),
  },
  { key: "sellingPrice", label: "Price", render: (r: Row) => formatMoney(Number(r.sellingPrice) || 0) },
  { key: "minimumStock", label: "Min Stock", render: (r: Row) => Number(r.minimumStock) || 0 },
  { key: "status", label: "Status", render: (r: Row) => statusBadge(r.status) },
];

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "sku", label: "SKU", required: true },
  { name: "barcode", label: "Barcode" },
  { name: "categoryId", label: "Category", type: "select" as const, optionsUrl: "/api/categories" },
  { name: "brand", label: "Brand" },
  { name: "unit", label: "Unit", type: "select" as const, options: [
      { value: "pcs", label: "Pieces (pcs)" },
      { value: "kg", label: "Kilogram (kg)" },
      { value: "g", label: "Gram (g)" },
      { value: "l", label: "Liter (l)" },
      { value: "ml", label: "Milliliter (ml)" },
      { value: "box", label: "Box" },
      { value: "pack", label: "Pack" },
    ], defaultValue: "pcs" },
  { name: "costPrice", label: "Cost Price", type: "number" as const, step: "0.01" },
  { name: "sellingPrice", label: "Selling Price", type: "number" as const, step: "0.01" },
  { name: "taxRate", label: "Tax Rate (%)", type: "number" as const, step: "0.01" },
  { name: "minimumStock", label: "Min Stock", type: "number" as const },
  { name: "maximumStock", label: "Max Stock", type: "number" as const },
  { name: "status", label: "Status", type: "select" as const, options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "discontinued", label: "Discontinued" },
    ], defaultValue: "active" },
  { name: "description", label: "Description", type: "textarea" as const, fullWidth: true },
];

export default function ProductsPage() {
  return (
    <ResourceManager<Row>
      title="Products"
      description="Manage your product inventory"
      api="/api/products"
      createLabel="Add Product"
      columns={columns}
      fields={fields}
    />
  );
}
