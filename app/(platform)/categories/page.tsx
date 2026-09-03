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
  { name: "parentId", label: "Parent Category", type: "select" as const, optionsUrl: "/api/categories" },
  { name: "description", label: "Description", type: "textarea" as const, fullWidth: true },
];

export default function CategoriesPage() {
  return (
    <ResourceManager<Row>
      title="Categories"
      description="Organize your products into categories"
      api="/api/categories"
      createLabel="Add Category"
      columns={columns}
      fields={fields}
    />
  );
}
