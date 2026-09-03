"use client";

import { ResourceManager } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  name: string;
  description?: string;
}

const columns = [
  { key: "name", label: "Name", className: "font-medium", render: (r: Row) => r.name },
  { key: "description", label: "Description", render: (r: Row) => r.description || "-" },
];

const fields = [
  { name: "name", label: "Name", required: true },
  { name: "description", label: "Description", type: "textarea" as const, fullWidth: true },
];

export default function DepartmentsPage() {
  return (
    <ResourceManager<Row>
      title="Departments"
      description="Organize your teams into departments"
      api="/api/departments"
      createLabel="Add Department"
      columns={columns}
      fields={fields}
    />
  );
}
