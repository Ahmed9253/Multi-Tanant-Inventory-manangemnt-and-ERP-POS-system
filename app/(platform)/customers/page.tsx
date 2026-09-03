"use client";

import { ResourceManager } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

const columns = [
  { key: "name", label: "Name", className: "font-medium", render: (r: Row) => r.name },
  { key: "phone", label: "Phone", render: (r: Row) => r.phone || "-" },
  { key: "email", label: "Email", render: (r: Row) => r.email || "-" },
  { key: "address", label: "Address", render: (r: Row) => r.address || "-" },
];

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "phone", label: "Phone", type: "text" as const },
  { name: "email", label: "Email", type: "email" as const },
  { name: "address", label: "Address", type: "text" as const },
  { name: "notes", label: "Notes", type: "textarea" as const, fullWidth: true },
];

export default function CustomersPage() {
  return (
    <ResourceManager<Row>
      title="Customers"
      description="Manage your customer records"
      api="/api/customers"
      createLabel="Add Customer"
      columns={columns}
      fields={fields}
    />
  );
}
