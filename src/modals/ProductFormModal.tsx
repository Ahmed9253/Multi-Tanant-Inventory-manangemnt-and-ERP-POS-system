import type { FormEvent } from "react";
import type { ProductForm } from "../types";
import { productCategories } from "../lib/constants";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";

type Props = {
  form: ProductForm;
  setForm: (form: ProductForm) => void;
  onSubmit: (event: FormEvent) => void;
  onClose: () => void;
};

export function ProductFormModal({ form, setForm, onSubmit, onClose }: Props) {
  return (
    <Modal onClose={onClose} className="product-form" label="Add product">
      <form onSubmit={onSubmit}>
        <div className="form-heading">
          <div>
            <p className="eyebrow">INVENTORY</p>
            <h2>Add a product</h2>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <label>
          Product name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="e.g. Vanilla Latte"
          />
        </label>
        <div className="form-row">
          <label>
            Category
            <select
              value={form.category}
              onChange={(event) =>
                setForm({ ...form, category: event.target.value })
              }
            >
              {productCategories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Price
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                setForm({ ...form, price: event.target.value })
              }
              placeholder="0.00"
            />
          </label>
          <label>
            Stock
            <input
              required
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) =>
                setForm({ ...form, stock: event.target.value })
              }
              placeholder="0"
            />
          </label>
          <label>
            Barcode
            <input
              value={form.barcode}
              onChange={(event) =>
                setForm({ ...form, barcode: event.target.value })
              }
              placeholder="Scan or type barcode"
            />
          </label>
        </div>
        <Button type="submit" className="pay-button form-submit">
          Save product <span>→</span>
        </Button>
      </form>
    </Modal>
  );
}
