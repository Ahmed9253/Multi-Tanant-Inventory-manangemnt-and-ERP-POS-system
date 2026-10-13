import { useState, type FormEvent } from "react";
import type { BranchForm } from "../types";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/Button";

const emptyForm: BranchForm = {
  name: "",
  code: "",
  address: "",
  manager: "",
  phone: "",
};

export function BranchEntryPage() {
  const { addBranch } = useStore();
  const { user, logout } = useAuth();
  const [form, setForm] = useState<BranchForm>(emptyForm);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const ok = await addBranch(form);
    if (ok) setForm(emptyForm);
  };

  return (
    <main className="entry-page">
      <header className="entry-topbar">
        <div className="entry-brand">
          <span className="brand-mark">◌</span>
          <strong>WorkNest</strong>
          <small>POS AND ERP</small>
        </div>
        <button
          type="button"
          className="entry-logout"
          onClick={logout}
          title={user ? `Sign out ${user.name}` : "Sign out"}
        >
          <span>Sign out</span>
          <span aria-hidden="true">⏻</span>
        </button>
      </header>
      <div className="entry-layout">
        <section className="entry-intro">
          <p className="eyebrow">WELCOME TO WORKNEST</p>
          <h1>Start with your first branch.</h1>
          <p>
            Set up the location where your team will sell, manage inventory, and
            grow the business. You can add more branches anytime.
          </p>
          <div className="entry-steps">
            <span>
              01 <b>Create your branch</b>
            </span>
            <span>
              02 <b>Enter your workspace</b>
            </span>
            <span>
              03 <b>Add products and sell</b>
            </span>
          </div>
        </section>
        <form className="entry-form" onSubmit={handleSubmit}>
          <p className="eyebrow">FIRST-TIME SETUP</p>
          <h2>Create your main location</h2>
          <p className="form-note">
            This becomes your first workspace branch. Nothing is pre-filled.
          </p>
          <label>
            Branch name
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Downtown Store"
            />
          </label>
          <div className="form-row two-col">
            <label>
              Branch code
              <input
                required
                value={form.code}
                onChange={(event) =>
                  setForm({ ...form, code: event.target.value })
                }
                placeholder="DWN-01"
              />
            </label>
            <label>
              Manager
              <input
                value={form.manager}
                onChange={(event) =>
                  setForm({ ...form, manager: event.target.value })
                }
                placeholder="Optional"
              />
            </label>
          </div>
          <label>
            Address
            <input
              value={form.address}
              onChange={(event) =>
                setForm({ ...form, address: event.target.value })
              }
              placeholder="Street, city, country"
            />
          </label>
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(event) =>
                setForm({ ...form, phone: event.target.value })
              }
              placeholder="Optional"
            />
          </label>
          <Button type="submit" className="entry-submit">
            Enter WorkNest <span>→</span>
          </Button>
        </form>
      </div>
      <footer>
        <span>Quibble Byte · WorkNest POS and ERP</span>
        <span>Private operator workspace</span>
      </footer>
    </main>
  );
}
