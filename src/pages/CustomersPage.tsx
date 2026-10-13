import { useMemo, useState, type FormEvent } from "react";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";
import { SearchBox } from "../components/SearchBox";
import { Modal } from "../components/Modal";
import type { CustomerForm } from "../types";

const emptyForm: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  notes: "",
};

export function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerForm>(emptyForm);

  const visible = useMemo(
    () =>
      customers.filter((customer) =>
        `${customer.name} ${customer.email || ""} ${customer.phone || ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [customers, query],
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const customer = customers.find((item) => item._id === id);
    if (!customer) return;
    setForm({
      name: customer.name,
      email: customer.email || "",
      phone: customer.phone || "",
      notes: customer.notes || "",
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (editingId) await updateCustomer(editingId, form);
    else await addCustomer(form);
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <main className="module-page customers-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">CUSTOMER DIRECTORY</p>
          <h1>Customers</h1>
          <p className="subheading">
            Track customer details and link them to orders at checkout.
          </p>
        </div>
        <Button onClick={openAdd}>＋ Add customer</Button>
      </div>
      <div className="inventory-summary">
        <div>
          <span>Total customers</span>
          <strong>{customers.length}</strong>
        </div>
        <div>
          <span>With email</span>
          <strong>
            {customers.filter((item) => item.email).length}
          </strong>
        </div>
        <div>
          <span>With phone</span>
          <strong>
            {customers.filter((item) => item.phone).length}
          </strong>
        </div>
      </div>
      <div className="inventory-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search customers..."
        />
      </div>
      <div className="inventory-table">
        <div className="inventory-table-head customer-head">
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Notes</span>
          <span>Actions</span>
        </div>
        {visible.length ? (
          visible.map((customer) => (
            <div className="inventory-row customer-row" key={customer._id}>
              <strong>{customer.name}</strong>
              <span>{customer.email || "—"}</span>
              <span>{customer.phone || "—"}</span>
              <span className="customer-notes">{customer.notes || "—"}</span>
              <div className="row-actions">
                <Button
                  variant="outline"
                  className="row-action"
                  onClick={() => openEdit(customer._id)}
                >
                  Edit
                </Button>
                <button
                  className="delete-product"
                  onClick={() => {
                    if (window.confirm(`Remove ${customer.name}?`))
                      void deleteCustomer(customer._id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="spreadsheet-empty">
            {customers.length
              ? "No customers match your search."
              : "Add your first customer to get started."}
          </div>
        )}
      </div>
      {showForm && (
        <Modal
          onClose={() => setShowForm(false)}
          className="product-form"
          label={editingId ? "Edit customer" : "Add customer"}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">CUSTOMER</p>
                <h2>{editingId ? "Edit customer" : "Add a customer"}</h2>
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
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="name@example.com"
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
              Notes
              <textarea
                value={form.notes}
                onChange={(event) =>
                  setForm({ ...form, notes: event.target.value })
                }
                placeholder="Preferences, allergies, VIP..."
                rows={3}
              />
            </label>
            <Button type="submit" className="pay-button form-submit">
              {editingId ? "Save changes" : "Add customer"} <span>→</span>
            </Button>
          </form>
        </Modal>
      )}
    </main>
  );
}
