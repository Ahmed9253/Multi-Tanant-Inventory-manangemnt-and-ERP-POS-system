"use client";

import { useEffect, useState } from "react";
import { ReportFrame, formatMoney } from "@/components/resource/report-frame";

interface Purchase {
  _id: string;
  supplierId?: { name: string; company?: string } | string;
  total: number;
  status: string;
  createdAt: string;
}

export default function PurchaseReport() {
  const [state, setState] = useState<{ rows: Purchase[]; loaded: boolean }>({ rows: [], loaded: false });

  useEffect(() => {
    fetch("/api/purchases?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setState({ rows: d.data?.data || d.data || [], loaded: true });
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  const total = state.rows.reduce((s, x) => s + (Number(x.total) || 0), 0);

  const cards = [
    { label: "Total Purchases", value: formatMoney(total), description: `${state.rows.length} orders` },
    {
      label: "Avg Order",
      value: state.rows.length ? formatMoney(total / state.rows.length) : formatMoney(0),
      description: "Per purchase order",
    },
    { label: "Orders", value: String(state.rows.length), description: "All time" },
  ];

  return (
    <ReportFrame
      title="Purchase Report"
      description="Purchase history and supplier analysis"
      api="/api/purchases"
      cards={cards}
      columns={[
        { key: "_id", label: "Order", className: "font-medium", render: (r: Purchase) => r._id.slice(-6).toUpperCase() },
        { key: "supplierId", label: "Supplier", render: (r: Purchase) => typeof r.supplierId === "object" && r.supplierId ? (r.supplierId as { name: string }).name : "-" },
        { key: "total", label: "Total", render: (r: Purchase) => formatMoney(Number(r.total) || 0) },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Date", render: (r: Purchase) => new Date(r.createdAt).toLocaleDateString() },
      ]}
    />
  );
}
