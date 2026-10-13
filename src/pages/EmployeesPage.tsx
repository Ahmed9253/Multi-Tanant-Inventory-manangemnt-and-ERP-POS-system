import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";
import { SearchBox } from "../components/SearchBox";
import { Modal } from "../components/Modal";
import { money } from "../lib/format";
import { departments, employeeRoles } from "../lib/constants";
import type { EmployeeForm } from "../types";

const emptyForm: EmployeeForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  role: "cashier",
  department: "Sales",
  position: "",
  salary: "",
  status: "active",
};

export function EmployeesPage() {
  const {
    employees,
    settings,
    addEmployee,
    updateEmployee,
    deleteEmployee,
  } = useStore();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);

  const visible = useMemo(
    () =>
      employees.filter((employee) =>
        `${employee.name} ${employee.email} ${employee.phone || ""} ${employee.department || ""} ${employee.position || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [employees, query],
  );

  const activeCount = employees.filter((e) => e.status === "active").length;
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const employee = employees.find((item) => item._id === id);
    if (!employee) return;
    setForm({
      name: employee.name,
      email: employee.email,
      password: "",
      phone: employee.phone || "",
      role: employee.role,
      department: employee.department || "Sales",
      position: employee.position || "",
      salary: String(employee.salary),
      status: employee.status,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId) {
      const patch: Partial<EmployeeForm> = { ...form };
      if (!patch.password) delete patch.password;
      await updateEmployee(editingId, patch);
    } else {
      await addEmployee(form);
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <main className="module-page employees-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">HUMAN RESOURCES</p>
          <h1>Employees</h1>
          <p className="subheading">
            Manage staff accounts, roles, and compensation.
          </p>
        </div>
        <Button onClick={openAdd}>＋ Add employee</Button>
      </div>
      <div className="inventory-summary">
        <div>
          <span>Total employees</span>
          <strong>{employees.length}</strong>
        </div>
        <div>
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Monthly payroll</span>
          <strong>{money(totalSalary, settings.currency)}</strong>
        </div>
      </div>
      <div className="inventory-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search employees..."
        />
      </div>
      <div className="inventory-table">
        <div className="inventory-table-head employee-head">
          <span>Name</span>
          <span>Role</span>
          <span>Department</span>
          <span>Salary</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {visible.length ? (
          visible.map((employee) => (
            <div className="inventory-row employee-row" key={employee._id}>
              <div className="employee-name-cell">
                <strong>{employee.name}</strong>
                <small>{employee.email}</small>
              </div>
              <span className={`role-badge role-${employee.role}`}>
                {employee.role}
              </span>
              <span>{employee.department || "—"}</span>
              <span>{money(employee.salary, settings.currency)}</span>
              <span>
                <span
                  className={`status-pill ${employee.status === "active" ? "pill-active" : "pill-inactive"}`}
                >
                  {employee.status}
                </span>
              </span>
              <div className="row-actions">
                <Button
                  variant="outline"
                  className="row-action"
                  onClick={() => openEdit(employee._id)}
                >
                  Edit
                </Button>
                <button
                  className="delete-product"
                  onClick={() => {
                    if (window.confirm(`Remove ${employee.name}?`))
                      void deleteEmployee(employee._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="spreadsheet-empty">
            {employees.length
              ? "No employees match your search."
              : "Add your first employee to get started."}
          </div>
        )}
      </div>
      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          className="product-form"
          label={editingId ? "Edit employee" : "Add employee"}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">EMPLOYEE</p>
                <h2>{editingId ? "Edit employee" : "Add an employee"}</h2>
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
              Name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="e.g. Jordan Lee"
              />
            </label>
            <div className="form-row two-col">
              <label>
                Email
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="name@worknest.com"
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="Contact number"
                />
              </label>
            </div>
            <label>
              {editingId ? "New password (leave blank to keep)" : "Password"}
              <input
                type="password"
                required={!editingId}
                value={form.password}
                onChange={(event) =>
                  setForm({ ...form, password: event.target.value })
                }
                placeholder="••••••••"
              />
            </label>
            <div className="form-row two-col">
              <label>
                Role
                <select
                  value={form.role}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      role: event.target.value as EmployeeForm["role"],
                    })
                  }
                >
                  {employeeRoles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Department
                <select
                  value={form.department}
                  onChange={(event) =>
                    setForm({ ...form, department: event.target.value })
                  }
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row two-col">
              <label>
                Position
                <input
                  value={form.position}
                  onChange={(event) =>
                    setForm({ ...form, position: event.target.value })
                  }
                  placeholder="e.g. Senior Cashier"
                />
              </label>
              <label>
                Monthly salary
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.salary}
                  onChange={(event) =>
                    setForm({ ...form, salary: event.target.value })
                  }
                  placeholder="3000"
                />
              </label>
            </div>
            <label>
              Status
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as EmployeeForm["status"],
                  })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <Button type="submit" className="pay-button form-submit">
              {editingId ? "Save changes" : "Add employee"} <span>→</span>
            </Button>
          </form>
        </Modal>
      )}
    </main>
  );
}
