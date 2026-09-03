"use client";

import { useEffect, useState } from "react";
import { ReportFrame, formatMoney } from "@/components/resource/report-frame";

type PayrollRow = {
  _id: string;
  employeeId?: { firstName: string; lastName: string; employeeNumber: string };
  grossPay: number;
  netPay: number;
  status: string;
};

function empName(r: PayrollRow) {
  if (r.employeeId && typeof r.employeeId === "object") {
    const e = r.employeeId as { firstName: string; lastName: string };
    return `${e.firstName} ${e.lastName}`;
  }
  return "-";
}

export default function PayrollReport() {
  const [state, setState] = useState<{ rows: PayrollRow[]; loaded: boolean }>({ rows: [], loaded: false });

  useEffect(() => {
    fetch("/api/payroll?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setState({ rows: d.data?.data || d.data || [], loaded: true });
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  const gross = state.rows.reduce((s, x) => s + (Number(x.grossPay) || 0), 0);
  const net = state.rows.reduce((s, x) => s + (Number(x.netPay) || 0), 0);

  const cards = [
    { label: "Gross Pay", value: formatMoney(gross), description: `${state.rows.length} payslips` },
    { label: "Net Pay", value: formatMoney(net), description: "After deductions" },
    {
      label: "Deductions",
      value: formatMoney(gross - net),
      description: "Total withheld",
    },
  ];

  return (
    <ReportFrame<PayrollRow>
      title="Payroll Report"
      description="Payroll summaries and deductions"
      api="/api/payroll"
      cards={cards}
      columns={[
        { key: "employeeId", label: "Employee", className: "font-medium", render: (r: PayrollRow) => empName(r) },
        { key: "grossPay", label: "Gross", render: (r: PayrollRow) => formatMoney(Number(r.grossPay) || 0) },
        { key: "netPay", label: "Net Pay", render: (r: PayrollRow) => formatMoney(Number(r.netPay) || 0) },
        { key: "status", label: "Status" },
      ]}
    />
  );
}
