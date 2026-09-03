"use client";

import { ResourceManager } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
}

const columns = [
  { key: "name", label: "Name", className: "font-medium", render: (r: Row) => r.name },
  { key: "company", label: "Company", render: (r: Row) => r.company || "-" },
  { key: "phone", label: "Phone", render: (r: Row) => r.phone || "-" },
  { key: "email", label: "Email", render: (r: Row) => r.email || "-" },
];

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "company", label: "Company" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" as const },
  { name: "taxNumber", label: "Tax Number" },
  { name: "address", label: "Address", type: "textarea" as const, fullWidth: true },
  { name: "notes", label: "Notes", type: "textarea" as const, fullWidth: true },
];

export default function SuppliersPage() {
  return (
    <ResourceManager<Row>
      title="Suppliers"
      description="Manage your suppliers and vendors"
      api="/api/suppliers"
      createLabel="Add Supplier"
      columns={columns}
      fields={fields}
    />
  );
}
