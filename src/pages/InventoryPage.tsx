import { useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";
import { SearchBox } from "../components/SearchBox";
import { money } from "../lib/format";
import { productCategories, lowStockThreshold } from "../lib/constants";
import { exportCsv } from "../lib/csv";

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc";

type Props = {
  onAdd: () => void;
};

export function InventoryPage({ onAdd }: Props) {
  const { products, updateProduct, deleteProduct, settings } = useStore();
  const currency = settings.currency;
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterCategory, setFilterCategory] = useState("All");
  const [lowOnly, setLowOnly] = useState(false);

  const visible = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesQuery = `${product.name} ${product.sku || ""} ${product.barcode || ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory =
        filterCategory === "All" || product.category === filterCategory;
      const matchesLow = !lowOnly || product.stock <= lowStockThreshold;
      return matchesQuery && matchesCategory && matchesLow;
    });
    const sorted = [...filtered].sort((a, b) => {
      let diff: number;
      if (sortBy === "name") diff = a.name.localeCompare(b.name);
      else diff = a[sortBy] - b[sortBy];
      return sortDir === "asc" ? diff : -diff;
    });
    return sorted;
  }, [products, query, filterCategory, lowOnly, sortBy, sortDir]);

  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  );
  const lowStock = products.filter(
    (product) => product.stock <= lowStockThreshold,
  ).length;
  const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const handleExport = () =>
    exportCsv(
      "worknest-inventory.csv",
      ["Name", "Category", "SKU", "Barcode", "Price", "Stock", "Value"],
      products.map((p) => [
        p.name,
        p.category,
        p.sku || "",
        p.barcode || "",
        p.price.toFixed(2),
        p.stock,
        (p.price * p.stock).toFixed(2),
      ]),
    );

  const sortArrow = (key: SortKey) =>
    sortBy === key ? (sortDir === "asc" ? "↑" : "↓") : "";

  return (
    <main className="module-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">INVENTORY MANAGEMENT</p>
          <h1>Inventory control</h1>
          <p className="subheading">
            Track availability, pricing, SKUs, and barcode identifiers in one
            place.
          </p>
        </div>
        <Button variant="outline" onClick={onAdd}>
          ＋ Add product
        </Button>
      </div>
      <div className="inventory-summary">
        <div>
          <span>Total products</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Units on hand</span>
          <strong>{totalUnits}</strong>
        </div>
        <div>
          <span>Inventory value</span>
          <strong>{money(inventoryValue, currency)}</strong>
        </div>
        <div className="summary-warning">
          <span>Low stock</span>
          <strong>{lowStock}</strong>
        </div>
      </div>
      <div className="inventory-toolbar">
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Search inventory, SKU, or barcode..."
        />
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
        >
          <option value="All">All categories</option>
          {productCategories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Button
          variant={lowOnly ? "primary" : "outline"}
          className="filter-button"
          onClick={() => setLowOnly((v) => !v)}
        >
          ! Low stock
        </Button>
        <Button variant="outline" className="filter-button" onClick={handleExport}>
          ⇩ Export
        </Button>
      </div>
      <div className="inventory-table">
        <div className="inventory-table-head">
          <span>Product</span>
          <span>SKU / Barcode</span>
          <span>Category</span>
          <button className="sort-header" onClick={() => toggleSort("price")}>
            Price {sortArrow("price")}
          </button>
          <button className="sort-header" onClick={() => toggleSort("stock")}>
            Stock {sortArrow("stock")}
          </button>
          <span>Value</span>
          <span>Actions</span>
        </div>
        {visible.map((product) => (
          <div className="inventory-row" key={product._id}>
            <strong>
              {product.icon || "✦"} {product.name}
            </strong>
            <span>
              <code>{product.sku || "SKU pending"}</code>
              <small>{product.barcode || "No barcode"}</small>
            </span>
            <span>{product.category}</span>
            <label>
              <span className="sr-only">Price</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={product.price}
                onChange={(event) =>
                  updateProduct(product._id, "price", event.target.value)
                }
              />
            </label>
            <label>
              <span className="sr-only">Stock</span>
              <input
                className={
                  product.stock <= lowStockThreshold
                    ? "stock-input low"
                    : "stock-input"
                }
                type="number"
                min="0"
                value={product.stock}
                onChange={(event) =>
                  updateProduct(product._id, "stock", event.target.value)
                }
              />
            </label>
            <b>{money(product.price * product.stock, currency)}</b>
            <button
              className="delete-product"
              onClick={() => {
                if (window.confirm(`Delete ${product.name} permanently?`))
                  void deleteProduct(product._id);
              }}
              title={`Delete ${product.name}`}
            >
              Delete
            </button>
          </div>
        ))}
        {!visible.length && (
          <div className="spreadsheet-empty">
            No products match your filters.
          </div>
        )}
      </div>
    </main>
  );
}
