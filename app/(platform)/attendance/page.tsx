"use client";

import { ResourceManager, statusBadge } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  employeeId?: { firstName: string; lastName: string; employeeNumber: string };
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
}

function formatDate(d: string) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString();
}

function empName(r: Row) {
  if (r.employeeId && typeof r.employeeId === "object") {
    const e = r.employeeId as { firstName: string; lastName: string; employeeNumber: string };
    return `${e.firstName} ${e.lastName} (${e.employeeNumber})`;
  }
  return "-";
}

const columns = [
  { key: "employeeId", label: "Employee", className: "font-medium", render: (r: Row) => empName(r) },
  { key: "date", label: "Date", render: (r: Row) => formatDate(r.date) },
  { key: "status", label: "Status", render: (r: Row) => statusBadge(r.status) },
];

const fields = [
  { name: "employeeId", label: "Employee", type: "select" as const, optionsUrl: "/api/employees", optionLabel: "{firstName} {lastName} ({employeeNumber})", required: true },
  { name: "date", label: "Date", type: "date" as const, required: true },
  {
    name: "status",
    label: "Status",
    type: "select" as const,
    options: [
      { value: "present", label: "Present" },
      { value: "absent", label: "Absent" },
      { value: "late", label: "Late" },
      { value: "early_leave", label: "Early Leave" },
      { value: "holiday", label: "Holiday" },
      { value: "leave", label: "Leave" },
    ],
    defaultValue: "present",
  },
  { name: "checkIn", label: "Check In", type: "datetime" as const },
  { name: "checkOut", label: "Check Out", type: "datetime" as const },
  { name: "notes", label: "Notes", type: "textarea" as const, fullWidth: true },
];

export default function AttendancePage() {
  return (
    <ResourceManager<Row>
      title="Attendance"
      description="Track employee attendance"
      api="/api/attendance"
      createLabel="Add Attendance"
      columns={columns}
      fields={fields}
    />
  );
}
