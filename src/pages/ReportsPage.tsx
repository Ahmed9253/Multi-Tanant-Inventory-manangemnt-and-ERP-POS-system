import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";
import { money } from "../lib/format";
import { exportCsv } from "../lib/csv";

export function ReportsPage() {
  const { reports, settings } = useStore();
  const currency = settings.currency;

  const totals = reports.reduce(
    (summary, row) => ({
      bills: summary.bills + row.bills,
      revenue: summary.revenue + row.revenue,
      tax: summary.tax + row.tax,
      discounts: summary.discounts + row.discounts,
      items: summary.items + row.items,
    }),
    { bills: 0, revenue: 0, tax: 0, discounts: 0, items: 0 },
  );

  const handleExport = () =>
    exportCsv(
      "worknest-monthly-report.csv",
      ["Month", "Bills", "Items sold", "Revenue", "Tax", "Discounts"],
      reports.map((row) => [
        row.month,
        row.bills,
        row.items,
        row.revenue.toFixed(2),
        row.tax.toFixed(2),
        row.discounts.toFixed(2),
      ]),
    );

  return (
    <main className="module-page reports-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">REPORTING WORKBOOK</p>
          <h1>Monthly reports</h1>
          <p className="subheading">
            A living spreadsheet of every bill and month since WorkNest was first
            used.
          </p>
        </div>
        <Button onClick={handleExport}>Export spreadsheet</Button>
      </div>
      <div className="report-summary">
        <div>
          <span>Total bills</span>
          <strong>{totals.bills}</strong>
        </div>
        <div>
          <span>Total items sold</span>
          <strong>{totals.items}</strong>
        </div>
        <div>
          <span>Total revenue</span>
          <strong>{money(totals.revenue, currency)}</strong>
        </div>
        <div>
          <span>Total tax</span>
          <strong>{money(totals.tax, currency)}</strong>
        </div>
      </div>
      <section className="spreadsheet-card">
        <div className="spreadsheet-heading">
          <div>
            <p className="eyebrow">BILLING LEDGER</p>
            <h2>Monthly sales sheet</h2>
          </div>
          <span className="chart-period">Calculated from MongoDB sales</span>
        </div>
        <div className="spreadsheet">
          <div className="spreadsheet-row spreadsheet-head">
            <span>Month</span>
            <span>Bills</span>
            <span>Items sold</span>
            <span>Revenue</span>
            <span>Tax</span>
            <span>Discounts</span>
          </div>
          {reports.length ? (
            reports.map((row) => (
              <div className="spreadsheet-row" key={row.month}>
                <strong>{row.month}</strong>
                <span>{row.bills}</span>
                <span>{row.items}</span>
                <b>{money(row.revenue, currency)}</b>
                <span>{money(row.tax, currency)}</span>
                <span>{money(row.discounts, currency)}</span>
              </div>
            ))
          ) : (
            <div className="spreadsheet-empty">
              Your first month will appear here after the first bill is completed.
            </div>
          )}
          <div className="spreadsheet-row spreadsheet-total">
            <strong>All time</strong>
            <b>{totals.bills}</b>
            <b>{totals.items}</b>
            <b>{money(totals.revenue, currency)}</b>
            <b>{money(totals.tax, currency)}</b>
            <b>{money(totals.discounts, currency)}</b>
          </div>
        </div>
      </section>
      <div className="report-notes">
        <div>
          <strong>What is included</strong>
          <p>
            Every completed POS bill, item quantity, revenue, tax, and discount is
            grouped into its calendar month.
          </p>
        </div>
        <div>
          <strong>Starting point</strong>
          <p>
            The workbook begins in the month WorkNest was first connected to your
            database and continues automatically.
          </p>
        </div>
      </div>
    </main>
  );
}
