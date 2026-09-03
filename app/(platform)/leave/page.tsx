"use client";

import { ResourceManager, statusBadge } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  employeeId?: { firstName: string; lastName: string; employeeNumber: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function empName(r: Row) {
  if (r.employeeId && typeof r.employeeId === "object") {
    const e = r.employeeId as { firstName: string; lastName: string; employeeNumber: string };
    return `${e.firstName} ${e.lastName}`;
  }
  return "-";
}

const columns = [
  { key: "employeeId", label: "Employee", className: "font-medium", render: (r: Row) => empName(r) },
  { key: "leaveType", label: "Type", render: (r: Row) => r.leaveType },
  { key: "startDate", label: "Start", render: (r: Row) => formatDate(r.startDate) },
  { key: "endDate", label: "End", render: (r: Row) => formatDate(r.endDate) },
  { key: "status", label: "Status", render: (r: Row) => statusBadge(r.status) },
];

const fields = [
  { name: "employeeId", label: "Employee", type: "select" as const, optionsUrl: "/api/employees", optionLabel: "{firstName} {lastName} ({employeeNumber})", required: true },
  { name: "leaveType", label: "Leave Type", type: "select" as const, options: [
      { value: "annual", label: "Annual" },
      { value: "sick", label: "Sick" },
      { value: "maternity", label: "Maternity" },
      { value: "paternity", label: "Paternity" },
      { value: "unpaid", label: "Unpaid" },
      { value: "other", label: "Other" },
    ], required: true },
  { name: "startDate", label: "Start Date", type: "date" as const, required: true },
  { name: "endDate", label: "End Date", type: "date" as const, required: true },
  { name: "reason", label: "Reason", type: "textarea" as const, fullWidth: true },
];

export default function LeavePage() {
  return (
    <ResourceManager<Row>
      title="Leave"
      description="Manage employee leave requests"
      api="/api/leave"
      createLabel="Add Leave Request"
      columns={columns}
      fields={fields}
    />
  );
}
