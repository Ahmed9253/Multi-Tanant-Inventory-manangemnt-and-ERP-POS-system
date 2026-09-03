"use client";

import { useEffect, useState } from "react";
import { ReportFrame, formatMoney } from "@/components/resource/report-frame";

type Sale = {
  receiptNumber: string;
  customerId?: { name: string } | string;
  total: number;
  status: string;
  createdAt: string;
};

export default function SalesReport() {
  const [state, setState] = useState<{ sales: Sale[]; loaded: boolean }>({ sales: [], loaded: false });

  useEffect(() => {
    fetch("/api/sales?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setState({ sales: d.data?.data || d.data?.sales || d.data || [], loaded: true });
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  const total = state.sales.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const completed = state.sales.filter((x) => x.status === "completed");
  const completedTotal = completed.reduce((s, x) => s + (Number(x.total) || 0), 0);

  const cards = [
    { label: "Total Sales", value: formatMoney(total), description: `${state.sales.length} transactions` },
    { label: "Completed Revenue", value: formatMoney(completedTotal), description: `${completed.length} completed` },
    {
      label: "Average Sale",
      value: state.sales.length ? formatMoney(total / state.sales.length) : formatMoney(0),
      description: "Per transaction",
    },
    { label: "Status", value: `${state.sales.filter((x) => x.status !== "completed").length}`, description: "Non-completed" },
  ];

  if (!state.loaded) {
    return <ReportFrame title="Sales Report" description="Sales performance and trends" api="/api/sales" columns={[]} cards={[]} />;
  }

  return (
    <ReportFrame<Sale>
      title="Sales Report"
      description="Sales performance and trends"
      api="/api/sales"
      cards={cards}
      columns={[
        { key: "receiptNumber", label: "Receipt #", className: "font-medium" },
        { key: "customerId", label: "Customer", render: (r: Sale) => (typeof r.customerId === "object" && r.customerId ? (r.customerId as { name: string }).name : typeof r.customerId === "string" ? r.customerId : "Walk-in") },
        { key: "total", label: "Total", render: (r: Sale) => formatMoney(Number(r.total) || 0) },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Date", render: (r: Sale) => new Date(r.createdAt).toLocaleDateString() },
      ]}
    />
  );
}
