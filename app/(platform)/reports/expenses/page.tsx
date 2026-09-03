"use client";

import { useEffect, useState } from "react";
import { ReportFrame, formatMoney } from "@/components/resource/report-frame";

type Expense = {
  _id: string;
  description: string;
  categoryId?: string;
  amount: number;
  date: string;
  status: string;
};

export default function ExpenseReport() {
  const [state, setState] = useState<{ rows: Expense[]; loaded: boolean }>({ rows: [], loaded: false });

  useEffect(() => {
    fetch("/api/expenses?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setState({ rows: d.data?.data || d.data || [], loaded: true });
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  const total = state.rows.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const approved = state.rows.filter((x) => x.status === "approved").reduce((s, x) => s + (Number(x.amount) || 0), 0);

  const cards = [
    { label: "Total Expenses", value: formatMoney(total), description: `${state.rows.length} entries` },
    { label: "Approved", value: formatMoney(approved), description: "Approved expenses" },
    {
      label: "Avg Expense",
      value: state.rows.length ? formatMoney(total / state.rows.length) : formatMoney(0),
      description: "Per entry",
    },
  ];

  return (
    <ReportFrame<Expense>
      title="Expense Report"
      description="Expense breakdown by category"
      api="/api/expenses"
      cards={cards}
      columns={[
        { key: "description", label: "Description", className: "font-medium" },
        { key: "categoryId", label: "Category", render: (r: Expense) => r.categoryId || "-" },
        { key: "amount", label: "Amount", render: (r: Expense) => formatMoney(Number(r.amount) || 0) },
        { key: "status", label: "Status" },
        { key: "date", label: "Date", render: (r: Expense) => new Date(r.date).toLocaleDateString() },
      ]}
    />
  );
}
