import type { Product } from "../types";
import { money } from "../lib/format";
import { paymentMethods, paymentIcons } from "../lib/constants";

type DiscountMode = "amount" | "percent";

type Props = {
  cartItems: Product[];
  cart: Record<string, number>;
  changeQuantity: (id: string, amount: number) => void;
  customer: string;
  setCustomer: (value: string) => void;
  discount: string;
  setDiscount: (value: string) => void;
  discountMode: DiscountMode;
  setDiscountMode: (mode: DiscountMode) => void;
  subtotal: number;
  tax: number;
  discountAmount: number;
  total: number;
  payment: string;
  setPayment: (value: string) => void;
  completeSale: () => void;
  onPrintReceipt: () => void;
  lastSale: string | null;
  orderNumber: number;
  currency: string;
  taxRate: number;
};

export function OrderPanel({
  cartItems,
  cart,
  changeQuantity,
  customer,
  setCustomer,
  discount,
  setDiscount,
  discountMode,
  setDiscountMode,
  subtotal,
  tax,
  discountAmount,
  total,
  payment,
  setPayment,
  completeSale,
  onPrintReceipt,
  lastSale,
  orderNumber,
  currency,
  taxRate,
}: Props) {
  return (
    <aside className="order-panel">
      <div className="order-header">
        <div>
          <p className="eyebrow">CURRENT ORDER</p>
          <h2>Order #{String(orderNumber).padStart(4, "0")}</h2>
        </div>
        <button className="more-button" title="Order options">•••</button>
      </div>
      {lastSale && (
        <div className="success-message">
          <span>✓ {lastSale}</span>
          <button className="text-link" onClick={onPrintReceipt}>
            Print receipt
          </button>
        </div>
      )}
      <div className="cart-list">
        {cartItems.length ? (
          cartItems.map((item) => (
            <div className="cart-item" key={item._id}>
              <div className={`mini-art ${item.color || "mint"}`}>
                {item.icon || "✦"}
              </div>
              <div className="cart-item-name">
                <strong>{item.name}</strong>
                <span>{money(item.price, currency)} each</span>
              </div>
              <div className="quantity">
                <button
                  onClick={() => changeQuantity(item._id, -1)}
                  aria-label={`Decrease ${item.name}`}
                >
                  −
                </button>
                <span>{cart[item._id]}</span>
                <button
                  onClick={() => changeQuantity(item._id, 1)}
                  aria-label={`Increase ${item.name}`}
                >
                  +
                </button>
              </div>
              <b>{money(item.price * cart[item._id], currency)}</b>
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
          <div className="discount-input">
            <input
              type="number"
              min="0"
              value={discount}
              onChange={(event) => setDiscount(event.target.value)}
              placeholder={discountMode === "amount" ? "0.00" : "0"}
            />
            <button
              type="button"
              className="discount-toggle"
              onClick={() =>
                setDiscountMode(discountMode === "amount" ? "percent" : "amount")
              }
              title="Toggle discount mode"
            >
              {discountMode === "amount" ? currency : "%"}
            </button>
          </div>
        </label>
      </div>
      <div className="totals">
        <div>
          <span>Subtotal</span>
          <b>{money(subtotal, currency)}</b>
        </div>
        <div>
          <span>
            Tax <small>{Math.round(taxRate * 100)}%</small>
          </span>
          <b>{money(tax, currency)}</b>
        </div>
        {discountAmount > 0 && (
          <div className="discount-line">
            <span>Discount</span>
            <b>−{money(discountAmount, currency)}</b>
          </div>
        )}
        <div className="total-line">
          <span>Total</span>
          <strong>{money(total, currency)}</strong>
        </div>
      </div>
      <div className="payment-options">
        <p>Payment method</p>
        <div>
          {paymentMethods.map((method) => (
            <button
              key={method}
              className={payment === method ? "selected" : ""}
              onClick={() => setPayment(method)}
            >
              {paymentIcons[method]} {method}
            </button>
          ))}
        </div>
      </div>
      <button
        className="pay-button"
        disabled={!cartItems.length}
        onClick={completeSale}
      >
        Charge {money(total, currency)} <span>→</span>
      </button>
    </aside>
  );
}
