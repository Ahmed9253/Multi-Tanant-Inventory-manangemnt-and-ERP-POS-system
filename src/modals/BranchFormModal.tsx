import type { FormEvent } from "react";
import type { BranchForm } from "../types";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";

type Props = {
  form: BranchForm;
  setForm: (form: BranchForm) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
};

export function BranchFormModal({ form, setForm, onSubmit, onClose }: Props) {
  return (
    <Modal onClose={onClose} className="product-form branch-form" label="Create branch">
      <form onSubmit={onSubmit}>
        <div className="form-heading">
          <div>
            <p className="eyebrow">ORGANIZATION</p>
            <h2>Create a branch</h2>
            <p className="form-note">
              Set up a new operating location for your team.
            </p>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <label>
          Branch name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. Riverside Store"
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
              placeholder="RVR-01"
            />
          </label>
          <label>
            Manager
            <input
              value={form.manager}
              onChange={(event) =>
                setForm({ ...form, manager: event.target.value })
              }
              placeholder="Team lead"
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
            placeholder="Contact number"
          />
        </label>
        <Button type="submit" className="pay-button form-submit">
          Create branch <span>→</span>
        </Button>
      </form>
    </Modal>
  );
}
