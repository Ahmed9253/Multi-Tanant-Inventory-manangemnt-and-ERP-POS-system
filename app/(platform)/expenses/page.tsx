"use client";

import { ResourceManager, formatMoney, statusBadge } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
  storeId?: { name: string } | string;
  status: string;
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

const columns = [
  { key: "description", label: "Description", className: "font-medium", render: (r: Row) => r.description },
  { key: "categoryId", label: "Category", render: (r: Row) => r.categoryId || "-" },
  {
    key: "storeId",
    label: "Store",
    render: (r: Row) => (typeof r.storeId === "object" && r.storeId ? (r.storeId as { name: string }).name : "-"),
  },
  { key: "amount", label: "Amount", render: (r: Row) => formatMoney(Number(r.amount) || 0) },
  { key: "date", label: "Date", render: (r: Row) => formatDate(r.date) },
  { key: "status", label: "Status", render: (r: Row) => statusBadge(r.status) },
];

const fields = [
  { name: "description", label: "Description", required: true },
  { name: "amount", label: "Amount", type: "number" as const, required: true, step: "0.01" },
  { name: "categoryId", label: "Category" },
  { name: "storeId", label: "Store", type: "select" as const, optionsUrl: "/api/stores" },
  { name: "date", label: "Date", type: "date" as const, required: true },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "rejected", label: "Rejected" },
    ],
    defaultValue: "pending",
  },
];

export default function ExpensesPage() {
  return (
    <ResourceManager<Row>
      title="Expenses"
      description="Track your business expenses"
      api="/api/expenses"
      createLabel="Add Expense"
      columns={columns}
      fields={fields}
    />
  );
}
