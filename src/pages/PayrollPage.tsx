import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";
import { SearchBox } from "../components/SearchBox";
import { Modal } from "../components/Modal";
import { money } from "../lib/format";
import type { PayrollForm } from "../types";

function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(month: string): string {
  const [year, mon] = month.split("-");
  const date = new Date(Number(year), Number(mon) - 1);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

const emptyForm: PayrollForm = {
  employeeId: "",
  employeeName: "",
  month: currentMonth(),
  baseSalary: "",
  bonus: "0",
  deductions: "0",
};

export function PayrollPage() {
  const {
    payroll,
    employees,
    settings,
    addPayroll,
    updatePayroll,
    deletePayroll,
    generatePayroll,
  } = useStore();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PayrollForm>(emptyForm);
  const [genMonth, setGenMonth] = useState(currentMonth());

  const visible = useMemo(
    () =>
      payroll
        .filter((record) =>
          `${record.employeeName} ${record.month}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => b.month.localeCompare(a.month)),
    [payroll, query],
  );

  const pendingCount = payroll.filter((r) => r.status === "pending").length;
  const paidCount = payroll.filter((r) => r.status === "paid").length;
  const totalNet = payroll.reduce((sum, r) => sum + r.netPay, 0);

  const openAdd = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const selectEmployee = (id: string) => {
    const employee = employees.find((e) => e._id === id);
    if (employee) {
      setForm({
        ...form,
        employeeId: id,
        employeeName: employee.name,
        baseSalary: String(employee.salary),
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await addPayroll(form);
    setShowForm(false);
    setForm(emptyForm);
  };

  const handleGenerate = async () => {
    if (
      window.confirm(
        `Generate payroll for ${monthLabel(genMonth)}? This creates records for all active employees.`,
      )
    ) {
      await generatePayroll(genMonth);
    }
  };

  return (
    <main className="module-page payroll-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">HUMAN RESOURCES</p>
          <h1>Payroll</h1>
          <p className="subheading">
            Generate monthly payroll and manage bonus, deductions, and payments.
          </p>
        </div>
        <div className="payroll-actions">
          <Button variant="outline" onClick={openAdd}>
            ＋ Add record
          </Button>
          <Button onClick={handleGenerate}>⚡ Generate</Button>
        </div>
      </div>
      <div className="inventory-summary">
        <div>
          <span>Total records</span>
          <strong>{payroll.length}</strong>
        </div>
        <div>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div>
          <span>Paid</span>
          <strong>{paidCount}</strong>
        </div>
        <div>
          <span>Total net pay</span>
          <strong>{money(totalNet, settings.currency)}</strong>
        </div>
      </div>
      <div className="payroll-generate-bar">
        <label>
          Generate for month
          <input
            type="month"
            value={genMonth}
            onChange={(event) => setGenMonth(event.target.value)}
          />
        </label>
      </div>
      <div className="inventory-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search payroll..."
        />
      </div>
      <div className="inventory-table">
        <div className="inventory-table-head payroll-head">
          <span>Employee</span>
          <span>Month</span>
          <span>Base</span>
          <span>Bonus</span>
          <span>Deductions</span>
          <span>Net pay</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {visible.length ? (
          visible.map((record) => (
            <div className="inventory-row payroll-row" key={record._id}>
              <strong>{record.employeeName}</strong>
              <span>{monthLabel(record.month)}</span>
              <span>{money(record.baseSalary, settings.currency)}</span>
              <span className="payroll-bonus">
                {money(record.bonus, settings.currency)}
              </span>
              <span className="payroll-deduction">
                −{money(record.deductions, settings.currency)}
              </span>
              <strong>{money(record.netPay, settings.currency)}</strong>
              <span>
                <span
                  className={`status-pill ${record.status === "paid" ? "pill-paid" : "pill-pending"}`}
                >
                  {record.status}
                </span>
              </span>
              <div className="row-actions">
                {record.status === "pending" && (
                  <Button
                    variant="outline"
                    className="row-action"
                    onClick={() =>
                      void updatePayroll(record._id, {
                        status: "paid",
                        paidAt: new Date().toISOString(),
                      })
                    }
                  >
                    Mark paid
                  </Button>
                )}
                <button
                  className="delete-product"
                  onClick={() => {
                    if (window.confirm("Remove this payroll record?"))
                      void deletePayroll(record._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="spreadsheet-empty">
            {payroll.length
              ? "No payroll records match your search."
              : "Generate payroll or add a record to get started."}
          </div>
        )}
      </div>
      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          className="product-form"
          label="Add payroll record"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">PAYROLL</p>
                <h2>Add a payroll record</h2>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <label>
              Employee
              <select
                required
                value={form.employeeId}
                onChange={(event) => selectEmployee(event.target.value)}
              >
                <option value="">Select employee…</option>
                {employees
                  .filter((e) => e.status === "active")
                  .map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name} — {e.department || "General"}
                    </option>
                  ))}
              </select>
            </label>
            <div className="form-row two-col">
              <label>
                Month
                <input
                  type="month"
                  required
                  value={form.month}
                  onChange={(event) =>
                    setForm({ ...form, month: event.target.value })
                  }
                />
              </label>
              <label>
                Base salary
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.baseSalary}
                  onChange={(event) =>
                    setForm({ ...form, baseSalary: event.target.value })
                  }
                  placeholder="3000"
                />
              </label>
            </div>
            <div className="form-row two-col">
              <label>
                Bonus
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.bonus}
                  onChange={(event) =>
                    setForm({ ...form, bonus: event.target.value })
                  }
                  placeholder="0"
                />
              </label>
              <label>
                Deductions
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.deductions}
                  onChange={(event) =>
                    setForm({ ...form, deductions: event.target.value })
                  }
                  placeholder="0"
                />
              </label>
            </div>
            <Button type="submit" className="pay-button form-submit">
              Create record <span>→</span>
            </Button>
          </form>
        </Modal>
      )}
    </main>
  );
}
