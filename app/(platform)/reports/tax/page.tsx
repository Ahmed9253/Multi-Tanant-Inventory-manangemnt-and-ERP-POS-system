"use client";

import { useEffect, useState } from "react";
import { ReportFrame, formatMoney } from "@/components/resource/report-frame";

type TaxRow = {
  _id: string;
  receiptNumber: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
  createdAt: string;
};

export default function TaxReport() {
  const [state, setState] = useState<{ rows: TaxRow[]; loaded: boolean }>({ rows: [], loaded: false });

  useEffect(() => {
    fetch("/api/sales?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setState({ rows: d.data?.data || d.data?.sales || d.data || [], loaded: true });
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  const completed = state.rows.filter((x) => x.status === "completed");
  const taxCollected = completed.reduce((s, x) => s + (Number(x.taxAmount) || 0), 0);
  const taxableBase = completed.reduce((s, x) => s + (Number(x.subtotal) || 0), 0);
  const grossSales = completed.reduce((s, x) => s + (Number(x.total) || 0), 0);
  const effectiveRate = taxableBase > 0 ? (taxCollected / taxableBase) * 100 : 0;

  const cards = [
    { label: "Tax Collected", value: formatMoney(taxCollected), description: `${completed.length} completed sales` },
    { label: "Taxable Base", value: formatMoney(taxableBase), description: "Subtotal of sales" },
    { label: "Gross Sales", value: formatMoney(grossSales), description: "Including tax" },
    { label: "Effective Rate", value: `${effectiveRate.toFixed(2)}%`, description: "Tax / taxable base" },
  ];

  return (
    <ReportFrame<TaxRow>
      title="Tax Report"
      description="Tax liabilities and filings"
      api="/api/sales"
      cards={cards}
      columns={[
        { key: "receiptNumber", label: "Receipt #", className: "font-medium" },
        { key: "subtotal", label: "Subtotal", render: (r: TaxRow) => formatMoney(Number(r.subtotal) || 0) },
        { key: "taxAmount", label: "Tax", render: (r: TaxRow) => formatMoney(Number(r.taxAmount) || 0) },
        { key: "total", label: "Total", render: (r: TaxRow) => formatMoney(Number(r.total) || 0) },
        { key: "status", label: "Status" },
        { key: "createdAt", label: "Date", render: (r: TaxRow) => new Date(r.createdAt).toLocaleDateString() },
      ]}
    />
  );
}
