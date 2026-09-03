"use client";

import { ResourceManager } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  name: string;
  code: string;
  city?: string;
  phone?: string;
}

const columns = [
  { key: "name", label: "Name", className: "font-medium", render: (r: Row) => r.name },
  { key: "code", label: "Code" },
  { key: "city", label: "City", render: (r: Row) => r.city || "-" },
  { key: "phone", label: "Phone", render: (r: Row) => r.phone || "-" },
];

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "code", label: "Code", required: true },
  { name: "address", label: "Address" },
  { name: "city", label: "City" },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email", type: "email" as const },
];

export default function StoresPage() {
  return (
    <ResourceManager<Row>
      title="Stores"
      description="Manage your store locations"
      api="/api/stores"
      createLabel="Add Store"
      columns={columns}
      fields={fields}
    />
  );
}
