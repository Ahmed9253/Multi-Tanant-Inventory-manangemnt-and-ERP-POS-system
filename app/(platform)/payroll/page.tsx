"use client";

import { ResourceManager, formatMoney, statusBadge } from "@/components/resource/resource-manager";

interface Row {
  _id: string;
  employeeId?: { firstName: string; lastName: string; employeeNumber: string };
  payPeriodStart: string;
  payPeriodEnd: string;
  baseSalary: number;
  grossPay: number;
  netPay: number;
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
  { key: "payPeriodStart", label: "Period Start", render: (r: Row) => formatDate(r.payPeriodStart) },
  { key: "payPeriodEnd", label: "Period End", render: (r: Row) => formatDate(r.payPeriodEnd) },
  { key: "grossPay", label: "Gross", render: (r: Row) => formatMoney(Number(r.grossPay) || 0) },
  { key: "netPay", label: "Net Pay", render: (r: Row) => formatMoney(Number(r.netPay) || 0) },
  { key: "status", label: "Status", render: (r: Row) => statusBadge(r.status) },
];

const fields = [
  { name: "employeeId", label: "Employee", type: "select" as const, optionsUrl: "/api/employees", optionLabel: "{firstName} {lastName} ({employeeNumber})", required: true },
  { name: "payPeriodStart", label: "Period Start", type: "date" as const, required: true },
  { name: "payPeriodEnd", label: "Period End", type: "date" as const, required: true },
  { name: "baseSalary", label: "Base Salary", type: "number" as const, step: "0.01" },
  { name: "allowances", label: "Allowances", type: "number" as const, step: "0.01" },
  { name: "deductions", label: "Deductions", type: "number" as const, step: "0.01" },
  { name: "notes", label: "Notes", type: "textarea" as const, fullWidth: true },
];

export default function PayrollPage() {
  return (
    <ResourceManager<Row>
      title="Payroll"
      description="Manage employee payroll and salaries"
      api="/api/payroll"
      createLabel="Add Payroll Entry"
      columns={columns}
      fields={fields}
    />
  );
}
