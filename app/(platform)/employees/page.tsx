"use client";

import { ResourceManager, formatMoney, statusBadge } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  employeeNumber: string;
  position?: string;
  departmentId?: { name: string };
  baseSalary?: number;
  status: string;
}

const columns = [
  {
    key: "name",
    label: "Name",
    className: "font-medium",
    render: (r: Row) => `${r.firstName} ${r.lastName}`,
  },
  { key: "employeeNumber", label: "Emp #" },
  {
    key: "departmentId",
    label: "Department",
    render: (r: Row) => (r.departmentId && typeof r.departmentId === "object" ? (r.departmentId as { name: string }).name : "-"),
  },
  { key: "position", label: "Position", render: (r: Row) => r.position || "-" },
  { key: "email", label: "Email", render: (r: Row) => r.email || "-" },
  { key: "baseSalary", label: "Base Salary", render: (r: Row) => formatMoney(Number(r.baseSalary) || 0) },
  { key: "status", label: "Status", render: (r: Row) => statusBadge(r.status) },
];

const fields = [
  { name: "firstName", label: "First Name", required: true },
  { name: "lastName", label: "Last Name", required: true },
  { name: "email", label: "Email", type: "email" as const },
  { name: "phone", label: "Phone" },
  { name: "dateOfBirth", label: "Date of Birth", type: "date" as const },
  { name: "hireDate", label: "Hire Date", type: "date" as const, required: true },
  { name: "departmentId", label: "Department", type: "select" as const, optionsUrl: "/api/departments" },
  { name: "storeId", label: "Store", type: "select" as const, optionsUrl: "/api/stores" },
  { name: "position", label: "Position" },
  {
    name: "employmentType",
    label: "Employment Type",
    type: "select" as const,
    options: [
      { value: "full_time", label: "Full Time" },
      { value: "part_time", label: "Part Time" },
      { value: "contract", label: "Contract" },
      { value: "intern", label: "Intern" },
    ],
    defaultValue: "full_time",
  },
  { name: "baseSalary", label: "Base Salary", type: "number" as const, step: "0.01" },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "terminated", label: "Terminated" },
      { value: "on_leave", label: "On Leave" },
    ],
    defaultValue: "active",
  },
  { name: "address", label: "Address", type: "textarea" as const, fullWidth: true },
];

export default function EmployeesPage() {
  return (
    <ResourceManager<Row>
      title="Employees"
      description="Manage your workforce"
      api="/api/employees"
      createLabel="Add Employee"
      columns={columns}
      fields={fields}
    />
  );
}
