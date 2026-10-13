import { useMemo, useRef, useState } from "react";
import { useStore } from "../context/StoreContext";
import { Button } from "../components/Button";
import { SearchBox } from "../components/SearchBox";
import { ProductCard } from "../components/ProductCard";
import { OrderPanel } from "../components/OrderPanel";
import { categories, paymentMethods } from "../lib/constants";
import { money, padOrder } from "../lib/format";
import { printReceipt } from "../lib/receipt";
import type { HeldOrder, SalePayload } from "../types";

type DiscountMode = "amount" | "percent";

export function SellPage() {
  const { products, metrics, settings, recordSale, pushToast } = useStore();
  const currency = settings.currency;
  const taxRate = settings.taxRate;

  const [category, setCategory] = useState("All items");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payment, setPayment] = useState<string>(paymentMethods[0]);
  const [customer, setCustomer] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountMode, setDiscountMode] = useState<DiscountMode>("amount");
  const [lastSale, setLastSale] = useState<string | null>(null);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const heldId = useRef(0);
  const lastReceipt = useRef<{
    number: number;
    items: { name: string; quantity: number; price: number }[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    payment: string;
  } | null>(null);

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
  const discountAmount =
    discountMode === "amount"
      ? Math.min(Number(discount) || 0, subtotal)
      : Math.min((Number(discount) || 0) / 100, 1) * subtotal;
  const tax = (subtotal - discountAmount) * taxRate;
  const total = subtotal - discountAmount + tax;
  const orderNumber = metrics.orders + 1;

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
    const payload: SalePayload = {
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
    lastReceipt.current = {
      number: orderNumber,
      items: payload.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal,
      tax,
      discount: discountAmount,
      total,
      payment,
    };
    await recordSale(payload);
    setLastSale(`Order #${padOrder(orderNumber)} completed via ${payment}`);
    pushToast("success", `Order #${padOrder(orderNumber)} charged ${money(total, currency)}`);
    setCart({});
    setCustomer("");
    setDiscount("");
  };

  const handlePrintReceipt = () => {
    if (!lastReceipt.current) return;
    printReceipt({
      ...lastReceipt.current,
      branch: undefined,
      storeName: settings.storeName,
      currency,
    });
  };

  const holdOrder = () => {
    if (!cartItems.length) return;
    const id = (heldId.current += 1);
    const label = `${cartItems.length} items · ${money(total, currency)}`;
    setHeldOrders((current) => [
      ...current,
      { id, label, cart: { ...cart }, customer, discount, payment },
    ]);
    setCart({});
    setCustomer("");
    setDiscount("");
    pushToast("info", `Order held (${heldOrders.length + 1} held)`);
  };

  const recallOrder = (held: HeldOrder) => {
    setCart(held.cart);
    setCustomer(held.customer);
    setDiscount(held.discount);
    setPayment(held.payment);
    setHeldOrders((current) => current.filter((item) => item.id !== held.id));
    pushToast("info", "Order recalled");
  };

  return (
    <main className="workspace">
      <section className="catalog-panel">
        <div className="page-heading">
          <div>
            <p className="eyebrow">POINT OF SALE</p>
            <h1>Good morning, Alex</h1>
          </div>
          <div className="heading-actions">
            {cartItems.length > 0 && (
              <Button variant="outline" onClick={holdOrder}>
                ⏸ Hold
              </Button>
            )}
            <Button variant="outline" onClick={() => setCart({})}>
              ＋ New order
            </Button>
          </div>
        </div>
        {heldOrders.length > 0 && (
          <div className="held-orders">
            <span className="held-label">Held ({heldOrders.length})</span>
            {heldOrders.map((held) => (
              <button
                key={held.id}
                className="held-chip"
                onClick={() => recallOrder(held)}
                title="Recall this order"
              >
                ⏵ {held.label}
              </button>
            ))}
          </div>
        )}
        <div className="search-row">
          <SearchBox
            value={query}
            onChange={handleSearch}
            placeholder="Search products..."
            hint="⌘K"
          />
          <Button variant="outline" className="filter-button">
            ☷ Filter
          </Button>
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
            <ProductCard
              key={product._id}
              product={product}
              onAdd={addToCart}
              currency={currency}
            />
          ))}
          {!visibleProducts.length && (
            <div className="empty-catalog">
              No products match your search. Add products from Inventory.
            </div>
          )}
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
        discountMode={discountMode}
        setDiscountMode={setDiscountMode}
        subtotal={subtotal}
        tax={tax}
        discountAmount={discountAmount}
        total={total}
        payment={payment}
        setPayment={setPayment}
        completeSale={completeSale}
        onPrintReceipt={handlePrintReceipt}
        lastSale={lastSale}
        orderNumber={orderNumber}
        currency={currency}
        taxRate={taxRate}
      />
    </main>
  );
}
