"use client";

import { useEffect, useState } from "react";
import { ReportFrame, formatMoney } from "@/components/resource/report-frame";

type EmployeeRow = {
  _id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  departmentId?: { name: string } | string;
  position?: string;
  employmentStatus: string;
  baseSalary?: number;
};

function deptName(r: EmployeeRow) {
  return typeof r.departmentId === "object" && r.departmentId ? (r.departmentId as { name: string }).name : "-";
}

export default function EmployeeReport() {
  const [state, setState] = useState<{ rows: EmployeeRow[]; loaded: boolean }>({ rows: [], loaded: false });

  useEffect(() => {
    fetch("/api/employees?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setState({ rows: d.data?.data || d.data || [], loaded: true });
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  const active = state.rows.filter((x) => x.employmentStatus === "active");
  const payrollBase = state.rows.reduce((s, x) => s + (Number(x.baseSalary) || 0), 0);

  const cards = [
    { label: "Total Employees", value: String(state.rows.length), description: "All records" },
    { label: "Active", value: String(active.length), description: "Currently active" },
    { label: "Payroll Base", value: formatMoney(payrollBase), description: "Sum of base salaries" },
    {
      label: "Avg Salary",
      value: state.rows.length ? formatMoney(payrollBase / state.rows.length) : formatMoney(0),
      description: "Per employee",
    },
  ];

  return (
    <ReportFrame<EmployeeRow>
      title="Employee Report"
      description="Employee metrics and attendance"
      api="/api/employees"
      cards={cards}
      columns={[
        { key: "employeeNumber", label: "Employee #", className: "font-medium" },
        { key: "firstName", label: "Name", render: (r: EmployeeRow) => `${r.firstName} ${r.lastName}` },
        { key: "departmentId", label: "Department", render: (r: EmployeeRow) => deptName(r) },
        { key: "position", label: "Position", render: (r: EmployeeRow) => r.position || "-" },
        { key: "employmentStatus", label: "Status" },
        { key: "baseSalary", label: "Base Salary", render: (r: EmployeeRow) => formatMoney(Number(r.baseSalary) || 0) },
      ]}
    />
  );
}
