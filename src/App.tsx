import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FormEvent } from "react";
import "./App.css";

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  color?: string;
  icon?: string;
  barcode?: string;
  sku?: string;
};
type Metrics = {
  revenue: number;
  orders: number;
  inventoryValue: number;
  units: number;
  lowStock: number;
  daily?: { _id: string; revenue: number; orders: number }[];
};
type Branch = {
  _id: string;
  name: string;
  code: string;
  address?: string;
  manager?: string;
  phone?: string;
  status: string;
};
type MonthlyReport = {
  month: string;
  bills: number;
  revenue: number;
  tax: number;
  discounts: number;
  items: number;
};
const fallbackProducts: Product[] = [];
/*
type MonthlyReport = { month: string; bills: number; revenue: number; tax: number; discounts: number; items: number };
    _id: "1",
    name: "Cortado",
    category: "Coffee",
    price: 4.5,
    stock: 12,
    color: "rose",
    icon: "☕",
  },
  {
    _id: "2",
    name: "Iced Matcha",
    category: "Coffee",
    price: 6.25,
    stock: 8,
    color: "mint",
    icon: "✦",
  },
  {
    _id: "3",
    name: "Cinnamon Roll",
    category: "Bakery",
    price: 5,
    stock: 4,
    color: "gold",
    icon: "⌁",
  },
  {
    _id: "4",
    name: "Butter Croissant",
    category: "Bakery",
    price: 4.25,
    stock: 15,
    color: "peach",
    icon: "◒",
  },
  {
    _id: "5",
    name: "Almond Cookie",
    category: "Bakery",
    price: 3.5,
    stock: 20,
    color: "lavender",
    icon: "✿",
  },
  {
    _id: "6",
    name: "Sparkling Water",
    category: "Drinks",
    price: 3,
    stock: 24,
    color: "sky",
    icon: "◉",
  },
  {
    _id: "7",
    name: "Berry Kombucha",
    category: "Drinks",
    price: 5.5,
    stock: 6,
    color: "plum",
    icon: "♢",
  },
  {
    _id: "8",
    name: "House Granola",
    category: "Pantry",
    price: 9.5,
    stock: 7,
    color: "olive",
    icon: "❋",
  },
]; */
const categories = ["All items", "Coffee", "Bakery", "Drinks", "Pantry"];
const money = (value: number) => `$${value.toFixed(2)}`;

function App() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [metrics, setMetrics] = useState<Metrics>({
    revenue: 0,
    orders: 0,
    inventoryValue: 0,
    units: 0,
    lowStock: 2,
  });
  const [view, setView] = useState<
    "sell" | "dashboard" | "inventory" | "branches" | "reports"
  >("sell");
  const [monthlyReports, setMonthlyReports] = useState<MonthlyReport[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState(
    () => localStorage.getItem("tillora-active-branch") || "",
  );
  const [dataReady, setDataReady] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchForm, setBranchForm] = useState({
    name: "",
    code: "",
    address: "",
    manager: "",
    phone: "",
  });
  const [theme, setTheme] = useState(
    () => localStorage.getItem("tillora-theme") || "light",
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [showHelp, setShowHelp] = useState(false);
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  const shortcut = isMac ? "⌘ /" : "Ctrl /";
  const [category, setCategory] = useState("All items");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payment, setPayment] = useState("Card");
  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState("");
  const [lastSale, setLastSale] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Coffee",
    price: "",
    stock: "",
    barcode: "",
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("tillora-theme", theme);
  }, [theme]);
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((isMac ? event.metaKey : event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setShowHelp((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMac]);

  const refresh = useCallback(async () => {
    try {
      const [productResponse, metricResponse, branchResponse, reportResponse] =
        await Promise.all([
          fetch("/api/products"),
          fetch("/api/dashboard"),
          fetch("/api/branches"),
          fetch("/api/reports/monthly"),
        ]);
      const nextProducts = productResponse.ok
        ? await productResponse.json()
        : null;
      const nextMetrics = metricResponse.ok
        ? await metricResponse.json()
        : null;
      const nextBranches = branchResponse.ok
        ? await branchResponse.json()
        : null;
      const nextReports = reportResponse.ok
        ? (await reportResponse.json()).months
        : null;
      startTransition(() => {
        if (nextProducts) setProducts(nextProducts);
        if (nextMetrics) setMetrics(nextMetrics);
        if (nextBranches) setBranches(nextBranches);
        if (nextReports) setMonthlyReports(nextReports);
        if (nextBranches?.length && !activeBranchId) {
          setActiveBranchId(nextBranches[0]._id);
          localStorage.setItem("tillora-active-branch", nextBranches[0]._id);
        }
      });
    } catch {
      setLastSale("MongoDB is offline; using local catalog");
    } finally {
      setDataReady(true);
    }
  }, [activeBranchId]);
  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);
  const visibleProducts = products.filter(
    (product) =>
      (category === "All items" || product.category === category) &&
      product.name.toLowerCase().includes(query.toLowerCase()),
  );
  const cartItems = useMemo(
    () => products.filter((product) => cart[product._id]),
    [cart, products],
  );
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * cart[item._id],
    0,
  );
  const discountAmount = Math.min(Number(discount) || 0, subtotal);
  const tax = (subtotal - discountAmount) * 0.08;
  const total = subtotal - discountAmount + tax;
  const addToCart = (id: string) =>
    setCart((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  const handleSearch = (value: string) => {
    const product = products.find(
      (item) => item.barcode === value.trim() || item.sku === value.trim(),
    );
    if (product) {
      addToCart(product._id);
      setQuery("");
      return;
    }
    setQuery(value);
  };
  const changeQuantity = (id: string, amount: number) =>
    setCart((current) => {
      const next = (current[id] || 0) + amount;
      if (next <= 0) {
        const copy = { ...current };
        delete copy[id];
        return copy;
      }
      return { ...current, [id]: next };
    });
  const completeSale = async () => {
    if (!cartItems.length) return;
    const payload = {
      items: cartItems.map((item) => ({
        productId: item._id,
        name: item.name,
        quantity: cart[item._id],
        price: item.price,
      })),
      subtotal,
      tax,
      discount: discountAmount,
      total,
      paymentMethod: payment,
      customer,
    };
    try {
      await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setLastSale("Sale captured locally; MongoDB is offline");
    }
    setLastSale(
      `Order #${String(metrics.orders + 1).padStart(4, "0")} completed via ${payment}`,
    );
    setCart({});
    setCustomer("");
    setDiscount("");
    refresh();
  };
  const addProduct = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error();
      const product = await response.json();
      setProducts((current) => [...current, product]);
      setForm({
        name: "",
        category: "Coffee",
        price: "",
        stock: "",
        barcode: "",
      });
      setShowForm(false);
    } catch {
      setLastSale("Connect MongoDB to save new products");
    }
  };
  const updateProduct = async (
    id: string,
    field: "stock" | "price",
    value: string,
  ) => {
    const response = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: Number(value) }),
    });
    if (response.ok)
      setProducts((current) =>
        current.map((product) =>
          product._id === id ? { ...product, [field]: Number(value) } : product,
        ),
      );
  };
  const deleteProduct = async (id: string) => {
    if (!window.confirm("Delete this product permanently?")) return;
    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setProducts((current) => current.filter((product) => product._id !== id));
    setCart((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };
  const addBranch = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchForm),
      });
      if (!response.ok) throw new Error();
      const branch = await response.json();
      setBranches((current) => [...current, branch]);
      setActiveBranchId(branch._id);
      localStorage.setItem("tillora-active-branch", branch._id);
      setBranchForm({
        name: "",
        code: "",
        address: "",
        manager: "",
        phone: "",
      });
      setShowBranchForm(false);
    } catch {
      setLastSale("Connect MongoDB to save this branch");
    }
  };

  const activeBranch =
    branches.find((branch) => branch._id === activeBranchId) || branches[0];
  const enterBranch = (branch: Branch) => {
    setActiveBranchId(branch._id);
    localStorage.setItem("tillora-active-branch", branch._id);
    setView("sell");
  };
  if (!dataReady)
    return (
      <div className="entry-loading">
        <span className="brand-mark">◌</span>
        <strong>Tillora</strong>
        <span>Preparing your workspace</span>
      </div>
    );
  if (!branches.length)
    return (
      <BranchEntryPage
        branchForm={branchForm}
        setBranchForm={setBranchForm}
        onSubmit={addBranch}
      />
    );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◌</span>
          <span>Tillora</span>
          <small>ERP</small>
        </div>
        <nav className="main-nav">
          <button
            className={view === "sell" ? "active" : ""}
            onClick={() => setView("sell")}
          >
            ⌂ Sell
          </button>
          <button
            className={view === "dashboard" ? "active" : ""}
            onClick={() => setView("dashboard")}
          >
            ◫ Dashboard
          </button>
          <button
            className={view === "inventory" ? "active" : ""}
            onClick={() => setView("inventory")}
          >
            ▤ Inventory
          </button>
          <button
            className={view === "branches" ? "active" : ""}
            onClick={() => setView("branches")}
          >
            ⌘ Branches
          </button>
          <button
            className={view === "reports" ? "active" : ""}
            onClick={() => setView("reports")}
          >
            ▤ Reports
          </button>
        </nav>
        <div className="store-status">
          <span className="status-dot" />{" "}
          {activeBranch?.name || "Current branch"} <span className="divider" />{" "}
          <span className="muted">Register 01</span>
        </div>
        <div className="top-actions">
          <time className="live-clock" dateTime={currentTime.toISOString()}>
            {new Intl.DateTimeFormat(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(currentTime)}
          </time>
          <button
            className="icon-button theme-toggle"
            title="Toggle dark mode"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>
          <button className="icon-button" title="Notifications">
            ♧
          </button>
          <button className="avatar">AM</button>
        </div>
      </header>
      {view === "dashboard" ? (
        <Dashboard
          metrics={metrics}
          products={products}
          onAdd={() => setShowForm(true)}
        />
      ) : view === "inventory" ? (
        <Inventory
          products={products}
          onAdd={() => setShowForm(true)}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
        />
      ) : view === "branches" ? (
        <Branches
          branches={branches}
          activeBranchId={activeBranch?._id}
          onEnter={enterBranch}
          onAdd={() => setShowBranchForm(true)}
        />
      ) : view === "reports" ? (
        <Reports reports={monthlyReports} />
      ) : (
        <main className="workspace">
          <section className="catalog-panel">
            <div className="page-heading">
              <div>
                <p className="eyebrow">POINT OF SALE</p>
                <h1>Good morning, Alex</h1>
              </div>
              <button className="outline-button" onClick={() => setCart({})}>
                ＋ New order
              </button>
            </div>
            <div className="search-row">
              <label className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Search products..."
                />
                <kbd>⌘ K</kbd>
              </label>
              <button className="filter-button">☷ Filter</button>
            </div>
            <nav className="category-tabs">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                  {item === "All items" && <span>{products.length}</span>}
                </button>
              ))}
            </nav>
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <button
                  className="product-card"
                  key={product._id}
                  onClick={() => addToCart(product._id)}
                >
                  <div className={`product-art ${product.color || "mint"}`}>
                    <span>{product.icon || "✦"}</span>
                    <small>{product.stock} in stock</small>
                  </div>
                  <div className="product-info">
                    <strong>{product.name}</strong>
                    <span>{product.category}</span>
                    <b>{money(product.price)}</b>
                    <small className="sku-label">
                      {product.sku || "SKU pending"}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          </section>
          <OrderPanel
            cartItems={cartItems}
            cart={cart}
            changeQuantity={changeQuantity}
            customer={customer}
            setCustomer={setCustomer}
            discount={discount}
            setDiscount={setDiscount}
            subtotal={subtotal}
            tax={tax}
            discountAmount={discountAmount}
            total={total}
            payment={payment}
            setPayment={setPayment}
            completeSale={completeSale}
            lastSale={lastSale}
            orderNumber={metrics.orders + 1}
          />
        </main>
      )}
      {showForm && (
        <div className="modal-backdrop">
          <form className="product-form" onSubmit={addProduct}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">INVENTORY</p>
                <h2>Add a product</h2>
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
              Product name
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
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
                  {categories.slice(1).map((item) => (
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
            <button className="pay-button" type="submit">
              Save product <span>→</span>
            </button>
          </form>
        </div>
      )}
      {showBranchForm && (
        <div className="modal-backdrop">
          <form className="product-form branch-form" onSubmit={addBranch}>
            <div className="form-heading">
              <div>
                <p className="eyebrow">ORGANIZATION</p>
                <h2>Create a branch</h2>
                <p className="form-note">
                  Set up a new operating location for your team.
                </p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowBranchForm(false)}
              >
                ×
              </button>
            </div>
            <label>
              Branch name
              <input
                required
                value={branchForm.name}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, name: event.target.value })
                }
                placeholder="e.g. Riverside Store"
              />
            </label>
            <div className="form-row">
              <label>
                Branch code
                <input
                  required
                  value={branchForm.code}
                  onChange={(event) =>
                    setBranchForm({ ...branchForm, code: event.target.value })
                  }
                  placeholder="RVR-01"
                />
              </label>
              <label>
                Manager
                <input
                  value={branchForm.manager}
                  onChange={(event) =>
                    setBranchForm({
                      ...branchForm,
                      manager: event.target.value,
                    })
                  }
                  placeholder="Team lead"
                />
              </label>
            </div>
            <label>
              Address
              <input
                value={branchForm.address}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, address: event.target.value })
                }
                placeholder="Street, city, country"
              />
            </label>
            <label>
              Phone
              <input
                value={branchForm.phone}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, phone: event.target.value })
                }
                placeholder="Contact number"
              />
            </label>
            <button className="pay-button" type="submit">
              Create branch <span>→</span>
            </button>
          </form>
        </div>
      )}
      {showHelp && (
        <HelpModal shortcut={shortcut} onClose={() => setShowHelp(false)} />
      )}
      <footer>
        <span>Quibble Byte · Tillora POS and ERP</span>
        <span>
          <i className="status-dot" /> All systems operational
        </span>
        <span>
          <button className="help-trigger" onClick={() => setShowHelp(true)}>
            Need help? <b>{shortcut}</b>
          </button>
        </span>
      </footer>
    </div>
  );
}

function HelpModal({
  shortcut,
  onClose,
}: {
  shortcut: string;
  onClose: () => void;
}) {
  return (
    <div className="help-backdrop" role="presentation" onClick={onClose}>
      <section
        className="help-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="help-modal-header">
          <div>
            <p className="eyebrow">TILLORA GUIDE</p>
            <h2 id="help-title">How to use your workspace</h2>
            <p>
              Everything you need to run the register and keep operations
              current.
            </p>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close help"
          >
            ×
          </button>
        </div>
        <div className="help-grid">
          <article>
            <span className="help-number">01</span>
            <div>
              <h3>Take a sale</h3>
              <p>
                Open Sell, search for a product or scan its barcode, adjust
                quantities, choose payment, then charge the order.
              </p>
            </div>
          </article>
          <article>
            <span className="help-number">02</span>
            <div>
              <h3>Manage inventory</h3>
              <p>
                Use Inventory to add products, edit price and stock inline,
                search by SKU or barcode, and delete products with confirmation.
              </p>
            </div>
          </article>
          <article>
            <span className="help-number">03</span>
            <div>
              <h3>Set up branches</h3>
              <p>
                Open Branches and create your main location first. Add a code,
                manager, contact details, and address.
              </p>
            </div>
          </article>
          <article>
            <span className="help-number">04</span>
            <div>
              <h3>Read reports</h3>
              <p>
                Reports groups completed bills by month from first use. Export
                the billing ledger as a spreadsheet CSV.
              </p>
            </div>
          </article>
        </div>
        <div className="help-modal-footer">
          <span>Keyboard shortcut</span>
          <kbd>{shortcut}</kbd>
          <button className="primary-button" onClick={onClose}>
            Back to workspace
          </button>
        </div>
      </section>
    </div>
  );
}

function BranchEntryPage({
  branchForm,
  setBranchForm,
  onSubmit,
}: {
  branchForm: {
    name: string;
    code: string;
    address: string;
    manager: string;
    phone: string;
  };
  setBranchForm: (value: {
    name: string;
    code: string;
    address: string;
    manager: string;
    phone: string;
  }) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <main className="entry-page">
      <div className="entry-brand">
        <span className="brand-mark">◌</span>
        <strong>Tillora</strong>
        <small>POS AND ERP</small>
      </div>
      <div className="entry-layout">
        <section className="entry-intro">
          <p className="eyebrow">WELCOME TO TILLORA</p>
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
        <form className="entry-form" onSubmit={onSubmit}>
          <p className="eyebrow">FIRST-TIME SETUP</p>
          <h2>Create your main location</h2>
          <p className="form-note">
            This becomes your first workspace branch. Nothing is pre-filled.
          </p>
          <label>
            Branch name
            <input
              required
              value={branchForm.name}
              onChange={(event) =>
                setBranchForm({ ...branchForm, name: event.target.value })
              }
              placeholder="e.g. Downtown Store"
            />
          </label>
          <div className="form-row">
            <label>
              Branch code
              <input
                required
                value={branchForm.code}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, code: event.target.value })
                }
                placeholder="DWN-01"
              />
            </label>
            <label>
              Manager
              <input
                value={branchForm.manager}
                onChange={(event) =>
                  setBranchForm({ ...branchForm, manager: event.target.value })
                }
                placeholder="Optional"
              />
            </label>
          </div>
          <label>
            Address
            <input
              value={branchForm.address}
              onChange={(event) =>
                setBranchForm({ ...branchForm, address: event.target.value })
              }
              placeholder="Street, city, country"
            />
          </label>
          <label>
            Phone
            <input
              value={branchForm.phone}
              onChange={(event) =>
                setBranchForm({ ...branchForm, phone: event.target.value })
              }
              placeholder="Optional"
            />
          </label>
          <button className="primary-button entry-submit" type="submit">
            Enter Tillora <span>→</span>
          </button>
        </form>
      </div>
      <footer>
        <span>Quibble Byte · Tillora POS and ERP</span>
        <span>Private operator workspace</span>
      </footer>
    </main>
  );
}

function OrderPanel({
  cartItems,
  cart,
  changeQuantity,
  customer,
  setCustomer,
  discount,
  setDiscount,
  subtotal,
  tax,
  discountAmount,
  total,
  payment,
  setPayment,
  completeSale,
  lastSale,
  orderNumber,
}: {
  cartItems: Product[];
  cart: Record<string, number>;
  changeQuantity: (id: string, amount: number) => void;
  customer: string;
  setCustomer: (value: string) => void;
  discount: string;
  setDiscount: (value: string) => void;
  subtotal: number;
  tax: number;
  discountAmount: number;
  total: number;
  payment: string;
  setPayment: (value: string) => void;
  completeSale: () => void;
  lastSale: string | null;
  orderNumber: number;
}) {
  return (
    <aside className="order-panel">
      <div className="order-header">
        <div>
          <p className="eyebrow">CURRENT ORDER</p>
          <h2>Order #{String(orderNumber).padStart(4, "0")}</h2>
        </div>
        <button className="more-button">•••</button>
      </div>
      {lastSale && <div className="success-message">✓ {lastSale}</div>}
      <div className="cart-list">
        {cartItems.length ? (
          cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <div className={`mini-art ${item.color || "mint"}`}>
                {item.icon || "✦"}
              </div>
              <div className="cart-item-name">
                <strong>{item.name}</strong>
                <span>{money(item.price)} each</span>
              </div>
              <div className="quantity">
                <button onClick={() => changeQuantity(item._id, -1)}>-</button>
                <span>{cart[item._id]}</span>
                <button onClick={() => changeQuantity(item._id, 1)}>+</button>
              </div>
              <b>{money(item.price * cart[item._id])}</b>
            </div>
          ))
        ) : (
          <div className="empty-cart">
            Your order is ready for something good.
            <br />
            Add an item to begin.
          </div>
        )}
      </div>
      <div className="order-fields">
        <label>
          Customer (optional)
          <input
            value={customer}
            onChange={(event) => setCustomer(event.target.value)}
            placeholder="Walk-in customer"
          />
        </label>
        <label>
          Discount
          <input
            type="number"
            min="0"
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
            placeholder="$ 0.00"
          />
        </label>
      </div>
      <div className="totals">
        <div>
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </div>
        <div>
          <span>
            Tax <small>8%</small>
          </span>
          <b>{money(tax)}</b>
        </div>
        {discountAmount > 0 && (
          <div className="discount-line">
            <span>Discount</span>
            <b>-{money(discountAmount)}</b>
          </div>
        )}
        <div className="total-line">
          <span>Total</span>
          <strong>{money(total)}</strong>
        </div>
      </div>
      <div className="payment-options">
        <p>Payment method</p>
        <div>
          {["Card", "Cash", "Other"].map((method) => (
            <button
              key={method}
              className={payment === method ? "selected" : ""}
              onClick={() => setPayment(method)}
            >
              {method === "Card" ? "▣" : method === "Cash" ? "◫" : "•••"}{" "}
              {method}
            </button>
          ))}
        </div>
      </div>
      <button
        className="pay-button"
        disabled={!cartItems.length}
        onClick={completeSale}
      >
        Charge {money(total)} <span>→</span>
      </button>
    </aside>
  );
}

function Dashboard({
  metrics,
  products,
  onAdd,
}: {
  metrics: Metrics;
  products: Product[];
  onAdd: () => void;
}) {
  const low = products.filter((item) => item.stock <= 5);
  return (
    <main className="dashboard">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Store performance</h1>
          <p className="subheading">
            Everything your team needs to keep today moving.
          </p>
        </div>
        <button className="outline-button" onClick={onAdd}>
          ＋ Add product
        </button>
      </div>
      <div className="metric-grid">
        <Metric
          label="Today's revenue"
          value={money(metrics.revenue)}
          trend="from completed sales"
          icon="↗"
        />
        <Metric
          label="Orders today"
          value={String(metrics.orders)}
          trend="transactions recorded"
          icon="◫"
        />
        <Metric
          label="Inventory value"
          value={money(metrics.inventoryValue)}
          trend={`${metrics.units} units on hand`}
          icon="◌"
        />
        <Metric
          label="Needs attention"
          value={String(metrics.lowStock)}
          trend="items at low stock"
          icon="!"
          warning
        />
      </div>
      <section className="chart-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">SALES ANALYTICS</p>
            <h2>Revenue pulse</h2>
          </div>
          <span className="chart-period">Last 7 days · live from MongoDB</span>
        </div>
        <div className="chart">
          <div className="chart-axis">
            <span>$</span>
            <span>$</span>
            <span>$</span>
            <span>$</span>
          </div>
          <div className="bars">
            {(metrics.daily?.length
              ? metrics.daily
              : [
                  {
                    _id: "Today",
                    revenue: metrics.revenue,
                    orders: metrics.orders,
                  },
                ]
            ).map((day) => (
              <div className="bar-group" key={day._id}>
                <div
                  className="bar"
                  style={{
                    height: `${Math.max(8, Math.min(100, day.revenue ? (day.revenue / Math.max(metrics.revenue, day.revenue)) * 100 : 8))}%`,
                  }}
                  title={`${day._id}: ${money(day.revenue)}`}
                />
                <span>{day._id}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="dashboard-columns">
        <section className="data-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">INVENTORY CONTROL</p>
              <h2>Product catalog</h2>
            </div>
            <button className="text-button" onClick={onAdd}>
              Manage products →
            </button>
          </div>
          <div className="table">
            <div className="table-head">
              <span>Product</span>
              <span>Category</span>
              <span>Price</span>
              <span>Stock</span>
            </div>
            {products.map((item) => (
              <div className="table-row" key={item._id}>
                <strong>
                  {item.icon || "✦"} {item.name}
                </strong>
                <span>{item.category}</span>
                <span>{money(item.price)}</span>
                <span className={item.stock <= 5 ? "low-stock" : "stock-ok"}>
                  {item.stock} units
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="attention-section">
          <p className="eyebrow">QUICK ACTIONS</p>
          <h2>Stay in control</h2>
          <div className="action-card warning-card">
            <span className="action-icon">!</span>
            <div>
              <strong>{low.length} items need restocking</strong>
              <p>Review low inventory before the next rush.</p>
            </div>
            <button onClick={onAdd}>Review →</button>
          </div>
          <div className="action-card">
            <span className="action-icon">＋</span>
            <div>
              <strong>Grow your catalog</strong>
              <p>Add products and keep pricing current.</p>
            </div>
            <button onClick={onAdd}>Add →</button>
          </div>
        </section>
      </div>
    </main>
  );
}
function Reports({ reports }: { reports: MonthlyReport[] }) {
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
  const exportCsv = () => {
    const header = "Month,Bills,Items sold,Revenue,Tax,Discounts\n";
    const body = reports
      .map((row) =>
        [
          row.month,
          row.bills,
          row.items,
          row.revenue.toFixed(2),
          row.tax.toFixed(2),
          row.discounts.toFixed(2),
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "tillora-monthly-report.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <main className="module-page reports-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">REPORTING WORKBOOK</p>
          <h1>Monthly reports</h1>
          <p className="subheading">
            A living spreadsheet of every bill and month since Tillora was first
            used.
          </p>
        </div>
        <button className="primary-button" onClick={exportCsv}>
          Export spreadsheet
        </button>
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
          <strong>{money(totals.revenue)}</strong>
        </div>
        <div>
          <span>Total tax</span>
          <strong>{money(totals.tax)}</strong>
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
                <b>{money(row.revenue)}</b>
                <span>{money(row.tax)}</span>
                <span>{money(row.discounts)}</span>
              </div>
            ))
          ) : (
            <div className="spreadsheet-empty">
              Your first month will appear here after the first bill is
              completed.
            </div>
          )}
          <div className="spreadsheet-row spreadsheet-total">
            <strong>All time</strong>
            <b>{totals.bills}</b>
            <b>{totals.items}</b>
            <b>{money(totals.revenue)}</b>
            <b>{money(totals.tax)}</b>
            <b>{money(totals.discounts)}</b>
          </div>
        </div>
      </section>
      <div className="report-notes">
        <div>
          <strong>What is included</strong>
          <p>
            Every completed POS bill, item quantity, revenue, tax, and discount
            is grouped into its calendar month.
          </p>
        </div>
        <div>
          <strong>Starting point</strong>
          <p>
            The workbook begins in the month Tillora was first connected to your
            database and continues automatically.
          </p>
        </div>
      </div>
    </main>
  );
}

function Inventory({
  products,
  onAdd,
  onUpdate,
  onDelete,
}: {
  products: Product[];
  onAdd: () => void;
  onUpdate: (id: string, field: "stock" | "price", value: string) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const visible = products.filter((product) =>
    `${product.name} ${product.sku || ""} ${product.barcode || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.stock,
    0,
  );
  const lowStock = products.filter((product) => product.stock <= 5).length;
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
        <button className="outline-button" onClick={onAdd}>
          ＋ Add product
        </button>
      </div>
      <div className="inventory-summary">
        <div>
          <span>Total products</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Units on hand</span>
          <strong>
            {products.reduce((sum, product) => sum + product.stock, 0)}
          </strong>
        </div>
        <div>
          <span>Inventory value</span>
          <strong>{money(inventoryValue)}</strong>
        </div>
        <div className="summary-warning">
          <span>Low stock</span>
          <strong>{lowStock}</strong>
        </div>
      </div>
      <div className="inventory-toolbar">
        <label className="search-box">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search inventory, SKU, or barcode..."
          />
        </label>
        <button className="filter-button">⇅ Sort: Recent</button>
        <button className="filter-button">⇩ Export</button>
      </div>
      <div className="inventory-table">
        <div className="inventory-table-head">
          <span>Product</span>
          <span>SKU / Barcode</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock level</span>
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
                  onUpdate(product._id, "price", event.target.value)
                }
              />
            </label>
            <label>
              <span className="sr-only">Stock</span>
              <input
                className={
                  product.stock <= 5 ? "stock-input low" : "stock-input"
                }
                type="number"
                min="0"
                value={product.stock}
                onChange={(event) =>
                  onUpdate(product._id, "stock", event.target.value)
                }
              />
            </label>
            <b>{money(product.price * product.stock)}</b>
            <button
              className="delete-product"
              onClick={() => onDelete(product._id)}
              title={`Delete ${product.name}`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

function Branches({
  branches,
  activeBranchId,
  onEnter,
  onAdd,
}: {
  branches: Branch[];
  activeBranchId?: string;
  onEnter: (branch: Branch) => void;
  onAdd: () => void;
}) {
  return (
    <main className="module-page branch-page">
      <div className="module-heading">
        <div>
          <p className="eyebrow">ORGANIZATION</p>
          <h1>Branches</h1>
          <p className="subheading">
            Manage locations, teams, and operating status from one workspace.
          </p>
        </div>
        <button className="primary-button" onClick={onAdd}>
          ＋ Create branch
        </button>
      </div>
      <div className="branch-hero">
        <div>
          <span className="hero-kicker">NETWORK OVERVIEW</span>
          <strong>
            {branches.length || 0} <small>locations</small>
          </strong>
          <p>Your branch network at a glance.</p>
        </div>
        <div className="network-icon">⌘</div>
      </div>
      <div className="section-heading">
        <div>
          <p className="eyebrow">LOCATIONS</p>
          <h2>All branches</h2>
        </div>
        <span className="chart-period">{branches.length} active records</span>
      </div>
      <div className="branch-grid">
        {branches.length ? (
          branches.map((branch) => (
            <article className="branch-card" key={branch._id}>
              <div className="branch-card-top">
                <span className="branch-symbol">⌂</span>
                <span className="active-pill">
                  <i className="status-dot" /> {branch.status}
                </span>
              </div>
              <h3>{branch.name}</h3>
              <code>{branch.code}</code>
              <p>{branch.address || "Address not set"}</p>
              <div className="branch-meta">
                <span>
                  Manager<strong>{branch.manager || "Unassigned"}</strong>
                </span>
                <span>
                  Contact<strong>{branch.phone || "No phone"}</strong>
                </span>
              </div>
              <button className="branch-enter" onClick={() => onEnter(branch)}>
                {branch._id === activeBranchId
                  ? "Current workspace"
                  : "Enter branch →"}
              </button>
            </article>
          ))
        ) : (
          <div className="no-branches">
            <span>⌂</span>
            <h2>Start with your first branch</h2>
            <p>
              Create your main operating location to begin organizing stores and
              teams.
            </p>
            <button className="primary-button" onClick={onAdd}>
              Create main branch →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  trend,
  icon,
  warning = false,
}: {
  label: string;
  value: string;
  trend: string;
  icon: string;
  warning?: boolean;
}) {
  return (
    <div className={`metric-card ${warning ? "metric-warning" : ""}`}>
      <div className="metric-icon">{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{trend}</span>
    </div>
  );
}
export default App;
